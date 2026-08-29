import { useState, useEffect, useMemo } from 'react';
import { 
  Heart, Shield, Sparkles, MapPin, Clock, Phone, Navigation, Search, 
CheckCircle, MessageSquare, Building, AlertTriangle, 
Send, Check, Bookmark, 
Info, Leaf, Laptop, FileText, X, Compass, Zap,
  Sliders
} from 'lucide-react';

// ================= BREVARD COUNTY RESOURCE DATABASE =================
const BREVARD_RESOURCES = [
  {
    id: "res-1",
    name: "North Brevard Food Pantry & Outreach",
    category: "Food Banks",
    address: "4475 S Hopkins Ave, Titusville, FL 32780",
    lat: 28.5724,
    lng: -80.8038,
    phone: "(321) 269-6655",
    description: "Emergency grocery assistance, shelf-stable boxes, and hot lunch program for North Brevard residents.",
    hoursText: "Mon-Fri: 9:00 AM - 12:00 PM",
    schedule: { 1: [9, 12], 2: [9, 12], 3: [9, 12], 4: [9, 12], 5: [9, 12] },
    tags: ["No ID Required", "Groceries", "North Brevard", "Emergency Pantry"],
    partnerType: "Verified Non-Profit",
    capacityStatus: "Normal Supply",
    triageCategory: "food"
  },
  {
    id: "res-2",
    name: "St. Gabriel Episcopal Hope Center",
    category: "Churches & Faith-Based",
    address: "414 Pine St, Titusville, FL 32796",
    lat: 28.6133,
    lng: -80.8091,
    phone: "(321) 267-2545",
    description: "Weekly hot meal distribution, shower trailer vouchers, and emergency travel assistance gas cards.",
    hoursText: "Tue, Thu: 10:00 AM - 1:30 PM",
    schedule: { 2: [10, 13.5], 4: [10, 13.5] },
    tags: ["Hot Meals", "Showers", "Travelers", "No ID Required", "Fuel Cards"],
    partnerType: "Faith Partner",
    capacityStatus: "High Demand",
    triageCategory: "travel"
  },
  {
    id: "res-3",
    name: "Scottsmoor Community Care Hub (Base Impact)",
    category: "Charity Free Services",
    address: "3750 Magoon Ave, Scottsmoor, FL 32775",
    lat: 28.7617,
    lng: -80.8625,
    phone: "(321) 555-0199",
    description: "Digital application assistance, computer access, housing resource navigation, and hygiene kit distribution.",
    hoursText: "Mon, Wed, Fri: 1:00 PM - 5:00 PM",
    schedule: { 1: [13, 17], 3: [13, 17], 5: [13, 17] },
    tags: ["Tech Assistance", "Housing Help", "Job Search", "Hygiene", "North Brevard"],
    partnerType: "Direct Base Impact Station",
    capacityStatus: "Open & Ready",
    triageCategory: "id_tech"
  },
  {
    id: "res-4",
    name: "Central Brevard Sharing Center Shelter",
    category: "Shelters & Housing",
    address: "113 Aurora St, Cocoa, FL 32922",
    lat: 28.3582,
    lng: -80.7302,
    phone: "(321) 631-0306",
    description: "Day center, emergency night shelter vouchers, laundry facilities, and social service case management.",
    hoursText: "Mon-Sat: 9:00 AM - 3:00 PM",
    schedule: { 1: [9, 15], 2: [9, 15], 3: [9, 15], 4: [9, 15], 5: [9, 15], 6: [9, 15] },
    tags: ["Showers", "Laundry", "Case Management", "Open Residency", "Shelter"],
    partnerType: "Regional Partner",
    capacityStatus: "Limited Beds",
    triageCategory: "shelter"
  },
  {
    id: "res-5",
    name: "Daily Bread Melbourne Day Center",
    category: "Showers & Hygiene",
    address: "815 E Strawbridge Ave, Melbourne, FL 32901",
    lat: 28.0784,
    lng: -80.6026,
    phone: "(321) 723-1060",
    description: "Daily hot lunch, shower access, mail collection service for unhoused neighbors, and healthcare navigation.",
    hoursText: "Daily: 11:00 AM - 1:00 PM",
    schedule: { 0: [11, 13], 1: [11, 13], 2: [11, 13], 3: [11, 13], 4: [11, 13], 5: [11, 13], 6: [11, 13] },
    tags: ["Daily Lunch", "Showers", "Mail Service", "Healthcare", "No ID Required"],
    partnerType: "Regional Partner",
    capacityStatus: "Normal Supply",
    triageCategory: "food"
  },
  {
    id: "res-6",
    name: "Mims Community Garden & Produce Pantry",
    category: "Food Banks",
    address: "2470 Kelly Rd, Mims, FL 32754",
    lat: 28.6653,
    lng: -80.8481,
    phone: "(321) 555-0144",
    description: "Fresh vegetable distribution from local community gardens and nutrition education workshops.",
    hoursText: "Saturday: 8:00 AM - 11:00 AM",
    schedule: { 6: [8, 11] },
    tags: ["Fresh Produce", "Eco-Space", "North Brevard"],
    partnerType: "Grassroots Partner",
    capacityStatus: "Open & Ready",
    triageCategory: "food"
  }
];

const PRESET_TOWNS = {
  "Scottsmoor": { lat: 28.7617, lng: -80.8625 },
  "Mims": { lat: 28.6653, lng: -80.8481 },
  "Titusville": { lat: 28.6133, lng: -80.8091 },
  "Cocoa": { lat: 28.3582, lng: -80.7302 },
  "Melbourne": { lat: 28.0784, lng: -80.6026 }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [userLocation, setUserLocation] = useState(PRESET_TOWNS["Scottsmoor"]);
  const [selectedTown, setSelectedTown] = useState("Scottsmoor");
  const [maxDistance, setMaxDistance] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [onlySaved, setOnlySaved] = useState(false);
  const [savedResources, setSavedResources] = useState<string[]>([]);
  
  // Triage Wizard State
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [triageStep, setTriageStep] = useState(1);
  const [triageNeed, setTriageNeed] = useState('');

  // Feedback Form State
  const [feedback, setFeedback] = useState({ name: '', email: '', role: 'Neighbor', message: '', type: 'General Suggestion' });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Partner Intake State
  const [partnerIntake, setPartnerIntake] = useState({ orgName: '', contactPerson: '', email: '', phone: '', serviceType: 'Food Assistance', needs: '' });
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);

  // Load Saved Resources from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('baseimpact_saved');
      if (stored) setSavedResources(JSON.parse(stored));
    } catch (e) {
      console.error("Local storage access restricted", e);
    }
  }, []);

  const toggleSaveResource = (id: string) => {
    let updated = savedResources.includes(id) 
      ? savedResources.filter(rId => rId !== id)
      : [...savedResources, id];
    setSavedResources(updated);
    try {
      localStorage.setItem('baseimpact_saved', JSON.stringify(updated));
    } catch (e) {
      console.error("Local storage error", e);
    }
  };

  // Haversine Distance Formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8; // Radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  // Real-Time Schedule Calculation
  const getNextAvailableInfo = (resource: any) => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours() + (now.getMinutes() / 60);

    const todayHours = resource.schedule[currentDay];
    if (todayHours && currentHour >= todayHours[0] && currentHour < todayHours[1]) {
      const remainingHours = Math.ceil(todayHours[1] - currentHour);
      return { status: 'OPEN', label: `Open Now (Closes in ~${remainingHours}h)`, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }

    if (todayHours && currentHour < todayHours[0]) {
      return { status: 'SOON', label: `Opens Today at ${formatTime(todayHours[0])}`, color: 'bg-amber-100 text-amber-800 border-amber-300' };
    }

    for (let offset = 1; offset <= 7; offset++) {
      const checkDay = (currentDay + offset) % 7;
      if (resource.schedule[checkDay]) {
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const openTime = formatTime(resource.schedule[checkDay][0]);
        const dayLabel = offset === 1 ? "Tomorrow" : dayNames[checkDay];
        return { status: 'CLOSED', label: `Next: ${dayLabel} at ${openTime}`, color: 'bg-slate-100 text-slate-700 border-slate-300' };
      }
    }
    return { status: 'UNKNOWN', label: 'Call for Schedule', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  };

  const formatTime = (decimalTime: number) => {
    const hrs = Math.floor(decimalTime);
    const mins = Math.round((decimalTime - hrs) * 60);
    const period = hrs >= 12 ? 'PM' : 'AM';
    const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
    const displayMins = mins < 10 ? `0${mins}` : mins;
    return `${displayHrs}:${displayMins} ${period}`;
  };

  // Filter & Sort Logic
  const processedResources = useMemo(() => {
    return BREVARD_RESOURCES.map(res => {
      const dist = parseFloat(calculateDistance(userLocation.lat, userLocation.lng, res.lat, res.lng));
      const avail = getNextAvailableInfo(res);
      return { ...res, distanceMiles: dist, nextAvail: avail };
    })
    .filter(res => res.distanceMiles <= maxDistance)
    .filter(res => {
      if (onlySaved && !savedResources.includes(res.id)) return false;
      if (selectedCategory !== 'All' && res.category !== selectedCategory) return false;
      if (selectedTag !== 'All' && !res.tags.includes(selectedTag)) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return res.name.toLowerCase().includes(q) || 
               res.description.toLowerCase().includes(q) || 
               res.tags.some(t => t.toLowerCase().includes(q)) ||
               res.address.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => a.distanceMiles - b.distanceMiles);
  }, [userLocation, maxDistance, selectedCategory, selectedTag, searchQuery, onlySaved, savedResources]);

  const handleLocationSelect = (townName: keyof typeof PRESET_TOWNS) => {
    setSelectedTown(townName);
    setUserLocation(PRESET_TOWNS[townName]);
  };

  const triggerGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setSelectedTown("Current GPS");
        },
        () => alert("GPS location access was denied. Defaulting to Scottsmoor, FL.")
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const startTriageForNeed = (needKey: string) => {
    setTriageNeed(needKey);
    setTriageStep(2);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* PRE-FILING NOTICE BAR */}
      <div className="bg-amber-600 text-white text-xs md:text-sm py-2 px-4 text-center font-medium shadow-inner flex items-center justify-center space-x-2">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>
          <strong>Base Impact Inc.</strong> Pre-Filing Nonprofit Organization in Scottsmoor, FL (Preparing Sunbiz & 501(c)(3)). Domain: <strong>BaseImpact.org</strong>
        </span>
      </div>

      {/* HEADER & NAVIGATION */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* BRAND LOGO */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-500 flex items-center justify-center text-white shadow-lg">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white block">Base Impact</span>
                <span className="text-[10px] text-sky-400 font-mono tracking-widest block uppercase">Brevard County, FL</span>
              </div>
            </div>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center space-x-1">
              {[
                { id: 'home', label: 'Welcome', icon: Heart },
                { id: 'directory', label: 'Community Resource Directory', icon: Search },
                { id: 'partners', label: 'Partners & NGO Hub', icon: Building },
                { id: 'governance', label: 'Mission & Governance', icon: FileText },
                { id: 'feedback', label: 'Feedback & Ideas', icon: MessageSquare }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-sky-600 text-white shadow-sm' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              {/* EMERGENCY TRIAGE BUTTON */}
              <button
                onClick={() => { setIsTriageOpen(true); setTriageStep(1); }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-3 py-2 rounded-lg text-xs tracking-wide uppercase transition flex items-center space-x-1 ml-2"
              >
                <Zap className="w-4 h-4" />
                <span>Emergency Helper</span>
              </button>
            </nav>
          </div>
        </div>

        {/* MOBILE NAVIGATION BAR */}
        <div className="md:hidden bg-slate-800 border-t border-slate-700 flex justify-around p-2">
          {[
            { id: 'home', label: 'Home', icon: Heart },
            { id: 'directory', label: 'Directory', icon: Search },
            { id: 'partners', label: 'Partners', icon: Building },
            { id: 'governance', label: 'About', icon: Shield },
            { id: 'feedback', label: 'Feedback', icon: MessageSquare }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-1 px-2 rounded-md text-xs font-medium ${
                  isActive ? 'text-sky-400 font-bold' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* FLOATING EMERGENCY TRIAGE WIZARD TRIGGER FOR MOBILE */}
      <button
        onClick={() => { setIsTriageOpen(true); setTriageStep(1); }}
        className="md:hidden fixed bottom-5 right-5 z-40 bg-amber-500 text-slate-950 font-bold px-4 py-3 rounded-full shadow-2xl flex items-center space-x-2 border-2 border-amber-300"
      >
        <Zap className="w-5 h-5 fill-slate-950" />
        <span className="text-xs tracking-wider uppercase">Emergency Assistance</span>
      </button>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ================= TAB 1: HOME / WELCOME ================= */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            
            {/* HERO SECTION */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden border border-slate-700">
              <div className="relative z-10 max-w-3xl space-y-6">
                <div className="inline-flex items-center space-x-2 bg-sky-500/20 text-sky-300 border border-sky-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Serving Scottsmoor, Titusville, & Brevard County</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  Technology, Navigation & Compassionate Community Support
                </h1>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                  Base Impact Inc. bridges digital gaps, connects unhoused and traveling neighbors with vital services, and builds foundational support for local non-profits, churches, and community gardens.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setActiveTab('directory')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3.5 rounded-xl transition shadow-lg flex items-center space-x-2 text-sm sm:text-base"
                  >
                    <Search className="w-5 h-5" />
                    <span>Find Immediate Assistance Near You</span>
                  </button>
                  <button
                    onClick={() => { setIsTriageOpen(true); setTriageStep(1); }}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3.5 rounded-xl transition shadow-lg flex items-center space-x-2 text-sm sm:text-base"
                  >
                    <Compass className="w-5 h-5" />
                    <span>Traveler & Emergency Wizard</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CORE PILLARS GRID */}
            <div>
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Our Core Focus Areas</h2>
                <p className="text-slate-600 text-sm sm:text-base mt-2">
                  Meeting immediate basic needs while building long-term digital and community capacity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center mb-4">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Digital & Job Navigation</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Teaching classes on searching online for resources, navigating job portals, housing systems, and cybersecurity safety.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Direct Resource Referrals</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Guiding neighbors to food banks, shelters, shower facilities, and referring CPR/First-Aid training to certified partners.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Eco-Spaces & Gardens</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Applying for grants to establish community gardens and serene green spaces for community mental health and fresh produce.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <Building className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">NGO Tech Capacity</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Assisting local churches, small charities, and 1-5 person micro-enterprises with free software setup, domain security, and tech infrastructure.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 2: RESOURCE DIRECTORY (LIVE TRIAGE & SEARCH) ================= */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            
            {/* SEARCH & GPS CONTROLS */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-grow w-full">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, food, showers, housing, or city..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Town Selector & GPS */}
                <div className="flex items-center space-x-2 w-full md:w-auto">
                  <MapPin className="w-5 h-5 text-sky-600 flex-shrink-0" />
                  <select
                    value={selectedTown}
                    onChange={(e) => handleLocationSelect(e.target.value as keyof typeof PRESET_TOWNS)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 w-full"
                  >
                    {Object.keys(PRESET_TOWNS).map(town => (
                      <option key={town} value={town}>From: {town}, FL</option>
                    ))}
                  </select>
                  <button
                    onClick={triggerGPS}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-xl transition flex-shrink-0"
                    title="Use My Phone GPS"
                  >
                    <Navigation className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* INTERACTIVE MILEAGE RADIUS SLIDER (RESTORED FEATURE) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-700">Distance Radius Filter:</span>
                  <span className="bg-sky-600 text-white font-mono px-2 py-0.5 rounded text-xs font-bold">{maxDistance} Miles</span>
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-64">
                  <span className="text-slate-400 font-mono">5m</span>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                  <span className="text-slate-400 font-mono">50m</span>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-slate-500 font-medium py-1 self-center">Category:</span>
                {['All', 'Food Banks', 'Shelters & Housing', 'Showers & Hygiene', 'Churches & Faith-Based', 'Charity Free Services'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full transition font-medium ${
                      selectedCategory === cat 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Barrier Tags & Saved Filter */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-slate-500 font-medium py-1 self-center">Tags:</span>
                  {['All', 'No ID Required', 'Open Residency', 'Showers', 'Tech Assistance', 'North Brevard'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-2.5 py-1 rounded-full transition font-medium border ${
                        selectedTag === tag 
                          ? 'bg-sky-50 border-sky-400 text-sky-700 font-bold' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Saved Offline Toggle (Restored Feature) */}
                <button
                  onClick={() => setOnlySaved(!onlySaved)}
                  className={`px-3 py-1 rounded-full font-bold transition flex items-center space-x-1 ${
                    onlySaved ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  <span>Saved Items ({savedResources.length})</span>
                </button>
              </div>

            </div>

            {/* RESULTS LIST HEADER */}
            <div className="flex justify-between items-center text-sm text-slate-600 px-1">
              <span>Showing <strong>{processedResources.length}</strong> resources within <strong>{maxDistance} miles</strong> of <strong>{selectedTown}</strong></span>
              <span className="text-xs text-slate-400 hidden sm:inline">Sorted by Proximity & Availability</span>
            </div>

            {/* RESOURCE CARDS LIST */}
            <div className="space-y-4">
              {processedResources.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-800">No matching services found</h3>
                  <p className="text-slate-500 text-sm max-w-md mx-auto">
                    Try expanding your search radius slider, unchecking "Saved Items", or selecting "All Categories".
                  </p>
                </div>
              ) : (
                processedResources.map(res => {
                  const isSaved = savedResources.includes(res.id);
                  return (
                    <div key={res.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition space-y-4">
                      
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-bold text-slate-900">{res.name}</h3>
                            <button
                              onClick={() => toggleSaveResource(res.id)}
                              className="text-slate-400 hover:text-amber-500 transition"
                              title={isSaved ? "Saved" : "Save for offline"}
                            >
                              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-amber-400 text-amber-500' : ''}`} />
                            </button>
                          </div>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{res.category} • {res.partnerType}</span>
                        </div>

                        {/* NEXT AVAILABLE BADGE */}
                        <div className={`px-3 py-1.5 rounded-full border text-xs font-bold inline-flex items-center space-x-1.5 self-start ${res.nextAvail.color}`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{res.nextAvail.label}</span>
                        </div>
                      </div>

                      <p className="text-slate-600 text-sm">{res.description}</p>

                      {/* TAGS */}
                      <div className="flex flex-wrap gap-1.5">
                        {res.tags.map(t => (
                          <span key={t} className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2.5 py-0.5 rounded-md">
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* CONTACT & LOCATION FOOTER */}
                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-slate-500">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{res.address} (<strong>{res.distanceMiles} mi away</strong>)</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <a href={`tel:${res.phone}`} className="text-sky-600 hover:underline">{res.phone}</a>
                          </div>
                        </div>

                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(res.address)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-lg transition inline-flex items-center space-x-1"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Get Directions</span>
                        </a>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: PARTNERS & NGO HUB ================= */}
        {activeTab === 'partners' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <span className="text-xs font-mono text-sky-600 uppercase tracking-widest font-bold">Collaborative Infrastructure</span>
              <h2 className="text-2xl font-bold text-slate-900">Partner & NGO Capacity Exchange</h2>
              <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">
                Base Impact strengthens other non-profits, small churches, and community programs by sharing digital infrastructure, coordinating grant applications, and referring clients to certified partners.
              </p>
            </div>

            {/* PARTNER TYPES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold">1</div>
                <h3 className="font-bold text-slate-900">For Food Pantries & Shelters</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  List real-time supply capacities, alert the community when fresh food arrives, and get assistance updating operational schedules.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                <div className="w-10 h-10 bg-sky-100 text-sky-700 rounded-lg flex items-center justify-center font-bold">2</div>
                <h3 className="font-bold text-slate-900">For Certified CPR / First-Aid Companies</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Receive direct client referrals from Base Impact when community members require official certification for employment or licensing.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center font-bold">3</div>
                <h3 className="font-bold text-slate-900">For Micro-Enterprises (1-5 People)</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Get assistance accessing free non-profit software tools, digital security setup, and basic bookkeeping navigation guidance.
                </p>
              </div>
            </div>

            {/* INTAKE FORM */}
            <div className="bg-slate-900 text-white p-8 rounded-2xl space-y-6">
              <h3 className="text-xl font-bold">Register Your Organization as a Base Impact Partner</h3>
              <p className="text-slate-300 text-sm">
                Join our Brevard County referral network to receive technical help, client navigation referrals, or co-grant opportunities.
              </p>

              {partnerSubmitted ? (
                <div className="bg-emerald-500/20 border border-emerald-500/40 p-6 rounded-xl text-emerald-300 space-y-2">
                  <Check className="w-8 h-8 text-emerald-400" />
                  <h4 className="font-bold text-white">Partner Application Received</h4>
                  <p className="text-sm">Thank you! Our community coordinator will review your information and connect shortly.</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setPartnerSubmitted(true); }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-800">
                  <input
                    type="text"
                    required
                    placeholder="Organization / Ministry Name *"
                    value={partnerIntake.orgName}
                    onChange={(e) => setPartnerIntake({ ...partnerIntake, orgName: e.target.value })}
                    className="p-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Contact Person Name *"
                    value={partnerIntake.contactPerson}
                    onChange={(e) => setPartnerIntake({ ...partnerIntake, contactPerson: e.target.value })}
                    className="p-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address *"
                    value={partnerIntake.email}
                    onChange={(e) => setPartnerIntake({ ...partnerIntake, email: e.target.value })}
                    className="p-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={partnerIntake.phone}
                    onChange={(e) => setPartnerIntake({ ...partnerIntake, phone: e.target.value })}
                    className="p-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                  <select
                    value={partnerIntake.serviceType}
                    onChange={(e) => setPartnerIntake({ ...partnerIntake, serviceType: e.target.value })}
                    className="p-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm sm:col-span-2"
                  >
                    <option value="Food Assistance">Food Pantry / Meal Provider</option>
                    <option value="Shelter / Housing">Shelter & Housing Provider</option>
                    <option value="For-Profit CPR Partner">Certified CPR / First Aid Business Partner</option>
                    <option value="Micro-Enterprise">Small Business / Micro-Enterprise (1-5 staff)</option>
                    <option value="Church / Faith Community">Church / Faith-Based Outreach</option>
                  </select>
                  <textarea
                    rows={3}
                    placeholder="Describe how we can assist your mission or share resources..."
                    value={partnerIntake.needs}
                    onChange={(e) => setPartnerIntake({ ...partnerIntake, needs: e.target.value })}
                    className="p-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm sm:col-span-2"
                  />
                  <button
                    type="submit"
                    className="sm:col-span-2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl transition text-sm"
                  >
                    Submit Partner Registration
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 4: GOVERNANCE & GOALS ================= */}
        {activeTab === 'governance' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <span className="text-xs font-mono text-sky-600 uppercase tracking-widest font-bold">Legal Governance & Transparency</span>
              <h2 className="text-2xl font-bold text-slate-900">Base Impact Inc. Corporate Blueprint</h2>
              <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">
                We believe in complete transparency prior to official filing with the Florida Department of State Division of Corporations (Sunbiz).
              </p>
            </div>

            {/* BOARD DUTIES SUMMARY */}
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl space-y-6">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <Shield className="w-6 h-6 text-sky-400" />
                <span>Board Director Fiduciary Duties & Protections</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-2">
                  <h4 className="font-bold text-sky-400">1. Duty of Care</h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Exercising reasonable prudence, reviewing financial records prior to voting, and attending scheduled governance meetings.
                  </p>
                </div>
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-2">
                  <h4 className="font-bold text-emerald-400">2. Duty of Loyalty</h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Placing organizational interests first, signing annual Conflict of Interest disclosures, and avoiding private inurement.
                  </p>
                </div>
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-2">
                  <h4 className="font-bold text-amber-400">3. Duty of Obedience</h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Ensuring strict adherence to 501(c)(3) tax laws, state filings, and proper grant fund stewardship.
                  </p>
                </div>
              </div>
            </div>

            {/* IRS PURPOSE CLAUSE */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-lg font-bold text-slate-900">Formal IRS Purpose Clause (Pre-Filing Draft)</h3>
              <p className="font-mono text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                "Base Impact Inc. is organized exclusively for charitable, educational, and scientific purposes under Section 501(c)(3) of the Internal Revenue Code. Specifically, the organization delivers technical literacy instruction, digital navigation assistance for housing and employment, environmental stewardship grants for community gardens, and direct resource referrals for under-resourced populations and grassroots charitable entities."
              </p>
            </div>
          </div>
        )}

        {/* ================= TAB 5: FEEDBACK & IDEAS ================= */}
        {activeTab === 'feedback' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-2xl font-bold text-slate-900">Community Feedback & Suggestions</h2>
              <p className="text-slate-600 text-sm">
                Help us shape our services in Brevard County. Tell us what non-profits need listing, what digital classes would help most, or offer suggestions for our governance.
              </p>
            </div>

            {feedbackSubmitted ? (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-8 rounded-2xl text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-xl font-bold">Thank You for Your Feedback!</h3>
                <p className="text-sm text-emerald-700">
                  Your suggestion has been logged. We review all community input during our founding strategy meetings.
                </p>
                <button
                  onClick={() => { setFeedbackSubmitted(false); setFeedback({ name: '', email: '', role: 'Neighbor', message: '', type: 'General Suggestion' }); }}
                  className="bg-emerald-600 text-white font-medium px-4 py-2 rounded-xl text-sm"
                >
                  Submit Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setFeedbackSubmitted(true); }} className="bg-white p-8 rounded-2xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Your Name (Optional)</label>
                    <input
                      type="text"
                      value={feedback.name}
                      onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={feedback.email}
                      onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">I am a...</label>
                    <select
                      value={feedback.role}
                      onChange={(e) => setFeedback({ ...feedback, role: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="Neighbor">Local Resident / Neighbor</option>
                      <option value="Nonprofit Worker">Nonprofit / Church Staff</option>
                      <option value="Volunteer">Prospective Volunteer</option>
                      <option value="Board Candidate">Prospective Board Director</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Feedback Category</label>
                    <select
                      value={feedback.type}
                      onChange={(e) => setFeedback({ ...feedback, type: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="General Suggestion">General Suggestion</option>
                      <option value="Missing Resource">Recommend a Service/Pantry to List</option>
                      <option value="Class Request">Request a Digital/Job Class</option>
                      <option value="Governance/Board">Governance / Board Feedback</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Your Message or Resource Recommendation *</label>
                  <textarea
                    required
                    rows={4}
                    value={feedback.message}
                    onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                    placeholder="Tell us what local services need to be added or how Base Impact can assist..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition text-sm flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Community Feedback</span>
                </button>
              </form>
            )}
          </div>
        )}

      </main>

      {/* ================= EMERGENCY TRIAGE WIZARD MODAL (RESTORED FEATURE) ================= */}
      {isTriageOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsTriageOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* STEP 1: SELECT NEED */}
            {triageStep === 1 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Traveler & Crisis Triage Helper</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">What do you need immediate help with?</h3>
                  <p className="text-slate-600 text-sm">Select your current situation for instant guided assistance in Brevard County.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'shelter', label: 'Emergency Shelter / Bed', desc: 'Tonight shelter, day center vouchers', icon: Shield },
                    { key: 'food', label: 'Hot Meal or Food Pantry', desc: 'No ID required, instant food boxes', icon: Heart },
                    { key: 'travel', label: 'Fuel / Travel Vouchers', desc: 'Gas cards, bus routes, stranded help', icon: Navigation },
                    { key: 'id_tech', label: 'ID Recovery & Tech Access', desc: 'Computer access, online application help', icon: Laptop }
                  ].map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.key}
                        onClick={() => startTriageForNeed(option.key)}
                        className="bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200 p-4 rounded-2xl text-left transition space-y-1.5 group"
                      >
                        <div className="flex items-center space-x-2 text-sky-600 font-bold text-sm group-hover:text-sky-700">
                          <Icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </div>
                        <p className="text-slate-500 text-xs">{option.desc}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>In immediate physical danger?</span>
                  <a href="tel:911" className="text-red-600 font-bold hover:underline">Call 911</a>
                </div>
              </div>
            )}

            {/* STEP 2: SHOW MATCHES */}
            {triageStep === 2 && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-sky-600 uppercase tracking-widest font-bold">Recommended Resources</span>
                  <h3 className="text-xl font-bold text-slate-900">Immediate Action Plan</h3>
                </div>

                <div className="space-y-3">
                  {BREVARD_RESOURCES
                    .filter(res => res.triageCategory === triageNeed || res.tags.some(t => t.toLowerCase().includes(triageNeed)))
                    .map(res => (
                      <div key={res.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-900 text-sm">{res.name}</h4>
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">{res.hoursText}</span>
                        </div>
                        <p className="text-slate-600">{res.description}</p>
                        <div className="flex items-center justify-between pt-1 text-slate-500">
                          <span>{res.address}</span>
                          <a href={`tel:${res.phone}`} className="text-sky-600 font-bold hover:underline">{res.phone}</a>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <button
                    onClick={() => setTriageStep(1)}
                    className="text-slate-500 hover:text-slate-800 text-xs font-bold"
                  >
                    ← Back to Helper Options
                  </button>
                  <button
                    onClick={() => { setIsTriageOpen(false); setActiveTab('directory'); }}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    View All Directory Results
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-8 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-white font-bold text-sm">Base Impact Inc. — BaseImpact.org</p>
            <p>Pre-Filing Non-Profit Organization • Scottsmoor, FL 32775 (Brevard County)</p>
          </div>
          <div className="text-center sm:text-right text-slate-500">
            <p>© {new Date().getFullYear()} Base Impact Inc. All Rights Reserved.</p>
            <p className="text-[11px] mt-0.5">Built for mobile offline access & local community resilience.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}