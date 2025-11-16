# 📮 أمثلة API Requests - API Examples

يمكنك استخدام هذا الملف مع **Postman** أو **VS Code REST Client**

## 🔐 المصادقة (Authentication)

### 1. تسجيل حساب جديد
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "password": "password123",
  "schoolName": "مدرسة النيل",
  "role": "student"
}
```

**الرد (200 OK):**
```json
{
  "message": "تم إنشاء الحساب بنجاح",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "63faf4c7a1b2c3d4e5f6g7h8",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "role": "student"
  }
}
```

### 2. تسجيل الدخول
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "password123"
}
```

**الرد (200 OK):**
```json
{
  "message": "تم تسجيل الدخول بنجاح",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "63faf4c7a1b2c3d4e5f6g7h8",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "role": "student",
    "points": 0,
    "rank": "مبتدئ"
  }
}
```

### 3. الحصول على بيانات المستخدم الحالي
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**الرد (200 OK):**
```json
{
  "_id": "63faf4c7a1b2c3d4e5f6g7h8",
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "schoolName": "مدرسة النيل",
  "role": "student",
  "points": 50,
  "rank": "نشيط"
}
```

---

## 🎓 الفصول الدراسية (Classrooms)

### 1. إنشاء فصل جديد (المدرس فقط)
```http
POST http://localhost:5000/api/classrooms
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "الرياضيات - الفصل الأول",
  "description": "فصل الرياضيات للسنة الأولى الثانوية",
  "subject": "رياضيات"
}
```

**الرد (201 Created):**
```json
{
  "message": "تم إنشاء الفصل بنجاح",
  "classroom": {
    "_id": "63faf4c7a1b2c3d4e5f6g7h9",
    "name": "الرياضيات - الفصل الأول",
    "description": "فصل الرياضيات للسنة الأولى الثانوية",
    "subject": "رياضيات",
    "code": "MATH4521",
    "teacher": {
      "_id": "63faf4c7a1b2c3d4e5f6g7h8",
      "name": "الأستاذ علي",
      "email": "teacher@example.com"
    },
    "students": [],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. جلب جميع الفصول
```http
GET http://localhost:5000/api/classrooms
Authorization: Bearer YOUR_TOKEN
```

**الرد (200 OK):**
```json
[
  {
    "_id": "63faf4c7a1b2c3d4e5f6g7h9",
    "name": "الرياضيات - الفصل الأول",
    "subject": "رياضيات",
    "code": "MATH4521",
    "teacher": {
      "name": "الأستاذ علي",
      "email": "teacher@example.com"
    },
    "students": [
      {
        "_id": "63faf4c7a1b2c3d4e5f6g7h8",
        "name": "أحمد محمد",
        "email": "ahmed@example.com"
      }
    ]
  }
]
```

### 3. الانضمام لفصل دراسي برمز
```http
POST http://localhost:5000/api/classrooms/join/MATH4521
Authorization: Bearer YOUR_TOKEN
```

**الرد (200 OK):**
```json
{
  "message": "تم الانضمام للفصل بنجاح",
  "classroom": {
    "_id": "63faf4c7a1b2c3d4e5f6g7h9",
    "name": "الرياضيات - الفصل الأول",
    "students": [
      {
        "_id": "63faf4c7a1b2c3d4e5f6g7h8",
        "name": "أحمد محمد"
      }
    ]
  }
}
```

### 4. الحصول على تفاصيل فصل واحد
```http
GET http://localhost:5000/api/classrooms/63faf4c7a1b2c3d4e5f6g7h9
Authorization: Bearer YOUR_TOKEN
```

---

## ❓ الأسئلة (Questions)

### 1. رفع سؤال جديد
```http
POST http://localhost:5000/api/questions
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "كيفية حل المعادلات التربيعية؟",
  "description": "أنا لا أفهم طريقة إكمال المربع. يمكن أحد أن يشرح لي الخطوات بالتفصيل؟",
  "classroomId": "63faf4c7a1b2c3d4e5f6g7h9",
  "subject": "رياضيات"
}
```

**الرد (201 Created):**
```json
{
  "message": "تم رفع السؤال بنجاح",
  "question": {
    "_id": "63faf4c7a1b2c3d4e5f6g7i0",
    "title": "كيفية حل المعادلات التربيعية؟",
    "description": "أنا لا أفهم طريقة إكمال المربع...",
    "classroom": "63faf4c7a1b2c3d4e5f6g7h9",
    "askedBy": {
      "_id": "63faf4c7a1b2c3d4e5f6g7h8",
      "name": "أحمد محمد",
      "email": "ahmed@example.com"
    },
    "subject": "رياضيات",
    "answers": [],
    "points": 10,
    "solved": false,
    "createdAt": "2024-01-15T10:45:00.000Z"
  }
}
```

### 2. جلب أسئلة الفصل
```http
GET http://localhost:5000/api/questions/classroom/63faf4c7a1b2c3d4e5f6g7h9
Authorization: Bearer YOUR_TOKEN
```

**الرد (200 OK):**
```json
[
  {
    "_id": "63faf4c7a1b2c3d4e5f6g7i0",
    "title": "كيفية حل المعادلات التربيعية؟",
    "askedBy": {
      "name": "أحمد محمد",
      "points": 50,
      "rank": "نشيط"
    },
    "answers": [],
    "points": 10,
    "createdAt": "2024-01-15T10:45:00.000Z"
  }
]
```

### 3. إضافة إجابة على السؤال
```http
POST http://localhost:5000/api/questions/63faf4c7a1b2c3d4e5f6g7i0/answer
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "text": "الخطوة الأولى هي نقل الحد الثابت للطرف الآخر، ثم نقسم المعادلة على معامل x²"
}
```

**الرد (200 OK):**
```json
{
  "message": "تم إضافة الإجابة بنجاح وحصلت على 10 نقاط!",
  "question": {
    "_id": "63faf4c7a1b2c3d4e5f6g7i0",
    "answers": [
      {
        "_id": "63faf4c7a1b2c3d4e5f6g7i1",
        "text": "الخطوة الأولى هي نقل الحد الثابت...",
        "answeredBy": {
          "_id": "63faf4c7a1b2c3d4e5f6g7h8",
          "name": "أحمد محمد",
          "points": 60,
          "rank": "نشيط"
        },
        "likes": 0,
        "createdAt": "2024-01-15T11:00:00.000Z"
      }
    ]
  }
}
```

### 4. الإعجاب بإجابة
```http
POST http://localhost:5000/api/questions/63faf4c7a1b2c3d4e5f6g7i0/like-answer/63faf4c7a1b2c3d4e5f6g7i1
Authorization: Bearer YOUR_TOKEN
```

**الرد (200 OK):**
```json
{
  "message": "تم الإعجاب بالإجابة",
  "question": {
    "_id": "63faf4c7a1b2c3d4e5f6g7i0",
    "answers": [
      {
        "_id": "63faf4c7a1b2c3d4e5f6g7i1",
        "likes": 1
      }
    ]
  }
}
```

---

## 👥 المستخدمين (Users)

### 1. جلب لوحة الشرف
```http
GET http://localhost:5000/api/users/leaderboard
```

**الرد (200 OK):**
```json
[
  {
    "_id": "63faf4c7a1b2c3d4e5f6g7h8",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "points": 150,
    "rank": "متفوق",
    "profileImage": ""
  },
  {
    "_id": "63faf4c7a1b2c3d4e5f6g7h7",
    "name": "فاطمة علي",
    "email": "fatima@example.com",
    "points": 120,
    "rank": "نشيط",
    "profileImage": ""
  }
]
```

### 2. الحصول على بيانات مستخدم
```http
GET http://localhost:5000/api/users/63faf4c7a1b2c3d4e5f6g7h8
```

**الرد (200 OK):**
```json
{
  "_id": "63faf4c7a1b2c3d4e5f6g7h8",
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "schoolName": "مدرسة النيل",
  "role": "student",
  "points": 150,
  "rank": "متفوق",
  "bio": "أحب الرياضيات والعلوم"
}
```

### 3. تحديث بيانات المستخدم
```http
PUT http://localhost:5000/api/users/63faf4c7a1b2c3d4e5f6g7h8
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "أحمد محمد علي",
  "bio": "معلم رياضيات شغوف",
  "schoolName": "مدرسة النيل - فرع البحيرة"
}
```

**الرد (200 OK):**
```json
{
  "message": "تم تحديث البيانات بنجاح",
  "user": {
    "_id": "63faf4c7a1b2c3d4e5f6g7h8",
    "name": "أحمد محمد علي",
    "bio": "معلم رياضيات شغوف",
    "schoolName": "مدرسة النيل - فرع البحيرة"
  }
}
```

---

## 🚨 رموز الأخطاء (Error Codes)

| الكود | الرسالة | السبب |
|------|--------|--------|
| 400 | Bad Request | بيانات غير صحيحة |
| 401 | Unauthorized | لا يوجد توكن أو توكن غير صحيح |
| 403 | Forbidden | ليس لديك صلاحيات |
| 404 | Not Found | المورد غير موجود |
| 500 | Internal Server Error | خطأ في الخادم |

---

## 💡 نصائح الاستخدام

1. **احفظ التوكن بعد تسجيل الدخول**
   ```
   Authorization: Bearer [your_token_here]
   ```

2. **استخدم Postman Environment للتوكن:**
   ```
   {{token}}
   ```

3. **اختبر جميع الـ Endpoints قبل الـ Production**

---

**جاهز لـ API testing؟ استخدم هذه الأمثلة! 🚀**
