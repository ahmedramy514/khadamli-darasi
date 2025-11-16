#!/bin/bash

# 🚀 سكريبت تثبيت سريع - Installation Script
# استخدم: bash install.sh

echo "🎓 مرحباً بك في خدملي دراسي!"
echo "================================"

# تحقق من وجود Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت!"
    echo "🔗 حمّله من https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js مثبت: $(node -v)"

# تحقق من MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB غير مثبت محلياً"
    echo "💡 يمكنك استخدام MongoDB Atlas (سحابة)"
    echo "🔗 https://www.mongodb.com/cloud/atlas"
fi

# إعداد Backend
echo ""
echo "📦 إعداد Backend..."
cd backend
npm install
cp .env.example .env

echo "✏️  قم بتعديل ملف backend/.env وأضف:"
echo "MONGODB_URI=mongodb://localhost:27017/khadamli_darasi"
echo "JWT_SECRET=your_secret_key_here"
echo "PORT=5000"

# إعداد Frontend
echo ""
echo "📦 إعداد Frontend..."
cd ../frontend
npm install

echo ""
echo "✅ التثبيت اكتمل بنجاح!"
echo ""
echo "🚀 لتشغيل المشروع:"
echo "==================================="
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm start"
echo ""
echo "ثم افتح: http://localhost:3000"
echo "==================================="
