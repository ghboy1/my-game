// src/App.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DollarSign, TrendingUp, Home, Briefcase, AlertCircle, Trophy, Star, Sparkles,
  Target, Zap, Crown, Gift, Clock, Users, ArrowRight, X, Check,
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Edit2, HelpCircle, Save, Upload, Volume2, VolumeX
} from 'lucide-react';
import Confetti from 'react-confetti';

// Reusable Components (keep these the same)
const Notification = ({ message, type, onClose }) => {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={`fixed top-4 right-4 px-6 py-3 rounded-xl shadow-xl text-white font-bold animate-fade-in z-50 ${colors[type]}`}>
      {message}
      <button onClick={onClose} className="ml-3 text-white opacity-80 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const DealCard = ({ deal, onBuy, onPass }) => (
  <div className="deal-card animate-fade-in">
    <div className="text-4xl mb-3">{deal.icon}</div>
    <h3 className="text-xl font-bold mb-2">{deal.name}</h3>
    <p className="text-sm"><strong>Type:</strong> {deal.type}</p>
    <p className="text-sm"><strong>Cost:</strong> GH₵{deal.cost.toLocaleString()}</p>
    <p className="text-sm text-green-600 font-semibold">+GH₵{deal.cashFlow.toLocaleString()}/mo</p>
    {deal.mortgage > 0 && <p className="text-sm text-orange-600">Mortgage: GH₵{deal.mortgage.toLocaleString()}/mo</p>}
    <div className="flex gap-3 mt-4 justify-center">
      <button onClick={onBuy} className="btn-success"><Check className="w-5 h-5" /> Buy</button>
      <button onClick={onPass} className="btn-danger"><X className="w-5 h-5" /> Pass</button>
    </div>
  </div>
);

const PlayerCard = ({ player, isActive, onEdit }) => (
  <div className={`player-card ${isActive ? 'player-card-active' : ''}`}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full shadow-md" style={{ backgroundColor: player.color }} />
        <span className="font-bold text-lg">{player.name} {player.isFreed ? 'Free' : ''}</span>
      </div>
      <button onClick={() => onEdit(player.id)} className="text-blue-600 hover:text-blue-800">
        <Edit2 className="w-4 h-4" />
      </button>
    </div>
    <div className="space-y-1 text-sm">
      <p>{player.professionIcon} <strong>{player.profession}</strong></p>
      <p>💵 <strong>Cash:</strong> GH₵{player.cash.toLocaleString()}</p>
      <p>📈 <strong>Passive:</strong> GH₵{player.passiveIncome.toLocaleString()}</p>
      <p>💸 <strong>Expenses:</strong> GH₵{player.expenses.toLocaleString()}</p>
      <p>🎯 <strong>Goal:</strong> GH₵{player.dreamGoal.toLocaleString()}</p>
    </div>
    <details className="mt-2 text-xs">
      <summary className="cursor-pointer font-semibold text-blue-600">Assets ({player.assets.length})</summary>
      <ul className="list-disc pl-5 mt-1 space-y-1">
        {player.assets.map((a, i) => (
          <li key={i} className="text-gray-700">{a.icon} {a.name} (+GH₵{a.cashFlow}/mo)</li>
        ))}
      </ul>
    </details>
  </div>
);

const FinancialFreedomGame = () => {
  const [gameState, setGameState] = useState('menu');
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceRoll, setDiceRoll] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [message, setMessage] = useState('');
  const [showDeal, setShowDeal] = useState(null);
  const [notification, setNotification] = useState(null);
  const [turnCount, setTurnCount] = useState(0);
  const [charityRoll, setCharityRoll] = useState(false);
  const [gameLog, setGameLog] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Constants (keep these the same)
  const professions = useMemo(() => [
    { name: 'Teacher', salary: 3500, expenses: 2800, savings: 1000 },
    { name: 'Nurse', salary: 3800, expenses: 3000, savings: 1200 },
    { name: 'Mechanic', salary: 2500, expenses: 1800, savings: 800 },
    { name: 'Police Officer', salary: 3200, expenses: 2600, savings: 1000 },
    { name: 'Engineer', salary: 6000, expenses: 4800, savings: 2000 },
    { name: 'Accountant', salary: 5500, expenses: 4200, savings: 1800 },
    { name: 'Doctor', salary: 12000, expenses: 9500, savings: 3500 },
    { name: 'Business Manager', salary: 5800, expenses: 4500, savings: 1500 }
  ], []);

  const smallDeals = useMemo(() => [
    { type: 'Real Estate', name: '2BR House', cost: 15000, cashFlow: 500, mortgage: 1200 },
    { type: 'Real Estate', name: '3BR House', cost: 25000, cashFlow: 800, mortgage: 2000 },
    { type: 'Real Estate', name: 'Duplex', cost: 40000, cashFlow: 1500, mortgage: 3000 },
    { type: 'Stock', name: 'MTN Ghana', cost: 3000, cashFlow: 120, mortgage: 0 },
    { type: 'Stock', name: 'Cocoa Processing', cost: 5000, cashFlow: 200, mortgage: 0 },
    { type: 'Business', name: 'Food Kiosk', cost: 8000, cashFlow: 600, mortgage: 0 },
    { type: 'Business', name: 'Mobile Money Agent', cost: 12000, cashFlow: 900, mortgage: 0 },
    { type: 'Business', name: 'Delivery Service', cost: 15000, cashFlow: 1100, mortgage: 0 }
  ], []);

  const bigDeals = useMemo(() => [
    { type: 'Real Estate', name: '10-Unit Apartment', cost: 150000, cashFlow: 8000, mortgage: 12000 },
    { type: 'Real Estate', name: 'Shopping Complex', cost: 300000, cashFlow: 15000, mortgage: 25000 },
    { type: 'Business', name: 'Restaurant Franchise', cost: 80000, cashFlow: 6000, mortgage: 0 },
    { type: 'Business', name: 'Manufacturing Plant', cost: 250000, cashFlow: 18000, mortgage: 0 }
  ], []);

  const doodads = useMemo(() => [
    { name: 'New Car Payment', cost: 800, duration: 'monthly' },
    { name: 'Expensive Phone', cost: 3000, duration: 'once' },
    { name: 'Wedding Expense', cost: 5000, duration: 'once' },
    { name: 'Medical Emergency', cost: 4000, duration: 'once' },
    { name: 'Home Repairs', cost: 3500, duration: 'once' },
    { name: 'School Fees', cost: 1200, duration: 'monthly' }
  ], []);

  const boardSpaces = useMemo(() => [
    { name: 'START', type: 'start', emoji: '🎯', color: 'bg-green-500' },
    { name: 'Opportunity', type: 'opportunity', emoji: '💎', color: 'bg-blue-500' },
    { name: 'Market', type: 'market', emoji: '📈', color: 'bg-purple-500' },
    { name: 'Doodad', type: 'doodad', emoji: '💸', color: 'bg-red-500' },
    { name: 'Opportunity', type: 'opportunity', emoji: '💎', color: 'bg-blue-500' },
    { name: 'Payday', type: 'payday', emoji: '💰', color: 'bg-yellow-500' },
    { name: 'Opportunity', type: 'opportunity', emoji: '💎', color: 'bg-blue-500' },
    { name: 'Charity', type: 'charity', emoji: '🎁', color: 'bg-pink-500' },
    { name: 'Doodad', type: 'doodad', emoji: '💸', color: 'bg-red-500' },
    { name: 'Opportunity', type: 'opportunity', emoji: '💎', color: 'bg-blue-500' },
    { name: 'Market', type: 'market', emoji: '📈', color: 'bg-purple-500' },
    { name: 'Opportunity', type: 'opportunity', emoji: '💎', color: 'bg-blue-500' },
    { name: 'Bonus', type: 'bonus', emoji: '⭐', color: 'bg-orange-500' },
    { name: 'Tax Audit', type: 'tax', emoji: '🧾', color: 'bg-gray-500' }
  ], []);

  const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#6366F1'];
  const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

  // Game Functions - Define ALL functions before using them in JSX
  const showNotification = useCallback((msg, type = 'info') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const addToLog = useCallback((msg) => {
    setGameLog(prev => [...prev, `[Turn ${turnCount}] ${msg}`].slice(-25));
  }, [turnCount]);

  const checkFreedom = useCallback((player) => {
    if (!player.isFreed && player.passiveIncome >= player.expenses) {
      player.isFreed = true;
      setMessage(`${player.name} ESCAPED THE RAT RACE!`);
      showNotification(`${player.name} is FREE!`, 'success');
      playSound('win');
    }
    if (player.isFreed && player.passiveIncome >= player.dreamGoal) {
      setGameState('won');
      playSound('win');
    }
  }, [showNotification]);

  const buyDeal = useCallback(() => {
    if (!showDeal) return;
    const player = players[currentPlayerIndex];
    if (player.cash >= showDeal.cost) {
      const updated = [...players];
      updated[currentPlayerIndex] = {
        ...player,
        cash: player.cash - showDeal.cost,
        passiveIncome: player.passiveIncome + showDeal.cashFlow,
        expenses: player.expenses + (showDeal.mortgage || 0),
        assets: [...player.assets, showDeal]
      };
      setPlayers(updated);
      setMessage(`Bought ${showDeal.name}! +GH₵${showDeal.cashFlow}/mo`);
      addToLog(`Bought ${showDeal.name}`);
      showNotification(`+GH₵${showDeal.cashFlow}/mo`, 'success');
      playSound('buy');
      checkFreedom(updated[currentPlayerIndex]);
    } else {
      showNotification('Not enough cash!', 'error');
    }
    setShowDeal(null);
  }, [showDeal, players, currentPlayerIndex, addToLog, showNotification, checkFreedom]);

  const passDeal = useCallback(() => {
    setMessage('Passed on opportunity');
    addToLog('Passed deal');
    showNotification('Passed', 'info');
    setShowDeal(null);
  }, [addToLog, showNotification]);

  const nextPlayer = useCallback(() => {
    setDiceRoll(null);
    setCharityRoll(false);
    setCurrentPlayerIndex((i) => (i + 1) % players.length);
    setMessage(`${players[(currentPlayerIndex + 1) % players.length].name}'s turn!`);
    addToLog('Turn ended');
  }, [currentPlayerIndex, players, addToLog]);

  const endTurn = useCallback(() => {
    if (showDeal || charityRoll) return;
    nextPlayer();
  }, [showDeal, charityRoll, nextPlayer]);

  const saveGame = useCallback(() => {
    const data = { players, currentPlayerIndex, turnCount, gameLog };
    localStorage.setItem('ffg_save', JSON.stringify(data));
    showNotification('Game saved!', 'success');
  }, [players, currentPlayerIndex, turnCount, gameLog, showNotification]);

  const loadGame = useCallback(() => {
    const saved = localStorage.getItem('ffg_save');
    if (saved) {
      const { players: p, currentPlayerIndex: i, turnCount: t, gameLog: l } = JSON.parse(saved);
      setPlayers(p);
      setCurrentPlayerIndex(i);
      setTurnCount(t);
      setGameLog(l);
      setGameState('playing');
      showNotification('Game loaded!', 'success');
    }
  }, [showNotification]);

  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    const audio = new Audio();
    // Sound implementation would go here
    audio.play().catch(() => {});
  }, [soundEnabled]);

  const startGame = useCallback((numPlayers) => {
    const newPlayers = Array.from({ length: numPlayers }, (_, i) => {
      const prof = professions[Math.floor(Math.random() * professions.length)];
      return {
        id: i,
        name: `Player ${i + 1}`,
        color: colors[i % colors.length],
        profession: prof.name,
        professionIcon: '👨‍💼', // Add appropriate icons
        professionColor: prof.color,
        cash: prof.savings + prof.salary,
        salary: prof.salary,
        expenses: prof.expenses,
        passiveIncome: 0,
        position: 0,
        assets: [],
        isFreed: false,
        dreamGoal: 10000 + i * 1000 + Math.floor(Math.random() * 5000),
        turnsPlayed: 0
      };
    });
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setGameState('playing');
    const msg = `${newPlayers[0].name} starts!`;
    setMessage(msg);
    addToLog(msg);
    showNotification(`Game Started! ${numPlayers} players`, 'success');
  }, [professions, colors, addToLog, showNotification]);

  const handleSpace = useCallback((pos, updatedPlayers) => {
    const space = boardSpaces[pos];
    const player = updatedPlayers[currentPlayerIndex];
    let msg = `${player.name} → ${space.emoji} ${space.name}`;

    switch (space.type) {
      case 'payday':
        const income = player.salary + player.passiveIncome - player.expenses;
        player.cash += income;
        msg += ` | PAYDAY! +GH₵${income}`;
        showNotification(`+GH₵${income}`, 'success');
        checkFreedom(player);
        break;
      case 'opportunity':
        const pool = player.isFreed ? bigDeals : smallDeals;
        setShowDeal(pool[Math.floor(Math.random() * pool.length)]);
        msg += ` | New Deal!`;
        showNotification('Opportunity!', 'info');
        break;
      case 'doodad':
        const doodad = doodads[Math.floor(Math.random() * doodads.length)];
        if (doodad.duration === 'once') {
          player.cash -= doodad.cost;
          msg += ` | ${doodad.icon} ${doodad.name} (-GH₵${doodad.cost})`;
        } else {
          player.expenses += doodad.cost;
          msg += ` | ${doodad.icon} +GH₵${doodad.cost}/mo expenses`;
        }
        showNotification('Doodad!', 'warning');
        break;
      case 'charity':
        const donation = Math.floor(player.salary * 0.1);
        player.cash -= donation;
        msg += ` | Donated GH₵${donation} — Roll again!`;
        setCharityRoll(true);
        setDiceRoll(null);
        showNotification('Roll again!', 'success');
        return;
      default:
        msg += ' | Nothing happens.';
    }

    setMessage(msg);
    addToLog(msg);
    setPlayers(updatedPlayers);
    setTurnCount(c => c + 1);

    if (!charityRoll && !showDeal) {
      setTimeout(endTurn, 2000);
    }
  }, [currentPlayerIndex, boardSpaces, showDeal, charityRoll, endTurn, addToLog, showNotification, checkFreedom, bigDeals, smallDeals, doodads]);

  const movePlayer = useCallback((steps) => {
    const player = players[currentPlayerIndex];
    const newPos = (player.position + steps) % boardSpaces.length;
    const updated = [...players];
    updated[currentPlayerIndex] = { ...player, position: newPos, turnsPlayed: player.turnsPlayed + 1 };
    setPlayers(updated);
    setTimeout(() => handleSpace(newPos, updated), 600);
  }, [players, currentPlayerIndex, boardSpaces.length, handleSpace]);

  const rollDice = useCallback(() => {
    playSound('roll');
    setIsRolling(true);
    let rolls = 0;
    const interval = setInterval(() => {
      setDiceRoll(Math.floor(Math.random() * 6) + 1);
      if (++rolls > 12) {
        clearInterval(interval);
        const final = Math.floor(Math.random() * 6) + 1;
        setDiceRoll(final);
        setIsRolling(false);
        movePlayer(final);
      }
    }, 80);
  }, [playSound, movePlayer]);

  // JSX Rendering
  const currentPlayer = players[currentPlayerIndex];
  const DiceIcon = diceIcons[(diceRoll || 0) % 6];

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-yellow-700 flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {['💰', '🏠', '📈', '🎯'].map((icon, i) => (
            <div key={i} className={`absolute text-6xl animate-float`} style={{
              left: `${20 + i * 20}%`, top: `${20 + i * 15}%`, animationDelay: `${i * 0.5}s`
            }}>
              {icon}
            </div>
          ))}
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 max-w-4xl w-full border-4 border-yellow-400">
          <h1 className="text-5xl font-black text-center mb-6 bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
            Financial Freedom Game
          </h1>
          <p className="text-center text-gray-600 mb-8 text-lg">
            Escape the rat race through smart investments and passive income!
          </p>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <button onClick={() => startGame(2)} className="bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-2xl font-bold text-xl">
              2 Players
            </button>
            <button onClick={() => startGame(3)} className="bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-2xl font-bold text-xl">
              3 Players
            </button>
            <button onClick={() => startGame(4)} className="bg-purple-500 hover:bg-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-xl">
              4 Players
            </button>
            <button onClick={loadGame} className="bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-2xl font-bold text-xl">
              Load Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'won') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 relative overflow-hidden">
        <Confetti width={window.innerWidth} height={window.innerHeight} />
        <div className="flex items-center justify-center h-full">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-12 text-center border-4 border-yellow-400 shadow-2xl">
            <h1 className="text-6xl font-black text-green-600 mb-4">🎉 VICTORY! 🎉</h1>
            <p className="text-2xl text-gray-800 mb-6">{currentPlayer?.name} achieved financial freedom!</p>
            <button 
              onClick={() => setGameState('menu')}
              className="bg-green-500 hover:bg-green-600 text-white py-3 px-8 rounded-2xl font-bold text-xl"
            >
              New Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-yellow-700 p-4">
      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Board */}
        <div className="lg:col-span-2 bg-white/95 backdrop-blur rounded-3xl p-6 border-4 border-yellow-400 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              Game Board
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setShowHelp(true)} className="text-blue-600">
                <HelpCircle className="w-6 h-6" />
              </button>
              <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-purple-600">
                {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </button>
            </div>
          </div>

          <div className="board-grid">
            {boardSpaces.map((space, i) => (
              <div key={i} className={`board-space ${space.color} text-white font-bold p-3 rounded-xl text-center relative`}>
                <div className="text-lg">{space.emoji}</div>
                <div className="text-xs mt-1">{space.name}</div>
                <div className="absolute bottom-1 right-1 flex gap-1">
                  {players.map(p => p.position === i && (
                    <div key={p.id} className="w-3 h-3 rounded-full shadow" style={{ backgroundColor: p.color }} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xl font-bold text-gray-800 mb-3">{message}</p>
            {showDeal && <DealCard deal={showDeal} onBuy={buyDeal} onPass={passDeal} />}
          </div>
        </div>

        {/* Players */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center text-white mb-2">Players</h2>
          {players.map(p => (
            <PlayerCard key={p.id} player={p} isActive={p.id === currentPlayerIndex} onEdit={setEditingPlayer} />
          ))}
        </div>

        {/* Log */}
        <div className="bg-white/95 backdrop-blur rounded-3xl p-5 border-4 border-yellow-400 shadow-xl">
          <h2 className="text-xl font-bold text-center mb-3">Game Log</h2>
          <div className="log-panel text-xs space-y-1">
            {gameLog.map((log, i) => <p key={i} className="border-b border-gray-200 pb-1">{log}</p>)}
          </div>
        </div>

        {/* Controls */}
        <div className="lg:col-span-4 bg-white/95 backdrop-blur rounded-3xl p-6 border-4 border-yellow-400 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-3">
            <button
              onClick={rollDice}
              disabled={isRolling || showDeal || (diceRoll && !charityRoll)}
              className={`btn-primary ${isRolling ? 'dice-rolling' : ''}`}
            >
              <DiceIcon className="w-8 h-8" />
              {isRolling ? 'Rolling...' : 'Roll Dice'}
            </button>
            {diceRoll && !showDeal && !charityRoll && (
              <button onClick={endTurn} className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-2xl font-bold flex items-center gap-2">
                End Turn <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <button onClick={saveGame} className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-2xl font-bold flex items-center gap-2">
              <Save className="w-5 h-5" /> Save
            </button>
          </div>
          <p className="text-lg font-bold text-gray-800">Turn {turnCount} | {currentPlayer?.name}'s Turn</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialFreedomGame;