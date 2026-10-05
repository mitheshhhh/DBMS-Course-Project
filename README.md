# 🚗 Smart Parking Management System

A complete full-stack parking management application with real-time database integration, built for a DBMS course project.

## 🎯 Project Overview

This system manages parking operations including customer registration, vehicle tracking, parking slot allocation, billing, and payment processing. It demonstrates a complete CRUD application with proper database design, transactions, and referential integrity.

## 🏗️ Architecture

```
Frontend (React 19 + TypeScript)
         ↓
Backend (Node.js + Express)
         ↓
Database (MySQL)
```

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **TanStack Start** + TanStack Router (file-based routing)
- **TanStack Query** for data fetching & caching
- **Tailwind CSS v4** for styling
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Node.js** + **Express.js**
- **MySQL2** for database connectivity
- **CORS** enabled for cross-origin requests
- **dotenv** for environment configuration

### Database
- **MySQL** with relational design
- 6 tables with proper foreign key constraints
- Transaction-based operations for data consistency

## 📊 Database Schema

### Tables (6)

1. **customer** - Customer information
2. **vehicle** - Vehicle registry linked to customers
3. **parking_slot** - Parking bay inventory
4. **parking_session** - Entry/exit records
5. **bill** - Billing records
6. **payment** - Payment transactions

### Entity Relationships

```
CUSTOMER (1) ──→ (N) VEHICLE (1) ──→ (N) PARKING_SESSION (N) ──→ (1) PARKING_SLOT
                                              ↓
                                            BILL (1) ──→ (N) PAYMENT
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MySQL database
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/mitheshhhh/DBMS-Course-Project.git
cd DBMS-Course-Project
```

2. **Install dependencies**
```bash
npm install
cd backend && npm install && cd ..
```

3. **Setup MySQL Database**
- Create database named `smart_parking_db`
- Import your database schema
- Update credentials in `backend/.env`

4. **Configure Environment**

Create `backend/.env`:
```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smart_parking_db
CORS_ORIGIN=http://localhost:8080
```

### Running the Application

**Option 1: Automated Script (Recommended)**
```bash
./start.sh
```

**Option 2: Manual Start**

Terminal 1 - Backend:
```bash
cd backend
npm start
```

Terminal 2 - Frontend:
```bash
npm run dev
```

Access the application at: **http://localhost:8080**

### Stopping the Application

```bash
./stop.sh
```

### Check Status

```bash
./status.sh
```

## ✨ Features

### Customer Management
- ✅ Add new customers
- ✅ View customer details with vehicles and parking history
- ✅ Edit customer information
- ✅ Delete customers (with dependency checks)
- ✅ Search customers by name, contact, or email

### Vehicle Management
- ✅ Register vehicles linked to customers
- ✅ Support for Cars and Bikes
- ✅ Edit vehicle details
- ✅ Delete vehicles (with session checks)
- ✅ Search by license plate or owner

### Parking Operations
- ✅ Start parking session (vehicle + slot)
- ✅ Real-time slot status (FREE/OCCUPIED)
- ✅ Complete parking session
- ✅ Automatic bill generation
- ✅ Transaction-based operations

### Dashboard & Analytics
- ✅ Real-time statistics
- ✅ Occupancy metrics
- ✅ Revenue tracking
- ✅ Activity feed
- ✅ Visual parking layout

### Additional Features
- ✅ Search and filter on all pages
- ✅ Responsive design
- ✅ Real-time data updates
- ✅ Loading states and error handling
- ✅ Confirmation dialogs for destructive actions

## 📁 Project Structure

```
├── src/
│   ├── routes/              # Frontend pages
│   │   ├── _app.tsx         # Main layout
│   │   ├── _app.index.tsx   # Dashboard
│   │   ├── _app.customers.tsx
│   │   ├── _app.vehicles.tsx
│   │   ├── _app.sessions.tsx
│   │   ├── _app.slots.tsx
│   │   ├── _app.bills.tsx
│   │   └── _app.payments.tsx
│   ├── components/          # Reusable components
│   ├── design-system/       # UI component library
│   ├── lib/
│   │   └── api.ts          # API client & types
│   └── styles.css          # Global styles
│
├── backend/
│   ├── server.js           # Express server
│   ├── config/
│   │   └── db.js          # MySQL connection
│   ├── controllers/       # Business logic
│   │   ├── customerController.js
│   │   ├── vehicleController.js
│   │   ├── slotController.js
│   │   ├── sessionController.js
│   │   ├── billController.js
│   │   ├── paymentController.js
│   │   └── dashboardController.js
│   ├── routes/           # API routes
│   │   ├── customerRoutes.js
│   │   ├── vehicleRoutes.js
│   │   ├── slotRoutes.js
│   │   ├── sessionRoutes.js
│   │   ├── billRoutes.js
│   │   └── paymentRoutes.js
│   └── middleware/
│       └── errorHandler.js
│
├── start.sh              # Start script
├── stop.sh              # Stop script
├── status.sh            # Status check script
└── START_HERE.md        # Quick reference guide
```

## 🔌 API Endpoints

### Dashboard
- `GET /api/health` - Health check
- `GET /api/stats` - Dashboard statistics
- `GET /api/activity` - Recent activity feed

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Vehicles
- `GET /api/vehicles` - List all vehicles
- `GET /api/vehicles/:id` - Get vehicle details
- `POST /api/vehicles` - Register vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Parking Slots
- `GET /api/slots` - List all slots
- `GET /api/slots/:id` - Get slot details

### Parking Sessions
- `GET /api/sessions` - List all sessions
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions` - Start parking session
- `PUT /api/sessions/:id` - Complete session

### Bills & Payments
- `GET /api/bills` - List all bills
- `GET /api/payments` - List all payments

### Search
- `GET /api/search/customer?name=<name>` - Search customers

## 🔐 Security Features

- ✅ Parameterized SQL queries (SQL injection prevention)
- ✅ Input validation on backend
- ✅ CORS configuration
- ✅ Environment-based configuration
- ✅ Transaction-based operations
- ✅ Foreign key constraint checks

## 🎓 Learning Outcomes

This project demonstrates:

1. **Database Design** - Normalized relational schema with proper constraints
2. **CRUD Operations** - Complete Create, Read, Update, Delete functionality
3. **Transaction Management** - ACID properties for parking operations
4. **API Design** - RESTful API with proper HTTP methods and status codes
5. **Frontend-Backend Integration** - Real-time data synchronization
6. **State Management** - React Query for caching and updates
7. **Error Handling** - Graceful degradation and user feedback
8. **Security** - SQL injection prevention and input validation

## 📝 Course Project Details

**Course**: Database Management Systems (DBMS)  
**Institution**: [Your Institution Name]  
**Academic Year**: 2026  

### Project Requirements Met

- ✅ Relational database design
- ✅ ER diagram implementation
- ✅ Normalization (3NF)
- ✅ CRUD operations on all entities
- ✅ Complex queries with JOINs
- ✅ Transaction management
- ✅ Referential integrity
- ✅ Full-stack implementation
- ✅ User interface
- ✅ Documentation

## 🤝 Contributing

This is a course project. For improvements or suggestions:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is created for educational purposes as part of a DBMS course.

## 👥 Authors

- **Mithesh** - Initial work and development

## 🙏 Acknowledgments

- Course instructor for project guidance
- TanStack team for excellent React libraries
- MySQL documentation and community

---

**Built with ❤️ for DBMS Course Project**
