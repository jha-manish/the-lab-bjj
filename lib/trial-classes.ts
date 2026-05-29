export const TRIAL_CLASSES = [
  {
    name: "Beginner's Class",
    desc: "Perfect if you've never trained before. Learn the fundamentals in a welcoming, low-pressure environment.",
    time: 'Mon–Fri · 6:00–7:00 PM',
    level: 'Beginners',
    itemId: 'PTFGD2T4KSOY4ADA224H5X77',
    variationId: 'SO5MYYKR524ICGNGG4NKEEAZ',
    variationVersion: '1778476320636',
  },
  {
    name: 'Regular Class',
    desc: 'All-levels class covering technique, drilling, and live rolling. Beginners are always welcome — our coaches make sure no one gets left behind.',
    time: 'Mon–Thu · 7:00–8:30 PM',
    level: 'All Levels',
    tip: "Can't make the 6 PM Beginner's Class? This is your next best option.",
    itemId: 'AHYKA2XF5A2PBNCSMOCLQMLF',
    variationId: '2JICFMUU6IBBOMFR7IF7ZIXQ',
    variationVersion: '1779766840759',
  },
  {
    name: "Women's Only Class",
    desc: 'A dedicated women-only environment. Supportive, focused, and beginner-friendly.',
    time: 'Fridays · 5:00–6:00 PM',
    level: 'Women Only',
    itemId: 'GJD24AXAVPDC7OX7WXO2UESO',
    variationId: 'BL2SYBITVHONRW6S4Q46556V',
    variationVersion: '1778476901859',
  },
  {
    name: 'Kids Class',
    desc: 'Ages 5–15. Fun, structured classes building confidence, discipline, and self-defence. Led by Black Belt Roger Morais.',
    time: 'Mon–Fri · 5:00–6:00 PM',
    level: 'Ages 5–15',
    itemId: 'RDCFCELC275SBLQLGN2YXUXX',
    variationId: 'UXGTIMUXQ5HW5VWWE5LJZAQ7',
    variationVersion: '1778476481420',
  },
] as const

export type TrialClass = (typeof TRIAL_CLASSES)[number]
