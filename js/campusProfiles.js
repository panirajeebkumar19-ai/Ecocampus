/**
 * EcoCampus Global Profiles & Regional Configuration Engine
 * Modular data store containing localized university configurations for:
 * - 🇮🇳 India (IIT / NIT / BITS / Central University Net-Zero Hub)
 * - 🇺🇸 United States (North American University Microgrid)
 * - 🇬🇧 United Kingdom (Collegiate Oxford / Cambridge Model)
 * - 🇪🇺 European Union (TU Delft / ETH Sustainable Campus)
 */

window.CAMPUS_PROFILES = {
  india: {
    id: 'india',
    name: 'IIT Delhi / Indian Institute of Technology',
    shortName: 'IIT Campus',
    country: 'India',
    flag: '🇮🇳',
    currencySymbol: '₹',
    currencyCode: 'INR',
    units: {
      temperature: '34°C',
      tempUnit: '°C',
      weatherSummary: '34°C • Sunny',
      solarIrradiance: '920 W/m²',
      waterUnit: 'Liters',
      waterShort: 'L',
      waterPerCapita: 'L/capita',
      distanceUnit: 'km',
      generatorStatus: '0 DG Gensets Active • 420 L Diesel Saved'
    },
    student: {
      name: 'Aarav Sharma',
      dormLabel: 'Hostel:',
      defaultDormName: 'Ganga Hostel (Rm 214)',
      dormSub: 'Ganga Hostel • Rm 214',
      rank: 'Rank #1',
      points: 1850,
      idTag: 'Hostel Residence • ID: #STU-IIT-88219',
      tier: 'Tier 4: Net-Zero Urja Ratna'
    },
    dorms: [
      { id: 'ganga', name: 'Ganga Hostel (Rm 214)' },
      { id: 'nilgiri', name: 'Nilgiri Bhavan' },
      { id: 'brahmaputra', name: 'Brahmaputra Quads' },
      { id: 'sarojini', name: 'Sarojini Naidu Hall' },
      { id: 'ramanujan', name: 'Ramanujan Tech Complex' }
    ],
    derbyStandings: [
      { rank: 1, name: 'Ganga Hostel', score: 94.8, energy: '2.8', water: '78', waste: 94, trend: '+4.2%', delta: '+4.2%' },
      { rank: 2, name: 'Nilgiri Bhavan', score: 91.2, energy: '3.1', water: '84', waste: 89, trend: '+2.8%', delta: '+2.8%' },
      { rank: 3, name: 'Brahmaputra Quads', score: 87.5, energy: '3.5', water: '92', waste: 85, trend: '+1.5%', delta: '+1.5%' },
      { rank: 4, name: 'Sarojini Naidu Hall', score: 84.1, energy: '3.8', water: '98', waste: 82, trend: '-0.8%', delta: '-0.8%' },
      { rank: 5, name: 'Tagore Central Hall', score: 79.4, energy: '4.2', water: '110', waste: 76, trend: '-1.4%', delta: '-1.4%' }
    ],
    facilities: [
      {
        name: 'Aryabhatta Tech & Research Complex',
        zone: 'Rooftop Solar & Labs • Zone 01',
        power: '520 kW Real-time',
        solar: '100% Solar Self-Sufficiency',
        temp: '24.2°C Clean Air HVAC',
        occupancy: '980 Researchers',
        grade: 'Grade A+ (BEE 5-Star)'
      },
      {
        name: 'Ganga Residence Hostel',
        zone: 'Student Quads • Zone 02',
        power: '124 kW Real-time',
        solar: '86% Solar / BESS Supply',
        temp: '26.8°C Ceiling Micro-Loops',
        occupancy: '480 Residents',
        grade: 'Grade A+ (Leader)'
      },
      {
        name: 'Ramanujan Central Digital Library',
        zone: 'Academic Atrium • Zone 03',
        power: '210 kW Real-time',
        solar: '94% Net Solar Day Offset',
        temp: '23.5°C Chilled Water AC',
        occupancy: '1,240 Studiers',
        grade: 'Grade A'
      },
      {
        name: 'Annapurna Student Mess & Canteen',
        zone: 'Dining & Kitchen • Zone 04',
        power: '175 kW Real-time',
        solar: 'Biogas + Solar Induction',
        temp: '25.0°C Heat Recovery',
        occupancy: '620 Diners',
        grade: 'Grade A (Zero Food Waste)'
      },
      {
        name: 'North Canal Rooftop Solar Array',
        zone: 'Photovoltaic Farm • Zone 05',
        power: '1,540 kW Peak Generation',
        solar: '89.4% Grid Export Mode',
        temp: '44.8°C Panel Temp',
        occupancy: 'Automatic Robot Wash',
        grade: 'Grade A+'
      },
      {
        name: 'Rainwater Baori & RO Reject Cistern',
        zone: 'Hydro Loop • Zone 06',
        power: '18.4 gpm Flow Circulation',
        solar: 'RO Wastewater Recycled',
        temp: '28.2 PSI Clean Pressure',
        occupancy: '145,000 Liters (96%)',
        grade: 'Grade A+'
      }
    ],
    meals: [
      {
        id: 'in-meal-01',
        title: 'Deluxe North/South Mess Lunch Thali',
        cafeteria: 'Annapurna Central Dining Mess',
        cutoffTime: '14:45 PM (Post-Lunch)',
        remaining: 18,
        dietary: 'Pure Veg / Jain Available',
        originalPrice: '₹80',
        rescuePrice: '₹20',
        ecoPointsCost: 35
      },
      {
        id: 'in-meal-02',
        title: 'Canteen Afternoon Samosas & Poha Tray',
        cafeteria: 'Student Activity Center (SAC) Canteen',
        cutoffTime: '17:30 PM (Evening Tea)',
        remaining: 14,
        dietary: 'Fresh Hot Canteen Snacks',
        originalPrice: '₹50',
        rescuePrice: '₹15',
        ecoPointsCost: 25
      },
      {
        id: 'in-meal-03',
        title: 'Night Canteen Special: Rajma Chawal Bowl',
        cafeteria: 'Hostel 4 Late-Night Canteen',
        cutoffTime: '23:45 PM (Midnight Cram)',
        remaining: 10,
        dietary: 'High Protein / Freshly Packaged',
        originalPrice: '₹95',
        rescuePrice: '₹25',
        ecoPointsCost: 40
      },
      {
        id: 'in-meal-04',
        title: 'Steamed Idli-Vada & Sambar Combo',
        cafeteria: 'Nilgiri Bhavan Ground Floor Kiosk',
        cutoffTime: '10:30 AM (Morning Window)',
        remaining: 8,
        dietary: 'Healthy Steamed / Gluten-Free',
        originalPrice: '₹65',
        rescuePrice: '₹15',
        ecoPointsCost: 30
      }
    ],
    rewards: [
      {
        id: 'in-rew-01',
        title: 'Nescafe Tapri Cutting Chai & Samosa',
        points: 150,
        icon: 'coffee',
        badge: 'Canteen Special',
        desc: 'Redeem for 1 hot masala cutting chai and fresh potato samosa at the student hub tapri.'
      },
      {
        id: 'in-rew-02',
        title: 'Night Canteen Midnight Maggi & Egg Bhurji',
        points: 250,
        icon: 'utensils',
        badge: 'Exam Fuel',
        desc: '₹50 voucher for late-night hostel canteen cravings during exam study sessions.'
      },
      {
        id: 'in-rew-03',
        title: 'AC Central Library Cubicle Priority Pass',
        points: 400,
        icon: 'book-open',
        badge: 'Study Perk',
        desc: 'Guaranteed 4-hour reservation in quiet, high-efficiency central AC reading commons.'
      },
      {
        id: 'in-rew-04',
        title: 'Hostel Smart Commercial Laundry Token',
        points: 300,
        icon: 'rotate-cw',
        badge: 'Hostel Living',
        desc: '1 complimentary cold-wash cycle on hostel smart laundromat machines.'
      },
      {
        id: 'in-rew-05',
        title: 'Campus E-Rickshaw & Green Cycle Pass',
        points: 600,
        icon: 'bike',
        badge: 'Green Commute',
        desc: 'Unlimited weekly rides on campus shared electric shuttles & pedal bicycles.'
      },
      {
        id: 'in-rew-06',
        title: 'Annual College Fest Merchandise Voucher',
        points: 900,
        icon: 'ticket',
        badge: 'College Fest',
        desc: '₹250 discount voucher for official tech/cultural fest hoodies, T-shirts, or concert access.'
      }
    ],
    bounties: [
      {
        id: 'in-bounty-01',
        title: 'Hostel Geyser & Desert Cooler Morning Sweep',
        category: 'energy',
        points: 50,
        co2Saved: '0.9 kg',
        desc: 'Verify common hostel geysers and idle desert cooler motors are powered down after 9:00 AM peak.'
      },
      {
        id: 'in-bounty-02',
        title: 'RO Purifier Reject-Water Bucket Diversion',
        category: 'water',
        points: 45,
        co2Saved: '0.4 kg',
        desc: 'Collect 25L of drinking purifier reject water and route it to quad flowerbeds or cleaning buckets.'
      },
      {
        id: 'in-bounty-03',
        title: 'Zero-Plate Mess Waste Verification',
        category: 'waste',
        points: 40,
        co2Saved: '0.8 kg',
        desc: 'Finish all food served on your lunch or dinner thali; scan QR code at mess return counter.'
      },
      {
        id: 'in-bounty-04',
        title: 'Campus Solar E-Rickshaw / Bicycle Commute',
        category: 'commute',
        points: 35,
        co2Saved: '1.2 kg',
        desc: 'Travel between hostel and lecture complex via shared electric shuttle, cycle, or walking.'
      }
    ],
    cheers: [
      { author: 'Vikram R. (Ganga Hostel)', text: 'Ganga 3rd floor just installed timer switches for common geysers! Urja Cup staying with us! 🇮🇳🔥', time: '4m ago' },
      { author: 'Ananya S. (Nilgiri Bhavan)', text: 'Nilgiri mess saved 140 kg of rice surplus today by smart headcount forecast! Watch out Ganga! 🍲', time: '12m ago' },
      { author: 'Prof. Sen (Dean of Sustainability)', text: 'Campus solar reached 1.54 MW peak today. Zero diesel generators fired up all week—great milestone!', time: '28m ago' }
    ],
    systemPrompt: `You are the EcoCampus AI Sustainability Advisor at a top Indian engineering and research university (e.g. IIT/NIT).
Analyze the student's Indian hostel habits, mess hall surplus, and campus resource usage (e.g., geysers, desert coolers, ceiling fans, RO purifier reject water, thali food waste, e-rickshaws).
Provide feedback using Metric units (liters, km, grams, kg CO2) and Indian campus context.
Respond strictly in JSON format with this exact schema:
{
  "impactKg": 0.45,
  "equivalentStr": "Equivalent to avoiding 4.2 km on an auto-rickshaw or saving 18 liters of fresh groundwater.",
  "savingsPct": 75,
  "tips": [
    "Tip 1 tailored to Indian hostel/mess life",
    "Tip 2 tailored to Indian hostel/mess life",
    "Tip 3 tailored to Indian hostel/mess life"
  ]
}`
  },

  usa: {
    id: 'usa',
    name: 'UC Berkeley / Stanford Collegiate Hub',
    shortName: 'US Ivy Campus',
    country: 'United States',
    flag: '🇺🇸',
    currencySymbol: '$',
    currencyCode: 'USD',
    units: {
      temperature: '72°F',
      tempUnit: '°F',
      weatherSummary: '72°F • Clear',
      solarIrradiance: '842 W/m²',
      waterUnit: 'Gallons',
      waterShort: 'Gal',
      waterPerCapita: 'gal/capita',
      distanceUnit: 'mi',
      generatorStatus: 'Microgrid Islanding Ready • 100% Clean'
    },
    student: {
      name: 'Alex Rivers',
      dormLabel: 'Dorm:',
      defaultDormName: 'Oak Hall (Rm 312)',
      dormSub: 'Oak Hall • Rm 312',
      rank: 'Rank #1',
      points: 1450,
      idTag: 'Oak Hall Residence • ID: #STU-88219',
      tier: 'Tier 4: Net-Zero Guardian'
    },
    dorms: [
      { id: 'oak', name: 'Oak Hall (Rm 312)' },
      { id: 'science', name: 'Science Complex' },
      { id: 'pine', name: 'Pine Haven' },
      { id: 'maple', name: 'Maple Towers' },
      { id: 'library', name: 'Central Library' }
    ],
    derbyStandings: [
      { rank: 1, name: 'Oak Hall', score: 94.2, energy: '3.1', water: '19.4', waste: 91, trend: '+3.4%', delta: '+3.4%' },
      { rank: 2, name: 'Pine Haven', score: 89.6, energy: '3.4', water: '21.2', waste: 87, trend: '+1.9%', delta: '+1.9%' },
      { rank: 3, name: 'Maple Towers', score: 84.1, energy: '3.8', water: '23.5', waste: 82, trend: '+0.5%', delta: '+0.5%' },
      { rank: 4, name: 'Willow Quad', score: 79.8, energy: '4.2', water: '26.8', waste: 78, trend: '-1.1%', delta: '-1.1%' },
      { rank: 5, name: 'Central Commons', score: 74.3, energy: '4.8', water: '29.1', waste: 73, trend: '-2.0%', delta: '-2.0%' }
    ],
    facilities: [
      {
        name: 'Science & Tech Complex',
        zone: 'Zone 01 • 520 kW Rooftop',
        power: '480 kW Real-time',
        solar: '94% Net Solar Day Offset',
        temp: '68.4°F Chilled Beam',
        occupancy: '940 Researchers',
        grade: 'Grade A+ (LEED Platinum)'
      },
      {
        name: 'Oak Residence Quad',
        zone: 'Zone 02 • Dorm Leader',
        power: '118 kW Real-time',
        solar: '88% Solar / Battery Supply',
        temp: '70.2°F Smart VAV',
        occupancy: '420 Residents',
        grade: 'Grade A+ (Leader)'
      },
      {
        name: 'W.E.B. Central Library',
        zone: 'Zone 03 • Study Commons',
        power: '195 kW Real-time',
        solar: '91% Solar Offset',
        temp: '69.0°F Smart HVAC',
        occupancy: '1,120 Studiers',
        grade: 'Grade A'
      },
      {
        name: 'Harvest Student Dining',
        zone: 'Zone 04 • Student Union',
        power: '160 kW Real-time',
        solar: '91% Heat Recovery Loop',
        temp: '71.5°F Kitchen Loop',
        occupancy: '580 Diners',
        grade: 'Grade A'
      },
      {
        name: 'North Solar Canopy',
        zone: 'Zone 05 • PV Array',
        power: '1,480 kW Peak Generation',
        solar: '82% Efficiency',
        temp: '95°F Surface Temp',
        occupancy: 'Automated Inverter Bank',
        grade: 'Grade A+'
      },
      {
        name: 'South Rainwater Cistern',
        zone: 'Zone 06 • Hydro Loop',
        power: '14.2 gpm Flow',
        solar: 'Greywater Loop Active',
        temp: '42.4 PSI Normal',
        occupancy: '38,420 Gal (94%)',
        grade: 'Grade A+'
      }
    ],
    meals: [
      {
        id: 'us-meal-01',
        title: 'Artisan Sourdough & Roasted Veggie Bagel',
        cafeteria: 'Harvest Market & Bakery',
        cutoffTime: '15:00 PM',
        remaining: 6,
        dietary: 'Vegetarian • Low Carbon',
        originalPrice: '$8.50',
        rescuePrice: '$2.50',
        ecoPointsCost: 50
      },
      {
        id: 'us-meal-02',
        title: 'Mediterranean Quinoa Power Bowl',
        cafeteria: 'Central Dining Pavilion',
        cutoffTime: '14:30 PM',
        remaining: 4,
        dietary: 'Vegan • Gluten-Free',
        originalPrice: '$11.00',
        rescuePrice: '$3.00',
        ecoPointsCost: 60
      },
      {
        id: 'us-meal-03',
        title: 'Wood-Fired Margherita Pizza Slices (2x)',
        cafeteria: 'North Quad Pizzeria',
        cutoffTime: '14:00 PM',
        remaining: 5,
        dietary: 'Organic Heirloom Tomatoes',
        originalPrice: '$7.00',
        rescuePrice: '$2.00',
        ecoPointsCost: 40
      },
      {
        id: 'us-meal-04',
        title: 'Farmhouse Vegetable Lentil Stew & Roll',
        cafeteria: 'South Campus Commons',
        cutoffTime: '15:30 PM',
        remaining: 7,
        dietary: 'Plant-Based • High Protein',
        originalPrice: '$9.00',
        rescuePrice: '$2.50',
        ecoPointsCost: 45
      }
    ],
    rewards: [
      {
        id: 'us-rew-01',
        title: 'Free Organic Oat Milk Latte',
        points: 200,
        icon: 'coffee',
        badge: 'Fair Trade',
        desc: 'Redeem at The Beanery in Student Union. Reusable cup required.'
      },
      {
        id: 'us-rew-02',
        title: 'Dorm Laundry Slot Priority Pass',
        points: 350,
        icon: 'rotate-cw',
        badge: 'Smart Dorm',
        desc: 'Reserve laundry machine during peak hours with smart cold-cycle discount.'
      },
      {
        id: 'us-rew-03',
        title: 'Campus Solar Bike Share Day Pass',
        points: 450,
        icon: 'bike',
        badge: 'Zero Emission',
        desc: 'Unlimited 24h access to campus electric and pedal bicycles.'
      },
      {
        id: 'us-rew-04',
        title: '$10 Campus Bookstore Sustainable Merch',
        points: 750,
        icon: 'shopping-bag',
        badge: 'Eco Gear',
        desc: 'Valid on recycled notebooks, bamboo utensils, and organic cotton hoodies.'
      }
    ],
    bounties: [
      {
        id: 'us-bounty-01',
        title: 'Vampire Load Display & Console Sweep',
        category: 'energy',
        points: 50,
        co2Saved: '0.8 kg',
        desc: 'Inspect dorm lounge screens, consoles, and lab bench monitors before weekend power-down.'
      },
      {
        id: 'us-bounty-02',
        title: 'Cafeteria Compost Contamination Audit',
        category: 'waste',
        points: 40,
        co2Saved: '0.6 kg',
        desc: 'Spend 15 mins assisting sorting line to ensure PLA cups and food scraps enter compost.'
      },
      {
        id: 'us-bounty-03',
        title: 'Electric Shuttle or Bike Commute',
        category: 'commute',
        points: 35,
        co2Saved: '1.4 kg',
        desc: 'Log a commute using university electric transit or cycling instead of single-occupancy auto.'
      }
    ],
    cheers: [
      { author: 'Maya L. (Oak Hall)', text: 'Unplugged all common room display consoles for the weekend! Oak Hall staying at #1! 🔥', time: '5m ago' },
      { author: 'Jordan K. (Pine Haven)', text: 'Pine Haven 2nd floor just switched all laundry to cold cycles! Watch out Oak! 🌲', time: '14m ago' },
      { author: 'Prof. Vance (Green Advisor)', text: 'Great job everyone! Campus solar peaked at 1.48 MW today—highest this semester.', time: '32m ago' }
    ],
    systemPrompt: `You are the EcoCampus AI Sustainability Advisor at a modern North American university.
Analyze the student's daily dining surplus or dorm resource habit.
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
  },

  uk: {
    id: 'uk',
    name: 'University of Oxford / Collegiate UK Hub',
    shortName: 'UK Oxford Model',
    country: 'United Kingdom',
    flag: '🇬🇧',
    currencySymbol: '£',
    currencyCode: 'GBP',
    units: {
      temperature: '16°C',
      tempUnit: '°C',
      weatherSummary: '16°C • Overcast',
      solarIrradiance: '520 W/m²',
      waterUnit: 'Litres',
      waterShort: 'L',
      waterPerCapita: 'L/capita',
      distanceUnit: 'km',
      generatorStatus: 'District Geothermal Loop Active'
    },
    student: {
      name: 'Oliver Hughes',
      dormLabel: 'College:',
      defaultDormName: 'Newton College (Rm 14)',
      dormSub: 'Newton College • Rm 14',
      rank: 'Rank #1',
      points: 1620,
      idTag: 'Collegiate Residence • ID: #OX-88219',
      tier: 'Tier 4: Net-Zero Warden'
    },
    dorms: [
      { id: 'newton', name: 'Newton College (Rm 14)' },
      { id: 'cavendish', name: 'Cavendish Physics Lab' },
      { id: 'turing', name: 'Turing Hall' },
      { id: 'bodleian', name: 'Bodleian Study Commons' }
    ],
    derbyStandings: [
      { rank: 1, name: 'Newton College', score: 95.1, energy: '2.9', water: '74', waste: 93, trend: '+3.1%', delta: '+3.1%' },
      { rank: 2, name: 'Turing Hall', score: 90.4, energy: '3.3', water: '81', waste: 88, trend: '+2.0%', delta: '+2.0%' },
      { rank: 3, name: 'Cavendish House', score: 86.8, energy: '3.6', water: '89', waste: 84, trend: '+0.7%', delta: '+0.7%' },
      { rank: 4, name: 'Pembroke Quad', score: 81.2, energy: '4.0', water: '95', waste: 80, trend: '-1.2%', delta: '-1.2%' }
    ],
    facilities: [
      {
        name: 'Cavendish Nanotech Complex',
        zone: 'Zone 01 • Geothermal Pump',
        power: '390 kW Real-time',
        solar: 'District Heat Exchanger Active',
        temp: '19.5°C Precision HVAC',
        occupancy: '720 Researchers',
        grade: 'Grade A+ (BREEAM Outstanding)'
      },
      {
        name: 'Newton College Residence',
        zone: 'Zone 02 • College Leader',
        power: '98 kW Real-time',
        solar: '84% Solar / Wind Loop',
        temp: '20.2°C Smart Thermostat',
        occupancy: '340 Scholars',
        grade: 'Grade A+'
      },
      {
        name: 'Radcliffe Science Library',
        zone: 'Zone 03 • Historic Atrium',
        power: '140 kW Real-time',
        solar: 'Secondary Glazed Insulation',
        temp: '19.0°C Low-Carbon Heating',
        occupancy: '890 Readers',
        grade: 'Grade A'
      },
      {
        name: 'Refectory & Hall Kitchens',
        zone: 'Zone 04 • Buttery Commons',
        power: '130 kW Real-time',
        solar: 'Induction Cooking & Heat Scavenger',
        temp: '21.0°C Kitchen Loop',
        occupancy: '460 Diners',
        grade: 'Grade A'
      },
      {
        name: 'Meadow Solar Canopy Array',
        zone: 'Zone 05 • Riverbank Solar',
        power: '980 kW Generation',
        solar: 'Dual-Axis Solar Tracker',
        temp: '22°C Surface Temp',
        occupancy: 'Grid Export Active',
        grade: 'Grade A+'
      },
      {
        name: 'Cotswold Rain Harvesting Vault',
        zone: 'Zone 06 • Hydro Retention',
        power: '12.8 gpm Recirculation',
        solar: 'Permeable Paving Drain',
        temp: '38.0 PSI Normal',
        occupancy: '120,000 Litres (92%)',
        grade: 'Grade A+'
      }
    ],
    meals: [
      {
        id: 'uk-meal-01',
        title: 'Buttery Jacket Potato with Cheddar & Beans',
        cafeteria: 'Newton College Refectory',
        cutoffTime: '14:15 PM',
        remaining: 9,
        dietary: 'Vegetarian • British Classic',
        originalPrice: '£6.50',
        rescuePrice: '£2.00',
        ecoPointsCost: 40
      },
      {
        id: 'uk-meal-02',
        title: 'Artisan Vegetable Pasty & Salad Box',
        cafeteria: 'Radcliffe Science Cafe',
        cutoffTime: '15:00 PM',
        remaining: 7,
        dietary: 'Local Organic Produce',
        originalPrice: '£5.80',
        rescuePrice: '£1.80',
        ecoPointsCost: 35
      },
      {
        id: 'uk-meal-03',
        title: 'Spiced Lentil Dahl & Sourdough Flatbread',
        cafeteria: 'Turing Commons Bistro',
        cutoffTime: '14:45 PM',
        remaining: 5,
        dietary: 'Vegan • Plant Powered',
        originalPrice: '£7.20',
        rescuePrice: '£2.20',
        ecoPointsCost: 45
      }
    ],
    rewards: [
      {
        id: 'uk-rew-01',
        title: 'Fairtrade Filter Coffee & Flapjack',
        points: 180,
        icon: 'coffee',
        badge: 'Organic',
        desc: 'Redeem at college buttery using your reusable porcelain mug.'
      },
      {
        id: 'uk-rew-02',
        title: 'Bicycle Workshop Tune-Up Token',
        points: 400,
        icon: 'bike',
        badge: 'Cycling Hub',
        desc: 'Free brake check, chain lubrication, and tube patching at campus co-op.'
      },
      {
        id: 'uk-rew-03',
        title: 'Bodleian Late-Night Desk Reservation',
        points: 500,
        icon: 'book-open',
        badge: 'Academic',
        desc: 'Priority heated carrel seat during Michaelmas and Trinity term exams.'
      }
    ],
    bounties: [
      {
        id: 'uk-bounty-01',
        title: 'College Radiator Valve & Sash Window Check',
        category: 'energy',
        points: 55,
        co2Saved: '1.1 kg',
        desc: 'Audit college staircase rooms to ensure radiators are set to 2 and draft seals shut.'
      },
      {
        id: 'uk-bounty-02',
        title: 'Rainwater Retention Gutter Sweep',
        category: 'water',
        points: 45,
        co2Saved: '0.5 kg',
        desc: 'Assist college gardening society with bioswale drainage check.'
      }
    ],
    cheers: [
      { author: 'Emma W. (Newton College)', text: 'Newton College just switched common heating to geothermal heat pumps! 🇬🇧', time: '8m ago' },
      { author: 'Liam B. (Turing Hall)', text: 'Turing Hall dining diverted 95% of food scraps into anaerobic digestion today!', time: '21m ago' }
    ],
    systemPrompt: `You are the EcoCampus AI Sustainability Advisor at a British collegiate university (e.g. Oxford/Cambridge).
Analyze student energy use in college halls, refectory waste, and low-carbon cycling habits using Metric SI units (£, km, Litres, kg CO2).
Respond strictly in JSON format matching the schema.`
  },

  europe: {
    id: 'europe',
    name: 'TU Delft / ETH Zurich Green Hub',
    shortName: 'EU Eco Campus',
    country: 'European Union',
    flag: '🇪🇺',
    currencySymbol: '€',
    currencyCode: 'EUR',
    units: {
      temperature: '19°C',
      tempUnit: '°C',
      weatherSummary: '19°C • Mild',
      solarIrradiance: '640 W/m²',
      waterUnit: 'Liters',
      waterShort: 'L',
      waterPerCapita: 'L/capita',
      distanceUnit: 'km',
      generatorStatus: 'Geothermal District Grid • Zero Carbon'
    },
    student: {
      name: 'Lukas Meyer',
      dormLabel: 'Pavilion:',
      defaultDormName: 'Van Gogh Pavilion (Rm 102)',
      dormSub: 'Van Gogh Pavilion • Rm 102',
      rank: 'Rank #1',
      points: 1580,
      idTag: 'EuroTech Residence • ID: #EU-88219',
      tier: 'Tier 4: Net-Zero Meister'
    },
    dorms: [
      { id: 'vangogh', name: 'Van Gogh Pavilion (Rm 102)' },
      { id: 'erasmus', name: 'Erasmus Eco-House' },
      { id: 'copernicus', name: 'Copernicus Science Lab' },
      { id: 'aula', name: 'Central Aula & Commons' }
    ],
    derbyStandings: [
      { rank: 1, name: 'Van Gogh Pavilion', score: 96.2, energy: '2.6', water: '71', waste: 95, trend: '+3.8%', delta: '+3.8%' },
      { rank: 2, name: 'Erasmus Eco-House', score: 92.4, energy: '2.9', water: '76', waste: 91, trend: '+2.1%', delta: '+2.1%' },
      { rank: 3, name: 'Copernicus Lab', score: 88.0, energy: '3.4', water: '84', waste: 86, trend: '+1.0%', delta: '+1.0%' },
      { rank: 4, name: 'Spinoza Hall', score: 82.5, energy: '3.9', water: '91', waste: 81, trend: '-0.9%', delta: '-0.9%' }
    ],
    facilities: [
      {
        name: 'Copernicus Circular Labs',
        zone: 'Zone 01 • Triple Glazed',
        power: '340 kW Real-time',
        solar: '100% Geothermal & Solar BESS',
        temp: '20.0°C Heat Recovery',
        occupancy: '810 Researchers',
        grade: 'Grade A+ (Passivhaus)'
      },
      {
        name: 'Van Gogh Eco-Pavilion',
        zone: 'Zone 02 • Pavilion Leader',
        power: '88 kW Real-time',
        solar: 'Mass Timber • Zero Net Energy',
        temp: '20.5°C Solar Floor Heating',
        occupancy: '380 Students',
        grade: 'Grade A+'
      },
      {
        name: 'Central Aula Library',
        zone: 'Zone 03 • Turf Roof Commons',
        power: '160 kW Real-time',
        solar: 'Insulated Green Living Roof',
        temp: '19.8°C Natural Ventilation',
        occupancy: '1,050 Studiers',
        grade: 'Grade A+'
      },
      {
        name: 'Mensa Bio-Bistro Kitchen',
        zone: 'Zone 04 • Organic Dining',
        power: '120 kW Real-time',
        solar: 'Electric Induction & Biowaste',
        temp: '21.0°C Heat Exchanger',
        occupancy: '520 Diners',
        grade: 'Grade A+'
      },
      {
        name: 'Polder Wind & Solar Hybrid',
        zone: 'Zone 05 • Clean Microgrid',
        power: '1,620 kW Generation',
        solar: 'Bifacial Solar + Wind Turbine',
        temp: '20°C Inverter Ambient',
        occupancy: 'Smart Islanding Active',
        grade: 'Grade A+'
      },
      {
        name: 'Canal Hydro Loop System',
        zone: 'Zone 06 • Thermal Water Loop',
        power: '16.5 gpm Flow',
        solar: 'Closed Geothermal Aquifer',
        temp: '40.0 PSI Normal',
        occupancy: '160,000 Liters (95%)',
        grade: 'Grade A+'
      }
    ],
    meals: [
      {
        id: 'eu-meal-01',
        title: 'Mensa Organic Falafel & Hummus Wrap',
        cafeteria: 'Central Mensa Bio-Bistro',
        cutoffTime: '14:00 PM',
        remaining: 11,
        dietary: '100% Vegan • Local Bio',
        originalPrice: '€6.80',
        rescuePrice: '€2.20',
        ecoPointsCost: 45
      },
      {
        id: 'eu-meal-02',
        title: 'Dutch Gouda Melt & Lentil Bio-Soup',
        cafeteria: 'Aula Faculty Cafe',
        cutoffTime: '14:30 PM',
        remaining: 8,
        dietary: 'Vegetarian • Warm Hearth',
        originalPrice: '€7.50',
        rescuePrice: '€2.50',
        ecoPointsCost: 50
      }
    ],
    rewards: [
      {
        id: 'eu-rew-01',
        title: 'Bio-Espresso & Oat Croissant',
        points: 190,
        icon: 'coffee',
        badge: 'Bio-Demeter',
        desc: 'Redeem at the Aula solar kiosk with your personal bamboo cup.'
      },
      {
        id: 'eu-rew-02',
        title: 'Campus Swapfiets Bike Maintenance Voucher',
        points: 420,
        icon: 'bike',
        badge: 'Cycling City',
        desc: 'Free monthly checkup and tire replacement on campus bike network.'
      }
    ],
    bounties: [
      {
        id: 'eu-bounty-01',
        title: 'Living Turf Roof Moisture Inspection',
        category: 'water',
        points: 45,
        co2Saved: '0.7 kg',
        desc: 'Check soil hydration sensors on the Aula library green roof.'
      },
      {
        id: 'eu-bounty-02',
        title: 'Velodrome Quad Commute (No Petrol)',
        category: 'commute',
        points: 40,
        co2Saved: '1.6 kg',
        desc: 'Log a 5 km campus commute entirely by bicycle or electric cargo bike.'
      }
    ],
    cheers: [
      { author: 'Frederik V. (Delft)', text: 'Van Gogh pavilion is generating 120% of its electricity today from solar glass! 🇪🇺', time: '11m ago' },
      { author: 'Sophie K. (Zurich)', text: 'Zero food waste achieved at Mensa lunch service today! Great collective effort!', time: '35m ago' }
    ],
    systemPrompt: `You are the EcoCampus AI Sustainability Advisor at an eco-technical European university (e.g. TU Delft/ETH Zurich).
Analyze student carbon footprint using European Metric standards (€, km, Liters, kg CO2) and cycling/Passivhaus benchmarks.
Respond strictly in JSON matching the schema.`
  }
};
