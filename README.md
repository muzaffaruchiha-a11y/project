# Test Platformasi

English Test Practice — Supabase backend bilan ishlaydigan zamonaviy test platformasi.

## Xususiyatlar

- **300+ savollar** — PostgreSQL database-da saqlanadi
- **Fanlar bo'yicha ajratish** — 10 ta fan (Pedagogika, Matematika, Ona tili, Tarix, Ingliz tili, Fizika, Kimyo, Biologiya, Informatika, Boshqa)
- **Real-time feedback** — To'g'ri/yashil, noto'g'ri/qizil
- **3 ta study mode** — Barcha savollar, Javobsiz, Xato ishlangan
- **Statistika** — Progress bar, to'g'ri/noto'g'ri hisob, foiz
- **Admin panel** — Fan/test CRUD, CSV import/export, statistika, progress tozalash
- **Toast notifications** — Muvaffaqiyat/xato/ma'lumot xabarlari
- **Responsive dark UI** — Mobile-first dizayn
- **Login talab qilinmaydi** — Darhol foydalanish

## Texnologiyalar

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3.4
- Lucide React (icons)
- Supabase (PostgreSQL + REST API)

## Local Development

```bash
npm install
npm run dev
```

## Netlify Deploy

### 1. GitHub-ga push

```bash
git init
git add .
git commit -m "Test Platformasi"
git remote add origin https://github.com/YOUR_USERNAME/test-platform
git push -u origin main
```

### 2. Netlify-da deploy

1. https://netlify.com — GitHub bilan login
2. "Add new site" → "Import an existing project"
3. Repository tanlang
4. Build settings (avtomatik aniqlanadi):
   - Build command: `npm run build`
   - Publish directory: `dist`
5. "Deploy site" bosing

### 3. Environment Variables (MUHIM!)

Netlify Dashboard → Site settings → Build & deploy → Environment:

```
VITE_SUPABASE_URL = https://ypmviouxhxzjeroqaqxd.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Bu o'zgaruvchilarsiz sayt ishlamaydi! `.env` fayl gitga kirmaydi (gitignore da).

### 4. Redeploy

Environment variables qo'shgandan keyin "Deploys" → "Trigger deploy" bosing.

## Database Schema

| Table | Tavsif |
|-------|--------|
| `subjects` | Fanlar (id, name, created_at) |
| `tests` | Savollar (subject_id, question, options, correct_answer) |
| `results` | Natijalar (test_id, selected_answer, is_correct) |

## API (Supabase REST)

- `GET /subjects` — Fanlar ro'yxati
- `POST /subjects` — Fan qo'shish
- `GET /tests?subject_id=eq.1` — Fan bo'yicha testlar
- `POST /tests` — Test qo'shish
- `PUT /tests?id=eq.1` — Test tahrirlash
- `DELETE /tests?id=eq.1` — Test o'chirish
- `POST /results` — Javob yozish
- `GET /results` — Natijalar

## Fayl tuzilishi

```
src/
├── App.tsx              # Asosiy ilova
├── types.ts             # TypeScript turlari
├── index.css            # Global uslublar
├── main.tsx             # React entry
├── lib/
│   └── supabase.ts      # Supabase client
├── components/
│   ├── SubjectSelector  # Fan tanlash
│   ├── QuestionCard     # Savol kartasi
│   ├── StatsBar         # Statistika panel
│   ├── FilterBar        # Filtrlar
│   ├── AdminPanel       # Boshqaruv paneli
│   ├── Toast            # Bildirishnomalar
│   └── LoadingSpinner   # Yuklash indikatori
├── hooks/
│   ├── useSubjects.ts   # Fanlar hook
│   ├── useTests.ts      # Testlar hook
│   └── useToast.ts      # Toast hook
└── data/
    └── tests_300_questions.json  # Import uchun JSON
```
