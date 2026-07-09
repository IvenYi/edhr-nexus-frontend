<template>
  <div>
    <span v-if="disabled" class="text-[#999]">
      <!-- <span class="iconfont icon-tianjia mr5px"></span> -->
      <span> {{ $t('sys.pageDesigner.addSelectionField') }}</span>
    </span>
    <a @click="addFormula" v-else>
      <!-- <span class="iconfont icon-tianjia mr5px"></span> -->
      <span> {{ $t('sys.pageDesigner.addSelectionField') }}</span>
    </a>

    <a-tooltip>
      <template #title>{{ $t('sys.pageDesigner.addSelectionFieldTips') }}</template>
      <span class="iconfont icon-assist ml5px text-[#bfbfbf]"></span>
    </a-tooltip>
  </div>
  <!-- <columnFormulaModal :title="$t('sys.pageDesigner.addSelectionField')"  ref="FormulaModal" /> -->
  <!-- <columnFormulaModal :title="$t('sys.pageDesigner.addSelectionField')" @register="register" @ok="customHandleOk" /> -->
  <addCustomFieldModal :isForm="false" @register="register" @ok="customHandleOk" />
</template>

<script setup lang="ts" name="field-formula-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { toRef, reactive } from 'vue';
  // import columnFormulaModal from '../modals/column-formula-modal.vue';
  import addCustomFieldModal from '../modals/add-custom-field-modal.vue';
  import { message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FormComponents } from '/@page-designer/enum';
  import { useModal } from '/@/components/Modal';

  const { t } = useI18n();

  // const FormulaModal = ref<InstanceType<typeof columnFormulaModal> | null>(null);
  const defProps = defineProps(props);
  const propConfig = reactive(defProps.propConfig);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

  const [register, { openModal: openCustomModal }] = useModal();

  // 自定义-校验字段key
  const existedCustomKey = (csField) => {
    if (propValue.value.some((e) => !csField.isEdit && e.props.field === csField.key)) {
      message.error(t('sys.pageDesigner.showFieldExisted', { field: 'Code' }));
      return true;
    }
    return false;
  };

  const customHandleOk = (data) => {
    const formula = defProps.propConfig.createField!(data, defProps.widget);
    propValue.value.push(formula);
  }

  async function addFormula() {
    // const data = await FormulaModal.value?.open({
    //   id: defProps.widget!.id,
    //   model:
    //     defProps.widget?.type &&
    //     [FormComponents.SubTable, FormComponents.DynamicTable].includes(defProps.widget?.type)
    //       ? defProps.widget?.props.bindModelKey
    //       : defProps.widget?.props.model,
    //   validateCustomKey: existedCustomKey,
    // });
    // const formula = defProps.propConfig.createField!(data, defProps.widget);
    // propValue.value.push(formula);

    // propValue.value = [...propValue.value, formula];
    const tableData = {
      id: defProps.widget!.id,
      model: defProps.widget?.type &&
        [FormComponents.SubTable, FormComponents.DynamicTable].includes(defProps.widget?.type)
          ? defProps.widget?.props.bindModelKey
          : defProps.widget?.props.model,
      validateCustomKey: existedCustomKey,
    }

    openCustomModal(true, {isEdit: false, tableData, formData: {}});
  }


  const disabled = toRef(() => {
    return !!(propConfig.maxlength && (propValue?.value?.length >= <number>propConfig.maxlength));
  });
</script>

<style lang="less" scoped></style>
