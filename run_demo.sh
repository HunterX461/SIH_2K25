#!/bin/bash

# Demo Runner Script for Tourist Safety System
# This script starts the backend server and seeds demo data

echo "=========================================="
echo "Tourist Safety System - Demo Mode"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -d "geofencing_module" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing Python dependencies..."
cd geofencing_module

# Install required packages
pip3 install -q fastapi uvicorn sqlalchemy pydantic python-jose passlib[bcrypt] python-multipart email-validator 2>/dev/null

if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Some packages might not have installed correctly"
fi

echo ""
echo "🌱 Seeding demo data..."
python3 demo_seed.py

echo ""
echo "🚀 Starting backend server..."
echo ""
echo "Demo Credentials:"
echo "  📧 john@demo.com / demo123"
echo "  📧 maria@demo.com / demo123"
echo "  📧 chen@demo.com / demo123"
echo ""
echo "API will be available at: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "=========================================="
echo ""

# Start the server
python3 -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
