  // Set initial display state - show main intro overlay on load
  window.addEventListener('DOMContentLoaded', function() {
    // Hide the old character select overlay since we have it integrated in main intro
    const oldCharSelect = document.getElementById('character-select-overlay');
    if (oldCharSelect) oldCharSelect.style.display = 'none';
    
    // Hide intro overlay initially
    const introOverlay = document.getElementById('intro-overlay');
    if (introOverlay) introOverlay.style.display = 'none';
    
    // Show main intro overlay
    const mainIntroOverlay = document.getElementById('main-intro-overlay');
    if (mainIntroOverlay) mainIntroOverlay.style.display = 'flex';
    
    // Hide game UI initially
    const mainContainer = document.getElementById('container');
    if (mainContainer) mainContainer.style.display = 'none';
    
    [
      'main-save-ui', 'explore-bar', 'direction-select-bar', 'prayer-panel', 'prayer-altar-panel', 'panel-locations-btn'
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  });
