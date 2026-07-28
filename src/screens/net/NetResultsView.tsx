import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import BigButton from "../../components/BigButton";
import PlayerCard from "../../components/PlayerCard";
import { t, tf } from "../../i18n";
import { NetPlayer, NetResults, RoomState } from "../../net/protocol";
import { colors, radius, spacing } from "../../theme";
import { capitalize, textColorFor } from "../../utils";

type Props = {
  state: RoomState;
  results: NetResults;
  isHost: boolean;
  onNewRound: () => void;
  onBackToLobby: () => void;
  onLeave: () => void;
};

function outcomeText(r: NetResults): string | null {
  if (r.mode === "imp") {
    return r.outcome === "caught"
      ? t("impCaught")
      : r.outcome === "jester"
        ? t("impJester")
        : r.outcome === "tie"
          ? t("impTie")
          : t("impEscaped");
  }
  if (r.mode === "odd") {
    return r.outcome === "caught"
      ? t("oddCaught")
      : r.outcome === "tie"
        ? t("oddTie")
        : t("oddEscaped");
  }
  if (r.mode === "faker") {
    return r.outcome === "caught"
      ? t("fakerCaughtText")
      : r.outcome === "tie"
        ? t("fakerVoteTie")
        : t("fakerEscapedText");
  }
  return null;
}

export default function NetResultsView({
  state,
  results,
  isHost,
  onNewRound,
  onBackToLobby,
  onLeave,
}: Props) {
  const players = state.players;
  const byId = (id: string | null | undefined): NetPlayer | undefined =>
    players.find((p) => p.id === id);
  const roundPlayers = players.filter((p) => p.inRound);
  const outcome = outcomeText(results);

  const votedOut = byId(results.votedOutId);
  const target = byId(results.targetId);

  const voteRows =
    results.mode === "mafia" || results.mode === "blef" ? null : (
      <>
        <Text style={styles.sectionLabel}>{t("fakerVotesLabel")}</Text>
        {[...roundPlayers]
          .sort((a, b) => (results.counts[b.id] ?? 0) - (results.counts[a.id] ?? 0))
          .map((p) => (
            <PlayerCard
              key={p.id}
              name={p.name}
              color={p.color}
              right={<Text style={[styles.voteCount, { color: p.color }]}>{results.counts[p.id] ?? 0}</Text>}
            />
          ))}
      </>
    );

  return (
    <>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {outcome ? <Text style={styles.outcome}>{outcome}</Text> : null}

        {/* the secret content of the round */}
        {results.word ? (
          <View style={styles.wordCard}>
            <Text style={styles.wordLabel}>{t("theWordWas")}</Text>
            <Text style={styles.word}>{results.word}</Text>
          </View>
        ) : null}

        {results.mode === "odd" ? (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t("everyoneHad")}</Text>
              <Text style={styles.infoValue}>{results.mainWord}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {tf("playerHad", { name: target?.name ?? "" })}
              </Text>
              <Text style={[styles.infoValue, { color: colors.oddYellow }]}>{results.oddWord}</Text>
            </View>
          </View>
        ) : null}

        {/* who was who */}
        {results.mode === "imp" || results.mode === "odd" || results.mode === "faker" ? (
          <>
            <Text style={styles.revealLabel}>
              {results.mode === "imp"
                ? t("imposterWas")
                : results.mode === "odd"
                  ? t("oddWas")
                  : t("fakerWas")}
            </Text>
            {(results.mode === "imp"
              ? (results.roles ?? []).filter((r) => r.kind === "imposter").map((r) => byId(r.playerId))
              : [target]
            ).map((p, i) =>
              p ? (
                <Text
                  key={p.id}
                  style={[styles.grandName, { color: p.color }]}
                  numberOfLines={1}
                >
                  {p.name}
                </Text>
              ) : (
                <Text key={i} style={styles.notice}>
                  —
                </Text>
              )
            )}
          </>
        ) : null}

        {results.mode === "faker" ? (
          <View style={styles.infoCard}>
            <Text style={styles.smallLabel}>{t("fakerMainQLabel")}</Text>
            <Text style={styles.qText}>{results.mainQuestion}</Text>
            <View style={styles.divider} />
            <Text style={styles.smallLabel}>{t("fakerOddQLabel")}</Text>
            <Text style={[styles.qText, { color: colors.word }]}>{results.oddQuestion}</Text>
          </View>
        ) : null}

        {/* Mafia: the whole cast, evil first */}
        {results.mode === "mafia" ? (
          <>
            <Text style={styles.revealLabel}>
              {(results.roles ?? []).filter((r) => r.evil).length > 1 ? t("mafiaWere") : t("mafiaWas")}
            </Text>
            {(results.roles ?? [])
              .filter((r) => r.evil)
              .map((r) => {
                const p = byId(r.playerId);
                return (
                  <View key={r.playerId} style={styles.evilBlock}>
                    <Text
                      style={[styles.grandName, { color: p?.color ?? colors.danger }]}
                      numberOfLines={1}
                    >
                      {p?.name}
                    </Text>
                    <Text style={styles.grandRole}>{r.roleName}</Text>
                  </View>
                );
              })}
            {(results.roles ?? []).filter((r) => r.evil).length === 0 ? (
              <Text style={styles.notice}>{t("noEvil")}</Text>
            ) : null}
          </>
        ) : null}

        {/* other special roles (imp + mafia) */}
        {results.roles && results.roles.some((r) => !r.evil && r.kind !== "civilian") ? (
          <>
            <Text style={styles.sectionLabel}>{t("otherRoles")}</Text>
            {results.roles
              .filter((r) => !r.evil && r.kind !== "civilian")
              .map((r) => {
                const p = byId(r.playerId);
                return (
                  <PlayerCard
                    key={r.playerId}
                    name={p?.name ?? ""}
                    color={p?.color ?? colors.border}
                    right={
                      <View style={[styles.roleBadge, { borderColor: r.roleColor }]}>
                        <Text style={[styles.roleBadgeText, { color: r.roleColor }]}>
                          {r.roleName}
                        </Text>
                      </View>
                    }
                  />
                );
              })}
          </>
        ) : null}

        {/* Blef: what each duellist held and whether the other read them right */}
        {results.mode === "blef"
          ? (results.clues ?? []).map((c) => {
              const p = byId(c.playerId);
              const other = roundPlayers.find((x) => x.id !== c.playerId);
              const guess = other ? results.guesses?.[other.id] : undefined;
              const right = guess ? (guess === "word") === c.isWord : null;
              return (
                <View
                  key={c.playerId}
                  style={[styles.blefCard, { borderColor: p?.color ?? colors.border }]}
                >
                  <Text style={[styles.blefName, { color: p?.color ?? colors.text }]}>
                    {p?.name}
                  </Text>
                  <Text style={styles.infoLabel}>
                    {c.isWord ? t("blefHadWord") : t("blefHadHint")}
                  </Text>
                  <Text style={[styles.blefValue, c.isWord && { color: colors.word }]}>
                    {capitalize(c.text)}
                  </Text>
                  {other ? (
                    <Text style={[styles.guessLine, right === false && styles.guessWrong]}>
                      {guess
                        ? tf("blefGuessLine", {
                            name: other.name,
                            guess: guess === "word" ? t("blefWordBtn") : t("blefHintBtn"),
                          }) + (right ? "  ✓" : "  ✗")
                        : tf("blefNoGuess", { name: other.name })}
                    </Text>
                  ) : null}
                </View>
              );
            })
          : null}

        {votedOut ? (
          <Text style={styles.notice}>{tf("votedOutLine", { name: votedOut.name })}</Text>
        ) : null}

        {voteRows}
      </ScrollView>

      <View style={styles.bottom}>
        {isHost ? (
          <>
            <BigButton label={t("newRoundBtn")} onPress={onNewRound} />
            <BigButton label={t("backToLobbyBtn")} variant="secondary" onPress={onBackToLobby} />
          </>
        ) : (
          <Text style={styles.notice}>{t("waitingHostAgain")}</Text>
        )}
        <BigButton label={t("leaveBtn")} variant="ghost" onPress={onLeave} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  list: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.md },
  outcome: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    paddingHorizontal: spacing.sm,
  },
  wordCard: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  wordLabel: { fontSize: 14, color: colors.textDim },
  word: { fontSize: 38, fontWeight: "900", color: colors.word, textAlign: "center" },
  revealLabel: { fontSize: 18, color: colors.textDim, marginTop: spacing.xs },
  grandName: {
    fontSize: 42,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(255,255,255,0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  grandRole: { fontSize: 15, fontWeight: "800", color: colors.textDim, textAlign: "center" },
  evilBlock: { alignItems: "center" },
  infoCard: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  infoLabel: { fontSize: 14, color: colors.textDim },
  infoValue: { fontSize: 22, fontWeight: "900", color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  smallLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  qText: { fontSize: 17, lineHeight: 24, fontWeight: "700", color: colors.text },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: spacing.sm,
  },
  playerRow: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.border },
  playerName: { flex: 1, fontSize: 18, fontWeight: "700", color: colors.text },
  roleBadge: {
    borderRadius: radius.sm,
    borderWidth: 2,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
  },
  roleBadgeText: { fontSize: 14, fontWeight: "800" },
  blefCard: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    gap: 2,
  },
  blefName: { fontSize: 24, fontWeight: "900", textAlign: "center" },
  blefValue: { fontSize: 24, fontWeight: "900", color: colors.text, textAlign: "center" },
  guessLine: { fontSize: 14, fontWeight: "700", color: colors.good, marginTop: spacing.xs },
  guessWrong: { color: colors.danger },
  chip: { borderRadius: radius.sm, paddingVertical: 6, paddingHorizontal: 12 },
  chipText: { fontSize: 15, fontWeight: "800" },
  voteRow: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
  },
  voteCount: { fontSize: 24, fontWeight: "900", minWidth: 26, textAlign: "right" },
  notice: { fontSize: 14, color: colors.textDim, textAlign: "center" },
  bottom: { gap: spacing.sm, paddingBottom: spacing.md },
});
