import { computed, defineComponent, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import {
  EditorType,
  ITable,
  ITableEditItem,
  ITableItem,
  ITextEditor,
  IModalData,
  FIELD_TYPE,
} from '@gct/runtime';
import { useReportDataSetDesignStore } from '../store';
import { FormulaDisplayFieldModal, IFormulaDisplayFieldData } from './formula-display-field-modal';
import { IFieldData } from '../interface';
import useExpression, {
  DataSetReturnTypeEnum,
  ExpressionModeEnum,
  ExpressionTabEnum,
} from '/@/components/Expression';
import { formulaToJson, groupFieldsByModel } from '../utils';
import { ExprDTO } from '/@/apis/gct-platform/model';
import { postReportDataSetGenColumn } from '/@/apis/gct-apaas/ReportDataSetController';
import { FORMULA_DISPLAY_FIELD_PREFIX } from '../constants';
import './fields-config.scss';
import { usePermissionStore } from '/@/store/modules/permission';

export const FieldsConfig = defineComponent({
  name: 'FieldsConfig',
  setup(_, { expose }) {
    const t = (window as any).$t;
    const tableRef = ref();
    const ns = useNamespace('fields-config');
    const items = ref<IObject[]>([]);
    const store = useReportDataSetDesignStore();

    // 过滤掉公式显示字段后的普通字段列表
    const fields = computed(() => {
      return items.value.filter((item) => item.source.fieldType !== FIELD_TYPE.FUNCTION);
    });

    /**
     * 打开新建公式显示字段弹窗
     */
    async function handleCreateFormulaField(): Promise<void> {
      // 获取已存在的字段KEY列表
      const existingKeys = store.fields.map((field) => field.key || field.fieldKey);

      const result = await gct.openUtil.modal<IModalData<IFormulaDisplayFieldData>>(
        FormulaDisplayFieldModal,
        {
          existingKeys,
          fields: fields.value,
        },
        {
          title: t('sys.dataSet.newFormulaDisplayField'),
          width: 640,
        },
      );

      if (result && result.ok && result.data && result.data.length > 0) {
        const formulaFieldData = result.data[0];

        // 创建公式显示字段数据
        const newField: IFieldData = {
          id: `${FORMULA_DISPLAY_FIELD_PREFIX}${Date.now()}`, // 使用时间戳作为唯一ID
          label: formulaFieldData.fieldName,
          key: formulaFieldData.fieldKey,
          modelKey: '', // 公式字段不属于任何模型
          modelCategory: '',
          fieldName: formulaFieldData.fieldName,
          fieldKey: formulaFieldData.fieldKey,
          fieldType: FIELD_TYPE.FUNCTION, // 标记为公式类型
          expression: formulaFieldData.expression,
          expressionEcho: formulaFieldData.expressionEcho,
          compileExpr: formulaFieldData.compileExpr,
          functionName: formulaFieldData.functionName,
          description: formulaFieldData.description,
        };

        // 添加到 store 的 fields 数组最前面
        store.fields.unshift(newField);
        store.isChanged = true;

        // 刷新表格
        tableRef.value?.reload();
      }
    }
    const permissionStore = usePermissionStore();
    const { openModal } = useExpression(
      permissionStore.currentProject === 'bi-designer' ? false : true,
    );

    /**
     * 编辑公式显示字段
     */
    async function handleEditFormulaField(row: IObject): Promise<void> {
      const data = row.source as IFieldData;
      openModal({
        modalTitle: t('sys.dataSet.editFormula'),
        returnType: data.expression?.mappingType as DataSetReturnTypeEnum,
        expr: data.expression?.expr,
        exprEcho: data.expressionEcho,
        mode: ExpressionModeEnum.DATA_SET_FORMULA,
        identifiers: {
          [ExpressionTabEnum.FIELD]: groupFieldsByModel(fields.value),
        },
        callback: (expr, _, form) => {
          if (form?.exprEcho) {
            data.expressionEcho = form.exprEcho;
          }
          data.expression = { expr, mappingType: form?.returnType };
          if (expr) {
            const ext = formulaToJson(expr) as ExprDTO;
            postReportDataSetGenColumn(ext).then((result) => {
              data.functionName = ext.name;
              data.compileExpr = result;
              data.mappingType = form?.returnType;
            });
          }
        },
      });
    }

    /**
     * 删除公式显示字段
     */
    function handleDeleteFormulaField(row: IObject): void {
      // 从 store 的 fields 数组中删除
      const index = store.fields.findIndex((f) => f.id === row.source.id);
      if (index > -1) {
        store.fields.splice(index, 1);
        store.isChanged = true;
      }

      // 刷新表格
      tableRef.value?.reload();
    }

    const columns = computed<ITableItem[]>(() => {
      const column: ITableItem[] = [
        {
          dataIndex: 'index',
          name: 'index',
          title: t('sys.dataSet.index'),
          width: 60,
          fixed: 'left',
        },
        {
          dataIndex: 'modelName',
          name: 'modelName',
          title: t('sys.dataSet.modelName'),
        },
        {
          dataIndex: 'fieldName',
          name: 'fieldName',
          title: t('sys.dataSet.fieldName'),
        },
        {
          dataIndex: 'fieldLabel',
          name: 'fieldLabel',
          title: t('sys.dataSet.fieldLabel'),
          type: 'edit',
          rules: [
            {
              required: true,
              message: t('sys.dataSet.pleaseInputFieldLabel'),
              trigger: 'blur',
            },
          ],
          width: 200,
          editor: {
            type: EditorType.TEXT,
          },
        } as ITableEditItem,
        {
          dataIndex: 'sourceFieldKey',
          name: 'sourceFieldKey',
          title: t('sys.dataSet.sourceFieldKey'),
        },
        {
          dataIndex: 'fieldKey',
          name: 'fieldKey',
          title: t('sys.dataSet.fieldKey'),
          type: 'edit',
          width: 200,
          editor: {
            type: EditorType.TEXT,
            placeholder: t('sys.appDesigner.inputPlaceholder'),
          } as ITextEditor,
          rules: [
            {
              required: true,
              message: t('sys.appDesigner.newViewField.pleaseEnterTheFieldKye'),
              trigger: 'blur',
            },
            {
              pattern: /^[a-z0-9_]*$/,
              message: t('sys.appDesigner.newViewField.errorMessage.key'),
              type: 'string',
              trigger: ['change', 'blur'],
            },
            {
              validator: (rule, value, _callback) => {
                return new Promise((resolve, reject) => {
                  const arr = items.value.filter((item) => {
                    return item.fieldKey === value;
                  });
                  if (arr.length > 1) {
                    reject(t('sys.dataSet.fieldKeyDuplicate'));
                  } else {
                    resolve();
                  }
                });
              },
              trigger: ['change', 'blur'],
            },
          ],
        } as ITableEditItem,
        {
          dataIndex: 'fieldType',
          name: 'fieldType',
          title: t('sys.dataSet.fieldType'),
          customRender: ({ record }) => {
            const fieldTypeText = record.fieldType;
            // 如果是公式显示字段，添加标签
            if (record.fieldKey && record.source.fieldType == FIELD_TYPE.FUNCTION) {
              return (
                <a-space>
                  <span>{fieldTypeText}</span>
                  <a-tag color="orange">{t('sys.dataSet.displayTag')}</a-tag>
                </a-space>
              );
            }
            return fieldTypeText;
          },
        },
      ];
      const functionFields = store.fields.filter((i) => i.fieldType === FIELD_TYPE.FUNCTION);
      if (!functionFields.length) {
        return column;
      } else {
        column.push({
          dataIndex: 'action',
          name: 'action',
          title: t('sys.dataSet.operation'),
          width: 120,
          fixed: 'right',
          customRender: ({ record }) => {
            // 只有公式显示字段才显示操作列
            if (record.fieldKey && record.source.fieldType == FIELD_TYPE.FUNCTION) {
              return (
                <a-space class={ns.e('action-space')}>
                  <a-button type="link" onClick={() => handleEditFormulaField(record)}>
                    {t('sys.dataSet.editBtn')}
                  </a-button>
                  <a-divider
                    class={ns.e('divider')}
                    type="vertical"
                    style="height: 13px; width: 3px;"
                  />
                  <a-popconfirm
                    title={t('sys.dataSet.pleaseConfirm')}
                    okText={t('sys.dataSet.confirmText')}
                    cancelText={t('sys.dataSet.cancelText')}
                    onConfirm={() => handleDeleteFormulaField(record)}
                  >
                    <a-button type="link" danger>
                      {t('sys.dataSet.deleteBtn')}
                    </a-button>
                  </a-popconfirm>
                </a-space>
              );
            }
            return null;
          },
        });
        return column;
      }
    });

    // 数据预览表格模型
    const tableModel = computed<ITable>(() => {
      console.log('columns', columns);
      return {
        autoLoad: true,
        key: 'id',
        columns: columns.value,
        rowEditMode: 'all',
        async fetch(_params: any, _controller: any): Promise<IObject[]> {
          const data: IObject[] = [];
          for (let i = 0; i < store.fields.length; i++) {
            const item = store.fields[i];

            // 公式显示字段直接显示，无需模型回显匹配
            if (item.fieldType === FIELD_TYPE.FUNCTION) {
              data.push({
                id: item.id,
                index: i + 1,
                modelName: '--',
                fieldName: item.fieldName || '',
                fieldLabel: item.label || '',
                fieldKey: item.key || item.fieldKey,
                fieldType: t(`sys.pageDesigner.fieldCmp.${item.fieldType}`) || item.fieldType,
                sourceFieldKey: '--',
                source: item,
              });
              continue;
            }

            // 普通字段需要做模型回显匹配
            let model = store.modelMap.get(item.modelKey);
            if (!model) {
              await store.loadModelFields(item.modelKey);
              model = store.modelMap.get(item.modelKey)!;
            }
            const field = model.fieldMetaList?.find((field) => field.id === item.id);
            if (!field) {
              continue;
            }
            data.push({
              id: item.id,
              index: i + 1,
              modelName: model.name,
              fieldName: field.name,
              fieldLabel: item.label || field.name,
              fieldKey: item.key || item.fieldKey,
              fieldType: t(`sys.pageDesigner.fieldCmp.${item.fieldType}`) || item.fieldType,
              sourceFieldKey: field.key,
              source: item,
            });
          }
          // 根据 modelName 进行排序
          data.sort((a, b) => {
            return a.modelName.localeCompare(b.modelName);
          });
          data.forEach((item, index) => {
            item.index = index + 1; // 更新序号
            return item;
          });
          items.value = data;
          setTimeout(() => {
            validate();
          }, 300);
          return data;
        },
      };
    });

    function onRowChange(row: IObject, name, newVal, _oldVal): void {
      const field = store.fields.find((item) => item.id === row.source.id);
      if (!field) {
        console.warn('Field not found for row:', row);
        return;
      }
      if (name === 'fieldLabel') {
        field.label = newVal;
        store.isChanged = true;
      } else if (name === 'fieldKey') {
        field.key = newVal;
        store.isChanged = true;
      }
      // 每次修改后都重新验证，避免界面不同步
      validate();
    }

    async function validate(): Promise<IObject[]> {
      try {
        const result = await tableRef.value.validate();
        console.log('Table validation result:', result);
        return [];
      } catch (err) {
        console.error('Table validation failed:', err);
        return err?.errorFields || [];
      }
    }

    expose({ validate });

    return () => {
      return (
        <div class={ns.b()}>
          <div class={ns.e('header')}>
            {permissionStore.currentProject != 'bi-designer' && (
              <a-space size="small" gutter={4}>
                <a-button
                  class={ns.e('add-formula')}
                  type="link"
                  onClick={handleCreateFormulaField}
                >
                  <i class="gct-iconfont icon-btn_add" />
                  {t('sys.dataSet.newFormulaDisplayField')}
                </a-button>
                <a-tooltip class={ns.e('help-icon')} title={t('sys.dataSet.fieldTooltip')}>
                  <i class="gct-iconfont icon-icon_wenhao" />
                </a-tooltip>
              </a-space>
            )}
          </div>
          <gct-table
            ref={(ref) => (tableRef.value = ref)}
            class={ns.e('table')}
            model={tableModel.value}
            onRowChange={onRowChange}
          />
        </div>
      );
    };
  },
});
