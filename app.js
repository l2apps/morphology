/* =========================================================================
   LOGIC ỨNG DỤNG - English Morphology Practice
   Dữ liệu đề nằm ở exams.js (window.EXAM_SETS)
   ========================================================================= */

const STORAGE_KEY_CUSTOM_EXAMS = 'morphology_custom_exams_v1';
const BUILTIN_EXAMS = window.EXAM_SETS || [];

let allExamSets = [...BUILTIN_EXAMS];
let currentExamIndex = 0;
let currentQuestions = [];
let userAnswers = {};
let checkedState = {};
let bookmarks = {};
let mode = 'practice';      // 'practice' | 'exam'
let activeFilter = 'all';   // 'all' | 'unanswered' | 'wrong' | 'bookmarked'
let isSubmitted = false;
let isShuffled = false;
let timerSeconds = 0;
let timerInterval = null;

const $ = (id) => document.getElementById(id);

/* ---------- LƯU TRỮ ---------- */
function loadCustomExams() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_EXAMS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) allExamSets = [...BUILTIN_EXAMS, ...parsed];
    }
  } catch (e) {
    console.warn('Không thể tải bộ đề đã lưu:', e);
  }
}

function saveCustomExams(list) {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_EXAMS, JSON.stringify(list));
  } catch (e) {
    showToast('Không thể lưu vào trình duyệt (bộ nhớ đầy hoặc bị chặn).');
  }
}

function renderExamSelector() {
  const select = $('examSelector');
  select.innerHTML = '';
  allExamSets.forEach((exam, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = `${exam.title} (${exam.questions.length} câu)`;
    opt.selected = idx === currentExamIndex;
    select.appendChild(opt);
  });
}

function initExam(index) {
  currentExamIndex = index;
  currentQuestions = allExamSets[index].questions.map(q => ({ ...q }));
  userAnswers = {};
  checkedState = {};
  bookmarks = {};
  isSubmitted = false;
  isShuffled = false;
  activeFilter = 'all';
  $('resultBanner').classList.remove('visible');
  updateFilterTabUI();
  resetTimer();
  renderAll();
}

/* ---------- ĐỒNG HỒ ---------- */
function updateTimerDisplay() {
  const m = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const s = String(timerSeconds % 60).padStart(2, '0');
  const ex = allExamSets[currentExamIndex];
  const lim = (mode === 'exam' && ex && ex.timeLimit) ? ` / ${ex.timeLimit}:00` : '';
  $('timerDisplay').textContent = `${m}:${s}${lim}`;
}
function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    timerSeconds++;
    updateTimerDisplay();
    const ex = allExamSets[currentExamIndex];
    if (mode === 'exam' && !isSubmitted && ex && ex.timeLimit && timerSeconds >= ex.timeLimit * 60) {
      showToast('Hết giờ! Bài được nộp tự động.');
      submitAndGradeAll();
    }
  }, 1000);
}
function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}
function resetTimer() {
  stopTimer();
  timerSeconds = 0;
  updateTimerDisplay();
  startTimer();
}

/* ---------- CHẤM ĐÁP ÁN ---------- */
function normalizeText(str) {
  return String(str || '')
    .trim()
    .toUpperCase()
    .replace(/[.,;!]+$/, '')     // bỏ dấu câu cuối ("life." → "LIFE")
    .replace(/^TO\s+/, '')       // bỏ "to" đầu ("to carry" → "CARRY")
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ');
}

function questionScore(q, ans) {
  if (q.type === 'tree') return ans ? gradeTree(q, ans).score : 0;
  return isQuestionCorrect(q, ans) ? 1 : 0;
}

function isQuestionCorrect(q, rawAns) {
  if (q.type === 'tree') return !!rawAns && gradeTree(q, rawAns).score === 1;
  if (!rawAns || !rawAns.trim()) return false;
  const user = normalizeText(rawAns);
  return q.accepted.some(acc => normalizeText(acc) === user);
}

function isQuestionRevealed(qId) {
  return isSubmitted || (mode === 'practice' && !!checkedState[qId]);
}

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ---------- RENDER ---------- */
function renderAll() {
  updateTimerDisplay();
  renderQuestions();
  renderSidebarNav();
  updateStats();
}

function renderQuestions() {
  const container = $('questionsContainer');
  const exam = allExamSets[currentExamIndex];
  container.innerHTML = '';
  let lastPart = null;
  let visible = 0;

  currentQuestions.forEach((q) => {
    const userAns = userAnswers[q.id] || '';
    const revealed = isQuestionRevealed(q.id);
    const correct = revealed ? isQuestionCorrect(q, userAns) : null;

    if (activeFilter === 'unanswered' && userAns.trim() !== '') return;
    if (activeFilter === 'wrong' && !(revealed && correct === false)) return;
    if (activeFilter === 'bookmarked' && !bookmarks[q.id]) return;
    visible++;

    // Banner Part: chỉ hiện khi xem tất cả và KHÔNG xáo trộn
    if (activeFilter === 'all' && !isShuffled && q.part !== lastPart && exam.parts && exam.parts[q.part]) {
      lastPart = q.part;
      const banner = document.createElement('div');
      banner.className = 'part-banner';
      banner.innerHTML = `<div class="part-title">${exam.parts[q.part].title}</div>
                          <div class="part-desc">${exam.parts[q.part].desc}</div>`;
      container.appendChild(banner);
    }

    const card = document.createElement('article');
    card.className = 'q-card' + (revealed ? (correct ? ' is-correct' : ' is-wrong') : '');
    card.id = `question-card-${q.id}`;
    const isBookmarked = !!bookmarks[q.id];

    let bodyHtml;
    if (q.type === 'mcq') {
      bodyHtml = `<div class="mcq-options">${q.options.map((optText, idx) => {
        const letter = 'ABCD'[idx] || optText.charAt(0).toUpperCase();
        const isSelected = normalizeText(userAns) === letter;
        let cls = isSelected ? 'selected' : '';
        if (isSubmitted) cls += ' locked';
        if (revealed) {
          if (q.accepted.map(normalizeText).includes(letter)) cls += ' correct-ans';
          else if (isSelected) cls += ' wrong-ans';
        }
        return `<div class="mcq-option ${cls}" data-qid="${q.id}" data-letter="${letter}">
                  <span class="opt-letter">${letter}</span>
                  <span>${escapeHtml(optText.replace(/^[A-D]\.\s*/i, ''))}</span>
                </div>`;
      }).join('')}</div>`;
    } else if (q.type === 'tree') {
      bodyHtml = `<div class="tree-host" data-qid="${q.id}"></div>
        ${mode === 'practice' && !isSubmitted
          ? `<div class="input-row" style="margin-top:12px"><button type="button" class="btn btn-primary check-single-btn" data-qid="${q.id}">Kiểm tra</button></div>` : ''}`;
    } else {
      const chipsHtml = q.quickChips ? `
        <div class="quick-chips">
          <span class="quick-chip-label">Chọn nhanh:</span>
          ${q.quickChips.map(chip => {
            const active = q.isSingleChoiceChip && normalizeText(userAns) === normalizeText(chip);
            return `<button type="button" class="chip-btn ${active ? 'active-chip' : ''}"
                      data-qid="${q.id}" data-chip="${chip}" data-single="${q.isSingleChoiceChip ? '1' : '0'}"
                      ${isSubmitted ? 'disabled' : ''}>${chip}</button>`;
          }).join('')}
        </div>` : '';

      bodyHtml = `
        <div class="input-area">
          <div class="input-row">
            <input type="text" class="text-answer-input" data-qid="${q.id}"
                   value="${escapeHtml(userAns)}"
                   placeholder="${escapeHtml(q.placeholder || 'Nhập câu trả lời của bạn...')}"
                   autocomplete="off" ${isSubmitted ? 'disabled' : ''} />
            ${mode === 'practice' && !isSubmitted
              ? `<button type="button" class="btn btn-primary check-single-btn" data-qid="${q.id}">Kiểm tra</button>` : ''}
          </div>
          ${chipsHtml}
        </div>`;
    }

    let feedbackHtml = '';
    if (revealed && q.type !== 'tree') {
      feedbackHtml = correct
        ? `<div class="feedback-box correct">✅ <strong>Chính xác!</strong> Đáp án: <strong>${q.displayAnswer}</strong></div>`
        : `<div class="feedback-box wrong">❌ <strong>Chưa chính xác.</strong> Đáp án đúng: <strong>${q.displayAnswer}</strong></div>`;
    }

    card.innerHTML = `
      <div class="q-header">
        <div class="q-badge-group">
          <span class="q-number">Câu ${q.id}</span>
          <span class="q-type-tag">Part ${q.part}</span>
        </div>
        <button type="button" class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-qid="${q.id}">
          ${isBookmarked ? '⭐ Đã đánh dấu' : '☆ Đánh dấu'}
        </button>
      </div>
      <div class="q-prompt">${q.prompt}</div>
      ${bodyHtml}
      ${feedbackHtml}`;
    container.appendChild(card);
  });

  if (visible === 0) {
    container.innerHTML = `<div class="q-card empty-state">
      <p>Không có câu hỏi nào trong bộ lọc này</p>
      <p style="font-size:.88rem">Hãy chuyển sang tab "Tất cả" để tiếp tục ôn tập nhé!</p></div>`;
  }
  attachCardEvents();
  mountTreeHosts();
}

function renderSidebarNav() {
  const grid = $('questionNavGrid');
  grid.innerHTML = '';
  currentQuestions.forEach((q) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'q-nav-btn';
    btn.textContent = q.id;

    const ans = userAnswers[q.id] || '';
    if (isQuestionRevealed(q.id)) btn.classList.add(isQuestionCorrect(q, ans) ? 'nav-correct' : 'nav-wrong');
    else if (ans.trim() !== '') btn.classList.add('answered');
    if (bookmarks[q.id]) btn.classList.add('nav-bookmarked');

    btn.addEventListener('click', () => {
      closeNavSheet();
      if (!$(`question-card-${q.id}`)) {
        activeFilter = 'all';
        updateFilterTabUI();
        renderQuestions();
      }
      setTimeout(() => {
        const el = $(`question-card-${q.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 30);
    });
    grid.appendChild(btn);
  });
}

function updateStats() {
  const total = currentQuestions.length;
  let answered = 0, correct = 0;
  currentQuestions.forEach(q => {
    const ans = userAnswers[q.id] || '';
    if (ans.trim() !== '') answered++;
    if (isQuestionRevealed(q.id) && isQuestionCorrect(q, ans)) correct++;
  });
  $('answeredCount').textContent = `${answered}/${total}`;
  $('correctCount').textContent = correct;
  $('progressBar').style.width = `${total ? Math.round(answered / total * 100) : 0}%`;
  const allTab = document.querySelector('.filter-tab[data-filter="all"]');
  if (allTab) allTab.textContent = `Tất cả (${total})`;
}

function updateFilterTabUI() {
  document.querySelectorAll('.filter-tab').forEach(tab =>
    tab.classList.toggle('active', tab.dataset.filter === activeFilter));
}

/* Khi người dùng sửa đáp án đã chấm (practice): xóa phản hồi cũ */
function onAnswerEdited(qId) {
  if (mode === 'practice' && checkedState[qId]) {
    checkedState[qId] = false;
    const card = $(`question-card-${qId}`);
    if (card) {
      card.classList.remove('is-correct', 'is-wrong');
      card.querySelectorAll('.feedback-box, .tree-result').forEach(el => el.remove());
    }
  }
  renderSidebarNav();
  updateStats();
}

/* ---------- SỰ KIỆN TRONG THẺ CÂU HỎI ---------- */
function attachCardEvents() {
  document.querySelectorAll('.mcq-option').forEach(opt => {
    opt.addEventListener('click', () => {
      if (isSubmitted) return;
      const qId = Number(opt.dataset.qid);
      userAnswers[qId] = opt.dataset.letter;
      if (mode === 'practice') checkedState[qId] = true;
      renderAll();
    });
  });

  document.querySelectorAll('.text-answer-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const qId = Number(input.dataset.qid);
      userAnswers[qId] = e.target.value;
      onAnswerEdited(qId);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && mode === 'practice' && !isSubmitted) {
        checkedState[Number(input.dataset.qid)] = true;
        renderAll();
      }
    });
  });

  document.querySelectorAll('.check-single-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (isSubmitted) return;
      checkedState[Number(btn.dataset.qid)] = true;
      renderAll();
    });
  });

  document.querySelectorAll('.chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      if (isSubmitted) return;
      const qId = Number(chip.dataset.qid);
      const val = chip.dataset.chip;

      if (chip.dataset.single === '1') {
        userAnswers[qId] = val;
        if (mode === 'practice') checkedState[qId] = true;
        renderAll();
        return;
      }
      const cur = (userAnswers[qId] || '').trim();
      if (val === '-') userAnswers[qId] = cur.endsWith('-') ? cur : cur + '-';
      else userAnswers[qId] = (cur === '' || cur.endsWith('-')) ? cur + val : cur + '-' + val;
      if (mode === 'practice') checkedState[qId] = false;
      renderAll();
      const inputEl = document.querySelector(`.text-answer-input[data-qid="${qId}"]`);
      if (inputEl) { inputEl.focus(); inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length); }
    });
  });

  document.querySelectorAll('.bookmark-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const qId = Number(btn.dataset.qid);
      bookmarks[qId] = !bookmarks[qId];
      renderAll();
    });
  });
}

/* ---------- NỘP BÀI ---------- */
function submitAndGradeAll() {
  closeNavSheet();
  isSubmitted = true;
  stopTimer();
  currentQuestions.forEach(q => { checkedState[q.id] = true; });

  const exam = allExamSets[currentExamIndex];
  const pp = exam.partPoints || null;     // điểm tối đa theo Part (nếu đề có khai báo)
  const total = currentQuestions.length;
  const partCount = {};
  currentQuestions.forEach(q => { partCount[q.part] = (partCount[q.part] || 0) + 1; });

  const stats = {};
  let correctTotal = 0, earned = 0, maxPts = 0;
  currentQuestions.forEach(q => {
    const sc = questionScore(q, userAnswers[q.id]);
    const w = pp ? (pp[q.part] || 0) / partCount[q.part] : 10 / total;
    const st = stats[q.part] = stats[q.part] || { total: 0, correct: 0, pts: 0, max: 0 };
    st.total++; st.max += w; st.pts += w * sc;
    if (sc === 1) { st.correct++; correctTotal++; }
    earned += w * sc; maxPts += w;
  });

  const pct = maxPts ? Math.round(earned / maxPts * 100) : 0;
  const partsHtml = Object.keys(stats).sort().map(p => {
    const st = stats[p];
    const val = pp ? `${st.pts.toFixed(2)}/${st.max.toFixed(2)}` : `${st.correct}/${st.total}`;
    return `<div class="result-stat-box"><div class="result-stat-val">${val}</div>
            <div class="result-stat-lbl">Part ${p}${pp ? ' (điểm)' : ''}</div></div>`;
  }).join('');

  $('resultGrid').innerHTML = `
    <div class="result-stat-box main">
      <div class="result-stat-val">${earned.toFixed(2)} / ${maxPts.toFixed(2)}</div>
      <div class="result-stat-lbl">Tổng điểm (${pct}%)</div>
    </div>
    <div class="result-stat-box">
      <div class="result-stat-val">${correctTotal}/${total}</div>
      <div class="result-stat-lbl">Số câu đúng hoàn toàn</div>
    </div>
    <div class="result-stat-box">
      <div class="result-stat-val">${$('timerDisplay').textContent}</div>
      <div class="result-stat-lbl">Thời gian làm bài</div>
    </div>
    ${partsHtml}`;

  const banner = $('resultBanner');
  banner.classList.add('visible');
  banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  renderAll();
  showToast(`Đã chấm xong! Bạn đạt ${earned.toFixed(2)}/${maxPts.toFixed(2)} điểm.`);
}

function retryWrongQuestions() {
  const wrongQs = currentQuestions.filter(q => !isQuestionCorrect(q, userAnswers[q.id]));
  if (wrongQs.length === 0) { showToast('Tuyệt vời! Bạn không có câu nào làm sai.'); return; }
  wrongQs.forEach(q => { delete userAnswers[q.id]; delete checkedState[q.id]; });
  isSubmitted = false;
  $('resultBanner').classList.remove('visible');
  activeFilter = 'unanswered';
  updateFilterTabUI();
  startTimer();
  renderAll();
  showToast(`Đã xóa đáp án của ${wrongQs.length} câu sai để bạn làm lại!`);
}

function showToast(msg) {
  const el = $('toastMsg');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove('show'), 3000);
}

/* ---------- NHẬP ĐỀ MỚI TỪ VĂN BẢN ---------- */
function parseRawExamText(title, rawText) {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const questions = [];
  let currentPart = 1;
  let currentQ = null;

  for (const line of lines) {
    const partMatch = line.match(/^PART\s*(\d+)/i);
    if (partMatch) { currentPart = Number(partMatch[1]); continue; }

    const qMatch = line.match(/^Câu\s*(\d+)\s*:\s*(.+)$/i);
    if (qMatch) {
      if (currentQ) questions.push(currentQ);
      let qBody = qMatch[2];
      let inlineAns = null;
      if (qBody.includes('→')) {
        const arr = qBody.split('→');
        qBody = arr[0].trim();
        const m = arr[1].match(/Đáp án[^:]*:\s*(.+)$/i);
        if (m) inlineAns = m[1].trim();
      }
      currentQ = { id: Number(qMatch[1]), part: currentPart, type: 'text',
                   prompt: escapeHtml(qBody), options: [], accepted: [], displayAnswer: '' };
      if (inlineAns) finalizeParsedAnswer(currentQ, inlineAns);
      continue;
    }
    if (!currentQ) continue;

    const ansMatch = line.match(/^(?:→\s*)?Đáp án[^:]*:\s*(.+)$/i);
    if (ansMatch) { finalizeParsedAnswer(currentQ, ansMatch[1].trim()); continue; }

    if (/^[A-D]\.\s+/i.test(line)) {
      currentQ.type = 'mcq';
      currentQ.options.push(...line.split(/(?=[A-D]\.\s+)/g).map(s => s.trim()).filter(Boolean));
    }
  }
  if (currentQ) questions.push(currentQ);

  return {
    id: 'custom-' + Date.now(),
    title: title || `Bộ đề tự thêm (${questions.length} câu)`,
    parts: {
      1: { title: 'PART 1: MULTIPLE CHOICE', desc: 'Chọn đáp án đúng nhất.' },
      2: { title: 'PART 2: MORPHEME IDENTIFICATION', desc: 'Phân tích hình vị tự do (F) và ràng buộc (B).' },
      3: { title: 'PART 3: WORD CLASSIFICATION', desc: 'Phân loại từ / cấu trúc ngữ pháp.' },
      4: { title: 'PART 4: BOUND BASES MEANING', desc: 'Nhập nghĩa của gốc từ ràng buộc.' }
    },
    questions
  };
}

function finalizeParsedAnswer(q, rawAns) {
  q.displayAnswer = escapeHtml(rawAns);
  if (q.type === 'mcq') {
    q.accepted = [rawAns.charAt(0).toUpperCase()];
    return;
  }
  const variants = rawAns.split('/').map(s => s.trim().toUpperCase()).filter(Boolean);
  q.accepted = [...new Set([...variants, rawAns.toUpperCase()])];
  if (/^[FB-]+$/i.test(rawAns)) {
    q.quickChips = ['F', 'B', '-'];
  } else if (['S', 'C-FB', 'C-BB', 'CPW', 'GS'].includes(rawAns.toUpperCase())) {
    q.quickChips = ['S', 'C-FB', 'C-BB', 'CpW', 'GS'];
    q.isSingleChoiceChip = true;
  }
}

/* ---------- GẮN SỰ KIỆN GIAO DIỆN CHUNG ---------- */
$('examSelector').addEventListener('change', (e) => initExam(Number(e.target.value)));

$('modePracticeBtn').addEventListener('click', () => {
  mode = 'practice';
  $('modePracticeBtn').classList.add('active');
  $('modeExamBtn').classList.remove('active');
  renderAll();
  showToast('Đã chuyển sang chế độ Luyện tập (chấm ngay từng câu).');
});

$('modeExamBtn').addEventListener('click', () => {
  mode = 'exam';
  isSubmitted = false;
  checkedState = {};
  $('resultBanner').classList.remove('visible');
  $('modeExamBtn').classList.add('active');
  $('modePracticeBtn').classList.remove('active');
  startTimer();
  renderAll();
  showToast('Đã chuyển sang chế độ Thi thử (ẩn đáp án cho đến khi nộp bài).');
});

document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    activeFilter = tab.dataset.filter;
    updateFilterTabUI();
    renderQuestions();
  });
});

$('shuffleBtn').addEventListener('click', () => {
  for (let i = currentQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentQuestions[i], currentQuestions[j]] = [currentQuestions[j], currentQuestions[i]];
  }
  isShuffled = true;
  renderAll();
  showToast('Đã xáo trộn thứ tự các câu hỏi!');
});

$('resetBtn').addEventListener('click', () => {
  initExam(currentExamIndex);
  showToast('Đã làm mới toàn bộ bài làm!');
});

$('submitAllBtn').addEventListener('click', submitAndGradeAll);
$('showAllAnswersBtn').addEventListener('click', submitAndGradeAll);
$('retryWrongBtn').addEventListener('click', retryWrongQuestions);

/* Bảng câu hỏi dạng bottom sheet trên điện thoại */
function closeNavSheet() {
  $('navSheet').classList.remove('open');
  $('sheetBackdrop').classList.remove('open');
}
$('openNavBtn').addEventListener('click', () => {
  $('navSheet').classList.add('open');
  $('sheetBackdrop').classList.add('open');
});
$('closeNavBtn').addEventListener('click', closeNavSheet);
$('sheetBackdrop').addEventListener('click', closeNavSheet);

/* Modal thêm đề */
const importModal = $('importModal');
const closeModal = () => importModal.classList.remove('open');
$('openImportModalBtn').addEventListener('click', () => importModal.classList.add('open'));
$('closeImportModalBtn').addEventListener('click', closeModal);
$('cancelImportBtn').addEventListener('click', closeModal);
importModal.addEventListener('click', (e) => { if (e.target === importModal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closeNavSheet(); } });

$('saveNewExamBtn').addEventListener('click', () => {
  const title = $('newExamTitle').value.trim();
  const rawText = $('newExamRawText').value.trim();
  if (!rawText) { showToast('Vui lòng dán nội dung câu hỏi vào ô trống!'); return; }

  const exam = parseRawExamText(title, rawText);
  if (exam.questions.length === 0) {
    showToast('Không nhận diện được câu hỏi nào. Hãy kiểm tra định dạng "Câu 1: ...".');
    return;
  }
  allExamSets.push(exam);
  saveCustomExams(allExamSets.slice(BUILTIN_EXAMS.length));
  renderExamSelector();
  initExam(allExamSets.length - 1);
  closeModal();
  $('newExamTitle').value = '';
  $('newExamRawText').value = '';
  showToast(`Đã thêm "${exam.title}" (${exam.questions.length} câu)!`);
});

window.addEventListener('DOMContentLoaded', () => {
  loadCustomExams();
  renderExamSelector();
  initExam(0);
});
