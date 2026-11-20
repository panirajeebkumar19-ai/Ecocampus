/**
 * EcoCampus Multi-Country Controller Engine
 * Dynamically switches campus profiles, currencies, units, and campus datasets
 * without modifying or breaking existing core canvas or audio engines.
 */

(function initCampusEngine() {
  const PROFILE_STORAGE_KEY = 'ecocampus_current_country';

  // Get active country profile id (default to 'india')
  function getActiveCountryId() {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored && window.CAMPUS_PROFILES && window.CAMPUS_PROFILES[stored]) {
        return stored;
      }
    } catch (e) {
      console.warn('Error reading active campus profile', e);
    }
    return 'india';
  }

  // Retrieve current active profile object
  window.getActiveCampusProfile = function() {
    const id = getActiveCountryId();
    return (window.CAMPUS_PROFILES && window.CAMPUS_PROFILES[id]) ? window.CAMPUS_PROFILES[id] : window.CAMPUS_PROFILES['india'];
  };

  // Switch campus profile and re-render localized UI
  window.switchCampus = function(countryId) {
    if (!window.CAMPUS_PROFILES || !window.CAMPUS_PROFILES[countryId]) return;

    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, countryId);
    } catch (e) {
      console.warn('Error saving campus profile', e);
    }

    if (window.sound && typeof window.sound.click === 'function') {
      window.sound.click();
    }

    // Automatically switch student institutional Google account to this campus
    if (window.INSTITUTIONAL_GOOGLE_ACCOUNTS && window.INSTITUTIONAL_GOOGLE_ACCOUNTS[countryId] && typeof window.loginWithGoogle === 'function') {
      window.loginWithGoogle(window.INSTITUTIONAL_GOOGLE_ACCOUNTS[countryId], false);
    }

    applyCampusProfile(countryId, true);
  };

  // Apply campus profile across all UI views
  function applyCampusProfile(countryId, showNotification = false) {
    const profile = window.CAMPUS_PROFILES[countryId] || window.CAMPUS_PROFILES['india'];
    if (!profile) return;

    // 1. Update Country Switcher Dropdown in Topbar
    const countrySelector = document.getElementById('headerCountrySelector');
    if (countrySelector && countrySelector.value !== countryId) {
      countrySelector.value = countryId;
    }

    // 2. Update Dorm / Hostel Selector Dropdown
    const dormSelector = document.getElementById('headerDormSelector');
    if (dormSelector && profile.dorms) {
      dormSelector.innerHTML = profile.dorms.map(d => 
        `<option value="${d.id}" class="bg-slate-900 text-white">${d.name}</option>`
      ).join('');
    }

    // 3. Update Dorm / Hostel Label in Header
    const dormLabel = document.getElementById('headerDormLabel');
    if (dormLabel) {
      dormLabel.textContent = profile.student.dormLabel || 'Dorm:';
    }

    // 4. Update Header Live Telemetry Pill
    const navSolarIrradiance = document.getElementById('navSolarIrradiance');
    if (navSolarIrradiance && profile.units) {
      navSolarIrradiance.textContent = profile.units.solarIrradiance;
    }

    const navWeatherSummary = document.getElementById('navWeatherSummary');
    if (navWeatherSummary && profile.units) {
      navWeatherSummary.textContent = `• ${profile.units.weatherSummary}`;
    }

    // 5. Update Student Mini Profile across Hero, Sidebar, and Topbar
    const heroStudentName = document.getElementById('heroStudentName');
    const heroStudentDorm = document.getElementById('heroStudentDorm');
    const heroWaterUnit = document.getElementById('heroWaterUnit');
    const sidebarStudentName = document.getElementById('sidebarStudentName');
    const sidebarStudentDorm = document.getElementById('sidebarStudentDorm');
    const passportStudentName = document.getElementById('passportStudentName');
    const passportStudentDorm = document.getElementById('passportStudentDorm');
    const passportTierBadge = document.getElementById('passportTierBadge');
    const passportAvatar = document.getElementById('passportAvatar');
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    const headerStudentName = document.getElementById('headerStudentName');
    const headerAvatar = document.getElementById('headerAvatar');

    const firstName = profile.student.name.split(' ')[0];
    if (heroStudentName) heroStudentName.textContent = firstName;
    if (heroStudentDorm) heroStudentDorm.textContent = profile.student.dormSub;
    if (heroWaterUnit && profile.units) heroWaterUnit.textContent = `${profile.units.waterShort} Saved Today`;

    if (sidebarStudentName) sidebarStudentName.textContent = profile.student.name;
    if (sidebarStudentDorm) sidebarStudentDorm.textContent = profile.student.dormSub;
    if (passportStudentName) passportStudentName.textContent = profile.student.name;
    if (passportStudentDorm) passportStudentDorm.textContent = profile.student.idTag;
    if (passportTierBadge) passportTierBadge.textContent = profile.student.tier;
    if (headerStudentName) headerStudentName.textContent = profile.student.name;

    // Avatar initials
    const initials = profile.student.name.split(' ').map(n => n[0]).join('').slice(0, 2);
    if (passportAvatar) passportAvatar.textContent = initials;
    if (sidebarAvatar) sidebarAvatar.textContent = initials;
    if (headerAvatar) headerAvatar.textContent = initials;

    // Call Google Auth sync if active with this campus's profile
    if (typeof window.syncStudentUI === 'function') {
      const studentAcc = (window.INSTITUTIONAL_GOOGLE_ACCOUNTS && window.INSTITUTIONAL_GOOGLE_ACCOUNTS[countryId]) 
        ? window.INSTITUTIONAL_GOOGLE_ACCOUNTS[countryId] 
        : {
            name: profile.student.name,
            firstName: profile.student.name.split(' ')[0],
            dorm: profile.student.dormSub,
            avatar: profile.student.name.split(' ').map(n => n[0]).join('').slice(0, 2),
            points: profile.student.points,
            email: `${profile.student.name.toLowerCase().replace(/\s+/g, '.')}@campus.edu`
          };
      window.syncStudentUI(studentAcc);
    }

    // 6. Synchronize Global Datasets in app.js
    if (Array.isArray(window.dormDerbyData) && profile.derbyStandings) {
      window.dormDerbyData.length = 0;
      profile.derbyStandings.forEach((d, idx) => {
        window.dormDerbyData.push({
          ...d,
          rank: d.rank || (idx + 1),
          delta: d.delta || d.trend || '+0.0%'
        });
      });
      if (typeof window.renderDerbyStandings === 'function') window.renderDerbyStandings();
      if (typeof window.updateDerbyChartData === 'function') window.updateDerbyChartData();
    }

    const derbyWaterFilterUnit = document.getElementById('derbyWaterFilterUnit');
    if (derbyWaterFilterUnit && profile.units) {
      derbyWaterFilterUnit.textContent = profile.units.waterShort || 'L';
    }

    // Update Your Residence Hall Highlight Banner in Eco-Derby
    const activeDormName = (profile.student && profile.student.dorm) 
      ? profile.student.dorm 
      : (profile.dorms && profile.dorms[0] ? profile.dorms[0].name.split(' (')[0] : 'Ganga Hostel');
    const derbyYourDormName = document.getElementById('derbyYourDormName');
    const derbyBoostBtn = document.getElementById('derbyBoostBtn');
    if (derbyYourDormName) {
      derbyYourDormName.textContent = `${activeDormName} (You are contributing +14 pts today!)`;
    }
    if (derbyBoostBtn) {
      derbyBoostBtn.textContent = `Boost ${activeDormName} +30`;
    }

    if (Array.isArray(window.diningMealsData) && profile.meals) {
      window.diningMealsData.length = 0;
      profile.meals.forEach(m => window.diningMealsData.push({ ...m }));
      if (typeof window.renderDiningMeals === 'function') window.renderDiningMeals();
    }

    if (Array.isArray(window.rewardsStoreData) && profile.rewards) {
      window.rewardsStoreData.length = 0;
      profile.rewards.forEach(r => window.rewardsStoreData.push(r));
      if (typeof window.renderRewardsStore === 'function') window.renderRewardsStore();
    }

    if (Array.isArray(window.bountiesData) && profile.bounties) {
      window.bountiesData.length = 0;
      profile.bounties.forEach(b => {
        const impactVal = b.impact || b.co2Saved || b.co2 || '0.5 kg CO₂e';
        window.bountiesData.push({
          ...b,
          impact: impactVal,
          co2Saved: impactVal,
          co2: impactVal
        });
      });
      if (typeof window.renderBounties === 'function') window.renderBounties();
    }

    if (Array.isArray(window.campusFacilityData) && profile.facilities) {
      window.campusFacilityData.length = 0;
      profile.facilities.forEach(f => window.campusFacilityData.push(f));
      if (typeof window.selectMapBuilding === 'function') window.selectMapBuilding(0);
    }

    // 7. Update Gemini AI System Prompt
    if (window.GEMINI_LOCALIZED_PROMPT !== undefined) {
      window.GEMINI_LOCALIZED_PROMPT = profile.systemPrompt;
    }

    // Refresh icons
    if (typeof window.refreshIcons === 'function') {
      window.refreshIcons();
    }

    if (showNotification && typeof window.showToast === 'function') {
      window.showToast(
        `Switched to ${profile.flag} ${profile.name} (${profile.currencySymbol} ${profile.currencyCode}, ${profile.units.tempUnit}, ${profile.units.waterUnit})`,
        'success',
        'Campus Region Switched'
      );
    }
  }

  // Hook into DOM ready to initialize active profile
  window.addEventListener('DOMContentLoaded', () => {
    const activeCountry = getActiveCountryId();
    // Delay slightly so app.js finishes its synchronous array declarations
    setTimeout(() => {
      applyCampusProfile(activeCountry, false);
    }, 50);
  });

})();
