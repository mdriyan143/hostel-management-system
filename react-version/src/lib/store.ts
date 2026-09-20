// Simple localStorage-backed data store. No server, no accounts - everything
// lives in this browser only (clearing browser data clears the records).
//
// This is a direct TypeScript port of the original js/store.js. The
// localStorage key format (`hm_${collectionName}` / `hm_setting_${name}`)
// and every method's behavior are kept identical so existing saved data
// continues to work unchanged.

import type { CollectionName } from '../types';

interface WithId {
  id: string;
}

function readAll<T>(collectionName: CollectionName): T[] {
  const raw = localStorage.getItem(`hm_${collectionName}`);
  return raw ? (JSON.parse(raw) as T[]) : [];
}

function writeAll<T>(collectionName: CollectionName, items: T[]): void {
  localStorage.setItem(`hm_${collectionName}`, JSON.stringify(items));
}

function makeId(): string {
  return `id_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export const store = {
  list<T>(collectionName: CollectionName): T[] {
    return readAll<T>(collectionName);
  },

  add<T extends WithId>(collectionName: CollectionName, data: Omit<T, 'id'>): T {
    const items = readAll<T>(collectionName);
    const item = { id: makeId(), ...data } as T;
    items.push(item);
    writeAll(collectionName, items);
    return item;
  },

  update<T extends WithId>(collectionName: CollectionName, id: string, data: Partial<T>): T {
    const items = readAll<T>(collectionName);
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Record not found');
    items[index] = { ...items[index], ...data };
    writeAll(collectionName, items);
    return items[index];
  },

  remove(collectionName: CollectionName, id: string): void {
    writeAll(
      collectionName,
      readAll<WithId>(collectionName).filter((i) => i.id !== id)
    );
  },

  // remove every record for which predicate(item) is true; returns how many were removed
  removeWhere<T>(collectionName: CollectionName, predicate: (item: T) => boolean): number {
    const items = readAll<T>(collectionName);
    const kept = items.filter((i) => !predicate(i));
    writeAll(collectionName, kept);
    return items.length - kept.length;
  },

  // upsert by a custom key (used for attendance, one record per date+student)
  upsertByKey<T extends { key: string }>(
    collectionName: CollectionName,
    key: string,
    data: Omit<T, 'id' | 'key'>
  ): void {
    const items = readAll<T & WithId>(collectionName);
    const index = items.findIndex((i) => i.key === key);
    if (index === -1) items.push({ id: makeId(), key, ...data } as T & WithId);
    else items[index] = { ...items[index], key, ...data } as T & WithId;
    writeAll(collectionName, items);
  },

  getByKey<T extends { key: string }>(collectionName: CollectionName, key: string): T | null {
    return readAll<T>(collectionName).find((i) => i.key === key) || null;
  },

  getSetting<T>(name: string, fallback: T): T {
    const raw = localStorage.getItem(`hm_setting_${name}`);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  },

  setSetting<T>(name: string, value: T): void {
    localStorage.setItem(`hm_setting_${name}`, JSON.stringify(value));
  },
};
