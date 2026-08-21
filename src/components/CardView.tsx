import React from 'react';
import { GameCard } from '../types';
import { Eye, EyeOff, RotateCcw, Trash2, ArrowUpToLine } from 'lucide-react';

interface CardViewProps {
  card: GameCard;
  isSelected?: boolean;
  isDragging?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onSelect?: () => void;
  onFlip?: () => void;
  onReturnToHand?: () => void;
  onReturnToDeck?: () => void;
  onDiscard?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  showQuickActions?: boolean;
  className?: string;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  isSelected = false,
  isDragging = false,
  size = 'md',
  onSelect,
  onFlip,
  onReturnToHand,
  onReturnToDeck,
  onDiscard,
  onDragStart,
  onDragEnd,
  showQuickActions = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-[88px] h-[124px] text-xs p-1.5',
    md: 'w-[100px] h-[142px] sm:w-[114px] sm:h-[158px] text-xs p-2',
    lg: 'w-[118px] h-[166px] sm:w-[128px] sm:h-[178px] text-sm p-2.5',
  }[size];

  const isTactics = card.cardType === 'tactics' || card.suit === 'tactics';
  const canDrag = Boolean(onDragStart);
  const canSelect = Boolean(onSelect);

  const handleDragStart = (e: React.DragEvent) => {
    if (!canDrag || !onDragStart) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('cardId', card.id);
    e.dataTransfer.setData('text/plain', JSON.stringify({ cardId: card.id }));
    e.dataTransfer.setData('application/json', JSON.stringify({ cardId: card.id }));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(e);
  };

  const cursorClass = canDrag
    ? 'cursor-grab active:cursor-grabbing hover:z-50 hover:scale-105 hover:-translate-y-2.5'
    : canSelect
    ? 'cursor-pointer hover:z-50 hover:scale-105 hover:-translate-y-2.5'
    : 'cursor-default';

  // 6 Suits Color Styles: Turuncu, Kırmızı, Turkuaz, Kahverengi, Gri, Sarı
  const suitStyles: Record<string, { bg: string; text: string; border: string; subText: string; symbolColor: string }> = {
    suit1: {
      bg: 'bg-[#C2410C]',
      text: 'text-white',
      border: 'border-[#FB923C]/50',
      subText: 'text-orange-200',
      symbolColor: 'text-orange-200',
    },
    suit2: {
      bg: 'bg-[#B91C1C]',
      text: 'text-white',
      border: 'border-[#F87171]/50',
      subText: 'text-rose-200',
      symbolColor: 'text-rose-200',
    },
    suit3: {
      bg: 'bg-[#0E7490]',
      text: 'text-white',
      border: 'border-[#22D3EE]/50',
      subText: 'text-cyan-200',
      symbolColor: 'text-cyan-200',
    },
    suit4: {
      bg: 'bg-[#5C3317]',
      text: 'text-amber-100',
      border: 'border-[#B45309]/50',
      subText: 'text-amber-200',
      symbolColor: 'text-amber-200',
    },
    suit5: {
      bg: 'bg-[#475569]',
      text: 'text-white',
      border: 'border-[#94A3B8]/50',
      subText: 'text-slate-300',
      symbolColor: 'text-slate-200',
    },
    suit6: {
      bg: 'bg-[#EAB308]',
      text: 'text-[#18181B] font-bold',
      border: 'border-[#FDE047]',
      subText: 'text-[#3F3F46]',
      symbolColor: 'text-[#18181B]',
    },
  };

  const currentSuit = suitStyles[card.suit] || suitStyles.suit6;

  if (card.isFaceDown) {
    return (
      <div
        id={`card-${card.id}`}
        draggable={canDrag}
        onDragStart={canDrag ? handleDragStart : undefined}
        onDragEnd={canDrag ? onDragEnd : undefined}
        onClick={onSelect}
        className={`group relative select-none rounded-[3px] border ${
          isTactics ? 'border-purple-800/80 bg-[#120D22]' : 'border-[#333333] bg-[#141414]'
        } shadow-[0_4px_12px_rgba(0,0,0,0.6)] transition-all duration-150 ease-out hover:shadow-[0_12px_28px_rgba(0,0,0,0.9)] hover:border-[#666] ${cursorClass} ${sizeClasses} ${
          isSelected ? 'ring-2 ring-[#EDEDED] border-[#EDEDED] shadow-2xl -translate-y-2 z-40' : ''
        } ${isDragging ? 'opacity-30 scale-95' : ''} ${className}`}
      >
        {/* Minimalist Card Back Geometric Pattern */}
        <div
          className={`w-full h-full rounded-[2px] border border-dashed ${
            isTactics ? 'border-purple-700/50 bg-[#0E091C]' : 'border-[#2A2A2A] bg-[#0E0E0E]'
          } flex flex-col items-center justify-between p-1.5 overflow-hidden`}
        >
          <div className="w-full flex justify-between items-center text-[7px] font-mono tracking-wider uppercase">
            <span className={isTactics ? 'text-purple-300 font-bold' : 'text-[#888] font-bold'}>
              {isTactics ? 'TAKTIK' : 'BİRLİK'}
            </span>
            <span className={isTactics ? 'text-purple-400/80 text-[6.5px]' : 'text-[#666] text-[6.5px]'}>
              {isTactics ? 'TACTIC' : 'TROOP'}
            </span>
          </div>
          <div
            className={`w-6 h-6 rounded-sm border ${
              isTactics
                ? 'border-purple-500/50 bg-purple-950/50 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                : 'border-[#383838] bg-[#1A1A1A] text-[#AAA]'
            } flex items-center justify-center font-mono text-xs`}
          >
            {isTactics ? '⚔' : '✦'}
          </div>
          <div
            className={`text-[7px] font-mono font-bold ${
              isTactics ? 'text-purple-400/80' : 'text-[#777]'
            } tracking-[0.15em] uppercase`}
          >
            {isTactics ? 'TACTICS' : 'BATTLE LINE'}
          </div>
        </div>

        {/* Quick Flip Action */}
        {onFlip && showQuickActions && (
          <button
            type="button"
            id={`flip-card-${card.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onFlip();
            }}
            title="Kartı Çevir (Aç)"
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-[#EDEDED] text-black rounded-[2px] transition-opacity text-[10px] shadow-sm"
          >
            <Eye size={11} />
          </button>
        )}
      </div>
    );
  }

  // TACTICS CARD FACE VIEW
  if (isTactics) {
    return (
      <div
        id={`card-${card.id}`}
        draggable={canDrag}
        onDragStart={canDrag ? handleDragStart : undefined}
        onDragEnd={canDrag ? onDragEnd : undefined}
        onClick={onSelect}
        className={`group relative select-none rounded-[3px] border border-purple-500/60 bg-[#13101E] text-[#EDEDED] shadow-[0_4px_14px_rgba(0,0,0,0.6)] transition-all duration-150 ease-out hover:shadow-[0_14px_32px_rgba(168,85,247,0.4)] hover:border-purple-400 flex flex-col justify-between ${cursorClass} ${sizeClasses} ${
          isSelected ? 'ring-2 ring-purple-400 -translate-y-2 shadow-2xl z-40' : ''
        } ${isDragging ? 'opacity-20 scale-90' : ''} ${className}`}
      >
        {/* Top Header: Title at Top & Tactical Symbol */}
        <div className="w-full pb-1 border-b border-purple-500/30 flex items-center justify-between gap-1 leading-tight">
          <span className="font-bold text-[9.5px] sm:text-[10.5px] tracking-tight text-purple-100 uppercase break-words leading-tight">
            {card.title || card.suitName}
          </span>
          <span
            className="text-[11px] sm:text-xs shrink-0 font-bold ml-0.5"
            style={{ color: card.accentColor || '#C084FC' }}
          >
            {card.symbol}
          </span>
        </div>

        {/* Middle Area: Card Description - Fully displayed */}
        <div className="my-auto py-1 px-0.5 flex items-center justify-center text-center overflow-y-auto scrollbar-none">
          <p className="text-[8px] sm:text-[9px] leading-[1.25] text-zinc-200 font-sans tracking-tight select-none">
            {card.description}
          </p>
        </div>

        {/* Bottom Footer: Badge & Extra Info */}
        <div className="w-full pt-1 border-t border-purple-500/20 flex items-center justify-between text-[7.5px] sm:text-[8.5px] font-mono text-purple-300/80 leading-none">
          <span className="tracking-widest uppercase bg-purple-950/80 px-1 py-0.5 rounded-[2px] border border-purple-800/40 text-purple-300">
            TAKTIK
          </span>
          {card.value > 0 ? (
            <span className="font-bold text-[9px] text-purple-200">
              VAL: {card.value}
            </span>
          ) : (
            <span
              className="text-[9.5px] font-bold"
              style={{ color: card.accentColor || '#C084FC' }}
            >
              {card.symbol}
            </span>
          )}
        </div>

        {/* Floating Hover Controls */}
        {showQuickActions && (
          <div className="absolute top-0.5 right-0.5 hidden group-hover:flex items-center gap-0.5 bg-[#141414]/95 text-[#EDEDED] p-0.5 rounded-[3px] shadow-[0_4px_16px_rgba(0,0,0,0.9)] border border-[#555] z-50 transition-all pointer-events-auto">
            {onFlip && (
              <button
                type="button"
                id={`toggle-flip-${card.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onFlip();
                }}
                title="Kartı Çevir (Gizle)"
                className="p-1 hover:bg-[#2A2A2A] rounded-[2px] transition-colors"
              >
                <EyeOff size={11} />
              </button>
            )}
            {onReturnToHand && (
              <button
                type="button"
                id={`return-card-${card.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onReturnToHand();
                }}
                title="Ele Geri Al"
                className="p-1 hover:bg-[#2A2A2A] rounded-[2px] transition-colors"
              >
                <RotateCcw size={11} />
              </button>
            )}
            {onReturnToDeck && (
              <button
                type="button"
                id={`return-deck-${card.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onReturnToDeck();
                }}
                title="Destenin En Üstüne Geri Koy"
                className="p-1 hover:bg-[#1E293B] text-cyan-300 rounded-[2px] transition-colors"
              >
                <ArrowUpToLine size={11} />
              </button>
            )}
            {onDiscard && (
              <button
                type="button"
                id={`discard-card-${card.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDiscard();
                }}
                title="Iskartaya At"
                className="p-1 hover:bg-[#3B1111] text-rose-300 rounded-[2px] transition-colors"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }


  return (
    <div
      id={`card-${card.id}`}
      draggable={canDrag}
      onDragStart={canDrag ? handleDragStart : undefined}
      onDragEnd={canDrag ? onDragEnd : undefined}
      onClick={onSelect}
      className={`group relative select-none rounded-[3px] border ${currentSuit.border} ${currentSuit.bg} ${currentSuit.text} shadow-[0_4px_14px_rgba(0,0,0,0.5)] transition-all duration-150 ease-out hover:shadow-[0_14px_30px_rgba(0,0,0,0.85)] hover:border-white/60 flex flex-col justify-between ${cursorClass} ${sizeClasses} ${
        isSelected ? 'ring-2 ring-white/95 shadow-[0_0_16px_rgba(255,255,255,0.45)] -translate-y-2 z-40' : ''
      } ${isDragging ? 'opacity-20 scale-90' : ''} ${className}`}
    >
      {/* Top Header Row: Value & Symbol */}
      <div className="flex justify-between items-start w-full font-mono leading-none">
        <span className="font-black text-sm sm:text-base tracking-tight">{card.value}</span>
        <span className={`text-xs font-bold ${currentSuit.symbolColor}`}>
          {card.symbol}
        </span>
      </div>

      {/* Center Minimalist Suit Marker */}
      <div className="flex flex-col items-center justify-center my-auto pointer-events-none py-1">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[2px] border border-current/20 flex items-center justify-center text-sm sm:text-base font-bold transition-transform group-hover:scale-105">
          {card.symbol}
        </div>
      </div>

      {/* Bottom Footer Row: Inverted Symbol & Value */}
      <div className="flex justify-between items-end w-full font-mono leading-none">
        <span className={`text-xs font-bold ${currentSuit.symbolColor} rotate-180`}>
          {card.symbol}
        </span>
        <span className="font-bold text-sm sm:text-base tracking-tight">{card.value}</span>
      </div>

      {/* Floating Hover Controls */}
      {showQuickActions && (
        <div className="absolute top-0.5 right-0.5 hidden group-hover:flex items-center gap-0.5 bg-[#141414]/95 text-[#EDEDED] p-0.5 rounded-[3px] shadow-[0_4px_16px_rgba(0,0,0,0.9)] border border-[#555] z-50 transition-all pointer-events-auto">
          {onFlip && (
            <button
              type="button"
              id={`toggle-flip-${card.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onFlip();
              }}
              title="Kartı Çevir (Gizle)"
              className="p-1 hover:bg-[#2A2A2A] rounded-[2px] transition-colors"
            >
              <EyeOff size={11} />
            </button>
          )}
          {onReturnToHand && (
            <button
              type="button"
              id={`return-card-${card.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onReturnToHand();
              }}
              title="Ele Geri Al"
              className="p-1 hover:bg-[#2A2A2A] rounded-[2px] transition-colors"
            >
              <RotateCcw size={11} />
            </button>
          )}
          {onReturnToDeck && (
            <button
              type="button"
              id={`return-deck-${card.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onReturnToDeck();
              }}
              title="Destenin En Üstüne Geri Koy"
              className="p-1 hover:bg-[#1E293B] text-cyan-300 rounded-[2px] transition-colors"
            >
              <ArrowUpToLine size={11} />
            </button>
          )}
          {onDiscard && (
            <button
              type="button"
              id={`discard-card-${card.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onDiscard();
              }}
              title="Iskartaya At"
              className="p-1 hover:bg-[#3B1111] text-rose-300 rounded-[2px] transition-colors"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
