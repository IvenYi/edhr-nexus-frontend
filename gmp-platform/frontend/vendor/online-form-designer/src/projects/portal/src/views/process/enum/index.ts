export enum DelefationStatusEnum {
  NOT_STARTED = 'NOT_STARTED',
  STARTED = 'STARTED',
  EXPIRED = 'EXPIRED',
}

export const DelefationStatusMap: Record<DelefationStatusEnum, { color: string; i18n: string }> = {
  [DelefationStatusEnum.NOT_STARTED]: {
    color: '#D9D9D9',
    i18n: 'sys.process.delegation.NOT_STARTED',
  },
  [DelefationStatusEnum.STARTED]: {
    color: '#0DAA9C',
    i18n: 'sys.process.delegation.STARTED',
  },
  [DelefationStatusEnum.EXPIRED]: {
    color: '#FF4D4F',
    i18n: 'sys.process.delegation.EXPIRED',
  },
};
