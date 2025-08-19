# Connect Four - Architecture Documentation

## System Overview

The Connect Four application follows a traditional client-side architecture with jQuery for DOM manipulation and vanilla JavaScript for game logic. The system is structured around a single-page application model with clear separation between UI components and game state management.

## Architecture Pattern

### Current Architecture: jQuery + Vanilla JavaScript
- **Framework**: jQuery 3.3.1 for DOM manipulation
- **Language**: Vanilla JavaScript (ES5/ES6)
- **Styling**: CSS3 with animations and responsive design
- **Build System**: None (direct file serving)
- **Dependencies**: External CDN resources (jQuery, Font Awesome, Google Fonts)

## Data Flow Architecture

### 1. Application Initialization
```
Page Load → jQuery Ready → DOM Setup → Landing Display → User Interaction → Game Start
```

### 2. Game State Flow
```
User Action → Event Handler → State Update → UI Update → Win Check → Game Continuation/Reset
```

### 3. Data Structures

#### Player State Object
```javascript
const player = {
  one: {
    name: 'Player 1',
    color: 'magenta',
    isAI: false,
    spaces: [],        // Array of occupied board positions
    combosOf4: [],     // All possible 4-piece combinations
    moves: 0,          // Moves in current round
    wins: 0            // Total wins across rounds
  },
  two: { /* similar structure */ }
}
```

#### Game Board Structure
```javascript
// 2D Array: board[row][col]
// 6 rows (0-5), 7 columns (0-6)
// Total: 42 positions (0-41)

// Position mapping:
// Row 5: [0, 1, 2, 3, 4, 5, 6]
// Row 4: [7, 8, 9, 10, 11, 12, 13]
// Row 3: [14, 15, 16, 17, 18, 19, 20]
// Row 2: [21, 22, 23, 24, 25, 26, 27]
// Row 1: [28, 29, 30, 31, 32, 33, 34]
// Row 0: [35, 36, 37, 38, 39, 40, 41]
```

#### Global State Variables
```javascript
let ties = 0;                    // Total ties across rounds
let turnCount = 0;               // Current turn number
let whosTurn = player.one;       // Current player reference
let winningConnection = [];      // Current winning positions
let firstOpenRow = [5,5,5,5,5,5,5]; // Available row per column
```

## Module Structure

### 1. Core Game Logic Module

#### State Management Functions
- `createArray(length, ...args)` - Multi-dimensional array creation
- `resetRoundData()` - Reset game state for new round
- `updateScore()` - Refresh scoreboard display

#### Game Flow Functions
- `playRound()` - Main game loop and event handling
- `checkForWinningConnection(combosOf4)` - Win detection algorithm
- `getCombosOf(set, k)` - Combinatorial analysis for win checking

### 2. UI Management Module

#### DOM Creation Functions
- `populateGameBoard()` - Create board elements and structure
- `displayGameBoard()` - Show all UI components
- `initGameBoard()` - Initialize new board after round

#### Animation Functions
- `animateWinningConnection()` - Highlight winning pieces
- `clearGameBoard(time)` - Animate board clearing
- `landingDisplay()` - Handle page transitions

### 3. Event Handling Module

#### User Interaction
- **Hover Events**: Preview piece placement
- **Click Events**: Place pieces and advance game
- **Reset Events**: Restart current round

#### Event Flow
```
User Hover → Preview Piece → User Click → Piece Placement → State Update → Win Check → UI Update
```

## State Management

### 1. Game State Lifecycle

#### Initialization Phase
1. Player objects created with default values
2. Board array initialized (6x7 grid)
3. Winning combinations pre-calculated
4. UI elements created but not displayed

#### Active Game Phase
1. Turn counter increments
2. Player spaces arrays updated
3. Board state modified
4. Win conditions checked after each move

#### Round Completion Phase
1. Winner determined and announced
2. Scores updated
3. Board cleared with animation
4. New round initialized

### 2. State Synchronization

#### UI ↔ State Binding
- **One-way binding**: State changes drive UI updates
- **Event-driven updates**: User actions trigger state changes
- **Manual synchronization**: No automatic reactivity system

#### State Persistence
- **Session-based**: State maintained during browser session
- **No persistence**: Game state lost on page refresh
- **Round isolation**: Each round starts fresh

## Data Flow Patterns

### 1. User Action Flow
```
User Click → Event Handler → State Validation → State Update → UI Update → Game Logic → Next State
```

### 2. Win Detection Flow
```
Move Made → Generate Combinations → Pattern Matching → Win Found → Animation → Round End
```

### 3. Round Reset Flow
```
Round End → Score Update → Board Clear → State Reset → New Board → Next Round
```

## Component Interactions

### 1. Board Component
- **Input**: Click events from user
- **Output**: Piece placement, hover previews
- **Dependencies**: Game state, CSS animations

### 2. Scoreboard Component
- **Input**: Player win/loss data
- **Output**: Visual score display
- **Dependencies**: Player state objects

### 3. Preview Row Component
- **Input**: Hover events, current player
- **Output**: Visual piece preview
- **Dependencies**: Current turn state, CSS classes

### 4. Message Component
- **Input**: Game status changes
- **Output**: User feedback text
- **Dependencies**: Current player, game state

## Performance Architecture

### 1. Rendering Strategy
- **CSS Grid**: Efficient board layout
- **Hardware Acceleration**: CSS transforms for animations
- **Event Delegation**: Single event handlers for board spaces

### 2. Memory Management
- **Event Cleanup**: Handlers removed when no longer needed
- **DOM Recycling**: Elements reused between rounds
- **Array Optimization**: Efficient data structures for win checking

### 3. Animation Performance
- **CSS Transitions**: Hardware-accelerated animations
- **Throttled Updates**: Limited animation frequency
- **Efficient Selectors**: Optimized CSS for performance

## Error Handling

### 1. Input Validation
- **Column Bounds**: Prevents clicks on full columns
- **Turn Validation**: Ensures proper turn order
- **State Consistency**: Validates board state integrity

### 2. Edge Cases
- **Draw Detection**: Handles full board scenarios
- **Win Detection**: Manages multiple winning combinations
- **Animation Conflicts**: Prevents overlapping animations

## Scalability Considerations

### 1. Current Limitations
- **Single-threaded**: All operations on main thread
- **No caching**: Repeated calculations for win checking
- **Fixed board size**: Hard-coded 6x7 dimensions

### 2. Potential Improvements
- **Web Workers**: Offload win detection calculations
- **Memoization**: Cache combination calculations
- **Modular Architecture**: Separate concerns into modules
- **State Management Library**: Implement proper state management

## Security Considerations

### 1. Client-Side Security
- **Input Sanitization**: Validate all user inputs
- **XSS Prevention**: Sanitize dynamic content
- **Event Handling**: Prevent event injection

### 2. Data Integrity
- **State Validation**: Ensure consistent game state
- **Boundary Checking**: Prevent array out-of-bounds access
- **Type Safety**: Validate data types and structures

## Testing Strategy

### 1. Unit Testing Opportunities
- **Win Detection**: Test combination generation and matching
- **State Management**: Test state transitions and updates
- **Utility Functions**: Test helper functions independently

### 2. Integration Testing
- **User Flows**: Test complete game scenarios
- **UI Interactions**: Test event handling and animations
- **State Synchronization**: Test UI-state consistency

## Future Architecture Considerations

### 1. Modern Framework Migration
- **React/Vue**: Component-based architecture
- **State Management**: Redux/Vuex for predictable state
- **TypeScript**: Type safety and better tooling

### 2. Performance Optimizations
- **Virtual DOM**: Efficient rendering updates
- **Code Splitting**: Lazy load components
- **Service Workers**: Offline functionality

### 3. Scalability Improvements
- **Microservices**: Separate game logic and UI
- **Real-time Updates**: WebSocket integration
- **Database Integration**: Persistent game state

