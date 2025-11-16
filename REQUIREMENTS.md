# 📋 متطلبات المشروع - Requirements

## 🖥️ متطلبات النظام

### الحد الأدنى:
- **CPU:** Intel i5 أو ما يعادله
- **RAM:** 4GB
- **Storage:** 2GB
- **OS:** Windows 10+ / macOS 10.14+ / Linux

### الموصى به:
- **CPU:** Intel i7 أو ما يعادله
- **RAM:** 8GB
- **Storage:** 10GB
- **OS:** Windows 11 / macOS 12+ / Linux (Ubuntu 20.04+)

---

## 📦 البرامج المطلوبة

### إلزامية:

#### 1. Node.js + npm
- **الإصدار:** v14.0.0 أو أحدث
- **التحميل:** https://nodejs.org/
- **التحقق:**
  ```bash
  node --version
  npm --version
  ```

#### 2. MongoDB
**اختر أحد الخيارين:**

**أ) محلي:**
- **التحميل:** https://www.mongodb.com/try/download/community
- **التشغيل:**
  ```bash
  mongod
  ```

**ب) سحابة (موصى به):**
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **مجاني:** 512MB

#### 3. Git
- **التحميل:** https://git-scm.com/
- **التحقق:**
  ```bash
  git --version
  ```

---

## 🛠️ أدوات اختيارية (إضافية)

### لتحسين الإنتاجية:

| الأداة | الغرض | الرابط |
|------|--------|--------|
| **Postman** | اختبار API | https://www.postman.com/downloads/ |
| **MongoDB Compass** | إدارة البيانات | https://www.mongodb.com/products/tools/compass |
| **VS Code** | محرر الأكواد | https://code.visualstudio.com/ |
| **DBeaver** | Database UI | https://dbeaver.io/ |
| **Insomnia** | REST Client | https://insomnia.rest/ |

### VS Code Extensions الموصى بها:

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-vscode.cpptools",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ritwickdey.liveserver",
    "dsznajder.es7-react-js-snippets",
    "ms-azuretools.vscode-docker"
  ]
}
```

---

## 🌐 المكتبات المطلوبة

### Backend (Node.js)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "multer": "^1.4.5-lts.1",
    "express-validator": "^7.0.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

**التثبيت:**
```bash
cd backend
npm install
```

### Frontend (React)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.3.0",
    "tailwindcss": "^3.2.4"
  },
  "devDependencies": {
    "react-scripts": "5.0.1"
  }
}
```

**التثبيت:**
```bash
cd frontend
npm install
```

---

## 🌍 متطلبات الإنترنت

### أثناء التطوير:
- **السرعة:** 5 Mbps
- **الكمون:** < 100ms
- **الاستقرار:** اتصال مستقر

### للنشر:
- **استضافة Frontend:** Netlify / Vercel
- **استضافة Backend:** Railway / Heroku / DigitalOcean
- **قاعدة البيانات:** MongoDB Atlas

---

## 💾 مساحة التخزين المطلوبة

| المكون | الحجم |
|------|-------|
| Node.js | ~150 MB |
| npm packages (Backend) | ~300 MB |
| npm packages (Frontend) | ~800 MB |
| MongoDB (محلي) | ~300 MB |
| Project code | ~50 MB |
| **المجموع الكلي** | **~1.6 GB** |

---

## 🔐 متطلبات الأمان

### البيئة الإنتاجية:

- [ ] **HTTPS:** استخدام SSL/TLS
- [ ] **JWT_SECRET:** مفتاح سري قوي (32+ حرف)
- [ ] **CORS:** مقيّد على الـ domains المسموحة
- [ ] **Environment Variables:** استخدام .env
- [ ] **Database Backups:** نسخ احتياطية دورية
- [ ] **Firewall:** حماية الخادم

---

## 🖧 متطلبات الشبكة

### المنافذ المستخدمة:

| الخدمة | المنفذ | الحالة |
|------|--------|--------|
| Frontend | 3000 | localhost |
| Backend | 5000 | localhost |
| MongoDB | 27017 | localhost |

### إذا كانت المنافذ مشغولة:

```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :3000
lsof -i :5000
```

---

## 🔧 الإعدادات المقترحة

### .env (Backend)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/khadamli_darasi

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-key-here-min-32-characters

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (اختياري)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=5242880 # 5MB
```

---

## ✅ قائمة الفحص النهائية

قبل البدء:

- [ ] تثبيت Node.js و npm
- [ ] تثبيت MongoDB (محلي أو Atlas)
- [ ] تثبيت Git
- [ ] تثبيت محرر أكواد (VS Code مثلاً)
- [ ] توفر اتصال إنترنت مستقر
- [ ] 2GB مساحة فارغة على القرص
- [ ] إنشاء مجلد للمشروع
- [ ] استنساخ الـ Repository

---

## 🚀 خطوات البدء السريع

```bash
# 1. استنساخ المشروع
git clone https://github.com/your-username/khadamli-darasi.git
cd khadamli-darasi

# 2. إعداد Backend
cd backend
npm install
cp .env.example .env
# عدّل .env

# 3. إعداد Frontend
cd ../frontend
npm install

# 4. التشغيل
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm start
```

---

## 📞 الدعم الفني

إذا واجهت مشاكل:

1. **تحقق من الـ Logs:**
   ```bash
   # في Terminal حيث تشغيل الخادم
   ```

2. **أعد تثبيت المكتبات:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **امسح الـ Cache:**
   ```bash
   npm cache clean --force
   ```

4. **اتصل بنا:**
   - GitHub Issues
   - البريد الإلكتروني
   - Discord/Telegram

---

## 📚 الموارد الإضافية

- [Node.js Docs](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**🎉 أنت الآن جاهز للبدء! Happy Coding! 🚀**
