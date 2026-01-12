# Backend Setup Guide

## Quick Start

1. **Navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   Create a `.env` file in the `backend` folder with the following content:
   ```
   PORT=5000
   DATABASE_URL='postgresql://neondb_owner:npg_KOZuxYB01GHq@ep-withered-feather-ahvoc457-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
   NODE_ENV=development
   LOG_LEVEL=info

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
   JWT_EXPIRE=7d

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=dba4cop9z
   CLOUDINARY_API_KEY=681897112117752
   CLOUDINARY_API_SECRET=NsL8FqD5ccvKAH2ps8d2S-9t1wo

   # Razorpay
   RAZORPAY_KEY_ID=rzp_test_Rt8mnuQxtS0eot
   RAZORPAY_KEY_SECRET=u9vHfRKAbatwQBRVWT33Ykst

   # SMTP
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=ayushzala4460@gmail.com
   SMTP_PASS=ombq ghse xhcw dyuz
   SMTP_FROM=noreply@badabuilder.com
   ```

4. **Run database migrations**
   ```bash
   npm run migrate
   ```
   This will create all necessary tables in your PostgreSQL database.

5. **Start the server**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

6. **Test the server**
   Visit `http://localhost:5000/health` in your browser or use:
   ```bash
   curl http://localhost:5000/health
   ```

## API Base URL

All API endpoints are prefixed with `/api`:
- Base URL: `http://localhost:5000/api`

## Testing Authentication

1. **Register a user**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "name": "Test User",
       "phone": "1234567890"
     }'
   ```

2. **Login**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

3. **Use the token**
   ```bash
   curl -X GET http://localhost:5000/api/auth/me \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

## Important Notes

- **JWT_SECRET**: Change this to a strong random string in production (minimum 32 characters)
- **Database**: Ensure your PostgreSQL database is accessible and the connection string is correct
- **CORS**: Update `FRONTEND_URL` in `.env` if your frontend runs on a different port/domain
- **Rate Limiting**: Default is 100 requests per 15 minutes per IP

## Troubleshooting

### Database Connection Error
- Verify your `DATABASE_URL` is correct
- Check if your database server is running
- Ensure SSL is properly configured

### Port Already in Use
- Change `PORT` in `.env` to a different port
- Or stop the process using port 5000

### Migration Errors
- Ensure database is accessible
- Check if tables already exist (migration is idempotent)
- Review error messages for specific issues
