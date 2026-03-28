"""
Seed data script for Smart Water Management System.
Creates sample users and sensor readings for demonstration.

Run with: python seed_data.py
"""

import asyncio
import os
import sys
from datetime import datetime, timedelta
import random

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from auth.database import (
    get_pool,
    ensure_tables,
    create_user,
    get_user_by_email,
    create_portal_user,
    get_portal_user_by_unique_id,
    create_sensor_reading,
)
from auth.utils import hash_password


# ==================== Sample Data Configuration ====================

SAMPLE_ADMIN = {
    "email": "admin@waterwatch.com",
    "password": "Admin@123",
    "full_name": "System Administrator"
}

SAMPLE_PORTAL_USERS = [
    {
        "unique_id": "WU-2024-001",
        "full_name": "Rajesh Kumar",
        "email": "rajesh.kumar@email.com",
        "phone": "+91-9876543210",
        "address": "Sector 14, Gurgaon, Haryana"
    },
    {
        "unique_id": "WU-2024-002",
        "full_name": "Priya Sharma",
        "email": "priya.sharma@email.com",
        "phone": "+91-9876543211",
        "address": "Connaught Place, New Delhi"
    },
    {
        "unique_id": "WU-2024-003",
        "full_name": "Amit Patel",
        "email": "amit.patel@email.com",
        "phone": "+91-9876543212",
        "address": "Bandra West, Mumbai, Maharashtra"
    }
]


def generate_sensor_reading(base_time: datetime, hours_ago: int):
    """Generate a realistic sensor reading."""
    # pH: 6.5 - 8.5 is safe
    ph = round(random.uniform(6.2, 8.8), 2)

    # Pressure: 1.5 - 4.0 bar typical
    pressure = round(random.uniform(1.5, 4.0), 2)

    # Flow rate: 20 - 100 L/min
    flow_rate = round(random.uniform(20, 100), 2)

    # Total volume: cumulative
    total_volume = round(random.uniform(500, 5000) + (24 - hours_ago) * random.uniform(10, 50), 2)

    # Temperature: 15 - 35 C
    temperature = round(random.uniform(18, 32), 2)

    # TDS: 100 - 600 ppm (< 500 is safe)
    tds = random.randint(150, 550)

    # Dissolved oxygen: 5 - 10 mg/L
    dissolved_oxygen = round(random.uniform(5.5, 9.5), 2)

    # Timestamp
    timestamp = base_time - timedelta(hours=hours_ago)

    # Assess quality
    issues = 0
    if ph < 6.5 or ph > 8.5:
        issues += 1
    if tds > 500:
        issues += 1
    if temperature < 10 or temperature > 35:
        issues += 1

    if issues == 0:
        water_quality = "Safe"
        risk_level = "Low"
    elif issues == 1:
        water_quality = "Unsafe"
        risk_level = "Medium"
    else:
        water_quality = "Unsafe"
        risk_level = "High"

    return {
        "ph": ph,
        "pressure": pressure,
        "flow_rate": flow_rate,
        "total_volume_passed": total_volume,
        "temperature": temperature,
        "tds": tds,
        "dissolved_oxygen": dissolved_oxygen,
        "water_quality": water_quality,
        "risk_level": risk_level,
        "device_id": f"ESP32-{random.randint(100, 999)}",
        "location": random.choice(["Main Tank", "Kitchen", "Bathroom", "Garden"]),
        "timestamp": timestamp
    }


async def seed_admin_user():
    """Create sample admin user."""
    print("\n📌 Creating admin user...")

    existing = await get_user_by_email(SAMPLE_ADMIN["email"])
    if existing:
        print(f"   ⚠️  Admin user already exists: {SAMPLE_ADMIN['email']}")
        return existing

    password_hash = hash_password(SAMPLE_ADMIN["password"])
    user = await create_user(
        email=SAMPLE_ADMIN["email"],
        password_hash=password_hash,
        full_name=SAMPLE_ADMIN["full_name"],
        role="admin"
    )
    print(f"   ✅ Created admin user: {SAMPLE_ADMIN['email']}")
    return user


async def seed_portal_users(admin_id: str):
    """Create sample portal users."""
    print("\n📌 Creating portal users...")

    created_users = []
    for user_data in SAMPLE_PORTAL_USERS:
        existing = await get_portal_user_by_unique_id(user_data["unique_id"])
        if existing:
            print(f"   ⚠️  Portal user already exists: {user_data['unique_id']}")
            created_users.append(existing)
            continue

        user = await create_portal_user(
            unique_id=user_data["unique_id"],
            full_name=user_data["full_name"],
            email=user_data["email"],
            phone=user_data["phone"],
            address=user_data["address"],
            created_by=admin_id
        )
        print(f"   ✅ Created portal user: {user_data['unique_id']} - {user_data['full_name']}")
        created_users.append(user)

    return created_users


async def seed_sensor_readings(portal_users: list):
    """Generate sensor readings for portal users."""
    print("\n📌 Generating sensor readings...")

    base_time = datetime.now()
    readings_per_user = 48  # Last 48 hours of data

    for user in portal_users:
        # Check if user already has readings
        pool = await get_pool()
        async with pool.acquire() as conn:
            count = await conn.fetchval(
                "SELECT COUNT(*) FROM sensor_readings WHERE unique_id = $1",
                user["unique_id"]
            )

        if count > 0:
            print(f"   ⚠️  User {user['unique_id']} already has {count} readings")
            continue

        print(f"   📊 Generating {readings_per_user} readings for {user['unique_id']}...")

        for i in range(readings_per_user):
            reading = generate_sensor_reading(base_time, i)

            await create_sensor_reading(
                user_id=str(user["id"]),
                unique_id=user["unique_id"],
                **reading
            )

        print(f"   ✅ Created {readings_per_user} readings for {user['unique_id']}")


async def main():
    """Main seed function."""
    print("\n" + "=" * 60)
    print("  🌊 SMART WATER MANAGEMENT - SEED DATA SCRIPT")
    print("=" * 60)

    try:
        # Ensure tables exist
        print("\n📌 Ensuring database tables...")
        await ensure_tables()

        # Create admin user
        admin = await seed_admin_user()

        # Create portal users
        portal_users = await seed_portal_users(str(admin["id"]))

        # Generate sensor readings
        await seed_sensor_readings(portal_users)

        # Print summary
        print("\n" + "=" * 60)
        print("  ✅ SEED DATA COMPLETE!")
        print("=" * 60)
        print("\n📋 LOGIN CREDENTIALS:\n")
        print("  🔐 ADMIN LOGIN:")
        print(f"     Email:    {SAMPLE_ADMIN['email']}")
        print(f"     Password: {SAMPLE_ADMIN['password']}")
        print()
        print("  👤 PORTAL USER LOGIN (use unique_id only):")
        for user in SAMPLE_PORTAL_USERS:
            print(f"     {user['unique_id']} - {user['full_name']}")
        print()
        print("=" * 60 + "\n")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    asyncio.run(main())
