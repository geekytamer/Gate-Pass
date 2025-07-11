import httpx
import os
import asyncio
import random
import string
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

OMANTEL_API_URL = "https://apigw.omantel.om/v1/unified-messaging/send-single"
OMANTEL_TOKEN_URL = "https://apigw.omantel.om/oauth2/accesstoken"
OMANTEL_SENDER = os.getenv("OMANTEL_SENDER", "Omantel")
CLIENT_ID = os.getenv("OMANTEL_CLIENT_ID")
CLIENT_SECRET = os.getenv("OMANTEL_CLIENT_SECRET")

_token = None
_token_expiry = None

def generate_correlator_id(length=10):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

async def get_access_token():
    global _token, _token_expiry

    async with httpx.AsyncClient() as client:
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        data = {
            "grant_type": "client_credentials",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        }

        response = await client.post(OMANTEL_TOKEN_URL, data=data, headers=headers)
        response.raise_for_status()

        token_data = response.json()
        _token = token_data["access_token"]
        _token_expiry = datetime.utcnow() + timedelta(seconds=token_data.get("expires_in", 3600))

        return _token

async def send_sms(recipient: str, message: str) -> bool:
    token = await get_access_token()
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    payload = {
        "sender": OMANTEL_SENDER,
        "clientCorrelatorId": generate_correlator_id(),
        "recipient": recipient,
        "smsText": message
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(OMANTEL_API_URL, json=payload, headers=headers)
            print(payload)
            print(f"[SMS SUCCESS] {response.json()}")
            response.raise_for_status()
            return True
    except httpx.HTTPError as e:
        print(f"[SMS ERROR] {e}")
        return False