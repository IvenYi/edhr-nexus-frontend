import { defineComponent, h, ref, watch } from 'vue';
import { Cascader, Spin } from 'ant-design-vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { LoadingOutlined } from '@ant-design/icons-vue';
import {
  getRecursiveModelTreeData,
  IModelTreeNode,
  MODEL_SEPARATOR,
  renderColTitle,
  renderOptionLabel,
} from './util';
import './style.less';

const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '10px',
  },
  spin: true,
});

export * from './util';

export default defineComponent({
  name: 'ModelCascader',
  props: {
    value: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    // 级联向左展开
    expandToLeft: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const visible = ref(false);
    const isLoading = ref(false);
    const treeOptions = ref<IModelTreeNode[]>([]);
    const treeNameMap = ref<Record<string, string>>({});
    const selectedValue = ref<string[]>([]);

    const updateTreeData = async () => {
      isLoading.value = true;
      getRecursiveModelTreeData(props.value, 2)
        .then((data) => {
          const { value: rootValue, label: rootLabel } = props;
          treeOptions.value = [
            {
              label: rootLabel,
              value: rootValue,
              children: data.treeOptions,
            },
          ];

          // console.log('treeOptions', treeOptions);

          treeNameMap.value = {
            [rootValue]: rootLabel,
            ...data.treeNameMap,
          };

          // console.log('datadatadatadata', data);
        })
        .finally(() => {
          isLoading.value = false;
        });
    };

    watch(
      () => props.value,
      () => {
        const keys = props.value.split(MODEL_SEPARATOR);

        if (keys[0] !== selectedValue.value[0]) {
          updateTreeData();
        }

        // selectedValue.value = keys;
      },
      {
        immediate: true,
      },
    );

    const renderOptions = (nodes: IModelTreeNode[], col: number) => {
      const titleOption =
        col === 1
          ? renderColTitle(t('sys.component.fieldTransfer.currentModel'), 'current')
          : renderColTitle(t('sys.component.fieldTransfer.linkModel'), 'link');

      const realOptions = nodes.map((node) => {
        const { value, children } = node;

        return {
          label: renderOptionLabel(node),
          value,
          isLeaf: false,
          disabled: false,
          children: children?.length ? renderOptions(children, col + 1) : null,
        };
      });

      const options: any = [titleOption, ...realOptions];

      return options;
    };

    return () => {
      const displayLabel = props.value
        .split(MODEL_SEPARATOR)
        .map((val) => treeNameMap.value[val])
        .join(' / ');

      const isReadOnly = !treeOptions.value[0]?.children?.length;

      return (
        <div>
          <Cascader
            v-model:value={selectedValue.value}
            changeOnSelect
            expandTrigger="hover"
            placement="bottomRight"
            dropdownClassName={`model-cascader-popup ${props.expandToLeft ? 'expand-to-left' : ''}`}
            options={renderOptions(treeOptions.value, 1)}
            open={isReadOnly ? false : visible.value}
            onChange={(val) => emit('change', val.join(MODEL_SEPARATOR))}
            onDropdownVisibleChange={(v) => {
              visible.value = v;
            }}
          >
            <div class={`flex items-center ${isReadOnly ? '' : 'cursor-pointer'}`}>
              {isLoading.value && <Spin indicator={indicator} class="h-4 flex items-center" />}

              <div class="text-xs truncate min-w-0" title={displayLabel}>
                {displayLabel}
              </div>

              {!isReadOnly && !isLoading.value && (
                <i class="shrink-0 ml-1 gct-iconfont icon-zujianziduan-xiajiantou3"></i>
              )}
            </div>
          </Cascader>
        </div>
      );
    };
  },
});
