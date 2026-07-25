import { CameraView, useCameraPermissions } from "expo-camera";
import * as Network from "expo-network";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import BigButton from "../../components/BigButton";
import Screen from "../../components/Screen";
import { BLEF_CLUES_PER_PLAYER } from "../../game/blefEngine";
import {
  CategoryState,
  FakerCategoryState,
  GameMode,
  PairCategoryState,
  RoleDef,
} from "../../game/types";
import { t, tf } from "../../i18n";
import { codeFromLink, roomLink } from "../../net/config";
import { firebaseConfigured } from "../../net/firebase";
import { FirebaseClientTransport, FirebaseHostTransport } from "../../net/FirebaseTransport";
import {
  decodeQr,
  encodeQr,
  NetCard,
  randomRoomCode,
  RoomState,
} from "../../net/protocol";
import { HostConfig, RoomClient, RoomHost } from "../../net/room";
import {
  discoverRooms,
  nativeNetAvailable,
  TcpClientTransport,
  TcpHostTransport,
} from "../../net/TcpTransport";
import { colors, radius, spacing } from "../../theme";
import { confirmDialog, textColorFor, uid } from "../../utils";
import NetCardView from "./NetCardView";
import NetLobby from "./NetLobby";
import NetResultsView from "./NetResultsView";
import NetVoteView from "./NetVoteView";

const ANSWER_MAX = 50;

export type NetMode = "online" | "lan";

type Props = {
  // "host" opens a room straight away; "join" asks for a code first.
  intent: "host" | "join";
  // "online" goes through the relay (works with iPhones on the web too),
  // "lan" is phone-to-phone over the local Wi-Fi with no internet.
  netMode: NetMode;
  // Room code the app was opened with (a scanned link) — joins straight away.
  initialCode?: string | null;
  myName: string;
  myColor: string;
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
  onExit: () => void;
};

type Conn = "idle" | "host" | "client";
type RoomChoice = { ip: string; port: number; roomId: string; hostName: string };

export default function NetScreen(props: Props) {
  const { intent, netMode, initialCode, myName, myColor, onExit } = props;
  const online = netMode === "online";

  const [conn, setConn] = useState<Conn>("idle");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [card, setCard] = useState<NetCard | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState(initialCode ?? "");
  const [roomChoices, setRoomChoices] = useState<RoomChoice[] | null>(null);
  const [hostIp, setHostIp] = useState<string | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // per-phase local UI state
  const [ready, setReady] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [answered, setAnswered] = useState(false);
  const [votedFor, setVotedFor] = useState<string | null>(null);

  const hostRef = useRef<RoomHost | null>(null);
  const hostTransportRef = useRef<TcpHostTransport | null>(null);
  const clientRef = useRef<RoomClient | null>(null);
  const autoJoined = useRef(false);
  const prevPhase = useRef<string>("lobby");
  const scanned = useRef(false);
  const exitedRef = useRef(false);

  const config = (): HostConfig => ({
    mode: props.gameMode,
    roles: props.roles,
    mafiaRoles: props.mafiaRoles,
    categories: props.categories,
    pairCategories: props.pairCategories,
    fakerCategories: props.fakerCategories,
  });

  // Keep the host's copy of the setup in sync while it's being edited.
  useEffect(() => {
    hostRef.current?.setConfig(config());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.gameMode,
    props.roles,
    props.mafiaRoles,
    props.categories,
    props.pairCategories,
    props.fakerCategories,
  ]);

  const cleanup = () => {
    hostRef.current?.close();
    hostRef.current = null;
    clientRef.current?.close();
    clientRef.current = null;
  };

  useEffect(() => {
    if (intent === "host") hostRoom();
    // Opened from a room link/QR — go straight in.
    else if (initialCode && !autoJoined.current) {
      autoJoined.current = true;
      joinByCode(initialCode);
    }
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onStateUpdate = (state: RoomState) => {
    if (state.phase !== prevPhase.current) {
      if (state.phase === "cards") setReady(false);
      if (state.phase === "question") {
        setAnswerText("");
        setAnswered(false);
      }
      if (state.phase === "vote") setVotedFor(null);
      if (state.phase === "lobby") {
        setReady(false);
        setAnswered(false);
        setVotedFor(null);
        setCard(null);
      }
      prevPhase.current = state.phase;
    }
    setMyId((prev) => hostRef.current?.myId ?? clientRef.current?.myId ?? prev);
    setRoom(state);
  };

  // ---- hosting ----

  const hostRoom = async () => {
    if (online && !firebaseConfigured()) {
      setError(t("notConfigured"));
      return;
    }
    if (!online && !nativeNetAvailable()) {
      setError(t("needFullApp"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const roomId = uid();
      let code: string;
      let transport: TcpHostTransport | FirebaseHostTransport;
      if (online) {
        // The room code is claimed in the database, so two rooms can
        // never end up sharing one.
        const fb = new FirebaseHostTransport();
        code = await fb.start();
        transport = fb;
        hostTransportRef.current = null;
      } else {
        code = randomRoomCode();
        const tcp = new TcpHostTransport();
        await tcp.start(code, roomId, myName);
        hostTransportRef.current = tcp;
        transport = tcp;
      }
      hostRef.current = new RoomHost(
        transport,
        { onState: onStateUpdate, onCard: setCard },
        myName,
        myColor,
        config(),
        code,
        roomId
      );
      // The first STATE fires inside the constructor, before hostRef is
      // assigned — so pick up our own id right here.
      setMyId(hostRef.current.myId);
      if (!online) {
        Network.getIpAddressAsync()
          .then(setHostIp)
          .catch(() => setHostIp(null));
      }
      setConn("host");
      prevPhase.current = "lobby";
    } catch (e) {
      // Keep the raw reason visible — network failures are hard to guess at.
      const why = e instanceof Error && e.message ? ` (${e.message})` : "";
      setError(t("hostFailed") + why);
    } finally {
      setBusy(false);
    }
  };

  // ---- joining ----

  // Shared tail of both join paths — wires a connected transport into a
  // RoomClient and flips the screen into the room.
  const attachClient = (transport: TcpClientTransport | FirebaseClientTransport) => {
    clientRef.current = new RoomClient(
      transport,
      {
        onState: onStateUpdate,
        onCard: setCard,
        onHostLost: () => endSession(t("hostLeft")),
        onKicked: () => endSession(t("kickedText")),
      },
      myName,
      myColor
    );
    setConn("client");
    prevPhase.current = "lobby";
  };

  const connectTo = async (target: RoomChoice) => {
    setBusy(true);
    setError(null);
    setRoomChoices(null);
    try {
      const transport = new TcpClientTransport();
      await transport.connect(target.ip, target.port);
      attachClient(transport);
    } catch (e) {
      const why = e instanceof Error && e.message ? ` (${e.message})` : "";
      setError(t("joinFailed") + why);
    } finally {
      setBusy(false);
    }
  };

  const joinOnline = async (code: string) => {
    if (!firebaseConfigured()) {
      setError(t("notConfigured"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const transport = new FirebaseClientTransport();
      await transport.connect(code);
      attachClient(transport);
    } catch (e) {
      const reason = e instanceof Error ? e.message : "";
      setError(
        reason === "no-room"
          ? t("roomNotFound")
          : reason === "firebase-not-configured"
            ? t("notConfigured")
            : t("relayFailed")
      );
    } finally {
      setBusy(false);
    }
  };

  const joinByCode = async (code: string) => {
    if (!/^\d{4}$/.test(code)) return;
    if (online) {
      await joinOnline(code);
      return;
    }
    if (!nativeNetAvailable()) {
      setError(t("needFullApp"));
      return;
    }
    setBusy(true);
    setError(null);
    const rooms = await discoverRooms(code);
    setBusy(false);
    if (rooms.length === 0) setError(t("joinFailed"));
    else if (rooms.length === 1) await connectTo(rooms[0]);
    // Two rooms with the same 4-digit code — let the player pick by host.
    else setRoomChoices(rooms);
  };

  // Room QR codes come in two flavours: a plain link for online rooms
  // (an iPhone camera can open it) and imp:// for local Wi-Fi rooms.
  const joinByQr = async (payload: string) => {
    const linkCode = codeFromLink(payload);
    if (linkCode) {
      setScanOpen(false);
      setCodeInput(linkCode);
      await joinOnline(linkCode);
      return;
    }
    const decoded = decodeQr(payload);
    if (!decoded) {
      scanned.current = false;
      return;
    }
    setScanOpen(false);
    await connectTo({
      ip: decoded.ip,
      port: decoded.port,
      roomId: decoded.roomId,
      hostName: "",
    });
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        setError(t("cameraDenied"));
        return;
      }
    }
    scanned.current = false;
    setScanOpen(true);
  };

  // The room is over for us — drop everything and go back to the menu.
  const endSession = (message: string) => {
    if (exitedRef.current) return;
    cleanup();
    setConn("idle");
    setRoom(null);
    setCard(null);
    setNotice(null);
    setError(message);
  };

  const requestExit = () => {
    if (conn === "idle") {
      exitedRef.current = true;
      cleanup();
      onExit();
      return;
    }
    confirmDialog(t("leaveGameQ"), t("leaveRoomText"), () => {
      exitedRef.current = true;
      clientRef.current?.leave();
      cleanup();
      onExit();
    });
  };

  // ---- my actions (host plays through its own room object) ----

  const isHost = conn === "host";
  const sendReady = () => {
    if (isHost && hostRef.current) hostRef.current.markReady(hostRef.current.myId);
    else clientRef.current?.ready();
    setReady(true);
  };
  const sendAnswer = () => {
    const text = answerText.trim().slice(0, ANSWER_MAX);
    if (!text) return;
    if (isHost && hostRef.current) hostRef.current.submitAnswer(hostRef.current.myId, text);
    else clientRef.current?.answer(text);
    setAnswered(true);
  };
  const sendVote = (choice: string) => {
    if (votedFor) return;
    if (isHost && hostRef.current) hostRef.current.submitVote(hostRef.current.myId, choice);
    else clientRef.current?.vote(choice);
    setVotedFor(choice);
  };

  const leaveX = (
    <Pressable onPress={requestExit} hitSlop={10} style={styles.leaveButton}>
      <Text style={styles.leaveText}>✕</Text>
    </Pressable>
  );

  // ================= join / connecting =================

  if (conn === "idle") {
    return (
      <Screen>
        {leaveX}
        <ScrollView
          contentContainerStyle={styles.setupArea}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>{intent === "host" ? t("hostGame") : t("joinGame")}</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {busy ? <Text style={styles.notice}>{t("connecting")}</Text> : null}

          {roomChoices ? (
            <View style={styles.choiceBox}>
              <Text style={styles.notice}>{t("multipleRooms")}</Text>
              {roomChoices.map((r) => (
                <BigButton
                  key={r.roomId}
                  label={r.hostName || r.ip}
                  variant="secondary"
                  compact
                  onPress={() => connectTo(r)}
                />
              ))}
            </View>
          ) : null}

          {intent === "host" ? (
            <BigButton label={t("hostGame")} disabled={busy} onPress={hostRoom} />
          ) : (
            <View style={styles.joinBox}>
              <Text style={styles.joinLabel}>{t("enterCode")}</Text>
              <TextInput
                style={styles.codeInput}
                value={codeInput}
                onChangeText={(v) => setCodeInput(v.replace(/\D/g, "").slice(0, 4))}
                placeholder="0000"
                placeholderTextColor={colors.textDim}
                keyboardType="number-pad"
                maxLength={4}
              />
              <BigButton
                label={t("joinBtn")}
                disabled={busy || codeInput.length !== 4}
                onPress={() => joinByCode(codeInput)}
              />
              <BigButton
                label={t("scanQr")}
                variant="secondary"
                compact
                disabled={busy || Platform.OS === "web"}
                onPress={openScanner}
              />
            </View>
          )}
          <Text style={styles.hint}>{online ? t("onlineHint") : t("sameWifiHint")}</Text>
        </ScrollView>

        {/* QR scanner */}
        <Modal visible={scanOpen} animationType="slide" onRequestClose={() => setScanOpen(false)}>
          <View style={styles.scanScreen}>
            <CameraView
              style={styles.camera}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={({ data }) => {
                if (scanned.current) return;
                scanned.current = true;
                joinByQr(String(data));
              }}
            />
            <View style={styles.scanBottom}>
              <BigButton label={t("close")} variant="secondary" onPress={() => setScanOpen(false)} />
            </View>
          </View>
        </Modal>
      </Screen>
    );
  }

  if (!room) {
    return (
      <Screen>
        {leaveX}
        <View style={styles.center}>
          <Text style={styles.notice}>{t("connecting")}</Text>
        </View>
      </Screen>
    );
  }

  // ================= in a room =================

  const me = room.players.find((p) => p.id === myId) ?? null;
  const roundPlayers = room.players.filter((p) => p.connected && p.inRound);
  const host = hostRef.current;

  // ---- lobby ----
  if (room.phase === "lobby") {
    // Online rooms hand out a plain link (any phone camera can open it);
    // local Wi-Fi rooms encode the host's address instead.
    const qrPayload = !isHost
      ? null
      : online
        ? roomLink(room.code)
        : hostIp
          ? encodeQr(hostIp, hostTransportRef.current?.port ?? 47778, room.code, room.roomId)
          : null;
    return (
      <Screen>
        {leaveX}
        <NetLobby
          state={room}
          isHost={isHost}
          myId={myId}
          qrPayload={qrPayload}
          notice={notice}
          startProblem={isHost ? (host?.startProblem() ?? null) : null}
          onKick={(id) => host?.kick(id)}
          onStart={() => host?.startRound()}
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
        />
      </Screen>
    );
  }

  // ---- joined mid-round: wait it out ----
  if (!me?.inRound && room.phase !== "results") {
    return (
      <Screen>
        {leaveX}
        <View style={styles.center}>
          <Text style={styles.notice}>{t("joinNextRound")}</Text>
        </View>
      </Screen>
    );
  }

  // ---- private cards ----
  if (room.phase === "cards") {
    return (
      <Screen>
        {leaveX}
        <NetCardView
          card={card}
          myName={me?.name ?? myName}
          myColor={me?.color ?? myColor}
          ready={ready}
          onReady={sendReady}
          readyCount={room.readyIds.length}
          total={roundPlayers.length}
          isHost={isHost}
          onContinue={() => host?.continueFromCards()}
        />
      </Screen>
    );
  }

  // ---- discussion ("X goes first") ----
  if (room.phase === "discuss") {
    const first = room.players.find((p) => p.id === room.firstPlayerId);
    const instructions =
      room.mode === "odd"
        ? t("discussionInstrOdd")
        : room.mode === "blef"
          ? tf("blefDiscussionInstr", { n: BLEF_CLUES_PER_PLAYER })
          : t("discussionInstr");
    return (
      <Screen>
        {leaveX}
        <View style={styles.center}>
          <Text style={styles.heading}>{t("discussion")}</Text>
          <Text style={styles.instructions}>{instructions}</Text>
          {first ? (
            <View style={[styles.firstChip, { backgroundColor: first.color }]}>
              <Text style={[styles.firstText, { color: textColorFor(first.color) }]}>
                {tf("goesFirst", { name: first.name })}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.bottom}>
          {isHost ? (
            <BigButton label={t("vote")} onPress={() => host?.startVote()} />
          ) : (
            <Text style={styles.notice}>{t("waitingForHost")}</Text>
          )}
        </View>
      </Screen>
    );
  }

  // ---- Faker: read your question, type an answer ----
  if (room.phase === "question") {
    return (
      <Screen>
        {leaveX}
        <KeyboardAvoidingView style={styles.flex} behavior="padding">
          <ScrollView
            contentContainerStyle={styles.questionArea}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.qLabel}>{t("fakerYourQuestion")}</Text>
            <View style={styles.questionCard}>
              <Text style={styles.question}>{card?.question ?? "…"}</Text>
            </View>

            {!answered ? (
              <>
                <TextInput
                  style={styles.input}
                  value={answerText}
                  onChangeText={setAnswerText}
                  placeholder={t("fakerAnswerPlaceholder")}
                  placeholderTextColor={colors.textDim}
                  maxLength={ANSWER_MAX}
                />
                <Text style={styles.charCount}>
                  {answerText.length}/{ANSWER_MAX}
                </Text>
              </>
            ) : (
              <Text style={styles.notice}>{t("waitingOthers")}</Text>
            )}

            <Text style={styles.counter}>
              {tf("answeredCount", { done: room.answeredIds.length, total: roundPlayers.length })}
            </Text>
          </ScrollView>
          <View style={styles.bottom}>
            {!answered ? (
              <BigButton
                label={t("fakerLockIn")}
                disabled={answerText.trim().length === 0}
                onPress={sendAnswer}
              />
            ) : null}
            {isHost ? (
              <BigButton
                label={t("continueBtn")}
                variant={answered ? "primary" : "secondary"}
                onPress={() => host?.revealAnswers()}
              />
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </Screen>
    );
  }

  // ---- Faker: the shared question first, then the answers ----
  if (room.phase === "answers") {
    return (
      <Screen>
        {leaveX}
        <Text style={styles.heading}>
          {room.answersShown ? t("fakerAnswersTitle") : t("theQuestionWas")}
        </Text>
        <Text style={styles.subheading}>
          {room.answersShown ? t("fakerAnswersInstr") : t("questionFirstInstr")}
        </Text>

        {!room.answersShown ? (
          <View style={styles.center}>
            <View style={styles.questionCard}>
              <Text style={styles.question}>{room.mainQuestion ?? "…"}</Text>
            </View>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            <View style={styles.mainQPill}>
              <Text style={styles.mainQPillText}>{room.mainQuestion}</Text>
            </View>
            {(room.answers ?? []).map((a) => {
              const p = room.players.find((x) => x.id === a.playerId);
              return (
                <View key={a.playerId} style={styles.answerCard}>
                  <View style={[styles.nameChip, { backgroundColor: p?.color ?? colors.card }]}>
                    <Text
                      style={[styles.nameChipText, { color: textColorFor(p?.color ?? "#000") }]}
                    >
                      {a.name}
                    </Text>
                  </View>
                  <Text style={styles.answer}>{a.answer || t("netBlankAnswer")}</Text>
                </View>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.bottom}>
          {isHost ? (
            room.answersShown ? (
              <BigButton label={t("vote")} onPress={() => host?.startVote()} />
            ) : (
              <BigButton label={t("showAnswersBtn")} onPress={() => host?.showAnswers()} />
            )
          ) : (
            <Text style={styles.notice}>{t("waitingForHost")}</Text>
          )}
        </View>
      </Screen>
    );
  }

  // ---- Mafia: played out loud ----
  if (room.phase === "playing") {
    return (
      <Screen>
        {leaveX}
        <View style={styles.center}>
          <Text style={styles.heading}>{t("gameStarted")}</Text>
          <Text style={styles.instructions}>{t("mafiaPlayInstr")}</Text>
          <Text style={styles.instructions}>{t("whenOverReveal")}</Text>
        </View>
        <View style={styles.bottom}>
          {isHost ? (
            <BigButton label={t("revealRolesBtn")} onPress={() => host?.revealResults()} />
          ) : (
            <Text style={styles.notice}>{t("waitingHostReveal")}</Text>
          )}
        </View>
      </Screen>
    );
  }

  // ---- voting ----
  if (room.phase === "vote") {
    return (
      <Screen>
        {leaveX}
        <NetVoteView
          state={room}
          myId={myId}
          votedFor={votedFor}
          onVote={sendVote}
          isHost={isHost}
          onReveal={() => host?.revealResults()}
        />
      </Screen>
    );
  }

  // ---- results ----
  return (
    <Screen>
      {leaveX}
      {room.results ? (
        <NetResultsView
          state={room}
          results={room.results}
          isHost={isHost}
          onNewRound={() => host?.startRound()}
          onBackToLobby={() => host?.backToLobby()}
          onLeave={requestExit}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.notice}>{t("waitingForHost")}</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  leaveButton: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.md,
    zIndex: 1,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  leaveText: { fontSize: 17, fontWeight: "700", color: colors.textDim },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  heading: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  subheading: {
    fontSize: 14,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textDim,
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
  setupArea: { flexGrow: 1, justifyContent: "center", gap: spacing.md },
  error: { fontSize: 14, color: colors.danger, textAlign: "center" },
  notice: { fontSize: 14, color: colors.textDim, textAlign: "center" },
  hint: { fontSize: 12, color: colors.textDim, textAlign: "center" },
  choiceBox: { gap: spacing.xs },
  joinBox: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  joinLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textDim,
    letterSpacing: 1,
    textAlign: "center",
    textTransform: "uppercase",
  },
  codeInput: {
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 14,
    textAlign: "center",
    paddingVertical: 12,
  },
  scanScreen: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  scanBottom: { padding: spacing.md },
  firstChip: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  firstText: { fontSize: 20, fontWeight: "900" },
  questionArea: {
    flexGrow: 1,
    justifyContent: "center",
    gap: spacing.sm,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  qLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textDim,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  questionCard: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.accent,
    padding: spacing.md,
  },
  question: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 18,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
  },
  charCount: { alignSelf: "flex-end", fontSize: 12, color: colors.textDim },
  counter: { fontSize: 13, color: colors.textDim, textAlign: "center", marginTop: spacing.xs },
  list: { gap: spacing.sm, paddingBottom: spacing.md },
  mainQPill: {
    backgroundColor: colors.chip,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  mainQPillText: { fontSize: 15, fontWeight: "700", color: colors.textDim, textAlign: "center" },
  answerCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  nameChip: { alignSelf: "flex-start", borderRadius: radius.sm, paddingVertical: 4, paddingHorizontal: 10 },
  nameChipText: { fontSize: 14, fontWeight: "800" },
  answer: { fontSize: 20, fontWeight: "700", color: colors.text },
  bottom: { gap: spacing.sm, paddingBottom: spacing.md },
});
