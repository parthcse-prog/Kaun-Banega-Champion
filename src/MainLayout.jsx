import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Search, User as UserIcon, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import websiteLogo from './assets/Logos/MIET Games.png';
import collegeLogo from './assets/Logos/college_logo.png';
import './MainLayout.css'; // will just be empty/migrated

export default function MainLayout({ token, onLogout }) {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          'https://pi360.net/site/api/endpoints/api_student_profile.php?institute_id=mietjammu',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        const data = await response.json();
        if (response.ok) {
          const studentData = data?.student?.[0] || {};
          const image = studentData.ProfilePictureURL || null;
          setProfileImage(image);
        }
      } catch (err) {
        console.error("Failed to fetch profile image for navbar", err);
      }
    };
    if (token) {
      fetchProfile();
    }
  }, [token]);

  return (
    <div className="bg-brand-deep text-slate-100 font-sans min-h-screen flex flex-col relative overflow-x-hidden selection:bg-amber-500 selection:text-white w-full">
      {/* AmbientAtmosphere for whole layout */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-glow-top absolute -top-28 -left-20 w-96 h-96 rounded-full blur-3xl animate-float-slow"></div>
        <div className="ambient-glow-bottom absolute -bottom-32 -right-20 w-[420px] h-[420px] rounded-full blur-3xl animate-pulse-subtle"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 glass-card border-b border-slate-700/50 flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src={websiteLogo} alt="Website Logo" className="h-10 object-contain" />
            <div className="hidden sm:flex items-center text-xs tracking-wide">
              <span className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200">MIET</span>
              <span className="mx-1.5 text-slate-500">•</span>
              <span className="text-slate-300 font-semibold uppercase tracking-wider text-[10px]">MIET Games Arena</span>
            </div>
          </Link>
        </div>
        
        <div className="flex-1 flex justify-center px-4 max-w-lg">
          <div className="input-glass rounded-full flex items-center px-4 py-2 w-full group">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-amber-400 transition-colors mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Search game" 
              className="w-full bg-transparent border-0 p-0 text-sm text-white placeholder:text-slate-500 focus:ring-0 focus:outline-none font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => navigate('/profile')} 
            className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-slate-800/50 transition-colors group"
          >
            <span className="hidden sm:block text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
              Visit your profile
            </span>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 border-2 border-transparent group-hover:border-amber-400/50 transition-colors flex items-center justify-center shrink-0">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={16} className="text-slate-400" />
              )}
            </div>
          </button>
          
          <button 
            onClick={onLogout} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-300 transition-all"
            title="Logout"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-auto relative z-10 glass-card border-t border-slate-700/50 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left text-slate-400 text-xs font-medium leading-relaxed">
            <p>Kot Bhalwal, Jammu,<br/>Jammu and Kashmir 181122</p>
            <p className="mt-1 text-amber-400/80 font-semibold">+91 9018312123</p>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 font-medium shadow-inner">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"></path>
              </svg>
              <span>Secured by <strong className="text-slate-200 font-semibold">PI360</strong> · MIET Jammu</span>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              &copy; All rights reserved
            </p>
          </div>

          <div className="bg-white/90 p-1.5 rounded-xl shadow-lg border border-white/20">
            <img src={websiteLogo} alt="Website Logo" className="h-10 object-contain" />
          </div>
        </div>
      </footer>
    </div>
  );
}
