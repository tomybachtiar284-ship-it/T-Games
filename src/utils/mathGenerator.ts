import { Difficulty, MathCategory, Question } from '../types';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Global set to track custom questions shown in the current match session
const shownCustomQuestionIds = new Set<string>();

// Large pool of general knowledge & educational questions for 'umum' category
const GENERAL_KNOWLEDGE_POOL = [
  {
    q: 'Tahun berapakah Indonesia memproklamasikan kemerdekaan?',
    a: '1945',
    exp: 'Indonesia memproklamasikan kemerdekaan pada 17 Agustus 1945 oleh Soekarno-Hatta.',
    d: ['1942', '1950', '1948'],
  },
  {
    q: 'Apakah warna bendera kebangsaan Republik Indonesia?',
    a: 'Merah Putih',
    exp: 'Bendera Sang Saka Merah Putih melambangkan keberanian (merah) dan kesucian (putih).',
    d: ['Merah Kuning', 'Putih Merah', 'Merah Biru'],
  },
  {
    q: 'Berapakah jumlah sudut total pada bangun datar segitiga?',
    a: '180°',
    exp: 'Jumlah ketiga sudut dalam segitiga apa pun selalu 180 derajat.',
    d: ['360°', '90°', '270°'],
  },
  {
    q: 'Siapakah pencipta lagu kebangsaan Indonesia Raya?',
    a: 'W.R. Supratman',
    exp: 'Wage Rudolf Supratman memperdengarkan lagu Indonesia Raya pertama kali pada Kongres Pemuda II (1928).',
    d: ['Ismail Marzuki', 'Kusbini', 'Ibu Soed'],
  },
  {
    q: 'Berapakah jumlah provinsi di Indonesia saat ini?',
    a: '38 Provinsi',
    exp: 'Indonesia terbagi menjadi 38 provinsi setelah pemekaran 4 provinsi baru di Papua pada 2022.',
    d: ['34 Provinsi', '36 Provinsi', '40 Provinsi'],
  },
  {
    q: 'Berapa jumlah hari dalam 1 tahun kabisat?',
    a: '366 Hari',
    exp: 'Tahun kabisat memiliki 366 hari karena bulan Februari berumur 29 hari.',
    d: ['365 Hari', '360 Hari', '364 Hari'],
  },
  {
    q: 'Lambang negara Republik Indonesia adalah...',
    a: 'Garuda Pancasila',
    exp: 'Garuda Pancasila merupakan lambang negara Indonesia dengan semboyan Bhinneka Tunggal Ika.',
    d: ['Harimau Sumatera', 'Gajah Sumatra', 'Komodo'],
  },
  {
    q: 'Sila pertama dalam Pancasila berbunyi...',
    a: 'Ketuhanan Yang Maha Esa',
    exp: 'Sila ke-1 Pancasila disimbolkan dengan Bintang Tunggal.',
    d: ['Kemanusiaan yang Adil dan Beradab', 'Persatuan Indonesia', 'Keadilan Sosial'],
  },
  {
    q: 'Planet manakah yang paling dekat dengan Matahari?',
    a: 'Merkurius',
    exp: 'Merkurius adalah planet terdekat dari Matahari dalam sistem tata surya.',
    d: ['Venus', 'Bumi', 'Mars'],
  },
  {
    q: '1 jam sama dengan berapa detik?',
    a: '3600 Detik',
    exp: '1 jam = 60 menit × 60 detik = 3600 detik.',
    d: ['600 Detik', '1800 Detik', '360 Detik'],
  },
  {
    q: 'Berapakah hasil dari 1/2 + 1/4 = ?',
    a: '3/4',
    exp: 'Samakan penyebut: 2/4 + 1/4 = 3/4.',
    d: ['2/6', '2/4', '1/6'],
  },
  {
    q: 'Alat pernapasan utama pada ikan adalah...',
    a: 'Insang',
    exp: 'Ikan menyerap oksigen dari air melalui organ pernapasan berupa insang.',
    d: ['Paru-paru', 'Trakea', 'Kulit'],
  },
  {
    q: 'Ibu Kota Nusantara (IKN) terletak di provinsi...',
    a: 'Kalimantan Timur',
    exp: 'IKN berlokasi di wilayah Kabupaten Penajam Paser Utara dan Kutai Kartanegara, Kalimantan Timur.',
    d: ['Kalimantan Selatan', 'Kalimantan Barat', 'Kalimantan Tengah'],
  },
  {
    q: 'Berapakah akar kuadrat dari 144 (√144)?',
    a: '12',
    exp: '12 × 12 = 144, sehingga akar dari 144 adalah 12.',
    d: ['14', '16', '11'],
  },
  {
    q: 'Berapakah hasil 25% dari 200?',
    a: '50',
    exp: '25% × 200 = (25/100) × 200 = 50.',
    d: ['25', '75', '40'],
  },
  {
    q: 'Gunung tertinggi di Indonesia adalah Puncak Jaya (Carstensz Pyramid) yang berada di...',
    a: 'Papua',
    exp: 'Puncak Jaya dengan ketinggian 4.884 mdpl berada di pegunungan Sudirman, Papua.',
    d: ['Sumatera', 'Jawa', 'Sulawesi'],
  },
  {
    q: 'Candi Buddha terbesar di dunia yang berada di Magelang, Jawa Tengah adalah...',
    a: 'Candi Borobudur',
    exp: 'Candi Borobudur dibangun pada abad ke-8 oleh wangsa Syailendra.',
    d: ['Candi Prambanan', 'Candi Mendut', 'Candi Sewu'],
  },
  {
    q: 'Berapakah jumlah sisi pada sebuah kubus?',
    a: '6 Sisi',
    exp: 'Kubus memiliki 6 sisi berbentuk persegi yang kongruen.',
    d: ['8 Sisi', '12 Sisi', '4 Sisi'],
  },
  {
    q: 'Berapakah hasil dari 7² (7 pangkat 2)?',
    a: '49',
    exp: '7² = 7 × 7 = 49.',
    d: ['14', '42', '56'],
  },
  {
    q: 'Satuan internasional untuk gaya adalah...',
    a: 'Newton',
    exp: 'Satuan SI gaya adalah Newton (N), dinamai dari fisikawan Sir Isaac Newton.',
    d: ['Joule', 'Watt', 'Pascal'],
  },
  {
    q: 'Berapakah keliling lingkaran jika jari-jari (r) = 7 cm? (π = 22/7)',
    a: '44 cm',
    exp: 'Keliling = 2 × π × r = 2 × (22/7) × 7 = 44 cm.',
    d: ['22 cm', '88 cm', '154 cm'],
  },
  {
    q: 'Jika 3x + 6 = 21, berapakah nilai x?',
    a: '5',
    exp: '3x = 21 - 6 = 15 ➔ x = 15 / 3 = 5.',
    d: ['4', '6', '7'],
  },
  {
    q: 'Hari Kemerdekaan Republik Indonesia diperingati setiap tanggal...',
    a: '17 Agustus',
    exp: '17 Agustus merupakan hari kemerdekaan bangsa Indonesia sejak tahun 1945.',
    d: ['1 Juni', '28 Oktober', '10 November'],
  },
  {
    q: 'Berapakah jumlah rusuk pada bangun ruang balok?',
    a: '12 Rusuk',
    exp: 'Balok memiliki 12 rusuk (4 panjang, 4 lebar, dan 4 tinggi).',
    d: ['8 Rusuk', '6 Rusuk', '16 Rusuk'],
  },
  {
    q: 'Organ tubuh manusia yang berfungsi memompa darah ke seluruh tubuh adalah...',
    a: 'Jantung',
    exp: 'Jantung bertugas memompa darah beroksigen dan nutrisi ke seluruh sistem peredaran darah.',
    d: ['Paru-paru', 'Hati', 'Ginjal'],
  },
];

export function resetSessionCustomQuestions() {
  shownCustomQuestionIds.clear();
}

export function generateQuestion(
  category: MathCategory,
  difficulty: Difficulty,
  customQuestions?: Question[],
  excludeTexts?: string | string[]
): Question {
  // Normalize excludeTexts to an array
  const excludes: string[] = Array.isArray(excludeTexts)
    ? excludeTexts.filter(Boolean)
    : excludeTexts
    ? [excludeTexts]
    : [];

  // 1. CHECK CUSTOM QUESTIONS FIRST
  if (customQuestions && customQuestions.length > 0) {
    // Filter matching custom questions by category
    const matchingCustom = customQuestions.filter(
      (q) => (category === 'campuran' || q.category === category)
    );

    if (matchingCustom.length > 0) {
      // Exclude questions that were recently shown in the current game session
      const availableCustom = matchingCustom.filter(
        (q) => !excludes.includes(q.questionText)
      );

      // Prioritize unshown custom questions in this session
      const unshownCustom = availableCustom.filter(
        (q) => !shownCustomQuestionIds.has(q.id)
      );

      if (unshownCustom.length > 0) {
        const picked = unshownCustom[Math.floor(Math.random() * unshownCustom.length)];
        shownCustomQuestionIds.add(picked.id);
        return {
          ...picked,
          id: `q_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        };
      } else if (availableCustom.length > 0) {
        // If all matching custom questions were shown once, cycle cleanly among remaining unexcluded custom
        // with 50% chance (or 100% if category has only custom questions)
        const pickChance = category === 'umum' ? 0.6 : 0.4;
        if (Math.random() < pickChance || matchingCustom.length >= 5) {
          const picked = availableCustom[Math.floor(Math.random() * availableCustom.length)];
          return {
            ...picked,
            id: `q_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          };
        }
      }
    }
  }

  // 2. STANDARD GENERATOR / CATEGORY BANK
  let chosenCategory = category;
  if (category === 'campuran') {
    const categories: MathCategory[] = [
      'penjumlahan',
      'pengurangan',
      'perkalian',
      'pembagian',
      'pecahan',
      'persentase',
      'bangun_datar',
      'bangun_ruang',
      'logika',
      'pola',
      'umum',
    ];
    chosenCategory = categories[Math.floor(Math.random() * categories.length)];
  }

  let durationSeconds = 15;
  if (difficulty === 'mudah') durationSeconds = 20;
  if (difficulty === 'normal') durationSeconds = 15;
  if (difficulty === 'sulit') durationSeconds = 10;

  let questionText = '';
  let correctAnswer = '';
  let explanation = '';
  let distractors: string[] = [];

  // Generate question according to chosenCategory
  let attempts = 0;
  do {
    attempts++;
    switch (chosenCategory) {
      case 'penjumlahan': {
        let a = getRandomInt(5, 25);
        let b = getRandomInt(5, 25);
        if (difficulty === 'normal') {
          a = getRandomInt(25, 100);
          b = getRandomInt(25, 100);
        } else if (difficulty === 'sulit') {
          a = getRandomInt(100, 500);
          b = getRandomInt(100, 500);
        }
        const ans = a + b;
        questionText = `Berapakah hasil dari ${a} + ${b} = ?`;
        correctAnswer = ans.toString();
        explanation = `${a} + ${b} = ${ans}`;
        distractors = [
          (ans + getRandomInt(1, 5)).toString(),
          (ans - getRandomInt(1, 5)).toString(),
          (ans + 10).toString(),
        ];
        break;
      }

      case 'pengurangan': {
        let a = getRandomInt(10, 50);
        let b = getRandomInt(1, a - 1);
        if (difficulty === 'normal') {
          a = getRandomInt(50, 200);
          b = getRandomInt(10, a - 10);
        } else if (difficulty === 'sulit') {
          a = getRandomInt(200, 1000);
          b = getRandomInt(50, a - 50);
        }
        const ans = a - b;
        questionText = `Berapakah hasil dari ${a} - ${b} = ?`;
        correctAnswer = ans.toString();
        explanation = `${a} - ${b} = ${ans}`;
        distractors = [
          (ans + 2).toString(),
          (ans - 2 > 0 ? ans - 2 : ans + 5).toString(),
          (ans + 10).toString(),
        ];
        break;
      }

      case 'perkalian': {
        let a = getRandomInt(2, 10);
        let b = getRandomInt(2, 10);
        if (difficulty === 'normal') {
          a = getRandomInt(6, 15);
          b = getRandomInt(6, 15);
        } else if (difficulty === 'sulit') {
          a = getRandomInt(12, 25);
          b = getRandomInt(10, 20);
        }
        const ans = a * b;
        questionText = `Berapakah hasil dari ${a} × ${b} = ?`;
        correctAnswer = ans.toString();
        explanation = `${a} dikalikan ${b} sama dengan ${ans}`;
        distractors = [
          (ans + a).toString(),
          (ans - b > 0 ? ans - b : ans + 4).toString(),
          (ans + 6).toString(),
        ];
        break;
      }

      case 'pembagian': {
        let b = getRandomInt(2, 9);
        let ansVal = getRandomInt(2, 10);
        if (difficulty === 'normal') {
          b = getRandomInt(4, 12);
          ansVal = getRandomInt(8, 20);
        } else if (difficulty === 'sulit') {
          b = getRandomInt(6, 15);
          ansVal = getRandomInt(15, 35);
        }
        const a = b * ansVal;
        questionText = `Berapakah hasil dari ${a} ÷ ${b} = ?`;
        correctAnswer = ansVal.toString();
        explanation = `${a} dibagi ${b} = ${ansVal} karena ${b} × ${ansVal} = ${a}`;
        distractors = [
          (ansVal + 1).toString(),
          (ansVal - 1 > 0 ? ansVal - 1 : ansVal + 3).toString(),
          (ansVal + 2).toString(),
        ];
        break;
      }

      case 'pecahan': {
        if (difficulty === 'mudah') {
          const num1 = 1;
          const den = getRandomInt(2, 6);
          const num2 = getRandomInt(1, den - 1);
          const ans = num1 + num2;
          questionText = `Berapakah hasil penjumlahan pecahan ${num1}/${den} + ${num2}/${den} = ?`;
          correctAnswer = `${ans}/${den}`;
          explanation = `Karena penyebut sama (${den}), tinggal menjumlahkan pembilangnya: ${num1} + ${num2} = ${ans}/${den}`;
          distractors = [
            `${ans + 1}/${den}`,
            `${num1 + num2}/${den * 2}`,
            `${ans}/${den + 1}`,
          ];
        } else {
          const factor = getRandomInt(2, 4);
          const baseNum = getRandomInt(1, 3);
          const baseDen = getRandomInt(4, 8);
          const num = baseNum * factor;
          const den = baseDen * factor;
          questionText = `Bentuk paling sederhana dari pecahan ${num}/${den} adalah...`;
          correctAnswer = `${baseNum}/${baseDen}`;
          explanation = `Sederhanakan dengan membagi pembilang dan penyebut dengan ${factor}: ${num}÷${factor} / ${den}÷${factor} = ${baseNum}/${baseDen}`;
          distractors = [
            `${baseNum + 1}/${baseDen}`,
            `${baseNum}/${baseDen + 1}`,
            `${num}/${den + 2}`,
          ];
        }
        break;
      }

      case 'persentase': {
        const p = [10, 20, 25, 50, 75][getRandomInt(0, 4)];
        let total = getRandomInt(2, 10) * 100;
        if (difficulty === 'mudah') total = getRandomInt(1, 5) * 100;
        const ans = (p / 100) * total;
        questionText = `Berapakah ${p}% dari ${total} = ?`;
        correctAnswer = ans.toString();
        explanation = `${p}% × ${total} = (${p}/100) × ${total} = ${ans}`;
        distractors = [
          (ans + 10).toString(),
          (ans - 10 > 0 ? ans - 10 : ans + 20).toString(),
          (ans + 50).toString(),
        ];
        break;
      }

      case 'bangun_datar': {
        const type = getRandomInt(1, 3);
        if (type === 1) {
          const sisi = getRandomInt(3, 12);
          const ans = sisi * sisi;
          questionText = `Sebuah persegi memiliki panjang sisi ${sisi} cm. Luas persegi tersebut adalah...`;
          correctAnswer = `${ans} cm²`;
          explanation = `Luas Persegi = sisi × sisi = ${sisi} × ${sisi} = ${ans} cm²`;
          distractors = [
            `${sisi * 4} cm²`,
            `${ans + 10} cm²`,
            `${ans - 5 > 0 ? ans - 5 : ans + 8} cm²`,
          ];
        } else if (type === 2) {
          const p = getRandomInt(5, 15);
          const l = getRandomInt(3, p - 1);
          const ans = p * l;
          questionText = `Persegi panjang dengan panjang ${p} cm dan lebar ${l} cm memiliki luas...`;
          correctAnswer = `${ans} cm²`;
          explanation = `Luas Persegi Panjang = p × l = ${p} × ${l} = ${ans} cm²`;
          distractors = [
            `${(p + l) * 2} cm²`,
            `${ans + 5} cm²`,
            `${ans - 4 > 0 ? ans - 4 : ans + 12} cm²`,
          ];
        } else {
          const p = getRandomInt(4, 12);
          const l = getRandomInt(2, p - 1);
          const ans = 2 * (p + l);
          questionText = `Keliling persegi panjang dengan panjang ${p} cm dan lebar ${l} cm adalah...`;
          correctAnswer = `${ans} cm`;
          explanation = `Keliling = 2 × (p + l) = 2 × (${p} + ${l}) = 2 × ${p + l} = ${ans} cm`;
          distractors = [
            `${p * l} cm`,
            `${ans + 4} cm`,
            `${ans - 2 > 0 ? ans - 2 : ans + 6} cm`,
          ];
        }
        break;
      }

      case 'bangun_ruang': {
        const type = getRandomInt(1, 2);
        if (type === 1) {
          const r = getRandomInt(2, 6);
          const ans = r * r * r;
          questionText = `Volume kubus yang memiliki panjang rusuk ${r} cm adalah...`;
          correctAnswer = `${ans} cm³`;
          explanation = `Volume Kubus = r × r × r = ${r}³ = ${ans} cm³`;
          distractors = [
            `${r * r * 6} cm³`,
            `${ans + 12} cm³`,
            `${r * 12} cm³`,
          ];
        } else {
          const p = getRandomInt(4, 8);
          const l = getRandomInt(2, 5);
          const t = getRandomInt(2, 5);
          const ans = p * l * t;
          questionText = `Sebuah balok memiliki ukuran p = ${p} cm, l = ${l} cm, dan t = ${t} cm. Volume balok adalah...`;
          correctAnswer = `${ans} cm³`;
          explanation = `Volume Balok = p × l × t = ${p} × ${l} × ${t} = ${ans} cm³`;
          distractors = [
            `${(p + l + t) * 2} cm³`,
            `${ans + 10} cm³`,
            `${ans - 8 > 0 ? ans - 8 : ans + 15} cm³`,
          ];
        }
        break;
      }

      case 'pola': {
        const start = getRandomInt(2, 10);
        const step = getRandomInt(3, 7);
        const seq = [start, start + step, start + step * 2, start + step * 3];
        const nextVal = start + step * 4;
        questionText = `Lanjutkan pola bilangan berikut: ${seq.join(', ')}, ...`;
        correctAnswer = nextVal.toString();
        explanation = `Pola bertambah +${step} setiap langkah. ${seq[3]} + ${step} = ${nextVal}`;
        distractors = [
          (nextVal + step).toString(),
          (nextVal - 1).toString(),
          (nextVal + 2).toString(),
        ];
        break;
      }

      case 'logika': {
        const buahAwal = getRandomInt(15, 30);
        const beliLagi = getRandomInt(10, 20);
        const bagikan = getRandomInt(5, 15);
        const ans = buahAwal + beliLagi - bagikan;
        questionText = `Budi membawa ${buahAwal} bendera kecil, lalu membeli ${beliLagi} bendera lagi. Setelah dibagikan ${bagikan} bendera ke temannya, sisa bendera Budi adalah...`;
        correctAnswer = `${ans} bendera`;
        explanation = `${buahAwal} + ${beliLagi} - ${bagikan} = ${ans} bendera`;
        distractors = [
          `${ans + 5} bendera`,
          `${ans - 3 > 0 ? ans - 3 : ans + 8} bendera`,
          `${buahAwal + beliLagi} bendera`,
        ];
        break;
      }

      case 'umum':
      default: {
        const availablePool = GENERAL_KNOWLEDGE_POOL.filter(
          (item) => !excludes.includes(item.q)
        );
        const pool = availablePool.length > 0 ? availablePool : GENERAL_KNOWLEDGE_POOL;
        const item = pool[getRandomInt(0, pool.length - 1)];
        questionText = item.q;
        correctAnswer = item.a;
        explanation = item.exp;
        distractors = item.d;
        break;
      }
    }
  } while (excludes.includes(questionText) && attempts < 5);

  // Ensure unique option texts
  const optionsSet = new Set<string>();
  optionsSet.add(correctAnswer);
  distractors.forEach((d) => {
    if (d !== correctAnswer && optionsSet.size < 4) {
      optionsSet.add(d);
    }
  });

  // Fill up if still less than 4 unique
  let fallbackCount = 1;
  while (optionsSet.size < 4) {
    optionsSet.add(`${correctAnswer} (${fallbackCount++})`);
  }

  const shuffledOptions = shuffleArray(Array.from(optionsSet));
  const correctIdx = shuffledOptions.indexOf(correctAnswer);

  return {
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    category: chosenCategory,
    difficulty,
    questionText,
    options: shuffledOptions,
    correctAnswerIndex: correctIdx,
    explanation,
    points: 100,
    durationSeconds,
  };
}
