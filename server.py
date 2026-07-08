import os
import json
from flask import Flask, request, jsonify, send_from_directory
import requests
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

app = Flask(__name__, static_folder=".")

# Ensure keys are loaded
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
GOOGLE_APPS_SCRIPT_URL = os.environ.get("GOOGLE_APPS_SCRIPT_URL", "")

@app.route("/")
def serve_index():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(".", path)

@app.route("/api/config", methods=["GET"])
def get_config():
    """Returns whether live API integrations are configured on the server."""
    return jsonify({
        "has_anthropic_key": bool(ANTHROPIC_API_KEY),
        "has_gas_url": bool(GOOGLE_APPS_SCRIPT_URL),
        "server_mode": "live" if (ANTHROPIC_API_KEY and GOOGLE_APPS_SCRIPT_URL) else "demo"
    })

@app.route("/api/advisory", methods=["POST"])
def get_advisory():
    """Logs financial details and proxies request to Claude AI."""
    try:
        data = request.get_json() or {}
        
        # Determine mode
        # If server is not configured, fall back to returning a mock result or error
        if not ANTHROPIC_API_KEY or not GOOGLE_APPS_SCRIPT_URL:
            return jsonify({
                "status": "fallback",
                "message": "Server is in demo mode. Please configure ANTHROPIC_API_KEY and GOOGLE_APPS_SCRIPT_URL in your .env file for live production integration."
            })
            
        # Append server keys to the payload
        payload = {
            "salary": data.get("salary", 0),
            "creditScore": data.get("creditScore", 0),
            "existingEmi": data.get("existingEmi", 0),
            "requestedAmount": data.get("requestedAmount", 0),
            "requestedTenure": data.get("requestedTenure", 0),
            "decision": data.get("decision", "N/A"),
            "riskLevel": data.get("riskLevel", "N/A"),
            "calculatedEmi": data.get("calculatedEmi", 0),
            "generateAiAdvice": True,
            "anthropicApiKey": ANTHROPIC_API_KEY
        }
        
        # Forward request to Google Apps Script
        # We send as POST. Since Apps Script redirects, requests handles redirects automatically.
        headers = {"Content-Type": "text/plain"} # Apps script handles text/plain payloads best
        response = requests.post(
            GOOGLE_APPS_SCRIPT_URL, 
            data=json.dumps(payload), 
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            return jsonify({
                "status": "error",
                "message": f"Google Apps Script returned status {response.status_code}."
            }), 500
            
        result = response.json()
        return jsonify(result)
        
    except requests.exceptions.Timeout:
        return jsonify({
            "status": "error",
            "message": "Connection to Google Apps Script timed out."
        }), 504
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting FinWise AI production server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
