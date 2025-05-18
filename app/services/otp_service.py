from datetime import datetime, timedelta
from app.models.otp import OTP
from app.models.user import User
from app.db.session import async_session
from app.services.sms_service import send_sms
from app.core.security import generate_random_otp
from sqlalchemy.future import select

OTP_EXPIRY_MINUTES = 5

async def create_and_send_otp(phone_number: str) -> bool:
    async with async_session() as session:
        # Get user by phone number
        result = await session.execute(select(User).where(User.phone_number == phone_number))
        user = result.scalar_one_or_none()
        if not user:
            print("[OTP] User not found")
            return False

        # Generate OTP
        code = generate_random_otp()
        expiry = datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES)

        # Store OTP
        otp = OTP(user_id=user.id, otp_code=code, expires_at=expiry)
        session.add(otp)
        await session.commit()

        # Send OTP via SMS
        message = f"Your OTP is {code}. It will expire in {OTP_EXPIRY_MINUTES} minutes."
        success = await send_sms(phone_number, message)
        return success