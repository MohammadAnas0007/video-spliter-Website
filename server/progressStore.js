const store = new Map();

export function initJob(jobId) {
  store.set(jobId, { percent: 0, status: 'queued', parts: [], zipPath: null, error: null });
}

export function setProgress(jobId, percent) {
  const job = store.get(jobId);
  if (!job) return;
  job.percent = Math.min(100, Math.max(0, percent));
}

export function setStatus(jobId, status) {
  const job = store.get(jobId);
  if (!job) return;
  job.status = status;
}

export function setParts(jobId, parts) {
  const job = store.get(jobId);
  if (!job) return;
  job.parts = parts;
}

export function setZip(jobId, zipPath) {
  const job = store.get(jobId);
  if (!job) return;
  job.zipPath = zipPath;
}

export function setError(jobId, error) {
  const job = store.get(jobId);
  if (!job) return;
  job.error = String(error);
  job.status = 'error';
}

export function getJob(jobId) {
  return store.get(jobId) || null;
}
