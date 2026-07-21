import React, { useEffect, useState } from "react";
import { BackHandler } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { buildCategories, serializeCategories, StoredCategories } from "./src/game/categories";
import { createRound } from "./src/game/engine";
import { createMafiaRound } from "./src/game/mafiaEngine";
import {
  buildPairCategories,
  createOddRound,
  serializePairCategories,
  StoredPairCategories,
} from "./src/game/oddEngine";
import { DEFAULT_MAFIA_ROLES, DEFAULT_ROLES } from "./src/game/roles";
import {
  CategoryState,
  GameMode,
  MafiaRound,
  OddRound,
  PairCategoryState,
  Player,
  RoleDef,
  Round,
  Settings,
} from "./src/game/types";
import { getLanguage, Language, setLanguage, t, tf } from "./src/i18n";
import DiscussionScreen from "./src/screens/DiscussionScreen";
import HomeScreen from "./src/screens/HomeScreen";
import MafiaResultScreen from "./src/screens/MafiaResultScreen";
import MafiaRevealScreen from "./src/screens/MafiaRevealScreen";
import OddResultScreen from "./src/screens/OddResultScreen";
import OddRevealScreen from "./src/screens/OddRevealScreen";
import ResultScreen from "./src/screens/ResultScreen";
import RevealScreen from "./src/screens/RevealScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { KEYS, loadJSON, saveJSON } from "./src/storage";
import { PLAYER_COLORS } from "./src/theme";
import { confirmDialog, uid } from "./src/utils";

// Simple state-machine navigation — no navigation library needed for
// a pass-and-play game. Mafia skips "discussion" (it's played out loud).
type ScreenName = "home" | "settings" | "reveal" | "discussion" | "result";

const DEFAULT_SETTINGS: Settings = {
  impTimer: { enabled: false, seconds: 120 },
  oddTimer: { enabled: false, seconds: 120 },
};

function defaultPlayers(): Player[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: uid() + i,
    name: tf("playerN", { n: i + 1 }),
    color: PLAYER_COLORS[i],
    enabled: true,
  }));
}

// Built-in roles always take name/description/color/behavior from the
// code — only the count survives from storage. Customs load as-is.
function mergeRoles(defaults: RoleDef[], stored: RoleDef[] | null, minOneKind: string): RoleDef[] {
  if (!stored || !stored.some((r) => r.kind === minOneKind)) return defaults;
  const merged = defaults.map((def) => {
    const s = stored.find((r) => r.id === def.id);
    if (!s) return def;
    // Very old saves used an enabled flag; enabled:false now means count 0.
    let count = s.enabled === false ? 0 : s.count;
    if (def.kind === minOneKind) count = Math.max(1, count);
    return { ...def, count };
  });
  return [
    ...merged,
    ...stored
      .filter((r) => !r.builtin)
      .map((r) => ({ ...r, count: r.enabled === false ? 0 : r.count, enabled: true })),
  ];
}

export default function App() {
  const [screen, setScreen] = useState<ScreenName>("home");
  const [gameMode, setGameMode] = useState<GameMode>("imp");
  const [language, setLanguageState] = useState<Language>("en");
  const [players, setPlayers] = useState<Player[]>(defaultPlayers);
  const [roles, setRoles] = useState<RoleDef[]>(DEFAULT_ROLES);
  const [mafiaRoles, setMafiaRoles] = useState<RoleDef[]>(DEFAULT_MAFIA_ROLES);
  const [categories, setCategories] = useState<CategoryState[]>(() => buildCategories());
  const [pairCategories, setPairCategories] = useState<PairCategoryState[]>(() =>
    buildPairCategories()
  );
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [round, setRound] = useState<Round | null>(null);
  const [oddRound, setOddRound] = useState<OddRound | null>(null);
  const [mafiaRound, setMafiaRound] = useState<MafiaRound | null>(null);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [usedPairs, setUsedPairs] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Only enabled players are dealt into a round.
  const activePlayers = players.filter((p) => p.enabled);

  // ---- load persisted state once ----
  useEffect(() => {
    (async () => {
      const storedPlayers = await loadJSON<Player[] | null>(KEYS.players, null);
      const storedRoles = await loadJSON<RoleDef[] | null>(KEYS.roles, null);
      const storedMafiaRoles = await loadJSON<RoleDef[] | null>(KEYS.mafiaRoles, null);
      const storedCategories = await loadJSON<StoredCategories | null>(KEYS.categories, null);
      const storedSettings = await loadJSON<Settings | null>(KEYS.settings, null);
      const storedMode = await loadJSON<GameMode | null>(KEYS.mode, null);
      const storedPairCategories = await loadJSON<
        StoredPairCategories | Record<string, boolean> | null
      >(KEYS.pairCategories, null);
      const storedLang = await loadJSON<Language | null>(KEYS.language, null);
      // Set the language FIRST so category sets + default names match it.
      const lang: Language = storedLang === "sr" ? "sr" : "en";
      setLanguage(lang);
      setLanguageState(lang);
      if (storedPlayers && storedPlayers.length >= 3) {
        setPlayers(storedPlayers.map((p) => ({ ...p, enabled: p.enabled ?? true })));
      } else {
        setPlayers(defaultPlayers()); // regenerate with correct language names
      }
      setRoles(mergeRoles(DEFAULT_ROLES, storedRoles, "imposter"));
      setMafiaRoles(mergeRoles(DEFAULT_MAFIA_ROLES, storedMafiaRoles, "mafia"));
      setCategories(buildCategories(storedCategories, lang));
      setPairCategories(buildPairCategories(storedPairCategories, lang));
      if (storedSettings) {
        // Older saves had a single timer — apply it to both modes.
        const legacy = storedSettings as unknown as { timerEnabled?: boolean; timerSeconds?: number };
        if (storedSettings.impTimer && storedSettings.oddTimer) {
          setSettings(storedSettings);
        } else if (typeof legacy.timerEnabled === "boolean") {
          const migrated = { enabled: legacy.timerEnabled, seconds: legacy.timerSeconds ?? 120 };
          setSettings({ impTimer: migrated, oddTimer: { ...migrated } });
        }
      }
      if (storedMode === "imp" || storedMode === "odd" || storedMode === "mafia") {
        setGameMode(storedMode);
      }
      setLoaded(true);
    })();
  }, []);

  // ---- save on change (after initial load) ----
  useEffect(() => {
    if (loaded) saveJSON(KEYS.players, players);
  }, [players, loaded]);
  useEffect(() => {
    if (loaded) saveJSON(KEYS.roles, roles);
  }, [roles, loaded]);
  useEffect(() => {
    if (loaded) saveJSON(KEYS.mafiaRoles, mafiaRoles);
  }, [mafiaRoles, loaded]);
  useEffect(() => {
    if (loaded) saveJSON(KEYS.categories, serializeCategories(categories));
  }, [categories, loaded]);
  useEffect(() => {
    if (loaded) saveJSON(KEYS.pairCategories, serializePairCategories(pairCategories));
  }, [pairCategories, loaded]);
  useEffect(() => {
    if (loaded) saveJSON(KEYS.settings, settings);
  }, [settings, loaded]);
  useEffect(() => {
    if (loaded) saveJSON(KEYS.mode, gameMode);
  }, [gameMode, loaded]);
  useEffect(() => {
    if (loaded) saveJSON(KEYS.language, language);
  }, [language, loaded]);

  // Switching language swaps in that language's built-in category set,
  // keeping the user's custom categories and enabled flags.
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    setLanguageState(lang);
    setCategories((prev) => buildCategories(serializeCategories(prev), lang));
    setPairCategories((prev) => buildPairCategories(serializePairCategories(prev), lang));
  };

  const leaveGame = () => {
    // Clear round state so nothing stale leaks into the next game.
    setRound(null);
    setOddRound(null);
    setMafiaRound(null);
    setScreen("home");
  };

  const requestLeave = () => {
    confirmDialog(t("leaveGameQ"), t("leaveGameText"), leaveGame);
  };

  // ---- Android hardware back button ----
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (screen === "home") {
        confirmDialog(t("quitQ"), t("quitText"), () => BackHandler.exitApp());
      } else if (screen === "settings") {
        setScreen("home");
      } else if (screen === "result") {
        leaveGame();
      } else {
        requestLeave();
      }
      return true;
    });
    return () => sub.remove();
  }, [screen]);

  const startGame = () => {
    if (gameMode === "imp") {
      const newRound = createRound(activePlayers, roles, categories, usedWords);
      if (!newRound) return;
      setRound(newRound);
      setUsedWords((prev) =>
        prev.includes(newRound.word) ? [newRound.word] : [...prev, newRound.word]
      );
    } else if (gameMode === "odd") {
      const newRound = createOddRound(activePlayers, pairCategories, usedPairs);
      if (!newRound) return;
      setOddRound(newRound);
      setUsedPairs((prev) =>
        prev.includes(newRound.pairId) ? [newRound.pairId] : [...prev, newRound.pairId]
      );
    } else {
      const newRound = createMafiaRound(activePlayers, mafiaRoles);
      if (!newRound) return;
      setMafiaRound(newRound);
    }
    setScreen("reveal");
  };

  const renderScreen = () => {
    switch (screen) {
      case "home":
        return (
          <HomeScreen
            gameMode={gameMode}
            setGameMode={setGameMode}
            players={players}
            setPlayers={setPlayers}
            roles={roles}
            setRoles={setRoles}
            mafiaRoles={mafiaRoles}
            setMafiaRoles={setMafiaRoles}
            categories={categories}
            setCategories={setCategories}
            pairCategories={pairCategories}
            setPairCategories={setPairCategories}
            onStart={startGame}
            onOpenSettings={() => setScreen("settings")}
          />
        );
      case "settings":
        return (
          <SettingsScreen
            settings={settings}
            onChange={setSettings}
            language={language}
            onLanguageChange={changeLanguage}
            onBack={() => setScreen("home")}
          />
        );
      case "reveal":
        if (gameMode === "odd") {
          return oddRound ? (
            <OddRevealScreen
              players={activePlayers}
              round={oddRound}
              onDone={() => setScreen("discussion")}
              onLeave={requestLeave}
            />
          ) : null;
        }
        if (gameMode === "mafia") {
          return mafiaRound ? (
            <MafiaRevealScreen
              players={activePlayers}
              roles={mafiaRoles}
              round={mafiaRound}
              onDone={() => setScreen("result")}
              onLeave={requestLeave}
            />
          ) : null;
        }
        return round ? (
          <RevealScreen
            players={activePlayers}
            roles={roles}
            round={round}
            onDone={() => setScreen("discussion")}
            onLeave={requestLeave}
          />
        ) : null;
      case "discussion": {
        const timer = gameMode === "odd" ? settings.oddTimer : settings.impTimer;
        return (
          <DiscussionScreen
            timerEnabled={timer.enabled}
            timerSeconds={timer.seconds}
            players={activePlayers}
            instructions={gameMode === "odd" ? t("discussionInstrOdd") : undefined}
            onVote={() => setScreen("result")}
          />
        );
      }
      case "result":
        if (gameMode === "odd") {
          return oddRound ? (
            <OddResultScreen
              players={activePlayers}
              round={oddRound}
              onNewRound={startGame}
              onBackToMenu={leaveGame}
            />
          ) : null;
        }
        if (gameMode === "mafia") {
          return mafiaRound ? (
            <MafiaResultScreen
              players={activePlayers}
              roles={mafiaRoles}
              round={mafiaRound}
              onNewRound={startGame}
              onBackToMenu={leaveGame}
            />
          ) : null;
        }
        return round ? (
          <ResultScreen
            players={activePlayers}
            roles={roles}
            round={round}
            onNewRound={startGame}
            onBackToMenu={leaveGame}
          />
        ) : null;
    }
  };

  // Keep the i18n module in sync with state on every render (survives
  // Fast Refresh, which can reset the module-level language back to "en").
  if (getLanguage() !== language) setLanguage(language);

  return <SafeAreaProvider>{renderScreen()}</SafeAreaProvider>;
}
