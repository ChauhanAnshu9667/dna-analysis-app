from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.dna_analysis_db

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
    return await db.users.find_one({"email": email})

async def get_user_by_username(username: str):
    return await db.users.find_one({"username": username})

async def create_user(user_data: dict):
    return await db.users.insert_one(user_data)

async def update_user_profile(user_id: str, updates: dict):
    """Update user profile information"""
    return await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": updates}
    )

async def save_analysis_history(analysis_data: dict):
    """Save analysis history for a user"""
    return await db.analysis_history.insert_one(analysis_data)

async def get_user_analysis_history(user_id: str, limit: int = 50):
    """Get analysis history for a user"""
    cursor = db.analysis_history.find(
        {"user_id": user_id}
    ).sort("analysis_date", -1).limit(limit)
    return await cursor.to_list(length=limit)

async def get_user_by_id(user_id: str):
    """Get user by ID"""
    return await db.users.find_one({"_id": ObjectId(user_id)}) 