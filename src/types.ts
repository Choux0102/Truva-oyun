import type React from 'react';

export type CardSuitId = 'suit1' | 'suit2' | 'suit3' | 'suit4' | 'suit5' | 'suit6' | 'tactics';

export type CardType = 'unit' | 'tactics';

export interface CardSuit {
  id: CardSuitId;
  name: string;
  symbol: string;
  colorName: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  borderAccent: string;
}

export interface GameCard {
  id: string; // unique card id like 'suit1-7' or 'tactic-ek-taarruz'
  suit: CardSuitId;
  suitName: string;
  value: number; // 1 to 10 for units, 0 or special for tactics
  symbol: string;
  colorName: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  borderAccent: string;
  isFaceDown?: boolean;
  cardType?: CardType;
  title?: string;
  description?: string;
}

export type SlotPosition = 'top' | 'bottom' | 'center';

export interface FrontSlot {
  id: string; // e.g. 'front-1'
  index: number; // 1 to 9
  name: string;
  topCards: GameCard[];
  bottomCards: GameCard[];
  claimedBy?: 'top' | 'bottom' | null; // Optional token/flag state
}

export interface FrontSlotData {
  topCards: GameCard[];
  bottomCards: GameCard[];
  environmentCards?: GameCard[];
  claimedBy?: 'top' | 'bottom' | null;
}

export type FrontsState = Record<number, FrontSlotData>;

export interface TacticsSlotsState {
  topTactics: GameCard[];
  bottomTactics: GameCard[];
}

export interface DragItem {
  cardId: string;
  source: {
    type: 'hand' | 'hand2' | 'front_top' | 'front_bottom' | 'front_env' | 'tactics_top' | 'tactics_bottom' | 'discard' | 'deck' | 'tactics_deck';
    frontIndex?: number;
  };
}

export type ThemeMode = 'dark' | 'light';

export function getCardIdFromDragEvent(e?: React.DragEvent | null): string | null {
  if (!e || !e.dataTransfer) return null;
  try {
    const directId = e.dataTransfer.getData('cardId');
    if (directId) return directId;

    const plain = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/json');
    if (plain) {
      if (plain.startsWith('{')) {
        const parsed = JSON.parse(plain);
        if (parsed.cardId) return parsed.cardId;
      }
      return plain;
    }
  } catch {
    // fallback
  }
  return null;
}

