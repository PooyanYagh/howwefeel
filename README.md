# DailyMood Complete

یک اپ شخصی فارسی برای ثبت احساس، عادت، برنامه، دفتر روزانه، آرزو، رویا و مناجات روزانه.

## راه‌اندازی

### 1. ساخت پروژه Supabase
در Supabase یک پروژه جدید بساز.

### 2. اجرای SQL
در بخش **SQL Editor**، فایل‌های زیر را به ترتیب اجرا کن:

1. `supabase/migrations/001_complete_schema.sql`
2. `supabase/migrations/002_seed_emotions.sql`
3. `supabase/migrations/003_seed_prayers.sql`

### 3. تنظیم احراز هویت
در Supabase > Authentication > Providers، Email را فعال نگه دار.
برای استفاده شخصی، می‌توانی Confirm email را موقتاً خاموش کنی یا ایمیل خودت را تأیید کنی.

### 4. تنظیم متغیرها
فایل `.env.example` را به `.env` کپی کن:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

کلید **Secret / service_role** را داخل Frontend قرار نده.

### 5. اجرا

```bash
npm install
npm run dev
```

سپس:
`http://localhost:5173`

## قابلیت‌های موجود

- ثبت چند احساس از میان ۱۰۰ احساس فارسی
- شدت ۱ تا ۱۰ و محاسبه امتیاز مود
- نمودار هفتگی و گزارش ۳۰ روزه
- عادت‌ها و ثبت انجام
- برنامه‌ها و قدم بعدی
- دفتر روزانه
- آرزوها
- دفتر رویا
- کتابخانه مناجات
- دو جمله روزانه
- ورود و امنیت مبتنی بر Supabase Auth + RLS
- رابط RTL و Responsive

## نکات امنیتی

همه جدول‌های شخصی RLS دارند. داده‌ها با `auth.uid()` به کاربر جاری محدود شده‌اند.
برای اپ شخصی بهتر است یک رمز قوی و تأیید ایمیل فعال باشد.

## دسکتاپ

پس از تست نسخه وب، می‌توانی Tauri 2 را اضافه کنی:

```bash
npm install -D @tauri-apps/cli@latest
npx tauri init
```

روی ویندوز، پیش‌نیازهای رسمی Tauri شامل Microsoft C++ Build Tools و WebView2 است.
