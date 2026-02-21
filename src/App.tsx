/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Phone, MapPin, Shield, Globe, AlertCircle, MessageSquare, Info, Download, Map as MapIcon, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';

type Language = 'am' | 'om' | 'ti';

interface Content {
  title: string;
  subtitle: string;
  emergency: string;
  contactsTitle: string;
  remindersTitle: string;
  reminders: string[];
  footer: string;
  locationAlert: string;
  locationError: string;
  smsBody: string;
  mapsTitle: string;
  downloadMap: string;
  mapPacks: string[];
  whatsappEmergency: string;
}

const content: Record<Language, Content> = {
  am: {
    title: "መጠጊያ",
    subtitle: "አንቺ ብቻሽን አይደለሽም",
    emergency: "🚨 አደጋ ጊዜ",
    contactsTitle: "የአደጋ ጊዜ ስልኮች",
    remindersTitle: "የደህንነት ማሳሰቢያዎች",
    reminders: [
      "አንቺ ብቻሽን አይደለሽም",
      "ገንዘብሽን አስቀምጪ",
      "ገንዘብሽን ለማንም አትስጪ",
      "ፓስፖርትሽን ጠብቂ"
    ],
    footer: "ነፃ • ማስታወቂያ የሌለው • መግቢያ የማይጠይቅ",
    locationAlert: "እባክዎን የቦታ መገኛ ፍቃድ ይስጡ",
    locationError: "የቦታ መገኛ ማግኘት አልተቻለም",
    smsBody: "አስቸኳይ እርዳታ እፈልጋለሁ! ያለሁበት ቦታ:",
    mapsTitle: "የማይገናኝ ካርታ (Offline Maps)",
    downloadMap: "ካርታ አውርድ",
    mapPacks: ["ዱባይ (ዴይራ)", "አቡ ዳቢ", "ሻርጃ"],
    whatsappEmergency: "በዋትስአፕ ላክ (WhatsApp)"
  },
  om: {
    title: "Metegiya",
    subtitle: "Ati qofti hin jirtu",
    emergency: "🚨 Yeroo balaa",
    contactsTitle: "Lakkoofsota Balaa",
    remindersTitle: "Yaadachiisa Nageenyaa",
    reminders: [
      "Ati qofti hin jirtu",
      "Maallaqa kee qusadhu",
      "Maallaqa kee nama kamiifuu hin kennin",
      "Paaspoortii kee eegi"
    ],
    footer: "Bilisa • Beeksisa kan hin qabne • Galmee kan hin gaafanne",
    locationAlert: "Maaloo hayyama bakka kee kenni",
    locationError: "Bakka kee argachuun hin danda'amne",
    smsBody: "Gargaarsa ariifachiisaa nan barbaada! Bakki ani jiru:",
    mapsTitle: "Kaartaa Intarneeta Malee",
    downloadMap: "Kaartaa Buufadhu",
    mapPacks: ["Dubai (Deira)", "Abu Dhabi", "Sharjah"],
    whatsappEmergency: "WhatsApp'n Ergi"
  },
  ti: {
    title: "መጠጊያ",
    subtitle: "በይንኺ ኣይኮንኪን",
    emergency: "🚨 ሓደጋ",
    contactsTitle: "ናይ ሓደጋ ግዜ ቴሌፎናት",
    remindersTitle: "ናይ ድሕንነት መዘኻኸሪታት",
    reminders: [
      "በይንኺ ኣይኮንኪን",
      "ገንዘብኪ ኣቑር",
      "ገንዘብኪ ንማንም ኣይትሃብ",
      "ፓስፖርትኪ ሓልዊ"
    ],
    footer: "ብነጻ • ምልክታ የብሉን • መእተዊ ኣይሓትትን",
    locationAlert: "በጃኺ ናይ ቦታ መፍቀዲ ሃቢ",
    locationError: "ቦታኺ ክርከብ ኣይተኻእለን",
    smsBody: "ህጹጽ ሓገዝ እደሊ ኣለኹ! ዘለኹዎ ቦታ:",
    mapsTitle: "ኢንተርኔት ዘየድልዮ ካርታ",
    downloadMap: "ካርታ ኣውርድ",
    mapPacks: ["ዱባይ (ዴይራ)", "አቡ ዳቢ", "ሻርጃ"],
    whatsappEmergency: "ብዋትስአፕ ስደድ (WhatsApp)"
  }
};

const EMERGENCY_CONTACTS = [
  { name: "UAE Police", number: "999", icon: Shield },
  { name: "Labour Office", number: "80084", icon: Info },
  { name: "Embassy Dubai", number: "+97142699111", icon: Phone },
  { name: "Embassy Abu Dhabi", number: "+97126655111", icon: Phone },
];

const DualFlagIcon = () => (
  <div className="relative w-32 h-32 flex items-center justify-center drop-shadow-2xl">
    {/* Main Icon Container with 3D effect */}
    <div className="absolute inset-0 rounded-[32px] overflow-hidden border border-white/20 flex shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_10px_20px_rgba(0,0,0,0.4)]">
      {/* Background Flags */}
      <div className="absolute inset-0 flex">
        {/* Left side: Ethiopia Flag */}
        <div className="w-1/2 flex flex-col h-full">
          <div className="h-1/3 bg-[#078930]" />
          <div className="h-1/3 bg-[#FCD116] flex items-center justify-center relative">
            <div className="absolute w-12 h-12 bg-[#0039a6] rounded-full flex items-center justify-center scale-[0.6] shadow-inner">
              <svg viewBox="0 0 51 48" className="w-10 h-10 text-[#FCD116] fill-current">
                <path d="m25.5 0 5.995 18.451h19.401l-15.696 11.403 5.996 18.451-15.696-11.403-15.696 11.403 5.996-18.451-15.696-11.403h19.401z"/>
              </svg>
            </div>
          </div>
          <div className="h-1/3 bg-[#DA121A]" />
        </div>
        {/* Right side: UAE Flag */}
        <div className="w-1/2 flex h-full">
          <div className="w-1/3 bg-[#FF0000]" />
          <div className="w-2/3 flex flex-col">
            <div className="h-1/3 bg-[#00732F]" />
            <div className="h-1/3 bg-white" />
            <div className="h-1/3 bg-black" />
          </div>
        </div>
      </div>
      
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 pointer-events-none" />
    </div>

    {/* Center Shield with Gold Border */}
    <div className="relative z-30 w-24 h-28 flex items-center justify-center">
      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xl">
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#f0f0f0', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#D4AF37', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#B8860B', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        {/* Shield Body */}
        <path 
          d="M50,5 L90,20 L90,60 C90,85 75,105 50,115 C25,105 10,85 10,60 L10,20 L50,5 Z" 
          fill="url(#shieldGrad)" 
          stroke="url(#goldGrad)" 
          strokeWidth="4"
        />
        
        {/* Heart and Hand Group */}
        <g transform="translate(20, 35) scale(2.5)">
          {/* Heart */}
          <path 
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
            fill="#DA121A"
            className="drop-shadow-sm"
          />
          {/* Green Hand cupping the heart */}
          <path 
            d="M2,15 C2,15 4,18 8,19 C12,20 16,19 19,16 L21,14 C21,14 22,18 18,20 C14,22 8,22 4,20 C2,19 1,17 2,15 Z" 
            fill="#078930"
          />
          <path 
            d="M18,15 C18,15 20,14 22,14 C24,14 25,16 23,18 C21,20 18,21 15,21 L13,20 C13,20 15,19 17,18 C19,17 18,15 18,15 Z" 
            fill="#078930"
          />
        </g>
      </svg>
    </div>
  </div>
);

const MiniEthiopiaFlag = () => (
  <div className="w-8 h-5 flex flex-col rounded-[2px] overflow-hidden border border-white/30 shadow-sm">
    <div className="h-1/3 bg-[#078930]" />
    <div className="h-1/3 bg-[#FCD116] flex items-center justify-center relative">
      <div className="absolute w-3 h-3 bg-[#0039a6] rounded-full flex items-center justify-center scale-[0.5]">
        <svg viewBox="0 0 51 48" className="text-[#FCD116] fill-current">
          <path d="m25.5 0 5.995 18.451h19.401l-15.696 11.403 5.996 18.451-15.696-11.403-15.696 11.403 5.996-18.451-15.696-11.403h19.401z"/>
        </svg>
      </div>
    </div>
    <div className="h-1/3 bg-[#DA121A]" />
  </div>
);

const MiniUAEFlag = () => (
  <div className="w-8 h-5 flex rounded-[2px] overflow-hidden border border-white/30 shadow-sm">
    <div className="w-1/4 bg-[#FF0000]" />
    <div className="w-3/4 flex flex-col">
      <div className="h-1/3 bg-[#00732F]" />
      <div className="h-1/3 bg-white" />
      <div className="h-1/3 bg-black" />
    </div>
  </div>
);

const LANG_METADATA = {
  am: { native: "አማርኛ", label: "Amharic" },
  om: { native: "Afaan Oromoo", label: "Oromo" },
  ti: { native: "ትግርኛ", label: "Tigrinya" }
};

export default function App() {
  const [lang, setLang] = useState<Language>('am');
  const [activeTab, setActiveTab] = useState<'home' | 'maps'>('home');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [trustedNumbers, setTrustedNumbers] = useState<string[]>(() => {
    const saved = localStorage.getItem('metegiya_trusted_numbers');
    return saved ? JSON.parse(saved) : [];
  });
  const [newNumber, setNewNumber] = useState('');
  const [downloadingMap, setDownloadingMap] = useState<string | null>(null);
  const [downloadedPacks, setDownloadedPacks] = useState<string[]>(() => {
    const saved = localStorage.getItem('metegiya_downloaded_maps');
    return saved ? JSON.parse(saved) : [];
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const t = content[lang];

  useEffect(() => {
    localStorage.setItem('metegiya_trusted_numbers', JSON.stringify(trustedNumbers));
  }, [trustedNumbers]);

  useEffect(() => {
    localStorage.setItem('metegiya_downloaded_maps', JSON.stringify(downloadedPacks));
  }, [downloadedPacks]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'maps' && mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([25.2048, 55.2708], 11); // Dubai
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Add markers for key resources
      const resources = [
        { name: "Embassy Dubai", pos: [25.2582, 55.3047] as L.LatLngExpression },
        { name: "Police Station", pos: [25.2697, 55.3094] as L.LatLngExpression },
      ];

      resources.forEach(res => {
        L.marker(res.pos).addTo(mapRef.current!).bindPopup(res.name);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activeTab]);

  const handleEmergency = () => {
    if (!navigator.geolocation) {
      alert(t.locationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const mapsUrl = `https://maps.google.com/?q=${lat},${lon}`;
        const message = `${t.smsBody}\n${mapsUrl}`;

        if (trustedNumbers.length > 0) {
          const numbers = trustedNumbers.join(',');
          window.location.href = `sms:${numbers}?body=${encodeURIComponent(message)}`;
        } else {
          window.location.href = `sms:?body=${encodeURIComponent(message)}`;
        }
      },
      () => {
        alert(t.locationAlert);
      }
    );
  };

  const handleWhatsAppEmergency = () => {
    if (!navigator.geolocation) {
      alert(t.locationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const mapsUrl = `https://maps.google.com/?q=${lat},${lon}`;
        const message = `${t.smsBody}\n${mapsUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
      },
      () => {
        alert(t.locationAlert);
      }
    );
  };

  const downloadMapPack = (pack: string) => {
    setDownloadingMap(pack);
    // Simulate download/caching
    setTimeout(() => {
      setDownloadedPacks(prev => [...prev, pack]);
      setDownloadingMap(null);
    }, 3000);
  };

  const addNumber = () => {
    if (newNumber && !trustedNumbers.includes(newNumber)) {
      setTrustedNumbers([...trustedNumbers, newNumber]);
      setNewNumber('');
    }
  };

  const removeNumber = (num: string) => {
    setTrustedNumbers(trustedNumbers.filter(n => n !== num));
  };

  const callNumber = (num: string) => {
    window.location.href = `tel:${num}`;
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#2D2A26] font-sans pb-24 tibeb-pattern">
      {/* Header */}
      <header className="text-white pt-10 pb-14 px-6 rounded-b-[48px] shadow-2xl relative overflow-hidden">
        {/* Flag Background Layer */}
        <div className="absolute inset-0 z-0 flex">
          {/* Left side: Ethiopia Flag */}
          <div className="w-1/2 flex flex-col h-full relative">
            <div className="h-1/3 bg-[#078930]" />
            <div className="h-1/3 bg-[#FCD116] flex items-center justify-center relative">
              <div className="absolute w-16 h-16 bg-[#0039a6] rounded-full flex items-center justify-center scale-150 opacity-40">
                <svg viewBox="0 0 51 48" className="w-12 h-12 text-[#FCD116] fill-current">
                  <path d="m25.5 0 5.995 18.451h19.401l-15.696 11.403 5.996 18.451-15.696-11.403-15.696 11.403 5.996-18.451-15.696-11.403h19.401z"/>
                </svg>
              </div>
            </div>
            <div className="h-1/3 bg-[#DA121A]" />
            {/* Abay Dam Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1590019223635-bb14107013ee?auto=format&fit=crop&q=80&w=800)' }}
            />
          </div>
          {/* Right side: UAE Flag */}
          <div className="w-1/2 flex h-full relative">
            <div className="w-1/4 bg-[#FF0000]" />
            <div className="w-3/4 flex flex-col">
              <div className="h-1/3 bg-[#00732F]" />
              <div className="h-1/3 bg-white" />
              <div className="h-1/3 bg-black" />
            </div>
            {/* UAE Cultural Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=800)' }}
            />
          </div>
        </div>

        {/* Dark Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-black/30 z-0" />

        {/* Layered Tibeb Patterns */}
        <div className="absolute inset-0 tibeb-header-pattern opacity-30 z-0" />
        <div className="absolute inset-0 tibeb-header-pattern opacity-10 z-0 rotate-90 scale-150" />
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] aspect-square bg-ethiopia-yellow rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] aspect-square bg-ethiopia-red rounded-full blur-[100px]" />
        </div>
        
        <div className="absolute top-4 left-4 opacity-10 rotate-12">
          <svg width="60" height="60" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
          </svg>
        </div>
        <div className="absolute bottom-10 right-4 opacity-10 -rotate-12">
          <svg width="80" height="80" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
          </svg>
        </div>

        {/* Floating Mini Flags */}
        <div className="absolute top-12 right-12 opacity-20 rotate-[15deg] z-0">
          <MiniEthiopiaFlag />
        </div>
        <div className="absolute top-24 left-8 opacity-20 rotate-[-10deg] z-0">
          <MiniUAEFlag />
        </div>
        <div className="absolute bottom-20 left-1/4 opacity-10 rotate-[20deg] z-0">
          <MiniEthiopiaFlag />
        </div>
        <div className="absolute bottom-12 right-1/3 opacity-10 rotate-[-5deg] z-0">
          <MiniUAEFlag />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mb-6"
          >
            <DualFlagIcon />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-5xl font-black tracking-tight mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              {t.title}
            </h1>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-[2px] w-8 bg-ethiopia-yellow/50" />
              <p className="text-xl opacity-95 font-bold italic drop-shadow-sm">
                {t.subtitle}
              </p>
              <div className="h-[2px] w-8 bg-ethiopia-yellow/50" />
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-3 tibeb-border shadow-[0_-2px_10px_rgba(0,0,0,0.1)]" />
      </header>

      <main className="max-w-md mx-auto px-6 -mt-8 relative z-20">
        {/* Language Switcher */}
        <div className="flex justify-center gap-3 mb-10 overflow-x-auto pb-2 px-2 no-scrollbar">
          {(['am', 'om', 'ti'] as const).map((l) => (
            <motion.button
              key={l}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLang(l)}
              className={`relative flex flex-col items-center min-w-[100px] px-4 py-4 rounded-3xl transition-all duration-300 shadow-xl overflow-hidden ${
                lang === l 
                  ? 'bg-ethiopia-green text-white ring-4 ring-ethiopia-yellow/40 scale-105' 
                  : 'bg-white text-ethiopia-green border border-ethiopia-green/5 hover:bg-ethiopia-green/5'
              }`}
            >
              {lang === l && (
                <div className="absolute inset-0 tibeb-header-pattern opacity-10 pointer-events-none" />
              )}
              
              <div className="flex flex-col gap-[1px] w-8 h-5 rounded-[2px] overflow-hidden border border-black/5 mb-2 shadow-sm shrink-0">
                <div className="h-1/3 bg-[#078930]" />
                <div className="h-1/3 bg-[#FCD116]" />
                <div className="h-1/3 bg-[#DA121A]" />
              </div>

              <span className="text-sm font-black mb-0.5 whitespace-nowrap">{LANG_METADATA[l].native}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${lang === l ? 'text-white/70' : 'text-ethiopia-green/50'}`}>
                {LANG_METADATA[l].label}
              </span>

              {lang === l && (
                <motion.div 
                  layoutId="activeLangIndicator"
                  className="absolute bottom-0 left-0 w-full h-1 bg-ethiopia-yellow"
                />
              )}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Emergency Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEmergency}
                className="w-full bg-ethiopia-red text-white py-8 px-6 rounded-[32px] shadow-2xl shadow-red-900/20 flex flex-col items-center justify-center gap-3 mb-8 group transition-all border-b-8 border-red-800"
              >
                <div className="bg-white/20 p-4 rounded-full group-hover:bg-white/30 transition-colors shadow-inner">
                  <AlertCircle size={48} />
                </div>
                <span className="text-2xl font-black tracking-widest uppercase drop-shadow-lg">{t.emergency}</span>
                <span className="text-xs opacity-90 font-bold uppercase tracking-tighter">
                  {trustedNumbers.length > 0 
                    ? `Sending to ${trustedNumbers.length} trusted contacts` 
                    : 'Share location via SMS/WhatsApp'}
                </span>
              </motion.button>

              {/* WhatsApp Emergency Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWhatsAppEmergency}
                className="w-full bg-[#25D366] text-white py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 mb-8 font-black uppercase tracking-widest text-sm"
              >
                <MessageSquare size={20} />
                {t.whatsappEmergency}
              </motion.button>

              {/* Trusted Contacts Section */}
              <section className="bg-white rounded-[32px] p-6 shadow-xl border border-[#E6E2DE] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 tibeb-border" />
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="text-ethiopia-green" size={20} />
                  <h2 className="text-xl font-black text-ethiopia-green uppercase tracking-tight">
                    {lang === 'am' ? 'የታመኑ ስልኮች' : lang === 'om' ? 'Namoota Amanamoo' : 'ዝተኣመኑ ቴሌፎናት'}
                  </h2>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <input 
                    type="tel"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder="+971..."
                    className="flex-1 px-4 py-2 bg-[#FDFCFB] border border-[#E6E2DE] rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ethiopia-green/20"
                  />
                  <button 
                    onClick={addNumber}
                    className="bg-ethiopia-green text-white px-4 py-2 rounded-xl font-black text-sm shadow-md active:scale-95 transition-transform"
                  >
                    +
                  </button>
                </div>

                <div className="space-y-2">
                  {trustedNumbers.map((num, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#FDFCFB] border border-[#E6E2DE] rounded-xl">
                      <span className="text-sm font-bold text-gray-700">{num}</span>
                      <button 
                        onClick={() => removeNumber(num)}
                        className="text-ethiopia-red p-1 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <AlertCircle size={16} />
                      </button>
                    </div>
                  ))}
                  {trustedNumbers.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-2">
                      {lang === 'am' ? 'ምንም የታመነ ስልክ አልተጨመረም' : 'No trusted contacts added'}
                    </p>
                  )}
                </div>
              </section>

              {/* Emergency Contacts */}
              <section className="bg-white rounded-[32px] p-6 shadow-xl border border-[#E6E2DE] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 tibeb-border" />
                <div className="flex items-center gap-2 mb-6">
                  <Phone className="text-ethiopia-green" size={20} />
                  <h2 className="text-xl font-black text-ethiopia-green uppercase tracking-tight">{t.contactsTitle}</h2>
                </div>
                <div className="space-y-3">
                  {EMERGENCY_CONTACTS.map((contact, idx) => (
                    <button
                      key={idx}
                      onClick={() => callNumber(contact.number)}
                      className="w-full flex items-center justify-between p-4 bg-[#FDFCFB] border border-[#E6E2DE] rounded-2xl hover:bg-ethiopia-green/5 hover:border-ethiopia-green/30 transition-all group shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-ethiopia-green/10 p-2.5 rounded-xl text-ethiopia-green">
                          <contact.icon size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-black text-sm text-gray-800">{contact.name}</p>
                          <p className="text-xs text-ethiopia-green font-mono font-bold">{contact.number}</p>
                        </div>
                      </div>
                      <div className="bg-ethiopia-green text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                        <Phone size={16} />
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Safety Reminders */}
              <section className="bg-white rounded-[32px] p-6 shadow-xl border border-[#E6E2DE] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 tibeb-border" />
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="text-ethiopia-green" size={20} />
                  <h2 className="text-xl font-black text-ethiopia-green uppercase tracking-tight">{t.remindersTitle}</h2>
                </div>
                <ul className="space-y-4">
                  {t.reminders.map((reminder, idx) => (
                    <motion.li 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-[#FDFCFB] border border-[#E6E2DE] rounded-2xl shadow-sm"
                    >
                      <div className="mt-1 w-3 h-3 rounded-full bg-ethiopia-yellow border-2 border-ethiopia-green shrink-0" />
                      <p className="font-bold text-[15px] leading-relaxed text-gray-700">{reminder}</p>
                    </motion.li>
                  ))}
                </ul>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="maps"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Map View */}
              <section className="bg-white rounded-[32px] p-4 shadow-xl border border-[#E6E2DE] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 tibeb-border" />
                <div className="flex items-center justify-between mb-4 mt-2">
                  <div className="flex items-center gap-2">
                    <MapIcon className="text-ethiopia-green" size={20} />
                    <h2 className="text-xl font-black text-ethiopia-green uppercase tracking-tight">{t.mapsTitle}</h2>
                  </div>
                  {isOffline && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-widest">
                      Offline Mode
                    </span>
                  )}
                </div>
                
                <div 
                  ref={mapContainerRef} 
                  className="w-full h-64 rounded-2xl border-2 border-[#E6E2DE] overflow-hidden z-10"
                />
                
                <p className="mt-4 text-xs text-gray-500 font-bold italic text-center">
                  {lang === 'am' ? 'ካርታው በኢንተርኔት ሲገናኙ በራሱ ይቀመጣል' : 'Maps are automatically cached for offline use.'}
                </p>
              </section>

              {/* Map Packs */}
              <section className="bg-white rounded-[32px] p-6 shadow-xl border border-[#E6E2DE] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 tibeb-border" />
                <div className="flex items-center gap-2 mb-6">
                  <Download className="text-ethiopia-green" size={20} />
                  <h2 className="text-xl font-black text-ethiopia-green uppercase tracking-tight">{t.downloadMap}</h2>
                </div>
                
                <div className="space-y-3">
                  {t.mapPacks.map((pack, idx) => (
                    <button
                      key={idx}
                      disabled={downloadedPacks.includes(pack) || downloadingMap === pack}
                      onClick={() => downloadMapPack(pack)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group ${
                        downloadedPacks.includes(pack)
                          ? 'bg-green-50 border-green-200 cursor-default'
                          : 'bg-[#FDFCFB] border-[#E6E2DE] hover:bg-ethiopia-green/5 hover:border-ethiopia-green/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${downloadedPacks.includes(pack) ? 'bg-green-500 text-white' : 'bg-ethiopia-green/10 text-ethiopia-green'}`}>
                          {downloadedPacks.includes(pack) ? <Shield size={20} /> : <MapIcon size={20} />}
                        </div>
                        <span className="font-black text-sm text-gray-800">{pack}</span>
                      </div>
                      
                      {downloadingMap === pack ? (
                        <div className="w-6 h-6 border-2 border-ethiopia-green border-t-transparent rounded-full animate-spin" />
                      ) : downloadedPacks.includes(pack) ? (
                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Cached</span>
                      ) : (
                        <Download size={18} className="text-ethiopia-green opacity-40 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="text-center space-y-6 mt-12">
          <div className="flex justify-center gap-8 text-ethiopia-green/40">
            <Globe size={24} />
            <MessageSquare size={24} />
            <Shield size={24} />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-black text-ethiopia-green uppercase tracking-[0.2em]">
              {t.footer}
            </p>
            <p className="text-[10px] text-[#B8B4B0] font-bold uppercase tracking-widest">
              NGO Demo Version • Privacy First • No Data Collected
            </p>
          </div>
          <div className="w-full h-2 tibeb-border rounded-full opacity-30" />
        </footer>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-[#E6E2DE] px-6 py-3 flex justify-around items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-ethiopia-green scale-110' : 'text-gray-400'}`}
        >
          <Home size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('maps')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'maps' ? 'text-ethiopia-green scale-110' : 'text-gray-400'}`}
        >
          <MapIcon size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Maps</span>
        </button>
      </nav>
    </div>
  );
}
