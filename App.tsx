import React, { useEffect, useState } from "react";
import { BackHandler } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { buildCategories, serializeCategories, StoredCategories } from "./src/game/categories";
import { createRound } from "./src/game/engine";
import { DEFAULT_ROLES } from "./src/game/roles";
import { CategoryState, Player, RoleDef, Round, Settings } from "./src/game/types";
import DiscussionScreen from "./src/screens/DiscussionScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ResultScreen from "./src/screens/ResultScreen";
import RevealScreen from "./src/screens/RevealScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { KEYS, loadJSON, saveJSON } from "./src/storage";
import { PLAYER_COLORS } from "./src/theme";
import { confirmDialog, uid } from "./src/utils";

// Simple state-machine navigation — no navigation library needed for
// a pass-and-play game. New gamemodes plug in as new screen values.
type ScreenName = "home" | "settings" | "reveal" | "discussion" | "result";

const DEFAULT_SETTINGS: Settings = { timerEnabled: false, timerSeconds: 120 };

function defaultPlayers(): Player[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: uid() + i,
    name: `Player ${i + 1}`,
    color: PLAYER_COLORS[i],
    enabled: true,
  }));
}

export default function App() {
  const [screen, setScreen] = useState<ScreenName>("home");
  const [players, setPlayers] = useState<Player[]>(defaultPlayers);
  const [roles, setRoles] = useState<RoleDef[]>(DEFAULT_ROLES);
  const [categories, setCategories] = useState<CategoryState[]>(() => buildCategories());
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [round, setRound] = useState<Round | null>(null);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Only enabled players are dealt into a round.
  const activePlayers = players.filter((p) => p.enabled);

  // ---- load persisted state once ----
  useEffect(() => {
    (async () => {
      const storedPlayers = await loadJSON<Player[] | null>(KEYS.players, null);
      const storedRoles = await loadJSON<RoleDef[] | null>(KEYS.roles, null);
      const storedCategories = await loadJSON<StoredCategories | null>(KEYS.categories, null);
      const storedSettings = await loadJSON<Settings | null>(KEYS.settings, null);
      if (storedPlayers && storedPlayers.length >= 3) {
        setPlayers(storedPlayers.map((p) => ({ ...p, enabled: p.enabled ?? true })));
      }
      if (storedRoles && storedRoles.some((r) => r.kind === "imposter")) {
        // Built-in roles always take name/description/color from the code —
        // only the count comes from storage. Customs load as-is.
        const merged = DEFAULT_ROLES.map((def) => {
          const stored = storedRoles.find((r) => r.id === def.id);
          if (!stored) return def;
          // Older saves used an enabled flag; enabled:false now means count 0.
          let count = stored.enabled === false ? 0 : stored.count;
          if (def.kind === "imposter") count = Math.max(1, count);
          return { ...def, count };
        });
        setRoles([
          ...merged,
          ...storedRoles
            .filter((r) => !r.builtin)
            .map((r) => ({ ...r, count: r.enabled === false ? 0 : r.count, enabled: true })),
        ]);
      }
      setCategories(buildCategories(storedCategories));
      if (storedSettings) setSettings({ ...DEFAULT_SETTINGS, ...storedSettings });
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
    if (loaded) saveJSON(KEYS.categories, serializeCategories(categories));
  }, [categories, loaded]);
  useEffect(() => {
    if (loaded) saveJSON(KEYS.settings, settings);
  }, [settings, loaded]);

  // ---- Android hardware back button ----
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (screen === "home") {
        confirmDialog("Quit IMP?", "Do you want to close the app?", () => BackHandler.exitApp());
      } else if (screen === "settings" || screen === "result") {
        setScreen("home");
      } else {
        confirmDialog("Leave the game?", "The current round will be lost.", () =>
          setScreen("home")
        );
      }
      return true;
    });
    return () => sub.remove();
  }, [screen]);

  const startGame = () => {
    const newRound = createRound(activePlayers, roles, categories, usedWords);
    if (!newRound) return;
    setRound(newRound);
    setUsedWords((prev) =>
      prev.includes(newRound.word) ? [newRound.word] : [...prev, newRound.word]
    );
    setScreen("reveal");
  };

  const renderScreen = () => {
    switch (screen) {
      case "home":
        return (
          <HomeScreen
            players={players}
            setPlayers={setPlayers}
            roles={roles}
            setRoles={setRoles}
            categories={categories}
            setCategories={setCategories}
            onStart={startGame}
            onOpenSettings={() => setScreen("settings")}
          />
        );
      case "settings":
        return (
          <SettingsScreen
            settings={settings}
            onChange={setSettings}
            onBack={() => setScreen("home")}
          />
        );
      case "reveal":
        return round ? (
          <RevealScreen
            players={activePlayers}
            roles={roles}
            round={round}
            onDone={() => setScreen("discussion")}
          />
        ) : null;
      case "discussion":
        return <DiscussionScreen settings={settings} onVote={() => setScreen("result")} />;
      case "result":
        return round ? (
          <ResultScreen
            players={activePlayers}
            roles={roles}
            round={round}
            onNewRound={startGame}
            onBackToMenu={() => setScreen("home")}
          />
        ) : null;
    }
  };

  return <SafeAreaProvider>{renderScreen()}</SafeAreaProvider>;
}
