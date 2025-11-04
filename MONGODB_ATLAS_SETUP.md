# MongoDB Atlas Setup Guide

## Why You Need This

Your local MongoDB (`mongodb://localhost:27017`) won't work on Railway. You need a cloud database.

## Step-by-Step: MongoDB Atlas Setup (FREE)

### 1. Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (FREE forever tier available)
3. Verify your email

### 2. Create a Cluster
1. Click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox)
3. Cloud Provider: AWS
4. Region: Choose closest to you
5. Cluster Name: `discovergroup`
6. Click "Create Cluster"

### 3. Create Database User
1. Under "Security" → "Database Access"
2. Click "Add New Database User"
3. Authentication: Password
4. Username: `discovergroup_user`
5. Password: **Generate a secure password** (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 4. Whitelist IP Addresses
1. Under "Security" → "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is safe because you have username/password
4. Click "Confirm"

### 5. Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Driver: Node.js
4. Version: 4.1 or later
5. Copy the connection string:
   ```
   mongodb+srv://discovergroup_user:<password>@discovergroup.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name before `?`:
   ```
   mongodb+srv://discovergroup_user:YOUR_PASSWORD@discovergroup.xxxxx.mongodb.net/discovergroup?retryWrites=true&w=majority
   ```

### 6. Update Your Local .env (Test First)
Update `apps/api/.env`:
```
MONGODB_URI=mongodb+srv://discovergroup_user:YOUR_PASSWORD@discovergroup.xxxxx.mongodb.net/discovergroup?retryWrites=true&w=majority
```

### 7. Test Locally
```bash
# Restart your dev server
npm run dev
```

Check terminal for "MongoDB connected" message.

### 8. Use in Railway
When deploying to Railway, use this same connection string for the `MONGODB_URI` environment variable.

---

## Alternative: Railway MongoDB Plugin

Railway also offers a MongoDB plugin:

1. In Railway project
2. Click "New" → "Database" → "Add MongoDB"
3. Railway will provide connection string automatically
4. Use that for `MONGODB_URI`

**Note:** Railway MongoDB is paid after trial period. MongoDB Atlas free tier is better for long-term.

---

## Current vs Production Database

### Development (Local)
```
MONGODB_URI=mongodb://localhost:27017/discovergroup
```

### Production (Atlas)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/discovergroup?retryWrites=true&w=majority
```

---

## ✅ Checklist

- [ ] Created MongoDB Atlas account
- [ ] Created free M0 cluster
- [ ] Created database user with password
- [ ] Whitelisted all IPs (0.0.0.0/0)
- [ ] Got connection string
- [ ] Replaced `<password>` in connection string
- [ ] Added database name to connection string
- [ ] Tested locally (MongoDB connected log appears)
- [ ] Ready to use in Railway deployment

---

## 🎯 Next Step

Once MongoDB Atlas is set up and tested locally, you're ready to deploy to Railway!
