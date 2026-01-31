export const en = {
  common: {
    bismillah: 'In the name of GOD, the Most Gracious, the Most Merciful',
    siteName: 'Awaiters of Mahdi',
    siteSubtitle: 'Awaiting the reappearance of Imam Mahdi (may God hasten his return)',
    back: 'Back',
    enter: 'Enter',
    total: 'Total',
    remaining: 'Remaining',
    wait: 'Wait',
    seconds: 'seconds',
    cooldown: 'Wait: {{seconds}}s',
    remainingRequests: 'Remaining: {{count}} requests',
    ready: 'Ready',
    days: 'days',
    hours: 'hours',
    minutes: 'minutes',
    error: {
      rateLimit: 'Rate limit reached',
      rateLimitMessage: 'Please wait before sending more prayers',
      connection: 'Server connection error',
      increment: 'Error incrementing counter',
    },
    footer: {
      prayer: 'O Allah, send blessings upon Muhammad and the family of Muhammad',
      copyright: '© {{year}} Awaiters of Mahdi - All rights reserved',
    },
  },
  home: {
    selectPrayer: 'Choose',
    selectSubtitle: 'Select your prayer or invocation',
    salawat: {
      title: 'Salawat',
      description: 'Send blessings upon the Prophet and his family',
    },
    duaFaraj: {
      title: 'Dua Faraj',
      description: 'Prayer for the reappearance of Imam Mahdi',
    },
    duaKhasa: {
      title: 'Special Dua',
      description: 'Special prayer dedicated to Imam Mahdi',
    },
  },
  salawat: {
    title: 'Salawat',
    subtitle: 'Salawat - Blessings upon the Prophet and his family',
    sendSalawat: 'Send Salawat',
    about: 'About Salawat',
    description: 'Salawat is a prayer of blessings upon Prophet Muhammad (peace be upon him) and his family (Ahl al-Bayt). It is considered one of the most virtuous deeds in Islam and brings numerous blessings and rewards to the believer.',
    arabicText: 'اللهم صل علی محمد و آل محمد',
    countdown: 'Countdown to Blessed Ramadan',
    of: 'of',
    target: 'target',
    rateLimitToast: 'Rate limit reduced! Please wait {seconds} seconds. {remaining} attempts remaining',
    floatingTitle: 'Salawat',
  },
  duaFaraj: {
    title: 'Dua Faraj',
    subtitle: 'Dua Faraj - Prayer for the Reappearance of Imam Mahdi',
    reciteDua: 'Recite Dua Faraj',
    about: 'About Dua Faraj',
    description: 'This powerful dua is recited to hasten the reappearance of Imam al-Mahdi (may Allah hasten his noble return). It expresses devotion and supplication for the guidance and protection of the Imam during his occultation.',
    arabicText: `اَللّٰهُمَّ كُنْ لِوَلِیِّكَ الْحُجَّةِ بْنِ الْحَسَنِ صَلَواتُكَ عَلَیْهِ وَعَلى آبائِهِ فِی هٰذِهِ السّاعَةِ وَفی کُلِّ ساعَةٍ وَلیًّا وَحافِظاً وَقائِداً وَناصِراً وَدَلیلاً وَعَیْناً حَتّى تُسْكِنَهُ أَرْضَكَ طَوْعاً وَتُمَتِّعَهُ فیها طَویلاً. اَللّٰهُمَّ صَلِّ عَلَی مُحَمَّدٍ وَآلِ مُحَمَّدٍ`,
    translation: `O Allah, be, for Your representative, the Hujjah (proof), son of Hasan, Your blessings be on him and his forefathers, in this hour and in every hour, a guardian, a protector, a leader, a guide, a witness, and a proof, until You make him reside on Your earth, by Your command, and make him enjoy it for a long time. O Allah, send blessings upon Muhammad and the family of Muhammad.`,
  },
  duaKhasa: {
    title: 'Special Dua',
    subtitle: 'Special Dua - Prayer dedicated to Imam Mahdi',
    reciteDua: 'Recite Special Dua',
    about: 'About Special Dua',
    description: 'This special dua is dedicated to Imam al-Mahdi (may Allah hasten his noble return). It is a heartfelt supplication seeking relief, guidance, and protection for the Imam and all believers during the period of occultation.',
    arabicText: `اَللّٰهُمَّ یامَنْ لایَخْفی عَلَیْهِ شَیْءٌ فِی الْأَرْضِ وَلَا فِی السَّماءِ
اَللّٰهُمَّ صَلِّ عَلٰى مُحَمَّدٍ وَآلِ مُحَمَّدٍ وَعَجِّلْ فَرَجَهُمْ
اَللّٰهُمَّ اكْشِفْ عَنْهُمُ الْغُمُومَ وَالْهُمُومَ
وَاصْرِفْ عَنْهُمُ السُّوءَ وَاللَّغْطَ
وَاجْعَلْ لَهُمْ مِنْ كُلِّ ضِيقٍ مَخْرَجاً
وَمِنْ كُلِّ فَرَجٍ سَبَباً
یاأَرْحَمَ الرّاحِمینَ`,
    translation: `O Allah, He from Whom nothing is hidden in the earth and in the heavens
O Allah, send blessings upon Muhammad and the family of Muhammad, and hasten their relief
O Allah, remove from them sorrows and anxieties
And turn away from them evil and confusion
And make for them a way out from every distress
And a cause from every relief
O Most Merciful of the merciful`,
  },
} as const

export type EnTranslations = typeof en
