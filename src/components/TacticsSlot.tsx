import React, { useState } from 'react';
import { GameCard } from '../types';
import { CardView } from './CardView';
import { Shield, Sparkles } from 'lucide-react';

interface TacticsSlotProps {
  label: string;
  subLabel?: string;
  side: 'top' | 'bottom';
  cards: GameCard[];
  selectedCardId: string | null;
  onDropCard: (target: { type: 'tactics_top' | 'tactics_bottom' }, e?: React.DragEvent) => void;
  onSelectCard: (card: GameCard) => void;
  onFlipCard: (cardId: string) => void;
  onReturnCardToHand: (cardId: string) => void;
  onReturnToDeck?: (cardId: string) => void;
  onDiscardCard: (cardId: string) => void;
  onDragStartCard: (
    card: GameCard,
    source: { type: 'tactics_top' | 'tactics_bottom' },
    e?: React.DragEvent
  ) => void;
  onDragEndCard?: () => void;
}

export const TacticsSlot: React.FC<TacticsSlotProps> = ({
  label,
  subLabel = 'TAKTIK KARTI YUVASI',
  side,
  cards,
  selectedCardId,
  onDropCard,
  onSelectCard,
  onFlipCard,
  onReturnCardToHand,
  onReturnToDeck,
  onDiscardCard,
  onDragStartCard,
  onDragEndCard,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDropCard(
      {
        type: side === 'top' ? 'tactics_top' : 'tactics_bottom',
      },
      e
    );
  };

  const handleClickArea = () => {
    if (selectedCardId) {
      onDropCard({
        type: side === 'top' ? 'tactics_top' : 'tactics_bottom',
      });
    }
  };

  const slotType = side === 'top' ? 'tactics_top' : 'tactics_bottom';

  return (
    <div
      id={`tactics-slot-${side}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClickArea}
      className={`w-full rounded-[2px] border transition-all duration-200 p-2 sm:p-2.5 ${
        isDragOver
          ? 'bg-purple-950/40 border-purple-400 ring-1 ring-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
          : 'bg-[#110D18]/70 border-purple-900/40 hover:border-purple-700/60'
      } ${selectedCardId ? 'cursor-pointer hover:bg-purple-950/20' : ''}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-purple-900/30 px-1">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-purple-400" />
          <span className="font-mono font-bold text-[10px] sm:text-[11px] tracking-widest uppercase text-purple-200">
            {label}
          </span>
          <span className="text-[9px] font-mono text-purple-400/70 tracking-wider hidden sm:inline">
            [{subLabel}]
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-purple-300/80 bg-purple-950/80 px-1.5 py-0.5 rounded-[2px] border border-purple-800/50">
            {cards.length} KART OYNANDI
          </span>
        </div>
      </div>

      {/* Cards Display / Drop Area */}
      {cards.length === 0 ? (
        <div className="flex items-center justify-center py-2.5 px-3 min-h-[70px] border border-dashed border-purple-900/40 rounded-[2px] bg-purple-950/10 text-purple-300/60 select-none">
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono tracking-wider">
            <Shield size={14} className="text-purple-400/50 shrink-0" />
            <span>Taktik kartlarını oynamak için buraya sürükleyip bırakın veya tıklayın</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pt-3 pb-3 px-2 scrollbar-thin">
          {cards.map((card, idx) => {
            const isHovered = hoveredCardId === card.id;
            return (
              <div
                key={card.id}
                onMouseEnter={() => setHoveredCardId(card.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                style={{ zIndex: isHovered ? 999 : selectedCardId === card.id ? 100 : idx + 1 }}
                className="transition-all duration-150 ease-out hover:-translate-y-3 hover:scale-105 relative drop-shadow-xl shrink-0"
              >
                <CardView
                  card={card}
                  size="sm"
                  isSelected={selectedCardId === card.id}
                  onSelect={() => onSelectCard(card)}
                  onFlip={() => onFlipCard(card.id)}
                  onReturnToHand={() => onReturnCardToHand(card.id)}
                  onReturnToDeck={onReturnToDeck ? () => onReturnToDeck(card.id) : undefined}
                  onDiscard={() => onDiscardCard(card.id)}
                  onDragStart={(evt) => onDragStartCard(card, { type: slotType }, evt)}
                  onDragEnd={onDragEndCard}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
