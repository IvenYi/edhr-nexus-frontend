import { useEffect, useRef, useState } from 'react';
import { getExecutionEditors, updateExecutionEditor, type ExecutionEditors } from '@/api/production-execution';

export default function useExecutionPresence(objectId: string | undefined, operationId: string, formId: string, instanceId: string, editable: boolean, observing: boolean) {
  const [editors, setEditors] = useState<ExecutionEditors | null>(null);
  const activity = useRef<() => void>(() => {});
  useEffect(() => {
    if (!objectId || !operationId) { setEditors(null); return; }
    let disposed = false, registered = false, lastEdit = 0;
    let queue: Promise<unknown> = Promise.resolve();
    const sessionId = crypto.randomUUID();
    const send = (editing: boolean) => {
      registered = editing;
      queue = queue.catch(() => {}).then(() => updateExecutionEditor(objectId, operationId, { sessionId, formId, instanceId, editing }))
        .then(result => { if (!disposed) setEditors(result); }).catch(() => { if (!disposed) setEditors(null); });
    };
    const leave = () => { lastEdit = 0; if (registered) send(false); };
    activity.current = () => {
      if (!editable || document.visibilityState !== 'visible' || !document.hasFocus()) return;
      lastEdit = Date.now();
      if (!registered) send(true);
    };
    const heartbeat = window.setInterval(() => {
      if (editable && lastEdit > 0 && Date.now() - lastEdit < 60_000 && document.visibilityState === 'visible' && document.hasFocus()) send(true);
      else leave();
    }, 15_000);
    const visibility = () => { if (document.visibilityState !== 'visible') leave(); };
    window.addEventListener('blur', leave); document.addEventListener('visibilitychange', visibility);
    return () => {
      disposed = true; activity.current = () => {}; window.clearInterval(heartbeat);
      window.removeEventListener('blur', leave); document.removeEventListener('visibilitychange', visibility); leave();
    };
  }, [objectId, operationId, formId, instanceId, editable]);
  useEffect(() => {
    setEditors(null);
    if (!objectId || !operationId || !observing) return;
    let disposed = false, loading = false;
    const poll = async () => {
      if (loading || document.visibilityState !== 'visible') return;
      loading = true;
      try { const result = await getExecutionEditors(objectId, operationId); if (!disposed) setEditors(result); }
      catch { if (!disposed) setEditors(null); }
      finally { loading = false; }
    };
    void poll(); const timer = window.setInterval(() => void poll(), 10_000);
    return () => { disposed = true; window.clearInterval(timer); };
  }, [objectId, operationId, observing]);
  return { editors, markEditing: () => activity.current() };
}
