# Connect Four - Refactoring Guide

## Overview

This document provides a comprehensive step-by-step plan to modernize the Connect Four codebase from its current jQuery/vanilla JavaScript implementation to a modern, maintainable, and scalable architecture. The refactoring focuses on improving code quality, performance, and developer experience while maintaining the existing functionality.

## Refactoring Strategy

### Phase 1: Foundation & Tooling (Week 1-2)
### Phase 2: Core Architecture (Week 3-4)
### Phase 3: Component Migration (Week 5-6)
### Phase 4: State Management (Week 7-8)
### Phase 5: Testing & Optimization (Week 9-10)

## Phase 1: Foundation & Tooling

### Step 1.1: Project Setup & Build System

#### Current State
```bash
# No build system, direct file serving
index.html
├── css/style.css
├── js/script.js
└── audio/dropit.ogg
```

#### Target State
```bash
# Modern build system with Vite
package.json
vite.config.ts
tsconfig.json
src/
├── components/
├── hooks/
├── utils/
├── types/
└── assets/
```

#### Implementation
```bash
# Initialize new project
npm init -y
npm install --save-dev vite typescript @types/node
npm install react react-dom @types/react @types/react-dom

# Create Vite config
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: 3000,
    open: true
  }
})
```

### Step 1.2: TypeScript Configuration

#### Implementation
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Step 1.3: Code Quality Tools

#### Implementation
```bash
# Install linting and formatting tools
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
npm install --save-dev husky lint-staged
```

```json
// .eslintrc.json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": ["react", "@typescript-eslint"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

## Phase 2: Core Architecture

### Step 2.1: Type Definitions

#### Implementation
```typescript
// src/types/game.ts
export interface Player {
  id: 'player1' | 'player2';
  name: string;
  color: 'magenta' | 'yellow';
  isAI: boolean;
  spaces: number[];
  moves: number;
  wins: number;
}

export interface GameState {
  board: BoardState;
  currentPlayer: Player;
  players: [Player, Player];
  gameStatus: 'playing' | 'won' | 'draw';
  winningConnection: number[];
  ties: number;
  turnCount: number;
}

export interface BoardState {
  spaces: (Player | null)[][];
  firstOpenRow: number[];
}

export interface GameConfig {
  rows: number;
  columns: number;
  winningLength: number;
}

export type Position = {
  row: number;
  col: number;
};

export type GameAction = 
  | { type: 'PLACE_PIECE'; column: number }
  | { type: 'RESET_ROUND' }
  | { type: 'RESET_GAME' };
```

### Step 2.2: Game Logic Extraction

#### Implementation
```typescript
// src/utils/gameLogic.ts
import { GameState, Position, GameConfig } from '../types/game';

export const DEFAULT_CONFIG: GameConfig = {
  rows: 6,
  columns: 7,
  winningLength: 4
};

export class GameLogic {
  private config: GameConfig;
  private winningPatterns: number[][];

  constructor(config: GameConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.winningPatterns = this.generateWinningPatterns();
  }

  private generateWinningPatterns(): number[][] {
    const patterns: number[][] = [];
    
    // Horizontal patterns
    for (let row = 0; row < this.config.rows; row++) {
      for (let col = 0; col <= this.config.columns - this.config.winningLength; col++) {
        const pattern = [];
        for (let i = 0; i < this.config.winningLength; i++) {
          pattern.push(this.positionToIndex(row, col + i));
        }
        patterns.push(pattern);
      }
    }

    // Vertical patterns
    for (let col = 0; col < this.config.columns; col++) {
      for (let row = 0; row <= this.config.rows - this.config.winningLength; row++) {
        const pattern = [];
        for (let i = 0; i < this.config.winningLength; i++) {
          pattern.push(this.positionToIndex(row + i, col));
        }
        patterns.push(pattern);
      }
    }

    // Diagonal patterns (both directions)
    for (let row = 0; row <= this.config.rows - this.config.winningLength; row++) {
      for (let col = 0; col <= this.config.columns - this.config.winningLength; col++) {
        // Diagonal down-right
        const pattern1 = [];
        // Diagonal down-left
        const pattern2 = [];
        
        for (let i = 0; i < this.config.winningLength; i++) {
          pattern1.push(this.positionToIndex(row + i, col + i));
          pattern2.push(this.positionToIndex(row + i, col + this.config.winningLength - 1 - i));
        }
        
        patterns.push(pattern1, pattern2);
      }
    }

    return patterns;
  }

  private positionToIndex(row: number, col: number): number {
    return row * this.config.columns + col;
  }

  private indexToPosition(index: number): Position {
    return {
      row: Math.floor(index / this.config.columns),
      col: index % this.config.columns
    };
  }

  public canPlacePiece(state: GameState, column: number): boolean {
    return state.board.firstOpenRow[column] >= 0;
  }

  public placePiece(state: GameState, column: number): GameState {
    if (!this.canPlacePiece(state, column)) {
      throw new Error(`Cannot place piece in column ${column}`);
    }

    const row = state.board.firstOpenRow[column];
    const newBoard = {
      ...state.board,
      spaces: state.board.spaces.map((boardRow, i) =>
        i === row ? [...boardRow] : boardRow
      ),
      firstOpenRow: [...state.board.firstOpenRow]
    };

    newBoard.spaces[row][column] = state.currentPlayer;
    newBoard.firstOpenRow[column]--;

    const newPlayer = {
      ...state.currentPlayer,
      spaces: [...state.currentPlayer.spaces, this.positionToIndex(row, column)],
      moves: state.currentPlayer.moves + 1
    };

    const players = state.players.map(p =>
      p.id === newPlayer.id ? newPlayer : p
    );

    const nextPlayer = players.find(p => p.id !== state.currentPlayer.id)!;

    const gameStatus = this.checkWinCondition(newPlayer.spaces) ? 'won' :
                      this.isBoardFull(newBoard) ? 'draw' : 'playing';

    const winningConnection = gameStatus === 'won' ? 
      this.getWinningConnection(newPlayer.spaces) : [];

    return {
      ...state,
      board: newBoard,
      currentPlayer: nextPlayer,
      players,
      gameStatus,
      winningConnection,
      turnCount: state.turnCount + 1
    };
  }

  private checkWinCondition(spaces: number[]): boolean {
    if (spaces.length < this.config.winningLength) return false;
    
    return this.winningPatterns.some(pattern =>
      pattern.every(pos => spaces.includes(pos))
    );
  }

  private getWinningConnection(spaces: number[]): number[] {
    return this.winningPatterns.find(pattern =>
      pattern.every(pos => spaces.includes(pos))
    ) || [];
  }

  private isBoardFull(board: GameState['board']): boolean {
    return board.firstOpenRow.every(row => row < 0);
  }

  public resetRound(state: GameState): GameState {
    const newBoard: GameState['board'] = {
      spaces: Array(this.config.rows).fill(null).map(() =>
        Array(this.config.columns).fill(null)
      ),
      firstOpenRow: Array(this.config.columns).fill(this.config.rows - 1)
    };

    const resetPlayers = state.players.map(player => ({
      ...player,
      spaces: [],
      moves: 0
    }));

    return {
      ...state,
      board: newBoard,
      currentPlayer: resetPlayers[0],
      players: resetPlayers,
      gameStatus: 'playing',
      winningConnection: [],
      turnCount: 0
    };
  }
}
```

## Phase 3: Component Migration

### Step 3.1: Core Components

#### Implementation
```typescript
// src/components/GameBoard.tsx
import React from 'react';
import { GameState, Position } from '../types/game';
import { GameSpace } from './GameSpace';
import { PreviewRow } from './PreviewRow';

interface GameBoardProps {
  gameState: GameState;
  onSpaceClick: (column: number) => void;
  onSpaceHover: (column: number) => void;
  onSpaceLeave: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  onSpaceClick,
  onSpaceHover,
  onSpaceLeave
}) => {
  const { board, currentPlayer } = gameState;

  const handleSpaceClick = (position: Position) => {
    onSpaceClick(position.col);
  };

  const handleSpaceHover = (position: Position) => {
    onSpaceHover(position.col);
  };

  return (
    <div className="game-board">
      <PreviewRow 
        currentPlayer={currentPlayer}
        onColumnHover={onSpaceHover}
        onColumnLeave={onSpaceLeave}
      />
      <div className="board-grid">
        {board.spaces.map((row, rowIndex) =>
          row.map((player, colIndex) => (
            <GameSpace
              key={`${rowIndex}-${colIndex}`}
              position={{ row: rowIndex, col: colIndex }}
              player={player}
              onClick={handleSpaceClick}
              onHover={handleSpaceHover}
              onLeave={onSpaceLeave}
              isWinning={gameState.winningConnection.includes(
                rowIndex * 7 + colIndex
              )}
            />
          ))
        )}
      </div>
    </div>
  );
};
```

```typescript
// src/components/GameSpace.tsx
import React from 'react';
import { Player, Position } from '../types/game';

interface GameSpaceProps {
  position: Position;
  player: Player | null;
  onClick: (position: Position) => void;
  onHover: (position: Position) => void;
  onLeave: () => void;
  isWinning: boolean;
}

export const GameSpace: React.FC<GameSpaceProps> = ({
  position,
  player,
  onClick,
  onHover,
  onLeave,
  isWinning
}) => {
  const handleClick = () => {
    if (!player) {
      onClick(position);
    }
  };

  const handleHover = () => {
    if (!player) {
      onHover(position);
    }
  };

  const getClassName = () => {
    const baseClass = 'game-space';
    const classes = [baseClass];
    
    if (player) {
      classes.push(`player-${player.color}`);
      if (isWinning) {
        classes.push('winning');
      }
    }
    
    return classes.join(' ');
  };

  return (
    <div
      className={getClassName()}
      onClick={handleClick}
      onMouseEnter={handleHover}
      onMouseLeave={onLeave}
      data-row={position.row}
      data-col={position.col}
    />
  );
};
```

### Step 3.2: UI Components

#### Implementation
```typescript
// src/components/Scoreboard.tsx
import React from 'react';
import { Player } from '../types/game';

interface ScoreboardProps {
  players: [Player, Player];
  ties: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ players, ties }) => {
  const [player1, player2] = players;

  return (
    <div className="scoreboard">
      <div className="scoreboard-title">Score Board</div>
      <div className="scoreboard-grid">
        <div className="player-score">
          <div className="player-name">{player1.name}</div>
          <div className="player-wins player1">{player1.wins}</div>
        </div>
        <div className="ties-score">
          <div className="ties-label">Ties</div>
          <div className="ties-count">{ties}</div>
        </div>
        <div className="player-score">
          <div className="player-name">{player2.name}</div>
          <div className="player-wins player2">{player2.wins}</div>
        </div>
      </div>
    </div>
  );
};
```

```typescript
// src/components/GameMessage.tsx
import React from 'react';
import { GameState } from '../types/game';

interface GameMessageProps {
  gameState: GameState;
}

export const GameMessage: React.FC<GameMessageProps> = ({ gameState }) => {
  const { gameStatus, currentPlayer, winningConnection } = gameState;

  const getMessage = () => {
    switch (gameStatus) {
      case 'won':
        const winner = gameState.players.find(p => 
          p.spaces.some(space => winningConnection.includes(space))
        );
        return `${winner?.name} wins with a connection of ${winningConnection.length}!`;
      case 'draw':
        return 'It\'s a draw!';
      case 'playing':
        return `${currentPlayer.name}, drop it like it's hot!`;
      default:
        return '';
    }
  };

  return (
    <div className={`game-message ${gameStatus}`}>
      {getMessage()}
    </div>
  );
};
```

## Phase 4: State Management

### Step 4.1: Custom Hooks

#### Implementation
```typescript
// src/hooks/useGameState.ts
import { useReducer, useCallback } from 'react';
import { GameState, GameAction } from '../types/game';
import { GameLogic } from '../utils/gameLogic';

const gameLogic = new GameLogic();

const initialState: GameState = {
  board: {
    spaces: Array(6).fill(null).map(() => Array(7).fill(null)),
    firstOpenRow: Array(7).fill(5)
  },
  players: [
    {
      id: 'player1',
      name: 'Player 1',
      color: 'magenta',
      isAI: false,
      spaces: [],
      moves: 0,
      wins: 0
    },
    {
      id: 'player2',
      name: 'Player 2',
      color: 'yellow',
      isAI: false,
      spaces: [],
      moves: 0,
      wins: 0
    }
  ],
  currentPlayer: null as any, // Will be set in reducer
  gameStatus: 'playing',
  winningConnection: [],
  ties: 0,
  turnCount: 0
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'PLACE_PIECE': {
      if (state.gameStatus !== 'playing') return state;
      
      try {
        const newState = gameLogic.placePiece(state, action.column);
        
        // Update wins/ties if game ended
        if (newState.gameStatus === 'won') {
          const winner = newState.players.find(p => 
            p.spaces.some(space => newState.winningConnection.includes(space))
          );
          if (winner) {
            winner.wins++;
          }
        } else if (newState.gameStatus === 'draw') {
          newState.ties++;
        }
        
        return newState;
      } catch (error) {
        console.error('Invalid move:', error);
        return state;
      }
    }
    
    case 'RESET_ROUND': {
      return gameLogic.resetRound(state);
    }
    
    case 'RESET_GAME': {
      const resetPlayers = state.players.map(player => ({
        ...player,
        wins: 0
      }));
      
      return {
        ...gameLogic.resetRound(state),
        players: resetPlayers,
        ties: 0
      };
    }
    
    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const placePiece = useCallback((column: number) => {
    dispatch({ type: 'PLACE_PIECE', column });
  }, []);

  const resetRound = useCallback(() => {
    dispatch({ type: 'RESET_ROUND' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  return {
    gameState: state,
    placePiece,
    resetRound,
    resetGame
  };
}
```

### Step 4.2: Main Game Component

#### Implementation
```typescript
// src/components/Game.tsx
import React, { useState, useEffect } from 'react';
import { GameBoard } from './GameBoard';
import { Scoreboard } from './Scoreboard';
import { GameMessage } from './GameMessage';
import { useGameState } from '../hooks/useGameState';
import { useAudio } from '../hooks/useAudio';

export const Game: React.FC = () => {
  const { gameState, placePiece, resetRound } = useGameState();
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const { playWinSound } = useAudio();

  // Play win sound when game is won
  useEffect(() => {
    if (gameState.gameStatus === 'won') {
      playWinSound();
    }
  }, [gameState.gameStatus, playWinSound]);

  const handleSpaceClick = (column: number) => {
    placePiece(column);
  };

  const handleSpaceHover = (column: number) => {
    setHoveredColumn(column);
  };

  const handleSpaceLeave = () => {
    setHoveredColumn(null);
  };

  return (
    <div className="game">
      <GameMessage gameState={gameState} />
      <GameBoard
        gameState={gameState}
        onSpaceClick={handleSpaceClick}
        onSpaceHover={handleSpaceHover}
        onSpaceLeave={handleSpaceLeave}
      />
      <Scoreboard 
        players={gameState.players}
        ties={gameState.ties}
      />
      <button 
        className="reset-button"
        onClick={resetRound}
      >
        Restart Round
      </button>
    </div>
  );
};
```

## Phase 5: Testing & Optimization

### Step 5.1: Testing Setup

#### Implementation
```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
npm install --save-dev jsdom @testing-library/user-event
```

```typescript
// src/utils/gameLogic.test.ts
import { describe, it, expect } from 'vitest';
import { GameLogic } from './gameLogic';
import { GameState } from '../types/game';

describe('GameLogic', () => {
  let gameLogic: GameLogic;
  let initialState: GameState;

  beforeEach(() => {
    gameLogic = new GameLogic();
    initialState = {
      board: {
        spaces: Array(6).fill(null).map(() => Array(7).fill(null)),
        firstOpenRow: Array(7).fill(5)
      },
      players: [
        {
          id: 'player1',
          name: 'Player 1',
          color: 'magenta',
          isAI: false,
          spaces: [],
          moves: 0,
          wins: 0
        },
        {
          id: 'player2',
          name: 'Player 2',
          color: 'yellow',
          isAI: false,
          spaces: [],
          moves: 0,
          wins: 0
        }
      ],
      currentPlayer: null as any,
      gameStatus: 'playing',
      winningConnection: [],
      ties: 0,
      turnCount: 0
    };
  });

  it('should allow placing a piece in an empty column', () => {
    initialState.currentPlayer = initialState.players[0];
    
    const newState = gameLogic.placePiece(initialState, 3);
    
    expect(newState.board.spaces[5][3]).toBe(initialState.players[0]);
    expect(newState.board.firstOpenRow[3]).toBe(4);
  });

  it('should detect horizontal win', () => {
    // Setup horizontal win scenario
    initialState.currentPlayer = initialState.players[0];
    initialState.board.spaces[5] = [
      initialState.players[0],
      initialState.players[0],
      initialState.players[0],
      null,
      null,
      null,
      null
    ];
    initialState.players[0].spaces = [35, 36, 37];
    
    const newState = gameLogic.placePiece(initialState, 3);
    
    expect(newState.gameStatus).toBe('won');
    expect(newState.winningConnection).toEqual([35, 36, 37, 38]);
  });
});
```

### Step 5.2: Performance Optimization

#### Implementation
```typescript
// src/hooks/useMemoizedGameState.ts
import { useMemo } from 'react';
import { GameState } from '../types/game';

export function useMemoizedGameState(gameState: GameState) {
  const memoizedState = useMemo(() => ({
    ...gameState,
    // Memoize expensive calculations
    canPlacePiece: (column: number) => gameState.board.firstOpenRow[column] >= 0,
    isGameOver: gameState.gameStatus !== 'playing'
  }), [gameState]);

  return memoizedState;
}
```

```typescript
// src/components/GameBoard.tsx (optimized)
import React, { memo } from 'react';

export const GameBoard = memo<GameBoardProps>(({
  gameState,
  onSpaceClick,
  onSpaceHover,
  onSpaceLeave
}) => {
  // Component implementation
});
```

## Migration Checklist

### Phase 1: Foundation ✅
- [ ] Initialize Vite project
- [ ] Configure TypeScript
- [ ] Setup ESLint and Prettier
- [ ] Configure Husky and lint-staged

### Phase 2: Core Architecture ✅
- [ ] Define TypeScript interfaces
- [ ] Extract game logic to utility class
- [ ] Create configuration constants
- [ ] Implement win detection algorithm

### Phase 3: Component Migration ✅
- [ ] Create React components
- [ ] Implement GameBoard component
- [ ] Implement GameSpace component
- [ ] Create UI components (Scoreboard, Message)

### Phase 4: State Management ✅
- [ ] Implement useGameState hook
- [ ] Create game reducer
- [ ] Setup action creators
- [ ] Implement main Game component

### Phase 5: Testing & Optimization ✅
- [ ] Setup Vitest testing framework
- [ ] Write unit tests for game logic
- [ ] Implement component tests
- [ ] Add performance optimizations

## Benefits of Refactoring

### 1. Maintainability
- **Type Safety**: TypeScript prevents runtime errors
- **Modular Architecture**: Clear separation of concerns
- **Testable Code**: Comprehensive test coverage
- **Consistent Style**: ESLint and Prettier enforcement

### 2. Performance
- **Optimized Rendering**: React's virtual DOM
- **Memoization**: Prevent unnecessary re-renders
- **Bundle Optimization**: Tree shaking and code splitting
- **Modern Build Tools**: Fast development and builds

### 3. Developer Experience
- **Hot Reload**: Instant feedback during development
- **Better Debugging**: React DevTools and TypeScript
- **IDE Support**: IntelliSense and error detection
- **Modern Tooling**: Vite, ESLint, Prettier

### 4. Scalability
- **Component Reusability**: Modular component architecture
- **State Management**: Predictable state updates
- **Easy Testing**: Isolated unit tests
- **Future-Proof**: Modern React patterns

## Conclusion

This refactoring plan transforms the Connect Four application from a legacy jQuery implementation to a modern, maintainable React application. The new architecture provides:

- **Better Performance**: Optimized rendering and algorithms
- **Improved Maintainability**: Type safety and modular design
- **Enhanced Developer Experience**: Modern tooling and debugging
- **Future Scalability**: Easy to add new features and maintain

The refactored codebase will be easier to extend with features like AI opponents, online multiplayer, and enhanced user experience while maintaining the core game functionality that users love.

