  // Hide all overlays and main UI until Accept Fate is clicked
  // Function to start the game (called from Accept Fate button)
  function startGame() {
    // Show main game UI
    let mainContainer = document.getElementById('container');
    if (mainContainer) mainContainer.style.display = '';
    
    // Show all game UI elements
    [
      'main-save-ui', 'explore-bar', 'direction-select-bar', 'prayer-panel', 'prayer-altar-panel', 'panel-locations-btn'
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = '';
    });
    
    // Initialize map and player position before rendering
    if (typeof initMap === "function") {
      initMap();
      playerPosition = { x: Math.floor(mapSize/2), y: Math.floor(mapSize/2) };
      discovered[playerPosition.y][playerPosition.x] = true;
    }
    
    // Render all game UI components
    if (typeof renderPlayerStats === "function") renderPlayerStats();
    if (typeof renderDerivedStats === "function") renderDerivedStats();
    if (typeof renderEquipment === "function") renderEquipment();
    if (typeof renderBagInv === "function") {
      renderBagInv();
      // Add mystery bag open buttons after rendering
      setTimeout(addMysteryBagOpenButton, 100);
    }
    if (typeof renderMap === "function") renderMap();
    
    // Continue playing background music if it was loaded
    if (backgroundAudio && musicLoaded) {
      backgroundAudio.play().catch(() => {
        document.body.addEventListener('click', () => backgroundAudio.play(), { once: true });
      });
    }
    
    // Log welcome message
    if (typeof logMsg === "function") {
      logMsg(`Welcome, ${player.name} the ${player.class || 'Adventurer'}! Your journey begins...`);
      logMsg(`You notice a mysterious bag in your inventory. Perhaps you should open it!`);
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    // Accept Fate button logic - now starts the game directly
    document.getElementById('accept-fate-btn').onclick = function() {
      // Hide intro overlay
      document.getElementById('intro-overlay').style.display = 'none';
      
      // Show the main game UI
      startGame();
    };
    // Patch username submit to give mystery bag and show game UI
    let usernameSubmit = document.getElementById('username-submit');
    if (usernameSubmit) {
      usernameSubmit.onclick = function() {
        const input = document.getElementById('username-input');
        const error = document.getElementById('username-error');
        const val = input.value.trim();
        if (!val) {
          error.textContent = 'Please enter a username.';
          error.style.display = 'block';
          return;
        }
        player.name = val;
        error.style.display = 'none';
        document.getElementById('username-overlay').style.display = 'none';
        // Set player class based on selected class
        if (window._selectedClass) {
          player.class = window._selectedClass.charAt(0).toUpperCase() + window._selectedClass.slice(1);
        } else {
          player.class = '';
        }
        // Give only the mystery bag (not direct starter gear)
        if (window._selectedClass) {
          // Reset inventory, bag, equipment
          player.inventory = [];
          player.bag = [];
          player.equipment = {
            helmet: null, weapon: null, armor: null, ring: null, arrows: null,
            cloak: null, shield: null, amulet: null, gloves: null, boots: null
          };
          // Add mystery bag to inventory
          player.inventory.push(getMysteryBagForClass(window._selectedClass));
        }
        // Show main game UI
        let mainContainer = document.getElementById('container');
        if (mainContainer) mainContainer.style.display = '';
        [
          'main-save-ui', 'explore-bar', 'direction-select-bar', 'prayer-panel', 'prayer-altar-panel', 'panel-locations-btn'
        ].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = '';
        });
        // Initialize map and player position before rendering
        if (typeof initMap === "function") {
          initMap();
          playerPosition = { x: Math.floor(mapSize/2), y: Math.floor(mapSize/2) };
          discovered[playerPosition.y][playerPosition.x] = true;
        }
        // Render stats, including class in player stats UI
        if (typeof renderPlayerStats === "function") renderPlayerStats();
        // Insert class row in player stats UI if not present
        const ul = document.getElementById('player-stats-ul');
        if (ul && player.class) {
          let classLi = ul.querySelector('.class-li');
          if (!classLi) {
            classLi = document.createElement('li');
            classLi.className = 'class-li';
            classLi.innerHTML = `<span class="player-class" style="color:#ffd36b;font-weight:bold;">Class:</span> ${player.class}`;
            // Insert after Name row (first li)
            if (ul.children.length > 0) {
              ul.insertBefore(classLi, ul.children[1]);
            } else {
              ul.appendChild(classLi);
            }
          } else {
            classLi.innerHTML = `<span class="player-class" style="color:#ffd36b;font-weight:bold;">Class:</span> ${player.class}`;
          }
        }
        if (typeof renderDerivedStats === "function") renderDerivedStats();
        if (typeof renderEquipment === "function") renderEquipment();
        if (typeof renderBagInv === "function") renderBagInv();
        if (typeof renderMap === "function") renderMap();
        // Play music if available
        const music = document.getElementById('username-music');
        if (music) {
          music.currentTime = 0;
          music.play().catch(() => {
            document.body.addEventListener('click', () => music.play(), { once: true });
          });
        }
      };
    }
  });

  // Patch renderPlayerStats to show class if present
  renderPlayerStats = function() {
    if (typeof origRenderPlayerStats === "function") origRenderPlayerStats();
    // Add class row if player.class is set
    const ul = document.getElementById('player-stats-ul');
    if (!ul) return;
    let classLi = ul.querySelector('.class-li');
    if (!classLi && player.class) {
      classLi = document.createElement('li');
      classLi.className = 'class-li';
      classLi.innerHTML = `<span class="player-class" style="color:#ffd36b;font-weight:bold;">Class:</span> ${player.class}`;
      // Insert after Name row (first li)
      if (ul.children.length > 0) {
        ul.insertBefore(classLi, ul.children[1]);
      } else {
        ul.appendChild(classLi);
      }
    } else if (classLi) {
      classLi.innerHTML = `<span class="player-class" style="color:#ffd36b;font-weight:bold;">Class:</span> ${player.class || ''}`;
    }
  };
