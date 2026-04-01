# 🔧 Aura Project - Debug & Testing Guide

## ✅ Step-by-Step Testing Instructions

### **STEP 1: Verify Server is Running**
```bash
cd "aura project"
node server.js
```

You should see:
```
✅ Server running on port 3000
✅ Database initialized
```

---

### **STEP 2: Access the Debug Console**
Open your browser and go to:
```
http://localhost:3000/debug.html
```

Use this page to:
- ✅ Check Server Status
- ✅ Check Database Status  
- ✅ Test API endpoints
- ✅ Check LocalStorage
- ✅ Check Browser Info

**Expected Results:**
- ✅ Server Status: GREEN (responding on port 3000)
- ✅ Database Status: GREEN (API endpoint accessible)
- ✅ API endpoints: Should work without errors

---

### **STEP 3: Test Signup (Simple Form)**
1. Go to: `http://localhost:3000/signup-simple.html`

2. Fill in the form:
   - **Full Name:** John Doe
   - **Email:** testuser@example.com (use unique email each time)
   - **Display Name:** johndoe
   - **Password:** password123
   - **Confirm Password:** password123

3. Click **"Create Account"**

**What You Should See:**
- ✅ Button changes to "⏳ Creating account..."
- ✅ **GREEN SUCCESS MODAL** appears with:
  - Big ✅ checkmark
  - "Account Created!" message
  - Countdown timer: "3... 2... 1..."
  - Auto-redirects to signin page

**If It Fails:**
- ❌ Check the browser console (F12 → Console)
- ❌ Check server terminal for errors
- ❌ Make sure you use a NEW email (not already registered)

---

### **STEP 4: Test Login (Simple Form)**
1. Go to: `http://localhost:3000/signin-simple.html`

2. Enter credentials:
   - **Email:** testuser@example.com (from step 3)
   - **Password:** password123

3. Click **"Sign In"**

**What You Should See:**
- ✅ Button changes to "⏳ Signing in..."
- ✅ **GREEN SUCCESS MODAL** appears with:
  - Big ✅ checkmark
  - "Sign In Successful!" message
  - Countdown timer
  - Auto-redirects to dashboard

**If It Fails:**
- ❌ Check browser console for errors
- ❌ Verify email and password are correct
- ❌ Check that account was created in Step 3

---

### **STEP 5: Verify Database**
1. Open **DB Browser for SQLite**
2. Open: `/Users/admin/Peter/aura project/aura.db`
3. Click the **"Browse Data"** tab
4. Select the **"users"** table

**What You Should See:**
- ✅ Your test user appears in the table:
  - ID: (some number)
  - full_name: John Doe
  - email: testuser@example.com
  - display_name: johndoe
  - role: user
  - created_at: (today's date)

---

### **STEP 6: Test Dashboard**
After successful login (Step 4), you should be redirected to:
```
http://localhost:3000/dashboard.html
```

**What You Should See:**
- ✅ Your display name in the top right
- ✅ User avatar with initials
- ✅ Send money form
- ✅ Exchange rate information

**If Dashboard is Blank:**
- ❌ Press F12 and check Console for errors
- ❌ Check that localStorage is saving user data:
  - Open Console and type: `localStorage.getItem('currentUser')`
  - Should show your user info

---

## 🐛 Troubleshooting

### **Issue: "Connection Error" on Signup**
**Cause:** Server is not running
**Solution:**
```bash
cd "aura project"
node server.js
```

### **Issue: "Account already exists"**
**Cause:** Email is already registered
**Solution:** Use a different email address

### **Issue: Form disappears after submit**
**Cause:** Old signup/signin forms might still have bugs
**Solution:** Use the NEW forms:
- `http://localhost:3000/signup-simple.html`
- `http://localhost:3000/signin-simple.html`

### **Issue: Dashboard is blank**
**Cause:** User data not saved to localStorage
**Solution:**
1. Press F12 → Console
2. Type: `localStorage.clear()`
3. Go back to signin and try again

### **Issue: "Invalid email or password" when logging in**
**Cause:** 
- Email doesn't exist in database
- Password is wrong
**Solution:**
1. Create a new account in Step 3
2. Use the exact same credentials to login

---

## 📊 Quick Test Checklist

- [ ] Server is running on port 3000
- [ ] Debug page loads (http://localhost:3000/debug.html)
- [ ] Server status shows ✅
- [ ] Can create account with new email
- [ ] Success modal shows after signup
- [ ] Redirects to signin page
- [ ] Can login with same credentials
- [ ] Success modal shows after login
- [ ] Redirects to dashboard
- [ ] Dashboard shows user name
- [ ] User appears in database

---

## 🔗 Quick Links

| Page | URL |
|------|-----|
| Debug Console | http://localhost:3000/debug.html |
| New Signup Form | http://localhost:3000/signup-simple.html |
| New Signin Form | http://localhost:3000/signin-simple.html |
| Dashboard | http://localhost:3000/dashboard.html |
| Original Signup | http://localhost:3000/signup.html |
| Original Signin | http://localhost:3000/signin.html |

---

## 💡 Pro Tips

1. **Use Private/Incognito Browser:**
   - Avoids cached HTML issues
   - Helps with fresh testing

2. **Clear Cache Between Tests:**
   - Cmd+Shift+Delete (Mac)
   - Ctrl+Shift+Delete (Windows/Linux)

3. **Check Server Logs:**
   - Watch the server terminal while testing
   - Look for ✅, ❌, 📝 icons

4. **Use Different Emails:**
   - Always use a new email for each test signup
   - Old emails will be in the database

---

## 🎯 Expected Workflow

```
1. Server running ✅
   ↓
2. Create account ✅ → Success modal appears
   ↓
3. Redirected to signin ✅
   ↓
4. Enter credentials ✅
   ↓
5. Login ✅ → Success modal appears
   ↓
6. Redirected to dashboard ✅
   ↓
7. See user info ✅
```

---

**Happy Testing! 🚀**
