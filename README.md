# FinaxaCore — Finance Dashboard System
 
A full-stack finance dashboard with role-based access control, built with the MERN stack (MongoDB, Express, React, Node.js).
 
---
 
## 📦 Tech Stack
 
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Recharts, Lucide React |
| State Management | Context API |
| Backend | Node.js, Express 
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | express-validator |
| HTTP Client | Axios |
| Build Tool | Vite |
 
---
 
## 🏗️ Project Structure
 
```
finance-dashboard/
├── backend/
│   ├── config/
│   │   └── db.js                
│   ├── controllers/
│   │   ├── authController.js      
│   │   ├── userController.js     
│   │   ├── recordController.js   
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js              
│   │   ├── errorHandler.js       
│   │   └── validate.js           
│   ├── models/
│   │   ├── User.js               
│   │   └── FinancialRecord.js     
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── recordRoutes.js
│   │   └── dashboardRoutes.js          
│   ├── .env
│   ├── package.json
│   └── index.js                  
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── dashboard/
    │   │   │   └── StatCard.jsx
    │   │   ├── layout/
    │   │   │   ├── Layout.jsx   
    │   │   │   ├── Sidebar.jsx    
    │   │   │   └── LoadingScreen.jsx
    │   │   ├── records/
    │   │   │   ├── RecordModal.jsx  
    │   │   │   └── ConfirmModal.jsx  
    │   │   └── users/
    │   │       └── UserModal.jsx 
    │   ├── context/
    │   │   └── AuthContext.jsx 
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx  
    │   │   ├── RecordsPage.jsx   
    │   │   ├── UsersPage.jsx     
    │   │   └── ProfilePage.jsx  
    │   ├── utils/
    │   │   ├── api.js           
    │   │   └── helpers.js        
    │   ├── App.jsx               
    │   ├── main.jsx
    │   └── index.css             
    ├── .env
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```
 
---
 
## 🚀 Getting Started
 
### Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI
 
### 1. Clone & setup backend
 
```bash
cd backend
cp  .env
```
 
Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/financial
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```
 
```bash
npm install
```
 
### 3. Start the backend
 
```bash
npm run dev        # development (nodemon)
```
 
Backend runs on: `http://localhost:5000`
 
### 4. Setup and start frontend
 
```bash
cd ../frontend
cp  .env
 
Edit `.env`:
VITE_API_URL=http://localhost:5000/api

npm install
npm run dev
```
 
Frontend runs on: `http://localhost:5173`
 
---

## 🌐 Live Demo  
[Visit FinaxaCore](https://finaxacore.vercel.app)
 
## 👤 Demo Credentials
 
| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | admin@finance.com | Admin@123 | Full access |
| **Analyst** | analyst@finance.com | Analyst@123 | Read + Analytics |
| **Viewer** | viewer@finance.com | Viewer@123 | View only |
