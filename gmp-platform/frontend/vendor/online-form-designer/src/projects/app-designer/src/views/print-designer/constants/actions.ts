import { ActionsType, ButtonTextEnum } from '../types/print-model';

export const Actions: ActionsType[] = [
  {
    type: 'text',
    text: ButtonTextEnum.DETAIL,
    icon: 'icon-a-Viewdetails',
  },
  {
    text: ButtonTextEnum.DELETE,
    icon: 'icon-shanchu',
    danger: true,
  },
  {
    type: 'primary',
    text: ButtonTextEnum.EDIT,
    icon: 'icon-bianji',
    ghost: true,
  },
  {
    type: 'primary',
    text: ButtonTextEnum.DESIGN,
    icon: 'icon-sheji',
  },
];
