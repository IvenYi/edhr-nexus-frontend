import { useEffect } from 'react';
import { GlobalStyles } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { readRecordLocation } from '@/utils/recordLocation';

export default function RecordLocationHighlight() {
  const location = useLocation();
  useEffect(() => {
    const target = readRecordLocation();
    if (!target.id) return;
    let current: Element | null = null;
    const locate = () => {
      const row = [target.reference, target.node, target.child, target.version, target.id].filter(Boolean)
        .map((id) => document.querySelector(`[data-record-id="${CSS.escape(id)}"]`)).find((node) => node && node.getClientRects().length);
      if (!row || row === current) return;
      current?.removeAttribute('data-record-located');
      current = row;
      row.setAttribute('data-record-located', 'true');
      row.scrollIntoView({ block: 'center', inline: 'nearest' });
    };
    locate();
    const observer = new MutationObserver(locate);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); current?.removeAttribute('data-record-located'); };
  }, [location.pathname, location.search]);
  return <GlobalStyles styles={{ '[data-record-located="true"]': { outline: '2px solid #1890ff', outlineOffset: -2, backgroundColor: '#e6f4ff !important' }, '[data-record-located="true"] > td': { backgroundColor: '#e6f4ff !important' } }} />;
}
