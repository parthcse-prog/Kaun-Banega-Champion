export const generateShareText = (gameName, score, details) => {
  let text = `🎮 MIET Games Arena\n`;
  
  if (gameName === 'Kaun Banega Champion') {
    text += `🏆 KBC Winnings: ${score} PTS\n`;
    text += `🧠 Reached Question: ${details.level}/20\n`;
    const squares = Array(20).fill('🟥');
    for(let i=0; i<details.level; i++) squares[i] = '🟩';
    text += squares.join('') + '\n';
  } 
  else if (gameName === 'Concept Ninja') {
    text += `🥷 Concept Ninja\n`;
    text += `⚔️ Score: ${score}\n`;
    text += `🍉 Combo Maxed!\n`;
  } 
  else if (gameName === 'Bingo Bonanza') {
    text += `🧩 Bingo Bonanza\n`;
    text += `✨ Score: ${score}\n`;
    text += details.isWin ? `✅ Grid Cleared!\n` : `❌ Ran out of time\n`;
  }
  else {
    text += `🏆 ${gameName} Score: ${score}\n`;
  }
  
  text += `\nCan you beat my score? Play here: ${window.location.origin}`;
  return text;
};

export const shareResult = async (gameName, score, details = {}) => {
  const text = generateShareText(gameName, score, details);
  
  // If the browser supports native sharing (like on Mobile iOS/Android)
  if (navigator.share) {
    try {
      await navigator.share({
        title: `My ${gameName} Score`,
        text: text,
      });
      return;
    } catch (e) {
      console.log("Share dialog closed or failed.", e);
    }
  } 
  
  // Fallback for PC / unsupported browsers
  try {
    await navigator.clipboard.writeText(text);
    alert("Score copied to clipboard! Paste it on WhatsApp, Instagram, or Discord.");
  } catch (err) {
    console.error("Failed to copy text", err);
    alert("Failed to copy to clipboard.");
  }
};
