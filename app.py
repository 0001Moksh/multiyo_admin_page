import os
import json
import base64
import requests
from datetime import datetime
from functools import wraps
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory, g
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from werkzeug.utils import secure_filename

# Load environment variables
load_dotenv('.env')

# Import authentication services
from auth_service import auth_service
from token_service import token_service

# Flask app setup
app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Shopify Storefront API Configuration
SHOPIFY_DOMAIN = os.getenv('NEXT_PUBLIC_SHOPIFY_DOMAIN') or os.getenv('VITE_SHOPIFY_DOMAIN')
STOREFRONT_TOKEN = os.getenv('NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN') or os.getenv('VITE_SHOPIFY_STOREFRONT_TOKEN')

# MongoDB Configuration
MONGO_URI = os.getenv('MONGO_URI') or os.getenv('MONGO_DB_URL') or 'mongodb://localhost:27017/'
MONGO_DB = os.getenv('MONGO_DB', 'multiyo_admin')

try:
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    mongo_client.admin.command('ping')
    db = mongo_client[MONGO_DB]
    banners_collection = db['banners']
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"MongoDB connection error: {e}")
    db = None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def require_auth(f):
    """Decorator to protect routes - requires valid JWT token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'Missing authorization token'}), 401
        
        try:
            # Expected format: "Bearer <token>"
            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                return jsonify({'error': 'Invalid authorization header format'}), 401
            
            token = parts[1]
            result = token_service.verify_token(token)
            if not result.get('valid'):
                raise Exception(result.get('error', 'Invalid token'))
            g.admin_email = result['email']
            return f(*args, **kwargs)
        
        except Exception as e:
            return jsonify({'error': f'Invalid or expired token: {str(e)}'}), 401
    
    return decorated_function

def fetch_shopify_collections():
    """Fetch collections from Shopify API"""
    if not SHOPIFY_DOMAIN or not STOREFRONT_TOKEN:
        raise ValueError('Missing Shopify Storefront credentials. Set VITE_SHOPIFY_DOMAIN and VITE_SHOPIFY_STOREFRONT_TOKEN in .env.')
    
    url = f"https://{SHOPIFY_DOMAIN}/api/2024-01/graphql.json"
    headers = {
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
        'Content-Type': 'application/json'
    }
    
    query = """
    {
      collections(first: 50) {
        edges {
          node {
            id
            title
            handle
            description
            image {
              url
              altText
            }
            products(first: 250) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
    """
    
    try:
        response = None
        last_error = None
        for attempt in range(2):
            try:
                response = requests.post(url, json={'query': query}, headers=headers, timeout=30)
                response.raise_for_status()
                data = response.json()
                break
            except requests.exceptions.RequestException as e:
                last_error = e
                if attempt == 1:
                    raise
        
        if 'errors' in data:
            print(f"Shopify API errors: {data['errors']}")
            return []
        
        edges = data.get('data', {}).get('collections', {}).get('edges', [])
        collections = []
        
        for edge in edges:
            node = edge['node']
            collections.append({
                'id': node['id'],
                'title': node['title'],
                'handle': node['handle'],
                'description': node.get('description', ''),
                'image': node.get('image'),
                'productCount': len(node.get('products', {}).get('edges', []))
            })
        
        return collections
    except Exception as e:
        print(f"Error fetching Shopify collections: {e}")
        raise

# API Routes

# ==================== AUTHENTICATION ROUTES ====================

@app.route('/api/auth/request-otp', methods=['POST'])
def request_otp():
    """Request OTP for admin email"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Check if email is admin
        if not auth_service.is_admin(email):
            # Security: Don't reveal if email is admin or not
            return jsonify({
                'success': False,
                'message': 'This email is not registered as an admin'
            }), 403
        
        try:
            auth_service.send_otp_email(email)
            masked_email = auth_service._mask_email(email)
            
            return jsonify({
                'success': True,
                'message': f'OTP sent to {masked_email}',
                'email': masked_email,
                'expiresIn': 300  # 5 minutes in seconds
            }), 200
        
        except Exception as email_error:
            print(f"Error sending email: {email_error}")
            return jsonify({
                'error': 'Failed to send OTP email. Please try again.',
                'details': str(email_error)
            }), 500
    
    except Exception as e:
        print(f"Error in request_otp: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp():
    """Verify OTP and return JWT token"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        
        if not email or not otp:
            return jsonify({'error': 'Email and OTP are required'}), 400
        
        # Verify OTP
        result = auth_service.verify_otp(email, otp)
        
        if not result.get('success'):
            return jsonify({
                'success': False,
                'message': result.get('message')
            }), 401
        
        # Generate JWT token
        token = token_service.generate_token(email)
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': token,
            'email': email,
            'expiresIn': 86400  # 24 hours in seconds
        }), 200
    
    except Exception as e:
        print(f"Error in verify_otp: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/verify-token', methods=['POST'])
def verify_token():
    """Verify if a token is valid"""
    try:
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'valid': False, 'message': 'No token provided'}), 401
        
        try:
            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                return jsonify({'valid': False, 'message': 'Invalid token format'}), 401
            
            token = parts[1]
            result = token_service.verify_token(token)
            
            if not result.get('valid'):
                return jsonify({'valid': False, 'message': result.get('error')}), 401
            
            return jsonify({
                'valid': True,
                'email': result['email'],
                'expiresAt': result['payload']['exp']
            }), 200
        
        except Exception as e:
            return jsonify({'valid': False, 'message': str(e)}), 401
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== BANNER ROUTES (PROTECTED) ====================

@app.route('/api/collections', methods=['GET'])
@require_auth
def get_collections():
    """Get all Shopify collections"""
    try:
        collections = fetch_shopify_collections()
        return jsonify({'collections': collections})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/banners', methods=['GET'])
@require_auth
def get_banners():
    """Get all banners from MongoDB"""
    try:
        if db is None:
            return jsonify({'error': 'Database not connected'}), 500
        
        banners = list(banners_collection.find().sort('createdAt', -1))
        
        # Convert ObjectId to string and reconstruct image URLs
        for banner in banners:
            banner['_id'] = str(banner['_id'])
            if 'imageData' in banner and 'imageType' in banner:
                banner['imageUrl'] = f"data:image/{banner['imageType']};base64,{banner['imageData']}"
            # Remove raw base64 data from response
            banner.pop('imageData', None)
        
        return jsonify({'banners': banners})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/banners/upload', methods=['POST'])
@require_auth
def upload_banner():
    """Upload a banner image and associate it with a collection"""
    try:
        if db is None:
            return jsonify({'error': 'Database not connected'}), 500
        
        # Check if file exists
        if 'banner' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['banner']
        collection_id = request.form.get('collectionId')
        
        if not collection_id:
            return jsonify({'error': 'Collection ID is required'}), 400
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp'}), 400
        
        # Read file and convert to base64
        file_data = file.read()
        if len(file_data) > MAX_FILE_SIZE:
            return jsonify({'error': 'File size exceeds 5MB limit'}), 400
        
        file_extension = secure_filename(file.filename).rsplit('.', 1)[1].lower()
        image_base64 = base64.b64encode(file_data).decode('utf-8')
        data_url = f"data:image/{file_extension};base64,{image_base64}"
        
        # Get collection details
        collections = fetch_shopify_collections()
        collection_title = next((c['title'] for c in collections if c['id'] == collection_id), collection_id)
        
        # Save to MongoDB
        banner_doc = {
            'imageData': image_base64,
            'imageType': file_extension,
            'collectionId': collection_id,
            'collectionTitle': collection_title,
            'createdAt': datetime.now(),
            'updatedAt': datetime.now()
        }
        
        result = banners_collection.insert_one(banner_doc)
        banner_doc['_id'] = str(result.inserted_id)
        banner_doc['imageUrl'] = data_url
        # Don't send raw base64 back, only the data URL for display
        
        return jsonify({
            'message': 'Banner uploaded successfully',
            'banner': {
                '_id': banner_doc['_id'],
                'imageUrl': data_url,
                'collectionId': banner_doc['collectionId'],
                'collectionTitle': banner_doc['collectionTitle'],
                'createdAt': banner_doc['createdAt'].isoformat(),
                'updatedAt': banner_doc['updatedAt'].isoformat()
            }
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/banners/<banner_id>/replace', methods=['PUT'])
@require_auth
def replace_banner(banner_id):
    """Replace an existing banner"""
    try:
        if db is None:
            return jsonify({'error': 'Database not connected'}), 500
        
        # Check if banner exists
        existing_banner = banners_collection.find_one({'_id': ObjectId(banner_id)})
        if not existing_banner:
            return jsonify({'error': 'Banner not found'}), 404
        
        # Validate file
        if 'banner' not in request.files:
            return jsonify({'error': 'No banner image provided'}), 400
        
        file = request.files['banner']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Get collection ID from request
        collection_id = request.form.get('collectionId')
        if not collection_id:
            return jsonify({'error': 'Collection ID is required'}), 400
        
        # Find collection info from Shopify
        collections = fetch_shopify_collections()
        collection = next((c for c in collections if c['id'] == collection_id), None)
        
        if not collection:
            return jsonify({'error': 'Collection not found'}), 404
        
        # Delete old file if it exists
        old_filename = existing_banner.get('filename')
        if old_filename:
            old_filepath = os.path.join(app.config['UPLOAD_FOLDER'], old_filename)
            if os.path.exists(old_filepath):
                os.remove(old_filepath)
        
        # Save new file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Update banner document
        update_doc = {
            'collectionId': collection['id'],
            'collectionTitle': collection['title'],
            'collectionHandle': collection['handle'],
            'filename': filename,
            'url': f'/uploads/{filename}',
            'updatedAt': datetime.now()
        }
        
        banners_collection.update_one(
            {'_id': ObjectId(banner_id)},
            {'$set': update_doc}
        )
        
        return jsonify({
            'message': 'Banner replaced successfully',
            'banner': {
                '_id': str(existing_banner['_id']),
                **update_doc,
                'createdAt': existing_banner.get('createdAt')
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/banners/<banner_id>', methods=['DELETE'])
@require_auth
def delete_banner(banner_id):
    """Delete a banner"""
    try:
        if db is None:
            return jsonify({'error': 'Database not connected'}), 500
        
        banner = banners_collection.find_one({'_id': ObjectId(banner_id)})
        
        if not banner:
            return jsonify({'error': 'Banner not found'}), 404
        
        # Delete from database
        banners_collection.delete_one({'_id': ObjectId(banner_id)})
        
        return jsonify({'message': 'Banner deleted successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'database': 'connected' if db else 'disconnected'
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)