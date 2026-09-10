import { useEffect, useState } from 'react';
import { User as UserIcon } from 'lucide-react';

export default function Profile({ token }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          'https://pi360.net/site/api/endpoints/api_student_profile.php?institute_id=mietjammu',
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        const data = await response.json();
        
        if (response.ok) {
          setProfile(data);
        } else {
          setError(data.message || 'Failed to fetch profile.');
        }
      } catch (err) {
        setError('An error occurred while fetching your profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <svg className="animate-spin h-10 w-10 text-amber-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-400 font-medium animate-pulse">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="glass-card rounded-2xl p-6 text-center border-red-500/30">
          <p className="text-red-400 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  // Parse API payload correctly
  const studentData = profile?.student?.[0] || {};
  const userName = studentData.FirstName || studentData.Name || 'Student';
  const profileImage = studentData.ProfilePictureURL || null;
  
  return (
    <div className="flex-1 flex items-start justify-center p-4 sm:p-8 w-full mt-4 sm:mt-12">
      <div className="glass-card rounded-3xl p-6 sm:p-10 shadow-card-elevated border border-slate-700/50 w-full max-w-2xl relative overflow-hidden">
        {/* Decorative card edge accent glow */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"></div>
        
        <div className="flex flex-col items-center text-center">
          
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 border-4 border-amber-500/30 flex items-center justify-center mb-6 shadow-glow-amber">
             {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
             ) : (
                <UserIcon size={40} className="text-amber-400" />
             )}
          </div>
          
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome, {userName}!</h1>
          <p className="text-slate-400 font-medium mb-8">You have successfully logged into the PI360 platform.</p>
          
          <div className="w-full space-y-3">
            <div className="input-glass rounded-2xl p-4 flex justify-between items-center transition-all hover:border-amber-500/30">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase rounded-full border border-emerald-500/30 shadow-inner">Active Player</span>
            </div>
            
            {studentData.RollNumber && (
              <div className="input-glass rounded-2xl p-4 flex justify-between items-center transition-all hover:border-amber-500/30">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Roll Number</span>
                <span className="text-white font-bold tracking-wide">{studentData.RollNumber}</span>
              </div>
            )}
            
            {studentData.EmailOfficial && (
              <div className="input-glass rounded-2xl p-4 flex justify-between items-center overflow-hidden transition-all hover:border-amber-500/30">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0 mr-4">Email</span>
                <span className="text-white font-bold tracking-wide truncate">{studentData.EmailOfficial}</span>
              </div>
            )}
            
            {studentData.Branch && (
              <div className="input-glass rounded-2xl p-4 flex justify-between items-center transition-all hover:border-amber-500/30">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Branch</span>
                <span className="text-amber-400 font-bold tracking-wide">{studentData.Branch}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
