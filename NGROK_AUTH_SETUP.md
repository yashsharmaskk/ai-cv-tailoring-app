# 🔐 ngrok Authentication Setup

## ⚠️ ngrok Requires Authentication

You're seeing this error because ngrok now requires a verified account. Here's how to fix it:

## 🚀 Quick Setup (2 minutes)

### Step 1: Create Free ngrok Account
1. **Sign up**: https://dashboard.ngrok.com/signup
   - Use your email (same one as GitHub if you want)
   - It's completely **FREE** for basic usage
   - No credit card required

### Step 2: Get Your Auth Token
1. **Login** to ngrok dashboard
2. **Copy your authtoken** from: https://dashboard.ngrok.com/get-started/your-authtoken
   - It looks like: `2abc123def456ghi789jkl_1mnop2qrs3tuv4wxy5z`

### Step 3: Configure ngrok
Open terminal and run:
```bash
npx ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

**Example:**
```bash
npx ngrok config add-authtoken 2abc123def456ghi789jkl_1mnop2qrs3tuv4wxy5z
```

### Step 4: Test ngrok
```bash
npx ngrok http 3000
```

## 🎯 Complete Setup Commands

**After getting your authtoken:**

```bash
# 1. Configure authtoken (one-time setup)
npx ngrok config add-authtoken YOUR_AUTHTOKEN_HERE

# 2. Start your app (if not running)
npm run dev

# 3. Start ngrok tunnel (your app runs on port 3000)
npx ngrok http 3000
```

## 🆓 Free ngrok Features

With a free account you get:
- ✅ **Public HTTPS URLs**
- ✅ **1 concurrent tunnel**
- ✅ **40 connections/minute**
- ✅ **Web inspection interface**
- ✅ **No bandwidth limits**

Perfect for showcasing your CV Tailoring App!

## 🔧 Alternative: Use Quick Setup Script

I'll create a script that guides you through this:

1. **Run**: `ngrok-setup.bat`
2. **Follow the prompts**
3. **Enter your authtoken when asked**

## 💡 Why This is Worth It

Once set up, you can:
- **Demo your app** in job interviews
- **Share with recruiters** via simple link
- **Test on mobile devices** remotely
- **Add to portfolio** as live demo
- **Get feedback** from friends/family

## 🆘 Need Help?

If you have issues:
1. **Check email** - ngrok sends verification email
2. **Copy authtoken carefully** - no extra spaces
3. **Use quotes** if authtoken has special characters:
   ```bash
   npx ngrok config add-authtoken "your-token-here"
   ```

---

**Quick Links:**
- 🔗 **Sign up**: https://dashboard.ngrok.com/signup
- 🔑 **Get authtoken**: https://dashboard.ngrok.com/get-started/your-authtoken
- 📚 **Documentation**: https://ngrok.com/docs/getting-started
