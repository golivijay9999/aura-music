import { Track, DownloadedTrack } from '../types/music';

const DB_NAME = 'AuraMusicOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'downloaded_tracks';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveTrackForOffline(track: Track, onProgress?: (percent: number) => void): Promise<DownloadedTrack> {
  if (!track.downloadUrl && !track.streamUrl) {
    throw new Error('Track does not have an authorized download stream');
  }

  const url = track.downloadUrl || track.streamUrl;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  let loaded = 0;

  let blob: Blob;

  if (response.body && total > 0 && onProgress) {
    const reader = response.body.getReader();
    const chunks: BlobPart[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        loaded += value.length;
        onProgress(Math.round((loaded / total) * 100));
      }
    }
    blob = new Blob(chunks, { type: 'audio/mp4' });
  } else {
    blob = await response.blob();
    if (onProgress) onProgress(100);
  }

  const db = await openDB();
  const downloadedItem: DownloadedTrack = {
    ...track,
    cachedAt: new Date().toISOString(),
    fileBlob: blob,
    sizeBytes: blob.size
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(downloadedItem);

    req.onsuccess = () => resolve(downloadedItem);
    req.onerror = () => reject(req.error);
  });
}

export async function getDownloadedTracks(): Promise<DownloadedTrack[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get downloaded tracks:', err);
    return [];
  }
}

export async function getOfflineBlobUrl(trackId: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(trackId);

      req.onsuccess = () => {
        const item: DownloadedTrack | undefined = req.result;
        if (item && item.fileBlob) {
          resolve(URL.createObjectURL(item.fileBlob));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return null;
  }
}

export async function removeDownloadedTrack(trackId: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(trackId);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return false;
  }
}
