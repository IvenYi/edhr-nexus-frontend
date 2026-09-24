import { Button, type ButtonProps } from '@mui/material';
import type { ReactNode } from 'react';
import type { ExecutionButton } from '@/api/production-execution';

const actionLabels: Record<string, string> = {
  SAVE: '暂存',
  SUBMIT: '提交',
  APPROVE: '审批',
  RETURN: '退回',
  TRANSFER: '转办',
};

type WorkflowActionButtonsProps = {
  buttons?: ExecutionButton[];
  busy?: boolean;
  canAct?: boolean;
  size?: ButtonProps['size'];
  labelFor?: (button: ExecutionButton) => ReactNode;
  onAction: (button: ExecutionButton) => void;
};

function buttonPresentation(button: ExecutionButton): Pick<ButtonProps, 'color' | 'variant'> {
  const style = button.style ?? (button.action === 'RETURN' ? 'DANGER' : button.action === 'SAVE' ? 'DEFAULT' : 'PRIMARY');
  if (style === 'DANGER') return { color: 'error', variant: 'outlined' };
  if (style === 'DEFAULT') return { color: 'primary', variant: 'outlined' };
  return { color: 'primary', variant: 'contained' };
}

export default function WorkflowActionButtons({ buttons = [], busy = false, canAct = false, size = 'medium', labelFor, onAction }: WorkflowActionButtonsProps) {
  return <>
    {buttons.filter((button) => button.visible !== false).map((button) => {
      const presentation = buttonPresentation(button);
      const label = labelFor?.(button) ?? (button.label || actionLabels[button.action] || button.action);
      return <Button key={button.action} size={size} disabled={busy || !canAct} {...presentation} onClick={() => onAction(button)}>
        {label}{button.requiresSignature ? '并签署' : ''}
      </Button>;
    })}
  </>;
}
