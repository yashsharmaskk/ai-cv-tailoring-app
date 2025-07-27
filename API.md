# 🔌 API Documentation

This document provides comprehensive information about the CV Tailoring Application API endpoints.

## 📋 Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
- [Data Models](#data-models)
- [Examples](#examples)
- [Rate Limiting](#rate-limiting)

## 🌐 Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://your-app-name.onrender.com`

## 🔐 Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## ⚠️ Error Handling

### Error Response Format

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-27T10:30:00Z"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `400` | Bad Request - Invalid input |
| `404` | Not Found - Endpoint not found |
| `413` | Payload Too Large - File size exceeds limit |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error - Server error |
| `503` | Service Unavailable - API keys exhausted |

## 📊 Endpoints

### Health Check

Check server status and configuration.

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-27T10:30:00Z",
  "service": "CV Tailoring Application",
  "version": "1.0.0",
  "apiKeysLoaded": 2,
  "environment": "production",
  "uptime": 3600
}
```

### API Status

Check API key configuration and availability.

```http
GET /api-status
```

**Response:**
```json
{
  "apiKeysConfigured": 2,
  "currentActiveKey": 1,
  "totalKeys": 2,
  "status": "ready"
}
```

### Extract Text from PDF

Extract text content from uploaded PDF files.

```http
POST /extract-text
Content-Type: multipart/form-data
```

**Parameters:**
- `pdf` (file): PDF file to extract text from (max 10MB)

**Response:**
```json
{
  "text": "Extracted CV text content here..."
}
```

**Error Responses:**
```json
// No file uploaded
{
  "error": "No PDF file uploaded"
}

// Invalid file type
{
  "error": "Only PDF files are allowed"
}

// File too large
{
  "error": "File size exceeds 10MB limit"
}

// Extraction failed
{
  "error": "Could not extract text from PDF"
}
```

### Parse CV Data

Parse structured data from CV text content.

```http
POST /parse-cv
Content-Type: application/json
```

**Request Body:**
```json
{
  "cvText": "Raw CV text content..."
}
```

**Response:**
```json
{
  "personalInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-123-4567",
    "location": "San Francisco, CA",
    "country": "United States"
  },
  "experience": [
    {
      "title": "Software Developer",
      "company": "Tech Corp",
      "duration": "2021-Present",
      "description": "Developed web applications..."
    }
  ],
  "skills": ["JavaScript", "React", "Node.js"],
  "education": [
    {
      "degree": "Bachelor of Science in Computer Science",
      "institution": "University of Technology",
      "year": "2019"
    }
  ]
}
```

### AI CV Tailoring

Tailor CV content for specific job descriptions using AI.

```http
POST /ai/tailor-cv
Content-Type: application/json
```

**Request Body:**
```json
{
  "cvText": "Original CV content...",
  "jobDescription": "Job posting content..."
}
```

**Response:**
```json
{
  "tailoredCV": "# Optimized CV Content\n\nJohn Doe\nSoftware Developer...",
  "atsScore": 87,
  "improvements": [
    "Added relevant keywords for ATS optimization",
    "Restructured experience section for better relevance",
    "Enhanced skills section to match job requirements"
  ],
  "keywordMatches": [
    "JavaScript",
    "React",
    "Agile Development"
  ],
  "missingKeywords": [
    "Docker",
    "AWS"
  ],
  "recommendations": [
    "Consider adding Docker experience",
    "Highlight any cloud platform experience"
  ]
}
```

**Error Responses:**
```json
// Missing required fields
{
  "error": "Both CV text and job description are required"
}

// No API keys configured
{
  "error": "No API keys configured. Please contact administrator."
}

// All API keys exhausted
{
  "error": "All Gemini API keys failed. Please try again later."
}
```

## 📝 Data Models

### Personal Information

```typescript
interface PersonalInfo {
  name: string;           // Full name
  email: string;          // Email address
  phone: string;          // Phone number
  location?: string;      // Current location
  country?: string;       // Detected country
  linkedin?: string;      // LinkedIn profile URL
  github?: string;        // GitHub profile URL
  website?: string;       // Personal website
}
```

### Work Experience

```typescript
interface Experience {
  title: string;          // Job title
  company: string;        // Company name
  duration: string;       // Employment period
  description: string;    // Job description
  location?: string;      // Job location
  achievements?: string[];// Key achievements
}
```

### Education

```typescript
interface Education {
  degree: string;         // Degree title
  institution: string;   // Educational institution
  year: string;          // Graduation year
  location?: string;     // Institution location
  gpa?: string;          // Grade point average
  honors?: string;       // Academic honors
}
```

### Skills

```typescript
interface Skills {
  technical: string[];    // Technical skills
  soft: string[];        // Soft skills
  languages: string[];   // Programming languages
  frameworks: string[];  // Frameworks and libraries
  tools: string[];       // Development tools
}
```

### CV Data

```typescript
interface CVData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  skills: Skills;
  education: Education[];
  summary?: string;       // Professional summary
  certifications?: string[]; // Professional certifications
  projects?: Project[];   // Personal/professional projects
}
```

### Job Data

```typescript
interface JobData {
  title: string;          // Job title
  company: string;        // Company name
  requirements: string[]; // Job requirements
  skills: string[];       // Required skills
  experience: string;     // Experience level
  location: string;       // Job location
  salary?: string;        // Salary range
  benefits?: string[];    // Job benefits
}
```

### AI Response

```typescript
interface AIResponse {
  tailoredCV: string;             // Optimized CV content
  atsScore: number;               // ATS compatibility score (0-100)
  improvements: string[];         // List of improvements made
  keywordMatches: string[];       // Matched keywords
  missingKeywords: string[];      // Keywords not found in CV
  recommendations: string[];      // Suggestions for improvement
  confidenceScore: number;        // AI confidence in optimization
}
```

## 📋 Examples

### Complete Workflow Example

```javascript
// 1. Extract text from PDF
const formData = new FormData();
formData.append('pdf', pdfFile);

const extractResponse = await fetch('/extract-text', {
  method: 'POST',
  body: formData
});
const { text } = await extractResponse.json();

// 2. Parse CV data
const parseResponse = await fetch('/parse-cv', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cvText: text })
});
const cvData = await parseResponse.json();

// 3. Tailor CV for job
const tailorResponse = await fetch('/ai/tailor-cv', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cvText: text,
    jobDescription: jobPosting
  })
});
const tailoredResult = await tailorResponse.json();
```

### Error Handling Example

```javascript
async function tailorCV(cvText, jobDescription) {
  try {
    const response = await fetch('/ai/tailor-cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cvText, jobDescription })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Request failed');
    }

    return await response.json();
    
  } catch (error) {
    console.error('CV tailoring failed:', error);
    throw error;
  }
}
```

## 🔒 Rate Limiting

### Current Limits

- **PDF Extraction**: 10 requests per minute per IP
- **AI Tailoring**: 5 requests per minute per IP
- **File Size**: Maximum 10MB per PDF upload

### Headers

Rate limit information is included in response headers:

```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1643723400
```

### Rate Limit Exceeded Response

```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60
}
```

## 🔧 Development & Testing

### Local Testing

```bash
# Start development server
npm run dev

# Test health endpoint
curl http://localhost:5000/health

# Test PDF extraction
curl -X POST \
  -F "pdf=@sample-cv.pdf" \
  http://localhost:5000/extract-text

# Test AI tailoring
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"cvText":"...","jobDescription":"..."}' \
  http://localhost:5000/ai/tailor-cv
```

### API Testing Tools

- **Postman**: Import the provided collection
- **Insomnia**: Use the included workspace
- **curl**: Command-line testing examples above
- **Thunder Client**: VS Code extension for API testing

## 📊 Monitoring

### Health Monitoring

Monitor the `/health` endpoint for:
- Server uptime
- API key availability
- Memory usage
- Response time

### Logging

API requests are logged with:
- Timestamp
- HTTP method and path
- Response status
- Processing time
- Error details (if any)

### Metrics

Key metrics to monitor:
- Request volume by endpoint
- Success/error rates
- Average response times
- API key usage patterns

## 🚀 Production Considerations

### Security

- Implement rate limiting
- Add request validation
- Use HTTPS in production
- Sanitize all inputs
- Add CORS restrictions

### Performance

- Enable gzip compression
- Implement caching strategies
- Monitor memory usage
- Optimize PDF processing
- Use connection pooling

### Scalability

- Horizontal scaling support
- Load balancer configuration
- Database connection pooling
- Caching layer implementation
- CDN integration

---

**For additional support or questions, please refer to the [main documentation](README.md) or create an issue on GitHub.**
