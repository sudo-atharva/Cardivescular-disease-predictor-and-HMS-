# HealthLink Vital Signs - MERN Stack Healthcare Application

A comprehensive healthcare management system built with MongoDB, Express.js, React/Next.js, and Node.js. This application provides secure access for medical professionals and patients to manage health data, view ML-based diagnoses, and monitor vital signs.

## Features

- **Dual User System**: Separate interfaces for doctors and patients
- **Real-time Monitoring**: Live ECG and PPG data visualization
- **Patient Management**: Comprehensive patient records and status tracking
- **Medical Reports**: AI-powered diagnosis reports with detailed medical information
- **Responsive Design**: Modern UI built with Tailwind CSS and Radix UI components
- **Secure Authentication**: Password-protected access with role-based permissions

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Next.js API Routes, MongoDB
- **Database**: MongoDB with Mongoose-like models
- **Styling**: Tailwind CSS, Radix UI components
- **Charts**: Recharts for data visualization
- **Authentication**: bcryptjs for password hashing

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local installation or cloud instance)
- Git

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd new-mern-predictor-AI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up MongoDB

#### Option A: Local MongoDB (Recommended for Development)
```bash
# On Arch Linux
sudo pacman -S mongodb-bin

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Verify MongoDB is running
sudo systemctl status mongodb
```

#### Option B: MongoDB Atlas (Cloud)
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a cluster and get your connection string
- Update the `.env.local` file with your connection string

### 3.1 Set Up Ollama (Optional - for offline AI)
If you want to use offline AI capabilities:

```bash
# Install Ollama (Arch Linux)
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# In another terminal, pull a model
ollama pull llama3.2

# Verify Ollama is running
curl http://localhost:11434/api/tags
```

### 4. Environment Configuration
Create a `.env.local` file in the root directory:

#### For Google AI (Online):
```env
MONGODB_URI=mongodb://localhost:27017/mern-predictor-ai
NODE_ENV=development
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:9002

# AI Configuration
AI_PROVIDER=googleai
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
GOOGLE_AI_MODEL=gemini-2.0-flash
```

#### For Ollama (Offline):
```env
MONGODB_URI=mongodb://localhost:27017/mern-predictor-ai
NODE_ENV=development
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:9002

# AI Configuration
AI_PROVIDER=ollama
OLLAMA_MODEL=llama3.2
OLLAMA_HOST=http://localhost:11434
```

### 5. Seed the Database
```bash
# Start the development server
npm run dev

# In another terminal, seed the database with sample data
curl -X POST http://localhost:9002/api/seed

# Seed sample medical reports
curl -X POST http://localhost:9002/api/seed-reports
```

### 6. Start the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:9002`

## Default Login Credentials

### Doctor Access
- **Email**: `doctor@healthlink.com`
- **Password**: `doctor123`
- **Access**: `/doctor/dashboard`

### Patient Access
- **Patient ID**: `pat_001` or `pat_002`
- **Password**: `patient123`
- **Access**: `/patient/dashboard`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/[patientId]/reports` - Get patient reports

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create new report

### Database Management
- `POST /api/seed` - Seed database with sample users
- `POST /api/seed-reports` - Seed database with sample reports
- `POST /api/clear` - Clear all data (for testing)
- `GET /api/test` - Test MongoDB connection
- `GET /api/debug` - View all users in database

### AI Configuration
- `GET /api/ai/config` - Get current AI provider configuration
- `POST /api/ai/config` - Update AI provider (requires .env.local update)
- `GET /api/ai/test` - Test AI integration (includes mock mode)
- `POST /api/ai/diagnosis` - Generate diagnosis report using AI or mock mode

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── patients/      # Patient management
│   │   └── reports/       # Medical reports
│   ├── doctor/            # Doctor dashboard pages
│   ├── patient/           # Patient dashboard pages
│   └── layout.tsx         # Root layout
├── components/             # Reusable UI components
│   ├── ui/                # Base UI components
│   └── patient-charts.tsx # Vital signs charts
├── lib/                    # Utility functions and configurations
│   ├── mongodb.ts         # Database connection
│   ├── models.ts          # Data models
│   └── utils.ts           # Helper functions
└── hooks/                  # Custom React hooks
```

## AI Providers

The application supports two AI providers for generating medical diagnosis reports:

### Google AI (Online)
- **Provider**: Google's Gemini models via API
- **Setup**: Requires `GOOGLE_AI_API_KEY` environment variable
- **Models**: gemini-2.0-flash, gemini-1.5-pro, etc.
- **Use Case**: Production environments with internet access

### Ollama (Offline)
- **Provider**: Local LLM models via Ollama
- **Setup**: Requires Ollama installed and running locally
- **Models**: llama3.2, codellama, mistral, etc.
- **Use Case**: Development, offline environments, privacy-focused deployments

### Mock Mode (Default)
When no external AI services are configured, the application automatically runs in **mock mode**:
- Provides realistic sample AI responses for demonstration
- No API keys or external services required
- Perfect for development and testing
- Automatically switches to real AI when services are configured

### Switching AI Providers
To switch between providers, update your `.env.local` file:
```bash
# For Google AI
AI_PROVIDER=googleai
GOOGLE_AI_API_KEY=your-api-key

# For Ollama
AI_PROVIDER=ollama
OLLAMA_MODEL=llama3.2
```

## Key Components

### Patient Charts
- Real-time ECG and PPG data visualization
- Responsive charts using Recharts library
- Simulated data for demonstration purposes

### Dashboard Layout
- Responsive sidebar navigation
- Role-based menu items
- User profile and logout functionality

### Authentication System
- Secure password hashing with bcryptjs
- Role-based access control
- Session management

## Development

### Adding New Features
1. Create new API routes in `src/app/api/`
2. Add corresponding pages in `src/app/`
3. Update models in `src/lib/models.ts` if needed
4. Test with the development server

### Database Schema
The application uses MongoDB collections:
- `users`: User accounts (doctors and patients)
- `reports`: Medical diagnosis reports

### Styling
- Uses Tailwind CSS for utility-first styling
- Custom CSS variables for theming
- Responsive design with mobile-first approach

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB service is running
   - Check connection string in `.env.local`
   - Verify database name and permissions

2. **Login Not Working**
   - Check if database is seeded: `curl http://localhost:9002/api/debug`
   - Verify user credentials in the seed data
   - Check browser console for errors

3. **Port Already in Use**
   - Change port in `package.json` scripts
   - Kill existing processes on port 9002

4. **Build Errors**
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

### Debug Endpoints
- `/api/test` - Test database connection
- `/api/debug` - View all users
- `/api/clear` - Clear database (use with caution)

## Production Deployment

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong `NEXTAUTH_SECRET`
   - Configure production MongoDB URI

2. **Build and Start**
   ```bash
   npm run build
   npm start
   ```

3. **Security Considerations**
   - Enable HTTPS
   - Set up proper CORS policies
   - Implement rate limiting
   - Use environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check browser console for errors
4. Verify database connectivity

---

**Note**: This is a demonstration application. For production healthcare use, ensure compliance with relevant healthcare regulations and implement proper security measures.
