from fastapi import FastAPI
from app.db.database import init_db
from app.api import admin, whatsapp, security, auth, university, students, accommodations  # import your routers
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


app = FastAPI()


# Serve static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Initialize database (creates tables if not exist)
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://dashboard.gatepassom.com"],  # Or ["*"] for dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(whatsapp.router, prefix="/whatsapp", tags=["WhatsApp Webhook"])
app.include_router(security.router, prefix="/security", tags=["Security QR Scan"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(university.router, prefix="/university", tags=["University"])
app.include_router(students.router, prefix="/students", tags=["Students"])
app.include_router(accommodations.router, prefix="/accommodations", tags=["Accommodations"])
app.include_router(admin.router, prefix="/admin") 
@app.get("/")
def root():
    return {"message": "GatePass API is running!"}