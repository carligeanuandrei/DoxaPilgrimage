// Types for Orthodox calendar
export type OrthodoxFeast = {
  id: number;
  date: string; // ISO format
  name: string;
  nameRo: string; // Romanian name
  type: 'major' | 'minor' | 'saint';
  description?: string;
  relatedPilgrimages?: string[]; // locations that are relevant for this feast
  isFastingDay: boolean;
};

export type FastingPeriod = {
  id: number;
  name: string;
  nameRo: string;
  startDate: string; // ISO format
  endDate: string; // ISO format
  description?: string;
  type: 'strict' | 'relaxed' | 'free';
}

// 2025 Orthodox feasts (selection)
export const orthodoxFeasts: OrthodoxFeast[] = [
  {
    id: 1,
    date: '2025-01-01',
    name: 'Circumcision of Christ',
    nameRo: 'Tăierea împrejur cea după trup a Domnului',
    type: 'major',
    description: 'The Circumcision of Christ is celebrated on the eighth day after the Nativity.',
    isFastingDay: false
  },
  {
    id: 2,
    date: '2025-01-06',
    name: 'Epiphany (Theophany)',
    nameRo: 'Botezul Domnului (Boboteaza)',
    type: 'major',
    description: 'The Baptism of Christ in the Jordan River by St. John the Baptist.',
    relatedPilgrimages: ['Israel', 'Jordan River'],
    isFastingDay: false
  },
  {
    id: 3,
    date: '2025-01-07',
    name: 'Synaxis of St. John the Baptist',
    nameRo: 'Soborul Sf. Prooroc Ioan Botezătorul',
    type: 'major',
    isFastingDay: false
  },
  {
    id: 4,
    date: '2025-01-30',
    name: 'Three Holy Hierarchs',
    nameRo: 'Sfinții Trei Ierarhi',
    type: 'major',
    description: 'Feast of the Three Holy Hierarchs: Basil the Great, Gregory the Theologian, and John Chrysostom.',
    isFastingDay: false
  },
  {
    id: 5,
    date: '2025-02-02',
    name: 'Presentation of Christ in the Temple',
    nameRo: 'Întâmpinarea Domnului',
    type: 'major',
    description: 'When Christ was presented in the Temple 40 days after his birth.',
    relatedPilgrimages: ['Israel', 'Jerusalem'],
    isFastingDay: false
  },
  {
    id: 6,
    date: '2025-03-25',
    name: 'Annunciation',
    nameRo: 'Buna Vestire',
    type: 'major',
    description: 'The announcement by the angel Gabriel to the Virgin Mary that she would conceive and bear a son.',
    relatedPilgrimages: ['Israel', 'Nazareth'],
    isFastingDay: false
  },
  {
    id: 7,
    date: '2025-04-20',
    name: 'Palm Sunday',
    nameRo: 'Duminica Floriilor',
    type: 'major',
    description: 'Commemorates Christ\'s entry into Jerusalem.',
    relatedPilgrimages: ['Israel', 'Jerusalem'],
    isFastingDay: false
  },
  {
    id: 8,
    date: '2025-04-27',
    name: 'Pascha (Easter)',
    nameRo: 'Învierea Domnului (Paștele)',
    type: 'major',
    description: 'The feast of Christ\'s Resurrection.',
    relatedPilgrimages: ['Israel', 'Jerusalem', 'Holy Sepulchre'],
    isFastingDay: false
  },
  {
    id: 9,
    date: '2025-06-05',
    name: 'Ascension of Christ',
    nameRo: 'Înălțarea Domnului',
    type: 'major',
    description: 'Commemorates Christ\'s ascension into heaven.',
    relatedPilgrimages: ['Israel', 'Mount of Olives'],
    isFastingDay: false
  },
  {
    id: 10,
    date: '2025-06-15',
    name: 'Pentecost',
    nameRo: 'Pogorârea Sfântului Duh (Rusaliile)',
    type: 'major',
    description: 'The descent of the Holy Spirit upon the Apostles.',
    relatedPilgrimages: ['Israel', 'Jerusalem'],
    isFastingDay: false
  },
  {
    id: 11,
    date: '2025-08-06',
    name: 'Transfiguration of Christ',
    nameRo: 'Schimbarea la Față a Domnului',
    type: 'major',
    description: 'Commemorates the transfiguration of Christ on Mount Tabor.',
    relatedPilgrimages: ['Israel', 'Mount Tabor'],
    isFastingDay: false
  },
  {
    id: 12,
    date: '2025-08-15',
    name: 'Dormition of the Theotokos',
    nameRo: 'Adormirea Maicii Domnului',
    type: 'major',
    description: 'Commemorates the death, resurrection, and glorification of the Mother of God.',
    relatedPilgrimages: ['Israel', 'Jerusalem', 'Gethsemane'],
    isFastingDay: false
  },
  {
    id: 13,
    date: '2025-09-08',
    name: 'Nativity of the Theotokos',
    nameRo: 'Nașterea Maicii Domnului',
    type: 'major',
    isFastingDay: false
  },
  {
    id: 14,
    date: '2025-09-14',
    name: 'Elevation of the Holy Cross',
    nameRo: 'Înălțarea Sfintei Cruci',
    type: 'major',
    description: 'Commemorates the finding of the True Cross by Saint Helena.',
    relatedPilgrimages: ['Israel', 'Jerusalem'],
    isFastingDay: true
  },
  {
    id: 15,
    date: '2025-10-14',
    name: 'Saint Paraskeva of Iași',
    nameRo: 'Sfânta Cuvioasă Parascheva',
    type: 'saint',
    description: 'Patron saint of Moldova, her relics are in the Metropolitan Cathedral in Iași.',
    relatedPilgrimages: ['România', 'Iași'],
    isFastingDay: false
  },
  {
    id: 16,
    date: '2025-11-21',
    name: 'Entry of the Theotokos into the Temple',
    nameRo: 'Intrarea Maicii Domnului în Biserică',
    type: 'major',
    isFastingDay: false
  },
  {
    id: 17,
    date: '2025-11-30',
    name: 'Saint Andrew the Apostle',
    nameRo: 'Sfântul Apostol Andrei',
    type: 'saint',
    description: 'Patron saint of Romania, who brought Christianity to the region.',
    relatedPilgrimages: ['România', 'Peștera Sfântului Andrei'],
    isFastingDay: false
  },
  {
    id: 18,
    date: '2025-12-06',
    name: 'Saint Nicholas',
    nameRo: 'Sfântul Ierarh Nicolae',
    type: 'saint',
    isFastingDay: false
  },
  {
    id: 19,
    date: '2025-12-25',
    name: 'Nativity of Christ (Christmas)',
    nameRo: 'Nașterea Domnului (Crăciunul)',
    type: 'major',
    description: 'The birth of Jesus Christ in Bethlehem.',
    relatedPilgrimages: ['Israel', 'Bethlehem'],
    isFastingDay: false
  },
  {
    id: 20,
    date: '2025-12-26',
    name: 'Synaxis of the Theotokos',
    nameRo: 'Soborul Maicii Domnului',
    type: 'major',
    isFastingDay: false
  },
  {
    id: 21,
    date: '2025-07-02',
    name: 'Saint Stephen the Great',
    nameRo: 'Sfântul Voievod Ștefan cel Mare',
    type: 'saint',
    description: 'Ruler of Moldova who built many churches and monasteries and defended Christianity.',
    relatedPilgrimages: ['România', 'Putna'],
    isFastingDay: false
  },
  {
    id: 22,
    date: '2025-07-20',
    name: 'Saint Elijah',
    nameRo: 'Sfântul Prooroc Ilie Tesviteanul',
    type: 'saint',
    isFastingDay: false
  }
];

// 2025 Orthodox fasting periods
export const fastingPeriods: FastingPeriod[] = [
  {
    id: 1,
    name: 'Great Lent',
    nameRo: 'Postul Mare (Postul Paștelui)',
    startDate: '2025-03-03',
    endDate: '2025-04-19',
    description: 'The 40-day period of fasting before Pascha (Easter).',
    type: 'strict'
  },
  {
    id: 2,
    name: 'Apostles\' Fast',
    nameRo: 'Postul Sfinților Apostoli Petru și Pavel',
    startDate: '2025-06-23',
    endDate: '2025-06-28',
    description: 'Begins on the Monday after All Saints Sunday and ends on the Feast of Saints Peter and Paul.',
    type: 'relaxed'
  },
  {
    id: 3,
    name: 'Dormition Fast',
    nameRo: 'Postul Adormirii Maicii Domnului',
    startDate: '2025-08-01',
    endDate: '2025-08-14',
    description: 'Two-week fast preceding the Feast of the Dormition of the Theotokos.',
    type: 'strict'
  },
  {
    id: 4,
    name: 'Nativity Fast',
    nameRo: 'Postul Nașterii Domnului (Postul Crăciunului)',
    startDate: '2025-11-15',
    endDate: '2025-12-24',
    description: '40-day fast before Christmas.',
    type: 'relaxed'
  }
];

// Days of the week when Orthodox Christians traditionally fast
export const weeklyFastingDays = ['wednesday', 'friday'];

// Utility functions
export function isWithinFastingPeriod(date: Date): FastingPeriod | null {
  const dateStr = date.toISOString().split('T')[0];
  
  for (const period of fastingPeriods) {
    if (dateStr >= period.startDate && dateStr <= period.endDate) {
      return period;
    }
  }
  
  return null;
}

export function isFastingDay(date: Date): boolean {
  // Check if it's a feast day that overrides fasting
  const dateStr = date.toISOString().split('T')[0];
  const feast = orthodoxFeasts.find(f => f.date === dateStr);
  
  if (feast) {
    return feast.isFastingDay;
  }
  
  // Check if it's in a fasting period
  if (isWithinFastingPeriod(date)) {
    return true;
  }
  
  // Check if it's Wednesday or Friday (traditional fasting days)
  const day = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return weeklyFastingDays.includes(day);
}

export function getFeastsForMonth(month: number, year: number = 2025): OrthodoxFeast[] {
  return orthodoxFeasts.filter(feast => {
    const feastDate = new Date(feast.date);
    return feastDate.getMonth() + 1 === month && feastDate.getFullYear() === year;
  });
}

export function getFeastsByType(type: OrthodoxFeast['type']): OrthodoxFeast[] {
  return orthodoxFeasts.filter(feast => feast.type === type);
}

export function getUpcomingFeasts(date: Date = new Date(), count: number = 5): OrthodoxFeast[] {
  const today = date.toISOString().split('T')[0];
  
  return orthodoxFeasts
    .filter(feast => feast.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, count);
}

export function getSaintsForMonth(month: number): OrthodoxFeast[] {
  return orthodoxFeasts.filter(feast => {
    return feast.type === 'saint' && new Date(feast.date).getMonth() + 1 === month;
  });
}

// Helper function to recommend pilgrimages based on upcoming feasts
export function recommendPilgrimages(upcomingDays: number = 60): string[] {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + upcomingDays);
  
  const relevantFeasts = orthodoxFeasts.filter(feast => {
    const feastDate = new Date(feast.date);
    return feastDate >= today && feastDate <= futureDate && feast.relatedPilgrimages?.length;
  });
  
  // Extract unique pilgrimage locations
  const recommendations = new Set<string>();
  relevantFeasts.forEach(feast => {
    feast.relatedPilgrimages?.forEach(place => recommendations.add(place));
  });
  
  return Array.from(recommendations);
}