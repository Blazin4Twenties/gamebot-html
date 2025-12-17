    // Shop open logic with horizontal curtain effect
    const shopBanner = document.getElementById('shop-banner');
    const shopCurtain = document.getElementById('shop-curtain');
    const shopItemsList = document.getElementById('shop-items-list');
    const shopControls = document.getElementById('shop-controls');
    const openShopBtn = document.getElementById('open-shop-btn');
    const DATE_PASSWORD = "legend2025";
    openShopBtn.onclick = function() {
      shopCurtain.style.display = 'block';
      shopCurtain.style.opacity = '1';
      shopCurtain.style.transform = 'translateX(0)';
      // Animate curtain sliding to the right (horizontal)
      const anim = shopCurtain.animate([
        { opacity: 1, transform: 'translateX(0)' },
        { opacity: 1, transform: 'translateX(0)' },
        { opacity: 0, transform: 'translateX(100%)' }
      ], {
        duration: 1100,
        easing: 'cubic-bezier(.59,.22,.44,1.36)',
        fill: 'forwards'
      });
      anim.onfinish = function() {
        shopCurtain.style.display = 'none';
        shopBanner.style.display = 'none';
        shopItemsList.style.display = 'grid';
        shopControls.style.display = 'block';
        shopCurtain.style.transform = 'translateX(0)';
      };
    };
