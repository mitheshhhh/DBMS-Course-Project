# Setup Instructions

## After Cloning the Repository

1. **Install Dependencies**
```bash
npm install
cd backend && npm install && cd ..
```

2. **Configure Database Connection**

Edit `backend/.env` and replace `your_mysql_password_here` with your actual MySQL password:

```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=smart_parking_db
CORS_ORIGIN=http://localhost:8080
```

3. **Setup MySQL Database**

Create the database and import your schema:
```sql
CREATE DATABASE smart_parking_db;
USE smart_parking_db;

-- Import your SQL schema file here
-- Or create tables as per your database design
```

4. **Start the Application**

```bash
./start.sh
```

This will automatically:
- Check MySQL connection using the password from `.env`
- Start backend on port 4000
- Start frontend on port 8080

5. **Access the Application**

Open http://localhost:8080 in your browser

## Important Notes

- Never commit your actual MySQL password to Git
- The `.env` file in the repository contains a placeholder
- Update `.env` with your local credentials after cloning
- The `start.sh` and `status.sh` scripts will read the password from `.env` automatically
