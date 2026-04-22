let placeholders;

export async function fetchPlaceholders(prefix = 'default') {
  if (!placeholders) {
    try {
      const resp = await fetch('/placeholders.json');
      const json = resp.ok ? await resp.json() : {};
      placeholders = {};
      (json.data || []).forEach(({ Key, Value }) => {
        if (Key) placeholders[Key] = Value || '';
      });
    } catch {
      placeholders = {};
    }
  }
  return placeholders;
}
