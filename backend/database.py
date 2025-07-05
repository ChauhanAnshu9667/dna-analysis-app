import os
from dotenv import load_dotenv
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from bson import ObjectId
from urllib.parse import quote_plus

load_dotenv()

# Try to import Motor with fallback
try:
    from motor.motor_asyncio import AsyncIOMotorClient
    MOTOR_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Motor not available: {e}")
    MOTOR_AVAILABLE = False
    AsyncIOMotorClient = None

# Get MongoDB URL and properly encode username/password
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

# If it's a MongoDB Atlas URL with username/password, encode them properly
if "@" in MONGODB_URL and "mongodb+srv://" in MONGODB_URL:
    try:
        # Parse the URL to extract and encode username/password
        from urllib.parse import urlparse, parse_qs
        
        parsed = urlparse(MONGODB_URL)
        if parsed.username and parsed.password:
            # Reconstruct URL with encoded credentials
            encoded_username = quote_plus(parsed.username)
            encoded_password = quote_plus(parsed.password)
            
            # Rebuild the URL with encoded credentials
            MONGODB_URL = MONGODB_URL.replace(
                f"{parsed.username}:{parsed.password}@",
                f"{encoded_username}:{encoded_password}@"
            )
            print(f"MongoDB URL encoded successfully")
    except Exception as e:
        print(f"Warning: Could not encode MongoDB URL: {e}")

# Initialize client only if Motor is available
if MOTOR_AVAILABLE:
    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client.dna_analysis_db
        print(f"MongoDB connection established successfully")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        client = None
        db = None
else:
    client = None
    db = None

class User(BaseModel):
    username: str
    email: str
    hashed_password: str
    created_at: datetime = datetime.utcnow()
    last_login: Optional[datetime] = None
    profile_picture: Optional[str] = None
    bio: Optional[str] = None

class AnalysisHistory(BaseModel):
    user_id: str
    analysis_date: datetime = datetime.utcnow()
    trait_analyzed: str
    gene: str
    sequence_length: int
    mutations_found: int
    match_percentage: float
    analysis_summary: Dict[str, Any]

async def get_user_by_email(email: str):
    if not db:
        return None
    try:
        return await db.users.find_one({"email": email})
    except Exception as e:
        print(f"Error getting user by email: {e}")
        return None

async def get_user_by_username(username: str):
    if not db:
        return None
    try:
        return await db.users.find_one({"username": username})
    except Exception as e:
        print(f"Error getting user by username: {e}")
        return None

async def create_user(user_data: dict):
    if not db:
        return None
    try:
        return await db.users.insert_one(user_data)
    except Exception as e:
        print(f"Error creating user: {e}")
        return None

async def update_user_profile(user_id: str, updates: dict):
    """Update user profile information"""
    if not db:
        return None
    try:
        return await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": updates}
        )
    except Exception as e:
        print(f"Error updating user profile: {e}")
        return None

async def save_analysis_history(analysis_data: dict):
    """Save analysis history for a user"""
    if not db:
        return None
    try:
        return await db.analysis_history.insert_one(analysis_data)
    except Exception as e:
        print(f"Error saving analysis history: {e}")
        return None

async def get_user_analysis_history(user_id: str, limit: int = 50):
    """Get analysis history for a user"""
    if not db:
        return []
    try:
        cursor = db.analysis_history.find(
            {"user_id": user_id}
        ).sort("analysis_date", -1).limit(limit)
        return await cursor.to_list(length=limit)
    except Exception as e:
        print(f"Error getting analysis history: {e}")
        return []

async def get_user_by_id(user_id: str):
    """Get user by ID"""
    if not db:
        return None
    try:
        return await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception as e:
        print(f"Error getting user by ID: {e}")
        return None 