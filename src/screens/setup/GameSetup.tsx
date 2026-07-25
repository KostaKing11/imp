import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Chip from "../../components/Chip";
import SectionTitle from "../../components/SectionTitle";
import {
  CategoryState,
  FakerCategoryState,
  GameMode,
  PairCategoryState,
  RoleDef,
} from "../../game/types";
import { getLanguage, roleName, t } from "../../i18n";
import { colors, radius, spacing } from "../../theme";
import { uid } from "../../utils";
import CategoryEditor from "../editors/CategoryEditor";
import FakerCategoryEditor from "../editors/FakerCategoryEditor";
import PairCategoryEditor from "../editors/PairCategoryEditor";
import RoleCountSheet from "../editors/RoleCountSheet";
import RoleEditor from "../editors/RoleEditor";

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
  // How many players a single role may be given (depends on the roster).
  maxRoleCount: number;
  // Rendered between the mode cards and the categories (the home screen
  // puts its player list there; the lobby has its own).
  middleSlot?: React.ReactNode;
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
  maxRoleCount,
  middleSlot,
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

  const modeCard = (mode: GameMode, source: number, badge?: string) => (
    <Pressable
      onPress={() => setGameMode(mode)}
      style={[styles.modeCard, gameMode === mode && styles.modeSelected]}
    >
      <Image source={source} style={styles.modeImage} resizeMode="cover" />
      {badge ? (
        <View style={styles.playerBadge} pointerEvents="none">
          <Text style={styles.playerBadgeText}>{badge}</Text>
        </View>
      ) : null}
      <View style={[styles.modeDim, gameMode === mode && styles.modeDimOff]} pointerEvents="none" />
    </Pressable>
  );

  return (
    <>
      <SectionTitle>{t("gameMode")}</SectionTitle>
      {/* Horizontally scrollable so cards keep their size as modes are
          added — no visible scrollbar, you just swipe the row. */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modes}>
        {/* The border and dim overlay stay mounted with constant structure —
            toggling borderWidth/children on Android glitches the rounded
            clip and makes the image vanish. Only colors change. */}
        {modeCard("imp", require("../../../assets/modes/classic.png"))}
        {modeCard("odd", require("../../../assets/modes/odd.png"))}
        {modeCard("mafia", require("../../../assets/modes/mafia.png"))}
        {modeCard(
          "blef",
          getLanguage() === "sr"
            ? require("../../../assets/modes/blef.png")
            : require("../../../assets/modes/bluff.png"),
          "2"
        )}
        {modeCard(
          "faker",
          getLanguage() === "sr"
            ? require("../../../assets/modes/folirant.png")
            : require("../../../assets/modes/faker.png")
        )}
      </ScrollView>

      {middleSlot}

      {/* categories — words (IMP/Bluff), pairs (Odd One Out), questions (Faker) */}
      {gameMode !== "mafia" ? (
        <>
          <SectionTitle>{t("categories")}</SectionTitle>
          <View style={styles.chipWrap}>
            {gameMode === "faker" ? (
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
                <Chip label="＋" onPress={addFakerCategory} />
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
                <Chip label="＋" onPress={addCategory} />
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
                <Chip label="＋" onPress={addPairCategory} />
              </>
            )}
          </View>
        </>
      ) : null}

      {/* roles — IMP Classic & Mafia only (Odd One Out and Blef have none) */}
      {gameMode === "imp" || gameMode === "mafia" ? (
        <>
          <SectionTitle>{t("roles")}</SectionTitle>
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
            <Chip label="＋" onPress={addRole} />
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
  modes: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  modeCard: {
    // Fixed width (not flex) so the row can scroll instead of squeezing.
    width: 104,
    aspectRatio: 0.85,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
    backgroundColor: "#000000",
    borderWidth: 3,
    borderColor: "transparent",
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
    borderColor: "#FFFFFF",
  },
  modeDim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modeDimOff: {
    backgroundColor: "transparent",
  },
  playerBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    zIndex: 2,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 5,
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
    gap: spacing.xs,
    justifyContent: "center",
  },
});
