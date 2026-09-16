export function readRecordLocation() {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get('locateId') || '',
    keyword: params.get('locateKeyword') || '',
    name: params.get('locateName') || '',
    version: params.get('locateVersion') || '',
    child: params.get('locateChild') || '',
    type: params.get('locateType') || '',
    node: params.get('locateNode') || '',
    reference: params.get('locateReference') || '',
  };
}

export function useRecordLocationAction(action: (target: ReturnType<typeof readRecordLocation>) => boolean) {
  const handled = useRef(false);
  useEffect(() => {
    const target = readRecordLocation();
    if (!handled.current && target.id && target.child) handled.current = action(target);
  });
}
import { useEffect, useRef } from 'react';
