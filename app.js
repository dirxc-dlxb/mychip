import {
  DEMO_TEAM,
  canSubmitFinalWork,
  findDemoTeamBySerial,
  findKnowledgeSources,
  rankKnowledgeChunks,
  selectParticipantStage,
} from './app-state.mjs';
import {
  createInitialChecks,
  diagnoseQuestion,
  getStageGuide,
  overallChecklistProgress,
  stageChecklistProgress,
  STAGE_GUIDES,
} from './guide-data.mjs';
import { createRemoteStore, isRemoteStoreConfigured } from './supabase-store.mjs';

const app = document.querySelector('#app');
const storageKey = 'mychip-demo-state-v2';
const remoteConfig = window.MYCHIP_REMOTE_CONFIG ?? {};
const remoteStore = isRemoteStoreConfigured(remoteConfig) ? createRemoteStore(remoteConfig) : null;

const initialState = {
  view: 'landing',
  activeStage: 'setup',
  checks: createInitialChecks(),
  submitted: false,
  submissionNote: '',
  submissionFile: '',
  aiPanelOpen: false,
  aiMessages: [{
    role: 'assistant',
    text: '막힌 부분을 같이 찾아볼게요. 지금은 설계 환경 준비 단계예요. 무엇을 하려다 멈췄는지 알려 주세요.',
    source: '초기 안내 콘텐츠 · 공식 규칙 아님',
  }],
};

let state = loadState();
let knowledgeCorpus = { chunks: [] };

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return { ...initialState, ...saved, checks: { ...createInitialChecks(), ...(saved?.checks ?? {}) } };
  } catch {
    return { ...initialState, checks: createInitialChecks() };
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function totalProgress() {
  return overallChecklistProgress(state.checks);
}

function updateView(view) {
  state.view = view;
  saveState();
  render();
}

const guideStartEventKey = 'mychip-guide-started';
const guideStartRetryDelays = [0, 250, 500, 1000, 2000];
let guideStartQueued = false;

function trackGuideStarted(entryPoint) {
  if (window.location.hostname !== 'mychip.vercel.app') return;
  if (guideStartQueued || sessionStorage.getItem(guideStartEventKey)) return;

  guideStartQueued = true;

  const sendWhenReady = (attempt = 0) => {
    if (typeof window.rybbit?.trackEvent === 'function') {
      window.rybbit.trackEvent('guide_started', { entry_point: entryPoint });
      sessionStorage.setItem(guideStartEventKey, '1');
      return;
    }

    if (attempt === guideStartRetryDelays.length - 1) {
      guideStartQueued = false;
      return;
    }

    window.setTimeout(() => sendWhenReady(attempt + 1), guideStartRetryDelays[attempt + 1]);
  };

  sendWhenReady();
}

function landingView() {
  return `
    <section class="landing">
      <nav class="topbar"><a class="brand" href="#" data-action="home"><span>MC</span> MyChip 참여 가이드</a><span class="topbar-note">2026 MyChip · 참가팀 전용</span></nav>
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">FIRST CHIP, STEP BY STEP</p>
          <h1>처음 만드는<br /><em>나만의 칩</em></h1>
          <p class="hero-text">설계 환경 준비부터 회로도, 레이아웃, 검증과 제출까지. 연구노트를 따로 찾지 않아도 지금 필요한 설명과 다음 행동을 앱에서 바로 확인합니다.</p>
          <div class="serial-card"><label for="serial-input">참가팀 시리얼 번호</label><div class="serial-row"><input id="serial-input" autocomplete="off" placeholder="예: MC26-A7K4-P9Q2" /><button class="primary-button" data-action="access">시작하기 <span>→</span></button></div><p id="serial-message" class="form-hint">시리얼 번호가 없다면 담당자에게 문의하세요. <button class="text-button" data-action="demo">데모로 둘러보기</button></p></div>
        </div>
        <div class="hero-art" aria-label="칩 설계 과정의 추상 그래픽"></div>
      </div>
      <section class="promise-grid"><article><b>01</b><h2>지금 할 일</h2><p>모든 단계에 체크리스트가 있어, 현재 해야 할 작업만 확인할 수 있어요.</p></article><article><b>02</b><h2>앱 안의 쉬운 설명</h2><p>DRC 같은 낯선 말도 뜻·이유·정상 결과·흔한 오류까지 함께 설명해요.</p></article><article><b>03</b><h2>단계별 오류 진단</h2><p>무엇을 물어봐야 할지 몰라도 현재 단계에 맞춰 다음 질문을 안내해요.</p></article></section>
    </section>`;
}

function stageStatus(stage, index) {
  if (index === 0) return 'done';
  if (stage.id === state.activeStage) return 'current';
  return 'next';
}

function stageList() {
  return STAGE_GUIDES.map((stage, index) => {
    const status = stageStatus(stage, index);
    return `<button class="stage-nav ${stage.id === state.activeStage ? 'active' : ''} ${status}" data-stage="${stage.id}"><span class="stage-number">${String(index + 1).padStart(2, '0')}</span><span>${stage.label}</span><i>${status === 'done' ? '✓' : '→'}</i></button>`;
  }).join('');
}

function workspaceShell(content) {
  return `
    <section class="workspace">
      <aside class="sidebar"><button class="brand sidebar-brand" data-action="home"><span>MC</span> MyChip</button><div class="team-chip"><span class="team-dot"></span><div><strong>${escapeHtml(DEMO_TEAM.name)}</strong><small>${escapeHtml(DEMO_TEAM.school)} · ${escapeHtml(DEMO_TEAM.department)}</small></div></div><div class="progress-block"><div class="progress-label"><span>전체 진행률</span><strong>${totalProgress()}%</strong></div><div class="progress-track"><span style="width:${totalProgress()}%"></span></div><p>작은 체크 하나가 다음 단계의 길을 만듭니다.</p></div><nav class="stage-nav-list" aria-label="진행 단계">${stageList()}</nav><button class="exit-button" data-action="home">다른 시리얼 번호로 접속</button></aside>
      <div class="workspace-main">${content}</div>
    </section>
    ${state.aiPanelOpen ? assistantPanel() : ''}`;
}

function checklistMarkup(stageId) {
  const guide = getStageGuide(stageId);
  const percent = stageChecklistProgress(stageId, state.checks);
  return `<section class="panel full-checklist"><div class="panel-title"><div><p class="section-overline">CHECK AS YOU GO</p><h2>${guide.label} 체크리스트</h2></div><span>${percent}%</span></div><div class="checklist">${guide.checklist.map((item) => `<label class="check-item ${state.checks[item.id] ? 'checked' : ''}"><input type="checkbox" data-check="${item.id}" ${state.checks[item.id] ? 'checked' : ''}/><span class="checkbox-icon">${state.checks[item.id] ? '✓' : ''}</span><span>${item.text}</span></label>`).join('')}</div></section>`;
}

function termsMarkup(terms) {
  if (!terms.length) return '';
  return `<section class="term-grid">${terms.map((item) => `<article class="term-card"><p class="term-name">${item.term}</p><h3>${item.definition}</h3><dl><dt>왜 필요한가요?</dt><dd>${item.why}</dd><dt>정상이라면</dt><dd>이 단계의 체크리스트를 마쳤고, 다음 단계로 넘어가기 전에 결과를 다시 확인할 수 있어요.</dd><dt>자주 막히는 경우</dt><dd>말의 뜻이 어렵거나, 화면에서 무엇을 눌러야 할지 모를 수 있어요. AI 가이드에 현재 화면과 한 일을 알려 주세요.</dd></dl></article>`).join('')}</section>`;
}

function guideContent(stageId) {
  const guide = getStageGuide(stageId);
  return `
    <section class="step-content">
      <article class="guide-card"><p class="section-overline">WHAT TO DO NOW</p><h2>이 단계에서 하는 일</h2><ol>${guide.steps.map((step) => `<li>${step}</li>`).join('')}</ol></article>
      <article class="guide-card accent"><p class="section-overline">WHY THIS MATTERS</p><h2>${guide.why}</h2><p><b>정상 결과:</b> ${guide.normalResult}</p><p><b>자주 막히는 경우:</b> ${guide.commonIssue}</p><button class="primary-button" data-action="open-ai">이 단계 도움받기 <span>→</span></button></article>
    </section>
    ${termsMarkup(guide.terms)}
    ${checklistMarkup(stageId)}`;
}

function dashboardView() {
  const guide = getStageGuide(state.activeStage);
  return workspaceShell(`
    <header class="workspace-header"><div><p class="eyebrow">${escapeHtml(DEMO_TEAM.serial)}</p><h1>안녕하세요, ${escapeHtml(DEMO_TEAM.name)}!</h1><p>현재 단계는 <b>${guide.label}</b>입니다. 체크리스트를 따라가고, 막히면 이 단계 도움받기를 눌러 주세요.</p></div><button class="support-button" data-action="open-ai">AI 가이드 열기 <span>→</span></button></header>
    <section class="next-step-card"><div class="badge">현재<br/>단계</div><div><p class="section-overline">${String(STAGE_GUIDES.findIndex((stage) => stage.id === guide.id) + 1).padStart(2, '0')} · ${guide.label}</p><h2>${guide.purpose}</h2><p>정상 결과: ${guide.normalResult}</p></div><button class="primary-button" data-stage="${guide.id}">단계 열기 <span>→</span></button></section>
    <section class="dashboard-grid"><article class="panel checklist-panel"><div class="panel-title"><div><p class="section-overline">NEXT TO DO</p><h2>다음 할 일</h2></div><span>${stageChecklistProgress(guide.id, state.checks)}%</span></div><div class="checklist">${guide.checklist.slice(0, 3).map((item) => `<div class="check-item ${state.checks[item.id] ? 'checked' : ''}"><span class="checkbox-icon">${state.checks[item.id] ? '✓' : ''}</span><span>${item.text}</span></div>`).join('')}</div></article><article class="panel glossary-panel"><p class="section-overline">WORDS, SIMPLY</p><h2>처음 보는 말인가요?</h2><p>전문 용어는 외우는 것보다 <b>왜 필요한지</b> 이해하면 충분해요.</p><button class="glossary-link" data-stage="verify"><span>DRC</span><i>칩 공정 규칙을 지켰는지 보는 안전 점검</i><b>→</b></button><button class="glossary-link" data-stage="verify"><span>LVS</span><i>회로도와 레이아웃이 같은지 보는 비교 검사</i><b>→</b></button></article></section>
    ${aiDock()}`);
}

function stageView(stageId) {
  if (stageId === 'submit') return submissionView();
  if (stageId === 'delivery') return deliveryView();
  const guide = getStageGuide(stageId);
  return workspaceShell(`<header class="page-header"><button class="back-link" data-action="dashboard">← 대시보드</button><p class="eyebrow">STEP GUIDE</p><h1>${guide.label}</h1><p>${guide.purpose}</p></header>${guideContent(stageId)}${aiDock()}`);
}

function submissionView() {
  const guide = getStageGuide('submit');
  return workspaceShell(`<header class="page-header"><button class="back-link" data-action="dashboard">← 대시보드</button><p class="eyebrow">FINAL SUBMISSION</p><h1>최종 파일 제출</h1><p>${guide.purpose}</p></header>${guideContent('submit')}<section class="submission-layout"><form class="submission-form panel" id="submission-form"><div class="panel-title"><div><p class="section-overline">REQUIRED ITEMS</p><h2>제출 내용</h2></div>${state.submitted ? '<span class="status approved">제출 완료</span>' : '<span class="status drafting">작성 중</span>'}</div><label>설계 설명 <em>필수</em><textarea id="submission-note" placeholder="무엇을 만들었고, 어떤 동작을 기대하는지 쉬운 말로 적어 주세요.">${escapeHtml(state.submissionNote)}</textarea></label><label>최종 설계 파일 <em>필수</em><input id="submission-file" type="file" /><small id="file-name">${state.submissionFile ? `선택됨: ${escapeHtml(state.submissionFile)}` : '실제 파일 형식은 회차별 공고 또는 담당자 안내를 기준으로 확인하세요.'}</small></label><button class="primary-button" type="submit" ${state.submitted ? 'disabled' : ''}>${state.submitted ? '제출이 완료되었어요' : '최종 제출하기'} <span>→</span></button><p id="submission-message" class="form-hint"></p></form><aside class="review-note"><p class="section-overline">WHAT HAPPENS NEXT</p><h2>제출 뒤에는?</h2><ol><li>관리자가 파일과 설명을 확인합니다.</li><li>수정이 필요하면 반려 사유와 함께 재제출을 요청합니다.</li><li>승인 뒤 제작·패키징·배송 상태를 확인합니다.</li></ol><p>공식 파일 규격이 앱에 등록되기 전에는 추측하지 말고 담당자 안내를 우선하세요.</p></aside></section>${aiDock()}`);
}

function deliveryView() {
  const guide = getStageGuide('delivery');
  return workspaceShell(`<header class="page-header"><button class="back-link" data-action="dashboard">← 대시보드</button><p class="eyebrow">FROM FAB TO TEST</p><h1>제작 · 배송 · 칩 테스트</h1><p>${guide.purpose}</p></header>${guideContent('delivery')}<section class="fulfillment-card"><div class="fulfillment-row current"><span>01</span><div><b>최종 제출</b><p>${state.submitted ? '제출 완료 · 관리자 검토 대기' : '아직 최종 제출 전'}</p></div></div><div class="fulfillment-row"><span>02</span><div><b>칩 제작</b><p>관리자가 실제 제작 진행 상태를 업데이트합니다.</p></div></div><div class="fulfillment-row"><span>03</span><div><b>배송 정보 요청</b><p>요청이 열릴 때만 수령 정보를 입력합니다.</p></div></div><div class="fulfillment-row"><span>04</span><div><b>수령 및 테스트</b><p>칩을 받은 뒤 테스트 조건과 결과를 기록합니다.</p></div></div></section>${aiDock()}`);
}

function messageMarkup(messages) {
  return messages.map((message) => `<div class="message ${message.role}"><p>${escapeHtml(message.text)}</p>${message.source ? `<small>${escapeHtml(message.source)}</small>` : ''}${message.sources?.length ? `<ul class="message-citations">${message.sources.map((source) => `<li><b>${escapeHtml(source.title)} · ${escapeHtml(source.citation)}</b><span>${escapeHtml(source.excerpt)}</span></li>`).join('')}</ul>` : ''}</div>`).join('');
}

function aiDock() {
  return `<section class="ai-dock" id="ai-dock"><div class="ai-heading"><div><span class="ai-orb">✦</span><div><p class="section-overline">MYCHIP GUIDE</p><h2>무엇을 물어봐야 할지 몰라도 괜찮아요.</h2></div></div><button class="support-button" data-action="open-ai">가이드 열기</button></div><p class="ai-note">현재 단계의 쉬운 설명과 연구노트 근거를 바탕으로 다음 행동을 안내합니다. 긴 PDF를 먼저 읽을 필요는 없어요.</p></section>`;
}

function assistantPanel() {
  const guide = getStageGuide(state.activeStage);
  return `<div class="assistant-overlay" role="dialog" aria-modal="true" aria-label="${guide.label} 도움 가이드"><section class="assistant-panel"><button class="assistant-close" data-action="close-ai" aria-label="가이드 닫기">×</button><p class="section-overline">${guide.label.toUpperCase()} · IN-APP GUIDE</p><h2>${guide.label} 도움 가이드</h2><p class="assistant-intro"><b>지금 할 일:</b> ${guide.purpose}</p><div class="assistant-summary"><div><b>정상 결과</b><span>${guide.normalResult}</span></div><div><b>흔한 문제</b><span>${guide.commonIssue}</span></div></div><div class="quick-prompts"><button data-panel-prompt="프로그램이 실행되지 않아요">프로그램이 실행되지 않아요</button><button data-panel-prompt="무엇이 문제인지 모르겠어요">무엇이 문제인지 모르겠어요</button>${guide.id === 'verify' ? '<button data-panel-prompt="DRC 오류가 뭔지 모르겠어요">DRC 오류가 뭔지 모르겠어요</button><button data-panel-prompt="LVS가 일치하지 않아요">LVS가 일치하지 않아요</button>' : ''}</div><div class="message-list assistant-message-list">${messageMarkup(state.aiMessages)}</div><form id="assistant-form" class="ai-form"><input id="assistant-input" placeholder="방금 한 작업과 화면에 나온 내용을 적어 주세요" autofocus /><button class="primary-button" type="submit">질문 보내기 <span>→</span></button></form><p class="ai-note">공식 규칙이 자료에 없으면 추측하지 않고 담당자 확인을 안내합니다.</p></section></div>`;
}

function collectSources(question) {
  const preferred = findKnowledgeSources(question);
  const chunks = rankKnowledgeChunks(question, knowledgeCorpus.chunks, 2, preferred.map((source) => source.id));
  return chunks.map((chunk) => ({ title: `연구노트 ${chunk.number}`, citation: `p. ${chunk.page}`, excerpt: chunk.text.slice(0, 170) }));
}

function submitQuestion(question) {
  const cleaned = String(question ?? '').trim();
  if (!cleaned) return;
  const guide = getStageGuide(state.activeStage);
  state.aiMessages.push({ role: 'user', text: cleaned });
  const sources = collectSources(cleaned);
  state.aiMessages.push({ role: 'assistant', text: diagnoseQuestion(cleaned, guide), source: sources.length ? '연구노트 기반 안내' : '현재 단계 안내 · 공식 규칙 아님', sources });
  saveState();
  render();
  requestAnimationFrame(() => document.querySelector(state.aiPanelOpen ? '#assistant-input' : '#ai-dock')?.focus?.());
}

function accessSerial() {
  const input = document.querySelector('#serial-input');
  const message = document.querySelector('#serial-message');
  if (findDemoTeamBySerial(input.value)) {
    trackGuideStarted('serial');
    updateView('dashboard');
  }
  else message.innerHTML = '시리얼 번호를 확인해 주세요. 데모 번호는 <code>MC26-A7K4-P9Q2</code>입니다.';
}

function render() {
  if (state.view === 'landing') app.innerHTML = landingView();
  else if (state.view === 'dashboard') app.innerHTML = dashboardView();
  else app.innerHTML = stageView(state.activeStage);
  bindEvents();
}

function openAssistant() {
  state.aiPanelOpen = true;
  saveState();
  render();
  requestAnimationFrame(() => document.querySelector('#assistant-input')?.focus());
}

function bindEvents() {
  document.querySelectorAll('[data-action="home"]').forEach((button) => button.addEventListener('click', () => updateView('landing')));
  document.querySelectorAll('[data-action="dashboard"]').forEach((button) => button.addEventListener('click', () => updateView('dashboard')));
  document.querySelectorAll('[data-stage]').forEach((button) => button.addEventListener('click', () => { state = selectParticipantStage(state, button.dataset.stage); saveState(); render(); }));
  document.querySelectorAll('[data-check]').forEach((input) => input.addEventListener('change', () => { state.checks[input.dataset.check] = input.checked; saveState(); remoteStore?.saveChecklist(DEMO_TEAM.serial, input.dataset.check, input.checked).catch(() => {}); render(); }));
  document.querySelector('[data-action="demo"]')?.addEventListener('click', () => {
    trackGuideStarted('demo');
    updateView('dashboard');
  });
  document.querySelector('[data-action="access"]')?.addEventListener('click', accessSerial);
  document.querySelector('#serial-input')?.addEventListener('keydown', (event) => { if (event.key === 'Enter') accessSerial(); });
  document.querySelectorAll('[data-action="open-ai"]').forEach((button) => button.addEventListener('click', openAssistant));
  document.querySelector('[data-action="close-ai"]')?.addEventListener('click', () => { state.aiPanelOpen = false; saveState(); render(); });
  document.querySelectorAll('[data-panel-prompt]').forEach((button) => button.addEventListener('click', () => submitQuestion(button.dataset.panelPrompt)));
  document.querySelector('#assistant-form')?.addEventListener('submit', (event) => { event.preventDefault(); const input = document.querySelector('#assistant-input'); submitQuestion(input.value); });
  document.querySelector('#submission-file')?.addEventListener('change', (event) => { state.submissionFile = event.target.files[0]?.name ?? ''; saveState(); render(); });
  document.querySelector('#submission-form')?.addEventListener('submit', (event) => { event.preventDefault(); state.submissionNote = document.querySelector('#submission-note').value; const message = document.querySelector('#submission-message'); if (!canSubmitFinalWork([{ required: true, value: state.submissionNote }, { required: true, value: state.submissionFile }])) { message.textContent = '설계 설명과 최종 설계 파일을 모두 입력해야 제출할 수 있어요.'; return; } state.submitted = true; saveState(); remoteStore?.saveFinalSubmission(DEMO_TEAM.serial, { note: state.submissionNote, fileName: state.submissionFile }).catch(() => {}); render(); });
}

render();

fetch('./knowledge-chunks.json')
  .then((response) => (response.ok ? response.json() : Promise.reject(new Error('knowledge corpus unavailable'))))
  .then((corpus) => { knowledgeCorpus = corpus; })
  .catch(() => {});
