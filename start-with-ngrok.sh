#!/bin/bash
echo "🚀 Starting CV Tailoring Application with ngrok..."

echo ""
echo "📋 Instructions:"
echo "1. First, start your application: npm run dev"
echo "2. Wait for it to start on http://localhost:5000"  
echo "3. In another terminal, run: ngrok http 5000"
echo "4. Copy the ngrok URL to share your app publicly"

echo ""
echo "🔧 If ngrok is not installed:"
echo "1. Download from: https://ngrok.com/download"
echo "2. Or install via: npm install -g ngrok"

echo ""
echo "🌐 Installing ngrok locally in this project..."
npm install ngrok --save-dev

if [ $? -ne 0 ]; then
    echo "❌ Failed to install ngrok locally"
    echo "💡 Try: npm install -g ngrok"
    exit 1
fi

echo ""
echo "✅ ngrok installed locally!"
echo "🚀 To start your app with ngrok:"
echo ""
echo "1. Run in Terminal 1: npm run dev"
echo "2. Run in Terminal 2: npx ngrok http 5000"
echo ""
echo "📱 The ngrok URL will work on any device with internet!"
