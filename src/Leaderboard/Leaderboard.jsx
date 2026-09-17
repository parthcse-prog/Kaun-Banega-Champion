import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';

export default function Leaderboard({ token }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // 1. Fetch PI360 profile if token exists to identify the current user
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const response = await fetch(
          'https://pi360.net/site/api/endpoints/api_student_profile.php?institute_id=mietjammu',
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const data = await response.json();
        if (response.ok && data?.student?.[0]) {
          setProfile(data.student[0]);
        }
      } catch (err) {
        console.error("Failed to fetch PI360 profile", err);
      }
    };

    fetchProfile();
  }, [token]);

  useEffect(() => {
    // 2. Fetch Leaderboard from MongoDB backend
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/leaderboard');
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          // Assign ranks and check if it's the current user
          const ranked = data.map((student, index) => {
            const currentProfileId = profile ? (profile.RollNumber || profile.EmailOfficial) : null;
            return {
              ...student,
              rank: index + 1,
              isCurrentUser: currentProfileId && student._id === currentProfileId
            };
          });
          setLeaderboard(ranked);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard from MongoDB", err);
      }
    };

    fetchLeaderboard();
  }, [profile]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.8)]" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.8)]" />;
    return <span className="font-mono font-black text-slate-400 text-lg">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-4">
          <Trophy className="w-10 h-10 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
        </div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 uppercase tracking-widest drop-shadow-md">
       Leaderboard
        </h1>
        <p className="text-slate-400 mt-2 font-medium">Student Rankings </p>
      </div>

      <div className="w-full max-w-3xl space-y-4">
        {leaderboard.length === 0 ? (
          <div className="text-center text-slate-400 p-8 border border-slate-800 rounded-2xl bg-slate-900/40">
            No players on the leaderboard yet. Play a game to claim the #1 spot!
          </div>
        ) : leaderboard.map((student) => (
          <div 
            key={student._id}
            className={`flex items-center justify-between p-4 sm:p-6 rounded-2xl border transition-all ${
              student.isCurrentUser 
                ? 'bg-gradient-to-r from-cyan-950/60 to-blue-900/40 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)] scale-[1.02]' 
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-8 sm:w-12 flex justify-center">
                {getRankIcon(student.rank)}
              </div>
              <div className="relative">
                {student.avatar ? (
                  <img src={student.avatar} alt={student.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-slate-700 object-cover" />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center font-bold text-xl text-slate-400">
                    {student.name.charAt(0)}
                  </div>
                )}
                {student.isCurrentUser && (
                  <span className="absolute -bottom-2 -right-2 bg-cyan-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    YOU
                  </span>
                )}
              </div>
              <div>
                <h3 className={`font-bold text-lg sm:text-xl ${student.isCurrentUser ? 'text-cyan-300' : 'text-white'}`}>
                  {student.name}
                </h3>
                <span className="text-xs font-mono text-slate-500">{student._id}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Total XP</span>
              <span className={`font-black font-mono text-2xl sm:text-3xl ${student.isCurrentUser ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]'}`}>
                {student.totalXP?.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
