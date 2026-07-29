import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Chip from "../../components/Chip";
import SectionTitle from "../../components/SectionTitle";
import { usePressScale } from "../../components/usePressScale";
import {
  CategoryState,
  FakerCategoryState,
  GameMode,
  PairCategoryState,
  RoleDef,
  SpectrumCategoryState,
} from "../../game/types";
import { getLanguage, modeLabel, roleName, t } from "../../i18n";
import { alpha, colors, elevation, radius, spacing } from "../../theme";
import { uid } from "../../utils";
import CategoryEditor from "../editors/CategoryEditor";
import FakerCategoryEditor from "../editors/FakerCategoryEditor";
import PairCategoryEditor from "../editors/PairCategoryEditor";
import RoleCountSheet from "../editors/RoleCountSheet";
import RoleEditor from "../editors/RoleEditor";

// Each mode's artwork has its own colour; the selected card is outlined
// and lit in it, so which mode is picked reads from across the table.
const MODE_TINT: Record<GameMode, string> = {
  imp: colors.impRed,
  odd: colors.oddYellow,
  mafia: "#E8EAF0",
  blef: colors.blefTeal,
  faker: "#B79BFF",
  skala: "#7BD948",
  sync: "#4A9EFF",
};

// One mode's artwork. The picked card grows out of the row and lights
// up; the rest sit back, dimmed and slightly smaller, so the row reads
// as one choice rather than five equal tiles.
function ModeCard({
  selected,
  tint,
  source,
  label,
  badge,
  onPress,
}: {
  selected: boolean;
  tint: string;
  // Missing for modes that have no artwork yet — those draw their name
  // instead, lit in the mode's own colour so the row still reads.
  source?: number;
  label?: string;
  badge?: string;
  onPress: () => void;
}) {
  const press = usePressScale(0.93);
  const lift = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(lift, {
      toValue: selected ? 1 : 0,
      speed: 16,
      bounciness: 9,
      useNativeDriver: true,
    }).start();
  }, [selected, lift]);

  const grow = lift.interpolate({ inputRange: [0, 1], outputRange: [0.93, 1] });

  // Both scales go in one transform array — a second `transform` in a
  // later style would replace this one outright, not compose with it.
  return (
    <Animated.View style={{ transform: [{ scale: grow }, { scale: press.scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[
          styles.modeCard,
          { borderColor: selected ? tint : colors.borderSoft },
          selected && [styles.modeSelected, elevation.glow(tint)],
        ]}
      >
        {source ? (
          <Image source={source} style={styles.modeImage} resizeMode="cover" />
        ) : (
          <View style={[styles.modeArtless, { backgroundColor: alpha(tint, 0.14) }]}>
            <Text style={[styles.modeArtlessText, { color: tint }]} numberOfLines={3}>
              {label ?? ""}
            </Text>
          </View>
        )}
        {badge ? (
          <View style={styles.playerBadge} pointerEvents="none">
            <Text style={styles.playerBadgeText}>{badge}</Text>
          </View>
        ) : null}
        {/* The dim overlay stays mounted with constant structure — toggling
            children on Android glitches the rounded clip and makes the
            image vanish. Only the colour changes. */}
        <View style={[styles.modeDim, selected && styles.modeDimOff]} pointerEvents="none" />
      </Pressable>
    </Animated.View>
  );
}

// The mode / categories / roles part of a game setup. Shared by the home
// screen (one phone) and the local-multiplayer lobby (host only), so both
// places edit exactly the same lists.
type Props = {
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
  // How many players a single role may be given (depends on the roster).
  maxRoleCount: number;
  // Rendered between the mode cards and the categories (the home screen
  // puts its player list there; the lobby has its own).
  middleSlot?: React.ReactNode;
  // Modes to leave out of the row. The lobby hides the ones that have no
  // online support yet, so a room can never be put into a mode the host
  // cannot actually run.
  hiddenModes?: GameMode[];
};

export default function GameSetup({
  gameMode,
  setGameMode,
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
  maxRoleCount,
  middleSlot,
  hiddenModes = [],
}: Props) {
  const [editingCategory, setEditingCategory] = useState<CategoryState | null>(null);
  const [categoryIsNew, setCategoryIsNew] = useState(false);
  const [editingPairCategory, setEditingPairCategory] = useState<PairCategoryState | null>(null);
  const [pairCategoryIsNew, setPairCategoryIsNew] = useState(false);
  const [editingFakerCategory, setEditingFakerCategory] = useState<FakerCategoryState | null>(null);
  const [fakerCategoryIsNew, setFakerCategoryIsNew] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDef | null>(null);
  const [roleIsNew, setRoleIsNew] = useState(false);
  const [countRoleId, setCountRoleId] = useState<string | null>(null);

  const isMafia = gameMode === "mafia";
  const currentRoles = isMafia ? mafiaRoles : roles;
  const setCurrentRoles = isMafia ? setMafiaRoles : setRoles;

  // ---- word categories (IMP Classic / Bluff) ----
  const toggleCategory = (id: string) =>
    setCategories(categories.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));

  const addCategory = () => {
    setEditingCategory({ id: `c:${uid()}`, name: "", enabled: true, custom: true, words: [] });
    setCategoryIsNew(true);
  };

  const saveCategory = (c: CategoryState) => {
    if (categoryIsNew) setCategories([...categories, c]);
    else setCategories(categories.map((x) => (x.id === c.id ? c : x)));
    setEditingCategory(null);
  };

  // ---- pair categories (Odd One Out) ----
  const togglePairCategory = (id: string) =>
    setPairCategories(pairCategories.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));

  const addPairCategory = () => {
    setEditingPairCategory({ id: `pc:${uid()}`, name: "", enabled: true, custom: true, pairs: [] });
    setPairCategoryIsNew(true);
  };

  const savePairCategory = (c: PairCategoryState) => {
    if (pairCategoryIsNew) setPairCategories([...pairCategories, c]);
    else setPairCategories(pairCategories.map((x) => (x.id === c.id ? c : x)));
    setEditingPairCategory(null);
  };

  // ---- question categories (Faker) ----
  const toggleFakerCategory = (id: string) =>
    setFakerCategories(
      fakerCategories.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );

  const addFakerCategory = () => {
    setEditingFakerCategory({
      id: `qc:${uid()}`,
      name: "",
      enabled: true,
      custom: true,
      questions: [],
    });
    setFakerCategoryIsNew(true);
  };

  const saveFakerCategory = (c: FakerCategoryState) => {
    if (fakerCategoryIsNew) setFakerCategories([...fakerCategories, c]);
    else setFakerCategories(fakerCategories.map((x) => (x.id === c.id ? c : x)));
    setEditingFakerCategory(null);
  };

  // ---- spectrum categories (Skala) ----
  const toggleSpectrumCategory = (id: string) =>
    setSpectrumCategories(
      spectrumCategories.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );

  // ---- roles (IMP Classic & Mafia) ----
  const addRole = () => {
    setEditingRole({
      id: `r:${uid()}`,
      name: "",
      description: "",
      color: "#7B2CBF",
      knowsWord: true,
      enabled: true,
      count: 1,
      builtin: false,
      kind: "custom",
    });
    setRoleIsNew(true);
  };

  const saveRole = (r: RoleDef) => {
    if (roleIsNew) setCurrentRoles([...currentRoles, r]);
    else setCurrentRoles(currentRoles.map((x) => (x.id === r.id ? r : x)));
    setEditingRole(null);
  };

  const countRole = currentRoles.find((r) => r.id === countRoleId) ?? null;

  // "3/8" next to the section heading — how many of the lists are in play
  // without having to count the lit pills.
  const activeCategories =
    gameMode === "faker"
      ? fakerCategories
      : gameMode === "odd"
        ? pairCategories
        : gameMode === "skala"
          ? spectrumCategories
          : categories;
  const categoryHint = `${activeCategories.filter((c) => c.enabled).length}/${activeCategories.length}`;
  const roleHint = `${currentRoles.reduce((n, r) => n + r.count, 0)}`;

  const modeCard = (mode: GameMode, source?: number, badge?: string) =>
    hiddenModes.includes(mode) ? null : (
      <ModeCard
        key={mode}
        selected={gameMode === mode}
        tint={MODE_TINT[mode] ?? colors.accent}
        source={source}
        label={modeLabel(mode)}
        badge={badge}
        onPress={() => setGameMode(mode)}
      />
    );

  return (
    <>
      <SectionTitle hint={modeLabel(gameMode)}>{t("gameMode")}</SectionTitle>
      {/* Horizontally scrollable so cards keep their size as modes are
          added — no visible scrollbar, you just swipe the row. It bleeds
          past the screen padding so a card can sit half off the edge and
          say "there is more this way". */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.modeScroll}
        contentContainerStyle={styles.modes}
      >
        {modeCard("imp", require("../../../assets/modes/classic.png"))}
        {modeCard("odd", require("../../../assets/modes/odd.png"))}
        {modeCard("mafia", require("../../../assets/modes/mafia.png"))}
        {modeCard(
          "blef",
          getLanguage() === "sr"
            ? require("../../../assets/modes/blef.png")
            : require("../../../assets/modes/bluff.png")
        )}
        {modeCard(
          "faker",
          getLanguage() === "sr"
            ? require("../../../assets/modes/folirant.png")
            : require("../../../assets/modes/faker.png")
        )}
        {modeCard("skala")}
        {modeCard("sync")}
      </ScrollView>

      {middleSlot}

      {/* categories — words (IMP/Bluff), pairs (Odd One Out), questions (Faker) */}
      {gameMode !== "mafia" && gameMode !== "sync" ? (
        <>
          <SectionTitle hint={categoryHint}>{t("categories")}</SectionTitle>
          <View style={styles.chipWrap}>
            {gameMode === "skala" ? (
              spectrumCategories.map((c) => (
                <Chip
                  key={c.id}
                  label={c.name}
                  badge={c.spectrums.length}
                  active={c.enabled}
                  onPress={() => toggleSpectrumCategory(c.id)}
                />
              ))
            ) : gameMode === "faker" ? (
              <>
                {fakerCategories.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.name}
                    badge={c.questions.length}
                    active={c.enabled}
                    onPress={() => toggleFakerCategory(c.id)}
                    onLongPress={
                      c.custom
                        ? () => {
                            setEditingFakerCategory(c);
                            setFakerCategoryIsNew(false);
                          }
                        : undefined
                    }
                  />
                ))}
                <Chip label="＋" add onPress={addFakerCategory} />
              </>
            ) : gameMode === "imp" || gameMode === "blef" ? (
              <>
                {categories.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.name}
                    badge={c.words.length}
                    active={c.enabled}
                    onPress={() => toggleCategory(c.id)}
                    onLongPress={
                      c.custom
                        ? () => {
                            setEditingCategory(c);
                            setCategoryIsNew(false);
                          }
                        : undefined
                    }
                  />
                ))}
                <Chip label="＋" add onPress={addCategory} />
              </>
            ) : (
              <>
                {pairCategories.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.name}
                    badge={c.pairs.length}
                    active={c.enabled}
                    onPress={() => togglePairCategory(c.id)}
                    onLongPress={
                      c.custom
                        ? () => {
                            setEditingPairCategory(c);
                            setPairCategoryIsNew(false);
                          }
                        : undefined
                    }
                  />
                ))}
                <Chip label="＋" add onPress={addPairCategory} />
              </>
            )}
          </View>
        </>
      ) : null}

      {/* roles — IMP Classic & Mafia only (Odd One Out and Blef have none) */}
      {gameMode === "imp" || gameMode === "mafia" ? (
        <>
          <SectionTitle hint={roleHint}>{t("roles")}</SectionTitle>
          <View style={styles.chipWrap}>
            {currentRoles.map((r) => (
              <Chip
                key={r.id}
                label={roleName(r)}
                bg={r.color}
                count={r.count}
                active={r.count > 0}
                onPress={() => setCountRoleId(r.id)}
                onLongPress={
                  !r.builtin
                    ? () => {
                        setEditingRole(r);
                        setRoleIsNew(false);
                      }
                    : undefined
                }
              />
            ))}
            <Chip label="＋" add onPress={addRole} />
          </View>
        </>
      ) : null}

      {/* pop-ups */}
      <CategoryEditor
        visible={editingCategory !== null}
        category={editingCategory}
        isNew={categoryIsNew}
        onSave={saveCategory}
        onDelete={(id) => {
          setCategories(categories.filter((c) => c.id !== id));
          setEditingCategory(null);
        }}
        onClose={() => setEditingCategory(null)}
      />
      <PairCategoryEditor
        visible={editingPairCategory !== null}
        category={editingPairCategory}
        isNew={pairCategoryIsNew}
        onSave={savePairCategory}
        onDelete={(id) => {
          setPairCategories(pairCategories.filter((c) => c.id !== id));
          setEditingPairCategory(null);
        }}
        onClose={() => setEditingPairCategory(null)}
      />
      <FakerCategoryEditor
        visible={editingFakerCategory !== null}
        category={editingFakerCategory}
        isNew={fakerCategoryIsNew}
        onSave={saveFakerCategory}
        onDelete={(id) => {
          setFakerCategories(fakerCategories.filter((c) => c.id !== id));
          setEditingFakerCategory(null);
        }}
        onClose={() => setEditingFakerCategory(null)}
      />
      <RoleEditor
        visible={editingRole !== null}
        role={editingRole}
        isNew={roleIsNew}
        mafia={isMafia}
        onSave={saveRole}
        onDelete={(id) => {
          setCurrentRoles(currentRoles.filter((r) => r.id !== id));
          setEditingRole(null);
        }}
        onClose={() => setEditingRole(null)}
      />
      <RoleCountSheet
        visible={countRole !== null}
        role={countRole}
        maxCount={Math.max(1, maxRoleCount)}
        onChangeCount={(roleId, count) =>
          setCurrentRoles(currentRoles.map((r) => (r.id === roleId ? { ...r, count } : r)))
        }
        onClose={() => setCountRoleId(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  // Negative margins cancel the screen's side padding so the row runs
  // edge to edge; the content padding puts it back at the ends.
  modeScroll: {
    marginHorizontal: -spacing.md,
  },
  modes: {
    flexDirection: "row",
    // Tight: the unselected cards sit at 0.93, which already adds a few
    // px of air on each side, so the gap reads wider than it is.
    gap: 8,
    paddingHorizontal: spacing.md,
    // room for the selected card's glow
    paddingVertical: spacing.xs,
  },
  modeCard: {
    // Fixed width (not flex) so the row can scroll instead of squeezing.
    // Square, because the artwork is.
    width: 110,
    aspectRatio: 1,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
    backgroundColor: "#000000",
    borderWidth: 2,
  },
  modeImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  modeSelected: {
    borderWidth: 2.5,
  },
  modeArtless: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xs,
  },
  modeArtlessText: {
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.4,
  },
  modeDim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  modeDimOff: {
    backgroundColor: "transparent",
  },
  playerBadge: {
    position: "absolute",
    top: 7,
    right: 7,
    zIndex: 2,
    minWidth: 22,
    height: 22,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    backgroundColor: colors.blefTeal,
    alignItems: "center",
    justifyContent: "center",
  },
  playerBadgeText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#04201C",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs + 2,
  },
});
