/* =========================================================================
   DỮ LIỆU ĐỀ + HÀM TẠO CÂU HỎI NHANH

   CÁCH THÊM ĐỀ MỚI ĐỂ CHIA SẺ:
   1. Tạo file mới, ví dụ de-2.js (copy cấu trúc "window.EXAM_SETS.push({...})" ở dưới).
   2. Trong index.html, thêm dòng <script src="de-2.js"></script>
      ngay SAU exams.js và TRƯỚC app.js.
   3. Gửi cả thư mục cho bạn bè là mở index.html chạy được ngay.

   HÀM TẠO CÂU HỎI (đã khai báo sẵn bên dưới, dùng được ở file đề khác):
   - mcq(id, đề, [4 lựa chọn], 'D', 'ghi chú')   → Part 1 trắc nghiệm
   - morph(id, từ, 'B-F-B', 'pre- pay -ment')     → Part 2 hình vị tự do/ràng buộc
   - cls(id, câu có {từ cần xét}, 'CpW')          → Part 3 phân loại từ
   - bound(id, '[bio]logy [bio]graphy', ['LIFE','LIVE'], 'life / live') → Part 4
   ========================================================================= */

window.EXAM_SETS = window.EXAM_SETS || [];

const mcq = (id, prompt, opts, ans, note) => {
  const options = opts.map((t, i) => `${'ABCD'[i]}. ${t}`);
  const shown = options['ABCD'.indexOf(ans)];
  return { id, part: 1, type: 'mcq', prompt, options, accepted: [ans],
           displayAnswer: note ? `${shown} (${note})` : shown };
};

const morph = (id, word, ans, parts) => ({
  id, part: 2, type: 'text', prompt: word,
  placeholder: 'Nhập dạng F/B, ví dụ: F-B-F',   // gợi ý chung, KHÔNG lộ đáp án
  quickChips: ['F', 'B', '-'],
  accepted: [ans], displayAnswer: `${ans} (${parts})`
});

const cls = (id, sentence, ans) => ({
  id, part: 3, type: 'text',
  prompt: sentence.replace(/\{(.+?)\}/g, '<span class="target-highlight">$1</span>'),
  placeholder: 'Chọn hoặc nhập: S, C-FB, C-BB, CpW, GS',
  quickChips: ['S', 'C-FB', 'C-BB', 'CpW', 'GS'], isSingleChoiceChip: true,
  accepted: [ans.toUpperCase()], displayAnswer: ans
});

const bound = (id, words, accepted, disp) => ({
  id, part: 4, type: 'text',
  prompt: '<div class="word-list-row">' + words.split(' ').map(w =>
    '<span>' + w.replace(/\[(.+?)\]/g, '<span class="base-underline">$1</span>') + '</span>').join('') + '</div>',
  placeholder: 'Nhập nghĩa tiếng Anh của gốc từ được gạch chân...',   // KHÔNG lộ đáp án
  accepted, displayAnswer: disp
});

window.EXAM_SETS.push({
  id: 'morphology-de-1',
  title: 'Đề 1: English Morphology (50 câu chuẩn)',
  parts: {
    1: { title: 'PART 1: MULTIPLE CHOICE (TRẮC NGHIỆM)',
         desc: 'Chọn đáp án đúng nhất cho các câu hỏi lý thuyết và phân tích hình vị (Câu 1 – 15).' },
    2: { title: 'PART 2: IDENTIFY FREE AND BOUND MORPHEMES',
         desc: 'Tách từ thành các hình vị và xác định hình vị tự do (F) hay ràng buộc (B). Ví dụ: disrespected → B-F-B (Câu 16 – 30).' },
    3: { title: 'PART 3: WORD CLASSIFICATION',
         desc: 'Xác định biểu thức được tô xanh/in nghiêng là: S (Simple), C-FB (Complex - Free Base), C-BB (Complex - Bound Base), CpW (Compound Word), hay GS (Grammatical Structure) (Câu 31 – 45).' },
    4: { title: 'PART 4: MEANING OF UNDERLINED BOUND BASES',
         desc: 'Viết nghĩa tiếng Anh của gốc từ ràng buộc (bound base) được gạch chân trong nhóm từ (Câu 46 – 50).' }
  },
  questions: [
    // PART 1
    mcq(1, 'How many morphemes are there in the word “undesirability”?', ['Five', 'Six', 'Three', 'Four'], 'D', 'un- + desire + -able + -ity'),
    mcq(2, 'Which statement is NOT true about derivational morphemes?',
        ['They always change the word class', 'They can be prefixes or suffixes', 'They can change the meaning of a word', 'They usually occur before inflectional morphemes'], 'A'),
    mcq(3, 'What is a simple word (SW)?',
        ['Is a grammatical structure', 'Has two free bases with or without inflection', 'Contains at least one bound morpheme', 'Has a single free form with or without inflection'], 'D'),
    mcq(4, 'How many morphemes are in "dislikes"?', ['One', 'Four', 'Three', 'Two'], 'C', 'dis- + like + -s'),
    mcq(5, 'In the word “intercontinental”, which division occurs first?', ['con- | tinent', 'inter- | continental', 'intercontinent | -al', 'continent | -al'], 'B'),
    mcq(6, 'The suffix "-ment" (as in "development") is primarily used to form:', ['Adjectives', 'Nouns', 'Adverbs', 'Verbs'], 'B'),
    mcq(7, 'In "antedate," the prefix "ante-" means:', ['Before', 'Again', 'Under', 'Against'], 'A'),
    mcq(8, 'Which of the following words contains a derivational morpheme?', ['Runs', 'Tallest', 'Singer', 'Playing'], 'C', 'sing + -er'),
    mcq(9, 'Which of the following suffixes typically forms an adjective meaning "without"?', ['-ish', '-less', '-ful', '-ous'], 'B'),
    mcq(10, 'What does {-LY1} represent?', ['Inflectional adverb', 'Adjective from time noun', 'Derivational noun', 'Adverb formation'], 'A'),
    mcq(11, 'The word "friendship" is classified as a:', ['Complex word (C-BB)', 'Compound word', 'Simple word', 'Complex word (C-FB)'], 'D'),
    mcq(12, 'How does a grammatical structure differ from a compound?',
        ['GS shows relationships like possession; compounds fuse meanings', 'GS has function words; compounds do not', 'All of the answers', 'Compounds are written as one word; GS has spaces'], 'C'),
    mcq(13, 'The word "reinvested" is an example of a:', ['Compound word', 'Simple word', 'Complex word', 'Derived word'], 'C'),
    mcq(14, 'What is a compound word (CpW)?', ['At least two free bases', 'Bound base only', 'Inflectional form', 'One free base + bound morpheme'], 'A'),
    mcq(15, 'In the word “irregularly”, which division occurs first?', ['irregular | -ly', 'ir- | regularly', 'irregul | -arly', 'regul | -ar'], 'A'),

    // PART 2
    morph(16, 'government', 'F-B', 'govern -ment'),
    morph(17, 'prepayment', 'B-F-B', 'pre- pay -ment'),
    morph(18, 'dishonesty', 'B-F-B', 'dis- honest -y'),
    morph(19, 'enjoyment', 'B-F-B', 'en- joy -ment'),
    morph(20, 'treatment', 'F-B', 'treat -ment'),
    morph(21, 'uncover', 'B-F', 'un- cover'),
    morph(22, 'notebooks', 'F-F-B', 'note book -s'),
    morph(23, 'reactivation', 'B-F-B-B', 're- act -ive -ation'),
    morph(24, 'productive', 'F-B', 'product -ive'),
    morph(25, 'encouragement', 'B-F-B', 'en- courage -ment'),
    morph(26, 'nationalize', 'F-B-B', 'nation -al -ize'),
    morph(27, 'modernize', 'F-B', 'modern -ize'),
    morph(28, 'deforestation', 'B-F-B', 'de- forest -ation'),
    morph(29, 'receptionist', 'B-B-B-B', 're- cept -ion -ist'),
    morph(30, 'unpredictable', 'B-B-B-B', 'un- pre- dict -able'),

    // PART 3
    cls(31, "His {breakthrough} wasn't recognized until the 1990s.", 'CpW'),
    cls(32, 'Check-out is at 11 AM, so we need to {check out} of our room by then.', 'GS'),
    cls(33, 'He read a {newspaper} article.', 'CpW'),
    cls(34, 'Studying {abroad} is a wonderful opportunity to learn about a new culture.', 'S'),
    cls(35, '{Students} must submit their homework by tomorrow.', 'S'),
    cls(36, 'My parents are celebrating their 30th wedding {anniversary} with a trip to Italy.', 'S'),
    cls(37, 'They built a {subway} system in the city.', 'C-FB'),
    cls(38, 'The {football} match was exciting.', 'CpW'),
    cls(39, 'The {darkness} of the cave was frightening.', 'C-FB'),
    cls(40, 'The {Japanese} invented the rice cooker in 1923.', 'C-FB'),
    cls(41, 'He acted with great {carelessness}.', 'C-FB'),
    cls(42, 'Our {classroom} is on the second floor.', 'CpW'),
    cls(43, 'I admire his {leadership}.', 'C-FB'),
    cls(44, 'She made an {argument} in class.', 'C-FB'),
    cls(45, 'We saw a sudden {flash of light} in the sky.', 'GS'),

    // PART 4
    bound(46, '[bio]logy [bio]graphy [bio]sphere anti[bio]tic', ['LIVE', 'LIFE', 'LIVE / LIFE'], 'live / life'),
    bound(47, '[mort]uary [mort]al [mori]bund im[mort]al', ['DEATH', 'DIE', 'DEATH / DIE'], 'death / die'),
    bound(48, '[cred]it in[cred]ible [cred]ence [cred]itor', ['BELIEVE', 'TRUST', 'BELIEVE / TRUST'], 'believe / trust'),
    bound(49, '[port]able ex[port] im[port] trans[port]', ['CARRY'], 'carry'),
    bound(50, '[dict]ation [dict]ionary pre[dict] contra[dict]', ['SAY', 'SPEAK', 'TALK', 'SAY / SPEAK / TALK'], 'say / speak / talk')
  ]
});
