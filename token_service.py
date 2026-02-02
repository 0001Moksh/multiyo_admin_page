import os
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv('.env')

class TokenService:
    """Service for JWT token generation and validation"""
    
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
        self.algorithm = 'HS256'
        self.expiration_hours = 24  # Token expires in 24 hours
    
    def generate_token(self, email):
        """Generate JWT token for authenticated admin"""
        try:
            payload = {
                'email': email,
                'iat': datetime.utcnow(),
                'exp': datetime.utcnow() + timedelta(hours=self.expiration_hours)
            }
            token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
            return token
        except Exception as e:
            print(f"Error generating token: {str(e)}")
            return None
    
    def verify_token(self, token):
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return {
                'valid': True,
                'email': payload.get('email'),
                'payload': payload
            }
        except jwt.ExpiredSignatureError:
            return {
                'valid': False,
                'error': 'Token has expired'
            }
        except jwt.InvalidTokenError:
            return {
                'valid': False,
                'error': 'Invalid token'
            }
        except Exception as e:
            return {
                'valid': False,
                'error': str(e)
            }
    
    def decode_token(self, token):
        """Decode token without verification (for debugging)"""
        try:
            return jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
        except:
            return None

# Create singleton instance
token_service = TokenService()
