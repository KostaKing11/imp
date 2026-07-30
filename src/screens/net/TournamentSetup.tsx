import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import AppModal from "../../components/AppModal";
import BigButton from "../../components/BigButton";
import Chip from "../../components/Chip";
import Stepper from "../../components/Stepper";
import Toggle from "../../components/Toggle";
import {
  CategoryState,
  FakerCategoryState,
  GameMode,
  PairCategoryState,
  RoleDef,
  SpectrumCategoryState,
} from "../../game/types";
import { modeLabel, roleName, t, tf } from "../../i18n";
import { TOUR_MODES } from "../../net/protocol";
import { alpha, colors, modeTint, radius, spacing, type } from "../../theme";
import RoleCountSheet from "../editors/RoleCountSheet";

type Props = {
  // Which modes are in the draw. Mafia is never here — it has no winner
  // the app can score.
  enabled: Record<string, boolean>;
  setEnabled: (next: Record<string, boolean>) => void;
  target: number;
  setTarget: (n: number) => void;
  playerCount: number;

  roles: RoleDef[];
  setRoles: (roles: RoleDef[]) => void;
  categories: CategoryState[];
  setCategories: (c: CategoryState[]) => void;
  pairCategories: PairCategoryState[];
  setPairCategories: (c: PairCategoryState[]) => void;
  fakerCategories: FakerCategoryState[];
  setFakerCategories: (c: FakerCategoryState[]) => void;
  spectrumCategories: SpectrumCategoryState[];
  setSpectrumCategories: (c: SpectrumCategoryState[]) => void;
  skalaTurns: number;
  setSkalaTurns: (n: number) => void;
};

// A heading that reads like the rest of the app: a small label, a rule,
// and the value on the right.
function Row({
  label,
  value,
  tint,
  open,
  onPress,
}: {
  label: string;
  value: string;
  tint?: string;
  open?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      hitSlop={10}
      style={({ pressed }) => [styles.row, pressed && onPress ? styles.pressed : null]}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rule} />
      <Text style={[styles.rowValue, tint ? { color: tint } : null]}>{value}</Text>
      {onPress ? (
        <Text style={styles.chevron}>{open ? "▾" : "▸"}</Text>
      ) : null}
    </Pressable>
  );
}

// The host's tournament setup: every mode that can come up, with its own
// content underneath, and a switch to drop it out of the draw entirely.
export default function TournamentSetup(props: Props) {
  const [openMode, setOpenMode] = useState<GameMode | null>(null);
  const [openPart, setOpenPart] = useState<"cats" | "roles" | "rounds" | null>(null);
  const [countRoleId, setCountRoleId] = useState<string | null>(null);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetText, setTargetText] = useState(String(props.target));

  const countRole = props.roles.find((r) => r.id === countRoleId) ?? null;

  const commitTarget = () => {
    const n = parseInt(targetText, 10);
    props.setTarget(Number.isFinite(n) ? Math.max(1, Math.min(99, n)) : props.target);
    setTargetText(String(Number.isFinite(n) ? Math.max(1, Math.min(99, n)) : props.target));
    setEditingTarget(false);
  };

  // Which list of categories a mode draws from.
  const catsFor = (mode: GameMode) => {
    if (mode === "odd")
      return {
        items: props.pairCategories.map((c) => ({ id: c.id, name: c.name, n: c.pairs.length, on: c.enabled })),
        toggle: (id: string) =>
          props.setPairCategories(
            props.pairCategories.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
          ),
      };
    if (mode === "faker")
      return {
        items: props.fakerCategories.map((c) => ({ id: c.id, name: c.name, n: c.questions.length, on: c.enabled })),
        toggle: (id: string) =>
          props.setFakerCategories(
            props.fakerCategories.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
          ),
      };
    if (mode === "skala")
      return {
        items: props.spectrumCategories.map((c) => ({ id: c.id, name: c.name, n: c.spectrums.length, on: c.enabled })),
        toggle: (id: string) =>
          props.setSpectrumCategories(
            props.spectrumCategories.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
          ),
      };
    // imp, blef and sync all draw from the word lists.
    return {
      items: props.categories.map((c) => ({ id: c.id, name: c.name, n: c.words.length, on: c.enabled })),
      toggle: (id: string) =>
        props.setCategories(
          props.categories.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
        ),
    };
  };

  return (
    <View style={styles.wrap}>
      {/* how many points it takes */}
      <Row label={t("tournamentTargetLabel")} value="" />
      <View style={styles.targetCard}>
        <Pressable
          onPress={() => {
            setTargetText(String(props.target));
            setEditingTarget(true);
          }}
          hitSlop={10}
        >
          <Text style={styles.targetValue}>{props.target}</Text>
        </Pressable>
        <Text style={styles.targetHint}>{t("tourTargetHint")}</Text>
      </View>

      {/* Typing happens in a sheet, not in the middle of a long scrolling
          page. A sheet lifts itself above the keyboard, so the number you
          are typing is always the thing you can see. */}
      <AppModal
        visible={editingTarget}
        title={t("tournamentTargetLabel")}
        onClose={commitTarget}
      >
        <TextInput
          style={styles.targetInput}
          value={targetText}
          onChangeText={setTargetText}
          onSubmitEditing={commitTarget}
          keyboardType="number-pad"
          autoFocus
          returnKeyType="done"
          selectionColor={colors.accent}
          maxLength={2}
        />
        <Text style={styles.targetSheetHint}>{t("tourTargetRange")}</Text>
        <BigButton label={t("save")} compact onPress={commitTarget} />
      </AppModal>

      {TOUR_MODES.map((mode) => {
        const on = props.enabled[mode] !== false;
        const tint = modeTint(mode);
        const cats = catsFor(mode);
        const catsOn = cats.items.filter((c) => c.on).length;
        const isOpen = openMode === mode;

        return (
          <View key={mode} style={[styles.modeCard, !on && styles.modeOff]}>
            <View style={styles.modeHead}>
              <Text style={[styles.modeName, { color: on ? tint : colors.textFaint }]}>
                {modeLabel(mode)}
              </Text>
              <Toggle
                value={on}
                onChange={(v) => props.setEnabled({ ...props.enabled, [mode]: v })}
              />
            </View>

            {on ? (
              <>
                <Row
                  label={t("categories")}
                  value={tf("tourSelectedOf", { done: catsOn, total: cats.items.length })}
                  tint={tint}
                  open={isOpen && openPart === "cats"}
                  onPress={() => {
                    const same = isOpen && openPart === "cats";
                    setOpenMode(same ? null : mode);
                    setOpenPart(same ? null : "cats");
                  }}
                />
                {isOpen && openPart === "cats" ? (
                  <View style={styles.chipWrap}>
                    {cats.items.map((c) => (
                      <Chip
                        key={c.id}
                        label={c.name}
                        badge={c.n}
                        active={c.on}
                        onPress={() => cats.toggle(c.id)}
                      />
                    ))}
                  </View>
                ) : null}

                {/* Only IMP Classic deals roles — Mafia is not in a tournament. */}
                {mode === "imp" ? (
                  <>
                    <Row
                      label={t("roles")}
                      value={String(props.roles.reduce((n, r) => n + r.count, 0))}
                      tint={tint}
                      open={isOpen && openPart === "roles"}
                      onPress={() => {
                        const same = isOpen && openPart === "roles";
                        setOpenMode(same ? null : mode);
                        setOpenPart(same ? null : "roles");
                      }}
                    />
                    {isOpen && openPart === "roles" ? (
                      <View style={styles.chipWrap}>
                        {props.roles.map((r) => (
                          <Chip
                            key={r.id}
                            label={roleName(r)}
                            bg={r.color}
                            count={r.count}
                            active={r.count > 0}
                            onPress={() => setCountRoleId(r.id)}
                          />
                        ))}
                      </View>
                    ) : null}
                  </>
                ) : null}

                {/* Skala runs whole turns around the table, set the same way
                    as it is on one phone. */}
                {mode === "skala" ? (
                  <>
                    <Row
                      label={t("skalaRoundsLabel")}
                      value={String(props.skalaTurns * Math.max(1, props.playerCount))}
                      tint={tint}
                      open={isOpen && openPart === "rounds"}
                      onPress={() => {
                        const same = isOpen && openPart === "rounds";
                        setOpenMode(same ? null : mode);
                        setOpenPart(same ? null : "rounds");
                      }}
                    />
                    {isOpen && openPart === "rounds" ? (
                      <Stepper
                        label={t("skalaRoundsStepper")}
                        value={props.skalaTurns * Math.max(1, props.playerCount)}
                        min={Math.max(1, props.playerCount)}
                        max={Math.max(1, props.playerCount) * 5}
                        step={Math.max(1, props.playerCount)}
                        onChange={(v) =>
                          props.setSkalaTurns(
                            Math.max(1, Math.round(v / Math.max(1, props.playerCount)))
                          )
                        }
                        tone={tint}
                      />
                    ) : null}
                  </>
                ) : null}
              </>
            ) : null}
          </View>
        );
      })}

      <RoleCountSheet
        visible={countRole !== null}
        role={countRole}
        maxCount={Math.max(1, props.playerCount - 1)}
        onChangeCount={(roleId, count) =>
          props.setRoles(props.roles.map((r) => (r.id === roleId ? { ...r, count } : r)))
        }
        onClose={() => setCountRoleId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginTop: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 10,
  },
  pressed: { opacity: 0.6 },
  rowLabel: { ...type.eyebrow, color: colors.textDim },
  rule: { flex: 1, height: 1, backgroundColor: colors.borderSoft },
  rowValue: { ...type.caption, fontSize: 13, color: colors.textDim },
  // Big enough to be a target in its own right, not just decoration.
  chevron: {
    fontSize: 20,
    lineHeight: 22,
    color: colors.textDim,
    width: 22,
    textAlign: "center",
  },

  targetCard: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  targetValue: {
    ...type.display,
    fontSize: 44,
    color: colors.accent,
    fontVariant: ["tabular-nums"],
  },
  targetInput: {
    alignSelf: "center",
    minWidth: 150,
    textAlign: "center",
    ...type.display,
    fontSize: 52,
    color: colors.accent,
    backgroundColor: alpha(colors.bg, 0.55),
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.accent,
    paddingVertical: spacing.xs,
  },
  targetHint: { ...type.caption, fontSize: 12, color: colors.textFaint },
  targetSheetHint: {
    ...type.caption,
    fontSize: 13,
    color: colors.textFaint,
    textAlign: "center",
  },

  modeCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.sm + 2,
    gap: spacing.xs,
  },
  modeOff: { backgroundColor: alpha(colors.card, 0.5) },
  modeHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  modeName: { ...type.heading, fontSize: 20 },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs + 2,
    paddingBottom: spacing.xs,
  },
});
