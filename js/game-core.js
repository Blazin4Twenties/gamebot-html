const itemIcons = {};
let player = {
  name: "Hero",
  health: 100,
  maxHealth: 100,
  gold: 1000,
  experience: 0,
  level: 1,
  bankGold: 0,
  inventory: [
    { name: "Potion", type: "potion", heal: 50, count: 10 },
    { name: "Arrows", type: "arrows", count: 100 }
   
  ],
  bag: [],
  equipment: {
    helmet: null,
    weapon: null,
    armor: null,
    ring: null,
    arrows: null,
    cloak: null,
    shield: null,
    amulet: null,
    gloves: null,
    boots: null
  },
  bank: []
};
// Equipment slot order for UI
const equipmentOrderLeft = [
  {slot: "helmet", label: "Helmet"},
  {slot: "weapon", label: "Weapon"},
  {slot: "armor", label: "Armor"},
  {slot: "ring", label: "Ring"},
  {slot: "arrows", label: "Arrows"}
];
const equipmentOrderRight = [
  {slot: "cloak", label: "Cloak"},
  {slot: "shield", label: "Shield"},
  {slot: "amulet", label: "Amulet"},
  {slot: "gloves", label: "Gloves"},
  {slot: "boots", label: "Boots"}
];
let areaNames = [
  "Plains", "Forest", "Mountain", "River", "Ruins", "Cave", "Desert", "Swamp", "Valley", "Hills"
];
let mapSize = 18;
let mapData = [];
let discovered = [];
let towns = [];
let chests = [];
let playerPosition = { x: Math.floor(mapSize/2), y: Math.floor(mapSize/2) };
let enemyIcons = {};
const enemyPool = [
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
// --- Ancient Boss Logic ---
const ancientBossData = {
  name: "Ancient Boss",
  maxHealth: 600,
  minAttack: 40,
  maxAttack: 70,
  xp: 1000
};
let ancientBossActive = false;
let ancientBossShopLocked = false; // Track if shop should be locked due to boss

// Track if the 1-hit kill sword has been used on the boss in this encounter
let ancientBossFirstHit = false;

if (!document.getElementById('ancient-boss-popup')) {
  const bossPopup = document.createElement('div');
  bossPopup.id = 'ancient-boss-popup';
  bossPopup.style = 'display:none;position:fixed;z-index:5000;top:0;left:0;width:100vw;height:100vh;background:#191a1ecc;align-items:center;justify-content:center;';
  bossPopup.innerHTML = `
    <div style="background:linear-gradient(135deg,#23252a 80%,#e53935 100%);padding:48px 54px 38px 54px;border-radius:28px;box-shadow:0 4px 32px #e5393588,0 2px 24px #000a;display:flex;flex-direction:column;align-items:center;min-width:380px;position:relative;">
      <div style="position:absolute;top:-32px;left:50%;transform:translateX(-50%);font-size:3.2em;color:#e53935;text-shadow:0 2px 12px #000a,0 0 8px #ffba3a88;">👑</div>
      <div style="color:#ffba3a;font-size:1.7em;font-weight:bold;margin-bottom:18px;text-shadow:0 2px 8px #23252a88,0 0 4px #fff;">ANCIENT BOSS ENCOUNTER!</div>
      <div style="margin-bottom:18px;font-size:1.15em;color:#fff;text-align:center;">
        <span style="color:#e53935;font-weight:bold;">A legendary foe blocks your path!</span><br>
        <span style="color:#ffba3a;">Defeat the Ancient Boss for:</span><br>
        <span style="color:gold;font-weight:bold;">Ancient Sword</span> <span style="font-size:1.2em;">⚔️</span> <span style="color:#90ee90;">Ancient Armor Set</span> <span style="font-size:1.2em;">🛡️</span><br>
        
      </div>
      <div style="margin-bottom:18px;">
        <span style="color:#fff;">Will you risk it all for glory and treasure?</span>
      </div>
      <div style="display:flex;gap:18px;">
        <button id="ancient-boss-fight" style="font-size:1.15em;font-weight:bold;background:linear-gradient(90deg,#e53935 70%,#ffba3a 100%);color:#23252a;border:none;border-radius:9px;padding:10px 38px;cursor:pointer;box-shadow:0 2px 14px #e5393588;transition:background 0.18s, color 0.18s;">Fight</button>
        <button id="ancient-boss-run" style="font-size:1.15em;font-weight:bold;background:#35373e;color:#ffba3a;border:none;border-radius:9px;padding:10px 38px;cursor:pointer;box-shadow:0 2px 14px #0006;transition:background 0.18s, color 0.18s;">Run</button>
      </div>
      <div style="margin-top:22px;font-size:0.98em;color:#aaa;text-align:center;">
        <span style="color:#ffd36b;">Tip:</span> Running has a <b>60%</b> chance to succeed.<br>
        If you fail, the boss will strike you for <span style="color:#e53935;font-weight:bold;">25% of your max HP!</span>
      </div>
    </div>
  `;
  document.body.appendChild(bossPopup);
}

document.getElementById('ancient-boss-fight').onclick = function() {
  document.getElementById('ancient-boss-popup').style.display = 'none';
  showAncientBoss();
  ancientBossShopLocked = true;
  showShopClosedOverlay && showShopClosedOverlay();
};
// --- PATCH: Ancient Boss Run Option with Chance to Fail ---
document.getElementById('ancient-boss-run').onclick = function() {
  document.getElementById('ancient-boss-popup').style.display = 'none';
  // 60% chance to successfully run, 40% chance to fail
  if (Math.random() < 0.6) {
    logMsg('You successfully ran away from the Ancient Boss!');
    ancientBossActive = false;
    ancientBossShopLocked = false;
    hideShopClosedOverlay && hideShopClosedOverlay();
  } else {
    // Fail: Boss hits player for 25% of their max health
    let damage = Math.floor(getTotalMaxHealth() * 0.25);
    player.health = Math.max(0, player.health - damage);
    logMsg(`<span style="color:#e53935;font-weight:bold;">Failed to run! The Ancient Boss hits you for <b>${damage}</b>!</span>`);
    renderPlayerStats();
    if (player.health <= 0) {
      logMsg(`<span style="color:#f44;font-weight:bold;">You died! Respawning at town...</span>`);
      respawnPlayer();
      ancientBossActive = false;
      ancientBossShopLocked = false;
      hideShopClosedOverlay && hideShopClosedOverlay();
    } else {
      // Player failed to run but is still alive, keep boss active and shop locked
      ancientBossActive = true;
      ancientBossShopLocked = true;
      showShopClosedOverlay && showShopClosedOverlay();
    }
  }
};

const origShowEnemy = typeof showEnemy === "function" ? showEnemy : null;
function maybeAncientBossEncounter() {
  // Prevent boss encounter if already in combat, boss is active, or tunnel popup is open
  if (inCombat || ancientBossActive || document.getElementById('secret-tunnel-popup')) return false;
  if (Math.random() < 0.15) {
    ancientBossActive = true;
    ancientBossShopLocked = true;
    showShopClosedOverlay && showShopClosedOverlay();
    document.getElementById('ancient-boss-popup').style.display = 'flex';
    return true;
  }
  return false;
}
function showAncientBoss() {
  currentEnemy = {
    name: ancientBossData.name,
    health: ancientBossData.maxHealth,
    maxHealth: ancientBossData.maxHealth,
    minAttack: ancientBossData.minAttack,
    maxAttack: ancientBossData.maxAttack,
    xp: ancientBossData.xp,
    isBoss: true
  };
  inCombat = true;
  ancientBossFirstHit = false; // Reset first hit tracker for this encounter
  renderEnemyEncounter();
  logMsg(`<span style="color:#e53935;font-weight:bold;">A Special Boss has appeared!</span>`);
  ancientBossShopLocked = true;
  showShopClosedOverlay && showShopClosedOverlay();
}
function patchedRandomEncounter() {
  // Prevent any encounter if already in combat or boss is active
  if (inCombat || ancientBossActive) return;
  if (maybeAncientBossEncounter()) return;

  origShowEnemy && origShowEnemy();
}
// Replace showEnemy calls in movePlayer, doExplore, etc.
window.showEnemy = patchedRandomEncounter;

// --- Boss Drop Logic ---
function giveAncientBossRewards() {
  // Ancient Sword
  const ancientSword = {
    name: "Ancient Sword",
    type: "weapon",
    attackPower: 60,
    price: 0,
    description: "A sword only dropped by the Ancient Boss. +60 ATK, +150 HP",
    health: 150
  };
  addItem(ancientSword);

  // Ancient Armor Set: helmet, armor, boots, gloves, cloak
  const armorPieces = [
    { slot: "helmet", name: "Ancient Helmet" },
    { slot: "armor", name: "Ancient Armor" },
    { slot: "boots", name: "Ancient Boots" },
    { slot: "gloves", name: "Ancient Gloves" },
    { slot: "cloak", name: "Ancient Cloak" }
  ];
  armorPieces.forEach(piece => {
    addItem({
      name: piece.name,
      type: piece.slot,
      defense: randomStat(30, 60),
      health: 150,
      price: 0,
      description: `A ${piece.name} only dropped by the Ancient Boss. 0 - 150 HP, +${piece.slot === "armor" ? "60" : "30-60"} DEF`
    });
  });
  logMsg(`<span style="color:gold;font-weight:bold;">You defeated the Ancient Boss!<br>
    <span style="color:#ffba3a;">Ancient Sword</span> and <span style="color:#90ee90;">Ancient Armor Set</span> have been added to your inventory!</span>`);
  ancientBossShopLocked = false;
  hideShopClosedOverlay && hideShopClosedOverlay();
}

// --- Ancient Set Bonus Logic ---
function getAncientSetCount() {
  let count = 0;
  ["helmet", "armor", "boots", "gloves", "cloak"].forEach(slot => {
    const eq = player.equipment[slot];
    if (eq && eq.name && eq.name.startsWith("Ancient ")) count++;
  });
  return count;
}

// Patch getTotalDefense and getTotalMaxHealth for set bonus
const origGetTotalDefense = getTotalDefense;
getTotalDefense = function() {
  let base = origGetTotalDefense();
  let setCount = getAncientSetCount();
  if (setCount >= 2) base += 20; // 2+ pieces: +20 DEF
  if (setCount >= 4) base += 40; // 4+ pieces: +40 DEF
  if (setCount === 5) base += 60; // Full set: +60 DEF
  return base;
};
const origGetTotalMaxHealth = getTotalMaxHealth;
getTotalMaxHealth = function() {
  let base = origGetTotalMaxHealth();
  let setCount = getAncientSetCount();
  if (setCount >= 2) base += 50; // 2+ pieces: +50 HP
  if (setCount >= 4) base += 100; // 4+ pieces: +100 HP
  if (setCount === 5) base += 150; // Full set: +150 HP
  return base;
};

// Patch attackEnemy to handle boss death and rewards
window.attackEnemy = function() {
  if (!currentEnemy || !inCombat) {
    logMsg("No enemy to attack.");
    // If not in combat, ensure boss/shop flags are reset
    ancientBossActive = false;
    ancientBossShopLocked = false;
    hideShopClosedOverlay && hideShopClosedOverlay();
    return;
  }
  // Boss logic
  if (currentEnemy.isBoss) {
    // Check for 1-hit kill sword and first hit
    if (
      player.equipment.weapon &&
      player.equipment.weapon.name === "Debug 1-Hit Sword" &&
      !ancientBossFirstHit
    ) {
      let hit = 1000;
      currentEnemy.health = Math.max(0, currentEnemy.health - hit);
      showHitsplat(hit);
      logMsg(`<span style="color:#ff4444;font-weight:bold;">You unleash the Debug 1-Hit Sword! The Ancient Boss takes <b>${hit}</b> damage!</span>`);
      ancientBossFirstHit = true;
      renderEnemyEncounter();
      if (currentEnemy.health <= 0) {
        player.experience += currentEnemy.xp;
        checkLevelUp();
        giveAncientBossRewards();
        ancientBossActive = false;
        ancientBossShopLocked = false;
        clearEnemy();
        renderPlayerStats();
        hideShopClosedOverlay && hideShopClosedOverlay();
        return;
      }
      setTimeout(()=>{ enemyAttack(); }, 700);
      return;
    }
    let pAtk = (player.equipment.weapon ? player.equipment.weapon.attackPower||8 : 6)
      + (player.equipment.ring ? player.equipment.ring.attackPower||0 : 0);
    let hit = randomStat(30, 90);
    currentEnemy.health = Math.max(0, currentEnemy.health - hit);
    showHitsplat(hit);
    logMsg(`You hit the <b>${currentEnemy.name}</b> for <b>${hit}</b>!`);
    renderEnemyEncounter();
    if (currentEnemy.health <= 0) {
      player.experience += currentEnemy.xp;
      checkLevelUp();
      giveAncientBossRewards();
      ancientBossActive = false;
      ancientBossShopLocked = false;
      clearEnemy();
      renderPlayerStats();
      hideShopClosedOverlay && hideShopClosedOverlay();
      return;
    }
    setTimeout(()=>{ enemyAttack(); }, 700);
    return;
  }
  // Normal enemy
  origAttackEnemy && origAttackEnemy();
};


function randomStat(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const items = [
  { name: 'Sword', price: 50, description: 'A basic sword for beginners.', type: 'weapon', attackPower: 15 },
  { name: 'Shield', price: 30, description: 'A sturdy shield for protection.', type: 'shield', defense: 20 },
  { name: 'Potion', price: 10, description: 'A basic healing potion.', type: 'potion', heal: 50 },
  { name: 'Advanced Sword', price: 100, description: 'A more powerful sword for experienced fighters.', type: 'weapon', attackPower: 25 },
  { name: 'Advanced Shield', price: 60, description: 'A stronger shield for better protection.', type: 'shield', defense: 30 },
  { name: 'Advanced Potion', price: 25, description: 'A potion that heals more health.', type: 'potion', heal: 50 },
  { name: 'Helmet', price: 40, description: 'A helmet to protect your head.', type: 'helmet', defense: 25, health: randomStat(30,100) },
  { name: 'Armor', price: 80, description: 'A set of armor for full body protection.', type: 'armor', defense: 40 },
  { name: 'Boots', price: 20, description: 'Boots to protect your feet.', type: 'boots', defense: 20, health: randomStat(20,100) },
  { name: 'Magic Wand', price: 120, description: 'A wand for casting powerful spells.', type: 'weapon', attackPower: 20 },
  { name: 'Bow', price: 70, description: 'A bow for ranged attacks.', type: 'weapon', attackPower: 18 },
  { name: 'Arrows', price: 15, description: 'A set of arrows for your bow.', type: 'arrows' },
  { name: 'Ring of Strength', price: 150, description: 'A ring that increases your strength.', type: 'ring', attackPower: 3, health: randomStat(10,100) },
  { name: 'Amulet of Health', price: 200, description: 'An amulet that increases your health.', type: 'amulet', defense: 10 },
  { name: 'Cloak of Invisibility', price: 300, description: 'A cloak that makes you invisible for a short time.', type: 'cloak', defense: 35, health: randomStat(25,100) },
  { name: 'Dagger', price: 45, description: 'A small, quick weapon for close combat.', type: 'weapon', attackPower: 15 },
  { name: 'Healing Herb', price: 5, description: 'A herb that heals minor wounds.', type: 'consumable', heal: 50 },
  { name: 'Mana Potion', price: 20, description: 'A potion that restores mana.', type: 'potion', heal: 50 },
  { name: 'Steel Boots', price: 35, description: 'Heavy boots for better protection.', type: 'boots', defense: 25, health: randomStat(30,100) },
  { name: 'Fire Staff', price: 150, description: 'A staff that casts fire spells.', type: 'weapon', attackPower: 22 },
  { name: 'Ice Amulet', price: 180, description: 'An amulet that grants resistance to ice.', type: 'amulet', defense: 15 },
  { name: 'Thunder Hammer', price: 250, description: 'A hammer that strikes with thunder.', type: 'weapon', attackPower: 30 },
  { name: 'Dragon Scale Armor', price: 500, description: 'Armor made from dragon scales.', type: 'armor', defense: 50 },
  { name: 'Phoenix Feather', price: 75, description: 'A rare feather with magical properties.', type: 'material' },
  { name: 'Elven Bow', price: 200, description: 'A bow crafted by elves.', type: 'weapon', attackPower: 25 },
  { name: 'Mystic Ring', price: 220, description: 'A ring that enhances magical abilities.', type: 'ring', attackPower: 2, health: randomStat(10,100) },
  { name: 'Warrior Helmet', price: 90, description: 'A helmet worn by warriors.', type: 'helmet', defense: 30, health: randomStat(40,100) },
  { name: 'Assassin Cloak', price: 250, description: 'A cloak that grants stealth.', type: 'cloak', defense: 35, health: randomStat(30,100) },
  { name: 'Knight Lance', price: 300, description: 'A lance used by knights.', type: 'weapon', attackPower: 28 },
  { name: 'Ranger Hat', price: 60, description: 'A hat worn by rangers.', type: 'helmet', defense: 20, health: randomStat(20,100) },
  { name: 'Mage Robe', price: 100, description: 'A robe worn by mages.', type: 'armor', defense: 25 },
  { name: 'Leather Gloves', price: 25, description: 'Gloves for better grip.', type: 'gloves', defense: 15, health: randomStat(30,100) }
];

let currentEnemy = null;
let inCombat = false;
let baginvTab = "inventory";
let searchTerm = "";
let chestReward = 0;
let chestOpen = false;
let exploreDir = null;

function getTotalDefense() {
  return (player.equipment.armor?.defense || 0)
    + (player.equipment.helmet?.defense || 0)
    + (player.equipment.shield?.defense || 0)
    + (player.equipment.cloak?.defense || 0)
    + (player.equipment.boots?.defense || 0)
    + (player.equipment.amulet?.defense || 0)
    + (player.equipment.gloves?.defense || 0);
}
function getTotalMaxHealth() {
  return player.maxHealth
    + (player.equipment.helmet?.health || 0)
    + (player.equipment.boots?.health || 0)
    + (player.equipment.cloak?.health || 0)
    + (player.equipment.ring?.health || 0)
    + (player.equipment.gloves?.health || 0);
}
function getTotalAttack() {
  return (player.equipment.weapon?.attackPower || 0)
    + (player.equipment.ring?.attackPower || 0);
}
function renderPlayerStats() {
  // Ensure bankGold is properly initialized
  if (typeof player.bankGold !== 'number' || isNaN(player.bankGold)) {
    player.bankGold = 0;
  }
  let classRow = player.class
    ? `<li class="class-li"><span class="player-class" style="color:#ffd36b;font-weight:bold;">Class:</span> ${player.class}</li>`
    : "";
  document.getElementById('player-stats-ul').innerHTML = `
    <li><span class="username">Name:</span> ${player.name || username || ''}</li>
    ${classRow}
    <li><span class="level">Level:</span> ${player.level}</li>
    <li><span class="health">Health:</span> ${player.health}/${getTotalMaxHealth()}</li>
    <li><span class="gold">Gold:</span> ${player.gold}</li>
    <li>Experience: ${player.experience}</li>
    <li>Bank Gold: ${player.bankGold}</li>
    <li><span class="defense" style="color:#90ee90;">Defense:</span> ${getTotalDefense()}</li>
    <li><span class="attack" style="color:#ffba3a;">Attack:</span> ${getTotalAttack()}</li>
  `;
}
function renderDerivedStats() {
  let atk = getTotalAttack();
  let def = getTotalDefense();
  let hp = getTotalMaxHealth();
  let stats = [
    `<li><span class="derived-label">Attack:</span> ${atk}</li>`,
    `<li><span class="derived-label">Defense:</span> ${def}</li>`,
    `<li><span class="derived-label">Max Health:</span> ${hp}</li>`
  ];
  document.getElementById('derived-stats-list').innerHTML = stats.join('');
}

// --- Secret Tunnel Encounter Logic ---
let movesSinceLastTunnel = 0;
let nextTunnelMove = Math.floor(Math.random() * 6) + 10; // 10-15 moves for first tunnel

function maybeShowSecretTunnel() {
  // Only trigger tunnel if not in combat, chest open, or popup already open
  if (inCombat || chestOpen || document.getElementById('secret-tunnel-popup')) return;
  movesSinceLastTunnel++;
  // Tunnel spawns every 10-15 moves since last tunnel
  if (movesSinceLastTunnel >= nextTunnelMove) {
    movesSinceLastTunnel = 0;
    nextTunnelMove = Math.floor(Math.random() * 6) + 10;
    showSecretTunnelPopup();
  }
}

function showSecretTunnelPopup() {
  let oldPopup = document.getElementById('secret-tunnel-popup');
  if (oldPopup) oldPopup.remove();
  const popup = document.createElement('div');
  popup.id = 'secret-tunnel-popup';
  popup.style = 'position:fixed;z-index:9999;top:0;left:0;width:100vw;height:100vh;background:#191a1ecc;display:flex;align-items:center;justify-content:center;';
  popup.innerHTML = `
    <div style="background:#23252a;padding:32px 38px 24px 38px;border-radius:18px;box-shadow:0 2px 24px #000a;display:flex;flex-direction:column;align-items:center;min-width:320px;">
      <div style="color:#ffd36b;font-size:1.3em;margin-bottom:18px;">Secret Tunnel Discovered!</div>
      <div style="margin-bottom:18px;color:#fff;">
        <b>Daring Risk:</b> Entering the tunnel is a gamble.<br>
        <span style="color:#ff4444;">50% chance</span> to face a mysterious enemy that can instantly kill you and steal your gold.<br>
        <span style="color:#ffd36b;">50% chance</span> to be chosen by the gods and receive a legendary reward!
      </div>
      <div style="margin-bottom:18px;color:#ffd36b;font-weight:bold;">Will you dare to enter?</div>
      <div style="display:flex;gap:18px;">
        <button id="secret-tunnel-enter" style="font-size:1.1em;font-weight:bold;background:#ffba3a;color:#23252a;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">Enter</button>
        <button id="secret-tunnel-back" style="font-size:1.1em;font-weight:bold;background:#35373e;color:#ffba3a;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">Go back</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  document.getElementById('secret-tunnel-back').onclick = function() {
    popup.remove();
    logMsg(`<span style="color:#ffd36b;">You decided not to enter the secret tunnel.</span>`);
  };
  document.getElementById('secret-tunnel-enter').onclick = function() {
    popup.remove();
    if (Math.random() < 0.5) {
      // Daring risk: mysterious enemy encounter (no popup, just instant effect)
      failSecretTunnelEncounter();
    } else {
      // Success: gods reward
      showSecretTunnelReward();
    }
  };
}
function failSecretTunnelEncounter() {
  // Set up the mysterious enemy
  currentEnemy = {
    name: "The Unknown",
    health: 9999,
    maxHealth: 9999,
    minAttack: 9999,
    maxAttack: 9999,
    xp: 0,
    isTunnelAmbush: true
  };
  inCombat = true;

  let oldPopup = document.getElementById('mysterious-enemy-popup');
  if (oldPopup) oldPopup.remove();
  const popup = document.createElement('div');
  popup.id = 'mysterious-enemy-popup';
  popup.style = 'position:fixed;z-index:10001;top:0;left:0;width:100vw;height:100vh;background:#191a1ecc;display:flex;align-items:center;justify-content:center;';
  popup.innerHTML = `
    <div style="background:linear-gradient(135deg,#23252a 80%,#000 100%);padding:44px 54px 38px 54px;border-radius:28px;box-shadow:0 4px 32px #000a,0 2px 24px #e5393588;display:flex;flex-direction:column;align-items:center;min-width:380px;position:relative;">
      <div style="font-size:3em;margin-bottom:12px;animation: menacingPulse 1.2s infinite alternate;">🕳️</div>
      <div style="color:#e53935;font-size:2.5em;font-weight:bold;margin-bottom:18px;text-shadow:0 2px 8px #23252a88,0 0 4px #fff;">The Unknown Awaits</div>
      <div style="margin-bottom:18px;font-size:1.15em;color:#fff;text-align:center;">
        <span style="color:#ffd36b;">You feel reality twist as a presence beyond comprehension emerges.</span><br>
        <span style="color:#ff4444;font-weight:bold;">There is no escape. Your fate is sealed.</span>
      </div>
      <div style="width:260px;margin-bottom:18px;">
        <div style="margin-bottom:8px;text-align:center;font-size:2em;color:#ffba3a;font-weight:bold;">The Unknown</div>
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:180px;height:32px;background:#2d2222;border-radius:7px;position:relative;margin-bottom:8px;">
            <div style="background:linear-gradient(90deg,#ff6060 60%,#ffd700 100%);height:100%;width:100%;border-radius:7px;position:absolute;left:0;top:0;"></div>
            <div style="color:#fff;font-size:1.7em;position:absolute;width:100%;text-align:center;left:0;top:0;pointer-events:none;text-shadow:0 0 3px #000;">?????/?????</div>
          </div>
        </div>
      </div>
      <div style="display:flex;justify-content:center;width:100%;margin-bottom:18px;">
        <button id="tunnel-ambush-attack" style="font-size:1.2em;font-weight:bold;background:#e53935;color:#fff;border:none;border-radius:9px;padding:12px 48px;cursor:pointer;box-shadow:0 2px 14px #e5393588;">Confront the Unknown</button>
      </div>
      <div id="tunnel-ambush-result" style="margin-bottom:10px;color:#ffd36b;font-size:1.05em;"></div>
      <button id="tunnel-ambush-continue" style="display:none;font-size:1.1em;font-weight:bold;background:#e53935;color:#fff;border:none;border-radius:9px;padding:10px 38px;cursor:pointer;box-shadow:0 2px 14px #e5393588;">Continue</button>
      <style>
        @keyframes menacingPulse {
          0% { filter: drop-shadow(0 0 8px #e5393588); }
          100% { filter: drop-shadow(0 0 32px #000); }
        }
      </style>
    </div>
  `;
  document.body.appendChild(popup);

  // Attack button logic: instant kill and gold loss
  document.getElementById('tunnel-ambush-attack').onclick = function() {
    let lostGold = Math.floor(player.gold * 0.25);
    player.gold = Math.max(0, player.gold - lostGold);
    player.health = 0;
    document.getElementById('tunnel-ambush-result').innerHTML =
      `<span style="color:#ff4444;font-weight:bold;">You strike, but the void consumes you. Your existence is erased and <b>${lostGold}</b> gold vanishes into nothingness.</span>`;
    document.getElementById('tunnel-ambush-attack').style.display = 'none';
    document.getElementById('tunnel-ambush-continue').style.display = '';
    logMsg(`<span style="color:#ff4444;font-weight:bold;">The Unknown claims you. You are obliterated and lose <b>${lostGold}</b> gold!</span>`);
  };

  // Continue button logic: cleanup and respawn
  document.getElementById('tunnel-ambush-continue').onclick = function() {
    popup.remove();
    clearEnemy();
    respawnPlayer();
    renderPlayerStats();
    inCombat = false;
  };
}

// --- Secret Tunnel Reward ---
function showSecretTunnelReward() {
  // Award: 1000 gold + random item for class, stats x5, show original stats
  player.gold += 1000;
  let classKey = (player.class || "melee").toLowerCase();
  // Class-specific items from the enemy drop table
  let classItems = {
    melee: [
      { name: "Sword", type: "weapon", attackPower: 15, description: "A basic sword for beginners." },
      { name: "Shield", type: "shield", defense: 20, description: "A sturdy shield for protection." },
      { name: "Armor", type: "armor", defense: 40, description: "A set of armor for full body protection." },
      { name: "Helmet", type: "helmet", defense: 25, health: 30, description: "A helmet to protect your head." }
    ],
    ranger: [
      { name: "Bow", type: "weapon", attackPower: 18, isBow: true, description: "A bow for ranged attacks." },
      { name: "Arrows", type: "arrows", count: 100, description: "A set of arrows for your bow." },
      { name: "Cloak of Invisibility", type: "cloak", defense: 35, health: 25, description: "A cloak that makes you invisible for a short time." },
      { name: "Ranger Hat", type: "helmet", defense: 20, health: 20, description: "A hat worn by rangers." },
      { name: "Boots", type: "boots", defense: 20, health: 20, description: "Boots to protect your feet." }
    ],
    mage: [
      { name: "Magic Wand", type: "weapon", attackPower: 20, description: "A wand for casting powerful spells." },
      { name: "Mage Robe", type: "armor", defense: 25, description: "A robe worn by mages." },
      { name: "Amulet of Health", type: "amulet", defense: 10, description: "An amulet that increases your health." },
      { name: "Mystic Ring", type: "ring", attackPower: 2, health: 10, description: "A ring that enhances magical abilities." }
    ]
   };
  let pool = classItems[classKey] || classItems.melee;
  let rewardItem = JSON.parse(JSON.stringify(pool[Math.floor(Math.random() * pool.length)]));
  let originalStats = {};
  if (typeof rewardItem.attackPower === "number") originalStats.attackPower = rewardItem.attackPower;
  if (typeof rewardItem.defense === "number") originalStats.defense = rewardItem.defense;
  if (typeof rewardItem.health === "number") originalStats.health = rewardItem.health;
  // Enhance stats x5
  if (typeof rewardItem.attackPower === "number") rewardItem.attackPower *= 5;
  if (typeof rewardItem.defense === "number") rewardItem.defense *= 5;
  if (typeof rewardItem.health === "number") rewardItem.health *= 5;
  addItem(rewardItem);
  updateAllStats();

  let oldPopup = document.getElementById('secret-tunnel-reward-popup');
  if (oldPopup) oldPopup.remove();
  const popup = document.createElement('div');
  popup.id = 'secret-tunnel-reward-popup';
  popup.style = 'position:fixed;z-index:10000;top:0;left:0;width:100vw;height:100vh;background:#191a1ecc;display:flex;align-items:center;justify-content:center;';
  popup.innerHTML = `
    <div style="background:linear-gradient(135deg,#23252a 80%,#ffd700 100%);padding:44px 54px 38px 54px;border-radius:28px;box-shadow:0 4px 32px #ffd70088,0 2px 24px #000a;display:flex;flex-direction:column;align-items:center;min-width:380px;position:relative;">
      <div style="font-size:3em;margin-bottom:12px;animation: chestShine 1.2s infinite alternate;">🪙✨</div>
      <div style="color:#ffd700;font-size:1.6em;font-weight:bold;margin-bottom:18px;text-shadow:0 2px 8px #23252a88,0 0 4px #fff;">Chosen by the Gods!</div>
      <div style="margin-bottom:18px;font-size:1.15em;color:#fff;text-align:center;">
        <span style="color:#ffd36b;">You bravely enter the tunnel and discover a <b>mysterious chest</b>!</span><br>
        <span style="color:gold;">Inside you find:</span><br>
        <span style="color:#ffe066;font-weight:bold;">${rewardItem.name}</span>
        <span style="color:#ffd36b;">(Enhanced x5!)</span><br>
        <span style="color:gold;font-size:1.2em;">+1000 Gold</span>
      </div>
      <div style="margin-bottom:10px;color:#ffd36b;font-size:1.05em;">
        <b>Original Stats:</b> ${Object.entries(originalStats).map(([k,v])=>k+':'+v).join(', ')}
      </div>
      <div style="margin-bottom:18px;color:#ffd700;font-size:1.05em;">
        <b>The gods have chosen your item and multiplied its stats by <span style="color:#ffba3a;">x5</span>!</b>
      </div>
      <button onclick="document.getElementById('secret-tunnel-reward-popup').remove()" style="font-size:1.1em;font-weight:bold;background:#ffba3a;color:#23252a;border:none;border-radius:9px;padding:10px 38px;cursor:pointer;box-shadow:0 2px 14px #ffd70088;transition:background 0.18s, color 0.18s;">Awesome!</button>
    </div>
    <style>
      @keyframes chestShine {
        0% { filter: drop-shadow(0 0 8px #ffd70088); }
        100% { filter: drop-shadow(0 0 32px #ffd700cc); }
      }
    </style>
  `;
  document.body.appendChild(popup);

  logMsg(`<span style="color:gold;font-weight:bold;">You bravely enter the tunnel and find a hidden chest!<br>Inside you find <b>${rewardItem.name}</b> and <b>1000 gold</b>!</span>`);
  logMsg(`<span style="color:gold;font-weight:bold;">${player.name} has obtained <b>${rewardItem.name}</b> (Original: ${Object.entries(originalStats).map(([k,v])=>k+':'+v).join(', ')})</span>`);
  logMsg(`<span style="color:#ffd700;font-weight:bold;">The gods have chosen your item and multiplied its stats by x5!</span>`);
}

function initMap() {
  mapData = [];
  discovered = [];
  towns = [];
  chests = [];
  tunnels = [];
  for (let y = 0; y < mapSize; ++y) {
    let row = [];
    let drow = [];
    for (let x = 0; x < mapSize; ++x) {
      // Assign random area name to each cell
      let areaIdx = Math.floor(Math.random() * areaNames.length);
      row.push({ type: "area", name: areaNames[areaIdx] });
      drow.push(false);
    }
    mapData.push(row);
    discovered.push(drow);
  }
  // Place main town in center
  let mid = Math.floor(mapSize/2);
  mapData[mid][mid] = { type: "central-town", name: "Central Town" };
  discovered[mid][mid] = true;
  towns.push({ x: mid, y: mid, name: "Central Town", central: true });
  // Place 10 more towns randomly
  let townNames = [
    "Oakvale", "Riverside", "Stonehill", "Windmere", "Goldport", "Ironforge", "Mistwood", "Sunvale", "Frostholm", "Shadowfen"
  ];
  for (let i = 0; i < 10; ++i) {
    let tx, ty;
    do {
      tx = Math.floor(Math.random()*mapSize);
      ty = Math.floor(Math.random()*mapSize);
    } while ((mapData[ty][tx].type !== "area") || (Math.abs(tx-mid)+Math.abs(ty-mid)<2));
    mapData[ty][tx] = { type: "town", name: townNames[i] };
    towns.push({ x: tx, y: ty, name: townNames[i], central: false });
  }
  // Place 8 chests randomly
  for (let i = 0; i < 8; ++i) {
    let cx, cy;
    do {
      cx = Math.floor(Math.random()*mapSize);
      cy = Math.floor(Math.random()*mapSize);
    } while (mapData[cy][cx].type !== "area");
    mapData[cy][cx] = { type: "chest", name: "Chest" };
    chests.push({ x: cx, y: cy });
  }
  // Place 3 tunnels randomly (you can adjust the number)
  for (let i = 0; i < 10; ++i) {
    let tx, ty;
    do {
      tx = Math.floor(Math.random()*mapSize);
      ty = Math.floor(Math.random()*mapSize);
    } while (mapData[ty][tx].type !== "area");
    mapData[ty][tx] = { type: "tunnel", name: "Secret Tunnel" };
    tunnels.push({ x: tx, y: ty });
  }
}
function renderMap() {
  const map = document.getElementById('game-map');
  map.innerHTML = "";
  for (let y = 0; y < mapSize; ++y) {
    for (let x = 0; x < mapSize; ++x) {
      let cellClass = "map-cell";
      let label = "";
      let cell = mapData[y][x];
      // Player
      if (x === playerPosition.x && y === playerPosition.y) {
        cellClass += " player";
      }
      // Central Town
      if (cell.type === "central-town") {
        cellClass += " central-town";
        label = "C";
      }
      // Other Towns
      else if (cell.type === "town") {
        cellClass += " town";
        if (visitedTowns[cell.name]) {
          label = "✔";
        } else {
          label = "T";
        }
      }
      // Chest
      else if (cell.type === "chest") {
        cellClass += " chest";
        label = "💰";
      }
      // Tunnel
      else if (cell.type === "tunnel") {
        cellClass += " tunnel";
        label = "🕳️";
      }
      // Area
      else if (cell.type === "area") {
        if (discovered[y][x]) {
          cellClass += " discovered";
          label = cell.name[0];
        } else {
          cellClass += " area";
          label = cell.name[0];
        }
      }
      // Discovered
      else if (cell.type === "discovered") {
        cellClass += " discovered";
        label = "";
      }
      // Undiscovered
      if (!discovered[y][x] && cell.type !== "central-town" && cell.type !== "town" && cell.type !== "chest" && cell.type !== "tunnel") {
        cellClass += " undiscovered";
        label = "";
      }
      // Show player icon
      if (x === playerPosition.x && y === playerPosition.y) {
        label = "🧑";
      }
      map.innerHTML += `<div class="${cellClass}" data-x="${x}" data-y="${y}" onclick="mapCellClick(${x},${y})" title="${cell.type === 'area' || cell.type === 'discovered' ? cell.name : cell.name || ''}">${label}</div>`;
    }
  }
  let areaLabel = "";
  let cell = mapData[playerPosition.y][playerPosition.x];
  if (cell.type === "central-town") areaLabel = "Area: Central Town";
  else if (cell.type === "town") areaLabel = "Area: " + cell.name;
  else if (cell.type === "chest") areaLabel = "Area: Chest";
  else if (cell.type === "tunnel") areaLabel = "Area: Secret Tunnel";
  else if (!discovered[playerPosition.y][playerPosition.x]) areaLabel = "Area: Not Discovered";
  else areaLabel = "Area: " + (cell.name || "Discovered");
  document.getElementById("map-area-label").textContent = areaLabel;
}

  // Patch movePlayer and doExplore to call maybeShowSecretTunnel
  function movePlayer(dx,dy) {
      if (inCombat || chestOpen) {
      logMsg('You cannot move while fighting or opening a chest!');
      return;
      }
      let nx = Math.max(0, Math.min(mapSize-1, playerPosition.x+dx));
      let ny = Math.max(0, Math.min(mapSize-1, playerPosition.y+dy));
      playerPosition.x = nx;
      playerPosition.y = ny;
      discovered[ny][nx] = true;
      renderMap();
      let cell = mapData[ny][nx];
      if (cell.type === "central-town") {
      logMsg(`Arrived at <b>Central Town</b>.`);
      } else if (cell.type === "town") {
      showTownPopup(cell.name);
      logMsg(`Arrived at town: <b>${cell.name}</b>.`);
      return; // Wait for popup interaction
      } else if (cell.type === "chest") {
      logMsg("You found a chest!");
      openChest();
      return;
      } else if (cell.type === "tunnel") {
      logMsg("You found a secret tunnel!");
      showSecretTunnelPopup();
      // Optionally, remove the tunnel after use:
      // mapData[ny][nx] = { type: "discovered", name: "" };
      // renderMap();
      return;
      } else if (!discovered[ny][nx]) {
      logMsg("You entered a not discovered area.");
      } else {
      logMsg("You entered: <b>" + (cell.name || "a discovered area") + "</b>.");
      }
      // Random town events
      if (cell.type === "town" && Math.random() < 0.5) {
      triggerRandomTownEvent();
      }
      // Random area events
      if (cell.type === "area" && discovered[ny][nx] && Math.random() < 0.15) {
      triggerRandomAreaEvent();
      }
      if (Math.random() < 0.18 && cell.type !== "central-town" && cell.type !== "town" && cell.type !== "chest" && cell.type !== "tunnel") {
      setTimeout(showEnemy, 350);
      }
      // Only call maybeShowSecretTunnel if not on a tunnel cell
      if (cell.type !== "tunnel") {
        maybeShowSecretTunnel();
      }
  }
  
  function startExplore() {
    if (inCombat || chestOpen) {
    logMsg("Finish your battle or chest first!");
    return;
    }
    document.getElementById('direction-select-bar').classList.add('active');
    // Hide shop if enemy is found during explore (handled in doExplore)
  }
  function chooseExploreDir(dx, dy) {
    document.getElementById('direction-select-bar').classList.remove('active');
    exploreDir = {dx, dy};
    doExplore();
  }

// --- SHOP CLOSED DURING COMBAT LOGIC ---
function showShopClosedOverlay() {
  let overlay = document.getElementById('shop-closed-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'shop-closed-overlay';
    overlay.style = `
      position:absolute;
      top:0;left:0;width:100%;height:100%;
      background:rgba(25,26,30,0.92);
      z-index:200;
      display:flex;
      align-items:center;
      justify-content:center;
      flex-direction:column;
      pointer-events:auto;
    `;
    overlay.innerHTML = `
      <div style="position:relative;z-index:202;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;">
      <div style="color:#ff4444;font-size:2em;font-weight:bold;text-shadow:0 2px 8px #000a;margin-bottom:10px;">Shop Locked!</div>
      <div style="color:#ffd36b;font-size:1.1em;margin-bottom:10px;">The Shop keep doesnt want any company!<br>Defeat the enemy or run away to reopen the shop.</div>
      <div style="font-size:2.5em;filter:grayscale(0.7);margin-bottom:8px;">🔒</div>
      </div>
    `;
    const shopPanel = document.getElementById('shop');
    if (shopPanel) {
      shopPanel.style.position = 'relative';
      shopPanel.appendChild(overlay);
    }
  } else {
    overlay.style.display = 'flex';
  }
}
function hideShopClosedOverlay() {
  let overlay = document.getElementById('shop-closed-overlay');
  if (overlay) overlay.style.display = 'none';
}

// Patch showEnemy to show shop closed overlay
const origShowEnemyForShop = typeof showEnemy === "function" ? showEnemy : null;
window.showEnemy = function() {
  showShopClosedOverlay();
  origShowEnemyForShop && origShowEnemyForShop();
};

// Patch clearEnemy to hide shop closed overlay
const origClearEnemyForShop = typeof clearEnemy === "function" ? clearEnemy : null;
window.clearEnemy = function() {
  hideShopClosedOverlay();
  origClearEnemyForShop && origClearEnemyForShop();
};

// Also hide overlay if player runs away or dies (runFromEnemy, respawnPlayer)
const origRunFromEnemyForShop = typeof runFromEnemy === "function" ? runFromEnemy : null;
window.runFromEnemy = function() {
  if (!currentEnemy || !inCombat) return;
  // 60% chance to run away
  if (Math.random() < 0.6) {
    logMsg(`<span style="color:#9cf">You ran away from the ${currentEnemy.name}!</span>`);
    clearEnemy();
    hideShopClosedOverlay();
  } else {
    logMsg(`<span style="color:#f77">You failed to run away!</span>`);
    setTimeout(enemyAttack, 500);
    // Keep overlay visible
  }
};
const origRespawnPlayerForShop = typeof respawnPlayer === "function" ? respawnPlayer : null;
window.respawnPlayer = function() {
  hideShopClosedOverlay();
  origRespawnPlayerForShop && origRespawnPlayerForShop();
};

(function() {
  // Remove old button if exists
  let oldBtn = document.getElementById('auto-explore-btn');
  if (oldBtn) oldBtn.remove();
  // Create button
  const btn = document.createElement('button');
  btn.id = 'auto-explore-btn';
  btn.textContent = 'Auto Explore';
  btn.style.fontWeight = 'bold';
  btn.style.fontSize = '1em';
  btn.style.background = '#ffba3a';
  btn.style.color = '#23252a';
  btn.style.border = 'none';
  btn.style.borderRadius = '12px';
  btn.style.padding = '14px 32px';
  btn.style.cursor = 'pointer';
  btn.style.marginLeft = '18px';
  btn.onclick = function() {
    showAutoExploreDirectionPopup();
  };
  // Insert beside Explore button
  const exploreBar = document.getElementById('explore-bar');
  if (exploreBar) {
    exploreBar.appendChild(btn);
  }
})();

let autoExploreActive = false;
let autoExploreDir = null;
let autoExploreTimer = null;
let autoExploreAutoAttack = false;

function showAutoExploreDirectionPopup() {
  // Remove old popup if exists
  let oldPopup = document.getElementById('auto-explore-dir-popup');
  if (oldPopup) oldPopup.remove();
  // Create popup
  const popup = document.createElement('div');
  popup.id = 'auto-explore-dir-popup';
  popup.style = 'position:fixed;z-index:9999;top:0;left:0;width:100vw;height:100vh;background:#191a1ecc;display:flex;align-items:center;justify-content:center;';
  popup.innerHTML = `
    <div style="background:#23252a;padding:32px 38px 24px 38px;border-radius:18px;box-shadow:0 2px 24px #000a;display:flex;flex-direction:column;align-items:center;">
      <div style="color:#ffba3a;font-size:1.2em;margin-bottom:18px;">Choose Auto Explore Direction</div>
      <label style="margin-bottom:14px;display:flex;align-items:center;gap:8px;">
        <input type="checkbox" id="auto-explore-auto-attack" style="width:18px;height:18px;">
        <span style="color:#ffba3a;font-weight:bold;">Auto Attack Enemies</span>
      </label>
      <div style="display:flex;gap:18px;margin-bottom:18px;">
        <button onclick="startAutoExplore(0,-1);closeAutoExploreDirPopup()" style="font-size:1.1em;background:#35373e;color:#ffba3a;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">North</button>
        <button onclick="startAutoExplore(1,0);closeAutoExploreDirPopup()" style="font-size:1.1em;background:#35373e;color:#ffba3a;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">East</button>
        <button onclick="startAutoExplore(0,1);closeAutoExploreDirPopup()" style="font-size:1.1em;background:#35373e;color:#ffba3a;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">South</button>
        <button onclick="startAutoExplore(-1,0);closeAutoExploreDirPopup()" style="font-size:1.1em;background:#35373e;color:#ffba3a;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">West</button>
      </div>
      <button onclick="closeAutoExploreDirPopup()" style="font-size:1em;background:#ff4444;color:#fff;border:none;border-radius:7px;padding:6px 24px;cursor:pointer;">Cancel</button>
    </div>
  `;
  document.body.appendChild(popup);
  // Restore last checkbox state
  setTimeout(() => {
    const cb = document.getElementById('auto-explore-auto-attack');
    if (cb) cb.checked = autoExploreAutoAttack;
    cb && cb.addEventListener('change', function() {
      autoExploreAutoAttack = cb.checked;
    });
  }, 50);
}
function closeAutoExploreDirPopup() {
  let popup = document.getElementById('auto-explore-dir-popup');
  if (popup) popup.remove();
}

function startAutoExplore(dx, dy) {
  autoExploreActive = true;
  autoExploreDir = {dx, dy};
  // Get checkbox value
  const cb = document.getElementById('auto-explore-auto-attack');
  autoExploreAutoAttack = cb ? cb.checked : autoExploreAutoAttack;
  updateAutoExploreBtn(true);
  autoExploreLoop();
}

function stopAutoExplore() {
  autoExploreActive = false;
  autoExploreDir = null;
  if (autoExploreTimer) clearTimeout(autoExploreTimer);
  updateAutoExploreBtn(false);
}

function updateAutoExploreBtn(active) {
  const btn = document.getElementById('auto-explore-btn');
  if (!btn) return;
  if (active) {
    btn.textContent = 'Stop Auto Explore';
    btn.style.background = '#ff4444';
    btn.style.color = '#fff';
    btn.onclick = stopAutoExplore;
  } else {
    btn.textContent = 'Auto Explore';
    btn.style.background = '#ffba3a';
    btn.style.color = '#23252a';
    btn.onclick = function() { showAutoExploreDirectionPopup(); };
  }
}

function autoExploreLoop() {
  if (!autoExploreActive || !autoExploreDir) return;
  // If in combat or chest open, wait and retry
  if (inCombat || chestOpen) {
    autoExploreTimer = setTimeout(autoExploreLoop, 1200);
    return;
  }
  // Try to move in direction
  let nx = Math.max(0, Math.min(mapSize-1, playerPosition.x+autoExploreDir.dx));
  let ny = Math.max(0, Math.min(mapSize-1, playerPosition.y+autoExploreDir.dy));
  // If can't move further, stop
  if (nx === playerPosition.x && ny === playerPosition.y) {
    stopAutoExplore();
    return;
  }
  playerPosition.x = nx;
  playerPosition.y = ny;
  discovered[ny][nx] = true;
  renderMap();
  let cell = mapData[ny][nx];
  // Interactions: only log and handle, do not stop auto-explore unless explicitly triggered
  if (cell.type === "central-town") {
    logMsg(`Arrived at <b>Central Town</b>.`);
    // Optionally, you can set a flag here if you want to stop auto-explore on central town
    // stopAutoExplore();
    // return;
  } else if (cell.type === "town") {
    showTownPopup(cell.name);
    logMsg(`Arrived at town: <b>${cell.name}</b>.`);
    // Optionally, you can set a flag here if you want to stop auto-explore on town
    // stopAutoExplore();
    // return;
  } else if (cell.type === "chest") {
    logMsg("You found a chest!");
    openChest();
    // Optionally, you can set a flag here if you want to stop auto-explore on chest
    // stopAutoExplore();
    // return;
  } else if (!discovered[ny][nx]) {
    logMsg("You entered a not discovered area.");
  } else {
    logMsg("You entered: <b>" + (cell.name || "a discovered area") + "</b>.");
  }
  // Random town events
  if (cell.type === "town" && Math.random() < 0.5) {
    triggerRandomTownEvent();
    // Optionally, you can set a flag here if you want to stop auto-explore on random town event
    // stopAutoExplore();
    // return;


  }
  // Enemy encounter: only stop if auto-attack is not enabled
  if (Math.random() < 0.22 && cell.type !== "central-town" && cell.type !== "town" && cell.type !== "chest") {
    setTimeout(() => {
      showEnemy();
      // If auto-attack is enabled, auto attack until enemy defeated or player dies
      if (autoExploreAutoAttack && currentEnemy && inCombat) {
        autoAttackActive = true;
        autoAttackLoopAutoExplore();
      }
      // else, do not stop auto-explore here; let user stop it manually if desired
    }, 350);
    return;
  }
  // Continue auto-explore after short delay
  autoExploreTimer = setTimeout(autoExploreLoop, 700);
}

// Auto-attack loop for auto-explore (does not stop auto-explore unless player dies or ancient boss)
function autoAttackLoopAutoExplore() {
  if (!autoAttackActive || !currentEnemy || !inCombat) {
    stopAutoExplore();
    return;
  }
  // If ancient boss, stop auto-explore and require manual input
  if (currentEnemy.isBoss) {
    stopAutoExplore();
    return;
  }
  // Only attack if enemy and player are alive
  if (currentEnemy.health > 0 && player.health > 0) {
    attackEnemy();
    setTimeout(() => {
      if (currentEnemy && currentEnemy.health > 0 && player.health > 0 && inCombat && autoAttackActive) {
        autoAttackLoopAutoExplore();
      } else {
        stopAutoExplore();
      }
    }, 900);
  } else {
    stopAutoExplore();
  }
}


function doExplore() {
  if (!exploreDir) return;
  let nx = Math.max(0, Math.min(mapSize-1, playerPosition.x+exploreDir.dx));
  let ny = Math.max(0, Math.min(mapSize-1, playerPosition.y+exploreDir.dy));
  playerPosition.x = nx;
  playerPosition.y = ny;
  discovered[ny][nx] = true;
  renderMap();
  let cell = mapData[ny][nx];
  if (cell.type === "central-town") {
    logMsg(`Arrived at <b>Central Town</b>.`);
  } else if (cell.type === "town") {
    showTownPopup(cell.name);
    logMsg(`Arrived at town: <b>${cell.name}</b>.`);
    exploreDir = null;
    return; // Wait for popup interaction
  } else if (cell.type === "chest") {
    logMsg("You found a chest!");
    openChest();
    return;
  } else if (!discovered[ny][nx]) {
    logMsg("You entered a not discovered area.");
  } else {
    logMsg("You entered: <b>" + (cell.name || "a discovered area") + "</b>.");
  }
  // Random town events
  if (cell.type === "town" && Math.random() < 0.5) {
    triggerRandomTownEvent();
  }
  // Random area events
  if (cell.type === "area" && discovered[ny][nx] && Math.random() < 0.15) {
    triggerRandomAreaEvent();
  }
  // Enemy encounter: show shop closed overlay if enemy found
  if (Math.random() < 0.22 && cell.type !== "central-town" && cell.type !== "town" && cell.type !== "chest") {
    setTimeout(() => {
      showShopClosedOverlay();
      showEnemy();
    }, 350);
  }
  // Check for secret tunnel after exploration movement
  maybeShowSecretTunnel();
  exploreDir = null;
}
// --- Add this after your renderDerivedStats function ---
function updateAllStats() {
  renderPlayerStats();
  renderDerivedStats();
  renderEquipment();
}
/*
  --- NO WEAPON EQUIPPED FUNCTIONALITY ---
  If the user has no weapon equipped, they still deal 1 damage per attack.
  The first time, show a menacing/devilish popup warning the user to equip a weapon,
  or else they will only deal 1 damage per attack until a weapon is equipped.
*/

// Track if the no-weapon popup has been shown in this session
let noWeaponPopupShown = false;

// Patch attackEnemy to handle no-weapon logic (separate from bow/arrows logic)
const origAttackEnemyNoWeapon = typeof attackEnemy === "function" ? attackEnemy : null;
window.attackEnemy = function() {
  // No weapon equipped logic (only if not a bow)
  if (!player.equipment.weapon) {
    // Show popup only the first time per session
    if (!noWeaponPopupShown) {
      showNoWeaponPopup();
      noWeaponPopupShown = true;
    }
    // Deal only 1 damage per attack
    if (!currentEnemy || !inCombat) {
      logMsg("No enemy to attack.");
      return;
    }
    currentEnemy.health = Math.max(0, currentEnemy.health - 1);
    showHitsplat(1);
    logMsg(`<span style="color:#ff4444;font-weight:bold;">You attack with your bare hands and deal <b>1</b> damage!</span>`);
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
      return;
    }
    setTimeout(()=>{ enemyAttack(); }, 700);
    return;
  }
  // Continue with normal attack logic
  origAttackEnemyNoWeapon && origAttackEnemyNoWeapon();
};

// Show popup if trying to attack with no weapon equipped
function showNoWeaponPopup() {
  // Remove old popup if exists
  let oldPopup = document.getElementById('no-weapon-popup');
  if (oldPopup) oldPopup.remove();
  // Add styles for devilish animation
  if (!document.getElementById('no-weapon-popup-style')) {
    const style = document.createElement('style');
    style.id = 'no-weapon-popup-style';
    style.textContent = `
      @keyframes devilPulseGlow {
        0% {
          text-shadow: 0 0 0px #e53935, 0 0 0px #ffd36b;
          transform: scale(1);
          opacity: 1;
        }
        50% {
          text-shadow: 0 0 32px #e53935, 0 0 48px #ffd36b;
          transform: scale(1.18) rotate(-3deg);
          opacity: 0.97;
        }
        100% {
          text-shadow: 0 0 0px #e53935, 0 0 0px #ffd36b;
          transform: scale(1);
          opacity: 1;
        }
      }
      #no-weapon-devil {
        animation: devilPulseGlow 1.3s infinite;
        display: inline-block;
        transition: transform 0.2s;
      }
    `;
    document.head.appendChild(style);
  }
  // Create popup
  const popup = document.createElement('div');
  popup.id = 'no-weapon-popup';
  popup.style = 'position:fixed;z-index:9999;top:0;left:0;width:100vw;height:100vh;background:#191a1ecc;display:flex;align-items:center;justify-content:center;';
  popup.innerHTML = `
    <div style="background:#23252a;padding:32px 38px 24px 38px;border-radius:18px;box-shadow:0 2px 24px #000a;display:flex;flex-direction:column;align-items:center;">
      <div id="no-weapon-devil" style="font-size:3em;margin-bottom:10px;">👊</div>
      <div style="color:#e53935;font-size:1.25em;margin-bottom:12px;font-weight:bold;">No Weapon Equipped!</div>
      <div style="margin-bottom:12px;color:#ffd36b;"><br><b>You will only deal <span style="color:#e53935;">1</span> damage per attack</b> until you equip a weapon.</div>
      <div style="color:#fff;font-size:1.05em;margin-bottom:18px;text-align:center;">
        <b>The spirits mock your bare fists...<br>Equip a weapon to unleash your true power!</b>
      </div>
      <button id="no-weapon-ok" style="font-size:1.1em;font-weight:bold;background:#e53935;color:#fff;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">I Understand</button>
    </div>
  `;
  document.body.appendChild(popup);
  document.getElementById('no-weapon-ok').onclick = function() {
    popup.remove();
  };
}

/*
  --- BOW & ARROWS FUNCTIONALITY ---
  If the user has a bow equipped, they must also have arrows equipped to attack.
  If not, show a popup warning and prevent the attack.
  If bow and arrows are equipped, consume one arrow per attack.
*/

// Helper: check if equipped weapon is a bow
function isEquippedBow() {
  const weapon = player.equipment.weapon;
  return weapon && (weapon.isBow || (weapon.name && weapon.name.toLowerCase().includes('bow')));
}
// Helper: check if arrows are equipped and have count > 0
function hasEquippedArrows() {
  const arrows = player.equipment.arrows;
  return arrows && typeof arrows.count === "number" && arrows.count > 0;
}

// Failsafe: prevent repeated no-arrows popup during auto-attack
let noArrowsPopupActive = false;

// Patch attackEnemy to handle bow/arrows logic (separate from no-weapon logic)
const origAttackEnemyBow = window.attackEnemy;
window.attackEnemy = function() {
  // Bow logic: if equipped weapon is a bow, check for arrows
  if (isEquippedBow()) {
    if (!hasEquippedArrows()) {
      // Show popup: "You need arrows equipped to use a bow!"
      if (!noArrowsPopupActive) showNoArrowsPopup();
      // If auto-attack is running, stop it
      if (typeof autoAttackActive !== "undefined" && autoAttackActive) stopAutoAttack && stopAutoAttack();
      return;
    }
    // If bow and arrows equipped, consume one arrow per attack
    player.equipment.arrows.count -= 1;
    logMsg(`<span style="color:#ffba3a;">Used 1 arrow. ${player.equipment.arrows.count > 0 ? `Arrows left: ${player.equipment.arrows.count}` : "No arrows left!"}</span>`);
    if (player.equipment.arrows.count <= 0) {
      logMsg(`<span style="color:#f44;font-weight:bold;">You have run out of arrows!</span>`);
      player.equipment.arrows = null;
    }
    updateAllStats();
    renderBagInv();
  }
  // Continue with normal attack logic
  origAttackEnemyBow && origAttackEnemyBow.apply(this, arguments);
};

// Show popup if trying to attack with bow but no arrows equipped
function showNoArrowsPopup() {
  // Remove old popup if exists
  let oldPopup = document.getElementById('no-arrows-popup');
  if (oldPopup) oldPopup.remove();
  noArrowsPopupActive = true;
  // Add styles for pulsate, glow, and grow
  if (!document.getElementById('no-arrows-popup-style')) {
    const style = document.createElement('style');
    style.id = 'no-arrows-popup-style';
    style.textContent = `
      @keyframes cautionPulseGlow {
        0% {
          text-shadow: 0 0 0px #ffba3a, 0 0 0px #ffd36b;
          transform: scale(1);
          opacity: 1;
        }
        50% {
          text-shadow: 0 0 24px #ffba3a, 0 0 48px #ffd36b;
          transform: scale(1.25);
          opacity: 0.93;
        }
        100% {
          text-shadow: 0 0 0px #ffba3a, 0 0 0px #ffd36b;
          transform: scale(1);
          opacity: 1;
        }
      }
      #no-arrows-caution {
        animation: cautionPulseGlow 1.2s infinite;
        display: inline-block;
        transition: transform 0.2s;
      }
    `;
    document.head.appendChild(style);
  }
  // Create popup
  const popup = document.createElement('div');
  popup.id = 'no-arrows-popup';
  popup.style = 'position:fixed;z-index:9999;top:0;left:0;width:100vw;height:100vh;background:#191a1ecc;display:flex;align-items:center;justify-content:center;';
  popup.innerHTML = `
    <div style="background:#23252a;padding:32px 38px 24px 38px;border-radius:18px;box-shadow:0 2px 24px #000a;display:flex;flex-direction:column;align-items:center;">
      <div id="no-arrows-caution" style="font-size:3em;margin-bottom:10px;">⚠️</div>
      <div style="color:#ffba3a;font-size:1.2em;margin-bottom:12px;">No Arrows Equipped!</div>
      <div style="margin-bottom:12px;">You need arrows equipped to use a bow.<br>Equip arrows in your equipment panel.</div>
      <div style="color:#ffd36b;font-size:1.05em;margin-bottom:18px;text-align:center;">
        <b>The spirits frown upon archers who forget their arrows...</b>
      </div>
      <button id="no-arrows-ok" style="font-size:1.1em;font-weight:bold;background:#ffba3a;color:#23252a;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">OK</button>
    </div>
  `;
  document.body.appendChild(popup);
  document.getElementById('no-arrows-ok').onclick = function() {
    popup.remove();
    noArrowsPopupActive = false;
  };
}

// --- Replace all calls to renderPlayerStats(), renderDerivedStats(), or renderEquipment() after stat changes with updateAllStats() ---
// For example, in equipItem, equipBagItem, useItem, addItem, handleEquipSlot, etc.
// Example for equipItem:
function equipItem(idx) {
  let item = player.inventory[idx];
  let slot = item.type;
  if (!isEquipable(item)) {
    logMsg(`Cannot equip ${item.name}.`);
    return;
  }
  let old = player.equipment[slot];
  if (old) player.bag.push(old);
  player.equipment[slot] = item;
  player.inventory.splice(idx, 1);
  logMsg(`Equipped ${item.name}.`);
  updateAllStats();
  renderBagInv();
}
function renderEquipment() {
  const eqLeft = document.getElementById('equipment-slots-left');
  const eqRight = document.getElementById('equipment-slots-right');
  eqLeft.innerHTML = "";
  eqRight.innerHTML = "";
  equipmentOrderLeft.forEach((slotData) => {
    const slot = slotData.slot;
    const eq = player.equipment[slot];
    let isAncient = eq && eq.name && eq.name.startsWith("Ancient ");
    let setCount = getAncientSetCount();
    let setBonus = "";
    if (isAncient) {
      setBonus = `<br><span style="color:#90ee90;font-weight:bold;">Ancient Set Bonus (${setCount}/5):</span>`;
      setBonus += `<br><span style="color:${setCount>=2?'#90ee90':'#fff'};">+20 DEF, +50 HP</span>`;
      setBonus += `<br><span style="color:${setCount>=4?'#90ee90':'#fff'};">+40 DEF, +100 HP</span>`;
      setBonus += `<br><span style="color:${setCount===5?'#90ee90':'#fff'};">+60 DEF, +150 HP</span>`;
    }
    // Show arrow count if equipped
    let arrowsCount = "";
    if (slot === "arrows" && eq && typeof eq.count === "number") {
      arrowsCount = `<br>Arrows: <b>x${eq.count}</b>`;
    }
    eqLeft.innerHTML += `
      <div class="equip-slot${isAncient ? ' ancient-set' : ''}" onclick="handleEquipSlot('${slot}')" title="${slotData.label}">
       <b>${slotData.label}:</b> <span class="item-name">${eq ? eq.name.replace(/\s*\([^)]*\)/, "") : "<em>none</em>"}</span>
  <div class="slot-tooltip">
  ${eq ? eq.name.replace(/\s*\([^)]*\)/, "") : "<em>none</em>"}
  ${eq && eq.attackPower ? `<br>ATK: <b>+${eq.attackPower}</b>` : ""}
  ${eq && eq.defense ? `<br>DEF: <b>+${eq.defense}</b>` : ""}
  ${eq && eq.health ? `<br>HP: <b>+${eq.health}</b>` : ""}
  ${arrowsCount}
  ${setBonus}
</div>
    `;
  });
  equipmentOrderRight.forEach((slotData) => {
    const slot = slotData.slot;
    const eq = player.equipment[slot];
    let isAncient = eq && eq.name && eq.name.startsWith("Ancient ");
    let setCount = getAncientSetCount();
    let setBonus = "";
    if (isAncient) {
      setBonus = `<br><span style="color:#90ee90;font-weight:bold;">Ancient Set Bonus (${setCount}/5):</span>`;
      if (setCount >= 2) setBonus += `<br><span style="color:#90ee90;">+20 DEF, +50 HP</span>`;
      if (setCount >= 4) setBonus += `<br><span style="color:#90ee90;">+40 DEF, +100 HP</span>`;
      if (setCount === 5) setBonus += `<br><span style="color:#90ee90;">+60 DEF, +150 HP</span>`;
    }
    // Show arrow count if equipped (for right side, just in case)
    let arrowsCount = "";
    if (slot === "arrows" && eq && typeof eq.count === "number") {
      arrowsCount = `<br>Arrows: <b>x${eq.count}</b>`;
    }
    eqRight.innerHTML += `
  <div class="equip-slot${isAncient ? ' ancient-set' : ''}" onclick="handleEquipSlot('${slot}')" title="${slotData.label}">
    <b>${slotData.label}:</b> <span class="item-name" style="max-width:70px;display:inline-block;vertical-align:middle;">${eq ? eq.name.replace(/\s*\([^)]*\)/, "") : "<em>none</em>"}</span>
    <div class="slot-tooltip">
      ${eq ? eq.name.replace(/\s*\([^)]*\)/, "") : "<em>none</em>"}
      ${eq && eq.attackPower ? `<br>ATK: <b>+${eq.attackPower}</b>` : ""}
      ${eq && eq.defense ? `<br>DEF: <b>+${eq.defense}</b>` : ""}
      ${eq && eq.health ? `<br>HP: <b>+${eq.health}</b>` : ""}
      ${arrowsCount}
      ${setBonus}
    </div>
  </div>
 `;
  });
  document.getElementById('equipment-legend').textContent = "Click a slot to unequip";
}
function handleEquipSlot(slot) {
  if (!player.equipment[slot]) return;
  player.bag.push(player.equipment[slot]);
  logMsg(`Unequipped ${player.equipment[slot].name} from ${slot}.`);
  player.equipment[slot] = null;
  updateAllStats();
  renderBagInv();
}
function switchBagInv(tab) {
  baginvTab = tab;
  document.getElementById('tab-inventory').classList.toggle('active', tab === "inventory");
  document.getElementById('tab-bag').classList.toggle('active', tab === "bag");
  renderBagInv();
}
function renderBagInv() {
  const content = document.getElementById('baginv-content');
  content.innerHTML = "";
  let itemsArr = baginvTab === "inventory" ? player.inventory : player.bag;
  if (searchTerm) {
    itemsArr = itemsArr.filter(i => i.name.toLowerCase().includes(searchTerm));
  }
  if (!itemsArr.length) {
    content.innerHTML = `<div style="color:#9c9c9c;text-align:center;width:100%;padding:29px 0;">No items</div>`;
    return;
  }
  if (baginvTab === "inventory") {
    itemsArr.forEach((item, idx) => {
      let isAncient = item.name && item.name.startsWith("Ancient ");
      let setCount = getAncientSetCount();
      let setBonus = "";
      if (isAncient) {
        setBonus = `<br><span style="color:gold;font-weight:bold;">Ancient Set Bonus (${setCount}/5):</span>`;
        setBonus += `<br><span style="color:${setCount>=2?'#ffd36b':'#fff'};">+20 DEF, +50 HP</span>`;
        setBonus += `<br><span style="color:${setCount>=4?'#ffd36b':'#fff'};">+40 DEF, +100 HP</span>`;
        setBonus += `<br><span style="color:${setCount===5?'#ffd36b':'#fff'};">+60 DEF, +150 HP</span>`;
      }
      content.innerHTML += `
        <div class="item-card${isAncient ? ' ancient-set' : ''}">
          ${item.type==="material" ? `<button class="bag-x-remove-btn" onclick="removeItem(${idx});event.stopPropagation()" title="Remove">&times;</button>` : ""}
          <div class="item-name">${item.name.replace(/\s*\([^)]*\)/, "")}${item.count > 1 ? ` (x${item.count})` : ""}</div>
          <div class="item-actions">
            ${item.type==="potion"||item.type==="consumable"||isHealingItem(item) ? `<button class="item-action-btn" onclick="useItem(${idx});event.stopPropagation()">Use</button>` : ""}
            ${isEquipable(item) ? `<button class="item-action-btn" onclick="equipItem(${idx});event.stopPropagation()">Equip</button>` : ""}
          </div>
          <div class="item-tooltip" style="display:none;position:absolute;left:110%;top:50%;transform:translateY(-50%);background:#18191c;color:#eee;padding:7px 13px;border-radius:8px;border:1px solid #444;white-space:nowrap;font-size:0.98em;box-shadow:0 2px 10px #0007;z-index:10;min-width:160px;">
            <b>${item.name}</b>
            ${item.description ? `<br><span style="color:#aaa;">${item.description}</span>` : ""}
            ${item.attackPower ? `<br>ATK: <b>+${item.attackPower}</b>` : ""}
            ${item.defense ? `<br>DEF: <b>+${item.defense}</b>` : ""}
            ${item.health ? `<br>HP: <b>+${item.health}</b>` : ""}
            ${item.heal ? `<br>Heals: <b>+${item.heal}</b>` : ""}
            ${item.count && item.type === "arrows" ? `<br>Arrows: <b>x${item.count}</b>` : ""}
            ${item.type ? `<br><span style="color:#ffba3a;">Type: ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>` : ""}
            ${setBonus}
          </div>
        </div>
      `;
    });
  } else {
    itemsArr.forEach((item, idx) => {
      let isAncient = item.name && item.name.startsWith("Ancient ");
      let setCount = getAncientSetCount();
      let setBonus = "";
      if (isAncient) {
        setBonus = `<br><span style="color:gold;font-weight:bold;">Ancient Set Bonus (${setCount}/5):</span>`;
        if (setCount >= 2) setBonus += `<br><span style="color:#ffd36b;">+20 DEF, +50 HP</span>`;
        if (setCount >= 4) setBonus += `<br><span style="color:#ffd36b;">+40 DEF, +100 HP</span>`;
        if (setCount === 5) setBonus += `<br><span style="color:#ffd36b;">+60 DEF, +150 HP</span>`;
      }
      content.innerHTML += `
        <div class="item-card${isAncient ? ' ancient-set' : ''}">
          <button class="bag-x-remove-btn" onclick="removeItem(${idx});event.stopPropagation()" title="Remove">&times;</button>
          <div class="item-name">${item.name.replace(/\s*\([^)]*\)/, "")}${item.count > 1 ? ` (x${item.count})` : ""}</div>
          <button class="bag-equip-btn" onclick="equipBagItem(${idx});event.stopPropagation()">Equip</button>
          <div class="item-tooltip" style="display:none;position:absolute;left:110%;top:50%;transform:translateY(-50%);background:#18191c;color:#eee;padding:7px 13px;border-radius:8px;border:1px solid #444;white-space:nowrap;font-size:0.98em;box-shadow:0 2px 10px #0007;z-index:10;min-width:160px;">
            <b>${item.name}</b>
            ${item.description ? `<br><span style="color:#aaa;">${item.description}</span>` : ""}
            ${item.attackPower ? `<br>ATK: <b>+${item.attackPower}</b>` : ""}
            ${item.defense ? `<br>DEF: <b>+${item.defense}</b>` : ""}
            ${item.health ? `<br>HP: <b>+${item.health}</b>` : ""}
            ${item.heal ? `<br>Heals: <b>+${item.heal}</b>` : ""}
            ${item.count && item.type === "arrows" ? `<br>Arrows: <b>x${item.count}</b>` : ""}
            ${item.type ? `<br><span style="color:#ffba3a;">Type: ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>` : ""}
            ${setBonus}
          </div>
        </div>
      `;
    });
  }
  // Tooltip hover logic for all .item-card
  const cards = content.querySelectorAll('.item-card');
  cards.forEach(card => {
    const tip = card.querySelector('.item-tooltip');
    card.onmouseenter = () => { if (tip) tip.style.display = 'block'; };
    card.onmouseleave = () => { if (tip) tip.style.display = 'none'; };
    card.onmousemove = (e) => {
      if (tip) {
        tip.style.left = (e.offsetX + 30) + 'px';
        tip.style.top = (e.offsetY - 10) + 'px';
      }
    };
  });
  
  // Add mystery bag open buttons
  addMysteryBagOpenButton();
}
function isHealingItem(item) {
  return typeof item.heal === "number" && item.heal > 0;
}
function isStatItem(item) {
  return (
    (typeof item.attackPower === "number" && item.attackPower > 0) ||
    (typeof item.defense === "number" && item.defense > 0) ||
    (typeof item.health === "number" && item.health > 0) ||
    ["weapon","armor","shield","ring","arrows","helmet","cloak","amulet","gloves","boots"].includes(item.type)
  );
}
function isEquipable(item) {
  return ["weapon","armor","shield","ring","arrows","helmet","cloak","amulet","gloves","boots"].includes(item.type);
}
function addItem(item) {
  // Prevent stat reroll for special seller items
  if (!item._noReroll) {
    // Only assign random stats if not already set
    if (item.type === "gloves") {
      if (typeof item.defense !== "number") item.defense = 15;
      if (typeof item.health !== "number") item.health = randomStat(30,100);
    }
    if (item.type === "boots") {
      if (typeof item.defense !== "number") item.defense = 20;
      if (typeof item.health !== "number") item.health = randomStat(20,100);
    }
    if (item.type === "helmet") {
      if (typeof item.defense !== "number") item.defense = 25;
      if (typeof item.health !== "number") item.health = randomStat(30,100);
    }
    if (item.type === "cloak") {
      if (typeof item.defense !== "number") item.defense = 35;
      if (typeof item.health !== "number") item.health = randomStat(25,100);
    }
    if (item.type === "ring") {
      if (typeof item.attackPower !== "number") item.attackPower = 2;
      if (typeof item.health !== "number") item.health = randomStat(10,100);
    }
  }

  // Helper to stack items
  function tryStack(arr, item) {
    for (let i = 0; i < arr.length; i++) {
      let it = arr[i];
      // Stack arrows by type only
      if (item.type === "arrows" && it.type === "arrows") {
        it.count = (it.count || 1) + (item.count || 1);
        return true;
      }
      // Stack other items by name, type, and key stats
      if (
        it.name === item.name &&
        it.type === item.type &&
        (it.attackPower === item.attackPower || (!it.attackPower && !item.attackPower)) &&
        (it.defense === item.defense || (!it.defense && !item.defense)) &&
        (it.heal === item.heal || (!it.heal && !item.heal)) &&
        (it.health === item.health || (!it.health && !item.health))
      ) {
        it.count = (it.count || 1) + (item.count || 1);
        return true;
      }
    }
    return false;
  }

  // Always stack arrows in both inventory and bag, updating the count of the existing stack
  if (item.type === "arrows") {
    let stacked = false;
    // Try stacking in inventory first
    for (let i = 0; i < player.inventory.length; i++) {
      let it = player.inventory[i];
      if (it.type === "arrows") {
        it.count = (it.count || 1) + (item.count || 1);
        stacked = true;
        break;
      }
    }
    // If not found in inventory, try stacking in bag
    if (!stacked) {
      for (let i = 0; i < player.bag.length; i++) {
        let it = player.bag[i];
        if (it.type === "arrows") {
          it.count = (it.count || 1) + (item.count || 1);
          stacked = true;
          break;
        }
      }
    }
    // If not found in either, add to bag by default
    if (!stacked) {
      player.bag.push({ ...item, count: item.count || 1 });
    }
    logMsg(`Added ${item.name}${item.count > 1 ? ` (x${item.count})` : ""} to Bag.`);
  } else if (item.type === "material") {
    if (!tryStack(player.inventory, item)) {
      player.inventory.push({ ...item, count: item.count || 1 });
    }
    logMsg(`Added ${item.name}${item.count > 1 ? ` (x${item.count})` : ""} to Inventory.`);
  } else if (isHealingItem(item)) {
    if (!tryStack(player.inventory, item)) {
      player.inventory.push({ ...item, count: item.count || 1 });
    }
    logMsg(`Added ${item.name}${item.count > 1 ? ` (x${item.count})` : ""} to Inventory.`);
  } else if (isStatItem(item)) {
    if (!tryStack(player.bag, item)) {
      player.bag.push({ ...item, count: item.count || 1 });
    }
    logMsg(`Added ${item.name}${item.count > 1 ? ` (x${item.count})` : ""} to Bag.`);
  } else {
    if (!tryStack(player.inventory, item)) {
      player.inventory.push({ ...item, count: item.count || 1 });
    }
    logMsg(`Added ${item.name}${item.count > 1 ? ` (x${item.count})` : ""} to Inventory.`);
  }
  renderBagInv();
}
function selectBagInvItem(idx) {}

// --- PATCH: Multi-use healing items popup ---
function useItem(idx) {
  let itemsArr = baginvTab === "inventory" ? player.inventory : player.bag;
  const item = itemsArr[idx];
  if (isHealingItem(item)) {
    let maxHeal = getTotalMaxHealth();
    if (maxHeal <= 100) maxHeal = 100;
    if (item.count && item.count > 1) {
      // Show popup to ask how many to use
      showUseMultiplePopup(item, idx, itemsArr, maxHeal);
      return;
    }
    if (player.health < maxHeal) {
      player.health = Math.min(maxHeal, player.health + (item.heal||0));
      logMsg(`Used ${item.name}, healed for ${item.heal}.`);
      itemsArr.splice(idx, 1);
    } else {
      logMsg(`${item.name} can't be used at full health.`);
    }
  } else {
    logMsg(`You can't use ${item.name} directly.`);
  }
  updateAllStats();
  renderBagInv();
}

// Helper: show popup for multi-use healing items
function showUseMultiplePopup(item, idx, itemsArr, maxHeal) {
  // Remove existing popup if any
  let oldPopup = document.getElementById('multi-use-popup');
  if (oldPopup) oldPopup.remove();
  // Create popup
  const popup = document.createElement('div');
  popup.id = 'multi-use-popup';
  popup.style = 'position:fixed;z-index:9999;top:0;left:0;width:100vw;height:100vh;background:#191a1ecc;display:flex;align-items:center;justify-content:center;';
  popup.innerHTML = `
    <div style="background:#23252a;padding:32px 38px 24px 38px;border-radius:18px;box-shadow:0 2px 24px #000a;display:flex;flex-direction:column;align-items:center;">
      <div style="color:#ffba3a;font-size:1.2em;margin-bottom:18px;">Use ${item.name} (x${item.count})</div>
      <div style="margin-bottom:12px;">How many would you like to use?</div>
      <input id="multi-use-count" type="number" min="1" max="${item.count}" value="1" style="font-size:1.1em;padding:6px 18px;border-radius:7px;border:1.5px solid #444;background:#18191c;color:#fff;margin-bottom:18px;width:120px;outline:none;">
      <div style="margin-bottom:12px;color:#aaa;">Each heals for ${item.heal}. Current HP: ${player.health}/${maxHeal}</div>
      <div style="display:flex;gap:18px;">
        <button id="multi-use-confirm" style="font-size:1.1em;font-weight:bold;background:#ffba3a;color:#23252a;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">Use</button>
        <button id="multi-use-cancel" style="font-size:1.1em;font-weight:bold;background:#35373e;color:#ffba3a;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">Cancel</button>
      </div>
      <div id="multi-use-error" style="color:#ff4444;margin-top:10px;display:none;font-size:1em;"></div>
    </div>
  `;
  document.body.appendChild(popup);

  document.getElementById('multi-use-cancel').onclick = function() {
    popup.remove();
  };
  document.getElementById('multi-use-confirm').onclick = function() {
    const countInput = document.getElementById('multi-use-count');
    let useCount = parseInt(countInput.value, 10);
    if (isNaN(useCount) || useCount < 1 || useCount > item.count) {
      document.getElementById('multi-use-error').textContent = 'Enter a valid number.';
      document.getElementById('multi-use-error').style.display = 'block';
      return;
    }
    let totalHeal = useCount * (item.heal || 0);
    let healed = Math.min(maxHeal - player.health, totalHeal);
    if (player.health >= maxHeal) {
      document.getElementById('multi-use-error').textContent = `${item.name} can't be used at full health.`;
      document.getElementById('multi-use-error').style.display = 'block';
      return;
    }
    player.health = Math.min(maxHeal, player.health + totalHeal);
    item.count -= useCount;
    if (item.count <= 0) itemsArr.splice(idx, 1);
    logMsg(`Used ${useCount} ${item.name}${useCount > 1 ? 's' : ''}, healed for ${healed}.`);
    updateAllStats();
    renderBagInv();
    popup.remove();
  };
  document.getElementById('multi-use-count').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('multi-use-confirm').click();
  });
}
function equipItem(idx) {
  let item = player.inventory[idx];
  let slot = item.type;
  if (!isEquipable(item)) {
    logMsg(`Cannot equip ${item.name}.`);
    return;
  }
  let old = player.equipment[slot];
  if (old) player.bag.push(old);
  player.equipment[slot] = item;
  player.inventory.splice(idx, 1);
  logMsg(`Equipped ${item.name}.`);
  updateAllStats();
  renderBagInv();
}
function removeItem(idx) {
  let itemsArr = baginvTab === "inventory" ? player.inventory : player.bag;
  let item = itemsArr.splice(idx, 1)[0];
  logMsg(`Removed ${item.name}.`);
  renderBagInv();
}
function equipBagItem(idx) {
  let item = player.bag[idx];
  let slot = item.type;
  let old = player.equipment[slot];
  if (old) player.bag.push(old);
  player.equipment[slot] = item;
  player.bag.splice(idx, 1);
  logMsg(`Equipped ${item.name}.`);
  updateAllStats();
  renderBagInv();
}
function getRandomEnemy() {
  let e = enemyPool[Math.floor(Math.random() * enemyPool.length)];
  return {
    name: e.name,
    health: e.maxHealth,
    maxHealth: e.maxHealth,
    minAttack: e.minAttack,
    maxAttack: e.maxAttack,
    xp: e.xp
  };
}
function showEnemy() {
  // Only show a normal enemy if not in unknown enemy mode
  if (window._unknownEnemyActive) return;
  currentEnemy = getRandomEnemy();
  inCombat = true;
  renderEnemyEncounter();
  logMsg(`A wild <b>${currentEnemy.name}</b> appears!`);
}
function renderEnemyEncounter() {
  const enemyDiv = document.getElementById('enemy-encounter');
  if (!currentEnemy) {
    enemyDiv.style.display = "none";
    return;
  }
  enemyDiv.style.display = "flex";
  const percent = Math.max(0, 100 * currentEnemy.health/currentEnemy.maxHealth);
  document.getElementById('enemy-hp-bar-inner').style.width = percent + "%";
  document.getElementById('enemy-hp-bar-text').textContent = `${currentEnemy.health}/${currentEnemy.maxHealth}`;
  const imageBox = document.getElementById('enemy-image');
  imageBox.innerHTML = `${currentEnemy.name}`;
  document.getElementById('enemy-name-label').textContent = currentEnemy.name;
}
function clearEnemy() {
  currentEnemy = null;
  inCombat = false;
  renderEnemyEncounter();
}
function showHitsplat(target, damage, isPlayer) {
  const hitsplat = document.createElement('div');
  hitsplat.className = `hitsplat ${isPlayer ? 'player' : 'enemy'}`;
  hitsplat.textContent = `-${damage}`;
  // Add color styling for hitsplat
  hitsplat.style.position = 'absolute';
  hitsplat.style.top = '10px';
  hitsplat.style.left = '50%';
  hitsplat.style.transform = 'translateX(-50%)';
  hitsplat.style.fontWeight = 'bold';
  hitsplat.style.fontSize = '1.5em';
  hitsplat.style.pointerEvents = 'none';
  hitsplat.style.zIndex = '100';
  hitsplat.style.padding = '2px 10px';
  hitsplat.style.borderRadius = '8px';
  hitsplat.style.boxShadow = '0 2px 10px #0007';
  hitsplat.style.background = isPlayer ? '#2196f3' : '#e53935';
  hitsplat.style.color = '#fff';
  hitsplat.style.opacity = '0.95';
  hitsplat.style.animation = 'hitsplatAnim 0.9s ease-out';
  // Add animation keyframes if not present
  if (!document.getElementById('hitsplat-anim-style')) {
    const style = document.createElement('style');
    style.id = 'hitsplat-anim-style';
    style.textContent = `
      @keyframes hitsplatAnim {
        0% { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
        60% { opacity: 1; transform: translateX(-50%) scale(1.2) translateY(-18px);}
        100% { opacity: 0; transform: translateX(-50%) scale(1) translateY(-32px);}
      }
    `;
    document.head.appendChild(style);
  }
  target.appendChild(hitsplat);
  setTimeout(() => {
    if (target.contains(hitsplat)) target.removeChild(hitsplat);
  }, 900);
}
window.attackEnemy = function() {
  if (!currentEnemy || !inCombat) {
    logMsg("No enemy to attack.");
    return;
  }

  // Debug 1-Hit Kill Sword logic (works for all enemies including Ancient Boss and forced encounters)
  if (
    player.equipment.weapon &&
    player.equipment.weapon.name === "Debug 1-Hit Sword"
  ) {
    let hit = currentEnemy.health;
    currentEnemy.health = 0;
    showHitsplat(document.getElementById('enemy-image'), hit, true); // Player attack: blue
    logMsg(`<span style="color:#ff4444;font-weight:bold;">You instantly killed the <b>${currentEnemy.name}</b>!</span>`);
    renderEnemyEncounter();
    let goldDrop = Math.floor(Math.random() * 51);
    player.gold += goldDrop;
    let randomItem = JSON.parse(JSON.stringify(items[Math.floor(Math.random() * items.length)]));
    addItem(randomItem);
    let goldMsg = goldDrop > 0 ? ` <span style="color:gold;">+${goldDrop} Gold</span>` : '';
    logMsg(`<span style="color:#90ee90"><b>You defeated the ${currentEnemy.name}!</b></span> +${currentEnemy.xp} XP${goldMsg} and found ${randomItem.name}`);
    player.experience += currentEnemy.xp;
    checkLevelUp();
    // Always trigger boss rewards if Ancient Boss is killed
    if (currentEnemy.name === "Ancient Boss" || currentEnemy.isBoss) {
      if (typeof giveAncientBossRewards === "function") giveAncientBossRewards();
      ancientBossActive = false;
    }
    clearEnemy();
    renderPlayerStats();
    return;
  }

  // No weapon equipped logic
  if (!player.equipment.weapon) {
    if (!window.noWeaponPopupShown) {
      showNoWeaponPopup();
      window.noWeaponPopupShown = true;
    }
    currentEnemy.health = Math.max(0, currentEnemy.health - 1);
    showHitsplat(document.getElementById('enemy-image'), 1, true);
    logMsg(`<span style="color:#ff4444;font-weight:bold;">You attack with your bare hands and deal <b>1</b> damage!</span>`);
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
      return;
    }
    setTimeout(()=>{ enemyAttack(); }, 700);
    return;
  }

  // Bow & arrows logic
  if (isEquippedBow()) {
    if (!hasEquippedArrows()) {
      if (!window.noArrowsPopupActive) showNoArrowsPopup();
      if (typeof autoAttackActive !== "undefined" && autoAttackActive) stopAutoAttack && stopAutoAttack();
      return;
    }
    player.equipment.arrows.count -= 1;
    logMsg(`<span style="color:#ffba3a;">Used 1 arrow. ${player.equipment.arrows.count > 0 ? `Arrows left: ${player.equipment.arrows.count}` : "No arrows left!"}</span>`);
    if (player.equipment.arrows.count <= 0) {
      logMsg(`<span style="color:#f44;font-weight:bold;">You have run out of arrows!</span>`);
      player.equipment.arrows = null;
    }
    updateAllStats();
    renderBagInv();
  }

  // Ancient Boss logic
  if (currentEnemy.isBoss) {
    let pAtk = (player.equipment.weapon ? player.equipment.weapon.attackPower||8 : 6)
      + (player.equipment.ring ? player.equipment.ring.attackPower||0 : 0);
    let hit = randomStat(30, 90);
    currentEnemy.health = Math.max(0, currentEnemy.health - hit);
    showHitsplat(document.getElementById('enemy-image'), hit, true);
    logMsg(`You hit the <b>${currentEnemy.name}</b> for <b>${hit}</b>!`);
    renderEnemyEncounter();
    if (currentEnemy.health <= 0) {
      player.experience += currentEnemy.xp;
      checkLevelUp();
      giveAncientBossRewards();
      ancientBossActive = false;
      ancientBossShopLocked = false;
      clearEnemy();
      renderPlayerStats();
      hideShopClosedOverlay && hideShopClosedOverlay();
      return;
    }
    setTimeout(()=>{ enemyAttack(); }, 700);
    return;
  }

  // Normal enemy attack with multiple styles based on enemy type
  let pAtk = (player.equipment.weapon ? player.equipment.weapon.attackPower || 8 : 6)
    + (player.equipment.ring ? player.equipment.ring.attackPower || 0 : 0);

  // Determine attack style based on enemy name/type
  let hit = 1;
  let attackStyle = "normal";
  if (currentEnemy.name) {
    const name = currentEnemy.name.toLowerCase();
    if (name.includes("fire") || name.includes("elemental")) {
      // Fire enemies: burn effect, extra damage
      hit = Math.max(1, Math.floor(pAtk + Math.random() * 10) + 8);
      attackStyle = "fire";
    } else if (name.includes("ice") || name.includes("frost")) {
      // Ice enemies: chance to freeze (skip next turn)
      hit = Math.max(1, Math.floor(pAtk + Math.random() * 7));
      attackStyle = "ice";
      if (Math.random() < 0.18) {
        logMsg(`<span style="color:#2196f3;font-weight:bold;">You freeze the ${currentEnemy.name}! Enemy skips next attack.</span>`);
        currentEnemy._skipNextAttack = true;
      }
    } else if (name.includes("vampire")) {
      // Vampire: lifesteal, heals enemy
      hit = Math.max(1, Math.floor(pAtk + Math.random() * 8));
      attackStyle = "vampire";
      let heal = Math.floor(hit * 0.5);
      currentEnemy.health = Math.min(currentEnemy.maxHealth, currentEnemy.health + heal);
      logMsg(`<span style="color:#e53935;">The ${currentEnemy.name} steals <b>${heal}</b> HP!</span>`);
    } else if (name.includes("golem") || name.includes("stone")) {
      // Golem: high defense, lower damage
      hit = Math.max(1, Math.floor(pAtk + Math.random() * 5));
      attackStyle = "golem";
    } else if (name.includes("assassin") || name.includes("shadow")) {
      // Assassin: chance for critical hit
      hit = Math.max(1, Math.floor(pAtk + Math.random() * 10));
      attackStyle = "assassin";
      if (Math.random() < 0.15) {
        hit *= 2;
        logMsg(`<span style="color:#ffd36b;font-weight:bold;">Critical hit!</span>`);
      }
    } else if (name.includes("dragon")) {
      // Dragon: fire breath, high damage
      hit = Math.max(1, Math.floor(pAtk + Math.random() * 15) + 10);
      attackStyle = "dragon";
    } else if (name.includes("lich")) {
      // Lich: magic attack, ignore some defense
      hit = Math.max(1, Math.floor(pAtk + Math.random() * 12) + 5);
      attackStyle = "lich";
    } else if (name.includes("troll")) {
      // Troll: chance to stun player
      hit = Math.max(1, Math.floor(pAtk + Math.random() * 9));
      attackStyle = "troll";
      if (Math.random() < 0.12) {
        logMsg(`<span style="color:#ff4444;">The ${currentEnemy.name} stuns you! You lose your next turn.</span>`);
        player._skipNextTurn = true;
      }
    } else {
      // Default style
      hit = Math.max(1, Math.floor(pAtk + Math.random() * 10));
    }
  }

  // Show hitsplat with blue color for player attack
  const enemyImageDiv = document.getElementById('enemy-image');
  if (enemyImageDiv) {
    const hitsplat = document.createElement('div');
    hitsplat.className = 'hitsplat player';
    hitsplat.textContent = `-${hit}`;
    hitsplat.style.background = "#2196f3";
    hitsplat.style.color = "#fff";
    hitsplat.style.position = 'absolute';
    hitsplat.style.top = '10px';
    hitsplat.style.left = '50%';
    hitsplat.style.transform = 'translateX(-50%)';
    hitsplat.style.fontWeight = 'bold';
    hitsplat.style.fontSize = '1.5em';
    hitsplat.style.pointerEvents = 'none';
    hitsplat.style.zIndex = '100';
    hitsplat.style.padding = '2px 10px';
    hitsplat.style.borderRadius = '8px';
    hitsplat.style.boxShadow = '0 2px 10px #0007';
    hitsplat.style.opacity = '0.95';
    hitsplat.style.animation = 'hitsplatAnim 0.9s ease-out';
    enemyImageDiv.appendChild(hitsplat);
    setTimeout(() => {
      if (enemyImageDiv.contains(hitsplat)) enemyImageDiv.removeChild(hitsplat);
    }, 900);
  }

  currentEnemy.health = Math.max(0, currentEnemy.health - hit);
  logMsg(`You hit the <b>${currentEnemy.name}</b> for <b>${hit}</b>!`);
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
    return;
  }
  setTimeout(() => { enemyAttack(); }, 700);

  // Enemy attack function
  function enemyAttack() {
    if (!currentEnemy || !inCombat) return;
    // Skip attack if frozen or stunned
    if (currentEnemy._skipNextAttack) {
      logMsg(`<span style="color:#2196f3;font-weight:bold;">${currentEnemy.name} is frozen and skips its attack!</span>`);
      currentEnemy._skipNextAttack = false;
      return;
    }
    if (player._skipNextTurn) {
      logMsg(`<span style="color:#ff4444;">You are stunned and lose your turn!</span>`);
      player._skipNextTurn = false;
      return;
    }
    // Calculate enemy damage
    let minAtk = currentEnemy.minAttack || 5;
    let maxAtk = currentEnemy.maxAttack || 10;
    let hit = Math.max(1, Math.floor(Math.random() * (maxAtk - minAtk + 1)) + minAtk - getTotalDefense());
    if (hit < 1) hit = 1;
    player.health = Math.max(0, player.health - hit);
    // Show hitsplat with red color for enemy attack
    const enemyImageDiv = document.getElementById('enemy-image');
    if (enemyImageDiv) {
      const hitsplat = document.createElement('div');
      hitsplat.className = 'hitsplat enemy';
      hitsplat.textContent = `-${hit}`;
      hitsplat.style.background = "#e53935";
      hitsplat.style.color = "#fff";
      hitsplat.style.position = 'absolute';
      hitsplat.style.top = '10px';
      hitsplat.style.left = '50%';
      hitsplat.style.transform = 'translateX(-50%)';
      hitsplat.style.fontWeight = 'bold';
      hitsplat.style.fontSize = '1.5em';
      hitsplat.style.pointerEvents = 'none';
      hitsplat.style.zIndex = '100';
      hitsplat.style.padding = '2px 10px';
      hitsplat.style.borderRadius = '8px';
      hitsplat.style.boxShadow = '0 2px 10px #0007';
      hitsplat.style.opacity = '0.95';
      hitsplat.style.animation = 'hitsplatAnim 0.9s ease-out';
      enemyImageDiv.appendChild(hitsplat);
      setTimeout(() => {
        if (enemyImageDiv.contains(hitsplat)) enemyImageDiv.removeChild(hitsplat);
      }, 900);
    }
    logMsg(`<span style="color:#e53935;">${currentEnemy.name} attacks you for <b>${hit}</b> damage!</span>`);
    renderPlayerStats();
    if (player.health <= 0) {
      logMsg(`<span style="color:#f44;font-weight:bold;">You died! Respawning at town...</span>`);
      respawnPlayer();
      clearEnemy();
      return;
    }
  }
}

function openChest() {
  chestOpen = true;
  let reward = Math.floor(Math.random()*500)+1;
  chestReward = reward;
  player.gold += reward;
  document.getElementById('chest-reward').textContent = `You found ${reward} gold!`;
  document.getElementById('chest-encounter').style.display = "flex";
  // Remove chest from map
  mapData[playerPosition.y][playerPosition.x] = { type: "discovered", name: "" };
  renderMap();
  renderPlayerStats();
}
function closeChest() {
  chestOpen = false;
  document.getElementById('chest-encounter').style.display = "none";
}
function openBank() {
  document.getElementById('bank-modal-bg').style.display = 'flex';
  renderBank();
}
function closeBank() {
  document.getElementById('bank-modal-bg').style.display = 'none';
}
function renderBank() {
  const bankList = document.getElementById('bank-list');
  const invList = document.getElementById('bank-inv-list');
  bankList.innerHTML = "";
  invList.innerHTML = "";
  if (!player.bank.length) bankList.innerHTML = "<div id='bank-empty-msg'>No items in bank.</div>";
  player.bank.forEach((item, idx) => {
    bankList.innerHTML += `
      <div class="bank-item-card">
        <span>${item.name}</span>
        <button class="bank-action-btn" onclick="removeFromBank(${idx})">Withdraw</button>
      </div>
    `;
  });
  let invItems = [...player.inventory, ...player.bag];
  if (!invItems.length) invList.innerHTML = "<div id='bank-empty-msg'>No items to deposit.</div>";
  invItems.forEach((item, idx) => {
    invList.innerHTML += `
      <div class="bank-item-card">
        <span>${item.name}</span>
        <button class="bank-action-btn" onclick="addToBank(${idx})">Deposit</button>
      </div>
    `;
  });
  updateBankGoldLabels();
}
function addToBank(idx) {
  let itemsArr = [...player.inventory, ...player.bag];
  let item = itemsArr[idx];
  let invIdx = player.inventory.findIndex(i => i === item);
  if (invIdx !== -1) player.inventory.splice(invIdx, 1);
  else player.bag.splice(player.bag.findIndex(i => i === item), 1);
  player.bank.push(item);
  logMsg(`Deposited ${item.name} to the bank.`);
  renderBagInv(); renderBank();
}
function removeFromBank(idx) {
  let item = player.bank.splice(idx, 1)[0];
  if (isEquipable(item)) player.bag.push(item);
  else player.inventory.push(item);
  logMsg(`Withdrew ${item.name} from the bank.`);
  renderBagInv(); renderBank();
}
function explore() {
  // Deprecated, use startExplore
  startExplore();
}
function visitShop() { logMsg("Opening shop... (implement backend)"); }
function showCommands() {
  logMsg(`Commands: /explore, /attack, /shop, /bank, /status, /inventory, /bag, /buy, /sell, /equipment, /unequip`);
}
function searchItem() {
  searchTerm = document.getElementById('item-search').value.toLowerCase();
  renderBagInv();
}
function logMsg(msg) {
  let logDiv = document.getElementById('game-log');
  logDiv.innerHTML += `<div>${msg}</div>`;
  logDiv.scrollTop = logDiv.scrollHeight;
}
function checkLevelUp() {
  let nextLvXp = 60 + (player.level-1)*45;
  if (player.experience >= nextLvXp) {
    player.level += 1;
    player.maxHealth += 18;
    player.health = player.maxHealth;
    player.experience -= nextLvXp;
    logMsg(`<span style="color:gold;font-weight:bold;">You leveled up to Level ${player.level}! Max HP increased.</span>`);
    updateAllStats();
  }
}
function respawnPlayer() {
  player.health = player.maxHealth;
  playerPosition = { x: Math.floor(mapSize/2), y: Math.floor(mapSize/2) };
  discovered[playerPosition.y][playerPosition.x] = true;
  renderPlayerStats();
  renderMap();
}
function renderDerivedStats() {
  let atk = getTotalAttack();
  let def = getTotalDefense();
  let hp = getTotalMaxHealth();
  let stats = [
    `<li><span class="derived-label">Attack:</span> ${atk}</li>`,
    `<li><span class="derived-label">Defense:</span> ${def}</li>`,
    `<li><span class="derived-label">Max Health:</span> ${hp}</li>`
  ];
  document.getElementById('derived-stats-list').innerHTML = stats.join('');
}
// --- TOWN POPUP LOGIC ---
if (!document.getElementById('town-popup')) {
  const townPopup = document.createElement('div');
  townPopup.id = 'town-popup';
  townPopup.style = 'display:none;position:fixed;z-index:4000;top:0;left:0;width:100vw;height:100vh;background:#191a1e99;align-items:center;justify-content:center;';
  townPopup.innerHTML = `
    <div style="background:#23252a;padding:32px 38px 24px 38px;border-radius:18px;box-shadow:0 2px 24px #000a;display:flex;flex-direction:column;align-items:center;">
      <div id="town-popup-title" style="color:#ffba3a;font-size:1.3em;margin-bottom:18px;"></div>
      <div style="margin-bottom:18px;">Do you wish to visit this town?</div>
      <div style="display:flex;gap:18px;">
        <button id="town-popup-yes" style="font-size:1.1em;font-weight:bold;background:#ffba3a;color:#23252a;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">Yes</button>
        <button id="town-popup-no" style="font-size:1.1em;font-weight:bold;background:#35373e;color:#ffba3a;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">No</button>
      </div>
    </div>
  `;
  document.body.appendChild(townPopup);
}
if (!document.getElementById('special-seller-popup')) {
  const sellerPopup = document.createElement('div');
  sellerPopup.id = 'special-seller-popup';
  sellerPopup.style = 'display:none;position:fixed;z-index:4100;top:0;left:0;width:100vw;height:100vh;background:#191a1e99;align-items:center;justify-content:center;';
  sellerPopup.innerHTML = `
    <div style="background:#23252a;padding:32px 38px 24px 38px;border-radius:18px;box-shadow:0 2px 24px #000a;display:flex;flex-direction:column;align-items:center;min-width:340px;">
      <div style="color:#ffba3a;font-size:1.3em;margin-bottom:18px;">Special Seller</div>
      <div style="margin-bottom:18px;">Welcome, traveler! Here are my rare wares:</div>
      <div id="special-seller-items" style="margin-bottom:18px;width:100%;"></div>
      <button onclick="closeSpecialSeller()" style="font-size:1.1em;font-weight:bold;background:#35373e;color:#ffba3a;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">Close</button>
    </div>
  `;
  document.body.appendChild(sellerPopup);


// Ensure showSpecialSeller is globally available and generates items and buy buttons

// Add tooltip CSS if not present
if (!document.getElementById('special-seller-tooltip-style')) {
  const style = document.createElement('style');
  style.id = 'special-seller-tooltip-style';
  style.textContent = `
    .special-seller-item { position: relative; }
    .special-seller-tooltip {
      pointer-events: none;
      opacity: 0.98;
      transition: opacity 0.12s;
    }
  `;
  document.head.appendChild(style);
}
}


let lastTownVisited = null;
function showTownPopup(townName) {
  lastTownVisited = townName;
  document.getElementById('town-popup-title').textContent = `You arrived at ${townName}!`;
  document.getElementById('town-popup').style.display = 'flex';
}
document.getElementById('town-popup-yes').onclick = function() {
  document.getElementById('town-popup').style.display = 'none';
  if (!visitedTowns[lastTownVisited]) {
    showSpecialSeller();
    visitedTowns[lastTownVisited] = true;
    renderMap();
  }
};
document.getElementById('town-popup-no').onclick = function() {
  document.getElementById('town-popup').style.display = 'none';
};
  // Add emojis for area names
  const areaEmojis = {
    Plains: "🌾",
    Forest: "🌲",
    Mountain: "⛰️",
    River: "🌊",
    Ruins: "🏚️",
    Cave: "🕳️",
    Desert: "🏜️",
    Swamp: "🦆",
    Valley: "🏞️",
    Hills: "🌄"
  };

  // Patch renderMap to show emoji for area cells
  const origRenderMapWithEmoji = renderMap;
  renderMap = function() {
    const map = document.getElementById('game-map');
    map.innerHTML = "";
    for (let y = 0; y < mapSize; ++y) {
      for (let x = 0; x < mapSize; ++x) {
        let cellClass = "map-cell";
        let label = "";
        let cell = mapData[y][x];
        // Player
        if (x === playerPosition.x && y === playerPosition.y) {
          cellClass += " player";
        }
        // Central Town
        if (cell.type === "central-town") {
          cellClass += " central-town";
          label = "C";
        }
        // Other Towns
        else if (cell.type === "town") {
          cellClass += " town";
          if (visitedTowns[cell.name]) {
            label = "✔";
          } else {
            label = "T";
          }
        }
        // Chest
        else if (cell.type === "chest") {
          cellClass += " chest";
            label = "🪙";
        }
        // Area
        else if (cell.type === "area") {
          if (discovered[y][x]) {
            cellClass += " discovered";
            label = areaEmojis[cell.name] || cell.name[0];
          } else {
            cellClass += " area";
            label = areaEmojis[cell.name] || cell.name[0];
          }
        }
        // Discovered
        else if (cell.type === "discovered") {
          cellClass += " discovered";
          label = "";
        }
        // Undiscovered
        if (!discovered[y][x] && cell.type !== "central-town" && cell.type !== "town" && cell.type !== "chest") {
          cellClass += " undiscovered";
          label = "";
        }
        // Show player icon
        if (x === playerPosition.x && y === playerPosition.y) {
          label = "🧑";
        }
        map.innerHTML += `<div class="${cellClass}" data-x="${x}" data-y="${y}" onclick="mapCellClick(${x},${y})" title="${cell.type === 'area' || cell.type === 'discovered' ? cell.name : cell.name || ''}">${label}</div>`;
      }
    }
    let areaLabel = "";
    let cell = mapData[playerPosition.y][playerPosition.x];
    if (cell.type === "central-town") areaLabel = "Area: Central Town";
    else if (cell.type === "town") areaLabel = "Area: " + cell.name;
    else if (cell.type === "chest") areaLabel = "Area: Chest";
    else if (!discovered[playerPosition.y][playerPosition.x]) areaLabel = "Area: Not Discovered";
    else areaLabel = "Area: " + (cell.name || "Discovered");
    document.getElementById("map-area-label").textContent = areaLabel;
  };

function refreshShopItems() {
  // Helper to generate a random item by type
  function generateItem(type) {
    switch (type) {
      case "armor":
        {
          let def = Math.floor(Math.random() * 106) + 20;
          let price = Math.floor(50 + (def - 20) * 8);
          return {
            name: `Armor`,
            type: 'armor',
            defense: def,
            price: price,
            description: `Protective armor.`,
            _shopStat: def // for tooltip
          };
        }
      case "weapon":
        {
          let atk = Math.floor(Math.random() * 91) + 10;
          let price = Math.floor(30 + (atk - 10) * 5);
          return {
            name: `Weapon`,
            type: 'weapon',
            attackPower: atk,
            price: price,
            description: `A sharp weapon.`,
            _shopStat: atk
          };
        }
      case "potion":
        {
          let heal = Math.floor(Math.random() * 81) + 20;
          let price = Math.floor(10 + (heal - 20) * 3);
          return {
            name: `Potion`,
            type: 'potion',
            heal: heal,
            price: price,
            description: `Heals for ${heal} HP.`,
            _shopStat: heal
          };
        }
      case "helmet":
        {
          let def = Math.floor(Math.random() * 41) + 10;
          let hp = Math.floor(Math.random() * 61) + 20;
          let price = Math.floor(40 + def * 6 + hp * 2);
          return {
            name: `Helmet`,
            type: 'helmet',
            defense: def,
            health: hp,
            price: price,
            description: `Sturdy helmet.`,
            _shopStat: {def, hp}
          };
        }
      case "boots":
        {
          let def = Math.floor(Math.random() * 31) + 10;
          let hp = Math.floor(Math.random() * 41) + 10;
          let price = Math.floor(30 + def * 5 + hp * 2);
          return {
            name: `Boots`,
            type: 'boots',
            defense: def,
            health: hp,
            price: price,
            description: `Protective boots.`,
            _shopStat: {def, hp}
          };
        }
      case "shield":
        {
          let def = Math.floor(Math.random() * 41) + 20;
          let price = Math.floor(50 + def * 7);
          return {
            name: `Shield`,
            type: 'shield',
            defense: def,
            price: price,
            description: `Sturdy shield.`,
            _shopStat: def
          };
        }
      case "cloak":
        {
          let def = Math.floor(Math.random() * 26) + 15;
          let hp = Math.floor(Math.random() * 41) + 10;
          let price = Math.floor(60 + def * 5 + hp * 2);
          return {
            name: `Cloak`,
            type: 'cloak',
            defense: def,
            health: hp,
            price: price,
            description: `Mystical cloak.`,
            _shopStat: {def, hp}
          };
        }
      case "amulet":
        {
          let def = Math.floor(Math.random() * 16) + 5;
          let price = Math.floor(100 + def * 12);
          return {
            name: `Amulet`,
            type: 'amulet',
            defense: def,
            price: price,
            description: `Mystic amulet.`,
            _shopStat: def
          };
        }
      case "ring":
        {
          let atk = Math.floor(Math.random() * 6) + 2;
          let hp = Math.floor(Math.random() * 51) + 10;
          let price = Math.floor(120 + atk * 20 + hp * 3);
          return {
            name: `Ring`,
            type: 'ring',
            attackPower: atk,
            health: hp,
            price: price,
            description: `Magical ring.`,
            _shopStat: {atk, hp}
          };
        }
      case "gloves":
        {
          let def = Math.floor(Math.random() * 21) + 10;
          let hp = Math.floor(Math.random() * 31) + 10;
          let price = Math.floor(25 + def * 4 + hp * 2);
          return {
            name: `Gloves`,
            type: 'gloves',
            defense: def,
            health: hp,
            price: price,
            description: `Strong gloves.`,
            _shopStat: {def, hp}
          };
        }
      case "full-armor-set":
        {
          let setDef = Math.floor(Math.random() * 101) + 100;
          let setHp = Math.floor(Math.random() * 201) + 200;
          let price = Math.floor(1000 + setDef * 15 + setHp * 5);
          return {
            name: `Full Armor Set`,
            type: 'armor-set',
            defense: setDef,
            health: setHp,
            price: Math.min(price, 5000),
            description: `Contains Armor, Helmet, Boots, Shield, Cloak, Gloves.`,
            _shopStat: {setDef, setHp}
          };
        }
      case "arrows":
        return {
          name: 'Arrows',
          type: 'arrows',
          count: 100,
          price: 15,
          description: 'A pack of 100 arrows.',
          _shopStat: 100
        };
      case "bow":
        {
          let batk = Math.floor(Math.random() * 131) + 20;
          let price = Math.floor(60 + (batk - 20) * 3.5);
          return {
            name: `Bow`,
            type: 'weapon',
            attackPower: batk,
            isBow: true,
            price: price,
            description: `A powerful bow.`,
            _shopStat: batk
          };
        }
      default:
        return null;
    }
  }

  // List of types to pick from for variety
  const types = [
    "armor", "weapon", "potion", "helmet", "boots", "shield", "cloak", "amulet", "ring", "gloves", "full-armor-set", "arrows", "bow"
  ];

  // Shuffle and pick 12 types for shop
  let shopTypes = types.slice();
  let shopItems = [];
  while (shopItems.length < 12) {
    let t = shopTypes[Math.floor(Math.random() * shopTypes.length)];
    let item = generateItem(t);
    if (item) shopItems.push(item);
    // Remove type if already picked to avoid duplicates, except for potions/arrows
    if (!["potion", "arrows"].includes(t)) {
      shopTypes = shopTypes.filter(x => x !== t);
    }
    if (shopTypes.length === 0) shopTypes = types.slice();
  }

  window._shopItems = shopItems;
  renderShopItems();
}

// Patch buyShopItem to replace bought item with a new random item of same type
const origBuyShopItem = buyShopItem;
buyShopItem = function(idx) {
  let item = window._shopItems[idx];
  if (player.gold < item.price) {
    logMsg('Not enough gold!');
    return;
  }
  player.gold -= item.price;
  // If buying a full armor set, add all set items
  if (item.type === 'armor-set') {
    let baseDef = Math.floor(item.defense / 6);
    let baseHp = Math.floor(item.health / 6);
    let setItems = [
      { name: 'Set Armor', type: 'armor', defense: baseDef, health: baseHp, price: 0, description: 'Part of full set.' },
      { name: 'Set Helmet', type: 'helmet', defense: baseDef, health: baseHp, price: 0, description: 'Part of full set.' },
      { name: 'Set Gloves', type: 'gloves', defense: baseDef, health: baseHp, price: 0, description: 'Part of full set.' },
      { name: 'Set Boots', type: 'boots', defense: baseDef, health: baseHp, price: 0, description: 'Part of full set.' },
      { name: 'Set Cloak', type: 'cloak', defense: baseDef, health: baseHp, price: 0, description: 'Part of full set.' },
      { name: 'Set Shield', type: 'shield', defense: baseDef, price: 0, description: 'Part of full set.' }
    ];
    setItems.forEach(si => addItem(JSON.parse(JSON.stringify(si))));
    logMsg(`Bought Full Armor Set for ${item.price} gold from the Shop. All set items added!`);
  } else {
    addItem(JSON.parse(JSON.stringify(item)));
    logMsg(`Bought ${item.name} for ${item.price} gold from the Shop.`);
  }
  renderPlayerStats();

  // Replace bought item with a new random item of same type
  function generateItem(type) {
    // (same as above, but you can move the function outside if you want)
    switch (type) {
      case "armor": { let def = Math.floor(Math.random() * 106) + 20; let price = Math.floor(50 + (def - 20) * 8); return { name: `Armor`, type: 'armor', defense: def, price: price, description: `Protective armor.`, _shopStat: def }; }
      case "weapon": { let atk = Math.floor(Math.random() * 91) + 10; let price = Math.floor(30 + (atk - 10) * 5); return { name: `Weapon`, type: 'weapon', attackPower: atk, price: price, description: `A sharp weapon.`, _shopStat: atk }; }
      case "potion": { let heal = Math.floor(Math.random() * 81) + 20; let price = Math.floor(10 + (heal - 20) * 3); return { name: `Potion`, type: 'potion', heal: heal, price: price, description: `Heals for ${heal} HP.`, _shopStat: heal }; }
      case "helmet": { let def = Math.floor(Math.random() * 41) + 10; let hp = Math.floor(Math.random() * 61) + 20; let price = Math.floor(40 + def * 6 + hp * 2); return { name: `Helmet`, type: 'helmet', defense: def, health: hp, price: price, description: `Sturdy helmet.`, _shopStat: {def, hp} }; }
      case "boots": { let def = Math.floor(Math.random() * 31) + 10; let hp = Math.floor(Math.random() * 41) + 10; let price = Math.floor(30 + def * 5 + hp * 2); return { name: `Boots`, type: 'boots', defense: def, health: hp, price: price, description: `Protective boots.`, _shopStat: {def, hp} }; }
      case "shield": { let def = Math.floor(Math.random() * 41) + 20; let price = Math.floor(50 + def * 7); return { name: `Shield`, type: 'shield', defense: def, price: price, description: `Sturdy shield.`, _shopStat: def }; }
      case "cloak": { let def = Math.floor(Math.random() * 26) + 15; let hp = Math.floor(Math.random() * 41) + 10; let price = Math.floor(60 + def * 5 + hp * 2); return { name: `Cloak`, type: 'cloak', defense: def, health: hp, price: price, description: `Mystical cloak.`, _shopStat: {def, hp} }; }
      case "amulet": { let def = Math.floor(Math.random() * 16) + 5; let price = Math.floor(100 + def * 12); return { name: `Amulet`, type: 'amulet', defense: def, price: price, description: `Mystic amulet.`, _shopStat: def }; }
      case "ring": { let atk = Math.floor(Math.random() * 6) + 2; let hp = Math.floor(Math.random() * 51) + 10; let price = Math.floor(120 + atk * 20 + hp * 3); return { name: `Ring`, type: 'ring', attackPower: atk, health: hp, price: price, description: `Magical ring.`, _shopStat: {atk, hp} }; }
      case "gloves": { let def = Math.floor(Math.random() * 21) + 10; let hp = Math.floor(Math.random() * 31) + 10; let price = Math.floor(25 + def * 4 + hp * 2); return { name: `Gloves`, type: 'gloves', defense: def, health: hp, price: price, description: `Strong gloves.`, _shopStat: {def, hp} }; }
      case "full-armor-set": { let setDef = Math.floor(Math.random() * 101) + 100; let setHp = Math.floor(Math.random() * 201) + 200; let price = Math.floor(1000 + setDef * 15 + setHp * 5); return { name: `Full Armor Set`, type: 'armor-set', defense: setDef, health: setHp, price: Math.min(price, 5000), description: `Contains Armor, Helmet, Boots, Shield, Cloak, Gloves.`, _shopStat: {setDef, setHp} }; }
      case "arrows": return { name: 'Arrows', type: 'arrows', count: 100, price: 15, description: 'A pack of 100 arrows.', _shopStat: 100 };
      case "bow": { let batk = Math.floor(Math.random() * 131) + 20; let price = Math.floor(60 + (batk - 20) * 3.5); return { name: `Bow`, type: 'weapon', attackPower: batk, isBow: true, price: price, description: `A powerful bow.`, _shopStat: batk }; }
      default: return null;
    }
  }
  window._shopItems[idx] = generateItem(item.type);
  renderShopItems();
};
function renderShopItems() {
  const shopDiv = document.getElementById('shop-items-list');
  if (!window._shopItems) return;
  shopDiv.innerHTML = "";
  window._shopItems.forEach((item, idx) => {
    shopDiv.innerHTML += `
      <div class="shop-item-card" style="background:#18191c;border-radius:8px;padding:10px 14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;position:relative;cursor:pointer;">
        <b>${item.name}</b>
        <div>
          <span style="color:gold;font-weight:bold;">${item.price} Gold</span>
          <button onclick="buyShopItem(${idx})" style="margin-left:10px;background:#ffba3a;color:#23252a;border:none;border-radius:6px;padding:6px 18px;font-weight:bold;cursor:pointer;">Buy</button>
        </div>
        <div class="shop-item-tooltip" style="display:none;position:absolute;left:110%;top:50%;transform:translateY(-50%);background:#18191c;color:#eee;padding:7px 13px;border-radius:8px;border:1px solid #444;white-space:nowrap;font-size:0.98em;box-shadow:0 2px 10px #0007;z-index:20;min-width:160px;">
          ${getShopItemTooltip(item)}
        </div>
      </div>
    `;
  });
  function getShopItemTooltip(item) {
    let lines = [];
    // First line: name only (no stats)
    lines.push(`<b>${item.name}</b>`);
    // Second line: description
    if (item.description) lines.push(`<span style="color:#aaa;">${item.description}</span>`);
    // Stat line(s)
    if (item.type === "armor" && typeof item.defense === "number") lines.push(`DEF: <b>+${item.defense}</b>`);
    if (item.type === "weapon" && typeof item.attackPower === "number") lines.push(`ATK: <b>+${item.attackPower}</b>`);
    if (item.type === "potion" && typeof item.heal === "number") lines.push(`Heals: <b>+${item.heal}</b>`);
    if (item.type === "helmet" && item.defense && item.health) lines.push(`DEF: <b>+${item.defense}</b>, HP: <b>+${item.health}</b>`);
    if (item.type === "boots" && item.defense && item.health) lines.push(`DEF: <b>+${item.defense}</b>, HP: <b>+${item.health}</b>`);
    if (item.type === "shield" && item.defense) lines.push(`DEF: <b>+${item.defense}</b>`);
    if (item.type === "cloak" && item.defense && item.health) lines.push(`DEF: <b>+${item.defense}</b>, HP: <b>+${item.health}</b>`);
    if (item.type === "amulet" && item.defense) lines.push(`DEF: <b>+${item.defense}</b>`);
    if (item.type === "ring" && item.attackPower && item.health) lines.push(`ATK: <b>+${item.attackPower}</b>, HP: <b>+${item.health}</b>`);
    if (item.type === "gloves" && item.defense && item.health) lines.push(`DEF: <b>+${item.defense}</b>, HP: <b>+${item.health}</b>`);
    if (item.type === "armor-set" && item.defense && item.health) lines.push(`DEF: <b>+${item.defense}</b>, HP: <b>+${item.health}</b>`);
    if (item.type === "arrows" && item.count) lines.push(`Arrows: <b>x${item.count}</b>`);
    if (item.type === "bow" && item.attackPower) lines.push(`ATK: <b>+${item.attackPower}</b>`);
    // Type line
    if (item.type) lines.push(`<span style="color:#ffba3a;">Type: ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>`);
    return lines.join('<br>');
  }

  // Add hover logic for tooltips
  const cards = shopDiv.querySelectorAll('.shop-item-card');
  cards.forEach(card => {
    const tip = card.querySelector('.shop-item-tooltip');
    card.onmouseenter = () => { if (tip) tip.style.display = 'block'; };
    card.onmouseleave = () => { if (tip) tip.style.display = 'none'; };
    card.onmousemove = (e) => {
      if (tip) {
        tip.style.left = (e.offsetX + 30) + 'px';
        tip.style.top = (e.offsetY - 10) + 'px';
      }
    };
  });
}

// --- PATCH: Remove ( ... ) from item names only for display, not for storage ---
// Do NOT modify the item.name before storing; instead, only strip stats in the UI display code.
function buyShopItem(idx) {
  let item = window._shopItems[idx];
  if (player.gold < item.price) {
    logMsg('Not enough gold!');
    return;
  }
  player.gold -= item.price;
  // If buying a full armor set, add all set items
  if (item.type === 'armor-set') {
    let baseDef = Math.floor(item.defense / 6);
    let baseHp = Math.floor(item.health / 6);
    let setItems = [
      { name: 'Set Armor', type: 'armor', defense: baseDef, health: baseHp, price: 0, description: 'Part of full set.' },
      { name: 'Set Helmet', type: 'helmet', defense: baseDef, health: baseHp, price: 0, description: 'Part of full set.' },
      { name: 'Set Gloves', type: 'gloves', defense: baseDef, health: baseHp, price: 0, description: 'Part of full set.' },
      { name: 'Set Boots', type: 'boots', defense: baseDef, health: baseHp, price: 0, description: 'Part of full set.' },
      { name: 'Set Cloak', type: 'cloak', defense: baseDef, health: baseHp, price: 0, description: 'Part of full set.' },
      { name: 'Set Ring', type: 'ring', attackPower: 3, health: baseHp, price: 0, description: 'Part of full set.' }
    ];
    setItems.forEach(si => addItem(JSON.parse(JSON.stringify(si))));
    logMsg(`Bought Full Armor Set for ${item.price} gold from the Shop. All set items added!`);
  } else {
    addItem(JSON.parse(JSON.stringify(item)));
    logMsg(`Bought ${item.name} for ${item.price} gold from the Shop.`);
  }
  renderPlayerStats();
  renderShopItems();
}
document.getElementById('refresh-shop-btn').onclick = refreshShopItems;
refreshShopItems();

// --- SPECIAL SELLER: Only once per town, mark with checkmark ---
let visitedTowns = {};
const origShowTownPopup = showTownPopup;
showTownPopup = function(townName) {
  lastTownVisited = townName;
  document.getElementById('town-popup-title').textContent = `You arrived at ${townName}!`;
  document.getElementById('town-popup').style.display = 'flex';
};
document.getElementById('town-popup-yes').onclick = function() {
  document.getElementById('town-popup').style.display = 'none';
  if (!visitedTowns[lastTownVisited]) {
    showSpecialSeller();
    visitedTowns[lastTownVisited] = true;
    renderMap();
  }
};
document.getElementById('town-popup-no').onclick = function() {
  document.getElementById('town-popup').style.display = 'none';
};
// --- START GAME BUTTON LOGIC ---
const usernameSubmitBtnOld = document.getElementById('username-submit');
if (usernameSubmitBtnOld) {
    usernameSubmitBtnOld.onclick = function() {
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

  // Initialize map and player position before rendering
  initMap();
  playerPosition = { x: Math.floor(mapSize/2), y: Math.floor(mapSize/2) };
  discovered[playerPosition.y][playerPosition.x] = true;

  renderPlayerStats();
  renderDerivedStats();
  renderEquipment();
  renderBagInv();
  renderMap();

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
function showSpecialSeller() {
  // Generate 6 random high-stat items under 500 gold
  let specialItems = [];
  for (let i = 0; i < 6; ++i) {
    let type = ["armor", "weapon", "potion", "helmet", "boots", "shield", "cloak", "amulet", "ring", "gloves"][Math.floor(Math.random()*10)];
    let item = { price: Math.floor(Math.random()*200)+250 };
    if (type === "armor") {
      item.name = "Special Armor";
      item.type = "armor";
      item.defense = Math.floor(Math.random()*30)+50;
      item.description = "A rare armor with high defense.";
    } else if (type === "weapon") {
      item.name = "Special Sword";
      item.type = "weapon";
      item.attackPower = Math.floor(Math.random()*20)+45;
      item.description = "A powerful sword with high attack.";
    } else if (type === "potion") {
      item.name = "Mega Potion";
      item.type = "potion";
      item.heal = Math.floor(Math.random()*50)+100;
      item.description = "Heals a large amount of health.";
    } else if (type === "helmet") {
      item.name = "Special Helmet";
      item.type = "helmet";
      item.defense = Math.floor(Math.random()*15)+25;
      item.health = Math.floor(Math.random()*30)+25;
      item.description = "A sturdy helmet for protection.";
    } else if (type === "boots") {
      item.name = "Special Boots";
      item.type = "boots";
      item.defense = Math.floor(Math.random()*10)+20;
      item.health = Math.floor(Math.random()*20)+20;
      item.description = "Boots that boost defense and health.";
    } else if (type === "shield") {
      item.name = "Special Shield";
      item.type = "shield";
      item.defense = Math.floor(Math.random()*20)+30;
      item.description = "A shield with excellent defense.";
    } else if (type === "cloak") {
      item.name = "Special Cloak";
      item.type = "cloak";
      item.defense = Math.floor(Math.random()*15)+30;
      item.health = Math.floor(Math.random()*20)+20;
      item.description = "A mystical cloak for defense and health.";
    } else if (type === "amulet") {
      item.name = "Special Amulet";
      item.type = "amulet";
      item.defense = Math.floor(Math.random()*10)+15;
      item.description = "A magical amulet for extra defense.";
    } else if (type === "ring") {
      item.name = "Special Ring";
      item.type = "ring";
      item.attackPower = Math.floor(Math.random()*5)+5;
      item.health = Math.floor(Math.random()*20)+10;
      item.description = "A ring that boosts attack and health.";
    } else if (type === "gloves") {
      item.name = "Special Gloves";
      item.type = "gloves";
      item.defense = Math.floor(Math.random()*10)+15;
      item.health = Math.floor(Math.random()*20)+10;
      item.description = "Gloves that increase defense and health.";
    }
    item.price = Math.min(item.price, 499);
    item._noReroll = true; // Prevent stat reroll on addItem
    specialItems.push(item);
  }
  let html = '';
  specialItems.forEach((item, idx) => {
    // Tooltip content
    let tooltip = `<b>${item.name}</b>`;
    if (item.description) tooltip += `<br><span style='color:#aaa;'>${item.description}</span>`;
    if (item.attackPower) tooltip += `<br>ATK: <b>+${item.attackPower}</b>`;
    if (item.defense) tooltip += `<br>DEF: <b>+${item.defense}</b>`;
    if (item.heal) tooltip += `<br>Heals: <b>+${item.heal}</b>`;
    if (item.health) tooltip += `<br>HP: <b>+${item.health}</b>`;
    if (item.type) tooltip += `<br><span style="color:#ffba3a;">Type: ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>`;
    html += `
      <div class="special-seller-item" style="background:#18191c;border-radius:8px;padding:10px 14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;position:relative;cursor:pointer;">
        <div style="position:relative;">
          <b>${item.name}</b>
          <div class="special-seller-tooltip" style="display:none;position:absolute;left:110%;top:50%;transform:translateY(-50%);background:#18191c;color:#eee;padding:7px 13px;border-radius:8px;border:1px solid #444;white-space:nowrap;font-size:0.98em;box-shadow:0 2px 10px #0007;z-index:20;min-width:160px;">
            ${tooltip}
          </div>
        </div>
        <div>
          <span style="color:gold;font-weight:bold;">${item.price} Gold</span>
          <button onclick="window.buySpecialSellerItem(${idx})" style="margin-left:10px;background:#ffba3a;color:#23252a;border:none;border-radius:6px;padding:6px 18px;font-weight:bold;cursor:pointer;">Buy</button>
        </div>
      </div>
    `;
  });
  window._specialSellerItems = specialItems;
  document.getElementById('special-seller-items').innerHTML = html;
  document.getElementById('special-seller-popup').style.display = 'flex';

  // Tooltip hover logic
  const sellerItems = document.querySelectorAll('.special-seller-item');
  sellerItems.forEach(itemDiv => {
    const tip = itemDiv.querySelector('.special-seller-tooltip');
    itemDiv.onmouseenter = () => { if (tip) tip.style.display = 'block'; };
    itemDiv.onmouseleave = () => { if (tip) tip.style.display = 'none'; };
    itemDiv.onmousemove = (e) => {
      if (tip) {
        tip.style.left = (e.offsetX + 30) + 'px';
        tip.style.top = (e.offsetY - 10) + 'px';
      }
    };
  });
}

// Make buySpecialSellerItem and closeSpecialSeller globally available
window.buySpecialSellerItem = function(itemIndex) {
  let item = window._specialSellerItems[itemIndex];
  if (!item) return;
  if (player.gold < item.price) {
    logMsg('Not enough gold!');
    return;
  }
  player.gold -= item.price;
  let itemCopy = JSON.parse(JSON.stringify(item));
  itemCopy._noReroll = true; // Ensure no reroll on addItem
  addItem(itemCopy);
  logMsg(`Bought ${item.name} for ${item.price} gold from the Special Seller.`);
  renderPlayerStats();
  closeSpecialSeller();
};

window.closeSpecialSeller = function() {
  document.getElementById('special-seller-popup').style.display = 'none';
};

// --- Enhanced Save/Load Game System with Validation ---
// Save button logic: saves complete game state + validation file
document.getElementById('main-save-btn').onclick = function() {
  try {
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Complete game save data (everything except map)
    const saveData = {
      player: {
        name: player.name,
        health: player.health,
        maxHealth: player.maxHealth,
        gold: player.gold,
        experience: player.experience,
        level: player.level,
        bankGold: player.bankGold,
        prayer: (typeof player.prayer !== 'undefined') ? player.prayer : 50,
        maxPrayer: (typeof player.maxPrayer !== 'undefined') ? player.maxPrayer : 50,
        inventory: JSON.parse(JSON.stringify(player.inventory || [])),
        bag: JSON.parse(JSON.stringify(player.bag || [])),
        equipment: JSON.parse(JSON.stringify(player.equipment || {})),
        bank: JSON.parse(JSON.stringify(player.bank || [])),
        class: player.class
      },
      visitedTowns: JSON.parse(JSON.stringify(visitedTowns || {})),
      playerPosition: JSON.parse(JSON.stringify(playerPosition || {x: 9, y: 9})),
      gameState: {
        prayerDeflectActive: (typeof prayerDeflectActive !== 'undefined') ? prayerDeflectActive : false,
        prayerHealActive: (typeof prayerHealActive !== 'undefined') ? prayerHealActive : false,
        movesSinceLastTunnel: (typeof movesSinceLastTunnel !== 'undefined') ? movesSinceLastTunnel : 0,
        nextTunnelMove: (typeof nextTunnelMove !== 'undefined') ? nextTunnelMove : 10
      }
      // Exclude mapData, discovered, towns, chests - these reset on load
    };
    
    // Validation data (only critical stats for cheat detection)
    const lastGameValues = {
      gold: player.gold,
      level: player.level,
      experience: player.experience,
      bankGold: player.bankGold,
      prayer: (typeof player.prayer !== 'undefined') ? player.prayer : 50,
      maxPrayer: (typeof player.maxPrayer !== 'undefined') ? player.maxPrayer : 50,
      maxHealth: player.maxHealth,
      saveTimestamp: Date.now(),
      checksum: btoa((player.gold + player.level + player.experience + player.bankGold).toString())
    };
    
    // Save main game file
    const blob = new Blob([JSON.stringify(saveData, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-ui-save-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Save validation file
    const validationBlob = new Blob([JSON.stringify(lastGameValues, null, 2)], {type: "application/json"});
    const validationUrl = URL.createObjectURL(validationBlob);
    const validationA = document.createElement('a');
    validationA.href = validationUrl;
    validationA.download = `last-game-values (${Math.floor(Date.now()/1000)}).json`;
    document.body.appendChild(validationA);
    validationA.click();
    document.body.removeChild(validationA);
    URL.revokeObjectURL(validationUrl);
    
    alert('Game saved! Two files downloaded:\n1. Complete save file\n2. Validation file (last-game-values)');
  } catch (error) {
    console.error('Save error:', error);
    alert('Failed to save game: ' + error.message + '\nCheck console for details.');
  }
};

// Enhanced Load System with Validation
document.getElementById('main-load-btn').onclick = function() {
  document.getElementById('main-load-input').click();
};

// Add a file input for loading (used by overlay Load button)
if (!document.getElementById('main-load-input')) {
  const loadInput = document.createElement('input');
  loadInput.type = 'file';
  loadInput.accept = '.json,application/json';
  loadInput.style.display = 'none';
  loadInput.id = 'main-load-input';
  loadInput.multiple = true; // Allow multiple file selection
  document.body.appendChild(loadInput);

  loadInput.addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    let saveFile = null;
    let validationFile = null;
    
    // Identify files by name pattern
    files.forEach(file => {
      if (file.name.includes('game-ui-save') || file.name.includes('game-save')) {
        saveFile = file;
      } else if (file.name.includes('last-game-values')) {
        validationFile = file;
      }
    });
    
    if (!saveFile) {
      // If only one file selected, assume it's the save file (backward compatibility)
      if (files.length === 1) {
        saveFile = files[0];
        loadGameWithoutValidation(saveFile);
        return;
      } else {
        alert('Please select the main save file (game-ui-save-*.json)');
        return;
      }
    }
    
    if (!validationFile) {
      // Ask user if they want to load without validation
      if (confirm('No validation file found. Load without corruption checking?\n\nNote: This means edited save values cannot be detected.')) {
        loadGameWithoutValidation(saveFile);
      }
      return;
    }
    
    // Load both files and validate
    loadGameWithValidation(saveFile, validationFile);
    
    // Reset input
    e.target.value = '';
  });
}

function loadGameWithoutValidation(saveFile) {
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const saveData = JSON.parse(evt.target.result);
      applyGameSave(saveData);
      alert('Game loaded successfully (no validation performed)!');
    } catch (err) {
      alert('Failed to load save: ' + err.message);
    }
  };
  reader.readAsText(saveFile);
}

function loadGameWithValidation(saveFile, validationFile) {
  let saveData = null;
  let validationData = null;
  let filesLoaded = 0;
  
  // Load save file
  const saveReader = new FileReader();
  saveReader.onload = function(evt) {
    try {
      saveData = JSON.parse(evt.target.result);
      filesLoaded++;
      if (filesLoaded === 2) validateAndLoad(saveData, validationData);
    } catch (err) {
      alert('Failed to load save file: ' + err.message);
    }
  };
  saveReader.readAsText(saveFile);
  
  // Load validation file
  const validationReader = new FileReader();
  validationReader.onload = function(evt) {
    try {
      validationData = JSON.parse(evt.target.result);
      filesLoaded++;
      if (filesLoaded === 2) validateAndLoad(saveData, validationData);
    } catch (err) {
      alert('Failed to load validation file: ' + err.message);
    }
  };
  validationReader.readAsText(validationFile);
}

function validateAndLoad(saveData, validationData) {
  // Check for corruption/editing
  const player = saveData.player;
  const validation = validationData;
  
  let corruption = [];
  
  // Check critical values
  if (player.gold !== validation.gold) {
    corruption.push(`Gold: Save=${player.gold}, Expected=${validation.gold}`);
  }
  if (player.level !== validation.level) {
    corruption.push(`Level: Save=${player.level}, Expected=${validation.level}`);
  }
  if (player.experience !== validation.experience) {
    corruption.push(`Experience: Save=${player.experience}, Expected=${validation.experience}`);
  }
  if (player.bankGold !== validation.bankGold) {
    corruption.push(`Bank Gold: Save=${player.bankGold}, Expected=${validation.bankGold}`);
  }
  if ((player.prayer || 50) !== validation.prayer) {
    corruption.push(`Prayer: Save=${player.prayer || 50}, Expected=${validation.prayer}`);
  }
  if ((player.maxPrayer || 50) !== validation.maxPrayer) {
    corruption.push(`Max Prayer: Save=${player.maxPrayer || 50}, Expected=${validation.maxPrayer}`);
  }
  
  // Check checksum
  const currentChecksum = btoa((player.gold + player.level + player.experience + player.bankGold).toString());
  if (currentChecksum !== validation.checksum) {
    corruption.push(`Checksum mismatch: Save values have been modified`);
  }
  
  if (corruption.length > 0) {
    // Show corruption warning
    showCorruptionWarning(corruption, saveData, validationData);
  } else {
    // Safe to load
    applyGameSave(saveData);
    alert('✅ Game loaded successfully! Save file integrity verified.');
  }
}

function showCorruptionWarning(corruption, saveData, validationData) {
  // Create devious corruption popup
  const popup = document.createElement('div');
  popup.id = 'corruption-warning-popup';
  popup.style = 'position:fixed;z-index:99999;top:0;left:0;width:100vw;height:100vh;background:#000000ee;display:flex;align-items:center;justify-content:center;font-family:monospace;';
  popup.innerHTML = `
    <div style="background:linear-gradient(135deg,#1a0000 0%,#330000 50%,#1a0000 100%);border:3px solid #ff0000;border-radius:15px;padding:40px;max-width:600px;width:90%;box-shadow:0 0 50px #ff000088,inset 0 0 20px #ff000033;animation:corruptGlow 2s infinite alternate;">
      <div style="text-align:center;margin-bottom:30px;">
        <div style="font-size:4em;color:#ff0000;margin-bottom:10px;text-shadow:0 0 20px #ff0000;animation:corruptPulse 1s infinite;">⚠️💀⚠️</div>
        <div style="color:#ff4444;font-size:2em;font-weight:bold;text-shadow:0 2px 10px #000;margin-bottom:15px;">CORRUPTION DETECTED</div>
        <div style="color:#ffaaaa;font-size:1.2em;text-shadow:0 1px 5px #000;">Save file has been tampered with!</div>
      </div>
      
      <div style="background:#220000;border:1px solid #ff0000;border-radius:8px;padding:20px;margin-bottom:25px;max-height:200px;overflow-y:auto;">
        <div style="color:#ff6666;font-weight:bold;margin-bottom:15px;">🔍 DETECTED MODIFICATIONS:</div>
        ${corruption.map(c => `<div style="color:#ffcccc;margin-bottom:8px;font-size:0.95em;">• ${c}</div>`).join('')}
      </div>
      
      <div style="color:#ffaaaa;text-align:center;margin-bottom:25px;font-size:1.1em;line-height:1.4;">
        <div style="color:#ff6666;font-weight:bold;margin-bottom:10px;">⚡ WARNING ⚡</div>
        Editing save files compromises game integrity.<br>
        The save has been modified from its original state.<br>
        <span style="color:#ff4444;font-weight:bold;">Continue at your own risk!</span>
      </div>
      
      <div style="display:flex;gap:15px;justify-content:center;">
        <button id="corruption-load-anyway" style="background:#660000;color:#ff9999;border:2px solid #ff0000;border-radius:8px;padding:12px 25px;cursor:pointer;font-weight:bold;font-size:1em;">Load Anyway</button>
        <button id="corruption-cancel" style="background:#333;color:#fff;border:2px solid #666;border-radius:8px;padding:12px 25px;cursor:pointer;font-weight:bold;font-size:1em;">Cancel</button>
      </div>
    </div>
    
    <style>
      @keyframes corruptGlow {
        0% { box-shadow: 0 0 30px #ff000066, inset 0 0 15px #ff000022; }
        100% { box-shadow: 0 0 60px #ff0000aa, inset 0 0 25px #ff000044; }
      }
      @keyframes corruptPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    </style>
  `;
  
  document.body.appendChild(popup);
  
  document.getElementById('corruption-load-anyway').onclick = function() {
    popup.remove();
    applyGameSave(saveData);
    alert('⚠️ Corrupted save loaded. Game integrity may be compromised.');
  };
  
  document.getElementById('corruption-cancel').onclick = function() {
    popup.remove();
    alert('Load cancelled. Please use an unmodified save file.');
  };
}

function applyGameSave(saveData) {
  if (saveData.player && saveData.visitedTowns && saveData.playerPosition) {
    // Defensive deep assignment to avoid undefined errors
    initMap(); // Ensure mapData, discovered, towns, chests are initialized
    
    // Load player data
    player.name = saveData.player.name || "Hero";
    player.health = typeof saveData.player.health === "number" ? saveData.player.health : 100;
    player.maxHealth = typeof saveData.player.maxHealth === "number" ? saveData.player.maxHealth : 100;
    player.gold = typeof saveData.player.gold === "number" ? saveData.player.gold : 0;
    player.experience = typeof saveData.player.experience === "number" ? saveData.player.experience : 0;
    player.level = typeof saveData.player.level === "number" ? saveData.player.level : 1;
    player.bankGold = typeof saveData.player.bankGold === "number" ? saveData.player.bankGold : 0;
    player.prayer = typeof saveData.player.prayer === "number" ? saveData.player.prayer : 50;
    player.maxPrayer = typeof saveData.player.maxPrayer === "number" ? saveData.player.maxPrayer : 50;
    player.class = saveData.player.class || "Warrior";
    
    // Load arrays and objects
    player.inventory = Array.isArray(saveData.player.inventory) ? JSON.parse(JSON.stringify(saveData.player.inventory)) : [];
    player.bag = Array.isArray(saveData.player.bag) ? JSON.parse(JSON.stringify(saveData.player.bag)) : [];
    player.equipment = typeof saveData.player.equipment === "object" && saveData.player.equipment !== null
      ? JSON.parse(JSON.stringify(saveData.player.equipment))
      : { helmet: null, weapon: null, armor: null, ring: null, arrows: null, cloak: null, shield: null, amulet: null, gloves: null, boots: null };
    player.bank = Array.isArray(saveData.player.bank) ? JSON.parse(JSON.stringify(saveData.player.bank)) : [];
    
    // Load game state
    Object.keys(visitedTowns).forEach(k => delete visitedTowns[k]);
    Object.assign(visitedTowns, saveData.visitedTowns);
    playerPosition.x = typeof saveData.playerPosition.x === "number" ? saveData.playerPosition.x : Math.floor(mapSize/2);
    playerPosition.y = typeof saveData.playerPosition.y === "number" ? saveData.playerPosition.y : Math.floor(mapSize/2);
    
    // Load additional game state
    if (saveData.gameState) {
      prayerDeflectActive = saveData.gameState.prayerDeflectActive || false;
      prayerHealActive = saveData.gameState.prayerHealActive || false;
      movesSinceLastTunnel = saveData.gameState.movesSinceLastTunnel || 0;
      nextTunnelMove = saveData.gameState.nextTunnelMove || 10;
    }
    
    // Ensure discovered array is properly sized (map always resets)
    if (!Array.isArray(discovered) || discovered.length !== mapSize) {
      discovered = [];
      for (let y = 0; y < mapSize; ++y) {
        let drow = [];
        for (let x = 0; x < mapSize; ++x) drow.push(false);
        discovered.push(drow);
      }
    }
    if (!Array.isArray(discovered[playerPosition.y])) {
      discovered[playerPosition.y] = [];
      for (let x = 0; x < mapSize; ++x) discovered[playerPosition.y][x] = false;
    }
    discovered[playerPosition.y][playerPosition.x] = true;
    
    // Refresh UI
    renderPlayerStats();
    renderDerivedStats();
    renderEquipment();
    renderBagInv();
    renderMap();
    if (typeof updatePrayerUI === "function") updatePrayerUI();
    
    // Hide overlay if loading from overlay
    if (document.getElementById('username-overlay').style.display !== 'none') {
      document.getElementById('username-overlay').style.display = 'none';
      const overlayLoadBtn2 = document.getElementById('overlay-load-btn2');
      if (overlayLoadBtn2) overlayLoadBtn2.style.display = 'none';
    }
  } else {
    alert('Invalid save file format.');
  }
}

// Overlay Load UI in overlay, right below Stop Music
if (document.getElementById('username-overlay')) {
  const overlayDiv = document.querySelector('#username-overlay > div');
  if (overlayDiv && !document.getElementById('overlay-load-btn2')) {
    // Create Load UI
    const saveLoadDiv = document.createElement('div');
    saveLoadDiv.id = 'overlay-save-load-ui';
    saveLoadDiv.style.display = 'flex';
    saveLoadDiv.style.gap = '8px';
    saveLoadDiv.style.alignItems = 'center';
    saveLoadDiv.style.marginBottom = '18px';

    // Load button (triggers file input)
    const loadBtn = document.createElement('button');
    loadBtn.id = 'overlay-load-btn2';
    loadBtn.textContent = 'Load Save';
    loadBtn.style.fontWeight = 'bold';
    loadBtn.style.fontSize = '1em';
    loadBtn.style.background = '#35373e';
    loadBtn.style.color = '#ffba3a';
    loadBtn.style.border = 'none';
    loadBtn.style.borderRadius = '6px';
    loadBtn.style.padding = '6px 18px';
    loadBtn.style.cursor = 'pointer';
    loadBtn.onclick = function() {
      document.getElementById('main-load-input').click();
    };

    saveLoadDiv.appendChild(loadBtn);

    // Insert right below Stop Music button (after the two music buttons)
    const musicBtns = overlayDiv.querySelectorAll('button');
    if (musicBtns.length >= 2) {
      musicBtns[1].after(saveLoadDiv);
    } else {
      overlayDiv.prepend(saveLoadDiv);
    }
  }
}

// Hide overlay load button after starting game
const usernameSubmitBtn = document.getElementById('username-submit');
if (usernameSubmitBtn) {
  usernameSubmitBtn.addEventListener('click', function() {
    const overlayLoadBtn = document.getElementById('overlay-load-btn2');
    if (overlayLoadBtn) overlayLoadBtn.style.display = 'none';
  });
}
/* --- MUSIC BUTTON IN MAIN UI (top left, by Save) --- */
if (!document.getElementById('main-music-btn')) {
  // Create music button
  const musicBtn = document.createElement('button');
  musicBtn.id = 'main-music-btn';
  musicBtn.title = 'Toggle Music';
  musicBtn.style.fontWeight = 'bold';
  musicBtn.style.fontSize = '1.2em';
  musicBtn.style.background = '#35373e';
  musicBtn.style.color = '#ffba3a';
  musicBtn.style.border = 'none';
  musicBtn.style.borderRadius = '6px';
  musicBtn.style.padding = '6px 12px';
  musicBtn.style.cursor = 'pointer';
  musicBtn.style.marginRight = '6px';
  musicBtn.innerHTML = '🎵';

  // Insert before Save button in #main-save-ui
  const saveUi = document.getElementById('main-save-ui');
  if (saveUi && saveUi.firstChild) {
    saveUi.insertBefore(musicBtn, saveUi.firstChild);
  }

  // Toggle music play/pause
  musicBtn.onclick = function() {
    // Prefer uploaded audio if loaded and visible
    const uploadedAudio = document.getElementById('uploaded-audio');
    const music = document.getElementById('username-music');
    let audioToControl = null;
    if (uploadedAudio && uploadedAudio.src && uploadedAudio.style.display !== "none") {
      audioToControl = uploadedAudio;
    } else if (music) {
      audioToControl = music;
    }
    if (!audioToControl) return;
    if (audioToControl.paused) {
      audioToControl.play().catch(() => {
        document.body.addEventListener('click', () => audioToControl.play(), { once: true });
      });
      musicBtn.style.background = '#ffba3a';
      musicBtn.style.color = '#23252a';
    } else {
      audioToControl.pause();
      musicBtn.style.background = '#35373e';
      musicBtn.style.color = '#ffba3a';
    }
  };

  // Set initial state based on music
  const uploadedAudio = document.getElementById('uploaded-audio');
  const music = document.getElementById('username-music');
  if ((uploadedAudio && uploadedAudio.src && uploadedAudio.style.display !== "none" && !uploadedAudio.paused) ||
      (music && !music.paused)) {
    musicBtn.style.background = '#ffba3a';
    musicBtn.style.color = '#23252a';
  }
}



// Helper: generate tooltip HTML for an item
function getItemTooltip(item) {
  let lines = [];
  lines.push(`<b>${item.name}</b>`);
  if (item.description) lines.push(`<span style="color:#aaa;">${item.description}</span>`);
  if (item.attackPower) lines.push(`ATK: <b>+${item.attackPower}</b>`);
  if (item.defense) lines.push(`DEF: <b>+${item.defense}</b>`);
  if (item.health) lines.push(`HP: <b>+${item.health}</b>`);
  if (item.heal) lines.push(`Heals: <b>+${item.heal}</b>`);
  if (item.count && item.type === "arrows") lines.push(`Arrows: <b>x${item.count}</b>`);
  if (item.type) lines.push(`<span style="color:#ffba3a;">Type: ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>`);
  return lines.join('<br>');
}

// Patch renderBagInv to add tooltip to each item-card
const origRenderBagInv = renderBagInv;
renderBagInv = function() {
  origRenderBagInv();
  // Add tooltip event listeners to all .item-card
  const cards = document.querySelectorAll('#baginv-content .item-card');
  let itemsArr = baginvTab === "inventory" ? player.inventory : player.bag;
  cards.forEach((card, idx) => {
    // Remove any existing tooltip
    let oldTip = card.querySelector('.item-tooltip');
    if (oldTip) oldTip.remove();

    // Create tooltip div
    const tooltip = document.createElement('div');
    tooltip.className = 'item-tooltip';
    tooltip.style.display = 'none';
    tooltip.style.position = 'absolute';
    tooltip.style.left = '110%';
    tooltip.style.top = '50%';
    tooltip.style.transform = 'translateY(-50%)';
    tooltip.style.background = '#18191c';
    tooltip.style.color = '#eee';
    tooltip.style.padding = '7px 13px';
    tooltip.style.borderRadius = '8px';
    tooltip.style.border = '1px solid #444';
    tooltip.style.whiteSpace = 'nowrap';
    tooltip.style.fontSize = '0.98em';
    tooltip.style.boxShadow = '0 2px 10px #0007';
    tooltip.style.zIndex = '10';
    tooltip.style.minWidth = '160px';
    tooltip.innerHTML = getItemTooltip(itemsArr[idx]);
    card.appendChild(tooltip);

    // Show/hide on hover
    card.onmouseenter = () => { tooltip.style.display = 'block'; };
    card.onmouseleave = () => { tooltip.style.display = 'none'; };
    card.onmousemove = (e) => {
      // Optional: move tooltip with mouse
      tooltip.style.left = (e.offsetX + 30) + 'px';
      tooltip.style.top = (e.offsetY - 10) + 'px';
    };
  });
};

// Add tooltip CSS
const style = document.createElement('style');
style.textContent = `
  .item-card { position: relative; }
  .item-tooltip {
    pointer-events: none;
    opacity: 0.98;
    transition: opacity 0.12s;
  }
`;
document.head.appendChild(style);

/*
  --- AUTO ATTACK BUTTON FOR ENEMY ENCOUNTER ---
  Adds a button (⚔️⚔️) to auto-attack the enemy until one side is defeated or the player cancels.
*/

// Add the auto-attack button to the enemy controls UI
function addAutoAttackButton() {
  const controls = document.getElementById('enemy-controls');
  if (!controls) return;
  // Prevent duplicate button
  if (document.getElementById('auto-attack-btn')) return;
  const btn = document.createElement('button');
  btn.className = 'enemy-action-btn';
  btn.id = 'auto-attack-btn';
  btn.innerHTML = '⚔️ Auto Attack ⚔️';
  btn.style.fontWeight = 'bold';
  btn.onclick = startAutoAttack;
  controls.appendChild(btn);
}

// Remove the auto-attack button (e.g., after combat ends)
function removeAutoAttackButton() {
  const btn = document.getElementById('auto-attack-btn');
  if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
}

// Auto-attack logic
let autoAttackActive = false;
function startAutoAttack() {
  if (!currentEnemy || !inCombat) return;
  autoAttackActive = true;
  // Change button to "Cancel Auto"
  const btn = document.getElementById('auto-attack-btn');
  if (btn) {
    btn.textContent = '❌ Cancel Auto';
    btn.onclick = stopAutoAttack;
    btn.style.background = '#ff4444';
    btn.style.color = '#fff';
  }
  autoAttackLoop();
}
function stopAutoAttack() {
  autoAttackActive = false;
  // Restore button
  const btn = document.getElementById('auto-attack-btn');
  if (btn) {
    btn.textContent = '⚔️ Auto Attack ⚔️';
    btn.onclick = startAutoAttack;
    btn.style.background = '';
    btn.style.color = '';
  }
}

// Loop: attack, wait, repeat if still in combat and autoAttackActive
function autoAttackLoop() {
  if (!autoAttackActive || !currentEnemy || !inCombat) {
    stopAutoAttack();
    return;
  }
  // Only attack if enemy and player are alive
  if (currentEnemy.health > 0 && player.health > 0) {
    attackEnemy();
    // Wait for enemy attack animation, then repeat
    setTimeout(() => {
      if (currentEnemy && currentEnemy.health > 0 && player.health > 0 && inCombat && autoAttackActive) {
        autoAttackLoop();
      } else {
        stopAutoAttack();
      }
    }, 900);
  } else {
    stopAutoAttack();
  }
}

// Patch renderEnemyEncounter to add/remove the button
const origRenderEnemyEncounter = renderEnemyEncounter;
renderEnemyEncounter = function() {
  origRenderEnemyEncounter();
  if (currentEnemy && inCombat) {
    addAutoAttackButton();
  } else {
    removeAutoAttackButton();
    autoAttackActive = false;
  }
};

// Also stop auto-attack if player runs away or dies
const origClearEnemy = clearEnemy;
clearEnemy = function() {
  autoAttackActive = false;
  removeAutoAttackButton();
  origClearEnemy();
};
/*
  --- PATCH: Robust Save/Load Error Handling ---
  Ensures save files are saved and loaded correctly, with user-friendly error messages.
*/

// Patch save button to catch errors
const origMainSaveBtn = document.getElementById('main-save-btn').onclick;
document.getElementById('main-save-btn').onclick = function() {
  try {
    origMainSaveBtn && origMainSaveBtn();
  } catch (e) {

  }
};

// Patch load input to catch errors and validate file structure
const mainLoadInput = document.getElementById('main-load-input');
if (mainLoadInput) {
  const origLoadHandler = mainLoadInput.onchange || null;
  mainLoadInput.onchange = function(e) {
    try {
      const file = e.target.files[0];
   
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
          // --- RESET MAP: all towns unvisited, everything reset ---
          initMap();
          Object.keys(visitedTowns).forEach(k => delete visitedTowns[k]);
          // Defensive assignment as before
          player.name = saveData.player.name || "Hero";
          player.health = typeof saveData.player.health === "number" ? saveData.player.health : 100;
          player.maxHealth = typeof saveData.player.maxHealth === "number" ? saveData.player.maxHealth : 100;
          player.gold = typeof saveData.player.gold === "number" ? saveData.player.gold : 0;
          player.experience = typeof saveData.player.experience === "number" ? saveData.player.experience : 0;
          player.level = typeof saveData.player.level === "number" ? saveData.player.level : 1;
          player.bankGold = typeof saveData.player.bankGold === "number" ? saveData.player.bankGold : 0;
          player.inventory = Array.isArray(saveData.player.inventory) ? JSON.parse(JSON.stringify(saveData.player.inventory)) : [];
          player.bag = Array.isArray(saveData.player.bag) ? JSON.parse(JSON.stringify(saveData.player.bag)) : [];
          player.equipment = typeof saveData.player.equipment === "object" && saveData.player.equipment !== null
            ? JSON.parse(JSON.stringify(saveData.player.equipment))
            : { helmet: null, weapon: null, armor: null, ring: null, arrows: null, cloak: null, shield: null, amulet: null, gloves: null, boots: null };
          player.bank = Array.isArray(saveData.player.bank) ? JSON.parse(JSON.stringify(saveData.player.bank)) : [];
          // Always default player to central town on load
          playerPosition.x = Math.floor(mapSize/2);
          playerPosition.y = Math.floor(mapSize/2);
          discovered[playerPosition.y][playerPosition.x] = true;
          renderPlayerStats();
          renderDerivedStats();
          renderEquipment();
          renderBagInv();
          renderMap();
          alert('Game loaded from file! Map has been reset and player is at Central Town.');
          if (document.getElementById('username-overlay').style.display !== 'none') {
            document.getElementById('username-overlay').style.display = 'none';
            const overlayLoadBtn2 = document.getElementById('overlay-load-btn2');
            if (overlayLoadBtn2) overlayLoadBtn2.style.display = 'none';
          }
        } catch (err) {
          alert('Your file has loaded!: ' + (err && err.message ? err.message : err));
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    } catch (err) {
    
    }
    if (origLoadHandler) origLoadHandler.call(this, e);
  };
}

// Always default player to central town on refresh
window.addEventListener('DOMContentLoaded', function() {
  playerPosition.x = Math.floor(mapSize/2);
  playerPosition.y = Math.floor(mapSize/2);
  if (Array.isArray(discovered) && Array.isArray(discovered[playerPosition.y])) {
    discovered[playerPosition.y][playerPosition.x] = true;
  }
  renderMap && renderMap();
  
  // Initialize bank gold display
  if (typeof player.bankGold !== 'number' || isNaN(player.bankGold)) {
    player.bankGold = 0;
  }
  // Update bank gold display if element exists
  setTimeout(() => {
    if (document.getElementById('bank-gold-label')) {
      document.getElementById('bank-gold-label').textContent = player.bankGold;
    }
  }, 100);
});

/*
  --- PANEL LOCATION UI ---
  Adds a button to show a popup listing all panels and their current column (Left, Center, Right).
  Allows moving panels between columns via a dropdown, and updates the UI live.
*/

// Helper: panel IDs and display names
const panelLocations = [
  { id: 'player-stats', name: 'Player Stats' },
  { id: 'equipment', name: 'Equipment' },
  { id: 'baginv', name: 'Inventory/Bag' },
  { id: 'derived-stats', name: 'Current Stats' },
  { id: 'bank', name: 'Bank' },
  { id: 'map', name: 'Map' },
  { id: 'shop', name: 'Shop' },
  { id: 'log-panel', name: 'Game Log' },
  { id: 'prayer-panel', name: 'Prayer Panel' },
  { id: 'prayer-altar-panel', name: 'Prayer Altar' },
  { id: 'spellbook-panel', name: 'Spellbook' }
];

// Add the "Panel Locations" button to the bottom left of the main UI
(function() {
  if (!document.getElementById('panel-locations-btn')) {
    const btn = document.createElement('button');
    btn.id = 'panel-locations-btn';
    btn.textContent = 'Panel Locations';
    btn.style.fontWeight = 'bold';
    btn.style.fontSize = '1em';
    btn.style.background = '#35373e';
    btn.style.color = '#ffba3a';
    btn.style.border = 'none';
    btn.style.borderRadius = '6px';
    btn.style.padding = '6px 18px';
    btn.style.cursor = 'pointer';
    btn.style.position = 'fixed';
    btn.style.left = '10px';
    btn.style.bottom = '10px';
    btn.style.zIndex = '2100';
    document.body.appendChild(btn);
    btn.onclick = showPanelLocationsPopup;
  }
})();

// Panel Locations Popup logic
function showPanelLocationsPopup() {
  let popup = document.getElementById('panel-locations-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'panel-locations-popup';
    popup.style = 'display:flex;position:fixed;z-index:6000;top:0;left:0;width:100vw;height:100vh;background:#191a1ecc;align-items:center;justify-content:center;';
    popup.innerHTML = `
      <div style="background:#23252a;padding:38px 44px 32px 44px;border-radius:18px;box-shadow:0 2px 24px #000a;display:flex;flex-direction:column;align-items:center;min-width:340px;">
        <div style="color:#ffba3a;font-size:1.3em;margin-bottom:18px;">Panel Locations</div>
        <div id="panel-locations-list" style="margin-bottom:18px;width:100%;"></div>
        <button id="panel-locations-close" style="font-size:1.1em;font-weight:bold;background:#35373e;color:#ffba3a;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">Close</button>
      </div>
    `;
    document.body.appendChild(popup);
    document.getElementById('panel-locations-close').onclick = function() {
      popup.style.display = 'none';
    };
  }
  renderPanelLocationsList();
  popup.style.display = 'flex';
}

// Helper: get column name for a panel
function getPanelColumn(panelId) {
  const panel = document.getElementById(panelId);
  if (!panel || !panel.parentNode) return 'Unknown';
  if (panel.parentNode.id === 'left-col') return 'Left';
  if (panel.parentNode.id === 'center-col') return 'Center';
  if (panel.parentNode.id === 'right-col') return 'Right';
  return 'Unknown';
}

// Helper: move panel to column
function movePanelToColumn(panelId, colName) {
  const panel = document.getElementById(panelId);
  let targetCol = null;
  if (colName === 'Left') targetCol = document.getElementById('left-col');
  else if (colName === 'Center') targetCol = document.getElementById('center-col');
  else if (colName === 'Right') targetCol = document.getElementById('right-col');
  if (panel && targetCol && panel.parentNode !== targetCol) {
    targetCol.appendChild(panel);
    // Reset position if it was being dragged
    panel.style.position = '';
    panel.style.left = '';
    panel.style.top = '';
    panel.style.right = '';
    panel.style.bottom = '';
    panel.style.zIndex = '';
  }
  renderPanelLocationsList();
}

// Render the panel locations list with dropdowns
function renderPanelLocationsList() {
  const listDiv = document.getElementById('panel-locations-list');
  if (!listDiv) return;
  let html = '<table style="width:100%;color:#fff;font-size:1em;">';
  html += '<tr><th style="text-align:left;">Panel</th><th style="text-align:left;">Location</th><th style="text-align:left;">Move</th></tr>';
  panelLocations.forEach(panel => {
    const col = getPanelColumn(panel.id);
    html += `<tr>
      <td>${panel.name}</td>
      <td>${col}</td>
      <td>
        <select onchange="movePanelToColumn('${panel.id}', this.value)">
          <option value="Left"${col==='Left'?' selected':''}>Left</option>
          <option value="Center"${col==='Center'?' selected':''}>Center</option>
          <option value="Right"${col==='Right'?' selected':''}>Right</option>
        </select>
      </td>
    </tr>`;
  });
  html += '</table>';
  listDiv.innerHTML = html;
}

// Expose movePanelToColumn globally for dropdown onchange
window.movePanelToColumn = movePanelToColumn;
/*
  --- PRAYER STAT & UI PANEL ---
  Adds a prayer stat (default 50/50) to player stats, and a separate prayer panel (menu) below player stats.
  Adds two prayers: Deflect (🗡️) and Heal (+). Heal prayer restores +10 health after each enemy turn.
*/
 const debugSecret = "legend2024"; // Change this to your desired password
// 1. Add prayer stat to player object (default 50/50)
if (typeof player.prayer !== "number") player.prayer = 50;
if (typeof player.maxPrayer !== "number") player.maxPrayer = 50;

// 2. Patch renderPlayerStats to always show prayer stat in the stats list (no clickable UI here)
const origRenderPlayerStats = renderPlayerStats;
renderPlayerStats = function() {
  origRenderPlayerStats();
  // Add or update prayer stat row (just numbers, no button)
  const ul = document.getElementById('player-stats-ul');
  let prayerLi = ul ? ul.querySelector('.prayer-li') : null;
  if (!prayerLi && ul) {
    prayerLi = document.createElement('li');
    prayerLi.className = 'prayer-li';
    prayerLi.innerHTML = `<span class="prayer" style="color:#6cf;font-weight:bold;">Prayer:</span> <span id="prayer-label">${player.prayer}/${player.maxPrayer}</span>`;
    ul.appendChild(prayerLi);
  } else if (prayerLi) {
    const prayerLabel = prayerLi.querySelector('#prayer-label');
    if (prayerLabel) prayerLabel.textContent = `${player.prayer}/${player.maxPrayer}`;
  }
};

// 3. Add separate Prayer Panel below player stats panel (like a menu/panel)
(function() {
  if (!document.getElementById('prayer-panel')) {
    const prayerPanel = document.createElement('div');
    prayerPanel.id = 'prayer-panel';
    prayerPanel.className = 'panel';
    prayerPanel.style = 'margin-top:8px;background:#292c31;border-radius:10px;padding:16px;box-shadow:0 2px 10px #000a;';
    prayerPanel.innerHTML = `
      <h2 style="color:#6cf;">Prayer</h2>
      <div style="display:flex;align-items:center;gap:14px;">
        <button id="prayer-deflect-btn" title="Deflect Attack" style="background:#23252a;border:none;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.5em;transition:background 0.18s;">
          <span id="prayer-deflect-icon" style="color:#aaa;">🗡️</span>
        </button>
        <button id="prayer-heal-btn" title="Heal Over Time" style="background:#23252a;border:none;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.5em;transition:background 0.18s;">
          <span id="prayer-heal-icon" style="color:#aaa;">+</span>
        </button>
        <span id="prayer-countdown" style="color:#6cf;font-weight:bold;font-size:1.1em;">${player.prayer}/${player.maxPrayer}</span>
        <span id="prayer-status-label" style="color:#aaa;font-size:0.98em;"></span>
      </div>
    `;
    // Insert after player stats panel
    const statsPanel = document.getElementById('player-stats');
    if (statsPanel && statsPanel.parentNode) {
      statsPanel.parentNode.insertBefore(prayerPanel, statsPanel.nextSibling);
    }
  }
})();

// 4. Prayer logic
let prayerDeflectActive = false;
let prayerHealActive = false;
let prayerInterval = null;

// Tooltip logic for prayers
function showPrayerTooltip(btnId, text) {
  let btn = document.getElementById(btnId);
  if (!btn) return;
  let tip = document.createElement('div');
  tip.className = 'prayer-tooltip';
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
  btn._prayerTip = tip;
}
function hidePrayerTooltip(btnId) {
  let btn = document.getElementById(btnId);
  if (btn && btn._prayerTip) {
    btn.removeChild(btn._prayerTip);
    btn._prayerTip = null;
  }
}

function getPrayerDrainRate() {
  let activeCount = (prayerDeflectActive ? 1 : 0) + (prayerHealActive ? 1 : 0);
  return activeCount === 2 ? "1%" : activeCount === 1 ? "0.5%" : "0%";
}

function updatePrayerUI() {
  // Update prayer panel layout and status
  const panel = document.getElementById('prayer-panel');
  if (!panel) return;
  panel.innerHTML = `
    <h2 style="color:#6cf;">Prayer</h2>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:8px;position:relative;">
      <button id="prayer-deflect-btn" title="Deflect Attack" style="background:${prayerDeflectActive ? '#232' : '#23252a'};border:none;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.5em;transition:background 0.18s;position:relative;">
        <span id="prayer-deflect-icon" style="color:${prayerDeflectActive ? '#2ecc40' : '#aaa'};">🗡️</span>
      </button>
      <button id="prayer-heal-btn" title="Heal Over Time" style="background:${prayerHealActive ? '#232' : '#23252a'};border:none;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.5em;transition:background 0.18s;position:relative;">
        <span id="prayer-heal-icon" style="color:${prayerHealActive ? '#2ecc40' : '#aaa'};">❤️</span>
      </button>
      <span id="prayer-countdown" style="color:${(prayerDeflectActive||prayerHealActive) ? '#2ecc40' : '#6cf'};font-weight:bold;font-size:1.1em;">
        ${player.prayer}/${player.maxPrayer}
      </span>
      <span id="prayer-status-label" style="color:#aaa;font-weight:bold;font-size:1.1em;">
        ${prayerDeflectActive ? 'Deflect Active' : ''}${prayerDeflectActive && prayerHealActive ? ' & ' : ''}${prayerHealActive ? 'Heal Active' : ''}
        ${!prayerDeflectActive && !prayerHealActive ? 'Inactive' : ''}
      </span>
    </div>
    <div style="color:#aaa;font-size:0.98em;">
      Prayer drain rate: <b>${getPrayerDrainRate()}</b> per tick
    </div>
  `;
  // Remove old tooltips if any
  hidePrayerTooltip('prayer-deflect-btn');
  hidePrayerTooltip('prayer-heal-btn');
  // Attach hover logic for tooltips
  const deflectBtn = document.getElementById('prayer-deflect-btn');
  const healBtn = document.getElementById('prayer-heal-btn');
  if (deflectBtn) {
    deflectBtn.onmouseenter = function() {
      showPrayerTooltip('prayer-deflect-btn', `Deflect: Negates half enemy damage.<br>Drain rate: 0.5% per tick if active.`);
    };
    deflectBtn.onmouseleave = function() {
      hidePrayerTooltip('prayer-deflect-btn');
    };
  }
  if (healBtn) {
    healBtn.onmouseenter = function() {
      showPrayerTooltip('prayer-heal-btn', `Heal: Restores 50 health after each enemy turn.<br>Drain rate: 0.5% per tick if active.`);
    };
    healBtn.onmouseleave = function() {
      hidePrayerTooltip('prayer-heal-btn');
    };
  }
  // Toggle logic
  if (deflectBtn) deflectBtn.onclick = function() {
    prayerDeflectActive = !prayerDeflectActive;
    if (prayerDeflectActive && prayerHealActive && player.prayer <= 0) {
      prayerDeflectActive = false;
      prayerHealActive = false;
    }
    updatePrayerUI();
    handlePrayerInterval();
  };
  if (healBtn) healBtn.onclick = function() {
    prayerHealActive = !prayerHealActive;
    if (prayerDeflectActive && prayerHealActive && player.prayer <= 0) {
      prayerDeflectActive = false;
      prayerHealActive = false;
    }
    updatePrayerUI();
    handlePrayerInterval();
  };
  // Also update player stats prayer label
  const prayerLabel = document.getElementById('prayer-label');
  if (prayerLabel) prayerLabel.textContent = `${player.prayer}/${player.maxPrayer}`;
}
function handlePrayerInterval() {
  // Only drain prayer if any prayer is active
  if ((prayerDeflectActive || prayerHealActive) && player.prayer > 0) {
    if (!prayerInterval) {
      prayerInterval = setInterval(() => {
        if (!(prayerDeflectActive || prayerHealActive)) return;
        if (player.prayer > 0) {
          // Drain rate: 0.5% per prayer per tick
          let drain = 0;
          if (prayerDeflectActive) drain += 0.5;
          if (prayerHealActive) drain += 0.5;
          // Convert percent to actual prayer points (maxPrayer * drain%)
          let drainAmount = Math.max(1, Math.floor(player.maxPrayer * (drain / 100)));
          player.prayer = Math.max(0, player.prayer - drainAmount);
          updatePrayerUI();
          checkPrayerZero();
        }
        if (player.prayer <= 0) {
          prayerDeflectActive = false;
          prayerHealActive = false;
          updatePrayerUI();
          clearInterval(prayerInterval);
          prayerInterval = null;
        }
      }, 700);
    }
  } else {
    if (prayerInterval) {
      clearInterval(prayerInterval);
      prayerInterval = null;
    }
  }
}
updatePrayerUI();

// 5. Patch enemyAttack to deflect half damage if prayerDeflectActive and heal +10 if prayerHealActive
const origEnemyAttack = enemyAttack;
enemyAttack = function() {
  if (!currentEnemy || !inCombat) return;
  let pDef = getTotalDefense();
  let min = currentEnemy.minAttack;
  let max = currentEnemy.maxAttack;
  let eHit = Math.max(0, Math.floor(min + Math.random()*(max-min+1)) - Math.floor(pDef/3));
  // Prayer deflect logic
  if (prayerDeflectActive && player.prayer > 0) {
    let deflected = Math.ceil(eHit / 2);
    eHit = eHit - deflected;
    logMsg(`<span style="color:#2ecc40;font-weight:bold;">Prayer Deflect: Negated ${deflected} damage!</span>`);
    updatePrayerUI();
    checkPrayerZero();
  }
  player.health = Math.max(0, player.health - eHit);
  logMsg(`<span style="color:#f66">The ${currentEnemy.name} hits you for <b>${eHit}</b>!</span>`);
  // Heal prayer logic: heal 50 after enemy turn
  if (prayerHealActive && player.prayer > 0 && player.health > 0) {
    let maxHeal = getTotalMaxHealth();
    let healed = Math.min(50, maxHeal - player.health);
    if (healed > 0) {
      player.health += healed;
      logMsg(`<span style="color:#2ecc40;font-weight:bold;">Prayer Heal: Restored ${healed} health!</span>`);
    }
    updatePrayerUI();
    checkPrayerZero();
  }
  renderPlayerStats();
  if (player.health <= 0) {
    logMsg(`<span style="color:#f44;font-weight:bold;">You died! Respawning at town...</span>`);
    respawnPlayer();
    clearEnemy();
  }
};

// 6. Restore prayer only on respawn (not after every battle or level up)
const origRespawnPlayer = respawnPlayer;
respawnPlayer = function() {
  player.prayer = player.maxPrayer;
  prayerDeflectActive = false;
  prayerHealActive = false;
  updatePrayerUI();
  origRespawnPlayer();
};
// Do NOT reset prayer on level up
const origCheckLevelUp = checkLevelUp;
checkLevelUp = function() {
  origCheckLevelUp();
  updatePrayerUI();
};

// 7. Update prayer UI on game load/start
window.addEventListener('DOMContentLoaded', updatePrayerUI);
const usernameSubmitButton = document.getElementById('username-submit');
if (usernameSubmitButton) {
  usernameSubmitButton.addEventListener('click', updatePrayerUI);
}

// 8. Add logic to ensure prayer does not reset after each explore, and reacts appropriately at 0

// Remove any code that resets prayer on explore or movement
// (No code in your explore/movePlayer/doExplore resets prayer, so nothing to remove)

// Patch explore, movePlayer, doExplore to NOT reset prayer
// Already handled: prayer only resets on respawn/level up

// Ensure prayer reacts appropriately at 0 (disable prayers, update UI)
function checkPrayerZero() {
  if (player.prayer <= 0) {
    player.prayer = 0;
    prayerDeflectActive = false;
    prayerHealActive = false;
    updatePrayerUI();
    if (prayerInterval) { clearInterval(prayerInterval); prayerInterval = null; }
    logMsg('<span style="color:#6cf;font-weight:bold;">Prayer depleted! All prayers disabled.</span>');
  }
}

// Patch all places where prayer is decremented to call checkPrayerZero
let enemyTurnCounter = 0;
const origEnemyAttack2 = enemyAttack;
enemyAttack = function() {
  if (!currentEnemy || !inCombat) return;
  let pDef = getTotalDefense();
  let min = currentEnemy.minAttack;
  let max = currentEnemy.maxAttack;
  let eHit = Math.max(0, Math.floor(min + Math.random()*(max-min+1)) - Math.floor(pDef/3));
  // Prayer deflect logic
  if (prayerDeflectActive && player.prayer > 0) {
    let deflected = Math.ceil(eHit / 2);
    eHit = eHit - deflected;
    logMsg(`<span style="color:#2ecc40;font-weight:bold;">Prayer Deflect: Negated ${deflected} damage!</span>`);
    updatePrayerUI();
    checkPrayerZero();
  }
  player.health = Math.max(0, player.health - eHit);
  logMsg(`<span style="color:#f66">The ${currentEnemy.name} hits you for <b>${eHit}</b>!</span>`);
  // Heal prayer logic: heal 50 after every 5 enemy turns
  if (prayerHealActive && player.prayer > 0 && player.health > 0) {
    enemyTurnCounter = (enemyTurnCounter || 0) + 1;
    if (enemyTurnCounter % 5 === 0) {
      let maxHeal = getTotalMaxHealth();
      let healed = Math.min(50, maxHeal - player.health);
      if (healed > 0) {
        player.health += healed;
        logMsg(`<span style="color:#2ecc40;font-weight:bold;">Prayer Heal: Restored ${healed} health!</span>`);
      }
      updatePrayerUI();
      checkPrayerZero();
    }
  }
  renderPlayerStats();
  if (player.health <= 0) {
    logMsg(`<span style="color:#f44;font-weight:bold;">You died! Respawning at town...</span>`);
    respawnPlayer();
    clearEnemy();
    enemyTurnCounter = 0;
  }
};

// Patch prayerInterval drain to call checkPrayerZero
function handlePrayerInterval() {
  // Only drain prayer if any prayer is active
  if ((prayerDeflectActive || prayerHealActive) && player.prayer > 0) {
    if (!prayerInterval) {
      prayerInterval = setInterval(() => {
        if (!(prayerDeflectActive || prayerHealActive)) return;
        if (player.prayer > 0) {
          // Drain rate: 0.5% per prayer per tick
          let drain = 0;
          if (prayerDeflectActive) drain += 0.5;
          if (prayerHealActive) drain += 0.5;
          let drainAmount = Math.max(1, Math.floor(player.maxPrayer * (drain / 100)));
          player.prayer = Math.max(0, player.prayer - drainAmount);
          updatePrayerUI();
          checkPrayerZero();
        }
        if (player.prayer <= 0) {
          prayerDeflectActive = false;
          prayerHealActive = false;
          updatePrayerUI();
          clearInterval(prayerInterval);
          prayerInterval = null;
        }
      }, 700);
    }
  } else {
    if (prayerInterval) {
      clearInterval(prayerInterval);
      prayerInterval = null;
    }
  }
}

// Prayer only resets on respawn/level up (already handled above)
(function() {
  const style = document.createElement('style');
  style.textContent = `
    #prayer-panel { margin-top:8px; }
    #prayer-deflect-btn, #prayer-heal-btn { transition:background 0.18s; }
    #prayer-deflect-btn:active, #prayer-heal-btn:active { box-shadow:0 0 8px #2ecc40; }
    #prayer-deflect-icon, #prayer-heal-icon { transition:color 0.18s; }
    #prayer-countdown { font-weight:bold; }
    .prayer-tooltip {
      pointer-events: none;
      opacity: 0.98;
      transition: opacity 0.12s;
    }
  `;
  document.head.appendChild(style);

// --- PRAYER ALTAR UI ---
// Check if the altar panel already exists
if (!document.getElementById('prayer-altar-panel')) {
  const altarPanel = document.createElement('div');
  altarPanel.id = 'prayer-altar-panel';
  altarPanel.className = 'panel';
  altarPanel.style = 'background:url("assets/chaos_altar.png.png") center/cover;border-radius:10px;box-shadow:0 2px 10px #000a;margin-top:8px;min-height:200px;position:relative;overflow:hidden;';

  altarPanel.innerHTML = `
    <!-- Dark overlay for better text readability -->
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(to bottom, transparent 0%, rgba(35,37,42,0.7) 60%, rgba(35,37,42,0.9) 100%);border-radius:10px;"></div>
    
    <!-- Content container -->
    <div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;padding:16px;">
      <button id="renew-prayer-btn" style="font-size:1.1em;font-weight:bold;background:#6cf;color:#23252a;border:none;border-radius:8px;padding:12px 24px;cursor:pointer;box-shadow:0 2px 8px #6cf4;margin-bottom:8px;">Renew Prayer</button>
      <div id="renew-prayer-msg" style="color:#6cf;font-size:0.98em;display:none;text-align:center;width:90%;margin-top:8px;text-shadow:0 1px 4px #000;"></div>
    </div>
  `;
  // Insert below prayer panel
  const prayerPanel = document.getElementById('prayer-panel');
  if (prayerPanel && prayerPanel.parentNode) {
    prayerPanel.parentNode.insertBefore(altarPanel, prayerPanel.nextSibling);
  }
  // Renew Prayer button logic - directly renew prayer without popup
  document.getElementById('renew-prayer-btn').onclick = function() {
    player.prayer = player.maxPrayer;
    updatePrayerUI();
    renderPlayerStats();
    const msg = document.getElementById('renew-prayer-msg');
    msg.textContent = '✨ Your prayer has been renewed at the altar! ✨';
    msg.style.display = 'block';
    setTimeout(() => {
      msg.style.display = 'none';
    }, 2000);
  };
}
// Popup helpers
function showCorruptSavePopup() {
  let oldPopup = document.getElementById('corrupt-save-popup');
  if (oldPopup) oldPopup.remove();
  const popup = document.createElement('div');
  popup.id = 'corrupt-save-popup';
  popup.style = 'position:fixed;z-index:9999;top:0;left:0;width:100vw;height:100vh;background:#191a1ecc;display:flex;align-items:center;justify-content:center;';
  popup.innerHTML = `
   <div style="background:#23252a;padding:38px 44px 32px 44px;border-radius:18px;box-shadow:0 2px 24px #000a;display:flex;flex-direction:column;align-items:center;min-width:340px;">
    <div style="color:#ff4444;font-size:1.5em;margin-bottom:18px;">Corrupt Save Detected!</div>
    <div style="margin-bottom:18px;color:#ffd36b;font-size:1.1em;">
      <b>Something is amiss in your save file...</b><br>
      The ancient magic cannot restore your progress.<br>
      <span style="color:#ffba3a;">Please check your save file and try again!</span>
    </div>
    <button onclick="document.getElementById('corrupt-save-popup').remove()" style="font-size:1.1em;font-weight:bold;background:#ff4444;color:#fff;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">OK</button>
   </div>
  `;
  document.body.appendChild(popup);
}

function showPassedSavePopup() {
  let oldPopup = document.getElementById('passed-save-popup');
  if (oldPopup) oldPopup.remove();
  const popup = document.createElement('div');
  popup.id = 'passed-save-popup';
  popup.style = 'position:fixed;z-index:9999;top:0;left:0;width:100vw;height:100vh;background:#191a1ecc;display:flex;align-items:center;justify-content:center;';
  popup.innerHTML = `
   <div style="background:#23252a;padding:38px 44px 32px 44px;border-radius:18px;box-shadow:0 2px 24px #000a;display:flex;flex-direction:column;align-items:center;min-width:340px;">
    <div style="color:#90ee90;font-size:1.5em;margin-bottom:18px;">Save Verified!</div>
    <div style="margin-bottom:18px;color:#ffd36b;font-size:1.1em;">
      <b>Your save file passed the ancient safety check.</b><br>
      The legend continues!
    </div>
    <button onclick="document.getElementById('passed-save-popup').remove()" style="font-size:1.1em;font-weight:bold;background:#ffba3a;color:#23252a;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">Continue</button>
   </div>
  `;
  document.body.appendChild(popup);
}

// Patch load input to add safety check using uploaded last-game-values.json
const mainLoadInput = document.getElementById('main-load-input');
if (mainLoadInput) {
  const origLoadHandler = mainLoadInput.onchange || null;
  mainLoadInput.onchange = function(e) {
   try {
    const file = e.target.files[0];
    if (!file) throw new Error('No file selected.');
    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
       const saveData = JSON.parse(evt.target.result);

       // Prompt user to upload last-game-values.json for strict check
       let lastValuesInput = document.createElement('input');
       lastValuesInput.type = 'file';
       lastValuesInput.accept = '.json,application/json';
       lastValuesInput.style.display = 'none';
       document.body.appendChild(lastValuesInput);

       lastValuesInput.onchange = function(ev) {
        const lastFile = ev.target.files[0];
        if (!lastFile) {
          showCorruptSavePopup();
          document.body.removeChild(lastValuesInput);
          return;
        }
        const lastReader = new FileReader();
        lastReader.onload = function(ev2) {
          let lastSaved = null;
          try {
           lastSaved = JSON.parse(ev2.target.result);
          } catch (e) { lastSaved = null; }
          let passed = (
           saveData &&
           typeof saveData.player === "object" &&
           Array.isArray(saveData.player.inventory) &&
           Array.isArray(saveData.player.bag) &&
           typeof saveData.player.equipment === "object" &&
           Array.isArray(saveData.player.bank) &&
           typeof saveData.visitedTowns === "object" &&
           typeof saveData.playerPosition === "object" &&
           typeof saveData.playerPosition.x === "number" &&
           typeof saveData.playerPosition.y === "number"
          );
          let strictValid = true;
          if (lastSaved) {
           strictValid =
            typeof saveData.player.gold === "number" && saveData.player.gold === lastSaved.gold &&
            typeof saveData.player.level === "number" && saveData.player.level === lastSaved.level &&
            typeof saveData.player.experience === "number" && saveData.player.experience === lastSaved.experience;
          }
          if (!passed || !strictValid) {
           showCorruptSavePopup();
           document.body.removeChild(lastValuesInput);
           return;
          }
          showPassedSavePopup();
          // Normal load logic
          initMap();
          Object.keys(visitedTowns).forEach(k => delete visitedTowns[k]);
          player.name = saveData.player.name || "Hero";
          player.health = typeof saveData.player.health === "number" ? saveData.player.health : 100;
          player.maxHealth = typeof saveData.player.maxHealth === "number" ? saveData.player.maxHealth : 100;
          player.gold = typeof saveData.player.gold === "number" ? saveData.player.gold : 0;
          player.experience = typeof saveData.player.experience === "number" ? saveData.player.experience : 0;
          player.level = typeof saveData.player.level === "number" ? saveData.player.level : 1;
          player.bankGold = typeof saveData.player.bankGold === "number" ? saveData.player.bankGold : 0;
          player.inventory = Array.isArray(saveData.player.inventory) ? JSON.parse(JSON.stringify(saveData.player.inventory)) : [];
          player.bag = Array.isArray(saveData.player.bag) ? JSON.parse(JSON.stringify(saveData.player.bag)) : [];
          player.equipment = typeof saveData.player.equipment === "object" && saveData.player.equipment !== null
           ? JSON.parse(JSON.stringify(saveData.player.equipment))
           : { helmet: null, weapon: null, armor: null, ring: null, arrows: null, cloak: null, shield: null, amulet: null, gloves: null, boots: null };
          player.bank = Array.isArray(saveData.player.bank) ? JSON.parse(JSON.stringify(saveData.player.bank)) : [];
          playerPosition.x = typeof saveData.playerPosition.x === "number" ? saveData.playerPosition.x : Math.floor(mapSize/2);
          playerPosition.y = typeof saveData.playerPosition.y === "number" ? saveData.playerPosition.y : Math.floor(mapSize/2);
          renderPlayerStats();
          renderDerivedStats();
          renderEquipment();
          renderBagInv();
          renderMap();
          alert('Game loaded from file! Map has been reset and player is at Central Town.');
          if (document.getElementById('username-overlay').style.display !== 'none') {
           document.getElementById('username-overlay').style.display = 'none';
           const overlayLoadBtn2 = document.getElementById('overlay-load-btn2');
           if (overlayLoadBtn2) overlayLoadBtn2.style.display = 'none';
          }
          document.body.removeChild(lastValuesInput);
        };
        lastReader.readAsText(lastFile);
       };

       // Prompt user to upload last-game-values.json
       alert('Please select your last-game-values.json file for safety check.');
       lastValuesInput.click();

      } catch (err) {
       alert('Failed to load save: ' + (err && err.message ? err.message : err));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
   } catch (err) {
    alert('Failed to load save: ' + (err && err.message ? err.message : err));
   }
   if (origLoadHandler) origLoadHandler.call(this, e);
  };
}

})();
