# DailyMood — Vercel Ready

اپ شخصی فارسی و Mobile‑First برای ثبت احساس، عادت، برنامه، دفتر روزانه، آرزو، رویا و مناجات.

## امکانات

- نقشه تمام‌صفحه احساسات با ۱۰۰ واژه فارسی و چهار رنگ احساسی
- انتخاب هم‌زمان چند احساس، شدت ۱ تا ۱۰ و یادداشت
- داشبورد مود و گزارش ۳۰ روزه
- عادت‌های روزانه و هفتگی
- برنامه‌ها و قدم بعدی
- دفتر روزانه، آرزوها و دفتر رویا
- مناجات روزانه
- ورود Supabase Auth و Row Level Security
- رابط RTL، طراحی موبایل، Bottom Navigation و Web App Manifest
- آماده Deploy روی Vercel با SPA Rewrite

## ۱) نصب محلی

```bash
npm install
cp .env.example .env.local
npm run dev
```

داخل `.env.local`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

آدرس پروژه نباید `/rest/v1` داشته باشد. کلید `sb_secret` یا `service_role` را هرگز در Frontend قرار نده.

## ۲) ساخت دیتابیس Supabase

در Supabase > SQL Editor فایل‌ها را به ترتیب اجرا کن:

1. `supabase/migrations/001_complete_schema.sql`
2. `supabase/migrations/002_seed_emotions.sql`
3. `supabase/migrations/003_seed_prayers.sql`
4. `supabase/migrations/004_fix_reference_data_access.sql`

## ۳) Deploy روی Vercel

1. پروژه را در GitHub Push کن.
2. در Vercel روی **Add New → Project** بزن و Repository را Import کن.
3. Framework را Vite انتخاب کن؛ فایل `vercel.json` تنظیمات Build و SPA routing را دارد.
4. در **Project Settings → Environment Variables** این دو مقدار را برای Production و Preview اضافه کن:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Deploy کن.

## ۴) تنظیم Auth بعد از Deploy

در Supabase > Authentication > URL Configuration:

- **Site URL** را روی دامنه اصلی Vercel بگذار، مثل:
  `https://dailymood2.vercel.app`
- Redirect URLهای زیر را اضافه کن:
  - `http://localhost:5173/**`
  - `https://YOUR-PROJECT.vercel.app/**`
  - برای Previewها در صورت نیاز: `https://*-YOUR-VERCEL-SLUG.vercel.app/**`

## Build test

```bash
npm run build
npm run preview
```

## امنیت

- فقط Publishable key در مرورگر مجاز است.
- همه اطلاعات شخصی با RLS و `auth.uid()` محدود شده‌اند.
- اگر Secret key قبلاً جایی منتشر شده، آن را در Supabase Rotate/Delete کن.
