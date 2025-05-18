import os
import httpx
from app.core.config import settings
import requests

def send_whatsapp_message(phone_number: str, text: str):
    url = f"{settings.WHATSAPP_API_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": phone_number,
        "type": "text",
        "text": {
            "body": text
        }
    }
    print(payload)
    response = httpx.post(url, headers=headers, json=payload)
    print(response.json())
    response.raise_for_status()
    return response.json()

def send_exit_request_to_parent(parent_phone, student_name, bus_name, destination, otp_code, exit_method):
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }

    components = [
        {
            "type": "body",
            "parameters": [
                {"type": "text", "text": student_name},
                {"type": "text", "text": exit_method.capitalize()},
                {"type": "text", "text": bus_name if bus_name else "N/A"},
                {"type": "text", "text": destination if destination else "N/A"}
            ]
        },
        {
            "type": "button",
            "sub_type": "quick_reply",
            "index": "0",
            "parameters": [
                {"type": "payload", "payload": f"APPROVE {otp_code}"}
            ]
        }
    ]

    payload = {
        "messaging_product": "whatsapp",
        "to": parent_phone,
        "type": "template",
        "template": {
            "name": "student_exit_request",  # must match the approved name in WhatsApp dashboard
            "language": {"code": "en_US"},
            "components": components
        }
    }

    response = requests.post(
        f"{settings.WHATSAPP_API_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages",
        headers=headers,
        json=payload
    )

    if not response.ok:
        print("❌ Failed to send WhatsApp template message:", response.text)

async def upload_qr_to_whatsapp(file_path: str) -> str:
    """
    Uploads a QR PNG file to the WhatsApp Media API and returns the media ID.
    """
    url = f"{settings.WHATSAPP_API_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/media"
    mime_type = "image/png"
    headers = {
    "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
    }
    
    print(settings.WHATSAPP_TOKEN)
    
    with open(file_path, "rb") as f:
        files = {
            "file": (os.path.basename(file_path), f, mime_type),
        }
        data = {
            "messaging_product": "whatsapp",
            "type": mime_type,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, files=files, data=data)
            response.raise_for_status()
            return response.json()["id"]
        
async def send_whatsapp_template_with_qr(phone_number: str, media_id: str, student_name: str):
    url = f"{settings.WHATSAPP_API_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"

    payload = {
        "messaging_product": "whatsapp",
        "to": phone_number,
        "type": "template",
        "template": {
            "name": "student_qr_notification",
            "language": { "code": "en" },
            "components": [
                {
                    "type": "header",
                    "parameters": [
                        {
                            "type": "image",
                            "image": { "id": media_id }
                        }
                    ]
                },
                {
                    "type": "body",
                    "parameters": [
                        { "type": "text", "text": student_name }
                    ]
                }
            ]
        }
    }

    headers = {
    "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
    "Content-Type": "application/json"  # 👈 Add this!
}
    
    print(payload)

    async with httpx.AsyncClient() as client:
        res = await client.post(url, headers=headers, json=payload)
        res.raise_for_status()
        return res.json()
    
async def send_whatsapp_template_with_qr_link(phone_number: str, qr_url: str, student_name: str):
    payload = {
        "messaging_product": "whatsapp",
        "to": phone_number,
        "type": "template",
        "template": {
            "name": "student_qr_notification",
            "language": {"code": "en"},
            "components": [
                {
                    "type": "header",
                    "parameters": [
                        {
                            "type": "image",
                            "image": { "link": qr_url }
                        }
                    ]
                },
                {
                    "type": "body",
                    "parameters": [
                        { "type": "text", "text": student_name }
                    ]
                }
            ]
        }
    }

    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }

    print(payload)
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.WHATSAPP_API_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        return response.json()