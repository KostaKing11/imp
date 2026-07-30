import React, { useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Appear from "../../components/Appear";
import AppModal from "../../components/AppModal";
import BigButton from "../../components/BigButton";
import ColorPicker from "../../components/ColorPicker";
import Gradient from "../../components/Gradient";
import PlayerCard from "../../components/PlayerCard";
import Pulse from "../../components/Pulse";
import { QrIcon, SlidersIcon } from "../../components/icons";
import SectionTitle from "../../components/SectionTitle";
import Segmented from "../../components/Segmented";
import {
  CategoryState,
  FakerCategoryState,
  GameMode,
  PairCategoryState,
  RoleDef,
  SpectrumCategoryState,
} from "../../game/types";
import { t, tf } from "../../i18n";
import {
  netMaxPlayers,
  netMinPlayers,
  NetPlayer,
  RoomState,
  TOUR_MODES,
} from "../../net/protocol";
import { alpha, colors, elevation, radius, spacing, type } from "../../theme";
import { confirmDialog } from "../../utils";
import GameSetup from "../setup/GameSetup";
import TournamentSetup from "./TournamentSetup";
import QrModal from "./QrModal";

type Props = {
  state: RoomState;
  isHost: boolean;
  myId: string | null;
  qrPayload: string | null;
  notice: string | null;
  startProblem: "few" | "many" | "content" | null;
  onKick: (playerId: string) => void;
  onStart: () => void;
  onStartTournament: () => void;
  onOpenSettings: () => void;
  onChangeColor: (color: string) => void;
  // host game setup (the same lists the one-phone setup edits)
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
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
  // tournament setup (host only)
  tournament: boolean;
  setTournament: (on: boolean) => void;
  tourModes: Record<string, boolean>;
  setTourModes: (next: Record<string, boolean>) => void;
  tournamentTarget: number;
  setTournamentTarget: (n: number) => void;
};

export default function NetLobby(props: Props) {
  const { state, isHost, myId, qrPayload, notice, startProblem, onKick, onStart } = props;
  const [qrOpen, setQrOpen] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [colorOpen, setColorOpen] = useState(false);

  const players = state.players.filter((p) => p.connected);
  const min = netMinPlayers(state.mode);
  const max = netMaxPlayers(state.mode);

  const problemText =
    startProblem === "few"
      ? tf("needMorePlayers", { n: min })
      : startProblem === "many"
        ? tf("tooManyPlayers", { n: max })
        : startProblem === "content"
          ? t("errNetContent")
          : null;

  const me = players.find((p) => p.id === myId) ?? null;
  // Absent means on, so an untouched setup has every mode in the draw —
  // checking the object for truthy values would have read empty as none.
  const noModesOn = TOUR_MODES.every((m) => props.tourModes[m] === false);

  // Your own chip opens the colour picker; the host's tap on anyone
  // else's is a kick.
  const tapPlayer = (p: NetPlayer) => {
    if (p.id === myId) {
      setColorOpen(true);
      return;
    }
    if (!isHost || p.id === state.hostId) return;
    confirmDialog(t("kickQ"), tf("kickText", { name: p.name }), () => onKick(p.id));
  };

  // Scrolled to the top the code gets a panel of its own; once the list
  // is moving it shrinks into the bar so the room code and the QR are
  // always within reach without eating the screen.
  // The bar only takes over once the title and the panel have actually
  // scrolled behind it — before that it would sit on top of them.
  const barOpacity = scrollY.interpolate({
    inputRange: [70, 120],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <>
      {/* An opaque strip across the top: everything scrolls away behind
          it, and the code plus the QR slide in once they have. It fades
          out along its bottom edge rather than ending in a straight line
          across the light behind the screen. */}
      <View style={styles.headerBar} pointerEvents="none" />
      <View style={styles.headerFade} pointerEvents="none">
        <Gradient from={colors.bg} to={alpha(colors.bg, 0)} angle={1} />
      </View>

      {/* Settings live here, top right, always — not tucked inside the
          room-code panel that scrolls away. */}
      {isHost ? (
        <Pressable onPress={props.onOpenSettings} hitSlop={8} style={styles.settingsButton}>
          <SlidersIcon size={22} color={colors.text} />
        </Pressable>
      ) : null}

      <Animated.View style={[styles.collapsedBar, { opacity: barOpacity }]} pointerEvents="box-none">
        <Text style={styles.collapsedCode}>{state.code}</Text>
        {isHost ? (
          <Pressable onPress={() => setQrOpen(true)} hitSlop={8} style={styles.collapsedQr}>
            <QrIcon size={20} color={colors.text} />
          </Pressable>
        ) : null}
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.area}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        <Text style={styles.heading}>{t("lobbyTitle")}</Text>

        {/* The room code is what everyone else has to type, so it gets a
            panel of its own — code on the left, the QR on the right. */}
        <View style={styles.codeCard}>
          <Gradient from={alpha(colors.accent, 0.26)} to={alpha(colors.party, 0.14)} angle={0.35} />
          <View style={styles.codeText}>
            <Text style={styles.codeLabel}>{t("roomCode")}</Text>
            <Text style={styles.code}>{state.code}</Text>
          </View>
          {/* only the host can hand out a QR — it points at their phone */}
          {isHost ? (
            <View style={styles.codeActions}>
              <Pressable onPress={() => setQrOpen(true)} hitSlop={8} style={styles.qrButton}>
                <QrIcon size={24} color={colors.text} />
              </Pressable>
            </View>
          ) : null}
        </View>

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <SectionTitle hint={`${players.length}/${max}`}>
          {tf("playersCount", { n: players.length })}
        </SectionTitle>
        <View style={styles.playerList}>
          {/* Keyed on the player, so somebody joining rises into the list
              on their own while everyone already in it stays put. */}
          {players.map((p) => (
            <Appear key={p.id} distance={18}>
              <PlayerCard
                name={p.name}
                color={p.color}
                note={p.id === myId ? t("youTag") : null}
                badge={p.id === state.hostId ? t("hostTag") : null}
                onPress={() => tapPlayer(p)}
                right={
                  isHost && p.id !== state.hostId ? (
                    <Text style={[styles.kickMark, { color: colors.textDim }]}>✕</Text>
                  ) : null
                }
              />
            </Appear>
          ))}
        </View>
        <Text style={styles.hint}>
          {isHost && players.length > 1 ? t("kickHint") : t("tapSelfColor")}
        </Text>

        {/* only the host configures the game */}
        {isHost ? (
          <>
            {/* One game, or a run of them with points. Picked the same way
                as everything else in the app. */}
            <SectionTitle>{t("playStyle")}</SectionTitle>
            <Segmented
              value={props.tournament ? "tour" : "single"}
              onChange={(v) => props.setTournament(v === "tour")}
              options={[
                { value: "single", label: t("tourSingleGame") },
                { value: "tour", label: t("tourMode") },
              ]}
            />
          </>
        ) : null}

        {isHost && props.tournament ? (
          <TournamentSetup
            enabled={props.tourModes}
            setEnabled={props.setTourModes}
            target={props.tournamentTarget}
            setTarget={props.setTournamentTarget}
            playerCount={players.length}
            roles={props.roles}
            setRoles={props.setRoles}
            categories={props.categories}
            setCategories={props.setCategories}
            pairCategories={props.pairCategories}
            setPairCategories={props.setPairCategories}
            fakerCategories={props.fakerCategories}
            setFakerCategories={props.setFakerCategories}
            spectrumCategories={props.spectrumCategories}
            setSpectrumCategories={props.setSpectrumCategories}
            skalaTurns={props.skalaTurns}
            setSkalaTurns={props.setSkalaTurns}
          />
        ) : isHost ? (
          <GameSetup
            gameMode={props.gameMode}
            setGameMode={props.setGameMode}
            roles={props.roles}
            setRoles={props.setRoles}
            mafiaRoles={props.mafiaRoles}
            setMafiaRoles={props.setMafiaRoles}
            categories={props.categories}
            setCategories={props.setCategories}
            pairCategories={props.pairCategories}
            setPairCategories={props.setPairCategories}
            fakerCategories={props.fakerCategories}
            setFakerCategories={props.setFakerCategories}
            spectrumCategories={props.spectrumCategories}
            setSpectrumCategories={props.setSpectrumCategories}
            playerCount={players.length}
            skalaTurns={props.skalaTurns}
            setSkalaTurns={props.setSkalaTurns}
            maxRoleCount={Math.max(
              1,
              props.gameMode === "mafia" ? players.length : players.length - 1
            )}
          />
        ) : (
          // Nothing on this screen can move for a player who is not the
          // host, so the one line they do have breathes.
          <Pulse to={1.03} period={1400}>
            <Text style={styles.waiting}>{t("waitingForHost")}</Text>
          </Pulse>
        )}
      </Animated.ScrollView>

      {isHost ? (
        <View style={styles.bottom}>
          {props.tournament
            ? noModesOn && <Text style={styles.error}>{t("tourNoModes")}</Text>
            : problemText && <Text style={styles.error}>{problemText}</Text>}
          {props.tournament ? (
            <BigButton
              label={t("tourStart")}
              disabled={players.length < 2 || noModesOn}
              onPress={props.onStartTournament}
            />
          ) : (
            <BigButton
              label={t("startGameBtn")}
              disabled={startProblem !== null}
              onPress={onStart}
            />
          )}
        </View>
      ) : null}

      <AppModal
        visible={colorOpen}
        title={t("color")}
        onClose={() => setColorOpen(false)}
      >
        <ColorPicker
          value={me?.color ?? "#E03131"}
          taken={players.filter((p) => p.id !== myId).map((p) => p.color)}
          onChange={(color) => {
            props.onChangeColor(color);
            setColorOpen(false);
          }}
        />
      </AppModal>

      <QrModal
        visible={qrOpen}
        payload={qrPayload}
        code={state.code}
        onClose={() => setQrOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  area: { paddingBottom: spacing.md, paddingTop: 46, gap: spacing.xs },
  heading: {
    ...type.title,
    fontSize: 26,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  headerBar: {
    position: "absolute",
    top: -spacing.xs,
    left: -spacing.md,
    right: -spacing.md,
    height: 58,
    backgroundColor: colors.bg,
    zIndex: 3,
  },
  headerFade: {
    position: "absolute",
    top: 58 - spacing.xs,
    left: -spacing.md,
    right: -spacing.md,
    height: 18,
    zIndex: 3,
  },
  settingsButton: {
    position: "absolute",
    top: spacing.sm,
    right: 0,
    zIndex: 5,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  collapsedBar: {
    position: "absolute",
    top: spacing.sm,
    left: 52,
    right: 52,
    height: 40,
    zIndex: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  collapsedCode: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.accent,
    letterSpacing: 4,
    fontVariant: ["tabular-nums"],
  },
  collapsedQr: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  codeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: radius.lg,
    backgroundColor: alpha(colors.card, 0.7),
    borderWidth: 1.5,
    borderColor: colors.accentGlow,
    overflow: "hidden",
    ...elevation.glow(colors.accent),
  },
  codeText: { flex: 1 },
  codeLabel: {
    ...type.eyebrow,
    color: colors.accent,
    opacity: 0.85,
  },
  code: {
    fontSize: 46,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 8,
    fontVariant: ["tabular-nums"],
  },
  codeActions: { flexDirection: "row", gap: spacing.xs },
  qrButton: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: alpha(colors.bg, 0.55),
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  notice: { ...type.caption, fontSize: 14, color: colors.textDim, textAlign: "center" },
  waiting: {
    ...type.caption,
    fontSize: 15,
    color: colors.textDim,
    textAlign: "center",
    paddingVertical: spacing.md,
  },
  hint: { ...type.caption, fontSize: 12, color: colors.textFaint, textAlign: "center" },
  error: { ...type.caption, fontSize: 14, color: colors.danger, textAlign: "center" },
  playerList: { gap: spacing.xs, alignSelf: "stretch" },
  kickMark: { fontSize: 14, fontWeight: "900", opacity: 0.7 },
  bottom: { gap: spacing.xs, paddingBottom: spacing.md },
});
