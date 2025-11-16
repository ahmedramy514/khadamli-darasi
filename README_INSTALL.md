خدملي دراسي — تعليمات التثبيت السريعة (Windows)

ماذا يفعل هذا الدليل:
- يوضّح كيفية تثبيت حزم المشروع على Windows باستخدام PowerShell.
- يشرح تشغيل الخوادم (backend و frontend) محلياً.

ملف السكريبت:
- `install.ps1`: PowerShell helper script (موجود في جذر المشروع).

خطوات سريعة (PowerShell):

1) تأكد من أنك في مجلد المشروع (جذر المستودع). افتح PowerShell بصلاحية عادية.

2) امنح الإذن لتشغيل السكريبت لمرة واحدة ثم شغّله:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; .\install.ps1
```

3) بعد نجاح السكريبت، شغّل الخوادم في نافذتين PowerShell:

Terminal 1 (backend):

```powershell
cd backend
npm run dev
```

Terminal 2 (frontend):

```powershell
cd frontend
npm start
```

4) افتح المتصفح إلى:

- Frontend UI: http://localhost:3000
- Backend API: http://localhost:5001 (إعداد افتراضي في `.env`)

ملاحظات مهمة:
- السكريبت يتحقق من وجود Node.js و npm لكنه لا يقوم بتثبيتهما آلياً. إن لم يكن Node مثبتاً، نزّله من https://nodejs.org/ ثم أعد تشغيل السكريبت.
- السكريبت يقوم بإنشاء `.env` مبدئي في `backend` و `frontend` إذا لم تكن موجودة، ويضع `USE_IN_MEMORY_DB=true` في `backend/.env` لتفعيل قاعدة بيانات في الذاكرة للمطور.
- إن أردت استخدام MongoDB محلي أو Atlas بدلاً من mongodb-memory-server، ضع `MONGODB_URI` في `backend/.env` وأزل/غيّر `USE_IN_MEMORY_DB`.

مشاكل شائعة:
- "Port already in use": تحقق من أن المنافذ 3000 (frontend) و5001 (backend) غير مشغولين أو غيّر أرقام المنافذ في `.env` وملفات التهيئة.
- إذا ظهر خطأ عند `npm install`, انسخ الخطأ هنا وسأساعدك في تحليله.

إذا رغبت، أستطيع:
- تعديل `install.ps1` لإضافة اختبارات إضافية أو تغييرات منافذ افتراضية.
- إنشاء إصدار bash (لـ WSL / macOS / Linux) أو جعل السكريبت يثبت Node عبر nvm-windows (يتطلب موافقة وإجراءات إضافية).
