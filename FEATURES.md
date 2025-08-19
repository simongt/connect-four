# Connect Four - Features Documentation

## Overview

Connect Four is a classic two-player strategy game implemented as a web application. Players take turns dropping colored pieces into a 6x7 grid, aiming to be the first to connect four pieces horizontally, vertically, or diagonally.

## Core Game Features

### 1. Landing Page Experience
- **Animated Title Entrance**: The "Connect 4" title slides in from the top with a neon glow effect
- **Start Button**: Fades in below the title, triggering transition to game view
- **Smooth Transitions**: Title slides up to header position when game starts

### 2. Game Board Interface
- **6x7 Grid Layout**: Standard Connect Four board with 42 playable spaces
- **Preview Row**: Shows piece placement preview above the main board
- **Visual Feedback**: Hover effects show where pieces will land
- **Responsive Design**: Adapts to different screen sizes (desktop, tablet, mobile)

### 3. Gameplay Mechanics
- **Turn-Based Play**: Players alternate between magenta (Player 1) and yellow (Player 2)
- **Column Selection**: Click any space in a column to drop a piece
- **Gravity Physics**: Pieces fall to the lowest available space in the selected column
- **Column Management**: Full columns become unclickable
- **Win Detection**: Automatically detects horizontal, vertical, and diagonal connections of 4+

### 4. Visual Effects & Animations
- **Piece Placement**: Bounce-in animation when pieces are placed
- **Hover Previews**: Pulsating preview pieces show where the next move will land
- **Winning Animation**: Winning pieces blink and victory sound plays
- **Board Clearing**: Pieces slide out when round ends
- **Neon Effects**: Glowing title with color cycling animations

### 5. Score Tracking
- **Persistent Scoring**: Wins and ties carry over between rounds
- **Visual Scoreboard**: Displays player names, scores, and tie count
- **Round Management**: "Restart Round" button for new games
- **Win Statistics**: Shows number of moves and connection length for wins

## User Flow

### 1. Initial Experience
1. User loads the page
2. "Connect 4" title animates in with neon glow
3. Start button fades in below title
4. User clicks "Play" to begin

### 2. Game Setup
1. Title slides to top of page
2. Game board fades in with preview row
3. Scoreboard appears showing 0-0-0 (Player1-Ties-Player2)
4. Status message shows "Player 1, drop it like it's hot!"
5. Preview row shows hover effects for current player

### 3. Gameplay Loop
1. Current player hovers over board columns
2. Preview piece appears above hovered column
3. Player clicks to place piece
4. Piece animates into position with bounce effect
5. Game checks for win condition
6. If no win, turn switches to other player
7. If win detected, winning pieces blink and sound plays
8. Round ends after delay, board clears for next round

### 4. Round Completion
1. Winner announcement with move count and connection length
2. Scoreboard updates with new totals
3. Board pieces slide out with animation
4. New board appears after 2-second delay
5. Game resets for next round

## Technical Features

### 1. Win Detection Algorithm
- **Combinatorial Analysis**: Generates all possible 4-piece combinations from player moves
- **Pattern Matching**: Compares against 69 predefined winning patterns
- **Extended Connections**: Detects connections longer than 4 pieces
- **Real-time Checking**: Evaluates after each move

### 2. Board State Management
- **2D Array Structure**: 6x7 grid representation
- **Position Tracking**: Maps 1D positions (0-41) to 2D coordinates
- **Column Height Tracking**: Maintains first available row per column
- **Player Space Arrays**: Tracks occupied positions for each player

### 3. Responsive Design
- **Breakpoint System**: Three distinct layouts for different screen sizes
- **Proportional Scaling**: Elements scale appropriately for each breakpoint
- **Touch-Friendly**: Optimized for both mouse and touch interactions
- **Cross-Browser Compatibility**: Works across modern browsers

### 4. Audio Integration
- **Victory Sound**: Plays "dropit.ogg" when game is won
- **HTML5 Audio**: Uses native audio element for sound effects
- **User-Triggered**: Sound only plays after user interaction (browser policy compliance)

## Accessibility Features

### 1. Visual Design
- **High Contrast**: Black background with bright colored pieces
- **Clear Typography**: Readable fonts with appropriate sizing
- **Color Coding**: Distinct colors for each player (magenta/yellow)

### 2. Interaction Design
- **Clear Feedback**: Visual and audio cues for all actions
- **Intuitive Controls**: Click-to-place interaction model
- **State Visibility**: Clear indication of current player and game status

## Future Enhancements (Planned)

### 1. AI Opponent
- **Difficulty Levels**: Multiple AI strength options
- **Move Suggestions**: Hint system for human players
- **Learning Algorithm**: AI that improves with play

### 2. Enhanced Gameplay
- **Undo Functionality**: Ability to take back moves
- **Custom Colors**: Player color selection
- **Starting Player Toggle**: Option to change who goes first
- **Extended Scoring**: Bonus points for longer connections

### 3. User Experience
- **Instructions Modal**: How-to-play guide
- **Settings Panel**: Game customization options
- **Statistics Tracking**: Detailed game history
- **Achievement System**: Milestones and rewards

### 4. Multiplayer Features
- **Network Play**: Online multiplayer functionality
- **Room System**: Private game rooms
- **Spectator Mode**: Watch games in progress
- **Chat System**: Player communication

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Responsive design support

## Performance Considerations

- **Efficient Rendering**: CSS Grid for board layout
- **Optimized Animations**: Hardware-accelerated CSS transitions
- **Memory Management**: Proper cleanup of event listeners
- **Responsive Images**: Optimized for different screen densities

