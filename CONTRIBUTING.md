# 🤝 Contributing to AI-Powered CV Tailoring Application

Thank you for your interest in contributing to our CV Tailoring Application! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## 🌟 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

### Our Pledge

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** for version control
- **Google Gemini API Key** for testing AI features

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-cv-tailoring-app.git
   cd ai-cv-tailoring-app
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/yashsharmaskk/ai-cv-tailoring-app.git
   ```

### Local Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Verify setup**:
   - Open http://localhost:3000
   - Test PDF upload functionality
   - Test AI CV tailoring with sample data

## 🔄 Development Workflow

### Branch Naming Convention

Use descriptive branch names with prefixes:

- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests

Examples:
```bash
git checkout -b feature/linkedin-integration
git checkout -b bugfix/pdf-extraction-error
git checkout -b docs/api-reference-update
```

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```
feat(ai): add support for multiple language CVs
fix(pdf): resolve extraction timeout issues
docs(readme): update deployment instructions
style(components): improve TypeScript type definitions
```

### Keep Your Fork Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## 📝 Coding Standards

### TypeScript Guidelines

- **Use TypeScript** for all new components and functions
- **Define interfaces** for all props and complex objects
- **Use strict type checking** - avoid `any` types
- **Document with JSDoc** for public APIs

Example:
```typescript
/**
 * Extracts and processes CV data from text input
 * @param cvText - Raw CV text content
 * @param options - Processing options
 * @returns Structured CV data object
 */
interface ProcessingOptions {
  includeLocationDetection: boolean;
  atsOptimization: boolean;
}

async function processCVData(
  cvText: string, 
  options: ProcessingOptions
): Promise<CVData> {
  // Implementation
}
```

### React Component Guidelines

- **Use functional components** with hooks
- **Implement proper TypeScript interfaces** for props
- **Use meaningful component and prop names**
- **Add JSDoc comments** for complex components
- **Handle loading and error states**

Example:
```tsx
/**
 * Component for displaying ATS score analysis
 * @param score - ATS compatibility score (0-100)
 * @param suggestions - Array of improvement suggestions
 * @param isLoading - Loading state indicator
 */
interface ATSScoreProps {
  score: number;
  suggestions: string[];
  isLoading: boolean;
}

const ATSScoreCard: React.FC<ATSScoreProps> = ({ 
  score, 
  suggestions, 
  isLoading 
}) => {
  // Component implementation
};
```

### Backend Guidelines

- **Use ES6 modules** with import/export
- **Implement proper error handling** with try-catch
- **Add input validation** for all API endpoints
- **Use descriptive function names** and comments
- **Handle async operations** properly

Example:
```javascript
/**
 * Processes CV tailoring request with AI optimization
 * @param {string} cvText - Original CV content
 * @param {string} jobDescription - Target job description
 * @returns {Promise<Object>} Tailored CV with ATS score
 */
async function tailorCVWithAI(cvText, jobDescription) {
  try {
    // Validate inputs
    if (!cvText || !jobDescription) {
      throw new Error('Both CV text and job description are required');
    }
    
    // Process with AI
    const result = await processWithGemini(cvText, jobDescription);
    return result;
    
  } catch (error) {
    console.error('CV tailoring failed:', error);
    throw new Error(`Tailoring failed: ${error.message}`);
  }
}
```

### CSS/Styling Guidelines

- **Use Tailwind CSS** for styling
- **Follow mobile-first** responsive design
- **Use semantic HTML** elements
- **Ensure accessibility** with proper ARIA labels
- **Test across different screen sizes**

### File Organization

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI elements
│   ├── forms/           # Form components
│   └── charts/          # Data visualization
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
├── constants/           # Application constants
└── styles/              # Global styles
```

## 🔧 Pull Request Process

### Before Submitting

1. **Test your changes thoroughly**:
   ```bash
   npm run dev    # Test development build
   npm run build  # Test production build
   ```

2. **Run linting and formatting**:
   ```bash
   npm run lint   # Check for linting errors
   npm run format # Format code with Prettier
   ```

3. **Update documentation** if needed
4. **Add or update tests** for new functionality

### Pull Request Checklist

- [ ] Branch is up-to-date with main
- [ ] All tests pass locally
- [ ] Code follows project style guidelines
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] No merge conflicts
- [ ] PR description clearly explains changes

### PR Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tested locally with development server
- [ ] Tested production build
- [ ] Added/updated unit tests
- [ ] Manual testing completed

## Screenshots
If applicable, add screenshots to help explain your changes.

## Additional Notes
Any additional information or context about the changes.
```

## 🐛 Bug Reports

When reporting bugs, please include:

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. Windows 10, macOS Big Sur]
- Browser: [e.g. Chrome 91, Firefox 89]
- Node.js version: [e.g. 18.2.0]
- Application version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### Security Issues

For security-related issues, please email directly to security@cvtailoring.app instead of creating a public issue.

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.

**Implementation suggestions**
If you have ideas about how this could be implemented, please share them.
```

## 🧪 Testing Guidelines

### Unit Tests

- Write tests for all utility functions
- Test React components with React Testing Library
- Mock external API calls
- Aim for >80% code coverage

Example:
```javascript
// utils/cvParser.test.js
import { extractContactInfo } from './cvParser';

describe('CV Parser', () => {
  test('should extract email from CV text', () => {
    const cvText = 'John Doe\nEmail: john@example.com\nPhone: 123-456-7890';
    const result = extractContactInfo(cvText);
    
    expect(result.email).toBe('john@example.com');
    expect(result.phone).toBe('123-456-7890');
  });
});
```

### Integration Tests

- Test API endpoints with sample data
- Verify PDF upload and processing
- Test AI integration with mock responses

### Manual Testing

- Test on different browsers and devices
- Verify accessibility with screen readers
- Test with various PDF formats and sizes
- Validate AI responses with different job descriptions

## 📚 Documentation

### Code Documentation

- **JSDoc comments** for all public functions
- **Inline comments** for complex logic
- **README updates** for new features
- **API documentation** for new endpoints

### User Documentation

- Update user guides for new features
- Create or update video tutorials
- Maintain FAQ and troubleshooting guides
- Update deployment documentation

## 🏆 Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **CHANGELOG.md** for significant contributions
- **GitHub releases** acknowledgments
- **Project documentation** credits

## 📞 Getting Help

- **GitHub Discussions**: For questions and community support
- **GitHub Issues**: For bug reports and feature requests
- **Email**: contribute@cvtailoring.app for direct communication

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to the AI-Powered CV Tailoring Application!** 🎉

Your contributions help job seekers worldwide optimize their CVs and land their dream jobs.
