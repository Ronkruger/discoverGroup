# 🧪 Local Testing Guide

## ✅ Current Status

All three development servers are running:

| Service | URL | Status |
|---------|-----|--------|
| **Client** | http://localhost:5173 | ✅ Running |
| **Admin** | http://localhost:5174 | ✅ Running |
| **API** | http://localhost:4000 | ✅ Connected to MongoDB |

---

## 📋 Testing Checklist

### 1️⃣ Test API (Backend)

#### Basic Health Check
Open these URLs in your browser:

✅ **Health Check:** http://localhost:4000/health  
Expected: `{"ok":true}`

✅ **API Info:** http://localhost:4000/  
Expected: JSON with available endpoints

✅ **Public Tours:** http://localhost:4000/public/tours  
Expected: Array of tours (may be empty if no tours in DB)

#### Check API Logs
Look at your terminal for:
- ✅ `MongoDB connected`
- ✅ `API server listening on http://localhost:4000`
- ✅ `SendGrid initialized successfully`
- ✅ `STRIPE_SECRET_KEY: Available`

---

### 2️⃣ Test Client Site (Customer Facing)

Open: **http://localhost:5173**

#### Homepage Tests
- [ ] Homepage loads without errors
- [ ] Hero section displays
- [ ] Navigation menu works
- [ ] Footer displays
- [ ] Language switcher works

#### Tours Page Tests
- [ ] Browse tours page loads
- [ ] Tours display (if any exist in DB)
- [ ] Search functionality works
- [ ] Filters work
- [ ] Tour cards are clickable

#### Tour Details Tests
- [ ] Click on a tour → Details page loads
- [ ] Tour information displays
- [ ] Departure dates show
- [ ] "Book Now" button works
- [ ] Image gallery works

#### Booking Flow Tests
- [ ] Click "Book Now" → Booking page loads
- [ ] Form validation works
- [ ] Can fill in customer details
- [ ] Date selection works
- [ ] Can proceed to payment (test mode)
- [ ] Stripe test card works: `4242 4242 4242 4242`

#### Check Browser Console
Open DevTools (F12) → Console tab
- Look for any errors (red text)
- Verify API calls are successful
- Check network tab for 200 status codes

---

### 3️⃣ Test Admin Panel (Management)

Open: **http://localhost:5174**

#### Login Tests
- [ ] Login page loads
- [ ] Can enter credentials
- [ ] Login form validation works
- [ ] Can log in (if you have admin credentials)
- [ ] Redirects to dashboard after login

#### Dashboard Tests
- [ ] Dashboard loads
- [ ] Statistics display
- [ ] Charts/graphs render
- [ ] Recent bookings show

#### Tour Management Tests
- [ ] Tours list page loads
- [ ] Can view all tours
- [ ] "Add Tour" button works
- [ ] Can create a new tour with:
  - Title
  - Description
  - Price
  - Departure dates
  - Images (upload)
- [ ] Can edit existing tour
- [ ] Can delete tour (with confirmation)
- [ ] Changes immediately reflect in DB

#### Bookings Management Tests
- [ ] Bookings page loads
- [ ] List of all bookings displays
- [ ] Can view booking details
- [ ] Can filter bookings (pending, confirmed, cancelled)
- [ ] Can update booking status
- [ ] Can search bookings

#### Customer Service Tests
- [ ] Customer inquiries page loads
- [ ] Can view messages/inquiries
- [ ] Can respond to inquiries

---

### 4️⃣ End-to-End Integration Test

This tests the full flow from admin → API → client:

1. **Admin creates a tour:**
   - Go to http://localhost:5174
   - Log in
   - Add a new tour with name "Test Tour E2E"
   - Set price: $999
   - Add departure date: Next month
   - Save tour

2. **Verify in API:**
   - Check terminal logs for database save
   - Visit: http://localhost:4000/public/tours
   - Confirm "Test Tour E2E" appears in JSON

3. **Verify on Client:**
   - Go to http://localhost:5173/tours
   - Refresh the page
   - Confirm "Test Tour E2E" appears in the tour list
   - Click on it → Details page shows correct info

4. **Make a booking:**
   - On client, click "Book Now" on "Test Tour E2E"
   - Fill in booking form
   - Use Stripe test card: `4242 4242 4242 4242`
   - Complete booking

5. **Verify booking in Admin:**
   - Go back to admin panel
   - Navigate to Bookings page
   - Confirm new booking appears
   - Check booking details match what was entered

✅ **If all above works → Your app is working perfectly!**

---

## 🐛 Troubleshooting

### Client can't connect to API

**Symptoms:** 
- Client shows "Loading..." forever
- Network errors in browser console
- CORS errors

**Fix:**
1. Check API is running on port 4000
2. Check `.env` has `VITE_API_BASE_URL=http://localhost:4000`
3. Restart client: Stop dev server, run `npm run dev:client`

---

### Admin can't connect to API

**Symptoms:**
- Admin shows "Cannot connect to server"
- 404 or 500 errors

**Fix:**
1. Check `apps/admin/.env` exists and has API URL
2. Create if missing:
   ```
   VITE_API_URL=http://localhost:4000
   VITE_ADMIN_API_URL=http://localhost:4000
   ```
3. Restart admin server

---

### MongoDB connection failed

**Symptoms:**
- Terminal shows "MongoDB connection error"
- API crashes on startup

**Fix:**
1. Make sure MongoDB is running locally
2. Check connection string in `apps/api/.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/discovergroup
   ```
3. OR use MongoDB Atlas (cloud):
   - Create free cluster at mongodb.com
   - Get connection string
   - Update `MONGODB_URI` in `.env`

---

### Stripe payment fails

**Symptoms:**
- Payment form shows error
- "Invalid API key" error

**Fix:**
1. Check `apps/api/.env` has valid `STRIPE_SECRET_KEY`
2. Check `.env` has valid `VITE_STRIPE_PUBLISHABLE_KEY`
3. Both should start with `sk_test_` and `pk_test_` respectively
4. Get keys from: https://dashboard.stripe.com/test/apikeys

---

### Port already in use

**Symptoms:**
- "Error: listen EADDRINUSE: address already in use"

**Fix:**
```powershell
# Find and kill process using port
Get-NetTCPConnection -LocalPort 5173,5174,4000 | Select OwningProcess -Unique
Stop-Process -Id <ProcessID>

# Then restart
npm run dev
```

---

## 🎯 Next Steps After Local Testing

Once everything works locally:

1. ✅ All tests passed
2. 📝 Document any issues you found
3. 🚀 Ready for deployment!

### Deployment Order:
1. **First:** Deploy API to Railway
2. **Second:** Deploy Client to Netlify
3. **Third:** Deploy Admin to Netlify
4. **Finally:** Update environment variables to connect them

See **DEPLOYMENT_GUIDE.md** for deployment instructions.

---

## 💡 Tips

- Keep the terminal open to see real-time logs
- Use browser DevTools (F12) to debug frontend issues
- Check API terminal for backend errors
- Test in incognito mode to avoid cached issues
- Clear browser cache if you see old data

---

## ✅ Testing Complete Checklist

Before deploying, ensure:

- [ ] API health endpoint responds
- [ ] Client homepage loads
- [ ] Admin panel login works
- [ ] Can create tour in admin
- [ ] Tour appears on client
- [ ] Booking flow works end-to-end
- [ ] Stripe test payment succeeds
- [ ] No console errors in browser
- [ ] No errors in API terminal
- [ ] MongoDB connection stable

**All checked? You're ready to deploy! 🚀**
