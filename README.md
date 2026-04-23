# 💳 Banking Ledger Backend API

A robust and scalable backend system for managing users, accounts, and financial transactions using a ledger-based architecture. Designed with strong consistency, secure authentication, and transactional integrity in mind.

---

## 🚀 Features

- 🔐 JWT-based Authentication & Authorization  
- 🚫 Token Blacklisting for secure logout  
- 👤 User & Account Management  
- 💸 Secure Money Transfer System  
- 📒 Ledger-based transaction tracking  
- 🔁 Idempotent transaction handling  
- 📧 Automated email notifications  
- 🧱 Scalable MVC architecture  

---

## 🧠 Tech Stack

- Backend: Node.js, Express.js  
- Database: MongoDB  
- Authentication: JSON Web Token (JWT)  
- Security: bcrypt (password hashing)  
- Email Service: Nodemailer  

---

## 🏗️ Architecture Overview

- Controllers → Handle API requests/responses  
- Models → Define schemas for users, accounts, ledger  
- Routes → Define REST endpoints  
- Middlewares → Authentication, validation, authorization  
- Services → Core business logic (transactions, ledger updates)  

---

## 🔐 Authentication & Security

- Implemented stateless authentication using JWT  
- Secured passwords using bcrypt hashing  
- Protected private routes with middleware-based authorization  
- Added token blacklist mechanism to invalidate JWTs after logout  
- Enforced token expiration policies for better session security  
- Included separate middleware for privileged system-user access

---

## 💸 Transaction System (Core Logic)

Implements a **ledger-based accounting system** to ensure accurate and traceable transactions.

### 🔁 10-Step Transaction Flow
1. Validate request
2. Validate idempotency key
3. Check account status
4. Derive sender balance from ledger
5. Create transaction (PENDING)
6. Create DEBIT ledger entry
7. Create CREDIT ledger entry
8. Mark transaction COMPLETED
9. Commit MongoDB session
10. Send email notification

---

## 🧾 Ledger Design

- Every transaction creates:
  - One **DEBIT entry** (sender)
  - One **CREDIT entry** (receiver)

👉 Ensures:
- Full auditability  
- No direct balance mutation  
- Balance derived from ledger entries  

---

## 🔁 Idempotency Handling

- Each transaction uses a unique **idempotency key**  
- Prevents duplicate transactions during retries  
- Ensures safe and consistent financial operations  

---

## 📧 Email Notifications

- Integrated Nodemailer for:
  - Registration confirmation  
  - Transaction alerts  

## 📌 Key Design Decisions

- Used ledger-based system instead of direct balance updates for consistency  
- Implemented idempotency to prevent duplicate financial operations  
- Used MongoDB transactions (sessions) for atomic operations  
- Added JWT blacklist support to invalidate logged-out tokens securely  
- Separated business logic using service layer for maintainability  
- Applied JWT for stateless and scalable authentication  
---

## 📡 API Endpoints

### 👤 Users

- `POST /auth/register` → Register user  
- `POST /auth/login` → Login user  

### 💳 Transactions

- `POST /transactions` → Transfer money  
- `GET /transactions` → Fetch transaction history  

---

## ⚙️ Setup & Installation

```bash
git clone https://github.com/Tiyas17/backend-ledger.git
cd banking-ledger
npm install
npm run dev

Follows a modular **MVC architecture**:

