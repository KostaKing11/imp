import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AppModal from "../../components/AppModal";
import BigButton from "../../components/BigButton";
import ColorPicker from "../../components/ColorPicker";
import PlayerCard from "../../components/PlayerCard";
import { QrIcon, SlidersIcon } from "../../components/icons";
import SectionTitle from "../../components/SectionTitle";
import {
  CategoryState,
  FakerCategoryState,
  GameMode,
  PairCategoryState,
  RoleDef,
} from "../../game/types";
import { modeLabel, t, tf } from "../../i18n";
import { netMaxPlayers, netMinPlayers, NetPlayer, RoomState } from "../../net/protocol";
import { colors, radius, spacing, type } from "../../theme";
import { confirmDialog } from "../../utils";
import GameSetup from "../setup/GameSetup";
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
};

export default function NetLobby(props: Props) {
  const { state, isHost, myId, qrPayload, notice, startProblem, onKick, onStart } = props;
  const [qrOpen, setQrOpen] = useState(false);
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

  return (
    <>
      <ScrollView contentContainerStyle={styles.area} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>{t("lobbyTitle")}</Text>

        {/* The room code is what everyone else has to type, so it gets a
            panel of its own — code on the left, the host's hand-out
            buttons on the right. */}
        <View style={styles.codeCard}>
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
              <Pressable onPress={props.onOpenSettings} hitSlop={8} style={styles.qrButton}>
                <SlidersIcon size={22} color={colors.text} />
              </Pressable>
            </View>
          ) : null}
        </View>

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <View style={styles.modePill}>
          <Text style={styles.modeLine}>{modeLabel(state.mode)}</Text>
        </View>

        <SectionTitle hint={`${players.length}/${max}`}>
          {tf("playersCount", { n: players.length })}
        </SectionTitle>
        <View style={styles.playerList}>
          {players.map((p) => (
            <PlayerCard
              key={p.id}
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
          ))}
        </View>
        <Text style={styles.hint}>
          {isHost && players.length > 1 ? t("kickHint") : t("tapSelfColor")}
        </Text>

        {/* only the host configures the game */}
        {isHost ? (
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
            maxRoleCount={Math.max(
              1,
              props.gameMode === "mafia" ? players.length : players.length - 1
            )}
          />
        ) : (
          <Text style={styles.notice}>{t("waitingForHost")}</Text>
        )}
      </ScrollView>

      {isHost ? (
        <View style={styles.bottom}>
          {problemText ? <Text style={styles.error}>{problemText}</Text> : null}
          <BigButton
            label={t("startGameBtn")}
            disabled={startProblem !== null}
            onPress={onStart}
          />
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
  area: { paddingBottom: spacing.md, gap: spacing.xs },
  heading: {
    ...type.title,
    fontSize: 26,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  codeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentGlow,
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
    color: colors.accent,
    letterSpacing: 8,
    fontVariant: ["tabular-nums"],
  },
  codeActions: { flexDirection: "row", gap: spacing.xs },
  qrButton: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  notice: { ...type.caption, fontSize: 14, color: colors.textDim, textAlign: "center" },
  modePill: {
    alignSelf: "center",
    marginTop: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.chip,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  modeLine: {
    ...type.caption,
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  hint: { ...type.caption, fontSize: 12, color: colors.textFaint, textAlign: "center" },
  error: { ...type.caption, fontSize: 14, color: colors.danger, textAlign: "center" },
  playerList: { gap: spacing.xs, alignSelf: "stretch" },
  kickMark: { fontSize: 14, fontWeight: "900", opacity: 0.7 },
  bottom: { gap: spacing.xs, paddingBottom: spacing.md },
});
