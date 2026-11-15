export const TRIAL_CLASSES = [
  {
    name: 'Adult Class (Gi or No-Gi)',
    desc: 'All-levels class covering technique, drilling, and live rolling. Beginners are always welcome — our coaches make sure no one gets left behind.',
    time: 'Mon–Fri · 6:00–7:30 PM · Tue/Thu 6:30 AM',
    level: 'All Levels',
    itemId: 'AHYKA2XF5A2PBNCSMOCLQMLF',
    variationId: '2JICFMUU6IBBOMFR7IF7ZIXQ',
    variationVersion: '1793743810239',
  },
  {
    name: "Women's Only Class",
    desc: 'A dedicated women-only environment. Supportive, focused, and beginner-friendly.',
    time: 'Fridays · 5:00–6:00 PM',
    level: 'Women Only',
    itemId: 'GJD24AXAVPDC7OX7WXO2UESO',
    variationId: 'BL2SYBITVHONRW6S4Q46556V',
    variationVersion: '1790534008254',
  },
  {
    name: 'Kids Class',
    desc: 'Ages 5–15. Fun, structured classes building confidence, discipline, and self-defence. Led by Black Belt Roger Morais.',
    time: 'Mon–Thu · 5:00–6:00 PM',
    level: 'Ages 5–15',
    itemId: 'RDCFCELC275SBLQLGN2YXUXX',
    variationId: 'UXGTIMUXQ5HW5VWWE5LJZAQ7',
    variationVersion: '1790534008254',
  },
] as const

export type TrialClass = (typeof TRIAL_CLASSES)[number]
