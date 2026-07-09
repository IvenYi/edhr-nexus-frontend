import { computed, defineComponent, onMounted, PropType, ref, toRefs } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { ILinkData, INodeData } from '../interface';
import { FieldMetaDTO, IDictionaryItem, IModalData, ITableItem, ValueTypeEnum } from '@gct/runtime';
import { SqlLinkModeEnum } from '../enums';
import { useReportDataSetDesignStore } from '../store';
import { ReportDataSetDataPreview } from './report-data-set-data-preview';
import { ReportDataSetLinkConfigItem } from './report-data-set-link-config-item';
import { ReportDataSetLinkConfigItemBI } from './report-data-set-link-config-item-BI';
import { DataRulesModal } from '../../data-rules-modal/data-rules-modal';
import { DataRulesModalBI } from '../../data-rules-modal-BI/data-rules-modal-BI';
import './report-data-set-link-config.scss';
import { message } from 'ant-design-vue';
import { DATA_PREVIEW_CONNECTOR } from '../constants';

export const ReportDataSetLinkConfig = defineComponent({
  name: 'ReportDataSetLinkConfig',
  props: {
    data: {
      type: Object as PropType<ILinkData>,
      required: true,
    },
  },
  setup(_props) {
    const ns = useNamespace('report-data-set-link-config');
    const t = (window as any).$t;
    const totalNum = ref<number>();
    const { data } = toRefs(_props);
    const modes: IDictionaryItem[] = [
      {
        label: t('sys.dataSet.leftJoin'),
        value: SqlLinkModeEnum.LEFT,
        icon: '/assets/data-set/left-join.default.svg',
        activeIcon: '/assets/data-set/left-join.active.svg',
        tooltip: '/assets/data-set/left-join.tip.png',
      },
      {
        label: t('sys.dataSet.rightJoin'),
        value: SqlLinkModeEnum.RIGHT,
        icon: '/assets/data-set/right-join.default.svg',
        activeIcon: '/assets/data-set/right-join.active.svg',
        tooltip: '/assets/data-set/right-join.tip.png',
      },
      {
        label: t('sys.dataSet.innerJoin'),
        value: SqlLinkModeEnum.INNER,
        icon: '/assets/data-set/inner-join.default.svg',
        activeIcon: '/assets/data-set/inner-join.active.svg',
        tooltip: '/assets/data-set/inner-join.tip.png',
      },
      {
        label: t('sys.dataSet.fullJoin'),
        value: SqlLinkModeEnum.FULL,
        icon: '/assets/data-set/full-join.default.svg',
        activeIcon: '/assets/data-set/full-join.active.svg',
        tooltip: '/assets/data-set/full-join.tip.png',
      },
    ];
    // 表关联键
    const fields = ref<string[][]>(data.value.fields?.length > 0 ? data.value.fields : [[]]);
    // 错误状态跟踪，用于标识哪些字段有错误
    const fieldErrors = ref<boolean[]>([]);
    const store = useReportDataSetDesignStore();
    const leftFields = ref<FieldMetaDTO[]>([]);
    const rightFields = ref<FieldMetaDTO[]>([]);
    const leftNode = computed<INodeData>(() => {
      return store.getNode(data.value.source)!;
    });
    const rightNode = computed<INodeData>(() => {
      return store.getNode(data.value.target)!;
    });
    const isBI = ref(store.isBI);
    const leftOptions = computed(() => {
      return leftFields.value.map((item) => {
        return {
          label: item.name,
          value: item.id,
          ...item,
        };
      });
    });
    const rightOptions = computed(() => {
      return rightFields.value.map((item) => {
        return {
          label: item.name,
          value: item.id,
          ...item,
        };
      });
    });
    // 预览的数据
    const previewItems = ref<IObject[]>([]);
    // 预览数据的翻译
    const _DICT = ref();
    // 预览表格配置
    const columns = computed<ITableItem[]>(() => {
      if (
        !data.value.fields ||
        data.value.fields.length === 0 ||
        !data.value.fields[0][0] ||
        !data.value.fields[0][1]
      ) {
        // 如果没有关联键字段，返回空数组
        return [];
      }
      const fields = store.fields.filter((field) => {
        return field.modelKey === data.value.source || field.modelKey === data.value.target;
      });
      const items: ITableItem[] = [];
      const model = store.modelMap.get(data.value.source);
      if (model) {
        fields
          .filter((field) => {
            return field.modelKey === model.key;
          })
          .forEach((field) => {
            const fieldMeta = model.fieldMetaList?.find((f) => f.id === field.id) || {};
            const key = `${field.modelKey.toLowerCase()}${DATA_PREVIEW_CONNECTOR}${field.fieldKey}`;
            items.push({
              title: field.label || fieldMeta.name!,
              dataIndex: key,
              name: key,
              width: 150,
              ellipsis: true,
              fieldKey: field.fieldKey,
              fieldType: field.fieldType,
              modelKey: field.modelKey,
            } as ITableItem);
          });
      }
      const model2 = store.modelMap.get(data.value.target);
      if (model2) {
        fields
          .filter((field) => {
            return field.modelKey === model2.key;
          })
          .forEach((field) => {
            const fieldMeta = model2.fieldMetaList?.find((f) => f.id === field.id) || {};
            const key = `${field.modelKey.toLowerCase()}${DATA_PREVIEW_CONNECTOR}${field.fieldKey}`;
            items.push({
              title: field.label || fieldMeta.name!,
              dataIndex: key,
              name: key,
              width: 150,
              ellipsis: true,
              fieldKey: field.fieldKey,
              fieldType: field.fieldType,
              modelKey: field.modelKey,
            } as ITableItem);
          });
      }
      return items;
    });

    function calcError(): void {
      // 重置错误状态
      fieldErrors.value = new Array(fields.value.length).fill(false);

      let hasError = false;

      // 校验每个关联键字段
      fields.value.forEach((field, index) => {
        if (field[0] && !field[1]) {
          return;
        }
        if (!field[0] || !field[1]) {
          fieldErrors.value[index] = true;
          hasError = true;
        }
      });

      if (hasError) {
        return;
      }
    }

    function updateLabelState(): void {
      store.updateLineLabelState(data.value.id);
    }

    function onAddLinkField(): void {
      fields.value.push([]);
      fieldErrors.value.push(false);
      loadPreviewItems();
      calcError();
    }

    function onDeleteLinkField(index: number): void {
      fields.value.splice(index, 1);
      fieldErrors.value.splice(index, 1);
      updateLabelState();
      loadPreviewItems();
      store.isChanged = true; // 标记为已修改

      calcError();
    }

    function onChangeLinkField(_val: string[]): void {
      data.value.fields = fields.value;
      store.isChanged = true; // 标记为已修改

      // 重新评估每个字段的错误状态
      // 只有在 beforeLeave 校验后才会有错误状态，所以这里检查是否有错误状态存在
      const hasAnyError = fieldErrors.value.some((error) => error);
      if (hasAnyError) {
        // 重新校验每个字段
        fields.value.forEach((field, index) => {
          if (field[0] && field[1]) {
            // 如果两个字段都有值，清除错误状态
            fieldErrors.value[index] = false;
          } else if (!field[0] && !field[1]) {
            // 如果两个字段都为空，保持错误状态
            fieldErrors.value[index] = true;
          } else if (!field[0] && field[1]) {
            fieldErrors.value[index] = true;
          } else if (field[0] && !field[1]) {
            // 如果只有一个字段有值，清除错误状态（用户正在选择）
            fieldErrors.value[index] = false;
          }
        });
      }

      loadPreviewItems();
      updateLabelState();

      calcError();
    }

    /**
     * 清除单个字段的错误状态
     * @param index - 字段索引
     * @param side - 左侧或右侧字段
     */
    function onClearFieldError(index: number, side: 'left' | 'right'): void {
      // 获取当前字段
      const field = fields.value[index];
      if (!field) return;

      // 只要有字段被选择了，就清除整行的错误状态
      // 因为用户正在进行选择操作，表明他们知道需要选择字段
      if (field[0] || field[1]) {
        fieldErrors.value[index] = false;
      }
    }

    function onChangeLinkMode(item: IDictionaryItem): void {
      data.value.joinType = item.value as string;
      loadPreviewItems();
    }

    async function openConfig(left: boolean) {
      const detail = left ? data.value.sourceFilter : data.value.targetFilter;
      detail.dataRuleEnabled = true;
      const res = await gct.openUtil.modal<IModalData>(
        DataRulesModal,
        {
          detail,
          modelKey: left ? leftNode.value.modelKey : rightNode.value.modelKey,
          excludeValueType: [ValueTypeEnum.SYS, ValueTypeEnum.VAR],
        },
        { title: t('sys.dataSet.fieldConditionRules'), width: 640, height: 480 },
      );
      if (res.ok && res.data?.[0]) {
        if (left) {
          data.value.sourceFilter = res.data[0] ?? {};
        } else {
          data.value.targetFilter = res.data[0] ?? {};
        }
        await loadPreviewItems();
      }
    }

    async function openConfigBI(left: boolean) {
      const detail = left ? data.value.sourceFilter : data.value.targetFilter;
      detail.dataRuleEnabled = true;
      const res = await gct.openUtil.modal<IModalData>(
        DataRulesModalBI,
        {
          detail,
          modelKey: left ? leftNode.value.modelKey : rightNode.value.modelKey,
          databaseId: store.databaseId,
          excludeValueType: [ValueTypeEnum.SYS, ValueTypeEnum.VAR],
        },
        { title: t('sys.dataSet.fieldConditionRules'), width: 800, height: 480 },
      );
      if (res.ok && res.data?.[0]) {
        if (left) {
          data.value.sourceFilter = res.data[0] ?? {};
          console.log('data.value', data.value);
        } else {
          data.value.targetFilter = res.data[0] ?? {};
        }
        await loadPreviewItems();
      }
    }

    if (!data.value.joinType) {
      data.value.joinType = SqlLinkModeEnum.LEFT;
    }

    async function loadPreviewItems() {
      updateLabelState();
      const count = data.value.fields.filter((item) => item[0] && item[1]).length;
      if (count === 0) {
        previewItems.value = [];
        totalNum.value = 0;
        return;
      }
      const res = await store.loadPreviewData(data.value.target, data.value.id);
      if (res) {
        previewItems.value = res.data || [];
        totalNum.value = res.totalCount;
        _DICT.value = res.dict || {};
      } else {
        previewItems.value = [];
        totalNum.value = 0;
      }
    }

    async function onRefreshPreview() {
      await loadPreviewItems();
      message.success(t('sys.dataSet.refreshSuccess'));
    }

    async function onInit(): Promise<void> {
      if (leftNode.value) {
        leftFields.value = await store.loadModelFields(leftNode.value.modelKey, false);
      }
      if (rightNode.value) {
        rightFields.value = await store.loadModelFields(rightNode.value.modelKey, false);
      }
      loadPreviewItems();
    }

    onInit();

    onMounted(() => {
      calcError();
    });

    function renderLinkField(index: number, item: string[] = []): JSX.Element {
      return store.isBI ? (
        <ReportDataSetLinkConfigItemBI
          index={index}
          items={item}
          leftOptions={leftOptions.value}
          rightOptions={rightOptions.value}
          fields={fields.value}
          hasError={fieldErrors.value[index] || false}
          onChangeLinkField={onChangeLinkField}
          onDeleteLinkField={onDeleteLinkField}
          onClearFieldError={onClearFieldError}
        />
      ) : (
        <ReportDataSetLinkConfigItem
          index={index}
          items={item}
          leftOptions={leftOptions.value}
          rightOptions={rightOptions.value}
          fields={fields.value}
          hasError={fieldErrors.value[index] || false}
          onChangeLinkField={onChangeLinkField}
          onDeleteLinkField={onDeleteLinkField}
          onClearFieldError={onClearFieldError}
        />
      );
    }

    function renderLinkFields() {
      return fields.value.map((item, index) => {
        return renderLinkField(index, item);
      });
    }

    return {
      ns,
      leftNode,
      rightNode,
      modes,
      totalNum,
      fields,
      fieldErrors,
      previewItems,
      columns,
      onRefreshPreview,
      openConfig,
      onAddLinkField,
      onChangeLinkMode,
      renderLinkFields,
      isBI,
      openConfigBI,
      _DICT,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('left')}>
          <div class={this.ns.b('link-mode')}>
            <div class={this.ns.be('link-mode', 'header')}>
              {this.$t('sys.dataSet.selectJoinType')}
            </div>
            <div class={this.ns.be('link-mode', 'body')}>
              {this.modes.map((item) => {
                const isActive = this.data.joinType === item.value;
                return (
                  <div
                    class={[this.ns.be('link-mode', 'item'), this.ns.is('active', isActive)]}
                    onClick={() => this.onChangeLinkMode(item)}
                  >
                    <span class={this.ns.be('link-mode', 'item-icon')}>
                      <svg-icon src={isActive ? item.activeIcon : item.icon} />
                    </span>
                    <span class={this.ns.be('link-mode', 'item-label')}>
                      <span>{item.label}</span>
                      <span>
                        <a-tooltip
                          color="white"
                          placement="top"
                          overlayClassName={this.ns.be('link-mode', 'item-tooltip')}
                        >
                          {{
                            title: () => {
                              return <img style={{ width: '100%' }} src={item.tooltip} alt="" />;
                            },
                            default: () => {
                              return <i class="iconfont icon-bangzhu" />;
                            },
                          }}
                        </a-tooltip>
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div class={this.ns.b('link-field-config')}>
            <div class={this.ns.be('link-field-config', 'header')}>
              <span>{this.$t('sys.dataSet.setTableJoinKey')}</span>
            </div>
            <div class={this.ns.be('link-field-config', 'body')}>
              <div class={this.ns.be('link-field-config', 'model-name')}>
                <div class={this.ns.be('link-field-config', 'model-name-item')}>
                  <div class={this.ns.bem('link-field-config', 'model-name-item', 'info')}>
                    {this.$t('sys.dataSet.leftTable')}
                  </div>
                  <div
                    class={this.ns.bem('link-field-config', 'model-name-item', 'label')}
                    title={this.leftNode.modelName}
                  >
                    {this.leftNode.modelName}
                  </div>
                  <div
                    class={[
                      this.ns.bem('link-field-config', 'model-name-item', 'filter'),
                      this.ns.is('active', this.data.sourceFilter?.dataRule?.exp),
                    ]}
                    onClick={() => (this.isBI ? this.openConfigBI(true) : this.openConfig(true))}
                  >
                    <a-tooltip title={this.$t('sys.dataSet.filterBeforeJoin')}>
                      <i class="iconfont icon-a-shaixuan1" />
                    </a-tooltip>
                  </div>
                </div>
                <div class={this.ns.be('link-field-config', 'model-name-item')}>
                  <div class={this.ns.bem('link-field-config', 'model-name-item', 'info')}>
                    {this.$t('sys.dataSet.rightTable')}
                  </div>
                  <div
                    class={this.ns.bem('link-field-config', 'model-name-item', 'label')}
                    title={this.rightNode.modelName}
                  >
                    {this.rightNode.modelName}
                  </div>
                  <div
                    class={[
                      this.ns.bem('link-field-config', 'model-name-item', 'filter'),
                      this.ns.is('active', this.data.targetFilter?.dataRule?.exp),
                    ]}
                    onClick={() => (this.isBI ? this.openConfigBI(false) : this.openConfig(false))}
                  >
                    <a-tooltip title={this.$t('sys.dataSet.filterBeforeJoin')}>
                      <i class="iconfont icon-a-shaixuan1" />
                    </a-tooltip>
                  </div>
                </div>
              </div>
              <div class={this.ns.be('link-field-config', 'fields')}>
                {this.renderLinkFields()}
                <div class={this.ns.be('link-field-config', 'add')} onClick={this.onAddLinkField}>
                  <i class="iconfont icon-tianjia" />
                  <span>{this.$t('sys.dataSet.addJoinKey')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class={this.ns.e('right')}>
          <ReportDataSetDataPreview
            key={this.data.target}
            columns={this.columns}
            data={this.previewItems}
            onRefresh={this.onRefreshPreview}
            total={this.totalNum}
            dict={this._DICT}
          />
        </div>
      </div>
    );
  },
});
