import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Fuel, 
  Car, 
  TrendingUp, 
  WifiOff, 
  CloudLightning, 
  ArrowRight, 
  Check, 
  Plus, 
  Settings, 
  Sparkles, 
  Clock, 
  Layers, 
  ChevronDown,
  LayoutDashboard,
  ScrollText,
  LineChart,
  MapPin,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';

// Interactive Simulator Mock Initial Data
const INITIAL_ENTRIES = [
  { id: 1, odoStart: 42000, odoEnd: 42320, volume: 11.2, cost: 40.88, efficiency: 28.5 },
  { id: 2, odoStart: 42320, odoEnd: 42655, volume: 11.5, cost: 42.55, efficiency: 29.1 },
  { id: 3, odoStart: 42655, odoEnd: 42960, volume: 10.8, cost: 38.34, efficiency: 28.2 }
];

// Car Models for Garage switcher
const CARS_GARAGE = [
  { id: 'tesla', name: 'Model 3 Dual Motor', type: 'Electric (MPGe equivalent)', efficiency: '141 MPGe', avgCost: '$0.04 / mi', tankRange: '353 mi', color: 'from-blue-500 to-indigo-500' },
  { id: 'f150', name: 'Ford F-150 Hybrid', type: 'Hybrid Utility', efficiency: '24 MPG', avgCost: '$0.15 / mi', tankRange: '700 mi', color: 'from-amber-500 to-orange-500' },
  { id: 'civic', name: 'Honda Civic Sport', type: 'Gas Sedan', efficiency: '36 MPG', avgCost: '$0.10 / mi', tankRange: '420 mi', color: 'from-purple-500 to-pink-500' }
];

// FAQ items
const FAQS = [
  {
    q: "How does the offline tracking work?",
    a: "FuelTrackr is built offline-first. It caches all your vehicle information, fill-up logs, and settings inside your browser's local database (IndexedDB). You can access, view, and add details without an internet connection. Once online, the app seamlessly uploads the local cache to your secure Supabase cloud profile."
  },
  {
    q: "Can I track multiple cars at the same time?",
    a: "Absolutely! FuelTrackr allows you to create separate logs and telemetry streams for each vehicle in your household or small fleet. Switching between cars is instant and shows independent metrics."
  },
  {
    q: "Is my fuel data secure?",
    a: "Yes. All authenticated data is transmitted over TLS/SSL and stored securely in Supabase. Your personal logs are completely private and only accessible by you using modern secure sign-in options, including Google, GitHub, or email authentication."
  },
  {
    q: "Do you support metric units (liters & kilometers)?",
    a: "Yes, our dashboard allows you to customize fuel volume units (Gallons or Liters), odometer units (Miles or Kilometers), and efficiency metrics (MPG, L/100km, or km/L) to suit your region."
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for Simulator inputs
  const [odoStart, setOdoStart] = useState(42960);
  const [odoEnd, setOdoEnd] = useState(43290);
  const [volume, setVolume] = useState(11.4);
  const [totalCost, setTotalCost] = useState(42.18);
  const [entries, setEntries] = useState(INITIAL_ENTRIES);
  
  // State for interactive features
  const [selectedCar, setSelectedCar] = useState('civic');
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);
  const [syncStatusSimulated, setSyncStatusSimulated] = useState('synced');
  
  // Accordion active index
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Active tour tab mimicking screenshots
  const [tourTab, setTourTab] = useState<'dashboard' | 'logs' | 'analytics'>('dashboard');

  // SEO Update
  useEffect(() => {
    document.title = "FuelTrackr | Smart Fuel & Mileage Tracking App";
    
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (!descriptionMeta) {
      const newMeta = document.createElement('meta');
      newMeta.setAttribute('name', 'description');
      document.head.appendChild(newMeta);
      newMeta.setAttribute('content', "Track vehicle fuel efficiency, mileage costs, and service logs offline-first. Analyze gas mileage telemetry with beautiful dark-mode charts.");
    } else {
      descriptionMeta.setAttribute('content', "Track vehicle fuel efficiency, mileage costs, and service logs offline-first. Analyze gas mileage telemetry with beautiful dark-mode charts.");
    }
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', "FuelTrackr | Smart Fuel & Mileage Tracking App");
    
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', "Track and optimize your fuel mileage. High-performance offline tracking, Supabase cloud synchronization, and beautiful data visualization.");
  }, []);

  // Simulator computations
  const distance = odoEnd - odoStart;
  const computedEfficiency = distance > 0 && volume > 0 ? Number((distance / volume).toFixed(1)) : 0;
  const pricePerUnit = volume > 0 ? Number((totalCost / volume).toFixed(2)) : 0;
  const costPerMile = distance > 0 ? Number((totalCost / distance).toFixed(2)) : 0;

  // Add a simulation entry
  const handleAddSimulationEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (odoEnd <= odoStart) {
      toast.error("Odometer End must be greater than Odometer Start!");
      return;
    }
    if (volume <= 0 || totalCost <= 0) {
      toast.error("Volume and cost must be positive numbers!");
      return;
    }

    const newEntry = {
      id: Date.now(),
      odoStart,
      odoEnd,
      volume,
      cost: totalCost,
      efficiency: computedEfficiency
    };

    setEntries([...entries, newEntry]);
    
    // Prepare for next simulation entry
    setOdoStart(odoEnd);
    setOdoEnd(odoEnd + Math.floor(280 + Math.random() * 80));
    setVolume(Number((10 + Math.random() * 3).toFixed(1)));
    setTotalCost(Number((35 + Math.random() * 10).toFixed(2)));

    toast.success("Simulated entry added to dashboard telemetry!");
  };

  // Simulate Offline switch trigger
  const handleOfflineSimulateChange = (checked: boolean) => {
    setIsOfflineSimulated(checked);
    if (checked) {
      setSyncStatusSimulated('offline');
      toast.info("Offline mode active! Database operations now cached locally.");
    } else {
      setSyncStatusSimulated('syncing');
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1500)),
        {
          loading: 'Synchronizing offline cache with Supabase...',
          success: () => {
            setSyncStatusSimulated('synced');
            return 'Offline entries pushed and database synchronized!';
          },
          error: 'Sync failed.'
        }
      );
    }
  };

  // Generate SVG coordinates for entries chart
  // Normalizes efficiency values to fit in a box of 180x80
  const chartPoints = entries.map((entry, idx) => {
    const x = 10 + idx * 53;
    // Map efficiency (typically 25-32 MPG) to Y range (70 down to 10)
    const y = 70 - ((entry.efficiency - 24) * 6.5);
    return { x, y, eff: entry.efficiency };
  });

  const pathD = chartPoints.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = chartPoints.length > 0 
    ? `${pathD} L ${chartPoints[chartPoints.length - 1].x} 75 L ${chartPoints[0].x} 75 Z` 
    : '';

  const activeCar = CARS_GARAGE.find(c => c.id === selectedCar) || CARS_GARAGE[0];

  return (
    <div className="min-h-screen bg-[#0F0F17] text-white overflow-x-hidden">
      
      {/* Sticky Header/Navbar */}
      <header className="sticky top-0 z-50 w-full bg-[#0F0F17]/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]">
              <Fuel className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                FuelTrackr
              </span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#simulator" className="hover:text-white transition-colors">Interactive Demo</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQs</a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Button 
                onClick={() => navigate('/dashboard')}
                id="btn-goto-dashboard"
                className="bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:opacity-90 font-medium px-5 rounded-xl transition-all"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/login')}
                  id="btn-nav-login"
                  className="text-slate-300 hover:text-white hover:bg-white/5"
                >
                  Log In
                </Button>
                <Button 
                  onClick={() => navigate('/login')}
                  id="btn-nav-signup"
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:opacity-90 font-medium rounded-xl px-5"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square bg-[#8B5CF6]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] aspect-square bg-[#3B82F6]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[20%] w-[40%] aspect-square bg-[#8B5CF6]/5 rounded-full blur-[150px] pointer-events-none" />

        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 pt-16 pb-24 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#8B5CF6]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Offline-First Smart Vehicle Telemetry</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Command Your Mileage.<br />
              <span className="bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent">
                Track Every Gallon.
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              FuelTrackr gives you detailed fuel consumption telemetry, expenses tracking, and multi-vehicle garage sync—all with 100% offline access and beautiful interactive charts.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                onClick={() => navigate('/login')}
                size="lg"
                id="btn-hero-start"
                className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:opacity-90 text-base font-semibold rounded-xl"
              >
                Track Your Mileage Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <a href="#simulator" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="lg"
                  id="btn-hero-demo"
                  className="w-full h-12 px-8 border-white/20 bg-white/5 hover:bg-white/10 text-base font-semibold rounded-xl"
                >
                  Try Live Simulator
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Floating UI Mockup Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 max-w-5xl mx-auto rounded-2xl p-1 bg-gradient-to-r from-white/10 to-transparent border border-white/10 shadow-2xl glass-card overflow-hidden"
          >
            <div className="bg-[#171722]/60 rounded-xl text-left overflow-hidden">
              {/* Interactive Showcase Tabs */}
              <div className="flex flex-wrap border-b border-white/10 bg-[#12121a] px-4 py-2.5 gap-2 justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-slate-500 font-mono ml-1.5 hidden sm:inline">Smart Fuel Tracking Dashboard</span>
                </div>
                
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setTourTab('dashboard')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      tourTab === 'dashboard' 
                        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => setTourTab('logs')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      tourTab === 'logs' 
                        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ScrollText className="w-3.5 h-3.5" />
                    Recent Logs
                  </button>
                  <button
                    onClick={() => setTourTab('analytics')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      tourTab === 'analytics' 
                        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <LineChart className="w-3.5 h-3.5" />
                    Analytics
                  </button>
                </div>
              </div>

              {/* Tab Content Window */}
              <div className="p-4 sm:p-6 min-h-[420px]">
                <AnimatePresence mode="wait">
                  {tourTab === 'dashboard' && (
                    <motion.div
                      key="dashboard"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                        <div>
                          <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Smart Fuel Tracking</h3>
                          <p className="text-xs text-slate-400">Monitor vehicle fuel efficiency, track expenses, and optimize driving with beautiful telemetry.</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3.5 py-1.5 rounded-lg bg-[#8B5CF6] hover:opacity-90 text-xs font-semibold transition-all">+ Add Fuel Log</button>
                          <button className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 transition-all">+ Add Car</button>
                          <button className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 transition-all">View Analytics</button>
                        </div>
                      </div>

                      {/* Overall Performance Cards */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-300">Overall Performance</h4>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between h-24 relative overflow-hidden">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Cars</span>
                            <span className="text-2xl font-bold font-mono">2</span>
                            <span className="text-[10px] text-slate-500">In your garage</span>
                            <Car className="w-5 h-5 text-slate-700 absolute right-4 bottom-4" />
                          </div>
                          
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between h-24 relative overflow-hidden">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Mileage</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold font-mono text-white">11.8</span>
                              <span className="text-xs text-slate-400">km/L</span>
                              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded ml-1.5 font-mono">+0%</span>
                            </div>
                            <span className="text-[10px] text-slate-500">Across all vehicles</span>
                            <Fuel className="w-5 h-5 text-slate-700 absolute right-4 bottom-4" />
                          </div>

                          <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between h-24 relative overflow-hidden">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cost per KM</span>
                            <span className="text-2xl font-bold font-mono text-white">₹9.18</span>
                            <span className="text-[10px] text-slate-500">Running cost</span>
                            <TrendingUp className="w-5 h-5 text-slate-700 absolute right-4 bottom-4" />
                          </div>

                          <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between h-24 relative overflow-hidden">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Spend</span>
                            <span className="text-2xl font-bold font-mono text-white">₹14,172</span>
                            <span className="text-[10px] text-slate-500">This month</span>
                            <Calendar className="w-5 h-5 text-slate-700 absolute right-4 bottom-4" />
                          </div>
                        </div>
                      </div>

                      {/* Garage List */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-semibold text-slate-300">My Garage</h4>
                          <button className="text-xs text-[#8B5CF6] hover:underline font-semibold flex items-center gap-1">+ Add Car</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Car 1 */}
                          <div className="p-4 rounded-xl bg-[#1c1c2b]/50 border border-white/5 space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-semibold text-sm text-white">Hycross ZX Hybrid</h5>
                                <p className="text-[10px] text-slate-500 font-mono">XX-01-AA-9999</p>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[9px] font-bold text-[#8B5CF6]">HYBRID</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-3">
                              <div>
                                <p className="text-[9px] text-slate-500 uppercase">Avg km/L</p>
                                <p className="font-bold text-white font-mono text-base mt-0.5">15.1</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-500 uppercase">₹/km</p>
                                <p className="font-bold text-[#3B82F6] font-mono text-base mt-0.5">7.40</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 pt-1">
                              <button className="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-semibold text-center">View Details</button>
                              <button className="flex-1 py-1.5 rounded-lg bg-[#8B5CF6] hover:opacity-90 text-[10px] font-semibold text-center text-white">Add Fuel</button>
                            </div>
                          </div>

                          {/* Car 2 */}
                          <div className="p-4 rounded-xl bg-[#1c1c2b]/50 border border-white/5 space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-semibold text-sm text-white">XUV300 Crossover</h5>
                                <p className="text-[10px] text-slate-500 font-mono">XX-02-BB-8888</p>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-[9px] font-bold text-[#3B82F6]">PETROL</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-3">
                              <div>
                                <p className="text-[9px] text-slate-500 uppercase">Avg km/L</p>
                                <p className="font-bold text-white font-mono text-base mt-0.5">8.2</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-500 uppercase">₹/km</p>
                                <p className="font-bold text-[#3B82F6] font-mono text-base mt-0.5">14.25</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 pt-1">
                              <button className="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-semibold text-center">View Details</button>
                              <button className="flex-1 py-1.5 rounded-lg bg-[#8B5CF6] hover:opacity-90 text-[10px] font-semibold text-center text-white">Add Fuel</button>
                            </div>
                          </div>

                          {/* Add Car Placeholder */}
                          <div className="p-4 rounded-xl border border-dashed border-white/10 hover:border-white/25 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer transition-colors group">
                            <div className="p-2.5 rounded-full bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10 transition-all">
                              <Plus className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-xs text-white">Add New Car</p>
                              <p className="text-[9px] text-slate-500 max-w-[150px] mx-auto leading-snug mt-0.5">Start tracking fuel consumption for another vehicle</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {tourTab === 'logs' && (
                    <motion.div
                      key="logs"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <div>
                          <h3 className="text-lg font-bold">Recent Fuel Logs</h3>
                          <p className="text-xs text-slate-400">Recent logs tracked with complete cost distribution</p>
                        </div>
                        <button className="px-3.5 py-1.5 rounded-lg bg-[#8B5CF6] hover:opacity-90 text-xs font-semibold transition-all">+ Add Fuel Log</button>
                      </div>

                      {/* Fuel Logs list mimicking screenshot 2 */}
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                        {/* Log 1 */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs space-y-3 relative">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
                                <Fuel className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-sm">48L</span>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold">13.9 km/L</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5">Wed, 3 Jun, 2026 • Hycross ZX Hybrid</p>
                              </div>
                            </div>
                            <div className="flex gap-1 cursor-pointer hover:bg-white/5 p-1 rounded">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-white/5 bg-black/25 rounded-lg p-2.5">
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase">Odometer</p>
                              <p className="font-bold text-white font-mono mt-0.5">13,954 <span className="text-[8px] text-slate-400 font-normal">km</span></p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase">Rate/L</p>
                              <p className="font-bold text-white font-mono mt-0.5">₹105.00</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase">Total</p>
                              <p className="font-bold text-emerald-400 font-mono mt-0.5">₹5,040.00</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase">Distance</p>
                              <p className="font-bold text-white font-mono mt-0.5">669 <span className="text-[8px] text-slate-400 font-normal">km</span></p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pl-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>Metro Fuel Outlet</span>
                          </div>
                        </div>

                        {/* Log 2 */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs space-y-3 relative">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
                                <Fuel className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-sm">38.37L</span>
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono font-bold">8.1 km/L</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5">Thu, 28 May, 2026 • XUV300 Crossover</p>
                              </div>
                            </div>
                            <div className="flex gap-1 cursor-pointer hover:bg-white/5 p-1 rounded">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-white/5 bg-black/25 rounded-lg p-2.5">
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase">Odometer</p>
                              <p className="font-bold text-white font-mono mt-0.5">42,521 <span className="text-[8px] text-slate-400 font-normal">km</span></p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase">Rate/L</p>
                              <p className="font-bold text-white font-mono mt-0.5">₹120.00</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase">Total</p>
                              <p className="font-bold text-emerald-400 font-mono mt-0.5">₹4,604.40</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase">Distance</p>
                              <p className="font-bold text-white font-mono mt-0.5">309 <span className="text-[8px] text-slate-400 font-normal">km</span></p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pl-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>Highway Plaza Station</span>
                          </div>
                        </div>

                        {/* Log 3 */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs space-y-3 relative">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
                                <Fuel className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-sm">38.7L</span>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold">14.2 km/L</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5">Sun, 24 May, 2026 • Hycross ZX Hybrid</p>
                              </div>
                            </div>
                            <div className="flex gap-1 cursor-pointer hover:bg-white/5 p-1 rounded">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-white/5 bg-black/25 rounded-lg p-2.5">
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase">Odometer</p>
                              <p className="font-bold text-white font-mono mt-0.5">13,285 <span className="text-[8px] text-slate-400 font-normal">km</span></p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase">Rate/L</p>
                              <p className="font-bold text-white font-mono mt-0.5">₹117.00</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase">Total</p>
                              <p className="font-bold text-emerald-400 font-mono mt-0.5">₹4,527.90</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase">Distance</p>
                              <p className="font-bold text-white font-mono mt-0.5">550 <span className="text-[8px] text-slate-400 font-normal">km</span></p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pl-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>City Speed Point</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {tourTab === 'analytics' && (
                    <motion.div
                      key="analytics"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                        <div>
                          <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Analytics</h3>
                          <p className="text-xs text-slate-400">Insights into your fuel consumption and spending</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 transition-all font-mono">Hycross ZX Hybrid •</button>
                          <button className="px-3.5 py-1.5 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-xs font-semibold text-[#8B5CF6] hover:bg-[#8B5CF6]/20 transition-all">Last 12 Months</button>
                        </div>
                      </div>

                      {/* Stats cards mimicking screenshot 3 */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between h-20">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Spend</span>
                          <span className="text-xl font-bold font-mono text-white">₹1,03,165</span>
                          <span className="text-[9px] text-slate-500">Total fuel cost</span>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between h-20">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg. Mileage</span>
                          <span className="text-xl font-bold font-mono text-emerald-400">15.1 <span className="text-[10px] text-slate-400 font-normal">km/L</span></span>
                          <span className="text-[9px] text-slate-500">Weighted average</span>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between h-20">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cost / KM</span>
                          <span className="text-xl font-bold font-mono text-white">₹7.40</span>
                          <span className="text-[9px] text-slate-500">Running efficiency</span>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between h-20">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Distance</span>
                          <span className="text-xl font-bold font-mono text-white">13,934 <span className="text-[10px] text-slate-400 font-normal">km</span></span>
                          <span className="text-[9px] text-slate-500">Total km tracked</span>
                        </div>
                      </div>

                      {/* Graph replicating Screenshot 3 */}
                      <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-3">
                          <div>
                            <h4 className="text-xs font-bold text-slate-300">📈 Mileage Trends</h4>
                            <p className="text-[10px] text-slate-500">Fuel efficiency over time (full-to-full method)</p>
                          </div>
                          
                          <div className="flex gap-1 bg-black/25 p-0.5 rounded-lg border border-white/5 text-[9px] font-bold text-slate-400 select-none">
                            <span className="bg-[#8B5CF6] text-white px-2 py-0.5 rounded-md">Mileage</span>
                            <span className="px-2 py-0.5">Spending</span>
                            <span className="px-2 py-0.5">Efficiency</span>
                            <span className="px-2 py-0.5">Fuel Prices</span>
                          </div>
                        </div>

                        {/* Chart body */}
                        <div className="h-44 w-full relative pt-2">
                          {/* Y Axis */}
                          <div className="absolute left-0 top-0 h-[calc(100%-24px)] flex flex-col justify-between text-[8px] font-mono text-slate-600 pr-2 border-r border-white/5 select-none">
                            <span>20</span>
                            <span>15</span>
                            <span>10</span>
                            <span>5</span>
                            <span>0</span>
                          </div>

                          <div className="h-[calc(100%-24px)] pl-7 pr-2 relative">
                            {/* Horizontal Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                              <div className="border-t border-dashed border-slate-600 h-0 w-full" />
                              <div className="border-t border-dashed border-slate-600 h-0 w-full" />
                              <div className="border-t border-dashed border-slate-600 h-0 w-full" />
                              <div className="border-t border-dashed border-slate-600 h-0 w-full" />
                              <div className="border-t border-solid border-slate-600 h-0 w-full" />
                            </div>

                            {/* Line graph replicating user's Mileage trends */}
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 440 100" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                              
                              {/* Replicated curve path */}
                              <path
                                d="M 10 35 L 30 45 L 50 25 L 70 32 L 90 35 L 110 28 L 130 40 L 150 18 L 170 38 L 190 36 L 210 42 L 230 38 L 250 45 L 270 10 L 290 24 L 310 55 L 330 18 L 350 60 L 370 5 L 390 30 L 410 20 L 420 35 L 430 38"
                                fill="none"
                                stroke="#8B5CF6"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />

                              <path
                                d="M 10 35 L 30 45 L 50 25 L 70 32 L 90 35 L 110 28 L 130 40 L 150 18 L 170 38 L 190 36 L 210 42 L 230 38 L 250 45 L 270 10 L 290 24 L 310 55 L 330 18 L 350 60 L 370 5 L 390 30 L 410 20 L 420 35 L 430 38 L 430 100 L 10 100 Z"
                                fill="url(#chartGlow)"
                              />

                              {/* Key data nodes */}
                              <circle cx="10" cy="35" r="3" fill="#8B5CF6" stroke="#171722" strokeWidth="1" />
                              <circle cx="90" cy="35" r="3" fill="#8B5CF6" stroke="#171722" strokeWidth="1" />
                              <circle cx="150" cy="18" r="3" fill="#8B5CF6" stroke="#171722" strokeWidth="1" />
                              <circle cx="270" cy="10" r="3" fill="#8B5CF6" stroke="#171722" strokeWidth="1" />
                              <circle cx="370" cy="5" r="4" fill="#3B82F6" stroke="#171722" strokeWidth="2" />
                            </svg>
                          </div>

                          {/* Date labels at bottom */}
                          <div className="flex justify-between text-[7px] text-slate-500 font-mono pl-7 pt-2 select-none gap-1 overflow-x-auto">
                            <span>22 Sept</span>
                            <span>6 Oct</span>
                            <span>9 Nov</span>
                            <span>25 Dec</span>
                            <span>18 Jan</span>
                            <span>18 Feb</span>
                            <span>18 Mar</span>
                            <span>21 Mar</span>
                            <span>28 Mar</span>
                            <span>25 Apr</span>
                            <span>2 May</span>
                            <span>24 May</span>
                            <span>3 Jun</span>
                          </div>
                        </div>

                        <div className="flex justify-center items-center gap-1.5 text-[9px] text-slate-400 font-mono mt-1 pt-1">
                          <span className="w-2.5 h-1 bg-[#8B5CF6] rounded" />
                          <span>Mileage (km/L)</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 border-t border-white/5 bg-white/[0.01] relative z-10">
          <div className="container mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Engineered for Vehicle Intelligence
              </h2>
              <p className="text-slate-400">
                Track your fuel telemetry locally, analyze expenses in real time, and experience fluid, modern interface features.
              </p>
            </div>

            {/* Interactive Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Feature 1: Multi-Car Garage switcher */}
              <Card className="bg-[#171722]/80 border-white/10 text-white overflow-hidden shadow-xl hover:border-white/20 transition-all flex flex-col justify-between">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="p-2.5 w-fit rounded-xl bg-purple-500/10 border border-purple-500/15 text-[#8B5CF6]">
                      <Car className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold">Multi-Vehicle Garage</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Toggle active logs instantly across multiple cars in your garage. Custom metrics adjust dynamically per drivetrain.
                    </p>
                  </div>

                  {/* Interactive Tab switch simulator inside Card */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 space-y-3 text-xs">
                    <div className="flex gap-1.5">
                      {CARS_GARAGE.map((car) => (
                        <button
                          key={car.id}
                          onClick={() => setSelectedCar(car.id)}
                          className={`flex-1 py-1 rounded-lg font-semibold transition-all ${
                            selectedCar === car.id 
                              ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md' 
                              : 'bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          {car.id.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    
                    <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Name:</span>
                        <span className="font-semibold">{activeCar.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Drivetrain:</span>
                        <span className="text-slate-300 font-mono">{activeCar.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Efficiency:</span>
                        <span className="text-emerald-400 font-semibold">{activeCar.efficiency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Cost:</span>
                        <span className="text-[#3B82F6] font-semibold">{activeCar.avgCost}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Feature 2: Simulated Offline Synchronization */}
              <Card className="bg-[#171722]/80 border-white/10 text-white overflow-hidden shadow-xl hover:border-white/20 transition-all flex flex-col justify-between">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="p-2.5 w-fit rounded-xl bg-blue-500/10 border border-blue-500/15 text-[#3B82F6]">
                      <WifiOff className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold">Offline-First Engine</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Losing cell service on long trips? FuelTrackr caches all data to IndexedDB locally and pushes sync when connection recovers.
                    </p>
                  </div>

                  {/* Interactive Offline toggle simulator inside Card */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Simulate Offline Mode</span>
                      <Switch 
                        checked={isOfflineSimulated}
                        onCheckedChange={handleOfflineSimulateChange}
                        id="switch-offline-sim"
                      />
                    </div>
                    
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-slate-400">Network State:</span>
                      <div className="flex items-center gap-1.5 font-bold">
                        {isOfflineSimulated ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-red-400">Offline Caching</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-emerald-400">Online Live</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-black/20 border border-white/5 font-mono text-[10px] text-slate-400 text-center">
                      {syncStatusSimulated === 'offline' && "⚡ Logs writing directly to browser DB"}
                      {syncStatusSimulated === 'syncing' && "🔄 Connecting & syncing nodes..."}
                      {syncStatusSimulated === 'synced' && "✓ Verified sync with Supabase Cloud"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Feature 3: Advanced Charts & Analytics */}
              <Card className="bg-[#171722]/80 border-white/10 text-white overflow-hidden shadow-xl hover:border-white/20 transition-all flex flex-col justify-between">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="p-2.5 w-fit rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-[#10B981]">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold">Deep Cost Analytics</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Visualize mileage efficiency fluctuations, cost distributions, and monthly expenses trends with clean customizable graphs.
                    </p>
                  </div>

                  {/* Interactive visual helper chart */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 flex flex-col justify-between text-xs h-[110px]">
                    <div className="flex justify-between items-center border-b border-white/5 pb-1 mb-1">
                      <span className="font-semibold text-slate-400">Weekly Spent Trends</span>
                      <span className="text-[#10B981] font-bold">$42.80 avg</span>
                    </div>
                    <div className="flex items-end justify-between h-14 pt-2 px-1">
                      <div className="w-6 bg-purple-500/40 hover:bg-purple-500/60 rounded-t h-[40%] transition-all relative group">
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#171722] border border-white/10 px-1 py-0.5 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">$22</span>
                      </div>
                      <div className="w-6 bg-purple-500/40 hover:bg-purple-500/60 rounded-t h-[75%] transition-all relative group">
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#171722] border border-white/10 px-1 py-0.5 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">$45</span>
                      </div>
                      <div className="w-6 bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 rounded-t h-[90%] transition-all relative group">
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#171722] border border-white/10 px-1 py-0.5 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">$54</span>
                      </div>
                      <div className="w-6 bg-[#3B82F6] hover:bg-[#3B82F6]/90 rounded-t h-[65%] transition-all relative group">
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#171722] border border-white/10 px-1 py-0.5 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">$38</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* Simulator Section */}
        <section id="simulator" className="py-24 relative z-10 border-t border-white/5">
          <div className="container mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <span className="px-3 py-1 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-xs font-semibold text-[#3B82F6]">
                Interactive Sandbox
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Interactive Fuel Tracker Simulator
              </h2>
              <p className="text-slate-400">
                Log a simulated fuel stop in real time. Watch how distance, mileage, and unit pricing update live in the SVG telemetry graph.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
              
              {/* Left Column: Form Simulator */}
              <Card className="lg:col-span-5 bg-[#171722]/60 border-white/10 text-white shadow-xl relative overflow-hidden glass-card">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">Input Fuel Stop</h3>
                    <p className="text-xs text-slate-400">Insert values to test calculations</p>
                  </div>

                  <form onSubmit={handleAddSimulationEntry} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sim-odo-start" className="text-xs text-slate-300">Odometer Start (mi)</Label>
                        <Input
                          id="sim-odo-start"
                          type="number"
                          value={odoStart}
                          onChange={(e) => setOdoStart(Number(e.target.value))}
                          className="bg-white/5 border-white/10 focus:border-[#8B5CF6]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sim-odo-end" className="text-xs text-slate-300">Odometer End (mi)</Label>
                        <Input
                          id="sim-odo-end"
                          type="number"
                          value={odoEnd}
                          onChange={(e) => setOdoEnd(Number(e.target.value))}
                          className="bg-white/5 border-white/10 focus:border-[#8B5CF6]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sim-volume" className="text-xs text-slate-300">Fuel Vol (Gallons)</Label>
                        <Input
                          id="sim-volume"
                          type="number"
                          step="0.01"
                          value={volume}
                          onChange={(e) => setVolume(Number(e.target.value))}
                          className="bg-white/5 border-white/10 focus:border-[#8B5CF6]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sim-cost" className="text-xs text-slate-300">Total Price ($)</Label>
                        <Input
                          id="sim-cost"
                          type="number"
                          step="0.01"
                          value={totalCost}
                          onChange={(e) => setTotalCost(Number(e.target.value))}
                          className="bg-white/5 border-white/10 focus:border-[#8B5CF6]"
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      id="btn-log-sim-entry"
                      className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:opacity-90 font-medium py-2 rounded-xl mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Log Simulated Entry
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Right Column: Calculations & Live SVG Graph */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-6">
                
                {/* Real-time Telemetry Panels */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Distance</span>
                    <span className="text-xl font-bold font-mono text-white">
                      {distance > 0 ? `${distance} mi` : '--'}
                    </span>
                  </div>
                  
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Efficiency</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">
                      {computedEfficiency > 0 ? `${computedEfficiency} MPG` : '--'}
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Price / Gallon</span>
                    <span className="text-xl font-bold font-mono text-white">
                      {pricePerUnit > 0 ? `$${pricePerUnit.toFixed(2)}` : '--'}
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cost / Mile</span>
                    <span className="text-xl font-bold font-mono text-[#3B82F6]">
                      {costPerMile > 0 ? `$${costPerMile.toFixed(2)}` : '--'}
                    </span>
                  </div>
                </div>

                {/* Live SVG Graph representing active entries state */}
                <Card className="bg-[#171722]/60 border-white/10 text-white shadow-xl flex-1 glass-card">
                  <CardContent className="p-6 flex flex-col justify-between h-full min-h-[200px]">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-300">Live Telemetry Timeline</h4>
                        <p className="text-[10px] text-slate-500">Add entries to see updates instantly</p>
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                        Total Stops Logged: {entries.length}
                      </span>
                    </div>

                    {/* SVG Line Graph */}
                    <div className="h-28 w-full relative">
                      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="liveGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Grid Lines */}
                        <line x1="0" y1="15" x2="100%" y2="15" stroke="white" strokeOpacity="0.05" strokeDasharray="3,3" />
                        <line x1="0" y1="45" x2="100%" y2="45" stroke="white" strokeOpacity="0.05" strokeDasharray="3,3" />
                        <line x1="0" y1="75" x2="100%" y2="75" stroke="white" strokeOpacity="0.05" strokeDasharray="3,3" />

                        {/* Chart Paths */}
                        {entries.length > 1 && (
                          <>
                            <path
                              d={pathD}
                              fill="none"
                              stroke="url(#gradient)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              className="stroke-[#8B5CF6]"
                            />
                            <path
                              d={areaD}
                              fill="url(#liveGlow)"
                            />
                          </>
                        )}

                        {/* Chart Circles/Tooltips */}
                        {chartPoints.map((pt, i) => (
                          <g key={i} className="group cursor-pointer">
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="4"
                              className="fill-[#3B82F6] stroke-[#0F0F17] stroke-2 hover:r-6 hover:fill-[#8B5CF6] transition-all"
                            />
                            <text
                              x={pt.x}
                              y={pt.y - 12}
                              textAnchor="middle"
                              className="fill-white text-[9px] font-mono font-bold bg-[#171722] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {pt.eff} MPG
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>

                    <div className="flex justify-between text-[9px] text-slate-500 mt-4 border-t border-white/5 pt-2 font-mono">
                      <span>Older Fill-ups</span>
                      <span>Latest Fill-up Simulated</span>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 relative z-10 bg-white/[0.01]">
          <div className="container mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <span className="px-3 py-1 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-xs font-semibold text-[#8B5CF6]">
                Flexible Pricing
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Simple Plans, Complete Clarity
              </h2>
              <p className="text-slate-400">
                Start logging your fuel stops with our core features or request cloud analytics options.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Free Core Plan */}
              <Card className="bg-[#171722]/60 border-white/10 text-white relative overflow-hidden glass-card flex flex-col justify-between">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Core Tracker</h3>
                    <p className="text-sm text-slate-400">Perfect for individual vehicle tracking.</p>
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold tracking-tight">$0</span>
                    <span className="text-sm text-slate-400 font-semibold">/ lifetime free</span>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                        <Check className="w-4 h-4" />
                      </div>
                      <span>Offline tracking & local storage</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                        <Check className="w-4 h-4" />
                      </div>
                      <span>Telemetry calculations (MPG, L/100km)</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                        <Check className="w-4 h-4" />
                      </div>
                      <span>Advanced telemetry dashboards</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => navigate('/login')}
                    className="w-full h-11 bg-white/10 border border-white/10 hover:bg-white/20 text-white font-medium rounded-xl"
                  >
                    Start Free
                  </Button>
                </CardContent>
              </Card>

              {/* Cloud Sync Pro Plan */}
              <Card className="bg-[#171722]/80 border-[#8B5CF6]/50 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-[#8B5CF6] to-[#3B82F6] text-white px-3 py-1 text-[10px] font-bold rounded-bl-xl uppercase tracking-wider">
                  Launch Special
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      Cloud Sync Pro
                    </h3>
                    <p className="text-sm text-slate-400">Lifetime free cloud sync & garage management for our first 5,000 supporters.</p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-5xl font-extrabold tracking-tight">$0</span>
                    <span className="text-base text-slate-500 line-through font-semibold">$2.99</span>
                    <span className="text-xs text-[#8B5CF6] font-bold bg-[#8B5CF6]/15 border border-[#8B5CF6]/20 px-2 py-0.5 rounded-full">
                      Free for first 5,000 users
                    </span>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-0.5 rounded-full bg-purple-500/20 text-[#8B5CF6]">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-200">Everything in Core</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-0.5 rounded-full bg-purple-500/20 text-[#8B5CF6]">
                        <Check className="w-4 h-4" />
                      </div>
                      <span>Automatic Supabase Cloud Sync</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-0.5 rounded-full bg-purple-500/20 text-[#8B5CF6]">
                        <Check className="w-4 h-4" />
                      </div>
                      <span>Multi-car garage profiles (unlimited)</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-0.5 rounded-full bg-purple-500/20 text-[#8B5CF6]">
                        <Check className="w-4 h-4" />
                      </div>
                      <span>Export data to PDF / CSV logs</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => navigate('/login')}
                    className="w-full h-11 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:opacity-90 font-medium rounded-xl text-white shadow-lg shadow-purple-500/20 animate-pulse hover:animate-none"
                  >
                    Claim Free Lifetime Spot
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQs Accordion Section */}
        <section id="faq" className="py-24 relative z-10 border-t border-white/5">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-400">
                Have questions about offline capabilities or syncing? We have answers.
              </p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <div 
                  key={idx} 
                  className="rounded-xl border border-white/10 bg-[#171722]/40 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-slate-200">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                      activeFaq === idx ? 'transform rotate-180' : ''
                    }`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {activeFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="p-5 pt-0 border-t border-white/5 text-sm text-slate-400 leading-relaxed bg-white/[0.01]">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 border-t border-white/5 relative z-10 text-center">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Ready to Upgrade Your Dashboard?
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Join thousands of drivers tracking telemetry, average fuel costs, and efficiency statistics. No payment method required to start.
            </p>
            <Button 
              onClick={() => navigate('/login')}
              size="lg"
              id="btn-footer-cta"
              className="h-12 px-8 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:opacity-90 font-semibold rounded-xl"
            >
              Start Free Telemetry Tracking
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0A0A0F] py-12 text-slate-500 text-xs relative z-10">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]">
              <Fuel className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">FuelTrackr</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#simulator" className="hover:text-white transition-colors">Demo</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQs</a>
          </div>

          <div>
            <p>© {new Date().getFullYear()} FuelTrackr. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
