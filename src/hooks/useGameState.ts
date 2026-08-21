import { useState, useCallback } from 'react';
import { GameCard, FrontsState } from '../types';
import {
  createFullDeck,
  createTacticsDeck,
  shuffleDeck,
  createInitialFronts,
} from '../constants/cards';

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

interface GameDataState {
  deck: GameCard[];
  tacticsDeck: GameCard[];
  hand1: GameCard[];
  hand2: GameCard[];
  fronts: FrontsState;
  topTacticsSlot: GameCard[];
  bottomTacticsSlot: GameCard[];
  discardPile: GameCard[];
}

function createInitialGameState(): GameDataState {
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

export function useGameState() {
  const [gameState, setGameState] = useState<GameDataState>(createInitialGameState);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [activeDraggingCard, setActiveDraggingCard] = useState<GameCard | null>(null);
  const [activeHandIndex, setActiveHandIndex] = useState<1 | 2>(1);

  // Draw cards from Troop deck to active or specified hand
  const drawCard = useCallback(
    (count = 1, targetHand: 1 | 2 = activeHandIndex) => {
      setGameState((prev) => {
        if (prev.deck.length === 0) return prev;
        const drawCount = Math.min(count, prev.deck.length);
        const drawnCards = prev.deck.slice(0, drawCount);
        const remainingDeck = prev.deck.slice(drawCount);

        return {
          ...prev,
          deck: remainingDeck,
          hand1: targetHand === 1 ? [...prev.hand1, ...drawnCards] : prev.hand1,
          hand2: targetHand === 2 ? [...prev.hand2, ...drawnCards] : prev.hand2,
        };
      });
    },
    [activeHandIndex]
  );

  // Draw cards from Tactics deck to active or specified hand
  const drawTacticsCard = useCallback(
    (count = 1, targetHand: 1 | 2 = activeHandIndex) => {
      setGameState((prev) => {
        if (prev.tacticsDeck.length === 0) return prev;
        const drawCount = Math.min(count, prev.tacticsDeck.length);
        const drawnCards = prev.tacticsDeck.slice(0, drawCount);
        const remainingTactics = prev.tacticsDeck.slice(drawCount);

        return {
          ...prev,
          tacticsDeck: remainingTactics,
          hand1: targetHand === 1 ? [...prev.hand1, ...drawnCards] : prev.hand1,
          hand2: targetHand === 2 ? [...prev.hand2, ...drawnCards] : prev.hand2,
        };
      });
    },
    [activeHandIndex]
  );

  // Move a card atomically across any container in the table
  const moveCard = useCallback(
    (cardId: string, target: DropTarget) => {
      setGameState((prev) => {
        let cardToMove: GameCard | null = null;

        // Clone and filter fronts
        const newFronts: FrontsState = {};
        for (let i = 1; i <= 9; i++) {
          const currentFront = prev.fronts[i] || { topCards: [], bottomCards: [], environmentCards: [], claimedBy: null };
          const topFiltered = currentFront.topCards.filter((c) => {
            if (c.id === cardId) {
              cardToMove = c;
              return false;
            }
            return true;
          });

          const bottomFiltered = currentFront.bottomCards.filter((c) => {
            if (c.id === cardId) {
              cardToMove = c;
              return false;
            }
            return true;
          });

          const envFiltered = (currentFront.environmentCards || []).filter((c) => {
            if (c.id === cardId) {
              cardToMove = c;
              return false;
            }
            return true;
          });

          newFronts[i] = {
            ...currentFront,
            topCards: topFiltered,
            bottomCards: bottomFiltered,
            environmentCards: envFiltered,
          };
        }

        const newHand1 = prev.hand1.filter((c) => {
          if (c.id === cardId) {
            cardToMove = c;
            return false;
          }
          return true;
        });

        const newHand2 = prev.hand2.filter((c) => {
          if (c.id === cardId) {
            cardToMove = c;
            return false;
          }
          return true;
        });

        const newDiscard = prev.discardPile.filter((c) => {
          if (c.id === cardId) {
            cardToMove = c;
            return false;
          }
          return true;
        });

        const newTopTactics = prev.topTacticsSlot.filter((c) => {
          if (c.id === cardId) {
            cardToMove = c;
            return false;
          }
          return true;
        });

        const newBottomTactics = prev.bottomTacticsSlot.filter((c) => {
          if (c.id === cardId) {
            cardToMove = c;
            return false;
          }
          return true;
        });

        const newDeck = prev.deck.filter((c) => {
          if (c.id === cardId) {
            cardToMove = c;
            return false;
          }
          return true;
        });

        const newTacticsDeck = prev.tacticsDeck.filter((c) => {
          if (c.id === cardId) {
            cardToMove = c;
            return false;
          }
          return true;
        });

        // If card was not found anywhere, do nothing
        if (!cardToMove) {
          return prev;
        }

        // Place card into the target location
        if (target.type === 'hand') {
          const targetHand = target.handIndex || activeHandIndex;
          if (targetHand === 1) {
            newHand1.push(cardToMove);
          } else {
            newHand2.push(cardToMove);
          }
        } else if (target.type === 'front_top') {
          const fIdx = target.frontIndex;
          if (newFronts[fIdx]) {
            newFronts[fIdx].topCards.push(cardToMove);
          }
        } else if (target.type === 'front_bottom') {
          const fIdx = target.frontIndex;
          if (newFronts[fIdx]) {
            newFronts[fIdx].bottomCards.push(cardToMove);
          }
        } else if (target.type === 'front_env') {
          const fIdx = target.frontIndex;
          if (newFronts[fIdx]) {
            if (!newFronts[fIdx].environmentCards) {
              newFronts[fIdx].environmentCards = [];
            }
            newFronts[fIdx].environmentCards!.push(cardToMove);
          }
        } else if (target.type === 'tactics_top') {
          newTopTactics.push(cardToMove);
        } else if (target.type === 'tactics_bottom') {
          newBottomTactics.push(cardToMove);
        } else if (target.type === 'discard') {
          newDiscard.push(cardToMove);
        } else if (target.type === 'deck') {
          // If it's a tactic card dropped to 'deck', route to tactics deck if preferred or top of deck
          if (cardToMove.cardType === 'tactics' || cardToMove.suit === 'tactics') {
            newTacticsDeck.unshift(cardToMove);
          } else {
            newDeck.unshift(cardToMove);
          }
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

      setSelectedCardId(null);
      setActiveDraggingCard(null);
    },
    [activeHandIndex]
  );

  // Flip card
  const flipCard = useCallback((cardId: string) => {
    setGameState((prev) => {
      const updateCard = (c: GameCard) =>
        c.id === cardId ? { ...c, isFaceDown: !c.isFaceDown } : c;

      const newFronts: FrontsState = {};
      for (let i = 1; i <= 9; i++) {
        const currentFront = prev.fronts[i] || { topCards: [], bottomCards: [], environmentCards: [], claimedBy: null };
        newFronts[i] = {
          ...currentFront,
          topCards: currentFront.topCards.map(updateCard),
          bottomCards: currentFront.bottomCards.map(updateCard),
          environmentCards: (currentFront.environmentCards || []).map(updateCard),
        };
      }

      return {
        deck: prev.deck.map(updateCard),
        tacticsDeck: prev.tacticsDeck.map(updateCard),
        hand1: prev.hand1.map(updateCard),
        hand2: prev.hand2.map(updateCard),
        topTacticsSlot: prev.topTacticsSlot.map(updateCard),
        bottomTacticsSlot: prev.bottomTacticsSlot.map(updateCard),
        discardPile: prev.discardPile.map(updateCard),
        fronts: newFronts,
      };
    });
  }, []);

  // Return card to player's hand
  const returnToHand = useCallback(
    (cardId: string, handTarget: 1 | 2 = 1) => {
      moveCard(cardId, { type: 'hand', handIndex: handTarget });
    },
    [moveCard]
  );

  // Discard card
  const discardCard = useCallback(
    (cardId: string) => {
      moveCard(cardId, { type: 'discard' });
    },
    [moveCard]
  );

  // Shuffle Troop deck
  const shuffleCurrentDeck = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      deck: shuffleDeck(prev.deck),
    }));
  }, []);

  // Shuffle Tactics deck
  const shuffleTacticsDeck = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      tacticsDeck: shuffleDeck(prev.tacticsDeck),
    }));
  }, []);

  // Reset entire game
  const resetGame = useCallback(() => {
    setGameState(createInitialGameState());
    setSelectedCardId(null);
    setActiveDraggingCard(null);
  }, []);

  // Sort Hand
  const sortHand = useCallback((handIndex: 1 | 2, by: 'value' | 'suit') => {
    const sortFn = (a: GameCard, b: GameCard) => {
      // Put tactics cards together
      const aIsTactics = a.cardType === 'tactics' || a.suit === 'tactics';
      const bIsTactics = b.cardType === 'tactics' || b.suit === 'tactics';
      if (aIsTactics && !bIsTactics) return 1;
      if (!aIsTactics && bIsTactics) return -1;
      if (aIsTactics && bIsTactics) {
        return (a.title || '').localeCompare(b.title || '');
      }

      if (by === 'value') {
        if (a.value !== b.value) return a.value - b.value;
        return a.suit.localeCompare(b.suit);
      } else {
        if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
        return a.value - b.value;
      }
    };

    setGameState((prev) => ({
      ...prev,
      hand1: handIndex === 1 ? [...prev.hand1].sort(sortFn) : prev.hand1,
      hand2: handIndex === 2 ? [...prev.hand2].sort(sortFn) : prev.hand2,
    }));
  }, []);

  // Set or toggle front claim marker for specific player
  const setFrontClaim = useCallback((frontIndex: number, player: 'top' | 'bottom' | null) => {
    setGameState((prev) => {
      const current = prev.fronts[frontIndex]?.claimedBy;
      // If clicking the already selected player, reset to null; otherwise set to clicked player
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
  }, []);

  // Toggle front claim marker (legacy support)
  const toggleFrontClaim = useCallback((frontIndex: number) => {
    setGameState((prev) => {
      const current = prev.fronts[frontIndex]?.claimedBy;
      const next = current === null ? 'bottom' : current === 'bottom' ? 'top' : null;
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
  }, []);

  return {
    deck: gameState.deck,
    tacticsDeck: gameState.tacticsDeck,
    hand1: gameState.hand1,
    hand2: gameState.hand2,
    fronts: gameState.fronts,
    topTacticsSlot: gameState.topTacticsSlot,
    bottomTacticsSlot: gameState.bottomTacticsSlot,
    discardPile: gameState.discardPile,
    selectedCardId,
    setActiveDraggingCard,
    activeHandIndex,
    setSelectedCardId,
    setActiveDraggingCardState: setActiveDraggingCard,
    setActiveHandIndex,
    drawCard,
    drawTacticsCard,
    moveCard,
    flipCard,
    returnToHand,
    discardCard,
    shuffleCurrentDeck,
    shuffleTacticsDeck,
    resetGame,
    sortHand,
    toggleFrontClaim,
    setFrontClaim,
  };
}

