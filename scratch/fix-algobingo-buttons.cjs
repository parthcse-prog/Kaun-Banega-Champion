const fs = require('fs');

const pathJSX = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/AlgoBingo/AlgoBingo.jsx';

let jsxContent = fs.readFileSync(pathJSX, 'utf8');

// The issue is that the WON and LOST buttons have onClick={startGame}
// React passes the SyntheticEvent as the first argument, so startGame receives the event object instead of undefined.
// This causes question.gridConfig to be undefined, bypassing the fallback generateValidGrid and resulting in an empty state.
// We need to change these to onClick={() => setGameState('MENU')} and text to "BACK TO MENU".

// Replace the WON state button
jsxContent = jsxContent.replace(
  /onClick=\{startGame\}[\s\S]*?PLAY AGAIN\s*<\/button>/,
  `onClick={() => setGameState('MENU')}
               className="w-full py-4 rounded-2xl bg-gradient-to-b from-emerald-400 to-teal-600 border-t-2 border-emerald-200 border-b-4 border-b-teal-900 text-slate-950 font-black text-xl uppercase tracking-widest shadow-[0_6px_20px_rgba(16,185,129,0.4)] active:translate-y-1 active:border-b-0 transition-all"
             >
               BACK TO MENU
             </button>`
);

// Replace the LOST state button
jsxContent = jsxContent.replace(
  /onClick=\{startGame\}[\s\S]*?TRY AGAIN\s*<\/button>/,
  `onClick={() => setGameState('MENU')}
               className="w-full py-4 rounded-2xl bg-gradient-to-b from-slate-600 to-slate-800 border-t-2 border-slate-400 border-b-4 border-b-slate-950 text-white font-black text-xl uppercase tracking-widest shadow-[0_6px_20px_rgba(0,0,0,0.4)] active:translate-y-1 active:border-b-0 transition-all"
             >
               BACK TO MENU
             </button>`
);

fs.writeFileSync(pathJSX, jsxContent, 'utf8');
console.log("Fixed button handlers in AlgoBingo.jsx");
