# 🏗️ معمارية المشروع - Architecture

## 📊 المخطط العام

```
┌─────────────────────────────────────────────────────────┐
│                    المستخدم / المتصفح                    │
└──────────────────┬──────────────────────────────────────┘
                   │
         ┌─────────▼──────────┐
         │   React Frontend   │
         │  (localhost:3000)  │
         └──────────┬─────────┘
                    │ (HTTP/REST)
         ┌──────────▼──────────┐
         │   Express Server   │
         │  (localhost:5000)  │
         └──────────┬─────────┘
                    │
         ┌──────────▼──────────┐
         │     MongoDB        │
         │  (Firestore/Local) │
         └────────────────────┘
```

## 🗂️ البنية التحتية للمشروع

### Backend Structure

```
backend/
├── server.js                 # نقطة الدخول الرئيسية
├── package.json             # المكتبات والتبعيات
├── .env.example            # مثال للمتغيرات
│
├── models/                  # نماذج Mongoose
│   ├── User.js             # نموذج المستخدم
│   ├── Classroom.js        # نموذج الفصل الدراسي
│   ├── Question.js         # نموذج السؤال
│   └── Assignment.js       # نموذج الواجب
│
├── routes/                  # المسارات والـ Endpoints
│   ├── auth.js             # تسجيل/دخول
│   ├── classrooms.js       # الفصول الدراسية
│   ├── questions.js        # الأسئلة
│   └── users.js            # بيانات المستخدمين
│
├── controllers/            # منطق العمليات (مستقبلي)
│   └── (يمكن نقل المنطق من routes هنا)
│
├── middleware/             # Middleware المخصص
│   └── auth.js            # التحقق من JWT Token
│
└── uploads/               # المجلد المؤقت للملفات
```

### Frontend Structure

```
frontend/
├── public/                  # الملفات الثابتة
│   └── index.html
│
├── src/
│   ├── App.jsx             # المكون الرئيسي
│   ├── index.js            # نقطة الدخول
│   ├── index.css           # الأنماط العام
│   ├── config.js           # إعدادات التطبيق
│   ├── api.js              # إعداد Axios + Interceptors
│   │
│   ├── pages/              # الصفحات الرئيسية
│   │   ├── Home.jsx        # الصفحة الرئيسية
│   │   ├── Login.jsx       # تسجيل الدخول
│   │   ├── Register.jsx    # إنشاء حساب
│   │   ├── Profile.jsx     # الملف الشخصي
│   │   ├── AddQuestion.jsx # رفع سؤال
│   │   ├── Search.jsx      # البحث
│   │   ├── Messages.jsx    # الرسائل
│   │   └── ClassroomDetail.jsx # تفاصيل الفصل
│   │
│   ├── components/         # المكونات المعاد استخدامها
│   │   └── Navbar.jsx      # شريط التنقل السفلي
│   │
│   └── context/            # Context API
│       └── AuthContext.jsx # سياق المصادقة
│
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## 🔄 دورة الطلب (Request Flow)

### مثال: تسجيل حساب جديد

```
1. المستخدم
   ↓
2. يملأ نموذج التسجيل في Register.jsx
   ↓
3. يضغط "إنشاء الحساب"
   ↓
4. handleSubmit ينادي axios.post('/api/auth/register')
   ↓
5. الطلب يصل إلى Express Server
   ↓
6. Route: POST /api/auth/register
   ↓
7. Controllers: إنشاء مستخدم جديد
   ↓
8. Model: حفظ في MongoDB
   ↓
9. تشفير كلمة المرور تلقائياً (Middleware في Model)
   ↓
10. إرجاع Token و بيانات المستخدم
   ↓
11. Frontend يحفظ Token في localStorage
   ↓
12. تحديث Context مع بيانات المستخدم
   ↓
13. Redirect إلى الصفحة الرئيسية
```

## 🔐 نظام المصادقة (Authentication)

### JWT Flow

```
┌─────────────────┐
│   Frontend      │
│  (React)        │
└────────┬────────┘
         │
    ┌────▼─────────────────────┐
    │ 1. POST /api/auth/login  │
    │    {email, password}     │
    └────┬────────────────────┘
         │
         ▼
    ┌──────────────────────────┐
    │ 2. Backend verifies      │
    │    password with bcrypt  │
    └────┬────────────────────┘
         │
         ▼
    ┌──────────────────────────┐
    │ 3. Creates JWT Token     │
    │    jwt.sign({id, email}) │
    └────┬────────────────────┘
         │
         ▼
    ┌──────────────────────────┐
    │ 4. Returns Token         │
    │    {"token": "..."}      │
    └────┬────────────────────┘
         │
         ▼
┌────────────────────────────┐
│ 5. Frontend stores in      │
│    localStorage.token      │
└────────┬───────────────────┘
         │
┌────────▼──────────────────────┐
│ 6. Each request adds header:  │
│    Authorization: Bearer [...] │
└──────────────────────────────┘
```

## 💾 نموذج البيانات (Data Models)

### User Schema
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  schoolName: String,
  profileImage: String,
  role: "student" | "teacher" | "helper",
  points: Number,           // النقاط المكتسبة
  rank: "مبتدئ" | "نشيط" | "متفوق",
  bio: String,
  createdAt: Date
}
```

### Classroom Schema
```javascript
{
  _id: ObjectId,
  name: String,            // اسم الفصل
  description: String,
  subject: String,         // المادة
  code: String,            // رمز الانضمام
  teacher: ObjectId,       // معرف المدرس
  students: [ObjectId],    // قائمة الطلاب
  image: String,
  createdAt: Date
}
```

### Question Schema
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  image: String,
  classroom: ObjectId,     // الفصل التابع له
  askedBy: ObjectId,       // معرف السائل
  subject: String,
  answers: [               // قائمة الإجابات
    {
      text: String,
      image: String,
      answeredBy: ObjectId,
      likes: Number,
      createdAt: Date
    }
  ],
  deadline: Date,
  solved: Boolean,
  points: Number,          // النقاط عند الإجابة
  createdAt: Date
}
```

### Assignment Schema
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  classroom: ObjectId,
  createdBy: ObjectId,
  deadline: Date,
  attachments: [String],   // روابط الملفات
  submissions: [           // الحلول المرسلة
    {
      student: ObjectId,
      content: String,
      attachments: [String],
      grade: Number,
      feedback: String,
      submittedAt: Date
    }
  ],
  createdAt: Date
}
```

## 🔌 API Endpoints Map

```
AUTH
├── POST   /api/auth/register        ➜ إنشاء حساب
├── POST   /api/auth/login           ➜ تسجيل الدخول
└── GET    /api/auth/me              ➜ بيانات المستخدم الحالي

CLASSROOMS
├── POST   /api/classrooms           ➜ إنشاء فصل جديد
├── GET    /api/classrooms           ➜ جلب الفصول
├── GET    /api/classrooms/:id       ➜ تفاصيل فصل واحد
└── POST   /api/classrooms/join/:code ➜ الانضمام لفصل

QUESTIONS
├── POST   /api/questions            ➜ رفع سؤال جديد
├── GET    /api/questions/classroom/:id ➜ أسئلة الفصل
├── POST   /api/questions/:id/answer ➜ إضافة إجابة
└── POST   /api/questions/:id/like-answer/:aid ➜ إعجاب

USERS
├── GET    /api/users/leaderboard    ➜ ترتيب النقاط
├── GET    /api/users/:id            ➜ بيانات مستخدم
└── PUT    /api/users/:id            ➜ تحديث البيانات
```

## 🎯 دورة حياة الكومبوننت (Component Lifecycle)

### Home Component
```
const Home = () => {
  // 1. State Management
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)
  
  // 2. Effect (عند التحميل)
  useEffect(() => {
    fetchClassrooms() // جلب البيانات
  }, [])
  
  // 3. Fetch Function
  const fetchClassrooms = async () => {
    // طلب من الـ Backend
    const response = await axios.get('/api/classrooms')
    setClassrooms(response.data)
  }
  
  // 4. Render
  return <div>...</div>
}
```

## 🌊 Data Flow في Classroom

```
ClassroomDetail
├── useEffect (load data)
│   ├── fetchClassroom() ─────► API GET /classrooms/:id
│   └── fetchQuestions() ──────► API GET /questions/classroom/:id
│
├── handleAnswerSubmit()
│   └── API POST /questions/:id/answer ─► Update questions
│
└── handleLikeAnswer()
    └── API POST /questions/:id/like-answer/:aid
```

## 🔄 State Management Strategy

نحن نستخدم **Context API** للحالة العام:

```javascript
AuthContext
├── user (بيانات المستخدم)
├── token (JWT Token)
├── setUser (تحديث المستخدم)
└── setToken (تحديث التوكن)
```

**المكونات الأخرى** تستخدم `useState` للحالة المحلية.

---

## 🚀 جاهز للبدء؟

تابع [QUICK_START.md](./QUICK_START.md) للتثبيت والتشغيل!
