Exit code: 0
Wall time: 1.5 seconds
Output:
import {
  DEMO_TEAM,
  calculateProgress,
  canSubmitFinalWork,
  findDemoTeamBySerial,
  findKnowledgeSources,
  rankKnowledgeChunks,
} from './app-state.mjs';
import { createRemoteStore, isRemoteStoreConfigured } from './supabase-store.mjs';

const app = document.querySelector('#app');
const storageKey = 'mychip-demo-state-v1';

const stages = [
  { id: 'welcome', label: '?쒖옉 ???덈궡', status: 'done' },
  { id: 'setup', label: '?ㅺ퀎 ?섍꼍 以鍮?, status: 'current' },
  { id: 'xschem', label: 'Xschem?쇰줈 ?뚮줈??洹몃━湲?, status: 'next' },
  { id: 'simulate', label: '?뚮줈 ?쒕??덉씠??, status: 'next' },
  { id: 'layout', label: 'Magic?쇰줈 ?덉씠?꾩썐 洹몃━湲?, status: 'next' },
  { id: 'verify', label: 'DRC 쨌 LVS 寃利?, status: 'next' },
  { id: 'submit', label: '理쒖쥌 ?뚯씪 ?쒖텧', status: 'next' },
  { id: 'delivery', label: '?쒖옉 쨌 諛곗넚 쨌 ?뚯뒪??, status: 'locked' },
];

const setupItems = [
  { id: 'ubuntu', text: 'Ubuntu ?섍꼍??以鍮꾪뻽?댁슂', completed: true },
  { id: 'toolkit', text: '?ㅺ퀎 ?꾧뎄 ?ㅼ튂 ?뚯씪???뺤씤?덉뼱??, completed: true },
  { id: 'xschem-run', text: 'Xschem???ㅽ뻾??蹂댁븯?댁슂', completed: false },
  { id: 'magic-run', text: 'Magic???ㅽ뻾??蹂댁븯?댁슂', completed: false },
  { id: 'test-run', text: '媛꾨떒???덉젣瑜??댁뼱 蹂댁븯?댁슂', completed: false },
];

const initialState = {
  view: 'landing',
  activeStage: 'setup',
  checks: Object.fromEntries(setupItems.map((item) => [item.id, item.completed])),
  submitted: false,
  submissionNote: '',
  submissionFile: '',
  aiMessages: [
    {
      role: 'assistant',
      text: '留됲엺 遺遺꾩쓣 媛숈씠 李얠븘蹂쇨쾶?? 吏湲덉? ?쒖꽕怨??섍꼍 以鍮꾟??④퀎?덉슂. 臾댁뾿???섎젮??硫덉톬?붿? ?뚮젮 二쇱꽭??',
      source: '珥덇린 ?덈궡 肄섑뀗痢?쨌 怨듭떇 洹쒖튃 ?꾨떂',
    },
  ],
};

let state = loadState();
let knowledgeCorpus = { chunks: [], documents: [] };
const remoteConfig = window.MYCHIP_REMOTE_CONFIG ?? {};
const remoteStore = isRemoteStoreConfigured(remoteConfig)
  ? createRemoteStore(remoteConfig)
  : null;

function loadState() {
  try {
    return { ...initialState, ...JSON.parse(localStorage.getItem(storageKey)) };
  } catch {
    return { ...initialState };
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function progress() {
  return calculateProgress(
    setupItems.map((item) => ({ ...item, completed: Boolean(state.checks[item.id]) })),
  );
}

function markView(view) {
  state.view = view;
  saveState();
  render();
}

function landingView() {
  return `
    <section class="landing">
      <nav class="topbar">
        <a class="brand" href="#" data-action="home"><span>MC</span> MyChip 李몄뿬 媛?대뱶</a>
        <span class="topbar-note">2026 MyChip 쨌 李몄뿬? ?꾩슜</span>
      </nav>
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">FIRST CHIP, STEP BY STEP</p>
          <h1>泥섏쓬 留뚮뱶??br /><em>?섎쭔??移?</em></h1>
          <p class="hero-text">?ㅺ퀎 ?섍꼍 以鍮꾨????뚮줈?? ?덉씠?꾩썐, 寃利앷낵 ?쒖텧源뚯?. 留됲엺 ?댁쑀瑜?紐곕씪??愿쒖갖?꾩슂. 吏湲??댁빞 ???쇱쓣 ?섎굹???④퍡 ?뺤씤?⑸땲??</p>
          <div class="serial-card">
            <label for="serial-input">李몄뿬? ?쒕━??踰덊샇</label>
            <div class="serial-row">
              <input id="serial-input" autocomplete="off" placeholder="?? MC26-A7K4-P9Q2" />
              <button class="primary-button" data-action="access">?쒖옉?섍린 <span>??/span></button>
            </div>
            <p id="serial-message" class="form-hint">?쒕━??踰덊샇媛 ?녿떎硫??대떦?먯뿉寃?臾몄쓽?섏꽭?? <button class="text-button" data-action="demo">?곕え濡??섎윭蹂닿린</button></p>
          </div>
        </div>
        <div class="hero-art" aria-label="移??쒖옉 怨쇱젙???쒗쁽???쇰윭?ㅽ듃"></div>
      </div>
      <section class="promise-grid">
        <article><b>01</b><h2>吏湲?????/h2><p>湲?臾몄꽌 ??? ?꾩옱 ?④퀎?먯꽌 ?꾩슂???묒뾽留?蹂댁뿬?쒕젮??</p></article>
        <article><b>02</b><h2>?ъ슫 ?ㅻ챸</h2><p>DRC 媛숈? ??꽑 留먮룄 ?산낵 ?댁쑀遺????댁꽌 ?ㅻ챸?댁슂.</p></article>
        <article><b>03</b><h2>?꾩? ?붿껌</h2><p>臾댁뾿??臾쇱뼱遊먯빞 ?좎? 紐곕씪?? AI 媛?대뱶媛 吏덈Ц遺???꾩?以섏슂.</p></article>
      </section>
    </section>`;
}

function stageList() {
  return stages
    .map(
      (stage, index) => `
        <button class="stage-nav ${stage.id === state.activeStage ? 'active' : ''} ${stage.status}" data-stage="${stage.id}">
          <span class="stage-number">${String(index + 1).padStart(2, '0')}</span>
          <span>${stage.label}</span>
          <i>${stage.status === 'done' ? '?? : stage.status === 'locked' ? '쨌' : '??}</i>
        </button>`,
    )
    .join('');
}

function workspaceShell(content) {
  return `
    <section class="workspace">
      <aside class="sidebar">
        <button class="brand sidebar-brand" data-action="home"><span>MC</span> MyChip</button>
        <div class="team-chip"><span class="team-dot"></span><div><strong>${DEMO_TEAM.name}</strong><small>${DEMO_TEAM.school} 쨌 ${DEMO_TEAM.department}</small></div></div>
        <div class="progress-block"><div class="progress-label"><span>?꾩껜 吏꾪뻾瑜?/span><strong>${progress()}%</strong></div><div class="progress-track"><span style="width: ${progress()}%"></span></div><p>?묒? 泥댄겕 ?섎굹媛 ?ㅼ쓬 ?④퀎??湲몄쓣 留뚮벊?덈떎.</p></div>
        <nav class="stage-nav-list" aria-label="吏꾪뻾 ?④퀎">${stageList()}</nav>
        <button class="exit-button" data-action="home">?ㅻⅨ ?쒕━??踰덊샇濡??묒냽</button>
      </aside>
      <div class="workspace-main">${content}</div>
    </section>`;
}

function dashboardView() {
  const current = stages.find((stage) => stage.id === 'setup');
  return workspaceShell(`
    <header class="workspace-header"><div><p class="eyebrow">${DEMO_TEAM.serial}</p><h1>?덈뀞?섏꽭?? ${DEMO_TEAM.name}!</h1><p>?ㅻ뒛? ?ㅺ퀎 ?꾧뎄媛 ??而댄벂?곗뿉?????대━?붿? ?뺤씤??蹂?李⑤??덉슂.</p></div><button class="support-button" data-action="open-ai">?꾩????꾩슂?댁슂 <span>??/span></button></header>
    <section class="next-step-card"><div class="badge">?꾩옱 ?④퀎</div><div><p class="section-overline">02 쨌 ${current.label}</p><h2>癒쇱?, ?꾨줈洹몃옩???대━?붿? ?뺤씤??蹂쇨퉴??</h2><p>?꾩쭅 ?뚮줈瑜?洹몃┫ ?꾩슂???놁뼱?? Ubuntu ?덉뿉??Xschem怨?Magic??媛곴컖 ??踰??ㅽ뻾??蹂대뒗 寃껊쭔?쇰줈 異⑸텇?⑸땲??</p></div><button class="primary-button" data-stage="setup">?④퀎 ?닿린 <span>??/span></button></section>
    <section class="dashboard-grid">
      <article class="panel checklist-panel"><div class="panel-title"><div><p class="section-overline">NEXT TO DO</p><h2>?ㅼ쓬 ????/h2></div><span>${progress()}%</span></div>${checklistMarkup()}</article>
      <article class="panel glossary-panel"><p class="section-overline">WORDS, SIMPLY</p><h2>泥섏쓬 蹂대뒗 留먯씤媛??</h2><p>?꾨Ц ?⑹뼱???몄슦????? <b>?몄젣 ???곕뒗吏</b> ?댄빐?섎㈃ 異⑸텇?댁슂.</p><button class="glossary-link" data-stage="verify"><span>DRC</span><i>怨듭젙 洹쒖튃??吏耳곕뒗吏 蹂대뒗 ?덉쟾 ?먭?</i><b>??/b></button><button class="glossary-link" data-stage="verify"><span>LVS</span><i>?뚮줈?꾩? ?덉씠?꾩썐??媛숈?吏 蹂대뒗 ?議?寃??/i><b>??/b></button></article>
    </section>
    <section class="timeline-section"><div class="section-heading"><div><p class="section-overline">AFTER SUBMISSION</p><h2>移⑹씠 ?먯뿉 ?ㅺ린源뚯?</h2></div><span>愿由ъ옄媛 ?곹깭瑜??낅뜲?댄듃?⑸땲??/span></div><div class="timeline"><div class="timeline-item done"><span>??/span><b>理쒖쥌 ?뱀씤</b><small>?ㅺ퀎 ?뚯씪 ?뺤씤 ?꾨즺</small></div><div class="timeline-item"><span>02</span><b>移??쒖옉</b><small>FAB 怨듭젙 吏꾪뻾</small></div><div class="timeline-item"><span>03</span><b>?⑦궎吏?쨌 諛곗넚</b><small>?섎졊 ?뺣낫 ?붿껌</small></div><div class="timeline-item"><span>04</span><b>?뚯뒪??湲곕줉</b><small>寃곌낵瑜??④꺼??/small></div></div></section>
    ${aiDock()}
  `);
}

function checklistMarkup() {
  return `<div class="checklist">${setupItems
    .map(
      (item) => `<label class="check-item ${state.checks[item.id] ? 'checked' : ''}"><input type="checkbox" data-check="${item.id}" ${state.checks[item.id] ? 'checked' : ''}/><span class="checkbox-icon">${state.checks[item.id] ? '?? : ''}</span><span>${item.text}</span></label>`,
    )
    .join('')}</div>`;
}

function glossaryCard(term, definition, why, normal, issue, citation) {
  return `<article class="term-card"><p class="term-name">${term}</p><h3>${definition}</h3><dl><dt>???꾩슂?쒓???</dt><dd>${why}</dd><dt>?뺤긽?대씪硫?/dt><dd>${normal}</dd><dt>?먯＜ 寃る뒗 臾몄젣</dt><dd>${issue}</dd></dl>${citation ? `<p class="term-citation">洹쇨굅: ${citation}</p>` : ''}</article>`;
}

function stageView(stageId) {
  if (stageId === 'submit') return submissionView();
  if (stageId === 'delivery') return deliveryView();
  if (stageId === 'verify') {
    return workspaceShell(`
      <header class="page-header"><button class="back-link" data-action="dashboard">????쒕낫??/button><p class="eyebrow">09 쨌 CHECK BEFORE SUBMISSION</p><h1>DRC? LVS: ?쒖텧 ??br />??踰덉쓽 <em>?덉쟾 ?먭?</em></h1><p>?대젮???대쫫泥섎읆 蹂댁씠吏留? ?쒓퇋移숈쓣 吏耳곕뒗吏?앹? ?쒖쿂??怨꾪쉷???뚮줈? 媛숈?吏?앸? ?뺤씤?섎뒗 ??寃?ъ엯?덈떎.</p></header>
      <section class="term-grid">${glossaryCard('DRC', '?쒓렇由??ㅺ퀎?꾧? 怨듭젙???쎌냽??吏耳곕뒗吏??蹂대뒗 ?먮룞 ?덉쟾 ?먭?', '移⑹쓣 ?ㅼ젣濡?留뚮뱾 ???덉쓣 留뚰겮 ?좉낵 媛꾧꺽??異⑸텇?쒖? ?뺤씤?섍린 ?꾪빐 ?꾩슂?댁슂.', '?ㅻ쪟 紐⑸줉??鍮꾩뼱 ?덇굅?? ?꾩옱 怨듭젙???덈궡??留욌뒗 寃곌낵媛 ?섏???', '?좎씠 ?덈Т 媛源앷굅??媛?섎㈃ ?ㅻ쪟媛 ?앷만 ???덉뼱?? ?ㅻ쪟???대쫫怨??꾩튂瑜?罹≪쿂???대떦?먯뿉寃?蹂댁뿬 二쇱꽭??')}${glossaryCard('LVS', '?쒗쉶濡쒕룄? ?덉씠?꾩썐??媛숈? ?뚮줈?몄???鍮꾧탳?섎뒗 ?議?寃??, '?뚮줈?꾩뿉???섎룄???곌껐???ㅼ젣 ?덉씠?꾩썐?먯꽌???좎??섏뿀?붿? ?뺤씤?댁빞 ?댁슂.', '???ㅺ퀎媛 ?쇱튂?덈떎??寃곌낵瑜??뺤씤?댁슂.', '? ?대쫫???ㅻⅤ嫄곕굹, ?좎씠 ?곌껐?섏? ?딆븯?????덉뼱?? ?대뼡 ?뚯씪?쇰━ 鍮꾧탳?덈뒗吏 癒쇱? ?뺤씤?섏꽭??')}${glossaryCard('GDS', '移?怨듭옣???꾨떖?섎뒗 理쒖쥌 ?ㅺ퀎 ?꾨㈃ ?뚯씪', '?덉씠?대퀎 ?ㅺ퀎 ?뺣낫瑜?怨듭젙?먯꽌 ?쎌쓣 ???덈뒗 ?뺥깭濡??꾨떖?섍린 ?꾪빐 ?꾩슂?댁슂.', '愿由ъ옄媛 ?붽뎄??諛⑹떇怨??뚯씪 ?대쫫?쇰줈 ?앹꽦?쇱슂.', '?ъ뾽蹂??쒖텧 ?뺤떇? ?ㅻ? ???덉뼱?? ?꾩옱 ?깆뿉 ?붽뎄?ы빆???놁쑝硫??대떦?먯뿉寃??뺤씤?섏꽭??')}${glossaryCard('PDK', '?뱀젙 怨듭젙???꾪븳 ?쒖꽕怨?洹쒖튃怨?遺???ㅻ챸??臾띠쓬??, '?닿? 洹몃┛ ?뚮줈媛 ?대뼡 怨듭젙?먯꽌 留뚮뱾?댁쭏吏瑜??뚭퀬 ?ㅺ퀎?섎룄濡??꾩?以섏슂.', '?꾧뎄媛 ?대떦 PDK??遺?덇낵 ?덉씠?대? ?뺤긽?곸쑝濡?遺덈윭???', '?ㅻⅨ 怨듭젙???ㅼ젙???욎? ?딅룄濡? ?쒓났諛쏆? ?덈궡 ?먮즺??寃쎈줈瑜?洹몃?濡??뺤씤?섏꽭??')}</section>
      ${aiDock()}`);
  }

  const copy = {
    setup: { number: '02', title: '?ㅺ퀎 ?섍꼍 以鍮?, summary: '?꾨줈洹몃옩???μ닕?섍쾶 ?ㅻ（吏 紐삵빐??愿쒖갖?듬땲?? 吏湲덉? ?쒖뿴由щ뒗吏 ?뺤씤?앺븯??泥??④퀎?덉슂.' },
    xschem: { number: '04', title: 'Xschem?쇰줈 ?뚮줈??洹몃━湲?, summary: '?뚮줈?꾨뒗 留뚮뱾怨??띠? ?뚮줈瑜?釉붾줉怨??좎쑝濡??쒗쁽???ㅺ퀎 怨꾪쉷?낅땲??' },
    simulate: { number: '05', title: '?뚮줈 ?쒕??덉씠??, summary: '?ㅼ젣濡?留뚮뱾湲??꾩뿉, 而댄벂???덉뿉???뚮줈媛 ?덉긽?濡??숈옉?섎뒗吏 誘몃━ ?뺤씤?⑸땲??' },
    layout: { number: '06', title: 'Magic?쇰줈 ?덉씠?꾩썐 洹몃━湲?, summary: '?덉씠?꾩썐? ?뚮줈?꾨? ?ㅼ젣 移??꾩뿉 ?볦쓣 ???덈뒗 紐⑥뼇怨?諛곗꽑?쇰줈 諛붽씀???묒뾽?낅땲??' },
  }[stageId] ?? { number: '01', title: '?쒖옉 ???덈궡', summary: 'MyChip???꾩껜 ?ъ젙??癒쇱? ?댄렣蹂댁꽭??' };

  return workspaceShell(`
    <header class="page-header"><button class="back-link" data-action="dashboard">????쒕낫??/button><p class="eyebrow">${copy.number} 쨌 STEP GUIDE</p><h1>${copy.title}</h1><p>${copy.summary}</p></header>
    <section class="step-content"><article class="guide-card"><p class="section-overline">WHAT TO DO NOW</p><h2>???④퀎?먯꽌 ?섎뒗 ??/h2><ol><li>?곌뎄?명듃 ?먮뒗 ?대떦?먭? ?쒓났???덈궡瑜?癒쇱? ?쎈땲??</li><li>???묒뾽留??섑뻾???? ?붾㈃??蹂댁씤 寃곌낵瑜??뺤씤?⑸땲??</li><li>?뺤긽?몄? ?먮떒?섍린 ?대졄?ㅻ㈃ 罹≪쿂? ?④퍡 AI 媛?대뱶??吏덈Ц?⑸땲??</li></ol></article><article class="guide-card accent"><p class="section-overline">DON'T GET STUCK ALONE</p><h2>?쒕춼 紐⑤Ⅴ寃좊뒗吏 紐⑤Ⅴ寃좎뼱?붴앸룄 異⑸텇??吏덈Ц?댁뿉??</h2><p>諛⑷툑 臾댁뾿???꾨Ⅴ嫄곕굹 ?낅젰?덈뒗吏, 臾댁뾿??湲곕??덈뒗吏, ?ㅼ젣 ?붾㈃?먮뒗 臾댁뾿???섏솕?붿?留??뚮젮 二쇱꽭?? AI媛 ?ㅼ쓬 吏덈Ц???④퍡 ?뺣━?⑸땲??</p><button class="primary-button" data-action="open-ai">AI 媛?대뱶 ?닿린 <span>??/span></button></article></section>
    ${stageId === 'setup' ? `<section class="panel full-checklist"><div class="panel-title"><div><p class="section-overline">CHECK AS YOU GO</p><h2>?섍꼍 以鍮?泥댄겕由ъ뒪??/h2></div><span>${progress()}%</span></div>${checklistMarkup()}<div class="local-file"><label for="stage-file">?붾㈃ 罹≪쿂 ?먮뒗 ?ㅺ퀎 ?뚯씪 湲곕줉</label><input id="stage-file" type="file" /><small>??珥덇린 踰꾩쟾? ?좏깮???뚯씪 ?대쫫留???湲곌린??湲곕줉?⑸땲?? ?ㅼ젣 ?낅줈????μ냼???ㅼ쓬 ?곌껐 ?④퀎?먯꽌 異붽??⑸땲??</small></div></section>` : ''}
    ${aiDock()}`);
}

function submissionView() {
  return workspaceShell(`
    <header class="page-header"><button class="back-link" data-action="dashboard">????쒕낫??/button><p class="eyebrow">10 쨌 FINAL SUBMISSION</p><h1>理쒖쥌 ?쒖텧</h1><p>?ㅼ젣 ?쒖텧 ??ぉ怨??뚯씪 洹쒖튃? ?ъ뾽 ?뚯감留덈떎 ?щ씪吏????덉뼱?? ???붾㈃? ?대떦?먭? ?ㅼ젙????ぉ??蹂댁뿬二쇰뒗 ?먮━?낅땲??</p></header>
    <section class="submission-layout"><form class="submission-form panel" id="submission-form"><div class="panel-title"><div><p class="section-overline">REQUIRED ITEMS</p><h2>?쒖텧 ???뺤씤</h2></div>${state.submitted ? '<span class="status approved">?쒖텧 ?꾨즺</span>' : '<span class="status drafting">?묒꽦 以?/span>'}</div><label>?ㅺ퀎 ?ㅻ챸 <em>?꾩닔</em><textarea id="submission-note" placeholder="臾댁뾿??留뚮뱾?덇퀬, ?대뼡 ?숈옉??湲곕??섎뒗吏 ?ъ슫 留먮줈 ?곸뼱 二쇱꽭??">${escapeHtml(state.submissionNote)}</textarea></label><label>理쒖쥌 ?ㅺ퀎 ?뚯씪 <em>?꾩닔</em><input id="submission-file" type="file" /><small id="file-name">${state.submissionFile ? `?좏깮?? ${escapeHtml(state.submissionFile)}` : '?ъ뾽蹂??ㅼ젣 ?뚯씪 ?뺤떇? ?대떦??怨듭????곕씪 ?ㅼ젙?⑸땲??'}</small></label><button class="primary-button" type="submit" ${state.submitted ? 'disabled' : ''}>${state.submitted ? '?쒖텧???꾨즺?섏뿀?듬땲?? : '理쒖쥌 ?쒖텧?섍린'} <span>??/span></button><p id="submission-message" class="form-hint"></p></form><aside class="review-note"><p class="section-overline">WHAT HAPPENS NEXT</p><h2>?쒖텧 ?ㅼ뿉??/h2><ol><li>愿由ъ옄媛 ?뚯씪怨??ㅻ챸???뺤씤?⑸땲??</li><li>?꾩슂?섎㈃ 諛섎젮 ?ъ쑀? ?④퍡 ?ъ젣異쒖쓣 ?붿껌?⑸땲??</li><li>?뱀씤 ?꾩뿉???쒖옉쨌?⑦궎吏??곹깭瑜??뺤씤?????덉뒿?덈떎.</li></ol><p>?꾩옱 ?ъ뾽??怨듭떇 ?뚯씪 洹쒓꺽? ???곕え???ы븿?섏뼱 ?덉? ?딆뒿?덈떎. ?먮즺媛 ?깅줉???ㅼ뿉留?怨좎젙?⑸땲??</p></aside></section>`);
}

function deliveryView() {
  return workspaceShell(`
    <header class="page-header"><button class="back-link" data-action="dashboard">????쒕낫??/button><p class="eyebrow">11 쨌 FROM FAB TO TEST</p><h1>?쒖옉 쨌 諛곗넚 쨌 移??뚯뒪??/h1><p>理쒖쥌 ?뱀씤 ?ㅼ뿉???쒖옉 ?곹깭瑜??뺤씤?섍퀬, 諛곗넚 ?붿껌???대졇???뚮쭔 ?섎졊 ?뺣낫瑜??낅젰?⑸땲??</p></header>
    <section class="fulfillment-card"><div class="fulfillment-row current"><span>01</span><div><b>理쒖쥌 ?쒖텧</b><p>${state.submitted ? '?쒖텧??쨌 愿由ъ옄 寃???湲? : '?꾩쭅 ?쒖텧 ??}</p></div></div><div class="fulfillment-row"><span>02</span><div><b>移??쒖옉</b><p>愿由ъ옄媛 ?쒖옉 吏꾪뻾 ?곹깭瑜??뚮젮?쒕젮??</p></div></div><div class="fulfillment-row"><span>03</span><div><b>諛곗넚 ?뺣낫 ?붿껌</b><p>???④퀎媛 ?대━硫??섎졊?멸낵 二쇱냼瑜??낅젰?댁슂.</p></div></div><div class="fulfillment-row"><span>04</span><div><b>?섎졊 諛??뚯뒪??/b><p>移⑹쓣 諛쏆? ?? ?곌껐 諛⑸쾿怨?痢≪젙 寃곌낵瑜?湲곕줉?댁슂.</p></div></div></section>`);
}

function aiDock() {
  const messages = state.aiMessages
    .map((message) => `<div class="message ${message.role}"><p>${escapeHtml(message.text)}</p>${message.source ? `<small>${escapeHtml(message.source)}</small>` : ''}${message.sources?.length ? `<ul class="message-citations">${message.sources.map((source) => `<li><b>${escapeHtml(source.title)} 쨌 ${escapeHtml(source.citation)}</b>${source.excerpt ? `<span>${escapeHtml(source.excerpt)}</span>` : ''}</li>`).join('')}</ul>` : ''}</div>`)
    .join('');
  return `<section class="ai-dock" id="ai-dock"><div class="ai-heading"><div><span class="ai-orb">??/span><div><p class="section-overline">MYCHIP GUIDE</p><h2>臾댁뾿??臾쇱뼱遊먯빞 ?좎? 紐곕씪??愿쒖갖?꾩슂.</h2></div></div><span class="demo-badge">?먮즺 ?곌껐 ???곕え</span></div><div class="quick-prompts"><button data-prompt="?꾨줈洹몃옩???ㅽ뻾?섏? ?딆븘??>?꾨줈洹몃옩???ㅽ뻾?섏? ?딆븘??/button><button data-prompt="臾댁뾿??臾몄젣?몄? 紐⑤Ⅴ寃좎뼱??>臾댁뾿??臾몄젣?몄? 紐⑤Ⅴ寃좎뼱??/button><button data-prompt="DRC媛 臾댁뾿?멸???">DRC媛 臾댁뾿?멸???</button></div><div class="message-list">${messages}</div><form id="ai-form" class="ai-form"><input id="ai-input" placeholder="?? Magic???댁뿀?붾뜲 ?붾㈃??鍮꾩뼱 ?덉뼱?? /><button class="primary-button" type="submit">吏덈Ц 蹂대궡湲?<span>??/span></button></form><p class="ai-note">?ㅼ젣 RAG ?듬?? ?쒓났???곌뎄?명듃쨌FAQ瑜?癒쇱? 洹쇨굅濡??섍퀬, 洹쇨굅媛 ?놁쑝硫??쇰컲 ?덈궡?꾩쓣 ?쒖떆?⑸땲??</p></section>`;
}

function answerFor(question) {
  const lower = question.toLowerCase();
  if (lower.includes('drc')) return { text: 'DRC???덉씠?꾩썐?먯꽌 ?좎쓽 ??씠??媛꾧꺽 媛숈? 怨듭젙 洹쒖튃??吏耳곕뒗吏 ?뺤씤?섎뒗 ?먮룞 ?덉쟾 ?먭??댁뿉?? 癒쇱? ?ㅻ쪟 紐⑸줉???대쫫怨??쒖떆???꾩튂瑜?罹≪쿂??二쇱꽭?? 洹쒖튃媛믪? ?ъ뾽蹂??곌뎄?명듃??PDK ?덈궡?먯꽌留??뺤씤?댁빞 ?⑸땲??', source: '珥덇린 ?쇰컲 ?덈궡 쨌 怨듭떇 洹쒖튃 ?꾨떂' };
  if (lower.includes('?ㅽ뻾') || lower.includes('??) || lower.includes('????)) return { text: '?먯씤??諛붾줈 ?⑥젙?섏? ?딆쓣寃뚯슂. ??吏湲??대뼡 ?꾨줈洹몃옩???대젮 ?덈뒗吏 ???낅젰??紐낅졊?대굹 ?꾨Ⅸ 踰꾪듉 ???붾㈃???섏삩 硫붿떆吏 ?꾩껜 ??Ubuntu?몄? ?ㅻⅨ ?섍꼍?몄? ?쒖꽌濡??뚮젮 二쇱꽭?? 媛?ν븯硫??붾㈃ 罹≪쿂???④퍡 ?щ젮 二쇱꽭??', source: '珥덇린 吏꾨떒 ?먮쫫 쨌 ?곌뎄?명듃 ?곌껐 ?? };
  return { text: '醫뗭븘?? 臾몄젣瑜???臾몄옣?쇰줈 ???곸뼱 二쇱뀲?댁슂. ?ㅼ쓬?쇰줈 ?쒕갑湲??섎젮???쇄? ?쒓린???寃곌낵?? ?쒖떎?쒕줈 蹂댁씤 ?붾㈃?대굹 ?ㅻ쪟?앸? ?뚮젮 二쇱꽭?? ????媛吏媛 ?덉쑝硫??대떦?먯뿉寃??꾨떖???뚮룄 ?⑥뵮 鍮⑤씪吏묐땲??', source: '珥덇린 吏꾨떒 ?먮쫫 쨌 ?곌뎄?명듃 ?곌껐 ?? };
}

function staffView() {
  return workspaceShell(`
    <header class="workspace-header"><div><p class="eyebrow">STAFF VIEW 쨌 DEMO</p><h1>李멸?? ?꾪솴</h1><p>??紐낆쓽 ?대떦?먭? 紐⑤뱺 ???吏꾨룄? ?꾩? ?붿껌??鍮좊Ⅴ寃??묒뼱蹂????덈뒗 ?붾㈃?낅땲??</p></div><button class="support-button" data-action="dashboard">? ?붾㈃ 蹂닿린</button></header>
    <section class="metric-grid"><article><span>李멸??</span><b>24</b><small>?대쾲 ?ъ씠??/small></article><article><span>?꾩? ?붿껌</span><b>4</b><small>?듬? ?湲?/small></article><article><span>理쒖쥌 ?쒖텧</span><b>3</b><small>寃???꾩슂</small></article><article><span>?κ린媛?誘몄젒??/span><b>2</b><small>7???댁긽</small></article></section>
    <section class="panel team-table"><div class="panel-title"><div><p class="section-overline">TEAM OVERVIEW</p><h2>? 紐⑸줉</h2></div><span class="status drafting">?곕え ?곗씠??/span></div><div class="table-head"><span>?</span><span>?꾩옱 ?④퀎</span><span>吏꾪뻾瑜?/span><span>理쒖쥌 ?쒖텧</span></div><div class="table-row"><span><b>${DEMO_TEAM.name}</b><small>${DEMO_TEAM.serial}</small></span><span>?ㅺ퀎 ?섍꼍 以鍮?/span><span><div class="mini-track"><i style="width:${progress()}%"></i></div>${progress()}%</span><span>${state.submitted ? '?쒖텧 ?꾨즺' : '?묒꽦 以?}</span></div><div class="table-row"><span><b>?ㅻ━肄??덉떦?</b><small>MC26-R2M8-L6W1</small></span><span>?뚮줈 ?쒕??덉씠??/span><span><div class="mini-track"><i style="width:48%"></i></div>48%</span><span>?묒꽦 以?/span></div></section>`);
}

function render() {
  if (state.view === 'landing') app.innerHTML = landingView();
  else if (state.view === 'dashboard') app.innerHTML = dashboardView();
  else if (state.view === 'staff') app.innerHTML = staffView();
  else app.innerHTML = stageView(state.activeStage);
  bindEvents();
}

function bindEvents() {
  const sourceBadge = document.querySelector('.demo-badge');
  if (sourceBadge) sourceBadge.textContent = '?곌뎄?명듃 1쨌2쨌5쨌6쨌7 ?곌껐??;
  const aiNote = document.querySelector('.ai-note');
  if (aiNote) aiNote.textContent = '?듬? ?꾨옒??洹쇨굅 ?곌뎄?명듃? ?섏씠吏瑜??쒖떆?⑸땲?? ?먮즺???녿뒗 怨듭떇 洹쒖튃? ?듬??섏? ?딆뒿?덈떎.';
  document.querySelectorAll('[data-action="home"]').forEach((button) => button.addEventListener('click', () => markView('landing')));
  document.querySelectorAll('[data-action="dashboard"]').forEach((button) => button.addEventListener('click', () => markView('dashboard')));
  document.querySelectorAll('[data-stage]').forEach((button) => button.addEventListener('click', () => { state.activeStage = button.dataset.stage; state.view = button.dataset.stage === 'welcome' ? 'dashboard' : 'stage'; saveState(); render(); }));
  document.querySelectorAll('[data-check]').forEach((input) => input.addEventListener('change', () => { state.checks[input.dataset.check] = input.checked; saveState(); remoteStore?.saveChecklist(DEMO_TEAM.serial, input.dataset.check, input.checked).catch(() => {}); render(); }));
  document.querySelector('[data-action="demo"]')?.addEventListener('click', () => markView('dashboard'));
  document.querySelector('[data-action="access"]')?.addEventListener('click', accessSerial);
  document.querySelector('#serial-input')?.addEventListener('keydown', (event) => { if (event.key === 'Enter') accessSerial(); });
  document.querySelectorAll('[data-action="open-ai"]').forEach((button) => button.addEventListener('click', () => document.querySelector('#ai-dock')?.scrollIntoView({ behavior: 'smooth' })));
  document.querySelectorAll('[data-prompt]').forEach((button) => button.addEventListener('click', () => submitQuestion(button.dataset.prompt)));
  document.querySelector('#ai-form')?.addEventListener('submit', (event) => { event.preventDefault(); const input = document.querySelector('#ai-input'); submitQuestion(input.value); input.value = ''; });
  document.querySelector('#submission-file')?.addEventListener('change', (event) => { state.submissionFile = event.target.files[0]?.name ?? ''; saveState(); render(); });
  document.querySelector('#submission-form')?.addEventListener('submit', (event) => { event.preventDefault(); state.submissionNote = document.querySelector('#submission-note').value; const message = document.querySelector('#submission-message'); if (!canSubmitFinalWork([{ required: true, value: state.submissionNote }, { required: true, value: state.submissionFile }])) { message.textContent = '?ㅺ퀎 ?ㅻ챸怨?理쒖쥌 ?ㅺ퀎 ?뚯씪??紐⑤몢 ?낅젰?????쒖텧?????덉뼱??'; return; } state.submitted = true; saveState(); remoteStore?.saveFinalSubmission(DEMO_TEAM.serial, { note: state.submissionNote, fileName: state.submissionFile }).catch(() => {}); render(); });
  document.querySelector('#stage-file')?.addEventListener('change', (event) => { const file = event.target.files[0]; if (file) event.target.nextElementSibling.textContent = `?좏깮?? ${file.name} 쨌 ?ㅼ젣 ??μ? ?ㅼ쓬 ?곌껐 ?④퀎?먯꽌 吏?먮맗?덈떎.`; });
}

function accessSerial() {
  const input = document.querySelector('#serial-input');
  const message = document.querySelector('#serial-message');
  if (findDemoTeamBySerial(input.value)) markView('dashboard');
  else message.innerHTML = '?쒕━??踰덊샇瑜??뺤씤??二쇱꽭?? ?곕え 踰덊샇??<code>MC26-A7K4-P9Q2</code>?낅땲??';
}

function submitQuestion(question) {
  if (!String(question ?? '').trim()) return;
  state.aiMessages.push({ role: 'user', text: question });
  const preferredSources = findKnowledgeSources(question);
  const matchedChunks = rankKnowledgeChunks(
    question,
    knowledgeCorpus.chunks,
    3,
    preferredSources.map((source) => source.id),
  );
  const sources = matchedChunks.length
    ? matchedChunks.map((chunk) => ({
        title: `?곌뎄?명듃 ${chunk.number} 쨌 ${chunk.title}`,
        citation: `p. ${chunk.page}`,
        excerpt: `${chunk.text.slice(0, 180)}??,
      }))
    : preferredSources;
  const answer = answerFor(question);
  state.aiMessages.push({
    role: 'assistant',
    ...answer,
    source: sources.length ? '?곌뎄?명듃 湲곕컲 ?덈궡' : answer.source,
    sources,
  });
  saveState();
  render();
  document.querySelector('#ai-dock')?.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

render();

fetch('./knowledge-chunks.json')
  .then((response) => (response.ok ? response.json() : Promise.reject(new Error('knowledge corpus unavailable'))))
  .then((corpus) => {
    knowledgeCorpus = corpus;
    render();
  })
  .catch(() => {
    // The app still shows its small verified-source fallback when opened without a local web server.
  });

