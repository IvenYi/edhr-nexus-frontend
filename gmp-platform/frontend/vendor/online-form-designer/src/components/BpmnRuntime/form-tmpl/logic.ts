import { FlowNodeInstStatus, GctFlowNode, NodeInstStatusMap } from '@gct/flow';
import { recursiveIterate } from '/@/utils/recursive';
import { BpmnNodeTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';
import UserSelectList from './user-select-list.vue';
import { h } from 'vue';
import { UserSelectEcho } from '/@/projects/app-designer/src/views/online-form/components/bpmn-setting/hooks/UserSelectEcho';

export function useFlowNodeUserEcho() {
  const echo = new UserSelectEcho();
  const init = (modelKey: string) => {
    return echo.init({ modelKey });
  };

  /**
   * 获取节点选中的选项keys
   * @param node
   * @return {*}
   */
  const getNodeSelectedKeys = (node: any) => {
    if (node.type === BpmnNodeTypeEnum.BpmnApproval && node.data?.targetUserConfig) {
      const value = node.data.targetUserConfig;
      return Array.isArray(value) ? value : value.split(',').filter((i) => i);
    }
  };

  /**
   * 计算一下状态的Map
   * @param flow
   * @param [excludeNodeIds=[]]
   * @return {*}
   */
  const calcNodeStatusMap = async (flow: GctFlowNode.Flow, excludeNodeIds: string[] = []) => {
    const map: NodeInstStatusMap = {};
    const allSelectedKeys: any[] = [];
    recursiveIterate(
      flow,
      ({ item }) => {
        if (excludeNodeIds.includes(item.id)) {
          return;
        }
        const selectedKeys = getNodeSelectedKeys(item);
        if (!selectedKeys?.length) {
          return;
        }
        // 记录一下所有的选中项
        allSelectedKeys.push(...selectedKeys);

        // 设置一下map
        map[item.id] = {
          status: FlowNodeInstStatus.PENDING,
          data: {
            approveStatus: FlowNodeInstStatus.PENDING,
          },
          renderPopover: () => {
            console.log('renderPopover');
            try {
              const options = echo.translateSelected(selectedKeys);
              return h(UserSelectList, {
                options: options,
              });
            } catch (error) {
              console.error(error);
            }
          },
        };
        console.log('item', item);
      },
      { childrenFields: ['children'] },
    );
    await echo.updateUserOptions(Array.from(new Set(allSelectedKeys)));
    return map;
  };

  return {
    init,
    calcNodeStatusMap,
  };
}
