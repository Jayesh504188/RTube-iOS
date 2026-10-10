import * as FileSystem from 'expo-file-system';

export const DOWNLOADS_DIR = FileSystem.documentDirectory + 'downloads/';

export async function ensureDownloadsDir() {
  const info = await FileSystem.getInfoAsync(DOWNLOADS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DOWNLOADS_DIR, { intermediates: true });
  }
}

export async function listDownloads() {
  await ensureDownloadsDir();
  const names = await FileSystem.readDirectoryAsync(DOWNLOADS_DIR);
  const out = [];
  for (const n of names) {
    try {
      const info = await FileSystem.getInfoAsync(DOWNLOADS_DIR + n);
      if (info.exists && !info.isDirectory) {
        out.push({
          name: n,
          uri: info.uri,
          size: info.size || 0,
          mtime: info.modificationTime || 0,
        });
      }
    } catch (e) {}
  }
  out.sort((a, b) => b.mtime - a.mtime);
  return out;
}

export async function deleteDownload(name) {
  await FileSystem.deleteAsync(DOWNLOADS_DIR + name, { idempotent: true });
}

export async function clearDownloads() {
  await FileSystem.deleteAsync(DOWNLOADS_DIR, { idempotent: true });
  await ensureDownloadsDir();
}

export function safeFileName(name) {
  const clean = String(name || 'video')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
  return clean || 'video';
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(ts) {
  try {
    return new Date(ts * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (e) {
    return '';
  }
}
