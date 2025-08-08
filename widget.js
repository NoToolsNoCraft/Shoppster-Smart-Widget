const initialData = {
  user: {
    id: "123456",
    name: "",
    isSBB: false,
    tier: "Smart",
    sbbStatus: "active",
    benefits: {
      smart: ["Besplatna dostava na Paketomatima", "Smart Izbor dvonedeljna ponuda", "Ponuda dana utorkom i četvrtkom"],
      smartConnect: ["Besplatna dostava na Paketomatima", "Smart Izbor dvonedeljna ponuda", "Ponuda dana utorkom i četvrtkom", "Redovna Connect mesečna ponuda (10-50% popusta)", "Connect shopping vikend jednom mesečno"]
    }
  }
};

function loadUserData() {
  const savedData = localStorage.getItem('shoppsterSmartLoyaltyData');

  // Always return a clone of initialData when no saved data exists
  return savedData ? JSON.parse(savedData) : JSON.parse(JSON.stringify(initialData));
}

function saveUserData(data) {
  localStorage.setItem('shoppsterSmartLoyaltyData', JSON.stringify(data));
}

window.handleLogin = function(isSBB = false) {
  const nameInput = document.getElementById('login-name');
  const sbbInput = document.getElementById('sbb-login');
  const name = nameInput ? nameInput.value.trim() : "";
  const sbbId = sbbInput ? sbbInput.value.trim() : "";
  const errorElement = document.querySelector('.login-error');

  if (errorElement) {
    errorElement.remove();
  }

  const loginSection = document.querySelector('.login-section');
  const errorDiv = document.createElement('div');
  errorDiv.className = 'login-error';

  if (!isSBB && !name) {
    errorDiv.textContent = 'Molimo unesite vaše ime za pridruživanje!';
    loginSection.appendChild(errorDiv);
    return;
  }

  if (isSBB && !sbbId) {
    errorDiv.textContent = 'Molimo unesite SBB ID za prijavu!';
    loginSection.appendChild(errorDiv);
    console.log('SBB login attempted with empty SBB ID'); // Debug log
    return;
  }

  let data = loadUserData();
  data.user.name = isSBB ? "SBB Korisnik" : name;
  data.user.isSBB = isSBB;
  data.user.tier = isSBB ? "Smart Connect" : "Smart";
  data.user.sbbStatus = isSBB ? "active" : "";
  saveUserData(data);
  const loginPrompt = document.querySelector('.login-prompt');
  const mockContent = document.querySelector('.mock-content');
  if (loginPrompt) loginPrompt.style.display = 'none';
  if (mockContent) mockContent.style.display = 'block';
  updateWidget(data);
  console.log(`Login successful: ${isSBB ? 'SBB user' : 'Regular user'}`); // Debug log
};

function handleLogout() {
  console.log('Logout initiated');
  localStorage.removeItem('shoppsterSmartLoyaltyData');

  const loginPrompt = document.querySelector('.login-prompt');
  const mockContent = document.querySelector('.mock-content');
  if (loginPrompt) loginPrompt.style.display = 'block';
  if (mockContent) mockContent.style.display = 'none';

  const freshData = loadUserData(); // will return clean version
  updateWidget(freshData);

  const panel = document.getElementById('loyalty-widget-panel');
  if (panel) {
    panel.classList.remove('open');
  }

  console.log('Widget updated to non-logged-in state');
}



function getNextOfferCountdown() {
  const now = new Date();
  const nextTuesday = new Date(now);
  nextTuesday.setDate(now.getDate() + ((2 + 7 - now.getDay()) % 7));
  nextTuesday.setHours(9, 0, 0, 0);
  const diff = nextTuesday - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `Sledeća Ponuda dana za ${days} dana, ${hours} sati!`;
}

function createWidget() {
  localStorage.removeItem('loyaltyData');
  const data = loadUserData();
  const root = document.getElementById('loyalty-widget-root');

  const button = document.createElement('button');
  button.id = 'loyalty-widget-button';
  button.innerHTML = '🎁 Shoppster Smart Nagrade';
  root.appendChild(button);

  const panel = document.createElement('div');
  panel.id = 'loyalty-widget-panel';
  root.appendChild(panel);

  window.updateWidget = function(data) {
    panel.innerHTML = '';
    
    if (!data.user.name) {
      panel.innerHTML = `
        <button class="close-button" aria-label="Zatvori panel">✕</button>
        <div class="panel-content" aria-label="Shoppster Smart Program">
          <h2>Pridružite se Shoppster Smart Programu!</h2>
          <div class="promo-section">
            <p class="promo-intro">Otključajte ekskluzivne pogodnosti odmah nakon registracije!</p>
            <div class="promo-benefit">
              <span class="promo-icon">🛒</span>
              <div>
                <h3>Besplatna Dostava</h3>
                <p>Uživajte u besplatnoj dostavi na Paketomatima širom Srbije.</p>
              </div>
            </div>
            <div class="promo-benefit">
              <span class="promo-icon">🏆</span>
              <div>
                <h3>Smart Izbor i Ponuda Dana</h3>
                <p>Kupujte po povlašćenim cenama uz dvonedeljne ponude i dnevne akcije.</p>
              </div>
            </div>
            <div class="promo-benefit">
              <span class="promo-icon">🎁</span>
              <div>
                <h3>Smart Connect za SBB Korisnike</h3>
                <p>Povežite MojSBB nalog za popuste do 50% i ekskluzivne mesečne ponude.</p>
              </div>
            </div>
            <p class="promo-cta">Kako funkcioniše: Prijavite se ili povežite MojSBB nalog za trenutne pogodnosti!</p>
            <div class="login-section">
              <input type="text" id="login-name" placeholder="Unesite vaše ime" aria-label="Ime" />
              <input type="text" id="sbb-login" placeholder="Unesite SBB ID (opciono)" aria-label="SBB ID" />
              <button onclick="handleLogin(false)" aria-label="Pridruži se Smart programu">Pridruži se</button>
              <button onclick="handleLogin(true)" aria-label="Prijavi se sa SBB nalogom">Prijavi se sa SBB</button>
            </div>
            <p class="privacy-notice">Vaši podaci (ime, email, SBB ID) koriste se isključivo za Smart program. <a href="https://shoppster.rs/politika-privatnosti" target="_blank">Politika privatnosti</a></p>
          </div>
        </div>
      `;
    } else {
      const benefits = data.user.isSBB ? data.user.benefits.smartConnect : data.user.benefits.smart;
      const sbbStatus = data.user.isSBB ? (data.user.sbbStatus === "active" ? "Povezan MojSBB nalog" : "SBB usluge nisu aktivne, prebačeni ste na Smart nivo") : "";
      panel.innerHTML = `
        <button class="close-button" aria-label="Zatvori panel">✕</button>
        <div class="panel-content" aria-label="Vaše Shoppster Smart pogodnosti">
          <h2>Dobro došli, ${data.user.name}! Uživajte u Smart pogodnostima odmah!</h2>
          <div class="tier-section">
            <h3>Vaš Nivo: ${data.user.tier}</h3>
            <div class="tier-container">
              <div class="tier">
                <div class="tier-badge tier-smart${data.user.tier === 'Smart' || data.user.tier === 'Smart Connect' ? '' : ' tier-locked'}" aria-label="Smart nivo">
                  ${data.user.tier === 'Smart' || data.user.tier === 'Smart Connect' ? '✓' : '🔒'}
                </div>
                <p>Smart</p>
              </div>
              <div class="tier placeholder"></div>
              <div class="tier">
                <div class="tier-badge tier-smart-connect${data.user.tier === 'Smart Connect' ? '' : ' tier-locked'}" aria-label="Smart Connect nivo">
                  ${data.user.tier === 'Smart Connect' ? '✓' : '🔒'}
                </div>
                <p>Smart Connect</p>
              </div>
            </div>
          </div>
          ${data.user.isSBB ? `
            <div class="sbb-status-section">
              <h3>SBB Status</h3>
              <p>${sbbStatus}</p>
              <button class="sbb-status-button" aria-label="Proveri SBB status">Proveri status</button>
            </div>
          ` : ''}
          <div class="benefits-section">
            <h3>Vaše Pogodnosti</h3>
            <ul class="benefits-list">
              ${benefits.map(benefit => `<li>${benefit}</li>`).join('')}
            </ul>
          </div>
          <div class="offers-section">
            <h3>Trenutne Ponude</h3>
            <div class="offer-card">
              <h4>Ponuda Dana</h4>
              <p>30% popusta na TV! Vredi samo danas.</p>
              <button class="offer-button" aria-label="Pogledaj Ponudu Dana">Pogledaj Ponudu</button>
            </div>
            <div class="offer-card">
              <h4>Smart Izbor</h4>
              <p>Bela tehnika uz 20% popusta, vredi do kraja nedelje.</p>
              <button class="offer-button" aria-label="Pogledaj Smart Izbor">Pogledaj Ponudu</button>
            </div>
            ${data.user.isSBB ? `
              <div class="offer-card">
                <h4>Connect Mesečna Ponuda</h4>
                <p>50 artikala sa popustima do 50%!</p>
                <button class="offer-button" aria-label="Pogledaj Connect Mesečnu Ponudu">Pogledaj Ponudu</button>
              </div>
              <div class="offer-card">
                <h4>Connect Shopping Vikend</h4>
                <p>Ekskluzivne cene 15-16. avgusta!</p>
                <button class="offer-button" aria-label="Pogledaj Connect Shopping Vikend">Pogledaj Ponudu</button>
              </div>
            ` : ''}
            <p class="countdown-timer">${getNextOfferCountdown()}</p>
          </div>
          <button class="logout-button" aria-label="Odjavi se iz Smart programa">Odjavi se</button>
          <p class="privacy-notice">Vaši podaci su zaštićeni. Za više informacija, pogledajte <a href="https://shoppster.rs/politika-privatnosti" target="_blank" aria-label="Politika privatnosti">Politika privatnosti</a>.</p>
        </div>
      `;
    }

    const closeButton = panel.querySelector('.close-button');
    if (closeButton) {
      closeButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        panel.classList.remove('open');
        console.log('Panel closed'); // Debug log
      });
    }

    const logoutButton = panel.querySelector('.logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        handleLogout();
      });
    }

    const panelContent = panel.querySelector('.panel-content');
    if (panelContent) {
      const updateScrollCue = () => {
        if (panelContent.scrollHeight > panelContent.clientHeight) {
          panelContent.classList.add('scrollable');
        } else {
          panelContent.classList.remove('scrollable');
        }
      };
      panelContent.addEventListener('scroll', updateScrollCue);
      updateScrollCue();
    }
  };

  updateWidget(data);

  if (data.user.name) {
    const loginPrompt = document.querySelector('.login-prompt');
    const mockContent = document.querySelector('.mock-content');
    if (loginPrompt) loginPrompt.style.display = 'none';
    if (mockContent) mockContent.style.display = 'block';
  } else {
    const loginPrompt = document.querySelector('.login-prompt');
    const mockContent = document.querySelector('.mock-content');
    if (loginPrompt) loginPrompt.style.display = 'block';
    if (mockContent) mockContent.style.display = 'none';
  }

  button.addEventListener('click', () => {
    panel.classList.add('open');
    updateWidget(loadUserData());
  });
}


document.addEventListener('DOMContentLoaded', createWidget);
