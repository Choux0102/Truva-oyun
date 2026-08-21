import { useState, useEffect, useRef, useCallback } from 'react';
import { GameCard, FrontsState } from '../types';
import {
  createFullDeck,
  createTacticsDeck,
  shuffleDeck,
  createInitialFronts,
} from '../constants/cards';

export type PlayerRole = 'p1' | 'p2' | 'spectator' | 'local';

export type DropTarget =
  | { type: 'hand'; handIndex?: 1 | 2 }
  | { type: 'front_top'; frontIndex: number }
  | { type: 'front_bottom'; frontIndex: number }
  | { type: 'front_env'; frontIndex: number }
  | { type: 'tactics_top' }
  | { type: 'tactics_bottom' }
  | { type: 'discard' }
  | { type: 'deck' }
  | { type: 'tactics_deck' };

export interface ServerRoomState {
  id: string;
  deckCount: number;
  tacticsDeckCount: number;
  hand1: GameCard[];
  hand2: GameCard[];
  hand1Count: number;
  hand2Count: number;
  fronts: FrontsState;
  topTacticsSlot: GameCard[];
  bottomTacticsSlot: GameCard[];
  discardPile: GameCard[];
  p1Online: boolean;
  p2Online: boolean;
  p1Name: string;
  p2Name: string;
  lastAction?: string;
  lastUpdated?: number;
  yourRole: PlayerRole;
}

interface LocalGameState {
  deck: GameCard[];
  tacticsDeck: GameCard[];
  hand1: GameCard[];
  hand2: GameCard[];
  fronts: FrontsState;
  topTacticsSlot: GameCard[];
  bottomTacticsSlot: GameCard[];
  discardPile: GameCard[];
}

function createInitialLocalState(): LocalGameState {
  const shuffledUnits = shuffleDeck(createFullDeck());
  const initialHand1 = shuffledUnits.slice(0, 7);
  const initialHand2 = shuffledUnits.slice(7, 14);
  const remainingUnits = shuffledUnits.slice(14);
  const shuffledTactics = shuffleDeck(createTacticsDeck());

  return {
    deck: remainingUnits,
    tacticsDeck: shuffledTactics,
    hand1: initialHand1,
    hand2: initialHand2,
    fronts: createInitialFronts(),
    topTacticsSlot: [],
    bottomTacticsSlot: [],
    discardPile: [],
  };
}

export function useMultiplayer() {
  // Read initial room and role from URL params if present
  const queryParams = new URLSearchParams(window.location.search);
  const initialRoomId = (queryParams.get('room') || 'ARENA-1').toUpperCase();
  const initialRole = (queryParams.get('role') as PlayerRole) || 'p1';

  const [roomId, setRoomId] = useState<string>(initialRoomId);
  const [role, setRole] = useState<PlayerRole>(initialRole);
  const [playerName, setPlayerName] = useState<string>(
    initialRole === 'p2' ? 'Player 2' : 'Player 1'
  );

  const [isConnected, setIsConnected] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [serverState, setServerState] = useState<ServerRoomState | null>(null);
  const [lastActionText, setLastActionText] = useState<string>('Oda bağlantısı hazır');

  // Fallback Local State
  const [localState, setLocalState] = useState<LocalGameState>(createInitialLocalState);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [activeDraggingCard, setActiveDraggingCard] = useState<GameCard | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const isWsActive = useRef(false);

  // Send action to server or apply locally
  const sendAction = useCallback(
    async (action: string, payload: any = {}) => {
      if (role === 'local') return;

      // If WebSocket is open, send via WS
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'GAME_ACTION',
            roomId,
            action,
            payload,
          })
        );
      } else {
        // Fallback to HTTP REST dispatch
        try {
          const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action,
              payload,
              role,
              playerName,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.state) {
              setServerState(data.state);
              if (data.state.lastAction) {
                setLastActionText(data.state.lastAction);
              }
            }
          }
        } catch {
          // Ignore transient fetch error
        }
      }
    },
    [roomId, role, playerName]
  );

  // Sync state via HTTP REST
  const fetchRoomState = useCallback(async () => {
    if (role === 'local') return;
    try {
      const res = await fetch(
        `/api/rooms/${encodeURIComponent(roomId)}/state?role=${encodeURIComponent(
          role
        )}&playerName=${encodeURIComponent(playerName)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setServerState(data.state);
          setIsConnected(true);
          if (data.state.lastAction) {
            setLastActionText(data.state.lastAction);
          }
        }
      }
    } catch {
      // Keep existing state
    }
  }, [roomId, role, playerName]);

  // Initial HTTP Fetch & Periodic Fallback Polling
  useEffect(() => {
    if (role === 'local') {
      setIsConnected(false);
      return;
    }

    // Initial state fetch
    fetchRoomState();

    // Polling interval (acts as fallback if WS fails in sandboxed iframe or reverse proxy)
    const interval = setInterval(() => {
      if (!isWsActive.current) {
        fetchRoomState();
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [fetchRoomState, role]);

  // WebSocket Connection Lifecycle
  useEffect(() => {
    if (role === 'local') {
      return;
    }

    let isUnmounted = false;
    setIsConnecting(true);

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isUnmounted) return;
        isWsActive.current = true;
        setIsConnected(true);
        setIsConnecting(false);

        // Join Room
        ws.send(
          JSON.stringify({
            type: 'JOIN_ROOM',
            roomId,
            role,
            playerName,
          })
        );
      };

      ws.onmessage = (evt) => {
        if (isUnmounted) return;
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type === 'ROOM_STATE') {
            setServerState(msg.state);
            if (msg.state.lastAction) {
              setLastActionText(msg.state.lastAction);
            }
          }
        } catch {
          // Ignore malformed message
        }
      };

      ws.onclose = () => {
        isWsActive.current = false;
        if (!isUnmounted) {
          setIsConnecting(false);
        }
      };

      ws.onerror = () => {
        // Gracefully handle WS error in iframe sandboxes without uncaught exceptions
        isWsActive.current = false;
        if (!isUnmounted) {
          setIsConnecting(false);
        }
      };

      return () => {
        isUnmounted = true;
        isWsActive.current = false;
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      };
    } catch {
      // WS constructor failed in constrained environment; HTTP polling handles state
      isWsActive.current = false;
      setIsConnecting(false);
    }
  }, [roomId, role, playerName]);

  // Actions
  const drawCard = useCallback(
    (count = 1, targetHand?: 1 | 2) => {
      const hTarget = targetHand || (role === 'p2' ? 2 : 1);
      if (role !== 'local') {
        sendAction('DRAW_CARD', { count, targetHand: hTarget });
      } else {
        setLocalState((prev) => {
          if (prev.deck.length === 0) return prev;
          const drawCount = Math.min(count, prev.deck.length);
          const drawn = prev.deck.slice(0, drawCount);
          return {
            ...prev,
            deck: prev.deck.slice(drawCount),
            hand1: hTarget === 1 ? [...prev.hand1, ...drawn] : prev.hand1,
            hand2: hTarget === 2 ? [...prev.hand2, ...drawn] : prev.hand2,
          };
        });
      }
    },
    [role, sendAction]
  );

  const drawTacticsCard = useCallback(
    (count = 1, targetHand?: 1 | 2) => {
      const hTarget = targetHand || (role === 'p2' ? 2 : 1);
      if (role !== 'local') {
        sendAction('DRAW_TACTICS', { count, targetHand: hTarget });
      } else {
        setLocalState((prev) => {
          if (prev.tacticsDeck.length === 0) return prev;
          const drawCount = Math.min(count, prev.tacticsDeck.length);
          const drawn = prev.tacticsDeck.slice(0, drawCount);
          return {
            ...prev,
            tacticsDeck: prev.tacticsDeck.slice(drawCount),
            hand1: hTarget === 1 ? [...prev.hand1, ...drawn] : prev.hand1,
            hand2: hTarget === 2 ? [...prev.hand2, ...drawn] : prev.hand2,
          };
        });
      }
    },
    [role, sendAction]
  );

  const moveCard = useCallback(
    (cardId: string, target: DropTarget) => {
      const activeState = serverState || localState;
      if (role === 'spectator') return;
      if (role === 'p1' && activeState.hand2.some((c) => c.id === cardId)) return;
      if (role === 'p2' && activeState.hand1.some((c) => c.id === cardId)) return;

      if (role !== 'local') {
        sendAction('MOVE_CARD', { cardId, target });
      } else {
        setLocalState((prev) => {
          let cardToMove: GameCard | null = null;
          const newFronts: FrontsState = {};
          for (let i = 1; i <= 9; i++) {
            const f = prev.fronts[i] || { topCards: [], bottomCards: [], environmentCards: [], claimedBy: null };
            newFronts[i] = {
              ...f,
              topCards: f.topCards.filter((c) => { if (c.id === cardId) { cardToMove = c; return false; } return true; }),
              bottomCards: f.bottomCards.filter((c) => { if (c.id === cardId) { cardToMove = c; return false; } return true; }),
              environmentCards: (f.environmentCards || []).filter((c) => { if (c.id === cardId) { cardToMove = c; return false; } return true; }),
            };
          }

          const newHand1 = prev.hand1.filter((c) => { if (c.id === cardId) { cardToMove = c; return false; } return true; });
          const newHand2 = prev.hand2.filter((c) => { if (c.id === cardId) { cardToMove = c; return false; } return true; });
          const newDiscard = prev.discardPile.filter((c) => { if (c.id === cardId) { cardToMove = c; return false; } return true; });
          const newTopTactics = prev.topTacticsSlot.filter((c) => { if (c.id === cardId) { cardToMove = c; return false; } return true; });
          const newBottomTactics = prev.bottomTacticsSlot.filter((c) => { if (c.id === cardId) { cardToMove = c; return false; } return true; });
          const newDeck = prev.deck.filter((c) => { if (c.id === cardId) { cardToMove = c; return false; } return true; });
          const newTacticsDeck = prev.tacticsDeck.filter((c) => { if (c.id === cardId) { cardToMove = c; return false; } return true; });

          if (!cardToMove) return prev;

          if (target.type === 'hand') {
            const h = target.handIndex || (role === 'p2' ? 2 : 1);
            if (h === 1) newHand1.push(cardToMove);
            else newHand2.push(cardToMove);
          } else if (target.type === 'front_top') {
            if (newFronts[target.frontIndex]) newFronts[target.frontIndex].topCards.push(cardToMove);
          } else if (target.type === 'front_bottom') {
            if (newFronts[target.frontIndex]) newFronts[target.frontIndex].bottomCards.push(cardToMove);
          } else if (target.type === 'front_env') {
            if (newFronts[target.frontIndex]) {
              if (!newFronts[target.frontIndex].environmentCards) newFronts[target.frontIndex].environmentCards = [];
              newFronts[target.frontIndex].environmentCards!.push(cardToMove);
            }
          } else if (target.type === 'tactics_top') {
            newTopTactics.push(cardToMove);
          } else if (target.type === 'tactics_bottom') {
            newBottomTactics.push(cardToMove);
          } else if (target.type === 'discard') {
            newDiscard.push(cardToMove);
          } else if (target.type === 'deck') {
            if (cardToMove.cardType === 'tactics' || cardToMove.suit === 'tactics') newTacticsDeck.unshift(cardToMove);
            else newDeck.unshift(cardToMove);
          } else if (target.type === 'tactics_deck') {
            newTacticsDeck.unshift(cardToMove);
          }

          return {
            deck: newDeck,
            tacticsDeck: newTacticsDeck,
            hand1: newHand1,
            hand2: newHand2,
            fronts: newFronts,
            topTacticsSlot: newTopTactics,
            bottomTacticsSlot: newBottomTactics,
            discardPile: newDiscard,
          };
        });
      }
      setSelectedCardId(null);
      setActiveDraggingCard(null);
    },
    [role, sendAction]
  );

  const flipCard = useCallback(
    (cardId: string) => {
      const activeState = serverState || localState;
      if (role === 'spectator') return;
      if (role === 'p1' && activeState.hand2.some((c) => c.id === cardId)) return;
      if (role === 'p2' && activeState.hand1.some((c) => c.id === cardId)) return;

      if (role !== 'local') {
        sendAction('FLIP_CARD', { cardId });
      } else {
        setLocalState((prev) => {
          const update = (c: GameCard) => (c.id === cardId ? { ...c, isFaceDown: !c.isFaceDown } : c);
          const newFronts: FrontsState = {};
          for (let i = 1; i <= 9; i++) {
            const f = prev.fronts[i] || { topCards: [], bottomCards: [], environmentCards: [], claimedBy: null };
            newFronts[i] = {
              ...f,
              topCards: f.topCards.map(update),
              bottomCards: f.bottomCards.map(update),
              environmentCards: (f.environmentCards || []).map(update),
            };
          }
          return {
            deck: prev.deck.map(update),
            tacticsDeck: prev.tacticsDeck.map(update),
            hand1: prev.hand1.map(update),
            hand2: prev.hand2.map(update),
            topTacticsSlot: prev.topTacticsSlot.map(update),
            bottomTacticsSlot: prev.bottomTacticsSlot.map(update),
            discardPile: prev.discardPile.map(update),
            fronts: newFronts,
          };
        });
      }
    },
    [role, sendAction]
  );

  const setFrontClaim = useCallback(
    (frontIndex: number, player: 'top' | 'bottom' | null) => {
      if (role !== 'local') {
        sendAction('CLAIM_FRONT', { frontIndex, player });
      } else {
        setLocalState((prev) => {
          const current = prev.fronts[frontIndex]?.claimedBy;
          const next = current === player ? null : player;
          return {
            ...prev,
            fronts: {
              ...prev.fronts,
              [frontIndex]: {
                ...prev.fronts[frontIndex],
                claimedBy: next,
              },
            },
          };
        });
      }
    },
    [role, sendAction]
  );

  const toggleFrontClaim = useCallback(
    (frontIndex: number) => {
      const current = (serverState?.fronts || localState.fronts)[frontIndex]?.claimedBy;
      const next = current === null ? 'bottom' : current === 'bottom' ? 'top' : null;
      setFrontClaim(frontIndex, next);
    },
    [serverState, localState, setFrontClaim]
  );

  const returnToHand = useCallback(
    (cardId: string, handTarget?: 1 | 2) => {
      const hTarget = handTarget || (role === 'p2' ? 2 : 1);
      moveCard(cardId, { type: 'hand', handIndex: hTarget });
    },
    [moveCard, role]
  );

  const discardCard = useCallback(
    (cardId: string) => {
      moveCard(cardId, { type: 'discard' });
    },
    [moveCard]
  );

  const returnToDeck = useCallback(
    (cardId: string) => {
      moveCard(cardId, { type: 'deck' });
    },
    [moveCard]
  );

  const resetGame = useCallback(() => {
    if (role !== 'local') {
      sendAction('RESET_GAME');
    } else {
      setLocalState(createInitialLocalState());
      setSelectedCardId(null);
      setActiveDraggingCard(null);
    }
  }, [role, sendAction]);

  const shuffleCurrentDeck = useCallback(() => {
    if (role !== 'local') {
      sendAction('SHUFFLE_DECK');
    } else {
      setLocalState((prev) => ({ ...prev, deck: shuffleDeck(prev.deck) }));
    }
  }, [role, sendAction]);

  const shuffleTacticsDeck = useCallback(() => {
    if (role !== 'local') {
      sendAction('SHUFFLE_TACTICS');
    } else {
      setLocalState((prev) => ({ ...prev, tacticsDeck: shuffleDeck(prev.tacticsDeck) }));
    }
  }, [role, sendAction]);

  const sortHand = useCallback(
    (handIndex: 1 | 2, by: 'value' | 'suit') => {
      if (role === 'spectator') return;
      if (role === 'p1' && handIndex === 2) return;
      if (role === 'p2' && handIndex === 1) return;

      const sortFn = (a: GameCard, b: GameCard) => {
        const aIsTactics = a.cardType === 'tactics' || a.suit === 'tactics';
        const bIsTactics = b.cardType === 'tactics' || b.suit === 'tactics';
        if (aIsTactics && !bIsTactics) return 1;
        if (!aIsTactics && bIsTactics) return -1;
        if (aIsTactics && bIsTactics) return (a.title || '').localeCompare(b.title || '');

        if (by === 'value') {
          if (a.value !== b.value) return a.value - b.value;
          return a.suit.localeCompare(b.suit);
        } else {
          if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
          return a.value - b.value;
        }
      };

      if (role === 'local') {
        setLocalState((prev) => ({
          ...prev,
          hand1: handIndex === 1 ? [...prev.hand1].sort(sortFn) : prev.hand1,
          hand2: handIndex === 2 ? [...prev.hand2].sort(sortFn) : prev.hand2,
        }));
      } else if (serverState) {
        setServerState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            hand1: handIndex === 1 ? [...prev.hand1].sort(sortFn) : prev.hand1,
            hand2: handIndex === 2 ? [...prev.hand2].sort(sortFn) : prev.hand2,
          };
        });
      }
    },
    [role, serverState]
  );

  // Switch Room or Role
  const changeRoom = (newRoomId: string, newRole: PlayerRole, newName?: string) => {
    setRoomId(newRoomId.toUpperCase());
    setRole(newRole);
    if (newName) setPlayerName(newName);
    // Update URL without reload
    const url = new URL(window.location.href);
    url.searchParams.set('room', newRoomId.toUpperCase());
    url.searchParams.set('role', newRole);
    window.history.replaceState({}, '', url.toString());
  };

  // Compile active data depending on server vs local
  const currentHand1 = serverState ? serverState.hand1 : localState.hand1;
  const currentHand2 = serverState ? serverState.hand2 : localState.hand2;
  const currentFronts = serverState ? serverState.fronts : localState.fronts;
  const currentTopTactics = serverState ? serverState.topTacticsSlot : localState.topTacticsSlot;
  const currentBottomTactics = serverState ? serverState.bottomTacticsSlot : localState.bottomTacticsSlot;
  const currentDiscard = serverState ? serverState.discardPile : localState.discardPile;
  const currentDeckCount = serverState ? serverState.deckCount : localState.deck.length;
  const currentTacticsDeckCount = serverState ? serverState.tacticsDeckCount : localState.tacticsDeck.length;

  return {
    roomId,
    role,
    playerName,
    isConnected,
    isConnecting,
    serverState,
    lastActionText,
    // Data
    deckCount: currentDeckCount,
    tacticsDeckCount: currentTacticsDeckCount,
    hand1: currentHand1,
    hand2: currentHand2,
    fronts: currentFronts,
    topTacticsSlot: currentTopTactics,
    bottomTacticsSlot: currentBottomTactics,
    discardPile: currentDiscard,
    selectedCardId,
    setSelectedCardId,
    activeDraggingCard,
    setActiveDraggingCard,
    // Actions
    drawCard,
    drawTacticsCard,
    moveCard,
    flipCard,
    returnToHand,
    returnToDeck,
    discardCard,
    resetGame,
    shuffleCurrentDeck,
    shuffleTacticsDeck,
    sortHand,
    setFrontClaim,
    toggleFrontClaim,
    changeRoom,
  };
}
