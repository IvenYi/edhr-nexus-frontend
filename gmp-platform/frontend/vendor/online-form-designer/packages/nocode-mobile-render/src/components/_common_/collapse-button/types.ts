import type { ButtonType } from 'vant';

export interface ButtonAction {
  text: string;
  callback: () => {};
  type?: ButtonType;
  icon?: string;
  color?: string;
  disabled?: boolean;
  className?: string;
}
