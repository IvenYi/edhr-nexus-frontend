import { defineComponent, h } from 'vue';
import type { App } from 'vue';

const EmptyRuntimeWebComponent = defineComponent({
  name: 'EmptyRuntimeWebComponent',
  setup(_props, { slots }) {
    return () => slots.default?.() ?? h('span');
  },
});

export const OverlayContainer: { createVueApp?: (...args: unknown[]) => App<Element> } = {};

export const overlay = {
  open: () => undefined,
  close: () => undefined,
};

export const OnlineFormModelSelect = EmptyRuntimeWebComponent;
export const OnlineFormModelModal = EmptyRuntimeWebComponent;
export const ReportTable = EmptyRuntimeWebComponent;
export const ReportDataSetPreview = EmptyRuntimeWebComponent;
export const ReportDataSetStepBI = EmptyRuntimeWebComponent;
export const DataResourceBI = EmptyRuntimeWebComponent;
export const ModelConfig = EmptyRuntimeWebComponent;
export const FieldsConfig = EmptyRuntimeWebComponent;
export const SvgIcon = EmptyRuntimeWebComponent;
export const IFrameContainer = EmptyRuntimeWebComponent;
export const MonacoEditor = EmptyRuntimeWebComponent;
export const ScaleSelect = EmptyRuntimeWebComponent;
export const GctDndContainer = EmptyRuntimeWebComponent;
export const ModalNameEditor = EmptyRuntimeWebComponent;
export const Vue3GridDndItem = EmptyRuntimeWebComponent;

export function openReportDesign() {}
export function openReportDataSetDesign() {}
export function transformSchemaByData(schema: unknown) {
  return schema;
}
export function useReportDataSetDesignStore() {
  return {};
}
export function gctFieldSortPopover() {}
export function gctFieldTreeSelect() {}

export default {
  install(_app: App) {},
};
