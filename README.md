# 🚀 AI-Powered Campus Operations & Complaint Management System

## 📌 Overview
An intelligent full-stack web application designed to streamline campus complaint management using AI. This system automates complaint classification, worker assignment, communication, and performance tracking.

Built using a microservice architecture combining Node.js backend and Python AI services.

---

## 🎯 Problem Statement
Colleges face inefficiencies in handling complaints related to:
- Hostel facilities
- Infrastructure issues
- Mess services

Existing systems lack:
- Automation
- Transparency
- Intelligent task assignment
- Proper communication between students, workers, and administration

---

## 💡 Solution
This project provides a smart solution where:
- Students can raise complaints with images
- AI classifies complaints automatically
- Workers are assigned based on availability and role
- Emails are generated automatically
- Admins get real-time insights and control

---

## 🏗️ System Architecture

Frontend (React)
        ↓
Node.js Backend (Express API)
        ↓
 ┌───────────────┐
 ↓               ↓
MongoDB      Python AI Service (FastAPI)
                    ↓
           AI Classification + Email System

---

## 🧰 Tech Stack

### 🌐 Frontend
- React.js
- Tailwind CSS
- Axios

### ⚙️ Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Bcrypt (password hashing)
- JWT (optional)
- Nodemailer (email service)
- Multer (image upload)

### 🤖 AI Service
- Python
- FastAPI
- OpenAI API (or rule-based fallback)

### 🗄️ Database
- MongoDB (Local / Atlas)

---

## 🔐 Authentication System

Role-based login system:

- **Admin**
  - Login via email
- **Student**
  - Login via roll number
- **Worker**
  - Login via worker ID

Notes:
- No signup system
- Pre-created users
- Passwords are hashed using bcrypt

---

## 📦 Database Schema

### 👨‍🎓 Students
```json
{
  "rollNo": "22012345",
  "name": "Aryan",
  "password": "hashed",
  "hostel": "A"
}
