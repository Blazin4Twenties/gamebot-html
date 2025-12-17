  // Load button logic for main UI
  document.getElementById('main-load-btn').onclick = function() {
    document.getElementById('main-load-input').click();
  };

  // Main intro overlay JavaScript
  let selectedClassMain = null;
  let backgroundAudio = null;
  let musicLoaded = false;

  // Character class selection
  document.addEventListener('DOMContentLoaded', function() {
    const characterClasses = document.querySelectorAll('.character-class');
    characterClasses.forEach(function(classCard) {
      classCard.addEventListener('click', function() {
        // Remove selection from all cards
        characterClasses.forEach(function(card) {
          card.style.border = '3px solid transparent';
          card.classList.remove('selected');
        });
        
        // Add selection to clicked card
        this.style.border = '3px solid #ffba3a';
        this.classList.add('selected');
        selectedClassMain = this.getAttribute('data-class');
      });
    });

    // Music controls
    const loadMusicBtn = document.getElementById('load-music-btn');
    const loadSaveBtn = document.getElementById('load-save-btn');
    const playMusicBtn = document.getElementById('play-music-btn');
    const stopMusicBtn = document.getElementById('stop-music-btn');
    const musicFileInput = document.getElementById('music-file-input');
    const saveFileInput = document.getElementById('save-file-input');
    backgroundAudio = document.getElementById('background-audio');

    loadMusicBtn.addEventListener('click', function() {
      musicFileInput.click();
    });

    loadSaveBtn.addEventListener('click', function() {
      saveFileInput.click();
    });

    musicFileInput.addEventListener('change', function() {
      const file = musicFileInput.files[0];
      const musicTitle = document.getElementById('music-title');
      
      if (file && file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        backgroundAudio.src = url;
        musicLoaded = true;
        playMusicBtn.disabled = false;
        stopMusicBtn.disabled = false;
        
        // Update the title to show the loaded file name
        const fileName = file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name;
        musicTitle.textContent = `Background Music: ${fileName}`;
        musicTitle.title = file.name; // Show full name on hover
        
        // Enable buttons and reset their appearance
        playMusicBtn.disabled = false;
        stopMusicBtn.disabled = false;
        playMusicBtn.style.opacity = '1';
        stopMusicBtn.style.opacity = '1';
        playMusicBtn.style.cursor = 'pointer';
        stopMusicBtn.style.cursor = 'pointer';
      } else if (file) {
        alert('Please select a valid audio file.');
        // Reset title if invalid file
        musicTitle.textContent = 'Background Music';
        musicTitle.title = '';
      }
    });

    playMusicBtn.addEventListener('click', function() {
      if (musicLoaded && backgroundAudio) {
        backgroundAudio.play();
        playMusicBtn.textContent = 'Playing...';
        playMusicBtn.disabled = true;
        
        // Re-enable play button when music ends or is paused
        backgroundAudio.addEventListener('ended', function() {
          playMusicBtn.textContent = 'Play';
          playMusicBtn.disabled = false;
        });
        
        backgroundAudio.addEventListener('pause', function() {
          if (backgroundAudio.currentTime === 0) { // Only if stopped, not just paused
            playMusicBtn.textContent = 'Play';
            playMusicBtn.disabled = false;
          }
        });
      }
    });

    stopMusicBtn.addEventListener('click', function() {
      if (backgroundAudio) {
        backgroundAudio.pause();
        backgroundAudio.currentTime = 0;
        
        // Reset the title when music is stopped
        const musicTitle = document.getElementById('music-title');
        if (musicTitle) {
          musicTitle.textContent = 'Background Music';
          musicTitle.title = '';
        }
        
        // Reset music loaded state and disable buttons
        musicLoaded = false;
        playMusicBtn.disabled = true;
        stopMusicBtn.disabled = true;
        playMusicBtn.style.opacity = '0.5';
        stopMusicBtn.style.opacity = '0.5';
        playMusicBtn.style.cursor = 'not-allowed';
        stopMusicBtn.style.cursor = 'not-allowed';
        playMusicBtn.textContent = 'Play'; // Reset button text
        
        // Clear the audio source
        backgroundAudio.src = '';
      }
    });

    // Load save file functionality
    saveFileInput.addEventListener('change', function(e) {
      try {
        const file = e.target.files[0];
        if (!file) throw new Error('No file selected.');
        const reader = new FileReader();
        reader.onload = function(evt) {
          try {
            const saveData = JSON.parse(evt.target.result);
            if (
              !saveData.player ||
              typeof saveData.player !== 'object' ||
              !saveData.visitedTowns ||
              typeof saveData.visitedTowns !== 'object' ||
              !saveData.playerPosition ||
              typeof saveData.playerPosition !== 'object'
            ) {
              throw new Error('Invalid save file structure.');
            }
            
            // Load the save data
            loadSaveData(saveData);
            
            // Hide intro overlay and start the game
            document.getElementById('main-intro-overlay').style.display = 'none';
            startGame();
            
            alert('Game loaded from file! Welcome back, ' + (saveData.player.name || 'Hero') + '!');
          } catch (err) {
            alert('Failed to load save: ' + (err && err.message ? err.message : err));
          }
        };
        reader.readAsText(file);
      } catch (err) {
        alert('Error reading file: ' + (err && err.message ? err.message : err));
      }
      // Clear the input for future loads
      e.target.value = '';
    });

    // Begin Your Legend button
    const beginLegendBtn = document.getElementById('begin-legend-btn');
    const usernameField = document.getElementById('username-input-field');
    const usernameError = document.getElementById('username-error-main');

    beginLegendBtn.addEventListener('click', function() {
      const username = usernameField.value.trim();
      
      if (!username) {
        usernameError.textContent = 'Please enter a username.';
        usernameError.style.display = 'block';
        return;
      }
      
      if (!selectedClassMain) {
        usernameError.textContent = 'Please select a character class.';
        usernameError.style.display = 'block';
        return;
      }

      // Hide error and proceed
      usernameError.style.display = 'none';
      
      // Set up player with selected class and username
      setupPlayerClass(selectedClassMain, username);
      
      // Hide main intro overlay and show character-specific intro
      document.getElementById('main-intro-overlay').style.display = 'none';
      showClassIntro(selectedClassMain);
    });

    // Handle Enter key in username field
    usernameField.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        beginLegendBtn.click();
      }
    });

    // Clear error when typing
    usernameField.addEventListener('input', function() {
      usernameError.style.display = 'none';
    });
  });

  // Function to load save data
  function loadSaveData(saveData) {
    // Reset map first
    if (typeof initMap === "function") {
      initMap();
    }
    
    // Clear visited towns
    if (typeof visitedTowns === "object") {
      Object.keys(visitedTowns).forEach(k => delete visitedTowns[k]);
      // Restore visited towns from save
      if (saveData.visitedTowns) {
        Object.assign(visitedTowns, saveData.visitedTowns);
      }
    }
    
    // Load player data
    player.name = saveData.player.name || "Hero";
    player.class = saveData.player.class || "";
    player.health = typeof saveData.player.health === "number" ? saveData.player.health : 100;
    player.maxHealth = typeof saveData.player.maxHealth === "number" ? saveData.player.maxHealth : 100;
    player.gold = typeof saveData.player.gold === "number" ? saveData.player.gold : 0;
    player.experience = typeof saveData.player.experience === "number" ? saveData.player.experience : 0;
    player.level = typeof saveData.player.level === "number" ? saveData.player.level : 1;
    player.attack = typeof saveData.player.attack === "number" ? saveData.player.attack : 10;
    player.defense = typeof saveData.player.defense === "number" ? saveData.player.defense : 5;
    player.bankGold = typeof saveData.player.bankGold === "number" ? saveData.player.bankGold : 0;
    player.prayer = typeof saveData.player.prayer === "number" ? saveData.player.prayer : 50;
    player.maxPrayer = typeof saveData.player.maxPrayer === "number" ? saveData.player.maxPrayer : 50;
    
    // Load inventory and equipment
    player.inventory = Array.isArray(saveData.player.inventory) ? JSON.parse(JSON.stringify(saveData.player.inventory)) : [];
    player.bag = Array.isArray(saveData.player.bag) ? JSON.parse(JSON.stringify(saveData.player.bag)) : [];
    player.equipment = typeof saveData.player.equipment === "object" && saveData.player.equipment !== null
      ? JSON.parse(JSON.stringify(saveData.player.equipment))
      : { helmet: null, chestplate: null, leggings: null, boots: null, weapon: null, shield: null, gloves: null, cape: null, amulet: null, ring: null, arrows: null };
    player.bank = Array.isArray(saveData.player.bank) ? JSON.parse(JSON.stringify(saveData.player.bank)) : [];
    
    // Set player position (default to central town)
    playerPosition.x = Math.floor(mapSize/2);
    playerPosition.y = Math.floor(mapSize/2);
    if (discovered && discovered[playerPosition.y]) {
      discovered[playerPosition.y][playerPosition.x] = true;
    }
  }

  // Function to set up player based on selected class
  function setupPlayerClass(playerClass, username) {
    // Starter gear for each class (for mystery bag contents)
    let starterGear = {
      melee: [
        { name: "Starter Sword", type: "weapon", attack: 12, rarity: "common", description: "A basic sword for melee combat." },
        { name: "Starter Shield", type: "shield", defense: 8, rarity: "common", description: "A basic shield for blocking attacks." },
        { name: "Starter Armor", type: "chestplate", defense: 10, rarity: "common", description: "Sturdy armor for protection." },
        { name: "Starter Helmet", type: "helmet", defense: 5, maxHealth: 10, rarity: "common", description: "A simple helmet." },
        { name: "Health Potion", type: "consumable", healing: 50, count: 5, rarity: "common" }
      ],
      ranger: [
        { name: "Starter Bow", type: "weapon", attack: 10, rarity: "common", description: "A basic bow for ranged attacks." },
        { name: "Arrows", type: "arrows", attack: 3, count: 50, rarity: "common", description: "A bundle of arrows." },
        { name: "Starter Cloak", type: "cape", defense: 6, maxHealth: 8, rarity: "common", description: "A light cloak for agility." },
        { name: "Starter Boots", type: "boots", defense: 4, maxHealth: 8, rarity: "common", description: "Light boots for quick movement." },
        { name: "Health Potion", type: "consumable", healing: 50, count: 5, rarity: "common" }
      ],
      mage: [
        { name: "Starter Staff", type: "weapon", attack: 11, rarity: "common", description: "A basic staff for casting spells." },
        { name: "Starter Robe", type: "chestplate", defense: 7, rarity: "common", description: "An enchanted robe for mages." },
        { name: "Starter Amulet", type: "amulet", defense: 4, rarity: "common", description: "A magical amulet." },
        { name: "Starter Ring", type: "ring", attack: 2, maxHealth: 6, rarity: "common", description: "A ring that boosts magic." },
        { name: "Health Potion", type: "consumable", healing: 50, count: 5, rarity: "common" },
        { name: "Fire Rune", type: "material", count: 100, rarity: "common", description: "A rune for fire spells." },
        { name: "Air Rune", type: "material", count: 100, rarity: "common", description: "A rune for air spells." },
        { name: "Water Rune", type: "material", count: 100, rarity: "common", description: "A rune for water spells." }
      ]
    };

    // Reset player to base stats
    player = {
      name: username,
      class: playerClass.charAt(0).toUpperCase() + playerClass.slice(1), // Capitalize class name
      level: 1,
      experience: 0,
      health: 100,
      maxHealth: 100,
      attack: 10,
      defense: 5,
      gold: 100,
      inventory: [],
      bag: [],
      equipment: {
        helmet: null, chestplate: null, leggings: null, boots: null,
        weapon: null, shield: null, gloves: null, cape: null,
        amulet: null, ring: null, arrows: null
      },
      position: { x: Math.floor(mapSize/2), y: Math.floor(mapSize/2) },
      prayer: 50,
      maxPrayer: 50
    };

    // Create and add mystery bag with class-specific contents
    const mysteryBag = {
      name: "<span style='color:#e53935;font-weight:bold;'>??????</span>",
      type: "mystery",
      description: "Dare to open it?",
      _mysteryBagContents: starterGear[playerClass] || []
    };
    
    // Add mystery bag to inventory
    player.inventory.push(mysteryBag);

    // Store selected class for later use
    window._selectedClass = playerClass;
    window._starterGear = starterGear[playerClass];
  }

  // Mystery bag functionality
  function showMysteryBagUI(item, idx, itemsArr) {
    const ui = document.getElementById('mystery-bag-ui');
    const inner = document.getElementById('mystery-bag-ui-inner');
    if (!ui || !inner) return;
    
    // Reset UI state
    inner.querySelector('.bag-icon').textContent = "🎒";
    inner.querySelector('.bag-title').textContent = "The Mystery Bag";
    inner.querySelector('.bag-details').textContent = "Your father whom you only seen once left you with his prime possessions, including this bag. It is said to contain powerful items for those who seek adventure.";
    inner.querySelector('.bag-desc').textContent = "A chill runs down your spine as you gaze upon the bag. Its contents are unknown, its power... undeniable.";
    inner.querySelector('.bag-warning').textContent = "Are you ready to reveal your fate?";
    inner.querySelector('.bag-open-btn').style.display = "";
    inner.querySelector('.bag-close-btn').style.display = "none";
    ui.style.display = "flex";

    // Open logic
    inner.querySelector('.bag-open-btn').onclick = function() {
      // Remove bag from inventory/bag
      itemsArr.splice(idx, 1);
      
      // Add all contents to inventory/bag as appropriate
      const contents = item._mysteryBagContents || [];
      contents.forEach(gear => {
        // If arrows, stack or add to bag
        if (gear.type === "arrows") {
          let found = false;
          for (let i = 0; i < player.bag.length; i++) {
            if (player.bag[i].type === "arrows") {
              player.bag[i].count = (player.bag[i].count || 0) + (gear.count || 0);
              found = true;
              break;
            }
          }
          if (!found) player.bag.push({...gear});
        }
        // If runes/materials, stack in inventory
        else if (gear.type === "material") {
          let found = false;
          for (let i = 0; i < player.inventory.length; i++) {
            if (player.inventory[i].name === gear.name && player.inventory[i].type === "material") {
              player.inventory[i].count = (player.inventory[i].count || 0) + (gear.count || 0);
              found = true;
              break;
            }
          }
          if (!found) player.inventory.push({...gear});
        }
        // Potions/consumables to inventory
        else if (gear.type === "consumable") {
          player.inventory.push({...gear});
        }
        // Equip first weapon/armor/helmet/shield/amulet/ring/cape/boots if not equipped, else bag
        else if (gear.type === "weapon" && !player.equipment.weapon) player.equipment.weapon = {...gear};
        else if (gear.type === "chestplate" && !player.equipment.chestplate) player.equipment.chestplate = {...gear};
        else if (gear.type === "helmet" && !player.equipment.helmet) player.equipment.helmet = {...gear};
        else if (gear.type === "shield" && !player.equipment.shield) player.equipment.shield = {...gear};
        else if (gear.type === "amulet" && !player.equipment.amulet) player.equipment.amulet = {...gear};
        else if (gear.type === "ring" && !player.equipment.ring) player.equipment.ring = {...gear};
        else if (gear.type === "cape" && !player.equipment.cape) player.equipment.cape = {...gear};
        else if (gear.type === "boots" && !player.equipment.boots) player.equipment.boots = {...gear};
        else player.bag.push({...gear});
      });
      
      // Show completion message
      inner.querySelector('.bag-title').textContent = "The Bag Opens...";
      inner.querySelector('.bag-desc').textContent = "A surge of energy bursts forth as you open the bag, revealing your starting gear!";
      inner.querySelector('.bag-warning').textContent = "";
      inner.querySelector('.bag-icon').textContent = "✨";
      inner.querySelector('.bag-details').textContent = ""; 
      inner.querySelector('.bag-open-btn').style.display = "none";
      inner.querySelector('.bag-close-btn').style.display = "";
      
      // Update all UI components
      if (typeof renderBagInv === "function") renderBagInv();
      if (typeof renderEquipment === "function") renderEquipment();
      if (typeof renderPlayerStats === "function") renderPlayerStats();
      if (typeof renderDerivedStats === "function") renderDerivedStats();
    };
    
    // Close logic
    inner.querySelector('.bag-close-btn').onclick = function() {
      ui.style.display = "none";
    };
    
    // Also close if user clicks outside the inner box
    ui.onclick = function(e) {
      if (e.target === ui) ui.style.display = "none";
    };
  }

  // Function to add mystery bag open button to inventory items
  function addMysteryBagOpenButton() {
    const content = document.getElementById('baginv-content');
    if (!content) return;
    
    let itemsArr = baginvTab === "inventory" ? player.inventory : player.bag;
    content.querySelectorAll('.item-card').forEach((card, idx) => {
      const item = itemsArr[idx];
      if (item && item.type === "mystery") {
        // Add Open button if not already present
        if (!card.querySelector('.mystery-bag-open-btn')) {
          const btn = document.createElement('button');
          btn.className = 'item-action-btn mystery-bag-open-btn';
          btn.textContent = 'Open';
          btn.style.background = '#ffba3a';
          btn.style.color = '#23252a';
          btn.style.fontWeight = 'bold';
          btn.style.marginTop = '6px';
          btn.style.border = 'none';
          btn.style.borderRadius = '4px';
          btn.style.padding = '4px 12px';
          btn.style.cursor = 'pointer';
          btn.onclick = function(e) {
            e.stopPropagation();
            showMysteryBagUI(item, idx, itemsArr);
          };
          card.appendChild(btn);
        }
      }
    });
  }

  // Function to show class-specific intro
  function showClassIntro(playerClass) {
    const introOverlay = document.getElementById('intro-overlay');
    const introTitle = document.getElementById('intro-title');
    const introStory = document.getElementById('intro-story');
    
    // Define class intro stories
    let classIntroStories = {
      melee: `
        <p style="color:#eee;line-height:1.6;margin-bottom:15px;">
          You are a <b>Melee Warrior</b>, forged in the fires of battle. Your sword and shield are your closest allies, and your armor bears the scars of countless fights. The world awaits your strength and courage.
        </p>
      `,
      ranger: `
        <p style="color:#eee;line-height:1.6;margin-bottom:15px;">
          You are a <b>Ranger</b>, swift and silent. Your bow finds its mark from the shadows, and your arrows never miss. The wilds are your home, and adventure calls you to explore the unknown.
        </p>
      `,
      mage: `
        <p style="color:#eee;line-height:1.6;margin-bottom:15px;">
          You are a <b>Mage</b>, student of the arcane. The mysteries of magic bend to your will, and your staff crackles with power. The world is full of secrets, and you are ready to uncover them.
        </p>
      `
    };
    
    // Set class-specific title
    switch (playerClass) {
      case 'melee':
        introTitle.textContent = "The Warrior's Calling";
        break;
      case 'ranger':
        introTitle.textContent = "The Hunter's Path";
        break;
      case 'mage':
        introTitle.textContent = "The Arcane Awakening";
        break;
      default:
        introTitle.textContent = "Fate's Awakening";
    }
    
    // Set comprehensive intro story
    let html = classIntroStories[playerClass] +
      `<p style="color:#eee;line-height:1.6;margin-bottom:15px;">
        In a world torn by ancient wars and forgotten magic, you awaken in the heart of the realm—Central Town. The lands around you are shrouded in mystery, with forests, mountains, deserts, and ruins waiting to be discovered. Towns bustle with life, each holding secrets, rare sellers, and unique events. Chests glimmer in hidden corners, promising gold and treasures to the bold.
      </p>
      <p style="color:#eee;line-height:1.6;margin-bottom:15px;">
        As you journey, you will face a host of enemies—from cunning goblins to legendary bosses. Equip powerful weapons, armor, rings, and more to survive. Manage your inventory and bag, deposit valuables in the bank, and seek out the shop for ever-changing wares. Special sellers in towns offer rare items for those who explore bravely.
      </p>
      <p style="color:#eee;line-height:1.6;margin-bottom:15px;">
        Harness the power of Prayer to deflect attacks or heal in battle. Visit the Prayer Altar to renew your strength. Level up, gain experience, and unlock the ancient set for unmatched power. Auto-explore the world, auto-attack foes, and shape your fate.
      </p>
      <p style="color:#eee;line-height:1.6;margin-bottom:15px;">
        <b style="color:#ffba3a;">Features:</b>
        <ul style="margin-left:18px;color:#ccc;">
          <li>18x18 grid map with towns, chests, and areas</li>
          <li>Dynamic inventory, bag, equipment, and bank system</li>
          <li>Shop with rotating items and full armor sets</li>
          <li>Special sellers in towns with rare items</li>
          <li>Prayer system: Deflect & Heal, with altar renewal</li>
          <li>Auto-explore and auto-attack options</li>
          <li>Ancient Boss with unique rewards and set bonuses</li>
          <li>Save/load your progress and upload custom music</li>
          <li>More to come!</li>
        </ul>
      </p>
      <p style="color:#ffba3a;line-height:1.6;font-weight:bold;text-align:center;">
        Your destiny awaits. Will you accept your fate and begin your Journey?
      </p>`;
    
    introStory.innerHTML = html;
    introOverlay.style.display = 'flex';
  }
