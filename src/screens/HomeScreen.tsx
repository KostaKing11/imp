import React, { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { HOW_TO_PLAY } from "../../data/howto";
import AppModal from "../components/AppModal";
import BigButton from "../components/BigButton";
import Chip from "../components/Chip";
import { SlidersIcon } from "../components/icons";
import Screen from "../components/Screen";
import SectionTitle from "../components/SectionTitle";
import { roleSlotCount } from "../game/engine";
import { CategoryState, Player, RoleDef } from "../game/types";
import { colors, PLAYER_COLORS, radius, spacing } from "../theme";
import { uid } from "../utils";
import CategoryEditor from "./editors/CategoryEditor";
import PlayerEditor from "./editors/PlayerEditor";
import RoleCountSheet from "./editors/RoleCountSheet";
import RoleEditor from "./editors/RoleEditor";

const MAX_PLAYERS = 12;
const MIN_PLAYERS = 3;

type Props = {
  players: Player[];
  setPlayers: (players: Player[]) => void;
  roles: RoleDef[];
  setRoles: (roles: RoleDef[]) => void;
  categories: CategoryState[];
  setCategories: (categories: CategoryState[]) => void;
  onStart: () => void;
  onOpenSettings: () => void;
};

export default function HomeScreen({
  players,
  setPlayers,
  roles,
  setRoles,
  categories,
  setCategories,
  onStart,
  onOpenSettings,
}: Props) {
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerIsNew, setPlayerIsNew] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryState | null>(null);
  const [categoryIsNew, setCategoryIsNew] = useState(false);
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

  // ---- validation ----
  const activePlayers = players.filter((p) => p.enabled);
  const slots = roleSlotCount(roles);
  const enabledWords = categories.filter((c) => c.enabled).flatMap((c) => c.words);
  let startError: string | null = null;
  if (activePlayers.length < MIN_PLAYERS)
    startError = `You need at least ${MIN_PLAYERS} active players.`;
  else if (slots > activePlayers.length - 1)
    startError = `Too many roles for ${activePlayers.length} players.`;
  else if (enabledWords.length === 0) startError = "Turn on at least one category with words.";

  // ---- players ----
  const addPlayer = () => {
    const color = PLAYER_COLORS[players.length % PLAYER_COLORS.length];
    setEditingPlayer({ id: uid(), name: `Player ${players.length + 1}`, color, enabled: true });
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

  // ---- categories ----
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

  // ---- roles ----
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
    if (roleIsNew) setRoles([...roles, r]);
    else setRoles(roles.map((x) => (x.id === r.id ? r : x)));
    setEditingRole(null);
  };

  const countRole = roles.find((r) => r.id === countRoleId) ?? null;

  return (
    <Screen>
      {/* fixed header: ? — logo — settings */}
      <View style={styles.topBar}>
        <Pressable style={styles.iconButton} onPress={() => setHowToOpen(true)} hitSlop={8}>
          <Text style={styles.questionMark}>?</Text>
        </Pressable>
        <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}>
          <Text style={styles.logo}>IMP</Text>
          <Text style={styles.logoSub}>CLASSIC</Text>
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
        <SectionTitle>Game mode</SectionTitle>
        <View style={styles.modes}>
          <View style={[styles.modeCard, styles.modeSelected]}>
            <Text style={styles.modeImp}>IMP</Text>
            <Text style={styles.modeName}>Classic</Text>
          </View>
          <View style={[styles.modeCard, styles.modeDisabled]}>
            <Text style={styles.modeQuestion}>◎</Text>
            <Text style={styles.modeName}>Odd One Out</Text>
            <Text style={styles.modeSoon}>Coming soon</Text>
          </View>
          <View style={[styles.modeCard, styles.modeDisabled]}>
            <Text style={styles.modeQuestion}>?</Text>
            <Text style={styles.modeName}>Mafia</Text>
            <Text style={styles.modeSoon}>Coming soon</Text>
          </View>
        </View>

        {/* players */}
        <SectionTitle>Players</SectionTitle>
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

        {/* categories */}
        <SectionTitle>Categories</SectionTitle>
        <View style={styles.chipWrap}>
          {categories.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
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
        </View>

        {/* roles */}
        <SectionTitle>Roles</SectionTitle>
        <View style={styles.chipWrap}>
          {roles.map((r) => (
            <Chip
              key={r.id}
              label={r.name}
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
      </Animated.ScrollView>

      {/* fixed bottom: start */}
      <View style={styles.startArea}>
        {startError ? <Text style={styles.startError}>{startError}</Text> : null}
        <BigButton label="START" onPress={onStart} disabled={startError !== null} />
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
      <RoleEditor
        visible={editingRole !== null}
        role={editingRole}
        isNew={roleIsNew}
        onSave={saveRole}
        onDelete={(id) => {
          setRoles(roles.filter((r) => r.id !== id));
          setEditingRole(null);
        }}
        onClose={() => setEditingRole(null)}
      />
      <RoleCountSheet
        visible={countRole !== null}
        role={countRole}
        maxCount={Math.max(1, activePlayers.length - 1)}
        onChangeCount={(roleId, count) =>
          setRoles(roles.map((r) => (r.id === roleId ? { ...r, count } : r)))
        }
        onClose={() => setCountRoleId(null)}
      />
      <AppModal visible={howToOpen} title="How to play" onClose={() => setHowToOpen(false)}>
        <Text style={styles.howToText}>{HOW_TO_PLAY}</Text>
      </AppModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 76,
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
    fontSize: 56,
    fontWeight: "900",
    color: colors.impRed,
    letterSpacing: 5,
    textShadowColor: colors.impRed,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
  },
  logoSub: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textDim,
    letterSpacing: 6,
    marginTop: -8,
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
    justifyContent: "center",
    padding: spacing.xs,
    gap: 2,
  },
  modeSelected: {
    backgroundColor: "#3A0A10",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  modeDisabled: {
    backgroundColor: colors.card,
    opacity: 0.55,
  },
  modeImp: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.impRed,
  },
  modeQuestion: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.textDim,
  },
  modeName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  modeSoon: {
    fontSize: 11,
    color: colors.textDim,
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
