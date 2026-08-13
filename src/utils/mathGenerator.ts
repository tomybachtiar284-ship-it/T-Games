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

export function generateQuestion(category: MathCategory, difficulty: Difficulty): Question {
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
        // Simple visual fraction
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
        // Simplifying fraction or basic multiplication
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
        // Persegi
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
        // Persegi Panjang
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
        // Keliling persegi panjang
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
        // Volume Kubus
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
        // Volume Balok
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

    case 'logika': {
      const type = getRandomInt(1, 2);
      if (type === 1) {
        // Pola Angka
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
      } else {
        // Soal Cerita Sederhana (Kemerdekaan / Sekolah)
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
      }
      break;
    }
  }

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
    id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
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
