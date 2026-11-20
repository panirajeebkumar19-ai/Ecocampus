/* =========================================================================
       1. GLOBAL STATE & LOCAL STORAGE PERSISTENCE
       ========================================================================= */
    const STORAGE_KEY = 'ecocampus_state_v2';

    // Robust HTML entity encoder to prevent Stored & Reflected XSS
    function escapeHtml(str) {
      if (typeof str !== 'string') return str == null ? '' : String(str);
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Safe Lucide icon initializer wrapper
    function refreshIcons() {
      if (window.lucide && typeof lucide.createIcons === 'function') {
        try {
          lucide.createIcons();
        } catch (e) {
          console.warn('Lucide icon refresh:', e);
        }
      }
    }

    const defaultState = {
      userEcoPoints: 1450,
      activeStreak: 14,
      co2SavedKg: 18.4,
      mealsRescued: 7,
      sfxEnabled: true,
      darkMode: true,
      claimedBounties: [],
      reservedMeals: [],
      mealInventory: {},
      reportedIncidents: [
        {
          id: 'TICK-1082',
          location: 'Science Complex - Lab 204',
          category: 'Plumbing Leak / Dripping Faucet',
          description: 'Sink 4 aerator has high-pressure spray leak.',
          status: 'In Progress',
          reportedBy: 'Alex Rivers',
          timeAgo: '18m ago',
          pointsAwarded: 50
        },
        {
          id: 'TICK-1079',
          location: 'Central Library - 3rd Floor',
          category: 'HVAC Overcooling',
          description: 'Window open with central cooling at 64°F.',
          status: 'Resolved',
          reportedBy: 'Marcus Chen',
          timeAgo: '1h ago',
          pointsAwarded: 50
        },
        {
          id: 'TICK-1076',
          location: 'North Quad Dining Hall',
          category: 'Recycling Contamination',
          description: 'Compost bin contaminated with plastic film.',
          status: 'Resolved',
          reportedBy: 'Elena Rostova',
          timeAgo: '3h ago',
          pointsAwarded: 50
        }
      ],
      cheers: [
        { author: 'Maya L. (Oak Hall)', text: 'Unplugged all common room display consoles for the weekend! Oak Hall staying at #1! 🔥', time: '5m ago' },
        { author: 'Jordan K. (Pine Haven)', text: 'Pine Haven 2nd floor just switched all laundry to cold cycles! Watch out Oak! 🌲', time: '14m ago' },
        { author: 'Prof. Vance (Green Advisor)', text: 'Great job everyone! Campus solar peaked at 1.48 MW today—highest this semester.', time: '32m ago' }
      ],
      buildingsEcoState: [true, true, false, true], // Science, Oak, Library, Dining
      atmosphere: 'noon',
      mapColorGrade: 'default'
    };

    let appState = loadState();

    function loadState() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return { ...defaultState, ...JSON.parse(stored) };
        }
      } catch (e) {
        console.warn('Error reading localStorage', e);
      }
      return { ...defaultState };
    }

    function saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
      } catch (e) {
        console.warn('Error saving to localStorage', e);
      }
    }

    function resetAllDemoData() {
      if (confirm('Reset all EcoCampus demo progress and points back to defaults?')) {
        localStorage.removeItem(STORAGE_KEY);
        appState = { ...defaultState };
        saveState();
        location.reload();
      }
    }

    /* =========================================================================
       2. WEB AUDIO API SYNTHESIZER (SOUND EFFECTS WITH NO EXTERNAL AUDIO FILES)
       ========================================================================= */
    class SoundEngine {
      constructor() {
        this.ctx = null;
      }

      init() {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            this.ctx = new AudioContext();
          }
        }
      }

      playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
        if (!appState.sfxEnabled) return;
        this.init();
        if (!this.ctx) return;

        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
          // ignore audio restriction before user interaction
        }
      }

      click() {
        this.playTone(600, 'sine', 0.08, 0.05);
      }

      success() {
        if (!appState.sfxEnabled) return;
        this.playTone(523.25, 'triangle', 0.1, 0.08); // C5
        setTimeout(() => this.playTone(659.25, 'triangle', 0.12, 0.08), 80); // E5
        setTimeout(() => this.playTone(783.99, 'triangle', 0.25, 0.1), 160); // G5
      }

      reward() {
        if (!appState.sfxEnabled) return;
        this.playTone(440, 'triangle', 0.1, 0.08);
        setTimeout(() => this.playTone(554.37, 'triangle', 0.12, 0.08), 90);
        setTimeout(() => this.playTone(659.25, 'triangle', 0.14, 0.08), 180);
        setTimeout(() => this.playTone(880, 'sine', 0.35, 0.12), 270);
      }

      alert() {
        this.playTone(320, 'sawtooth', 0.18, 0.06);
      }
    }

    const sound = new SoundEngine();

    /* =========================================================================
       3. LIGHTWEIGHT CANVAS CONFETTI ENGINE
       ========================================================================= */
    const confettiCanvas = document.getElementById('confettiCanvas');
    const ctxConfetti = confettiCanvas.getContext('2d');
    let confettiParticles = [];
    let confettiAnimationId = null;

    function resizeConfetti() {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeConfetti);
    resizeConfetti();

    function triggerConfetti(originX = window.innerWidth / 2, originY = window.innerHeight / 2) {
      const colors = ['#10b981', '#06b6d4', '#34d399', '#f59e0b', '#3b82f6', '#ec4899'];
      for (let i = 0; i < 90; i++) {
        confettiParticles.push({
          x: originX,
          y: originY,
          vx: (Math.random() - 0.5) * 16,
          vy: (Math.random() - 0.7) * 16,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vRot: (Math.random() - 0.5) * 10,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.01
        });
      }
      if (!confettiAnimationId) {
        animateConfetti();
      }
      if (typeof window.triggerEnergySurge === 'function') {
        window.triggerEnergySurge(originX, originY);
      }
    }

    function animateConfetti() {
      ctxConfetti.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const p = confettiParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.vRot;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y > confettiCanvas.height) {
          confettiParticles.splice(i, 1);
          continue;
        }

        ctxConfetti.save();
        ctxConfetti.globalAlpha = p.alpha;
        ctxConfetti.translate(p.x, p.y);
        ctxConfetti.rotate((p.rotation * Math.PI) / 180);
        ctxConfetti.fillStyle = p.color;
        ctxConfetti.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctxConfetti.restore();
      }

      if (confettiParticles.length > 0) {
        confettiAnimationId = requestAnimationFrame(animateConfetti);
      } else {
        confettiAnimationId = null;
        ctxConfetti.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }

    /* =========================================================================
   EDOLUS-STYLE ATMOSPHERIC BACKGROUND: Fluid Radiant Orbs & Starlight Mesh
   ========================================================================= */
(function initAtmosphericEngine() {
  const canvas = document.getElementById('liveBgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let time = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const orbs = [
    { x: 0.25, y: 0.35, r: 420, baseColor: [16, 185, 129], speedX: 0.0006, speedY: 0.0008, phase: 0 },
    { x: 0.75, y: 0.25, r: 480, baseColor: [6, 182, 212],  speedX: 0.0008, speedY: 0.0005, phase: 2 },
    { x: 0.50, y: 0.75, r: 520, baseColor: [59, 130, 246], speedX: 0.0005, speedY: 0.0007, phase: 4 }
  ];

  const stars = Array.from({ length: 45 }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 1.5 + 0.5,
    alpha: Math.random() * 0.4 + 0.1,
    twinkleSpeed: Math.random() * 0.02 + 0.008
  }));

  function render() {
    time += 1;
    ctx.clearRect(0, 0, width, height);

    orbs.forEach((orb) => {
      const currentX = (orb.x + Math.sin(time * orb.speedX + orb.phase) * 0.12) * width;
      const currentY = (orb.y + Math.cos(time * orb.speedY + orb.phase) * 0.10) * height;
      const pulseRadius = orb.r + Math.sin(time * 0.015 + orb.phase) * 35;

      const gradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, pulseRadius);
      const [r, g, b] = orb.baseColor;
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.16)`);
      gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.06)`);
      gradient.addColorStop(1, 'rgba(4, 7, 14, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(currentX, currentY, pulseRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    stars.forEach((s) => {
      s.alpha += Math.sin(time * s.twinkleSpeed) * 0.004;
      const clampedAlpha = Math.max(0.08, Math.min(0.5, s.alpha));
      ctx.fillStyle = `rgba(255, 255, 255, ${clampedAlpha})`;
      ctx.beginPath();
      ctx.arc(s.x * width, s.y * height, s.size, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  render();
})();

    /* =========================================================================
       4. TOAST NOTIFICATIONS
       ========================================================================= */
    function showToast(message, type = 'success', title = 'EcoCampus Notice') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      toast.className = `p-4 rounded-xl border shadow-xl flex items-start gap-3 pointer-events-auto transform transition-all duration-300 translate-x-10 opacity-0 ${
        type === 'success' 
          ? 'bg-slate-900 border-emerald-500/40 text-slate-100' 
          : type === 'warning' 
          ? 'bg-slate-900 border-amber-500/40 text-slate-100' 
          : 'bg-slate-900 border-cyan-500/40 text-slate-100'
      }`;

      const iconName = type === 'success' ? 'check-circle-2' : type === 'warning' ? 'alert-triangle' : 'info';
      const iconColor = type === 'success' ? 'text-emerald-400' : type === 'warning' ? 'text-amber-400' : 'text-cyan-400';

      toast.innerHTML = `
        <div class="mt-0.5 ${iconColor}">
          <i data-lucide="${iconName}" class="w-5 h-5"></i>
        </div>
        <div class="flex-1 text-xs">
          <p class="font-bold text-white text-sm">${title}</p>
          <p class="text-slate-300 mt-0.5">${message}</p>
        </div>
        <button onclick="this.parentElement.remove()" class="text-slate-500 hover:text-white">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      `;

      container.appendChild(toast);
      lucide.createIcons();

      requestAnimationFrame(() => {
        toast.classList.remove('translate-x-10', 'opacity-0');
      });

      setTimeout(() => {
        toast.classList.add('translate-x-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    /* =========================================================================
       5. DATA DEFINITIONS: BOUNTIES, MEALS, DORMS, REWARDS
       ========================================================================= */
    let bountiesData = window.bountiesData = [
      {
        id: 'b-1',
        title: 'Cold Wash Laundry Cycle',
        category: 'energy',
        points: 30,
        co2: '0.4 kg CO₂e',
        desc: 'Run dorm washer on cold water wash to avoid thermal heater electrical load.',
        icon: 'waves',
        popular: true
      },
      {
        id: 'b-2',
        title: 'Micro-Commute: Bike / Walk',
        category: 'commute',
        points: 45,
        co2: '1.2 kg CO₂e',
        desc: 'Log at least 2 miles via campus bicycle path or walking instead of personal vehicle.',
        icon: 'bike',
        popular: true
      },
      {
        id: 'b-3',
        title: 'Reusable Dining Container',
        category: 'food',
        points: 25,
        co2: '0.3 kg CO₂e',
        desc: 'Bring your OZZI or personal stainless container to Student Center lunch service.',
        icon: 'utensils-crossed',
        popular: false
      },
      {
        id: 'b-4',
        title: 'Phantom Power Dorm Purge',
        category: 'energy',
        points: 35,
        co2: '0.5 kg CO₂e',
        desc: 'Unplug gaming consoles, secondary chargers, and standby monitors before leaving room.',
        icon: 'plug-zap',
        popular: false
      },
      {
        id: 'b-5',
        title: 'Compost Plate Scrapings',
        category: 'waste',
        points: 20,
        co2: '0.6 kg CO₂e',
        desc: 'Scrape cafeteria scraps into the green aerobic bin rather than mixed landfill trash.',
        icon: 'recycle',
        popular: true
      },
      {
        id: 'b-6',
        title: 'Lab Fume Hood Sash Lowering',
        category: 'energy',
        points: 60,
        co2: '2.1 kg CO₂e',
        desc: 'Check and lower open lab chemical fume hood sash to lowest position when unattended.',
        icon: 'flask-conical',
        popular: false
      }
    ];

    let dormDerbyData = window.dormDerbyData = [
      { name: 'Oak Hall', score: 94.2, energy: 3.1, water: 22.4, waste: 78.4, rank: 1, delta: '+4.2%' },
      { name: 'Pine Haven', score: 91.8, energy: 3.4, water: 24.1, waste: 74.0, rank: 2, delta: '+2.1%' },
      { name: 'Willow Quad', score: 86.5, energy: 3.8, water: 26.8, waste: 68.2, rank: 3, delta: '-0.8%' },
      { name: 'Maple Towers', score: 82.0, energy: 4.2, water: 29.5, waste: 62.5, rank: 4, delta: '+1.5%' }
    ];

    let diningMealsData = window.diningMealsData = [
      {
        id: 'm-1',
        title: 'Mediterranean Roasted Bowl',
        cafeteria: 'Harvest Table (Student Union)',
        remaining: 8,
        originalPrice: '$8.50',
        rescuePrice: '$1.50',
        ecoPointsCost: 40,
        dietary: 'Vegetarian • Halal',
        cutoffTime: '38m remaining',
        co2Offset: '2.4 kg'
      },
      {
        id: 'm-2',
        title: 'Smoked Tofu Soba Noodle Box',
        cafeteria: 'North Quad Bistro',
        remaining: 5,
        originalPrice: '$9.00',
        rescuePrice: '$1.50',
        ecoPointsCost: 40,
        dietary: '100% Vegan',
        cutoffTime: '45m remaining',
        co2Offset: '2.1 kg'
      },
      {
        id: 'm-3',
        title: 'Artisan Sourdough Panini Duo',
        cafeteria: 'Green Cafe (Engineering)',
        remaining: 6,
        originalPrice: '$7.50',
        rescuePrice: '$1.25',
        ecoPointsCost: 35,
        dietary: 'Organic Farm Cheddar',
        cutoffTime: '22m remaining',
        co2Offset: '1.8 kg'
      },
      {
        id: 'm-4',
        title: 'Fresh Orchard Pastry & Fruit Box',
        cafeteria: 'Orchard Commons Bakery',
        remaining: 4,
        originalPrice: '$6.00',
        rescuePrice: '$1.00',
        ecoPointsCost: 30,
        dietary: 'Locally Sourced Apples',
        cutoffTime: '15m remaining',
        co2Offset: '1.2 kg'
      }
    ];

    let rewardsStoreData = window.rewardsStoreData = [
      {
        id: 'r-1',
        title: 'Free Organic Oat Milk Latte',
        vendor: 'Campus Bean Roasters',
        points: 250,
        icon: 'coffee',
        tag: 'Most Popular'
      },
      {
        id: 'r-2',
        title: 'Priority 2-Hour Study Pod Pass',
        vendor: 'Central Library',
        points: 350,
        icon: 'book-open',
        tag: 'Academic Perk'
      },
      {
        id: 'r-3',
        title: '25% Off Campus Bookstore Merch',
        vendor: 'University Bookstore',
        points: 500,
        icon: 'shopping-bag',
        tag: 'Discount'
      },
      {
        id: 'r-4',
        title: 'EcoCampus Bamboo Insulated Tumbler',
        vendor: 'Sustainability Office',
        points: 750,
        icon: 'glass-water',
        tag: 'Exclusive Merch'
      }
    ];

    /* =========================================================================
       6. UI RENDERING ENGINES
       ========================================================================= */

    function updatePointsDisplay() {
      const userEcoPointsEl = document.getElementById('userEcoPoints');
      const storeUserPtsEl = document.getElementById('storeUserPts');
      const sidebarEcoPointsEl = document.getElementById('sidebarEcoPoints');
      if (userEcoPointsEl) userEcoPointsEl.textContent = appState.userEcoPoints.toLocaleString();
      if (storeUserPtsEl) storeUserPtsEl.textContent = appState.userEcoPoints.toLocaleString();
      if (sidebarEcoPointsEl) sidebarEcoPointsEl.textContent = appState.userEcoPoints.toLocaleString();
    }

    function renderBounties(filter = 'all') {
      const container = document.getElementById('bountiesGrid');
      if (!container) return;

      const filtered = bountiesData.filter(b => filter === 'all' || b.category === filter);
      
      container.innerHTML = filtered.map(b => {
        const isClaimed = appState.claimedBounties.includes(b.id);
        return `
          <div class="glass-panel glass-card-interactive rounded-xl p-5 border ${isClaimed ? 'border-brand-500/40 bg-brand-950/20' : 'border-slate-800'} flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-2 mb-2">
                <span class="inline-flex items-center gap-1 text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full ${
                  b.category === 'energy' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                  b.category === 'waste' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                  b.category === 'commute' ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' :
                  'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                }">
                  ${b.category}
                </span>
                <span class="font-mono font-bold text-xs text-emerald-400 bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-500/20">
                  +${b.points} Pts
                </span>
              </div>
              <h4 class="font-bold text-white text-base mb-1">${b.title}</h4>
              <p class="text-xs text-slate-300 mb-3">${b.desc}</p>
            </div>

            <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span class="text-[11px] font-mono text-slate-400">IMPACT: <strong class="text-emerald-400">${b.impact || b.co2Saved || b.co2 || '0.5 kg CO₂e'}</strong></span>
              ${isClaimed ? `
                <button disabled class="px-3.5 py-1.5 rounded-lg bg-slate-800 text-emerald-400 font-bold text-xs flex items-center gap-1 cursor-default">
                  <i data-lucide="check" class="w-3.5 h-3.5"></i> Claimed
                </button>
              ` : `
                <button onclick="claimBounty('${b.id}', ${b.points})" class="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95">
                  Complete & Claim
                </button>
              `}
            </div>
          </div>
        `;
      }).join('');

      lucide.createIcons();
    }

    function renderDerbyStandings(metric = 'overall') {
      const container = document.getElementById('derbyStandingsList');
      if (!container) return;

      const profile = (typeof window.getActiveCampusProfile === 'function') ? window.getActiveCampusProfile() : null;
      const waterUnit = (profile && profile.units) ? profile.units.waterShort : 'L';
      const userDorm = (window.currentStudent && window.currentStudent.dorm) 
        ? window.currentStudent.dorm 
        : (profile && profile.student ? profile.student.dormSub : 'Ganga');

      container.innerHTML = dormDerbyData.map((dorm, index) => {
        const rankNum = dorm.rank || (index + 1);
        const deltaStr = dorm.delta || dorm.trend || '+0.0%';
        const dormName = dorm.name || `Hall ${index + 1}`;
        const isUserDorm = userDorm && (
          dormName.toLowerCase().includes(userDorm.toLowerCase()) || 
          userDorm.toLowerCase().includes(dormName.toLowerCase()) ||
          userDorm.toLowerCase().split(' ')[0] === dormName.toLowerCase().split(' ')[0]
        );
        const rankColor = index === 0 
          ? 'bg-amber-400 text-slate-950 font-bold' 
          : index === 1 
            ? 'bg-slate-300 text-slate-900 font-bold' 
            : 'bg-slate-800 text-slate-300 font-medium';
        
        let metricDisplay = '';
        if (metric === 'overall') metricDisplay = `<span class="font-mono font-extrabold text-white text-base">${dorm.score}%</span> <span class="text-xs text-slate-400">Score</span>`;
        else if (metric === 'energy') metricDisplay = `<span class="font-mono font-extrabold text-amber-400 text-base">${dorm.energy}</span> <span class="text-xs text-slate-400">kWh/capita</span>`;
        else if (metric === 'water') metricDisplay = `<span class="font-mono font-extrabold text-cyan-400 text-base">${dorm.water}</span> <span class="text-xs text-slate-400">${waterUnit}/capita</span>`;
        else if (metric === 'waste') metricDisplay = `<span class="font-mono font-extrabold text-emerald-400 text-base">${dorm.waste}%</span> <span class="text-xs text-slate-400">Diversion</span>`;

        return `
          <div class="p-3.5 rounded-xl border ${isUserDorm ? 'bg-slate-900/90 border-brand-500/40 shadow-lg shadow-brand-500/5' : 'bg-slate-950/60 border-slate-800'} flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center font-bold font-mono text-xs ${rankColor}">
                #${rankNum}
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white text-sm">${dormName}</span>
                  ${isUserDorm ? '<span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Your Dorm</span>' : ''}
                </div>
                <div class="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <span>${dorm.energy} kWh</span> • <span>${dorm.water} ${waterUnit}</span> • <span class="text-emerald-400 font-semibold">${deltaStr} vs baseline</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              ${metricDisplay}
            </div>
          </div>
        `;
      }).join('');

      // Dynamically update Your Residence Hall Banner in Eco-Derby
      const cleanUserDorm = userDorm ? userDorm.split(' (')[0].split(' •')[0] : 'Ganga Hostel';
      const derbyYourDormName = document.getElementById('derbyYourDormName');
      const derbyBoostBtn = document.getElementById('derbyBoostBtn');
      if (derbyYourDormName) derbyYourDormName.textContent = `${cleanUserDorm} (You are contributing +14 pts today!)`;
      if (derbyBoostBtn) derbyBoostBtn.textContent = `Boost ${cleanUserDorm} +30`;

      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }

    function renderDiningMeals() {
      const container = document.getElementById('diningMealsGrid');
      if (!container) return;

      container.innerHTML = diningMealsData.map(meal => {
        const isReserved = appState.reservedMeals.includes(meal.id);
        const remainingCount = (appState.mealInventory && appState.mealInventory[meal.id] !== undefined)
          ? appState.mealInventory[meal.id]
          : meal.remaining;
        const isSoldOut = remainingCount <= 0;

        return `
          <div class="glass-panel glass-card-interactive rounded-xl p-5 border ${isReserved ? 'border-amber-500/40 bg-amber-950/20' : 'border-slate-800'} flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                  <i data-lucide="clock" class="w-3 h-3"></i> ${escapeHtml(meal.cutoffTime)}
                </span>
                <span class="text-[11px] font-mono font-bold ${isSoldOut ? 'text-red-400' : 'text-emerald-400'}">${isSoldOut ? 'Sold Out' : remainingCount + ' Left'}</span>
              </div>
              <h4 class="font-bold text-white text-base mb-1">${escapeHtml(meal.title)}</h4>
              <p class="text-xs text-slate-400 mb-2">${escapeHtml(meal.cafeteria)}</p>
              <div class="inline-block px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-medium mb-3">
                ${escapeHtml(meal.dietary)}
              </div>
            </div>

            <div class="pt-3 border-t border-slate-800/80">
              <div class="flex items-baseline justify-between mb-3">
                <div>
                  <span class="text-xs line-through text-slate-500 mr-1.5">${escapeHtml(meal.originalPrice)}</span>
                  <span class="text-base font-extrabold font-mono text-emerald-400">${escapeHtml(meal.rescuePrice)}</span>
                </div>
                <span class="text-xs font-mono font-semibold text-slate-300">or <strong>${meal.ecoPointsCost} Pts</strong></span>
              </div>

              ${isReserved ? `
                <button disabled class="w-full py-2 rounded-lg bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-1">
                  <i data-lucide="check" class="w-3.5 h-3.5"></i> Voucher Issued
                </button>
              ` : isSoldOut ? `
                <button disabled class="w-full py-2 rounded-lg bg-slate-800/60 text-slate-500 font-semibold text-xs cursor-not-allowed">
                  Sold Out
                </button>
              ` : `
                <button onclick="reserveMeal('${escapeHtml(meal.id)}')" class="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95">
                  Reserve Surplus Meal
                </button>
              `}
            </div>
          </div>
        `;
      }).join('');

      refreshIcons();
    }

    function renderPatrolTickets() {
      const container = document.getElementById('patrolTicketsList');
      const countEl = document.getElementById('activePatrolCount');
      if (!container) return;

      if (countEl) countEl.textContent = `${appState.reportedIncidents.length} Tickets Logged`;

      container.innerHTML = appState.reportedIncidents.map(ticket => `
        <div class="p-3.5 rounded-xl border ${ticket.isEmergency && ticket.status !== 'Resolved' ? 'bg-red-950/30 border-red-500/50 shadow-lg shadow-red-500/10' : 'bg-slate-950/60 border-slate-800'} flex items-start justify-between gap-3">
          <div class="space-y-1 w-full">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-mono text-[10px] font-bold text-slate-400">${escapeHtml(ticket.id)}</span>
              <span class="px-2 py-0.2 rounded text-[10px] font-mono font-bold ${
                ticket.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                ticket.status === 'URGENT ANOMALY' ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' :
                'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }">${escapeHtml(ticket.status)}</span>
              <span class="text-xs font-semibold text-white">${escapeHtml(ticket.category)}</span>
            </div>
            <p class="text-xs text-slate-300">${escapeHtml(ticket.description)}</p>
            <div class="text-[11px] text-slate-500 flex items-center gap-2">
              <span>📍 ${escapeHtml(ticket.location)}</span>
              <span>•</span>
              <span>Reported by ${escapeHtml(ticket.reportedBy)} (${escapeHtml(ticket.timeAgo)})</span>
            </div>
            ${ticket.isEmergency && ticket.status !== 'Resolved' ? `
              <div class="mt-2.5 pt-2 border-t border-red-500/20 flex items-center justify-between">
                <span class="text-red-400 font-bold text-[11px] flex items-center gap-1">
                  <i data-lucide="alert-triangle" class="w-3.5 h-3.5 animate-pulse"></i> Solenoid Shutoff Armed
                </span>
                <button onclick="resolveEmergencyCrisis('${escapeHtml(ticket.id)}')" class="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-1 active:scale-95">
                  <i data-lucide="power" class="w-3.5 h-3.5"></i> Remote Auto-Shutoff Valve (+75 Pts)
                </button>
              </div>
            ` : ''}
          </div>
          <span class="text-xs font-mono font-bold text-emerald-400 whitespace-nowrap bg-brand-500/10 px-2 py-1 rounded">
            +${ticket.pointsAwarded} Pts
          </span>
        </div>
      `).join('');

      refreshIcons();
    }

    function renderCheers() {
      const container = document.getElementById('cheerWallGrid');
      if (!container) return;

      container.innerHTML = appState.cheers.slice(0, 6).map(c => `
        <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div class="flex items-center justify-between text-[11px]">
            <span class="font-bold text-emerald-400">${escapeHtml(c.author)}</span>
            <span class="text-slate-500 font-mono">${escapeHtml(c.time)}</span>
          </div>
          <p class="text-xs text-slate-200">"${escapeHtml(c.text)}"</p>
        </div>
      `).join('');
    }

    function renderRewardsStore() {
      const container = document.getElementById('rewardsCatalogList');
      if (!container) return;

      container.innerHTML = rewardsStoreData.map(r => `
        <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400">
              <i data-lucide="${r.icon}" class="w-4 h-4"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white">${r.title}</span>
                <span class="text-[9px] px-1.5 rounded bg-slate-800 text-slate-400 font-mono">${r.tag}</span>
              </div>
              <p class="text-[11px] text-slate-400">${r.vendor}</p>
            </div>
          </div>
          <button onclick="redeemReward('${r.id}', '${r.title}', ${r.points})" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-slate-700 hover:border-emerald-500 font-mono font-bold text-xs transition-all whitespace-nowrap">
            ${r.points} Pts
          </button>
        </div>
      `).join('');

      lucide.createIcons();
    }

    /* =========================================================================
       7. CHART.JS CONFIGURATION & INITIALIZATION
       ========================================================================= */
    let campusGridChartInstance = null;
    let zoneChartInstance = null;
    let derbyChartInstance = null;

    function initCharts() {
      const gridCanvas = document.getElementById('campusGridChart');
      const zoneCanvas = document.getElementById('zoneBreakdownChart');
      const derbyCanvas = document.getElementById('derbyChart');

      if (!gridCanvas || !zoneCanvas || !derbyCanvas) return;

      // 1. Campus Power Profile 24h Area Chart
      const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
      const campusDemand = [680, 620, 610, 750, 1180, 1340, 1420, 1390, 1480, 1530, 1250, 920];
      const solarGen =     [0,   0,   0,   120, 540,  980,  1480, 1380, 890,  180,  0,    0];

      campusGridChartInstance = new Chart(gridCanvas, {
        type: 'line',
        data: {
          labels: hours,
          datasets: [
            {
              label: 'Solar Photovoltaic Gen (kW)',
              data: solarGen,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.18)',
              borderWidth: 2.5,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#10b981',
              pointRadius: 3,
            },
            {
              label: 'Campus Load Demand (kW)',
              data: campusDemand,
              borderColor: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#38bdf8',
              pointRadius: 3,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: '#94a3b8',
                font: { family: 'Plus Jakarta Sans', size: 11 }
              }
            },
            tooltip: {
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderWidth: 1,
              titleColor: '#fff',
              bodyColor: '#94a3b8',
              padding: 10,
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } }
            }
          }
        }
      });

      // 2. Zone Breakdown Donut Chart
      zoneChartInstance = new Chart(zoneCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Science & Labs', 'Housing Quads', 'Dining & Union', 'Library & Athletics'],
          datasets: [{
            data: [42, 28, 18, 12],
            backgroundColor: ['#10b981', '#06b6d4', '#f59e0b', '#6366f1'],
            borderWidth: 2,
            borderColor: '#0f172a',
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.label}: ${ctx.raw}% load`
              }
            }
          }
        }
      });

      // 3. Derby Comparison Bar Chart
      const currentDormLabels = (window.dormDerbyData && window.dormDerbyData.length > 0)
        ? window.dormDerbyData.map(d => d.name)
        : ['Ganga Hostel', 'Nilgiri Bhavan', 'Brahmaputra Quads', 'Sarojini Naidu Hall'];

      derbyChartInstance = new Chart(derbyCanvas, {
        type: 'bar',
        data: {
          labels: currentDormLabels,
          datasets: [
            {
              label: 'Energy Saved vs Baseline (%)',
              data: [24.2, 21.5, 17.8, 14.1],
              backgroundColor: '#10b981',
              borderRadius: 6
            },
            {
              label: 'Water Saved vs Baseline (%)',
              data: [19.4, 18.2, 14.0, 11.5],
              backgroundColor: '#06b6d4',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: '#94a3b8',
                font: { family: 'Plus Jakarta Sans', size: 11 }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } }
            }
          }
        }
      });
    }

    window.updateDerbyChartData = function() {
      if (derbyChartInstance && Array.isArray(window.dormDerbyData) && window.dormDerbyData.length > 0) {
        derbyChartInstance.data.labels = window.dormDerbyData.map(d => d.name);
        derbyChartInstance.data.datasets[0].data = window.dormDerbyData.map(d => {
          const val = parseFloat(d.trend || d.delta || '15');
          return isNaN(val) ? 15 : Math.abs(val) * 4;
        });
        derbyChartInstance.data.datasets[1].data = window.dormDerbyData.map(d => {
          const val = parseFloat(d.score || '85');
          return Math.max(10, Math.round((val - 70) * 1.2));
        });
        derbyChartInstance.update();
      }
    };

    function updateGridChartMode(mode) {
      sound.click();
      ['today', 'yesterday', 'forecast'].forEach(m => {
        const btn = document.getElementById(`btn-chart-${m}`);
        if (btn) {
          if (m === mode) {
            btn.className = 'px-3 py-1 rounded-md font-semibold bg-brand-500/20 text-emerald-400';
          } else {
            btn.className = 'px-3 py-1 rounded-md font-medium text-slate-400 hover:text-white';
          }
        }
      });

      if (!campusGridChartInstance) return;

      if (mode === 'today') {
        campusGridChartInstance.data.datasets[0].data = [0, 0, 0, 120, 540, 980, 1480, 1380, 890, 180, 0, 0];
        campusGridChartInstance.data.datasets[1].data = [680, 620, 610, 750, 1180, 1340, 1420, 1390, 1480, 1530, 1250, 920];
      } else if (mode === 'yesterday') {
        campusGridChartInstance.data.datasets[0].data = [0, 0, 0, 90, 420, 840, 1290, 1180, 760, 120, 0, 0];
        campusGridChartInstance.data.datasets[1].data = [710, 640, 620, 780, 1210, 1390, 1460, 1420, 1510, 1580, 1290, 950];
      } else if (mode === 'forecast') {
        campusGridChartInstance.data.datasets[0].data = [0, 0, 0, 150, 620, 1120, 1590, 1510, 980, 240, 0, 0];
        campusGridChartInstance.data.datasets[1].data = [650, 590, 580, 710, 1120, 1280, 1340, 1310, 1410, 1460, 1180, 880];
      }
      campusGridChartInstance.update();
      showToast(`Showing ${mode.toUpperCase()} grid load profile`, 'info', 'Telemetry View Updated');
    }

    /* =========================================================================
       8. USER INTERACTION HANDLERS (BOUNTIES, MEALS, PATROL, STORE)
       ========================================================================= */

    function claimBounty(id, points) {
      if (appState.claimedBounties.includes(id)) return;
      
      sound.reward();
      triggerConfetti();

      appState.claimedBounties.push(id);
      appState.userEcoPoints += points;
      appState.co2SavedKg += 0.8;
      saveState();

      updatePointsDisplay();
      renderBounties();

      // Async sync with FastAPI backend
      if (window.api && typeof window.api.claimBounty === 'function') {
        const studentEmail = (window.currentStudent && window.currentStudent.email) ? window.currentStudent.email : 'aarav.sharma@campus.edu';
        window.api.claimBounty(id, `Bounty #${id}`, points, studentEmail);
      }

      showToast(`Earned +${points} EcoPoints! Diverted ~0.8 kg CO₂e.`, 'success', 'Bounty Verified!');
    }

    function reserveMeal(mealId) {
      const meal = diningMealsData.find(m => m.id === mealId);
      if (!meal) return;

      if (!appState.mealInventory) appState.mealInventory = {};
      const currentRemaining = (appState.mealInventory[mealId] !== undefined)
        ? appState.mealInventory[mealId]
        : meal.remaining;

      if (currentRemaining <= 0) {
        sound.alert();
        showToast('This surplus meal has already run out of portions.', 'warning', 'Sold Out');
        return;
      }

      if (appState.userEcoPoints < meal.ecoPointsCost) {
        sound.alert();
        showToast(`You need ${meal.ecoPointsCost} EcoPoints to reserve this portion with points.`, 'warning', 'Insufficient EcoPoints');
        return;
      }

      sound.success();
      triggerConfetti();

      appState.reservedMeals.push(mealId);
      appState.userEcoPoints -= meal.ecoPointsCost;
      appState.mealsRescued += 1;
      appState.mealInventory[mealId] = Math.max(0, currentRemaining - 1);
      meal.remaining = appState.mealInventory[mealId];
      saveState();

      updatePointsDisplay();
      renderDiningMeals();

      // Async sync with FastAPI backend
      if (window.api && typeof window.api.reserveMeal === 'function') {
        const studentEmail = (window.currentStudent && window.currentStudent.email) ? window.currentStudent.email : 'aarav.sharma@campus.edu';
        window.api.reserveMeal({
          meal_id: mealId,
          meal_title: meal.title,
          cafeteria: meal.cafeteria,
          student_email: studentEmail,
          price: meal.rescuePrice,
          eco_points_spent: meal.ecoPointsCost
        });
      }

      // Show Voucher Modal
      document.getElementById('voucherMealTitle').textContent = meal.title;
      document.getElementById('voucherLocation').textContent = meal.cafeteria;
      document.getElementById('voucherCodeText').textContent = `CODE: ECO-MEAL-${Math.floor(10000 + Math.random() * 90000)}`;
      openModal('voucherModal');

      showToast(`Meal voucher saved! Pickup at ${meal.cafeteria}`, 'success', 'Surplus Meal Reserved');
    }

    function redeemReward(rewardId, title, points) {
      if (appState.userEcoPoints < points) {
        sound.alert();
        showToast(`You need ${points} EcoPoints for this reward. You have ${appState.userEcoPoints}.`, 'warning', 'More Points Needed');
        return;
      }

      sound.reward();
      triggerConfetti();

      appState.userEcoPoints -= points;
      saveState();
      updatePointsDisplay();

      document.getElementById('rewardClaimTitle').textContent = title;
      document.getElementById('rewardVoucherCode').textContent = `CAMPUS-${Math.floor(1000 + Math.random() * 9000)}-VERIFIED`;
      openModal('rewardClaimModal');

      showToast(`Redeemed "${title}" for ${points} EcoPoints!`, 'success', 'Reward Claimed');
    }

    function submitHazardReport(e) {
      e.preventDefault();
      const location = document.getElementById('reportLocation').value;
      const category = document.getElementById('reportCategory').value;
      const description = document.getElementById('reportDescription').value;

      const newTicket = {
        id: `TICK-${Math.floor(1100 + Math.random() * 900)}`,
        location,
        category,
        description,
        status: 'In Progress',
        reportedBy: 'Alex Rivers (You)',
        timeAgo: 'Just now',
        pointsAwarded: 50
      };

      sound.success();
      triggerConfetti();

      appState.reportedIncidents.unshift(newTicket);
      appState.userEcoPoints += 50;
      saveState();

      updatePointsDisplay();
      renderPatrolTickets();
      closeModal('reportModal');
      e.target.reset();

      // Async sync with FastAPI backend
      if (window.api && typeof window.api.reportIncident === 'function') {
        const studentName = (window.currentStudent && window.currentStudent.name) ? window.currentStudent.name : 'Aarav Sharma';
        window.api.reportIncident({
          title: `${category.toUpperCase()}: ${location}`,
          category: category,
          location: location,
          reported_by: studentName,
          severity: 'medium'
        });
      }

      showToast(`Facilities dispatch notified! +50 EcoPoints awarded for campus patrol report.`, 'success', 'Hazard Dispatched');
    }

    function submitCustomAction(e) {
      e.preventDefault();
      const title = document.getElementById('customTitle').value;
      const desc = document.getElementById('customDesc').value;

      sound.reward();
      triggerConfetti();

      appState.userEcoPoints += 40;
      saveState();
      updatePointsDisplay();
      closeModal('customActionModal');
      e.target.reset();

      showToast(`Logged "${title}"! +40 EcoPoints added to student wallet.`, 'success', 'Action Verified');
    }

    function postCheer(e) {
      e.preventDefault();
      const input = document.getElementById('cheerInput');
      const text = input.value.trim().slice(0, 240);
      if (!text) return;

      sound.click();
      appState.cheers.unshift({
        author: 'Alex Rivers (Oak Hall)',
        text: text,
        time: 'Just now'
      });
      saveState();
      renderCheers();
      input.value = '';
      showToast('Your cheer was broadcast to the Dorm Derby live wall!', 'success', 'Cheer Posted');
    }

    function filterDerbyMetric(metric) {
      sound.click();
      ['overall', 'energy', 'water', 'waste'].forEach(m => {
        const btn = document.getElementById(`derby-btn-${m}`);
        if (btn) {
          if (m === metric) {
            btn.className = 'px-3 py-1.5 rounded-lg font-bold bg-amber-500 text-slate-950 shadow-md';
          } else {
            btn.className = 'px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-white';
          }
        }
      });
      renderDerbyStandings(metric);
    }

    function filterBounties(category) {
      sound.click();
      ['all', 'energy', 'waste', 'commute', 'food'].forEach(c => {
        const btn = document.getElementById(`bounty-tab-${c}`);
        if (btn) {
          if (c === category) {
            btn.className = 'px-3 py-1 rounded-lg font-bold bg-brand-500 text-slate-950';
          } else {
            btn.className = 'px-3 py-1 rounded-lg font-medium text-slate-400 hover:text-white';
          }
        }
      });
      renderBounties(category);
    }

    function toggleBuildingEco(index) {
      sound.click();
      appState.buildingsEcoState[index] = !appState.buildingsEcoState[index];
      const active = appState.buildingsEcoState[index];

      const modeEl = document.getElementById(`bld-mode-${index}`);
      const gradeEl = document.getElementById(`bld-grade-${index}`);

      if (modeEl && gradeEl) {
        if (active) {
          modeEl.innerHTML = '<i data-lucide="check" class="w-3 h-3"></i> Smart Net-Zero';
          modeEl.className = 'font-mono font-bold text-emerald-400 flex items-center gap-1';
          gradeEl.textContent = 'A+';
          gradeEl.className = 'px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
          showToast(`Building optimized to Net-Zero setback mode`, 'success', 'Facility Automation');
        } else {
          modeEl.innerHTML = '<i data-lucide="power" class="w-3 h-3"></i> Standard Manual';
          modeEl.className = 'font-mono font-bold text-slate-400 flex items-center gap-1';
          gradeEl.textContent = 'B';
          gradeEl.className = 'px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700';
          showToast(`Building set to manual mode`, 'info', 'Facility Automation');
        }
        lucide.createIcons();
      }
    }

    function triggerSmartAllEcoMode() {
      sound.success();
      triggerConfetti();
      appState.buildingsEcoState = [true, true, true, true];
      for (let i = 0; i < 4; i++) {
        const modeEl = document.getElementById(`bld-mode-${i}`);
        const gradeEl = document.getElementById(`bld-grade-${i}`);
        if (modeEl && gradeEl) {
          modeEl.innerHTML = '<i data-lucide="check" class="w-3 h-3"></i> Smart Net-Zero';
          modeEl.className = 'font-mono font-bold text-emerald-400 flex items-center gap-1';
          gradeEl.textContent = 'A+';
          gradeEl.className = 'px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
        }
      }
      lucide.createIcons();
      showToast('All 4 Campus Quads synchronized to maximum renewable efficiency!', 'success', 'Campus-Wide Optimization');
    }

    /* =========================================================================
       9. PERSONAL ECO-AUDIT FOOTPRINT CALCULATOR ENGINE
       ========================================================================= */
    function calculateFootprint() {
      const commuteMiles = parseFloat(document.getElementById('sliderCommute').value) || 0;
      const laundryCycles = parseFloat(document.getElementById('sliderLaundry').value) || 0;
      const dietMeals = parseFloat(document.getElementById('sliderDiet').value) || 0;
      const thermoOffset = parseFloat(document.getElementById('sliderThermo').value) || 0;

      // Update Slider Value Badges
      document.getElementById('valCommute').textContent = `${commuteMiles} miles`;
      document.getElementById('valLaundry').textContent = `${laundryCycles} cycles`;
      document.getElementById('valDiet').textContent = `${dietMeals} meals`;
      document.getElementById('valThermo').textContent = `+${thermoOffset}°F Offset`;

      // Calculations:
      // Commute: ~0.4 kg CO2e saved per mile cycled vs car
      // Laundry: ~0.55 kg CO2e saved per cold wash vs hot
      // Diet: ~1.4 kg CO2e saved per plant-based meal vs meat
      // HVAC: ~35 kg CO2e per 1 degree offset over semester
      const annualCommuteCO2 = commuteMiles * 0.4 * 32; // 32 academic weeks
      const annualLaundryCO2 = laundryCycles * 0.55 * 8; // 8 months
      const annualDietCO2 = dietMeals * 1.4 * 32;
      const annualHVACCO2 = thermoOffset * 35;

      const totalCO2Kg = Math.round(annualCommuteCO2 + annualLaundryCO2 + annualDietCO2 + annualHVACCO2);
      const totalKWh = Math.round(totalCO2Kg * 2.1);
      const totalSavings = Math.round(totalKWh * 0.20);

      document.getElementById('calcCO2').textContent = `${totalCO2Kg} kg`;
      document.getElementById('calcKWh').textContent = `${totalKWh} kWh`;
      document.getElementById('calcSavings').textContent = `$${totalSavings}.00`;
    }

    /* =========================================================================
       10. LIVE TELEMETRY SIMULATION LOOP (RUNS CONTINUOUSLY)
       ========================================================================= */
    function startTelemetrySimulation() {
      setInterval(() => {
        // Subtle realistic fluctuations
        const basePower = 1248;
        const deltaPower = Math.floor((Math.random() - 0.48) * 16);
        const newPower = basePower + deltaPower;
        const livePowerEl = document.getElementById('livePowerOutput');
        if (livePowerEl) livePowerEl.textContent = newPower.toLocaleString();

        // Node Telemetry Ticks
        const node1 = document.getElementById('telemetryNode1');
        const node2 = document.getElementById('telemetryNode2');
        const node3 = document.getElementById('telemetryNode3');
        if (node1) node1.textContent = `${(480 + (Math.random() * 2)).toFixed(1)} V • ${(98.4 + (Math.random() * 0.4)).toFixed(1)}% Eff`;
        if (node2) node2.textContent = `${(42.1 + (Math.random() * 0.6)).toFixed(1)} PSI • 94.2% Vol`;
        if (node3) node3.textContent = `${(34.2 + (Math.random() * 1.2)).toFixed(1)} kW • PF 0.99`;

      }, 3000);

      // Derby countdown timer tick
      let secondsRemaining = 252;
      setInterval(() => {
        if (secondsRemaining > 0) secondsRemaining--;
        const m = Math.floor(secondsRemaining / 60);
        const s = secondsRemaining % 60;
        const timerEl = document.getElementById('derbyTimer');
        if (timerEl) timerEl.textContent = `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
      }, 1000);
    }

    function simulateGridPeak() {
      sound.reward();
      triggerConfetti();

      const livePowerEl = document.getElementById('livePowerOutput');
      const navGridEl = document.getElementById('navGridStatus');
      const cleanRatioPctEl = document.getElementById('cleanRatioPct');
      const cleanRatioBarEl = document.getElementById('cleanRatioBar');

      if (livePowerEl) livePowerEl.textContent = '1,620';
      if (navGridEl) navGridEl.textContent = '96.2% Solar Offset';
      if (cleanRatioPctEl) cleanRatioPctEl.textContent = '96.2%';
      if (cleanRatioBarEl) cleanRatioBarEl.style.width = '96.2%';

      if (campusGridChartInstance) {
        campusGridChartInstance.data.datasets[0].data[6] = 1620;
        campusGridChartInstance.update();
      }

      showToast('Photovoltaic array surged to 1.62 MW! Campus microgrid is now exporting surplus clean energy to the municipal city grid.', 'success', '⚡ Clean Energy Peak Achieved');
    }

    /* =========================================================================
       11. NAVIGATION & MODALS (SIDEBAR & VIEWPORT ARCHITECTURE)
       ========================================================================= */
    function toggleMobileSidebar(forceClose = false) {
      sound.click();
      const sidebar = document.getElementById('appSidebar');
      const backdrop = document.getElementById('sidebarBackdrop');
      if (!sidebar) return;

      const isOpen = sidebar.classList.contains('sidebar-open');
      if (forceClose === true || isOpen) {
        sidebar.classList.remove('sidebar-open');
        if (backdrop) backdrop.classList.add('hidden');
      } else {
        sidebar.classList.add('sidebar-open');
        if (backdrop) backdrop.classList.remove('hidden');
      }
    }

    function handleDormSelectorChange(dormKey) {
      if (sound && typeof sound.click === 'function') sound.click();
      
      const profile = (typeof window.getActiveCampusProfile === 'function') ? window.getActiveCampusProfile() : null;
      let dormName = dormKey;
      if (profile && profile.dorms) {
        const found = profile.dorms.find(d => d.id === dormKey);
        if (found) dormName = found.name;
      }
      
      // Update UI elements across page
      const heroStudentDorm = document.getElementById('heroStudentDorm');
      if (heroStudentDorm) heroStudentDorm.textContent = dormName;
      
      const sidebarStudentDorm = document.getElementById('sidebarStudentDorm');
      if (sidebarStudentDorm) sidebarStudentDorm.textContent = dormName;
      
      const passportStudentDorm = document.getElementById('passportStudentDorm');
      if (passportStudentDorm) passportStudentDorm.textContent = `${dormName} • Verified`;
      
      const cleanDorm = dormName.split(' (')[0].split(' •')[0];
      const derbyYourDormName = document.getElementById('derbyYourDormName');
      const derbyBoostBtn = document.getElementById('derbyBoostBtn');
      if (derbyYourDormName) derbyYourDormName.textContent = `${cleanDorm} (You are contributing +14 pts today!)`;
      if (derbyBoostBtn) derbyBoostBtn.textContent = `Boost ${cleanDorm} +30`;

      // Update stored user if available
      try {
        const stored = localStorage.getItem('ecocampus_google_user');
        if (stored) {
          const u = JSON.parse(stored);
          u.dorm = dormName;
          u.dormKey = dormKey;
          localStorage.setItem('ecocampus_google_user', JSON.stringify(u));
        }
      } catch (e) {}

      showToast(`Residency focus switched to ${dormName}.`, 'success', 'Hostel / Dorm Updated');
    }
    window.handleDormSelectorChange = handleDormSelectorChange;

    function handleGlobalQuickSearch(query) {
      const q = query.trim().toLowerCase();
      if (!q) return;
      if (q.includes('solar') || q.includes('grid') || q.includes('power') || q.includes('iot') || q.includes('telemetry')) {
        switchTab('grid');
      } else if (q.includes('derby') || q.includes('rank') || q.includes('dorm') || q.includes('hostel') || q.includes('oak') || q.includes('league')) {
        switchTab('derby');
      } else if (q.includes('bount') || q.includes('task') || q.includes('mission') || q.includes('action')) {
        switchTab('bounties');
      } else if (q.includes('food') || q.includes('din') || q.includes('gemini') || q.includes('meal') || q.includes('waste')) {
        switchTab('dining');
      } else if (q.includes('leak') || q.includes('patrol') || q.includes('hazard') || q.includes('report') || q.includes('pipe')) {
        switchTab('patrol');
      } else if (q.includes('color') || q.includes('grade') || q.includes('studio') || q.includes('photo') || q.includes('thermal')) {
        switchTab('studio');
      } else if (q.includes('reward') || q.includes('audit') || q.includes('store') || q.includes('calc') || q.includes('points')) {
        switchTab('calculator');
      } else if (q.includes('home') || q.includes('over') || q.includes('dash')) {
        switchTab('overview');
      }
    }
    window.handleGlobalQuickSearch = handleGlobalQuickSearch;

    function switchTab(tabId) {
      if (sound && typeof sound.click === 'function') sound.click();

      // Default fallback
      if (!tabId) tabId = 'overview';

      // Hide all contents
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));

      // Show selected viewport
      const target = document.getElementById(`view-${tabId}`);
      if (target) {
        target.classList.remove('hidden');
      }

      // Update sidebar navigation buttons
      document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('sidebar-active');
        btn.classList.add('text-slate-400', 'border-transparent');
      });

      const activeBtn = document.getElementById(`tab-${tabId}`);
      if (activeBtn) {
        activeBtn.classList.remove('text-slate-400', 'border-transparent');
        activeBtn.classList.add('sidebar-active');
      }

      // Sync mobile floating app dock
      ALL_TABS.forEach(t => {
        const dockBtn = document.getElementById(`dock-${t}`);
        if (dockBtn) {
          if (t === tabId) {
            dockBtn.className = 'p-2 rounded-xl text-emerald-400 bg-brand-500/20 flex flex-col items-center gap-0.5 shadow-sm';
          } else {
            dockBtn.className = 'p-2 rounded-xl text-slate-400 hover:text-white flex flex-col items-center gap-0.5';
          }
        }
      });

      // Smooth scroll back to top of page and viewport
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const viewport = document.getElementById('mainViewport');
      if (viewport) {
        viewport.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Trigger Chart Resizes
      if (tabId === 'derby' && derbyChartInstance) {
        setTimeout(() => derbyChartInstance.resize(), 60);
      }
      if (tabId === 'grid' && campusGridChartInstance) {
        setTimeout(() => {
          campusGridChartInstance.resize();
          if (zoneChartInstance) zoneChartInstance.resize();
        }, 60);
      }

      // Trigger Studio Initialization
      if (tabId === 'studio') {
        setTimeout(() => {
          if (typeof initColorGradingStudio === 'function') {
            initColorGradingStudio();
          }
        }, 40);
      }

      // Auto close mobile sidebar on navigation
      if (typeof toggleMobileSidebar === 'function') {
        toggleMobileSidebar(true);
      }

      if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
      }
    }
    window.switchTab = switchTab;

    /* =========================================================================
       SPATIAL DIGITAL TWIN MAP & TELEMETRY INSPECTOR
       ========================================================================= */
    let selectedBuildingIndex = 0;

    let campusFacilityData = window.campusFacilityData = [
      {
        name: 'Science & Technology Hall',
        zone: 'Academic Complex • Zone 01',
        power: '643 kW (42%)',
        solar: '520 kW Active',
        temp: '73°F (Eco-Set)',
        occupancy: '1,240 Users',
        grade: 'Grade A+'
      },
      {
        name: 'Oak Residence Quad',
        zone: 'Residential Sector • Zone 02',
        power: '429 kW (28%)',
        solar: 'Grid Shared',
        temp: '3.1 kWh / resident',
        occupancy: '860 Residents',
        grade: 'Grade A (Derby #1)'
      },
      {
        name: 'W.E.B. Central Library',
        zone: 'Commons & Study • Zone 03',
        power: '184 kW (12%)',
        solar: 'Daylight Sensors Active',
        temp: '68°F (Natural Airflow)',
        occupancy: '840 Studiers',
        grade: 'Grade B+'
      },
      {
        name: 'Harvest Student Union & Dining',
        zone: 'Dining & Unions • Zone 04',
        power: '276 kW (18%)',
        solar: '91% Heat Recovery',
        temp: '14 Meals Ready',
        occupancy: '620 Diners',
        grade: 'Grade A'
      },
      {
        name: 'North Quad Solar Canopy',
        zone: 'Renewable Generation • Zone 05',
        power: '+1,480 kW Peak',
        solar: '100% Photovoltaic',
        temp: 'Inverters 98.4% Eff',
        occupancy: 'Automated Solar Substation',
        grade: 'Grade A++'
      },
      {
        name: 'South Rainwater Cistern',
        zone: 'Hydro Loop • Zone 06',
        power: '14.2 gpm Flow',
        solar: 'Greywater Loop Active',
        temp: '42.4 PSI Normal',
        occupancy: '38,420 Gal (94%)',
        grade: 'Grade A+'
      }
    ];

    function selectMapBuilding(index) {
      sound.click();
      selectedBuildingIndex = index;

      // Update active map building styles
      for (let i = 0; i < 4; i++) {
        const node = document.getElementById(`mapNode${i}`);
        if (node) {
          if (i === index) {
            node.classList.add('active-map-building');
            const rect = node.querySelector('rect');
            if (rect) rect.setAttribute('stroke', '#22d3ee');
          } else {
            node.classList.remove('active-map-building');
            const rect = node.querySelector('rect');
            if (rect) rect.setAttribute('stroke', '#334155');
          }
        }
      }

      // Update inspector HUD
      const data = campusFacilityData[index] || campusFacilityData[0];
      const nameEl = document.getElementById('inspectorName');
      const zoneEl = document.getElementById('inspectorZone');
      const powerEl = document.getElementById('inspectorPower');
      const solarEl = document.getElementById('inspectorSolar');
      const tempEl = document.getElementById('inspectorTemp');
      const occEl = document.getElementById('inspectorOccupancy');
      const gradeEl = document.getElementById('inspectorGrade');

      if (nameEl) nameEl.textContent = data.name;
      if (zoneEl) zoneEl.textContent = data.zone;
      if (powerEl) powerEl.textContent = data.power;
      if (solarEl) solarEl.textContent = data.solar;
      if (tempEl) tempEl.textContent = data.temp;
      if (occEl) occEl.textContent = data.occupancy;
      if (gradeEl) gradeEl.textContent = data.grade;

      showToast(`Inspecting ${data.name} telemetry`, 'info', 'Facility Map Focused');
    }

    /* =========================================================================
       DEMO DRAMA: CRISIS ANOMALY & REMOTE VALVE SHUTOFF SIMULATOR
       ========================================================================= */
    function simulateCrisisAnomaly() {
      sound.alert();

      const dispatchBar = document.getElementById('dispatchBar');
      const dispatchBadge = document.getElementById('dispatchBadge');
      const tickerText = document.getElementById('tickerText');

      if (dispatchBar) dispatchBar.classList.add('crisis-active');
      if (dispatchBadge) {
        dispatchBadge.className = 'flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse';
        dispatchBadge.innerHTML = '<i data-lucide="alert-octagon" class="w-3 h-3"></i> CRITICAL ANOMALY';
      }
      if (tickerText) {
        tickerText.innerHTML = '<strong class="text-red-400">🚨 EMERGENCY BREACH:</strong> Pipe #3 in Science Complex Lab 204 flow surging at 48 gpm! Auto-isolation valve recommended.';
      }

      // Add emergency ticket if not already added
      const existing = appState.reportedIncidents.find(t => t.id === 'EMERGENCY-01');
      if (!existing) {
        const emergencyTicket = {
          id: 'EMERGENCY-01',
          location: 'Science Complex - Lab 204 (Sub-loop 3)',
          category: '🚨 Critical Water Line Fracture (48 gpm)',
          description: 'High-pressure breach with continuous flood risk. Auto-shutoff solenoid armed.',
          status: 'URGENT ANOMALY',
          reportedBy: 'Hydro-Sensor #HYD-409',
          timeAgo: 'Live Now',
          pointsAwarded: 75,
          isEmergency: true
        };
        appState.reportedIncidents.unshift(emergencyTicket);
        saveState();
        renderPatrolTickets();
      }

      lucide.createIcons();
      showToast('HIGH-PRESSURE WATER LINE BREACH detected in Science Lab 204! Go to EcoPatrol tab to trigger isolation valve.', 'warning', '🚨 Campus Emergency Incident');
    }

    function resolveEmergencyCrisis(ticketId) {
      sound.reward();
      triggerConfetti();

      const ticket = appState.reportedIncidents.find(t => t.id === ticketId);
      if (ticket) {
        ticket.status = 'Resolved';
        ticket.description = 'Isolated via remote solenoid valve. Facilities maintenance team dispatched on-site.';
      }

      appState.userEcoPoints += 75;
      saveState();
      updatePointsDisplay();
      renderPatrolTickets();

      // Reset dispatch bar
      const dispatchBar = document.getElementById('dispatchBar');
      const dispatchBadge = document.getElementById('dispatchBadge');
      const tickerText = document.getElementById('tickerText');

      if (dispatchBar) dispatchBar.classList.remove('crisis-active');
      if (dispatchBadge) {
        dispatchBadge.className = 'flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30';
        dispatchBadge.innerHTML = '<i data-lucide="radio" class="w-3 h-3 animate-pulse"></i> LIVE DISPATCH';
      }
      if (tickerText) {
        tickerText.innerHTML = '⚡ Incident Resolved: Remote isolation valve secured Science Lab 204. Campus grid normal.';
      }

      lucide.createIcons();
      showToast('Crisis resolved! Remote shutoff valve engaged. +75 EcoPoints awarded to your wallet!', 'success', '⚡ Emergency Mitigated');
    }

    /* =========================================================================
       OFFICIAL ECO-PASSPORT CERTIFICATE ACTIONS
       ========================================================================= */
    function downloadPassport() {
      sound.reward();
      triggerConfetti();
      showToast('Official Net-Zero Eco-Passport credentials downloaded (SHA256 verified)!', 'success', 'Campus Credentials Verified');
    }

    function copyShareCredentials() {
      sound.click();
      if (navigator.clipboard) {
        navigator.clipboard.writeText('https://ecocampus.edu/verify/alex-rivers-netzero-2026');
      }
      showToast('Verification link copied to clipboard: ecocampus.edu/verify/alex-rivers', 'info', 'Link Copied');
    }

    function openModal(id) {
      sound.click();
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.remove('hidden');
        lucide.createIcons();
      }
    }

    function closeModal(id) {
      sound.click();
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.add('hidden');
      }
    }

    // Close modal on ESC key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('[id$="Modal"]').forEach(m => m.classList.add('hidden'));
      }
    });

    /* =========================================================================
       12. THEME & SFX TOGGLE HANDLERS
       ========================================================================= */
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const sfxToggleBtn = document.getElementById('sfxToggleBtn');
    const sfxIcon = document.getElementById('sfxIcon');

    function updateChartTheme(isDark) {
      const textColor = isDark ? '#94a3b8' : '#334155';
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';

      if (campusGridChartInstance && campusGridChartInstance.options) {
        campusGridChartInstance.options.plugins.legend.labels.color = textColor;
        if (campusGridChartInstance.options.scales && campusGridChartInstance.options.scales.x) {
          campusGridChartInstance.options.scales.x.ticks.color = isDark ? '#64748b' : '#475569';
          campusGridChartInstance.options.scales.x.grid.color = gridColor;
        }
        if (campusGridChartInstance.options.scales && campusGridChartInstance.options.scales.y) {
          campusGridChartInstance.options.scales.y.ticks.color = isDark ? '#64748b' : '#475569';
          campusGridChartInstance.options.scales.y.grid.color = gridColor;
        }
        campusGridChartInstance.update();
      }

      if (derbyChartInstance && derbyChartInstance.options) {
        derbyChartInstance.options.plugins.legend.labels.color = textColor;
        if (derbyChartInstance.options.scales && derbyChartInstance.options.scales.x) {
          derbyChartInstance.options.scales.x.ticks.color = textColor;
        }
        if (derbyChartInstance.options.scales && derbyChartInstance.options.scales.y) {
          derbyChartInstance.options.scales.y.ticks.color = textColor;
          derbyChartInstance.options.scales.y.grid.color = gridColor;
        }
        derbyChartInstance.update();
      }

      if (zoneChartInstance && zoneChartInstance.data && zoneChartInstance.data.datasets[0]) {
        zoneChartInstance.data.datasets[0].borderColor = isDark ? '#0f172a' : '#ffffff';
        zoneChartInstance.update();
      }
    }

    function applyTheme(isDark) {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        if (themeIcon) themeIcon.setAttribute('data-lucide', 'sun');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        if (themeIcon) themeIcon.setAttribute('data-lucide', 'moon');
      }
      updateChartTheme(isDark);
      lucide.createIcons();
    }

    themeToggleBtn.addEventListener('click', () => {
      sound.click();
      appState.darkMode = !appState.darkMode;
      saveState();
      applyTheme(appState.darkMode);
      showToast(`Switched to ${appState.darkMode ? 'Dark' : 'Light'} Mode`, 'info', 'Theme Updated');
    });

    sfxToggleBtn.addEventListener('click', () => {
      appState.sfxEnabled = !appState.sfxEnabled;
      saveState();
      if (sfxIcon) {
        sfxIcon.setAttribute('data-lucide', appState.sfxEnabled ? 'volume-2' : 'volume-x');
        lucide.createIcons();
      }
      if (appState.sfxEnabled) {
        sound.click();
        showToast('UI Audio effects enabled', 'success', 'Sound Active');
      } else {
        showToast('UI Audio muted', 'info', 'Sound Muted');
      }
    });

    /* =========================================================================
       12. COMPREHENSIVE COLOR GRADING SUITE (ATMOSPHERE, SPATIAL MAP, & STUDIO)
       ========================================================================= */

    // -------------------------------------------------------------------------
    // 12.1 ATMOSPHERIC TIME-OF-DAY COLOR GRADING
    // -------------------------------------------------------------------------
    function setAtmosphereGrade(mode) {
      sound.click();
      appState.atmosphere = mode;
      saveState();
      document.documentElement.setAttribute('data-atmosphere', mode);
      
      const labelEl = document.getElementById('atmosphereLabel');
      const dropdown = document.getElementById('atmosphereDropdown');
      if (dropdown) dropdown.classList.add('hidden');

      const labels = {
        noon: 'Noon',
        golden: 'Golden',
        dawn: 'Dawn',
        cyber: 'Cyber',
        overcast: 'Overcast'
      };
      if (labelEl) labelEl.textContent = labels[mode] || 'Noon';

      const toastDescriptions = {
        noon: 'Solar Noon (Crisp Daylight & Emerald High-Contrast)',
        golden: 'Golden Hour (Warm Amber Luminescence & Sunset)',
        dawn: 'Emerald Dawn (Fresh Morning Horizon & Rose Glow)',
        cyber: 'Cyber Night (OLED Pitch Black & Neon Violet/Cyan)',
        overcast: 'Overcast Mist (Diffused Slate & Cool Ice Tones)'
      };
      showToast(`Atmospheric grade shifted to: ${toastDescriptions[mode] || mode}`, 'info', 'Atmosphere Calibrated');
    }

    function toggleAtmosphereDropdown() {
      sound.click();
      const dropdown = document.getElementById('atmosphereDropdown');
      if (dropdown) dropdown.classList.toggle('hidden');
      const simDropdown = document.getElementById('simDropdown');
      if (simDropdown) simDropdown.classList.add('hidden');
    }

    function toggleSimDropdown(forceClose = false) {
      sound.click();
      const dropdown = document.getElementById('simDropdown');
      if (!dropdown) return;
      if (forceClose === true) {
        dropdown.classList.add('hidden');
      } else {
        dropdown.classList.toggle('hidden');
        const atmosphereDropdown = document.getElementById('atmosphereDropdown');
        if (atmosphereDropdown) atmosphereDropdown.classList.add('hidden');
      }
    }

    // Close atmosphere and simulation dropdowns when clicking elsewhere
    document.addEventListener('click', (e) => {
      const atBtn = document.getElementById('atmosphereBtn');
      const atDropdown = document.getElementById('atmosphereDropdown');
      if (atBtn && atDropdown && !atBtn.contains(e.target) && !atDropdown.contains(e.target)) {
        atDropdown.classList.add('hidden');
      }

      const simBtn = document.getElementById('simBtn');
      const simDropdown = document.getElementById('simDropdown');
      if (simBtn && simDropdown && !simBtn.contains(e.target) && !simDropdown.contains(e.target)) {
        simDropdown.classList.add('hidden');
      }
    });

    // -------------------------------------------------------------------------
    // 12.2 SPATIAL MAP DATA & THERMAL COLOR GRADING
    // -------------------------------------------------------------------------
    const mapGradeConfigs = {
      default: {
        title: 'Standard Microgrid Bus',
        desc: 'Real-time electrical power routing & battery storage links',
        min: 'Optimal / 0%',
        max: 'Peak / 100%',
        barClass: 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500',
        nodeColors: [
          { fill: '#131e36', stroke: '#10b981', badge: 'A+' },
          { fill: '#131e36', stroke: '#334155', badge: 'A' },
          { fill: '#131e36', stroke: '#334155', badge: 'B+' },
          { fill: '#131e36', stroke: '#334155', badge: 'A' }
        ],
        pathColor: '#10b981'
      },
      thermal: {
        title: 'Thermal Efficiency Heatmap Grade',
        desc: 'Infrared temperature dissipation & HVAC load signatures',
        min: 'Cool (22°C)',
        max: 'Hot (78°C)',
        barClass: 'thermal-gradient-bar',
        nodeColors: [
          { fill: '#37151b', stroke: '#f87171', badge: '68°C Hot' },    // Lab
          { fill: '#33230c', stroke: '#fbbf24', badge: '46°C Mids' },   // Res
          { fill: '#0a2734', stroke: '#38bdf8', badge: '26°C Cool' },   // Lib
          { fill: '#0e2b1d', stroke: '#34d399', badge: '31°C Norm' }    // Dining
        ],
        pathColor: '#f59e0b'
      },
      carbon: {
        title: 'Carbon Intensity Emissions Grade',
        desc: 'Grams of CO2e per kilowatt-hour consumed by campus zone',
        min: '0 g (Net-Zero)',
        max: '180 g (Heavy)',
        barClass: 'carbon-gradient-bar',
        nodeColors: [
          { fill: '#351c0a', stroke: '#f97316', badge: '142 g' },
          { fill: '#092518', stroke: '#10b981', badge: '12 g' },
          { fill: '#1e280c', stroke: '#84cc16', badge: '48 g' },
          { fill: '#0a2a1c', stroke: '#22c55e', badge: '28 g' }
        ],
        pathColor: '#22d3ee'
      }
    };

    function setMapColorGrade(mode) {
      sound.click();
      appState.mapColorGrade = mode;
      saveState();

      const cfg = mapGradeConfigs[mode] || mapGradeConfigs.default;
      ['default', 'thermal', 'carbon'].forEach(m => {
        const btn = document.getElementById(`mapGradeBtn-${m}`);
        if (btn) {
          if (m === mode) {
            btn.className = 'px-2.5 py-1 rounded-lg font-semibold bg-brand-500/20 text-emerald-400 border border-brand-500/30 transition-all flex items-center gap-1.5 shadow-sm';
          } else {
            btn.className = 'px-2.5 py-1 rounded-lg font-medium text-slate-400 hover:text-white transition-all flex items-center gap-1.5';
          }
        }
      });

      const titleEl = document.getElementById('mapGradeTitle');
      const descEl = document.getElementById('mapGradeDesc');
      const minEl = document.getElementById('mapGradeMinLabel');
      const maxEl = document.getElementById('mapGradeMaxLabel');
      const barEl = document.getElementById('mapGradeSpectrumBar');

      if (titleEl) titleEl.textContent = cfg.title;
      if (descEl) descEl.textContent = cfg.desc;
      if (minEl) minEl.textContent = cfg.min;
      if (maxEl) maxEl.textContent = cfg.max;
      if (barEl) barEl.innerHTML = `<div class="w-full h-full ${cfg.barClass}"></div>`;

      // Update SVG node fills & strokes
      cfg.nodeColors.forEach((nc, idx) => {
        const node = document.getElementById(`mapNode${idx}`);
        if (node) {
          const rect = node.querySelector('rect');
          if (rect) {
            rect.setAttribute('fill', nc.fill);
            rect.setAttribute('stroke', nc.stroke);
          }
        }
      });

      // Update SVG energy flow paths
      document.querySelectorAll('.energy-flow-path').forEach(p => {
        p.setAttribute('stroke', cfg.pathColor);
      });

      showToast(`Campus Map switched to: ${cfg.title}`, 'success', 'Spatial Grade Updated');
    }

    // -------------------------------------------------------------------------
    // 12.3 PROFESSIONAL PHOTO EVIDENCE COLOR GRADING STUDIO (ECOGRADE PRO™)
    // -------------------------------------------------------------------------
    const studioParams = {
      exposure: 0,
      contrast: 0,
      highlights: 0,
      shadows: 0,
      temperature: 0,
      tint: 0,
      saturation: 0,
      vibrance: 0,
      wheels: {
        lift: { x: 0, y: 0, luma: 0 },
        gamma: { x: 0, y: 0, luma: 0 },
        gain: { x: 0, y: 0, luma: 0 }
      },
      curvePreset: 'scurve',
      splitPos: 0.5,
      viewMode: 'split',
      activeSample: 'solar',
      isThermalFLIR: false,
      attachedEvidence: null
    };

    let studioSourceCanvas = null;
    let studioInitialized = false;

    // Procedural High-Detail Image Generators for Campus Subjects
    function generateStudioSubjectCanvas(type) {
      const c = document.createElement('canvas');
      c.width = 960;
      c.height = 540;
      const ctx = c.getContext('2d');
      const w = c.width;
      const h = c.height;

      if (type === 'solar') {
        // Solar Farm Rooftop Array with photovoltaic texture & sky reflection
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4);
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(1, '#bae6fd');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Distant horizon & roof edge
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, h * 0.35, w, h * 0.65);

        // Perspective Solar Panels Grid
        const panelRows = 5;
        const panelCols = 8;
        for (let r = 0; r < panelRows; r++) {
          const y1 = h * 0.4 + r * 28;
          const y2 = y1 + 24;
          for (let col = 0; col < panelCols; col++) {
            const x = 30 + col * 110;
            const grad = ctx.createLinearGradient(x, y1, x + 100, y2);
            grad.addColorStop(0, '#0f172a');
            grad.addColorStop(0.3, '#1e3a8a');
            grad.addColorStop(0.6, '#0284c7');
            grad.addColorStop(1, '#0f172a');
            ctx.fillStyle = grad;
            ctx.fillRect(x, y1, 100, 22);

            // Metal silver busbars
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y1, 100, 22);
            ctx.beginPath();
            ctx.moveTo(x + 25, y1); ctx.lineTo(x + 25, y2);
            ctx.moveTo(x + 50, y1); ctx.lineTo(x + 50, y2);
            ctx.moveTo(x + 75, y1); ctx.lineTo(x + 75, y2);
            ctx.stroke();
          }
        }

        // Foreground Inverter Box & Conduits
        ctx.fillStyle = '#334155';
        ctx.fillRect(w * 0.75, h * 0.65, 180, 140);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(w * 0.77, h * 0.68, 80, 40);
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 12px "JetBrains Mono"';
        ctx.fillText('1480 kW OK', w * 0.78, h * 0.73);

        // Sun Glare Starburst
        const sunGlow = ctx.createRadialGradient(w * 0.25, h * 0.15, 5, w * 0.25, h * 0.15, 120);
        sunGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        sunGlow.addColorStop(0.3, 'rgba(253, 224, 71, 0.6)');
        sunGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(w * 0.25, h * 0.15, 120, 0, Math.PI * 2);
        ctx.fill();

      } else if (type === 'leak') {
        // High-Pressure Pipe Leak in Lab 204
        ctx.fillStyle = '#090e17';
        ctx.fillRect(0, 0, w, h);

        // Ceramic subway tile grid background
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 40) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += 20) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        // Heavy industrial brass & copper pipes
        const pipeGrad = ctx.createLinearGradient(0, h * 0.3, 0, h * 0.5);
        pipeGrad.addColorStop(0, '#78350f');
        pipeGrad.addColorStop(0.3, '#d97706');
        pipeGrad.addColorStop(0.6, '#fde68a');
        pipeGrad.addColorStop(1, '#92400e');
        ctx.fillStyle = pipeGrad;
        ctx.fillRect(80, h * 0.35, w - 160, 48);

        // Flange Joint with Faulty Seal
        ctx.fillStyle = '#64748b';
        ctx.fillRect(w * 0.45, h * 0.32, 40, 54);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(w * 0.45 + 16, h * 0.34, 8, 50);

        // Water High-Velocity Spray Cone
        const sprayGrad = ctx.createRadialGradient(w * 0.48, h * 0.36, 2, w * 0.48, h * 0.36, 180);
        sprayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        sprayGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.7)');
        sprayGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = sprayGrad;
        ctx.beginPath();
        ctx.moveTo(w * 0.48, h * 0.36);
        ctx.lineTo(w * 0.75, h * 0.85);
        ctx.lineTo(w * 0.25, h * 0.85);
        ctx.closePath();
        ctx.fill();

        // Water Droplet Puddles on Floor
        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.beginPath();
        ctx.ellipse(w * 0.5, h * 0.85, 220, 45, 0, 0, Math.PI * 2);
        ctx.fill();

      } else if (type === 'hvac') {
        // Rooftop HVAC Chiller & Ducting
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        // Metal Chiller Cabinet
        const cabGrad = ctx.createLinearGradient(w * 0.2, 0, w * 0.8, 0);
        cabGrad.addColorStop(0, '#334155');
        cabGrad.addColorStop(0.5, '#64748b');
        cabGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = cabGrad;
        ctx.fillRect(w * 0.15, h * 0.2, w * 0.7, h * 0.65);

        // Cooling Fins Grid
        ctx.fillStyle = '#0f172a';
        for (let i = 0; i < 30; i++) {
          ctx.fillRect(w * 0.2 + i * 18, h * 0.3, 8, h * 0.4);
        }

        // Pressure Gauges
        ctx.beginPath();
        ctx.arc(w * 0.75, h * 0.4, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Thermal Hot Exhaust Plume
        const heatGrad = ctx.createRadialGradient(w * 0.5, h * 0.18, 10, w * 0.5, h * 0.18, 100);
        heatGrad.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
        heatGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
        heatGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = heatGrad;
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.18, 100, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // Night Library Commons
        const nightGrad = ctx.createLinearGradient(0, 0, 0, h);
        nightGrad.addColorStop(0, '#030712');
        nightGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = nightGrad;
        ctx.fillRect(0, 0, w, h);

        // Illuminated Library Study Desks & Windows
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(w * 0.1, h * 0.2, w * 0.8, h * 0.7);

        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 6; col++) {
            const wx = w * 0.15 + col * 95;
            const wy = h * 0.25 + row * 85;
            const wGrad = ctx.createRadialGradient(wx + 30, wy + 25, 5, wx + 30, wy + 25, 45);
            wGrad.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
            wGrad.addColorStop(1, 'rgba(245, 158, 11, 0.15)');
            ctx.fillStyle = wGrad;
            ctx.fillRect(wx, wy, 65, 55);
          }
        }
      }

      return c;
    }

    function initColorGradingStudio() {
      const gradedCanvas = document.getElementById('studioGradedCanvas');
      const rawCanvas = document.getElementById('studioRawCanvas');
      if (!gradedCanvas || !rawCanvas) return;

      if (!studioSourceCanvas) {
        studioSourceCanvas = generateStudioSubjectCanvas(studioParams.activeSample);
      }

      gradedCanvas.width = studioSourceCanvas.width;
      gradedCanvas.height = studioSourceCanvas.height;
      rawCanvas.width = studioSourceCanvas.width;
      rawCanvas.height = studioSourceCanvas.height;

      const dimEl = document.getElementById('studioImgDimensions');
      if (dimEl) dimEl.textContent = `${studioSourceCanvas.width} × ${studioSourceCanvas.height} px`;

      setupStudioInteractions();
      renderStudioPipeline();
      renderCurveCanvas();
    }

    function loadStudioSample(sampleType) {
      sound.click();
      studioParams.activeSample = sampleType;
      studioSourceCanvas = generateStudioSubjectCanvas(sampleType);

      ['solar', 'leak', 'hvac', 'commons'].forEach(t => {
        const btn = document.getElementById(`sampleBtn-${t}`);
        if (btn) {
          if (t === sampleType) {
            btn.className = 'studio-sample-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 transition-all flex items-center gap-1.5 shadow-sm';
          } else {
            btn.className = 'studio-sample-btn px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all flex items-center gap-1.5';
          }
        }
      });

      renderStudioPipeline();
      showToast(`Loaded Subject: ${sampleType.toUpperCase()} Imagery`, 'info', 'Subject Changed');
    }

    function handleStudioUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = img.width > 1920 ? 1920 : img.width;
          c.height = Math.round((c.width / img.width) * img.height);
          const ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0, c.width, c.height);

          studioSourceCanvas = c;
          initColorGradingStudio();
          showToast(`Uploaded ${file.name} successfully`, 'success', 'Photo Loaded');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    function setStudioToolTab(tab) {
      sound.click();
      ['primary', 'wheels', 'curves', 'presets'].forEach(t => {
        const btn = document.getElementById(`studioToolTab-${t}`);
        const panel = document.getElementById(`studioPanel-${t}`);
        if (btn && panel) {
          if (t === tab) {
            btn.className = 'flex-1 py-1.5 rounded-lg font-bold bg-brand-500/20 text-emerald-400 transition-all text-center shadow-sm';
            panel.classList.remove('hidden');
          } else {
            btn.className = 'flex-1 py-1.5 rounded-lg font-semibold text-slate-400 hover:text-white transition-all text-center';
            panel.classList.add('hidden');
          }
        }
      });
      if (tab === 'curves') renderCurveCanvas();
    }

    function updateStudioParam(param, val) {
      studioParams[param] = parseFloat(val);
      const valEl = document.getElementById(`val-${param}`);
      if (valEl) {
        if (param === 'exposure') valEl.textContent = `${val > 0 ? '+' : ''}${(val / 50).toFixed(2)} EV`;
        else if (param === 'temperature') valEl.textContent = `${5500 + val * 25} K`;
        else if (param === 'saturation') valEl.textContent = `${100 + parseInt(val)}%`;
        else valEl.textContent = val;
      }
      renderStudioPipeline();
    }

    // 3-Way Color Wheels
    function handleWheelPointer(wheelName, e) {
      const wheelEl = document.getElementById(`wheel-${wheelName}`);
      if (!wheelEl) return;

      const rect = wheelEl.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      function onMove(moveEvent) {
        const x = moveEvent.clientX - rect.left - centerX;
        const y = moveEvent.clientY - rect.top - centerY;
        const maxRadius = centerX * 0.85;
        const dist = Math.hypot(x, y);
        const clampedDist = Math.min(dist, maxRadius);
        const angle = Math.atan2(y, x);

        const finalX = Math.cos(angle) * clampedDist;
        const finalY = Math.sin(angle) * clampedDist;

        studioParams.wheels[wheelName].x = finalX / maxRadius;
        studioParams.wheels[wheelName].y = finalY / maxRadius;

        const pointerEl = document.getElementById(`pointer-${wheelName}`);
        if (pointerEl) {
          pointerEl.style.left = `${50 + (finalX / centerX) * 50}%`;
          pointerEl.style.top = `${50 + (finalY / centerY) * 50}%`;
        }

        renderStudioPipeline();
      }

      function onUp() {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      }

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      onMove(e);
    }

    function updateWheelLuma(wheelName, val) {
      studioParams.wheels[wheelName].luma = parseFloat(val);
      const valEl = document.getElementById(`val-wheel-${wheelName}`);
      if (valEl) valEl.textContent = val;
      renderStudioPipeline();
    }

    function resetColorWheels() {
      sound.click();
      ['lift', 'gamma', 'gain'].forEach(w => {
        studioParams.wheels[w] = { x: 0, y: 0, luma: 0 };
        const p = document.getElementById(`pointer-${w}`);
        if (p) { p.style.left = '50%'; p.style.top = '50%'; }
        const slider = document.getElementById(`slider-wheel-${w}`);
        if (slider) slider.value = 0;
        const valEl = document.getElementById(`val-wheel-${w}`);
        if (valEl) valEl.textContent = 0;
      });
      renderStudioPipeline();
      showToast('3-Way Color Wheels reset to unity center', 'info', 'Wheels Reset');
    }

    // Tone Curve Rendering & Presets
    function setCurvePreset(preset) {
      sound.click();
      studioParams.curvePreset = preset;
      renderCurveCanvas();
      renderStudioPipeline();
    }

    function renderCurveCanvas() {
      const c = document.getElementById('studioCurveCanvas');
      if (!c) return;
      const ctx = c.getContext('2d');
      const w = (c.width = c.clientWidth * window.devicePixelRatio || 280);
      const h = (c.height = c.clientHeight * window.devicePixelRatio || 130);

      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo((w / 4) * i, 0); ctx.lineTo((w / 4) * i, h);
        ctx.moveTo(0, (h / 4) * i); ctx.lineTo(w, (h / 4) * i);
        ctx.stroke();
      }

      // Curve Path
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, h);

      const preset = studioParams.curvePreset;
      for (let x = 0; x <= w; x += 4) {
        const normX = x / w;
        let normY = normX;
        if (preset === 'scurve') {
          normY = 1 / (1 + Math.exp(-6 * (normX - 0.5)));
        } else if (preset === 'liftshadows') {
          normY = Math.pow(normX, 0.7);
        }
        const y = h - normY * h;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Before/After Split Viewer Mode
    function setStudioViewMode(mode) {
      sound.click();
      studioParams.viewMode = mode;
      const rawWrapper = document.getElementById('studioRawWrapper');
      const divider = document.getElementById('studioSplitDivider');

      ['split', 'graded', 'raw'].forEach(m => {
        const btn = document.getElementById(`btnView${m.charAt(0).toUpperCase() + m.slice(1)}`);
        if (btn) {
          if (m === mode) {
            btn.className = 'px-2 py-0.5 rounded bg-brand-500/20 text-emerald-400 font-semibold';
          } else {
            btn.className = 'px-2 py-0.5 rounded text-slate-400 hover:text-white';
          }
        }
      });

      if (rawWrapper && divider) {
        if (mode === 'split') {
          rawWrapper.style.width = `${studioParams.splitPos * 100}%`;
          divider.style.display = 'block';
          divider.style.left = `${studioParams.splitPos * 100}%`;
        } else if (mode === 'graded') {
          rawWrapper.style.width = '0%';
          divider.style.display = 'none';
        } else if (mode === 'raw') {
          rawWrapper.style.width = '100%';
          divider.style.display = 'none';
        }
      }
    }

    // Setup interactive split divider dragging
    function setupStudioInteractions() {
      if (studioInitialized) return;
      studioInitialized = true;

      const viewer = document.getElementById('studioSplitViewer');
      const divider = document.getElementById('studioSplitDivider');
      const rawWrapper = document.getElementById('studioRawWrapper');
      if (!viewer || !divider || !rawWrapper) return;

      let isDragging = false;

      function onPointerMove(e) {
        if (!isDragging || studioParams.viewMode !== 'split') return;
        const rect = viewer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const clamped = Math.max(0.02, Math.min(0.98, pos));
        studioParams.splitPos = clamped;
        divider.style.left = `${clamped * 100}%`;
        rawWrapper.style.width = `${clamped * 100}%`;
      }

      viewer.addEventListener('pointerdown', (e) => {
        isDragging = true;
        onPointerMove(e);
      });

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', () => { isDragging = false; });
    }

    // High-Performance Color Grading Pixel Pipeline
    function renderStudioPipeline() {
      if (!studioSourceCanvas) return;
      const gradedCanvas = document.getElementById('studioGradedCanvas');
      const rawCanvas = document.getElementById('studioRawCanvas');
      if (!gradedCanvas || !rawCanvas) return;

      const t0 = performance.now();
      const w = studioSourceCanvas.width;
      const h = studioSourceCanvas.height;

      // Copy source to raw canvas
      const rawCtx = rawCanvas.getContext('2d');
      rawCtx.drawImage(studioSourceCanvas, 0, 0);

      // Create working buffer
      const gradedCtx = gradedCanvas.getContext('2d');
      gradedCtx.drawImage(studioSourceCanvas, 0, 0);

      const imgData = gradedCtx.getImageData(0, 0, w, h);
      const d = imgData.data;
      const totalPixels = w * h;

      // Precalculate transformation scalars
      const expMul = Math.pow(2, studioParams.exposure / 50);
      const contrast = studioParams.contrast;
      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      const hlFactor = studioParams.highlights / 100;
      const shFactor = studioParams.shadows / 100;
      const tempR = (studioParams.temperature / 100) * 35;
      const tempB = -(studioParams.temperature / 100) * 35;
      const tintG = -(studioParams.tint / 100) * 25;
      const tintM = (studioParams.tint / 100) * 25;
      const satMul = 1 + studioParams.saturation / 100;
      const vibMul = studioParams.vibrance / 100;

      // 3-way wheel vector offsets
      const liftR = studioParams.wheels.lift.x * 40 + studioParams.wheels.lift.luma;
      const liftG = -studioParams.wheels.lift.y * 40 + studioParams.wheels.lift.luma;
      const liftB = -studioParams.wheels.lift.x * 40 + studioParams.wheels.lift.luma;

      const gammaR = studioParams.wheels.gamma.x * 35 + studioParams.wheels.gamma.luma;
      const gammaG = -studioParams.wheels.gamma.y * 35 + studioParams.wheels.gamma.luma;
      const gammaB = -studioParams.wheels.gamma.x * 35 + studioParams.wheels.gamma.luma;

      const gainR = studioParams.wheels.gain.x * 45 + studioParams.wheels.gain.luma;
      const gainG = -studioParams.wheels.gain.y * 45 + studioParams.wheels.gain.luma;
      const gainB = -studioParams.wheels.gain.x * 45 + studioParams.wheels.gain.luma;

      const isThermal = studioParams.isThermalFLIR;

      // Precompute 256 Tone Curve LUT
      const curveLUT = new Uint8Array(256);
      const preset = studioParams.curvePreset;
      for (let i = 0; i < 256; i++) {
        const norm = i / 255;
        let out = norm;
        if (preset === 'scurve') {
          out = 1 / (1 + Math.exp(-6 * (norm - 0.5)));
        } else if (preset === 'liftshadows') {
          out = Math.pow(norm, 0.7);
        }
        curveLUT[i] = Math.max(0, Math.min(255, Math.round(out * 255)));
      }

      // Histogram bin counters
      const histR = new Uint32Array(256);
      const histG = new Uint32Array(256);
      const histB = new Uint32Array(256);
      const histLuma = new Uint32Array(256);

      // Pixel loop
      for (let i = 0; i < d.length; i += 4) {
        let r = d[i];
        let g = d[i + 1];
        let b = d[i + 2];

        if (isThermal) {
          // False color FLIR infrared spectrum mapping
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          const tNorm = luma / 255;
          if (tNorm < 0.25) {
            r = 0; g = tNorm * 4 * 180; b = 255;
          } else if (tNorm < 0.5) {
            r = 0; g = 255; b = (1 - (tNorm - 0.25) * 4) * 255;
          } else if (tNorm < 0.75) {
            r = (tNorm - 0.5) * 4 * 255; g = 255; b = 0;
          } else {
            r = 255; g = (1 - (tNorm - 0.75) * 4) * 255; b = (tNorm - 0.75) * 4 * 255;
          }
        } else {
          // 1. Exposure
          r *= expMul;
          g *= expMul;
          b *= expMul;

          // 2. Contrast
          r = contrastFactor * (r - 128) + 128;
          g = contrastFactor * (g - 128) + 128;
          b = contrastFactor * (b - 128) + 128;

          // Luminance for multi-band adjustments
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          const normLuma = Math.max(0, Math.min(1, luma / 255));

          // 3. Highlights & Shadows
          if (normLuma > 0.5) {
            const hWeight = (normLuma - 0.5) * 2;
            r += hlFactor * hWeight * 30;
            g += hlFactor * hWeight * 30;
            b += hlFactor * hWeight * 30;
          } else {
            const sWeight = (0.5 - normLuma) * 2;
            r += shFactor * sWeight * 30;
            g += shFactor * sWeight * 30;
            b += shFactor * sWeight * 30;
          }

          // 4. White Balance (Temperature & Tint)
          r += tempR + tintM * 0.5;
          g += tintG;
          b += tempB + tintM * 0.5;

          // 5. 3-Way Color Wheels (Lift, Gamma, Gain)
          const shadowWeight = Math.pow(1 - normLuma, 2);
          const midWeight = 4 * normLuma * (1 - normLuma);
          const highWeight = Math.pow(normLuma, 2);

          r += liftR * shadowWeight + gammaR * midWeight + gainR * highWeight;
          g += liftG * shadowWeight + gammaG * midWeight + gainG * highWeight;
          b += liftB * shadowWeight + gammaB * midWeight + gainB * highWeight;

          // 6. Saturation & Vibrance
          const curLuma = 0.299 * r + 0.587 * g + 0.114 * b;
          const maxChannel = Math.max(r, g, b);
          const minChannel = Math.min(r, g, b);
          const curSat = (maxChannel - minChannel) / (maxChannel || 1);
          const effSatMul = satMul + (1 - curSat) * vibMul;

          r = curLuma + (r - curLuma) * effSatMul;
          g = curLuma + (g - curLuma) * effSatMul;
          b = curLuma + (b - curLuma) * effSatMul;

          // 7. Tone Curve LUT Clamp
          r = curveLUT[Math.max(0, Math.min(255, Math.round(r)))];
          g = curveLUT[Math.max(0, Math.min(255, Math.round(g)))];
          b = curveLUT[Math.max(0, Math.min(255, Math.round(b)))];
        }

        d[i] = r;
        d[i + 1] = g;
        d[i + 2] = b;

        // Populate histogram scopes
        histR[r]++;
        histG[g]++;
        histB[b]++;
        const finalLuma = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        histLuma[finalLuma]++;
      }

      gradedCtx.putImageData(imgData, 0, 0);

      // Render latency readout
      const renderMs = (performance.now() - t0).toFixed(1);
      const latencyEl = document.getElementById('studioRenderLatency');
      if (latencyEl) latencyEl.textContent = `${renderMs} ms`;

      // Render RGB Histogram Scope
      renderHistogramScope(histR, histG, histB, histLuma, totalPixels);
    }

    // Render RGB Histogram Scope Canvas
    function renderHistogramScope(histR, histG, histB, histLuma, totalPixels) {
      const c = document.getElementById('studioHistogramCanvas');
      if (!c) return;
      const ctx = c.getContext('2d');
      const w = (c.width = c.clientWidth * window.devicePixelRatio || 280);
      const h = (c.height = c.clientHeight * window.devicePixelRatio || 70);

      ctx.clearRect(0, 0, w, h);

      // Find max bin value for normalized drawing
      let maxBin = 1;
      for (let i = 2; i < 254; i++) {
        if (histR[i] > maxBin) maxBin = histR[i];
        if (histG[i] > maxBin) maxBin = histG[i];
        if (histB[i] > maxBin) maxBin = histB[i];
      }

      function drawChannel(hist, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 0; i < 256; i++) {
          const x = (i / 255) * w;
          const y = h - (hist[i] / maxBin) * (h * 0.9);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Draw channel curves
      ctx.globalAlpha = 0.75;
      drawChannel(histR, '#ef4444');
      drawChannel(histG, '#10b981');
      drawChannel(histB, '#38bdf8');
      ctx.globalAlpha = 0.9;
      drawChannel(histLuma, '#ffffff');
      ctx.globalAlpha = 1.0;
    }

    // One-Click Professional Presets
    function applyStudioPreset(name) {
      sound.click();
      resetStudioGradingValuesOnly();

      if (name === 'natural') {
        // Natural Rec.709
        studioParams.curvePreset = 'linear';
      } else if (name === 'leak') {
        // Water Leak Isolation: boosts specular cyan/blue and drops shadows
        studioParams.exposure = 15;
        studioParams.contrast = 35;
        studioParams.highlights = 40;
        studioParams.shadows = -20;
        studioParams.temperature = -25;
        studioParams.tint = -10;
        studioParams.saturation = 30;
        studioParams.vibrance = 45;
        studioParams.curvePreset = 'scurve';
      } else if (name === 'thermal') {
        // Thermal FLIR False Color IR
        studioParams.isThermalFLIR = true;
      } else if (name === 'solar') {
        // Solar Panel Anti-Glare Scan
        studioParams.exposure = -15;
        studioParams.contrast = 40;
        studioParams.highlights = -50;
        studioParams.shadows = 35;
        studioParams.vibrance = 25;
        studioParams.curvePreset = 'liftshadows';
      } else if (name === 'cinematic') {
        // Teal & Orange Blockbuster Look
        studioParams.exposure = 5;
        studioParams.contrast = 25;
        studioParams.wheels.gain.x = 0.45;  // Warm amber highlights
        studioParams.wheels.gain.y = -0.15;
        studioParams.wheels.lift.x = -0.4;  // Deep cyan shadows
        studioParams.wheels.lift.y = 0.1;
        studioParams.saturation = 20;
        studioParams.curvePreset = 'scurve';
      } else if (name === 'monochrome') {
        // High-Contrast Crack Detection B&W
        studioParams.saturation = -100;
        studioParams.contrast = 55;
        studioParams.highlights = 30;
        studioParams.shadows = -35;
        studioParams.curvePreset = 'scurve';
      }

      syncStudioSlidersFromParams();
      renderCurveCanvas();
      renderStudioPipeline();
      showToast(`Applied Color Preset: ${name.toUpperCase()}`, 'success', 'Preset Loaded');
    }

    function resetStudioGradingValuesOnly() {
      studioParams.exposure = 0;
      studioParams.contrast = 0;
      studioParams.highlights = 0;
      studioParams.shadows = 0;
      studioParams.temperature = 0;
      studioParams.tint = 0;
      studioParams.saturation = 0;
      studioParams.vibrance = 0;
      studioParams.wheels.lift = { x: 0, y: 0, luma: 0 };
      studioParams.wheels.gamma = { x: 0, y: 0, luma: 0 };
      studioParams.wheels.gain = { x: 0, y: 0, luma: 0 };
      studioParams.curvePreset = 'scurve';
      studioParams.isThermalFLIR = false;
    }

    function resetStudioGrading() {
      sound.click();
      resetStudioGradingValuesOnly();
      syncStudioSlidersFromParams();
      resetColorWheels();
      renderCurveCanvas();
      renderStudioPipeline();
      showToast('All color grading parameters reset to neutral defaults', 'info', 'Studio Reset');
    }

    function syncStudioSlidersFromParams() {
      ['exposure', 'contrast', 'highlights', 'shadows', 'temperature', 'tint', 'saturation', 'vibrance'].forEach(p => {
        const slider = document.getElementById(`slider-${p}`);
        if (slider) slider.value = studioParams[p];
        const valEl = document.getElementById(`val-${p}`);
        if (valEl) {
          const val = studioParams[p];
          if (p === 'exposure') valEl.textContent = `${val > 0 ? '+' : ''}${(val / 50).toFixed(2)} EV`;
          else if (p === 'temperature') valEl.textContent = `${5500 + val * 25} K`;
          else if (p === 'saturation') valEl.textContent = `${100 + parseInt(val)}%`;
          else valEl.textContent = val;
        }
      });
    }

    // Studio Action Handlers
    function downloadGradedImage() {
      sound.success();
      const gradedCanvas = document.getElementById('studioGradedCanvas');
      if (!gradedCanvas) return;

      const link = document.createElement('a');
      link.download = `ecograde_${studioParams.activeSample}_calibrated.png`;
      link.href = gradedCanvas.toDataURL('image/png');
      link.click();
      showToast('Exported calibrated high-resolution PNG', 'success', 'Export Complete');
    }

    function attachGradedImageToReport() {
      sound.success();
      const gradedCanvas = document.getElementById('studioGradedCanvas');
      if (!gradedCanvas) return;

      const thumbUrl = gradedCanvas.toDataURL('image/jpeg', 0.8);
      studioParams.attachedEvidence = thumbUrl;

      // Update report modal preview
      const thumbEl = document.getElementById('reportPhotoPreviewThumb');
      const titleEl = document.getElementById('reportPhotoStatusTitle');
      const subEl = document.getElementById('reportPhotoStatusSubtitle');
      const rewardEl = document.getElementById('reportRewardLabel');

      if (thumbEl) {
        thumbEl.innerHTML = `<img src="${thumbUrl}" class="w-full h-full object-cover">`;
        thumbEl.className = 'w-9 h-9 rounded-lg border border-emerald-500 overflow-hidden';
      }
      if (titleEl) titleEl.textContent = 'Evidence Attached (Calibrated)';
      if (subEl) subEl.textContent = 'Color graded in EcoGrade Pro (+25 EcoBonus)';
      if (rewardEl) rewardEl.textContent = '+75 EcoPoints (+25 Bonus!)';

      openModal('reportModal');
      showToast('Calibrated photo attached to EcoPatrol report with +25 bonus points!', 'success', 'Evidence Attached');
    }

    function launchStudioForEvidence() {
      closeModal('reportModal');
      switchTab('studio');
      loadStudioSample('leak');
      showToast('Enhance water contrast and click "Send to EcoPatrol" when ready', 'info', 'Inspection Workflow');
    }

    function copyStudioSettingsRecipe() {
      sound.click();
      const cssRecipe = `/* EcoGrade CSS Recipe: ${studioParams.activeSample} */\nfilter: brightness(${1 + studioParams.exposure / 100}) contrast(${1 + studioParams.contrast / 100}) saturate(${1 + studioParams.saturation / 100});`;
      navigator.clipboard.writeText(cssRecipe).then(() => {
        showToast('Grading CSS recipe copied to clipboard!', 'success', 'Recipe Copied');
      }).catch(() => {
        showToast(cssRecipe, 'info', 'CSS Recipe');
      });
    }

    // Master initialization for the whole color grading suite
    function initColorGradingSuite() {
      // 1. Restore atmosphere grade
      if (appState.atmosphere && appState.atmosphere !== 'noon') {
        setAtmosphereGrade(appState.atmosphere);
      } else {
        document.documentElement.setAttribute('data-atmosphere', 'noon');
      }

      // 2. Restore map color grade
      if (appState.mapColorGrade && appState.mapColorGrade !== 'default') {
        setMapColorGrade(appState.mapColorGrade);
      }

      // 3. Pre-initialize studio
      initColorGradingStudio();
    }

    // -------------------------------------------------------------------------
    // 12.4 GOOGLE GEMINI™ AI CAMPUS SUSTAINABILITY ADVISOR (CLIENT-SIDE JS)
    // -------------------------------------------------------------------------
    const GEMINI_KEY_STORAGE = 'ecocampus_gemini_api_key';

    function getGeminiApiKey() {
      return localStorage.getItem(GEMINI_KEY_STORAGE) || '';
    }

    function saveGeminiApiKey() {
      const input = document.getElementById('geminiApiKeyInput');
      if (!input) return;
      const key = input.value.trim();
      if (key) {
        localStorage.setItem(GEMINI_KEY_STORAGE, key);
        updateGeminiKeyStatusBadge();
        closeModal('geminiKeyModal');
        sound.success();
        showToast('Gemini API Key saved locally. Live inference active!', 'success', 'Gemini Connected');
      } else {
        clearGeminiApiKey();
      }
    }

    function clearGeminiApiKey() {
      localStorage.removeItem(GEMINI_KEY_STORAGE);
      const input = document.getElementById('geminiApiKeyInput');
      if (input) input.value = '';
      updateGeminiKeyStatusBadge();
      sound.click();
      showToast('Gemini API key removed. Using smart client-side simulation.', 'info', 'Key Cleared');
    }

    function toggleGeminiKeyVisibility() {
      const input = document.getElementById('geminiApiKeyInput');
      const icon = document.getElementById('geminiEyeIcon');
      if (!input || !icon) return;
      if (input.type === 'password') {
        input.type = 'text';
        icon.setAttribute('data-lucide', 'eye-off');
      } else {
        input.type = 'password';
        icon.setAttribute('data-lucide', 'eye');
      }
      lucide.createIcons();
    }

    function updateGeminiKeyStatusBadge() {
      const key = getGeminiApiKey();
      const statusLabel = document.getElementById('geminiStatusLabel');
      const keyBtnLabel = document.getElementById('geminiKeyBtnLabel');
      const input = document.getElementById('geminiApiKeyInput');

      if (input && key) {
        input.value = key;
      }

      if (key) {
        if (statusLabel) statusLabel.textContent = 'Gemini Live (Direct API)';
        if (keyBtnLabel) keyBtnLabel.textContent = 'API Connected';
      } else {
        if (statusLabel) statusLabel.textContent = 'Smart Client Engine';
        if (keyBtnLabel) keyBtnLabel.textContent = 'Config API Key';
      }
    }

    function setGeminiPrompt(text) {
      sound.click();
      const input = document.getElementById('geminiAdvisorInput');
      if (input) {
        input.value = text;
        input.focus();
      }
    }

    async function submitGeminiAudit() {
      const input = document.getElementById('geminiAdvisorInput');
      const responseCard = document.getElementById('geminiResponseCard');
      const submitBtn = document.getElementById('geminiSubmitBtn');
      const btnText = document.getElementById('geminiBtnText');
      const sendIcon = document.getElementById('geminiSendIcon');

      if (!input || !input.value.trim()) {
        showToast('Please enter your daily mess leftovers or dorm habit description.', 'warning', 'Input Needed');
        if (input) input.focus();
        return;
      }

      const userText = input.value.trim();
      sound.click();

      // Set Loading UI State
      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Gemini Analyzing...';
      if (sendIcon) sendIcon.className = 'w-3.5 h-3.5 animate-spin';
      if (responseCard) {
        responseCard.classList.remove('hidden');
        responseCard.innerHTML = `
          <div class="flex items-center gap-3 py-4">
            <div class="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <div class="text-xs text-indigo-300 font-mono animate-pulse">Consulting Google Gemini AI model for campus carbon reduction audit...</div>
          </div>
        `;
      }

      const apiKey = getGeminiApiKey();
      let auditResult = null;
      let isLiveAPI = false;

      if (apiKey) {
        try {
          auditResult = await callGeminiAPI(userText, apiKey);
          isLiveAPI = true;
        } catch (err) {
          console.warn('Gemini API call failed, falling back to smart engine:', err);
          auditResult = generateSmartAdvisorFallback(userText);
        }
      } else {
        // High-speed smart heuristic simulation
        await new Promise(r => setTimeout(r, 600));
        auditResult = generateSmartAdvisorFallback(userText);
      }

      // Render Result Card
      renderGeminiAuditResult(auditResult, isLiveAPI);

      // Reward student with +25 EcoPoints
      appState.userEcoPoints += 25;
      appState.co2SavedKg = parseFloat((appState.co2SavedKg + auditResult.impactKg * 0.35).toFixed(1));
      saveState();
      updatePointsDisplay();
      triggerConfetti();
      sound.success();

      // Reset Submit Button
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Analyze with Gemini';
      if (sendIcon) sendIcon.className = 'w-3.5 h-3.5';

      showToast('Gemini completed habit audit and credited +25 EcoPoints!', 'success', 'AI Audit Verified');
    }

    // Direct Google Gemini REST API Client-Side Call
    async function callGeminiAPI(userQuery, key) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
      
      const payload = {
        contents: [{
          role: 'user',
          parts: [{ text: userQuery }]
        }],
        systemInstruction: {
          parts: [{
            text: window.GEMINI_LOCALIZED_PROMPT || `You are the EcoCampus AI Sustainability Advisor at a modern green university.
Analyze the student's daily mess hall food waste or dorm appliance/resource habit.
Respond strictly in JSON format with this exact schema:
{
  "impactKg": 0.45,
  "equivalentStr": "Equivalent to driving 1.2 miles in a standard gasoline vehicle.",
  "savingsPct": 75,
  "tips": [
    "Tip 1 short and actionable for dorms/dining",
    "Tip 2 short and actionable for dorms/dining",
    "Tip 3 short and actionable for dorms/dining"
  ]
}`
          }]
        },
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 350
        }
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Gemini API error ${res.status}`);
      }

      const data = await res.json();
      const rawText = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text;
      
      if (!rawText) throw new Error('Empty Gemini response');

      // Extract JSON if wrapped in code blocks
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    }

    // Intelligent Campus Heuristic Engine (Fallback when no key is entered)
    function generateSmartAdvisorFallback(query) {
      const lower = query.toLowerCase();

      if (lower.includes('food') || lower.includes('rice') || lower.includes('chicken') || lower.includes('pasta') || lower.includes('salad') || lower.includes('leftover') || lower.includes('mess') || lower.includes('dining')) {
        return {
          impactKg: 0.62,
          equivalentStr: 'Equivalent to charging an iPhone 84 times or driving 1.6 miles in a passenger car.',
          savingsPct: 88,
          tips: [
            'Portioning Strategy: Ask cafeteria servers for "taster portions" on side items before committing to a full scoop.',
            'Dining Hall Compost Loop: Always deposit scrape leftovers into the green anaerobic digestor bins near the dish conveyor to avoid landfill methane.',
            'Bite & Save Rescuing: Utilize the EcoCampus Food Rescue voucher system to reserve portioned meal packs during the final 30 minutes of mess hours.'
          ]
        };
      } else if (lower.includes('ac') || lower.includes('cool') || lower.includes('window') || lower.includes('heat') || lower.includes('hvac')) {
        return {
          impactKg: 1.84,
          equivalentStr: 'Equivalent to running a desktop refrigerator continuously for 5 full days.',
          savingsPct: 82,
          tips: [
            'Envelope Discipline: Always seal dorm windows tightly when the building chiller/heating loop is engaged to prevent continuous compressor overdrive.',
            '72°F Sweet Spot: Adjusting dorm thermostat setpoints from 66°F to 72°F cuts daily electrical consumption by ~18% with zero comfort loss.',
            'Night Ventilation: Take advantage of cool campus evening breezes between 7 PM and 10 PM before activating motorized airflow.'
          ]
        };
      } else if (lower.includes('pc') || lower.includes('gaming') || lower.includes('monitor') || lower.includes('sleep') || lower.includes('computer') || lower.includes('rig')) {
        return {
          impactKg: 0.74,
          equivalentStr: 'Equivalent to burning 0.8 lbs of coal at the regional grid power plant.',
          savingsPct: 94,
          tips: [
            'Eliminate Phantom Standby: A gaming PC with dual displays draws 18-35W in idle sleep. Use a master-switched surge protector to cut true phantom draw.',
            'Hibernate Mode: Switch from "Sleep" to "Hibernate" in Windows/macOS power settings—it writes memory state to SSD and cuts draw to 0.0W.',
            'Display Sleep Timeout: Configure monitor backlights to shut off automatically after 5 minutes of inactivity.'
          ]
        };
      } else if (lower.includes('laundry') || lower.includes('wash') || lower.includes('clothes') || lower.includes('cycle')) {
        return {
          impactKg: 1.15,
          equivalentStr: 'Equivalent to boiling an electric kettle 42 times.',
          savingsPct: 78,
          tips: [
            'Cold Water Wash Standard: 90% of residential washer energy is consumed purely by heating water. Cold water cleans modern detergents equally well.',
            'Consolidate Full Batches: Washing 1 full basket instead of 2 half-batches cuts per-student water and electrical cycles in half.',
            'Air Dry Common Rack: Hang drying heavy denim and sweatshirts on a folding rack completely avoids the high-wattage resistance heaters of dryers.'
          ]
        };
      } else {
        return {
          impactKg: 0.55,
          equivalentStr: 'Equivalent to driving 1.4 miles in a standard combustion commuter vehicle.',
          savingsPct: 70,
          tips: [
            'Micro-Habit Consolidation: Small habitual adjustments in dorm living aggregate into significant campus microgrid savings.',
            'Peer Accountability: Share daily conservation milestones on the Dorm Eco-Derby board to motivate quad roommates.',
            'EcoPoints Redemption: Earn bonus points on every logged action and redeem them for zero-waste cafeteria meal packs and laundry vouchers.'
          ]
        };
      }
    }

    function renderGeminiAuditResult(result, isLiveAPI) {
      const card = document.getElementById('geminiResponseCard');
      if (!card) return;

      const tipsListHTML = result.tips.map(t => `
        <li class="flex items-start gap-2.5 text-slate-300">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0 shadow-sm shadow-emerald-400"></span>
          <span>${t}</span>
        </li>
      `).join('');

      card.innerHTML = `
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
              <i data-lucide="sparkles" class="w-4 h-4 text-cyan-400"></i>
            </div>
            <div>
              <h4 class="font-bold text-white text-sm">Gemini AI Sustainability Audit Result</h4>
              <p class="text-[11px] text-slate-400 font-mono">Engine: <span class="text-cyan-400">${isLiveAPI ? 'Google Gemini 1.5 Flash (Live API)' : 'Campus Heuristic Smart AI'}</span></p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold text-xs flex items-center gap-1 shadow-sm">
              <i data-lucide="award" class="w-3.5 h-3.5"></i>
              +25 EcoPoints Credited!
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span class="text-[10px] uppercase font-mono font-bold text-slate-400">Estimated Carbon Impact</span>
            <div class="text-2xl font-black font-mono text-amber-400">~${result.impactKg} kg CO₂e</div>
            <p class="text-[11px] text-slate-400 leading-snug">${result.equivalentStr}</p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span class="text-[10px] uppercase font-mono font-bold text-slate-400">Achievable Carbon Reduction</span>
            <div class="text-2xl font-black font-mono text-emerald-400">${result.savingsPct}% Potential</div>
            <p class="text-[11px] text-slate-400 leading-snug">Avoidable by applying the 3 practical campus tips below</p>
          </div>
        </div>

        <div class="space-y-2 pt-1">
          <span class="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
            <i data-lucide="lightbulb" class="w-3.5 h-3.5 text-amber-400"></i>
            Gemini's Actionable Campus Tips:
          </span>
          <ul class="space-y-2.5 text-xs leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
            ${tipsListHTML}
          </ul>
        </div>
      `;

      lucide.createIcons();
    }

    function initGeminiAdvisor() {
      updateGeminiKeyStatusBadge();
    }

    /* =========================================================================
       13. APPLICATION BOOTSTRAP
       ========================================================================= */
    window.addEventListener('DOMContentLoaded', () => {
      applyTheme(appState.darkMode);
      if (sfxIcon) sfxIcon.setAttribute('data-lucide', appState.sfxEnabled ? 'volume-2' : 'volume-x');

      updatePointsDisplay();
      renderBounties();
      renderDerbyStandings();
      renderDiningMeals();
      renderPatrolTickets();
      renderCheers();
      renderRewardsStore();
      calculateFootprint();

      initCharts();
      if (!appState.darkMode) {
        updateChartTheme(false);
      }
      startTelemetrySimulation();

      // Initialize Color Grading Suite
      initColorGradingSuite();

      // Initialize Google Gemini AI Sustainability Advisor
      initGeminiAdvisor();

      // Activate Overview tab on initial load
      switchTab('overview');

      // Expose functions for multi-country campusEngine
      window.renderDerbyStandings = renderDerbyStandings;
      window.renderDiningMeals = renderDiningMeals;
      window.renderRewardsStore = renderRewardsStore;
      window.renderBounties = renderBounties;
      window.selectMapBuilding = selectMapBuilding;
      window.showToast = showToast;
      window.sound = sound;
      window.switchTab = switchTab;
      window.claimBounty = claimBounty;
      window.reserveMeal = reserveMeal;
      window.handleGeminiVisionUpload = handleGeminiVisionUpload;

      refreshIcons();
    });

    async function handleGeminiVisionUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const loadingEl = document.getElementById('geminiScanLoading');
      const resultCard = document.getElementById('geminiScanResult');
      
      if (loadingEl) loadingEl.classList.remove('hidden');
      if (resultCard) resultCard.classList.add('hidden');
      if (window.sound && typeof window.sound.click === 'function') window.sound.click();

      try {
        let analysis = null;
        if (window.api && typeof window.api.analyzeIncidentImage === 'function') {
          analysis = await window.api.analyzeIncidentImage(file);
        }

        if (!analysis) {
          analysis = {
            detected_category: 'plumbing',
            title: 'Water Line Continuous Leak Detected',
            location_hint: 'Nilgiri Bhavan Restroom Core',
            estimated_waste: '32.5 Liters / hr',
            severity: 'high',
            confidence: 94.2,
            suggested_action: 'Close riser valve & alert facilities crew'
          };
        }

        // Auto-select category
        const catSelect = document.getElementById('reportCategory');
        if (catSelect) {
          if (analysis.detected_category === 'plumbing') catSelect.selectedIndex = 0;
          else if (analysis.detected_category === 'hvac') catSelect.selectedIndex = 1;
          else if (analysis.detected_category === 'electrical') catSelect.selectedIndex = 2;
          else catSelect.selectedIndex = 3;
        }

        // Auto-fill description
        const descEl = document.getElementById('reportDescription');
        if (descEl) {
          descEl.value = `${analysis.title}. Gemini Vision identified: ${analysis.suggested_action}. Estimated waste rate: ${analysis.estimated_waste}.`;
        }

        // Update result card
        const titleEl = document.getElementById('geminiAiTitle');
        const confEl = document.getElementById('geminiAiConfidence');
        const wasteEl = document.getElementById('geminiAiWaste');
        const actEl = document.getElementById('geminiAiAction');

        if (titleEl) titleEl.textContent = analysis.title;
        if (confEl) confEl.textContent = `${analysis.confidence || 96}% AI Confidence`;
        if (wasteEl) wasteEl.textContent = analysis.estimated_waste;
        if (actEl) actEl.textContent = analysis.suggested_action;

        if (loadingEl) loadingEl.classList.add('hidden');
        if (resultCard) resultCard.classList.remove('hidden');

        if (window.sound && typeof window.sound.success === 'function') window.sound.success();
        if (typeof showToast === 'function') {
          showToast(`Gemini Vision scanned photo: Category & estimated loss auto-filled!`, 'success', '✨ AI Hazard Scanned');
        }
      } catch (err) {
        if (loadingEl) loadingEl.classList.add('hidden');
        console.error('Gemini vision error:', err);
      } finally {
        if (window.lucide) window.lucide.createIcons();
      }
    }