from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
import json
import re
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

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
- You MUST provide possibilities when you have enough information, even if the patient previously disagreed. The patient needs to sign off on possibilities to proceed with their health journey."""

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")
    conversation_history = data.get("conversation", [])

    # Build messages array with system prompt and conversation history
    messages = [
        {"role": "system", "content": HEALTHCARE_SYSTEM_PROMPT}
    ]
    
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
        # Use the new OpenAI API (v1+)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.7
        )

        bot_message = response.choices[0].message.content
        
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
                {"role": "user", "content": "Based on all the information I've provided, can you please provide your assessment of potential diagnoses using the possibilities format? I need to see the diagnostic possibilities to proceed."}
            ]
            
            try:
                follow_up_response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=follow_up_messages,
                    temperature=0.7
                )
                
                follow_up_message = follow_up_response.choices[0].message.content
                
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
        
        return jsonify({
            "response": clean_message, 
            "possibilities": possibilities,
            "error": None
        })
    except Exception as e:
        return jsonify({"response": None, "possibilities": None, "error": str(e)}), 500

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

    # Build messages array for symptom summary generation
    messages = [
        {"role": "system", "content": SYMPTOM_SUMMARY_PROMPT}
    ]
    
    # Convert conversation to a readable format
    conversation_text = "PATIENT INTERVIEW CONVERSATION:\n\n"
    for msg in conversation_history:
        role_label = "DOCTOR" if msg.get("role") == "assistant" else "PATIENT"
        conversation_text += f"{role_label}: {msg.get('content', '')}\n\n"
    
    # Add possibilities if provided
    possibilities_text = ""
    if possibilities:
        possibilities_text = "\n\nPOTENTIAL DIAGNOSES IDENTIFIED:\n"
        for p in possibilities[:4]:  # Limit to top 4
            possibilities_text += f"- {p.get('condition', '')} ({p.get('confidence', '')} confidence)\n"
    
    messages.append({
        "role": "user",
        "content": f"Create a very brief, concise symptom summary for a doctor visit based on this patient interview:\n\n{conversation_text}{possibilities_text}\n\nRemember: Keep it extremely brief (150-200 words max), structured, and professional for a healthcare provider to quickly read."
    })

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.2  # Very low temperature for consistent, concise summaries
        )

        summary = response.choices[0].message.content
        return jsonify({"summary": summary, "error": None})
    except Exception as e:
        return jsonify({"summary": None, "error": str(e)}), 500

@app.route("/summary", methods=["POST"])
def generate_summary():
    data = request.get_json()
    conversation_history = data.get("conversation", [])

    # Build messages array for summary generation
    messages = [
        {"role": "system", "content": SUMMARY_SYSTEM_PROMPT}
    ]
    
    # Convert conversation to a readable format
    conversation_text = "PATIENT INTERVIEW CONVERSATION:\n\n"
    for msg in conversation_history:
        role_label = "DOCTOR" if msg.get("role") == "assistant" else "PATIENT"
        conversation_text += f"{role_label}: {msg.get('content', '')}\n\n"
    
    messages.append({
        "role": "user",
        "content": f"Please create a comprehensive summary of this patient interview:\n\n{conversation_text}"
    })

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.3  # Lower temperature for more consistent summaries
        )

        summary = response.choices[0].message.content
        return jsonify({"summary": summary, "error": None})
    except Exception as e:
        return jsonify({"summary": None, "error": str(e)}), 500

# In-memory storage for journeys (in production, use a database)
journeys_storage = []

@app.route("/journeys", methods=["POST"])
def create_journey():
    data = request.get_json()
    
    journey = {
        "id": len(journeys_storage) + 1,
        "primary_symptom": data.get("primary_symptom", ""),
        "symptom_summary": data.get("symptom_summary", ""),
        "diagnoses": data.get("diagnoses", []),
        "progress_steps": data.get("progress_steps", ["Symptoms", "Insurance", "Doctor Visit", "Diagnosis"]),
        "completed_steps": data.get("completed_steps", ["Symptoms"]),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at")
    }
    
    journeys_storage.append(journey)
    return jsonify({"journey": journey, "error": None}), 201

@app.route("/journeys", methods=["GET"])
def get_journeys():
    # Return journeys in reverse chronological order (most recent first)
    sorted_journeys = sorted(journeys_storage, key=lambda x: x.get("created_at", ""), reverse=True)
    return jsonify({"journeys": sorted_journeys, "error": None})

@app.route("/journeys/<int:journey_id>", methods=["PUT"])
def update_journey(journey_id):
    data = request.get_json()
    
    # Find the journey
    journey = None
    for j in journeys_storage:
        if j["id"] == journey_id:
            journey = j
            break
    
    if not journey:
        return jsonify({"journey": None, "error": "Journey not found"}), 404
    
    # Update fields
    if "progress_steps" in data:
        journey["progress_steps"] = data["progress_steps"]
    if "completed_steps" in data:
        journey["completed_steps"] = data["completed_steps"]
    if "updated_at" in data:
        journey["updated_at"] = data["updated_at"]
    
    return jsonify({"journey": journey, "error": None})

@app.route("/")
def home():
    return "Hello, world!"

if __name__ == "__main__":
    app.run(debug=True, port=5001)
