import { defineComponent, h } from 'vue';

export { default as ApaasCollect } from './designer/apaas-collect.vue';

export const OnlineFormOperator = defineComponent({
  name: 'OnlineFormOperator',
  setup(_, { slots }) {
    return () => h('div', slots.default?.());
  },
});

export const ApaasCollectSheetView = defineComponent({
  name: 'ApaasCollectSheetView',
  setup() {
    return () => h('div');
  },
});

export const MedProEdhrView = defineComponent({
  name: 'MedProEdhrView',
  setup() {
    return () => h('div');
  },
});

export const MedProStandardEdhrBatchView = defineComponent({
  name: 'MedProStandardEdhrBatchView',
  setup() {
    return () => h('div');
  },
});

export const PaasSiFormBuilderModal = defineComponent({
  name: 'PaasSiFormBuilderModal',
  setup() {
    return () => h('div');
  },
});

export function useAutoSaveFactory(_startAutoSave?: boolean, _autoSaveCallback?: Function) {
  const judgeFormDataHasChange = async (callback?: Function) => {
    callback?.();
    return false;
  };

  return {
    judgeFormDataHasChange,
    clearLooperData: () => {},
    setInitData: () => {},
  };
}

export function useApaasSi() {
  return {
    openMedProDrawer: () => {},
  };
}
