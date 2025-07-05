#!/usr/bin/env python3
"""
Utility script to properly encode MongoDB URLs for Railway deployment
"""

from urllib.parse import quote_plus, urlparse
import os

def encode_mongodb_url(url):
    """Encode username and password in MongoDB URL"""
    if not url or "@" not in url:
        return url
    
    try:
        parsed = urlparse(url)
        if parsed.username and parsed.password:
            encoded_username = quote_plus(parsed.username)
            encoded_password = quote_plus(parsed.password)
            
            # Rebuild the URL with encoded credentials
            encoded_url = url.replace(
                f"{parsed.username}:{parsed.password}@",
                f"{encoded_username}:{encoded_password}@"
            )
            return encoded_url
    except Exception as e:
        print(f"Error encoding URL: {e}")
    
    return url

def main():
    print("MongoDB URL Encoder for Railway")
    print("=" * 40)
    
    # Check if MONGODB_URL is set
    mongodb_url = os.getenv("MONGODB_URL")
    
    if mongodb_url:
        print(f"Current MONGODB_URL: {mongodb_url}")
        encoded_url = encode_mongodb_url(mongodb_url)
        
        if encoded_url != mongodb_url:
            print(f"\nEncoded MONGODB_URL: {encoded_url}")
            print("\nUse this encoded URL in your Railway environment variables!")
        else:
            print("\nURL is already properly encoded or doesn't need encoding.")
    else:
        print("MONGODB_URL environment variable not set.")
        print("\nTo encode a URL manually, run:")
        print("python encode_mongodb_url.py 'your_mongodb_url_here'")
        
        if len(sys.argv) > 1:
            url = sys.argv[1]
            print(f"\nEncoding: {url}")
            encoded = encode_mongodb_url(url)
            print(f"Encoded: {encoded}")

if __name__ == "__main__":
    import sys
    main() 