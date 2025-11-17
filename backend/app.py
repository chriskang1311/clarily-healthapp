from flask import Flask, request, jsonify
import openai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")

    # Use the new OpenAI API (v1+)
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful healthcare assistant."},
            {"role": "user", "content": user_message}
        ]
    )

    bot_message = response.choices[0].message.content
    return jsonify({"response": bot_message})

@app.route("/")
def home():
    return "Hello, world!"

if __name__ == "__main__":
    app.run(debug=True)
