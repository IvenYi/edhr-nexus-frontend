import { defineComponent, computed, ref, toRefs, watch } from 'vue';
import { Empty, Transfer } from 'ant-design-vue';
import { FieldIconMap } from '/@/enums/appEnum';
import TransferTree from './TransferTree';
import { useI18n } from '/@/hooks/web/useI18n';
import noData from '/@/assets/svg/pic_nodata.svg';
import noSearchData from '/@/assets/svg/pic_noresult.svg';
import type { FieldItem, TreeNodeLeaf } from '../../types/index.d';
import type { TreeProps } from '../../hooks/useTreeData';

import '../../less/AdvancedTransfer.less';

const { t } = useI18n();

export default defineComponent({
  name: 'AdvancedTransfer',
  props: {
    /** 数据源 */
    dataSource: {
      type: Array as PropType<Array<FieldItem>>,
      required: true,
    },
    /** useTreeData */
    treeObj: {
      type: Object as PropType<TreeProps>,
      required: true,
    },
    /** 穿梭框标题集合 */
    titles: {
      type: Array as PropType<string[]>,
      default() {
        return [t('sys.component.fieldTransfer.noSelect'), t('sys.component.fieldTransfer.select')];
      },
    },
  },
  setup(props) {
    const { dataSource: propDataSource } = toRefs(props);
    const { remainCount: propRemainCount, leafKeys, multiple } = toRefs(props.treeObj);

    const checkedKeys = ref<Array<string>>([]);
    const targetCheckedKeys = ref<Array<string>>([]);
    const keyword = ref();
    const hasSearchData = ref(true);
    const remainCount = computed(() => {
      return propRemainCount.value - checkedKeys.value.length;
    });

    const dataSource = computed(() => {
      return propDataSource.value.map((item) => {
        return {
          ...item,
          disabled:
            item.disabled ||
            (remainCount.value === 0 &&
              !checkedKeys.value.includes(item.id) &&
              !leafKeys.value.includes(item.id)),
        };
      });
    });

    watch(
      multiple,
      (val) => {
        if (val) {
          targetCheckedKeys.value = [];
        }
      },
      {
        immediate: true,
      },
    );

    const onSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
      const actualSelectedKeys = sourceSelectedKeys.slice(0, propRemainCount.value);

      checkedKeys.value = actualSelectedKeys;
      targetCheckedKeys.value = targetSelectedKeys;
    };

    const onChange = (_: any, direction: string, moveKeys: any[]) => {
      if (direction === 'right') {
        const nodes = moveKeys
          .map((key: string) => dataSource.value.find((item) => item.id === key)!)
          .map(
            (item: { id: any; displayLabel: any; type: any }) =>
              ({
                key: item.id,
                title: item.displayLabel,
                type: 'field',
                fieldType: item.type,
                isLeaf: true,
              }) as TreeNodeLeaf,
          );
        props.treeObj.addTreeNodes(nodes, props.treeObj.getContainerNode());
      } else {
        props.treeObj.removeTreeNodesByKeys(moveKeys);
      }
    };

    const setTargetCheckedKeys = (keys) => {
      targetCheckedKeys.value = keys;
    };

    const leftOption = computed(() => {
      // 删选dataSource中右侧leafKeys中没选中的且搜索结果
      return dataSource.value.filter((item) => !leafKeys.value.includes(item.id));
    });

    // 搜索筛选后的左侧选项
    const filteredLeftOption = computed(() => {
      if (!keyword.value) {
        return leftOption.value;
      }

      return leftOption.value.filter((item) =>
        item.displayLabel.toLowerCase().includes(keyword.value.toLowerCase()),
      );
    });

    const onSearch = (direction: 'left' | 'right', value: string) => {
      if (direction === 'left') {
        keyword.value = value;
        hasSearchData.value = filteredLeftOption.value.length > 0;
      }
    };

    /** 每行数据渲染函数  */
    const renderItem = ({ type, displayLabel }: FieldItem) => {
      return (
        <div class="field-title" title={displayLabel}>
          <i class={['field-icon iconfont', FieldIconMap[type] || 'icon-zidingyi']}></i>
          {displayLabel}
        </div>
      );
    };

    const slots = {
      children: ({ direction }: any) => {
        if (direction === 'right') {
          return (
            <TransferTree
              treeObj={props.treeObj}
              checkedKeys={targetCheckedKeys.value}
              onCheckedKeysChange={setTargetCheckedKeys}
            />
          );
        }
        if (
          direction === 'left' &&
          (!leftOption.value.length || !filteredLeftOption.value.length)
        ) {
          return (
            <div class="empty-container">
              <Empty
                image={leftOption.value.length ? noSearchData : noData}
                description={
                  leftOption.value.length
                    ? t('sys.component.fieldTransfer.noSearchData')
                    : t('sys.component.fieldTransfer.noData')
                }
              />
            </div>
          );
        }
      },
    };

    return () => {
      return (
        <div class="advanced-transfer-container">
          <Transfer
            dataSource={dataSource.value}
            targetKeys={leafKeys.value}
            selectedKeys={checkedKeys.value.concat(targetCheckedKeys.value)}
            showSearch
            filterOption={(text, item) => item.displayLabel.includes(text)}
            oneWay={multiple.value}
            titles={props.titles}
            locale={{
              itemUnit: t('sys.component.fieldTransfer.term'),
              itemsUnit: t('sys.component.fieldTransfer.term'),
              searchPlaceholder: t('sys.component.fieldTransfer.pleaseSearch'),
              selectAll: t('sys.component.fieldTransfer.selectAllData'),
              selectInvert: t('sys.component.fieldTransfer.invertCurrentPage'),
            }}
            /** @ts-ignore */
            rowKey={(item: { id: any }) => item.id}
            onChange={onChange}
            onSearch={onSearch}
            onSelectChange={onSelectChange}
            /** @ts-ignore */
            render={renderItem}
            v-slots={slots}
          ></Transfer>
        </div>
      );
    };
  },
});
