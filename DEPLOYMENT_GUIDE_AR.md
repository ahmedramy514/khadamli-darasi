# دليل نشر خدملي دراسي على الإنترنت 🚀

## الخطوة 1️⃣: إعداد MongoDB Atlas (قاعدة البيانات السحابية)

### 1.1 إنشاء حساب MongoDB Atlas
1. اذهب إلى: https://www.mongodb.com/cloud/atlas
2. اضغط **"Sign Up Free"**
3. أنشئ حسابًا (استخدم بريدك الإلكتروني)
4. تحقق من بريدك وأكمل التسجيل

### 1.2 إنشاء مشروع وكلستر
1. بعد تسجيل الدخول، اضغط **"Create a Project"**
2. أسم المشروع: `khadamli-darasi`
3. اضغط **"Create Project"**
4. اضغط **"Create a Cluster"**
5. اختر:
   - **Shared** (مجاني)
   - Region: **AWS** و **eu-west-1** (أو أقرب منطقة إليك)
6. اضغط **"Create Cluster"**
7. انتظر 3-5 دقائق حتى ينتهي الإنشاء

### 1.3 إنشاء مستخدم قاعدة البيانات
1. في لوحة التحكم، اضغط **"Database Access"** من القائمة اليسرى
2. اضغط **"Add New Database User"**
3. ملأ البيانات:
   - **Username**: `khadamli_user`
   - **Password**: أنشئ كلمة مرور قوية (احفظها!)
   - **Autogenerate Secure Password** (اختياري)
4. اضغط **"Add User"**

### 1.4 الحصول على رابط الاتصال (Connection String)
1. اضغط **"Clusters"** من القائمة اليسرى
2. اضغط زر **"Connect"** على الكلستر الذي أنشأته
3. اختر **"Connect your application"**
4. اختر:
   - **Driver**: Node.js
   - **Version**: 5.0 or later
5. انسخ رابط الاتصال الكامل (يبدو هكذا):
```
mongodb+srv://khadamli_user:<password>@cluster0.xxxxx.mongodb.net/khadamli_darasi?retryWrites=true&w=majority
```
6. **استبدل `<password>` بكلمة المرور التي أنشأتها**

### 1.5 السماح بالاتصالات من أي IP (للتطوير)
1. اضغط **"Network Access"** من القائمة اليسرى
2. اضغط **"Add IP Address"**
3. اختر **"Allow Access from Anywhere"** (0.0.0.0/0)
4. اضغط **"Confirm"**
⚠️ **ملاحظة**: هذا آمن للتطوير، لكن في الإنتاج اقصر IP الوصول

---

## الخطوة 2️⃣: تحديث Backend للإنتاج

### 2.1 تحديث `backend/.env`
افتح `backend/.env` وغيّر:

```env
# استبدل الجزء الأول بـ MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://khadamli_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/khadamli_darasi?retryWrites=true&w=majority

# استخدم كلمة سرية قوية جداً للإنتاج
JWT_SECRET=your_super_secret_jwt_key_change_in_production_use_random_string_12345!@#$%

# تعطيل قاعدة البيانات في الذاكرة للإنتاج
USE_IN_MEMORY_DB=false

# الوضع الإنتاجي
NODE_ENV=production

# المنفذ (سيُعيّن بواسطة Render تلقائياً)
PORT=8080
```

### 2.2 حفظ الملف
اضغط `Ctrl+S` لحفظ الملف.

---

## الخطوة 3️⃣: نشر Backend على Render

### 3.1 إنشاء حساب Render
1. اذهب إلى: https://render.com
2. اضغط **"Sign up with GitHub"** أو **"Email"**
3. أكمل التسجيل

### 3.2 تحضير Git Repository
تأكد من أن المشروع في مستودع Git:

```powershell
cd "D:\خدملي دراسي"
git init
git add .
git commit -m "Initial commit: khadamli darasi app"
git remote add origin https://github.com/YOUR_USERNAME/khadamli-darasi.git
git branch -M main
git push -u origin main
```

(استبدل `YOUR_USERNAME` باسم حسابك على GitHub)

### 3.3 نشر Backend على Render
1. في Render، اضغط **"New +"** من القائمة العلوية
2. اختر **"Web Service"**
3. اختر **"Deploy from a git repository"**
4. اتصل بـ GitHub (إذا لم تكن متصلاً)
5. اختر مستودعك `khadamli-darasi`
6. ملأ البيانات:
   - **Name**: `khadamli-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install --prefix backend`
   - **Start Command**: `node backend/server.js`
   - **Root Directory**: `.` (اتركها فارغة)

7. أضف متغيرات البيئة (اضغط **"Add Environment Variable"**):
   ```
   MONGODB_URI=mongodb+srv://khadamli_user:PASSWORD@cluster0.xxxxx.mongodb.net/khadamli_darasi?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_key_here
   NODE_ENV=production
   USE_IN_MEMORY_DB=false
   ```

8. اضغط **"Deploy"**
9. انتظر 5-10 دقائق حتى ينتهي النشر
10. بعد النجاح، ستحصل على رابط مثل: `https://khadamli-backend.onrender.com`

### 3.4 اختبر Backend على Render
افتح في المتصفح:
```
https://khadamli-backend.onrender.com/api/auth/register
```
يجب أن تحصل على خطأ 405 (Method Not Allowed) — هذا طبيعي لأنه يتوقع POST.

---

## الخطوة 4️⃣: نشر Frontend على Vercel

### 4.1 تحديث `frontend/.env`
افتح `frontend/.env`:

```env
REACT_APP_API_URL=https://khadamli-backend.onrender.com/api
```

(استبدل الرابط برابط backend الفعلي من Render)

### 4.2 حفظ وإرسال إلى GitHub
```powershell
git add .
git commit -m "Update frontend API URL for production"
git push
```

### 4.3 نشر Frontend على Vercel
1. اذهب إلى: https://vercel.com
2. اضغط **"Sign Up"** وربط حسابك مع GitHub
3. اضغط **"Import Project"**
4. اختر مستودعك `khadamli-darasi`
5. ملأ البيانات:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`

6. أضف متغيرات البيئة:
   ```
   REACT_APP_API_URL=https://khadamli-backend.onrender.com/api
   ```

7. اضغط **"Deploy"**
8. انتظر 3-5 دقائق
9. بعد النجاح، ستحصل على رابط مثل: `https://khadamli-darasi.vercel.app`

---

## الخطوة 5️⃣: اختبار التطبيق المنشور

1. افتح في المتصفح: `https://khadamli-darasi.vercel.app`
2. اختبر التسجيل (Sign Up):
   - أسم: Test User
   - بريد: test@example.com
   - كلمة مرور: 12345678
   - مدرسة: Test School
3. حاول تسجيل الدخول (Sign In) بنفس البيانات
4. تحقق من أن البيانات تُحفظ في MongoDB Atlas

---

## الخطوة 6️⃣: إعدادات إضافية (اختياري)

### 6.1 إضافة نطاق مخصص (Custom Domain)
في Vercel:
1. اذهب إلى **Settings** > **Domains**
2. أضف نطاقك المخصص (مثل: `app.khadamli.com`)
3. اتبع التعليمات

### 6.2 تفعيل HTTPS
- Vercel و Render يفعّلان HTTPS تلقائياً

### 6.3 سياسة CORS
تأكد من أن CORS في `backend/server.js` يسمح بـ Vercel domain:

```javascript
app.use(cors({
  origin: ['https://khadamli-darasi.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

---

## الخطوة 7️⃣: رصد الأخطاء والسجلات

### عرض سجلات Backend (Render):
1. في Render، افتح web service
2. اضغط **"Logs"**
3. شاهد الأخطاء في الوقت الفعلي

### عرض سجلات Frontend (Vercel):
1. في Vercel، افتح المشروع
2. اضغط **"Deployments"**
3. اضغط على آخر deployment
4. شاهد السجلات

---

## 🎉 انتهى النشر!

**روابطك:**
- **Frontend**: https://khadamli-darasi.vercel.app
- **Backend API**: https://khadamli-backend.onrender.com
- **Database**: MongoDB Atlas (كلستر مجاني)

---

## نصائح مهمة ⚠️

1. **الأمان**: غيّر كل كلمات السر والمفاتيح السرية في الإنتاج
2. **النسخ الاحتياطية**: Render يوفر backup تلقائي
3. **المراقبة**: راقب سجلات الأخطاء بانتظام
4. **التحديثات**: عدّل الكود محلياً، ثم ادفع إلى GitHub، وستُنشر تلقائياً

---

## مشاكل شائعة وحلولها

### المشكلة: "Cannot connect to database"
**الحل**:
- تحقق من MONGODB_URI في Render environment variables
- تأكد من إضافة IP في MongoDB Atlas Network Access

### المشكلة: "Frontend can't reach backend"
**الحل**:
- تأكد من REACT_APP_API_URL في Vercel
- افتح Network tab في DevTools وتحقق من الرابط

### المشكلة: "Slow startup on Render"
**الحل**:
- هذا طبيعي (cold start)
- قم بزيارة الرابط مرتين لتجنب التأخير

---

**هل تريد مساعدة في أي خطوة؟ أخبرني!** 🙌
