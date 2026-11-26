/* =========================================================================
   ĐỀ CUỐI KỲ (MÔ PHỎNG) - 45 câu
   Part 1 (1-20)   : trắc nghiệm                       → 4.0 điểm
   Part 2 (21-30)  : Task 1 - quá trình tạo từ         → 2.0 điểm
   Part 3 (31-40)  : Task 2 - phân loại cấu trúc       → 2.0 điểm
   Part 4 (41-45)  : cây hình vị (chấm từng mục)       → 2.0 điểm  (đề thật có thể là 1.5)
   Muốn đổi điểm: sửa partPoints bên dưới. Đổi giờ thi: sửa timeLimit (phút).
   ========================================================================= */

// Task 1: ký hiệu BL / BF / BR / AC / CL / CN
const wf = (id, word, ans, note) => ({
  id, part: 2, type: 'text',
  prompt: `<span class="target-highlight">${word}</span>`,
  placeholder: 'Chọn hoặc nhập ký hiệu: BL, BF, BR, AC, CL, CN',
  quickChips: ['BL', 'BF', 'BR', 'AC', 'CL', 'CN'], isSingleChoiceChip: true,
  accepted: [ans], displayAnswer: note ? `${ans} (${note})` : ans
});

// Cây hình vị: nhiều đáp án được chấp nhận → truyền thêm cây vào cuối
const treeQ = (id, word, ...answers) => ({
  id, part: 4, type: 'tree', word, answers, accepted: [], displayAnswer: '',
  prompt: `Vẽ cây hình vị cho từ: <span class="target-highlight">${word}</span>`
});

window.EXAM_SETS.push({
  id: 'final-mock-1',
  title: 'Cuối kỳ: Mock Final Exam (45 câu)',
  timeLimit: 60,
  partPoints: { 1: 4, 2: 2, 3: 2, 4: 2 },
  parts: {
    1: { title: 'PART 1: MULTIPLE-CHOICE QUESTIONS (4.0 pts)',
         desc: '20 câu trắc nghiệm, mỗi câu 0.2 điểm (Câu 1 – 20).' },
    2: { title: 'PART 2 – TASK 1: WORD FORMATION PROCESSES (2.0 pts)',
         desc: 'Chỉ ghi ký hiệu: BL (Blending), BF (Back-formation), BR (Borrowing), AC (Acronym), CL (Clipping), CN (Coinage). Viết tên đầy đủ sẽ không được điểm (Câu 21 – 30).' },
    3: { title: 'PART 2 – TASK 2: WORD STRUCTURE CLASSIFICATION (2.0 pts)',
         desc: 'Phân loại cấu trúc được tô xanh: S, C-FB, C-BB, CpW (Compound Word), GS (Grammatical Structure) (Câu 31 – 40).' },
    4: { title: 'PART 3: MORPHOLOGICAL TREE DIAGRAM (2.0 pts)',
         desc: 'Dựng cây hình vị cho 5 từ: ① bấm khe để tách → ② bấm 2 mảnh kề nhau để ghép → ③ gán nhãn Pref/Root/Suff/Infl, từ loại, chính tả từ ghép (Câu 41 – 45).' }
  },
  questions: [
    // Part 1: câu 1-15 lấy lại từ đề giữa kỳ
    ...window.EXAM_SETS[0].questions.slice(0, 15),
    mcq(16, 'Which of the following words contains a bound base?', ['Kingdom', 'Revise', 'Friendship', 'Childhood'], 'B', 're- + -vise'),
    mcq(17, 'The word "smog" (from smoke + fog) is formed by the process of:', ['Clipping', 'Acronym', 'Blending', 'Back-formation'], 'C'),
    mcq(18, 'Which of the following is an inflectional suffix in English?', ['-ness', '-er (in teacher)', '-est (in fastest)', '-ize'], 'C'),
    mcq(19, 'What is the base of the word "nationalization"?', ['nation', 'national', 'nationalize', '-ize'], 'C'),
    mcq(20, 'Which word has the structure B-F-B?', ['Government', 'Dishonesty', 'Notebooks', 'Modernize'], 'B', 'dis- + honest + -y'),

    // Part 2 - Task 1
    wf(21, 'kindergarten', 'BR', 'German'),
    wf(22, 'brunch', 'BL', 'breakfast + lunch'),
    wf(23, 'toilet', 'BR', 'French'),
    wf(24, 'radar', 'AC', 'radio detection and ranging'),
    wf(25, 'UNESCO', 'AC'),
    wf(26, 'bamboo', 'BR', 'Malay'),
    wf(27, 'sandwich', 'CN', 'eponym - Earl of Sandwich'),
    wf(28, 'hamburger', 'BR', 'German'),
    wf(29, 'zipper', 'CN', 'brand name'),
    wf(30, 'boycott', 'CN', 'eponym - Charles Boycott'),

    // Part 2 - Task 2
    cls(31, "His {breakthrough} wasn't recognized until the 1990s.", 'CpW'),
    cls(32, 'Check-out is at 11 AM, so we need to {check out} of our room by then.', 'GS'),
    cls(33, 'He read a {newspaper} article.', 'CpW'),
    cls(34, 'Studying {abroad} is a wonderful opportunity to learn about a new culture.', 'S'),
    cls(35, '{Students} must submit their homework by tomorrow.', 'S'),
    cls(36, 'The children played on the {playground}.', 'CpW'),
    cls(37, 'She looked at him with a {know-it-all} expression.', 'CpW'),
    cls(38, 'Please paint that {white board} for the art project.', 'GS'),
    cls(39, 'We must {break up} this fight immediately.', 'GS'),
    cls(40, 'The artist used a deep {blue berry} color in the painting.', 'GS'),

    // Part 3 - cây hình vị
    treeQ(41, 'dislikes',
      Join('dislikes', 'V', Join('dislike', 'V', Pref('dis-'), Root('like', 'V')), Infl('-s'))),
    treeQ(42, 'reception',
      Join('reception', 'N', Join('receive', 'V', Pref('re-'), Root('-ceive-')), Suff('-ion', 'N'))),
    treeQ(43, 'undesirability',
      Join('undesirability', 'N',
        Join('undesirable', 'ADJ', Pref('un-'), Join('desirable', 'ADJ', Root('desire|desir', 'V'), Suff('-able', 'ADJ'))),
        Suff('-ity', 'N'))),
    treeQ(44, 'intercontinental',
      Join('intercontinental', 'ADJ', Pref('inter-'), Join('continental', 'ADJ', Root('continent', 'N'), Suff('-al', 'ADJ')))),
    treeQ(45, 'unpredictable',
      Join('unpredictable', 'ADJ', Pref('un-'),
        Join('predictable', 'ADJ', Join('predict', 'V', Pref('pre-'), Root('-dict-')), Suff('-able', 'ADJ'))))
  ]
});
