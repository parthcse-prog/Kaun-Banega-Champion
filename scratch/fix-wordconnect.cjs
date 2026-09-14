const fs = require('fs');

const path = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/WordConnect/WordConnect.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Initial State Updates
content = content.replace(
  `  const [gameState, setGameState] = useState('PROFILE_SELECT'); // PROFILE_SELECT, PLAYING, EXPLANATION, SUMMARY
  const [profile, setProfile] = useState(null);
  
  // Content Engine State
  const [questions, setQuestions] = useState([]);`,
  `  const cseProfile = MOCK_PROFILES.find(p => p.stream === 'CSE') || MOCK_PROFILES[0];
  const cseQuestions = QUESTION_BANK.filter(q => q.stream === 'CSE');
  
  const [gameState, setGameState] = useState('PLAYING'); // PLAYING, EXPLANATION, SUMMARY
  const [profile, setProfile] = useState(cseProfile);
  
  // Content Engine State
  const [questions, setQuestions] = useState(cseQuestions);`
);

// 2. Add useEffect to init puzzle
content = content.replace(
  `  const currentQ = questions[currentQIdx];`,
  `  useEffect(() => {
    if (cseQuestions.length > 0) {
      initPuzzle(cseQuestions[0].answer);
    }
  }, []);

  const currentQ = questions[currentQIdx] || {};`
);

// 3. Remove PROFILE_SELECT block completely
// Find the block using string manipulation
const startBlock = `  if (gameState === 'PROFILE_SELECT') {`;
const endBlock = `  if (gameState === 'SUMMARY') {`;

const startIndex = content.indexOf(startBlock);
const endIndex = content.indexOf(endBlock);

if (startIndex !== -1 && endIndex !== -1) {
    content = content.substring(0, startIndex) + content.substring(endIndex);
}

// 4. Update the SWITCH PROFILE button
content = content.replace(
  `<button onClick={() => setGameState('PROFILE_SELECT')} className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">
          SWITCH PROFILE
        </button>`,
  `<button onClick={() => window.location.href = '/'} className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">
          BACK TO ARENA
        </button>`
);

// 5. Update the back button in header
content = content.replace(
  `<button onClick={() => setGameState('PROFILE_SELECT')} className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#1c2842] to-[#0e1628] border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:text-cyan-200 hover:border-cyan-400 shadow-md transition active:scale-95">`,
  `<button onClick={() => window.location.href = '/'} className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#1c2842] to-[#0e1628] border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:text-cyan-200 hover:border-cyan-400 shadow-md transition active:scale-95">`
);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated WordConnect.jsx");
