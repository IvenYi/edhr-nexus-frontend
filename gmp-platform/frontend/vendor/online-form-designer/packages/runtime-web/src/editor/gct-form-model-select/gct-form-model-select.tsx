import { defineComponent, onMounted, PropType, ref } from 'vue';
import { useGctFormValue, useNamespace } from '@gct-paas/core';
import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { groupBy } from 'lodash-es';
import { ITextEditor } from '@gct/runtime';
import OnlineFormModelSelect from '../../components/select-online-form-model/online-form-model-select.vue';
import { Form } from 'ant-design-vue';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { getReportListSystemModels } from '/@/apis/gct-apaas/ReportController';
import './gct-form-model-select.scss';

const appInfoStore = useAppInfoStore();

const modelTypeOptions = [
  { value: 'entity', label: 'sys.pageDesigner.entity' },
  { value: 'data', label: 'sys.pageDesigner.data' },
  { value: 'view', label: 'sys.pageDesigner.view' },
  { value: 'form', label: 'sys.pageDesigner.form', project: ['eDHR', 'MEDPRO'] },
  { value: 'system', label: 'sys.pageDesigner.system' },
];

export const GctFormModelSelect = defineComponent({
  name: 'GctFormModelSelect',
  props: {
    model: {
      type: Object as PropType<ITextEditor>,
      required: true,
    },
    value: {
      type: String,
    },
  },
  setup(props) {
    const t = (window as any).$t;
    const ns = useNamespace('form-model-select');
    // 模型标识
    const val = useGctFormValue();
    // 模型分类
    const category = useGctFormValue('category');
    // 模型分类
    const categorySelect = useGctFormValue('categorySelect');
    // 模型名称
    const modelName = useGctFormValue('modelName');
    // 表单模型id
    const formId = useGctFormValue('formId');
    // 模型清单
    const modelOptions = ref<IObject[]>([]);
    // 模型选择分组清单
    const modelGroup = ref<IObject>({});
    // 模型数据加载
    const loadModel = async () => {
      if (categorySelect.value === 'system') {
        modelOptions.value = (await getReportListSystemModels()) || [];
        return { [t('sys.pageDesigner.system')]: modelOptions.value };
      } else {
        modelOptions.value =
          (await getModelComprehensiveModelSummary({
            type: props.model.props?.modelTypes || 'NDO,BASE,TREE,TRANSACTION,SIGN',
            category: category.value,
            report: true,
          })) || [];
        return groupBy(modelOptions.value, 'group');
      }
    };
    const { onFieldChange } = Form.useInjectFormItemContext();

    onMounted(async () => {
      val.value = val.value ? val.value : undefined;
      category.value = category.value || 'entity';
      categorySelect.value = categorySelect.value || category.value;
      modelGroup.value = await loadModel();
    });

    const categoryChange = async (cat) => {
      category.value = cat;
      val.value = null;
      formId.value = undefined;
      modelGroup.value = await loadModel();
    };

    const modelChange = (value) => {
      const item = modelOptions.value.find((item) => {
        if (item.key === value) {
          return true;
        }
        return false;
      });
      if (item) {
        modelName.value = item.name;
      }
      if (categorySelect.value === 'system') {
        category.value = item.modelCategory;
      }
      onFieldChange();
      onSearch(null);
    };

    function onSearch(input): void {
      if (categorySelect.value === 'system') return;
      if (input == null || input == '') {
        modelGroup.value = groupBy(modelOptions.value, 'group');
      } else {
        const reg = new RegExp(input);
        modelGroup.value = groupBy(
          modelOptions.value.filter((item) => {
            return reg.test(item.name);
          }),
          'group',
        );
      }
    }

    function onFormSelectChange(formInfo) {
      if (!formInfo) {
        modelName.value = '';
        formId.value = undefined;
        val.value = undefined;
      } else {
        const { name, version } = formInfo;
        modelName.value = `${name}:${version}`;
      }
      onFieldChange();
    }

    return {
      t,
      ns,
      val,
      category,
      categorySelect,
      modelGroup,
      categoryChange,
      modelChange,
      onSearch,
      formId,
      onFormSelectChange,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <a-input-group compact>
          <a-select
            v-model:value={this.categorySelect}
            class={this.ns.e('class')}
            placeholder="请选择"
            onSelect={this.categoryChange}
            disabled={this.model.disabled}
          >
            {modelTypeOptions
              .filter((item) => {
                if (this.model.props?.exclude) {
                  return (
                    !this.model.props.exclude.includes(item.value) &&
                    (!item.project ||
                      (item.project &&
                        appInfoStore?.appInfo?.suiteKey &&
                        item.project.includes(appInfoStore?.appInfo?.suiteKey)))
                  );
                }
                if (item.project) {
                  return (
                    appInfoStore?.appInfo?.suiteKey &&
                    item.project.includes(appInfoStore?.appInfo?.suiteKey)
                  );
                }
                return true;
              })
              .map((item) => {
                return (
                  <a-select-option key={item.value} value={item.value}>
                    {this.t(item.label)}
                  </a-select-option>
                );
              })}
          </a-select>
          {this.category !== 'form' ? (
            <a-select
              v-model:value={this.val}
              class={this.ns.e('model')}
              onSelect={this.modelChange}
              show-search
              placeholder="请选择"
              disabled={this.model.disabled}
              // onSearch={this.onSearch}
              filterOption={(input: string, option: any) => {
                return (
                  (option.label || option.name).toLowerCase().indexOf(input.toLowerCase()) >= 0
                );
              }}
            >
              {Object.keys(this.modelGroup).map((group) => {
                const items = this.modelGroup[group].map((item) => {
                  return (
                    <a-select-option key={item.key} value={item.key} label={item.name}>
                      {item.name}
                    </a-select-option>
                  );
                });
                return (
                  <a-select-opt-group key={group} label={group}>
                    {items}
                  </a-select-opt-group>
                );
              })}
            </a-select>
          ) : (
            <OnlineFormModelSelect
              v-model:joinFormRefId={this.formId}
              v-model:joinModelKey={this.val}
              class={this.ns.e('model')}
              disabled={this.model.disabled}
              border={true}
              onChange={this.onFormSelectChange}
            />
          )}
        </a-input-group>
      </div>
    );
  },
});
