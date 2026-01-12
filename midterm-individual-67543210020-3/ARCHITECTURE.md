# ARCHITECTURE.md — Library Management System (Layered Architecture)

> **Student:** นัฐพงศ์ รอดอินทร์ (67543210020-3)  
> **Course:** ENGSE207 Software Architecture

---

## C1: Context Diagram (System Context)

ระบบ Library Management System ให้บริการ REST API ผ่าน Express โดยผู้ใช้/นักพัฒนาสามารถเรียกใช้งานผ่าน Browser, Postman, Thunder Client ได้ และระบบจัดเก็บข้อมูลใน SQLite (`library.db`)

┌──────────────────────────┐
│     User / Developer     │
│ (Browser / Postman etc.) │

              │ HTTP/REST
              ▼
┌──────────────────────────┐
│Library Management System │
│ (Node.js + Express)      │

              │ SQL (via sqlite3)
              ▼
┌──────────────────────────┐
│     SQLite Database      │
│      (library.db)        │
└──────────────────────────┘


**External Actors**
- User/Developer: เรียกใช้งาน API เพื่อจัดการข้อมูลหนังสือ (CRUD, borrow, return)

**External System**
- SQLite: ฐานข้อมูลแบบไฟล์สำหรับเก็บข้อมูลตาราง `books`

---

## C2: Container Diagram (Layered Architecture — 3 Tier)

โครงสร้างระบบถูก Refactor จาก Monolithic เป็น Layered Architecture เพื่อแยก concerns ตามหน้าที่


┌─────────────────────────────────────┐
│ Presentation Layer                  │
│ ┌──────────────────────────────┐    │
│ │ Routes → Controllers         │    │
│ │ (HTTP Handling)              │    │
│ └──────────────────────────────┘    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Business Logic Layer                │
│ ┌──────────────────────────────┐    │
│ │ Services → Validators        │    │
│ │ (Business Rules)             │    │
│ └──────────────────────────────┘    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Data Access Layer                   │
│ ┌──────────────────────────────┐    │
│ │ Repositories → Database      │    │
│ │ (SQL Queries)                │    │
│ └──────────────────────────────┘    │
└──────────────┬──────────────────────┘
               │
               ▼
          ┌──────────┐
          │ SQLite   │
          └──────────┘

          
---

## Responsibilities (หน้าที่ของแต่ละ Layer)

### 1) Presentation Layer (Routes / Controllers / Middlewares)
**Location:** `src/presentation/`  
**Responsibilities**
- กำหนดเส้นทาง API (Routes) เช่น `/api/books`, `/api/books/:id`
- รับ HTTP request และจัดการ HTTP response (Controllers)
- ส่งต่อข้อมูลไปยัง Business Layer ผ่าน Service
- จัดการ error แบบรวมศูนย์ (Error Handling Middleware) เช่น map เป็น 400/404/409/500

**What it should NOT do**
- ไม่เขียน SQL
- ไม่รวม business rules ลึก ๆ (เช่น ห้ามลบหนังสือที่ถูกยืม) — ให้เป็นหน้าที่ของ Service

---

### 2) Business Logic Layer (Services / Validators)
**Location:** `src/business/`  
**Responsibilities**
- ตรวจสอบความถูกต้องของข้อมูล (Validators)
  - ตรวจ `id` ต้องเป็นเลข > 0
  - ตรวจ `isbn` format
  - ตรวจ required fields: `title`, `author`, `isbn`
- ประมวลผล business rules (Services)
  - borrow: ยืมได้เฉพาะ status = `available`
  - return: คืนได้เฉพาะ status = `borrowed`
  - delete: ห้ามลบถ้า status = `borrowed`
  - getAll: คำนวณสถิติ `available/borrowed/total`
- เรียก Data Layer (Repository) เพื่ออ่าน/เขียนฐานข้อมูล
- ส่งผลลัพธ์กลับไปให้ Controller

**What it should NOT do**
- ไม่จัดการ HTTP โดยตรง (เช่น res.json)
- ไม่ผูกกับ Express มากเกินไป เพื่อให้ทดสอบได้ง่าย

---

### 3) Data Access Layer (Repositories / Database Connection)
**Location:** `src/data/`  
**Responsibilities**
- จัดการการเชื่อมต่อ SQLite และสร้างตารางเริ่มต้น (`connection.js`)
- จัดการคำสั่ง SQL ทั้งหมดผ่าน Repository (`bookRepository.js`)
  - `findAll`, `findById`, `create`, `update`, `updateStatus`, `delete`
- คืนค่าเป็น Promise ให้ Service ใช้งานง่าย (ลด callback ซ้อน)

**What it should NOT do**
- ไม่ทำ validation หรือ business rule
- ไม่รู้เรื่อง HTTP request/response

---

## Data Flow (Request → Response)

ด้านล่างเป็น flow มาตรฐานที่เกิดขึ้นในระบบทุก endpoint

### Flow Template
1. **Client** ส่ง HTTP Request ไปที่ API Endpoint
2. **Route** ชี้ไปยัง Controller function ที่ตรงกับ endpoint
3. **Controller** รับข้อมูลจาก `req` และเรียก Service
4. **Service** ทำ validation + business rules แล้วเรียก Repository
5. **Repository** ทำ SQL กับ SQLite และคืนผลลัพธ์กลับ
6. **Service** ส่งผลลัพธ์กลับ Controller
7. **Controller** ส่ง HTTP Response กลับ Client
8. หากเกิด error → ส่งไปที่ `errorHandler` เพื่อคืน status code ที่ถูกต้อง

---

### Example 1: GET /api/books?status=available
**Goal:** ดึงหนังสือทั้งหมด และสรุปสถิติ

1) Client → `GET /api/books?status=available`  
2) Routes → `bookController.getAllBooks`  
3) Controller อ่าน `req.query.status` แล้วเรียก `bookService.getAllBooks(status)`  
4) Service:
   - validate status (ถ้ามี)
   - `bookRepository.findAll(status)`
   - คำนวณ statistics: available/borrowed/total  
5) Controller → `res.json({ books, statistics })`  

---

### Example 2: PATCH /api/books/:id/borrow
**Goal:** ยืมหนังสือ

1) Client → `PATCH /api/books/5/borrow`  
2) Routes → `bookController.borrowBook`  
3) Controller เรียก `bookService.borrowBook(5)`  
4) Service:
   - validate id
   - `repository.findById(5)` (ถ้าไม่เจอ → NotFoundError = 404)
   - ตรวจ `status !== borrowed` (ถ้ายืมอยู่แล้ว → ValidationError = 400)
   - `repository.updateStatus(5, 'borrowed')`  
5) Controller → `res.json(updatedBook)`  

---

### Example 3: DELETE /api/books/:id
**Goal:** ลบหนังสือ (ห้ามลบถ้าถูกยืม)

1) Client → `DELETE /api/books/5`  
2) Routes → `bookController.deleteBook`  
3) Controller เรียก `bookService.deleteBook(5)`  
4) Service:
   - validate id
   - `repository.findById(5)` (ไม่เจอ → 404)
   - ถ้า `status === 'borrowed'` → throw ValidationError (400)
   - `repository.delete(5)`  
5) Controller → `res.json({ message: 'Book deleted successfully' })`  

---

## Error Handling Strategy (Summary)
ระบบใช้ middleware กลาง `errorHandler` เพื่อให้การตอบ error เป็นมาตรฐานเดียวกันทั้งระบบ:
- **ValidationError** → `400 Bad Request`
- **NotFoundError** → `404 Not Found`
- **ConflictError** → `409 Conflict`
- อื่น ๆ → `500 Internal Server Error`
