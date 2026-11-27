/* =========================================================================
   ÔN TẬP PART 3: VẼ CÂY HÌNH VỊ - 100 TỪ
   Mỗi dòng:  từ = cây        (nhiều đáp án chấp nhận thì ngăn cách bằng  ;; )

   Ký hiệu cây:
     [từ/LOẠI  trái  phải]    nút ghép: từ sau khi ghép + từ loại (N, V, ADJ, ADV)
     P:dis-                   tiền tố          P:en-/V  (tiền tố đổi từ loại - không bị chấm)
     R:-ceive-                bound root (nhãn "Root")
     R:like/V                 free root + từ loại      R:comfort/N|V  = chấp nhận N hoặc V
     S:-ion/N                 hậu tố đổi sang N        S:-ist   = hậu tố không đổi từ loại
     I:-s                     hậu tố biến tố (Infl)
     Dạng hình vị chấp nhận nhiều cách viết: R:-duce|-duct-
   ========================================================================= */

(function () {
  const RAW = `
unhappiness = [unhappiness/N [unhappy/ADJ P:un- R:happy/ADJ] S:-ness/N]
disagreement = [disagreement/N [disagree/V P:dis- R:agree/V] S:-ment/N]
encouragement = [encouragement/N [encourage/V P:en-/V R:courage/N] S:-ment/N]
uncomfortable = [uncomfortable/ADJ P:un- [comfortable/ADJ R:comfort/N|V S:-able/ADJ]]
irregularly = [irregularly/ADV [irregular/ADJ P:ir- R:regular/ADJ] S:-ly/ADV]
intercontinental = [intercontinental/ADJ P:inter- [continental/ADJ R:continent/N S:-al/ADJ]]
dishonesty = [dishonesty/N [dishonest/ADJ P:dis- R:honest/ADJ] S:-y/N] ;; [dishonesty/N P:dis- [honesty/N R:honest/ADJ S:-y/N]]
enjoyment = [enjoyment/N [enjoy/V P:en-/V R:joy/N] S:-ment/N]
prepayment = [prepayment/N [prepay/V P:pre- R:pay/V] S:-ment/N]
deforestation = [deforestation/N [deforest/V P:de-/V R:forest/N] S:-ation/N]
nationalize = [nationalize/V [national/ADJ R:nation/N S:-al/ADJ] S:-ize/V]
carelessness = [carelessness/N [careless/ADJ R:care/N|V S:-less/ADJ] S:-ness/N]
unbelievable = [unbelievable/ADJ P:un- [believable/ADJ R:believe/V S:-able/ADJ]]
impossibility = [impossibility/N [impossible/ADJ P:im- R:possible/ADJ] S:-ity/N]
unemployment = [unemployment/N P:un- [employment/N R:employ/V S:-ment/N]]
ungentlemanly = [ungentlemanly/ADJ P:un- [gentlemanly/ADJ [gentleman/N R:gentle/ADJ R:man/N] S:-ly/ADJ]]
undesirability = [undesirability/N [undesirable/ADJ P:un- [desirable/ADJ R:desire|desir/V S:-able/ADJ]] S:-ity/N]
reactivation = [reactivation/N P:re- [activation/N [active/ADJ R:act/V S:-ive/ADJ] S:-ation/N]] ;; [reactivation/N [reactivate/V P:re- [activate/V [active/ADJ R:act/V S:-ive/ADJ] S:-ate/V]] S:-ion/N]
nationalization = [nationalization/N [nationalize/V [national/ADJ R:nation/N S:-al/ADJ] S:-ize/V] S:-ation/N]
internationalism = [internationalism/N [international/ADJ P:inter- [national/ADJ R:nation/N S:-al/ADJ]] S:-ism/N]
independently = [independently/ADV [independent/ADJ P:in- [dependent/ADJ R:depend/V S:-ent/ADJ]] S:-ly/ADV]
unfriendliness = [unfriendliness/N [unfriendly/ADJ P:un- [friendly/ADJ R:friend/N S:-ly/ADJ]] S:-ness/N]
denationalization = [denationalization/N [denationalize/V P:de- [nationalize/V [national/ADJ R:nation/N S:-al/ADJ] S:-ize/V]] S:-ation/N]
industrialization = [industrialization/N [industrialize/V [industrial/ADJ R:industry/N S:-al/ADJ] S:-ize/V] S:-ation/N]
unfortunately = [unfortunately/ADV [unfortunate/ADJ P:un- [fortunate/ADJ R:fortune/N S:-ate/ADJ]] S:-ly/ADV]
unsuccessfully = [unsuccessfully/ADV [unsuccessful/ADJ P:un- [successful/ADJ R:success/N S:-ful/ADJ]] S:-ly/ADV]
modernization = [modernization/N [modernize/V R:modern/ADJ S:-ize/V] S:-ation/N]
readjustment = [readjustment/N [readjust/V P:re- R:adjust/V] S:-ment/N]
counterdeclaration = [counterdeclaration/N P:counter- [declaration/N R:declare/V S:-ation/N]]
unfaithfulness = [unfaithfulness/N [unfaithful/ADJ P:un- [faithful/ADJ R:faith/N S:-ful/ADJ]] S:-ness/N]
reception = [reception/N [receive/V P:re- R:-ceive-] S:-ion/N]
unpredictable = [unpredictable/ADJ P:un- [predictable/ADJ [predict/V P:pre- R:-dict-] S:-able/ADJ]]
receptionist = [receptionist/N [reception/N [receive/V P:re- R:-ceive-] S:-ion/N] S:-ist]
contradiction = [contradiction/N [contradict/V P:contra- R:-dict-] S:-ion/N]
transportation = [transportation/N [transport/V P:trans- R:-port-] S:-ation/N]
incredible = [incredible/ADJ P:in- [credible/ADJ R:-cred- S:-ible/ADJ]]
production = [production/N [produce/V P:pro- R:-duce|-duct-] S:-ion/N]
exportation = [exportation/N [export/V P:ex- R:-port-] S:-ation/N]
revision = [revision/N [revise/V P:re- R:-vise-] S:-ion/N]
unacceptable = [unacceptable/ADJ P:un- [acceptable/ADJ [accept/V P:ac- R:-cept-] S:-able/ADJ]]
dislikes = [dislikes/V [dislike/V P:dis- R:like/V] I:-s]
reinvested = [reinvested/V [reinvest/V P:re- R:invest/V] I:-ed]
teachers = [teachers/N [teacher/N R:teach/V S:-er/N] I:-s]
unhappier = [unhappier/ADJ [unhappy/ADJ P:un- R:happy/ADJ] I:-er]
misunderstandings = [misunderstandings/N [misunderstanding/N [misunderstand/V P:mis- R:understand/V] S:-ing/N] I:-s]
governments = [governments/N [government/N R:govern/V S:-ment/N] I:-s]
uncovered = [uncovered/V [uncover/V P:un- R:cover/V] I:-ed]
modernizing = [modernizing/V [modernize/V R:modern/ADJ S:-ize/V] I:-ing]
friendships = [friendships/N [friendship/N R:friend/N S:-ship] I:-s]
notebooks = [notebooks/N [notebook/N R:note/N R:book/N] I:-s]
disappearance = [disappearance/N [disappear/V P:dis- R:appear/V] S:-ance/N]
unforgettable = [unforgettable/ADJ P:un- [forgettable/ADJ R:forget/V S:-able/ADJ]]
inaccurately = [inaccurately/ADV [inaccurate/ADJ P:in- R:accurate/ADJ] S:-ly/ADV]
misbehavior = [misbehavior/N [misbehave/V P:mis- R:behave/V] S:-ior/N]
enlargement = [enlargement/N [enlarge/V P:en-/V R:large/ADJ] S:-ment/N]
unavoidable = [unavoidable/ADJ P:un- [avoidable/ADJ R:avoid/V S:-able/ADJ]]
illegalize = [illegalize/V [illegal/ADJ P:il- R:legal/ADJ] S:-ize/V]
inability = [inability/N P:in- [ability/N R:able/ADJ S:-ity/N]]
disrespectful = [disrespectful/ADJ [disrespect/N P:dis- R:respect/N|V] S:-ful/ADJ] ;; [disrespectful/ADJ P:dis- [respectful/ADJ R:respect/N|V S:-ful/ADJ]]
empowerment = [empowerment/N [empower/V P:em-/V R:power/N] S:-ment/N]
overreaction = [overreaction/N [overreact/V P:over- R:react/V] S:-ion/N]
immaturity = [immaturity/N [immature/ADJ P:im- R:mature/ADJ] S:-ity/N]
repayment = [repayment/N [repay/V P:re- R:pay/V] S:-ment/N]
helplessness = [helplessness/N [helpless/ADJ R:help/N|V S:-less/ADJ] S:-ness/N]
globalize = [globalize/V [global/ADJ R:globe/N S:-al/ADJ] S:-ize/V]
unselfishness = [unselfishness/N [unselfish/ADJ P:un- [selfish/ADJ R:self/N S:-ish/ADJ]] S:-ness/N]
globalization = [globalization/N [globalize/V [global/ADJ R:globe/N S:-al/ADJ] S:-ize/V] S:-ation/N]
uncontrollably = [uncontrollably/ADV [uncontrollable/ADJ P:un- [controllable/ADJ R:control/V S:-able/ADJ]] S:-ly/ADV]
oversimplification = [oversimplification/N [oversimplify/V P:over- [simplify/V R:simple/ADJ S:-ify/V]] S:-ation/N]
unreasonably = [unreasonably/ADV [unreasonable/ADJ P:un- [reasonable/ADJ R:reason/N S:-able/ADJ]] S:-ly/ADV]
commercialization = [commercialization/N [commercialize/V [commercial/ADJ R:commerce/N S:-ial/ADJ] S:-ize/V] S:-ation/N]
unreliability = [unreliability/N [unreliable/ADJ P:un- [reliable/ADJ R:rely/V S:-able/ADJ]] S:-ity/N]
institutionalize = [institutionalize/V [institutional/ADJ [institution/N R:institute/V S:-ion/N] S:-al/ADJ] S:-ize/V]
unwillingness = [unwillingness/N [unwilling/ADJ P:un- [willing/ADJ R:will/V S:-ing/ADJ]] S:-ness/N]
irresponsibility = [irresponsibility/N [irresponsible/ADJ P:ir- [responsible/ADJ R:response/N S:-ible/ADJ]] S:-ity/N]
reorganization = [reorganization/N [reorganize/V P:re- [organize/V R:organ/N S:-ize/V]] S:-ation/N]
unimaginatively = [unimaginatively/ADV [unimaginative/ADJ P:un- [imaginative/ADJ R:imagine/V S:-ative/ADJ]] S:-ly/ADV]
decentralization = [decentralization/N [decentralize/V P:de- [centralize/V [central/ADJ R:center/N S:-al/ADJ] S:-ize/V]] S:-ation/N]
antidisestablishment = [antidisestablishment/N P:anti- [disestablishment/N [disestablish/V P:dis- R:establish/V] S:-ment/N]]
untruthfulness = [untruthfulness/N [untruthful/ADJ P:un- [truthful/ADJ [truth/N R:true/ADJ S:-th/N] S:-ful/ADJ]] S:-ness/N]
deception = [deception/N [deceive/V P:de- R:-ceive-] S:-ion/N]
inspection = [inspection/N [inspect/V P:in- R:-spect-] S:-ion/N]
subscription = [subscription/N [subscribe/V P:sub- R:-scribe-] S:-ion/N]
importation = [importation/N [import/V P:im- R:-port-] S:-ation/N]
reduction = [reduction/N [reduce/V P:re- R:-duce|-duct-] S:-ion/N]
invisible = [invisible/ADJ P:in- [visible/ADJ R:-vis- S:-ible/ADJ]]
immortality = [immortality/N [immortal/ADJ P:im- [mortal/ADJ R:-mort- S:-al/ADJ]] S:-ity/N]
inaudible = [inaudible/ADJ P:in- [audible/ADJ R:-aud- S:-ible/ADJ]]
admission = [admission/N [admit/V P:ad- R:-mit-] S:-ion/N]
interruption = [interruption/N [interrupt/V P:inter- R:-rupt-] S:-ion/N]
unlocked = [unlocked/V [unlock/V P:un- R:lock/V] I:-ed]
disappearing = [disappearing/V [disappear/V P:dis- R:appear/V] I:-ing]
unhealthiest = [unhealthiest/ADJ [unhealthy/ADJ P:un- [healthy/ADJ R:health/N S:-y/ADJ]] I:-est]
playgrounds = [playgrounds/N [playground/N R:play/V R:ground/N] I:-s]
blackboards = [blackboards/N [blackboard/N R:black/ADJ R:board/N] I:-s]
achievements = [achievements/N [achievement/N R:achieve/V S:-ment/N] I:-s]
reconsidering = [reconsidering/V [reconsider/V P:re- R:consider/V] I:-ing]
classrooms = [classrooms/N [classroom/N R:class/N R:room/N] I:-s]
untidier = [untidier/ADJ [untidy/ADJ P:un- R:tidy/ADJ] I:-er]
disagreements = [disagreements/N [disagreement/N [disagree/V P:dis- R:agree/V] S:-ment/N] I:-s]
`;

  /* ---------- Bộ đọc ký hiệu cây ---------- */
  const TYPES = { P: 'Pref', R: 'Root', S: 'Suff', I: 'Infl' };

  function parseTree(src) {
    const toks = src.replace(/\[/g, ' [ ').replace(/\]/g, ' ] ').trim().split(/\s+/);
    let i = 0;
    const leaf = tok => {
      const m = tok.match(/^([PRSI]):([^/]+)(?:\/(.+))?$/);
      if (!m) throw new Error('Mảnh không hợp lệ: ' + tok);
      const t = TYPES[m[1]];
      return { t, m: m[2], c: m[3] || (t === 'Root' && !m[3] ? 'Root' : '') };
    };
    const node = () => {
      if (toks[i] === '[') {
        i++;
        const [w, c] = toks[i++].split('/');
        if (!c) throw new Error('Thiếu từ loại ở nút: ' + w);
        const a = node(), b = node();
        if (toks[i++] !== ']') throw new Error('Thiếu dấu ] gần: ' + w);
        return { w, c, kids: [a, b] };
      }
      return leaf(toks[i++]);
    };
    const tree = node();
    if (i !== toks.length) throw new Error('Thừa ký hiệu sau cây: ' + src.slice(0, 40));
    return tree;
  }

  /* ---------- Nhóm (Part) theo số thứ tự ---------- */
  const GROUPS = [
    [1, 15, 'NHÓM 1: Từ có 3 hình vị (free base)'],
    [16, 30, 'NHÓM 2: Chuỗi tiền tố / hậu tố phức tạp (4–5 hình vị)'],
    [31, 40, 'NHÓM 3: Từ có bound base (Root)'],
    [41, 50, 'NHÓM 4: Hậu tố biến tố (Infl) ngoài cùng'],
    [51, 65, 'NHÓM 5: Từ có 3 hình vị (tiếp)'],
    [66, 80, 'NHÓM 6: Chuỗi tiền tố / hậu tố phức tạp (tiếp)'],
    [81, 90, 'NHÓM 7: Từ có bound base (tiếp)'],
    [91, 100, 'NHÓM 8: Infl & từ ghép (tiếp)']
  ];
  const parts = {};
  GROUPS.forEach(([a, b, title], idx) => {
    parts[idx + 1] = { title, desc: `Câu ${a} – ${b}. Bấm khe để tách → bấm 2 mảnh kề nhau để ghép → gán nhãn.` };
  });

  const lines = RAW.split('\n').map(l => l.trim()).filter(Boolean);
  const questions = lines.map((line, k) => {
    const [word, rest] = line.split(/\s=\s(.+)/);
    const id = k + 1;
    const part = GROUPS.findIndex(([a, b]) => id >= a && id <= b) + 1;
    const answers = rest.split(/\s;;\s/).map(parseTree);
    return {
      id, part, type: 'tree', word, answers, accepted: [], displayAnswer: '',
      prompt: `Vẽ cây hình vị cho từ: <span class="target-highlight">${word}</span>`
    };
  });

  window.EXAM_SETS.push({
    id: 'tree-practice-100',
    title: 'Ôn Part 3: Vẽ cây hình vị (100 từ)',
    parts,
    questions
  });
})();
