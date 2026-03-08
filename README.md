# 🏠 Коммуналка семьи

PWA-приложение для семейного учёта коммунальных платежей.  
Тёмная iOS-тема · Оффлайн · Таблица + Графики

---

## 📱 Установка на iPhone (семье)

1. Откройте **https://[username].github.io/pwa-kommunalka/**
2. Нажмите кнопку **Поделиться** (квадрат со стрелкой)
3. Выберите **«На экран Домой»**
4. ✅ Готово! Работает как приложение, доступно оффлайн 🚀

---

## 🧑‍💻 Локальная разработка

### Требования
- Docker Desktop
- Python 3.11+
- Node.js 20+

### 1. MongoDB (Docker)
```bash
docker-compose up -d
# MongoDB запущена на localhost:27017
```

### 2. Backend (FastAPI)
```bash
cd backend
cp .env.example .env          # настройте переменные
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### 3. Frontend (Vite)
```bash
cd frontend
cp .env.example .env          # VITE_API_URL=http://localhost:8000
npm install
npm run dev
# App: http://localhost:5173/pwa-kommunalka/
```

---

## 🚀 Деплой

### Frontend → GitHub Pages
```bash
# В Settings → Pages → Source: GitHub Actions
# Добавить секрет VITE_API_URL = https://kommunalka-api.onrender.com
git push origin main
# CI/CD задеплоит автоматически
```

### Backend → Render
```bash
# 1. Создать Web Service на render.com
# 2. Подключить MongoDB Atlas (бесплатный tier)
# 3. Добавить MONGO_URL в Environment Variables
# render.yaml уже настроен
```

---

## 📐 Архитектура

```
GitHub Pages          Render              MongoDB Atlas
pwa-kommunalka/ ──► /api/payments  ──►  kommunalka.payments
(Vue 3 + PWA)        (FastAPI)           (Motor async)
```

---

## 🗂️ Категории платежей

| Иконка | Категория    |
|--------|-------------|
| ⚡     | Электричество |
| 💧     | Вода         |
| 🔥     | Газ          |
| 🌡️    | Отопление    |
| 📡     | Интернет     |
| 🗑️    | Мусор        |

---

## 🔗 Ссылки

- **Приложение:** https://[username].github.io/pwa-kommunalka/
- **API:** https://kommunalka-api.onrender.com
- **API Docs:** https://kommunalka-api.onrender.com/docs
