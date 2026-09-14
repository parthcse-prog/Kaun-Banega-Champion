const fs = require('fs');
const path = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/WordConnect/WordConnect.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Initial State Updates
content = content.replace(
  /const \[gameState, setGameState\] = useState\('PROFILE_SELECT'\);[\s\S]*?const \[questions, setQuestions\] = useState\(\[\]\);/,
  `const cseProfile = MOCK_PROFILES.find(p => p.stream === 'CSE') || MOCK_PROFILES[0];
  const cseQuestions = QUESTION_BANK.filter(q => q.stream === 'CSE');
  
  const [gameState, setGameState] = useState('PLAYING');
  const [profile, setProfile] = useState(cseProfile);
  
  // Content Engine State
  const [questions, setQuestions] = useState(cseQuestions);`
);

// 2. Add useEffect to init puzzle
content = content.replace(
  /const currentQ = questions\[currentQIdx\];/g,
  `useEffect(() => {
    if (cseQuestions.length > 0) {
      initPuzzle(cseQuestions[0].answer);
    }
  }, []);

  const currentQ = questions[currentQIdx];`
);

// 3. Remove PROFILE_SELECT block completely
content = content.replace(
  /if \(gameState === 'PROFILE_SELECT'\) \{[\s\S]*?if \(gameState === 'SUMMARY'\) \{/m,
  `if (gameState === 'SUMMARY') {`
);

// 4. Update the SWITCH PROFILE button
content = content.replace(
  /setGameState\('PROFILE_SELECT'\)/g,
  `() => window.location.href = '/'`
);
content = content.replace(
  />\s*SWITCH PROFILE\s*<\/button>/g,
  `>BACK TO ARENA</button>`
);

// 5. Update the back button in header (which had setGameState('PROFILE_SELECT'))
// Already handled by the regex replacement above for setGameState('PROFILE_SELECT')

fs.writeFileSync(path, content, 'utf8');
console.log("Updated WordConnect.jsx properly with regex");
