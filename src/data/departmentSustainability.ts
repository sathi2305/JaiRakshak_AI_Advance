import { DepartmentStanding, DepartmentBadge } from '../types';

export const INITIAL_DEPARTMENT_BADGES: DepartmentBadge[] = [
  {
    id: 'bdg-diamond-star',
    title: 'Diamond Aqua-Star',
    category: 'EFFICIENCY',
    tier: 'Diamond',
    rarity: 'Legendary',
    description: 'Awarded to departments maintaining sustained elite water-saving efficiency (>92%) across the quarterly review cycle.',
    criteria: 'Sustain >= 92% efficiency rating and zero unjustified consumption surges for 60 consecutive days.',
    points: 1000,
    iconName: 'Sparkles',
    progressPercent: 100,
    unlocked: true,
    awardedDepartments: [
      { departmentId: 'dept-biotech', departmentName: 'Biotechnology & Life Sciences', dateAwarded: '2026-09-15' },
      { departmentId: 'dept-admin', departmentName: 'Campus Administration & Secretariat', dateAwarded: '2026-08-20' }
    ]
  },
  {
    id: 'bdg-zero-leak',
    title: 'Zero-Leak Vanguard',
    category: 'LEAK_PREVENTION',
    tier: 'Platinum',
    rarity: 'Epic',
    description: 'Maintained absolute zero unresolved pipe, fixture, or valve leaks across all building wings for 30 days.',
    criteria: 'Zero open leak tickets exceeding 2-hour SLA and negative acoustic line anomaly flags for 30 days.',
    points: 750,
    iconName: 'ShieldCheck',
    progressPercent: 100,
    unlocked: true,
    awardedDepartments: [
      { departmentId: 'dept-biotech', departmentName: 'Biotechnology & Life Sciences', dateAwarded: '2026-09-02' },
      { departmentId: 'dept-utilities', departmentName: 'Central Water Utility & RO Plant', dateAwarded: '2026-09-10' }
    ]
  },
  {
    id: 'bdg-greywater-loop',
    title: 'Greywater Closed-Loop Innovator',
    category: 'RECYCLING',
    tier: 'Gold',
    rarity: 'Epic',
    description: 'Diverted and reclaimed over 50,000 Liters of non-potable greywater for cooling towers or landscape irrigation.',
    criteria: 'Install closed-loop filtration recycling >= 40% of baseline sink/drain output into non-potable storage.',
    points: 650,
    iconName: 'Droplets',
    progressPercent: 100,
    unlocked: true,
    awardedDepartments: [
      { departmentId: 'dept-biotech', departmentName: 'Biotechnology & Life Sciences', dateAwarded: '2026-08-14' },
      { departmentId: 'dept-civil', departmentName: 'Civil & Environmental Engineering', dateAwarded: '2026-09-18' }
    ]
  },
  {
    id: 'bdg-night-sentinel',
    title: 'Night Flow Sentinel',
    category: 'EFFICIENCY',
    tier: 'Gold',
    rarity: 'Rare',
    description: 'Kept midnight-to-4:00 AM quiescent baseline flow strictly under 3.5 LPM, guaranteeing no hidden valve trickles.',
    criteria: 'Night flow delta <= 4% above theoretical dry-line minimum across all sub-meter zones for 14 nights.',
    points: 500,
    iconName: 'Moon',
    progressPercent: 100,
    unlocked: true,
    awardedDepartments: [
      { departmentId: 'dept-admin', departmentName: 'Campus Administration & Secretariat', dateAwarded: '2026-08-30' },
      { departmentId: 'dept-athletics', departmentName: 'Athletics & Recreation Pavilion', dateAwarded: '2026-09-22' }
    ]
  },
  {
    id: 'bdg-pump-decarbon',
    title: 'Pump Decarbonizer & Peak-Shifter',
    category: 'INNOVATION',
    tier: 'Platinum',
    rarity: 'Epic',
    description: 'Synchronized high-volume booster pumping with campus rooftop solar generation to slash Scope 2 pump emissions.',
    criteria: 'Shift >= 75% of reservoir pumping kilowatt-hours into 10:00 AM - 3:00 PM solar irradiance window.',
    points: 600,
    iconName: 'Zap',
    progressPercent: 100,
    unlocked: true,
    awardedDepartments: [
      { departmentId: 'dept-utilities', departmentName: 'Central Water Utility & RO Plant', dateAwarded: '2026-09-08' }
    ]
  },
  {
    id: 'bdg-rapid-reaction',
    title: 'Rapid Reaction Strike Squad',
    category: 'LEAK_PREVENTION',
    tier: 'Silver',
    rarity: 'Rare',
    description: 'Mean Time to Detect (MTTD) and electronically isolate high-pressure anomalies in under 45 minutes.',
    criteria: 'Average leak response resolution SLA under 45 minutes across at least 3 dispatch incidents.',
    points: 450,
    iconName: 'Flame',
    progressPercent: 100,
    unlocked: true,
    awardedDepartments: [
      { departmentId: 'dept-admin', departmentName: 'Campus Administration & Secretariat', dateAwarded: '2026-07-28' },
      { departmentId: 'dept-residence', departmentName: 'Student Residential Life & Hostels', dateAwarded: '2026-08-11' },
      { departmentId: 'dept-cs-robotics', departmentName: 'Computer Science & Robotics', dateAwarded: '2026-09-12' }
    ]
  },
  {
    id: 'bdg-eco-pledge',
    title: 'Eco-Pledge Community Vanguard',
    category: 'COMMUNITY',
    tier: 'Silver',
    rarity: 'Standard',
    description: 'Engaged over 100 student, faculty, and administrative staff members in verified personal water saving pledges.',
    criteria: 'Register >= 100 individual occupant pledges with demonstrable micro-conservation behavioral shifts.',
    points: 400,
    iconName: 'Users',
    progressPercent: 100,
    unlocked: true,
    awardedDepartments: [
      { departmentId: 'dept-residence', departmentName: 'Student Residential Life & Hostels', dateAwarded: '2026-09-25' },
      { departmentId: 'dept-civil', departmentName: 'Civil & Environmental Engineering', dateAwarded: '2026-09-19' },
      { departmentId: 'dept-admin', departmentName: 'Campus Administration & Secretariat', dateAwarded: '2026-09-04' }
    ]
  },
  {
    id: 'bdg-aerator-master',
    title: 'Smart Aerator 100% Retrofit',
    category: 'EFFICIENCY',
    tier: 'Gold',
    rarity: 'Rare',
    description: 'Fully retrofitted every hand-wash faucet and lab utility tap with 1.5 LPM pressure-compensating aerators.',
    criteria: 'Achieve 100% verified aerator fixture coverage across all building floors.',
    points: 550,
    iconName: 'CheckCircle2',
    progressPercent: 88,
    unlocked: false,
    awardedDepartments: [
      { departmentId: 'dept-admin', departmentName: 'Campus Administration & Secretariat', dateAwarded: '2026-09-28' }
    ]
  }
];

export const INITIAL_DEPARTMENT_STANDINGS: DepartmentStanding[] = [
  {
    id: 'dept-biotech',
    name: 'Biotechnology & Life Sciences',
    shortCode: 'BIO-LS',
    buildingName: 'Block B — BioTech Innovation Center',
    buildingId: 'bld-2',
    category: 'Academic & Research',
    headOfDepartment: 'Dr. Ananya Mukherjee',
    occupancy: 950,
    efficiencyScore: 94.6,
    previousRank: 2,
    currentRank: 1,
    waterSavedLitersMonth: 248500,
    baselineConsumptionMonth: 580000,
    actualConsumptionMonth: 331500,
    perCapitaLpd: 11.6,
    leakIncidentCount: 0,
    leakResolutionAvgHours: 0.8,
    cheerCount: 142,
    badgeIds: ['bdg-diamond-star', 'bdg-zero-leak', 'bdg-greywater-loop'],
    tier: 'Diamond',
    activeInitiatives: [
      {
        id: 'init-1',
        title: 'Closed-Loop Autoclave Cooling Water Recovery',
        category: 'Process Optimization',
        status: 'ACTIVE',
        savingsEstimatedLpd: 2400,
        impactDescription: 'Recirculates lab cooling fluid through sealed heat exchanger rather than single-pass tap discharge.',
        dateStarted: '2026-08-01'
      },
      {
        id: 'init-2',
        title: 'High-Purity RO Reject Re-injection to Flush Header',
        category: 'Recycling',
        status: 'ACTIVE',
        savingsEstimatedLpd: 3800,
        impactDescription: 'Channels 12,000L/week of RO plant reject water directly into basement greywater flush manifold.',
        dateStarted: '2026-08-15'
      },
      {
        id: 'init-3',
        title: 'Ultra-Low Flow Micro-Aerator Retrofit (Floor 3 Labs)',
        category: 'Fixture Hardware',
        status: 'COMPLETED',
        savingsEstimatedLpd: 1200,
        impactDescription: 'Reduced sink tap flow from 8.2 LPM to 1.8 LPM without compromising sterilization rinse efficacy.',
        dateStarted: '2026-07-10'
      }
    ]
  },
  {
    id: 'dept-admin',
    name: 'Campus Administration & Secretariat',
    shortCode: 'ADM-SEC',
    buildingName: 'Block C — Administrative Complex & Auditorium',
    buildingId: 'bld-3',
    category: 'Administration',
    headOfDepartment: 'Prof. R. Venkatesh',
    occupancy: 650,
    efficiencyScore: 92.4,
    previousRank: 1,
    currentRank: 2,
    waterSavedLitersMonth: 165200,
    baselineConsumptionMonth: 310000,
    actualConsumptionMonth: 144800,
    perCapitaLpd: 9.8,
    leakIncidentCount: 1,
    leakResolutionAvgHours: 1.1,
    cheerCount: 98,
    badgeIds: ['bdg-diamond-star', 'bdg-night-sentinel', 'bdg-rapid-reaction', 'bdg-eco-pledge', 'bdg-aerator-master'],
    tier: 'Platinum',
    activeInitiatives: [
      {
        id: 'init-4',
        title: 'Dual-Flush Infrared Sensor Overhaul',
        category: 'Automation',
        status: 'ACTIVE',
        savingsEstimatedLpd: 1950,
        impactDescription: 'Installed smart PIR sensors on all 42 executive restroom flushometers.',
        dateStarted: '2026-07-20'
      },
      {
        id: 'init-5',
        title: 'Auditorium Weekend Supply Isolation Automation',
        category: 'Smart Valves',
        status: 'ACTIVE',
        savingsEstimatedLpd: 2600,
        impactDescription: 'Scheduled motor-driven solenoid valves automatically isolate unpopulated wings from Friday 8 PM to Monday 6 AM.',
        dateStarted: '2026-08-10'
      }
    ]
  },
  {
    id: 'dept-civil',
    name: 'Civil & Environmental Engineering Wing',
    shortCode: 'CEE-LAB',
    buildingName: 'Eco-Hydrology Wing (Zone C)',
    buildingId: 'bld-2',
    category: 'Academic & Research',
    headOfDepartment: 'Dr. Meera Swaminathan',
    occupancy: 720,
    efficiencyScore: 89.8,
    previousRank: 5,
    currentRank: 3,
    waterSavedLitersMonth: 198000,
    baselineConsumptionMonth: 440000,
    actualConsumptionMonth: 242000,
    perCapitaLpd: 15.2,
    leakIncidentCount: 0,
    leakResolutionAvgHours: 1.4,
    cheerCount: 115,
    badgeIds: ['bdg-greywater-loop', 'bdg-eco-pledge'],
    tier: 'Gold',
    activeInitiatives: [
      {
        id: 'init-6',
        title: 'Bio-Retention Rainwater Infiltration Testbed',
        category: 'Green Infrastructure',
        status: 'ACTIVE',
        savingsEstimatedLpd: 3100,
        impactDescription: 'Directs rooftop precipitation through sand-gravel bio-filters into groundwater recharge wells.',
        dateStarted: '2026-08-25'
      },
      {
        id: 'init-7',
        title: 'Student Leak Patrol & Acoustic Line Audits',
        category: 'Community Audit',
        status: 'ACTIVE',
        savingsEstimatedLpd: 1400,
        impactDescription: 'Weekly graduate student walk-throughs using ultrasonic sensors to catch silent cistern leaks.',
        dateStarted: '2026-09-01'
      }
    ]
  },
  {
    id: 'dept-utilities',
    name: 'Central Water Utility & RO Directorate',
    shortCode: 'UTIL-RO',
    buildingName: 'Central Water Utility & RO Plant',
    buildingId: 'bld-5',
    category: 'Operations & Facilities',
    headOfDepartment: 'Chief Eng. K. Sundaram',
    occupancy: 150,
    efficiencyScore: 87.2,
    previousRank: 4,
    currentRank: 4,
    waterSavedLitersMonth: 342000,
    baselineConsumptionMonth: 820000,
    actualConsumptionMonth: 478000,
    perCapitaLpd: 21.4,
    leakIncidentCount: 2,
    leakResolutionAvgHours: 0.6,
    cheerCount: 84,
    badgeIds: ['bdg-zero-leak', 'bdg-pump-decarbon'],
    tier: 'Gold',
    activeInitiatives: [
      {
        id: 'init-8',
        title: 'VFD Multi-Stage Booster Pump Modulations',
        category: 'Electromechanical',
        status: 'ACTIVE',
        savingsEstimatedLpd: 5200,
        impactDescription: 'Eliminates pipe-hammer pressure spikes that crack joints by modulating booster speed dynamically.',
        dateStarted: '2026-06-15'
      },
      {
        id: 'init-9',
        title: 'Dual-Stage Membrane Backwash Reclaim Loop',
        category: 'Filtration Efficiency',
        status: 'ACTIVE',
        savingsEstimatedLpd: 4100,
        impactDescription: 'Reclaims 85% of sand-filter backwash volume into raw clarification clarifier.',
        dateStarted: '2026-07-04'
      }
    ]
  },
  {
    id: 'dept-residence',
    name: 'Student Residential Life & Hostels',
    shortCode: 'RES-LIFE',
    buildingName: 'Block D — Green Hostel & Dining Hall',
    buildingId: 'bld-4',
    category: 'Student Living & Dining',
    headOfDepartment: 'Dean Shalini Verma',
    occupancy: 1100,
    efficiencyScore: 82.5,
    previousRank: 6,
    currentRank: 5,
    waterSavedLitersMonth: 215000,
    baselineConsumptionMonth: 650000,
    actualConsumptionMonth: 435000,
    perCapitaLpd: 32.8,
    leakIncidentCount: 3,
    leakResolutionAvgHours: 1.8,
    cheerCount: 210,
    badgeIds: ['bdg-eco-pledge', 'bdg-rapid-reaction'],
    tier: 'Silver',
    activeInitiatives: [
      {
        id: 'init-10',
        title: '5-Minute Shower Incentive Challenge & Smart Timers',
        category: 'Behavioral Engagement',
        status: 'ACTIVE',
        savingsEstimatedLpd: 4600,
        impactDescription: 'Inter-floor competition providing solar laundry credits to student blocks with lowest shower duration.',
        dateStarted: '2026-09-01'
      },
      {
        id: 'init-11',
        title: 'High-Efficiency Aerated Showerheads in Towers A & B',
        category: 'Hardware Retrofit',
        status: 'ACTIVE',
        savingsEstimatedLpd: 3300,
        impactDescription: 'Replaced 120 showerheads with 6.5 LPM venturi aerators saving 35% hot water.',
        dateStarted: '2026-08-20'
      }
    ]
  },
  {
    id: 'dept-cs-robotics',
    name: 'Computer Science & Robotics Complex',
    shortCode: 'CS-ROBOT',
    buildingName: 'Block A — Advanced Computing & Robotics',
    buildingId: 'bld-1',
    category: 'Academic & Research',
    headOfDepartment: 'Dr. Vikram Sethi',
    occupancy: 1400,
    efficiencyScore: 78.4,
    previousRank: 3,
    currentRank: 6,
    waterSavedLitersMonth: 142000,
    baselineConsumptionMonth: 490000,
    actualConsumptionMonth: 348000,
    perCapitaLpd: 24.2,
    leakIncidentCount: 4,
    leakResolutionAvgHours: 2.2,
    cheerCount: 76,
    badgeIds: ['bdg-rapid-reaction'],
    tier: 'Bronze',
    activeInitiatives: [
      {
        id: 'init-12',
        title: 'Acoustic Pipe Leak IoT Sentry Deployment',
        category: 'AI / IoT Monitoring',
        status: 'ACTIVE',
        savingsEstimatedLpd: 1800,
        impactDescription: 'CS student research project installing 12 vibration accelerometer sensors on main risers.',
        dateStarted: '2026-09-10'
      },
      {
        id: 'init-13',
        title: 'Server Room Chilled Water Loop Optimization',
        category: 'HVAC Optimization',
        status: 'PLANNED',
        savingsEstimatedLpd: 2900,
        impactDescription: 'Targeting zero evaporative loss by sealing cooling tower circuit.',
        dateStarted: '2026-10-15'
      }
    ]
  },
  {
    id: 'dept-athletics',
    name: 'Athletics, Aquatics & Recreation',
    shortCode: 'ATH-AQUA',
    buildingName: 'Sports Pavilion & Aquatic Center',
    buildingId: 'bld-3',
    category: 'Operations & Facilities',
    headOfDepartment: 'Coach Manoj Patil',
    occupancy: 450,
    efficiencyScore: 75.1,
    previousRank: 7,
    currentRank: 7,
    waterSavedLitersMonth: 118500,
    baselineConsumptionMonth: 380000,
    actualConsumptionMonth: 261500,
    perCapitaLpd: 38.5,
    leakIncidentCount: 2,
    leakResolutionAvgHours: 2.5,
    cheerCount: 64,
    badgeIds: ['bdg-night-sentinel'],
    tier: 'Bronze',
    activeInitiatives: [
      {
        id: 'init-14',
        title: 'Olympic Pool Backwash Water Recycling System',
        category: 'Filtration Efficiency',
        status: 'ACTIVE',
        savingsEstimatedLpd: 2800,
        impactDescription: 'Recycles chlorinated backwash through activated carbon filters for track & field irrigation.',
        dateStarted: '2026-08-05'
      }
    ]
  }
];

export const PRESET_PLEDGE_INITIATIVES = [
  {
    title: 'Install 1.5 LPM Pressure-Compensating Aerators',
    category: 'Hardware Retrofit',
    estimatedDailySavingsLiters: 1200,
    efficiencyBoostPercent: 1.8,
    description: 'Replace standard bathroom and sink faucet aerators with ultra-efficient 1.5 LPM aerators.'
  },
  {
    title: 'Deploy Closed-Loop Cooling Heat Exchangers',
    category: 'Process Optimization',
    estimatedDailySavingsLiters: 2500,
    efficiencyBoostPercent: 2.6,
    description: 'Convert single-pass tap water cooling on laboratory equipment into a recirculating closed circuit.'
  },
  {
    title: 'Campus 5-Minute Student Shower Challenge',
    category: 'Behavioral Engagement',
    estimatedDailySavingsLiters: 3200,
    efficiencyBoostPercent: 2.2,
    description: 'Gamified hostel conservation campaign rewarding student wings with solar laundry tokens.'
  },
  {
    title: 'Automate Weekend Solenoid Pipe Isolation',
    category: 'Smart Valves',
    estimatedDailySavingsLiters: 1800,
    efficiencyBoostPercent: 2.0,
    description: 'Shut off non-critical building water branches during weekends and holidays using automated valves.'
  },
  {
    title: 'Rooftop Rainwater Harvesting Buffer Infiltration',
    category: 'Green Infrastructure',
    estimatedDailySavingsLiters: 2800,
    efficiencyBoostPercent: 2.4,
    description: 'Filter monsoon storm runoff and channel directly into campus groundwater replenishment sumps.'
  },
  {
    title: 'Greywater Dual-Plumbing Toilet Flush Feed',
    category: 'Recycling',
    estimatedDailySavingsLiters: 3500,
    efficiencyBoostPercent: 3.1,
    description: 'Reroute treated sink & laundry effluent to replace treated municipal drinking water in toilet cisterns.'
  }
];
