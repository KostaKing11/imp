import React, { useRef, useState } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { HOW_TO_PLAY } from "../../data/howto";
import { getLanguage, roleName, t, tf } from "../i18n";
import AppModal from "../components/AppModal";
import BigButton from "../components/BigButton";
import Chip from "../components/Chip";
import { SlidersIcon } from "../components/icons";
import Screen from "../components/Screen";
import SectionTitle from "../components/SectionTitle";
import { roleSlotCount } from "../game/engine";
import { activePairPool } from "../game/oddEngine";
import { CategoryState, GameMode, PairCategoryState, Player, RoleDef } from "../game/types";
import { colors, PLAYER_COLORS, radius, spacing } from "../theme";
import { uid } from "../utils";
import CategoryEditor from "./editors/CategoryEditor";
import PairCategoryEditor from "./editors/PairCategoryEditor";
import PlayerEditor from "./editors/PlayerEditor";
import RoleCountSheet from "./editors/RoleCountSheet";
import RoleEditor from "./editors/RoleEditor";

const MAX_PLAYERS = 12;
const MIN_PLAYERS = 3;

type Props = {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
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
  onStart: () => void;
  onOpenSettings: () => void;
};

export default function HomeScreen({
  gameMode,
  setGameMode,
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
  onStart,
  onOpenSettings,
}: Props) {
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerIsNew, setPlayerIsNew] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryState | null>(null);
  const [categoryIsNew, setCategoryIsNew] = useState(false);
  const [editingPairCategory, setEditingPairCategory] = useState<PairCategoryState | null>(null);
  const [pairCategoryIsNew, setPairCategoryIsNew] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDef | null>(null);
  const [roleIsNew, setRoleIsNew] = useState(false);
  const [countRoleId, setCountRoleId] = useState<string | null>(null);
  const [howToOpen, setHowToOpen] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const logoScale = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: [1, 0.64],
    extrapolate: "clamp",
  });

  // Whichever role list the current mode uses (odd mode has none).
  const isMafia = gameMode === "mafia";
  const currentRoles = isMafia ? mafiaRoles : roles;
  const setCurrentRoles = isMafia ? setMafiaRoles : setRoles;

  // ---- validation ----
  const activePlayers = players.filter((p) => p.enabled);
  const slots = roleSlotCount(roles);
  const mafiaSlots = roleSlotCount(mafiaRoles);
  const enabledWords = categories.filter((c) => c.enabled).flatMap((c) => c.words);
  let startError: string | null = null;
  if (activePlayers.length < MIN_PLAYERS) startError = t("errMinPlayers");
  else if (gameMode === "imp" && slots > activePlayers.length - 1)
    startError = tf("errTooManyRoles", { n: activePlayers.length });
  else if (gameMode === "imp" && enabledWords.length === 0) startError = t("errNoWords");
  else if (gameMode === "odd" && activePairPool(pairCategories).length === 0)
    startError = t("errNoPairs");
  else if (gameMode === "mafia" && mafiaSlots > activePlayers.length)
    startError = tf("errTooManyRoles", { n: activePlayers.length });

  // ---- players ----
  const addPlayer = () => {
    const color = PLAYER_COLORS[players.length % PLAYER_COLORS.length];
    setEditingPlayer({
      id: uid(),
      name: tf("playerN", { n: players.length + 1 }),
      color,
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

  // ---- word categories (IMP Classic) ----
  const toggleCategory = (id: string) => {
    setCategories(categories.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
  };

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
  const togglePairCategory = (id: string) => {
    setPairCategories(
      pairCategories.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const addPairCategory = () => {
    setEditingPairCategory({ id: `pc:${uid()}`, name: "", enabled: true, custom: true, pairs: [] });
    setPairCategoryIsNew(true);
  };

  const savePairCategory = (c: PairCategoryState) => {
    if (pairCategoryIsNew) setPairCategories([...pairCategories, c]);
    else setPairCategories(pairCategories.map((x) => (x.id === c.id ? c : x)));
    setEditingPairCategory(null);
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
  const howTos = HOW_TO_PLAY[getLanguage()];
  const howToText =
    gameMode === "imp" ? howTos.imp : gameMode === "odd" ? howTos.odd : howTos.mafia;

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
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        <Pressable style={styles.iconButton} onPress={onOpenSettings} hitSlop={8}>
          <SlidersIcon size={22} color={colors.textDim} />
        </Pressable>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        {/* game mode */}
        <SectionTitle>{t("gameMode")}</SectionTitle>
        <View style={styles.modes}>
          {/* The border and dim overlay stay mounted with constant structure —
              toggling borderWidth/children on Android glitches the rounded
              clip and makes the image vanish. Only colors change. */}
          <Pressable
            onPress={() => setGameMode("imp")}
            style={[styles.modeCard, gameMode === "imp" && styles.modeSelected]}
          >
            <Image
              source={require("../../assets/modes/classic.png")}
              style={styles.modeImage}
              resizeMode="cover"
            />
            <View
              style={[styles.modeDim, gameMode === "imp" && styles.modeDimOff]}
              pointerEvents="none"
            />
          </Pressable>
          <Pressable
            onPress={() => setGameMode("odd")}
            style={[styles.modeCard, gameMode === "odd" && styles.modeSelected]}
          >
            <Image
              source={require("../../assets/modes/odd.png")}
              style={styles.modeImage}
              resizeMode="cover"
            />
            <View
              style={[styles.modeDim, gameMode === "odd" && styles.modeDimOff]}
              pointerEvents="none"
            />
          </Pressable>
          <Pressable
            onPress={() => setGameMode("mafia")}
            style={[styles.modeCard, gameMode === "mafia" && styles.modeSelected]}
          >
            <Image
              source={require("../../assets/modes/mafia.png")}
              style={styles.modeImage}
              resizeMode="cover"
            />
            <View
              style={[styles.modeDim, gameMode === "mafia" && styles.modeDimOff]}
              pointerEvents="none"
            />
          </Pressable>
        </View>

        {/* players */}
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

        {/* categories — words for IMP Classic, pairs for Odd One Out */}
        {gameMode !== "mafia" ? (
          <>
            <SectionTitle>{t("categories")}</SectionTitle>
            <View style={styles.chipWrap}>
              {gameMode === "imp" ? (
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

        {/* roles — IMP Classic & Mafia (Odd One Out has none) */}
        {gameMode !== "odd" ? (
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
      </Animated.ScrollView>

      {/* fixed bottom: start */}
      <View style={styles.startArea}>
        {startError ? <Text style={styles.startError}>{startError}</Text> : null}
        <BigButton label={t("start")} onPress={onStart} disabled={startError !== null} />
      </View>

      {/* pop-ups */}
      <PlayerEditor
        visible={editingPlayer !== null}
        player={editingPlayer}
        isNew={playerIsNew}
        canDelete={players.length > MIN_PLAYERS}
        onSave={savePlayer}
        onDelete={(id) => {
          setPlayers(players.filter((p) => p.id !== id));
          setEditingPlayer(null);
        }}
        onClose={() => setEditingPlayer(null)}
      />
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
        maxCount={Math.max(1, isMafia ? activePlayers.length : activePlayers.length - 1)}
        onChangeCount={(roleId, count) =>
          setCurrentRoles(currentRoles.map((r) => (r.id === roleId ? { ...r, count } : r)))
        }
        onClose={() => setCountRoleId(null)}
      />
      <AppModal visible={howToOpen} title={t("howToPlay")} onClose={() => setHowToOpen(false)}>
        <Text style={styles.howToText}>{howToText}</Text>
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
    width: 140,
    height: 78,
  },
  scroll: {
    paddingBottom: spacing.md,
  },
  modes: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  modeCard: {
    flex: 1,
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
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    justifyContent: "center",
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
