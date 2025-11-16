# 📋 صيانة المشروع - Maintenance Guide

## ✅ Checklist قبل الـ Deployment

- [ ] تحديث جميع المكتبات (`npm update`)
- [ ] تشغيل الـ Tests (عند توفرها)
- [ ] التحقق من عدم وجود أخطاء في الكونسول
- [ ] اختبار جميع الـ APIs بـ Postman
- [ ] التأكد من إغلاق الـ Console logs في الكود الإنتاجي
- [ ] تحديث ملف .env للإنتاج
- [ ] إنشاء نسخة احتياطية من MongoDB
- [ ] اختبار على أجهزة مختلفة

## 🐛 معالجة الأخطاء الشائعة

### خطأ: CORS Error
**المشكلة:** 
```
Access to XMLHttpRequest from origin 'localhost:3000' has been blocked
```

**الحل:**
```javascript
// في backend/server.js
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}));
```

### خطأ: Token Expired
**المشكلة:** 
```
401 Unauthorized
```

**الحل:**
```javascript
// في frontend/src/api.js
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### خطأ: Connection Refused MongoDB
**المشكلة:**
```
MongoError: connect ECONNREFUSED 127.0.0.1:27017
```

**الحل:**
- تأكد من تشغيل `mongod`
- أو استخدم MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

## 📊 Monitoring والـ Logging

### إضافة Logging بسيط

```javascript
// backend/server.js
const fs = require('fs');

const logRequest = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

app.use(logRequest);
```

### إضافة Error Tracking

```javascript
// استخدام Sentry (اختياري)
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN
});

app.use(Sentry.Handlers.errorHandler());
```

## 🔐 أمان المشروع

### Best Practices

1. **حماية البيانات الحساسة:**
```javascript
// ✅ صحيح
if (!this.isModified('password')) return next();
const salt = await bcrypt.genSalt(10);
this.password = await bcrypt.hash(this.password, salt);

// ❌ خطأ
this.password = password; // لا تخزن كلمات المرور بدون تشفير!
```

2. **التحقق من المدخلات:**
```javascript
const { validationResult } = require('express-validator');

router.post('/', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
});
```

3. **تجنب SQL Injection (لا ينطبق هنا لكن مهم):**
```javascript
// ✅ صحيح - استخدام Mongoose
User.findOne({ email: userEmail })

// ❌ خطأ - لا تستخدم string interpolation
db.query(`SELECT * FROM users WHERE email = '${email}'`)
```

## 🧪 الاختبار (Testing) - للمستقبل

### إضافة Jest للـ Backend
```bash
npm install --save-dev jest supertest
```

```javascript
// backend/__tests__/auth.test.js
const request = require('supertest');
const app = require('../server');

describe('Authentication', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  });
});
```

## 📈 الأداء (Performance)

### تحسينات الـ Frontend

1. **Code Splitting:**
```javascript
import React, { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Home />
    </Suspense>
  );
}
```

2. **Memoization:**
```javascript
const Navbar = React.memo(({ activeTab, setActiveTab }) => {
  // ...
});

export default Navbar;
```

### تحسينات الـ Backend

1. **Pagination:**
```javascript
router.get('/leaderboard', async (req, res) => {
  const page = req.query.page || 1;
  const limit = 20;
  const skip = (page - 1) * limit;
  
  const users = await User.find()
    .skip(skip)
    .limit(limit)
    .sort({ points: -1 });
  
  res.json(users);
});
```

2. **Caching:**
```javascript
// استخدام Redis للـ cache
const cache = require('redis').createClient();

router.get('/classrooms', async (req, res) => {
  const cached = await cache.get(`classrooms:${userId}`);
  if (cached) return res.json(JSON.parse(cached));
  
  const classrooms = await Classroom.find();
  await cache.setex(`classrooms:${userId}`, 3600, JSON.stringify(classrooms));
  res.json(classrooms);
});
```

## 📚 قاموس الرموز (Emoji Dictionary)

| الرمز | المعنى |
|------|--------|
| 🏠 | الصفحة الرئيسية |
| 🔍 | البحث |
| ➕ | إضافة |
| 💬 | الرسائل |
| 👤 | الحساب الشخصي |
| ❓ | سؤال |
| 📝 | إجابة |
| 🪙 | نقاط |
| 🏅 | ترتيب |
| 📚 | كتاب/مادة |
| ⏰ | موعد آخر |
| 🎓 | تعليم |
| 👨‍🏫 | معلم |
| 📖 | فصل دراسي |

## 🔄 التحديثات الدورية

### كل أسبوع:
- [ ] التحقق من الـ Logs
- [ ] حذف البيانات المحذوفة منطقياً

### كل شهر:
- [ ] تحديث المكتبات
- [ ] مراجعة الأمان
- [ ] نسخ احتياطية

### كل ربع سنة:
- [ ] تحديث MongoDB
- [ ] تنظيف Storage
- [ ] إعادة اختبار كاملة

## 🚀 Deployment Checklist

### قبل الرفع للإنتاج:

```bash
# 1. Build Frontend
cd frontend
npm run build

# 2. Start Backend
cd backend
NODE_ENV=production npm start

# 3. قم برفع البناء على Netlify/Vercel أو خادمك
# 4. استخدم MongoDB Atlas بدلاً من localhost
# 5. حدث CORS origin
# 6. استخدم HTTPS فقط
# 7. حدث JWT_SECRET
```

---

**للمساعدة والدعم الفني، تواصل معنا! 💌**
