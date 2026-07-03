<template>
  <div>
    <a-button
      type="primary"
      @click="addFiled"
      :ghost="!disabled"
      style="border-style: dashed; box-shadow: none"
      block
      :disabled="disabled"
    >
      <template #icon>
        <i class="iconfont icon-tianjia mr-4px" style="font-size: 14px"></i>
      </template>
      {{ t('sys.pageDesigner.selectFields') }}
    </a-button>
  </div>
  <div class="content-center mt8px" v-if="propValue">
    <draggable
      :list="propValue"
      handle=".cursor-move"
      :animation="200"
      chosen-class="drawing-chosen"
      drag-class="drawing-drag"
      item-key="id"
    >
      <template #item="{ element, index }">
        <div v-if="!element.isReadonlyWidget" class="ks-row-middle fieldrow mb-6px">
          <span
            class="icon-drag iconfont ml10px mr4px cursor-move text-[#999] primary-gct-hover"
          ></span>
          <!-- <span class="iconfont mr6px primary-gct" :class="element.icon">{{ element }}</span> -->
          <span
            class="iconfont mr6px primary-gct"
            :class="FieldIconMap[element.props.fieldType] || 'icon-zidingyi'"
            @click="propConfig?.eventCallback && propConfig.eventCallback(element)"
          ></span>
          <a-tooltip>
            <template #title>{{
              element.props ? element.props.label || element.props.fieldName : element.name
            }}</template>
            <div class="ks-col ell">
              {{
                element.props ? element.props.label || element.props.fieldName : element.name
              }}</div
            >
          </a-tooltip>
          <a-tooltip :title="$t('sys.pageDesigner.leftFixed')">
            <span
              class="iconfont mr5px primary-gct icon-zuoguding"
              v-show="element.props?.fixedAlign === fixedAlignENUM.LEFT"
            ></span>
          </a-tooltip>
          <a-tooltip :title="$t('sys.pageDesigner.rightFixed')">
            <span
              class="iconfont mr5px primary-gct icon-youguding"
              v-show="element.props?.fixedAlign === fixedAlignENUM.RIGHT"
            ></span
          ></a-tooltip>
          <a-tooltip :title="$t('sys.edit')">
            <span
              @click="editFormula(element, index)"
              class="icon-a-Single-linetext iconfont mr5px cursor-pointer text-[#999] primary-gct-hover"
              v-show="element.type === FormComponents.DataTableFormula"
            ></span
          ></a-tooltip>

          <a-popconfirm
            placement="topLeft"
            :title="t('sys.pageDesigner.confirmTodo')"
            @confirm="deleteList(index)"
          >
            <a-tooltip :title="$t('sys.delete')">
              <span
                class="icon-shanchu iconfont mr8px cursor-pointer text-[#999] error-gct-hover"
              ></span
            ></a-tooltip>
          </a-popconfirm>
        </div>
      </template>
    </draggable>
  </div>
  <add-field ref="addFieldModel" />
  <!-- <columnFormulaModal ref="FormulaModal" /> -->
  <addCustomFieldModal :isForm="false" @register="register" @ok="customHandleOk" />
</template>

<script setup lang="ts" name="field-list-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import addField from '../modals/add-field.vue';
  import { ref, reactive, toRef, computed } from 'vue';
  import draggable from 'vuedraggable';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { EntityModelCategoryEnum } from '/@/projects/app-designer/src/enum';
  import addCustomFieldModal from '../modals/add-custom-field-modal.vue';
  import { FormComponents, fixedAlignENUM } from '/@page-designer/enum';
  import { FieldIconMap } from '/@/enums/appEnum';
  import { useModal } from '/@/components/Modal';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { useFieldTransfer } from '/@/components/FieldTransfer';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const propConfig = reactive(defProps.propConfig);
  const disabled = toRef(() => {
    return !!(propConfig.maxlength && propValue?.value?.length >= propConfig.maxlength);
  });
  const Fieldinstance = useFieldTransfer();
  const [register, { openModal: openCustomModal }] = useModal();

  const typeEnum = {
    [FormComponents.DataTableFormula]: FIELD_TYPE.DATA_TABLE_FORMULA,
    [FormComponents.ReadonlyCmp]: FIELD_TYPE.READONLYCMP,
  };
  const editIndex = ref();
  const isEntityModel = computed(() => {
    return (
      defProps.widget!.props?.modeldata?.modelCategory === EntityModelCategoryEnum.ENTITY ||
      !defProps.widget!.props?.modeldata?.modelCategory
    );
  });
  const maxlength = toRef(() => {
    if (propConfig.maxlength) {
      return propConfig.maxlength - propValue?.value?.length;
    }
  });
  const addFieldModel = ref<InstanceType<typeof addField> | null>(null);

  async function openFieldModal() {
    if (propConfig.cascadeField) {
      return new Promise((resolve) => {
        Fieldinstance.open({
          modelKey: defProps.widget?.props[propConfig.modelByKey || 'model'],
          modalTitle: $t('sys.pageDesigner.selectFields'),
          isShowCascader: isEntityModel.value,
          draggable: true,
          data: propValue.value.map((i) => i.props),
          maxEnableCount: propConfig.maxlength,
          excludeFieldType: [],
          excludeFieldKey: [],
          filterFieldByFunction: propConfig.filterFn,
          saveCallback: ({ objFieldList }) => {
            console.log('objFieldList', objFieldList);
            resolve([...objFieldList]);
          },
        });
      });
    } else {
      const values = await addFieldModel.value!.open({
        maxlength: maxlength.value,
        modelKey: defProps.widget?.props[propConfig.modelByKey || 'model'],
        disabledIds: [],
        filterCallback: propConfig.filterFn,
      });
      return [...values];
    }
  }

  async function addFiled() {
    let list = await openFieldModal();
    if (propConfig.createField) {
      list = list.map((v) => propConfig.createField!(v, defProps.widget)).filter((i) => i);
    }
    if (propConfig.cascadeField) {
      // 通过筛选添加保留原有已设置属性
      propValue.value = list.map((i) => {
        const exist = propValue.value.filter((p) => p.props.fieldId === i.props.fieldId);
        if (exist.length) {
          return { ...i, props: exist[0].props, i18n: exist[0].i18n };
        }
        return i;
      });
    } else {
      propValue.value.push(...list);
    }
  }

  function deleteList(index) {
    propValue.value.splice(index, 1);
  }

  const customHandleOk = (data) => {
    const widget = propValue.value[editIndex.value];
    widget.props.label = data.name || data.label;
    widget.i18n.label = data.i18nConfig || data.labeli18n;
    widget.props.remark = data.description || data.remark;
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

  async function editFormula(widget, index) {
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
      name: widget.props.fieldName || widget.props.label,
      i18nConfig: widget.i18n.label || '',
      description: widget.props.remark,
      key: widget.props.field,
      modelKey: widget.props.modelKey || widget.props.model,
      type: fieldType,
      specificConfig,
      mappingType,
      createType: widget.type,
    };

    const tableData = {
      id: defProps.widget!.id,
      model: defProps.widget?.props[propConfig.modelByKey || 'model'],
    };

    openCustomModal(true, {
      isEdit: true,
      tableData,
      formData: data,
      isOldData: !widget.props.fieldId,
    });
  }
</script>

<style lang="less" scoped>
  .fieldrow {
    height: 40px;
    border-radius: 4px;
    background: #fafafa;

    &:hover {
      background-color: #f5f5f5;
    }
  }

  .content-center {
    & > div {
      max-height: 460px;
      overflow: auto;
    }
  }
</style>
