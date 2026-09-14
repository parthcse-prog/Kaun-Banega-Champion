export const saveGameAnalytics = (gameName, score, timePlayed, isWin = false) => {
  try {
    const existingData = JSON.parse(localStorage.getItem('miet_games_analytics')) || [];
    const newEntry = {
      id: Date.now(),
      gameName,
      score,
      timePlayed,
      isWin,
      date: new Date().toISOString()
    };
    existingData.push(newEntry);
    localStorage.setItem('miet_games_analytics', JSON.stringify(existingData));
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
