#!/usr/bin/env python3
"""
Script to find the correct Railway backend URL
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

def test_railway_urls():
    """Test common Railway URL patterns"""
    
    # Common Railway URL patterns
    possible_urls = [
        "https://dna-analysis-app-production.up.railway.app",
        "https://dna-analysis-app.up.railway.app", 
        "https://dna-analysis-backend.up.railway.app",
        "https://dna-analysis-app-1ctu.up.railway.app",
        "https://dna-analysis-backend-production.up.railway.app"
    ]
    
    print("Testing possible Railway backend URLs...")
    print("=" * 60)
    
    working_urls = []
    
    for url in possible_urls:
        print(f"\nTesting: {url}")
        try:
            response = requests.get(f"{url}/health", timeout=10)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"✅ WORKING! Response: {data}")
                    working_urls.append(url)
                except:
                    print(f"⚠️  Status 200 but not JSON: {response.text[:100]}")
            else:
                print(f"❌ Not working (status {response.status_code})")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Connection failed: {e}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print(f"\n{'='*60}")
    print("RESULTS")
    print(f"{'='*60}")
    
    if working_urls:
        print("✅ Working Railway URLs found:")
        for url in working_urls:
            print(f"  - {url}")
        print(f"\nUse one of these URLs as your VITE_API_URL in Vercel!")
    else:
        print("❌ No working Railway URLs found.")
        print("\nYou need to:")
        print("1. Check your Railway dashboard for the correct URL")
        print("2. Make sure your Railway app is deployed and running")
        print("3. Update VITE_API_URL in Vercel with the correct Railway URL")

if __name__ == "__main__":
    test_railway_urls() 