# Library Management System - Layered Architecture

## 📋 Project Information
- **Student Name:** นัฐพงศ์ รอดอินทร์
- **Student ID:** 67543210020-3
- **Course:** ENGSE207 Software Architecture

## 🏗️ Architecture Style
Layered Architecture (3-tier)

## 📂 Project Structure
midterm-individual-67543210020-3/
├── src/
│ ├── presentation/
│ │ ├── routes/ # Route definitions (HTTP paths → controller)
│ │ ├── controllers/ # Handle req/res and call service
│ │ └── middlewares/ # Centralized error handling
│ ├── business/
│ │ ├── services/ # Business logic and rules
│ │ └── validators/ # Validation (ID, ISBN, required fields)
│ └── data/
│ ├── repositories/ # DB operations (SQL)
│ └── database/ # DB connection & initialization
├── server.js # Entry point
├── package.json
├── README.md
├── ARCHITECTURE.md
└── public/


## 🎯 Refactoring Summary

### ปัญหาของ Monolithic (เดิม):
- โค้ดทุกอย่างอยู่ในไฟล์เดียว (server.js) ทำให้ยาวและอ่านยาก
- แก้ไขส่วนหนึ่งกระทบส่วนอื่นง่าย (ไม่มี separation of concerns)
- ทีมทำงานร่วมกันยาก เพราะแก้ไฟล์เดียว conflict บ่อย
- Business logic/Validation/SQL ปนกับ HTTP handling
- ทดสอบแยกส่วน (unit test) ทำได้ยาก

### วิธีแก้ไขด้วย Layered Architecture:
- แยก Presentation (routes/controllers) ออกจาก Business (services/validators) และ Data (repositories/database)
- Controller ทำหน้าที่เฉพาะรับ request/ส่ง response
- Service รวม business rules (borrow/return/delete, statistics)
- Repository แยกการเขียน SQL และการเชื่อมต่อ DB เป็นสัดส่วน

### ประโยชน์ที่ได้รับ:
- โค้ดอ่านง่ายและบำรุงรักษาง่ายขึ้น
- ลดผลกระทบข้ามส่วน (change impact ต่ำลง)
- ทีมแบ่งงานได้ชัดเจนตาม layer
- รองรับการขยายฟีเจอร์ในอนาคตง่ายขึ้น
- ทำ testing ทีละ layer ได้ง่ายขึ้น

## 🚀 How to Run

```bash
# 1. Clone repository
git clone <repository_url>

# 1. Install dependencies
npm install

# 2. Run server
npm start

# 3. Open
# http://localhost:3000

## 📝 API Endpoints
GET /api/books (optional query: ?status=available|borrowed)

GET /api/books/:id

POST /api/books

PUT /api/books/:id

PATCH /api/books/:id/borrow

PATCH /api/books/:id/return

DELETE /api/books/:id