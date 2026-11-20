/**
 * EcoCampus Google Workspace Authentication & Student Identity Engine
 * Enables institutional Google Single Sign-On (SSO), profile synchronization,
 * and persistent student session credentials across the platform.
 */

(function initGoogleAuthModule() {
  const AUTH_STORAGE_KEY = 'ecocampus_google_user';

  // Demo institutional accounts mapped by campus
  const INSTITUTIONAL_GOOGLE_ACCOUNTS = {
    india: {
      name: 'Aarav Sharma',
      firstName: 'Aarav',
      email: 'aarav.sharma@iitd.ac.in',
      campusId: 'india',
      campusName: 'IIT Delhi',
      dorm: 'Ganga Hostel (Rm 214)',
      dormKey: 'ganga',
      rank: 'Rank #1',
      points: 1850,
      idTag: 'Hostel Residence • ID: #STU-IIT-88219',
      tier: 'Tier 4: Net-Zero Urja Ratna',
      avatar: 'AS'
    },
    usa: {
      name: 'Alex Rivers',
      firstName: 'Alex',
      email: 'alex.rivers@berkeley.edu',
      campusId: 'usa',
      campusName: 'UC Berkeley',
      dorm: 'Oak Hall (Rm 312)',
      dormKey: 'oak',
      rank: 'Rank #1',
      points: 1450,
      idTag: 'Residence Hall • ID: #STU-88219',
      tier: 'Tier 3: Microgrid Guardian',
      avatar: 'AR'
    },
    uk: {
      name: 'Oliver Hughes',
      firstName: 'Oliver',
      email: 'oliver.hughes@ox.ac.uk',
      campusId: 'uk',
      campusName: 'Oxford University',
      dorm: 'Newton College (Rm 14)',
      dormKey: 'newton',
      rank: 'Rank #1',
      points: 1620,
      idTag: 'Collegiate Residence • ID: #OX-88219',
      tier: 'Tier 4: Net-Zero Warden',
      avatar: 'OH'
    },
    europe: {
      name: 'Lukas Meyer',
      firstName: 'Lukas',
      email: 'lukas.meyer@tudelft.nl',
      campusId: 'europe',
      campusName: 'TU Delft',
      dorm: 'Van Gogh Pavilion (Rm 102)',
      dormKey: 'vangogh',
      rank: 'Rank #1',
      points: 1580,
      idTag: 'EuroTech Residence • ID: #EU-88219',
      tier: 'Tier 4: Net-Zero Meister',
      avatar: 'LM'
    }
  };

  // Retrieve current authenticated Google user, or fallback to active campus default
  window.getCurrentStudent = function() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored Google user', e);
    }

    // Default to active campus profile
    const activeCampus = (window.getActiveCampusProfile && window.getActiveCampusProfile()) 
      ? window.getActiveCampusProfile().id 
      : 'india';
    return INSTITUTIONAL_GOOGLE_ACCOUNTS[activeCampus] || INSTITUTIONAL_GOOGLE_ACCOUNTS.india;
  };

  // Log in with a specific Google student object
  window.loginWithGoogle = function(userData, notify = true) {
    if (!userData || !userData.name) return;

    // Calculate initials if missing
    if (!userData.avatar && userData.name) {
      userData.avatar = userData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
    if (!userData.firstName && userData.name) {
      userData.firstName = userData.name.split(' ')[0];
    }

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    } catch (e) {
      console.warn('Error persisting Google user session', e);
    }

    // If campus doesn't match active campus, switch campus
    if (userData.campusId && window.switchCampus && typeof window.switchCampus === 'function') {
      const currentProfile = window.getActiveCampusProfile ? window.getActiveCampusProfile() : null;
      if (!currentProfile || currentProfile.id !== userData.campusId) {
        window.switchCampus(userData.campusId);
      }
    }

    syncStudentUI(userData);

    if (notify) {
      if (window.sound && typeof window.sound.claim === 'function') {
        window.sound.claim();
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`Google Workspace Authenticated: ${userData.email}`, 'success', 'Google SSO Connected');
      }
    }

    // Close Google Auth Modal if open
    if (typeof window.closeModal === 'function') {
      window.closeModal('googleAuthModal');
    }
  };

  // Quick 1-click login using a preset institutional account
  window.quickGoogleLogin = function(campusKey, notify = true) {
    const account = INSTITUTIONAL_GOOGLE_ACCOUNTS[campusKey];
    if (account) {
      window.loginWithGoogle({ ...account }, notify);
    }
  };

  // Sign out of Google Account and reset to default
  window.logoutGoogle = function() {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Error removing Google user session', e);
    }

    const activeCampus = (window.getActiveCampusProfile && window.getActiveCampusProfile()) 
      ? window.getActiveCampusProfile().id 
      : 'india';
    const fallbackUser = INSTITUTIONAL_GOOGLE_ACCOUNTS[activeCampus] || INSTITUTIONAL_GOOGLE_ACCOUNTS.india;

    syncStudentUI(fallbackUser);

    if (window.sound && typeof window.sound.click === 'function') {
      window.sound.click();
    }
    if (typeof window.showToast === 'function') {
      window.showToast('Signed out of Google Workspace account.', 'info', 'Google SSO Disconnected');
    }

    if (typeof window.closeModal === 'function') {
      window.closeModal('googleAuthModal');
    }
  };

  // Submit custom Google credentials from modal form
  window.submitCustomGoogleLogin = function() {
    const nameInput = document.getElementById('googleCustomName');
    const emailInput = document.getElementById('googleCustomEmail');
    const dormSelect = document.getElementById('googleCustomDorm');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const dorm = dormSelect ? dormSelect.value : 'Main Quad';

    if (!name) {
      if (typeof window.showToast === 'function') window.showToast('Please enter your full name.', 'warning', 'Input Required');
      if (nameInput) nameInput.focus();
      return;
    }

    if (!email || !email.includes('@')) {
      if (typeof window.showToast === 'function') window.showToast('Please enter a valid Google email address.', 'warning', 'Invalid Email');
      if (emailInput) emailInput.focus();
      return;
    }

    const activeCampus = (window.getActiveCampusProfile && window.getActiveCampusProfile()) 
      ? window.getActiveCampusProfile().id 
      : 'india';

    const customUser = {
      name: name,
      firstName: name.split(' ')[0],
      email: email,
      campusId: activeCampus,
      dorm: dorm,
      dormKey: dorm.toLowerCase().replace(/[^a-z0-9]/g, ''),
      rank: 'Rank #1',
      points: 1500,
      idTag: `Google Workspace • ${email}`,
      tier: 'Tier 3: Microgrid Guardian',
      avatar: name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    };

    window.loginWithGoogle(customUser, true);
  };

  // Synchronize all student name, avatar, email, and dorm nodes across the entire page
  window.syncStudentUI = function(user) {
    if (!user) user = window.getCurrentStudent();
    if (!user) return;

    const firstName = user.firstName || user.name.split(' ')[0];
    const initials = user.avatar || user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    // 1. Hero Command Bar Banner
    const heroStudentName = document.getElementById('heroStudentName');
    const heroStudentDorm = document.getElementById('heroStudentDorm');
    if (heroStudentName) heroStudentName.textContent = firstName;
    if (heroStudentDorm) heroStudentDorm.textContent = user.dorm;

    // 2. Sidebar Mini Profile
    const sidebarStudentName = document.getElementById('sidebarStudentName');
    const sidebarStudentDorm = document.getElementById('sidebarStudentDorm');
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    const sidebarEcoPoints = document.getElementById('sidebarEcoPoints');
    const sidebarGoogleEmail = document.getElementById('sidebarGoogleEmail');

    if (sidebarStudentName) sidebarStudentName.textContent = user.name;
    if (sidebarStudentDorm) sidebarStudentDorm.textContent = user.dorm;
    if (sidebarAvatar) sidebarAvatar.textContent = initials;
    if (sidebarEcoPoints && user.points) sidebarEcoPoints.textContent = user.points.toLocaleString();
    if (sidebarGoogleEmail && user.email) sidebarGoogleEmail.textContent = user.email;

    // 3. Topbar Header Profile Pill
    const headerStudentName = document.getElementById('headerStudentName');
    const headerAvatar = document.getElementById('headerAvatar');
    const userEcoPoints = document.getElementById('userEcoPoints');

    if (headerStudentName) headerStudentName.textContent = user.name;
    if (headerAvatar) headerAvatar.textContent = initials;
    if (userEcoPoints && user.points) userEcoPoints.textContent = user.points.toLocaleString();

    // 4. Official Eco-Passport Modal
    const passportStudentName = document.getElementById('passportStudentName');
    const passportStudentDorm = document.getElementById('passportStudentDorm');
    const passportAvatar = document.getElementById('passportAvatar');
    const passportTierBadge = document.getElementById('passportTierBadge');
    const passportGoogleEmail = document.getElementById('passportGoogleEmail');

    if (passportStudentName) passportStudentName.textContent = user.name;
    if (passportStudentDorm) passportStudentDorm.textContent = user.idTag || user.dorm;
    if (passportAvatar) passportAvatar.textContent = initials;
    if (passportTierBadge && user.tier) passportTierBadge.textContent = user.tier;
    if (passportGoogleEmail) passportGoogleEmail.textContent = user.email;

    // 5. EcoPatrol scout list (You)
    const patrolStudentName = document.getElementById('patrolStudentName');
    if (patrolStudentName) patrolStudentName.textContent = `${user.name} (You)`;

    // 6. Derby dorm label
    const derbyStudentDorm = document.getElementById('derbyStudentDorm');
    const derbyBoostDormBtn = document.getElementById('derbyBoostDormBtn');
    const derbyYourDormName = document.getElementById('derbyYourDormName');
    const derbyBoostBtn = document.getElementById('derbyBoostBtn');
    const dormShortName = user.dorm ? user.dorm.split('(')[0].split('•')[0].trim() : 'Ganga Hostel';
    if (derbyStudentDorm) derbyStudentDorm.textContent = dormShortName;
    if (derbyBoostDormBtn) derbyBoostDormBtn.textContent = `Boost ${dormShortName} +30`;
    if (derbyYourDormName) derbyYourDormName.textContent = `${dormShortName} (You are contributing +14 pts today!)`;
    if (derbyBoostBtn) derbyBoostBtn.textContent = `Boost ${dormShortName} +30`;

    // 7. Update Google Auth Modal Active Session status
    updateAuthModalState(user);

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };

  // Update dynamic content inside Google Auth Modal
  function updateAuthModalState(user) {
    const activeUserName = document.getElementById('activeGoogleUserName');
    const activeUserEmail = document.getElementById('activeGoogleUserEmail');
    const activeUserAvatar = document.getElementById('activeGoogleUserAvatar');
    const activeUserDorm = document.getElementById('activeGoogleUserDorm');
    const heroGoogleBtnLabel = document.getElementById('heroGoogleBtnLabel');

    if (activeUserName) activeUserName.textContent = user.name;
    if (activeUserEmail) activeUserEmail.textContent = user.email;
    if (activeUserAvatar) activeUserAvatar.textContent = user.avatar || user.name.slice(0, 2).toUpperCase();
    if (activeUserDorm) activeUserDorm.textContent = user.dorm;
    if (heroGoogleBtnLabel) heroGoogleBtnLabel.textContent = user.firstName ? `Hi, ${user.firstName}` : 'Google Connected';

    // Populate dorm options in custom dorm dropdown
    const customDormSelect = document.getElementById('googleCustomDorm');
    if (customDormSelect && window.CAMPUS_PROFILES) {
      const activeCampus = (window.getActiveCampusProfile && window.getActiveCampusProfile()) 
        ? window.getActiveCampusProfile() 
        : window.CAMPUS_PROFILES.india;
      if (activeCampus && activeCampus.dorms) {
        customDormSelect.innerHTML = activeCampus.dorms.map(d => 
          `<option value="${d.name}">${d.name}</option>`
        ).join('');
      }
    }
  }

  // Auto-initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const student = window.getCurrentStudent();
    window.syncStudentUI(student);
  });

  // Expose global hook
  window.INSTITUTIONAL_GOOGLE_ACCOUNTS = INSTITUTIONAL_GOOGLE_ACCOUNTS;
})();
