import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Pulse from "./Pulse";
import { tf } from "../i18n";
import { alpha, colors, radius, spacing, type } from "../theme";

type Person = { id: string; name: string; color: string };

type Props = {
  // Everyone the room needs something from this phase.
  people: Person[];
  // Ids of those who have already done it.
  doneIds: string[];
};

// Who the room is actually still waiting for, by name and in their own
// colour. "3 of 5 in" tells you a game is not moving; this tells you who
// to look at across the table, which is the thing you wanted to know.
export default function WaitingOn({ people, doneIds }: Props) {
  const left = people.filter((p) => !doneIds.includes(p.id));
  if (left.length === 0) return null;

  return (
    <Pulse to={1.02} period={1500} style={styles.wrap}>
      <Text style={styles.label}>{tf("waitingOnN", { n: left.length })}</Text>
      <View style={styles.names}>
        {left.map((p) => (
          <View
            key={p.id}
            style={[
              styles.pill,
              { borderColor: alpha(p.color, 0.7), backgroundColor: alpha(p.color, 0.12) },
            ]}
          >
            <Text style={[styles.name, { color: p.color }]} numberOfLines={1}>
              {p.name}
            </Text>
          </View>
        ))}
      </View>
    </Pulse>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  label: {
    ...type.eyebrow,
    fontSize: 11,
    color: colors.textFaint,
  },
  names: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.xs,
  },
  pill: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    maxWidth: 150,
  },
  name: {
    ...type.button,
    fontSize: 14,
  },
});
