# Haute Events

## Run it
1. Install Node.js from https://nodejs.org (LTS version)
2. Open a terminal in this folder and run:
   npm install
   npm run dev
3. Open the link it prints (usually http://localhost:5173)

## Folder guide
- index.html            : the single HTML page React fills in
- src/main.jsx          : starts React
- src/App.jsx           : arranges the page sections
- src/components/       : one folder per section (.jsx = structure, .css = styling)
- src/data/siteData.js  : text and lists (edit content here)
- src/styles/global.css : colours, fonts, resets
- src/assets/           : put your images here (e.g. hero.jpg)





# 🎉 Event Connect – Event Planning & Service Booking Platform

## 📌 Project Overview

**Event Connect** is a web-based event planning and service booking platform designed to simplify the process of organizing events. It connects customers with professional event service providers through a single platform.

Users can easily discover services, compare prices, check provider reviews, make bookings, manage payments, and communicate with service providers.

The platform provides a user-friendly experience for customers, service providers, and administrators.

## 🎯 Project Objectives

- Simplify event planning and management.
- Connect customers with trusted event service providers.
- Provide an easy online service booking system.
- Improve communication between customers and providers.
- Ensure secure user authentication and authorization.
- Help customers manage their event budgets.
- Provide an efficient platform for service providers to manage bookings and earnings.

## 👥 User Roles

### 1. Customer
Customers can:
- Register and log in securely.
- Browse available event services.
- View provider profiles, prices, discounts, and reviews.
- Book event services.
- Manage and track bookings.
- Manage payments and event budgets.
- Communicate with service providers.
- Give ratings and reviews.

### 2. Service Provider
Service providers can:
- Register and manage their profiles.
- Create and manage services.
- Upload service images and descriptions.
- Manage booking requests.
- Accept or reject bookings.
- Manage availability.
- Track earnings and payments.
- Communicate with customers.
- Manage subscriptions and memberships.

### 3. Admin
Administrators can:
- Manage customers and service providers.
- Verify service providers.
- Manage services and categories.
- Monitor bookings.
- Manage payments and platform commissions.
- Manage provider subscriptions.
- Handle complaints and disputes.
- View platform reports and analytics.

## ✨ Main Features

- User Registration and Login
- Role-Based Authentication and Authorization
- Customer Dashboard
- Service Provider Dashboard
- Admin Dashboard
- Service Browsing and Searching
- Online Booking Management
- Booking Status Tracking
- Payment Management
- Provider Subscription Management
- Customer Reviews and Ratings
- Customer–Provider Messaging
- Event Budget Management
- Provider Verification

## 🛠️ Technology Stack

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Bootstrap
- Axios
- React Router
- Lucide React

### Backend
- Node.js
- Express.js
- RESTful APIs
- JSON Web Token (JWT)
- bcryptjs

### Database
- MongoDB
- Mongoose

### Development Tools
- Visual Studio Code
- Postman
- Git
- GitHub
- Figma

### Deployment
- Vercel (Frontend)
- Render (Backend)
- MongoDB Atlas (Cloud Database)

## 🏗️ Project Architecture

The project follows a MERN Stack architecture.

1. **Frontend:** Provides the user interface and communicates with the backend through REST APIs.
2. **Backend:** Handles business logic, authentication, authorization, and API requests.
3. **Database:** Stores user details, service information, bookings, payments, and other application data.

## 🔐 Security Features

- Password hashing using bcryptjs.
- JWT-based user authentication.
- Role-based access control.
- Protected API routes.
- Booking ownership verification.
- Input validation.
- Environment variable protection.

## 💼 Business Model

Event Connect follows a service-based business model.

- Customers receive three bookings through a one-time registration fee.
- Service providers pay a monthly registration or subscription fee to activate their services.
- The platform receives a 20% commission from each service payment.

## 📂 Project Structure

```text
Event-Connect/
│
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── Backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Make sure the following tools are installed:

- Node.js
- npm
- MongoDB or MongoDB Atlas
- Visual Studio Code
- Git

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the Project

```bash
cd Event-Connect
```

### 3. Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

### 4. Backend Setup

Open another terminal:

```bash
cd Backend
npm install
```

### 5. Configure Environment Variables

Create a `.env` file inside the Backend folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 6. Start the Backend Server

```bash
npm run dev
```

The backend server will run on:

```text
http://localhost:5000
```

## 🚀 Future Enhancements

- AI-powered event recommendations.
- Online contract generation.
- Automated event budget planning.
- Secure online payment gateway integration.
- International event service support.
- Advanced analytics and reporting.
- Real-time chat notifications.

## 🎓 Project Information

**Project Name:** Event Connect

**Project Type:** Full Stack Web Application

**Architecture:** MERN Stack

**Development Purpose:** Final Project / Startup Concept

**Target Users:** Customers, Event Service Providers, and Administrators.

## 👩‍💻 Developed By

**Kavishanjali**

Full Stack Development Student

UKI – Dream Space

---

⭐ If you find this project interesting, feel free to explore the repository and follow its development.

**Event Connect – Making Every Event Special! 🎉**