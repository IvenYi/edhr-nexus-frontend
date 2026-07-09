import { computed, defineComponent, PropType, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { EntityModelCategoryEnum, FieldIconMap, IGctDndData } from '@gct/runtime';
import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
import { useReportViewController } from '../../hooks';
import { IReportField, IReportFieldConfig } from '../../interface';
import { filterReportFields } from '../../utils';
import './report-field-change.scss';

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
}

export const ReportFieldChange = defineComponent({
  name: 'ReportFieldChange',
  props: {
    selectItems: {
      type: Array as PropType<IGctDndData[]>,
      required: true,
    },
    model: {
      type: Object as PropType<IReportFieldConfig>,
      required: true,
    },
    closeAddSelect: {
      type: Function as PropType<(i) => void>,
      required: true,
    },
    operateType: {
      type: String,
      default: 'ADD',
    },
    data: {
      type: Object as PropType<IGctDndData>,
    },
  },
  emits: ['update:selectItems'],
  setup(props, { emit }) {
    const t = (window as any).$t;
    const ns = useNamespace('report-fileld-change');
    const c = useReportViewController();
    const fieldNames = { label: 'fieldName', value: 'id' };
    // 属性 可选项
    const options = ref<IGctDndData[]>([]);
    const selectRef = ref();
    const selectedKey = ref<string>();
    // 当前报表选中的配置模型
    const selectModel = ref<SelectModelOpts | null>(null);
    // 填充一选中的模型对象
    if (c.state.schema && c.state.schema.modelKey) {
      selectModel.value = {
        model: c.state.schema.modelKey,
        modelName: c.state.schema.modelName!,
        category: c.state.schema.modelCategory!,
      } as any;
    }

    const selectOptions = computed(() => {
      return options.value.filter((item) => {
        const key = `${props.model.group}:${item.field}`;
        if (c.state.schema.fieldMap[key]) {
          return false;
        }
        return true;
      });
    });

    async function loadModelFields() {
      if (selectModel.value) {
        const res = await getModelMetaDetail({ modelKey: selectModel.value.model });
        if (res) {
          options.value = (filterReportFields(
            res.fieldMetaList?.map((p) => {
              return {
                ...p,
                inDimension: props.model.dimension,
              };
            }) ?? [],
          )?.map((i) => {
            let data = {
              id: `${props.model.group}:${i.key}`,
              field: i.key,
              fieldName: i.name,
              fieldType: i.type,
              modelCategory: i.modelCategory,
              modelKey: i.modelKey,
              mappingType: i.mappingType,
              inDimension: props.model.dimension,
            };
            if (c.provider.value.createField) {
              data = c.provider.value.createField(data);
            }
            return data;
          }) ?? []) as IGctDndData[];
        } else {
          options.value = [];
        }
      } else {
        options.value = [];
      }
    }

    function onSelect(value: string, option: IReportField) {
      if (props.operateType === 'ADD') {
        const newArr = [...props.selectItems, option];
        emit('update:selectItems', newArr);
      } else {
        if (props.data) {
          delete c.state.schema.fieldMap[props.data.id];
          c.state.schema.fieldMap[option.id] = option;
        }
        const newArr = props.selectItems.map((item) =>
          item.id === props.data?.id ? option : item,
        );
        emit('update:selectItems', newArr);
      }
      props.closeAddSelect(option);
    }

    const filterOption = (input: string, option: any) => {
      return option.fieldName.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    };

    loadModelFields();

    return {
      ns,
      t,
      options,
      selectOptions,
      onSelect,
      selectedKey,
      fieldNames,
      selectRef,
      filterOption,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <a-select
          ref="selectRef"
          v-model:value={this.selectedKey}
          placeholder={this.t('sys.chooseText')}
          options={this.selectOptions}
          onSelect={this.onSelect}
          fieldNames={this.fieldNames}
          show-search
          allowClear
          defaultOpen
          filter-option={this.filterOption}
        >
          {{
            option: ({ fieldName, fieldType }) => {
              return (
                <div class={this.ns.e('item')}>
                  <span class={this.ns.e('item-icon')}>
                    <i class={['iconfont', FieldIconMap[fieldType] || 'icon-zidingyi']}></i>
                  </span>
                  <span class={this.ns.e('item-title')}>{fieldName}</span>
                </div>
              );
            },
          }}
        </a-select>
      </div>
    );
  },
});
