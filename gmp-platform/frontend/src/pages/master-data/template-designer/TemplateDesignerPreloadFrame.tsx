import { useEffect, useMemo, useState } from 'react';
import type { TemplateModelingRecord, TemplateVersionRecord } from '@/api/template-modeling';
import { buildVueDesignerUrl } from './templateDesignerBridge';

interface TemplateDesignerPreloadFrameProps {
  row: TemplateModelingRecord | null;
  version: TemplateVersionRecord | null;
  disabled?: boolean;
}

type IdleWindow = Window & typeof globalThis & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export default function TemplateDesignerPreloadFrame({ row, version, disabled = false }: TemplateDesignerPreloadFrameProps) {
  const [shouldPreload, setShouldPreload] = useState(false);
  const preloadUrl = useMemo(() => (row && version ? buildVueDesignerUrl(row, version) : ''), [row, version]);

  useEffect(() => {
    if (disabled || !preloadUrl) {
      setShouldPreload(false);
      return undefined;
    }

    setShouldPreload(false);
    const schedulePreload = () => setShouldPreload(true);
    const idleWindow = window as IdleWindow;

    if (typeof idleWindow.requestIdleCallback === 'function') {
      const idleId = idleWindow.requestIdleCallback(schedulePreload, { timeout: 800 });
      return () => idleWindow.cancelIdleCallback?.(idleId);
    }

    const timeoutId = idleWindow.setTimeout(schedulePreload, 300);
    return () => idleWindow.clearTimeout(timeoutId);
  }, [disabled, preloadUrl]);

  if (!shouldPreload || !preloadUrl) {
    return null;
  }

  return (
    <iframe
      aria-hidden="true"
      tabIndex={-1}
      title="表单模板设计器预加载"
      src={preloadUrl}
      style={{
        position: 'fixed',
        width: 1,
        height: 1,
        left: -10000,
        top: -10000,
        opacity: 0,
        pointerEvents: 'none',
        border: 0,
      }}
    />
  );
}
