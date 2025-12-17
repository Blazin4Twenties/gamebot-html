# gamebot-html

A modular RPG browser game with character selection, inventory management, combat, and exploration.

## File Structure

The game has been restructured from a single monolithic HTML file into a modular architecture:

```
gamebot-html/
├── index.html              # Main entry point (modular version)
├── index-original.html     # Original monolithic version (backup)
├── css/                    # Stylesheets
│   ├── character-select.css
│   ├── username-overlay.css
│   ├── main-game.css
│   ├── intro-overlay.css
│   └── additional-styles.css
├── js/                     # JavaScript modules
│   ├── game-core.js        # Main game logic
│   └── modules/            # Feature modules
│       ├── character-select.js
│       ├── date-overlay.js
│       ├── debug-mode.js
│       ├── intro-flames.js
│       ├── intro-story.js
│       ├── main-intro.js
│       ├── music-loader.js
│       ├── story-modal.js
│       └── username-overlay.js
├── Audio/                  # Game audio files
│   └── prayer.mp3
├── Images/                 # Game images
│   └── chaos_altar.png
├── assets/                 # Additional assets
│   └── chaos_altar.png
└── favicon.ico            # Game icon
```

## Features

- **Character Classes**: Choose from Melee, Ranger, or Mage classes
- **Inventory System**: Manage items, equipment, and consumables
- **Equipment System**: 10 equipment slots (helmet, weapon, armor, shield, etc.)
- **Combat System**: Explore areas and battle enemies
- **Banking System**: Store items and gold safely
- **Save/Load System**: Save your progress and load game states
- **Music System**: Custom background music support
- **Debug Mode**: Developer tools for testing

## Usage

Simply open `index.html` in a modern web browser to play the game.

## Development

The modular structure makes it easier to:
- Maintain and update individual features
- Debug specific game systems
- Add new functionality
- Integrate with bot frameworks (like Rork/Discord bots)

## Integration with Rork

This modular structure is designed to be easily integrated with Discord bot frameworks. The separated CSS, JavaScript modules, and HTML structure allow for:
- Serving individual modules as needed
- Embedding game components in Discord bot interfaces
- Reusing game logic in bot commands