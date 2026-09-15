import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Box, Button, IconButton, Portal, Typography } from '@mui/material';
import { CloseRounded, EditNoteRounded } from '@mui/icons-material';

export type ExecutionPanelId = 'sop' | 'works' | 'history';
type Panel = { id: ExecutionPanelId; label: string; title: string; icon: ReactNode; content: ReactNode };

export default function ExecutionQuickPanel({ active, onChange, panels, context, suspended, railContainer, section, onSectionChange, navigationContent, children }: {
  active: ExecutionPanelId | null; onChange: (panel: ExecutionPanelId | null) => void;
  panels: Panel[]; context: string; suspended: boolean; railContainer?: HTMLElement | null; children: ReactNode;
  section?: ExecutionPanelId | null; onSectionChange?: (section: ExecutionPanelId | null) => void; navigationContent?: ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const dismissingPointer = useRef(false);
  const wasOpen = useRef(false);
  const id = useId();
  const close = () => {
    onChange(null);
    if (active && returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true });
  };
  const open = (next: ExecutionPanelId) => {
    onSectionChange?.(next);
    if (!active) returnFocus.current = document.activeElement as HTMLElement | null;
    onChange(next);
  };

  useEffect(() => {
    const reset = () => { dismissingPointer.current = false; };
    const consumeClick = (event: MouseEvent) => {
      if (!dismissingPointer.current) return;
      dismissingPointer.current = false;
      event.preventDefault(); event.stopPropagation();
    };
    document.addEventListener('pointerdown', reset, true);
    document.addEventListener('click', consumeClick, true);
    return () => { document.removeEventListener('pointerdown', reset, true); document.removeEventListener('click', consumeClick, true); };
  }, []);
  useEffect(() => {
    if (active && !suspended) titleRef.current?.focus({ preventScroll: true });
    if (!active && wasOpen.current && returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true });
    wasOpen.current = Boolean(active);
  }, [active, suspended]);
  useEffect(() => {
    if (!active || suspended) return;
    const outside = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || panelRef.current?.contains(target) || railRef.current?.contains(target)) return;
      // Portalled selects and confirmation dialogs belong to the active interaction.
      if (target.closest('[role="dialog"], [role="listbox"], .MuiPopover-root, .MuiPopper-root')) return;
      if (target.closest('.execution-page')) { dismissingPointer.current = true; event.preventDefault(); event.stopPropagation(); }
      close();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
      if (event.key !== 'Tab') return;
      const focusable = [...Array.from(railRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled)') ?? []), ...Array.from(stageRef.current?.querySelectorAll<HTMLElement>('.execution-peek button:not(:disabled), .execution-peek input:not(:disabled), .execution-peek select:not(:disabled), .execution-peek textarea:not(:disabled), .execution-peek a[href], .execution-peek iframe') ?? [])]
        .filter((element) => element.getClientRects().length > 0);
      const index = focusable.indexOf(document.activeElement as HTMLElement);
      if (index < 0 || (event.shiftKey ? index === 0 : index === focusable.length - 1)) {
        event.preventDefault(); (event.shiftKey ? focusable[focusable.length - 1] : focusable[0])?.focus();
      }
    };
    document.addEventListener('pointerdown', outside, true);
    document.addEventListener('keydown', keyboard, true);
    return () => { document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', keyboard, true); };
  }, [active, suspended, onChange]);

  const selected = panels.find((panel) => panel.id === active);
  const selectedSection = section === undefined ? active : section;
  return <Box ref={stageRef} className={`execution-stage${railContainer ? ' execution-stage-sidebar-rail' : ''}`}>
    <Box className="execution-primary" aria-hidden={active ? true : undefined}>{children}</Box>
    <Portal container={railContainer} disablePortal={!railContainer}><Box component="nav" ref={railRef} aria-label="工作区快捷切换" className="execution-quick-rail">
      <Button aria-label="返回填报" aria-pressed={!selectedSection} onClick={() => { onSectionChange?.(null); close(); }}><EditNoteRounded /><span>填报</span></Button>
      {panels.map((panel) => <Button key={panel.id} aria-label={`查看${panel.label}`} aria-pressed={selectedSection === panel.id} aria-expanded={active === panel.id} aria-controls={`${id}-panel`}
        onClick={() => {
          if (onSectionChange) { onSectionChange(panel.id); close(); }
          else if (active === panel.id) close();
          else open(panel.id);
        }}>
        {panel.icon}<span>{panel.label}</span>
      </Button>)}
      {navigationContent}
    </Box></Portal>
    {active && <Box className="execution-peek-backdrop" aria-hidden="true" />}
    <Box component="section" ref={panelRef} id={`${id}-panel`} role="dialog" aria-modal="false" aria-labelledby={`${id}-title`} hidden={!active} className="execution-peek">
      <Box className="execution-peek-heading">
        <Box><Typography component="h2" ref={titleRef} tabIndex={-1} id={`${id}-title`}>{selected?.title}</Typography><Typography className="execution-peek-context">{context}</Typography></Box>
        <IconButton aria-label="收起辅助面板" onClick={close}><CloseRounded /></IconButton>
      </Box>
      <Typography className="execution-peek-hint">点击外部或按 Esc 返回填报 · 保留当前查看位置</Typography>
      {panels.map((panel) => <Box key={panel.id} hidden={active !== panel.id} className="execution-peek-content">{panel.content}</Box>)}
    </Box>
  </Box>;
}
