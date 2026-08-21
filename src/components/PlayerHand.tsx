import React, { useState, useRef } from 'react';
import { GameCard } from '../types';
import { CardView } from './CardView';
import { ArrowDownUp, Layers, Plus, ChevronLeft, ChevronRight, Lock, UserCheck } from 'lucide-react';

interface PlayerHandProps {
  label?: string;
  cards: GameCard[];
  selectedCardId: string | null;
  onSelectCard: (card: GameCard) => void;
  onFlipCard: (cardId: string) => void;
  onDiscardCard: (cardId: string) => void;
  onDropToHand: (e?: React.DragEvent) => void;
  onDragStartCard: (card: GameCard, e?: React.DragEvent) => void;
  onDragEndCard?: () => void;
  onSortHandByValue?: () => void;
  onSortHandBySuit?: () => void;
  onDrawCard?: () => void;
  onDrawTacticsCard?: () => void;
  deckCount?: number;
  tacticsDeckCount?: number;
  isSecondary?: boolean;
  isMasked?: boolean;
  isCurrentPlayerHand?: boolean;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  label = 'Oyuncu Eli',
  cards,
  selectedCardId,
  onSelectCard,
  onFlipCard,
  onDiscardCard,
  onDropToHand,
  onDragStartCard,
  onDragEndCard,
  onSortHandByValue,
  onSortHandBySuit,
  onDrawCard,
  onDrawTacticsCard,
  deckCount = 0,
  tacticsDeckCount = 0,
  isSecondary = false,
  isMasked = false,
  isCurrentPlayerHand = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Hand is only interactable if not masked and belongs to current player
  const isInteractable = !isMasked && isCurrentPlayerHand;

  const handleDragOver = (e: React.DragEvent) => {
    if (!isInteractable) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!isInteractable) return;
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isInteractable) return;
    e.preventDefault();
    setIsDragOver(false);
    onDropToHand(e);
  };

  // Convert mouse wheel to horizontal scroll
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      if (e.deltaY !== 0) {
        scrollContainerRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  return (
    <div
      id={isSecondary ? 'player-hand-secondary' : 'player-hand-primary'}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full rounded-[3px] border transition-all duration-200 p-2.5 sm:p-3.5 backdrop-blur-md shadow-xl ${
        isMasked
          ? 'bg-[#0a0d14]/70 border-[#1e2738]'
          : isCurrentPlayerHand
          ? 'bg-[#0d1422]/90 border-emerald-500/50 shadow-emerald-950/20'
          : 'bg-[#0F0F0F]/90 border-[#232c3d]'
      } ${
        isDragOver ? 'border-[#00FF41] ring-1 ring-[#00FF41] bg-[#16221c]' : ''
      }`}
    >
      {/* Hand Header & Quick Hand Actions */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#1C2536] flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {isMasked ? (
            <Lock size={13} className="text-purple-400" />
          ) : isCurrentPlayerHand ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41]" />
          )}
          <span className={`text-[11px] font-mono font-bold tracking-widest uppercase ${
            isMasked ? 'text-purple-300' : isCurrentPlayerHand ? 'text-emerald-300' : 'text-[#EDEDED]'
          }`}>
            {label}
          </span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] border ${
            isMasked ? 'bg-[#181224] text-purple-300 border-purple-800/40' : 'bg-[#181818] text-[#AAA] border-[#262626]'
          }`}>
            [{cards.length} KART {isMasked ? '- GİZLİ' : ''}]
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Scroll Navigation Arrows */}
          {cards.length > 5 && (
            <div className="flex items-center gap-0.5 border border-[#2A2A2A] rounded-[2px] bg-[#141414] p-0.5 mr-1">
              <button
                type="button"
                onClick={scrollLeft}
                title="Sola Kaydır"
                className="p-1 text-[#888] hover:text-[#EDEDED] hover:bg-[#222] rounded-[2px] transition-colors"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                title="Sağa Kaydır"
                className="p-1 text-[#888] hover:text-[#EDEDED] hover:bg-[#222] rounded-[2px] transition-colors"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}

          {isInteractable && onSortHandByValue && (
            <button
              type="button"
              id={`sort-hand-value-btn-${isSecondary ? '2' : '1'}`}
              onClick={onSortHandByValue}
              title="Değere Göre Sırala (1-10)"
              className="text-[10px] font-mono px-2 py-1 rounded-[2px] border border-[#2A2A2A] bg-[#141414] text-[#AAA] hover:text-[#EDEDED] hover:border-[#444] transition-colors flex items-center gap-1 uppercase tracking-wider"
            >
              <ArrowDownUp size={11} />
              <span className="hidden sm:inline">Değer</span>
            </button>
          )}

          {isInteractable && onSortHandBySuit && (
            <button
              type="button"
              id={`sort-hand-suit-btn-${isSecondary ? '2' : '1'}`}
              onClick={onSortHandBySuit}
              title="Renge/Sembole Göre Sırala"
              className="text-[10px] font-mono px-2 py-1 rounded-[2px] border border-[#2A2A2A] bg-[#141414] text-[#AAA] hover:text-[#EDEDED] hover:border-[#444] transition-colors flex items-center gap-1 uppercase tracking-wider"
            >
              <Layers size={11} />
              <span className="hidden sm:inline">Renk</span>
            </button>
          )}

          {isInteractable && onDrawCard && deckCount > 0 && (
            <button
              type="button"
              id={`quick-draw-troop-btn-${isSecondary ? '2' : '1'}`}
              onClick={onDrawCard}
              title="Birlik Kartı Çek"
              className="text-[10px] font-mono px-2 py-1 rounded-[2px] bg-[#EDEDED] text-[#0A0A0A] font-bold hover:bg-white active:scale-95 transition-all flex items-center gap-1 uppercase tracking-wider shadow-sm"
            >
              <Plus size={11} />
              <span>Birlik</span>
            </button>
          )}

          {isInteractable && onDrawTacticsCard && tacticsDeckCount > 0 && (
            <button
              type="button"
              id={`quick-draw-tactics-btn-${isSecondary ? '2' : '1'}`}
              onClick={onDrawTacticsCard}
              title="Taktik Kartı Çek"
              className="text-[10px] font-mono px-2 py-1 rounded-[2px] bg-purple-600 text-white font-bold hover:bg-purple-500 active:scale-95 transition-all flex items-center gap-1 uppercase tracking-wider shadow-sm"
            >
              <Plus size={11} />
              <span>Taktik</span>
            </button>
          )}

          {!isInteractable && (
            <div className="text-[10px] font-mono text-purple-400/80 flex items-center gap-1">
              <Lock size={10} />
              <span>KORUMALI EL</span>
            </div>
          )}
        </div>
      </div>

      {/* Cards List / Horizontal Scrollable Fan Area */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="w-full min-h-[210px] sm:min-h-[230px] flex items-center overflow-x-auto pt-10 pb-7 px-4 scrollbar-thin scroll-smooth"
      >
        {cards.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center text-[#555] py-8 text-[11px] font-mono select-none">
            <span className="tracking-widest uppercase text-[#777]">
              {!isInteractable ? 'RAKİBİN ELİNDE KART BULUNMUYOR' : 'ELİNİZDE KART BULUNMUYOR'}
            </span>
            {isInteractable && (
              <span className="text-[9px] text-[#444] mt-1 tracking-wider">
                'BİRLİK' VEYA 'TAKTIK' ÇEK BUTONLARINA BASARAK KART EKLEYİN
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center min-w-max -space-x-3 sm:-space-x-4 hover:space-x-2 transition-all duration-200 px-3">
            {cards.map((card, idx) => {
              const isHovered = hoveredCardId === card.id;
              // If hand is not interactable/masked, force face down & disable all actions
              const displayCard = !isInteractable ? { ...card, isFaceDown: isMasked || card.isFaceDown } : card;

              return (
                <div
                  key={card.id}
                  onMouseEnter={() => (isInteractable ? setHoveredCardId(card.id) : null)}
                  onMouseLeave={() => (isInteractable ? setHoveredCardId(null) : null)}
                  style={{ zIndex: isHovered ? 999 : selectedCardId === card.id ? 100 : idx + 1 }}
                  className={`transition-all duration-150 ease-out relative drop-shadow-2xl shrink-0 ${
                    isInteractable ? 'hover:-translate-y-5 hover:scale-110' : 'cursor-not-allowed opacity-90'
                  }`}
                >
                  <CardView
                    card={displayCard}
                    size="md"
                    isSelected={isInteractable && selectedCardId === card.id}
                    onSelect={isInteractable ? () => onSelectCard(card) : undefined}
                    onFlip={isInteractable ? () => onFlipCard(card.id) : undefined}
                    onDiscard={isInteractable ? () => onDiscardCard(card.id) : undefined}
                    onDragStart={isInteractable ? (evt) => onDragStartCard(card, evt) : undefined}
                    onDragEnd={isInteractable ? onDragEndCard : undefined}
                    showQuickActions={isInteractable}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

