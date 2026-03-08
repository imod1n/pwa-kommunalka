# 🏠 Сводная доска расходов

PWA-приложение для учёта расходов. Тёмная iOS-тема, оффлайн-поддержка, таблица и графики.

---

## 📱 Установка на iPhone

1. Открыть приложение в Safari
2. **Поделиться** → **На экран Домой**

---

## 🧑‍💻 Локальная разработка

**Требования:** Docker Desktop, Python 3.11, Node.js 20

```bash
# MongoDB
docker-compose up -d

# Backend
cd backend
cp .env.example .env   # MONGO_URL, DB_NAME
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:8000
npm install
npm run dev
# → http://localhost:5173/pwa-kommunalka/
```

---

## 🚀 Деплой

- **Frontend** — GitHub Pages через GitHub Actions (push в `master`)
- **Backend** — Render Web Service (`render.yaml` в корне)
- **База данных** — MongoDB Atlas M0