export const MindGames = {
  getDifficulty: (score) => {
    if (score > 100) return 'hard';
    if (score > 50) return 'medium';
    return 'easy';
  },

  // 1. Memory Match
  generateMemoryCards: (count) => {
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'];
    const selected = emojis.slice(0, count / 2);
    const deck = [...selected, ...selected]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, flipped: false, matched: false }));
    return deck;
  },

  // 2. Simple Math
  generateMathProblem: (difficulty) => {
    const max = difficulty === 'hard' ? 50 : difficulty === 'medium' ? 20 : 10;
    const a = Math.floor(Math.random() * max) + 1;
    const b = Math.floor(Math.random() * max) + 1;
    const op = Math.random() > 0.5 ? '+' : '-';
    const result = op === '+' ? a + b : a - b;
    return {
      question: `${a} ${op} ${b} = ?`,
      answer: result,
      options: [result, result + 2, result - 2, result + 5].sort(() => Math.random() - 0.5)
    };
  },

  // 3. Reaction Time
  getRandomDelay: (min = 1000, max = 3000) => {
    return Math.floor(Math.random() * (max - min)) + min;
  },

  // 4. Attention Focus (Find the odd one out)
  generateFocusProblem: () => {
    const symbols = ['⭕', '❌', '➕', '➖', '💎', '⭐', '🎈', '🍀'];
    const target = symbols[Math.floor(Math.random() * symbols.length)];
    let odd;
    do {
      odd = symbols[Math.floor(Math.random() * symbols.length)];
    } while (odd === target);
    
    const items = new Array(9).fill(target);
    const oddIndex = Math.floor(Math.random() * 9);
    items[oddIndex] = odd;
    
    return { items, oddIndex, oddSymbol: odd };
  },

  // 5. Pattern Match (Shape based)
  generatePatternMatch: () => {
    const patterns = ['▲', '■', '●', '◆', '★', '✖'];
    const target = patterns[Math.floor(Math.random() * patterns.length)];
    const options = patterns.sort(() => Math.random() - 0.5).slice(0, 4);
    if (!options.includes(target)) options[Math.floor(Math.random() * 4)] = target;
    return { target, options };
  },

  // 6. Audio Memory (Recalling names/emojis)
  getAudioSequence: (count = 3) => {
    const items = ['Apple', 'Banana', 'Cat', 'Dog', 'Elephant', 'Flower', 'Guitar', 'Hat'];
    const sequence = [];
    for (let i = 0; i < count; i++) {
      sequence.push(items[Math.floor(Math.random() * items.length)]);
    }
    return sequence;
  },

  // 7. Yes/No Recognition
  generateYesNoQuestion: () => {
    const questions = [
      { q: 'Is a cat an animal?', a: true },
      { q: 'Is the sun cold?', a: false },
      { q: 'Is water wet?', a: true },
      { q: 'Can a car fly?', a: false },
      { q: 'Is grass blue?', a: false },
      { q: 'Is 2+2=4?', a: true }
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  },

  // 8. Repeat Pattern (Simon Says)
  generateSequence: (length) => {
    const colors = ['#FF5252', '#4CAF50', '#2196F3', '#FFC107'];
    const sequence = [];
    for (let i = 0; i < length; i++) {
      sequence.push(Math.floor(Math.random() * 4));
    }
    return sequence;
  },

  calculateScore: (time, accuracy = 1) => {
    const base = Math.max(0, Math.floor(1000 - time));
    return Math.floor(base * accuracy);
  }
};
