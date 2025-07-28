# CV Tailoring App - Serverless Edition

🚀 **Fully Serverless AI-Powered CV Tailoring Application**

This application has been completely migrated to a serverless architecture using Vercel Functions, providing better scalability, reduced costs, and improved performance.

## 🏗️ Serverless Architecture

### Frontend
- **React + Vite**: Modern frontend build system
- **Tailwind CSS**: Utility-first CSS framework
- **Static Deployment**: Served from Vercel's global CDN

### Backend (Serverless Functions)
- **Vercel Functions**: Node.js serverless functions
- **TypeScript**: Type-safe backend development
- **Edge Computing**: Functions deployed globally

### API Endpoints

| Endpoint | Function | Description |
|----------|----------|-------------|
| `POST /extract-text` | `api/extract-text.ts` | PDF text extraction |
| `POST /parse-cv` | `api/parse-cv.ts` | CV parsing and data extraction |
| `POST /ai/tailor-cv` | `api/ai/tailor-cv.ts` | AI-powered CV tailoring |
| `GET /health` | `api/health.ts` | Health check and status |
| `GET /api-status` | `api/api-status.ts` | API key monitoring |

## 🚀 Deployment

### Prerequisites
- Node.js 18+ 
- npm 9+
- Vercel account
- Google Gemini API keys

### Environment Variables
Set these in your Vercel dashboard or `.env.local`:

```bash
# Primary API key
GEMINI_API_KEY=your_primary_api_key_here

# Backup API keys (optional but recommended)
GEMINI_API_KEY_1=your_backup_key_1
GEMINI_API_KEY_2=your_backup_key_2
GEMINI_API_KEY_3=your_backup_key_3

# Environment
NODE_ENV=production
```

### Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Build the frontend**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

   Or for preview deployment:
   ```bash
   npm run deploy:preview
   ```

### Manual Deployment Steps

1. **Clone and install**:
   ```bash
   git clone <your-repo>
   cd cv-tailoring-app
   npm install
   ```

2. **Build frontend**:
   ```bash
   npm run build
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

## 🔧 Key Features

### ✅ Serverless Benefits
- **Auto-scaling**: Handles traffic spikes automatically
- **Cost-effective**: Pay only for actual usage
- **Global deployment**: Functions run at edge locations
- **Zero server management**: No infrastructure to maintain

### ✅ Enhanced Reliability
- **API Key Failover**: Automatic switching between multiple Gemini API keys
- **Error Handling**: Comprehensive error responses
- **Health Monitoring**: Built-in status endpoints

### ✅ Performance Optimizations
- **Function Timeout**: 60 seconds for AI processing
- **Memory Optimization**: Efficient resource usage
- **Global CDN**: Fast static asset delivery

## 📊 Monitoring

### Health Check
```bash
curl https://your-app.vercel.app/health
```

### API Status
```bash
curl https://your-app.vercel.app/api-status
```

## 🔐 Security

- **Environment Variables**: Secure API key storage
- **CORS Configuration**: Proper cross-origin handling
- **Input Validation**: Request validation and sanitization
- **Error Sanitization**: No sensitive data in error responses

## 🛠️ Development

### Local Development
```bash
npm run dev
```

### Function Testing
```bash
vercel dev
```

### Linting
```bash
npm run lint
```

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

## 🔄 Migration from Express.js

The application has been completely migrated from Express.js to serverless functions:

### Removed Components
- ❌ `server.js` - Express server
- ❌ `express` dependency
- ❌ `concurrently` for dev server
- ❌ Server-side static file serving

### Added Components
- ✅ Vercel Functions in `/api` directory
- ✅ Enhanced error handling
- ✅ API key failover system
- ✅ TypeScript for all functions
- ✅ Shared utility libraries

## 🚨 Troubleshooting

### Common Issues

1. **Function Timeout**:
   - Increase `maxDuration` in `vercel.json`
   - Optimize AI prompts for faster responses

2. **API Key Errors**:
   - Check `/api-status` endpoint
   - Verify environment variables are set
   - Ensure backup keys are configured

3. **Build Errors**:
   - Run `npm run build` locally first
   - Check TypeScript errors
   - Verify all dependencies are installed

### Debug Mode
Set `DEBUG=1` in environment variables for verbose logging.

## 📈 Performance

- **Cold Start**: ~2-3 seconds for first request
- **Warm Functions**: ~200-500ms response time
- **Concurrent Requests**: Auto-scaling handles traffic
- **Global Latency**: <100ms from edge locations

## 🔮 Future Enhancements

- [ ] Database integration (Vercel KV/Postgres)
- [ ] User authentication
- [ ] CV history and templates
- [ ] Real-time collaboration
- [ ] Advanced analytics
- [ ] Mobile app support

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Check the health endpoints for system status
- Review Vercel function logs for debugging

---

**Serverless Migration Complete** ✅  
*The application is now fully serverless and ready for production deployment on Vercel.*