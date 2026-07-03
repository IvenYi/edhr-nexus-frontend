import { defineComponent, PropType, ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useNamespace } from '@gct-paas/core';
import {
  IModal,
  IGctDndConfig,
  useModal,
  FieldMetaDTO,
  IGctDndRenderItemOptions,
  FieldIconMap,
} from '@gct/runtime';
import {
  IReportDesignProvider,
  IReportField,
  ITableReportField,
  ITableReportSchema,
} from '../../../interface';
import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
import { createUUID, AsyncSeriesHook } from 'qx-util';
import { filterType } from '../util';
import GctDndContainer from '../../../../gct-dnd-container/gct-dnd-container';
import {
  dimensionEnum,
  horizontalEnum,
  SummaryCalculationMethod,
  verticalEnum,
} from '../../../schema';
import { ReportDefaultDrillItem } from './report-default-drill-item';
import { filterReportFields } from '../../../utils';
import './report-default-drill.scss';

/**
 * 默认钻取配置模态
 */
export const ReportDefaultDrill = defineComponent({
  name: 'ReportDefaultDrill',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    field: {
      type: Object as PropType<IReportField>,
      default: () => ({}),
    },
    schema: {
      type: Object as PropType<ITableReportSchema>,
      default: () => ({}),
    },
    provider: {
      type: Object as PropType<IReportDesignProvider>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('report-default-drill');
    // 加载完毕才绘制，主要是等属性的加载。避免选择出现闪烁
    const isLoaded = ref(false);
    // 获取已保存的钻取层级字段
    const drillAttrs = computed(() => {
      if (props.field && props.field.drillAttrs) {
        return props.field.drillAttrs.split(',');
      }
      return [];
    });
    // validate hook
    const hook = new AsyncSeriesHook<void, { isClose: boolean }>();
    // 本次修改删除的钻取层级字段标识
    const deletes: string[] = [];

    // 当前已选择钻取层级字段
    const items = ref<ITableReportField[]>(
      drillAttrs.value.map((id) => {
        return props.schema.drillMap[id];
      }),
    );
    // 当前模型所有属性
    const fields = ref<FieldMetaDTO[]>([]);
    // 获取模型字段元数据
    async function loadFields() {
      // 获取当前报表的数据模型
      try {
        // 获取模型字段元数据
        const res = await getModelMetaDetail({ modelKey: props.schema.modelKey || '' });
        if (res && res.fieldMetaList) {
          // 过滤并处理字段列表
          fields.value = filterReportFields(res.fieldMetaList ?? []).filter((item) => {
            return filterType(item.type!, item.mappingType);
          });
        }
        isLoaded.value = true;
      } catch (error) {
        console.error('Failed to load model fields:', error);
      }
    }

    loadFields();

    // 拖拽配置
    const dndConfig: IGctDndConfig = reactive({
      group: 'DrillLevels',
      isDrag: true,
      isDrop: true,
      direction: 'vertical',
    });

    useModal(async () => {
      return {
        ok: true,
        data: [items.value.map((item) => item.id).join(',') as unknown as IData],
      };
    });

    function onDeleteItem(id: string) {
      const index = items.value.findIndex((item) => item.id === id);
      if (index > -1) {
        items.value.splice(index, 1);
        items.value = items.value;
        deletes.push(id);
      }
    }

    function onAddLevel() {
      const f = props.field;
      let data: ITableReportField = {
        id: createUUID(),
        field: null as any,
        fieldName: '',
        fieldType: '' as any,
        modelCategory: f.modelCategory,
        modelKey: f.modelKey,
        mappingType: f.mappingType,
        inDimension: dimensionEnum.DRILL,
        aggregationMethod: SummaryCalculationMethod.SUM,
        horizontal: horizontalEnum.LEFT,
        vertical: verticalEnum.MIDDLE,
      };
      if (props.provider.createField) {
        data = props.provider.createField(data) as ITableReportField;
      }
      items.value.push(data);
      if (!props.schema.drillMap) {
        props.schema.drillMap = {};
      }
      props.schema.drillMap[data.id] = data;
    }

    function onCancel() {
      props.modal.dismiss();
    }

    async function onOk() {
      const ctx = await hook.call({ isClose: true });
      if (ctx.isClose === false) {
        return;
      }
      props.field.drillAttrs = items.value
        .filter((item) => !!item.field)
        .map((item) => item.id)
        .join(',');
      deletes.forEach((id) => {
        delete props.schema.drillMap[id];
      });
      props.modal.dismiss({ ok: true });
    }

    onMounted(() => {
      if (items.value.length === 0) {
        onAddLevel();
      }
    });

    onUnmounted(() => {
      hook.clear();
    });

    return {
      ns,
      hook,
      isLoaded,
      items,
      fields,
      dndConfig,
      onDeleteItem,
      onAddLevel,
      onCancel,
      onOk,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.isLoaded ? (
          <div class={this.ns.e('header')}>
            <span class={this.ns.e('header-title')}>设置钻取层级</span>
          </div>
        ) : null}
        {this.isLoaded ? (
          <div class={this.ns.e('body')}>
            <div class={this.ns.e('item-field')}>
              <span class={this.ns.e('item-field-icon')}>
                <i class={'iconfont ' + FieldIconMap[this.field.fieldType] || 'icon-zidingyi'} />
              </span>
              <span class={this.ns.e('item-field-title')}>{this.field.fieldName}</span>
              <div class={this.ns.e('dot')}></div>
              <div class={[this.ns.e('line'), this.ns.e('half-line')]}></div>
            </div>
            <GctDndContainer v-model:items={this.items} config={this.dndConfig}>
              {{
                default: (args: IGctDndRenderItemOptions<ITableReportField>) => {
                  const { data, index } = args;
                  return (
                    <ReportDefaultDrillItem
                      size={this.items.length}
                      index={index}
                      key={data.id}
                      data={data}
                      fields={this.fields}
                      hook={this.hook}
                      onDelete={() => this.onDeleteItem(data.id)}
                    />
                  );
                },
              }}
            </GctDndContainer>
            {this.items.length < 5 && (
              <div class={this.ns.e('add')}>
                <a-button
                  ghost
                  type="primary"
                  icon={<i class="iconfont icon-tianjia" />}
                  onClick={this.onAddLevel}
                >
                  添加层级字段
                </a-button>
                <div class={this.ns.e('line')}></div>
              </div>
            )}
          </div>
        ) : null}
        {this.isLoaded ? (
          <div class={this.ns.e('footer')}>
            <a-button onClick={this.onCancel}>取消</a-button>
            <a-button type="primary" onClick={this.onOk}>
              确认
            </a-button>
          </div>
        ) : null}
      </div>
    );
  },
});

export default ReportDefaultDrill;
