export enum StatusType {
  primary = 'primary',
  success = 'success',
  danger = 'danger',
  warning = 'warning',
  info = 'info',
}

export const STATUS_COLOR_MAP: Record<StatusType, string> = {
  [StatusType.primary]: '#2C8FFF',
  [StatusType.success]: '#48C65C',
  [StatusType.danger]: '#F54547',
  [StatusType.warning]: '#FF9442',
  [StatusType.info]: '#8B8B8B',
};
