from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    WHATSAPP_API_URL: str
    WHATSAPP_PHONE_NUMBER_ID: str
    WHATSAPP_TOKEN: str
    OMANTEL_CLIENT_ID:str
    OMANTEL_CLIENT_SECRET:str
    OMANTEL_SENDER:str
    BASE_URL: str

    class Config:
        env_file = ".env"

settings = Settings()