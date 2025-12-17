(function() {
  let debugMode = false;
  let unlimitedHealth = false;



  // Store if password was validated
  let debugPasswordValidated = false;

  function showDebugPasswordPrompt(callback) {
    // Remove old popup if exists
    let old = document.getElementById('debug-password-popup');
    if (old) old.remove();
    // Create popup
    const popup = document.createElement('div');
    popup.id = 'debug-password-popup';
    popup.style = 'position:fixed;z-index:100001;top:0;left:0;width:100vw;height:100vh;background:#191a1ecc;display:flex;align-items:center;justify-content:center;';
    popup.innerHTML = `
      <div style="background:#23252a;padding:32px 38px 24px 38px;border-radius:18px;box-shadow:0 2px 24px #000a;display:flex;flex-direction:column;align-items:center;min-width:320px;">
        <div style="color:#ffba3a;font-size:1.2em;margin-bottom:18px;">Enter Debug Password</div>
        <input id="debug-password-input" type="password" placeholder="Password..." style="font-size:1.1em;padding:6px 18px;border-radius:7px;border:1.5px solid #444;background:#18191c;color:#fff;margin-bottom:18px;width:180px;outline:none;">
        <div id="debug-password-error" style="color:#ff4444;margin-bottom:10px;display:none;font-size:1em;"></div>
        <div style="display:flex;gap:18px;">
          <button id="debug-password-ok" style="font-size:1.1em;font-weight:bold;background:#ffba3a;color:#23252a;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">OK</button>
          <button id="debug-password-cancel" style="font-size:1.1em;font-weight:bold;background:#35373e;color:#ffba3a;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(popup);
    document.getElementById('debug-password-ok').onclick = function() {
      const val = document.getElementById('debug-password-input').value;
      if (val === debugSecret) {
        debugPasswordValidated = true;
        popup.remove();
        callback(true);
      } else {
        document.getElementById('debug-password-error').textContent = "Incorrect password.";
        document.getElementById('debug-password-error').style.display = 'block';
      }
    };
    document.getElementById('debug-password-cancel').onclick = function() {
      popup.remove();
      callback(false);
    };
    document.getElementById('debug-password-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') document.getElementById('debug-password-ok').click();
    });
    setTimeout(() => document.getElementById('debug-password-input').focus(), 100);
  }

  function createDebugUI() {
    // Remove existing popup if any
    let oldPopup = document.getElementById('debug-popup');
    if (oldPopup) oldPopup.remove();

    // Create popup
    const popup = document.createElement('div');
    popup.id = 'debug-popup';
    popup.style.display = debugMode ? 'flex' : 'none';
    popup.style.position = 'fixed';
    popup.style.zIndex = '100000';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100vw';
    popup.style.height = '100vh';
    popup.style.background = '#191a1ecc';
    popup.style.alignItems = 'center';
    popup.style.justifyContent = 'center';

    popup.innerHTML = `
      <div id="debug-popup-inner">
        <div style="font-size:1.5em;color:#ff4444;font-weight:bold;margin-bottom:18px;">Debug Mode</div>
        <div class="debug-section">
          <label><input type="checkbox" id="debug-unlimited-health"> Unlimited Health</label>
        </div>
        <div class="debug-section">
          <button id="debug-1hit-weapon" style="background:#ffba3a;color:#23252a;border:none;border-radius:6px;padding:6px 18px;font-weight:bold;cursor:pointer;">Give 1-Hit Kill Weapon</button>
        </div>
        <!-- Force Spawn Enemy section removed -->
        <div class="debug-section">
          <label>Force Encounter:</label>
          <select id="debug-encounter-list"></select>
          <button id="debug-force-encounter" style="margin-left:8px;">Trigger</button>
        </div>
        <div class="debug-section">
          <label><input type="checkbox" id="debug-disable-checkbox"> Disable Debug Mode & Menu</label>
        </div>
        <button id="debug-close-btn" style="margin-top:12px;background:#35373e;color:#ffba3a;border:none;border-radius:6px;padding:6px 18px;font-weight:bold;cursor:pointer;">Close</button>
      </div>
    `;
    document.body.appendChild(popup);

    // Populate enemy and encounter lists
    populateEnemyList();
    populateEncounterList();

    // Event handlers
    document.getElementById('debug-unlimited-health').checked = unlimitedHealth;
    document.getElementById('debug-unlimited-health').onchange = function() {
      unlimitedHealth = this.checked;
    };
    document.getElementById('debug-1hit-weapon').onclick = function() {
      let weapon = {
        name: "Debug 1-Hit Sword",
        type: "weapon",
        attackPower: 99999,
        price: 0,
        description: "Debug sword. Instantly kills enemies."
      };
      addItem(weapon);
      logMsg('<span style="color:#ff4444;">Debug: 1-Hit Kill Weapon added to bag.</span>');
      renderBagInv && renderBagInv();
    };
    document.getElementById('debug-force-encounter').onclick = function() {
      let enc = document.getElementById('debug-encounter-list').value;
      if (!enc) return;
      if (enc === "Normal Enemy") {
        showEnemy && showEnemy();
        logMsg('<span style="color:#ff4444;">Debug: Forced normal enemy encounter.</span>');
      } else if (enc === "Ancient Boss") {
        window.showAncientBoss && window.showAncientBoss();
        logMsg('<span style="color:#ff4444;">Debug: Forced Ancient Boss encounter.</span>');
      } else if (enc === "Secret Tunnel") {
        window.showSecretTunnelPopup && window.showSecretTunnelPopup();
        logMsg('<span style="color:#ff4444;">Debug: Forced Secret Tunnel encounter.</span>');
      } else if (enc === "Unknown Enemy") {
        window.failSecretTunnelEncounter && window.failSecretTunnelEncounter();
        logMsg('<span style="color:#ff4444;">Debug: Forced Unknown Enemy encounter.</span>');
      }
      popup.style.display = 'none';
    };
    document.getElementById('debug-disable-checkbox').checked = !debugMode;
    document.getElementById('debug-disable-checkbox').onchange = function() {
      if (this.checked) {
        debugMode = false;
        unlimitedHealth = false;
        removeDebugUI();
        updateDebugBanner();
      }
    };
    document.getElementById('debug-close-btn').onclick = function() {
      popup.style.display = 'none';
      debugMode = false;
      unlimitedHealth = false;
      removeDebugUI();
      updateDebugBanner();
    };
    function populateEnemyList() {
      let debugEnemyList = document.getElementById('debug-enemy-list');
      if (!debugEnemyList) return;
      debugEnemyList.innerHTML = "";
      // Hardcoded enemy list
      const debugEnemies = [
        { name: "Slime", maxHealth: 40, minAttack: 4, maxAttack: 9, xp: 15 },
        { name: "Goblin", maxHealth: 55, minAttack: 7, maxAttack: 14, xp: 22 },
        { name: "Wolf", maxHealth: 65, minAttack: 10, maxAttack: 19, xp: 29 },
        { name: "Bandit", maxHealth: 80, minAttack: 14, maxAttack: 23, xp: 40 },
        { name: "Orc", maxHealth: 120, minAttack: 18, maxAttack: 29, xp: 60 },
        { name: "Dark Knight", maxHealth: Math.floor(Math.random() * 101) + 150, minAttack: 30, maxAttack: 40, xp: Math.floor(Math.random() * 51) + 50 },
        { name: "Fire Elemental", maxHealth: Math.floor(Math.random() * 101) + 150, minAttack: 30, maxAttack: 40, xp: Math.floor(Math.random() * 51) + 50 },
        { name: "Stone Golem", maxHealth: Math.floor(Math.random() * 101) + 150, minAttack: 30, maxAttack: 40, xp: Math.floor(Math.random() * 51) + 50 },
        { name: "Vampire Lord", maxHealth: Math.floor(Math.random() * 101) + 150, minAttack: 30, maxAttack: 40, xp: Math.floor(Math.random() * 51) + 50 },
        { name: "Frost Giant", maxHealth: Math.floor(Math.random() * 101) + 150, minAttack: 30, maxAttack: 40, xp: Math.floor(Math.random() * 51) + 50 },
        { name: "Shadow Assassin", maxHealth: Math.floor(Math.random() * 101) + 150, minAttack: 30, maxAttack: 40, xp: Math.floor(Math.random() * 51) + 50 },
        { name: "Ancient Dragon", maxHealth: Math.floor(Math.random() * 101) + 150, minAttack: 30, maxAttack: 40, xp: Math.floor(Math.random() * 51) + 50 },
        { name: "Lich King", maxHealth: Math.floor(Math.random() * 101) + 150, minAttack: 30, maxAttack: 40, xp: Math.floor(Math.random() * 51) + 50 },
        { name: "Forest Guardian", maxHealth: Math.floor(Math.random() * 101) + 150, minAttack: 30, maxAttack: 40, xp: Math.floor(Math.random() * 51) + 50 },
        { name: "Thunder Beast", maxHealth: Math.floor(Math.random() * 101) + 150, minAttack: 30, maxAttack: 40, xp: Math.floor(Math.random() * 51) + 50 },
        { name: "Skeleton Warrior", maxHealth: 70, minAttack: 12, maxAttack: 20, xp: 32 },
        { name: "Zombie", maxHealth: 90, minAttack: 10, maxAttack: 18, xp: 28 },
        { name: "Harpy", maxHealth: 60, minAttack: 15, maxAttack: 22, xp: 35 },
        { name: "Troll", maxHealth: 140, minAttack: 20, maxAttack: 32, xp: 55 },
        { name: "Sand Wraith", maxHealth: 85, minAttack: 17, maxAttack: 25, xp: 38 },
        { name: "Cursed Knight", maxHealth: 130, minAttack: 25, maxAttack: 36, xp: 65 },
        { name: "Giant Spider", maxHealth: 75, minAttack: 13, maxAttack: 21, xp: 30 },
        { name: "Dire Bear", maxHealth: 110, minAttack: 18, maxAttack: 28, xp: 48 },
        { name: "Crystal Serpent", maxHealth: 100, minAttack: 22, maxAttack: 33, xp: 52 },
        { name: "Wraith", maxHealth: 95, minAttack: 19, maxAttack: 27, xp: 44 }
      ];
      debugEnemies.forEach(e => {
        let opt = document.createElement('option');
        opt.value = e.name;
        opt.textContent = e.name;
        debugEnemyList.appendChild(opt);
      });
      // Add Ancient Boss if present
      if (window.ancientBossData && window.ancientBossData.name) {
        let opt = document.createElement('option');
        opt.value = window.ancientBossData.name;
        opt.textContent = window.ancientBossData.name;
        debugEnemyList.appendChild(opt);
      }
      renderPlayerStats && renderPlayerStats();
    }
    function populateEncounterList() {
      let debugEncounterList = document.getElementById('debug-encounter-list');
      if (!debugEncounterList) return;
      debugEncounterList.innerHTML = "";
      const encounters = [
        "Normal Enemy",
        "Ancient Boss",
        "Secret Tunnel",
        "Unknown Enemy"
      ];
      encounters.forEach(enc => {
        let opt = document.createElement('option');
        opt.value = enc;
        opt.textContent = enc;
        debugEncounterList.appendChild(opt);
      });
    }
  }

  // F12 toggles debug mode
  window.addEventListener('keydown', function(e) {
    if (e.key === "F12") {
      if (!debugPasswordValidated) {
        showDebugPasswordPrompt(function(success) {
          if (success) {
            debugMode = true;
            createDebugUI();
            updateDebugBanner();
          }
        });
      } else {
        debugMode = !debugMode;
        if (debugMode) {
          createDebugUI();
        } else {
          unlimitedHealth = false;
          removeDebugUI();
        }
        updateDebugBanner();
      }
      e.preventDefault();
    }
  });

  // Banner click shows debug UI if enabled
  let banner = document.getElementById('debug-mode-banner');
  if (banner) {
    banner.onclick = function() {
      if (debugMode) {
        createDebugUI();
        let popup = document.getElementById('debug-popup');
        if (popup) popup.style.display = 'flex';
      }
    };
  }

  function removeDebugUI() {
    let popup = document.getElementById('debug-popup');
    if (popup) popup.remove();
  }
  function updateDebugBanner() {
    let banner = document.getElementById('debug-mode-banner');
    if (banner) banner.style.display = debugMode ? 'block' : 'none';
  }
// --- MOVE COUNTER LOGIC FOR MAP UI ---
// Counts and displays the number of moves made in the current explore/auto-explore session.

// Add move counter UI to the map panel if not present
if (!document.getElementById('move-counter-label')) {
  const label = document.createElement('div');
  label.id = 'move-counter-label';
  label.style = 'color:#ffd36b;font-weight:bold;font-size:1.08em;text-align:center;margin-bottom:6px;';
  label.textContent = 'Moves: 0';
  const mapPanel = document.getElementById('map-panel') || document.getElementById('map-container');
  if (mapPanel) {
    mapPanel.insertBefore(label, mapPanel.firstChild);
  }
}

// Track moves for current explore/auto-explore session
let moveCounter = 0;
let moveCounterActive = true; // Always active unless user dies

// Helper to update the move counter UI
function updateMoveCounterUI() {
  const label = document.getElementById('move-counter-label');
  if (label) {
    label.textContent = `Moves: ${moveCounter}`;
  }
}

// Only reset move counter on player death/respawn
function resetMoveCounter() {
  moveCounter = 0;
  moveCounterActive = true;
  updateMoveCounterUI();
}

// Increment move counter and update UI
function incrementMoveCounter() {
  if (moveCounterActive) {
    moveCounter++;
    updateMoveCounterUI();
  }
}

// Patch doExplore to increment move counter on each step
const origDoExploreForMoves = typeof doExplore === "function" ? doExplore : null;
doExplore = function() {
  incrementMoveCounter();
  origDoExploreForMoves && origDoExploreForMoves();
};

// Patch autoExploreLoop to increment move counter on each step
const origAutoExploreLoopForMoves = typeof autoExploreLoop === "function" ? autoExploreLoop : null;
autoExploreLoop = function() {
  incrementMoveCounter();
  origAutoExploreLoopForMoves && origAutoExploreLoopForMoves();
};

// Patch respawnPlayer to reset move counter on death
const origRespawnPlayerForMoves = typeof respawnPlayer === "function" ? respawnPlayer : null;
respawnPlayer = function() {
  resetMoveCounter();
  origRespawnPlayerForMoves && origRespawnPlayerForMoves();
};

})();
/*
  --- SPELLBOOK UI & LOGIC FOR MAGE CLASS ---
  Adds a spellbook panel below prayer panel, with three spells: Fire, Water, Air.
  Only available for Mage class. Spells require runes from inventory and can be toggled on/off.
  When attacking, if a spell is active, the corresponding runes are consumed and the spell effect is applied.
*/

// 1. Add spellbook panel below prayer panel (only for Mage)
(function() {
  if (!document.getElementById('spellbook-panel')) {
    const spellbookPanel = document.createElement('div');
    spellbookPanel.id = 'spellbook-panel';
    spellbookPanel.className = 'panel';
    spellbookPanel.style = 'margin-top:8px;background:#292c31;border-radius:10px;padding:16px;box-shadow:0 2px 10px #000a;display:none;';
    spellbookPanel.innerHTML = `
      <h2 style="color:#ffba3a;">Spellbook</h2>
      <div style="display:flex;align-items:center;gap:18px;">
        <button id="spell-fire-btn" title="Fire Spell" style="background:#23252a;border:none;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:2em;transition:background 0.18s;position:relative;">
          <span id="spell-fire-icon" style="color:#ff4444;">🔥</span>
        </button>
        <button id="spell-water-btn" title="Water Spell" style="background:#23252a;border:none;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:2em;transition:background 0.18s;position:relative;">
          <span id="spell-water-icon" style="color:#2196f3;">💧</span>
        </button>
        <button id="spell-air-btn" title="Air Spell" style="background:#23252a;border:none;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:2em;transition:background 0.18s;position:relative;">
          <span id="spell-air-icon" style="color:#90ee90;">💨</span>
        </button>
        <span id="spell-status-label" style="color:#aaa;font-size:1.08em;"></span>
      </div>
    `;
    // Insert below prayer panel
    const prayerPanel = document.getElementById('prayer-panel');
    if (prayerPanel && prayerPanel.parentNode) {
      prayerPanel.parentNode.insertBefore(spellbookPanel, prayerPanel.nextSibling);
    }
  }
})();

// 2. Spell logic: track which spell is active
let spellFireActive = false;
let spellWaterActive = false;
let spellAirActive = false;

// 3. Show/hide spellbook panel only for Mage
function updateSpellbookUI() {
  const panel = document.getElementById('spellbook-panel');
  if (!panel) return;
  if (player.class && player.class.toLowerCase() === "mage") {
    panel.style.display = '';
  } else {
    panel.style.display = 'none';
    spellFireActive = false;
    spellWaterActive = false;
    spellAirActive = false;
  }
  // Update spell icons and status
  panel.querySelector('h2').textContent = "Spellbook";
  const fireBtn = document.getElementById('spell-fire-btn');
  const waterBtn = document.getElementById('spell-water-btn');
  const airBtn = document.getElementById('spell-air-btn');
  const fireIcon = document.getElementById('spell-fire-icon');
  const waterIcon = document.getElementById('spell-water-icon');
  const airIcon = document.getElementById('spell-air-icon');
  const statusLabel = document.getElementById('spell-status-label');
  if (fireBtn && fireIcon) {
    fireBtn.style.background = spellFireActive ? '#e53935' : '#23252a';
    fireIcon.style.color = spellFireActive ? '#fff' : '#ff4444';
  }
  if (waterBtn && waterIcon) {
    waterBtn.style.background = spellWaterActive ? '#2196f3' : '#23252a';
    waterIcon.style.color = spellWaterActive ? '#fff' : '#2196f3';
  }
  if (airBtn && airIcon) {
    airBtn.style.background = spellAirActive ? '#90ee90' : '#23252a';
    airIcon.style.color = spellAirActive ? '#23252a' : '#90ee90';
  }
  if (statusLabel) {
    statusLabel.textContent =
      spellFireActive ? 'Fire Spell Active' :
      spellWaterActive ? 'Water Spell Active' :
      spellAirActive ? 'Air Spell Active' :
      'No Spell Active';
  }
}

// 5. Tooltip logic for spells
function showSpellTooltip(btnId, text) {
  let btn = document.getElementById(btnId);
  if (!btn) return;
    let tip = document.createElement('div');
    tip.className = 'spell-tooltip';
    tip.style.position = 'absolute';
    tip.style.left = '50%';
    tip.style.top = '110%';
    tip.style.transform = 'translateX(-50%)';
    tip.style.background = '#18191c';
    tip.style.color = '#eee';
    tip.style.padding = '8px 16px';
    tip.style.borderRadius = '8px';
    tip.style.border = '1px solid #444';
    tip.style.whiteSpace = 'nowrap';
    tip.style.fontSize = '1em';
    tip.style.boxShadow = '0 2px 10px #0007';
    tip.style.zIndex = '9999';
    tip.innerHTML = text;
    btn.appendChild(tip);
    btn._spellTip = tip;
  }
  function hideSpellTooltip(btnId) {
    let btn = document.getElementById(btnId);
    if (btn && btn._spellTip) {
      btn.removeChild(btn._spellTip);
      btn._spellTip = null;
    }
  }
  // Attach hover logic for tooltips
  const fireBtn = document.getElementById('spell-fire-btn');
  const waterBtn = document.getElementById('spell-water-btn');
  const airBtn = document.getElementById('spell-air-btn');
  if (fireBtn) {
    fireBtn.onmouseenter = function() {
      showSpellTooltip('spell-fire-btn', `Requires <b>1 Fire Rune</b> & <b>1 Air Rune</b>`);
    };
    fireBtn.onmouseleave = function() {
      hideSpellTooltip('spell-fire-btn');
    };
    fireBtn.onclick = function() {
      if (!inCombat || !currentEnemy) {
        logMsg(`<span style="color:#ff4444;">You must be in combat to activate this spell!</span>`);
        return;
      }
      spellFireActive = !spellFireActive;
      spellWaterActive = false;
      spellAirActive = false;
      updateSpellbookUI();
    };
  }
  if (waterBtn) {
    waterBtn.onmouseenter = function() {
      showSpellTooltip('spell-water-btn', `Requires <b>1 Water Rune</b> & <b>1 Air Rune</b>`);
    };
    waterBtn.onmouseleave = function() {
      hideSpellTooltip('spell-water-btn');
    };
    waterBtn.onclick = function() {
      if (!inCombat || !currentEnemy) {
        logMsg(`<span style="color:#ff4444;">You must be in combat to activate this spell!</span>`);
        return;
      }
      spellWaterActive = !spellWaterActive;
      spellFireActive = false;
      spellAirActive = false;
      updateSpellbookUI();
    };
  }
  if (airBtn) {
    airBtn.onmouseenter = function() {
      showSpellTooltip('spell-air-btn', `Requires <b>1 Air Rune</b>`);
    };
    airBtn.onmouseleave = function() {
      hideSpellTooltip('spell-air-btn');
    };
    airBtn.onclick = function() {
      if (!inCombat || !currentEnemy) {
        logMsg(`<span style="color:#ff4444;">You must be in combat to activate this spell!</span>`);
        return;
      }
      spellAirActive = !spellAirActive;
      spellFireActive = false;
      spellWaterActive = false;
      updateSpellbookUI();
    };
  }

window.addEventListener('DOMContentLoaded', updateSpellbookUI);
const usernameSubmitButton2 = document.getElementById('username-submit');
if (usernameSubmitButton2) {
  usernameSubmitButton2.addEventListener('click', updateSpellbookUI);
}

// 4. Patch attackEnemy to use spell if mage and spell is active, consume runes, apply effect
const origAttackEnemySpell = window.attackEnemy;
window.attackEnemy = function() {
  // Only for Mage class and if a spell is active
  if (player.class && player.class.toLowerCase() === "mage" && (spellFireActive || spellWaterActive || spellAirActive)) {
    // Ensure spells only work in combat
    if (!inCombat || !currentEnemy) {
      logMsg(`<span style="color:#ff4444;">You must be in combat to cast spells!</span>`);
      spellFireActive = false;
      spellWaterActive = false;
      spellAirActive = false;
      updateSpellbookUI();
      return;
    }
    // Helper: find and consume rune from inventory
    function consumeRune(runeName) {
      for (let i = 0; i < player.inventory.length; i++) {
        let item = player.inventory[i];
        if (item.type === "material" && item.name === runeName && item.count > 0) {
          item.count -= 1;
          if (item.count <= 0) player.inventory.splice(i, 1);
          return true;
        }
      }
      return false;
    }
    // Fire Spell: requires 1 Fire Rune & 1 Air Rune
    if (spellFireActive) {
      let hasFire = false, hasAir = false;
      for (let item of player.inventory) {
        if (item.type === "material" && item.name === "Fire Rune" && item.count > 0) hasFire = true;
        if (item.type === "material" && item.name === "Air Rune" && item.count > 0) hasAir = true;
      }
      if (!hasFire || !hasAir) {
        logMsg(`<span style="color:#ff4444;">Not enough runes for Fire Spell!</span>`);
        spellFireActive = false;
        updateSpellbookUI();
        return;
      }
      consumeRune("Fire Rune");
      consumeRune("Air Rune");
      let hit = Math.floor(Math.random() * 21) + 10; // 10-30 fire damage
      currentEnemy.health = Math.max(0, currentEnemy.health - hit);
      showHitsplat(document.getElementById('enemy-image'), hit, true);
      logMsg(`<span style="color:#ff4444;font-weight:bold;">You cast Fire Spell! Dealt <b>${hit}</b> fire damage!</span>`);
      renderEnemyEncounter();
      if (currentEnemy.health <= 0) {
        let goldDrop = Math.floor(Math.random() * 51);
        player.gold += goldDrop;
        let randomItem = JSON.parse(JSON.stringify(items[Math.floor(Math.random() * items.length)]));
        addItem(randomItem);
        let goldMsg = goldDrop > 0 ? ` <span style="color:gold;">+${goldDrop} Gold</span>` : '';
        logMsg(`<span style="color:#90ee90"><b>You defeated the ${currentEnemy.name}!</b></span> +${currentEnemy.xp} XP${goldMsg} and found ${randomItem.name}`);
        player.experience += currentEnemy.xp;
        checkLevelUp();
        clearEnemy();
        renderPlayerStats();
        updateSpellbookUI();
        return;
      }
      setTimeout(()=>{ enemyAttack(); }, 700);
      updateSpellbookUI();
      renderBagInv();
      return;
    }
    // Water Spell: requires 1 Water Rune & 1 Air Rune
    if (spellWaterActive) {
      let hasWater = false, hasAir = false;
      for (let item of player.inventory) {
        if (item.type === "material" && item.name === "Water Rune" && item.count > 0) hasWater = true;
        if (item.type === "material" && item.name === "Air Rune" && item.count > 0) hasAir = true;
      }
      if (!hasWater || !hasAir) {
        logMsg(`<span style="color:#2196f3;">Not enough runes for Water Spell!</span>`);
        spellWaterActive = false;
        updateSpellbookUI();
        return;
      }
      consumeRune("Water Rune");
      consumeRune("Air Rune");
      let hit = Math.floor(Math.random() * 16) + 10; // 10-25 water damage
      currentEnemy.health = Math.max(0, currentEnemy.health - hit);
      showHitsplat(document.getElementById('enemy-image'), hit, true);
      logMsg(`<span style="color:#2196f3;font-weight:bold;">You cast Water Spell! Dealt <b>${hit}</b> water damage!</span>`);
      renderEnemyEncounter();
      if (currentEnemy.health <= 0) {
        let goldDrop = Math.floor(Math.random() * 51);
        player.gold += goldDrop;
        let randomItem = JSON.parse(JSON.stringify(items[Math.floor(Math.random() * items.length)]));
        addItem(randomItem);
        let goldMsg = goldDrop > 0 ? ` <span style="color:gold;">+${goldDrop} Gold</span>` : '';
        logMsg(`<span style="color:#90ee90"><b>You defeated the ${currentEnemy.name}!</b></span> +${currentEnemy.xp} XP${goldMsg} and found ${randomItem.name}`);
        player.experience += currentEnemy.xp;
        checkLevelUp();
        clearEnemy();
        renderPlayerStats();
        updateSpellbookUI();
        return;
      }
      setTimeout(()=>{ enemyAttack(); }, 700);
      updateSpellbookUI();
      renderBagInv();
      return;
    }
    // Air Spell: requires 1 Air Rune
    if (spellAirActive) {
      let hasAir = false;
      for (let item of player.inventory) {
        if (item.type === "material" && item.name === "Air Rune" && item.count > 0) hasAir = true;
      }
      if (!hasAir) {
        logMsg(`<span style="color:#90ee90;">Not enough runes for Air Spell!</span>`);
        spellAirActive = false;
        updateSpellbookUI();
        return;
      }
      consumeRune("Air Rune");
      let hit = Math.floor(Math.random() * 11) + 5; // 5-15 air damage
      currentEnemy.health = Math.max(0, currentEnemy.health - hit);
      showHitsplat(document.getElementById('enemy-image'), hit, true);
      logMsg(`<span style="color:#90ee90;font-weight:bold;">You cast Air Spell! Dealt <b>${hit}</b> air damage!</span>`);
      renderEnemyEncounter();
      if (currentEnemy.health <= 0) {
        let goldDrop = Math.floor(Math.random() * 51);
        player.gold += goldDrop;
        let randomItem = JSON.parse(JSON.stringify(items[Math.floor(Math.random() * items.length)]));
        addItem(randomItem);
        let goldMsg = goldDrop > 0 ? ` <span style="color:gold;">+${goldDrop} Gold</span>` : '';
        logMsg(`<span style="color:#90ee90"><b>You defeated the ${currentEnemy.name}!</b></span> +${currentEnemy.xp} XP${goldMsg} and found ${randomItem.name}`);
        player.experience += currentEnemy.xp;
        checkLevelUp();
        clearEnemy();
        renderPlayerStats();
        updateSpellbookUI();
        return;
      }
      setTimeout(()=>{ enemyAttack(); }, 700);
      updateSpellbookUI();
      renderBagInv();
      return;
    }
  }
  // Otherwise, normal attack logic
  origAttackEnemySpell && origAttackEnemySpell();
  updateSpellbookUI();
};

// 5. Update spellbook UI after bag/inventory changes
const origRenderBagInvSpell = renderBagInv;
renderBagInv = function() {
  origRenderBagInvSpell();
  updateSpellbookUI();
};

// 6. Add spellbook panel styles
(function() {
  const style = document.createElement('style');
  style.textContent = `
    #spellbook-panel { margin-top:8px; }
    #spell-fire-btn, #spell-water-btn, #spell-air-btn { transition:background 0.18s; }
    #spell-fire-btn:active, #spell-water-btn:active, #spell-air-btn:active { box-shadow:0 0 8px #ffba3a; }
    #spell-fire-icon, #spell-water-icon, #spell-air-icon { transition:color 0.18s; }
    .spell-tooltip {
      pointer-events: none;
      opacity: 0.98;
      transition: opacity 0.12s;
    }
  `;
  document.head.appendChild(style);
})();
/*
  --- CLASS-SPECIFIC ITEM LOGIC ---
  Only allow equipping weapons/armors that match the player's class.
  Swords: Melee, Bows: Ranger, Staffs/Wands: Mage.
  Armor: Melee (Armor, Helmet, Shield), Ranger (Cloak, Boots, Hat), Mage (Robe, Amulet, Ring).
*/

// Helper: check if item is class-specific and matches player class
function isClassAllowed(item) {
  if (!player.class) return true; // If no class, allow all
  const cls = player.class.toLowerCase();
  // Weapon logic
  if (item.type === "weapon") {
    if (item.name && item.name.toLowerCase().includes("sword")) return cls === "melee";
    if (item.isBow || (item.name && item.name.toLowerCase().includes("bow"))) return cls === "ranger";
    if (item.name && (item.name.toLowerCase().includes("staff") || item.name.toLowerCase().includes("wand"))) return cls === "mage";
    // Other weapons: allow all classes
    return true;
  }
  // Armor logic
  if (item.type === "armor" || item.type === "chestplate") {
    if (item.name && item.name.toLowerCase().includes("robe")) return cls === "mage";
    return cls === "melee";
  }
  if (item.type === "helmet") {
    if (item.name && item.name.toLowerCase().includes("hat")) return cls === "ranger";
    return cls === "melee";
  }
  if (item.type === "shield") return cls === "melee";
  if (item.type === "cloak" || item.type === "cape") return cls === "ranger";
  if (item.type === "amulet" || item.type === "ring") return cls === "mage";
  if (item.type === "boots") {
    if (item.name && item.name.toLowerCase().includes("boots")) return cls === "ranger";
    return cls === "melee";
  }
  // Gloves: allow all
  // Arrows: ranger only
  if (item.type === "arrows") return cls === "ranger";
  // Materials, potions, consumables: allow all
  return true;
}

// Patch isEquipable to check class
const origIsEquipable = isEquipable;
isEquipable = function(item) {
  return origIsEquipable(item) && isClassAllowed(item);
};

// Patch equipItem and equipBagItem to enforce class restriction
const origEquipItem = equipItem;
equipItem = function(idx) {
  let item = player.inventory[idx];
  if (!isClassAllowed(item)) {
    logMsg(`<span style="color:#ff4444;">${item.name} cannot be equipped by your class (${player.class}).</span>`);
    return;
  }
  origEquipItem(idx);
};

const origEquipBagItem = equipBagItem;
equipBagItem = function(idx) {
  let item = player.bag[idx];
  if (!isClassAllowed(item)) {
    logMsg(`<span style="color:#ff4444;">${item.name} cannot be equipped by your class (${player.class}).</span>`);
    return;
  }
  origEquipBagItem(idx);
};

// Patch renderBagInv to show "Not for your class" on restricted items
const origRenderBagInvClass = renderBagInv;
renderBagInv = function() {
  origRenderBagInvClass();
  let itemsArr = baginvTab === "inventory" ? player.inventory : player.bag;
  const cards = document.querySelectorAll('#baginv-content .item-card');
  cards.forEach((card, idx) => {
    const item = itemsArr[idx];
    if (item && !isClassAllowed(item) && isEquipable(item)) {
      // Add warning
      let warn = card.querySelector('.class-restrict-warning');
      if (!warn) {
        warn = document.createElement('div');
        warn.className = 'class-restrict-warning';
        warn.style = 'color:#ff4444;font-size:0.95em;margin-top:4px;text-align:center;';
        warn.textContent = `Not for your class`;
        card.appendChild(warn);
      }
      // Disable Equip button
      const equipBtn = card.querySelector('.item-action-btn');
      if (equipBtn) equipBtn.disabled = true;
    }
  });
};
