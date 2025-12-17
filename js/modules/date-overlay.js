  // Date overlay logic: show only on intro overlay, hide on all others
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
      if (introOverlay && introOverlay.style.display !== 'none' && introOverlay.style.display !== '' && !otherVisible) {
        dateOverlay.style.display = '';
      } else {
        dateOverlay.style.display = 'none';
      }
    }
  }

  // Helper: load/save dates from localStorage
  function getSavedDates() {
    try {
      return JSON.parse(localStorage.getItem('customDates') || '[]');
    } catch {
      return [];
    }
  }
  function saveDates(dates) {
    localStorage.setItem('customDates', JSON.stringify(dates));
  }
  function renderDateDropdown() {
    var dateDropdown = document.getElementById('update-date-dropdown');
    if (!dateDropdown) return;
    // Save current value
    var currentValue = dateDropdown.value;
    // Remove all except the default and add option
    while (dateDropdown.options.length > 0) dateDropdown.remove(0);
    var defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'Code update dates click to view';
    dateDropdown.appendChild(defaultOpt);
    var dates = getSavedDates();
    dates.forEach(function(date) {
      var opt = document.createElement('option');
      opt.value = date;
      opt.textContent = date;
      dateDropdown.appendChild(opt);
    });
    var addOpt = document.createElement('option');
    addOpt.value = '__add__';
    addOpt.style.color = '#ffba3a';
    addOpt.textContent = '➕ Add Date...';
    dateDropdown.appendChild(addOpt);
    // Restore value if possible
    if (dates.includes(currentValue)) dateDropdown.value = currentValue;
    else dateDropdown.value = '';
  }

  // Show password prompt, callback(true/false)
  function showDatePasswordPrompt(action, cb) {
    // Remove old popup if exists
    let old = document.getElementById('date-password-popup');
    if (old) old.remove();
    // Create popup
    const popup = document.createElement('div');
    popup.id = 'date-password-popup';
    popup.style = 'position:fixed;z-index:100001;top:0;left:0;width:100vw;height:100vh;background:#191a1ecc;display:flex;align-items:center;justify-content:center;';
    popup.innerHTML = `
      <div style="background:#23252a;padding:32px 38px 24px 38px;border-radius:18px;box-shadow:0 2px 24px #000a;display:flex;flex-direction:column;align-items:center;min-width:320px;">
        <div style="color:#ffba3a;font-size:1.1em;margin-bottom:18px;">Enter password to ${action} date</div>
        <input id="date-password-input" type="password" placeholder="Password..." style="font-size:1.1em;padding:6px 18px;border-radius:7px;border:1.5px solid #444;background:#18191c;color:#fff;margin-bottom:18px;width:180px;outline:none;">
        <div id="date-password-error" style="color:#ff4444;margin-bottom:10px;display:none;font-size:1em;"></div>
        <div style="display:flex;gap:18px;">
          <button id="date-password-ok" style="font-size:1.1em;font-weight:bold;background:#ffba3a;color:#23252a;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">OK</button>
          <button id="date-password-cancel" style="font-size:1.1em;font-weight:bold;background:#35373e;color:#ffba3a;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(popup);
    document.getElementById('date-password-ok').onclick = function() {
      const val = document.getElementById('date-password-input').value;
      if (val === DATE_PASSWORD) {
        popup.remove();
        cb(true);
      } else {
        document.getElementById('date-password-error').textContent = "Incorrect password.";
        document.getElementById('date-password-error').style.display = 'block';
      }
    };
    document.getElementById('date-password-cancel').onclick = function() {
      popup.remove();
      cb(false);
    };
    document.getElementById('date-password-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') document.getElementById('date-password-ok').click();
    });
    setTimeout(() => document.getElementById('date-password-input').focus(), 100);
  }

  document.addEventListener('DOMContentLoaded', function() {
    updateDateOverlayVisibility();
    renderDateDropdown();
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

    var dateDropdown = document.getElementById('update-date-dropdown');
    var removeDatesCheckbox = document.getElementById('enable-remove-dates');
    let removeMode = false;

    if (removeDatesCheckbox) {
      removeDatesCheckbox.addEventListener('change', function() {
        removeMode = removeDatesCheckbox.checked;
        // Optionally, visually indicate remove mode
        if (removeMode) {
          dateDropdown.style.background = '#ff4444';
          dateDropdown.style.color = '#fff';
        } else {
          dateDropdown.style.background = '';
          dateDropdown.style.color = '';
        }
      });
    }

    if (dateDropdown) {
      dateDropdown.addEventListener('change', function() {
        if (removeMode && dateDropdown.value && dateDropdown.value !== '' && dateDropdown.value !== '__add__') {
          // Prompt for password before removing
          showDatePasswordPrompt("remove", function(success) {
            if (!success) {
              dateDropdown.value = '';
              return;
            }
            var dates = getSavedDates();
            var idx = dates.indexOf(dateDropdown.value);
            if (idx !== -1) {
              if (confirm('Remove date "' + dateDropdown.value + '"?')) {
                dates.splice(idx, 1);
                saveDates(dates);
                renderDateDropdown();
                dateDropdown.value = '';
              } else {
                // If cancelled, reset dropdown
                dateDropdown.value = '';
              }
            } else {
              dateDropdown.value = '';
            }
          });
          return; // Prevent further logic if in remove mode
        }
        if (dateDropdown.value === '__add__') {
          // Prompt for password before adding
          showDatePasswordPrompt("add", function(success) {
            if (!success) {
              dateDropdown.value = '';
              return;
            }
            var newDate = prompt('Enter a new date (e.g. 2024-06-01):');
            if (newDate && newDate.trim()) {
              var dates = getSavedDates();
              if (!dates.includes(newDate)) {
                dates.push(newDate);
                saveDates(dates);
                renderDateDropdown();
                dateDropdown.value = newDate;
              } else {
                alert('Date already exists.');
                dateDropdown.value = '';
              }
            } else {
              dateDropdown.value = '';
            }
          });
        }
      });
    }
  });
