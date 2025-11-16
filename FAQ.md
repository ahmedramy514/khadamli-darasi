# ❓ الأسئلة الشائعة - FAQ

## 🤔 أسئلة عامة

### س: هل التطبيق مجاني؟
**ج:** نعم! التطبيق مفتوح المصدر تماماً ومتاح للجميع بالمجان.

### س: هل يمكن استخدامه في مدرسة حقيقية؟
**ج:** بالتأكيد! يمكنك نسخ الكود وتعديله حسب احتياجات مدرستك.

### س: ما الفرق بينه وبين Google Classroom؟
**ج:** خدملي دراسي أخف وأسهل، مع نظام نقاط للتحفيز وإمكانية رفع الأسئلة من الطلاب.

---

## 💻 أسئلة تقنية

### س: هل أحتاج لخوادم غالية للـ Hosting؟
**ج:** لا! يمكنك استخدام:
- **Frontend:** Netlify أو Vercel (مجاني)
- **Backend:** Heroku أو Railway (مجاني في الفترة التجريبية)
- **Database:** MongoDB Atlas (مجاني 512MB)

### س: هل يمكن تشغيله على Windows؟
**ج:** نعم تماماً! جميع الخطوات متوافقة مع Windows.

### س: ماذا لو نسيت كلمة المرور؟
**ج:** حالياً لا توجد ميزة استرجاع كلمة المرور. يمكنك إضافتها باستخدام:
```javascript
// استخدام nodemailer لإرسال email
```

### س: هل يدعم اللغات الأخرى؟
**ج:** حالياً باللغة العربية فقط. يمكنك إضافة i18n لتعدد اللغات.

---

## 📱 أسئلة الموبايل

### س: هل هناك تطبيق موبايل؟
**ج:** حالياً ويب فقط (Responsive). يمكنك بناء موبايل باستخدام:
- React Native
- Flutter (مع إعادة بناء الـ Backend)

### س: هل يعمل على جميع الهواتف؟
**ج:** نعم! التصميم Responsive على جميع الأحجام.

---

## 🔐 أسئلة الأمان

### س: هل البيانات آمنة؟
**ج:** نعم، نستخدم:
- تشفير كلمات المرور مع bcrypt
- JWT للمصادقة الآمنة
- استخدام HTTPS في الإنتاج

### س: هل بيانات الطالب محفوظة؟
**ج:** نعم، يمكنك إضافة GDPR compliance وحماية بيانات.

### س: كيف أحمي التطبيق من الهجمات؟
**ج:** 
```javascript
// 1. استخدم helmet للأمان
npm install helmet

// 2. ضيّق CORS
app.use(cors({ origin: 'https://yourdomain.com' }))

// 3. التحقق من المدخلات
const { body, validationResult } = require('express-validator')
```

---

## 📊 أسئلة البيانات

### س: كم عدد المستخدمين الذين يدعمهم التطبيق؟
**ج:** يعتمد على الموارد:
- MongoDB (المجاني): حتى 1000 مستخدم تقريباً
- للملايين: استخدم MongoDB Professional

### س: كيف أعمل Backup للبيانات؟
**ج:** 
```bash
# MongoDB Atlas: automatic backups
# أو استخدم mongodump
mongodump --uri "mongodb://localhost:27017/khadamli_darasi"
```

### س: هل يمكن مسح البيانات القديمة؟
**ج:** نعم، باستخدام:
```javascript
// حذف الأسئلة الأقدم من 6 أشهر
db.questions.deleteMany({ 
  createdAt: { $lt: new Date(Date.now() - 6*30*24*60*60*1000) }
})
```

---

## 🎯 أسئلة الميزات

### س: كيف أضيف نظام الرسائل المباشرة؟
**ج:** استخدم **Socket.IO**:
```bash
npm install socket.io
```

```javascript
const io = require('socket.io')(server, {
  cors: { origin: 'http://localhost:3000' }
})

io.on('connection', (socket) => {
  socket.on('send_message', (msg) => {
    io.emit('receive_message', msg)
  })
})
```

### س: كيف أضيف تنبيهات الإيميل؟
**ج:** استخدم **Nodemailer**:
```javascript
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL, pass: process.env.PASSWORD }
})

transporter.sendMail({
  to: student.email,
  subject: 'سؤال جديد في فصلك',
  text: 'هناك سؤال جديد...'
})
```

### س: كيف أضيف نظام الملفات؟
**ج:** استخدم **Multer**:
```bash
npm install multer
```

```javascript
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

router.post('/upload', upload.single('file'), (req, res) => {
  res.json({ filepath: req.file.path })
})
```

### س: كيف أضيف الوضع الليلي؟
**ج:** استخدم **Context API** و **localStorage**:
```javascript
const [isDark, setIsDark] = useState(localStorage.getItem('dark') === 'true')

useEffect(() => {
  document.documentElement.classList.toggle('dark', isDark)
  localStorage.setItem('dark', isDark)
}, [isDark])
```

---

## 🚀 أسئلة النشر (Deployment)

### س: كيف أرفع التطبيق على الإنترنت؟
**ج:** اتبع هذه الخطوات:

**1. Frontend على Netlify:**
```bash
npm run build
# اسحب مجلد build على netlify.com
```

**2. Backend على Railway:**
```bash
# أنشئ حساب على railway.app
# وصّل GitHub Repo
```

**3. Database على MongoDB Atlas:**
```bash
# أنشئ cluster مجاني
# استخدم الـ connection string
```

### س: كيف أستخدم Custom Domain؟
**ج:**
```bash
# اشتر domain من GoDaddy أو Namecheap
# وصّله مع Netlify في DNS Settings
```

### س: كيف أحقق HTTPS؟
**ج:** معظم المنصات توفره تلقائياً (Netlify, Vercel, Railway)

---

## 🐛 حل الأخطاء الشائعة

### س: خطأ "Cannot GET /"
**ج:** تأكد من:
```javascript
// أضف this في server.js
app.get('/', (req, res) => {
  res.send('Server is running')
})
```

### س: خطأ "EADDRINUSE"
**ج:** المنفذ مشغول بالفعل:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### س: خطأ "ValidationError"
**ج:** تأكد من إدخال البيانات الصحيحة:
```javascript
// أضف validation
const { body, validationResult } = require('express-validator')

router.post('/', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
})
```

---

## 💡 نصائح إضافية

### س: كيف أحسّن الأداء؟
**ج:**
1. استخدم Caching (Redis)
2. أضف Pagination للبيانات الكثيرة
3. استخدم CDN للملفات الثابتة
4. قلّل حجم الـ Bundle بـ Code Splitting

### س: كيف أراقب الأخطاء؟
**ج:** استخدم **Sentry**:
```bash
npm install @sentry/node
```

### س: كيف أعرف أن التطبيق يعمل صحيح؟
**ج:** استخدم **Postman Collections**:
- أنشئ مجموعة requests
- شغّل التيست تلقائياً
- تحقق من جميع API Endpoints

---

## 📞 هل لديك سؤال لم يُجب عليه؟

تواصل معنا عبر:
- 💬 GitHub Issues
- 📧 البريد الإلكتروني
- 🐦 Twitter

---

**نتمنى أن تكون هذه الأسئلة مفيدة! 🎓✨**
