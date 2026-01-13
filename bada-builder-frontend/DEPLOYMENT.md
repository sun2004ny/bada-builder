# Deployment Configuration

## Environment URLs

- **Frontend (Production)**: https://bada-builder-nine.vercel.app/
- **Backend (Production)**: https://bada-builder.onrender.com

## Environment Variables Setup

### Frontend (Vercel)
Make sure to set these environment variables in your Vercel dashboard:

```
VITE_API_URL=https://bada-builder.onrender.com/api
VITE_FIREBASE_API_KEY=AIzaSyCJo7eUuF3nm8GoTzOrpFBJb_k00I6v1wg
VITE_FIREBASE_AUTH_DOMAIN=original-badabuilder.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=original-badabuilder
VITE_FIREBASE_STORAGE_BUCKET=original-badabuilder.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=988327451876
VITE_FIREBASE_APP_ID=1:988327451876:web:ee9b8875918495756720f1
VITE_FIREBASE_MEASUREMENT_ID=G-C5014YM6M6
VITE_RAZORPAY_KEY_ID=rzp_test_Rt8mnuQxtS0eot
VITE_RAZORPAY_KEY_SECRET=u9vHfRKAbatwQBRVWT33Ykst
VITE_EMAILJS_SERVICE_ID=service_qmttnco
VITE_EMAILJS_TEMPLATE_ID=template_zec9hdc
VITE_EMAILJS_PUBLIC_KEY=3Ibld63W4s4CR6YEE
```

### Backend (Render)
Make sure to set these environment variables in your Render dashboard:

```
PORT=5000
DATABASE_URL=postgresql://neondb_owner:npg_KOZuxYB01GHq@ep-withered-feather-ahvoc457-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
FRONTEND_URL=https://bada-builder-nine.vercel.app
NODE_ENV=production
JWT_SECRET=sunny
CLOUDINARY_CLOUD_NAME=dba4cop9z
CLOUDINARY_API_KEY=681897112117752
CLOUDINARY_API_SECRET=NsL8FqD5ccvKAH2ps8d2S-9t1wo
RAZORPAY_KEY_ID=rzp_test_Rt8mnuQxtS0eot
RAZORPAY_KEY_SECRET=u9vHfRKAbatwQBRVWT33Ykst
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ayushzala4460@gmail.com
SMTP_PASS=ombq ghse xhcw dyuz
SMTP_FROM=noreply@badabuilder.com
```

## Deployment Steps

1. **Frontend**: Push changes to your repository connected to Vercel
2. **Backend**: Push changes to your repository connected to Render
3. Both services should automatically redeploy with the new configurations

## CORS Configuration

The backend is now configured to accept requests from your Vercel frontend URL. The CORS settings in `server.js` will use the `FRONTEND_URL` environment variable.