import { defineComponent, computed } from 'vue';
import { Tooltip } from 'ant-design-vue';
import { useI18n } from '/@/hooks/web/useI18n';
import type { TreeNode } from '../../types/index.d';

import '../../less/TreeItem.less';

export default defineComponent({
  name: 'TreeItem',
  props: {
    node: {
      type: Object as PropType<TreeNode>,
      required: true,
    },
    draggable: Boolean,
  },

  setup(props) {
    const { t } = useI18n();
    const editing = computed(() => {
      console.log('props.node', props.node);

      return props.node.isNew;
    });

    return () => {
      return (
        <div class="tree-item-container">
          <div class="tree-title">
            <Tooltip title={props.node.tooltip}>
              <span>{props.node.title || '-'}</span>
            </Tooltip>
          </div>

          {!editing.value && props.draggable && !props.node?.disabled && !props.node?._preset && (
            <div class="operation-container">
              <Tooltip title={t('sys.component.fieldTransfer.move')}>
                <i class={['iconfont', 'icon-drag']}></i>
              </Tooltip>
            </div>
          )}
        </div>
      );
    };
  },
});
