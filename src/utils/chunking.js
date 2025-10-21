'use strict';

const fs = require('fs');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

function chunkArray(arr, size) {
  if (!Array.isArray(arr)) throw new TypeError('arr must be an array');
  if (!Number.isInteger(size) || size <= 0) throw new TypeError('size must be a positive integer');
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function* chunkAsyncIterable(iterable, size = 1024) {
  if (!Number.isInteger(size) || size <= 0) throw new TypeError('size must be a positive integer');
  let buffer = [];
  for await (const item of iterable) {
    buffer.push(item);
    if (buffer.length >= size) {
      yield buffer;
      buffer = [];
    }
  }
  if (buffer.length) yield buffer;
}

/**
 * Upload a file in chunks with concurrency, retries and progress callback.
 * uploadChunkFn(stream, {index, start, end, totalChunks, attempt}) must return a Promise.
 */
async function uploadFileInChunks(filePath, {
  chunkSize = 4 * 1024 * 1024, // 4MiB
  concurrency = 4,
  maxRetries = 3,
  backoffBaseMs = 300,
  uploadChunkFn,
  onProgress = () => {}
} = {}) {
  if (typeof uploadChunkFn !== 'function') throw new TypeError('uploadChunkFn is required');
  const st = await fs.promises.stat(filePath);
  const fileSize = st.size;
  const totalChunks = Math.max(1, Math.ceil(fileSize / chunkSize));
  let nextIndex = 0;
  let uploaded = 0;
  let failed = null;

  const worker = async () => {
    while (true) {
      const i = nextIndex++;
      if (i >= totalChunks) return;
      const start = i * chunkSize;
      const end = Math.min(fileSize - 1, (i + 1) * chunkSize - 1);

      let attempt = 0;
      while (attempt <= maxRetries) {
        attempt++;
        try {
          const stream = fs.createReadStream(filePath, { start, end });
          await uploadChunkFn(stream, { index: i, start, end, totalChunks, attempt });
          uploaded++;
          onProgress({ uploadedChunks: uploaded, totalChunks, index: i });
          break;
        } catch (err) {
          if (attempt > maxRetries) {
            failed = err;
            throw err;
          }
          // exponential backoff with jitter
          const backoff = Math.round(backoffBaseMs * (2 ** (attempt - 1)) * (0.8 + Math.random() * 0.4));
          await sleep(backoff);
        }
      }
    }
  };

  const workers = Array.from({ length: Math.max(1, concurrency) }, () => worker());
  await Promise.all(workers);
  if (failed) throw failed;
  return { totalChunks, uploadedChunks: uploaded };
}

module.exports = {
  chunkArray,
  chunkAsyncIterable,
  uploadFileInChunks
};