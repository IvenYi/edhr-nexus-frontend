import { computed, defineComponent, PropType, ref } from 'vue';
import {
  IModal,
  IEditForm,
  EditorType,
  IFormEditItem,
  IFormCollapse,
  IFormCollapsePane,
  // useModal,
  useNamespace,
  IFormulaEditor,
  FIELD_TYPE,
  useModal,
  II18nEditor,
} from '@gct/runtime';
import { message } from 'ant-design-vue';
import { ExpressionTabEnum, IdentifierItemInterface } from '/@/components/Expression';
import { postReportDataSetGenColumn } from '/@/apis/gct-apaas/ReportDataSetController';
import { formulaToJson, groupFieldsByModel } from '../utils';
import { ExprDTO } from '/@/apis/gct-platform/model';
import { FORMULA_DISPLAY_FIELD_PREFIX } from '../constants';
import './formula-display-field-modal.scss';

/**
 * 公式显示字段数据接口
 */
export interface IFormulaDisplayFieldData {
  fieldType: FIELD_TYPE.FUNCTION; // 字段类型，固定为 FIELD_TYPE.EXPRESSION
  fieldName: string; // 字段名称
  fieldNameI18n?: string; // 字段名称多语言
  fieldKey: string; // 字段KEY
  expression: string; // 公式表达式
  expressionEcho: string; // 公式表达式回显(纯展示，不可用)
  compileExpr?: string; // 经过请求后台，编译后的表达式
  functionName?: string; // 根公式函数名称
  description?: string; // 描述
  mappingType?: string; // 公式字段返回类型
}

/**
 * 新建/编辑公式显示字段弹窗组件
 */
export const FormulaDisplayFieldModal = defineComponent({
  name: 'FormulaDisplayFieldModal',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    // 已存在的字段KEY列表，用于校验重复
    existingKeys: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    fields: {
      type: Array as PropType<IObject[]>,
      default: () => [],
    },
  },
  setup(props) {
    const formRef = ref();
    const ns = useNamespace('formula-display-field-modal');

    const t = window.$t;

    // 表单数据
    const formData = ref<IFormulaDisplayFieldData>({
      fieldType: FIELD_TYPE.FUNCTION,
      fieldName: '',
      fieldNameI18n: '',
      fieldKey: '',
      expression: '',
      expressionEcho: '',
      compileExpr: '',
      description: '',
      mappingType: '',
    });

    const formulaIdentifiers = computed<
      Record<string, (() => IdentifierItemInterface[]) | IdentifierItemInterface[]>
    >(() => {
      return {
        [ExpressionTabEnum.FIELD]: groupFieldsByModel(props.fields),
      };
    });

    // 表单配置 - 使用 gct-edit-form 的 JSON 配置
    const formModel = computed<IEditForm>(() => ({
      type: 'edit',
      children: [
        {
          name: 'collapseContainer',
          type: 'collapse',
          isContainer: true,
          expandIconPosition: 'left',
          expandIconStyle: 'up-down',
          layout: 'grid',
          children: [
            {
              name: 'basicInfoPane',
              type: 'collapse-pane',
              isContainer: true,
              title: t('sys.dataSet.basicInfo'),
              layout: 'grid',
              children: [
                {
                  type: 'hidden',
                  name: 'fieldType',
                },
                {
                  type: 'item',
                  name: 'fieldTypeName',
                  label: t('sys.dataSet.fieldType'),
                  editor: {
                    type: EditorType.INFO,
                    content: t('sys.dataSet.formulaFieldType'),
                  },
                },
                {
                  type: 'hidden',
                  name: 'fieldNameI18n',
                },
                {
                  type: 'item',
                  name: 'fieldName',
                  label: t('sys.dataSet.fieldNameLabel'),
                  rules: [
                    {
                      required: true,
                      message: t('sys.dataSet.pleaseInputFieldName'),
                    },
                  ],
                  editor: {
                    type: EditorType.I18N,
                    placeholder: t('sys.inputText'),
                    cfgKey: 'fieldNameI18n',
                  } as II18nEditor,
                },
                {
                  type: 'item',
                  name: 'fieldKey',
                  label: t('sys.dataSet.fieldKey'),
                  rules: [
                    {
                      required: true,
                      validator: (_rule: any, value: string) => {
                        return new Promise<string | void>((resolve, reject) => {
                          if (!value) {
                            return reject(t('sys.dataSet.pleaseInputFieldKey'));
                          }
                          if (
                            !new RegExp(`^${FORMULA_DISPLAY_FIELD_PREFIX}[a-z0-9_]*$`).test(value)
                          ) {
                            return reject(t('sys.dataSet.fieldKeyInvalid'));
                          }
                          if (props.existingKeys.includes(value)) {
                            return reject(t('sys.dataSet.fieldKeyDuplicateExist'));
                          }
                          resolve();
                        });
                      },
                    },
                  ],
                  editor: {
                    type: EditorType.TEXT,
                    addonBefore: FORMULA_DISPLAY_FIELD_PREFIX,
                    placeholder: t('sys.inputText'),
                  },
                },
              ] as IFormEditItem[],
            } as IFormCollapsePane,
            {
              name: 'configOptionsPane',
              type: 'collapse-pane',
              isContainer: true,
              title: t('sys.dataSet.configOptions'),
              layout: 'grid',
              children: [
                {
                  type: 'hidden',
                  name: 'expressionEcho',
                },
                {
                  type: 'item',
                  name: 'expression',
                  label: t('sys.dataSet.formulaLabel'),
                  rules: [
                    {
                      required: true,
                      message: t('sys.dataSet.pleaseInputFormula'),
                    },
                  ],
                  editor: {
                    type: EditorType.FORMULA,
                    placeholder: t('sys.inputText'),
                    config: {
                      modalTitle: t('sys.dataSet.newFormula'),
                      identifiers: formulaIdentifiers.value,
                    },
                    props: {
                      rows: 4,
                    },
                  } as IFormulaEditor,
                },
                {
                  type: 'item',
                  name: 'description',
                  label: t('sys.dataSet.description'),
                  editor: {
                    type: EditorType.TEXTAREA,
                    placeholder: t('sys.dataSet.pleaseInputTip'),
                    props: {
                      rows: 3,
                    },
                  },
                },
              ] as IFormEditItem[],
            } as IFormCollapsePane,
          ] as IFormCollapsePane[],
        } as IFormCollapse,
      ],
    }));

    /**
     * 保存公式显示字段
     */
    async function handleSave(): Promise<IData> {
      const ext = formulaToJson(formData.value.expression.expr) as ExprDTO;
      ext.alias = formData.value.fieldKey;
      const result = await postReportDataSetGenColumn(ext);
      if (result) {
        formData.value.functionName = ext.name;
        formData.value.compileExpr = result;
        formData.value.mappingType = formData.value.expression.mappingType;
      }
      return formData.value;
    }

    useModal(async () => {
      try {
        const bol = await formRef.value?.c.validate();
        if (!bol) {
          return null as any;
        }
        const res = await handleSave();
        return {
          ok: true,
          data: [res],
        };
      } catch (error) {
        console.error(t('sys.dataSet.saveFailed'), error);
        if (error instanceof Error) {
          message.error(error.message || t('sys.dataSet.saveFailed'));
        }
        // 校验失败，返回 null 阻止关闭
        return null as any;
      }
    });

    return () => {
      return (
        <div class={ns.b()}>
          <gct-edit-form
            class={ns.e('form')}
            ref={formRef}
            v-model:data={formData.value}
            model={formModel.value}
            embed
            adaptModal={false}
          />
        </div>
      );
    };
  },
});
