# Connect Four - Style Guide

## Overview

This style guide establishes coding standards and best practices for the Connect Four project. It covers React, TypeScript, CSS, and general development practices to ensure code consistency, maintainability, and quality.

## TypeScript Standards

### 1. Type Definitions

#### Interface Naming
```typescript
// Use PascalCase for interfaces
interface GameState {
  board: BoardState;
  currentPlayer: Player;
  gameStatus: GameStatus;
}

// Use descriptive names that indicate purpose
interface PlayerMove {
  playerId: string;
  column: number;
  timestamp: number;
}

// Avoid generic names like 'Props' or 'State'
// Instead use specific names
interface GameBoardProps {
  gameState: GameState;
  onMove: (column: number) => void;
}
```

#### Type Aliases
```typescript
// Use type aliases for unions and complex types
type GameStatus = 'playing' | 'won' | 'draw';
type PlayerColor = 'magenta' | 'yellow';
type BoardPosition = { row: number; col: number };

// Use const assertions for readonly arrays
const WINNING_PATTERNS = [
  [0, 1, 2, 3],
  [1, 2, 3, 4],
  // ... more patterns
] as const;
```

#### Generic Types
```typescript
// Use generics for reusable components
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

// Use constraints when needed
interface ApiResponse<T extends object> {
  data: T;
  status: number;
  message: string;
}
```

### 2. Function Definitions

#### Function Types
```typescript
// Use explicit return types for public functions
export function calculateWinner(board: BoardState): Player | null {
  // Implementation
}

// Use arrow functions for event handlers
const handleColumnClick = (column: number): void => {
  // Implementation
};

// Use function declarations for components
function GameBoard({ gameState, onMove }: GameBoardProps): JSX.Element {
  // Implementation
}
```

#### Parameter Types
```typescript
// Use destructuring for object parameters
function updatePlayer(
  { id, name, color }: Player,
  updates: Partial<Player>
): Player {
  return { id, name, color, ...updates };
}

// Use optional parameters with defaults
function createGame(
  config: GameConfig,
  players: Player[] = DEFAULT_PLAYERS
): Game {
  // Implementation
}
```

### 3. Error Handling

#### Custom Error Types
```typescript
class GameError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: unknown
  ) {
    super(message);
    this.name = 'GameError';
  }
}

class InvalidMoveError extends GameError {
  constructor(column: number, reason: string) {
    super(`Invalid move in column ${column}: ${reason}`, 'INVALID_MOVE', { column, reason });
  }
}
```

#### Error Handling Patterns
```typescript
// Use Result types for operations that can fail
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

function placePiece(board: BoardState, column: number): Result<BoardState, GameError> {
  try {
    if (column < 0 || column >= BOARD_WIDTH) {
      return {
        success: false,
        error: new InvalidMoveError(column, 'Column out of bounds')
      };
    }
    
    const newBoard = calculateNewBoard(board, column);
    return { success: true, data: newBoard };
  } catch (error) {
    return {
      success: false,
      error: new GameError('Failed to place piece', 'PLACE_PIECE_ERROR', error)
    };
  }
}
```

## React Standards

### 1. Component Structure

#### Component Organization
```typescript
// 1. Imports
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Player } from '../types/game';
import { useGameLogic } from '../hooks/useGameLogic';
import { GameBoard } from './GameBoard';
import { Scoreboard } from './Scoreboard';

// 2. Types
interface GameProps {
  initialConfig?: GameConfig;
  onGameEnd?: (winner: Player | null) => void;
}

// 3. Component
export function Game({ initialConfig, onGameEnd }: GameProps): JSX.Element {
  // 4. Hooks
  const { gameState, placePiece, resetGame } = useGameLogic(initialConfig);
  const [isAnimating, setIsAnimating] = useState(false);

  // 5. Event handlers
  const handleColumnClick = useCallback((column: number) => {
    if (!isAnimating) {
      placePiece(column);
    }
  }, [placePiece, isAnimating]);

  // 6. Effects
  useEffect(() => {
    if (gameState.status === 'won' || gameState.status === 'draw') {
      onGameEnd?.(gameState.winner);
    }
  }, [gameState.status, gameState.winner, onGameEnd]);

  // 7. Render
  return (
    <div className="game">
      <GameBoard
        gameState={gameState}
        onColumnClick={handleColumnClick}
        isAnimating={isAnimating}
      />
      <Scoreboard players={gameState.players} />
    </div>
  );
}
```

#### Component Naming
```typescript
// Use PascalCase for component names
export function GameBoard(): JSX.Element { }
export function PlayerScore(): JSX.Element { }
export function WinAnimation(): JSX.Element { }

// Use descriptive names that indicate purpose
export function AnimatedGamePiece(): JSX.Element { }
export function GameStatusMessage(): JSX.Element { }
export function ColumnPreview(): JSX.Element { }
```

### 2. Hooks Usage

#### Custom Hooks
```typescript
// Use 'use' prefix for custom hooks
export function useGameState(initialConfig?: GameConfig) {
  const [state, setState] = useState<GameState>(createInitialState(initialConfig));
  
  const placePiece = useCallback((column: number) => {
    setState(prevState => calculateNewState(prevState, column));
  }, []);
  
  const resetGame = useCallback(() => {
    setState(createInitialState(initialConfig));
  }, [initialConfig]);
  
  return {
    gameState: state,
    placePiece,
    resetGame
  };
}

// Use TypeScript for hook return types
export function useGameLogic(config: GameConfig): {
  gameState: GameState;
  placePiece: (column: number) => void;
  resetGame: () => void;
  canPlacePiece: (column: number) => boolean;
} {
  // Implementation
}
```

#### Hook Dependencies
```typescript
// Always include all dependencies in useEffect
useEffect(() => {
  if (gameState.status === 'won') {
    playWinSound();
    triggerWinAnimation();
  }
}, [gameState.status, playWinSound, triggerWinAnimation]);

// Use useCallback for functions passed as props
const handleColumnClick = useCallback((column: number) => {
  placePiece(column);
}, [placePiece]);

// Use useMemo for expensive calculations
const winningPatterns = useMemo(() => 
  generateWinningPatterns(boardConfig),
  [boardConfig]
);
```

### 3. Props and State

#### Props Interface
```typescript
// Define props interface above component
interface GameBoardProps {
  gameState: GameState;
  onColumnClick: (column: number) => void;
  isAnimating?: boolean;
  className?: string;
}

// Use destructuring with defaults
export function GameBoard({
  gameState,
  onColumnClick,
  isAnimating = false,
  className = ''
}: GameBoardProps): JSX.Element {
  // Implementation
}
```

#### State Management
```typescript
// Use specific state types
const [gameState, setGameState] = useState<GameState>(initialState);
const [isAnimating, setIsAnimating] = useState<boolean>(false);
const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);

// Use reducer for complex state
const [state, dispatch] = useReducer(gameReducer, initialState);

// Avoid deeply nested state
// Bad
const [game, setGame] = useState({
  board: { spaces: [], firstOpenRow: [] },
  players: [],
  currentPlayer: null
});

// Good
const [board, setBoard] = useState(initialBoard);
const [players, setPlayers] = useState(initialPlayers);
const [currentPlayer, setCurrentPlayer] = useState(initialPlayer);
```

## CSS Standards

### 1. Naming Conventions

#### BEM Methodology
```css
/* Block */
.game-board { }

/* Element */
.game-board__space { }
.game-board__preview-row { }
.game-board__column { }

/* Modifier */
.game-board__space--player-1 { }
.game-board__space--winning { }
.game-board__space--disabled { }

/* State */
.game-board__space.is-hovered { }
.game-board__space.is-animating { }
```

#### CSS Custom Properties
```css
:root {
  /* Colors */
  --color-primary: #ff00ff;
  --color-secondary: #ffff00;
  --color-background: #000000;
  --color-text: #ffffff;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Typography */
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 20px;
  --font-size-xl: 24px;
  
  /* Animations */
  --transition-fast: 0.15s ease-out;
  --transition-normal: 0.3s ease-out;
  --transition-slow: 0.5s ease-out;
}
```

### 2. Component Styling

#### CSS Modules
```css
/* GameBoard.module.css */
.gameBoard {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-background);
  border: 2px solid var(--color-text);
  border-radius: 8px;
}

.space {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid var(--color-text);
  cursor: pointer;
  transition: var(--transition-normal);
}

.space:hover {
  transform: scale(1.05);
}

.spacePlayer1 {
  background-color: var(--color-primary);
}

.spacePlayer2 {
  background-color: var(--color-secondary);
}
```

#### Styled Components
```typescript
import styled from 'styled-components';

const GameBoardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 2px solid ${props => props.theme.colors.text};
  border-radius: 8px;
`;

const GameSpace = styled.div<{ player?: Player; isWinning?: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid ${props => props.theme.colors.text};
  cursor: pointer;
  transition: ${props => props.theme.transitions.normal};
  
  ${props => props.player && `
    background-color: ${props.theme.colors[props.player.color]};
  `}
  
  ${props => props.isWinning && `
    animation: ${props.theme.animations.win} 1s ease-in-out;
  `}
`;
```

### 3. Responsive Design

#### Mobile-First Approach
```css
/* Base styles (mobile) */
.game-board {
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  padding: 8px;
}

.space {
  width: 40px;
  height: 40px;
}

/* Tablet */
@media (min-width: 768px) {
  .game-board {
    gap: 6px;
    padding: 12px;
  }
  
  .space {
    width: 50px;
    height: 50px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .game-board {
    gap: 8px;
    padding: 16px;
  }
  
  .space {
    width: 60px;
    height: 60px;
  }
}
```

## File Organization

### 1. Project Structure
```
src/
├── components/          # React components
│   ├── Game/           # Feature-based organization
│   │   ├── Game.tsx
│   │   ├── GameBoard.tsx
│   │   ├── GameSpace.tsx
│   │   └── index.ts
│   ├── UI/             # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   └── index.ts
├── hooks/              # Custom React hooks
│   ├── useGameState.ts
│   ├── useGameLogic.ts
│   └── index.ts
├── utils/              # Utility functions
│   ├── gameLogic.ts
│   ├── winDetection.ts
│   └── index.ts
├── types/              # TypeScript type definitions
│   ├── game.ts
│   ├── api.ts
│   └── index.ts
├── constants/          # Application constants
│   ├── gameConfig.ts
│   ├── animations.ts
│   └── index.ts
├── styles/             # Global styles
│   ├── globals.css
│   ├── variables.css
│   └── animations.css
└── assets/             # Static assets
    ├── images/
    ├── sounds/
    └── icons/
```

### 2. File Naming
```typescript
// Use kebab-case for file names
game-board.tsx
use-game-state.ts
game-logic.ts
win-detection.ts

// Use PascalCase for component files
GameBoard.tsx
PlayerScore.tsx
WinAnimation.tsx

// Use camelCase for utility files
gameLogic.ts
winDetection.ts
audioManager.ts
```

### 3. Import Organization
```typescript
// 1. React and third-party libraries
import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';

// 2. Internal imports (absolute paths)
import { GameState, Player } from '@/types/game';
import { useGameLogic } from '@/hooks/useGameLogic';

// 3. Relative imports
import { GameBoard } from './GameBoard';
import { Scoreboard } from './Scoreboard';

// 4. Type imports
import type { GameProps } from './types';
```

## Code Quality

### 1. ESLint Configuration
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/prefer-const": "error",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### 2. Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### 3. Git Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "prettier --write"
    ]
  }
}
```

## Testing Standards

### 1. Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { GameBoard } from './GameBoard';

describe('GameBoard', () => {
  const mockGameState: GameState = {
    // Test data
  };

  const mockOnColumnClick = jest.fn();

  beforeEach(() => {
    mockOnColumnClick.mockClear();
  });

  it('renders all game spaces', () => {
    render(
      <GameBoard
        gameState={mockGameState}
        onColumnClick={mockOnColumnClick}
      />
    );

    const spaces = screen.getAllByTestId('game-space');
    expect(spaces).toHaveLength(42); // 6 rows * 7 columns
  });

  it('calls onColumnClick when space is clicked', () => {
    render(
      <GameBoard
        gameState={mockGameState}
        onColumnClick={mockOnColumnClick}
      />
    );

    const firstSpace = screen.getAllByTestId('game-space')[0];
    fireEvent.click(firstSpace);

    expect(mockOnColumnClick).toHaveBeenCalledWith(0);
  });
});
```

### 2. Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useGameState } from './useGameState';

describe('useGameState', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.gameState.status).toBe('playing');
    expect(result.current.gameState.currentPlayer.id).toBe('player1');
  });

  it('places piece correctly', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.placePiece(3);
    });

    expect(result.current.gameState.board.spaces[5][3]).toBeTruthy();
    expect(result.current.gameState.currentPlayer.id).toBe('player2');
  });
});
```

## Documentation Standards

### 1. JSDoc Comments
```typescript
/**
 * Places a game piece in the specified column
 * @param column - The column index (0-6)
 * @returns The updated game state
 * @throws {InvalidMoveError} When the column is full or invalid
 */
export function placePiece(gameState: GameState, column: number): GameState {
  // Implementation
}

/**
 * Custom hook for managing game state
 * @param initialConfig - Optional initial game configuration
 * @returns Object containing game state and actions
 */
export function useGameState(initialConfig?: GameConfig) {
  // Implementation
}
```

### 2. README Documentation
```markdown
# GameBoard Component

A React component that renders the Connect Four game board.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| gameState | GameState | Yes | Current game state |
| onColumnClick | (column: number) => void | Yes | Callback when column is clicked |
| isAnimating | boolean | No | Whether animations are playing |

## Usage

```tsx
<GameBoard
  gameState={gameState}
  onColumnClick={handleColumnClick}
  isAnimating={false}
/>
```

## Examples

See the [Game component](./Game.tsx) for a complete usage example.
```

## Conclusion

This style guide provides a comprehensive set of standards for maintaining code quality and consistency in the Connect Four project. Following these guidelines will ensure:

- **Consistency**: All code follows the same patterns and conventions
- **Maintainability**: Code is easy to understand and modify
- **Quality**: High standards for code quality and testing
- **Scalability**: Code structure supports future growth
- **Team Collaboration**: Clear standards for team development

Remember to update this style guide as the project evolves and new patterns emerge.

