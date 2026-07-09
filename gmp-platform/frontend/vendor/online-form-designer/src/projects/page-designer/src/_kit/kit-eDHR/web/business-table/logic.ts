import { IBusinessTable } from './schema';

export function getDataTableWidget(widget: IBusinessTable) {
  return widget.children[0];
}

export function useBusinessTable(widget: IBusinessTable) {
  return {};
}
