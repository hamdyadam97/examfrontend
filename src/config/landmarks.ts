/**
 * Jordanian landmark photos shown on the home and auth pages. Files live in public/images/jordan and
 * come from Wikimedia Commons; their licenses require the credit shown under each photo.
 */
export interface Landmark {
  key: 'petra' | 'citadel' | 'wadirum' | 'jerash' | 'theatre';
  src: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
}

export const landmarks: Landmark[] = [
  {
    key: 'petra',
    src: '/images/jordan/petra.jpg',
    author: 'Vyacheslav Argenberg',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Al-Khazneh_(The_Treasury)_2,_Petra,_Jordan.jpg',
  },
  {
    key: 'citadel',
    src: '/images/jordan/citadel.jpg',
    author: 'Carole Raddato',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
    source:
      'https://commons.wikimedia.org/wiki/File:The_Temple_of_Hercules,_built_between_162_and_166_AD_when_Geminius_Marcianus_was_governor_of_the_Province_of_Arabia,_Amman_Citadel,_Jordan_(39354517162).jpg',
  },
  {
    key: 'wadirum',
    src: '/images/jordan/wadirum.jpg',
    author: 'Jorge Láscar',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    source: 'https://commons.wikimedia.org/wiki/File:Wadi_Rum_landscape_and_a_camel_(12465347644).jpg',
  },
  {
    key: 'jerash',
    src: '/images/jordan/jerash.jpg',
    author: 'Arian Zwegers',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    source: 'https://commons.wikimedia.org/wiki/File:Jerash,_Oval_Plaza_(6738144433).jpg',
  },
  {
    key: 'theatre',
    src: '/images/jordan/theatre.jpg',
    author: 'Bernard Gagnon',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Roman_theater_of_Amman_01.jpg',
  },
];
