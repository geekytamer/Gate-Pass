import qrcode
import os
from PIL import Image
from app.core.config import settings

def generate_qr_image(student_id: str) -> str:
    qr = qrcode.QRCode(box_size=10, border=4)
    qr.add_data(student_id)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white").convert("RGB")  # ✅ Force RGB
    filename = f"{student_id}.png"
    file_path = os.path.join("app/static/qrs", filename)
    img.save(file_path, format="PNG", optimize=True)

    return f"{settings.BASE_URL}static/qrs/{filename}"