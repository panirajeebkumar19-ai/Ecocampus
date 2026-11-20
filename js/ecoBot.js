/**
 * EcoBot AI Assistant (Modular Floating Chatbot)
 * Integrates campus-grounded intelligence with the FastAPI backend (/api/chat/ask).
 * Resilient offline fallback with full campus microgrid and dorm context.
 */

(function initEcoBot() {
  'use strict';

  // Wait for DOM to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEcoBot);
  } else {
    setupEcoBot();
  }

  function setupEcoBot() {
    // Prevent duplicate initialization
    if (document.getElementById('ecoBotContainer')) return;

    // Inject EcoBot HTML
    const container = document.createElement('div');
    container.id = 'ecoBotContainer';
    container.className = 'fixed bottom-5 right-5 z-40 flex flex-col items-end select-none font-sans';
    container.innerHTML = `
      <!-- Chat Window Panel -->
      <div id="ecoBotWindow" class="hidden flex flex-col w-[360px] sm:w-[400px] h-[520px] max-h-[80vh] rounded-2xl glass-panel border border-slate-700/80 shadow-2xl shadow-emerald-950/40 overflow-hidden mb-3.5 transition-all duration-300 transform scale-95 opacity-0 origin-bottom-right">
        
        <!-- Header -->
        <div class="px-4 py-3 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="relative w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-md shadow-emerald-500/20 flex-shrink-0">
              <i data-lucide="bot" class="w-4 h-4 text-white"></i>
              <span class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900 animate-pulse"></span>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold text-white tracking-tight">EcoBot AI</span>
                <span id="ecoBotModeBadge" class="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Gemini Live</span>
              </div>
              <p class="text-[10px] text-slate-400 font-mono">Net-Zero Campus Sustainability Advisor</p>
            </div>
          </div>
          
          <div class="flex items-center gap-1">
            <button id="ecoBotClearBtn" title="Clear chat history" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
            </button>
            <button id="ecoBotCloseBtn" title="Close EcoBot" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- Quick Prompt Chips Strip -->
        <div class="px-3 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0 text-[11px]">
          <button class="eco-chip px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-slate-700 text-slate-300 hover:text-emerald-300 transition-all whitespace-nowrap flex items-center gap-1" data-query="How to win the Dorm Derby?">
            🏆 Win Derby
          </button>
          <button class="eco-chip px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-slate-700 text-slate-300 hover:text-emerald-300 transition-all whitespace-nowrap flex items-center gap-1" data-query="Are there surplus cafeteria meals right now?">
            🍲 Surplus Food
          </button>
          <button class="eco-chip px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-slate-700 text-slate-300 hover:text-emerald-300 transition-all whitespace-nowrap flex items-center gap-1" data-query="What is the microgrid solar status today?">
            ⚡ Solar Grid
          </button>
          <button class="eco-chip px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-slate-700 text-slate-300 hover:text-emerald-300 transition-all whitespace-nowrap flex items-center gap-1" data-query="How do I report a water leak in EcoPatrol?">
            🚨 Report Leak
          </button>
        </div>

        <!-- Messages Area -->
        <div id="ecoBotMessages" class="flex-1 p-3.5 space-y-3 overflow-y-auto custom-scrollbar text-xs leading-relaxed">
          <!-- Initial greeting is injected dynamically -->
        </div>

        <!-- Typing Indicator -->
        <div id="ecoBotTyping" class="hidden px-4 py-2 text-[11px] text-slate-400 italic flex items-center gap-2 border-t border-slate-800/40 bg-slate-900/40">
          <span class="flex gap-1 items-center">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style="animation-delay: 0.15s"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style="animation-delay: 0.3s"></span>
          </span>
          <span>EcoBot is analyzing campus microgrid & telemetry...</span>
        </div>

        <!-- Input Bar -->
        <form id="ecoBotForm" class="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2 flex-shrink-0">
          <input 
            type="text" 
            id="ecoBotInput" 
            placeholder="Ask about solar, meals, derby points..." 
            autocomplete="off"
            class="flex-1 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button 
            type="submit" 
            id="ecoBotSendBtn"
            title="Send query"
            class="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center flex-shrink-0"
          >
            <i data-lucide="send" class="w-4 h-4"></i>
          </button>
        </form>

      </div>

      <!-- Floating Trigger Button -->
      <button 
        id="ecoBotTriggerBtn" 
        aria-label="Open EcoBot AI Sustainability Assistant"
        title="Open EcoBot AI Assistant"
        class="group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 hover:from-slate-850 hover:to-slate-800 border border-emerald-500/40 hover:border-emerald-400 shadow-xl shadow-emerald-950/50 transition-all transform hover:scale-105 active:scale-95 focus:outline-none"
      >
        <div class="relative w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-md shadow-emerald-500/30">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-white animate-pulse"></i>
          <span class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900"></span>
        </div>
        <div class="text-left hidden sm:block pr-1">
          <div class="text-[11px] font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1">
            <span>Ask EcoBot</span>
            <span class="text-[9px] font-mono font-normal px-1 py-0.2 rounded bg-brand-500/20 text-emerald-400">AI</span>
          </div>
          <p class="text-[9px] text-slate-400">Campus Intel & Derby Tips</p>
        </div>
        <span class="sm:hidden text-xs font-bold text-emerald-400">AI</span>
      </button>
    `;

    document.body.appendChild(container);

    // Refresh lucide icons
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: container });
    }

    // Attach Event Handlers
    bindEcoBotEvents();
    injectWelcomeMessage();
  }

  function bindEcoBotEvents() {
    const triggerBtn = document.getElementById('ecoBotTriggerBtn');
    const closeBtn = document.getElementById('ecoBotCloseBtn');
    const clearBtn = document.getElementById('ecoBotClearBtn');
    const chatWindow = document.getElementById('ecoBotWindow');
    const form = document.getElementById('ecoBotForm');
    const input = document.getElementById('ecoBotInput');

    triggerBtn.addEventListener('click', toggleEcoBot);
    closeBtn.addEventListener('click', closeEcoBot);
    clearBtn.addEventListener('click', () => {
      const messagesContainer = document.getElementById('ecoBotMessages');
      messagesContainer.innerHTML = '';
      injectWelcomeMessage();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;
      handleUserQuery(query);
      input.value = '';
    });

    // Delegate chips click
    const chipsStrip = document.querySelector('#ecoBotWindow .eco-chip');
    document.querySelectorAll('#ecoBotWindow .eco-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        if (query) {
          handleUserQuery(query);
        }
      });
    });
  }

  function toggleEcoBot() {
    const chatWindow = document.getElementById('ecoBotWindow');
    if (chatWindow.classList.contains('hidden')) {
      openEcoBot();
    } else {
      closeEcoBot();
    }
  }

  function openEcoBot() {
    const chatWindow = document.getElementById('ecoBotWindow');
    chatWindow.classList.remove('hidden');
    requestAnimationFrame(() => {
      chatWindow.classList.remove('scale-95', 'opacity-0');
      chatWindow.classList.add('scale-100', 'opacity-100');
    });
    const input = document.getElementById('ecoBotInput');
    if (input) setTimeout(() => input.focus(), 150);
  }

  function closeEcoBot() {
    const chatWindow = document.getElementById('ecoBotWindow');
    chatWindow.classList.remove('scale-100', 'opacity-100');
    chatWindow.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      chatWindow.classList.add('hidden');
    }, 200);
  }

  function injectWelcomeMessage() {
    const messagesContainer = document.getElementById('ecoBotMessages');
    const studentName = document.getElementById('headerStudentName')?.textContent || 'Aarav Sharma';
    const welcomeHtml = `
      <div class="flex items-start gap-2.5">
        <div class="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <i data-lucide="bot" class="w-3.5 h-3.5 text-emerald-400"></i>
        </div>
        <div class="p-3 rounded-2xl rounded-tl-sm bg-slate-800/90 border border-slate-700/80 text-slate-200 shadow-sm max-w-[85%]">
          <p class="font-semibold text-white mb-1">👋 Welcome ${studentName}!</p>
          <p>I'm your **EcoBot** campus sustainability advisor. Ask me anything about microgrid telemetry, Dorm Derby tips, cafeteria surplus food, or submitting hazard reports.</p>
        </div>
      </div>
    `;
    messagesContainer.innerHTML = welcomeHtml;
    if (window.lucide) window.lucide.createIcons({ root: messagesContainer });
  }

  function appendUserBubble(text) {
    const messagesContainer = document.getElementById('ecoBotMessages');
    const bubble = document.createElement('div');
    bubble.className = 'flex items-start justify-end gap-2';
    bubble.innerHTML = `
      <div class="p-3 rounded-2xl rounded-tr-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md max-w-[85%] font-medium">
        ${escapeHtml(text)}
      </div>
    `;
    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function appendBotBubble(htmlText, chips = [], actionLink = null) {
    const messagesContainer = document.getElementById('ecoBotMessages');
    const bubble = document.createElement('div');
    bubble.className = 'flex items-start gap-2.5';

    let chipsHtml = '';
    if (chips && chips.length > 0) {
      chipsHtml = `<div class="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-wrap gap-1">` +
        chips.map(c => `<button class="bot-followup-chip text-[10px] px-2 py-0.5 rounded-full bg-slate-750 hover:bg-emerald-500/20 border border-slate-700 text-emerald-300 transition-colors">${escapeHtml(c)}</button>`).join('') +
        `</div>`;
    }

    let actionBtnHtml = '';
    if (actionLink) {
      const tabNames = {
        'derby': 'Dorm Derby 🏆',
        'food': 'Cafeteria Surplus 🍲',
        'patrol': 'EcoPatrol 🚨',
        'microgrid': 'Microgrid HQ ⚡'
      };
      const label = tabNames[actionLink] || 'Open Module';
      actionBtnHtml = `
        <div class="mt-2">
          <button onclick="switchTab('${actionLink}')" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-all">
            <span>Jump to ${label}</span>
            <i data-lucide="arrow-right" class="w-3 h-3"></i>
          </button>
        </div>
      `;
    }

    bubble.innerHTML = `
      <div class="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
        <i data-lucide="bot" class="w-3.5 h-3.5 text-emerald-400"></i>
      </div>
      <div class="p-3 rounded-2xl rounded-tl-sm bg-slate-800/90 border border-slate-700/80 text-slate-200 shadow-sm max-w-[85%]">
        <div>${renderMarkdown(htmlText)}</div>
        ${actionBtnHtml}
        ${chipsHtml}
      </div>
    `;

    messagesContainer.appendChild(bubble);

    // Bind follow-up chips
    bubble.querySelectorAll('.bot-followup-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        handleUserQuery(btn.textContent.trim());
      });
    });

    if (window.lucide) window.lucide.createIcons({ root: bubble });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async function handleUserQuery(question) {
    appendUserBubble(question);

    const typing = document.getElementById('ecoBotTyping');
    typing.classList.remove('hidden');

    const countrySelector = document.getElementById('headerCountrySelector');
    const dormSelector = document.getElementById('headerDormSelector');
    const studentNameEl = document.getElementById('headerStudentName');

    const payload = {
      question: question,
      student_name: studentNameEl ? studentNameEl.textContent : 'Aarav Sharma',
      dorm: dormSelector ? dormSelector.options[dormSelector.selectedIndex]?.text : 'Ganga Hostel',
      country: countrySelector ? countrySelector.value : 'india'
    };

    try {
      const res = await fetch('/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000)
      });

      typing.classList.add('hidden');

      if (res.ok) {
        const data = await res.json();
        appendBotBubble(data.answer, data.suggested_chips, data.action_link);
        return;
      }
    } catch (e) {
      console.warn('EcoBot backend request fell back to local intelligence:', e);
    }

    typing.classList.add('hidden');
    // Local intelligent response fallback
    const fallback = generateLocalResponse(question, payload);
    appendBotBubble(fallback.answer, fallback.chips, fallback.link);
  }

  function generateLocalResponse(query, ctx) {
    const q = query.toLowerCase();

    if (q.includes('derby') || q.includes('win') || q.includes('rank') || q.includes('point')) {
      return {
        answer: `🏆 **${ctx.dorm}** is currently in **#1 place**! To maintain your lead, rally your floor to turn off common room split-AC units before 11 PM and complete today's *'Dorm Phantom Power Bounty'* for **+75 pts**.`,
        chips: ['View Derby Standings', 'Cafeteria meals', 'Solar Grid'],
        link: 'derby'
      };
    }

    if (q.includes('food') || q.includes('meal') || q.includes('mess') || q.includes('hungry') || q.includes('canteen')) {
      return {
        answer: `🍲 **Annapurna Central Dining Mess** currently has **18 surplus dinner portions** available for instant reservation at **₹20** (75% discount)! Claim yours before 14:45 cutoff to earn **+25 EcoPoints**.`,
        chips: ['Reserve Meal Now', 'Dorm Derby', 'Report Leak'],
        link: 'food'
      };
    }

    if (q.includes('leak') || q.includes('hazard') || q.includes('patrol') || q.includes('report') || q.includes('pipe')) {
      return {
        answer: `🚨 Notice water wastage or a running HVAC? Snap a photo in the **EcoPatrol** tab. Gemini AI auto-computes the water/power loss rate and dispatches campus facilities while awarding you **+50 EcoPoints**!`,
        chips: ['Open EcoPatrol', 'Dorm Derby', 'Solar Grid'],
        link: 'patrol'
      };
    }

    if (q.includes('solar') || q.includes('microgrid') || q.includes('power') || q.includes('energy') || q.includes('kw')) {
      return {
        answer: `⚡ Campus Solar PV is currently generating **1,540 kW** meeting **81.4%** of active campus electricity demand. Campus battery storage is at **94.2% State-of-Charge** charging smoothly!`,
        chips: ['View Microgrid HQ', 'Dorm Derby', 'Cafeteria meals'],
        link: 'overview'
      };
    }

    return {
      answer: `🌿 Hello **${ctx.student_name}**! EcoCampus is operating in optimal net-zero conservation mode today. You have earned a solid streak in **${ctx.dorm}**! You can ask me how to win the Derby, find discounted cafeteria food, or report campus energy hazards.`,
      chips: ['How to win Derby?', 'Surplus cafeteria food', 'Campus solar telemetry'],
      link: null
    };
  }

  function renderMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-emerald-300">$1</em>')
      .replace(/\n\n/g, '<div class="h-2"></div>')
      .replace(/\n/g, '<br/>');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Export to window for global invocation if desired
  window.ecoBot = {
    open: openEcoBot,
    close: closeEcoBot,
    ask: handleUserQuery
  };

})();
