export const STAGE_GUIDES = [
  {
    id: 'welcome',
    label: '시작 전 안내',
    purpose: '이번 프로젝트의 전체 흐름을 한 번 보고, 지금 해야 할 일과 나중에 할 일을 구분합니다.',
    why: '처음에는 설계·제작·배송이 모두 한 덩어리처럼 보입니다. 순서를 알면 현재 단계에만 집중할 수 있습니다.',
    normalResult: '우리 팀의 시리얼 번호와 진행 흐름을 확인했고, 막힐 때 어디에 질문할지 알고 있습니다.',
    commonIssue: '최종 제출 파일 형식이나 사업 일정은 회차마다 다를 수 있습니다. 앱에 없는 규칙은 추측하지 말고 담당자에게 확인합니다.',
    steps: ['팀 시리얼 번호를 확인합니다.', '전체 단계를 위에서 아래로 한 번 훑습니다.', '현재 단계가 설계 환경 준비인지 확인합니다.'],
    checklist: [
      { id: 'serial-confirmed', text: '우리 팀의 시리얼 번호를 확인했어요.' },
      { id: 'flow-reviewed', text: '칩 제작까지의 전체 흐름을 한 번 확인했어요.' },
      { id: 'contact-known', text: '막혔을 때 AI 가이드나 담당자에게 질문할 수 있다는 것을 알아요.' },
    ],
    terms: [],
  },
  {
    id: 'setup',
    label: '설계 환경 준비',
    purpose: 'Ubuntu에서 설계 도구가 열리고, 예제 파일을 한 번 확인할 수 있는 상태를 만듭니다.',
    why: '회로를 그리기 전에 도구가 정상적으로 실행되는지 확인하면 나중에 생길 수 있는 문제를 크게 줄일 수 있습니다.',
    normalResult: '터미널에서 Xschem과 Magic을 각각 실행해 창이 열리고, 예제 파일을 열 수 있습니다.',
    commonIssue: '명령어가 없다는 메시지, 창이 열리지 않음, 파일을 찾지 못함이 자주 발생합니다. 오류 메시지 전체와 방금 입력한 명령어를 함께 기록하세요.',
    steps: ['Ubuntu 환경을 준비합니다.', '디자인 킷과 설치 안내를 확인합니다.', 'Xschem과 Magic을 각각 실행해 봅니다.', '작은 예제 파일을 한 번 엽니다.'],
    checklist: [
      { id: 'ubuntu', text: 'Ubuntu 환경을 준비했어요.' },
      { id: 'toolkit', text: '설계 도구 설치 파일과 디자인 킷 위치를 확인했어요.' },
      { id: 'xschem-run', text: 'Xschem을 실행해 보았어요.' },
      { id: 'magic-run', text: 'Magic을 실행해 보았어요.' },
      { id: 'test-run', text: '간단한 예제를 열어 보았어요.' },
    ],
    terms: [
      { term: 'PDK', definition: '칩 공정에 맞는 설계 규칙·레이어·예제 파일 묶음입니다.', why: '같은 회로라도 어떤 공정으로 만들지에 따라 그리는 규칙이 달라집니다.' },
    ],
  },
  {
    id: 'xschem',
    label: 'Xschem 회로도 작성',
    purpose: '만들고 싶은 회로를 부품과 선으로 표현한 회로도를 작성합니다.',
    why: '회로도는 “어떤 부품을 어떻게 연결할지”를 정하는 설계 계획서입니다. 레이아웃보다 먼저 충분히 확인해야 합니다.',
    normalResult: '필요한 소자가 놓여 있고, 선과 핀 이름이 연결되며, 회로도 파일을 저장했습니다.',
    commonIssue: '소자를 찾지 못하거나 선이 겉보기와 달리 연결되지 않는 일이 많습니다. 핀 이름·전원 이름·선 끝점부터 확인하세요.',
    steps: ['작업 폴더를 만듭니다.', '필요한 소자를 불러와 배치합니다.', '선으로 연결하고 입력·출력·전원에 이름을 붙입니다.', '회로도를 저장한 뒤 화면을 캡처합니다.'],
    checklist: [
      { id: 'xschem-folder', text: '내 회로용 작업 폴더를 만들었어요.' },
      { id: 'xschem-devices', text: '필요한 소자를 회로도에 배치했어요.' },
      { id: 'xschem-wires', text: '선과 핀 라벨을 연결했어요.' },
      { id: 'xschem-save', text: '회로도를 저장하고 화면을 확인했어요.' },
    ],
    terms: [
      { term: '회로도', definition: '부품과 연결을 기호로 그린 설계 계획도입니다.', why: '칩 안의 실제 모양을 그리기 전에 동작을 먼저 검토할 수 있습니다.' },
      { term: '넷리스트', definition: '회로도의 연결 관계를 글자로 풀어쓴 목록입니다.', why: '시뮬레이터가 회로를 계산하려면 기호 그림 대신 연결 정보가 필요합니다.' },
    ],
  },
  {
    id: 'simulate',
    label: '회로 시뮬레이션',
    purpose: '제작 전에 컴퓨터 안에서 회로가 기대한 대로 동작하는지 확인합니다.',
    why: '제작 뒤에 회로를 고치기는 어렵습니다. 먼저 파형과 수치를 보면서 회로도를 수정합니다.',
    normalResult: '시뮬레이션이 끝나고, 입력 변화에 따라 예상한 출력 파형이나 수치가 보입니다.',
    commonIssue: '전원·접지 이름이 빠졌거나, 모델 파일 경로가 맞지 않거나, 테스트 조건이 부족하면 실행 오류나 비정상 파형이 나올 수 있습니다.',
    steps: ['무엇을 확인할지 입력·전원·시간 조건을 정합니다.', '테스트벤치를 작성합니다.', '넷리스트를 만들고 시뮬레이션을 실행합니다.', '파형이 예상과 다른지 비교합니다.'],
    checklist: [
      { id: 'sim-plan', text: '확인할 동작과 입력 조건을 정했어요.' },
      { id: 'sim-testbench', text: '테스트벤치를 준비했어요.' },
      { id: 'sim-run', text: '시뮬레이션을 실행했어요.' },
      { id: 'sim-waveform', text: '출력 파형 또는 결과 수치를 확인했어요.' },
    ],
    terms: [
      { term: '시뮬레이션', definition: '실제 칩을 만들기 전에 컴퓨터로 회로 동작을 계산해 보는 일입니다.', why: '제작 전에 오류를 발견할 수 있습니다.' },
    ],
  },
  {
    id: 'layout',
    label: 'Magic 레이아웃 작성',
    purpose: '회로도를 실제 칩 위에 만들 수 있는 도형과 배선으로 바꿉니다.',
    why: '회로도는 연결 계획이고, 레이아웃은 공장에서 만들 수 있는 실제 모양입니다.',
    normalResult: '정해진 레이어에 소자와 금속 배선이 놓여 있고, 핀과 라벨을 확인할 수 있습니다.',
    commonIssue: '레이어를 잘못 선택하거나, 그리드·간격·컨택을 놓치거나, 핀 라벨이 빠지는 문제가 자주 생깁니다.',
    steps: ['레이어와 그리드가 무엇인지 확인합니다.', '전체 공간에서 블록 위치를 먼저 계획합니다.', '소자와 배선을 그립니다.', '입출력 핀과 라벨을 확인합니다.'],
    checklist: [
      { id: 'layout-layers', text: '레이어와 그리드의 역할을 확인했어요.' },
      { id: 'layout-plan', text: '회로 블록을 어디에 둘지 대략 계획했어요.' },
      { id: 'layout-draw', text: '소자와 배선을 그렸어요.' },
      { id: 'layout-pins', text: '핀과 라벨을 확인했어요.' },
    ],
    terms: [
      { term: '레이아웃', definition: '칩 위에 만들 도형·층·배선을 실제 크기로 그린 도면입니다.', why: '공정 장비가 이 도면을 바탕으로 칩을 만듭니다.' },
      { term: '레이어', definition: '칩의 서로 다른 재료층을 구분하는 그림 도구입니다.', why: '금속선, 절연층, 트랜지스터 영역은 같은 층에 그리면 안 됩니다.' },
    ],
  },
  {
    id: 'verify',
    label: 'DRC · LVS 검증',
    purpose: '레이아웃이 공정 규칙을 지켰고 회로도와 같은 연결인지 확인합니다.',
    why: '눈으로 보기에는 맞아도 선 간격, 핀 이름, 연결이 실제 공정 규칙과 다를 수 있습니다.',
    normalResult: 'DRC 오류 목록이 비어 있거나 검토 가능한 상태이고, LVS가 회로도와 레이아웃의 일치를 알려 줍니다.',
    commonIssue: 'DRC는 폭·간격·겹침 문제, LVS는 핀 이름·핀 순서·연결 누락 문제에서 자주 시작됩니다.',
    steps: ['DRC를 실행해 오류 이름과 위치를 봅니다.', '오류를 하나씩 고친 뒤 다시 실행합니다.', '레이아웃 넷리스트를 추출합니다.', '회로도 넷리스트와 비교해 LVS 결과를 확인합니다.'],
    checklist: [
      { id: 'verify-drc-run', text: 'DRC를 실행하고 오류 목록을 확인했어요.' },
      { id: 'verify-drc-fix', text: '확인한 DRC 오류를 수정하거나 담당자에게 질문했어요.' },
      { id: 'verify-extract', text: '레이아웃에서 넷리스트를 추출했어요.' },
      { id: 'verify-lvs-run', text: 'LVS 비교 결과를 확인했어요.' },
    ],
    terms: [
      { term: 'DRC', definition: '레이아웃이 공정의 선 폭·간격 같은 규칙을 지켰는지 보는 자동 안전 점검입니다.', why: '공장에서 실제로 만들 수 있는 모양인지 확인합니다.' },
      { term: 'LVS', definition: '회로도와 레이아웃에서 뽑은 연결 목록이 같은지 비교하는 검사입니다.', why: '그린 모양이 원래 계획한 회로와 다른 실수를 찾습니다.' },
      { term: 'GDS', definition: '칩 공정에 전달하는 최종 레이아웃 파일 형식입니다.', why: '공정 장비가 레이아웃 정보를 읽을 수 있게 합니다.' },
    ],
  },
  {
    id: 'submit',
    label: '최종 파일 제출',
    purpose: '사업 회차에서 요구하는 설계 설명과 최종 파일을 한 번에 정리해 제출합니다.',
    why: '제출물은 제작·검토를 위해 팀과 설계 내용을 식별하는 기록입니다.',
    normalResult: '설계 설명과 필요한 파일을 선택했고, 제출 상태가 제출 완료로 바뀝니다.',
    commonIssue: '실제 파일 형식과 이름 규칙은 회차별 공고가 기준입니다. 앱에 고정된 규칙이 없으면 담당자 확인이 먼저입니다.',
    steps: ['회차별 제출 요구사항을 확인합니다.', '내가 만든 회로와 동작을 쉬운 말로 설명합니다.', '최종 파일을 선택합니다.', '제출 전 내용을 다시 확인합니다.'],
    checklist: [
      { id: 'submit-requirements', text: '이번 회차의 제출 요구사항을 확인했어요.' },
      { id: 'submit-description', text: '내 설계의 목적과 동작을 설명했어요.' },
      { id: 'submit-files', text: '제출할 최종 파일을 준비했어요.' },
      { id: 'submit-review', text: '제출 전에 파일과 설명을 다시 확인했어요.' },
    ],
    terms: [],
  },
  {
    id: 'delivery',
    label: '제작 · 배송 · 칩 테스트',
    purpose: '제작 진행 상태를 확인하고, 칩 수령 뒤 테스트 결과를 기록합니다.',
    why: '칩이 도착한 뒤에는 수령 정보, 패키지 상태, 테스트 조건과 결과가 프로젝트의 마지막 기록이 됩니다.',
    normalResult: '제작 상태와 수령 요청을 확인하고, 칩 테스트 결과나 다음 준비 작업을 기록합니다.',
    commonIssue: '배송 정보 요청 전에는 주소를 입력하지 않습니다. 테스트 방법은 칩 종류와 제공 자료에 따라 달라 담당자 안내가 필요할 수 있습니다.',
    steps: ['제작·패키징 상태를 확인합니다.', '배송 정보 요청이 오면 수령 정보를 입력합니다.', '칩을 수령하면 패키지와 표기를 확인합니다.', '테스트 조건과 결과를 기록합니다.'],
    checklist: [
      { id: 'delivery-status', text: '제작 또는 배송 상태를 확인했어요.' },
      { id: 'delivery-address', text: '배송 정보 요청이 왔을 때 수령 정보를 확인할 준비가 되었어요.' },
      { id: 'delivery-received', text: '칩을 수령하고 외관·표기를 확인했어요.' },
      { id: 'delivery-test', text: '테스트 조건과 결과를 기록했어요.' },
    ],
    terms: [],
  },
];

export function getStageGuide(stageId) {
  return STAGE_GUIDES.find((stage) => stage.id === stageId) ?? STAGE_GUIDES[0];
}

export function createInitialChecks() {
  return Object.fromEntries(
    STAGE_GUIDES.flatMap((stage) => stage.checklist.map((item) => [item.id, false])),
  );
}

export function stageChecklistProgress(stageId, checks) {
  const items = getStageGuide(stageId).checklist;
  const completed = items.filter((item) => checks[item.id]).length;
  return Math.round((completed / items.length) * 100);
}

export function overallChecklistProgress(checks) {
  const items = STAGE_GUIDES.flatMap((stage) => stage.checklist);
  const completed = items.filter((item) => checks[item.id]).length;
  return Math.round((completed / items.length) * 100);
}

export function diagnoseQuestion(question, stage) {
  const text = String(question).toLowerCase();
  if (text.includes('drc')) {
    return 'DRC는 레이아웃의 선 폭·간격 같은 공정 규칙을 지켰는지 보는 자동 안전 점검이에요. 오류 이름과 표시된 위치를 먼저 확인하세요. 다음: 오류 목록과 화면 캡처를 남기고, 한 항목씩 수정한 뒤 DRC를 다시 실행해 보세요.';
  }
  if (text.includes('lvs') || text.includes('netgen')) {
    return 'LVS는 회로도와 레이아웃의 연결이 같은지 비교하는 검사예요. 다음: 회로도와 레이아웃에서 각각 어떤 넷리스트를 만들었는지, 핀 이름과 순서가 같은지부터 확인하세요.';
  }
  if (text.includes('실행') || text.includes('안 돼') || text.includes('오류')) {
    return `${stage.label} 단계에서 멈췄군요. 바로 원인을 단정하지 않겠습니다. 다음: 방금 누른 버튼이나 입력한 명령어, 화면에 나온 문구 전체, 기대한 결과를 차례로 알려 주세요. 가능하면 화면 캡처도 첨부하세요.`;
  }
  return `${stage.label} 단계입니다. ${stage.purpose} 다음: 지금 하려는 작업과 실제로 화면에 보인 결과를 한 문장으로 적어 주세요. 필요한 정보를 제가 차례로 물어볼게요.`;
}
