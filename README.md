# CV Tailoring App - Serverless Edition 🚀

> **✅ SERVERLESS MIGRATION COMPLETE**  
> This application has been fully migrated from Express.js to a serverless architecture using Vercel Functions.

AI-powered CV tailoring application with global location intelligence and professional PDF export capabilities. Now fully serverless for better scalability, performance, and cost-effectiveness.

## 🌟 Key Features

- **🤖 AI-Powered CV Tailoring** - Uses Google Gemini AI to optimize CVs for specific job descriptions
- **📊 ATS Score Analysis** - Comprehensive scoring system with detailed feedback
- **🌍 Global Location Intelligence** - Supports 300+ cities worldwide with automatic country detection
- **📄 PDF Processing** - Extract text from PDF CVs with advanced parsing
- **⚡ Serverless Architecture** - Auto-scaling, cost-effective, zero server management
- **🔄 API Key Failover** - Multiple API key support for high availability
- **📱 Responsive Design** - Works perfectly on desktop and mobile devices

## 🏗️ Architecture

### Serverless Functions (Vercel)
- `POST /extract-text` - PDF text extraction
- `POST /parse-cv` - CV parsing and data extraction  
- `POST /ai/tailor-cv` - AI-powered CV tailoring
- `GET /health` - Health check and status
- `GET /api-status` - API key monitoring

### Frontend
- **React + Vite** - Modern frontend framework
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type-safe development

## 🚀 Quick Deploy

### One-Click Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yashsharmaskk/ai-cv-tailoring-app)

### Manual Deployment

1. **Clone and install**:
   ```bash
   git clone https://github.com/yashsharmaskk/ai-cv-tailoring-app.git
   cd ai-cv-tailoring-app
   npm install
   ```

2. **Set environment variables** in Vercel dashboard:
   ```bash
   GEMINI_API_KEY=your_primary_api_key
   GEMINI_API_KEY_1=your_backup_key_1
   GEMINI_API_KEY_2=your_backup_key_2
   ```

3. **Build and deploy**:
   ```bash
   npm run build
   npm run deploy
   ```

## 🔧 Development

### Local Development
```bash
npm run dev          # Start frontend development server
vercel dev           # Test serverless functions locally
```

### Environment Setup
Create `.env.local`:
```bash
GEMINI_API_KEY=your_api_key_here
GEMINI_API_KEY_1=backup_key_1
GEMINI_API_KEY_2=backup_key_2
```

## 📊 Performance

- **Cold Start**: ~2-3 seconds for first request
- **Warm Functions**: ~200-500ms response time
- **Auto-scaling**: Handles traffic spikes automatically
- **Global CDN**: <100ms static asset delivery

## 🔐 Security

- ✅ Secure environment variable storage
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ No sensitive data in error responses
- ✅ API key rotation support

## 📈 Monitoring

### Health Check
```bash
curl https://your-app.vercel.app/health
```

### API Status
```bash
curl https://your-app.vercel.app/api-status
```

## 🔄 Migration Benefits

### From Express.js to Serverless
- ❌ Removed Express.js server (`server.js`)
- ❌ Removed server dependencies (`express`, `concurrently`)
- ✅ Added Vercel Functions with TypeScript
- ✅ Enhanced error handling and monitoring
- ✅ API key failover system
- ✅ Auto-scaling capabilities
- ✅ Reduced operational costs

## 📁 Project Structure

```
cv-tailoring-app/
├── api/                    # Serverless functions
│   ├── lib/               # Shared utilities
│   │   ├── gemini.ts      # AI client with failover
│   │   └── location.ts    # Location processing
│   ├── ai/
│   │   └── tailor-cv.ts   # CV tailoring endpoint
│   ├── extract-text.ts    # PDF extraction
│   ├── parse-cv.ts        # CV parsing
│   ├── health.ts          # Health check
│   └── api-status.ts      # API monitoring
├── src/                   # React frontend
├── dist/                  # Built frontend
├── vercel.json           # Vercel configuration
└── package.json          # Dependencies and scripts
```

## 🛠️ API Usage

### Extract Text from PDF
```javascript
const formData = new FormData();
formData.append('pdf', pdfFile);

const response = await fetch('/extract-text', {
  method: 'POST',
  body: formData
});
```

### Tailor CV with AI
```javascript
const response = await fetch('/ai/tailor-cv', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cvText: 'Your CV content...',
    jobDescription: 'Job description...'
  })
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `vercel dev`
5. Submit a pull request

## 📞 Support

- 📧 Email: yashsharmaskk@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/yashsharmaskk/ai-cv-tailoring-app/issues)
- 📚 Documentation: [README-SERVERLESS.md](./README-SERVERLESS.md)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**🚀 Powered by Vercel Functions & Google Gemini AI**  
*Serverless • Scalable • Secure*
