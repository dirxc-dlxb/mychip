Exit code: 0
Wall time: 1.4 seconds
Output:
export function normalizeSerial(serial) {
  return String(serial ?? '').trim().toUpperCase();
}

export function isRemoteStoreConfigured(config) {
  return Boolean(config?.apiUrl?.startsWith('https://') && String(config?.publishableKey ?? '').trim());
}

export function createRemoteStore({ apiUrl, publishableKey, fetchFn = fetch }) {
  async function request(action, payload) {
    const response = await fetchFn(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${publishableKey}`,
        apikey: publishableKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...payload }),
    });

    if (!response.ok) {
      throw new Error('Remote workspace request failed');
    }

    return response.json();
  }

  return {
    getWorkspace(serial) {
      return request('getWorkspace', { serial: normalizeSerial(serial) });
    },
    saveChecklist(serial, checklistItemId, completed) {
      return request('saveChecklist', {
        serial: normalizeSerial(serial),
        checklistItemId,
        completed: Boolean(completed),
      });
    },
    saveTeamProfile(serial, profile) {
      return request('saveTeamProfile', { serial: normalizeSerial(serial), profile });
    },
    saveFinalSubmission(serial, submission) {
      return request('saveFinalSubmission', { serial: normalizeSerial(serial), submission });
    },
  };
}

