import { MafiaRound, Player, RoleDef } from "./types";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Deals mafia roles: every configured slot goes to a random player,
// everyone left over becomes a civilian. Unlike IMP Classic, ALL
// players may hold special roles.
export function createMafiaRound(players: Player[], roles: RoleDef[]): MafiaRound | null {
  if (players.length < 3) return null;

  const slots: RoleDef[] = [];
  for (const role of roles) {
    for (let i = 0; i < role.count; i++) slots.push(role);
  }
  const trimmed = slots.slice(0, players.length);

  const shuffled = shuffle(players);
  const assignments: Record<string, string> = {};
  shuffled.forEach((p, i) => {
    assignments[p.id] = trimmed[i]?.id ?? "civilian";
  });

  return { assignments };
}
