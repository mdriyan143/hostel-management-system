// Simple localStorage-backed data store. No server, no accounts - everything
// lives in this browser only (clearing browser data clears the records).

function readAll(collectionName) {
  const raw = localStorage.getItem(`hm_${collectionName}`);
  return raw ? JSON.parse(raw) : [];
}

function writeAll(collectionName, items) {
  localStorage.setItem(`hm_${collectionName}`, JSON.stringify(items));
}

function makeId() {
  return `id_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export const store = {
  list(collectionName) {
    return readAll(collectionName);
  },
  add(collectionName, data) {
    const items = readAll(collectionName);
    const item = { id: makeId(), ...data };
    items.push(item);
    writeAll(collectionName, items);
    return item;
  },
  update(collectionName, id, data) {
    const items = readAll(collectionName);
    const index = items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Record not found');
    items[index] = { ...items[index], ...data };
    writeAll(collectionName, items);
    return items[index];
  },
  remove(collectionName, id) {
    writeAll(collectionName, readAll(collectionName).filter(i => i.id !== id));
  },
  // remove every record for which predicate(item) is true; returns how many were removed
  removeWhere(collectionName, predicate) {
    const items = readAll(collectionName);
    const kept = items.filter(i => !predicate(i));
    writeAll(collectionName, kept);
    return items.length - kept.length;
  },
  // upsert by a custom key (used for attendance, one record per date+student)
  upsertByKey(collectionName, key, data) {
    const items = readAll(collectionName);
    const index = items.findIndex(i => i.key === key);
    if (index === -1) items.push({ id: makeId(), key, ...data });
    else items[index] = { ...items[index], ...data };
    writeAll(collectionName, items);
  },
  getByKey(collectionName, key) {
    return readAll(collectionName).find(i => i.key === key) || null;
  },
  getSetting(name, fallback) {
    const raw = localStorage.getItem(`hm_setting_${name}`);
    return raw !== null ? JSON.parse(raw) : fallback;
  },
  setSetting(name, value) {
    localStorage.setItem(`hm_setting_${name}`, JSON.stringify(value));
  },
};
