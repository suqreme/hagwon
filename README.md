# Hagwon - AI-Powered Learning Platform

**Domain:** [hagwon.app](https://hagwon.app)

A global, AI-guided, self-paced education system for GED and K-12 students, accessible even in the most underserved parts of the world.

## Overview

Hagwon is designed specifically for rural and underserved communities with limited internet connectivity and shared devices. The platform provides:

- **Multi-student profile system** with PIN-based authentication for shared devices
- **Offline-first architecture** with intelligent caching (50MB localStorage)
- **AI-powered curriculum** with grade-appropriate content generation
- **Comprehensive progress tracking** with achievements and streaks
- **Flexible assessment system** with optional AI-powered placement tests

## Key Features

### 🌐 Rural-First Design
- Works offline with cached lessons and curriculum
- Shared device support for multiple students
- Lightweight architecture optimized for low-end devices
- Progressive Web App (PWA) capabilities

### 🤖 AI-Powered Learning
- Dynamic lesson content generation using OpenAI GPT-4
- Adaptive quiz questions based on student performance
- Grade-appropriate explanations and examples
- Fallback content for offline scenarios

### 📊 Progress Tracking
- Individual profile progress isolation
- Detailed analytics: lessons completed, quiz scores, time spent
- Achievement badges and learning streaks
- Export/import functionality for data portability

### 🎯 Curriculum Structure
- Hybrid system: JSON structure + AI-generated content
- Prerequisite-based lesson unlocking
- Modular subject organization (Math, English, Science, Social Studies)
- Grades K-5 with expandable architecture

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Supabase project

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/hagwon.git
cd hagwon

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Target Market

**Primary:** Rural and underserved communities with:
- Limited internet connectivity
- Shared computer access
- Mixed-age learning environments
- Resource constraints

**Secondary:** 
- Homeschooling families
- GED students
- International students learning English
- Educational NGOs and aid organizations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@hagwon.app or join our community discussions.

---

**Hagwon** - Empowering global education through AI-powered learning, accessible to everyone, everywhere.
