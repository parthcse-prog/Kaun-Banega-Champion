export const calculateXP = (gameName, score, timePlayed) => {
  let xp = 0;
  
  if (gameName === 'Kaun Banega Champion') {
    // Score is correct answers (out of 20)
    // 40 XP per question = max 800
    const base = score * 40;
    // Time bonus (assume ideal time is 60s total, anything less adds to 200)
    const timeBonus = Math.max(0, 200 - (timePlayed * 2));
    xp = base + (score > 0 ? timeBonus : 0);
  } 
  else if (gameName === 'Bingo Bonanza') {
    // Score is 900 max
    const base = (score / 900) * 800;
    // Time remaining is calculated from 180s total
    const timeRemaining = Math.max(0, 180 - timePlayed);
    const timeBonus = (timeRemaining / 180) * 200;
    xp = base + (score > 0 ? timeBonus : 0);
  }
  else if (gameName === 'Concept Ninja') {
    // Assume 5000 is a great score
    const base = Math.min((score / 5000) * 800, 800);
    // Rough time bonus
    const timeBonus = Math.min((timePlayed / 60) * 200, 200);
    xp = base + (score > 0 ? timeBonus : 0);
  }
  else if (gameName === "Who's That?!") {
    // Score is out of 10
    // Give base 80 XP per correct guess
    const base = score * 80;
    const timeBonus = Math.max(0, 200 - timePlayed);
    xp = base + (score > 0 ? timeBonus : 0);
  }
  else if (gameName === 'Word Connect') {
    // Score is 100 per word. Say 10 words total = 1000
    const base = Math.min((score / 1000) * 800, 800);
    const timeBonus = Math.max(0, 200 - timePlayed);
    xp = base + (score > 0 ? timeBonus : 0);
  }

  return Math.round(Math.min(1000, Math.max(0, xp)));
};

export const saveGameAnalytics = async (gameName, score, timePlayed, isWin = false) => {
  try {
    const existingData = JSON.parse(localStorage.getItem('miet_games_analytics')) || [];
    
    const xp = calculateXP(gameName, score, timePlayed);
    
    const newEntry = {
      id: Date.now(),
      gameName,
      score,
      timePlayed,
      isWin,
      xp,
      date: new Date().toISOString()
    };
    existingData.push(newEntry);
    localStorage.setItem('miet_games_analytics', JSON.stringify(existingData));

    // Try to sync to MongoDB
    const token = localStorage.getItem('pi360_token');
    if (token) {
      // 1. Fetch PI360 profile to get ID, Name, Avatar
      const profileRes = await fetch('https://pi360.net/site/api/endpoints/api_student_profile.php?institute_id=mietjammu', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      const student = profileData?.student?.[0];
      
      if (student) {
        const studentId = student.RollNumber || student.EmailOfficial || `PI360-${Date.now()}`;
        const studentName = student.FirstName || student.Name || student.StudentName || 'Student';
        
        // 2. Post to our backend
        await fetch('http://localhost:5000/api/leaderboard/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pi360_id: studentId,
            name: studentName,
            avatar: student.ProfilePictureURL,
            gameName,
            xp
          })
        }).catch(err => console.error("Failed to sync score to MongoDB", err));
      }
    }
  } catch (err) {
    console.error('Failed to save analytics', err);
  }
};

export const getGameAnalytics = () => {
  try {
    return JSON.parse(localStorage.getItem('miet_games_analytics')) || [];
  } catch (err) {
    return [];
  }
};

// Mock "Other Students" with PI360 credentials
const MOCK_PI360_STUDENTS = [
  { name: "Aarav Sharma", avatar: "https://i.pravatar.cc/150?u=aarav", xp: 4850, rank: 1, pi360_id: "PI-2023-010" },
  { name: "Priya Singh", avatar: "https://i.pravatar.cc/150?u=priya", xp: 4200, rank: 2, pi360_id: "PI-2023-042" },
  { name: "Rohan Gupta", avatar: "https://i.pravatar.cc/150?u=rohan", xp: 3950, rank: 3, pi360_id: "PI-2023-017" },
  { name: "Neha Verma", avatar: "https://i.pravatar.cc/150?u=neha", xp: 3800, rank: 4, pi360_id: "PI-2023-088" },
  { name: "Vikram Malhotra", avatar: "https://i.pravatar.cc/150?u=vikram", xp: 3600, rank: 5, pi360_id: "PI-2023-005" },
  { name: "Sneha Reddy", avatar: "https://i.pravatar.cc/150?u=sneha", xp: 3450, rank: 6, pi360_id: "PI-2023-092" }
];

export const getLeaderboardData = (currentUserProfile, currentUserXP) => {
  // Merge current user with mock PI360 students
  const userEntry = {
    name: currentUserProfile?.name || currentUserProfile?.StudentName || "You (PI360)",
    avatar: currentUserProfile?.ProfilePictureURL || null,
    xp: currentUserXP || 0,
    pi360_id: "PI-CURRENT-USER",
    isCurrentUser: true
  };

  const combined = [...MOCK_PI360_STUDENTS, userEntry];
  // Sort by XP descending
  combined.sort((a, b) => b.xp - a.xp);
  
  // Assign ranks
  return combined.map((student, index) => ({
    ...student,
    rank: index + 1
  }));
};
