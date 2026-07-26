import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AppModal from "../../components/AppModal";
import BigButton from "../../components/BigButton";
import ColorPicker from "../../components/ColorPicker";
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
import { colors, radius, spacing } from "../../theme";
import { confirmDialog, textColorFor } from "../../utils";
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

        {/* room code + the little QR button next to it */}
        <Text style={styles.codeLabel}>{t("roomCode")}</Text>
        <View style={styles.codeRow}>
          <Text style={styles.code}>{state.code}</Text>
          {/* only the host can hand out a QR — it points at their phone */}
          {isHost ? (
            <Pressable onPress={() => setQrOpen(true)} hitSlop={10} style={styles.qrButton}>
              <QrIcon size={26} color={colors.textDim} />
            </Pressable>
          ) : null}
          {isHost ? (
            <Pressable
              onPress={props.onOpenSettings}
              hitSlop={10}
              style={styles.qrButton}
            >
              <SlidersIcon size={24} color={colors.textDim} />
            </Pressable>
          ) : null}
        </View>

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <Text style={styles.modeLine}>{modeLabel(state.mode)}</Text>

        <SectionTitle>{tf("playersCount", { n: players.length })}</SectionTitle>
        <View style={styles.playerList}>
          {players.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => tapPlayer(p)}
              style={({ pressed }) => [
                styles.playerChip,
                { backgroundColor: p.color },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.playerName, { color: textColorFor(p.color) }]}>
                {p.name}
                {p.id === state.hostId ? " ★" : ""}
                {p.id === myId ? " •" : ""}
              </Text>
              {isHost && p.id !== state.hostId ? (
                <Text style={[styles.kickMark, { color: textColorFor(p.color) }]}>✕</Text>
              ) : null}
            </Pressable>
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
    fontSize: 26,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  codeLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textDim,
    letterSpacing: 2,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  code: {
    fontSize: 58,
    fontWeight: "900",
    color: colors.accent,
    letterSpacing: 10,
  },
  qrButton: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  notice: { fontSize: 14, color: colors.textDim, textAlign: "center" },
  modeLine: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  hint: { fontSize: 12, color: colors.textDim, textAlign: "center" },
  error: { fontSize: 14, color: colors.danger, textAlign: "center" },
  playerList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    justifyContent: "center",
  },
  playerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  playerName: { fontSize: 16, fontWeight: "800" },
  kickMark: { fontSize: 13, fontWeight: "900", opacity: 0.7 },
  bottom: { gap: spacing.xs, paddingBottom: spacing.md },
});
