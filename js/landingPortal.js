/**
 * EcoCampus Front Landing Gateway & Sample Login Controller
 * Provides a stunning public entrance portal where anyone can explore the platform
 * using 1-click sample Google accounts, custom student credentials, or direct guest access.
 */

(function initLandingPortal() {
  const PORTAL_SESSION_KEY = 'ecocampus_portal_dismissed';

  // Open the Front Landing Portal
  window.openLandingPortal = function() {
    const portal = document.getElementById('frontLandingPage');
    if (portal) {
      portal.classList.remove('hidden');
      requestAnimationFrame(() => {
        portal.classList.remove('opacity-0', 'pointer-events-none');
        portal.classList.add('opacity-100');
      });
    }
    if (window.sound && typeof window.sound.click === 'function') {
      window.sound.click();
    }
  };

  // Close the Front Landing Portal and enter the Main Operating System
  window.closeLandingPortal = function() {
    const portal = document.getElementById('frontLandingPage');
    if (portal) {
      portal.classList.remove('opacity-100');
      portal.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        portal.classList.add('hidden');
      }, 350);
    }
    try {
      sessionStorage.setItem(PORTAL_SESSION_KEY, 'true');
    } catch (e) {
      console.warn('SessionStorage unavailable', e);
    }
  };

  // Enter the Campus OS with a specific institutional profile (e.g., 'india', 'usa', 'uk', 'europe')
  window.enterCampusOS = function(campusKey) {
    if (window.quickGoogleLogin && typeof window.quickGoogleLogin === 'function') {
      window.quickGoogleLogin(campusKey);
    } else if (window.switchCampus && typeof window.switchCampus === 'function') {
      window.switchCampus(campusKey);
    }

    triggerCelebratoryEntry();
    window.closeLandingPortal();
  };

  // Enter as a guest visitor without needing any account
  window.enterAsGuest = function() {
    const activeCampus = (window.getActiveCampusProfile && window.getActiveCampusProfile()) 
      ? window.getActiveCampusProfile().id 
      : 'india';

    if (window.quickGoogleLogin && typeof window.quickGoogleLogin === 'function') {
      window.quickGoogleLogin(activeCampus, false);
    }

    if (typeof window.showToast === 'function') {
      window.showToast('Welcome to EcoCampus OS! Exploring in Public Demonstration Mode.', 'info', 'Guest Session Started');
    }

    triggerCelebratoryEntry();
    window.closeLandingPortal();
  };

  // Submit custom student sample sign-in from the landing portal form
  window.submitLandingCustomLogin = function() {
    const nameInput = document.getElementById('portalCustomName');
    const emailInput = document.getElementById('portalCustomEmail');
    const campusSelect = document.getElementById('portalCustomCampus');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const campus = campusSelect ? campusSelect.value : 'india';

    if (!name) {
      if (typeof window.showToast === 'function') window.showToast('Please enter a student name for your sample login.', 'warning', 'Name Required');
      if (nameInput) nameInput.focus();
      return;
    }

    const customUser = {
      name: name,
      firstName: name.split(' ')[0],
      email: email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@campus.edu`,
      campusId: campus,
      dorm: campus === 'india' ? 'Ganga Hostel (Rm 214)' : (campus === 'usa' ? 'Oak Hall (Rm 312)' : 'Student Residence'),
      dormKey: 'main',
      rank: 'Rank #1',
      points: 1750,
      idTag: `Student Verified • ID: #${Math.floor(10000 + Math.random() * 90000)}`,
      tier: 'Tier 4: Net-Zero Champion',
      avatar: name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    };

    if (window.loginWithGoogle && typeof window.loginWithGoogle === 'function') {
      window.loginWithGoogle(customUser, true);
    }

    triggerCelebratoryEntry();
    window.closeLandingPortal();
  };

  // Celebratory UI Sound & Confetti trigger upon entering
  function triggerCelebratoryEntry() {
    if (window.sound && typeof window.sound.claim === 'function') {
      window.sound.claim();
    }

    // Trigger celebratory confetti effect if canvas exists
    if (typeof window.triggerConfettiBurst === 'function') {
      window.triggerConfettiBurst();
    } else {
      const confettiCanvas = document.getElementById('confettiCanvas');
      if (confettiCanvas) {
        confettiCanvas.style.display = 'block';
        setTimeout(() => { confettiCanvas.style.display = 'none'; }, 2500);
      }
    }
  }

  // Handle Initial State on Page Load:
  // Show the landing portal by default so new visitors can explore the sample sign-in
  document.addEventListener('DOMContentLoaded', () => {
    const portal = document.getElementById('frontLandingPage');
    if (!portal) return;

    let isDismissed = false;
    try {
      isDismissed = sessionStorage.getItem(PORTAL_SESSION_KEY) === 'true';
    } catch (e) {
      console.warn('SessionStorage check error', e);
    }

    // If not previously entered in this tab, show front landing page
    if (!isDismissed) {
      portal.classList.remove('hidden');
      requestAnimationFrame(() => {
        portal.classList.remove('opacity-0', 'pointer-events-none');
        portal.classList.add('opacity-100');
      });
    } else {
      portal.classList.add('hidden', 'opacity-0', 'pointer-events-none');
    }
  });
})();
