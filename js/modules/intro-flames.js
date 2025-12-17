    // Show date overlay UI only on intro overlay, hide on all other overlays
    function updateDateOverlayVisibility() {
      var dateOverlay = document.getElementById('date-overlay-ui');
      var introOverlay = document.getElementById('intro-overlay');
      // List of overlays that should hide the date overlay
      var overlays = [
        'username-overlay', 'bank-modal-bg', 'special-seller-popup', 'town-popup',
        'ancient-boss-popup', 'multi-use-popup', 'panel-locations-popup'
      ];
      var otherVisible = overlays.some(function(id) {
        var el = document.getElementById(id);
        return el && el.style.display !== 'none' && el.style.display !== '';
      });
      if (dateOverlay) {
        if (introOverlay && introOverlay.style.display !== 'none' && !otherVisible) {
          dateOverlay.style.display = '';
        } else {
          dateOverlay.style.display = 'none';
        }
      }
    }
    document.addEventListener('DOMContentLoaded', updateDateOverlayVisibility);
    // Observe overlays for display changes
    [
      'intro-overlay', 'username-overlay', 'bank-modal-bg', 'special-seller-popup', 'town-popup',
      'ancient-boss-popup', 'multi-use-popup', 'panel-locations-popup'
    ].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) {
        var observer = new MutationObserver(updateDateOverlayVisibility);
        observer.observe(el, { attributes: true, attributeFilter: ['style'] });
      }
    });
