// =====================================================
// NUR SHAXMAT 100 — Asosiy Ilova (Mobile & Desktop Responsive)
// Mockup dizayniga 100% mos 8 ekranli routing tizimi
// =====================================================

import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './store/gameStore';
import { onlineManager } from './services/onlineService';
import { initAuth } from './services/authService';

// 8 ta Asosiy Ekranlar
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileScreen from './screens/ProfileScreen';
import RulesScreen from './screens/RulesScreen';
import AchievementsScreen from './screens/AchievementsScreen';

// Navigatsiya & Modallar
import BottomNavBar, { TabType } from './components/BottomNavBar';
import PromotionModal from './components/PromotionModal';
import GameOverModal from './components/GameOverModal';
import LeaderboardModal from './components/LeaderboardModal';
import OnlineRoomModal from './components/OnlineRoomModal';
import BotVsBotModal from './components/BotVsBotModal';
import VsAiModal from './components/VsAiModal';

export type ScreenType =
  | 'splash'
  | 'home'
  | 'game'
  | 'settings'
  | 'profile'
  | 'rules'
  | 'achievements';

function AppContent() {
  const { state, dispatch } = useGame();
  const { gameMode, roomCode } = state;

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');
  const [previousScreen, setPreviousScreen] = useState<ScreenType>('home');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [showBotVsBotModal, setShowBotVsBotModal] = useState(false);
  const [showVsAiModal, setShowVsAiModal] = useState(false);
  const [initialRoom, setInitialRoom] = useState<string>('');

  // 2. URL dan ?room=... parametrini tekshirish
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const room = params.get('room');
      if (room) {
        const clean = room.trim().toUpperCase().replace(/^NUR-?/i, '');
        setInitialRoom(clean);
        setShowOnlineModal(true);
        setCurrentScreen('game');
      }
    } catch {}
  }, []);

  // 3. Google Auth sessiyasini kuzatish (OAuth redirectidan qaytish va avto-login)
  useEffect(() => {
    // Agar Google OAuth redirectidan qaytgan bo'lsa
    if (window.location.hash.includes('access_token')) {
      setCurrentScreen('profile');
    }

    const unsub = initAuth((profile) => {
      if (profile.isGoogleLinked) {
        setCurrentScreen('profile');
      }
    });
    return unsub;
  }, []);

  // 2. Onlayn xabarlarni tinglash (Raqib harakatlari, taslim bo'lish, durang)
  useEffect(() => {
    const unsub = onlineManager.addMessageListener((msg) => {
      if (msg.type === 'MOVE') {
        dispatch({ type: 'APPLY_REMOTE_MOVE', move: msg.move });
      } else if (msg.type === 'RESIGN') {
        dispatch({ type: 'REMOTE_RESIGN' });
      } else if (msg.type === 'ACCEPT_DRAW') {
        dispatch({ type: 'REMOTE_DRAW_ACCEPT' });
      }
    });
    return unsub;
  }, [dispatch]);

  const handleBackFromGame = () => {
    if (gameMode === 'online' || roomCode) {
      onlineManager.disconnect();
      dispatch({ type: 'SET_ONLINE_ROOM', roomCode: null, myColor: null });
      dispatch({ type: 'SET_GAME_MODE', mode: 'vsAI' });
    }
    navigateTo('home');
  };

  // Android tizim ortga tugmasi (Back button) va modallarni yopish
  useEffect(() => {
    (window as any).__onAndroidBack = () => {
      if (showOnlineModal) {
        setShowOnlineModal(false);
        onlineManager.disconnect();
        dispatch({ type: 'SET_ONLINE_ROOM', roomCode: null, myColor: null });
        return true;
      }
      if (showLeaderboard) {
        setShowLeaderboard(false);
        return true;
      }
      if (currentScreen === 'game') {
        handleBackFromGame();
        return true;
      }
      if (currentScreen !== 'home') {
        navigateTo('home');
        return true;
      }
      return false;
    };
  }, [currentScreen, showOnlineModal, showLeaderboard, gameMode, roomCode]);

  // Sahifalararo o'tish yordamchisi
  const navigateTo = (screen: ScreenType) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // O'yin rejimlarini boshlash
  const handleStartVsAI = () => {
    setShowVsAiModal(true);
  };

  const handleConfirmStartVsAI = (depth: number, playerColor: 'white' | 'black') => {
    setShowVsAiModal(false);
    dispatch({ type: 'SET_GAME_MODE', mode: 'vsAI' });
    dispatch({ type: 'SET_AI_DEPTH', depth });
    const botColor = playerColor === 'white' ? 'black' : 'white';
    dispatch({ type: 'SET_AI_COLOR', color: botColor });
    dispatch({ type: 'SET_FLIPPED', flipped: playerColor === 'black' });
    dispatch({ type: 'NEW_GAME' });
    navigateTo('game');
  };

  const handleStartLocal = () => {
    dispatch({ type: 'SET_GAME_MODE', mode: 'pvp' });
    dispatch({ type: 'NEW_GAME' });
    navigateTo('game');
  };

  const handleStartBotVsBot = (whiteDepth: number, blackDepth: number, speed: number) => {
    setShowBotVsBotModal(false);
    dispatch({ type: 'SET_GAME_MODE', mode: 'aiVsAi' });
    dispatch({ type: 'SET_AI_VS_AI_CONFIG', whiteDepth, blackDepth, speed });
    dispatch({ type: 'NEW_GAME' });
    navigateTo('game');
  };

  const handleOpenOnline = () => {
    setShowOnlineModal(true);
  };

  // Pastki menyu tab bosilganda
  const handleSelectTab = (tab: TabType) => {
    if (tab === 'home') {
      navigateTo('home');
    } else if (tab === 'leaderboard') {
      setShowLeaderboard(true);
    } else if (tab === 'profile') {
      navigateTo('profile');
    }
  };

  // Faol tab
  const getActiveTab = (): TabType => {
    if (currentScreen === 'profile' || currentScreen === 'achievements') return 'profile';
    return 'home';
  };

  // Pastki menyuni ko'rsatish sharti
  const showBottomNav =
    currentScreen === 'home' ||
    currentScreen === 'profile';

  return (
    <div className="min-h-screen bg-[#262421] text-[#f1f1f1] flex flex-col font-sans select-none">
      {/* ── 1. ASOSIY EKRAN ROUTER ─────────────────────────── */}
      {currentScreen === 'splash' && (
        <SplashScreen onStart={() => navigateTo('home')} />
      )}

      {currentScreen === 'home' && (
        <HomeScreen
          onStartVsAI={handleStartVsAI}
          onStartLocal={handleStartLocal}
          onOpenOnline={handleOpenOnline}
          onOpenBotVsBot={() => setShowBotVsBotModal(true)}
          onOpenRules={() => navigateTo('rules')}
          onOpenStats={() => navigateTo('profile')}
          onOpenSettings={() => navigateTo('settings')}
        />
      )}

      {currentScreen === 'game' && (
        <GameScreen
          onBack={handleBackFromGame}
          onOpenSettings={() => navigateTo('settings')}
        />
      )}

      {currentScreen === 'settings' && (
        <SettingsScreen
          onBack={() => navigateTo(previousScreen || 'home')}
          onOpenRules={() => navigateTo('rules')}
        />
      )}

      {currentScreen === 'profile' && (
        <ProfileScreen
          onBack={() => navigateTo('home')}
          onOpenAchievements={() => navigateTo('achievements')}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenFriends={() => setShowOnlineModal(true)}
          onOpenSettings={() => navigateTo('settings')}
        />
      )}

      {currentScreen === 'rules' && (
        <RulesScreen onBack={() => navigateTo(previousScreen || 'home')} />
      )}

      {currentScreen === 'achievements' && (
        <AchievementsScreen onBack={() => navigateTo('profile')} />
      )}

      {/* ── 2. MOBIL PASTKI MENYU (BOTTOM NAVIGATION) ──────── */}
      {showBottomNav && (
        <BottomNavBar
          activeTab={getActiveTab()}
          onSelectTab={handleSelectTab}
        />
      )}

      {/* ── 3. UMUMIY MODALLAR ──────────────────────────────── */}
      <PromotionModal />
      <GameOverModal />
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
      {showOnlineModal && (
        <OnlineRoomModal
          isOpen={showOnlineModal}
          onClose={() => setShowOnlineModal(false)}
          onStartGame={() => navigateTo('game')}
          initialRoomCode={initialRoom}
        />
      )}
      <BotVsBotModal
        isOpen={showBotVsBotModal}
        onClose={() => setShowBotVsBotModal(false)}
        onStart={handleStartBotVsBot}
        initialWhiteDepth={state.aiWhiteDepth}
        initialBlackDepth={state.aiBlackDepth}
        initialSpeed={state.aiVsAiSpeed}
      />
      <VsAiModal
        isOpen={showVsAiModal}
        onClose={() => setShowVsAiModal(false)}
        onStart={handleConfirmStartVsAI}
        initialDepth={state.aiDepth}
        initialColor={state.isFlipped ? 'black' : 'white'}
      />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
