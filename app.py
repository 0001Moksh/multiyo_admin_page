import os
import json
import requests
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from werkzeug.utils import secure_filename

# Load environment variables
load_dotenv('.env')

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

@app.route('/api/collections', methods=['GET'])
def get_collections():
    """Get all Shopify collections"""
    try:
        collections = fetch_shopify_collections()
        return jsonify({'collections': collections})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/banners', methods=['GET'])
def get_banners():
    """Get all banners from MongoDB"""
    try:
        if db is None:
            return jsonify({'error': 'Database not connected'}), 500
        
        banners = list(banners_collection.find().sort('createdAt', -1))
        
        # Convert ObjectId to string and prepare response
        for banner in banners:
            banner['_id'] = str(banner['_id'])
        
        return jsonify({'banners': banners})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/banners/upload', methods=['POST'])
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
        
        # Save file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        filename = timestamp + filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Get collection details
        collections = fetch_shopify_collections()
        collection_title = next((c['title'] for c in collections if c['id'] == collection_id), collection_id)
        
        # Save to MongoDB
        banner_doc = {
            'filename': filename,
            'imageUrl': f'http://localhost:5000/uploads/{filename}',
            'collectionId': collection_id,
            'collectionTitle': collection_title,
            'createdAt': datetime.now(),
            'updatedAt': datetime.now()
        }
        
        result = banners_collection.insert_one(banner_doc)
        banner_doc['_id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'Banner uploaded successfully',
            'banner': banner_doc
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/banners/<banner_id>', methods=['DELETE'])
def delete_banner(banner_id):
    """Delete a banner"""
    try:
        if db is None:
            return jsonify({'error': 'Database not connected'}), 500
        
        banner = banners_collection.find_one({'_id': ObjectId(banner_id)})
        
        if not banner:
            return jsonify({'error': 'Banner not found'}), 404
        
        # Delete file
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], banner['filename'])
        if os.path.exists(filepath):
            os.remove(filepath)
        
        # Delete from database
        banners_collection.delete_one({'_id': ObjectId(banner_id)})
        
        return jsonify({'message': 'Banner deleted successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/uploads/<filename>', methods=['GET'])
def uploaded_file(filename):
    """Serve uploaded files"""
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        return jsonify({'error': 'File not found'}), 404

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'database': 'connected' if db else 'disconnected'
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)