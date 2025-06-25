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
    allow_origins=["http://localhost:3000", "*"],  # Or ["*"] for dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(whatsapp.router, prefix="/api/whatsapp", tags=["WhatsApp Webhook"])
app.include_router(security.router, prefix="/api/security", tags=["Security QR Scan"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(university.router, prefix="/api/university", tags=["University"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(accommodations.router, prefix="/api/accommodations", tags=["Accommodations"])
app.include_router(admin.router, prefix="/api/admin") 
@app.get("/")
def root():
    return {"message": "GatePass API is running!"}