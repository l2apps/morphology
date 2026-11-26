/* =========================================================================
   TRÌNH DỰNG CÂY HÌNH VỊ (Morphological Tree)
   Luồng: ① Tách (bấm khe giữa chữ) → ② Ghép (bấm 2 mảnh kề nhau) → ③ Gán nhãn
   Code tự vẽ: đường nối, gạch dọc, ngoặc ghép bên dưới, ký hiệu từ loại khoanh tròn.

   CÁCH KHAI BÁO CÂY ĐÁP ÁN (dùng trong file đề):
     Pref('re-')               tiền tố
     Root('-ceive-')           bound root  (mặc định nhãn "Root")
     Root('like', 'V')         free root   (ghi từ loại N / V / ADJ / ADV)
     Suff('-ion', 'N')         hậu tố đổi từ loại sang N  (bỏ tham số 2 nếu không đổi)
     Infl('-s')                hậu tố biến tố
     Join('reception', 'N', trái, phải)   nút ghép: từ sau khi ghép + từ loại
   Dạng hình vị có nhiều cách viết được chấp nhận thì ngăn cách bằng |  (vd 'desire|desir')
   ========================================================================= */

const Pref = m => ({ t: 'Pref', m });
const Root = (m, c = 'Root') => ({ t: 'Root', m, c });
const Suff = (m, c = '') => ({ t: 'Suff', m, c });
const Infl = (m, c = '') => ({ t: 'Infl', m, c });
const Join = (w, c, a, b) => ({ w, c, kids: [a, b] });

const isLeaf = n => !n.kids;
const leavesOf = n => (isLeaf(n) ? [n] : n.kids.flatMap(leavesOf));
const heightOf = n => (isLeaf(n) ? 0 : 1 + Math.max(...n.kids.map(heightOf)));
const treeShape = n => (isLeaf(n) ? 'x' : '(' + treeShape(n.kids[0]) + treeShape(n.kids[1]) + ')');
const firstAlt = m => String(m || '').split('|')[0];

function internalsOf(n, off = { i: 0 }) {
  if (isLeaf(n)) { off.i++; return []; }
  const s = off.i;
  const a = internalsOf(n.kids[0], off);
  const b = internalsOf(n.kids[1], off);
  return [...a, ...b, { n, s, e: off.i - 1 }];
}

/* ---------- TRẠNG THÁI NGƯỜI DÙNG ---------- */
function newTreeState() {
  return { cut: [], confirmed: false, leaves: [], nodes: [], roots: [], sel: null, nid: 0 };
}
function loadTreeState(raw) {
  try {
    const s = JSON.parse(raw);
    if (s && Array.isArray(s.cut)) return s;
  } catch (e) { /* bỏ qua */ }
  return newTreeState();
}
function buildFromState(st) {
  const byId = {};
  st.leaves.forEach((l, i) => { byId['l' + i] = { id: 'l' + i, t: l.t, m: l.m, c: l.c, text: l.text }; });
  st.nodes.forEach(n => { byId[n.id] = { id: n.id, w: n.w, c: n.c, kids: n.kids.map(k => byId[k]) }; });
  return st.roots.map(r => byId[r]);
}

/* ---------- CHẤM ĐIỂM ---------- */
function compareTree(u, e) {
  const ul = leavesOf(u), el = leavesOf(e);
  if (ul.length !== el.length) {
    return { score: 0, checks: [], note: `Số hình vị không khớp: bạn tách ${ul.length} mảnh, đáp án có ${el.length} hình vị.` };
  }
  const checks = [];
  const norm = s => String(s || '').trim().toLowerCase();
  const add = (label, ok, exp, got) => checks.push({
    label, ok, detail: ok || exp === undefined ? '' : `bạn: ${got || '—'} · đáp án: ${exp || '—'}`
  });

  add('Thứ tự ghép (hình dạng cây)', treeShape(u) === treeShape(e));
  el.forEach((x, i) => {
    const l = ul[i], nm = `“${firstAlt(x.m)}”`;
    add(`${nm}: loại hình vị`, l.t === x.t, x.t, l.t);
    add(`${nm}: dạng hình vị (gạch nối)`, String(x.m).split('|').map(norm).includes(norm(l.m)), firstAlt(x.m), l.m);
    add(x.t === 'Root' ? `${nm}: Root / từ loại` : `${nm}: từ loại khoanh tròn`,
        norm(l.c) === norm(x.c), x.c || 'không ghi', l.c || 'không ghi');
  });
  const ui = internalsOf(u);
  internalsOf(e).forEach(ex => {
    const ux = ui.find(z => z.s === ex.s && z.e === ex.e);
    add(`Từ loại nút “${ex.n.w}”`, !!ux && norm(ux.n.c) === norm(ex.n.c), ex.n.c, ux ? ux.n.c : 'không có nút này');
    add(`Chính tả “${ex.n.w}”`, !!ux && norm(ux.n.w) === norm(ex.n.w), ex.n.w, ux ? ux.n.w : 'không có nút này');
  });
  const ok = checks.filter(c => c.ok).length;
  return { score: ok / checks.length, checks, note: '' };
}

function gradeTree(q, raw) {
  const st = loadTreeState(raw);
  const answers = q.answers || [];
  let roots = [];
  if (st.confirmed) { try { roots = buildFromState(st); } catch (e) { roots = []; } }
  if (roots.length !== 1) {
    return { score: 0, checks: [], note: 'Bạn chưa dựng xong cây (cần ghép hết thành một cây).', answer: answers[0] };
  }
  let best = null;
  answers.forEach(a => {
    const r = compareTree(roots[0], a);
    r.answer = a;
    if (!best || r.score > best.score) best = r;
  });
  return best;
}

/* ---------- VẼ SVG ---------- */
function treeSvg(roots) {
  const gap = 104, padX = 56, lv = 58, top = 30;
  const pos = new Map();
  let li = 0;
  const place = n => {
    if (isLeaf(n)) { pos.set(n, { x: padX + li * gap, h: 0, s: li, e: li }); li++; return; }
    n.kids.forEach(place);
    const a = pos.get(n.kids[0]), b = pos.get(n.kids[1]);
    pos.set(n, { x: (a.x + b.x) / 2, h: 1 + Math.max(a.h, b.h), s: a.s, e: b.e });
  };
  roots.forEach(place);

  const H = Math.max(0, ...roots.map(r => pos.get(r).h));
  const yLeaf = top + H * lv + 24;
  const W = Math.max(260, padX * 2 + (li - 1) * gap);
  const Ht = yLeaf + 66 + Math.max(H, 1) * 30 + 14;
  const nodeY = n => top + (H - pos.get(n).h) * lv;
  let lines = '', texts = '', brackets = '';

  const draw = n => {
    const p = pos.get(n);
    if (isLeaf(n)) {
      const lab = n.t === 'Root' ? (n.c || '?') : (n.t || '?');
      texts += `<text x="${p.x}" y="${yLeaf}" class="ts-lab" text-anchor="middle">${escapeHtml(lab)}</text>`;
      if (n.t !== 'Root' && n.c) {
        const cx = p.x + 12 + lab.length * 5.4;
        texts += `<circle cx="${cx}" cy="${yLeaf - 5}" r="12" class="ts-circ"/>` +
                 `<text x="${cx}" y="${yLeaf - 1}" class="ts-circt" text-anchor="middle">${escapeHtml(n.c)}</text>`;
      }
      lines += `<line x1="${p.x}" y1="${yLeaf + 8}" x2="${p.x}" y2="${yLeaf + 30}" class="ts-line"/>`;
      texts += `<text x="${p.x}" y="${yLeaf + 47}" class="ts-form" text-anchor="middle">${escapeHtml(firstAlt(n.m) || '?')}</text>`;
      return;
    }
    const y = nodeY(n);
    texts += `<text x="${p.x}" y="${y}" class="ts-node" text-anchor="middle">${escapeHtml(n.c || '?')}</text>`;
    n.kids.forEach(k => {
      const kp = pos.get(k);
      const ky = isLeaf(k) ? yLeaf - 17 : nodeY(k) - 14;
      lines += `<line x1="${p.x}" y1="${y + 6}" x2="${kp.x}" y2="${ky}" class="ts-line"/>`;
    });
    n.kids.forEach(draw);
    const x1 = padX + p.s * gap, x2 = padX + p.e * gap, by = yLeaf + 68 + (p.h - 1) * 30;
    brackets += `<path d="M${x1} ${by - 8} V${by} H${x2} V${by - 8}" class="ts-br"/>` +
                `<text x="${(x1 + x2) / 2}" y="${by + 17}" class="ts-word" text-anchor="middle">${escapeHtml(n.w || '?')}</text>`;
  };
  roots.forEach(draw);
  return `<svg class="tree-svg" viewBox="0 0 ${W} ${Ht}" width="${W}" height="${Ht}" role="img">${lines}${brackets}${texts}</svg>`;
}

/* ---------- THÀNH PHẦN GIAO DIỆN ---------- */
const TB_CLASSES = ['N', 'V', 'ADJ', 'ADV'];
const tbOpt = (v, label, cur) => `<option value="${v}" ${v === cur ? 'selected' : ''}>${label}</option>`;

class TreeBuilder {
  constructor(host, q) {
    this.host = host;
    this.q = q;
    this.st = loadTreeState(userAnswers[q.id]);
    host.addEventListener('click', e => this.onClick(e));
    host.addEventListener('input', e => this.onInput(e));
    host.addEventListener('change', e => this.onInput(e));
    this.render();
  }

  save() {
    const st = this.st;
    if (!st.cut.length && !st.confirmed) delete userAnswers[this.q.id];
    else userAnswers[this.q.id] = JSON.stringify(st);
    onAnswerEdited(this.q.id);
  }

  stage() {
    const st = this.st;
    return !st.confirmed ? 'cut' : st.roots.length > 1 ? 'merge' : 'label';
  }

  pieces() {
    const w = this.q.word, b = [0, ...[...this.st.cut].sort((x, y) => x - y), w.length];
    const out = [];
    for (let i = 0; i < b.length - 1; i++) out.push(w.slice(b[i], b[i + 1]));
    return out;
  }

  redrawSvg() {
    const el = this.host.querySelector('.tb-svg');
    if (el) el.innerHTML = treeSvg(buildFromState(this.st));
  }

  render() {
    const st = this.st, stage = this.stage(), dis = isSubmitted ? 'disabled' : '';
    const step = (name, txt) => `<span class="${stage === name ? 'active' : ''}">${txt}</span>`;
    let h = `<div class="tb-steps">${step('cut', '① Tách')}${step('merge', '② Ghép')}${step('label', '③ Gán nhãn')}</div>`;
    if (stage === 'cut') {
      h += this.cutHtml(dis);
    } else {
      h += `<div class="tb-svg-wrap"><div class="tb-svg">${treeSvg(buildFromState(st))}</div></div>`;
      h += stage === 'merge' ? this.mergeHtml(dis) : this.labelHtml(dis);
    }
    if (isQuestionRevealed(this.q.id)) h += this.resultHtml();
    this.host.innerHTML = h;
  }

  cutHtml(dis) {
    const w = this.q.word, cuts = new Set(this.st.cut);
    let letters = '';
    for (let i = 0; i < w.length; i++) {
      letters += `<span class="tb-ch">${escapeHtml(w[i])}</span>`;
      if (i < w.length - 1) {
        letters += `<button type="button" class="tb-gap ${cuts.has(i + 1) ? 'on' : ''}" data-i="${i + 1}" ${dis} aria-label="Cắt sau chữ ${escapeHtml(w[i])}"></button>`;
      }
    }
    return `<p class="tb-hint">Bấm vào khe giữa hai chữ cái để cắt (bấm lại để bỏ cắt). Bạn có thể cắt ở bất kỳ vị trí nào.</p>
      <div class="tb-word">${letters}</div>
      <div class="tb-pieces">Các mảnh: ${this.pieces().map(p => `<b>${escapeHtml(p)}</b>`).join(' | ')}</div>
      <button type="button" class="btn btn-primary" data-act="confirm" ${dis}>Xác nhận tách →</button>`;
  }

  mergeHtml(dis) {
    const st = this.st, forest = buildFromState(st);
    const chips = forest.map(n => {
      const text = leavesOf(n).map(l => l.text).join('');
      return `<button type="button" class="tb-chip ${st.sel === n.id ? 'sel' : ''}" data-id="${n.id}" ${dis}>${escapeHtml(text)}</button>`;
    }).join('<span class="tb-plus">·</span>');
    return `<p class="tb-hint">Bấm lần lượt <b>2 mảnh kề nhau</b> để ghép chúng thành một (ví dụ bấm <i>is</i> rồi <i>like</i>). Còn <b>${forest.length}</b> mảnh, cần ghép đến khi còn 1.</p>
      <div class="tb-chips">${chips}</div>${this.actionsHtml(dis)}`;
  }

  actionsHtml(dis) {
    return `<div class="tb-actions">
      <button type="button" class="btn btn-outline" data-act="undo" ${dis || (this.st.nodes.length ? '' : 'disabled')}>↶ Hoàn tác ghép</button>
      <button type="button" class="btn btn-danger-outline" data-act="reset" ${dis}>↺ Tách lại</button></div>`;
  }

  labelHtml(dis) {
    const st = this.st;
    const typeOpts = (cur) => [['', 'Loại…'], ['Pref', 'Pref'], ['Root', 'Root'], ['Suff', 'Suff'], ['Infl', 'Infl']]
      .map(([v, l]) => tbOpt(v, l, cur)).join('');
    const classOpts = (list, cur) => list.map(([v, l]) => tbOpt(v, l, cur)).join('');
    const cls = TB_CLASSES.map(c => [c, c]);

    const leafRows = st.leaves.map((l, i) => {
      const id = 'l' + i;
      let sel;
      if (l.t === 'Root') sel = classOpts([['', 'Root / từ loại…'], ['Root', 'Root (bound base)'], ...cls], l.c);
      else if (l.t) sel = classOpts([['', '— không đổi từ loại'], ...cls.map(([v]) => [v, `đổi sang ${v}`])], l.c);
      else sel = tbOpt('', '—', '');
      return `<div class="tb-row"><span class="tb-tag">${escapeHtml(l.text)}</span>
        <select data-id="${id}" data-k="t" ${dis}>${typeOpts(l.t)}</select>
        <input data-id="${id}" data-k="m" value="${escapeHtml(l.m)}" placeholder="dạng hình vị: re-, -ceive-, -ion…" ${dis} autocomplete="off" />
        <select data-id="${id}" data-k="c" ${dis || (l.t ? '' : 'disabled')}>${sel}</select></div>`;
    }).join('');

    const forest = buildFromState(st);
    const byId = {};
    (function walk(n) { byId[n.id] = n; (n.kids || []).forEach(walk); })(forest[0]);
    const nodeRows = st.nodes.map(n => {
      const text = leavesOf(byId[n.id]).map(l => l.text).join('');
      return `<div class="tb-row"><span class="tb-tag">${escapeHtml(text)}</span>
        <input data-id="${n.id}" data-k="w" value="${escapeHtml(n.w)}" placeholder="từ sau khi ghép (đúng chính tả)" ${dis} autocomplete="off" />
        <select data-id="${n.id}" data-k="c" ${dis}>${classOpts([['', 'Từ loại…'], ...cls], n.c)}</select></div>`;
    }).join('');

    return `<p class="tb-hint">Gán nhãn cho <b>từng hình vị</b> (loại, dạng chuẩn có gạch nối, Root/từ loại hoặc từ loại khoanh tròn nếu hậu tố đổi từ loại), rồi gõ <b>từ sau mỗi lần ghép</b> và từ loại của nó.</p>
      <div class="tb-sub">Hình vị</div>${leafRows}
      <div class="tb-sub">Các nút ghép (từ dưới lên)</div>${nodeRows}
      ${this.actionsHtml(dis)}`;
  }

  resultHtml() {
    const g = gradeTree(this.q, userAnswers[this.q.id]);
    const tot = g.checks.length, pass = g.checks.filter(c => c.ok).length;
    const bad = g.checks.filter(c => !c.ok);
    const head = !tot
      ? `❌ <strong>Chưa đúng.</strong> ${escapeHtml(g.note)}`
      : g.score === 1
        ? '✅ <strong>Chính xác hoàn toàn!</strong>'
        : `📋 <strong>${pass}/${tot} mục đúng</strong> (${Math.round(g.score * 100)}% điểm câu này)`;
    const list = bad.map(c => `<li>❌ ${escapeHtml(c.label)}${c.detail ? ' — ' + escapeHtml(c.detail) : ''}</li>`).join('');
    return `<div class="tree-result">
      <div class="feedback-box ${g.score === 1 ? 'correct' : 'wrong'}">${head}${list ? `<ul class="tb-bad">${list}</ul>` : ''}</div>
      <div class="tb-sub">Cây đáp án tham khảo</div>
      <div class="tb-svg-wrap"><div class="tb-svg">${treeSvg([g.answer])}</div></div></div>`;
  }

  /* ---------- SỰ KIỆN ---------- */
  onClick(e) {
    if (isSubmitted) return;
    const st = this.st;

    const gap = e.target.closest('.tb-gap');
    if (gap) {
      const i = Number(gap.dataset.i), at = st.cut.indexOf(i);
      if (at >= 0) st.cut.splice(at, 1); else st.cut.push(i);
      this.save(); this.render();
      return;
    }

    const chip = e.target.closest('.tb-chip');
    if (chip) {
      const id = chip.dataset.id;
      if (!st.sel || st.sel === id) { st.sel = st.sel === id ? null : id; this.save(); this.render(); return; }
      const ia = st.roots.indexOf(st.sel), ib = st.roots.indexOf(id);
      if (Math.abs(ia - ib) !== 1) {
        showToast('Chỉ ghép được hai mảnh nằm kề nhau.');
        st.sel = id;
      } else {
        const lo = Math.min(ia, ib);
        const forest = buildFromState(st);
        const text = leavesOf(forest[lo]).concat(leavesOf(forest[lo + 1])).map(l => l.text).join('');
        const nid = 'n' + st.nid++;
        st.nodes.push({ id: nid, kids: [st.roots[lo], st.roots[lo + 1]], w: text, c: '' });
        st.roots.splice(lo, 2, nid);
        st.sel = null;
      }
      this.save(); this.render();
      return;
    }

    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === 'confirm') {
      if (!st.cut.length) { showToast('Hãy bấm vào khe giữa các chữ cái để tách từ trước.'); return; }
      const ps = this.pieces();
      st.leaves = ps.map(text => ({ text, t: '', m: text, c: '' }));
      st.roots = ps.map((_, i) => 'l' + i);
      st.nodes = []; st.nid = 0; st.sel = null; st.confirmed = true;
    } else if (act === 'undo') {
      const n = st.nodes.pop();
      if (!n) return;
      st.roots.splice(st.roots.indexOf(n.id), 1, n.kids[0], n.kids[1]);
      st.sel = null;
    } else if (act === 'reset') {
      if (st.confirmed && !confirm('Xóa toàn bộ cây đã dựng và tách lại từ đầu?')) return;
      const keep = st.cut;
      this.st = newTreeState();
      this.st.cut = keep;
    }
    this.save(); this.render();
  }

  onInput(e) {
    if (isSubmitted) return;
    const el = e.target.closest('[data-k]');
    if (!el) return;
    const id = el.dataset.id, k = el.dataset.k, v = el.value;
    if (id[0] === 'l') {
      const l = this.st.leaves[Number(id.slice(1))];
      l[k] = v;
      if (k === 't') l.c = '';
    } else {
      const n = this.st.nodes.find(x => x.id === id);
      if (n) n[k] = v;
    }
    this.save();
    if (k === 't') this.render(); else this.redrawSvg();
  }
}

function mountTreeHosts() {
  document.querySelectorAll('.tree-host').forEach(host => {
    const q = currentQuestions.find(x => x.id === Number(host.dataset.qid));
    if (q) new TreeBuilder(host, q);
  });
}
