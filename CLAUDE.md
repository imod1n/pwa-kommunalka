# 🤖 CLAUDE.md — Всё о проекте "Коммуналка семьи"

> Этот файл — полная база знаний проекта для Claude.  
> Читать перед любыми изменениями в коде.

---

## 📋 Что это за проект

**PWA-приложение** для семейного учёта коммунальных платежей.  
Семья устанавливает его на iPhone как приложение (Add to Home Screen), вводит платежи, смотрит статистику и графики по месяцам.

**Ключевые качества:**
- 📱 Работает как нативное iOS-приложение (PWA standalone)
- 🌙 Тёмная тема iOS (`#111111` фон, `#30d158` акцент)
- 📴 Оффлайн-поддержка через Service Worker
- 💰 Бесплатный хостинг навсегда (GitHub Pages + Render free tier + MongoDB Atlas M0)

---

## 🚀 Продакшен — живые URL

| Сервис | URL |
|--------|-----|
| **Frontend** | https://imod1n.github.io/pwa-kommunalka/ |
| **Backend API** | https://kommunalka-api.onrender.com |
| **API Docs** | https://kommunalka-api.onrender.com/docs |
| **Healthcheck** | https://kommunalka-api.onrender.com/health |

---

## 🏗️ Архитектура

```
┌──────────────────────────────────────────────────────────────┐
│  FRONTEND (Vue 3)           BACKEND (FastAPI)                 │
│  GitHub Pages               Render Frankfurt                  │
│                                                               │
│  imod1n.github.io    →      kommunalka-api.onrender.com  →   │
│  Vue 3 + Pinia              Motor async              MongoDB  │
│  Chart.js                   Pydantic v2              Atlas M0 │
│  vite-plugin-pwa            Python 3.11.8            Frankfurt│
│  CI/CD: GitHub Actions                                        │
└──────────────────────────────────────────────────────────────┘
```

---

## ☁️ Инфраструктура продакшена

### GitHub
- **Репозиторий:** `imod1n/pwa-kommunalka`
- **Ветка:** `master` (не main — важно!)
- **GitHub Pages:** включён, Source = **GitHub Actions**
- **Secret:** `VITE_API_URL = https://kommunalka-api.onrender.com`
- **CI/CD:** `.github/workflows/deploy.yml` — триггер на push в `master`

### Render
- **Сервис:** `kommunalka-api` (Web Service, Free)
- **Регион:** Frankfurt (EU Central)
- **Runtime:** Python 3.11.8 (зафиксирован через `backend/.python-version`)
- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Env vars на Render:**
  - `MONGO_URL` = `mongodb+srv://kommunalka:<pass>@main1.brpynju.mongodb.net/kommunalka?retryWrites=true&w=majority&appName=Main1`
  - `DB_NAME` = `kommunalka`
- ⚠️ Free tier засыпает через 15 мин → пинговать через cron-job.org каждые 10 мин

### MongoDB Atlas
- **Провайдер:** AWS / Frankfurt
- **Кластер:** M0 Free (`main1.brpynju.mongodb.net`)
- **База данных:** `kommunalka`
- **Пользователь:** `kommunalka`
- **Network Access:** `0.0.0.0/0` (Allow from anywhere)

---

## 📁 Структура файлов

```
pwa-kommunalka/
├── frontend/
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.js
│   │   ├── style.css
│   │   ├── components/
│   │   │   ├── PaymentForm.vue        # Форма добавления платежа
│   │   │   ├── StatsTable.vue         # Таблица категорий + дельта
│   │   │   └── MonthlyChart.vue       # Chart.js: столбцы + линия
│   │   ├── views/
│   │   │   └── Dashboard.vue          # Главный экран
│   │   ├── stores/
│   │   │   └── payments.js            # Pinia store
│   │   └── api/
│   │       └── payments.js            # Axios клиент
│   ├── public/
│   │   ├── icon-192.png               # PWA иконка (нужно создать!)
│   │   └── icon-512.png               # PWA иконка большая
│   ├── vite.config.js                 # base: '/pwa-kommunalka/', PWA плагин
│   ├── postcss.config.js              # module.exports (не ES module!)
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI + CORS + lifespan
│   │   ├── models.py                  # Pydantic схемы
│   │   ├── crud.py                    # Motor async операции
│   │   └── database.py                # Подключение + индексы
│   ├── requirements.txt
│   └── .python-version                # 3.11.8 — критично для Render!
│
├── .github/workflows/
│   └── deploy.yml                     # branches: [master] ← важно!
│
├── docker-compose.yml                 # mongo:7.0 для локальной разработки
└── CLAUDE.md
```

---

## 🎨 Дизайн-система

### Цветовая палитра
```css
--bg-primary:    #111111
--bg-secondary:  #1c1c1e
--bg-card:       #2c2c2e
--bg-input:      #3a3a3c
--text-primary:  #ffffff
--text-secondary:#8e8e93
--accent-green:  #30d158   /* кнопки, суммы */
--accent-blue:   #0a84ff   /* вкладки */
--accent-orange: #ff9f0a   /* Газ */
--accent-red:    #ff453a   /* ошибки, рост */
--accent-yellow: #ffd60a   /* Электричество */
--accent-purple: #bf5af2   /* Интернет */
--border:        #38383a
```

---

## ⚙️ Технический стек

### Frontend
| Пакет | Версия |
|-------|--------|
| Vue 3 | ^3.4.0 |
| Pinia | ^2.1.7 |
| Axios | ^1.6.0 |
| Chart.js | ^4.4.0 |
| Vite | ^5.0.0 |
| vite-plugin-pwa | ^0.19.0 |
| Tailwind CSS | ^3.4.0 |

### Backend
| Пакет | Версия |
|-------|--------|
| fastapi | 0.110.0 |
| motor | 3.3.2 |
| pymongo | 4.6.3 (явно!) |
| pydantic | 2.7.0 |
| uvicorn[standard] | 0.29.0 |
| python-dateutil | 2.9.0 |
| python-dotenv | 1.0.0 |

---

## 🔌 API Endpoints

| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/api/payments` | Добавить платёж |
| GET | `/api/stats/{month}` | Статистика за месяц (YYYY-MM) |
| GET | `/api/stats-history?months=6` | История для графика |
| GET | `/api/payments?limit=100` | Список платежей |
| DELETE | `/api/payments/{id}` | Удалить по ObjectId |
| GET | `/health` | Healthcheck для Render/cron |

---

## 📂 Категории

```python
class Category(str, Enum):
    electricity = "Электричество"  # ⚡ #ffd60a
    water       = "Вода"           # 💧 #0a84ff
    gas         = "Газ"            # 🔥 #ff9f0a
    heating     = "Отопление"      # 🌡️ #ff453a
    internet    = "Интернет"       # 📡 #bf5af2
    trash       = "Мусор"          # 🗑️ #636366
```

---

## 🔧 Переменные окружения

### Frontend
```env
# локально (.env.local)
VITE_API_URL=http://localhost:8000
# продакшен — GitHub Secret, подставляется CI/CD автоматически
VITE_API_URL=https://kommunalka-api.onrender.com
```

### Backend
```env
# локально (.env)
MONGO_URL=mongodb://localhost:27017
DB_NAME=kommunalka
# продакшен — Render Environment Variables
MONGO_URL=mongodb+srv://kommunalka:<pass>@main1.brpynju.mongodb.net/kommunalka?retryWrites=true&w=majority&appName=Main1
DB_NAME=kommunalka
```

---

## 🚀 Локальная разработка

```bash
# MongoDB
docker-compose up -d          # mongo:7.0 на порту 27017

# Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm run dev                   # → http://localhost:5173/pwa-kommunalka/

# Деплой (автоматически)
git push origin master        # → GitHub Actions → GitHub Pages
```

---

## ⚠️ Критичные нюансы

1. **Ветка `master`** — в `deploy.yml` прописано `branches: [master]`, не main
2. **`backend/.python-version = 3.11.8`** — без этого Render берёт Python 3.14, `pydantic-core` не собирается (нет prebuilt wheel, нужен Rust)
3. **`pymongo==4.6.3`** явно в `requirements.txt` — motor тянет несовместимую версию без явной фиксации
4. **MongoDB Atlas, не Render** — MongoDB нельзя запустить как Web Service на Render (ждёт HTTP, убивает по таймауту)
5. **`postcss.config.js`** — `module.exports`, не `export default`
6. **`font-size: 16px` в input** — иначе iPhone зумит форму
7. **`base: '/pwa-kommunalka/'`** в `vite.config.js` — совпадает с именем репозитория
8. **CORS** — настроен на `https://*.github.io` и `https://imod1n.github.io`
9. **Render засыпает** через 15 мин → пинговать `https://kommunalka-api.onrender.com/health` каждые 10 мин через cron-job.org
10. **PWA иконки** — нужно создать `icon-192.png` и `icon-512.png` в `frontend/public/`

---

## 🛣️ Возможные улучшения

- [ ] PWA иконки (сейчас заглушки)
- [ ] Пинг Render через cron-job.org
- [ ] Авторизация по PIN-коду
- [ ] Экспорт в Excel/PDF
- [ ] Push-уведомления
- [ ] Редактирование платежей
- [ ] Несколько квартир

---

*Последнее обновление: 2026-03-07 | Версия: 1.0.0 — первый рабочий деплой ✅*
