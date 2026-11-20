/**
 * EcoCampus API Client
 * Seamlessly interfaces the frontend with the FastAPI backend (http://127.0.0.1:8000).
 * Features graceful fallback to client-side state when the backend is offline.
 */

(function initApiClient() {
  // Relative API path - cleanly routed via server.js proxy in both local and HTTPS Cloudflare environments
  const API_BASE = '/api';
  
  const api = {
    isOnline: false,
    baseUrl: API_BASE,

    async checkStatus() {
      try {
        const res = await fetch(`${API_BASE}/health`, { method: 'GET', signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const data = await res.json();
          this.isOnline = true;
          this.showStatusBadge(true);
          console.log('🌿 EcoCampus Connected to FastAPI Backend:', data);
          return true;
        }
      } catch (e) {
        this.isOnline = false;
        this.showStatusBadge(false);
      }
      return false;
    },

    showStatusBadge(online) {
      const badge = document.getElementById('backendStatusPill');
      if (badge) {
        if (online) {
          badge.className = 'flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400';
          badge.innerHTML = `
            <span class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-slate-300 font-sans font-semibold">FastAPI Backend</span>
            </span>
            <span class="text-emerald-400 font-bold font-mono">Live :8000</span>
          `;
          badge.title = 'Connected to FastAPI Backend (http://127.0.0.1:8000)';
        } else {
          badge.className = 'flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[10px] font-mono text-slate-400';
          badge.innerHTML = `
            <span class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
              <span class="text-slate-400 font-sans font-semibold">FastAPI Backend</span>
            </span>
            <span class="text-slate-500 font-bold font-mono">Offline (Client)</span>
          `;
          badge.title = 'FastAPI Offline - Running in Local Mode';
        }
      }
    },

    // 1. Telemetry
    async getTelemetry(country = 'india') {
      try {
        const res = await fetch(`${API_BASE}/telemetry/live?country=${encodeURIComponent(country)}`);
        if (res.ok) return await res.json();
      } catch (e) {}
      return null;
    },

    // 2. Dorm Derby
    async getStandings(country = 'india', metric = 'overall') {
      try {
        const res = await fetch(`${API_BASE}/derby/standings?country=${encodeURIComponent(country)}&metric=${encodeURIComponent(metric)}`);
        if (res.ok) return await res.json();
      } catch (e) {}
      return null;
    },

    async getCheers(country = 'india') {
      try {
        const res = await fetch(`${API_BASE}/derby/cheers?country=${encodeURIComponent(country)}`);
        if (res.ok) return await res.json();
      } catch (e) {}
      return [];
    },

    async postCheer(author, dorm, message, country = 'india') {
      try {
        const res = await fetch(`${API_BASE}/derby/cheers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author, dorm, message, country })
        });
        if (res.ok) return await res.json();
      } catch (e) {}
      return null;
    },

    // 3. Cafeteria Food Rescue
    async getMeals(country = 'india') {
      try {
        const res = await fetch(`${API_BASE}/meals/?country=${encodeURIComponent(country)}`);
        if (res.ok) return await res.json();
      } catch (e) {}
      return null;
    },

    async reserveMeal(reservation) {
      try {
        const res = await fetch(`${API_BASE}/meals/reserve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reservation)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
      return null;
    },

    // 4. EcoPatrol Incidents
    async getIncidents(country = 'india') {
      try {
        const res = await fetch(`${API_BASE}/incidents/?country=${encodeURIComponent(country)}`);
        if (res.ok) return await res.json();
      } catch (e) {}
      return null;
    },

    async reportIncident(incident) {
      try {
        const res = await fetch(`${API_BASE}/incidents/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(incident)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
      return null;
    },

    async upvoteIncident(incidentId) {
      try {
        const res = await fetch(`${API_BASE}/incidents/${incidentId}/upvote`, { method: 'POST' });
        if (res.ok) return await res.json();
      } catch (e) {}
      return null;
    },

    // Multimodal Gemini AI Vision Analysis for hazard photos
    async analyzeIncidentImage(file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/incidents/analyze-image`, {
          method: 'POST',
          body: formData
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Gemini vision API error:', e);
      }
      return null;
    },

    // 5. Bounties & Claims
    async claimBounty(bountyId, bountyTitle, points, email = 'aarav.sharma@campus.edu') {
      try {
        const res = await fetch(`${API_BASE}/bounties/claim`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bounty_id: bountyId,
            bounty_title: bountyTitle,
            points: points,
            student_email: email
          })
        });
        if (res.ok) return await res.json();
      } catch (e) {}
      return null;
    },

    // 6. Real-Time Telemetry WebSocket
    ws: null,
    initTelemetryWebSocket() {
      if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
        return;
      }

      try {
        const isHttps = window.location.protocol === 'https:';
        const wsProto = isHttps ? 'wss:' : 'ws:';
        const wsUrl = `${wsProto}//${window.location.host}/ws/telemetry`;
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          this.ws = socket;
          console.log('⚡ EcoCampus WebSocket Telemetry Stream Connected');
          const dispatchBadge = document.getElementById('dispatchBadge');
          if (dispatchBadge) {
            dispatchBadge.innerHTML = '<i data-lucide="zap" class="w-3 h-3 text-emerald-300 animate-pulse"></i> WS LIVE DISPATCH';
            if (window.lucide) window.lucide.createIcons();
          }
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'telemetry_tick') {
              // Dispatch global custom event for any listener
              window.dispatchEvent(new CustomEvent('ecocampus:telemetry', { detail: data }));
              
              // Direct UI updates
              const irradianceEl = document.getElementById('navSolarIrradiance');
              if (irradianceEl) irradianceEl.textContent = `${data.solar_irradiance_wm2} W/m²`;

              const heroPvValue = document.getElementById('heroSolarPeakVal');
              if (heroPvValue) heroPvValue.textContent = `${Math.round(data.solar_pv_kw).toLocaleString()} kW`;
            }
          } catch (err) {}
        };

        socket.onclose = () => {
          this.ws = null;
          // Retry connecting in 5 seconds
          setTimeout(() => this.initTelemetryWebSocket(), 5000);
        };

        socket.onerror = () => {
          this.ws = null;
        };
      } catch (e) {
        console.warn('WebSocket init skipped:', e);
      }
    }
  };

  window.api = api;

  // 7. PWA Installation & Service Worker Setup
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) installBtn.classList.remove('hidden');
  });

  window.triggerPwaInstall = async function() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] Install prompt outcome: ${outcome}`);
      deferredPrompt = null;
      const installBtn = document.getElementById('pwaInstallBtn');
      if (installBtn) installBtn.classList.add('hidden');
    } else {
      if (typeof window.showToast === 'function') {
        window.showToast('To install EcoCampus, tap "Add to Home Screen" or the install icon in your browser address bar.', 'info', 'Install App');
      }
    }
  };

  // Register Service Worker for offline capability
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((reg) => console.log('🌿 EcoCampus PWA Service Worker Registered:', reg.scope))
        .catch((err) => console.log('[PWA] SW Registration skipped:', err));
    });
  }

  // Check backend connectivity & open WebSocket on DOM load
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
      const isUp = await api.checkStatus();
      if (isUp) {
        api.initTelemetryWebSocket();
      }
    }, 150);
  });
})();
