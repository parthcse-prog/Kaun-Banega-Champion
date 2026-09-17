import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getGameAnalytics, fetchGlobalXP } from '../utils/analyticsStore';
import kbcLogo from '../assets/Logos/game_Logo.png';
import wordConnectLogo from '../assets/Logos/concept_connect.png';
import conceptNinjaLogo from '../assets/Logos/concept_ninja.png';
import bingoBonanzaLogo from '../assets/Logos/bingo_bonanaza.png';
import whosThatLogo from '../assets/Logos/whose_that.png';

const GAME_INFO = [
  { name: 'Kaun Banega Champion', logo: kbcLogo },
  { name: 'Word Connect', logo: wordConnectLogo },
  { name: 'Concept Ninja', logo: conceptNinjaLogo },
  { name: 'Bingo Bonanza', logo: bingoBonanzaLogo },
  { name: "Who's That?!", logo: whosThatLogo }
];

export default function AnalyticsPortal() {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [expandedGame, setExpandedGame] = useState(null);
  const [totalGrandmasterXP, setTotalGrandmasterXP] = useState(0);

  useEffect(() => {
    setAnalyticsData(getGameAnalytics());
    
    const loadGlobalXP = async () => {
      const xp = await fetchGlobalXP();
      setTotalGrandmasterXP(xp);
    };
    loadGlobalXP();
  }, []);

  const totalGamesPlayed = analyticsData.length;
  const totalTimePlayed = analyticsData.reduce((acc, curr) => acc + curr.timePlayed, 0);
  const gamesWon = analyticsData.filter(d => d.isWin).length;

  const gameMaxXP = {};
  analyticsData.forEach(entry => {
    const xp = entry.xp || 0;
    if (!gameMaxXP[entry.gameName] || xp > gameMaxXP[entry.gameName]) {
      gameMaxXP[entry.gameName] = xp;
    }
  });

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const getXPReason = (gameName, score, isWin) => {
    if (score === 0 && !isWin) return "Needs score/win for XP";
    switch (gameName) {
      case 'Kaun Banega Champion': return "Answers + Speed Bonus";
      case 'Bingo Bonanza': return "Grid Cleared + Speed Bonus";
      case 'Concept Ninja': return "High Score + Lives Bonus";
      case "Who's That?!": return "Guesses + Speed Bonus";
      case 'Word Connect': return "Words + Speed Bonus";
      default: return "Base completion + speed bonus";
    }
  };

  const toggleExpand = (gameName) => {
    if (expandedGame === gameName) {
      setExpandedGame(null);
    } else {
      setExpandedGame(gameName);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-amber-400">Analytics Portal</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
        <div className="bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-800 shadow-md">
          <h2 className="text-slate-400 font-semibold mb-2 text-sm sm:text-base">Grandmaster XP</h2>
          <p className="text-3xl sm:text-4xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">{totalGrandmasterXP}</p>
        </div>
        <div className="bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-800 shadow-md">
          <h2 className="text-slate-400 font-semibold mb-2 text-sm sm:text-base">Total Games</h2>
          <p className="text-3xl sm:text-4xl font-black text-cyan-400">{totalGamesPlayed}</p>
        </div>
        <div className="bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-800 shadow-md">
          <h2 className="text-slate-400 font-semibold mb-2 text-sm sm:text-base">Time Played</h2>
          <p className="text-3xl sm:text-4xl font-black text-emerald-400">{formatTime(totalTimePlayed)}</p>
        </div>
        <div className="bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-800 shadow-md">
          <h2 className="text-slate-400 font-semibold mb-2 text-sm sm:text-base">Games Won</h2>
          <p className="text-3xl sm:text-4xl font-black text-purple-400">{gamesWon}</p>
        </div>
      </div>

      <div className="space-y-6">
        {GAME_INFO.map(game => {
          const gameData = analyticsData.filter(d => d.gameName === game.name);
          if (gameData.length === 0) return null;
          
          const gameTimePlayed = gameData.reduce((acc, curr) => acc + curr.timePlayed, 0);
          const gameWins = gameData.filter(d => d.isWin).length;
          const gameMax = gameMaxXP[game.name] || 0;
          const isExpanded = expandedGame === game.name;

          return (
            <div key={game.name} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg transition-all">
              <button 
                onClick={() => toggleExpand(game.name)}
                className="w-full text-left p-6 border-b border-slate-800 bg-slate-800/20 hover:bg-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-700/50 p-2 shrink-0">
                    <img src={game.logo} alt={game.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{game.name}</h2>
                    <div className="flex flex-wrap gap-4 text-sm font-medium">
                      <span className="text-slate-400">Best XP: <span className="text-amber-400 font-bold">{gameMax}</span></span>
                      <span className="text-slate-400">Plays: <span className="text-cyan-400">{gameData.length}</span></span>
                      <span className="text-slate-400">Time: <span className="text-emerald-400">{formatTime(gameTimePlayed)}</span></span>
                      <span className="text-slate-400">Wins: <span className="text-purple-400">{gameWins}</span></span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/50 shrink-0 text-slate-400">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>
              
              {isExpanded && (
                <div className="overflow-x-auto animate-in slide-in-from-top-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-800/40">
                        <th className="p-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">Date</th>
                        <th className="p-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">Score</th>
                        <th className="p-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">Time Played</th>
                        <th className="p-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">XP Earned</th>
                        <th className="p-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gameData.slice().reverse().map((entry, idx) => (
                        <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 text-slate-300 font-mono text-sm">{new Date(entry.date).toLocaleString()}</td>
                          <td className="p-4 text-cyan-400 font-bold">{entry.score}</td>
                          <td className="p-4 text-slate-300 font-mono text-sm">{formatTime(entry.timePlayed)}</td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-amber-400 font-bold tracking-wide">{entry.xp || 0} XP</span>
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-semibold">
                                {getXPReason(game.name, entry.score, entry.isWin)}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${entry.isWin ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                              {entry.isWin ? 'WIN' : 'LOSS'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
        
        {analyticsData.length === 0 && (
          <div className="text-center p-12 bg-slate-900 rounded-xl border border-slate-800">
            <h3 className="text-xl text-slate-400 font-medium">No game data yet. Head to the Arena and play some games!</h3>
          </div>
        )}
      </div>
    </div>
  );
}
