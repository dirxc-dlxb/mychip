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
  { id: 'welcome', label: '시작 전 안내', status: 'done' },
  { id: 'setup', label: '설계 환경 준비', status: 'current' },
  { id: 'xschem', label: 'Xschem으로 회로도 그리기', status: 'next' },
  { id: 'simulate', label: '회로 시뮬레이션', status: 'next' },
  { id: 'layout', label: 'Magic으로 레이아웃 그리기', status: 'next' },
  { id: 'verify', label: 'DRC · LVS 검증', status: 'next' },
  { id: 'submit', label: '최종 파일 제출', status: 'next' },
  { id: 'delivery', label: '제작 · 배송 · 테스트', status: 'locked' },
];

const setupItems = [
  { id: 'ubuntu', text: 'Ubuntu 환경을 준비했어요', completed: true },
  { id: 'toolkit', text: '설계 도구 설치 파일을 확인했어요', completed: true },
  { id: 'xschem-run', text: 'Xschem을 실행해 보았어요', completed: false },
  { id: 'magic-run', text: 'Magic을 실행해 보았어요', completed: false },
  { id: 'test-run', text: '간단한 예제를 열어 보았어요', completed: false },
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
      text: '막힌 부분을 같이 찾아볼게요. 지금은 “설계 환경 준비” 단계예요. 무엇을 하려다 멈췄는지 알려 주세요.',
      source: '초기 안내 콘텐츠 · 공식 규칙 아님',
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
        <a class="brand" href="#" data-action="home"><span>MC</span> MyChip 참여 가이드</a>
        <span class="topbar-note">2026 MyChip · 참여팀 전용</span>
      </nav>
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">FIRST CHIP, STEP BY STEP</p>
          <h1>처음 만드는<br /><em>나만의 칩.</em></h1>
          <p class="hero-text">설계 환경 준비부터 회로도, 레이아웃, 검증과 제출까지. 막힌 이유를 몰라도 괜찮아요. 지금 해야 할 일을 하나씩 함께 확인합니다.</p>
          <div class="serial-card">
            <label for="serial-input">참여팀 시리얼 번호</label>
            <div class="serial-row">
              <input id="serial-input" autocomplete="off" placeholder="예: MC26-A7K4-P9Q2" />
              <button class="primary-button" data-action="access">시작하기 <span>→</span></button>
            </div>
            <p id="serial-message" class="form-hint">시리얼 번호가 없다면 담당자에게 문의하세요. <button class="text-button" data-action="demo">데모로 둘러보기</button></p>
          </div>
        </div>
        <div class="hero-art" aria-label="칩 제작 과정을 표현한 일러스트"></div>
      </div>
      <section class="promise-grid">
        <article><b>01</b><h2>지금 할 일</h2><p>긴 문서 대신, 현재 단계에서 필요한 작업만 보여드려요.</p></article>
        <article><b>02</b><h2>쉬운 설명</h2><p>DRC 같은 낯선 말도 뜻과 이유부터 풀어서 설명해요.</p></article>
        <article><b>03</b><h2>도움 요청</h2><p>무엇을 물어봐야 할지 몰라도, AI 가이드가 질문부터 도와줘요.</p></article>
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
          <i>${stage.status === 'done' ? '✓' : stage.status === 'locked' ? '·' : '→'}</i>
        </button>`,
    )
    .join('');
}

function workspaceShell(content) {
  return `
    <section class="workspace">
      <aside class="sidebar">
        <button class="brand sidebar-brand" data-action="home"><span>MC</span> MyChip</button>
        <div class="team-chip"><span class="team-dot"></span><div><strong>${DEMO_TEAM.name}</strong><small>${DEMO_TEAM.school} · ${DEMO_TEAM.department}</small></div></div>
        <div class="progress-block"><div class="progress-label"><span>전체 진행률</span><strong>${progress()}%</strong></div><div class="progress-track"><span style="width: ${progress()}%"></span></div><p>작은 체크 하나가 다음 단계의 길을 만듭니다.</p></div>
        <nav class="stage-nav-list" aria-label="진행 단계">${stageList()}</nav>
        <button class="exit-button" data-action="home">다른 시리얼 번호로 접속</button>
      </aside>
      <div class="workspace-main">${content}</div>
    </section>`;
}

function dashboardView() {
  const current = stages.find((stage) => stage.id === 'setup');
  return workspaceShell(`
    <header class="workspace-header"><div><p class="eyebrow">${DEMO_TEAM.serial}</p><h1>안녕하세요, ${DEMO_TEAM.name}!</h1><p>오늘은 설계 도구가 내 컴퓨터에서 잘 열리는지 확인해 볼 차례예요.</p></div><button class="support-button" data-action="open-ai">도움이 필요해요 <span>↗</span></button></header>
    <section class="next-step-card"><div class="badge">현재 단계</div><div><p class="section-overline">02 · ${current.label}</p><h2>먼저, 프로그램이 열리는지 확인해 볼까요?</h2><p>아직 회로를 그릴 필요는 없어요. Ubuntu 안에서 Xschem과 Magic을 각각 한 번 실행해 보는 것만으로 충분합니다.</p></div><button class="primary-button" data-stage="setup">단계 열기 <span>→</span></button></section>
    <section class="dashboard-grid">
      <article class="panel checklist-panel"><div class="panel-title"><div><p class="section-overline">NEXT TO DO</p><h2>다음 할 일</h2></div><span>${progress()}%</span></div>${checklistMarkup()}</article>
      <article class="panel glossary-panel"><p class="section-overline">WORDS, SIMPLY</p><h2>처음 보는 말인가요?</h2><p>전문 용어는 외우는 대신, <b>언제 왜 쓰는지</b> 이해하면 충분해요.</p><button class="glossary-link" data-stage="verify"><span>DRC</span><i>공정 규칙을 지켰는지 보는 안전 점검</i><b>→</b></button><button class="glossary-link" data-stage="verify"><span>LVS</span><i>회로도와 레이아웃이 같은지 보는 대조 검사</i><b>→</b></button></article>
    </section>
    <section class="timeline-section"><div class="section-heading"><div><p class="section-overline">AFTER SUBMISSION</p><h2>칩이 손에 오기까지</h2></div><span>관리자가 상태를 업데이트합니다</span></div><div class="timeline"><div class="timeline-item done"><span>✓</span><b>최종 승인</b><small>설계 파일 확인 완료</small></div><div class="timeline-item"><span>02</span><b>칩 제작</b><small>FAB 공정 진행</small></div><div class="timeline-item"><span>03</span><b>패키징 · 배송</b><small>수령 정보 요청</small></div><div class="timeline-item"><span>04</span><b>테스트 기록</b><small>결과를 남겨요</small></div></div></section>
    ${aiDock()}
  `);
}

function checklistMarkup() {
  return `<div class="checklist">${setupItems
    .map(
      (item) => `<label class="check-item ${state.checks[item.id] ? 'checked' : ''}"><input type="checkbox" data-check="${item.id}" ${state.checks[item.id] ? 'checked' : ''}/><span class="checkbox-icon">${state.checks[item.id] ? '✓' : ''}</span><span>${item.text}</span></label>`,
    )
    .join('')}</div>`;
}

function glossaryCard(term, definition, why, normal, issue, citation) {
  return `<article class="term-card"><p class="term-name">${term}</p><h3>${definition}</h3><dl><dt>왜 필요한가요?</dt><dd>${why}</dd><dt>정상이라면</dt><dd>${normal}</dd><dt>자주 겪는 문제</dt><dd>${issue}</dd></dl>${citation ? `<p class="term-citation">근거: ${citation}</p>` : ''}</article>`;
}

function stageView(stageId) {
  if (stageId === 'submit') return submissionView();
  if (stageId === 'delivery') return deliveryView();
  if (stageId === 'verify') {
    return workspaceShell(`
      <header class="page-header"><button class="back-link" data-action="dashboard">← 대시보드</button><p class="eyebrow">09 · CHECK BEFORE SUBMISSION</p><h1>DRC와 LVS: 제출 전<br />두 번의 <em>안전 점검</em></h1><p>어려운 이름처럼 보이지만, “규칙을 지켰는지”와 “처음 계획한 회로와 같은지”를 확인하는 두 검사입니다.</p></header>
      <section class="term-grid">${glossaryCard('DRC', '“그린 설계도가 공정의 약속을 지켰는지” 보는 자동 안전 점검', '칩을 실제로 만들 수 있을 만큼 선과 간격이 충분한지 확인하기 위해 필요해요.', '오류 목록이 비어 있거나, 현재 공정의 안내에 맞는 결과가 나와요.', '선이 너무 가깝거나 가늘면 오류가 생길 수 있어요. 오류의 이름과 위치를 캡처해 담당자에게 보여 주세요.')}${glossaryCard('LVS', '“회로도와 레이아웃이 같은 회로인지” 비교하는 대조 검사', '회로도에서 의도한 연결이 실제 레이아웃에서도 유지되었는지 확인해야 해요.', '두 설계가 일치했다는 결과를 확인해요.', '핀 이름이 다르거나, 선이 연결되지 않았을 수 있어요. 어떤 파일끼리 비교했는지 먼저 확인하세요.')}${glossaryCard('GDS', '칩 공장에 전달하는 최종 설계 도면 파일', '레이어별 설계 정보를 공정에서 읽을 수 있는 형태로 전달하기 위해 필요해요.', '관리자가 요구한 방식과 파일 이름으로 생성돼요.', '사업별 제출 형식은 다를 수 있어요. 현재 앱에 요구사항이 없으면 담당자에게 확인하세요.')}${glossaryCard('PDK', '특정 공정을 위한 “설계 규칙과 부품 설명서 묶음”', '내가 그린 회로가 어떤 공정에서 만들어질지를 알고 설계하도록 도와줘요.', '도구가 해당 PDK의 부품과 레이어를 정상적으로 불러와요.', '다른 공정용 설정을 섞지 않도록, 제공받은 안내 자료의 경로를 그대로 확인하세요.')}</section>
      ${aiDock()}`);
  }

  const copy = {
    setup: { number: '02', title: '설계 환경 준비', summary: '프로그램을 능숙하게 다루지 못해도 괜찮습니다. 지금은 “열리는지 확인”하는 첫 단계예요.' },
    xschem: { number: '04', title: 'Xschem으로 회로도 그리기', summary: '회로도는 만들고 싶은 회로를 블록과 선으로 표현한 설계 계획입니다.' },
    simulate: { number: '05', title: '회로 시뮬레이션', summary: '실제로 만들기 전에, 컴퓨터 안에서 회로가 예상대로 동작하는지 미리 확인합니다.' },
    layout: { number: '06', title: 'Magic으로 레이아웃 그리기', summary: '레이아웃은 회로도를 실제 칩 위에 놓을 수 있는 모양과 배선으로 바꾸는 작업입니다.' },
  }[stageId] ?? { number: '01', title: '시작 전 안내', summary: 'MyChip의 전체 여정을 먼저 살펴보세요.' };

  return workspaceShell(`
    <header class="page-header"><button class="back-link" data-action="dashboard">← 대시보드</button><p class="eyebrow">${copy.number} · STEP GUIDE</p><h1>${copy.title}</h1><p>${copy.summary}</p></header>
    <section class="step-content"><article class="guide-card"><p class="section-overline">WHAT TO DO NOW</p><h2>이 단계에서 하는 일</h2><ol><li>연구노트 또는 담당자가 제공한 안내를 먼저 엽니다.</li><li>한 작업만 수행한 뒤, 화면에 보인 결과를 확인합니다.</li><li>정상인지 판단하기 어렵다면 캡처와 함께 AI 가이드에 질문합니다.</li></ol></article><article class="guide-card accent"><p class="section-overline">DON'T GET STUCK ALONE</p><h2>“뭘 모르겠는지 모르겠어요”도 충분한 질문이에요.</h2><p>방금 무엇을 누르거나 입력했는지, 무엇을 기대했는지, 실제 화면에는 무엇이 나왔는지만 알려 주세요. AI가 다음 질문을 함께 정리합니다.</p><button class="primary-button" data-action="open-ai">AI 가이드 열기 <span>→</span></button></article></section>
    ${stageId === 'setup' ? `<section class="panel full-checklist"><div class="panel-title"><div><p class="section-overline">CHECK AS YOU GO</p><h2>환경 준비 체크리스트</h2></div><span>${progress()}%</span></div>${checklistMarkup()}<div class="local-file"><label for="stage-file">화면 캡처 또는 설계 파일 기록</label><input id="stage-file" type="file" /><small>이 초기 버전은 선택한 파일 이름만 이 기기에 기록합니다. 실제 업로드 저장소는 다음 연결 단계에서 추가됩니다.</small></div></section>` : ''}
    ${aiDock()}`);
}

function submissionView() {
  return workspaceShell(`
    <header class="page-header"><button class="back-link" data-action="dashboard">← 대시보드</button><p class="eyebrow">10 · FINAL SUBMISSION</p><h1>최종 제출</h1><p>실제 제출 항목과 파일 규칙은 사업 회차마다 달라질 수 있어요. 이 화면은 담당자가 설정한 항목을 보여주는 자리입니다.</p></header>
    <section class="submission-layout"><form class="submission-form panel" id="submission-form"><div class="panel-title"><div><p class="section-overline">REQUIRED ITEMS</p><h2>제출 전 확인</h2></div>${state.submitted ? '<span class="status approved">제출 완료</span>' : '<span class="status drafting">작성 중</span>'}</div><label>설계 설명 <em>필수</em><textarea id="submission-note" placeholder="무엇을 만들었고, 어떤 동작을 기대하는지 쉬운 말로 적어 주세요.">${escapeHtml(state.submissionNote)}</textarea></label><label>최종 설계 파일 <em>필수</em><input id="submission-file" type="file" /><small id="file-name">${state.submissionFile ? `선택됨: ${escapeHtml(state.submissionFile)}` : '사업별 실제 파일 형식은 담당자 공지에 따라 설정됩니다.'}</small></label><button class="primary-button" type="submit" ${state.submitted ? 'disabled' : ''}>${state.submitted ? '제출이 완료되었습니다' : '최종 제출하기'} <span>→</span></button><p id="submission-message" class="form-hint"></p></form><aside class="review-note"><p class="section-overline">WHAT HAPPENS NEXT</p><h2>제출 뒤에는</h2><ol><li>관리자가 파일과 설명을 확인합니다.</li><li>필요하면 반려 사유와 함께 재제출을 요청합니다.</li><li>승인 후에는 제작·패키징 상태를 확인할 수 있습니다.</li></ol><p>현재 사업의 공식 파일 규격은 이 데모에 포함되어 있지 않습니다. 자료가 등록된 뒤에만 고정합니다.</p></aside></section>`);
}

function deliveryView() {
  return workspaceShell(`
    <header class="page-header"><button class="back-link" data-action="dashboard">← 대시보드</button><p class="eyebrow">11 · FROM FAB TO TEST</p><h1>제작 · 배송 · 칩 테스트</h1><p>최종 승인 뒤에는 제작 상태를 확인하고, 배송 요청이 열렸을 때만 수령 정보를 입력합니다.</p></header>
    <section class="fulfillment-card"><div class="fulfillment-row current"><span>01</span><div><b>최종 제출</b><p>${state.submitted ? '제출됨 · 관리자 검토 대기' : '아직 제출 전'}</p></div></div><div class="fulfillment-row"><span>02</span><div><b>칩 제작</b><p>관리자가 제작 진행 상태를 알려드려요.</p></div></div><div class="fulfillment-row"><span>03</span><div><b>배송 정보 요청</b><p>이 단계가 열리면 수령인과 주소를 입력해요.</p></div></div><div class="fulfillment-row"><span>04</span><div><b>수령 및 테스트</b><p>칩을 받은 뒤, 연결 방법과 측정 결과를 기록해요.</p></div></div></section>`);
}

function aiDock() {
  const messages = state.aiMessages
    .map((message) => `<div class="message ${message.role}"><p>${escapeHtml(message.text)}</p>${message.source ? `<small>${escapeHtml(message.source)}</small>` : ''}${message.sources?.length ? `<ul class="message-citations">${message.sources.map((source) => `<li><b>${escapeHtml(source.title)} · ${escapeHtml(source.citation)}</b>${source.excerpt ? `<span>${escapeHtml(source.excerpt)}</span>` : ''}</li>`).join('')}</ul>` : ''}</div>`)
    .join('');
  return `<section class="ai-dock" id="ai-dock"><div class="ai-heading"><div><span class="ai-orb">✦</span><div><p class="section-overline">MYCHIP GUIDE</p><h2>무엇을 물어봐야 할지 몰라도 괜찮아요.</h2></div></div><span class="demo-badge">자료 연결 전 데모</span></div><div class="quick-prompts"><button data-prompt="프로그램이 실행되지 않아요">프로그램이 실행되지 않아요</button><button data-prompt="무엇이 문제인지 모르겠어요">무엇이 문제인지 모르겠어요</button><button data-prompt="DRC가 무엇인가요?">DRC가 무엇인가요?</button></div><div class="message-list">${messages}</div><form id="ai-form" class="ai-form"><input id="ai-input" placeholder="예: Magic을 열었는데 화면이 비어 있어요" /><button class="primary-button" type="submit">질문 보내기 <span>→</span></button></form><p class="ai-note">실제 RAG 답변은 제공된 연구노트·FAQ를 먼저 근거로 하고, 근거가 없으면 일반 안내임을 표시합니다.</p></section>`;
}

function answerFor(question) {
  const lower = question.toLowerCase();
  if (lower.includes('drc')) return { text: 'DRC는 레이아웃에서 선의 폭이나 간격 같은 공정 규칙을 지켰는지 확인하는 자동 안전 점검이에요. 먼저 오류 목록의 이름과 표시된 위치를 캡처해 주세요. 규칙값은 사업별 연구노트나 PDK 안내에서만 확인해야 합니다.', source: '초기 일반 안내 · 공식 규칙 아님' };
  if (lower.includes('실행') || lower.includes('열') || lower.includes('안 돼')) return { text: '원인을 바로 단정하지 않을게요. ① 지금 어떤 프로그램을 열려 했는지 ② 입력한 명령어나 누른 버튼 ③ 화면에 나온 메시지 전체 ④ Ubuntu인지 다른 환경인지 순서로 알려 주세요. 가능하면 화면 캡처도 함께 올려 주세요.', source: '초기 진단 흐름 · 연구노트 연결 전' };
  return { text: '좋아요. 문제를 한 문장으로 잘 적어 주셨어요. 다음으로 “방금 하려던 일”, “기대한 결과”, “실제로 보인 화면이나 오류”를 알려 주세요. 이 세 가지가 있으면 담당자에게 전달할 때도 훨씬 빨라집니다.', source: '초기 진단 흐름 · 연구노트 연결 전' };
}

function staffView() {
  return workspaceShell(`
    <header class="workspace-header"><div><p class="eyebrow">STAFF VIEW · DEMO</p><h1>참가팀 현황</h1><p>한 명의 담당자가 모든 팀의 진도와 도움 요청을 빠르게 훑어볼 수 있는 화면입니다.</p></div><button class="support-button" data-action="dashboard">팀 화면 보기</button></header>
    <section class="metric-grid"><article><span>참가팀</span><b>24</b><small>이번 사이클</small></article><article><span>도움 요청</span><b>4</b><small>답변 대기</small></article><article><span>최종 제출</span><b>3</b><small>검토 필요</small></article><article><span>장기간 미접속</span><b>2</b><small>7일 이상</small></article></section>
    <section class="panel team-table"><div class="panel-title"><div><p class="section-overline">TEAM OVERVIEW</p><h2>팀 목록</h2></div><span class="status drafting">데모 데이터</span></div><div class="table-head"><span>팀</span><span>현재 단계</span><span>진행률</span><span>최종 제출</span></div><div class="table-row"><span><b>${DEMO_TEAM.name}</b><small>${DEMO_TEAM.serial}</small></span><span>설계 환경 준비</span><span><div class="mini-track"><i style="width:${progress()}%"></i></div>${progress()}%</span><span>${state.submitted ? '제출 완료' : '작성 중'}</span></div><div class="table-row"><span><b>실리콘 새싹팀</b><small>MC26-R2M8-L6W1</small></span><span>회로 시뮬레이션</span><span><div class="mini-track"><i style="width:48%"></i></div>48%</span><span>작성 중</span></div></section>`);
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
  if (sourceBadge) sourceBadge.textContent = '연구노트 1·2·5·6·7 연결됨';
  const aiNote = document.querySelector('.ai-note');
  if (aiNote) aiNote.textContent = '답변 아래에 근거 연구노트와 페이지를 표시합니다. 자료에 없는 공식 규칙은 답변하지 않습니다.';
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
  document.querySelector('#submission-form')?.addEventListener('submit', (event) => { event.preventDefault(); state.submissionNote = document.querySelector('#submission-note').value; const message = document.querySelector('#submission-message'); if (!canSubmitFinalWork([{ required: true, value: state.submissionNote }, { required: true, value: state.submissionFile }])) { message.textContent = '설계 설명과 최종 설계 파일을 모두 입력한 뒤 제출할 수 있어요.'; return; } state.submitted = true; saveState(); remoteStore?.saveFinalSubmission(DEMO_TEAM.serial, { note: state.submissionNote, fileName: state.submissionFile }).catch(() => {}); render(); });
  document.querySelector('#stage-file')?.addEventListener('change', (event) => { const file = event.target.files[0]; if (file) event.target.nextElementSibling.textContent = `선택됨: ${file.name} · 실제 저장은 다음 연결 단계에서 지원됩니다.`; });
}

function accessSerial() {
  const input = document.querySelector('#serial-input');
  const message = document.querySelector('#serial-message');
  if (findDemoTeamBySerial(input.value)) markView('dashboard');
  else message.innerHTML = '시리얼 번호를 확인해 주세요. 데모 번호는 <code>MC26-A7K4-P9Q2</code>입니다.';
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
        title: `연구노트 ${chunk.number} · ${chunk.title}`,
        citation: `p. ${chunk.page}`,
        excerpt: `${chunk.text.slice(0, 180)}…`,
      }))
    : preferredSources;
  const answer = answerFor(question);
  state.aiMessages.push({
    role: 'assistant',
    ...answer,
    source: sources.length ? '연구노트 기반 안내' : answer.source,
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
