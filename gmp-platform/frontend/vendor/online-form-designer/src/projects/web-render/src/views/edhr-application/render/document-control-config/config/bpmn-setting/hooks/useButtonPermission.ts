import { useGctFlow } from '@gct/flow';
import type { IGctBpmnNodeDefinition } from '@gct/flow/src/plugins/bpmn/types';
import { watch } from 'vue';
import { NodeTypeOperateButtonMap } from '../constant';
import { SignatureTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';

export function useDefaultButtonPermission() {
  const { nodeSelectedId, nodeSelectedData } = useGctFlow();

  watch(
    nodeSelectedId,
    (value) => {
      if (!value) return;
      const node = nodeSelectedData.value?.data as IGctBpmnNodeDefinition;
      if (!node.buttonConfig) {
        // 初始化按钮权限的默认值
        const buttons = NodeTypeOperateButtonMap[node.type];
        if (buttons) {
          node.buttonConfig = buttons.map((button) => ({
            type: button.operate,
            enable: true,
            signatureType: SignatureTypeEnum.None,
          }));
          // console.log('use gct bpmn 初始化按钮权限的默认值', node.buttonConfig);
        }
      }
    },
    {
      immediate: true,
    },
  );
}
