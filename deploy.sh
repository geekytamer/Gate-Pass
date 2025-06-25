#!/bin/bash

set -e

echo "📥 Pulling latest code..."
git pull origin main || { echo "❌ Git pull failed"; exit 1; }

echo "📦 Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt

echo "🧱 Building React frontend..."
cd frontend
npm install
npm run build || { echo "❌ React build failed"; exit 1; }

echo "🧹 Cleaning up old build from Nginx directory..."
sudo rm -rf /var/www/gatepass/*

echo "📁 Copying new build to Nginx directory..."
sudo cp -r build/* /var/www/gatepass/

cd ..

echo "🚀 Restarting FastAPI systemd service..."
sudo systemctl restart gatepass.service

echo "✅ Deployment complete and live at Nginx site."