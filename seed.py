from app.db.database import engine
from app.models.university import University
from app.models.accommodation import Accommodation
from app.models.bus import Bus
from app.models.user import User, ParentStudentLink
from app.models.base import Base
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from uuid import uuid4

Base.metadata.create_all(bind=engine)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_data():
    db = Session(bind=engine)
    phone_counter = 92000000

    # Add main admin
    admin = User(
        id=uuid4(),
        name="Main Admin",
        phone_number="96899900000",
        role="admin",
        hashed_password=pwd_context.hash("admin123")
    )
    db.add(admin)

    for u_index in range(2):  # 2 universities
        university = University(
            id=uuid4(),
            name=f"University {chr(65 + u_index)}"
        )
        db.add(university)
        db.commit()
        db.refresh(university)

        # Add a university admin
        uni_admin = User(
            id=uuid4(),
            name=f"UniAdmin {chr(65 + u_index)}",
            phone_number=f"968{phone_counter}",
            role="university_admin",
            hashed_password=pwd_context.hash("admin123"),
            university_id=university.id
        )
        phone_counter += 1
        db.add(uni_admin)

        for a_index in range(2):  # 2 accommodations
            accommodation = Accommodation(
                id=uuid4(),
                name=f"Building {chr(65 + a_index)} - {university.name}",
                university_id=university.id
            )
            db.add(accommodation)
            db.commit()
            db.refresh(accommodation)

            # Add a staff member (one per university, assigned to first accommodation)
            if a_index == 0:
                staff = User(
                    id=uuid4(),
                    name=f"Staff {university.name}",
                    phone_number=f"968{phone_counter}",
                    role="staff",
                    hashed_password=pwd_context.hash("staff123"),
                    accommodation_id=accommodation.id,
                    university_id=university.id
                )
                phone_counter += 1
                db.add(staff)

            for b_index in range(2):  # 2 buses
                bus = Bus(
                    id=uuid4(),
                    name=f"Bus {b_index + 1} - {accommodation.name}",
                    destination_district=f"District {b_index + 1}",
                    accommodation_id=accommodation.id,
                    capacity=40,
                    university_id=university.id
                )
                db.add(bus)
                db.commit()
                db.refresh(bus)

                for s_index in range(2):  # 2 students per bus
                    student = User(
                        id=uuid4(),
                        name=f"Student {u_index}-{a_index}-{b_index}-{s_index}",
                        phone_number=f"968{phone_counter}",
                        role="student",
                        hashed_password=pwd_context.hash("1234"),
                        accommodation_id=accommodation.id,
                        university_id=university.id
                    )
                    phone_counter += 1
                    db.add(student)
                    db.commit()
                    db.refresh(student)

                    parent = User(
                        id=uuid4(),
                        name=f"Parent {u_index}-{a_index}-{b_index}-{s_index}",
                        phone_number=f"968{phone_counter}",
                        role="parent",
                        hashed_password=pwd_context.hash("1234")
                    )
                    phone_counter += 1
                    db.add(parent)
                    db.commit()
                    db.refresh(parent)

                    link = ParentStudentLink(
                        id=uuid4(),
                        parent_id=parent.id,
                        student_id=student.id
                    )
                    db.add(link)
                    db.commit()

    db.commit()
    print("✅ Full seed complete: universities, admins, staff, parents, and students.")

if __name__ == "__main__":
    seed_data()
