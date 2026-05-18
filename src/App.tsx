import React, { useState, useEffect } from 'react';
import { 
  Shield, Map as MapIcon, FileSearch, MessageSquare, 
  Settings, LogOut, Menu, Bell, Search, User, 
  AlertTriangle, Activity, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isUploading, setIsUploading] = useState(false);
  const [alerts, setAlerts] = useState([
    { type: 'high', title: 'Suspicious Assembly', loc: 'Sector 15, Near Metro', time: 'Just now' },
    { type: 'medium', title: 'Unidentified Vehicle', loc: 'Highway Checkpost 4', time: '12 mins ago' },
  ]);

  useEffect(() => {
    if (!token) return;
    const ws = new WebSocket('ws://localhost:8000/ws/live-alerts');
    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setAlerts(prev => [{
          type: data.risk === 'HIGH' ? 'high' : 'medium',
          title: data.alert,
          loc: 'AI Detected Location',
          time: 'Just now'
        }, ...prev]);
      } catch (e) {
        console.error("Error parsing websocket message", e);
      }
    };
    return () => ws.close();
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch('http://localhost:8000/api/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.access_token);
        setRole(data.role);
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('role', data.role);
      } else {
        setLoginError(data.detail || 'Login failed');
      }
    } catch (err) {
      setLoginError('Server connection failed. Ensure backend is running.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/upload-casefile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      const data = await response.json();
      if(response.ok) {
        alert('AI Analysis Complete:\n' + JSON.stringify(data.ai_analysis, null, 2));
      } else {
        alert('Error: ' + JSON.stringify(data));
      }
    } catch (error) {
      alert('Upload failed. Ensure backend is running on port 8000.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-50 tactical-gradient">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md p-8 glass-panel rounded-2xl">
          <div className="flex justify-center mb-6">
            <Shield className="w-16 h-16 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-black text-center mb-2 tracking-tight">UP POLICE AI <span className="text-indigo-500">GATEWAY</span></h2>
          <p className="text-slate-400 text-center text-sm mb-8">Authorized Personnel Only</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center font-bold">{loginError}</div>}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Badge ID / Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Passcode</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white" />
            </div>
            <button type="submit" className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/50 transition-transform active:scale-[0.98] flex justify-center items-center gap-2">
              <Lock className="w-4 h-4" /> Authenticate
            </button>
          </form>
          <div className="mt-6 text-xs text-slate-500 text-center">
            Demo Credentials:<br/>
            Admin: admin / admin123<br/>
            User: officer / officer123
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden tactical-gradient">
      <motion.aside initial={{ width: 256 }} animate={{ width: isSidebarOpen ? 256 : 80 }} className="h-full bg-slate-900 border-r border-slate-800 flex flex-col z-20">
        <div className="h-20 flex items-center justify-center border-b border-slate-800 px-4">
          <Shield className="w-8 h-8 text-indigo-500 flex-shrink-0" />
          {isSidebarOpen && <span className="ml-3 font-black text-lg tracking-tight whitespace-nowrap">UP POLICE <span className="text-indigo-500">AI</span></span>}
        </div>
        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
          {[
            { id: 'dashboard', icon: MapIcon, label: 'Predictive Map' },
            { id: 'investigate', icon: FileSearch, label: 'Investigation Hub' },
            { id: 'chat', icon: MessageSquare, label: 'AI Command Chat' },
            { id: 'alerts', icon: AlertTriangle, label: 'Active Alerts' },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center px-3 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}`}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="ml-3 text-sm font-semibold whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center w-full px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="ml-3 text-sm font-semibold whitespace-nowrap">Logout (Secure)</span>}
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="h-20 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-xs font-bold text-indigo-400 border border-slate-700">
              <User className="w-4 h-4" /> ROLE: {role}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-full text-xs font-semibold">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-red-500'}`} />
              <span className="text-slate-300 hidden sm:inline">{isConnected ? 'System Secure' : 'Disconnected'}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
          <div className="flex flex-col gap-6 h-full min-h-0">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                Command Center
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-widest">Live</span>
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
              <div className="lg:col-span-2 rounded-2xl glass-panel overflow-hidden flex flex-col relative min-h-[400px]">
                <div className="flex-1 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                  <div className="z-10 text-center">
                    <MapIcon className="w-12 h-12 text-slate-700 mx-auto mb-2 opacity-50" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Mapbox Integration Pending</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="p-5 rounded-2xl glass-panel relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <FileSearch className="text-indigo-400 w-5 h-5" />
                      </div>
                      <h2 className="text-base font-bold text-indigo-100">AI Investigation Hub</h2>
                    </div>
                    {role === 'ADMIN' ? (
                      <>
                        <p className="text-xs text-slate-400 mb-5 leading-relaxed">Admin Access Granted: Upload FIRs for AI analysis.</p>
                        <label className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg transition-all cursor-pointer block text-center">
                          {isUploading ? 'Analyzing...' : 'Upload Case File'}
                          <input type="file" className="hidden" accept=".txt,.pdf" onChange={handleFileUpload} disabled={isUploading} />
                        </label>
                      </>
                    ) : (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-bold flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Admins Only
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 rounded-2xl glass-panel flex flex-col overflow-hidden min-h-[300px]">
                  <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                    <AlertTriangle className="text-red-500 w-4 h-4" />
                    <h2 className="text-sm font-bold">Critical Alerts</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {alerts.map((alert, i) => (
                      <div key={i} className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="flex items-start justify-between mb-1">
                          <span className={`text-xs font-bold ${alert.type === 'high' ? 'text-red-400' : 'text-amber-400'}`}>{alert.title}</span>
                          <span className="text-[10px] text-slate-500">{alert.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{alert.loc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
