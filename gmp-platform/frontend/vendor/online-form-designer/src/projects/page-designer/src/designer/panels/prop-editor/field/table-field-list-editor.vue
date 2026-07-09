<template>
  <a-form-item-rest>
    <a-button @click="addFiled" style="line-height: 1" block :disabled="disabled">
      <!-- <span class="iconfont icon-tianjia"></span> -->
      {{ t(propConfig.selectFiledBtnTitle || 'sys.pageDesigner.selectModelFields') }}
    </a-button>
  </a-form-item-rest>
  <div class="content-center mt8px" v-if="propValue?.length">
    <a-form-item-rest>
      <div class="ks-row-between pl10px pr10px mb4px ks-row-middle">
        <span class="text-[#333] ks-col">{{ t('sys.pageDesigner.fieldProp') }}</span>
        <template v-if="!isDisableCheckbox">
          <span v-if="propConfig.showcheckbox" class="mr5px text-[#666]">只读全选 </span>
          <a-checkbox
            v-if="propConfig.showcheckbox"
            :disabled="(propConfig.disabled as Function)?.(widget)"
            :checked="editStatus"
            @change="changeCheckedAllValue"
          />
        </template>
      </div>
      <draggable
        :list="propValue"
        handle=".cursor-move"
        :animation="200"
        chosen-class="drawing-chosen"
        drag-class="drawing-drag"
        item-key="id"
        class="field-list"
        @change="emitCache"
      >
        <template #item="{ element, index }">
          <div class="ks-row-middle fieldrow mb5px">
            <span
              class="icon-drag iconfont mr8px cursor-move text-[#C3C3C3] primary-gct-hover"
            ></span>
            <span class="iconfont mr4px primary-gct" :class="element.icon"></span>
            <a-tooltip>
              <template #title>{{
                element.props ? element.props.label || element.alias : element.name
              }}</template>
              <div class="ks-col ell">
                {{ element.props ? element.props.label || element.alias : element.name }}</div
              >
            </a-tooltip>
            <a-tooltip title="左固定">
              <span
                class="iconfont mr5px primary-gct icon-zuoguding"
                v-show="element.props?.fixedAlign === fixedAlignENUM.LEFT"
              ></span>
            </a-tooltip>
            <a-tooltip title="右固定">
              <span
                class="iconfont mr5px primary-gct icon-youguding"
                v-show="element.props?.fixedAlign === fixedAlignENUM.RIGHT"
              ></span
            ></a-tooltip>
            <a-tooltip title="编辑">
              <span
                @click="handleEdit(element, index)"
                class="icon-a-Single-linetext iconfont ml8px cursor-pointer text-[#797A7D] primary-gct-hover"
                v-show="
                  element.type === FormComponents.DataTableFormula || element.props?.isCustomField
                "
              ></span
            ></a-tooltip>
            <a-popconfirm
              v-if="element.props?._preset !== true"
              placement="topLeft"
              :title="t('sys.pageDesigner.confirmTodo')"
              @confirm="deleteList(index)"
            >
              <a-tooltip title="删除">
                <span
                  class="icon-shanchu iconfont ml8px cursor-pointer text-[#797A7D] error-gct-hover"
                ></span
              ></a-tooltip>
            </a-popconfirm>
            <template v-if="propConfig.showcheckbox && !isDisableCheckbox">
              <span class="ml8px">
                <a-checkbox
                  v-if="element.props?.fieldReadonly || isNonWhitelistField(element)"
                  :checked="true"
                  :disabled="true"
                />
                <a-checkbox
                  v-else
                  v-model:checked="element.props.readonly"
                  @change="() => changeCheckedValue(element)"
                />
              </span>
            </template>
          </div>
        </template>
      </draggable>
    </a-form-item-rest>
  </div>

  <!-- <columnFormulaModal :title="$t('sys.pageDesigner.editSelectionField')" ref="FormulaModal" /> -->
  <addCustomFieldModal :isForm="false" @register="register" @ok="customHandleOk" />
</template>

<script setup lang="ts" name="table-field-list-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { ref, reactive, toRef, computed, watch } from 'vue';
  import draggable from 'vuedraggable';
  import { useI18n } from '/@/hooks/web/useI18n';
  // import columnFormulaModal from '../modals/column-formula-modal.vue';
  import addCustomFieldModal from '../modals/add-custom-field-modal.vue';
  import {
    FormComponents,
    Platform,
    fixedAlignENUM,
    SUB_TABLE_EDIT_MODE,
  } from '/@page-designer/enum';
  import { useFieldTransfer } from '/@/components/FieldTransfer';
  import { FIELD_TYPE, FIELD_TYPE_LOGIC } from '@/enums/appEnum';
  import { message } from 'ant-design-vue';
  import { EntityModelCategoryEnum } from '/@/projects/app-designer/src/enum';
  import { TableTypeEnum } from '@gct/runtime';
  import { platform } from '/@page-designer/hooks/usePage';
  import { useModal } from '/@/components/Modal';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';

  const { emitCache } = useDesigner();
  const Fieldinstance = useFieldTransfer();
  // const FormulaModal = ref<InstanceType<typeof columnFormulaModal> | null>(null);
  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const propConfig = reactive(defProps.propConfig);
  const [register, { openModal: openCustomModal }] = useModal();

  const typeEnum = {
    [FormComponents.DataTableFormula]: FIELD_TYPE.DATA_TABLE_FORMULA,
    [FormComponents.ReadonlyCmp]: FIELD_TYPE.READONLYCMP,
  };

  /**
   * PAD 平台只读字段类型白名单
   * 只有白名单内的字段类型才允许进行只读控制
   */
  const PAD_READONLY_FIELD_WHITELIST = new Set([
    FIELD_TYPE.TEXT,
    FIELD_TYPE.LONG_TEXT,
    FIELD_TYPE.INTEGER,
    FIELD_TYPE.LONG,
    FIELD_TYPE.DECIMAL,
    FIELD_TYPE.DOUBLE,
    FIELD_TYPE.BOOLEAN,
    FIELD_TYPE.DATE,
    FIELD_TYPE.TIME,
    FIELD_TYPE.DATE_TIME,
    FIELD_TYPE.USER,
    FIELD_TYPE.USER_MULTI,
  ]);

  const editIndex = ref();

  watch(
    propValue.value,
    (list) => {
      list?.forEach((i) => {
        if (i.props?.readonly) {
          i.props.disabled = false;
          i.props.required = false;
        }
      });
    },
    {
      immediate: true,
    },
  );

  const editStatus = computed(() => {
    return propValue.value.every((i) => i.props?.readonly || i.props?.fieldReadonly);
  });
  const isEntityModel = computed(() => {
    console.log(
      'defProps.widget!.props?.modeldata?.modelCategory',
      defProps.widget!.props?.modeldata?.modelCategory,
    );
    return (
      defProps.widget!.props?.modeldata?.modelCategory === EntityModelCategoryEnum.ENTITY ||
      !defProps.widget!.props?.modeldata?.modelCategory
    );
  });
  const isDisableCheckbox = computed(() => {
    return (
      defProps.widget!.props?.modeldata?.modelCategory === EntityModelCategoryEnum.VIEW ||
      defProps.widget!.props?.gridType === TableTypeEnum.EMBED
    );
  });

  /**
   * 判断字段是否为非白名单字段（在 PAD 平台下）
   * 用于确定是否需要禁用和默认设置为只读
   */
  const isNonWhitelistField = (element: any): boolean => {
    if (platform.value !== Platform.PAD) {
      return false;
    }
    const fieldType = element.props?.fieldType;
    return (
      !PAD_READONLY_FIELD_WHITELIST.has(fieldType) &&
      defProps.widget!.props?.editMode !== SUB_TABLE_EDIT_MODE.MODAL
    );
  };

  function changeCheckedAllValue(e) {
    const checked = e.target.checked;
    propValue.value.forEach((i) => {
      if (platform.value === Platform.PAD) {
        if (
          checked === false &&
          !i.props?.fieldReadonly &&
          PAD_READONLY_FIELD_WHITELIST.has(i.props?.fieldType)
        ) {
          i.props.readonly = false;
        } else {
          i.props.readonly = true;
        }
      } else {
        if (!i.props?.fieldReadonly) {
          i.props.readonly = checked;
        }
      }
    });

    if (typeof propConfig.updateAsyncField === 'function') {
      propConfig.updateAsyncField(defProps.widget, propValue.value, checked);
    }
  }

  function changeCheckedValue(info) {
    if (typeof propConfig.updateAsyncField === 'function') {
      propConfig.updateAsyncField(defProps.widget, [info], info.props.readonly);
    }
  }

  const disabled = toRef(() => {
    return !!(propConfig.maxlength && propValue?.value?.length >= propConfig.maxlength);
  });

  async function addFiled() {
    const excludeList = [
      FIELD_TYPE.ESOP,
      FIELD_TYPE.MASTERSLAVE,
      FIELD_TYPE.LABEL_TEMPLATE,
      FIELD_TYPE.SERIALRULE,
      FIELD_TYPE.DOCUMENT_TEMPLATE,
      'online_form',
    ];
    if (platform.value === Platform.MOBILE) {
      excludeList.push(
        ...[FIELD_TYPE.RANGE_USER, FIELD_TYPE.MESSAGE_TMPL, FIELD_TYPE.EXPRESSION_CONDITION],
      );
    }
    if (platform.value === Platform.PAD) {
      excludeList.push(
        ...[FIELD_TYPE.RANGE_USER, FIELD_TYPE.MESSAGE_TMPL, FIELD_TYPE.EXPRESSION_CONDITION],
      );
    }
    const excludeFieldKeyList =
      typeof propConfig.excludeFieldKey === 'function'
        ? propConfig.excludeFieldKey(defProps.widget)
        : propConfig.excludeFieldKey;
    Fieldinstance.open({
      modelKey: defProps.widget?.props[propConfig.modelByKey || 'model'],
      childParentModelKey: defProps.widget?.props.refParentModelkey,
      modalTitle: t(propConfig.selectFiledBtnTitle || 'sys.pageDesigner.selectModelFields'),
      isShowCascader: !!(
        isEntityModel.value ||
        defProps.widget.formItem ||
        defProps.widget.isSearchField
      ),
      draggable: !!propConfig.draggable,
      data: propValue.value.map((i) => i.props),
      maxEnableCount: propConfig.maxlength,
      filterFieldByFunction: propConfig.filterFn,
      disabledFieldKey: propValue.value
        .filter((n) => n.props._preset)
        .map((n) => n.props.field)
        .concat(propConfig.disabledFieldKey ?? []),
      containFieldType: propConfig.containFieldType,
      containFieldKey: propConfig.containFieldKey,
      excludeFieldType: excludeList.concat(propConfig.excludeFieldType ?? []),
      excludeFieldKey: ['tenant_id_', 'ref_field_key_', 'ref_model_key_'].concat(
        excludeFieldKeyList ?? [],
      ),
      saveCallback: ({ objFieldList }) => {
        console.log('objFieldList', objFieldList);

        if (propConfig.createField) {
          if (propConfig.draggable) {
            const fieldMap = propValue.value.reduce((total, curr) => {
              total[
                `${curr.props.fieldId}${
                  curr.bindFieldKey && propConfig.supportSameField ? '$' + curr.bindFieldKey : ''
                }`
              ] = curr;
              return total;
            }, {});
            propValue.value = objFieldList.map((i) => {
              const widget =
                fieldMap[
                  `${i.id}${i.bindFieldKey && propConfig.supportSameField ? '$' + i.bindFieldKey : ''}`
                ] || propConfig.createField!(i, defProps.widget);
              return widget;
            });
          } else {
            const fieldMap = objFieldList.reduce((total, curr) => {
              total[
                `${curr.id}${
                  curr.bindFieldKey && propConfig.supportSameField ? '$' + curr.bindFieldKey : ''
                }`
              ] = curr;
              return total;
            }, {});
            /**保留原先排序 */
            //删除穿梭框 上不存在的字段
            //穿梭框内多余的字段 排在末尾
            const widgetList = [...propValue.value];
            let start = 0;
            // const delIndexArr: any[] = [];
            while (widgetList[start]) {
              const widget = widgetList[start];
              if (
                widget.type === FormComponents.DataTableFormula ||
                widget.props.isCustomField ||
                widget.props._preset
              ) {
                /**公式字段跳过 */
                start++;
                // 如果字段被冻结（_frozen为true），则构建该字段的唯一标识符id，并将fieldMap中对应id的值设为null
                // 用于标记该字段在后续处理中忽略
                if (widget.props._frozen) {
                  const id = widget.props.modelKey + '$' + widget.props.field;
                  fieldMap[id] = null;
                }
                continue;
              }
              const id =
                widget.props.fieldId +
                (widget.props.bindFieldKey && propConfig.supportSameField
                  ? '$' + widget.props.bindFieldKey
                  : '');
              const field = fieldMap[id];
              if (!field) {
                widgetList.splice(start, 1);
              } else {
                start++;
              }
              fieldMap[id] = null;
            }

            Object.values(fieldMap).forEach((i) => {
              if (i) {
                const widget = propConfig.createField!(i, defProps.widget);
                widgetList.push(widget);
              }
            });

            //为了触发changecallback所以这么写
            propValue.value = [...widgetList];
          }
        }
      },
    });
  }

  function deleteList(index) {
    //为了触发changecallback所以这么写
    propValue.value = propValue.value.filter((_d, i) => {
      return i !== index;
    });
  }

  const handleEdit = (widget, index) => {
    editIndex.value = index;
    let fieldType, mappingType;
    if (!widget.props.fieldId) {
      fieldType = typeEnum[widget.type];
      mappingType =
        widget.props.fieldType === FIELD_TYPE.DATA_TABLE_FORMULA
          ? widget.props.returnType
          : widget.props.fieldType;
    } else {
      fieldType = widget.props.fieldType;
      mappingType = widget.props.returnType;
    }

    const specificConfig =
      widget.type === FormComponents.DataTableFormula
        ? {
            formulaConfig: {
              exp: widget.props.formula,
              expression: widget.props.expression || widget.props.formula,
              showQrCode: widget.props.showQrCode || false,
              digits: widget.props.digits || 0,
            },
          }
        : {};

    const data = {
      name: widget.props.label || widget.props.fieldName,
      i18nConfig: widget.i18n.label || '',
      description: widget.props.remark,
      key: widget.props.field,
      modelKey: widget.props.modelKey || widget.props.model,
      type: fieldType,
      specificConfig,
      mappingType,
      createType: widget.type,
      id: widget.id,
    };

    const tableData = {
      id: defProps.widget!.id,
      model:
        defProps.widget?.type &&
        [FormComponents.SubTable, FormComponents.DynamicTable].includes(defProps.widget?.type)
          ? defProps.widget?.props.bindModelKey
          : defProps.widget?.props[propConfig.modelByKey || 'model'],
      validateCustomKey: existedCustomKey,
    };

    openCustomModal(true, {
      isEdit: true,
      tableData,
      formData: data,
      isOldData: !widget.props.fieldId,
    });
  };

  const customHandleOk = (data) => {
    const widget = propValue.value[editIndex.value];
    widget.alias = data.name || data.label;
    widget.props.label = data.name || data.label;
    widget.props.fieldName = data.name || data.label;
    widget.i18n.label = data.i18nConfig || data.labeli18n;
    widget.props.remark = data.description || data.remark;
    if (!widget.props.bindModelKey) widget.props.bindModelKey = defProps.widget?.props.bindModelKey;
    widget.props.field = data.key;
    widget.props.fieldType = data.type;
    if (widget.type === FormComponents.ReadonlyCmp) {
      // widget.props.field = data.key;
    } else {
      widget.props.fieldType = data.type;
      widget.props.formula = data.specificConfig?.formulaConfig?.exp || data.formula;
      widget.props.expression = data.specificConfig?.formulaConfig?.expression || data.formula;
      widget.props.returnType = data.mappingType;
      widget.props.showQrCode = data.specificConfig?.formulaConfig?.showQrCode || false;
      widget.props.digits = data.specificConfig?.formulaConfig?.digits || 0;
    }
  };

  async function editFormula(widget) {
    const { label, labeli18n, formula, type, remark, key } =
      (await FormulaModal.value?.open(
        {
          id: defProps.widget!.id,
          model:
            defProps.widget?.type &&
            [FormComponents.SubTable, FormComponents.DynamicTable].includes(defProps.widget?.type)
              ? defProps.widget?.props.bindModelKey
              : defProps.widget?.props[propConfig.modelByKey || 'model'],
          validateCustomKey: existedCustomKey,
        },
        {
          isEdit: true,
          label: widget.props.label,
          labeli18n: widget.i18n.label,
          formula: widget.props.formula,
          remark: widget.props.remark,
          type: widget.props.fieldType,
          createType: widget.type,
          key: widget.props.field,
          id: widget.id,
        },
      )) || {};
    widget.props.label = label;
    widget.i18n.label = labeli18n;
    widget.props.remark = remark;
    if (!widget.props.bindModelKey) widget.props.bindModelKey = defProps.widget?.props.bindModelKey;
    if (widget.type === FormComponents.ReadonlyCmp) {
      widget.props.field = key;
    } else {
      widget.props.fieldType = type;
      widget.props.formula = formula;
    }
  }

  const existedCustomKey = (csField) => {
    if (propValue.value.some((e) => e.id !== csField.id && e.props.field === csField.key)) {
      message.error(t('sys.pageDesigner.showFieldExisted', { field: 'Code' }));
      return true;
    }
    return false;
  };
</script>

<style lang="less" scoped>
  .fieldrow {
    height: 32px;
    padding: 4px 8px;
    border-radius: 4px;
    background-color: #f2f4f7;
  }

  .content-center {
    // margin-right: -16px;
    // margin-left: -16px;

    & > div.field-list {
      max-height: 370px;
      overflow: auto;
    }
  }
</style>
