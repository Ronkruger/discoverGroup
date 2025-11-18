# DiscoverGroup - Travel & Tour Management Platform

A comprehensive, full-stack travel and tour management platform built with modern web technologies, featuring separate client, admin, and API applications within a monorepo architecture.

## 🚀 Overview

DiscoverGroup is a production-ready tour booking and management system that includes:
- **Client Website**: Public-facing tour booking platform for customers
- **Admin Panel**: Comprehensive management dashboard for tour operators
- **REST API**: Backend services handling authentication, bookings, payments, and more

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## 🛠 Tech Stack

### Frontend (Client & Admin)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS 4
- **Routing**: React Router v7
- **Animation**: Framer Motion
- **State Management**: React Context API

### Backend (API)
- **Runtime**: Node.js with Express 5
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **Email**: SendGrid
- **Storage**: Supabase
- **Payment**: Stripe (with PayMongo/Dragonpay integration)
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

### DevOps & Tools
- **Testing**: Jest, React Testing Library
- **Linting**: ESLint 9
- **Git Hooks**: Husky
- **Validation**: Zod
- **CI/CD**: GitHub Actions (recommended)

## ✨ Features

### Client Features
- 🎫 Tour browsing and booking
- 🗓️ Dynamic departure date selection
- 💳 Multiple payment methods (Stripe, PayMongo, Dragonpay)
- ❤️ Favorites system
- 📧 Email confirmations
- 📱 Responsive design
- 🌍 Multi-country tour support
- 🖼️ Image galleries with Supabase storage

### Admin Features
- 👥 User management with role-based access control
- 🎟️ Tour CRUD operations
- 📊 Booking management
- 📈 Reports and analytics
- 🗺️ Map markers management
- 🎨 Homepage customization
- 💼 Department-specific dashboards (Sales, Visa, CSR, Booking)

### API Features
- 🔐 JWT authentication
- ✉️ Email verification system
- 🛡️ Rate limiting and security
- 📝 Comprehensive error handling
- 🔍 Structured logging
- 🌐 CORS configuration
- 💾 MongoDB integration

## 🏗 Architecture

This project uses a **monorepo** structure:

```
discoverGroup/
├── src/                    # Client application
├── apps/
│   ├── admin/             # Admin panel
│   └── api/               # Backend API
├── packages/
│   └── types/             # Shared TypeScript types
└── dist/                  # Build outputs
```

### Deployment Structure
- **Client**: Deployed to Netlify
- **Admin**: Deployed to Netlify (separate site)
- **API**: Deployed to Railway/Render

See [ARCHITECTURE.txt](./ARCHITECTURE.txt) for detailed architecture documentation.

## 🏁 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ronkruger/discoverGroup.git
cd discoverGroup
```

2. **Install all dependencies**
```bash
npm run install:all
```

3. **Set up environment variables**

Create `.env` files in the root, `apps/api`, and `apps/admin` directories based on the `.env.example` files.

**Root `.env` (Client)**:
```env
VITE_API_URL=http://localhost:4000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

**`apps/api/.env` (API)**:
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=mongodb://localhost:27017/discovergroup
JWT_SECRET=your_very_long_and_secure_secret_at_least_32_characters
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@discovergroup.com
```

**`apps/admin/.env` (Admin)**:
```env
VITE_API_URL=http://localhost:4000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

4. **Start the development servers**
```bash
npm run dev
```

This will start:
- Client: http://localhost:5173
- Admin: http://localhost:5174
- API: http://localhost:4000

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start all apps
npm run dev:client       # Start client only
npm run dev:admin        # Start admin only
npm run dev:api          # Start API only

# Building
npm run build            # Build client
npm run build:full       # Build all apps
npm run build:api        # Build API
npm run build:admin      # Build admin

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Lint all files
npm run deploy:check     # Validate all builds before deployment
```

### Project Structure

```
src/
├── components/          # Reusable React components
├── pages/              # Page components
├── services/           # API services
├── context/            # React context providers
├── lib/                # Utilities and helpers
├── types/              # TypeScript type definitions
└── assets/             # Static assets

apps/api/src/
├── routes/             # Express routes
├── models/             # Mongoose models
├── services/           # Business logic
├── middleware/         # Express middleware
└── utils/              # Utility functions

apps/admin/src/
├── components/         # Admin components
├── pages/              # Admin pages
├── contexts/           # Admin contexts
└── services/           # Admin services
```

## 🧪 Testing

The project uses Jest and React Testing Library for testing.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test files should be named `*.test.ts` or `*.test.tsx` and placed alongside the files they test.

## 🚀 Deployment

### Client & Admin (Netlify)

1. Connect your GitHub repository to Netlify
2. Create two separate sites (one for client, one for admin)
3. Configure build settings:

**Client Site**:
- Build command: `npm run build`
- Publish directory: `dist`
- Base directory: (leave empty)

**Admin Site**:
- Build command: `cd apps/admin && npm install && npm run build`
- Publish directory: `apps/admin/dist`

4. Add environment variables in Netlify dashboard

### API (Railway/Render)

1. Connect your GitHub repository
2. Configure build settings:
   - Build command: `cd apps/api && npm install && npm run build`
   - Start command: `cd apps/api && npm start`
3. Add environment variables
4. Ensure MongoDB is accessible from the deployment environment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## 🔐 Environment Variables

### Security Best Practices

1. **Never commit `.env` files** - They're gitignored
2. **Use strong secrets** - JWT secret should be at least 32 characters
3. **Rotate secrets regularly** - Especially in production
4. **Use environment-specific configs** - Different values for dev/staging/production

### Environment Variable Validation

The project uses Zod for runtime environment variable validation. See `.env.validation.ts` for schema definitions.

## 📚 API Documentation

API documentation is available at `/api/docs` when running in development mode.

### Key Endpoints

```
POST   /api/auth/register       # Register new user
POST   /api/auth/login          # Login
GET    /api/auth/me             # Get current user
GET    /api/tours               # List all tours
GET    /api/tours/:slug         # Get tour by slug
POST   /api/bookings            # Create booking
GET    /api/favorites           # Get user favorites
POST   /api/favorites           # Add to favorites
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is private and proprietary.

## 👥 Team

- **Owner**: Ronkruger
- **Repository**: [discoverGroup](https://github.com/Ronkruger/discoverGroup)

## 📞 Support

For support, email support@discovergroup.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Complete PayMongo integration
- [ ] Add multi-language support
- [ ] Implement advanced search and filters
- [ ] Add customer reviews and ratings
- [ ] Implement real-time notifications
- [ ] Mobile app development
- [ ] Enhanced analytics dashboard
- [ ] Automated testing coverage >80%

## 📖 Additional Documentation

- [Architecture](./ARCHITECTURE.txt)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Email Configuration](./EMAIL_CONFIGURATION.md)
- [Payment Integration](./PAYMENT_ARCHITECTURE.md)
- [Supabase Setup](./SUPABASE_SETUP_NEW.md)
- [Troubleshooting](./TROUBLESHOOTING_EMAIL_VERIFICATION.md)

---

Made with ❤️ by the DiscoverGroup team
