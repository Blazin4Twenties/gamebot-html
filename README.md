# GameBot HTML - Fantasy RPG Adventure

A fully-featured, browser-based RPG game built with pure HTML, CSS, and JavaScript. No dependencies required - just open `index.html` and start playing!

## 🎮 Game Features

### Character System
- **Three Character Classes**: Choose between Melee (🗡️), Ranger (🏹), or Mage (🪄)
- **Class-Specific Gear**: Each class starts with unique equipment and abilities
- **Character Customization**: Name your character and watch them grow
- **Class Restrictions**: Items are locked to specific classes for balanced gameplay

### Combat & Exploration
- **Turn-Based Combat**: Strategic combat with attack, defend, and special abilities
- **Auto-Attack System**: Toggle automatic combat for faster gameplay
- **Auto-Explore**: Automated exploration with directional choices
- **Prayer System**: Activate prayers for defensive and healing buffs
  - Deflect: Reduces incoming damage by 50%
  - Heal: Restores health over time
- **Spellbook** (Mage only): Cast Fire, Water, and Air spells

### Progression System
- **Experience & Leveling**: Gain XP from combat and level up
- **Skill System**: Train multiple skills including combat, prayer, and more
- **Equipment System**: Full equipment slots (weapon, shield, helmet, chest, legs, boots, gloves, amulet)
- **Item Rarity**: Common, uncommon, rare, epic, and legendary items
- **Set Bonuses**: Collect complete armor sets for powerful bonuses

### Inventory & Items
- **Mystery Bag System**: Receive a special starter bag with random powerful items
- **Bank Storage**: Store up to 200 items in your bank
- **Loot Chests**: Find treasure chests during exploration
- **Shop System**: Buy and sell items with merchants
- **Item Generation**: Dynamic loot system with random stats

### World & Encounters
- **Exploration System**: Navigate in 4 directions (North, East, South, West)
- **Random Encounters**: Face various enemies and challenges
- **Secret Tunnels**: Discover hidden passages with unique rewards
- **Prayer Altars**: Restore your prayer points at sacred altars
- **Environmental Hazards**: Navigate through dangerous terrain

### Quality of Life
- **Save System**: Multiple save slots with password protection
- **Date-Based Saves**: Organize saves by date
- **Statistics Tracking**: View detailed player stats
- **Debug Mode**: Developer tools for testing (press ` or ~ key)
- **Tooltips**: Hover over items for detailed information
- **Responsive UI**: Adapts to different screen sizes

## 🚀 Quick Start

1. **Clone or download** this repository
2. **Open** `index.html` in any modern web browser
3. **Choose** your character class
4. **Enter** your character name
5. **Start** your adventure!

## 📁 Project Structure

```
gamebot-html/
│
├── index.html          # Main game file (complete game in one file)
├── favicon.ico         # Game icon
├── README.md           # This file
├── .gitignore         # Git ignore file
│
├── Audio/             # Sound effects
│   └── prayer.mp3     # Prayer activation sound
│
└── assets/            # Game images
    └── chaos_altar.png # Prayer altar background
```

## 🎯 How to Play

### Starting Out
1. Select your class based on your playstyle:
   - **Melee**: High defense, close combat
   - **Ranger**: Balanced stats, ranged attacks
   - **Mage**: High magic damage, spell casting

2. Open your Mystery Bag to receive starter items from your father

3. Explore the world using directional buttons

### Combat Tips
- Use prayers strategically (they drain over time)
- Keep health potions in your inventory
- Equipment with higher rarity is usually better
- Watch for set bonuses when collecting armor

### Progression
- Fight enemies to gain experience
- Level up to increase your stats
- Find better equipment through exploration
- Train skills to unlock new abilities
- Save regularly to preserve your progress

## 🛠️ Technical Details

- **Pure HTML/CSS/JavaScript**: No external dependencies or frameworks
- **Client-side only**: All game logic runs in the browser
- **LocalStorage**: Saves are stored locally in your browser
- **Responsive Design**: Works on desktop and tablet devices
- **~8400 lines of code**: Complete RPG system in a single file

## 🎨 Game Mechanics

### Stats System
- Health (HP)
- Prayer Points
- Attack
- Defense
- Magic
- Ranged
- Experience (XP)

### Equipment Slots
- Weapon
- Shield
- Helmet
- Chest Armor
- Leg Armor
- Boots
- Gloves
- Amulet

### Item Properties
- Attack bonus
- Defense bonus
- Magic bonus
- Health bonus
- Prayer bonus
- Special effects

## 🐛 Known Features

- Auto-explore with smart pathfinding
- Class-restricted equipment system
- Ancient set bonus (3+ pieces = +25% attack)
- Prayer altar for prayer restoration
- Mystery bag system with class-specific loot
- Debug console for development

## 📝 License

This project is provided as-is for educational and entertainment purposes.

## 🤝 Contributing

This is a complete, standalone game. Feel free to fork and modify for your own projects!

## 🎓 Credits

- Game Design & Development: Original GameBot HTML
- Art Assets: External sources (Unsplash for backgrounds)
- Audio: Custom sound effects

## 📧 Support

For issues or questions, please open an issue on the repository.

---

**Enjoy your adventure!** 🎮⚔️🏹🪄