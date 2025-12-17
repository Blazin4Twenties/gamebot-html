  // Character selection logic
  let selectedClass = null;
  let classIntroStories = {
    melee: `
      <p>
        You are a <b>Melee Warrior</b>, forged in the fires of battle. Your sword and shield are your closest allies, and your armor bears the scars of countless fights. The world awaits your strength and courage.
      </p>
    `,
    ranger: `
      <p>
        You are a <b>Ranger</b>, swift and silent. Your bow finds its mark from the shadows, and your arrows never miss. The wilds are your home, and adventure calls you to explore the unknown.
      </p>
    `,
    mage: `
      <p>
        You are a <b>Mage</b>, student of the arcane. The mysteries of magic bend to your will, and your staff crackles with power. The world is full of secrets, and you are ready to uncover them.
      </p>
    `
  };
  // Starter gear for each class (now only used for mystery bag contents)
  let starterGear = {
    melee: [
      { name: "Starter Sword", type: "weapon", attackPower: 12, price: 0, description: "A basic sword for melee combat." },
      { name: "Starter Shield", type: "shield", defense: 8, price: 0, description: "A basic shield for blocking attacks." },
      { name: "Starter Armor", type: "chestplate", defense: 10, price: 0, description: "Sturdy armor for protection." },
      { name: "Starter Helmet", type: "helmet", defense: 5, health: 10, price: 0, description: "A simple helmet." },
      { name: "Potion", type: "consumable", healing: 50, count: 5 }
    ],
    ranger: [
      { name: "Starter Bow", type: "weapon", attackPower: 10, isBow: true, price: 0, description: "A basic bow for ranged attacks." },
      { name: "Arrows", type: "arrows", attackPower: 3, count: 50, price: 0, description: "A bundle of arrows." },
      { name: "Starter Cloak", type: "cape", defense: 6, health: 8, price: 0, description: "A light cloak for agility." },
      { name: "Starter Boots", type: "boots", defense: 4, health: 8, price: 0, description: "Light boots for quick movement." },
      { name: "Potion", type: "consumable", healing: 50, count: 5 }
    ],
    mage: [
      { name: "Starter Staff", type: "weapon", attackPower: 11, price: 0, description: "A basic staff for casting spells."},
      { name: "Starter Amulet", type: "amulet", defense: 4, price: 0, description: "A magical amulet." },
      { name: "Starter Ring", type: "ring", attackPower: 2, health: 6, price: 0, description: "A ring that boosts magic." },
      { name: "Potion", type: "consumable", healing: 50, count: 5 },
      // Add runes for mage
      { name: "Fire Rune", type: "material", count: 100, description: "A rune for fire spells." },
      { name: "Air Rune", type: "material", count: 100, description: "A rune for air spells." },
      { name: "Water Rune", type: "material", count: 100, description: "A rune for water spells." }
    ]
  };
  // Card selection UI
  document.querySelectorAll('.char-class-card').forEach(card => {
    card.onclick = function() {
      document.querySelectorAll('.char-class-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedClass = card.getAttribute('data-class');
      document.getElementById('char-select-btn').disabled = false;
    };
    card.onkeydown = function(e) {
      if (e.key === "Enter" || e.key === " ") card.click();
    };
  });
  // On Begin button
  document.getElementById('char-select-btn').onclick = function() {
    if (!selectedClass) return;
    // Set starter gear for later use
    window._selectedClass = selectedClass;
    window._starterGear = starterGear[selectedClass];
    // Hide character select, show intro overlay with class-specific story
    document.getElementById('character-select-overlay').style.display = 'none';
    // Set intro story
    let introOverlay = document.getElementById('intro-overlay');
    if (introOverlay) {
      let storyDiv = introOverlay.querySelector('#intro-story');
      if (storyDiv) {
        // Replace first paragraph with class intro
        let html = classIntroStories[selectedClass] +
          `<p>
            In a world torn by ancient wars and forgotten magic, you awaken in the heart of the realm—Central Town. The lands around you are shrouded in mystery, with forests, mountains, deserts, and ruins waiting to be discovered. Towns bustle with life, each holding secrets, rare sellers, and unique events. Chests glimmer in hidden corners, promising gold and treasures to the bold.
          </p>
          <p>
            As you journey, you will face a host of enemies—from cunning goblins to legendary bosses. Equip powerful weapons, armor, rings, and more to survive. Manage your inventory and bag, deposit valuables in the bank, and seek out the shop for ever-changing wares. Special sellers in towns offer rare items for those who explore bravely.
          </p>
          <p>
            Harness the power of Prayer to deflect attacks or heal in battle. Visit the Prayer Altar to renew your strength. Level up, gain experience, and unlock the ancient set for unmatched power. Auto-explore the world, auto-attack foes, and shape your fate.
          </p>
          <p>
            <b>Features:</b>
            <ul style="margin-left:18px;">
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
          <p>
            Your destiny awaits. Will you accept your fate and begin your Journey?
          </p>`;
        storyDiv.innerHTML = html;
      }
      introOverlay.style.display = 'flex';
    }
  };
  // On page load, show only character select overlay
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('character-select-overlay').style.display = 'flex';
    let intro = document.getElementById('intro-overlay');
    let usernameOverlay = document.getElementById('username-overlay');
    let mainContainer = document.getElementById('container');
    if (intro) intro.style.display = 'none';
    if (usernameOverlay) usernameOverlay.style.display = 'none';
    if (mainContainer) mainContainer.style.display = 'none';
    [
      'bank-modal-bg', 'special-seller-popup', 'town-popup', 'ancient-boss-popup', 'multi-use-popup', 'panel-locations-popup', 'prayer-panel', 'prayer-altar-panel',
      'main-save-ui', 'explore-bar', 'direction-select-bar', 'panel-locations-btn', 'top-left-bar'
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  });

  // --- Mystery Bag logic ---
  // Helper: returns the mystery bag item for the selected class
  function getMysteryBagForClass(classKey) {
    let bagContents = [];
    if (classKey === "mage") {
      // Mage: ensure runes included
      bagContents = starterGear.mage.slice();
    } else if (classKey === "ranger") {
      bagContents = starterGear.ranger.slice();
    } else {
      bagContents = starterGear.melee.slice();
    }
    return {
      name: "<span style='color:#e53935;font-weight:bold;'>??????</span>",
      type: "mystery",
      description: "Dare to open it?",
      _mysteryBagContents: bagContents
    };
  }

  // Patch renderBagInv to show "Open" button for mystery bag
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof renderBagInv === "function") {
      const origRenderBagInvMystery = renderBagInv;
      window.renderBagInv = function() {
        origRenderBagInvMystery();
        // Add "Open" button for mystery bag
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
              btn.onclick = function(e) {
                e.stopPropagation();
                showMysteryBagUI(item, idx, itemsArr);
              };
              card.appendChild(btn);
            }
          }
        });
      };
    }
  });

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
        else if (gear.type === "potion" || gear.type === "consumable") {
          player.inventory.push({...gear});
        }
        // Equip first weapon/armor/helmet/shield/amulet/ring/cloak/boots/arrows if not equipped, else bag
        else if (gear.type === "weapon" && !player.equipment.weapon) player.equipment.weapon = {...gear};
        else if (gear.type === "armor" && !player.equipment.armor) player.equipment.armor = {...gear};
        else if (gear.type === "helmet" && !player.equipment.helmet) player.equipment.helmet = {...gear};
        else if (gear.type === "shield" && !player.equipment.shield) player.equipment.shield = {...gear};
        else if (gear.type === "amulet" && !player.equipment.amulet) player.equipment.amulet = {...gear};
        else if (gear.type === "ring" && !player.equipment.ring) player.equipment.ring = {...gear};
        else if (gear.type === "cloak" && !player.equipment.cloak) player.equipment.cloak = {...gear};
        else if (gear.type === "boots" && !player.equipment.boots) player.equipment.boots = {...gear};
        else player.bag.push({...gear});
      });
      // Show a little animation or message
      inner.querySelector('.bag-title').textContent = "The Bag Opens...";
      inner.querySelector('.bag-desc').textContent = "A surge of energy bursts forth as you open the bag, revealing your starting gear!";
      inner.querySelector('.bag-warning').textContent = "";
      inner.querySelector('.bag-icon').textContent = "✨";
      inner.querySelector('.bag-details').textContent = ""; 
      inner.querySelector('.bag-open-btn').style.display = "none";
      inner.querySelector('.bag-close-btn').style.display = "";
      if (typeof renderBagInv === "function") renderBagInv();
      if (typeof renderEquipment === "function") renderEquipment();
      if (typeof renderPlayerStats === "function") renderPlayerStats();
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
