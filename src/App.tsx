import React, { useState, useEffect, useRef } from 'react';
import { useMultiplayer, PlayerRole } from './hooks/useMultiplayer';
import { FrontColumn } from './components/FrontColumn';
import { PlayerHand } from './components/PlayerHand';
import { TacticsSlot } from './components/TacticsSlot';
import { DeckArea } from './components/DeckArea';
import { TableControls, TableTheme } from './components/TableControls';
import { RoomControls } from './components/RoomControls';
import { GameCard, getCardIdFromDragEvent } from './types';
import { X, Eye, Trash2, RotateCcw, ChevronLeft, ChevronRight, ArrowUpToLine } from 'lucide-react';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [tableTheme, setTableTheme] = useState<TableTheme>('mat');
  const frontsContainerRef = useRef<HTMLDivElement>(null);
  const draggingCardIdRef = useRef<string | null>(null);

  const {
    roomId,
    role,
    playerName,
    isConnected,
    isConnecting,
    serverState,
    lastActionText,
    deckCount,
    tacticsDeckCount,
    hand1,
    hand2,
    fronts,
    topTacticsSlot,
    bottomTacticsSlot,
    discardPile,
    selectedCardId,
    setSelectedCardId,
    setActiveDraggingCard,
    drawCard,
    drawTacticsCard,
    moveCard,
    flipCard,
    returnToHand,
    returnToDeck,
    discardCard,
    shuffleCurrentDeck,
    shuffleTacticsDeck,
    resetGame,
    sortHand,
    setFrontClaim,
    toggleFrontClaim,
    changeRoom,
  } = useMultiplayer();

  // Apply dark class to document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Determine active hand number based on player role
  const activeHandIndex: 1 | 2 = role === 'p2' ? 2 : 1;

  // Selected card details
  const selectedCard = selectedCardId
    ? hand1.find((c) => c.id === selectedCardId) ||
      hand2.find((c) => c.id === selectedCardId) ||
      discardPile.find((c) => c.id === selectedCardId) ||
      topTacticsSlot.find((c) => c.id === selectedCardId) ||
      bottomTacticsSlot.find((c) => c.id === selectedCardId) ||
      (() => {
        for (let i = 1; i <= 9; i++) {
          const inTop = fronts[i]?.topCards.find((c) => c.id === selectedCardId);
          if (inTop) return inTop;
          const inBottom = fronts[i]?.bottomCards.find((c) => c.id === selectedCardId);
          if (inBottom) return inBottom;
          const inEnv = fronts[i]?.environmentCards?.find((c) => c.id === selectedCardId);
          if (inEnv) return inEnv;
        }
        return null;
      })()
    : null;

  // Helper to check if a card belongs to the opponent's unplayed hand or spectator is attempting to move
  const isOpponentHandCard = (cardId: string) => {
    if (role === 'spectator') return true;
    if (role === 'p1' && hand2.some((c) => c.id === cardId)) return true;
    if (role === 'p2' && hand1.some((c) => c.id === cardId)) return true;
    return false;
  };

  // Handle global card drag start & end
  const handleDragStart = (card: GameCard, e?: React.DragEvent) => {
    if (isOpponentHandCard(card.id)) {
      if (e) e.preventDefault();
      return;
    }
    draggingCardIdRef.current = card.id;
    setActiveDraggingCard(card);
  };

  const handleDragEnd = () => {
    draggingCardIdRef.current = null;
    setActiveDraggingCard(null);
  };

  // Robust universal drop handler that extracts card id directly from drag event, ref, or selected state
  const resolveAndMoveCard = (target: any, e?: React.DragEvent) => {
    const targetCardId =
      (e ? getCardIdFromDragEvent(e) : null) ||
      draggingCardIdRef.current ||
      selectedCardId;

    if (targetCardId) {
      if (isOpponentHandCard(targetCardId)) {
        setSelectedCardId(null);
        draggingCardIdRef.current = null;
        setActiveDraggingCard(null);
        return;
      }
      moveCard(targetCardId, target);
      setSelectedCardId(null);
      draggingCardIdRef.current = null;
      setActiveDraggingCard(null);
    }
  };

  // Background class based on chosen table theme
  const getTableThemeClass = () => {
    switch (tableTheme) {
      case 'wood':
        return 'tabletop-wood';
      case 'felt':
        return 'tabletop-felt';
      case 'leather':
        return 'tabletop-leather';
      case 'mat':
      default:
        return 'tabletop-surface';
    }
  };

  // Check which hand is masked (fog of war)
  const isHand1Masked = role === 'p2' || role === 'spectator';
  const isHand2Masked = role === 'p1' || role === 'spectator';

  return (
    <div className={`min-h-screen ${getTableThemeClass()} text-[#EDEDED] flex flex-col font-mono select-none antialiased relative transition-all duration-300`}>
      {/* Live Multiplayer Room & Role Banner */}
      <RoomControls
        roomId={roomId}
        role={role}
        playerName={playerName}
        isConnected={isConnected}
        isConnecting={isConnecting}
        serverState={serverState}
        lastActionText={lastActionText}
        onChangeRoom={changeRoom}
      />

      {/* Top Table Controls */}
      <TableControls
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        tableTheme={tableTheme}
        onChangeTableTheme={setTableTheme}
      />

      {/* Main Tabletop Arena */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto p-2.5 sm:p-4 flex flex-col lg:flex-row gap-3 sm:gap-4 items-start">
        {/* Left / Center Table Section: 9 Fronts & Player Hands */}
        <div className="flex-1 w-full flex flex-col gap-3.5 overflow-hidden">
          {/* Top Player Hand (Player 2) */}
          <PlayerHand
            label={
              role === 'p2'
                ? 'PLAYER 02 // SİZİN ELİNİZ (ÜST ALAN)'
                : isHand2Masked
                ? 'PLAYER 02 // RAKİP ELİ (ÜST ALAN - GİZLİ)'
                : 'PLAYER 02 // ÜST OYUNCU ELİ'
            }
            cards={hand2}
            selectedCardId={selectedCardId}
            isSecondary={true}
            isMasked={isHand2Masked}
            isCurrentPlayerHand={role === 'p2'}
            onSelectCard={(c) => setSelectedCardId(selectedCardId === c.id ? null : c.id)}
            onFlipCard={flipCard}
            onReturnToDeck={(cId) => returnToDeck(cId)}
            onDiscardCard={discardCard}
            onDropToHand={(e) => resolveAndMoveCard({ type: 'hand', handIndex: 2 }, e)}
            onDragStartCard={handleDragStart}
            onDragEndCard={handleDragEnd}
            onSortHandByValue={() => sortHand(2, 'value')}
            onSortHandBySuit={() => sortHand(2, 'suit')}
            onDrawCard={() => drawCard(1, 2)}
            onDrawTacticsCard={() => drawTacticsCard(1, 2)}
            deckCount={deckCount}
            tacticsDeckCount={tacticsDeckCount}
          />

          {/* Top Tactics Slot (Matrix Üst Taktik Kartı Yuvası - P2 / Rakip Alanı) */}
          <TacticsSlot
            label="TACTICS ZONE // TOP"
            subLabel="P2 / ÜST TAKTİK ALANI"
            side="top"
            cards={topTacticsSlot}
            selectedCardId={selectedCardId}
            onDropCard={(target, e) => resolveAndMoveCard(target, e)}
            onSelectCard={(c) => setSelectedCardId(selectedCardId === c.id ? null : c.id)}
            onFlipCard={flipCard}
            onReturnCardToHand={(cId) => returnToHand(cId, 2)}
            onDiscardCard={discardCard}
            onDragStartCard={handleDragStart}
            onDragEndCard={handleDragEnd}
          />

          {/* 9 Fronts (Ortadaki 9 Yan Yana Cephe/Kutucuk) */}
          <div className="bg-[#0b0f16]/90 backdrop-blur-sm rounded-[3px] border border-[#232d3d] p-2.5 sm:p-3.5 shadow-2xl">
            {/* Header info for the 9 fronts with scroll buttons */}
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#1b2330] px-1 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EDEDED]" />
                <span className="font-bold text-[11px] sm:text-xs tracking-[0.2em] uppercase text-[#EDEDED]">
                  CENTRAL MATRIX // 09 CEPHE
                </span>
                <span className="text-[10px] text-[#666] hidden md:inline tracking-wider">
                  [SERBEST SÜRÜKLE-BIRAK ALANI]
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* 9 Fronts Scroll Arrows */}
                <div className="flex items-center gap-0.5 border border-[#2A2A2A] rounded-[2px] bg-[#141414] p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (frontsContainerRef.current) {
                        frontsContainerRef.current.scrollBy({ left: -240, behavior: 'smooth' });
                      }
                    }}
                    title="Cepheleri Sola Kaydır"
                    className="p-1 text-[#888] hover:text-[#EDEDED] hover:bg-[#222] rounded-[2px] transition-colors"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span className="text-[9px] font-mono px-1 text-[#666]">CEPHE</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (frontsContainerRef.current) {
                        frontsContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
                      }
                    }}
                    title="Cepheleri Sağa Kaydır"
                    className="p-1 text-[#888] hover:text-[#EDEDED] hover:bg-[#222] rounded-[2px] transition-colors"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>

                <div className="text-[10px] text-[#888] tracking-widest uppercase">
                  TOPLAM KART:{' '}
                  <span className="text-[#EDEDED] font-bold">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].reduce(
                      (acc, idx) =>
                        acc +
                        (fronts[idx]?.topCards.length || 0) +
                        (fronts[idx]?.bottomCards.length || 0) +
                        (fronts[idx]?.environmentCards?.length || 0),
                      0
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* 9 Columns Horizontal Layout */}
            <div
              id="fronts-container-9"
              ref={frontsContainerRef}
              onWheel={(e) => {
                if (e.deltaY !== 0 && frontsContainerRef.current) {
                  frontsContainerRef.current.scrollLeft += e.deltaY;
                }
              }}
              className="flex items-stretch justify-start gap-1.5 sm:gap-2 overflow-x-auto pb-3 pt-1 px-1 scrollbar-thin scroll-smooth"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((frontIndex) => (
                <FrontColumn
                  key={frontIndex}
                  index={frontIndex}
                  topCards={fronts[frontIndex]?.topCards || []}
                  bottomCards={fronts[frontIndex]?.bottomCards || []}
                  environmentCards={fronts[frontIndex]?.environmentCards || []}
                  claimedBy={fronts[frontIndex]?.claimedBy}
                  selectedCardId={selectedCardId}
                  onDropCard={(target, e) => resolveAndMoveCard(target, e)}
                  onSelectCard={(c) => setSelectedCardId(selectedCardId === c.id ? null : c.id)}
                  onFlipCard={flipCard}
                  onReturnCardToHand={(cId, handTarget) =>
                    returnToHand(cId, handTarget || activeHandIndex)
                  }
                  onDiscardCard={discardCard}
                  onToggleClaim={toggleFrontClaim}
                  onClaim={setFrontClaim}
                  onDragStartCard={handleDragStart}
                  onDragEndCard={handleDragEnd}
                />
              ))}
            </div>
          </div>

          {/* Bottom Tactics Slot (Matrix Alt Taktik Kartı Yuvası - P1 / Ana Oyuncu Alanı) */}
          <TacticsSlot
            label="TACTICS ZONE // BOTTOM"
            subLabel="P1 / ALT TAKTİK ALANI"
            side="bottom"
            cards={bottomTacticsSlot}
            selectedCardId={selectedCardId}
            onDropCard={(target, e) => resolveAndMoveCard(target, e)}
            onSelectCard={(c) => setSelectedCardId(selectedCardId === c.id ? null : c.id)}
            onFlipCard={flipCard}
            onReturnCardToHand={(cId) => returnToHand(cId, 1)}
            onDiscardCard={discardCard}
            onDragStartCard={handleDragStart}
            onDragEndCard={handleDragEnd}
          />

          {/* Primary Bottom Player Hand (Player 1) */}
          <PlayerHand
            label={
              role === 'p1'
                ? 'PLAYER 01 // SİZİN ELİNİZ (ALT ALAN)'
                : isHand1Masked
                ? 'PLAYER 01 // RAKİP ELİ (ALT ALAN - GİZLİ)'
                : 'PLAYER 01 // ALT OYUNCU ELİ'
            }
            cards={hand1}
            selectedCardId={selectedCardId}
            isMasked={isHand1Masked}
            isCurrentPlayerHand={role === 'p1'}
            onSelectCard={(c) => setSelectedCardId(selectedCardId === c.id ? null : c.id)}
            onFlipCard={flipCard}
            onReturnToDeck={(cId) => returnToDeck(cId)}
            onDiscardCard={discardCard}
            onDropToHand={(e) => resolveAndMoveCard({ type: 'hand', handIndex: 1 }, e)}
            onDragStartCard={handleDragStart}
            onDragEndCard={handleDragEnd}
            onSortHandByValue={() => sortHand(1, 'value')}
            onSortHandBySuit={() => sortHand(1, 'suit')}
            onDrawCard={() => drawCard(1, 1)}
            onDrawTacticsCard={() => drawTacticsCard(1, 1)}
            deckCount={deckCount}
            tacticsDeckCount={tacticsDeckCount}
          />
        </div>

        {/* Right Sidebar: 60-Card Troop Deck, 10-Card Tactics Deck, Discard Pile & Actions */}
        <DeckArea
          deck={Array(deckCount).fill({} as any)}
          tacticsDeck={Array(tacticsDeckCount).fill({} as any)}
          discardPile={discardPile}
          onDrawCard={(count) => drawCard(count || 1, activeHandIndex)}
          onDrawTacticsCard={(count) => drawTacticsCard(count || 1, activeHandIndex)}
          onShuffleDeck={shuffleCurrentDeck}
          onShuffleTacticsDeck={shuffleTacticsDeck}
          onResetGame={resetGame}
          onDropToDiscard={(e) => resolveAndMoveCard({ type: 'discard' }, e)}
          onDropToDeck={(e) => resolveAndMoveCard({ type: 'deck' }, e)}
          onDropToTacticsDeck={(e) => resolveAndMoveCard({ type: 'tactics_deck' }, e)}
          onRetrieveFromDiscard={() => {
            if (discardPile.length > 0) {
              const last = discardPile[discardPile.length - 1];
              returnToHand(last.id, activeHandIndex);
            }
          }}
          onFlipCard={flipCard}
        />
      </main>

      {/* Sleek Technical Footer */}
      <footer className="w-full py-2.5 px-4 sm:px-6 bg-[#0A0A0A] border-t border-[#1C1C1C] flex flex-wrap items-center justify-between text-[10px] text-[#555] font-mono tracking-widest uppercase mt-auto">
        <div className="flex items-center gap-3">
          <span>BATTLE LINE CANLI ARENA // 60 BİRLİK + 10 TAKTİK</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">ODA: #{roomId}</span>
          <span className="hidden sm:inline">•</span>
          <span className="text-cyan-400">ROLÜNÜZ: {role.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>SENKRONİZASYON: AKTİF</span>
          <span>•</span>
          <span className={isConnected ? 'text-[#00FF41]' : 'text-amber-400'}>
            {isConnected ? 'ÇEVRİMİÇİ' : 'BAĞLANTI BEKLENİYOR'}
          </span>
        </div>
      </footer>

      {/* Floating Selected Card Action Bar (For Touch / Click Mode) */}
      {selectedCard && (
        <aside
          aria-label="Seçili Kart İşlemleri"
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#0F0F0F] text-[#EDEDED] px-4 py-2 rounded-[2px] shadow-2xl border border-[#333] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center gap-2 pr-2 border-r border-[#262626]">
            <span
              className="font-bold text-xs"
              style={{ color: selectedCard.accentColor || '#EDEDED' }}
            >
              {selectedCard.symbol}
            </span>
            <span className="font-bold text-[11px]">
              {selectedCard.title || `${selectedCard.colorName} ${selectedCard.value}`}
            </span>
          </div>

          <span className="text-[10px] text-[#777] hidden sm:inline uppercase tracking-wider">
            Hedef seçin veya:
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              id="bar-flip-btn"
              onClick={() => flipCard(selectedCard.id)}
              className="p-1 px-2 hover:bg-[#222] rounded-[2px] text-[10px] flex items-center gap-1 uppercase tracking-wider border border-[#2A2A2A]"
              title="Aç/Kapat"
            >
              <Eye size={11} />
              <span>Çevir</span>
            </button>

            <button
              type="button"
              id="bar-hand-btn"
              onClick={() => returnToHand(selectedCard.id, activeHandIndex)}
              className="p-1 px-2 hover:bg-[#222] rounded-[2px] text-[10px] flex items-center gap-1 uppercase tracking-wider border border-[#2A2A2A]"
              title="Ele Al"
            >
              <RotateCcw size={11} />
              <span>Ele Al</span>
            </button>

            <button
              type="button"
              id="bar-deck-btn"
              onClick={() => {
                returnToDeck(selectedCard.id);
                setSelectedCardId(null);
              }}
              className="p-1 px-2 hover:bg-[#1E293B] text-cyan-300 rounded-[2px] text-[10px] flex items-center gap-1 uppercase tracking-wider border border-cyan-800/40"
              title="Destenin En Üstüne Geri Koy"
            >
              <ArrowUpToLine size={11} />
              <span>Desteye Koy</span>
            </button>

            <button
              type="button"
              id="bar-discard-btn"
              onClick={() => discardCard(selectedCard.id)}
              className="p-1 px-2 hover:bg-[#330000] text-rose-400 rounded-[2px] text-[10px] flex items-center gap-1 uppercase tracking-wider border border-[#2A2A2A]"
              title="Iskartaya At"
            >
              <Trash2 size={11} />
              <span>Iskarta</span>
            </button>

            <button
              type="button"
              id="bar-cancel-btn"
              onClick={() => setSelectedCardId(null)}
              className="p-1 px-1.5 hover:bg-[#222] rounded-[2px] text-[10px] text-[#666] hover:text-[#EDEDED] ml-1"
              title="Seçimi İptal Et"
            >
              <X size={13} />
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
