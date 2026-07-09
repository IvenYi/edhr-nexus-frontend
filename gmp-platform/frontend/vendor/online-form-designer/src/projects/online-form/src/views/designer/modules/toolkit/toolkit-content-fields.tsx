import { defineAsyncComponent, defineComponent, computed, ref, onMounted, nextTick } from 'vue';
import { InputSearch, Cascader } from 'ant-design-vue';
import { isEmpty, has } from 'lodash-es';
import { useI18n } from '/@/hooks/web/useI18n';
import { CreateType, FIELD_TYPE } from '/@online-form/views/designer/enums/local-field';
import { getFieldIcon } from '/@online-form/utils/field.enum';
import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
import { isPresetField, useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
import { PanelType, SubTableType } from '/@online-form/views/designer/enums';
import { TransferType, setTransferData } from '../base/drag/use-drop';

import './ToolkitContentFields.less';

const AddFieldBtn = defineAsyncComponent(() => import('./model-field/add-field-btn.vue'));
const LOCAL_FORM_DESIGNER_ID = '__local__';
const FormEditionEnum = {
  PROFESSIONAL: 'PROFESSIONAL',
} as const;

const PlatformEnum = {
  INTEGRATION_PAAS_DP: 'INTEGRATION_PAAS_DP',
  INTEGRATION_PAAS_SI: 'INTEGRATION_PAAS_SI',
} as const;

export default defineComponent({
  name: 'ToolkitContentFields',

  setup() {
    const visible = ref(false);

    const {
      doc,
      panelData,
      isViewOnlineForm,
      currentCell,
      platformType,
      isEasyEdition,
      removeField,
      editField,
      globalSubTables,
    } = useSpreadSheet();
    const { modelMetaMap, getFieldMeta } = useModelFields();
    const isStashedField = () => false;
    const { t } = useI18n();

    const searchValue = ref<string>('');
    const containerRef = ref();

    onMounted(() => {
      //! 解决首次渲染位置问题
      nextTick(() => {
        visible.value = true;
      });
    });

    const containFieldType = computed(() => {
      if (platformType.value === PlatformEnum.INTEGRATION_PAAS_DP) {
        return [FIELD_TYPE.OPTION, FIELD_TYPE.OPTION_MULTI];
      }
      if (platformType.value === PlatformEnum.INTEGRATION_PAAS_SI) {
        return [FIELD_TYPE.ENUM, FIELD_TYPE.ENUM_MULTI];
      }
      return [];
    });

    const currentInfo = computed(() => {
      if (panelData.type === PanelType.TableHeader) {
        return {
          model: doc.value.modelKey,
          fieldKey: '',
        };
      }

      const table = globalSubTables.value?.find((item) => item.id === panelData.refId);

      // 动态表、二维表
      if (panelData.type === PanelType.DynamicTable && table) {
        return {
          model: table.model,
          fieldKey: table.field,
        };
      }
      // 固定表、物料平衡表
      if (
        [PanelType.DataGroup, PanelType.FixedTable, PanelType.MaterialBalanceTable].includes(
          panelData.type,
        ) &&
        table
      ) {
        return {
          model: table.model,
          fieldKey: table.field,
        };
      }
      // 检验表
      if (panelData.type === PanelType.CheckTable && table) {
        return {
          model: table.model,
          fieldKey: table.field,
        };
      }
      // 物料消耗表
      if (panelData.type === PanelType.MaterialConsumptionTable && table) {
        return {
          model: table.model,
          fieldKey: table.field,
        };
      }
      // 数据分组2D
      if ([PanelType.DataGroup2D].includes(panelData.type) && table) {
        return {
          model: table.colModel,
          fieldKey: table.colField,
        };
      }

      // 动态表单元格
      if (currentCell.value?.dynamicTable) {
        return {
          model: currentCell.value?.dynamicTable.model,
          fieldKey: currentCell.value?.dynamicTable.field,
        };
      }

      // 固定表单元格
      if (currentCell.value?.fixedTable) {
        return {
          model: currentCell.value?.fixedTable.model,
          fieldKey: currentCell.value?.fixedTable.field,
        };
      }

      // 数据分组2D
      if (currentCell.value?.dataGroup2D) {
        return {
          model: currentCell.value?.dataGroup2D.colModel,
          fieldKey: currentCell.value?.dataGroup2D.colField,
        };
      }

      return {
        model: doc.value.modelKey,
        fieldKey: '',
      };
    });

    /** 当前点击的单元格是否是物料消耗表内的单元格或者选中了物料消耗表本身 */
    const isInMaterialConsumeTable = computed(() => {
      return (
        currentCell.value?.dynamicTable?.type === SubTableType.MATERIAL_CONSUMPTION ||
        panelData.type === PanelType.MaterialConsumptionTable
      );
    });
    /** 当前点击的单元格是否是物料消耗表内的单元格或者选中检验表本身 */
    const isInMaterialCheckedTable = computed(() => {
      return (
        currentCell.value?.fixedTable?.type === SubTableType.CHECK ||
        panelData.type === PanelType.CheckTable
      );
    });
    const extFieldStatus = computed(() => {
      if (
        !isEmpty(doc.value) &&
        has(doc.value, 'extFieldStatus') &&
        !isEmpty(doc.value.extFieldStatus)
      ) {
        const list = JSON.parse(doc.value.extFieldStatus!);

        return list.reduce((acc, item) => {
          acc[item.key] = item.status;
          return acc;
        }, {});
      }
      return {};
    });

    const currentModelMeta = computed(() => {
      return modelMetaMap.value[currentInfo.value!.model!];
    });

    const filterFieldInfo = (item) => {
      if (isInMaterialCheckedTable.value) {
        // 检验表
        return (
          ['inspection_standard_', 'inspection_method_name_', 'name_', 'value_'].includes(
            item.key!,
          ) || item.createType !== CreateType.BUILTIN
        );
      }

      if (currentCell.value?.fixedTable) {
        return (
          item.key === 'name_' || item.key === 'value_' || item.createType !== CreateType.BUILTIN
        );
      }

      // 物料消耗表隐藏部分内置字段
      if (
        isInMaterialConsumeTable.value &&
        ['material_loading_id_', 'is_confirmed_', 'bom_entry_id_'].includes(item.key!)
      ) {
        return false;
      }

      // 排除某些字段类型
      if (
        [
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.ASSOCIATED_PRIMARY_KEY,
          FIELD_TYPE.SERIAL,
          FIELD_TYPE.MASTERSLAVE,
          // FIELD_TYPE.REF_MULTI,
          // FIELD_TYPE.RDO_REF,
          FIELD_TYPE.ESOP,
          FIELD_TYPE.AGG,
          FIELD_TYPE.EXPRESSION,
          FIELD_TYPE.TRANSACTION,
          FIELD_TYPE.LABEL_TEMPLATE,
          FIELD_TYPE.LABEL_TEMPLATE_REF,
          FIELD_TYPE.DOCUMENT_TEMPLATE,
          FIELD_TYPE.SERIALRULE,
          FIELD_TYPE.PRINTER,
          FIELD_TYPE.MESSAGE_TMPL,
          FIELD_TYPE.RANGE_USER,
          FIELD_TYPE.ONLINE_FORM_TEMPLATE,
          FIELD_TYPE.E_DHR_TEMPLATE,
          // FIELD_TYPE.ONLINE_FORM,
          FIELD_TYPE.EXPRESSION_CONDITION,
        ]
          .concat(containFieldType.value)
          .includes(item.type as any)
      ) {
        return false;
      }

      // 排除某些固定key的
      if (
        [
          'ref_model_key_',
          'ref_field_key_',
          'ref_master_id_',
          'res_type_',
          'res_id_',
          'tenant_id_',
        ].includes(item.key!)
      ) {
        return false;
      }

      if (extFieldStatus.value && has(extFieldStatus.value, item.key!)) {
        return extFieldStatus.value[item.key!];
      }

      return true;
    };

    const tipOptInfo = (label, value) => {
      return {
        label: (
          <div class="field-item">
            <span class="field-title desc">{label}</span>
          </div>
        ),
        value: value,
        isLeaf: true,
        disabled: true,
      };
    };

    const getFieldName = (item) => {
      return item.highlightName ? (
        <span class="field-title" innerHTML={item.highlightName}></span>
      ) : (
        <span class="field-title">{item.name}</span>
      );
    };

    const getLabel = (item: any, { isRef: _isRef, fieldCodeChain, fieldPathChains = [] }) => {
      const {
        field,
        fieldType,
        model,
        modelLink,
        fieldLink,
        isFieldModel,
        subModelKey,
        subFieldKey,
        createType,
        refModelKey,
      } = fieldCodeChain;

      const fieldName = getFieldName(item);

      const isStashed =
        isEasyEdition.value && isStashedField({ key: item.key, modelKey: item.modelKey });

      const onDelete = () => {
        removeField({ fieldKey: item.key, modelKey: item.modelKey });
      };

      const onEdit = () => {
        editField({ fieldKey: item.key, modelKey: item.modelKey });
      };

      // 普通模式的非预置字段显示编辑操作
      const showAction = isEasyEdition.value && !isPresetField(item);

      return (
        <div
          class={['field-item', isStashed && 'is-stashed']}
          key={JSON.stringify(fieldCodeChain)}
          data-field={field}
          data-fieldtype={fieldType}
          data-field-type={fieldType}
          data-model={model}
          data-is-field-model={isFieldModel}
          data-model-link={modelLink.join('.')}
          data-field-link={fieldLink.join('.')}
          data-sub-model-key={subModelKey}
          data-create-type={createType}
          data-ref-model-key={refModelKey}
          data-sub-field-key={subFieldKey}
          data-sub-model-type={item.subModelType || undefined}
          draggable={!(fieldType === FIELD_TYPE.RDO_REF)}
          onDragstart={(e) => handleDragStart(e)}
          onMousedown={(e) => e.stopPropagation()}
        >
          <span class="field-icon">
            <i class={['iconfont', getFieldIcon(fieldType) || 'icon-zidingyi']}></i>
          </span>
          {fieldPathChains ? (
            <a-tooltip placement="top" title={fieldPathChains.join(' > ')}>
              {fieldName}
            </a-tooltip>
          ) : (
            fieldName
          )}
          {showAction && (
            <span class="field-action">
              {false && (
                <i
                  title={$t('sys.onlineForm.deleteField')}
                  onClick={onDelete}
                  class="iconfont icon-shanchu2"
                />
              )}
              <i title="$t('sys.model.editField')" onClick={onEdit} class="iconfont icon-bianji" />
            </span>
          )}
        </div>
      );
    };

    const recursive = (originModelKey, { modelLinks, fieldLinks, subTableObj, last = false }) => {
      if (!originModelKey) return [];

      const originModelMeta = modelMetaMap.value[originModelKey];

      if (isEmpty(originModelMeta)) return [];

      const fieldList = originModelMeta.fields.filter(filterFieldInfo).map((item) => {
        const newModelLinks = [...modelLinks, originModelKey];
        const newFieldLinks = [...fieldLinks, item.key];

        const fieldCodeChain = {
          field: item.key,
          fieldType: item.type,
          model: item.modelKey,
          /** 模型链路 */
          modelLink: [...newModelLinks],
          /** 字段链路 */
          fieldLink: [...newFieldLinks],
          isFieldModel: true,
          createType: item.createType,
          refModelKey: item.bindInfo,
          ...subTableObj,
        };

        const isRef = [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI, FIELD_TYPE.RDO_REF].includes(
          item.type as FIELD_TYPE,
        );

        const children =
          isRef && !last
            ? recursive(item.bindInfo, {
                modelLinks: newModelLinks,
                fieldLinks: newFieldLinks,
                subTableObj,
                last: true,
              })
            : [];

        return {
          label: getLabel(item, { isRef, fieldCodeChain }),
          value: JSON.stringify(fieldCodeChain),
          isLeaf: children.length <= 1, // 一条信息是标题
          children: children,
        };
      });

      return [tipOptInfo(originModelMeta.meta.name, originModelKey), ...fieldList];
    };

    const renderOptions = () => {
      let options: any = [];
      if (!isEmpty(currentModelMeta.value)) {
        const modelKey = currentModelMeta.value.meta.key;
        const subTableObj = {};
        if (currentModelMeta.value.meta.subModel) {
          Object.assign(subTableObj, {
            subModelKey: modelKey,
            subFieldKey: currentInfo.value.fieldKey,
          });
        }

        const fieldList = currentModelMeta.value.fields.filter(filterFieldInfo).map((item) => {
          const modelLinks = [modelKey];
          const fieldLinks = [item.key];

          const fieldCodeChain = {
            field: item.key,
            fieldType: item.type,
            model: item.modelKey,
            /** 模型链路 */
            modelLink: [...modelLinks],
            /** 字段链路 */
            fieldLink: [...fieldLinks],
            isFieldModel: false,
            createType: item.createType,
            refModelKey: item.bindInfo,
            ...subTableObj,
          };

          const isRef = [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI, FIELD_TYPE.RDO_REF].includes(
            item.type as FIELD_TYPE,
          );

          const children = isRef
            ? recursive(item.bindInfo, { modelLinks, fieldLinks, subTableObj })
            : [];

          return {
            label: getLabel(item, { isRef, fieldCodeChain }),
            value: JSON.stringify(fieldCodeChain),
            isLeaf: children.length <= 1, // 一条信息是标题
            children,
          };
        });

        options = [tipOptInfo(currentModelMeta.value.meta.name, modelKey), ...fieldList];
      }
      return options;
    };

    const recursiveList = (
      originModelKey,
      { modelLinks, fieldLinks, subTableObj, last = false },
    ) => {
      if (!originModelKey) return [];

      const originModelMeta = modelMetaMap.value[originModelKey];

      if (isEmpty(originModelMeta)) return [];

      const list: any = [];

      originModelMeta.fields.filter(filterFieldInfo).forEach((item) => {
        const newModelLinks = [...modelLinks, originModelKey];
        const newFieldLinks = [...fieldLinks, item.key];

        const fieldCodeChain = {
          field: item.key,
          fieldType: item.type,
          model: item.modelKey,
          /** 模型链路 */
          modelLink: [...newModelLinks],
          /** 字段链路 */
          fieldLink: [...newFieldLinks],
          isFieldModel: true,
          createType: item.createType,
          refModelKey: item.bindInfo,
          ...subTableObj,
        };

        const isRef = [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI, FIELD_TYPE.RDO_REF].includes(
          item.type as FIELD_TYPE,
        );

        const children =
          isRef && !last
            ? recursiveList(item.bindInfo, {
                modelLinks: newModelLinks,
                fieldLinks: newFieldLinks,
                subTableObj,
                last: true,
              })
            : [];

        list.push({
          ...fieldCodeChain,
          name: item.name,
        });
        list.push(children);
      });

      return list;
    };

    const allFieldList = computed(() => {
      const options: any = [];
      if (!isEmpty(currentModelMeta.value)) {
        const modelKey = currentModelMeta.value.meta.key;
        const subTableObj = {};
        if (currentModelMeta.value.meta.subModel) {
          Object.assign(subTableObj, {
            subModelKey: modelKey,
            subFieldKey: currentInfo.value.fieldKey,
            subModelType: currentModelMeta.value.meta.subModelType,
          });
        }

        currentModelMeta.value.fields.filter(filterFieldInfo).forEach((item) => {
          const modelLinks = [modelKey];
          const fieldLinks = [item.key];

          const fieldCodeChain = {
            field: item.key,
            fieldType: item.type,
            model: item.modelKey,
            /** 模型链路 */
            modelLink: [...modelLinks],
            /** 字段链路 */
            fieldLink: [...fieldLinks],
            isFieldModel: false,
            createType: item.createType,
            refModelKey: item.bindInfo,
            ...subTableObj,
          };

          const isRef = [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI, FIELD_TYPE.RDO_REF].includes(
            item.type as FIELD_TYPE,
          );

          const children = isRef
            ? recursiveList(item.bindInfo, { modelLinks, fieldLinks, subTableObj })
            : [];

          options.push({
            ...fieldCodeChain,
            name: item.name,
          });
          options.push(children);
        });
      }
      return options.flat(Infinity);
    });

    // 内容高亮处理，名称被searchkey 匹配不到时，返回 null
    const highlightName = (str) => {
      const displayName = str;
      const rDisplayName = displayName?.replace(
        new RegExp(searchValue.value?.replace(new RegExp(/(?=[$.?+[*^|\\(){}/])/g), '\\'), 'g'),
        (s) => `<span class="is-highlight">${s}</span>`,
      );
      if (rDisplayName === displayName) return null;

      return rDisplayName;
    };

    const searchFieldList = computed(() => {
      const list = allFieldList.value
        .map((item) => {
          const hlName = highlightName(item.name); // 高亮列表名称
          if (hlName) {
            return {
              ...item,
              highlightName: hlName,
            };
          }
        })
        .filter((i) => i);

      return list;
    });

    const renderSearch = () => {
      return searchFieldList.value.map((item) => {
        const isRef = [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI, FIELD_TYPE.RDO_REF].includes(
          item.fieldType as FIELD_TYPE,
        );
        const fieldPathChains: any =
          getFieldMeta(
            {
              ...item,
              modelLink: item.modelLink.join('.'),
              fieldLink: item.fieldLink.join('.'),
            },
            { showFullPath: true },
          ).name ?? [];
        return getLabel(item, { isRef, fieldCodeChain: item, fieldPathChains });
      });
    };

    /**
     * 拖拽start，设置参数
     */
    function handleDragStart(e) {
      const {
        field,
        fieldType,
        model,
        modelLink,
        fieldLink,
        isFieldModel,
        subModelKey,
        subFieldKey,
        createType,
        refModelKey,
        subModelType,
      } = e.target.dataset;

      setTransferData(e, {
        type: TransferType.Field,
        data: {
          field,
          model,
          fieldType,
          modelLink,
          fieldLink,
          isFieldModel: JSON.parse(isFieldModel),
          subModelKey,
          subFieldKey,
          createType,
          refModelKey,
          subModelType,
        },
      });
    }

    /** 绘制添加字段按钮 */
    const renderAddFieldBtn = () => {
      if (
        doc.value.id !== LOCAL_FORM_DESIGNER_ID &&
        doc.value.edition === FormEditionEnum.PROFESSIONAL &&
        !isViewOnlineForm.value
      ) {
        return <AddFieldBtn model={currentInfo.value.model} />;
      }
      return null;
    };

    return {
      containerRef,
      visible,
      renderOptions,
      t,
      searchValue,
      renderSearch,
      renderAddFieldBtn,
    };
  },
  render() {
    return (
      <div class="toolkit-fields-cascader" ref="containerRef">
        {this.renderAddFieldBtn()}
        <InputSearch
          class="field-search"
          placeholder={this.t('sys.pageDesigner.searchField')}
          allowClear
          size="small"
          v-model:value={this.searchValue}
        />
        <div class="toolkit-fields-cascader-area">
          {this.searchValue && (
            <div class="toolkit-fields-cascader-search">{this.renderSearch()}</div>
          )}
          <Cascader
            dropdownClassName="toolkit-fields-dropdown-cascader"
            options={this.renderOptions()}
            placement="bottomRight"
            expandTrigger="hover"
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            open={this.visible}
            dropdownStyle={{ position: 'relative', display: this.searchValue ? 'none' : 'block' }}
          >
            <div class="toolkit-fields-blank"></div>
          </Cascader>
        </div>
      </div>
    );
  },
});
