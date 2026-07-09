import { useGctFlow } from '@gct/flow';
import type { IGctBpmnNodeDefinition } from '@gct/flow/src/plugins/bpmn/types';
import { watch } from 'vue';
import { handleBuiltinButtonConfig } from '../constant';
import { useAppInfoStore } from '/@/store/modules/app-info';

export function useDefaultButtonPermission() {
  const { nodeSelectedId, nodeSelectedData } = useGctFlow();

  watch(
    nodeSelectedId,
    (value) => {
      if (!value) return;
      const node = nodeSelectedData.value?.data as IGctBpmnNodeDefinition;
      // 初始化按钮权限的默认值
      // 根据应用计算支持的按钮
      const appInfoStore = useAppInfoStore();
      const suiteKey = appInfoStore.appInfo.suiteKey!;
      const oldBtnConfig = node.buttonConfig ?? [];
      node.buttonConfig = handleBuiltinButtonConfig({
        btnConfigs: oldBtnConfig,
        suiteKey,
        nodeType: node.type,
      });
    },
    {
      immediate: true,
    },
  );
}
