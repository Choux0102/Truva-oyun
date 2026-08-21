import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";

interface GameCard {
  id: string;
  suit: string;
  suitName: string;
  value: number;
  symbol: string;
  colorName: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  borderAccent: string;
  isFaceDown?: boolean;
  cardType?: "unit" | "tactics";
  title?: string;
  description?: string;
}

interface FrontSlotData {
  topCards: GameCard[];
  bottomCards: GameCard[];
  environmentCards?: GameCard[];
  claimedBy?: "top" | "bottom" | null;
}

type FrontsState = Record<number, FrontSlotData>;

interface RoomState {
  id: string;
  createdAt: number;
  lastUpdated: number;
  deck: GameCard[];
  tacticsDeck: GameCard[];
  hand1: GameCard[];
  hand2: GameCard[];
  fronts: FrontsState;
  topTacticsSlot: GameCard[];
  bottomTacticsSlot: GameCard[];
  discardPile: GameCard[];
  p1Online: boolean;
  p2Online: boolean;
  p1LastPing: number;
  p2LastPing: number;
  p1Name: string;
  p2Name: string;
  lastAction?: string;
}

// Helpers to create initial decks
const SUITS = [
  { id: 'suit1', name: 'Kırmızı Süvari', symbol: '⚔️', colorName: 'Kırmızı', badgeBg: '#450a0a', badgeText: '#f87171', accentColor: '#ef4444', borderAccent: '#b91c1c' },
  { id: 'suit2', name: 'Mavi Okçu', symbol: '🏹', colorName: 'Mavi', badgeBg: '#082f49', badgeText: '#38bdf8', accentColor: '#0ea5e9', borderAccent: '#0369a1' },
  { id: 'suit3', name: 'Yeşil Mızraklı', symbol: '🌲', colorName: 'Yeşil', badgeBg: '#052e16', badgeText: '#4ade80', accentColor: '#22c55e', borderAccent: '#15803d' },
  { id: 'suit4', name: 'Sarı Muhafız', symbol: '🛡️', colorName: 'Sarı', badgeBg: '#422006', badgeText: '#facc15', accentColor: '#eab308', borderAccent: '#a16207' },
  { id: 'suit5', name: 'Mor Büyücü', symbol: '🔮', colorName: 'Mor', badgeBg: '#3b0764', badgeText: '#c084fc', accentColor: '#a855f7', borderAccent: '#7e22ce' },
  { id: 'suit6', name: 'Turuncu Savaşçı', symbol: '⚡', colorName: 'Turuncu', badgeBg: '#431407', badgeText: '#fb923c', accentColor: '#f97316', borderAccent: '#c2410c' },
];

const TACTICS_DEFINITIONS = [
  {
    id: 'tactic-1-ek-taarruz',
    title: 'Ek Taarruz',
    value: 8,
    desc: 'Birlik kartı gibi kullanabildiğiniz bu kartı, 8 değerinde olan herhangi bir renkli birlik kartı olarak oynayabilirsiniz. Kartın rengini ise cephe sonuçlanırken belirlersiniz.',
    symbol: '⚔',
  },
  {
    id: 'tactic-2-savunma-hatti',
    title: 'Savunma Hattı',
    value: 0,
    desc: 'Birlik kartı gibi kullanabildiğiniz bu kartı, 1, 2 ya da 3 değerinde olan herhangi bir renkli birlik kartı olarak oynayabilirsiniz. Kartın değerini ve rengini ise cephe sonuçlanırken belirlersiniz.',
    symbol: '🛡',
  },
  {
    id: 'tactic-3-lider-achilles',
    title: 'Lider: Achilles',
    value: 0,
    desc: 'Bu kartı istediğiniz herhangi bir değer ve renkteki birlik kartı yerine koyabilirsiniz.',
    symbol: '👑',
  },
  {
    id: 'tactic-4-lider-hector',
    title: 'Lider: Hector',
    value: 0,
    desc: 'Bu kartı istediğiniz herhangi bir değer ve renkteki birlik kartı yerine koyabilirsiniz.',
    symbol: '👑',
  },
  {
    id: 'tactic-5-bataklik',
    title: 'Bataklık',
    value: 0,
    desc: 'Bu kart oynandığı cephe üzerindeki formasyonu genişletir ve cephenin sonuçlanması için oyuncuların 4 kart koyması gerekir.',
    symbol: '〰',
  },
  {
    id: 'tactic-6-sis',
    title: 'Sis',
    value: 0,
    desc: 'Bu kart oynandığı cephe üzerinde bulunan bütün formasyonları ortadan kaldırır. Söz konusu cephede toplam kart değeri en yüksek rakama sahip olan oyuncu, cepheyi kazanır.',
    symbol: '☁',
  },
  {
    id: 'tactic-7-gozcu',
    title: 'Gözcü',
    value: 0,
    desc: 'Oyuncu, birlik veya taktik destelerinden toplamda 3 adet kart çeker ve eline ekler. Ardından ise, elinde bulunan kartlardan istemediği 2 tanesini, yüzü kapalı olacak şekilde, ilgili destelerin üzerine yerleştirir.',
    symbol: '👁',
  },
  {
    id: 'tactic-8-takviye-birlik',
    title: 'Takviye Birlik',
    value: 0,
    desc: 'Oyuncu, kendi tarafında bulunan sonuçlanmamış bir cephedeki bir birlik ya da taktik kartını alarak, dilediği başka bir cephesine oynayabilir. Ya da seçtiği birlik kartını, yüzü açık şekilde masanın kenarına koyarak, ıskartaya çıkarabilir.',
    symbol: '🔄',
  },
  {
    id: 'tactic-9-firari',
    title: 'Firari',
    value: 0,
    desc: 'Oyuncu, rakibin tarafında bulunan sonuçlanmamış bir cephedeki bir birlik ya da taktik kartını alır ve bu kartı, yüzü açık şekilde ıskartaya çıkarır.',
    symbol: '⚡',
  },
  {
    id: 'tactic-10-hain',
    title: 'Hain',
    value: 0,
    desc: 'Oyuncu, rakibin tarafında bulunan sonuçlanmamış bir cephedeki bir birlik kartını alarak, kendi tarafındaki bir cepheye oynayabilir.',
    symbol: '🗡',
  },
];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createFullDeck(): GameCard[] {
  const deck: GameCard[] = [];
  SUITS.forEach((suit) => {
    for (let val = 1; val <= 10; val++) {
      deck.push({
        id: `${suit.id}-${val}`,
        suit: suit.id,
        suitName: suit.name,
        value: val,
        symbol: suit.symbol,
        colorName: suit.colorName,
        badgeBg: suit.badgeBg,
        badgeText: suit.badgeText,
        accentColor: suit.accentColor,
        borderAccent: suit.borderAccent,
        cardType: 'unit',
        isFaceDown: false,
      });
    }
  });
  return deck;
}

function createTacticsDeck(): GameCard[] {
  return TACTICS_DEFINITIONS.map((def) => ({
    id: def.id,
    suit: 'tactics',
    suitName: 'Taktik',
    value: def.value || 0,
    symbol: def.symbol,
    colorName: 'Taktik',
    badgeBg: '#1e1035',
    badgeText: '#d8b4fe',
    accentColor: '#c084fc',
    borderAccent: '#7c3aed',
    cardType: 'tactics',
    title: def.title,
    description: def.desc,
    isFaceDown: false,
  }));
}

function createInitialFronts(): FrontsState {
  const fronts: FrontsState = {};
  for (let i = 1; i <= 9; i++) {
    fronts[i] = {
      topCards: [],
      bottomCards: [],
      environmentCards: [],
      claimedBy: null,
    };
  }
  return fronts;
}

function createNewRoomState(id: string): RoomState {
  const shuffledUnits = shuffle(createFullDeck());
  const hand1 = shuffledUnits.slice(0, 7);
  const hand2 = shuffledUnits.slice(7, 14);
  const deck = shuffledUnits.slice(14);
  const tacticsDeck = shuffle(createTacticsDeck());

  return {
    id,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    deck,
    tacticsDeck,
    hand1,
    hand2,
    fronts: createInitialFronts(),
    topTacticsSlot: [],
    bottomTacticsSlot: [],
    discardPile: [],
    p1Online: false,
    p2Online: false,
    p1LastPing: 0,
    p2LastPing: 0,
    p1Name: 'Player 1',
    p2Name: 'Player 2',
    lastAction: 'Oyun masası hazırlandı',
  };
}

// Active rooms in memory
const rooms = new Map<string, RoomState>();

// Map client WebSocket to metadata
interface ClientMeta {
  ws: WebSocket;
  roomId?: string;
  role?: 'p1' | 'p2' | 'spectator';
  playerName?: string;
}
const clients = new Map<WebSocket, ClientMeta>();

// Mask opponent's cards so only back/count and card type (troop vs tactics) is revealed
function getSanitizedCard(card: GameCard): GameCard {
  const isTactics = card.cardType === 'tactics' || card.suit === 'tactics';
  return {
    id: card.id,
    suit: isTactics ? 'tactics' : 'suit1',
    suitName: isTactics ? 'Taktik Kartı' : 'Birlik Kartı',
    value: 0,
    symbol: isTactics ? '⚔' : '✦',
    colorName: isTactics ? 'Taktik' : 'Birlik',
    badgeBg: isTactics ? '#1e1428' : '#141414',
    badgeText: isTactics ? '#a855f7' : '#a1a1aa',
    accentColor: isTactics ? '#9333ea' : '#52525b',
    borderAccent: isTactics ? '#581c87' : '#27272a',
    isFaceDown: true,
    cardType: isTactics ? 'tactics' : 'unit',
    title: isTactics ? 'KAPALI TAKTİK' : 'KAPALI BİRLİK',
    description: isTactics ? 'Rakibin elindeki taktik kartı' : 'Rakibin elindeki birlik kartı',
  };
}

function getSanitizedRoomState(room: RoomState, role: 'p1' | 'p2' | 'spectator') {
  const now = Date.now();
  const p1Active = room.p1Online || now - room.p1LastPing < 10000;
  const p2Active = room.p2Online || now - room.p2LastPing < 10000;

  const hand1Sanitized = role === 'p1' ? room.hand1 : room.hand1.map(getSanitizedCard);
  const hand2Sanitized = role === 'p2' ? room.hand2 : room.hand2.map(getSanitizedCard);

  return {
    id: room.id,
    deckCount: room.deck.length,
    tacticsDeckCount: room.tacticsDeck.length,
    hand1: hand1Sanitized,
    hand2: hand2Sanitized,
    hand1Count: room.hand1.length,
    hand2Count: room.hand2.length,
    fronts: room.fronts,
    topTacticsSlot: room.topTacticsSlot,
    bottomTacticsSlot: room.bottomTacticsSlot,
    discardPile: room.discardPile,
    p1Online: p1Active,
    p2Online: p2Active,
    p1Name: room.p1Name,
    p2Name: room.p2Name,
    lastAction: room.lastAction,
    lastUpdated: room.lastUpdated,
    yourRole: role,
  };
}

function handleExecuteAction(room: RoomState, role: 'p1' | 'p2' | 'spectator', action: string, payload: any = {}) {
  room.lastUpdated = Date.now();

  if (action === "DRAW_CARD") {
    const count = payload?.count || 1;
    const targetHand = role === 'p2' ? 2 : role === 'p1' ? 1 : (payload?.targetHand || 1);
    if (room.deck.length > 0) {
      const drawCount = Math.min(count, room.deck.length);
      const drawn = room.deck.slice(0, drawCount);
      room.deck = room.deck.slice(drawCount);
      if (targetHand === 1) room.hand1.push(...drawn);
      else room.hand2.push(...drawn);
      room.lastAction = `P${targetHand} birlik kartı çekti (+${drawCount})`;
    }
  } else if (action === "DRAW_TACTICS") {
    const count = payload?.count || 1;
    const targetHand = role === 'p2' ? 2 : role === 'p1' ? 1 : (payload?.targetHand || 1);
    if (room.tacticsDeck.length > 0) {
      const drawCount = Math.min(count, room.tacticsDeck.length);
      const drawn = room.tacticsDeck.slice(0, drawCount);
      room.tacticsDeck = room.tacticsDeck.slice(drawCount);
      if (targetHand === 1) room.hand1.push(...drawn);
      else room.hand2.push(...drawn);
      room.lastAction = `P${targetHand} taktik kartı çekti (+${drawCount})`;
    }
  } else if (action === "MOVE_CARD") {
    const { cardId, target } = payload;
    if (role === 'spectator') return;
    // Security check: Players cannot move/drag unplayed cards from opponent's hand
    if (role === 'p1' && room.hand2.some((c) => c.id === cardId)) return;
    if (role === 'p2' && room.hand1.some((c) => c.id === cardId)) return;

    let cardToMove: GameCard | null = null;

    // Remove card from wherever it currently is
    for (let i = 1; i <= 9; i++) {
      const f = room.fronts[i];
      if (f) {
        f.topCards = f.topCards.filter((c) => {
          if (c.id === cardId) { cardToMove = c; return false; }
          return true;
        });
        f.bottomCards = f.bottomCards.filter((c) => {
          if (c.id === cardId) { cardToMove = c; return false; }
          return true;
        });
        if (f.environmentCards) {
          f.environmentCards = f.environmentCards.filter((c) => {
            if (c.id === cardId) { cardToMove = c; return false; }
            return true;
          });
        }
      }
    }

    room.hand1 = room.hand1.filter((c) => {
      if (c.id === cardId) { cardToMove = c; return false; }
      return true;
    });
    room.hand2 = room.hand2.filter((c) => {
      if (c.id === cardId) { cardToMove = c; return false; }
      return true;
    });
    room.discardPile = room.discardPile.filter((c) => {
      if (c.id === cardId) { cardToMove = c; return false; }
      return true;
    });
    room.topTacticsSlot = room.topTacticsSlot.filter((c) => {
      if (c.id === cardId) { cardToMove = c; return false; }
      return true;
    });
    room.bottomTacticsSlot = room.bottomTacticsSlot.filter((c) => {
      if (c.id === cardId) { cardToMove = c; return false; }
      return true;
    });
    room.deck = room.deck.filter((c) => {
      if (c.id === cardId) { cardToMove = c; return false; }
      return true;
    });
    room.tacticsDeck = room.tacticsDeck.filter((c) => {
      if (c.id === cardId) { cardToMove = c; return false; }
      return true;
    });

    if (cardToMove) {
      if (target.type === 'hand') {
        const hIdx = target.handIndex || (role === 'p2' ? 2 : 1);
        if (hIdx === 1) room.hand1.push(cardToMove);
        else room.hand2.push(cardToMove);
        room.lastAction = `P${hIdx} kartı eline aldı`;
      } else if (target.type === 'front_top') {
        const fIdx = target.frontIndex;
        if (room.fronts[fIdx]) {
          room.fronts[fIdx].topCards.push(cardToMove);
          room.lastAction = `Cephe ${fIdx} (Üst) bölgesine kart oynandı`;
        }
      } else if (target.type === 'front_bottom') {
        const fIdx = target.frontIndex;
        if (room.fronts[fIdx]) {
          room.fronts[fIdx].bottomCards.push(cardToMove);
          room.lastAction = `Cephe ${fIdx} (Alt) bölgesine kart oynandı`;
        }
      } else if (target.type === 'front_env') {
        const fIdx = target.frontIndex;
        if (room.fronts[fIdx]) {
          if (!room.fronts[fIdx].environmentCards) room.fronts[fIdx].environmentCards = [];
          room.fronts[fIdx].environmentCards!.push(cardToMove);
          room.lastAction = `Cephe ${fIdx} çevre alanına taktik eklendi`;
        }
      } else if (target.type === 'tactics_top') {
        room.topTacticsSlot.push(cardToMove);
        room.lastAction = `Üst taktik yuvasına kart oynandı`;
      } else if (target.type === 'tactics_bottom') {
        room.bottomTacticsSlot.push(cardToMove);
        room.lastAction = `Alt taktik yuvasına kart oynandı`;
      } else if (target.type === 'discard') {
        room.discardPile.push(cardToMove);
        room.lastAction = `1 kart ıskartaya atıldı`;
      } else if (target.type === 'deck' || target.type === 'tactics_deck') {
        if (cardToMove.cardType === 'tactics' || cardToMove.suit === 'tactics') {
          room.tacticsDeck.unshift(cardToMove);
        } else {
          room.deck.unshift(cardToMove);
        }
        room.lastAction = `1 kart desteye iade edildi`;
      }
    }
  } else if (action === "FLIP_CARD") {
    const { cardId } = payload;
    if (role === 'spectator') return;
    if (role === 'p1' && room.hand2.some((c) => c.id === cardId)) return;
    if (role === 'p2' && room.hand1.some((c) => c.id === cardId)) return;

    const updateCard = (c: GameCard) => (c.id === cardId ? { ...c, isFaceDown: !c.isFaceDown } : c);

    for (let i = 1; i <= 9; i++) {
      const f = room.fronts[i];
      if (f) {
        f.topCards = f.topCards.map(updateCard);
        f.bottomCards = f.bottomCards.map(updateCard);
        if (f.environmentCards) f.environmentCards = f.environmentCards.map(updateCard);
      }
    }
    room.hand1 = room.hand1.map(updateCard);
    room.hand2 = room.hand2.map(updateCard);
    room.topTacticsSlot = room.topTacticsSlot.map(updateCard);
    room.bottomTacticsSlot = room.bottomTacticsSlot.map(updateCard);
    room.discardPile = room.discardPile.map(updateCard);
    room.lastAction = `Bir kartın yüzü çevrildi`;
  } else if (action === "CLAIM_FRONT") {
    const { frontIndex, player } = payload;
    if (room.fronts[frontIndex]) {
      const current = room.fronts[frontIndex].claimedBy;
      const next = current === player ? null : player;
      room.fronts[frontIndex].claimedBy = next;
      room.lastAction = next
        ? `Cephe ${frontIndex} bayrağı ${next === 'top' ? 'P2 (Üst)' : 'P1 (Alt)'} tarafından kazanıldı!`
        : `Cephe ${frontIndex} bayrak işareti kaldırıldı`;
    }
  } else if (action === "RESET_GAME") {
    const fresh = createNewRoomState(room.id);
    fresh.p1Name = room.p1Name;
    fresh.p2Name = room.p2Name;
    fresh.p1Online = room.p1Online;
    fresh.p2Online = room.p2Online;
    fresh.p1LastPing = room.p1LastPing;
    fresh.p2LastPing = room.p2LastPing;
    fresh.lastAction = `Masa sıfırlandı ve desteler yeniden karıştırıldı!`;
    rooms.set(room.id, fresh);
  } else if (action === "SHUFFLE_DECK") {
    room.deck = shuffle(room.deck);
    room.lastAction = `Birlik destesi karıştırıldı`;
  } else if (action === "SHUFFLE_TACTICS") {
    room.tacticsDeck = shuffle(room.tacticsDeck);
    room.lastAction = `Taktik destesi karıştırıldı`;
  }
}

function broadcastRoom(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  for (const [, meta] of clients.entries()) {
    if (meta.roomId === roomId && meta.ws.readyState === WebSocket.OPEN) {
      const sanitized = getSanitizedRoomState(room, meta.role || 'spectator');
      meta.ws.send(JSON.stringify({ type: 'ROOM_STATE', state: sanitized }));
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes (Zero-latency fallback for environments where WS upgrade is proxied)
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", activeRooms: rooms.size, timestamp: Date.now() });
  });

  // State sync endpoint (REST Fallback / Polling)
  app.get("/api/rooms/:roomId/state", (req, res) => {
    const roomId = (req.params.roomId || "BATTLE").trim().toUpperCase();
    const role = ((req.query.role as string) || "p1") as 'p1' | 'p2' | 'spectator';
    const playerName = (req.query.playerName as string) || (role === 'p2' ? 'Player 2' : 'Player 1');

    let room = rooms.get(roomId);
    if (!room) {
      room = createNewRoomState(roomId);
      rooms.set(roomId, room);
    }

    if (role === 'p1') {
      room.p1LastPing = Date.now();
      if (playerName) room.p1Name = playerName;
    } else if (role === 'p2') {
      room.p2LastPing = Date.now();
      if (playerName) room.p2Name = playerName;
    }

    res.json({ state: getSanitizedRoomState(room, role) });
  });

  // Action dispatch endpoint (REST Fallback)
  app.post("/api/rooms/:roomId/action", (req, res) => {
    const roomId = (req.params.roomId || "BATTLE").trim().toUpperCase();
    const { action, payload, role = 'p1', playerName } = req.body;

    let room = rooms.get(roomId);
    if (!room) {
      room = createNewRoomState(roomId);
      rooms.set(roomId, room);
    }

    if (role === 'p1') {
      room.p1LastPing = Date.now();
      if (playerName) room.p1Name = playerName;
    } else if (role === 'p2') {
      room.p2LastPing = Date.now();
      if (playerName) room.p2Name = playerName;
    }

    handleExecuteAction(room, role, action, payload);
    broadcastRoom(roomId);

    res.json({ success: true, state: getSanitizedRoomState(room, role) });
  });

  // Create HTTP server
  const server = http.createServer(app);

  // Attach WebSocket Server
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    const clientMeta: ClientMeta = { ws };
    clients.set(ws, clientMeta);

    ws.on("message", (raw) => {
      try {
        const message = JSON.parse(raw.toString());
        const { type } = message;

        if (type === "JOIN_ROOM") {
          const roomId = (message.roomId || "BATTLE").trim().toUpperCase();
          let requestedRole = message.role as 'p1' | 'p2' | 'spectator' | 'auto';
          const playerName = message.playerName || (requestedRole === 'p2' ? 'Player 2' : 'Player 1');

          let room = rooms.get(roomId);
          if (!room) {
            room = createNewRoomState(roomId);
            rooms.set(roomId, room);
          }

          if (!requestedRole || requestedRole === 'auto') {
            if (!room.p1Online) requestedRole = 'p1';
            else if (!room.p2Online) requestedRole = 'p2';
            else requestedRole = 'spectator';
          }

          clientMeta.roomId = roomId;
          clientMeta.role = requestedRole;
          clientMeta.playerName = playerName;

          if (requestedRole === 'p1') {
            room.p1Online = true;
            room.p1LastPing = Date.now();
            if (playerName) room.p1Name = playerName;
            room.lastAction = `${room.p1Name} (P1) odaya bağlandı`;
          } else if (requestedRole === 'p2') {
            room.p2Online = true;
            room.p2LastPing = Date.now();
            if (playerName) room.p2Name = playerName;
            room.lastAction = `${room.p2Name} (P2) odaya bağlandı`;
          }

          broadcastRoom(roomId);
        } else if (type === "GAME_ACTION") {
          const { roomId, action, payload } = message;
          const room = rooms.get(roomId);
          if (!room) return;

          const role = clientMeta.role || 'p1';
          if (role === 'p1') room.p1LastPing = Date.now();
          if (role === 'p2') room.p2LastPing = Date.now();

          handleExecuteAction(room, role, action, payload);
          broadcastRoom(roomId);
        }
      } catch (err) {
        console.error("WS message parse error:", err);
      }
    });

    ws.on("error", (err) => {
      // Gracefully handle WS connection error
      console.warn("Client WS connection event:", err.message);
    });

    ws.on("close", () => {
      const { roomId, role } = clientMeta;
      clients.delete(ws);
      if (roomId) {
        const room = rooms.get(roomId);
        if (room) {
          if (role === 'p1') room.p1Online = false;
          if (role === 'p2') room.p2Online = false;
        }
        broadcastRoom(roomId);
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Battle Line Arena Server running on port ${PORT}`);
  });
}

startServer();
