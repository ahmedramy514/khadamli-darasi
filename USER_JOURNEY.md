📱 USER JOURNEY - GAMIFICATION SYSTEM
====================================

SCENARIO 1: Student Answering Questions
────────────────────────────────────────

1. Student sees public question or classroom question
   ↓
2. Clicks to view & writes an answer
   ↓
3. Answer is posted
   ├─ Backend: +10 points, +10 weeklyPoints
   ├─ Backend: +1 totalAnswers
   ├─ Backend: Check for "أول إجابة" badge
   └─ Backend: Update rank automatically
   ↓
4. Student sees success message
   "تم إضافة الإجابة بنجاح وحصلت على 10 نقاط!"
   ↓
5. Later, another student finds answer helpful
   ├─ Backend: +5 points for original answerer
   ├─ Backend: +5 weeklyPoints for original answerer
   ├─ Backend: +1 helpfulAnswers count
   └─ Backend: Check for "الإجابات المفيدة" badge
   ↓
6. Answering student checks their profile
   └─ Sees updated stats: points ⭐, rank 🏆, badges 🎖️
   
────────────────────────────────────────

SCENARIO 2: Student Checking Progress
────────────────────────────────────────

1. Student taps "👤 حسابي" in navbar
   ↓
2. Redirected to /user-profile
   ↓
3. Sees:
   ├─ Profile header with avatar
   ├─ Name, school, bio
   ├─ Current rank (🟦 مساعد مبتدئ)
   ├─ Stats cards:
   │  ├─ 45 النقاط الإجمالية
   │  ├─ 12 الإجابات
   │  ├─ 3 إجابات مفيدة
   │  └─ 1 الشارات
   ├─ Earned badges display
   └─ Progress to next rank:
      └─ "تحتاج إلى 5 نقاط أخرى للوصول إلى مساعد فضي"
   
────────────────────────────────────────

SCENARIO 3: Student Checking Leaderboard
────────────────────────────────────────

1. Student taps "🏆 لوحة الشرف" from navbar dropdown
   ↓
2. Redirected to /leaderboard
   ↓
3. Sees two tabs:
   ├─ "📅 هذا الأسبوع" (Weekly Leaders)
   │  └─ Top 10 helpers by weeklyPoints
   │     with medals: 🥇 🥈 🥉
   │
   └─ "⭐ جميع الأوقات" (All-Time Leaders)
      └─ Top 50 helpers by total points

4. Each leaderboard entry shows:
   ├─ Position (medal or number)
   ├─ Name + "👈 أنت" if current user
   ├─ Rank (مساعد خبير)
   ├─ 📝 Total answers, 💡 Helpful answers
   ├─ Points (large number with ⭐)
   └─ Badges (first 3 shown)

5. At bottom, current user stats card
   └─ Shows their position info
   
────────────────────────────────────────

SCENARIO 4: Student Checking Badges
────────────────────────────────────────

1. Student taps "🎖️ الشارات" from navbar
   ↓
2. Redirected to /badges
   ↓
3. Sees earned badges at top:
   ├─ Glowing yellow cards with emoji
   ├─ Each shows name, description, earn date
   └─ "✓ مكتسبة" badge

4. All available badges shown below:
   ├─ Earned badges: Bright & full size
   ├─ Locked badges: Grayed out & smaller
   └─ Each shows requirement (e.g. "10 إجابات")

5. Tips section at bottom:
   ├─ 📝 أجب على الأسئلة
   ├─ 👍 قدم إجابات مفيدة
   └─ ⭐ اصعد الترتيب

────────────────────────────────────────

NAVBAR NAVIGATION (Desktop)
────────────────────────────────────────

Profile Dropdown Menu:
├─ 👤 الملف الشخصي → /user-profile
├─ 🏠 الرئيسية → /
├─ 📝 رفع سؤال → /add-question
├─ ❓ الأسئلة العامة → /questions
├─ 🏆 لوحة الشرف → /leaderboard
├─ 🎖️ الشارات → /badges
└─ 🚪 تسجيل خروج

────────────────────────────────────────

MOBILE BOTTOM NAVIGATION (scrollable)
────────────────────────────────────────

🏠 الرئيسية   ❓ أسئلة    🏆 ترتيب    🎖️ شارات    📝 إضافة    👤 حسابي
  /             /questions  /leaderboard /badges  /add-question /user-profile

────────────────────────────────────────

RANK PROGRESSION EXAMPLE
────────────────────────────────────────

User starts: 0 points → 🟦 مساعد مبتدئ

After 6 answers: 60 points → 🟨 مساعد فضي
├─ Progress bar to الذهبي: [========░░░] 40%

After 18 answers: 180 points → 🟧 مساعد ذهبي
├─ Progress bar to الخبير: [████░░░░░░] 20%

After 35 answers: 350 points → 🟪 مساعد خبير
├─ Highest rank reached! 🎉

────────────────────────────────────────

BADGE EARNING EXAMPLE
────────────────────────────────────────

Action 1: Answer 1st question
→ System awards: 🎖️ "أول إجابة"
→ Display: Badge appears with glow effect

Action 2-9: Answer 9 more questions
→ No new badge (need 10 total)

Action 10: Answer 10th question
→ System awards: ⭐ "المساعد النشيط"
→ Display: 2 badges now visible in profile

Action 49: Answer 49 more questions (total 59)
→ No new badge (need 50 total)

Action 50: Answer 50th question (total 50)
→ System awards: 👑 "المساعد الموثوق"
→ Display: 3 badges now visible

────────────────────────────────────────

POINTS CALCULATION EXAMPLE
────────────────────────────────────────

Week 1:
├─ Monday: Answer Q1 → +10 points, +10 weekly
├─ Tuesday: Answer Q2 → +10 points, +10 weekly
├─ Wednesday: User rates an answer helpful
│  ├─ Other user gets: +5 points, +5 weekly
│  └─ Counter: helpfulAnswers += 1
├─ Friday: Answer Q3 → +10 points, +10 weekly
└─ Weekly total: 30 points

Week 2: (weeklyPoints resets)
├─ Monday: Answer Q4 → +10 points, +10 weekly
├─ Tuesday: Answer Q5 → +10 points, +10 weekly
│  └─ User's helpful answer is rated
│     └─ User gets: +5 points, +5 weekly
└─ Week 2 weekly total: 25 points

Total points (all time): 30 + 25 = 55 ⭐

────────────────────────────────────────

API CALLS FLOW (Behind the Scenes)
────────────────────────────────────────

User Posts Answer:
1. POST /api/questions/:id/answer
2. Backend:
   ├─ Saves answer to DB
   ├─ GET current user
   ├─ user.points += 10
   ├─ user.weeklyPoints += 10
   ├─ user.totalAnswers += 1
   ├─ user.updateRank() [update rank enum]
   ├─ Check badges:
   │  ├─ if totalAnswers == 1 → addBadge("أول إجابة")
   │  ├─ if totalAnswers == 10 → addBadge("المساعد النشيط")
   │  └─ if totalAnswers == 50 → addBadge("المساعد الموثوق")
   ├─ user.save()
   └─ Return updated user + question
3. Frontend displays success message

User Rates Answer Helpful:
1. POST /api/questions/:id/rate-answer/:answerId
2. Body: { useful: true }
3. Backend:
   ├─ Find answer in question
   ├─ answer.usefulCount += 1
   ├─ GET answerer user
   ├─ answerer.points += 5
   ├─ answerer.weeklyPoints += 5
   ├─ answerer.helpfulAnswers += 1
   ├─ answerer.updateRank()
   ├─ Check badges:
   │  ├─ if helpfulAnswers == 5 → addBadge("الإجابات المفيدة")
   │  └─ if helpfulAnswers == 20 → addBadge("السفير المساعد")
   ├─ answerer.save()
   ├─ question.save()
   └─ Return updated question

User Checks Leaderboard:
1. GET /api/users/leaderboard
2. Backend:
   ├─ Find all users
   ├─ Sort by points (all-time)
   ├─ Limit 50
   ├─ Also find top 10 by weeklyPoints
   └─ Return { allTime: [], weekly: [] }
3. Frontend renders with badges & animations

────────────────────────────────────────

STATS DISPLAY IN PROFILE
────────────────────────────────────────

API Response includes:
{
  _id: "user123",
  name: "أحمد محمد",
  email: "ahmed@example.com",
  points: 125,
  weeklyPoints: 45,
  rank: "مساعد فضي",
  totalAnswers: 15,
  helpfulAnswers: 8,
  badges: [
    { name: "أول إجابة", icon: "🎖️", ... },
    { name: "المساعد النشيط", icon: "⭐", ... }
  ],
  stats: {
    points: 125,
    weeklyPoints: 45,
    rank: "مساعد فضي",
    totalAnswers: 15,
    helpfulAnswers: 8,
    badges: 2
  }
}

Frontend displays in 4-card grid:
├─ 125 ⭐ النقاط الإجمالية
├─ 15 📝 الإجابات
├─ 8 💡 إجابات مفيدة
└─ 2 🎖️ الشارات

════════════════════════════════════════

✅ Complete User Experience Implemented!
