import { executeLesson, lessonPayload } from './harness.js';

// Opaque-origin iframe -> disposable worker. No application DOM or storage in the worker.
// CSP denies network; the parent enforces a wall-clock timeout even for infinite loops.
const workerSource = `self.onmessage = async (event) => {
  try { self.postMessage(await (${executeLesson.toString()})(event.data)); }
  catch (error) { self.postMessage({ results: [], demo: { steps: [] }, error: String(error.message || error) }); }
};`;
const bootstrap = `
let worker;
addEventListener('message', (event) => {
  if (event.source !== parent || event.data?.type !== 'tiny-source-run' || worker) return;
  const { id, payload } = event.data;
  const url = URL.createObjectURL(new Blob([${JSON.stringify(workerSource)}], {type:'text/javascript'}));
  worker = new Worker(url);
  URL.revokeObjectURL(url);
  worker.onmessage = (result) => { parent.postMessage({type:'tiny-source-result', id, result:result.data}, '*'); worker.terminate(); };
  worker.onerror = (error) => { parent.postMessage({type:'tiny-source-result', id, result:{results:[],demo:{steps:[]},error:error.message || 'Worker failed.'}}, '*'); worker.terminate(); };
  worker.postMessage(payload);
});
parent.postMessage({type:'tiny-source-ready'}, '*');`;

export function runLesson(code, lesson, { signal } = {}) {
  if (signal?.aborted) return Promise.reject(new DOMException('Run cancelled', 'AbortError'));
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const frame = document.createElement('iframe');
    frame.hidden = true;
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('aria-hidden', 'true');
    frame.title = 'Isolated exercise runner';
    let timer;
    const cleanup = () => {
      clearTimeout(timer);
      removeEventListener('message', receive);
      signal?.removeEventListener('abort', abort);
      frame.remove();
    };
    const abort = () => { cleanup(); reject(new DOMException('Run cancelled', 'AbortError')); };
    const receive = (event) => {
      if (event.source !== frame.contentWindow) return;
      if (event.data?.type === 'tiny-source-ready') {
        frame.contentWindow.postMessage({ type: 'tiny-source-run', id, payload: lessonPayload(code, lesson) }, '*');
      } else if (event.data?.type === 'tiny-source-result' && event.data.id === id) {
        cleanup(); resolve(event.data.result);
      }
    };
    addEventListener('message', receive);
    signal?.addEventListener('abort', abort, { once: true });
    timer = setTimeout(() => {
      cleanup();
      resolve({ results: [], demo: { steps: [] }, error: 'Execution exceeded 8 seconds. Check for an infinite loop or a promise that never settles.' });
    }, 8000);
    frame.srcdoc = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none'"><script>${bootstrap.replace(/<\/script/gi, '<\\/script')}<\/script>`;
    document.body.append(frame);
  });
}
