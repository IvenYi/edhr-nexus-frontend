import { INNER_EVENT } from '../enum';
import { LowCodeWidget } from '../types/widget-basic-types';

export const innerType = [
  INNER_EVENT.OPEN_MODAL,
  INNER_EVENT.CLOSE_MODAL,
  INNER_EVENT.REFRESH_TABLE,
];

export const innerEvent: innerEvent = {
  [INNER_EVENT.OPEN_MODAL]: {
    name: INNER_EVENT.OPEN_MODAL,
    key: '',
    title: 'sys.pageDesigner.openModal',
    refId: '',
    modalTitle: '',
  },
  [INNER_EVENT.CLOSE_MODAL]: {
    name: INNER_EVENT.CLOSE_MODAL,
    key: '',
    title: 'sys.pageDesigner.closeModal',
    refId: '',
  },
  [INNER_EVENT.REFRESH_TABLE]: {
    name: INNER_EVENT.REFRESH_TABLE,
    title: 'sys.pageDesigner.reloadData',
    key: '',
    refId: '',
    scopeId: '',
  },
};

type innerEvent = {
  [key in INNER_EVENT]: LowCodeWidget.InnerEvents;
};
