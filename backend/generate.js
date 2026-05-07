require('dotenv').config();
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function buildOptions(correct, wrongList) {
  let opts = [correct.toString(), ...wrongList.map(w => w.toString())];
  opts = shuffleArray(opts);
  const keys = ['A', 'B', 'C', 'D'];
  const optionsObj = {};
  let correctKey = 'A';
  opts.forEach((opt, idx) => {
    optionsObj[keys[idx]] = opt;
    if (opt === correct.toString()) correctKey = keys[idx];
  });
  return { options: optionsObj, correct: correctKey };
}

async function generateSqlSeed() {
  const { data: categories } = await supabase.from('categories').select('*');
  if (!categories || categories.length === 0) return console.log("No categories found");

  const newQuestions = [];

  for (const cat of categories) {
    for (let i = 1; i <= 50; i++) {
      let q, correct, w1, w2, w3;

      if (cat.slug === 'toan-tieu-hoc') {
        const a = Math.floor(Math.random() * 50) + 1;
        const b = Math.floor(Math.random() * 50) + 1;
        q = `Kết quả của ${a} + ${b} là?`;
        correct = a + b;
        w1 = correct + 1; w2 = correct - 1; w3 = correct + 10;
      } 
      else if (cat.slug === 'toan-thcs') {
        const x = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const res = 2 * x + b;
        q = `Tìm x biết: 2x + ${b} = ${res}`;
        correct = x;
        w1 = x + 1; w2 = x - 1; w3 = x * 2;
      }
      else if (cat.slug === 'lich-su-dia-ly') {
        q = `Câu hỏi lịch sử/địa lý số ${i} liên quan đến đặc điểm của Trái Đất/Việt Nam?`;
        correct = `Đáp án đúng ${i}`;
        w1 = `Đáp án sai 1`; w2 = `Đáp án sai 2`; w3 = `Đáp án sai 3`;
      }
      else if (cat.slug === 'tieng-anh-co-ban') {
        q = `Which word is the closest meaning to "Word${i}"?`;
        correct = `CorrectMeaning${i}`;
        w1 = `WrongMeaning1`; w2 = `WrongMeaning2`; w3 = `WrongMeaning3`;
      }
      else {
        q = `Câu hỏi nghiệp vụ Công Tác số ${i}?`;
        correct = `Đúng ${i}`;
        w1 = `Sai A`; w2 = `Sai B`; w3 = `Sai C`;
      }

      const { options, correct: correctKey } = buildOptions(correct, [w1, w2, w3]);

      newQuestions.push({
        category_id: cat.id,
        question_text: q.replace(/'/g, "''"),
        option_a: options.A.replace(/'/g, "''"),
        option_b: options.B.replace(/'/g, "''"),
        option_c: options.C.replace(/'/g, "''"),
        option_d: options.D.replace(/'/g, "''"),
        correct_option: correctKey,
        hint: `Gợi ý giải bài cho câu ${i}`.replace(/'/g, "''")
      });
    }
  }

  let sqlString = 'INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_option, hint) VALUES \n';
  
  const values = newQuestions.map(q => {
    return `('${q.category_id}', '${q.question_text}', '${q.option_a}', '${q.option_b}', '${q.option_c}', '${q.option_d}', '${q.correct_option}', '${q.hint}')`;
  });

  sqlString += values.join(',\n') + ';';

  fs.writeFileSync('seed_questions.sql', sqlString);
  console.log(`Successfully generated seed_questions.sql with ${newQuestions.length} questions!`);
}

generateSqlSeed();
