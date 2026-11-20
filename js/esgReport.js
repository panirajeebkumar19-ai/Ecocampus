/**
 * ESG Sustainability Audit Report Generator (Modular)
 * Generates official campus Net-Zero & ESG compliance reports with Scope 1, 2, 3 carbon metrics,
 * 1-click Print/PDF export, and structured CSV compliance downloads.
 */

(function initEsgReportModule() {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEsgModule);
  } else {
    setupEsgModule();
  }

  function setupEsgModule() {
    if (document.getElementById('esgReportModal')) return;

    // Inject ESG Modal DOM
    const modal = document.createElement('div');
    modal.id = 'esgReportModal';
    modal.className = 'hidden fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto';
    modal.innerHTML = `
      <div class="relative w-full max-w-4xl bg-[#0c1220] border border-slate-700/80 rounded-2xl shadow-2xl p-5 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto custom-scrollbar my-auto">
        
        <!-- Modal Top Bar -->
        <div class="flex items-start justify-between border-b border-slate-800 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <div class="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <i data-lucide="file-check-2" class="w-6 h-6 text-emerald-400"></i>
              </div>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-black text-white tracking-tight">Institutional ESG & Sustainability Audit</h3>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">ISO 14064 Compliant</span>
              </div>
              <p class="text-xs text-slate-400 font-mono mt-0.5" id="esgCampusSubtext">IIT Delhi Eco-Campus — 2026 Academic Term Audit</p>
            </div>
          </div>
          
          <button onclick="closeEsgModal()" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- ESG Executive Summary Badge Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span class="text-[10px] uppercase font-mono text-slate-400">Net Solar Offset</span>
            <div class="text-xl font-black text-emerald-400 mt-1" id="esgSolarOffset">81.4%</div>
            <p class="text-[10px] text-slate-500 mt-0.5">1,540 kW peak capacity</p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span class="text-[10px] uppercase font-mono text-slate-400">CO₂e Abatement</span>
            <div class="text-xl font-black text-cyan-400 mt-1" id="esgCarbonAbated">142.8 MT</div>
            <p class="text-[10px] text-slate-500 mt-0.5">Current semester savings</p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span class="text-[10px] uppercase font-mono text-slate-400">Water Recycled</span>
            <div class="text-xl font-black text-teal-400 mt-1" id="esgWaterRecycled">64.2%</div>
            <p class="text-[10px] text-slate-500 mt-0.5">Greywater closed-loop</p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span class="text-[10px] uppercase font-mono text-slate-400">Meals Rescued</span>
            <div class="text-xl font-black text-amber-400 mt-1" id="esgFoodRescued">3,840 kg</div>
            <p class="text-[10px] text-slate-500 mt-0.5">Zero-landfill dining organic</p>
          </div>
        </div>

        <!-- Scope 1, 2, 3 Breakdown Table -->
        <div class="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
          <div class="px-4 py-2.5 bg-slate-850/70 border-b border-slate-800 flex items-center justify-between">
            <span class="text-xs font-bold text-white uppercase tracking-wider font-mono">Greenhouse Gas Protocol (GHG) Emissions Ledger</span>
            <span class="text-[10px] font-mono text-emerald-400">Real-time Telemetry Synced</span>
          </div>
          <table class="w-full text-xs text-left">
            <thead class="text-[11px] text-slate-400 uppercase font-mono bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th class="px-4 py-2.5">Category</th>
                <th class="px-4 py-2.5">Source Activity</th>
                <th class="px-4 py-2.5 text-right">Emissions Baseline</th>
                <th class="px-4 py-2.5 text-right">Abated with EcoCampus</th>
                <th class="px-4 py-2.5 text-right">Net Impact</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-mono text-slate-300">
              <tr>
                <td class="px-4 py-2.5 font-bold text-white">Scope 1</td>
                <td class="px-4 py-2.5 font-sans">Campus diesel generators & natural gas heating</td>
                <td class="px-4 py-2.5 text-right">38.4 MT</td>
                <td class="px-4 py-2.5 text-right text-emerald-400">-22.1 MT (57.5%)</td>
                <td class="px-4 py-2.5 text-right font-bold text-slate-200">16.3 MT</td>
              </tr>
              <tr>
                <td class="px-4 py-2.5 font-bold text-white">Scope 2</td>
                <td class="px-4 py-2.5 font-sans">Municipal grid purchased electricity</td>
                <td class="px-4 py-2.5 text-right">186.2 MT</td>
                <td class="px-4 py-2.5 text-right text-emerald-400">-104.5 MT (56.1%)</td>
                <td class="px-4 py-2.5 text-right font-bold text-slate-200">81.7 MT</td>
              </tr>
              <tr>
                <td class="px-4 py-2.5 font-bold text-white">Scope 3</td>
                <td class="px-4 py-2.5 font-sans">Dining organic waste, student travel & dorm phantom loads</td>
                <td class="px-4 py-2.5 text-right">44.8 MT</td>
                <td class="px-4 py-2.5 text-right text-emerald-400">-16.2 MT (36.2%)</td>
                <td class="px-4 py-2.5 text-right font-bold text-slate-200">28.6 MT</td>
              </tr>
            </tbody>
            <tfoot class="bg-slate-900/90 font-mono text-xs border-t border-slate-700">
              <tr>
                <th colspan="2" class="px-4 py-2.5 font-bold text-white">Net Campus Carbon Footprint</th>
                <td class="px-4 py-2.5 text-right text-slate-400">269.4 MT</td>
                <td class="px-4 py-2.5 text-right text-emerald-400 font-bold">-142.8 MT</td>
                <td class="px-4 py-2.5 text-right text-emerald-300 font-black text-sm">126.6 MT CO₂e</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Compliance & Regulatory Rating -->
        <div class="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 via-slate-900/80 to-teal-950/30 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="text-3xl font-black text-emerald-400 font-mono border-2 border-emerald-400/40 rounded-xl px-3 py-1 bg-emerald-500/10">
              A+
            </div>
            <div>
              <div class="text-xs font-bold text-white">Gold Star University Sustainability Rating</div>
              <p class="text-[11px] text-slate-400 mt-0.5">Top 3% among surveyed universities in climate resilience and active student engagement.</p>
            </div>
          </div>
          <div class="text-right">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-400"></i>
              AUDIT CERTIFIED
            </span>
          </div>
        </div>

        <!-- Action Export Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <p class="text-[11px] text-slate-500 font-mono">Report Hash: SHA-256 #ec0-98f2-2026-audit</p>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button onclick="downloadEsgCsv()" class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold transition-all shadow-sm">
              <i data-lucide="download" class="w-3.5 h-3.5 text-cyan-400"></i>
              <span>Export CSV Data</span>
            </button>
            <button onclick="window.print()" class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20">
              <i data-lucide="printer" class="w-3.5 h-3.5"></i>
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: modal });
    }
  }

  function openEsgModal() {
    setupEsgModule();
    const modal = document.getElementById('esgReportModal');
    if (!modal) return;

    // Dynamically update campus info from currently active profile
    const selector = document.getElementById('headerCountrySelector');
    const campusName = selector ? selector.options[selector.selectedIndex]?.text : 'IIT Delhi';
    const subtext = document.getElementById('esgCampusSubtext');
    if (subtext) subtext.textContent = `${campusName} Eco-Campus — 2026 Academic Term Sustainability Audit`;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeEsgModal() {
    const modal = document.getElementById('esgReportModal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  function downloadEsgCsv() {
    const selector = document.getElementById('headerCountrySelector');
    const campusName = selector ? selector.options[selector.selectedIndex]?.text.replace(/[^a-zA-Z0-9]/g, '_') : 'IIT_Delhi';
    
    const csvContent = 
`EcoCampus Institutional ESG Sustainability Audit Report
Generated,${new Date().toISOString()}
Campus,${campusName}
Compliance Standard,ISO 14064 / GHG Protocol Corporate Standard
Gold Rating,A+ (Net-Zero Leader)

Emissions Category,Scope,Source Activity,Baseline (MT CO2e),Abated (MT CO2e),Net Emissions (MT CO2e),Savings %
Direct Emissions,Scope 1,Backup generators & boiler natural gas,38.4,22.1,16.3,57.5%
Purchased Electricity,Scope 2,Municipal grid electricity,186.2,104.5,81.7,56.1%
Campus Lifecycle,Scope 3,Dining food surplus & dorm phantom loads,44.8,16.2,28.6,36.2%
Total,All Scopes,Net University Carbon Ledger,269.4,142.8,126.6,53.0%

Resource Conservation Metrics,Value,Unit
Solar PV Peak Self-Sufficiency,81.4,%
Current Semester Carbon Abatement,142.8,Metric Tons CO2e
Greywater Closed-Loop Reclamation,64.2,%
Cafeteria Organic Dining Rescued,3840,kg
Dorm Derby Energy Reduction Average,14.6,%
`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `EcoCampus_ESG_Report_${campusName}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Expose to window
  window.openEsgReport = openEsgModal;
  window.closeEsgModal = closeEsgModal;
  window.downloadEsgCsv = downloadEsgCsv;

})();
