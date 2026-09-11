import { ALGO_BINGO_DATA } from './Data';

const STORAGE_KEY = 'algo_bingo_sessions';

const getSessions = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
};

const saveSessions = (sessions) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const Storage = {
  getContentSet: (id) => {
    // Only CS data is supported currently
    if (id === ALGO_BINGO_DATA._id) {
      return ALGO_BINGO_DATA;
    }
    return null;
  },

  createSession: (contentSetId, userId) => {
    const session = {
      _id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: userId || null,
      contentSetId,
      filledBoxes: {}, // key: categoryId, value: itemName
      score: 0,
      lives: 3,
      status: "in_progress", // "in_progress" | "won" | "lost"
      startedAt: new Date().toISOString(),
      completedAt: null
    };

    const sessions = getSessions();
    sessions[session._id] = session;
    saveSessions(sessions);
    return session;
  },

  updateSession: (sessionId, patch) => {
    const sessions = getSessions();
    if (!sessions[sessionId]) return null;
    
    sessions[sessionId] = { ...sessions[sessionId], ...patch };
    saveSessions(sessions);
    return sessions[sessionId];
  },

  getLeaderboard: (contentSetId, limit = 10) => {
    const sessions = getSessions();
    const allSessions = Object.values(sessions)
      .filter(s => s.contentSetId === contentSetId && s.status === 'won')
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    return allSessions.map(s => ({
      userId: s.userId || 'Anonymous',
      score: s.score
    }));
  }
};
