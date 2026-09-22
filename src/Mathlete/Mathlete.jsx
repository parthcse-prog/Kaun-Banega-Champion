import React, { useState, useEffect } from 'react';
import { RotateCcw, Play, Target, Wrench, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { CHALLENGES, MATERIALS } from './Data';
import { audio } from '../utils/audioManager';

export default function Mathlete() {
  const [challenge, setChallenge] = useState(CHALLENGES[0]);
  
  // Initialize inputs from defaults
  const [inputs, setInputs] = useState(() => {
    const initial = {};
    challenge.parameters.forEach(p => initial[p.id] = p.default);
    return initial;
  });

  const [result, setResult] = useState(null);
  const [bestScore, setBestScore] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const switchChallenge = (newChallenge) => {
    setChallenge(newChallenge);
    const initial = {};
    newChallenge.parameters.forEach(p => initial[p.id] = p.default);
    setInputs(initial);
    setResult(null);
    setBestScore(null);
  };

  const handleInputChange = (id, value) => {
    audio.playSFX('hover');
    setInputs(prev => ({ ...prev, [id]: value }));
    setResult(null); // Clear previous results when tweaking
  };

  const handleTest = () => {
    audio.playSFX('click');
    setIsSimulating(true);
    // Fake a small computation delay for 'Simulation' feel
    setTimeout(() => {
      const simResult = challenge.simulate(inputs);
      setResult(simResult);
      setIsSimulating(false);
      
      if (simResult.isSuccess) {
        audio.playSFX('success');
        if (bestScore === null || simResult.optimizationScore < bestScore) {
          setBestScore(simResult.optimizationScore);
        }
      } else {
        audio.playSFX('wrong');
      }
    }, 600);
  };

  // --- GENERIC RENDERERS ---
  const renderControls = () => {
    return challenge.parameters.map(param => {
      if (param.type === 'SLIDER') {
        return (
          <div key={param.id} className="mb-6">
            <div className="flex justify-between text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
              <span>{param.label}</span>
              <span className="text-white">{inputs[param.id]}</span>
            </div>
            <input 
              type="range" 
              min={param.min} 
              max={param.max} 
              step={param.step}
              value={inputs[param.id]}
              onChange={(e) => handleInputChange(param.id, parseFloat(e.target.value))}
              className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs font-bold text-slate-600 mt-1">
              <span>{param.min}</span>
              <span>{param.max}</span>
            </div>
          </div>
        );
      }
      
      if (param.type === 'SELECT') {
        return (
          <div key={param.id} className="mb-6">
             <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{param.label}</div>
             <div className="grid grid-cols-2 gap-2">
               {param.options.map(opt => (
                 <button 
                   key={opt}
                   onClick={() => handleInputChange(param.id, opt)}
                   className={`px-4 py-3 rounded-xl text-sm font-bold uppercase transition-all ${inputs[param.id] === opt ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                 >
                   {MATERIALS[opt] ? MATERIALS[opt].name : opt}
                 </button>
               ))}
             </div>
          </div>
        );
      }
      return null;
    });
  };

  // --- SPECIFIC VISUALIZER (BEAM) ---
  const renderBeamVisualizer = () => {
    const length = inputs.length; // 2 to 10
    const thickness = inputs.thickness; // 5 to 50
    const color = MATERIALS[inputs.material]?.color || '#ffffff';
    
    // Scale for SVG viewbox
    const svgWidth = 800;
    const svgHeight = 400;
    
    const beamWidth = (length / 10) * (svgWidth * 0.8); 
    const beamHeight = (thickness / 50) * 100;
    const beamX = (svgWidth - beamWidth) / 2;
    const beamY = 200;

    return (
      <div className="w-full aspect-video bg-slate-950 rounded-2xl border border-slate-800 shadow-inner flex items-center justify-center relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full relative z-10">
          <defs>
            <pattern id="wood" patternUnits="userSpaceOnUse" width="40" height="40">
               <path d="M0,0 Q20,20 40,0" stroke="rgba(0,0,0,0.1)" fill="none" strokeWidth="2" />
            </pattern>
          </defs>
          
          {/* Supports */}
          <polygon points={`${beamX + 20},${beamY + beamHeight} ${beamX - 10},${beamY + beamHeight + 60} ${beamX + 50},${beamY + beamHeight + 60}`} fill="#334155" />
          <polygon points={`${beamX + beamWidth - 20},${beamY + beamHeight} ${beamX + beamWidth - 50},${beamY + beamHeight + 60} ${beamX + beamWidth + 10},${beamY + beamHeight + 60}`} fill="#334155" />
          
          {/* Beam */}
          <rect x={beamX} y={beamY} width={beamWidth} height={beamHeight} fill={color} rx="4" />
          {inputs.material === 'wood' && <rect x={beamX} y={beamY} width={beamWidth} height={beamHeight} fill="url(#wood)" />}
          
          {/* Load/Weight (Only show if testing or resting) */}
          <g transform={`translate(${svgWidth/2}, ${beamY - (isSimulating ? 10 : 60)})`} className="transition-transform duration-500">
             <rect x="-40" y="-80" width="80" height="80" fill="#ef4444" rx="8" />
             <text x="0" y="-35" fill="white" textAnchor="middle" fontWeight="bold" fontSize="20">5000kg</text>
             <polygon points="-10,0 10,0 0,15" fill="#ef4444" />
          </g>
          
          {/* Stress Crack Animation if Failed */}
          {result && !result.isSuccess && (
            <path d={`M${svgWidth/2},${beamY} l-5,${beamHeight/3} l10,${beamHeight/3} l-5,${beamHeight/3}`} stroke="#ef4444" strokeWidth="4" fill="none" className="animate-[pulse_0.5s_infinite]" />
          )}
        </svg>

        {isSimulating && (
          <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[2px] flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <div className="font-mono text-blue-400 font-bold uppercase tracking-widest">Simulating...</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGearVisualizer = () => {
    return (
      <div className="w-full aspect-video bg-slate-950 rounded-2xl border border-slate-800 shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="flex items-center gap-8 z-10">
           <div className="flex flex-col items-center">
             <div className={`w-24 h-24 rounded-full border-8 border-dashed border-slate-500 flex items-center justify-center ${isSimulating ? 'animate-spin' : ''}`} style={{ animationDuration: `${60 / inputs.motorRpm}s` }}>
               <div className="text-xl font-black text-slate-400">{inputs.gearA}T</div>
             </div>
             <div className="mt-4 text-xs font-bold text-slate-500">MOTOR</div>
           </div>
           <div className="flex flex-col items-center">
             <div className={`w-32 h-32 rounded-full border-8 border-dashed border-blue-500 flex items-center justify-center ${isSimulating ? 'animate-[spin_reverse_linear_infinite]' : ''}`} style={{ animationDuration: `${(60 / inputs.motorRpm) * (inputs.gearB/inputs.gearA)}s` }}>
               <div className="text-2xl font-black text-blue-400">{inputs.gearB}T</div>
             </div>
             <div className="mt-4 text-xs font-bold text-blue-500">LOAD</div>
           </div>
        </div>
      </div>
    );
  };

  const renderAlgorithmVisualizer = () => {
    return (
      <div className="w-full aspect-video bg-slate-950 rounded-2xl border border-slate-800 shadow-inner flex flex-col items-center justify-center relative overflow-hidden p-8">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .3) 25%, rgba(255, 255, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .3) 75%, rgba(255, 255, 255, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .3) 25%, rgba(255, 255, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .3) 75%, rgba(255, 255, 255, .3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }} />
        
        <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-4 z-10 flex flex-col gap-4">
           <div className="flex items-center justify-between border-b border-slate-700 pb-2">
             <div className="text-xs font-bold text-slate-400">DATA STRUCTURE</div>
             <div className="text-sm font-black text-emerald-400 uppercase">{inputs.dataStructure}</div>
           </div>
           
           <div className="flex gap-2 justify-center">
             {Array.from({ length: Math.min(8, inputs.threads) }).map((_, i) => (
                <div key={i} className={`w-8 h-8 rounded bg-blue-500/20 border border-blue-500 flex items-center justify-center ${isSimulating ? 'animate-pulse' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                </div>
             ))}
             {inputs.threads > 8 && <div className="w-8 h-8 flex items-center justify-center text-slate-500 font-bold">+{inputs.threads - 8}</div>}
           </div>

           <div className="flex items-center justify-between border-t border-slate-700 pt-2">
             <div className="text-xs font-bold text-slate-400">CACHE LAYER</div>
             <div className={`text-sm font-black uppercase ${inputs.caching !== 'none' ? 'text-purple-400' : 'text-slate-600'}`}>{inputs.caching}</div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => window.location.href = '/'} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition">
            <RotateCcw className="w-5 h-5 text-slate-300" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl text-white tracking-tight">MATHLETE</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">ARENA</span>
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{challenge.branch} • {challenge.title}</div>
          </div>
        </div>
        
        <select 
          className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-4 py-2 outline-none cursor-pointer focus:border-blue-500"
          value={challenge.id}
          onChange={(e) => switchChallenge(CHALLENGES.find(c => c.id === e.target.value))}
        >
          {CHALLENGES.map(c => (
            <option key={c.id} value={c.id}>{c.branch} - {c.title}</option>
          ))}
        </select>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 lg:p-6 gap-6">
        
        {/* Left Column: Visualizer & Results */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Briefing Card */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider">Objective</h2>
                </div>
                <p className="text-slate-300">{challenge.objective}</p>
              </div>
              <div className="bg-slate-950 border border-blue-500/30 px-4 py-2 rounded-xl text-center">
                <div className="text-[10px] font-black text-slate-500 uppercase">Optimize For</div>
                <div className="text-sm font-bold text-blue-400">{challenge.optimizationTarget}</div>
              </div>
            </div>
          </div>

          {/* Visualizer */}
          {challenge.visualizerType === 'BEAM' && renderBeamVisualizer()}
          {challenge.visualizerType === 'GEAR' && renderGearVisualizer()}
          {challenge.visualizerType === 'ALGORITHM' && renderAlgorithmVisualizer()}

          {/* Results Panel */}
          {result && (
            <div className={`p-6 rounded-3xl border animate-in slide-in-from-bottom-8 ${result.isSuccess ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-red-950/30 border-red-500/30'}`}>
              <div className="flex items-center gap-3 mb-6">
                {result.isSuccess ? <CheckCircle className="w-8 h-8 text-emerald-500" /> : <AlertTriangle className="w-8 h-8 text-red-500" />}
                <h2 className={`text-2xl font-black ${result.isSuccess ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.isSuccess ? 'SYSTEM SAFE' : 'STRUCTURAL FAILURE'}
                </h2>
              </div>
              
              {!result.isSuccess && (
                <div className="bg-red-950/50 text-red-300 p-4 rounded-xl mb-6 font-medium border border-red-900">
                  {result.failureReason}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(result.outputs).map(([key, val]) => (
                  <div key={key} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                    <div className="text-[10px] font-black text-slate-500 uppercase mb-1">{key}</div>
                    <div className="text-lg font-mono font-bold text-white">{val}</div>
                  </div>
                ))}
              </div>

              {result.isSuccess && (
                <div className="mt-6 pt-6 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-emerald-500 mb-1">Optimization Score (Mass)</div>
                    <div className="text-3xl font-black text-white">{Math.round(result.optimizationScore)} kg</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => {
                      import('../utils/shareUtils').then(({ shareResult }) => {
                        shareResult('Mathlete (' + challenge.title + ')', Math.round(result.optimizationScore) + 'kg', { level: 'Simulation Passed' });
                      });
                    }} className="px-4 py-2 rounded-xl bg-slate-800 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-slate-700 transition flex items-center gap-2 shadow-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                      Share
                    </button>
                    {bestScore && (
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-400 mb-1">Your Best</div>
                        <div className="text-xl font-bold text-blue-400 flex items-center gap-2">
                          <TrendingDown className="w-5 h-5" /> {Math.round(bestScore)} kg
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Controls */}
        <div className="w-full lg:w-[400px] flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex-1">
            <div className="flex items-center gap-2 mb-8">
              <Wrench className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Parameters</h2>
            </div>
            
            {renderControls()}

          </div>
          
          <button 
            onClick={handleTest}
            disabled={isSimulating}
            className="w-full py-6 rounded-3xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xl uppercase tracking-widest shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {isSimulating ? 'Simulating...' : 'Run Simulation'} <Play className="w-6 h-6" />
          </button>
        </div>

      </main>
    </div>
  );
}
