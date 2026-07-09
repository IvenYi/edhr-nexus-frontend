import { computed, defineComponent, Directive, PropType, ref, watch } from 'vue';
import { useGctFormValue, useNamespace } from '@gct-paas/core';
import {
  GCT_DND_INSERT_POS,
  IGctDndConfig,
  IGctDndData,
  IGctDndRenderItemOptions,
  FIELD_TYPE,
} from '@gct/runtime';
import GctDndContainer from '../../../gct-dnd-container/gct-dnd-container';
import { IReportField, IReportFieldConfig } from '../../interface';
import { REPORT_FIELD_DND_GROUP } from '../../constants';
import { useReportViewController } from '../../hooks';
import { ReportFieldItem } from './report-field-item';
import { ReportFieldChange } from './report-field-change';
import { message } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';
import './report-field-config.scss';
import { dimensionEnum } from '../../schema/enum';

const clickOutside: Directive = {
  beforeMount(el, binding) {
    el.clickOutsideHandler = (event: MouseEvent) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el.clickOutsideHandler);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideHandler);
  },
};

export const ReportFieldConfig = defineComponent({
  name: 'ReportFieldConfig',
  directives: {
    clickOutside,
  },
  props: {
    value: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    model: {
      type: Object as PropType<IReportFieldConfig>,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const ns = useNamespace('report-field-config');
    const val = useGctFormValue<string[]>();

    const reportView = useReportViewController();

    const openSelectedId = ref();

    const dndConfig: IGctDndConfig = {
      group: REPORT_FIELD_DND_GROUP,
      direction: 'vertical',
      isDrop: true,
      insertPos: GCT_DND_INSERT_POS.LAST,
      tagMap: { dimension: props.model.dimension },
      drop(arg) {
        if (arg.mode === 'move' && props.model.dimension === arg.data?.inDimension) {
          return arg.data;
        }
        let field: IObject = arg.data;
        if (arg.mode === 'move') {
          const d = arg.data;
          field = {
            key: d.field,
            name: d.fieldName,
            type: d.fieldType,
            modelKey: d.modelKey,
            modelCategory: d.modelCategory,
            mappingType: d.mappingType,
          };
        }
        const key = `${props.model.group}:${field.key}`;
        let dataGroup = '';
        if (arg.data.id) {
          dataGroup = arg.data.id.split(':')[0];
        }
        // 图片，签名不能拖入指标
        if (
          props.model.dimension === dimensionEnum.INDICATOR &&
          [FIELD_TYPE.SIGNATURE].includes(arg.data.type)
        ) {
          message.warn(`【${field.name}】签名字段不支持拖入指标（度量）中`);
          return null;
        }
        if (
          props.model.dimension === dimensionEnum.INDICATOR &&
          [FIELD_TYPE.IMAGE].includes(arg.data.type)
        ) {
          message.warn(`【${field.name}】图片字段不支持拖入指标（度量）中`);
          return null;
        }
        if (
          (!arg.data.inDimension || props.model.group !== dataGroup) &&
          reportView.state.schema.fieldMap[key]
        ) {
          message.warn(`【${field.name}】字段已存在`);
          return null;
        }
        if (arg.mode === 'move') {
          if (arg.data.id) {
            delete reportView.state.schema.fieldMap[arg.data.id];
          }
          delete reportView.state.schema.fieldMap[key];
        }
        let data: IReportField = {
          id: `${props.model.group}:${field.key}`,
          field: field.key,
          fieldName: field.name,
          fieldType: field.type,
          modelCategory: field.modelCategory,
          modelKey: field.modelKey,
          mappingType: field.mappingType,
          inDimension: props.model.dimension,
        };
        if (reportView.provider.value.createField) {
          data = reportView.provider.value.createField(data);
        }
        return data;
      },
      end(arg, res) {
        if (props.model.dimension === res.cfg.tagMap?.dimension) {
          return null;
        }
        if (arg.mode === 'move') {
          const i = items.value.findIndex((item) => item.id === arg.data.id);
          if (i !== -1) {
            items.value.splice(i, 1);
          }
          items.value = items.value;
        }
        return null;
      },
    };

    watch(
      () => openSelectedId.value,
      (val) => {
        if (val) {
          isChange.value = false;
        }
      },
    );

    const items = computed<IGctDndData[]>({
      get() {
        const count = props.count;
        console.log('count', count);
        const fields = val.value
          .map((key) => {
            return reportView.state.schema.fieldMap[key];
          })
          .filter((item) => !!item);
        return fields;
      },
      set(arr: IGctDndData[]) {
        val.value = arr.map((item) => {
          if (!reportView.state.schema.fieldMap[item.id]) {
            reportView.state.schema.fieldMap[item.id] = item as IReportField;
            reportView.hooks.field.add.callSync(null, item as IReportField);
          }
          return item.id;
        });
        reportView.hooks.field.sort.callSync(null);
      },
    });

    const isChange = ref<boolean>(false);

    function addField(): void {
      if (reportView.state.schema && reportView.state.schema.modelKey) {
        isChange.value = true;
        openSelectedId.value = null;
      }
    }

    function closeAddSelect(): void {
      isChange.value = false;
      openSelectedId.value = null;
    }

    function onDelete(data: IGctDndData): void {
      const i = items.value.findIndex((item) => item.id === data.id);
      if (i !== -1) {
        const arr = [...items.value];
        arr.splice(i, 1);
        const field = cloneDeep(reportView.state.schema.fieldMap[data.id]);
        delete reportView.state.schema.fieldMap[data.id];
        items.value = arr;
        reportView.hooks.field.delete.callSync(null, field);
      }
    }
    function replaceField(newValue, old) {
      reportView.hooks.field.replace.callSync(null, newValue, old);
    }
    return {
      ns,
      items,
      reportView,
      dndConfig,
      addField,
      isChange,
      closeAddSelect,
      onDelete,
      openSelectedId,
      replaceField,
    };
  },
  render() {
    return (
      <div
        class={this.ns.b()}
        count={this.reportView.state.count}
        v-click-outside={this.closeAddSelect}
      >
        <GctDndContainer config={this.dndConfig} v-model:items={this.items}>
          {{
            before: () => {
              return (
                <div class={this.ns.e('add')}>
                  <a-button size="small" onClick={this.addField}>
                    {this.model.btnText || '添加'}
                  </a-button>
                  {this.isChange ? (
                    <ReportFieldChange
                      v-model:selectItems={this.items}
                      model={this.model}
                      closeAddSelect={this.closeAddSelect}
                    />
                  ) : null}
                </div>
              );
            },
            default: ({ data }: IGctDndRenderItemOptions<any>) => {
              return (
                <ReportFieldItem
                  key={data.id}
                  data={data}
                  v-model:items={this.items}
                  model={this.model}
                  onDelete={this.onDelete}
                  v-model:openSelectedId={this.openSelectedId}
                  onReplace={this.replaceField}
                />
              );
            },
          }}
        </GctDndContainer>
      </div>
    );
  },
});
