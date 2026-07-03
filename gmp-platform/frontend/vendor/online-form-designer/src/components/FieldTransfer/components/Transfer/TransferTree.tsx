import { defineComponent, toRefs, ref, watch, computed } from 'vue';
import { Input, Tree, Empty } from 'ant-design-vue';
import { FieldIconMap } from '/@/enums/appEnum';
import TreeItem from './TreeItem';
import { useI18n } from '/@/hooks/web/useI18n';
import { traverseFilter } from '../../utils/tree-tool';
import noData from '/@/assets/svg/pic_nodata.svg';
import noSearchData from '/@/assets/svg/pic_noresult.svg';
import type { TreeNode } from '../../types/index.d';
import type { TreeProps } from '../../hooks/useTreeData';

import '../../less/TransferTree.less';

export default defineComponent({
  name: 'TransferTree',
  props: {
    /** useTreeData */
    treeObj: {
      type: Object as PropType<TreeProps>,
      required: true,
    },
    checkedKeys: {
      type: Array<string>,
      required: true,
    },
    onCheckedKeysChange: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();
    const { data, draggable } = toRefs(props.treeObj);

    const keyword = ref<string>('');

    const filteredTreeData = computed(() => {
      if (!keyword.value) {
        return data.value;
      }

      const nodes = traverseFilter(
        (node) => node.title.toLowerCase().includes(keyword.value.toLowerCase()),
        data.value,
      );
      return nodes;
    });

    const handleCheckedKeys = (keys: string[]) => {
      if (!keyword.value) {
        props.onCheckedKeysChange(keys);
        return;
      }
      const nextKeys = keys.concat(
        props.checkedKeys.filter(
          (key) => !keys.includes(key) && !filteredTreeData.value.some((item) => item.key === key),
        ),
      );
      props.onCheckedKeysChange(nextKeys);
    };

    const slots = {
      title: (node) => {
        return <TreeItem node={node as TreeNode} draggable={draggable.value} />;
      },
    };

    return () => {
      return (
        <div class="transfer-tree-container">
          <div class="search-container">
            <Input
              placeholder={t('sys.component.fieldTransfer.pleaseSearch')}
              value={keyword.value}
              onChange={(e) => (keyword.value = e.target.value)}
              allowClear
              prefix={<i class={['search-icon iconfont', ' icon-sousuo']}></i>}
            />
          </div>
          <div class="tree-wrapper" style={{ overflow: 'auto' }}>
            {filteredTreeData.value.length === 0 ? (
              <div class="empty-container">
                <Empty
                  image={keyword.value ? noSearchData : noData}
                  description={
                    keyword.value
                      ? t('sys.component.fieldTransfer.noSearchData')
                      : t('sys.component.fieldTransfer.noData')
                  }
                />
              </div>
            ) : (
              <Tree
                showIcon
                showLine={{ showLeafIcon: false }}
                blockNode
                draggable={draggable.value ? { icon: false } : false}
                checkedKeys={props.checkedKeys}
                onCheck={handleCheckedKeys}
                multiple
                checkable={true}
                icon={(node: any) => (
                  <i
                    class={[
                      'iconfont',
                      node.isLeaf ? FieldIconMap[node.fieldType] || 'icon-zidingyi' : 'icon-file',
                    ]}
                  ></i>
                )}
                onSelect={(_, { selectedNodes }) => {
                  handleCheckedKeys(selectedNodes.map((node) => node.key as string));
                }}
                treeData={filteredTreeData.value}
                onDrop={({ node, dragNode, dropToGap, dropPosition }) => {
                  const dropPos = node.pos.split('-');
                  const dir = dropPosition - Number(dropPos[dropPos.length - 1]);
                  // console.log(node, dragNode, dropPosition, dropToGap);
                  // 拖动到上下
                  if (dropToGap) {
                    props.treeObj.moveTreeNode(dragNode.dataRef as any, node.dataRef as any, dir);
                  } else {
                    // 拖动来作为子节点
                    // moveTreeNode(dragNode as any, node as any, dir, true);
                  }
                }}
                v-slots={slots}
              />
            )}
          </div>
        </div>
      );
    };
  },
});
