# Integration Guide for Rork/Discord Bot

This document provides guidance on integrating the modular RPG game with Discord bot frameworks like Rork.

## Overview

The game has been restructured from a monolithic 8,392-line HTML file into a clean modular architecture that makes it easy to integrate with bot frameworks.

## Modular Structure

### CSS Modules
Located in `/css/`:
- `character-select.css` - Character class selection styling
- `username-overlay.css` - Username input overlay
- `main-game.css` - Primary game interface (inventory, equipment, map)
- `intro-overlay.css` - Story introduction overlay
- `additional-styles.css` - Supplementary styles

### JavaScript Modules
Located in `/js/`:
- `game-core.js` - Main game engine (player, inventory, combat, map)
- `/modules/character-select.js` - Character class selection logic
- `/modules/date-overlay.js` - Date management system
- `/modules/debug-mode.js` - Developer debug tools
- `/modules/intro-flames.js` - Animated flame background
- `/modules/intro-story.js` - Shop and story elements
- `/modules/main-intro.js` - Main intro overlay logic
- `/modules/music-loader.js` - Background music system
- `/modules/story-modal.js` - Story modal dialogs
- `/modules/username-overlay.js` - Username input handling

## Integration Approaches

### 1. Web Server Integration
Host the game files on a web server and serve them through Discord bot commands:

```javascript
// Example Discord.js command
client.on('messageCreate', message => {
  if (message.content === '!playgame') {
    message.reply('Start your adventure: https://your-server.com/gamebot-html');
  }
});
```

### 2. Embedded Web View
Use Discord's or Rork's web view capabilities to embed the game directly:

```javascript
// Example embedded view
const gameEmbed = new MessageEmbed()
  .setTitle('RPG Game')
  .setURL('https://your-server.com/gamebot-html')
  .setDescription('Click to start your adventure!');
```

### 3. Module Import
Import specific game modules for bot command integration:

```javascript
// Example: Use game logic in bot commands
const gameCore = require('./js/game-core.js');

// Create bot command that uses game functions
client.on('messageCreate', message => {
  if (message.content.startsWith('!attack')) {
    // Use game combat logic
    // (Note: Would require adapting to Node.js environment)
  }
});
```

### 4. Save State Integration
Use the game's save/load system with Discord user data:

```javascript
// Example: Store game state per Discord user
const userGameStates = new Map();

client.on('messageCreate', message => {
  if (message.content === '!savegame') {
    // Retrieve game state from localStorage equivalent
    const gameState = getUserGameState(message.author.id);
    userGameStates.set(message.author.id, gameState);
    message.reply('Game saved!');
  }
});
```

## API Endpoints to Consider

If building a REST API wrapper around the game:

- `POST /game/start` - Initialize new game
- `POST /game/character` - Select character class
- `GET /game/state/:userId` - Get player state
- `POST /game/action` - Perform game action (explore, attack, etc.)
- `POST /game/save` - Save game state
- `GET /game/inventory/:userId` - Get player inventory

## Configuration

### Environment Variables
```bash
GAME_URL=https://your-server.com/gamebot-html
GAME_SAVE_DIR=/path/to/save/files
DEBUG_MODE=false
```

### Discord Bot Permissions Required
- `SEND_MESSAGES` - Send game updates
- `EMBED_LINKS` - Send game embeds
- `ATTACH_FILES` - Send game screenshots/assets
- `READ_MESSAGE_HISTORY` - Track game sessions

## Game State Management

The game uses localStorage for state persistence. For bot integration:

1. **Session Management**: Track active game sessions per Discord user
2. **State Serialization**: Convert game state to JSON for storage
3. **State Restoration**: Load saved states when users return

Example game state structure:
```json
{
  "player": {
    "name": "Hero",
    "health": 100,
    "maxHealth": 100,
    "gold": 1000,
    "level": 1,
    "experience": 0,
    "inventory": [],
    "equipment": {},
    "bank": []
  },
  "map": {
    "position": {"x": 9, "y": 9},
    "discovered": [],
    "towns": [],
    "chests": []
  }
}
```

## Asset Paths

When integrating, ensure proper asset paths:
- CSS: `/css/*.css`
- JavaScript: `/js/*.js` and `/js/modules/*.js`
- Images: `/Images/` and `/assets/`
- Audio: `/Audio/`

## Global Functions

Key global functions available for bot integration:
- `movePlayer(dx, dy)` - Move player on map
- `startExplore()` - Begin exploration
- `chooseExploreDir(dx, dy)` - Choose exploration direction
- `enemyAttack()` - Enemy attack handler

## Security Considerations

1. **Input Validation**: Validate all user inputs (username, commands)
2. **Save File Security**: Encrypt save files if storing sensitive data
3. **Rate Limiting**: Prevent abuse of game commands
4. **Session Management**: Implement proper session timeouts

## Example Bot Commands

```
!startgame - Start a new RPG game
!character <melee|ranger|mage> - Select character class
!stats - View character stats
!inventory - View inventory
!explore - Explore the map
!attack - Attack current enemy
!save - Save game progress
!load - Load saved game
```

## Testing

Before deploying:
1. Test all game features work in the modular structure
2. Verify save/load functionality
3. Test character selection and progression
4. Validate combat system
5. Check inventory and equipment management

## Support

For issues or questions about integration:
1. Check the game console for JavaScript errors
2. Verify all module files are properly loaded
3. Ensure proper CORS settings if serving from different domain
4. Review browser compatibility (modern browsers required)

## Future Enhancements

Potential additions for better bot integration:
- WebSocket support for real-time multiplayer
- REST API for game state management
- Webhook notifications for game events
- Discord embed-friendly UI components
- Command-line interface version
