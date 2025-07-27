# 🌐 ngrok Setup for CV Tailoring Application

## Quick Start with ngrok

### Option 1: Automatic Setup (Recommended)
```bash
# Start app with ngrok in one command
npm run dev:ngrok
```

### Option 2: Manual Setup (2 Terminals)

**Terminal 1 - Start the application:**
```bash
npm run dev
```
Wait for the message: `✅ PDF extraction server running at http://localhost:5000`

**Terminal 2 - Start ngrok tunnel:**
```bash
npm run ngrok
# OR
npx ngrok http 5000
```

## 🎯 What You'll Get

When ngrok starts successfully, you'll see:
```
Session Status                online
Account                       Your Account (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       XXms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:5000
```

## 🌍 Public Access

Your CV Tailoring App will be available at:
- **Public URL**: `https://your-random-id.ngrok.io`
- **Local URL**: `http://localhost:5000`
- **ngrok Dashboard**: `http://127.0.0.1:4040`

## 📱 Features Available Publicly

✅ **Upload CV** - PDF file upload and processing  
✅ **Job Description Input** - Paste job requirements  
✅ **AI Processing** - Google Gemini AI tailoring  
✅ **Location Intelligence** - 300+ cities with country detection  
✅ **Professional PDF Export** - Clean, company-ready downloads  
✅ **ATS Score** - Real-time optimization scoring  

## 🔧 Troubleshooting

### ngrok not found
```bash
# Install globally
npm install -g ngrok

# Or use local version
npx ngrok http 5000
```

### Port already in use
```bash
# Find process using port 5000
netstat -ano | findstr :5000
# Kill the process
taskkill /PID <PID> /F
```

### Free ngrok limitations
- **Session Duration**: 8 hours max
- **Bandwidth**: 1GB/month
- **Concurrent Tunnels**: 1
- **Custom Domains**: Not available

## 🚀 Sharing Your App

1. **Copy the ngrok URL** (starts with `https://`)
2. **Share with anyone** - they can access your app remotely
3. **Demo on mobile** - test on phones/tablets
4. **Portfolio showcase** - add to your resume/portfolio

## 💡 Use Cases

- **Job Interviews**: Live demo during video calls
- **Portfolio**: Show to potential employers
- **Mobile Testing**: Test on different devices
- **Remote Access**: Access from anywhere
- **Collaboration**: Let others test your app

## 🔒 Security Notes

- Free ngrok URLs are **public** - anyone with the link can access
- **Don't share sensitive data** through public tunnels
- URLs change each time you restart ngrok
- Consider ngrok Pro for persistent URLs and password protection

## 🎯 Next Steps

1. **Start your app**: Follow the instructions above
2. **Test the public URL**: Open in browser/share with friends
3. **Monitor usage**: Check ngrok dashboard at http://127.0.0.1:4040
4. **Showcase**: Add the live demo to your portfolio!

---

**Ready to make your CV Tailoring App globally accessible! 🌍**
