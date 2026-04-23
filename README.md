# 💳 Banking Ledger Backend API

A robust and scalable backend system for managing users, accounts, and financial transactions using a ledger-based architecture. Designed with strong consistency, secure authentication, and transactional integrity in mind.

---

## 🚀 Features

- 🔐 JWT-based Authentication & Authorization  
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

- Stateless authentication using JWT  
- Passwords securely hashed using bcrypt  
- Middleware-based route protection  
- Token expiration policies for enhanced security  

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
git clone https://github.com/your-username/banking-ledger.git
cd banking-ledger
npm install
npm run dev

Follows a modular **MVC architecture**:

