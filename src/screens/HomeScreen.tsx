import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { HOW_TO_PLAY } from "../../data/howto";
import AppModal from "../components/AppModal";
import BigButton from "../components/BigButton";
import Chip from "../components/Chip";
import ColorPicker from "../components/ColorPicker";
import { SlidersIcon } from "../components/icons";
import Screen from "../components/Screen";
import SectionTitle from "../components/SectionTitle";
import TextField from "../components/TextField";
import { BLEF_PLAYER_COUNT } from "../game/blefEngine";
import { roleSlotCount } from "../game/engine";
import { activeQuestionPool, FAKER_MIN_PLAYERS } from "../game/fakerEngine";
import { activePairPool } from "../game/oddEngine";
import {
  CategoryState,
  FakerCategoryState,
  GameMode,
  PairCategoryState,
  Player,
  RoleDef,
} from "../game/types";
import { getLanguage, t, tf } from "../i18n";
import { warmUpConnection } from "../net/firebase";
import { colors, freeColor, MAX_PLAYERS, spacing } from "../theme";
import { uid } from "../utils";
import PlayerEditor from "./editors/PlayerEditor";
import GameSetup from "./setup/GameSetup";

const MIN_PLAYERS = 3;

export type PlayStyle = "single" | "net";
export type NetMode = "online" | "lan";

type Props = {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  playStyle: PlayStyle;
  setPlayStyle: (style: PlayStyle) => void;
  players: Player[];
  setPlayers: (players: Player[]) => void;
  roles: RoleDef[];
  setRoles: (roles: RoleDef[]) => void;
  mafiaRoles: RoleDef[];
  setMafiaRoles: (roles: RoleDef[]) => void;
  categories: CategoryState[];
  setCategories: (categories: CategoryState[]) => void;
  pairCategories: PairCategoryState[];
  setPairCategories: (categories: PairCategoryState[]) => void;
  fakerCategories: FakerCategoryState[];
  setFakerCategories: (categories: FakerCategoryState[]) => void;
  // local multiplayer identity
  netName: string;
  setNetName: (name: string) => void;
  netColor: string;
  setNetColor: (color: string) => void;
  netMode: NetMode;
  setNetMode: (mode: NetMode) => void;
  // room code the app was opened with (a scanned room link)
  pendingJoinCode: string | null;
  onStart: () => void;
  onHost: () => void;
  onJoin: () => void;
  onOpenSettings: () => void;
};

export default function HomeScreen({
  gameMode,
  setGameMode,
  playStyle,
  setPlayStyle,
  players,
  setPlayers,
  roles,
  setRoles,
  mafiaRoles,
  setMafiaRoles,
  categories,
  setCategories,
  pairCategories,
  setPairCategories,
  fakerCategories,
  setFakerCategories,
  netName,
  setNetName,
  netColor,
  setNetColor,
  netMode,
  setNetMode,
  pendingJoinCode,
  onStart,
  onHost,
  onJoin,
  onOpenSettings,
}: Props) {
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerIsNew, setPlayerIsNew] = useState(false);
  const [howToOpen, setHowToOpen] = useState(false);

  // Get the sign-in out of the way while the player types their name.
  useEffect(() => {
    if (playStyle === "net" && netMode === "online") warmUpConnection();
  }, [playStyle, netMode]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const logoScale = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: [1, 0.64],
    extrapolate: "clamp",
  });

  const net = playStyle === "net";
  // The browser has no raw sockets, so the web version can only use the
  // online (relay) rooms — local Wi-Fi rooms need the installed app.
  const isWeb = Platform.OS === "web";
  const netBlocked = isWeb && netMode === "lan";

  // ---- validation (one-phone play only) ----
  const activePlayers = players.filter((p) => p.enabled);
  const slots = roleSlotCount(roles);
  const mafiaSlots = roleSlotCount(mafiaRoles);
  const enabledWords = categories.filter((c) => c.enabled).flatMap((c) => c.words);
  let startError: string | null = null;
  if (gameMode === "blef" && activePlayers.length !== BLEF_PLAYER_COUNT)
    startError = t("errBlefPlayers");
  else if (gameMode === "blef" && enabledWords.length === 0) startError = t("errNoWords");
  else if (gameMode === "faker" && activePlayers.length < FAKER_MIN_PLAYERS)
    startError = t("errMinPlayers");
  else if (gameMode === "faker" && activeQuestionPool(fakerCategories).length === 0)
    startError = t("errNoQuestions");
  else if (gameMode !== "blef" && activePlayers.length < MIN_PLAYERS)
    startError = t("errMinPlayers");
  else if (gameMode === "imp" && slots > activePlayers.length - 1)
    startError = tf("errTooManyRoles", { n: activePlayers.length });
  else if (gameMode === "imp" && enabledWords.length === 0) startError = t("errNoWords");
  else if (gameMode === "odd" && activePairPool(pairCategories).length === 0)
    startError = t("errNoPairs");
  else if (gameMode === "mafia" && mafiaSlots > activePlayers.length)
    startError = tf("errTooManyRoles", { n: activePlayers.length });

  // ---- players ----
  const addPlayer = () => {
    setEditingPlayer({
      id: uid(),
      name: tf("playerN", { n: players.length + 1 }),
      color: freeColor(players.map((p) => p.color)),
      enabled: true,
    });
    setPlayerIsNew(true);
  };

  const savePlayer = (p: Player) => {
    if (playerIsNew) setPlayers([...players, p]);
    else setPlayers(players.map((x) => (x.id === p.id ? p : x)));
    setEditingPlayer(null);
  };

  const togglePlayer = (id: string) => {
    setPlayers(players.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  };

  const howTos = HOW_TO_PLAY[getLanguage()];
  const howToText = howTos[gameMode];

  const playersSection = (
    <>
      <SectionTitle>{t("players")}</SectionTitle>
      <View style={styles.chipWrap}>
        {players.map((p) => (
          <Chip
            key={p.id}
            label={p.name}
            bg={p.color}
            active={p.enabled}
            onPress={() => togglePlayer(p.id)}
            onLongPress={() => {
              setEditingPlayer(p);
              setPlayerIsNew(false);
            }}
          />
        ))}
        {players.length < MAX_PLAYERS ? <Chip label="＋" onPress={addPlayer} /> : null}
      </View>
    </>
  );

  return (
    <Screen>
      {/* fixed header: ? — logo — settings */}
      <View style={styles.topBar}>
        <Pressable style={styles.iconButton} onPress={() => setHowToOpen(true)} hitSlop={8}>
          <Text style={styles.questionMark}>?</Text>
        </Pressable>
        {/* pointerEvents none so the wide (mostly-transparent) logo box
            never swallows taps meant for the ? / settings buttons. */}
        <Animated.View
          style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}
          pointerEvents="none"
        >
          <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        </Animated.View>
        <Pressable style={styles.iconButton} onPress={onOpenSettings} hitSlop={8}>
          <SlidersIcon size={22} color={colors.textDim} />
        </Pressable>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        {/* how you're playing: everyone around one phone, or each on their own */}
        <SectionTitle>{t("playStyle")}</SectionTitle>
        <View style={styles.chipWrap}>
          <Chip
            label={t("onePhone")}
            active={!net}
            onPress={() => setPlayStyle("single")}
          />
          <Chip
            label={t("localMultiplayer")}
            active={net}
            onPress={() => setPlayStyle("net")}
          />
        </View>

        {net ? (
          // Local multiplayer: no roster, no categories here — the host
          // sets all that up inside the room.
          <View style={styles.netBox}>
            {/* over the internet (works with iPhones) or straight over
                the local Wi-Fi (no internet, installed app only) */}
            <View style={styles.chipWrap}>
              <Chip
                label={t("netModeOnline")}
                active={netMode === "online"}
                onPress={() => setNetMode("online")}
              />
              <Chip
                label={t("netModeLan")}
                active={netMode === "lan"}
                onPress={() => setNetMode("lan")}
              />
            </View>

            {netBlocked ? (
              <Text style={styles.netBlocked}>{t("lanOnlyOnApp")}</Text>
            ) : (
              <>
                <TextField
                  label={t("yourName")}
                  value={netName}
                  onChangeText={setNetName}
                  placeholder="…"
                  autoCapitalize="words"
                />
                <ColorPicker value={netColor} onChange={setNetColor} />
                <Text style={styles.netHint}>{t("colorMayChange")}</Text>
                {pendingJoinCode ? (
                  <Text style={styles.netJoining}>
                    {tf("joiningRoom", { code: pendingJoinCode })}
                  </Text>
                ) : null}
              </>
            )}
          </View>
        ) : (
          <GameSetup
            gameMode={gameMode}
            setGameMode={setGameMode}
            roles={roles}
            setRoles={setRoles}
            mafiaRoles={mafiaRoles}
            setMafiaRoles={setMafiaRoles}
            categories={categories}
            setCategories={setCategories}
            pairCategories={pairCategories}
            setPairCategories={setPairCategories}
            fakerCategories={fakerCategories}
            setFakerCategories={setFakerCategories}
            maxRoleCount={
              gameMode === "mafia" ? activePlayers.length : activePlayers.length - 1
            }
            middleSlot={playersSection}
          />
        )}
      </Animated.ScrollView>

      {/* fixed bottom: start, or host / join */}
      <View style={styles.startArea}>
        {net ? (
          <View style={styles.netButtons}>
            <View style={styles.netButton}>
              <BigButton
                label={t("hostGame")}
                onPress={onHost}
                disabled={netBlocked || netName.trim().length === 0}
              />
            </View>
            <View style={styles.netButton}>
              <BigButton
                label={t("joinGame")}
                variant="secondary"
                onPress={onJoin}
                disabled={netBlocked || netName.trim().length === 0}
              />
            </View>
          </View>
        ) : (
          <>
            {startError ? <Text style={styles.startError}>{startError}</Text> : null}
            <BigButton label={t("start")} onPress={onStart} disabled={startError !== null} />
          </>
        )}
      </View>

      {/* pop-ups */}
      <PlayerEditor
        visible={editingPlayer !== null}
        player={editingPlayer}
        isNew={playerIsNew}
        canDelete={players.length > MIN_PLAYERS}
        takenColors={players.filter((p) => p.id !== editingPlayer?.id).map((p) => p.color)}
        onSave={savePlayer}
        onDelete={(id) => {
          setPlayers(players.filter((p) => p.id !== id));
          setEditingPlayer(null);
        }}
        onClose={() => setEditingPlayer(null)}
      />
      <AppModal visible={howToOpen} title={t("howToPlay")} onClose={() => setHowToOpen(false)}>
        <Text style={styles.howToText}>{`${howToText}\n\n${t("howToNet")}`}</Text>
      </AppModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  questionMark: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textDim,
  },
  logoWrap: {
    alignItems: "center",
  },
  logo: {
    // matches the artwork's 396x252 aspect
    width: 140,
    height: 89,
  },
  scroll: {
    paddingBottom: spacing.md,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    justifyContent: "center",
  },
  netBox: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  netHint: {
    fontSize: 12,
    color: colors.textDim,
    textAlign: "center",
  },
  netJoining: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.accent,
    textAlign: "center",
  },
  netBlocked: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textDim,
    textAlign: "center",
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
  },
  netButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  netButton: {
    flex: 1,
  },
  startArea: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  startError: {
    fontSize: 14,
    color: colors.danger,
    textAlign: "center",
  },
  howToText: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.text,
  },
});
