# 🎯 AI-Powered CV Tailoring Application

A sophisticated React + Node.js application that uses Google's Gemini AI to intelligently tailor CVs for specific job descriptions, featuring advanced location intelligence and professional PDF export.

![CV Tailoring App](https://img.shields.io/badge/CV-Tailoring-blue)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-orange)

## ✨ Features

### 🤖 AI-Powered CV Optimization
- **Google Gemini 1.5 Flash Integration**: Advanced AI analysis and optimization
- **Multiple API Key Failover**: Automatic switching between API keys for reliability
- **Intelligent Content Matching**: Semantic analysis to match CV content with job requirements
- **ATS Score Calculation**: Real-time scoring for Applicant Tracking Systems

### 🌍 Global Location Intelligence
- **300+ Cities Database**: Comprehensive city-to-country mapping
- **Automatic Country Detection**: Smart location parsing and formatting
- **No Default Placeholders**: Eliminates generic location data like "San Francisco, CA"
- **Professional Formatting**: Consistent location presentation

### 📄 Professional PDF Export
- **Clean Company-Ready Output**: Removes "Tailored CV" headers and ATS scores
- **Professional Filename Generation**: `resume-{company}.pdf` format
- **Optimized Layout**: Clean, readable format for hiring managers
- **Markdown to HTML Conversion**: Preserves formatting while ensuring compatibility

### 🚀 Production-Ready Features
- **Docker Containerization**: Complete production deployment setup
- **Health Monitoring**: Built-in health checks and monitoring endpoints
- **Security Hardening**: Non-root user execution, security headers, rate limiting
- **nginx Reverse Proxy**: Optional load balancing and SSL termination

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** with TypeScript
- **Vite 5.4.2** for fast development and building
- **Tailwind CSS** for modern, responsive styling
- **Lucide React** for beautiful icons
- **jsPDF** for client-side PDF generation

### Backend
- **Node.js 18+** with Express.js
- **Google Generative AI** (Gemini 1.5 Flash)
- **Multer** for file upload handling
- **PDF-Parse** for CV text extraction
- **CORS** enabled for cross-origin requests

### Infrastructure
- **Docker** with multi-stage builds
- **Docker Compose** for orchestration
- **nginx** for reverse proxy (optional)
- **Health checks** and monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- Google Gemini API key(s)
- Docker (optional, for production deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cv-tailoring-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Gemini API keys:
   ```env
   GEMINI_API_KEY_1=your-primary-api-key
   GEMINI_API_KEY_2=your-backup-api-key
   GEMINI_API_KEY_3=your-third-api-key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Access at: http://localhost:5000

### 🐳 Docker Deployment

1. **Quick Deploy (Windows)**
   ```bash
   deploy.bat
   ```

2. **Quick Deploy (Linux/Mac)**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Manual Docker Setup**
   ```bash
   # Build image
   docker build -t cv-tailoring-app .
   
   # Simple deployment
   docker-compose -f docker-compose.simple.yml up -d
   
   # Full deployment with nginx
   docker-compose up -d
   ```

4. **Access Application**
   - Simple: http://localhost:5000
   - With nginx: http://localhost
   - Health check: http://localhost:5000/health

## 📖 Usage Guide

### Step 1: Upload CV
- Support for PDF files
- Automatic text extraction
- Contact information parsing

### Step 2: Enter Job Description
- Copy-paste job requirements
- AI analyzes requirements automatically
- Identifies key skills and keywords

### Step 3: AI Processing
- Semantic matching between CV and job description
- Location intelligence enhancement
- ATS optimization scoring

### Step 4: Review & Download
- Side-by-side comparison view
- Real-time ATS score
- Professional PDF export

## 🔧 Configuration

### Environment Variables
```env
# Required: Gemini AI API Keys
GEMINI_API_KEY_1=your-primary-key
GEMINI_API_KEY_2=your-backup-key

# Optional: Application Settings
NODE_ENV=production
PORT=5000
MAX_FILE_SIZE=10485760
UPLOAD_TIMEOUT=30000
```

### Multiple API Keys
The application supports multiple Gemini API keys for enhanced reliability:
- Automatic failover between keys
- Load distribution
- Rate limit handling
- Real-time key switching

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │   Google Gemini │
│                 │◄──►│                 │◄──►│       AI        │
│  • File Upload  │    │  • PDF Parser   │    │  • CV Analysis  │
│  • Job Input    │    │  • Location DB  │    │  • Optimization │
│  • PDF Export   │    │  • API Failover │    │  • ATS Scoring  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components
- **CV Parser**: Extracts and processes CV content
- **Location Intelligence**: 300+ city database with smart detection
- **AI Integration**: Multiple API key management with failover
- **PDF Generator**: Clean, professional output formatting

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Project Structure
```
src/
├── components/
│   ├── ATSScoreCard.tsx    # ATS scoring display
│   ├── CVInput.tsx         # CV upload component
│   ├── JobDescriptionInput.tsx  # Job input form
│   ├── ProcessingView.tsx  # AI processing status
│   └── ResultsView.tsx     # Results and PDF export
├── App.tsx                 # Main application
└── main.tsx               # Application entry point

server.js                   # Express backend
cityCountryDatabase.js     # Location intelligence
docker/                    # Docker configuration
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── deploy scripts
```

## 🔒 Security Features

- **Non-root Container Execution**
- **Security Headers** (XSS, CSRF protection)
- **Rate Limiting** on API endpoints
- **File Upload Validation**
- **Environment Variable Protection**

## 📊 Monitoring & Health Checks

### Health Endpoint
GET `/health` returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-XX...",
  "uptime": 3600,
  "memory": {...},
  "version": "v18.x.x"
}
```

### Docker Health Checks
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3 attempts
- **Start Period**: 5 seconds

## 🚀 Production Deployment

### Cloud Platforms
- **AWS ECS/EKS**: Use docker-compose.yml
- **Google Cloud Run**: Single container deployment
- **Azure Container Instances**: Docker image deployment
- **DigitalOcean Apps**: Git-based deployment

### Scaling Considerations
- **Horizontal Scaling**: Multiple container instances
- **Load Balancing**: nginx configuration included
- **Database**: Add persistent storage for user data
- **CDN**: Static asset optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: See [DOCKER.md](DOCKER.md) for Docker deployment guide
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions

## 🏆 Acknowledgments

- Google Gemini AI for powerful language processing
- React and Vite communities
- Docker for containerization excellence
- Open source contributors

---

**Made with ❤️ for job seekers worldwide**
