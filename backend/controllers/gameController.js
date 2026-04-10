const GameScore = require('../models/GameScore');

exports.saveScore = async (req, res) => {
  try {
    const score = new GameScore({ ...req.body, userId: req.userId });
    await score.save();
    res.status(201).json(score);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const allScores = await GameScore.find({ userId: req.userId }).sort({ score: -1 });
    const totalGames = allScores.length;
    
    // Find highest score and game type
    const bestGame = allScores[0] || null;
    
    // Count games by category (Mental, Reflex, etc.)
    // Note: This logic assumes the game names match the frontend categories
    const cognitiveGames = ['Memory Match', 'Simple Math', 'Yes/No Logic', 'Repeat Pattern'];
    const reflexGames = ['Reaction Time', 'Attention Focus', 'Visual Reaction', 'Visual Rhythm'];
    
    const cognitiveScores = allScores.filter(s => cognitiveGames.includes(s.gameType));
    const reflexScores = allScores.filter(s => reflexGames.includes(s.gameType));
    
    const cognitiveBest = cognitiveScores[0]?.score || 0;
    const reflexBest = reflexScores[0]?.score || 0;
    
    let insight = "Welcome back! Start with some 'Slow Interaction' to relax today.";
    if (totalGames > 0) {
      insight = `Excellent! You excel at ${bestGame.gameType}. Try a specialized Vision or Motor exercise next!`;
    }

    res.json({ 
      cognitiveBest, 
      reflexBest, 
      bestGame: bestGame?.gameType || "N/A",
      gamesPlayed: totalGames, 
      insight 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};