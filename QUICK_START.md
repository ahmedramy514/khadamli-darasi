# 🚀 دليل البدء السريع - Khadamli Darasi

## ✅ المتطلبات الأساسية

قبل البدء، تأكد من تثبيت:
- **Node.js** (v14+) - [تحميل](https://nodejs.org/)
- **MongoDB** - [تحميل](https://www.mongodb.com/try/download/community) أو استخدم [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [تحميل](https://git-scm.com/)

## 📥 التثبيت

### الخطوة 1: استنساخ المشروع
```bash
git clone https://github.com/your-username/khadamli-darasi.git
cd khadamli-darasi
```

### الخطوة 2: إعداد Backend

```bash
cd backend

# تثبيت المكتبات
npm install

# إنشاء ملف .env من .env.example
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env

# عدّل ملف .env وأدخل:
# MONGODB_URI=mongodb://localhost:27017/khadamli_darasi
# JWT_SECRET=your_super_secret_key_here
# PORT=5000
```

**تشغيل MongoDB محلياً:**

اذا كان لديك MongoDB مثبت:
```bash
# Windows
mongod

# Linux/Mac
mongod
```

أو استخدم MongoDB Atlas (سحابة):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/khadamli_darasi?retryWrites=true&w=majority
```

```bash
# تشغيل الخادم
npm run dev
```

ستشاهد:
```
✅ MongoDB متصل
🚀 الخادم يعمل على المنفذ 5000
```

### الخطوة 3: إعداد Frontend

في نافذة terminal جديدة:

```bash
cd frontend

# تثبيت المكتبات
npm install

# تشغيل التطبيق
npm start
```

التطبيق سيفتح تلقائياً على:
```
http://localhost:3000
```

## ✨ الاختبار الأول

1. **اذهب لـ** http://localhost:3000
2. **انقر على** "إنشاء حساب جديد"
3. **املأ البيانات:**
   - الاسم: أحمد محمد
   - البريد: ahmed@example.com
   - كلمة المرور: 123456
   - المدرسة: مدرسة النيل
   - النوع: طالب
4. **انقر** "إنشاء الحساب"
5. 🎉 تم! أنت الآن مسجل!

## 📋 العمليات الأساسية

### إنشاء فصل دراسي (للمدرسين)

**من الـ Backend (استخدم Postman):**

```http
POST http://localhost:5000/api/classrooms
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "الرياضيات - الفصل الأول",
  "description": "فصل الرياضيات للسنة الأولى",
  "subject": "رياضيات"
}
```

**الرد:**
```json
{
  "message": "تم إنشاء الفصل بنجاح",
  "classroom": {
    "_id": "63faf4c...",
    "code": "ABC12345",
    "name": "الرياضيات - الفصل الأول"
  }
}
```

### الانضمام لفصل (للطلاب)

```http
POST http://localhost:5000/api/classrooms/join/ABC12345
Authorization: Bearer {token}
```

### رفع سؤال جديد

```http
POST http://localhost:5000/api/questions
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "كيفية حل المعادلات التربيعية",
  "description": "ما هي الخطوات الصحيحة لحل المعادلات؟",
  "classroomId": "63faf4c...",
  "subject": "رياضيات"
}
```

### الإجابة على سؤال

```http
POST http://localhost:5000/api/questions/63faf4c.../answer
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "الخطوة الأولى هي تطبيق الصيغة العامة..."
}
```

✅ ستحصل على **10 نقاط** عند الإجابة!

## 🛠️ أدوات مفيدة

### Postman - لاختبار API
[تحميل Postman](https://www.postman.com/downloads/)

### MongoDB Compass - لمشاهدة البيانات
[تحميل Compass](https://www.mongodb.com/products/tools/compass)

### VS Code Extensions الموصى بها
- REST Client - لاختبار API بسهولة
- ES7+ React/Redux - لـ React
- Prettier - لتنسيق الكود

## 🐛 حل المشاكل الشائعة

### ❌ خطأ: "Cannot find module 'express'"
```bash
npm install
```

### ❌ خطأ: "MongoDB connection refused"
```bash
# تأكد من تشغيل MongoDB
mongod

# أو عدّل MONGODB_URI في .env
```

### ❌ خطأ: "Port 5000 already in use"
```bash
# غيّر PORT في .env
PORT=5001
```

### ❌ خطأ: "Port 3000 already in use"
```bash
# في frontend
PORT=3001 npm start
```

## 📚 الموارد الإضافية

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🎯 الخطوات التالية

بعد الإعداد الناجح:

1. ✅ جرّب إنشاء فصل دراسي
2. ✅ جرّب الانضمام لفصل برمز
3. ✅ رفع سؤال اختباري
4. ✅ أجب على السؤال
5. ✅ شاهد النقاط تتزايد في الملف الشخصي

## 💡 نصائح مهمة

- **قبل Commit:** تأكد من عدم مشاركة `.env` (موجود في `.gitignore`)
- **الأمان:** غيّر `JWT_SECRET` إلى قيمة آمنة عشوائية
- **الإنتاج:** استخدم متغيرات البيئة من خادم الإنتاج

## ❓ أسئلة أو مشاكل؟

افتح Issue على GitHub أو تواصل معنا! 💬

---

**استمتع بتطوير خدملي دراسي! 🎓**
