# FuelTrackr 🚗⛽

A beautiful, offline-first Progressive Web App for tracking fuel usage with CRED-inspired design. Built with React, TypeScript, and modern web technologies.

![FuelTrackr Dashboard](./src/assets/hero-fuel-tracking.jpg)

## ✨ Features

- **📱 Progressive Web App** - Install on any device, works offline
- **🎨 CRED-Inspired Design** - Elegant dark theme with glassmorphism effects
- **⚡ Offline-First** - Full functionality without internet connection
- **📊 Beautiful Analytics** - Charts for mileage trends, costs, and fuel efficiency
- **🚗 Multi-Vehicle Support** - Track multiple cars in your garage
- **💾 Smart Data Sync** - Automatic background synchronization when online
- **🔢 Full-to-Full Method** - Accurate mileage calculation using industry standards

## 🚀 Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd fueltrackr

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:8080` to see your app!

## 🛠️ Tech Stack

- **React 18** + **TypeScript** - Modern React with full type safety
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Framer Motion** - Smooth animations and micro-interactions
- **Recharts** - Beautiful, responsive charts
- **Zustand** - Lightweight state management
- **TanStack Query** - Data fetching and caching
- **Dexie** - IndexedDB wrapper for offline storage
- **date-fns** - Modern date utility library

## 📱 Progressive Web App Setup

FuelTrackr is a fully featured PWA that can be installed on any device:

1. **Desktop**: Look for the install button in your browser's address bar
2. **Mobile**: Add to home screen from your browser menu
3. **Offline**: All features work without internet connection

### PWA Features
- ✅ Installable on all platforms
- ✅ Offline functionality
- ✅ Background sync
- ✅ Push notifications (coming soon)
- ✅ Native app-like experience

## 🎯 Core Features

### Dashboard
- Overall fuel efficiency statistics
- Cost per kilometer tracking
- Monthly spending overview
- Beautiful animated cards

### My Garage
- Add/edit/delete vehicles
- Track multiple cars
- Vehicle-specific statistics
- Quick fuel log entry

### Fuel Logging
- **Full Fill** vs **Partial Fill** tracking
- Automatic mileage calculation (full-to-full method)
- Receipt photo upload
- Station and notes tracking
- Smart form validation

### Analytics
- Mileage trends over time
- Cost per kilometer analysis
- Monthly spending charts
- Fuel price tracking

## 🔧 Development

### Available Scripts

```bash
pnpm dev             # Start development server
pnpm build           # Build for production
pnpm preview         # Preview production build
pnpm lint            # Run ESLint
pnpm storybook       # Start Storybook
pnpm build-storybook # Build Storybook
```

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, cards, etc.)
│   └── layout/         # Layout components (navbar, etc.)
├── pages/              # Page components
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── lib/                # Utility functions
├── assets/             # Images and static assets
└── styles/             # Global styles
```

## 🎨 Design System

FuelTrackr uses a CRED-inspired design language with:

- **Dark Theme First** - Elegant dark UI with high contrast
- **Glassmorphism** - Subtle transparency and blur effects
- **Smooth Animations** - Framer Motion for delightful interactions
- **Card-Centric Layout** - Information organized in beautiful cards
- **Premium Gradients** - Purple/blue gradient accents
- **Micro-interactions** - Hover effects and spring animations

### Color Palette
- **Primary**: Purple (#8B5CF6) - Main brand color
- **Secondary**: Blue (#3B82F6) - Accent color
- **Background**: Deep Navy (#0F0F17) - Main background
- **Cards**: Dark Gray (#171722) - Card backgrounds
- **Text**: High contrast whites and grays

## 📊 Fuel Tracking Methodology

FuelTrackr uses the industry-standard **full-to-full method** for accurate mileage calculation:

1. **Full Fills Only** - Mileage calculated only between consecutive full tank fills
2. **Partial Fill Handling** - Partial fills contribute to totals but not per-fill mileage
3. **Distance Calculation** - Current odometer minus previous full fill odometer
4. **Fuel Consumption** - Sum of liters from previous full fill to current full fill

This ensures accurate km/L calculations that match real-world efficiency.

## 🔮 Planned Features

- [ ] **Authentication System** - User accounts and data sync
- [ ] **Supabase Integration** - Cloud database and real-time sync
- [ ] **Advanced Analytics** - Predictive insights and recommendations
- [ ] **Receipt OCR** - Auto-extract data from fuel receipts
- [ ] **Export/Import** - CSV/Excel data management
- [ ] **Multi-currency Support** - International usage
- [ ] **Maintenance Tracking** - Service reminders and logs
- [ ] **Trip Tracking** - GPS-based journey logs

## 🔧 Backend Integration

FuelTrackr is designed to integrate with **Supabase** for backend functionality:

### To Enable Backend Features:
1. Click the **Supabase** button in Lovable's interface
2. Connect your Supabase project
3. Run the provided SQL migrations
4. Enable Row Level Security (RLS)
5. Configure authentication providers

### Database Schema:
- `users` - User profiles and settings
- `cars` - Vehicle information
- `fuel_logs` - Fuel fill records
- `receipts` - File storage for receipt images

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **CRED** - Design inspiration
- **shadcn/ui** - Component library
- **Lucide** - Beautiful icons
- **Recharts** - Chart components
- **Framer Motion** - Animation library

---

**FuelTrackr** - Track smarter, drive better! 🚗💨