      function updateBankGoldLabels() {
        // Ensure bankGold is a valid number
        if (typeof player.bankGold !== 'number' || isNaN(player.bankGold)) {
          player.bankGold = 0;
        }
        document.getElementById('bank-gold-label').textContent = player.bankGold;
        renderPlayerStats();
      }
      document.getElementById('deposit-gold-btn').onclick = function() {
        const amt = parseInt(document.getElementById('deposit-gold-amount').value, 10);
        if (isNaN(amt) || amt <= 0) {
          alert('Enter a valid amount.');
          return;
        }
        if (player.gold < amt) {
          alert('Not enough gold to deposit.');
          return;
        }
        // Ensure bankGold is a number before operation
        if (typeof player.bankGold !== 'number' || isNaN(player.bankGold)) {
          player.bankGold = 0;
        }
        player.gold -= amt;
        player.bankGold += amt;
        updateBankGoldLabels();
        logMsg(`Deposited ${amt} gold to the bank.`);
        document.getElementById('deposit-gold-amount').value = '';
      };
      document.getElementById('withdraw-gold-btn').onclick = function() {
        const amt = parseInt(document.getElementById('withdraw-gold-amount').value, 10);
        if (isNaN(amt) || amt <= 0) {
          alert('Enter a valid amount.');
          return;
        }
        // Ensure bankGold is a number before operation
        if (typeof player.bankGold !== 'number' || isNaN(player.bankGold)) {
          player.bankGold = 0;
        }
        // Track failed withdrawal attempts
        if (!window._bankFailedAttempts) window._bankFailedAttempts = 0;
        if (!window._bankPenalty) window._bankPenalty = 10;
        if (!window._bankLockedUntil) window._bankLockedUntil = null;
        if (!window._bankLockedUser) window._bankLockedUser = null;

        // Bank lock logic: check both time and username
        if (
          window._bankLockedUntil &&
          Date.now() < window._bankLockedUntil &&
          window._bankLockedUser &&
          player.name === window._bankLockedUser
        ) {
          showBankLockedPopup();
          return;
        }

        if (player.bankGold < amt) {
          window._bankFailedAttempts++;
          let penalty = 0;
          if (window._bankFailedAttempts === 3) {
            penalty = 10;
            window._bankPenalty = 20;
            player.gold = Math.max(0, player.gold - penalty);
            alert(`The banker got fed up with you and took ${penalty} gold from your pocket!`);
            logMsg(`<span style="color:#ff4444;">The banker got fed up and took ${penalty} gold from you!</span>`);
            renderPlayerStats();
          } else if (window._bankFailedAttempts === 4) {
            penalty = 20;
            window._bankPenalty = 30;
            player.gold = Math.max(0, player.gold - penalty);
            alert(`The banker is furious and takes ${penalty} gold from you!`);
            logMsg(`<span style="color:#ff4444;">The banker is furious and takes ${penalty} gold from you!</span>`);
            renderPlayerStats();
          } else if (window._bankFailedAttempts === 5) {
            penalty = 30;
            player.gold = Math.max(0, player.gold - penalty);
            alert(`The banker shouts "Get lost, ${player.name}!" and takes ${penalty} gold. He slams the door in your face. The bank is now closed for 24 hours.`);
            logMsg(`<span style="color:#ff4444;">The banker shouts "Get lost, ${player.name}!" and takes ${penalty} gold. The bank is closed for 24 hours.</span>`);
            renderPlayerStats();
            // Lock the bank for 24 hours (in ms) and remember the user
            window._bankLockedUntil = Date.now() + 24 * 60 * 60 * 1000;
            window._bankLockedUser = player.name;
            window._bankFailedAttempts = 0;
            window._bankPenalty = 10;
            showBankLockedPopup();
          } else {
            alert('The bank keeper gives you a stern look: "This isn\'t free money, fool. Try to steal from me again and you\'ll regret it."');
          }
          return;
        } else {
          window._bankFailedAttempts = 0; // Reset on successful withdrawal
          window._bankPenalty = 10;
        }
        player.bankGold -= amt;
        player.gold += amt;
        updateBankGoldLabels();
        logMsg(`Withdrew ${amt} gold from the bank.`);
        document.getElementById('withdraw-gold-amount').value = '';

        // Helper: show bank locked popup with countdown and username
        function showBankLockedPopup() {
          let oldPopup = document.getElementById('bank-locked-popup');
          if (oldPopup) oldPopup.remove();
          const popup = document.createElement('div');
          popup.id = 'bank-locked-popup';
          popup.style = 'position:fixed;z-index:9999;top:0;left:0;width:100vw;height:100vh;background:#191a1ecc;display:flex;align-items:center;justify-content:center;';
          let remaining = Math.max(0, window._bankLockedUntil - Date.now());
          let hours = Math.floor(remaining / (1000 * 60 * 60));
          let mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          let secs = Math.floor((remaining % (1000 * 60)) / 1000);
          popup.innerHTML = `
            <div style="background:#23252a;padding:38px 44px 32px 44px;border-radius:18px;box-shadow:0 2px 24px #000a;display:flex;flex-direction:column;align-items:center;min-width:340px;">
              <div style="color:#ff4444;font-size:1.5em;margin-bottom:18px;">Bank Closed!</div>
              <div style="margin-bottom:18px;color:#ffd36b;font-size:1.1em;">
          <b>The banker has locked the doors for 24 hours.</b><br>
          <span style="color:#ffba3a;">${window._bankLockedUser ? `Sorry ${window._bankLockedUser}, you are not welcome right now.` : ""}</span><br>
          Try again later.<br>
          <span style="color:#ffba3a;">Time remaining:</span>
          <span id="bank-locked-countdown" style="color:#ff4444;font-weight:bold;">${hours.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}</span>
              </div>
              <button onclick="document.getElementById('bank-locked-popup').remove()" style="font-size:1.1em;font-weight:bold;background:#ff4444;color:#fff;border:none;border-radius:7px;padding:8px 32px;cursor:pointer;">OK</button>
            </div>
          `;
          document.body.appendChild(popup);

          // Countdown timer
          let interval = setInterval(() => {
            let remaining = Math.max(0, window._bankLockedUntil - Date.now());
            let hours = Math.floor(remaining / (1000 * 60 * 60));
            let mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            let secs = Math.floor((remaining % (1000 * 60)) / 1000);
            let label = document.getElementById('bank-locked-countdown');
            if (label) {
              label.textContent = `${hours.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
            }
            if (remaining <= 0) {
              clearInterval(interval);
              window._bankLockedUntil = null;
              window._bankLockedUser = null;
              let popup = document.getElementById('bank-locked-popup');
              if (popup) popup.remove();
            }
          }, 1000);
        }

        // Patch openBank to show locked popup if bank is locked for this user
        window._origOpenBank = window._origOpenBank || openBank;
        openBank = function() {
          if (
            window._bankLockedUntil &&
            Date.now() < window._bankLockedUntil &&
            window._bankLockedUser &&
            player.name === window._bankLockedUser
          ) {
            showBankLockedPopup();
            return;
          }
          window._origOpenBank();
        }
      };
