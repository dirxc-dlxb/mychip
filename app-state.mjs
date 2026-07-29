Exit code: 0
Wall time: 1.3 seconds
Output:
export const DEMO_TEAM = {
  serial: 'MC26-A7K4-P9Q2',
  name: '?ㅻ줈??移⑺?',
  school: '?쒓뎅??숆탳',
  department: '?꾩옄怨듯븰怨?,
};

export const KNOWLEDGE_SOURCES = [
  {
    id: 'note-1',
    title: '?곌뎄?명듃 1 쨌 媛??癒몄떊 由щ늼???ㅼ튂',
    citation: 'pp. 2-6',
  },
  {
    id: 'note-2',
    title: '?곌뎄?명듃 2 쨌 ?ㅽ뵂-?뚯뒪 諛섎룄泥??ㅺ퀎 ?꾧뎄 ?ㅼ튂',
    citation: 'pp. 2, 5-12',
  },
  {
    id: 'note-5',
    title: '?곌뎄?명듃 5 쨌 CMOS ?몃쾭???뚮줈???묒꽦怨?SPICE ?쒕??덉씠??,
    citation: 'pp. 2, 4-17',
  },
  {
    id: 'note-6',
    title: '?곌뎄?명듃 6 쨌 CMOS ?몃쾭???덉씠?꾩썐 洹몃━湲곗? SPICE ?쒕??덉씠??,
    citation: 'pp. 2-3, 13-16',
  },
  {
    id: 'note-7',
    title: '?곌뎄?명듃 7 쨌 ?뚮줈?꾩? ?덉씠?꾩썐?먯꽌 異붿텧???뚮줈??鍮꾧탳(LVS)',
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
    text.includes('?ㅼ튂') ||
    text.includes('vmware') ||
    text.includes('virtualbox')
  ) {
    return KNOWLEDGE_SOURCES.filter((source) => ['note-1', 'note-2'].includes(source.id));
  }

  if (text.includes('xschem') || text.includes('?뚮줈??) || text.includes('spice')) {
    return KNOWLEDGE_SOURCES.filter((source) => source.id === 'note-5');
  }

  if (text.includes('magic') || text.includes('drc') || text.includes('?덉씠?꾩썐')) {
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

