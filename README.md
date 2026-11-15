# ClientFlow CRM 🚀

A modern CRM and invoicing platform built for digital agencies and freelancers. Manage clients, track leads, create professional invoices, and print or save them as PDF, all from one clean dashboard.

**Live Demo:** https://clientflow-crm-red.vercel.app/

---

## 📌 The Problem

Freelancers and small agencies often manage clients in spreadsheets, create invoices in random templates, and track payments in chat messages. This leads to lost leads, late payments, and an unprofessional image.

## ✅ The Solution

ClientFlow brings everything into one place:
- A clear view of revenue, active clients and pending invoices
- A searchable client pipeline (Lead → Active → Completed)
- A split-screen invoice builder with a live A4 preview
- One-click print / Save as PDF
- Full branding control (agency name, logo initials, accent color, currency)

---

## ✨ Features

### 📊 Dashboard
- KPI cards: total revenue (from paid invoices), active clients, pending invoices
- Revenue analytics chart
- Recent activity feed

### 👥 Client CRM
- Add, search, filter and delete clients
- Status tags: Lead, Active, Completed
- Live stats for each status
- Custom confirmation popups

### 🧾 Invoice Builder
- Select a client, add multiple line items
- Tax and discount calculation
- Live A4 invoice preview while typing
- Save, edit and delete invoices
- Print / Save as PDF

### ⚙️ Settings
- Agency profile (name, owner, email, phone, address)
- Branding (accent color, logo initials) applied across the app
- Currency selection (USD, EUR, GBP, PKR, AED)
- Invoice defaults (number prefix, default tax, payment terms)

### 📱 Responsive Design
- Desktop sidebar and mobile slide-in menu
- Works on phones, tablets and desktops

### 💾 Data Storage
- All data is saved in the browser's LocalStorage
- No login or backend required for the demo

---

## 🛠️ Tech Stack

- **HTML5** and **CSS3** (Tailwind CSS via CDN, custom styles)
- **Vanilla JavaScript** (no framework)
- **Chart.js** for analytics charts
- **Lucide Icons** for the icon set
- **LocalStorage** for data persistence
- **Vercel** for hosting

---

## 📂 Project Structure

clientflow-crm/
├── index.html       # App layout and structure
├── css/
│   └── styles.css   # Theme, glass UI, animations and print styles
├── js/
│   └── app.js       # Application logic (CRM, invoices, settings)
└── README.md

---

## 🚀 Getting Started

1. Clone or download this repository.
2. Open `index.html` in any modern browser.
3. That's it. No installation or build step is needed.

---

## 🧪 How to Test

1. Go to **Clients** and add a new client.
2. Go to **Invoices → New Invoice**, fill in the details and watch the live preview.
3. Click **Save Invoice**, then check the Dashboard revenue.
4. Go to **Settings**, change the agency name or accent color, and save.

---

## 🔭 Future Improvements

- Backend database (Supabase) for multi-user login
- Email invoices directly to clients
- Payment gateway integration (Stripe)
- Recurring invoices and payment reminders

---

## 👨‍💻 Author

**Daniyal Dynihmind**
Vibe Coder and Full-Stack Builder | Karachi, Pakistan

- GitHub: [@Daniyal-Dynihmind](https://github.com/Daniyal-Dynihmind)
- Open for freelance and client projects

If you like this project, give it a ⭐ on GitHub!
