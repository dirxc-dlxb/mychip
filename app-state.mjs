export const DEMO_TEAM = {
  serial: 'MC26-A7K4-P9Q2',
  name: '오로라 칩팀',
  school: '한국대학교',
  department: '전자공학과',
};

export const KNOWLEDGE_SOURCES = [
  {
    id: 'note-1',
    title: '연구노트 1 · 가상 머신 리눅스 설치',
    citation: 'pp. 2-6',
  },
  {
    id: 'note-2',
    title: '연구노트 2 · 오픈-소스 반도체 설계 도구 설치',
    citation: 'pp. 2, 5-12',
  },
  {
    id: 'note-5',
    title: '연구노트 5 · CMOS 인버터 회로도 작성과 SPICE 시뮬레이션',
    citation: 'pp. 2, 4-17',
  },
  {
    id: 'note-6',
    title: '연구노트 6 · CMOS 인버터 레이아웃 그리기와 SPICE 시뮬레이션',
    citation: 'pp. 2-3, 13-16',
  },
  {
    id: 'note-7',
    title: '연구노트 7 · 회로도와 레이아웃에서 추출한 회로의 비교(LVS)',
    citation: 'pp. 2-5, 8-11',
  },
];

export function calculateProgress(items) {
  if (items.length === 0) return 0;

  const completed = items.filter((item) => item.completed).length;
  return Math.round((completed / items.length) * 100);
}

export function canSubmitFinalWork(requirements) {
  return requirements
    .filter((requirement) => requirement.required)
    .every((requirement) => String(requirement.value ?? '').trim().length > 0);
}

export function findDemoTeamBySerial(serial) {
  const normalized = String(serial).trim().toUpperCase();
  return normalized === DEMO_TEAM.serial ? DEMO_TEAM : null;
}

export function findKnowledgeSources(question) {
  const text = String(question).toLowerCase();

  if (text.includes('lvs') || text.includes('netgen')) {
    return KNOWLEDGE_SOURCES.filter((source) => source.id === 'note-7');
  }

  if (
    text.includes('ubuntu') ||
    text.includes('설치') ||
    text.includes('vmware') ||
    text.includes('virtualbox')
  ) {
    return KNOWLEDGE_SOURCES.filter((source) => ['note-1', 'note-2'].includes(source.id));
  }

  if (text.includes('xschem') || text.includes('회로도') || text.includes('spice')) {
    return KNOWLEDGE_SOURCES.filter((source) => source.id === 'note-5');
  }

  if (text.includes('magic') || text.includes('drc') || text.includes('레이아웃')) {
    return KNOWLEDGE_SOURCES.filter((source) => source.id === 'note-6');
  }

  return [];
}

export function rankKnowledgeChunks(question, chunks, limit = 3, preferredDocumentIds = []) {
  const terms = [...new Set(
    String(question)
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu)
      ?.filter((term) => term.length > 1) ?? [],
  )];

  return chunks
    .map((chunk) => {
      const text = String(chunk.text).toLowerCase();
      const keywordScore = terms.reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0);
      const score = keywordScore + (preferredDocumentIds.includes(chunk.documentId) ? 3 : 0);
      return { ...chunk, score };
    })
    .filter((chunk) => chunk.score > 0)
    .sort((left, right) => right.score - left.score || left.page - right.page)
    .slice(0, limit);
}
