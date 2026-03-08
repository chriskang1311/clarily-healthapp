from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import anthropic
import os
import json
import re
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY"),
)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def get_current_user():
    """Extract and verify the Bearer token. Returns the Supabase user or aborts 401."""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        abort(401, description='Missing or malformed Authorization header')
    token = auth_header.split('Bearer ', 1)[1].strip()
    try:
        result = supabase.auth.get_user(token)
        if result.user is None:
            abort(401, description='Invalid or expired token')
        return result.user
    except Exception:
        abort(401, description='Token verification failed')

@app.errorhandler(401)
def unauthorized(e):
    return jsonify({'error': str(e.description)}), 401

# Healthcare professional system prompt - Diagnostic Doctor
HEALTHCARE_SYSTEM_PROMPT = """You are an experienced, thorough, and compassionate diagnostic physician conducting a comprehensive patient interview. Your primary goal is to gather ALL necessary information to understand the patient's condition fully before providing any assessment.

CRITICAL INSTRUCTIONS:
1. ASK SYSTEMATIC, DETAILED QUESTIONS - You must ask one focused question at a time, building on the patient's responses
2. DO NOT STOP QUESTIONING until you have gathered sufficient information about:
   - Onset and duration of symptoms
   - Location, quality, and severity of symptoms
   - Triggers, alleviating factors, and associated symptoms
   - Patient's medical history, medications, and allergies
   - Recent changes in lifestyle, diet, or activities
   - Family history if relevant
   - Any previous similar episodes

3. BE PERSISTENT BUT KIND - If a patient gives vague answers, follow up with specific questions. For example:
   - If they say "stomach pain", ask: "Can you describe exactly where the pain is located? Is it upper abdomen, lower, or all over?"
   - If they say "a few days", ask: "How many days exactly? When did it start - morning, afternoon, evening?"
   - If they say "it hurts", ask: "On a scale of 1-10, how would you rate the pain? Is it sharp, dull, cramping, or burning?"

4. USE THE SOCRATIC METHOD - Ask follow-up questions based on each answer before moving to the next topic

5. GATHER COMPLETE INFORMATION - Only after you have sufficient details about all relevant aspects should you provide any assessment or guidance

6. ONE QUESTION AT A TIME - Ask focused, specific questions rather than multiple questions at once

7. BE PROFESSIONAL AND EMPATHETIC - Show concern and understanding while being thorough

8. WHEN YOU HAVE ENOUGH INFORMATION:
   - After gathering comprehensive information (typically 8-15 exchanges with detailed answers), assess if you have enough to suggest potential conditions
   - When you have sufficient information, provide potential conditions in a structured format
   - IMPORTANT: When providing possibilities, format your response with the marker "##POSSIBILITIES_START##" followed by a JSON array, then "##POSSIBILITIES_END##"
   - After the possibilities, include a friendly message asking the patient if these sound right

9. IF PATIENT DISAGREES WITH DIAGNOSES:
   - If a patient disagrees with your suggested diagnoses, acknowledge their concern and continue asking more questions
   - Gather additional information to better understand their symptoms
   - IMPORTANT: You MUST provide possibilities again when you have enough NEW information (after 5-10 additional exchanges)
   - Do NOT stop providing possibilities just because the patient disagreed once - they need to see and confirm diagnoses to proceed
   - The conversation cycle should be: Ask questions → Provide possibilities → If disagreed, ask more questions → Provide possibilities again (repeat until confirmed)
   - You are required to provide possibilities whenever you have sufficient information, regardless of how many times the patient has disagreed

FORMAT FOR POSSIBILITIES:
When you have enough information, format your response like this:
##POSSIBILITIES_START##
[
  {"condition": "Diagnosis Name in Plain Language", "confidence": "High/Moderate/Low", "description": "Brief patient-friendly explanation"},
  {"condition": "Another Diagnosis Name", "confidence": "High/Moderate/Low", "description": "Brief patient-friendly explanation"},
  {"condition": "Third Diagnosis Name", "confidence": "High/Moderate/Low", "description": "Brief patient-friendly explanation"}
]
##POSSIBILITIES_END##

CRITICAL:
- Provide ONLY the top 3-4 most likely diagnoses based on all the information gathered. Rank them by likelihood. Each should have a confidence level (High/Moderate/Low). Use patient-friendly language and avoid medical jargon.
- These are AI diagnostic suggestions based on the information provided - always emphasize that professional medical evaluation is needed.
- You MUST provide possibilities when you have enough information, even if the patient previously disagreed. The patient needs to sign off on possibilities to proceed with their health journey.

10. ANSWER CHOICES — After every question you ask the patient, append a choices block on a new line in this exact format:
##CHOICES_START##["Choice A", "Choice B", "Choice C", "Other / I'll type my own"]##CHOICES_END##
Rules:
- The last option must ALWAYS be "Other / I'll type my own"
- Provide 3–5 concise choices relevant to the question
- Only include the choices block when asking a question; do NOT include it with diagnostic summaries (##POSSIBILITIES_START## blocks) or closing messages"""

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")
    conversation_history = data.get("conversation", [])

    # Build messages array (system prompt passed separately to Anthropic API)
    messages = []

    # Add conversation history
    for msg in conversation_history:
        messages.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", "")
        })

    # Add current user message
    messages.append({"role": "user", "content": user_message})

    # Count user messages to check if enough information has been gathered
    user_message_count = sum(1 for msg in conversation_history if msg.get("role") == "user") + 1
    has_previous_possibilities = any("##POSSIBILITIES_START##" in str(msg.get("content", "")) for msg in conversation_history)

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=HEALTHCARE_SYSTEM_PROMPT,
            messages=messages,
        )

        bot_message = response.content[0].text

        # Check if response contains possibilities
        possibilities = None
        clean_message = bot_message

        if "##POSSIBILITIES_START##" in bot_message and "##POSSIBILITIES_END##" in bot_message:
            try:
                start_idx = bot_message.find("##POSSIBILITIES_START##") + len("##POSSIBILITIES_START##")
                end_idx = bot_message.find("##POSSIBILITIES_END##")
                possibilities_json = bot_message[start_idx:end_idx].strip()

                # Clean up common JSON issues that AI might generate
                # Remove trailing commas before closing brackets/braces
                possibilities_json = re.sub(r',\s*([}\]])', r'\1', possibilities_json)

                # Try to parse the JSON
                possibilities = json.loads(possibilities_json)

                # Validate that it's a list
                if not isinstance(possibilities, list):
                    raise ValueError("Possibilities must be a list/array")

                # Validate and clean up each possibility
                cleaned_possibilities = []
                for p in possibilities:
                    if isinstance(p, dict):
                        cleaned_p = {
                            "condition": str(p.get("condition", "")),
                            "confidence": str(p.get("confidence", "Moderate")),
                            "description": str(p.get("description", ""))
                        }
                        # Validate confidence values
                        if cleaned_p["confidence"] not in ["High", "Moderate", "Low"]:
                            cleaned_p["confidence"] = "Moderate"
                        if cleaned_p["condition"]:  # Only add if condition exists
                            cleaned_possibilities.append(cleaned_p)

                possibilities = cleaned_possibilities

                # Limit to top 3-4 diagnoses
                if len(possibilities) > 4:
                    possibilities = possibilities[:4]

                # Remove the possibilities markers from the message
                clean_message = bot_message[:bot_message.find("##POSSIBILITIES_START##")].strip()
                after_possibilities = bot_message[bot_message.find("##POSSIBILITIES_END##") + len("##POSSIBILITIES_END##"):].strip()
                if after_possibilities:
                    clean_message += "\n\n" + after_possibilities

            except Exception as e:
                print(f"Error parsing possibilities: {e}")
                print(f"Raw JSON string: {possibilities_json if 'possibilities_json' in locals() else 'N/A'}")
                # Try a more aggressive cleanup
                try:
                    if 'possibilities_json' in locals():
                        # Try removing all text before first [ and after last ]
                        array_match = re.search(r'\[.*?\]', possibilities_json, re.DOTALL)
                        if array_match:
                            cleaned_json = array_match.group(0)
                            cleaned_json = re.sub(r',\s*([}\]])', r'\1', cleaned_json)
                            possibilities = json.loads(cleaned_json)
                            if isinstance(possibilities, list) and len(possibilities) > 0:
                                # Clean up each possibility
                                cleaned_possibilities = []
                                for p in possibilities:
                                    if isinstance(p, dict):
                                        cleaned_p = {
                                            "condition": str(p.get("condition", "")),
                                            "confidence": str(p.get("confidence", "Moderate")),
                                            "description": str(p.get("description", ""))
                                        }
                                        if cleaned_p["confidence"] not in ["High", "Moderate", "Low"]:
                                            cleaned_p["confidence"] = "Moderate"
                                        if cleaned_p["condition"]:
                                            cleaned_possibilities.append(cleaned_p)
                                possibilities = cleaned_possibilities[:4]
                                # Remove markers from message
                                clean_message = bot_message[:bot_message.find("##POSSIBILITIES_START##")].strip()
                                after_possibilities = bot_message[bot_message.find("##POSSIBILITIES_END##") + len("##POSSIBILITIES_END##"):].strip()
                                if after_possibilities:
                                    clean_message += "\n\n" + after_possibilities
                except Exception as e2:
                    print(f"Error in fallback parsing: {e2}")
                    # If parsing completely fails, return None but still clean the message
                    possibilities = None
                    clean_message = bot_message[:bot_message.find("##POSSIBILITIES_START##")].strip()
                    after_possibilities = bot_message[bot_message.find("##POSSIBILITIES_END##") + len("##POSSIBILITIES_END##"):].strip()
                    if after_possibilities:
                        clean_message += "\n\n" + after_possibilities

        # FALLBACK: If enough exchanges have occurred (10+ user messages) and no possibilities were provided,
        # and the user hasn't explicitly disagreed, automatically request possibilities
        if possibilities is None and user_message_count >= 10 and not has_previous_possibilities:
            # Make a follow-up request specifically asking for possibilities
            follow_up_messages = messages + [
                {"role": "assistant", "content": bot_message},
                {"role": "user", "content": "Based on all the information I've provided, can you please provide your assessment of potential diagnoses using the possibilities format? I need to see the diagnostic possibilities to proceed."},
            ]

            try:
                follow_up_response = client.messages.create(
                    model="claude-sonnet-4-6",
                    max_tokens=2048,
                    system=HEALTHCARE_SYSTEM_PROMPT,
                    messages=follow_up_messages,
                )

                follow_up_message = follow_up_response.content[0].text

                # Check if follow-up response contains possibilities
                if "##POSSIBILITIES_START##" in follow_up_message and "##POSSIBILITIES_END##" in follow_up_message:
                    try:
                        start_idx = follow_up_message.find("##POSSIBILITIES_START##") + len("##POSSIBILITIES_START##")
                        end_idx = follow_up_message.find("##POSSIBILITIES_END##")
                        possibilities_json = follow_up_message[start_idx:end_idx].strip()

                        # Clean up common JSON issues
                        possibilities_json = re.sub(r',\s*([}\]])', r'\1', possibilities_json)

                        possibilities = json.loads(possibilities_json)

                        # Validate and clean
                        if isinstance(possibilities, list):
                            cleaned_possibilities = []
                            for p in possibilities:
                                if isinstance(p, dict):
                                    cleaned_p = {
                                        "condition": str(p.get("condition", "")),
                                        "confidence": str(p.get("confidence", "Moderate")),
                                        "description": str(p.get("description", ""))
                                    }
                                    if cleaned_p["confidence"] not in ["High", "Moderate", "Low"]:
                                        cleaned_p["confidence"] = "Moderate"
                                    if cleaned_p["condition"]:
                                        cleaned_possibilities.append(cleaned_p)
                            possibilities = cleaned_possibilities[:4]
                        else:
                            possibilities = None

                        # Append to clean message
                        clean_message += "\n\n" + follow_up_message[:follow_up_message.find("##POSSIBILITIES_START##")].strip()
                        after_possibilities = follow_up_message[follow_up_message.find("##POSSIBILITIES_END##") + len("##POSSIBILITIES_END##"):].strip()
                        if after_possibilities:
                            clean_message += "\n\n" + after_possibilities
                    except Exception as e:
                        print(f"Error parsing possibilities from follow-up: {e}")
                        # Try aggressive cleanup
                        try:
                            array_match = re.search(r'\[.*?\]', possibilities_json, re.DOTALL)
                            if array_match:
                                cleaned_json = array_match.group(0)
                                cleaned_json = re.sub(r',\s*([}\]])', r'\1', cleaned_json)
                                possibilities = json.loads(cleaned_json)
                                if isinstance(possibilities, list) and len(possibilities) > 0:
                                    cleaned_possibilities = []
                                    for p in possibilities:
                                        if isinstance(p, dict):
                                            cleaned_p = {
                                                "condition": str(p.get("condition", "")),
                                                "confidence": str(p.get("confidence", "Moderate")),
                                                "description": str(p.get("description", ""))
                                            }
                                            if cleaned_p["confidence"] not in ["High", "Moderate", "Low"]:
                                                cleaned_p["confidence"] = "Moderate"
                                            if cleaned_p["condition"]:
                                                cleaned_possibilities.append(cleaned_p)
                                    possibilities = cleaned_possibilities[:4]
                        except Exception as e2:
                            print(f"Error in fallback parsing from follow-up: {e2}")
            except Exception as e:
                print(f"Error in follow-up request for possibilities: {e}")

        # Parse and strip ##CHOICES_START## block from clean_message
        choices = []
        choices_match = re.search(r'##CHOICES_START##(.+?)##CHOICES_END##', clean_message, re.DOTALL)
        if choices_match:
            try:
                choices = json.loads(choices_match.group(1).strip())
                if not isinstance(choices, list):
                    choices = []
            except Exception:
                choices = []
            clean_message = re.sub(r'\n?##CHOICES_START##.+?##CHOICES_END##', '', clean_message, flags=re.DOTALL).strip()

        return jsonify({
            "response": clean_message,
            "possibilities": possibilities,
            "choices": choices,
            "error": None
        })
    except Exception as e:
        return jsonify({"response": None, "possibilities": None, "choices": [], "error": str(e)}), 500

# Summary generation system prompt - Patient-focused
SUMMARY_SYSTEM_PROMPT = """You are a helpful healthcare assistant creating a personal summary for a patient. Write the summary as if you're talking directly to the patient, using "you" and "your" language. Make it clear, warm, and easy to understand.

Create a summary that:
1. Starts by acknowledging their PRIMARY CONCERN or symptom in simple terms
2. Organizes what they've shared in a patient-friendly way:
   - What you've experienced: describe their symptoms in their own words
   - When it started: duration and timing information
   - How it feels: severity, location, quality of symptoms
   - Other symptoms: any additional symptoms they mentioned
   - What helps or makes it worse: triggers and alleviating factors
   - Your background: medications or medical history if mentioned
3. Uses simple, everyday language (avoid medical jargon)
4. Addresses the patient directly using "you" and "your"
5. Is supportive and validating of their experience
6. Is organized in clear, readable sections

Format as a friendly summary that the patient can easily understand and share with their healthcare provider if needed. Be comprehensive but conversational."""

# Concise symptom summary system prompt - For doctor visits
SYMPTOM_SUMMARY_PROMPT = """You are a medical assistant creating a brief, concise symptom summary for a patient to bring to their doctor. This should be VERY SHORT and structured for quick reading by a healthcare provider.

CRITICAL REQUIREMENTS:
1. Keep it EXTREMELY BRIEF - maximum 150-200 words
2. Use clear, structured format with bullet points
3. Focus ONLY on essential information:
   - Primary complaint/symptom
   - Duration (when it started)
   - Location and severity (if applicable)
   - Key associated symptoms
   - Relevant medications/history (only if mentioned)
4. Use medical terminology appropriately but keep it accessible
5. Format for easy scanning by a doctor during a visit
6. Remove any conversational elements - this is a clinical summary

FORMAT:
Start with a clear header, then use brief bullet points.
Example format:
---
SYMPTOM SUMMARY

Primary Complaint: [Brief description]

Duration: [Timeframe]

Key Symptoms:
• [Symptom 1]
• [Symptom 2]

Location/Severity: [If relevant]

Notes: [Any other relevant info]
---

Make it professional, concise, and suitable for a doctor to quickly understand the patient's condition."""

@app.route("/symptom-summary", methods=["POST"])
def generate_symptom_summary():
    data = request.get_json()
    conversation_history = data.get("conversation", [])
    possibilities = data.get("possibilities", [])

    # Convert conversation to a readable format
    conversation_text = "PATIENT INTERVIEW CONVERSATION:\n\n"
    for msg in conversation_history:
        role_label = "DOCTOR" if msg.get("role") == "assistant" else "PATIENT"
        conversation_text += f"{role_label}: {msg.get('content', '')}\n\n"

    # Add possibilities if provided
    possibilities_text = ""
    if possibilities:
        possibilities_text = "\n\nPOTENTIAL DIAGNOSES IDENTIFIED:\n"
        for p in possibilities[:4]:
            possibilities_text += f"- {p.get('condition', '')} ({p.get('confidence', '')} confidence)\n"

    messages = [{
        "role": "user",
        "content": f"Create a very brief, concise symptom summary for a doctor visit based on this patient interview:\n\n{conversation_text}{possibilities_text}\n\nRemember: Keep it extremely brief (150-200 words max), structured, and professional for a healthcare provider to quickly read."
    }]

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=SYMPTOM_SUMMARY_PROMPT,
            messages=messages,
        )

        summary = response.content[0].text
        return jsonify({"summary": summary, "error": None})
    except Exception as e:
        return jsonify({"summary": None, "error": str(e)}), 500

@app.route("/generate-title", methods=["POST"])
def generate_journey_title():
    data = request.get_json()
    conversation_history = data.get("conversation", [])
    diagnoses = data.get("diagnoses", [])

    conversation_text = ""
    for msg in conversation_history[:10]:
        role = "Patient" if msg.get("role") == "user" else "Doctor"
        conversation_text += f"{role}: {msg.get('content', '')}\n"

    diagnoses_text = ", ".join([d.get("condition", "") for d in diagnoses[:3]]) if diagnoses else ""

    prompt = f"""Patient conversation (first exchanges):
{conversation_text}
Potential diagnoses: {diagnoses_text}

In 6 words or fewer, write a clear clinical title for this patient's health journey.
Examples: "Recurring migraines with light sensitivity", "Chest pain after exertion", "Persistent fatigue and joint pain"
Return ONLY the title, nothing else, no punctuation at the end."""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=50,
            messages=[{"role": "user", "content": prompt}],
        )
        title = response.content[0].text.strip().strip('"').strip("'")
        return jsonify({"title": title, "error": None})
    except Exception as e:
        return jsonify({"title": None, "error": str(e)}), 500


@app.route("/summary", methods=["POST"])
def generate_summary():
    data = request.get_json()
    conversation_history = data.get("conversation", [])

    # Convert conversation to a readable format
    conversation_text = "PATIENT INTERVIEW CONVERSATION:\n\n"
    for msg in conversation_history:
        role_label = "DOCTOR" if msg.get("role") == "assistant" else "PATIENT"
        conversation_text += f"{role_label}: {msg.get('content', '')}\n\n"

    messages = [{
        "role": "user",
        "content": f"Please create a comprehensive summary of this patient interview:\n\n{conversation_text}"
    }]

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=SUMMARY_SYSTEM_PROMPT,
            messages=messages,
        )

        summary = response.content[0].text
        return jsonify({"summary": summary, "error": None})
    except Exception as e:
        return jsonify({"summary": None, "error": str(e)}), 500


# ─── Helpers ──────────────────────────────────────────────────────────────────

def add_notification(message, notif_type="general", user_id=None):
    """Insert a notification row into Supabase."""
    supabase.table("notifications").insert({
        "message": message,
        "type": notif_type,
        "read": False,
        "user_id": user_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()


# ─── Journeys ─────────────────────────────────────────────────────────────────

@app.route("/journeys", methods=["POST"])
def create_journey():
    user = get_current_user()
    data = request.get_json()
    row = {
        "primary_symptom": data.get("primary_symptom", ""),
        "symptom_summary": data.get("symptom_summary", ""),
        "diagnoses": data.get("diagnoses", []),
        "progress_steps": data.get("progress_steps", ["Symptoms", "Insurance", "Doctor Visit", "Diagnosis"]),
        "completed_steps": data.get("completed_steps", ["Symptoms"]),
        "created_at": data.get("created_at") or datetime.now(timezone.utc).isoformat(),
        "updated_at": data.get("updated_at"),
        "user_id": user.id,
    }
    res = supabase.table("journeys").insert(row).execute()
    journey = res.data[0]
    add_notification(
        f"New health journey started for '{journey['primary_symptom']}'",
        "journey",
        user_id=user.id,
    )
    return jsonify({"journey": journey, "error": None}), 201


@app.route("/journeys", methods=["GET"])
def get_journeys():
    user = get_current_user()
    res = supabase.table("journeys").select("*").eq("user_id", user.id).order("created_at", desc=True).execute()
    return jsonify({"journeys": res.data, "error": None})


@app.route("/journeys/<int:journey_id>", methods=["GET"])
def get_journey(journey_id):
    user = get_current_user()
    res = supabase.table("journeys").select("*").eq("id", journey_id).eq("user_id", user.id).execute()
    if not res.data:
        return jsonify({"journey": None, "error": "Journey not found"}), 404
    return jsonify({"journey": res.data[0], "error": None})


@app.route("/journeys/<int:journey_id>", methods=["PUT"])
def update_journey(journey_id):
    user = get_current_user()
    data = request.get_json()
    updates = {}
    if "progress_steps" in data:
        updates["progress_steps"] = data["progress_steps"]
    if "completed_steps" in data:
        updates["completed_steps"] = data["completed_steps"]
    if "insurance_analysis" in data:
        updates["insurance_analysis"] = data["insurance_analysis"]
    if "checklist" in data:
        updates["checklist"] = data["checklist"]
    if "notes" in data:
        updates["notes"] = data["notes"]
    if "status" in data:
        updates["status"] = data["status"]
    updates["updated_at"] = data.get("updated_at") or datetime.now(timezone.utc).isoformat()

    res = supabase.table("journeys").update(updates).eq("id", journey_id).eq("user_id", user.id).execute()
    if not res.data:
        return jsonify({"journey": None, "error": "Journey not found"}), 404
    return jsonify({"journey": res.data[0], "error": None})


@app.route("/journeys/<int:journey_id>", methods=["DELETE"])
def delete_journey(journey_id):
    user = get_current_user()
    supabase.table("journeys").delete().eq("id", journey_id).eq("user_id", user.id).execute()
    return jsonify({"error": None})


@app.route("/journeys/<int:journey_id>/insurance-analysis", methods=["POST"])
def generate_insurance_analysis(journey_id):
    user = get_current_user()
    data = request.get_json() or {}
    insurance_id = data.get("insurance_id")

    journey_res = supabase.table("journeys").select("diagnoses").eq("id", journey_id).eq("user_id", user.id).execute()
    if not journey_res.data:
        return jsonify({"analysis": None, "error": "Journey not found"}), 404
    diagnoses = journey_res.data[0].get("diagnoses", [])

    if insurance_id:
        insurance_res = supabase.table("insurance").select("*").eq("id", insurance_id).eq("user_id", user.id).execute()
    else:
        insurance_res = supabase.table("insurance").select("*").eq("user_id", user.id).limit(1).execute()
    insurance_plans = insurance_res.data

    if not insurance_plans:
        return jsonify({"analysis": None, "error": "No insurance plans found. Please add your insurance first."}), 400

    diagnoses_text = "\n".join([f"- {d.get('condition', '')} ({d.get('confidence', '')} confidence)" for d in diagnoses])
    insurance_text = ""
    for plan in insurance_plans:
        insurance_text += f"- {plan.get('plan_type', 'Primary')}: {plan.get('provider', '')} — {plan.get('plan_name', '')} (Member ID: {plan.get('member_id', '')}, Group: {plan.get('group_number', 'N/A')})\n"

    prompt = f"""Patient's potential diagnoses:
{diagnoses_text}

Patient's insurance plans:
{insurance_text}

Write a helpful insurance coverage analysis for this patient. Cover:
1. Which diagnoses are typically covered under their plan type
2. Whether a referral is usually required to see a specialist
3. What the patient should expect in terms of copays or out-of-pocket costs (general guidance, not specific dollar amounts)
4. Any important steps to take before the visit (e.g., pre-authorization, in-network verification)
5. A brief recommendation on what to ask their insurance provider

Keep it practical, warm, and written in plain language for a patient (not a clinician). Use bullet points."""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        analysis = response.content[0].text.strip()
        supabase.table("journeys").update({"insurance_analysis": analysis, "updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", journey_id).eq("user_id", user.id).execute()
        return jsonify({"analysis": analysis, "error": None})
    except Exception as e:
        return jsonify({"analysis": None, "error": str(e)}), 500


@app.route("/journeys/<int:journey_id>/checklist", methods=["POST"])
def generate_checklist(journey_id):
    user = get_current_user()
    journey_res = supabase.table("journeys").select("diagnoses").eq("id", journey_id).eq("user_id", user.id).execute()
    if not journey_res.data:
        return jsonify({"checklist": None, "error": "Journey not found"}), 404
    diagnoses = journey_res.data[0].get("diagnoses", [])

    diagnoses_text = ", ".join([d.get("condition", "") for d in diagnoses]) if diagnoses else "unspecified condition"

    prompt = f"""A patient is preparing to visit a doctor for: {diagnoses_text}.

Generate a practical pre-doctor-visit checklist as a JSON array of strings. Each item should be a short, actionable task.
Include items about: symptom documentation, medication lists, questions to ask, what to bring, insurance cards, and any condition-specific preparations.
Return ONLY a valid JSON array of strings, no other text. Example format: ["Write down when symptoms started", "Bring a list of current medications"]
Generate 10-14 items."""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}],
        )
        import json as json_lib, re as _re
        text = response.content[0].text.strip()
        # Strip markdown code fences if Claude wraps the JSON
        text = _re.sub(r'^```(?:json)?\s*', '', text, flags=_re.MULTILINE)
        text = _re.sub(r'\s*```\s*$', '', text, flags=_re.MULTILINE)
        text = text.strip()
        checklist = json_lib.loads(text)
        supabase.table("journeys").update({"checklist": checklist, "updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", journey_id).eq("user_id", user.id).execute()
        return jsonify({"checklist": checklist, "error": None})
    except Exception as e:
        return jsonify({"checklist": None, "error": str(e)}), 500


@app.route("/journeys/<int:journey_id>/notes", methods=["PUT"])
def update_journey_notes(journey_id):
    user = get_current_user()
    data = request.get_json()
    notes = data.get("notes", "")
    res = supabase.table("journeys").update({"notes": notes, "updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", journey_id).eq("user_id", user.id).execute()
    if not res.data:
        return jsonify({"notes": None, "error": "Journey not found"}), 404
    return jsonify({"notes": res.data[0].get("notes", ""), "error": None})


# ─── Appointments ─────────────────────────────────────────────────────────────

@app.route("/appointments", methods=["POST"])
def create_appointment():
    user = get_current_user()
    data = request.get_json()
    row = {
        "doctor_name": data.get("doctor_name", ""),
        "date": data.get("date", ""),
        "time": data.get("time", ""),
        "reason": data.get("reason", ""),
        "journey_id": data.get("journey_id"),
        "status": "upcoming",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "user_id": user.id,
    }
    res = supabase.table("appointments").insert(row).execute()
    appointment = res.data[0]
    add_notification(
        f"Appointment booked with {appointment['doctor_name']} on {appointment['date']}",
        "appointment",
        user_id=user.id,
    )
    return jsonify({"appointment": appointment, "error": None}), 201


@app.route("/appointments", methods=["GET"])
def get_appointments():
    user = get_current_user()
    res = supabase.table("appointments").select("*").eq("user_id", user.id).order("date").order("time").execute()
    return jsonify({"appointments": res.data, "error": None})


@app.route("/appointments/<int:appointment_id>", methods=["PUT"])
def update_appointment(appointment_id):
    user = get_current_user()
    data = request.get_json()
    updates = {
        field: data[field]
        for field in ["doctor_name", "date", "time", "reason", "status", "journey_id"]
        if field in data
    }
    res = supabase.table("appointments").update(updates).eq("id", appointment_id).eq("user_id", user.id).execute()
    if not res.data:
        return jsonify({"appointment": None, "error": "Appointment not found"}), 404
    return jsonify({"appointment": res.data[0], "error": None})


@app.route("/appointments/<int:appointment_id>", methods=["DELETE"])
def delete_appointment(appointment_id):
    user = get_current_user()
    res = supabase.table("appointments").delete().eq("id", appointment_id).eq("user_id", user.id).execute()
    if not res.data:
        return jsonify({"error": "Appointment not found"}), 404
    return jsonify({"error": None})


# ─── Notifications ────────────────────────────────────────────────────────────

@app.route("/notifications", methods=["GET"])
def get_notifications():
    user = get_current_user()
    res = supabase.table("notifications").select("*").eq("user_id", user.id).order("created_at", desc=True).execute()
    return jsonify({"notifications": res.data, "error": None})


@app.route("/notifications/<int:notification_id>/read", methods=["PUT"])
def mark_notification_read(notification_id):
    user = get_current_user()
    res = supabase.table("notifications").update({"read": True}).eq("id", notification_id).eq("user_id", user.id).execute()
    if not res.data:
        return jsonify({"error": "Notification not found"}), 404
    return jsonify({"notification": res.data[0], "error": None})


@app.route("/notifications/read-all", methods=["PUT"])
def mark_all_notifications_read():
    user = get_current_user()
    supabase.table("notifications").update({"read": True}).eq("read", False).eq("user_id", user.id).execute()
    return jsonify({"error": None})


# ─── Insurance ────────────────────────────────────────────────────────────────

@app.route("/insurance", methods=["POST"])
def create_insurance():
    user = get_current_user()
    data = request.get_json()
    row = {
        "provider": data.get("provider", ""),
        "plan_name": data.get("plan_name", ""),
        "member_id": data.get("member_id", ""),
        "group_number": data.get("group_number", ""),
        "plan_type": data.get("plan_type", "Primary"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "user_id": user.id,
    }
    res = supabase.table("insurance").insert(row).execute()
    return jsonify({"insurance": res.data[0], "error": None}), 201


@app.route("/insurance", methods=["GET"])
def get_insurance():
    user = get_current_user()
    res = supabase.table("insurance").select("*").eq("user_id", user.id).order("created_at").execute()
    return jsonify({"insurance": res.data, "error": None})


@app.route("/insurance/<int:insurance_id>", methods=["PUT"])
def update_insurance(insurance_id):
    user = get_current_user()
    data = request.get_json()
    updates = {
        field: data[field]
        for field in ["provider", "plan_name", "member_id", "group_number", "plan_type"]
        if field in data
    }
    res = supabase.table("insurance").update(updates).eq("id", insurance_id).eq("user_id", user.id).execute()
    if not res.data:
        return jsonify({"insurance": None, "error": "Insurance not found"}), 404
    return jsonify({"insurance": res.data[0], "error": None})


@app.route("/insurance/<int:insurance_id>", methods=["DELETE"])
def delete_insurance(insurance_id):
    user = get_current_user()
    res = supabase.table("insurance").delete().eq("id", insurance_id).eq("user_id", user.id).execute()
    if not res.data:
        return jsonify({"error": "Insurance not found"}), 404
    return jsonify({"error": None})


# ─── Chat Sessions ────────────────────────────────────────────────────────────

@app.route("/chat-sessions/current", methods=["GET"])
def get_current_chat_session():
    user = get_current_user()
    res = supabase.table("chat_sessions").select("*").eq("user_id", user.id).eq("completed", False).order("created_at", desc=True).limit(1).execute()
    session = res.data[0] if res.data else None
    return jsonify({"session": session, "error": None})


@app.route("/chat-sessions", methods=["POST"])
def create_chat_session():
    user = get_current_user()
    data = request.get_json() or {}
    row = {
        "user_id": user.id,
        "messages": data.get("messages", []),
        "completed": False,
        "journey_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    res = supabase.table("chat_sessions").insert(row).execute()
    return jsonify({"session": res.data[0], "error": None}), 201


@app.route("/chat-sessions/<int:session_id>", methods=["PUT"])
def update_chat_session(session_id):
    user = get_current_user()
    data = request.get_json() or {}
    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if "messages" in data:
        updates["messages"] = data["messages"]
    if "completed" in data:
        updates["completed"] = data["completed"]
    if "journey_id" in data:
        updates["journey_id"] = data["journey_id"]
    res = supabase.table("chat_sessions").update(updates).eq("id", session_id).eq("user_id", user.id).execute()
    if not res.data:
        return jsonify({"session": None, "error": "Session not found"}), 404
    return jsonify({"session": res.data[0], "error": None})


# ─── Support ──────────────────────────────────────────────────────────────────

@app.route("/support/contact", methods=["POST"])
def contact_support():
    data = request.get_json()
    supabase.table("support_messages").insert({
        "name": data.get("name", ""),
        "email": data.get("email", ""),
        "message": data.get("message", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()
    return jsonify({"success": True, "error": None})


@app.route("/")
def home():
    return "Hello, world!"

if __name__ == "__main__":
    app.run(debug=True, port=5001)
