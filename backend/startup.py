#!/usr/bin/env python3
"""
Startup script for Railway deployment with better error handling
"""

import os
import sys
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_environment():
    """Check if required environment variables are set"""
    logger.info("Checking environment variables...")
    
    required_vars = ['MONGODB_URL', 'SECRET_KEY']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        logger.warning(f"Missing environment variables: {missing_vars}")
        return False
    
    logger.info("Environment variables check passed")
    return True

def check_dependencies():
    """Check if all required dependencies are available"""
    logger.info("Checking dependencies...")
    
    try:
        import fastapi
        logger.info(f"FastAPI version: {fastapi.__version__}")
    except ImportError as e:
        logger.error(f"FastAPI import failed: {e}")
        return False
    
    try:
        import uvicorn
        logger.info(f"Uvicorn version: {uvicorn.__version__}")
    except ImportError as e:
        logger.error(f"Uvicorn import failed: {e}")
        return False
    
    try:
        import motor
        logger.info(f"Motor version: {motor.__version__}")
    except ImportError as e:
        logger.error(f"Motor import failed: {e}")
        return False
    
    try:
        import pymongo
        logger.info(f"PyMongo version: {pymongo.__version__}")
    except ImportError as e:
        logger.error(f"PyMongo import failed: {e}")
        return False
    
    logger.info("Dependencies check passed")
    return True

def test_database_connection():
    """Test database connection"""
    logger.info("Testing database connection...")
    
    try:
        from database import db, MOTOR_AVAILABLE
        if not MOTOR_AVAILABLE:
            logger.error("Motor is not available")
            return False
        
        if not db:
            logger.error("Database object is None")
            return False
        
        # Try a simple operation
        # Note: This is async, so we can't actually test it here
        # but we can check if the objects are properly initialized
        logger.info("Database objects initialized successfully")
        return True
        
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False

def main():
    """Main startup function"""
    logger.info("Starting backend application...")
    
    # Load environment variables
    load_dotenv()
    
    # Check environment
    if not check_environment():
        logger.warning("Environment check failed, but continuing...")
    
    # Check dependencies
    if not check_dependencies():
        logger.error("Dependencies check failed")
        sys.exit(1)
    
    # Test database connection
    if not test_database_connection():
        logger.error("Database connection test failed")
        sys.exit(1)
    
    logger.info("All startup checks passed!")
    
    # Import and run the main application
    try:
        from main import app
        logger.info("Main application imported successfully")
        
        # Get port from environment
        port = int(os.getenv("PORT", 8080))
        logger.info(f"Starting server on port {port}")
        
        # Start the server
        import uvicorn
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=port,
            log_level="info"
        )
        
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 