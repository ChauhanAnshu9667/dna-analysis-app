#!/usr/bin/env python3
"""
Debug script to test backend responses and identify JSON parsing issues
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

def test_backend_response():
    """Test various backend endpoints to identify response issues"""
    
    # Get the backend URL from environment or use default
    backend_url = os.getenv("VITE_API_URL", "http://localhost:8000")
    print(f"Testing backend at: {backend_url}")
    
    # Test 1: Health check endpoint
    print("\n1. Testing /health endpoint...")
    try:
        response = requests.get(f"{backend_url}/health")
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Content-Type: {response.headers.get('content-type', 'Not set')}")
        print(f"Response text: {response.text}")
        
        if response.headers.get('content-type', '').startswith('application/json'):
            try:
                data = response.json()
                print(f"JSON parsed successfully: {data}")
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
        else:
            print("Response is not JSON")
            
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 2: Available traits endpoint
    print("\n2. Testing /available-traits endpoint...")
    try:
        response = requests.get(f"{backend_url}/available-traits")
        print(f"Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'Not set')}")
        print(f"Response length: {len(response.text)}")
        
        if response.headers.get('content-type', '').startswith('application/json'):
            try:
                data = response.json()
                print(f"JSON parsed successfully, got {len(data)} traits")
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                print(f"Response preview: {response.text[:200]}...")
        else:
            print("Response is not JSON")
            
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 3: Test login endpoint (without credentials)
    print("\n3. Testing /token endpoint (should fail with 422)...")
    try:
        response = requests.post(f"{backend_url}/token")
        print(f"Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'Not set')}")
        print(f"Response text: {response.text}")
        
        if response.headers.get('content-type', '').startswith('application/json'):
            try:
                data = response.json()
                print(f"JSON parsed successfully: {data}")
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
        else:
            print("Response is not JSON")
            
    except Exception as e:
        print(f"Error: {e}")

def test_cors_headers():
    """Test CORS headers"""
    print("\n4. Testing CORS headers...")
    backend_url = os.getenv("VITE_API_URL", "http://localhost:8000")
    
    try:
        response = requests.options(f"{backend_url}/health")
        print(f"OPTIONS request status: {response.status_code}")
        print(f"CORS headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"  {header}: {value}")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Backend Response Debug Tool")
    print("=" * 50)
    
    test_backend_response()
    test_cors_headers()
    
    print("\n" + "=" * 50)
    print("Debug complete!") 