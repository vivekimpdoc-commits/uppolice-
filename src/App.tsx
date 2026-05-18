import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Map as MapIcon, 
  FileSearch, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  Bell,
  Search,
  User,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Components (We will create these inline or in separate files)
// For simplicity in Vite, let's keep the main layout in App.tsx

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isConnected, setIsConnected] = useState(true); // Mock websocket connection
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden tactical-gradient">
      
      {/* Sidebar */}
      <motion.aside 
        initial={{ width: 256 }}
        animate={{ width: isSidebarOpen ? 256 : 80 }}
        className="h-full bg-slate-900 border-r border-slate-800 flex flex-col z-20"
      >
        <div className="h-20 flex items-center justify-center border-b border-slate-800 px-4">
          <Shield className="w-8 h-8 text-indigo-500 flex-shrink-0" />
          {isSidebarOpen && (
            <span className="ml-3 font-black text-lg tracking-tight whitespace-nowrap">
              UP POLICE <span className="text-indigo-500">AI</span>
            </span>
          )}
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
          {[
            { id: 'dashboard', icon: MapIcon, label: 'Predictive Map' },
            { id: 'investigate', icon: FileSearch, label: 'Investigation Hub' },
            { id: 'chat', icon: MessageSquare, label: 'AI Command Chat' },
            { id: 'alerts', icon: AlertTriangle, label: 'Active Alerts' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center px-3 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="ml-3 text-sm font-semibold whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center w-full px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="ml-3 text-sm font-semibold whitespace-nowrap">Logout (Secure)</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Topbar */}
        <header className="h-20 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search FIRs, Officers, Hotspots..." 
                className="pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-64 text-slate-200 placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-full text-xs font-semibold">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-red-500'}`} />
              <span className="text-slate-300 hidden sm:inline">{isConnected ? 'System Secure' : 'Disconnected'}</span>
            </div>
            <button className="p-2 relative bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-slate-800" />
            </button>
            <div className="w-10 h-10 bg-indigo-600 rounded-lg border border-indigo-500 flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
          <div className="flex flex-col gap-6 h-full min-h-0">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                Command Center
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-widest">
                  Live
                </span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">Real-time geospatial monitoring & AI investigation insights.</p>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
              
              {/* Left Column: Map */}
              <div className="lg:col-span-2 rounded-2xl glass-panel overflow-hidden flex flex-col relative min-h-[400px]">
                <div className="absolute top-4 left-4 z-10 bg-slate-950/80 backdrop-blur-md p-2 rounded-lg border border-slate-800 flex items-center gap-2 shadow-xl">
                  <Activity className="text-emerald-500 w-4 h-4 animate-pulse" />
                  <span className="font-semibold text-xs text-emerald-100">Live Spatial Tracking</span>
                </div>
                
                {/* Mock Map Area */}
                <div className="flex-1 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                  
                  {/* Mock Hotspots */}
                  <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                  
                  <div className="z-10 text-center">
                    <MapIcon className="w-12 h-12 text-slate-700 mx-auto mb-2 opacity-50" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Mapbox Integration Pending</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Widgets */}
              <div className="flex flex-col gap-6">
                
                {/* Investigation Hub Teaser */}
                <div className="p-5 rounded-2xl glass-panel relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                    <FileSearch className="w-32 h-32" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <FileSearch className="text-indigo-400 w-5 h-5" />
                      </div>
                      <h2 className="text-base font-bold text-indigo-100">AI Investigation Hub</h2>
                    </div>
                    <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                      Upload FIRs, witness statements, and evidence for instant AI-powered forensic analysis and contradiction detection.
                    </p>
                    <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/50 transition-all active:scale-[0.98]">
                      Launch Hub
                    </button>
                  </div>
                </div>

                {/* Live Alerts */}
                <div className="flex-1 rounded-2xl glass-panel flex flex-col overflow-hidden min-h-[300px]">
                  <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                    <AlertTriangle className="text-red-500 w-4 h-4" />
                    <h2 className="text-sm font-bold">Critical Alerts</h2>
                    <span className="ml-auto bg-red-500/20 text-red-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">3 New</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {[
                      { type: 'high', title: 'Suspicious Assembly', loc: 'Sector 15, Near Metro', time: 'Just now' },
                      { type: 'medium', title: 'Unidentified Vehicle', loc: 'Highway Checkpost 4', time: '12 mins ago' },
                      { type: 'high', title: 'Emergency Distress Call', loc: 'Civil Lines, Block B', time: '28 mins ago' },
                    ].map((alert, i) => (
                      <div key={i} className="p-3 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group">
                        <div className="flex items-start justify-between mb-1">
                          <span className={`text-xs font-bold ${alert.type === 'high' ? 'text-red-400' : 'text-amber-400'}`}>
                            {alert.title}
                          </span>
                          <span className="text-[10px] text-slate-500">{alert.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapIcon className="w-3 h-3" /> {alert.loc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>

        {/* AI Command Chat Widget (Floating) */}
        <div className="fixed bottom-6 right-6 z-50">
          <button className="w-14 h-14 bg-indigo-600 rounded-full shadow-2xl shadow-indigo-900/50 flex items-center justify-center hover:bg-indigo-500 transition-transform hover:scale-105 active:scale-95 group">
            <MessageSquare className="w-6 h-6 text-white group-hover:animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900" />
          </button>
        </div>

      </div>
    </div>
  );
}
