import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { HOW_TO_PLAY } from "../../data/howto";
import AppModal from "../components/AppModal";
import Appear from "../components/Appear";
import BigButton from "../components/BigButton";
import Chip from "../components/Chip";
import ColorPicker from "../components/ColorPicker";
import { SlidersIcon } from "../components/icons";
import Pop from "../components/Pop";
import Pulse from "../components/Pulse";
import Screen from "../components/Screen";
import SectionTitle from "../components/SectionTitle";
import Segmented from "../components/Segmented";
import TextField from "../components/TextField";
import { usePressScale } from "../components/usePressScale";
import { BLEF_PLAYER_COUNT } from "../game/blefEngine";
import { roleSlotCount } from "../game/engine";
import { activeQuestionPool, FAKER_MIN_PLAYERS } from "../game/fakerEngine";
import { activePairPool } from "../game/oddEngine";
import { activeSpectrumPool } from "../game/skalaEngine";
import {
  CategoryState,
  FakerCategoryState,
  GameMode,
  PairCategoryState,
  Player,
  RoleDef,
  SpectrumCategoryState,
} from "../game/types";
import { getLanguage, t, tf } from "../i18n";
import { warmUpConnection } from "../net/firebase";
import {
  alpha,
  colors,
  freeColor,
  MAX_PLAYERS,
  modeTint,
  radius,
  spacing,
  type,
} from "../theme";
import { uid } from "../utils";
import PlayerEditor from "./editors/PlayerEditor";
import GameSetup from "./setup/GameSetup";

const MIN_PLAYERS = 3;

// Height of the gradient that hides the scroll under the Start button.
const FADE_HEIGHT = 44;

// The round ? / settings buttons in the header. Their own component so
// each gets its own press spring — the app's tap feel should not stop at
// the things that look like buttons.
function IconButton({
  onPress,
  children,
  label,
}: {
  onPress: () => void;
  children: React.ReactNode;
  label: string;
}) {
  const press = usePressScale(0.88);
  return (
    <Animated.View style={press.style}>
      <Pressable
        style={styles.iconButton}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

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
  spectrumCategories: SpectrumCategoryState[];
  setSpectrumCategories: (categories: SpectrumCategoryState[]) => void;
  skalaTurns: number;
  setSkalaTurns: (turns: number) => void;
  // local multiplayer identity
  netName: string;
  setNetName: (name: string) => void;
  netColor: string;
  setNetColor: (color: string) => void;
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
  spectrumCategories,
  setSpectrumCategories,
  skalaTurns,
  setSkalaTurns,
  netName,
  setNetName,
  netColor,
  setNetColor,
  pendingJoinCode,
  onStart,
  onHost,
  onJoin,
  onOpenSettings,
}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerIsNew, setPlayerIsNew] = useState(false);
  const [howToOpen, setHowToOpen] = useState(false);

  // Get the sign-in out of the way while the player types their name.
  useEffect(() => {
    if (playStyle === "net") warmUpConnection();
  }, [playStyle]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const logoScale = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: [1, 0.64],
    extrapolate: "clamp",
  });
  // The header only draws its hairline once something has scrolled under
  // it — at rest the top of the screen stays open.
  const headerLine = scrollY.interpolate({
    inputRange: [0, 24],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const net = playStyle === "net";
  // The browser has no raw sockets, so the web version can only use the
  // online (relay) rooms — local Wi-Fi rooms need the installed app.
  const isWeb = Platform.OS === "web";

  // ---- validation (one-phone play only) ----
  const activePlayers = players.filter((p) => p.enabled);
  const slots = roleSlotCount(roles);
  const mafiaSlots = roleSlotCount(mafiaRoles);
  const enabledWords = categories.filter((c) => c.enabled).flatMap((c) => c.words);
  // Skala and Uskladi se are the only modes that work with two people
  // and scale all the way up, so they get their own floor.
  const twoPlayerMode = gameMode === "skala" || gameMode === "sync";
  let startError: string | null = null;
  if (gameMode === "blef" && activePlayers.length !== BLEF_PLAYER_COUNT)
    startError = t("errBlefPlayers");
  else if (gameMode === "blef" && enabledWords.length === 0) startError = t("errNoWords");
  else if (gameMode === "faker" && activePlayers.length < FAKER_MIN_PLAYERS)
    startError = t("errMinPlayers");
  else if (gameMode === "faker" && activeQuestionPool(fakerCategories).length === 0)
    startError = t("errNoQuestions");
  else if (twoPlayerMode && activePlayers.length < 2) startError = t("errTwoPlayers");
  else if (gameMode === "skala" && activeSpectrumPool(spectrumCategories).length === 0)
    startError = t("errNoSpectrums");
  else if (gameMode === "sync" && enabledWords.length === 0) startError = t("errNoWords");
  else if (!twoPlayerMode && gameMode !== "blef" && activePlayers.length < MIN_PLAYERS)
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
      <SectionTitle tone={modeTint(gameMode)} hint={`${activePlayers.length}/${players.length}`}>
        {t("players")}
      </SectionTitle>
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
        {players.length < MAX_PLAYERS ? <Chip label="＋" add onPress={addPlayer} /> : null}
      </View>
    </>
  );

  return (
    // The light behind the home screen is the colour of whatever mode is
    // picked, so choosing a game repaints the room before it starts.
    <Screen glow={net ? colors.accent : modeTint(gameMode)}>
      {/* fixed header: ? — logo — settings */}
      <View style={styles.topBar}>
        <IconButton onPress={() => setHowToOpen(true)} label={t("howToPlay")}>
          <Text style={styles.questionMark}>?</Text>
        </IconButton>
        {/* pointerEvents none so the wide (mostly-transparent) logo box
            never swallows taps meant for the ? / settings buttons. */}
        <Animated.View
          style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}
          pointerEvents="none"
        >
          <Pop from={0.7}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Pop>
        </Animated.View>
        <IconButton onPress={onOpenSettings} label={t("settings")}>
          <SlidersIcon size={22} color={colors.textDim} />
        </IconButton>
      </View>
      <Animated.View style={[styles.headerLine, { opacity: headerLine }]} pointerEvents="none" />

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
        <SectionTitle first>{t("playStyle")}</SectionTitle>
        <Segmented
          value={playStyle}
          onChange={setPlayStyle}
          options={[
            { value: "single", label: t("onePhone") },
            { value: "net", label: t("localMultiplayer") },
          ]}
        />
        {/* "Local" and "Online" are short enough to fit but say nothing
            on their own, so the line underneath says which is which. */}
        <Text style={styles.styleWhat}>
          {net ? t("localMultiplayerWhat") : t("onePhoneWhat")}
        </Text>

        {net ? (
          // Local multiplayer: no roster, no categories here — the host
          // sets all that up inside the room.
          <View style={styles.netBox}>
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
              // It breathes because it is a "hang on" — a still pill
              // reads as a message that has already finished.
              <Pulse style={styles.netJoining}>
                <View style={styles.netJoiningPill}>
                  <Text style={styles.netJoiningText}>
                    {tf("joiningRoom", { code: pendingJoinCode })}
                  </Text>
                </View>
              </Pulse>
            ) : null}
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
            spectrumCategories={spectrumCategories}
            setSpectrumCategories={setSpectrumCategories}
            playerCount={activePlayers.length}
            skalaTurns={skalaTurns}
            setSkalaTurns={setSkalaTurns}
            maxRoleCount={
              gameMode === "mafia" ? activePlayers.length : activePlayers.length - 1
            }
            middleSlot={playersSection}
          />
        )}
      </Animated.ScrollView>

      {/* fixed bottom: start, or host / join. The gradient above it lets
          the list scroll away under the button instead of colliding. */}
      <View style={styles.startArea}>
        <View style={[styles.fade, { width: windowWidth }]} pointerEvents="none">
          <Svg width={windowWidth} height={FADE_HEIGHT}>
            <Defs>
              <LinearGradient id="startFade" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.bg} stopOpacity={0} />
                <Stop offset="1" stopColor={colors.bg} stopOpacity={1} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width={windowWidth} height={FADE_HEIGHT} fill="url(#startFade)" />
          </Svg>
        </View>

        {net ? (
          <View style={styles.netButtons}>
            <BigButton
              style={styles.netButton}
              label={t("hostGame")}
              onPress={onHost}
              disabled={netName.trim().length === 0}
            />
            <BigButton
              style={styles.netButton}
              label={t("joinGame")}
              variant="secondary"
              onPress={onJoin}
              disabled={netName.trim().length === 0}
            />
          </View>
        ) : (
          <>
            {startError ? (
              // Keyed on the message so a different reason re-plays the
              // entrance instead of silently swapping the words.
              <Appear key={startError} distance={8} style={styles.startErrorWrap}>
                <View style={styles.startError}>
                  <Text style={styles.startErrorText}>{startError}</Text>
                </View>
              </Appear>
            ) : null}
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
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: alpha(colors.card, 0.8),
    alignItems: "center",
    justifyContent: "center",
  },
  questionMark: {
    fontSize: 21,
    fontWeight: "900",
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
  headerLine: {
    height: 1,
    marginTop: spacing.xs,
    marginHorizontal: -spacing.md,
    backgroundColor: colors.borderSoft,
  },
  scroll: {
    paddingBottom: spacing.lg,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs + 2,
  },
  styleWhat: {
    ...type.caption,
    fontSize: 13,
    color: colors.textFaint,
    textAlign: "center",
    paddingTop: spacing.xs,
  },
  netBox: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  netHint: {
    ...type.caption,
    fontSize: 12,
    color: colors.textFaint,
    textAlign: "center",
  },
  netJoining: {
    alignSelf: "center",
  },
  netJoiningPill: {
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm + 2,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentGlow,
  },
  netJoiningText: {
    ...type.caption,
    fontSize: 14,
    color: colors.accent,
    textAlign: "center",
  },
  netBlocked: {
    ...type.body,
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  // Sits above the buttons and reaches up into the scroll area. Placed
  // off the top edge of the button area rather than with bottom:"100%",
  // which react-native-web resolves against the wrong box.
  fade: {
    position: "absolute",
    left: -spacing.md,
    top: -FADE_HEIGHT,
    height: FADE_HEIGHT,
  },
  startErrorWrap: {
    alignSelf: "center",
  },
  startError: {
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: spacing.sm + 2,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: alpha(colors.danger, 0.35),
  },
  startErrorText: {
    ...type.caption,
    fontSize: 13,
    color: colors.danger,
    textAlign: "center",
  },
  howToText: {
    ...type.body,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textDim,
  },
});
