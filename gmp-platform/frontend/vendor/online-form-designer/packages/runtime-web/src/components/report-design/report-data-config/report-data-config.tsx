import { computed, defineComponent, ref, watch } from 'vue';
import { useNamespace } from '@gct-paas/core';
import {
  IModalData,
  IGctDndRenderItemOptions,
  IGctDndData,
  IGctDndConfig,
  EntityModelCategoryEnum,
  FieldIconMap,
  FIELD_TYPE,
} from '@gct/runtime';
import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
import { ModelSelectModal } from '../../model-select-modal/model-select-modal';
import GctDndContainer from '../../gct-dnd-container/gct-dnd-container';
import { REPORT_FIELD_DND_GROUP, REPORT_TYPE } from '../constants';
import { useReportViewController } from '../hooks';
import { message } from 'ant-design-vue';
import './report-data-config.scss';
import { cloneDeep } from 'lodash-es';
import ModelCascader, {
  FIELD_SEPARATOR,
  getRootModelKeyFromJointKey,
  getLeafModelKeyFromJointKey,
  getForeignKeyChainFromJointKey,
} from '/@/components/ModelCascader';

interface SelectModelOpts {
  /**
   * 模型标识
   *
   * @type {string}
   */
  model: string;
  /**
   * 模型名称
   *
   * @type {string}
   */
  modelName: string;
  /**
   * 模型类别
   *
   * @type {EntityModelCategoryEnum}
   */
  category: EntityModelCategoryEnum;
  /**
   * 表单模型 id
   */
  formId: string;
  categorySelect: string;
  isDataSet?: boolean; // 是否是数据集
}
// 未支持字段类型黑名单
const unsupportedFieldTypes = [
  FIELD_TYPE.ATTACHMENT,
  FIELD_TYPE.MASTERSLAVE,
  FIELD_TYPE.EXPRESSION_CONDITION,
  FIELD_TYPE.LABEL_TEMPLATE,
  FIELD_TYPE.SERIALRULE,
];

export const ReportDataConfig = defineComponent({
  name: 'ReportDataConfig',
  setup() {
    const ns = useNamespace('report-data-config');
    const c = useReportViewController();

    // 当前报表选中的配置模型
    const selectModel = ref<SelectModelOpts | undefined>(undefined);
    // 选中模型的属性清单
    const modelFieldOptions = ref<IGctDndData[]>([]);

    const showOptions = computed<IGctDndData[]>(() => {
      const searchText = searchVal.value?.trim();
      if (searchText && searchText !== '') {
        return modelFieldOptions.value.filter((item) => {
          if (item.name.toLowerCase().includes(searchText.toLowerCase())) {
            return true;
          }
          return false;
        });
      }
      return modelFieldOptions.value;
    });

    const isScheduleTable = computed(() => c.state.data.reportType === REPORT_TYPE.SCHEDULE_TABLE);

    // 拖拽配置
    const dndConfig: IGctDndConfig = {
      group: REPORT_FIELD_DND_GROUP,
      isDrop: false,
      mode: 'copy',
    };

    // 填充一选中的模型对象
    if (c.state.schema && c.state.schema.modelKey) {
      selectModel.value = {
        model: c.state.schema.modelKey,
        modelName: c.state.schema.modelName!,
        category: c.state.schema.modelCategory!,
        formId: c.state.schema.formId!,
        categorySelect: c.state.schema.categorySelect!,
        isDataSet: c.state.schema.isDataSet ?? false,
      };
    }

    // 明细表选择关联模型后，切换到交叉表时，将模型 key 重置为根模型 key
    watch(
      () => isScheduleTable.value,
      () => {
        if (!isScheduleTable.value && selectModel.value) {
          selectModel.value.model = getRootModelKeyFromJointKey(selectModel.value.model);
        }
      },
    );

    const searchVal = ref<string>('');

    // 在每次重新加载属性后，重新计算下钻的属性，当属性不存在时，删除下钻属性
    async function updateDrillAttrs(): Promise<void> {
      if (!c.state.schema.drillMap || Object.keys(c.state.schema.drillMap).length === 0) {
        return;
      }
      const keys = Object.keys(c.state.schema.fieldMap);
      keys.forEach((key) => {
        const field = c.state.schema.fieldMap[key];
        if (field && field.drillAttrs) {
          const drillAttrs = field.drillAttrs.split(',');
          const deleteKeys: string[] = [];
          const drillKeys = drillAttrs.filter((drillKey) => {
            const drillField = c.state.schema.drillMap[drillKey];
            if (drillField) {
              const fieldItem = modelFieldOptions.value.find((f) => f.key === drillField.field);
              if (!fieldItem) {
                deleteKeys.push(drillKey);
                return false;
              }
            }
            return true;
          });
          if (deleteKeys.length > 0) {
            deleteKeys.forEach((deleteKey) => {
              delete c.state.schema.drillMap[deleteKey];
            });
          }
          field.drillAttrs = drillKeys.join(',');
        }
      });
    }

    async function loadModelFields(options?: { clearFields?: boolean }) {
      if (selectModel.value) {
        const jointKey = selectModel.value.model;
        const modelKey = getLeafModelKeyFromJointKey(jointKey);
        const foreignKeyChain = getForeignKeyChainFromJointKey(jointKey);
        // debugger;
        const res = await getModelMetaDetail({ modelKey });
        if (res) {
          const options = (res.fieldMetaList ?? []).map((row) => ({
            ...row,
            // 提前给关联字段拼接上关联字段 key，预留给查询时使用
            key: [foreignKeyChain, row.key].filter(Boolean).join(FIELD_SEPARATOR),
          })) as IGctDndData[];

          modelFieldOptions.value = options;
        } else {
          modelFieldOptions.value = [];
        }
        // 使用字段类型黑名单进行过滤
        modelFieldOptions.value = modelFieldOptions.value.filter((item) => {
          return !unsupportedFieldTypes.includes(item.type);
        });
        // 每次加载完毕后，重新给 schema 中的 fieldMap 里的 fieldName 赋值
        if (c.state.schema && c.state.schema.fieldMap) {
          const keys = Object.keys(c.state.schema.fieldMap);
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const mapItem = c.state.schema.fieldMap[key];
            const field = modelFieldOptions.value.find(
              (item) => item.key === mapItem.field && item.type === mapItem.fieldType,
            );
            if (field) {
              mapItem.fieldName = field.name;
            } else {
              if (!options?.clearFields) return;
              // 如果在加载的模型字段中找不到该字段，则从 schema 中删除该字段配置，主要用于模型配置那边删除字段后同步到报表
              delete c.state.schema.fieldMap[key];
              c.hooks.field.delete.callSync(null, cloneDeep(mapItem));
            }
          }
        }
      } else {
        modelFieldOptions.value = [];
      }
      updateDrillAttrs();
    }

    const onOpenSelectModel = async () => {
      const res = await gct.openUtil.modal<IModalData>(
        ModelSelectModal,
        {
          data: {
            ...selectModel.value,
            model: getRootModelKeyFromJointKey(selectModel.value?.model || ''),
          },
        },
        {
          title: `${selectModel.value ? '切换' : '选择'}` + '数据源',
          width: 640,
          minHeight: 320,
          okText: '确认',
        },
      );
      if (res.ok && res.data) {
        if (selectModel.value && selectModel.value.model) {
          message.success('切换成功');
        }
        searchVal.value = '';
        selectModel.value = res.data[0] as SelectModelOpts;
        const modelKey = getLeafModelKeyFromJointKey(selectModel.value.model);
        c.updateSchema(
          c.provider.value.resetSchema({
            modelKey,
            modelName: selectModel.value.modelName,
            modelCategory: selectModel.value.isDataSet
              ? EntityModelCategoryEnum.DATA_SET
              : selectModel.value.category,
            categorySelect: selectModel.value.categorySelect,
            formId: selectModel.value.formId,
            isDataSet: selectModel.value.isDataSet,
          }),
        );
        c.state.data.modelKey = c.state.schema.modelKey;
        c.state.data.modelType = c.state.schema.modelCategory;
        await loadModelFields({ clearFields: true });
      }
    };

    const onRefreshModel = async () => {
      await loadModelFields();
      message.success('刷新成功');
    };

    const onSearchModel = async () => {
      await loadModelFields();
    };

    const handleSubModelChange = (jointKey: string) => {
      // debugger;
      if (!selectModel.value) return;
      selectModel.value.model = jointKey;
      loadModelFields();
    };

    if (selectModel.value) {
      loadModelFields();
    }

    return {
      ns,
      selectModel,
      showOptions,
      dndConfig,
      searchVal,
      isScheduleTable,
      onOpenSelectModel,
      onRefreshModel,
      onSearchModel,
      handleSubModelChange,
    };
  },
  render() {
    const isModel = [
      EntityModelCategoryEnum.ENTITY,
      EntityModelCategoryEnum.VIEW,
      EntityModelCategoryEnum.FORM,
      EntityModelCategoryEnum.DATA,
    ].includes(this.selectModel?.category as EntityModelCategoryEnum);

    return (
      <div class={this.ns.b()}>
        <div class={[this.ns.e('not-data'), this.ns.is('hidden', !!this.selectModel)]}>
          <div class={this.ns.e('not-data-icon')}>
            <img src="/assets/svg/empty-data-source-small.svg" />
          </div>
          <div class={this.ns.e('not-data-info')}>
            <span>暂无数据源</span>
          </div>
          <a-button type="primary" ghost onClick={this.onOpenSelectModel}>
            {{
              default: () => {
                return <span>选择模型或数据集</span>;
              },
              icon: () => {
                return <i class="iconfont icon-tianjia" />;
              },
            }}
          </a-button>
        </div>
        <div class={[this.ns.e('header'), this.ns.is('hidden', !this.selectModel)]}>
          <div class={this.ns.e('title')}>
            所属
            {isModel ? '模型' : '数据集'}
          </div>
          <div class={this.ns.e('actions')}>
            <div class={this.ns.e('action-item')} onClick={this.onOpenSelectModel}>
              <a-tooltip placement="top">
                {{
                  default: () => {
                    return <i class="iconfont icon-qiehuan" />;
                  },
                  title: () => {
                    return '切换';
                  },
                }}
              </a-tooltip>
            </div>
            <div class={this.ns.e('action-item')} onClick={this.onRefreshModel}>
              <a-tooltip placement="top">
                {{
                  default: () => {
                    return <i class="iconfont icon-shuaxin" />;
                  },
                  title: () => {
                    return '刷新';
                  },
                }}
              </a-tooltip>
            </div>
          </div>
        </div>
        <div class="px-3 py-2 border-b-solid border-[#F2F5F8]">
          {isModel && this.isScheduleTable ? (
            <ModelCascader
              expandToLeft
              value={this.selectModel?.model}
              label={this.selectModel?.modelName}
              onChange={this.handleSubModelChange}
            />
          ) : (
            <div class="text-xs truncate" v-ellipsis-title={this.selectModel?.modelName}>
              {this.selectModel?.modelName}
            </div>
          )}
        </div>
        <div class={[this.ns.e('search'), this.ns.is('hidden', !this.selectModel)]}>
          <a-input
            type="search"
            v-model:value={this.searchVal}
            placeholder="搜索名称"
            allowClear
            onSearch={this.onSearchModel}
            size="small"
          />
        </div>
        <div class={[this.ns.e('body'), this.ns.is('hidden', !this.selectModel)]}>
          <GctDndContainer config={this.dndConfig} items={this.showOptions}>
            {{
              default: ({ data }: IGctDndRenderItemOptions<any>) => {
                return (
                  <div class={this.ns.e('item')} title={data.name}>
                    <span class={this.ns.e('item-icon')}>
                      <i class={['iconfont', FieldIconMap[data.type] || 'icon-zidingyi']}></i>
                    </span>
                    <span class={this.ns.e('item-title')}>{data.name}</span>
                  </div>
                );
              },
            }}
          </GctDndContainer>
        </div>
      </div>
    );
  },
});
