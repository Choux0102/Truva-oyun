import { CardSuit, GameCard, FrontsState } from '../types';

export const CARD_SUITS: CardSuit[] = [
  {
    id: 'suit1',
    name: 'Turuncu',
    symbol: '◆',
    colorName: 'Turuncu',
    badgeBg: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    badgeText: 'text-orange-400',
    accentColor: '#F97316',
    borderAccent: 'border-orange-500/40',
  },
  {
    id: 'suit2',
    name: 'Kırmızı',
    symbol: '▲',
    colorName: 'Kırmızı',
    badgeBg: 'bg-red-500/20 text-red-400 border-red-500/40',
    badgeText: 'text-red-400',
    accentColor: '#EF4444',
    borderAccent: 'border-red-500/40',
  },
  {
    id: 'suit3',
    name: 'Turkuaz',
    symbol: '⬢',
    colorName: 'Turkuaz',
    badgeBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    badgeText: 'text-cyan-400',
    accentColor: '#06B6D4',
    borderAccent: 'border-cyan-500/40',
  },
  {
    id: 'suit4',
    name: 'Kahverengi',
    symbol: '★',
    colorName: 'Kahverengi',
    badgeBg: 'bg-amber-900/30 text-amber-300 border-amber-800/50',
    badgeText: 'text-amber-400',
    accentColor: '#92400E',
    borderAccent: 'border-amber-700/40',
  },
  {
    id: 'suit5',
    name: 'Gri',
    symbol: '◈',
    colorName: 'Gri',
    badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    badgeText: 'text-slate-300',
    accentColor: '#94A3B8',
    borderAccent: 'border-slate-500/40',
  },
  {
    id: 'suit6',
    name: 'Sarı',
    symbol: '●',
    colorName: 'Sarı',
    badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    badgeText: 'text-yellow-400',
    accentColor: '#EAB308',
    borderAccent: 'border-yellow-500/40',
  },
];

export const TACTICS_DEFINITIONS: Omit<GameCard, 'id' | 'isFaceDown'>[] = [
  {
    suit: 'tactics',
    suitName: 'Taktik',
    value: 8,
    symbol: '⚔',
    colorName: 'Taktik',
    badgeBg: 'bg-purple-900/30 text-purple-300 border-purple-700/50',
    badgeText: 'text-purple-300',
    accentColor: '#A855F7',
    borderAccent: 'border-purple-500/50',
    cardType: 'tactics',
    title: 'Ek Taarruz',
    description:
      'Birlik kartı gibi kullanabildiğiniz bu kartı, 8 değerinde olan herhangi bir renkli birlik kartı olarak oynayabilirsiniz. Kartın rengini ise cephe sonuçlanırken belirlersiniz.',
  },
  {
    suit: 'tactics',
    suitName: 'Taktik',
    value: 0,
    symbol: '🛡',
    colorName: 'Taktik',
    badgeBg: 'bg-purple-900/30 text-purple-300 border-purple-700/50',
    badgeText: 'text-purple-300',
    accentColor: '#8B5CF6',
    borderAccent: 'border-purple-500/50',
    cardType: 'tactics',
    title: 'Savunma Hattı',
    description:
      'Birlik kartı gibi kullanabildiğiniz bu kartı, 1, 2 ya da 3 değerinde olan herhangi bir renkli birlik kartı olarak oynayabilirsiniz. Kartın değerini ve rengini ise cephe sonuçlanırken belirlersiniz.',
  },
  {
    suit: 'tactics',
    suitName: 'Taktik',
    value: 0,
    symbol: '👑',
    colorName: 'Taktik',
    badgeBg: 'bg-pink-900/30 text-pink-300 border-pink-700/50',
    badgeText: 'text-pink-300',
    accentColor: '#EC4899',
    borderAccent: 'border-pink-500/50',
    cardType: 'tactics',
    title: 'Lider: Achilles',
    description:
      'Bu kartı istediğiniz herhangi bir değer ve renkteki birlik kartı yerine koyabilirsiniz.',
  },
  {
    suit: 'tactics',
    suitName: 'Taktik',
    value: 0,
    symbol: '👑',
    colorName: 'Taktik',
    badgeBg: 'bg-pink-900/30 text-pink-300 border-pink-700/50',
    badgeText: 'text-pink-300',
    accentColor: '#EC4899',
    borderAccent: 'border-pink-500/50',
    cardType: 'tactics',
    title: 'Lider: Hector',
    description:
      'Bu kartı istediğiniz herhangi bir değer ve renkteki birlik kartı yerine koyabilirsiniz.',
  },
  {
    suit: 'tactics',
    suitName: 'Taktik',
    value: 0,
    symbol: '〰',
    colorName: 'Taktik',
    badgeBg: 'bg-emerald-900/30 text-emerald-300 border-emerald-700/50',
    badgeText: 'text-emerald-300',
    accentColor: '#10B981',
    borderAccent: 'border-emerald-500/50',
    cardType: 'tactics',
    title: 'Bataklık',
    description:
      'Bu kart oynandığı cephe üzerindeki formasyonu genişletir ve cephenin sonuçlanması için oyuncuların 4 kart koyması gerekir.',
  },
  {
    suit: 'tactics',
    suitName: 'Taktik',
    value: 0,
    symbol: '☁',
    colorName: 'Taktik',
    badgeBg: 'bg-slate-800/40 text-slate-300 border-slate-600/50',
    badgeText: 'text-slate-300',
    accentColor: '#94A3B8',
    borderAccent: 'border-slate-400/50',
    cardType: 'tactics',
    title: 'Sis',
    description:
      'Bu kart oynandığı cephe üzerinde bulunan bütün formasyonları ortadan kaldırır. Söz konusu cephede toplam kart değeri en yüksek rakama sahip olan oyuncu, cepheyi kazanır.',
  },
  {
    suit: 'tactics',
    suitName: 'Taktik',
    value: 0,
    symbol: '👁',
    colorName: 'Taktik',
    badgeBg: 'bg-cyan-900/30 text-cyan-300 border-cyan-700/50',
    badgeText: 'text-cyan-300',
    accentColor: '#06B6D4',
    borderAccent: 'border-cyan-500/50',
    cardType: 'tactics',
    title: 'Gözcü',
    description:
      'Oyuncu, birlik veya taktik destelerinden toplamda 3 adet kart çeker ve eline ekler. Ardından ise, elinde bulunan kartlardan istemediği 2 tanesini, yüzü kapalı olacak şekilde, ilgili destelerin üzerine yerleştirir.',
  },
  {
    suit: 'tactics',
    suitName: 'Taktik',
    value: 0,
    symbol: '🔄',
    colorName: 'Taktik',
    badgeBg: 'bg-blue-900/30 text-blue-300 border-blue-700/50',
    badgeText: 'text-blue-300',
    accentColor: '#3B82F6',
    borderAccent: 'border-blue-500/50',
    cardType: 'tactics',
    title: 'Takviye Birlik',
    description:
      'Oyuncu, kendi tarafında bulunan sonuçlanmamış bir cephedeki bir birlik ya da taktik kartını alarak, dilediği başka bir cephesine oynayabilir. Ya da seçtiği birlik kartını, yüzü açık şekilde masanın kenarına koyarak, ıskartaya çıkarabilir.',
  },
  {
    suit: 'tactics',
    suitName: 'Taktik',
    value: 0,
    symbol: '⚡',
    colorName: 'Taktik',
    badgeBg: 'bg-amber-900/30 text-amber-300 border-amber-700/50',
    badgeText: 'text-amber-300',
    accentColor: '#F59E0B',
    borderAccent: 'border-amber-500/50',
    cardType: 'tactics',
    title: 'Firari',
    description:
      'Oyuncu, rakibin tarafında bulunan sonuçlanmamış bir cephedeki bir birlik ya da taktik kartını alır ve bu kartı, yüzü açık şekilde ıskartaya çıkarır.',
  },
  {
    suit: 'tactics',
    suitName: 'Taktik',
    value: 0,
    symbol: '🗡',
    colorName: 'Taktik',
    badgeBg: 'bg-red-900/30 text-red-300 border-red-700/50',
    badgeText: 'text-red-300',
    accentColor: '#EF4444',
    borderAccent: 'border-red-500/50',
    cardType: 'tactics',
    title: 'Hain',
    description:
      'Oyuncu, rakibin tarafında bulunan sonuçlanmamış bir cephedeki bir birlik kartını alarak, kendi tarafındaki bir cepheye oynayabilir.',
  },
];

export function createFullDeck(): GameCard[] {
  const deck: GameCard[] = [];
  
  CARD_SUITS.forEach((suit) => {
    for (let value = 1; value <= 10; value++) {
      deck.push({
        id: `${suit.id}-${value}`,
        suit: suit.id,
        suitName: suit.name,
        value,
        symbol: suit.symbol,
        colorName: suit.colorName,
        badgeBg: suit.badgeBg,
        badgeText: suit.badgeText,
        accentColor: suit.accentColor,
        borderAccent: suit.borderAccent,
        isFaceDown: false,
        cardType: 'unit',
      });
    }
  });

  return deck;
}

export function createTacticsDeck(): GameCard[] {
  return TACTICS_DEFINITIONS.map((t, idx) => ({
    ...t,
    id: `tactic-${idx + 1}-${t.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    isFaceDown: false,
  }));
}


export function shuffleDeck(cards: GameCard[]): GameCard[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createInitialFronts(): FrontsState {
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
