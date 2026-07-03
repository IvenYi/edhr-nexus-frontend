<template>
  <div class="px34px py28px">
    <a-form ref="formRef" :model="formState">
      <a-form-item
        :label="$t('sys.onlineForm.releaseBatch')"
        :rules="[{ required: true }]"
        name="materialNo"
      >
        <a-input v-model:value="formState.materialNo" :placeholder="$t('sys.inputText')" disabled />
      </a-form-item>
      <!-- <a-form-item :label="$t('sys.edhr.field.mfgOrder')" :rules="[{ required: true }]" name="mfgOrderId">
        <TraceSelect
          v-model:modelValue="formState.mfgOrderId"
          :placeholder="'请选择'"
          :model-key="'em_mfg_order'"
          :field-type="FIELD_TYPE.MFG_ORDER"
          disabled
        />
      </a-form-item> -->
      <a-form-item
        name="tmplId"
        :label="$t('sys.edhr.field.releaseTmpl')"
        :rules="[{ required: true, message: '请选择放行单模板' }]"
      >
        <VersionSelect
          :type="FormDesignEnum.ONLINE_FORM"
          :value="formState.tmplId"
          @select="onFormVersionSelect"
          :query-params="queryParams"
          :enable-control="true"
          :placeholder="$t('sys.chooseText')"
        />
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { reactive, ref, toRaw, watch } from 'vue';
  import { IModal, useModal, FIELD_TYPE } from '@gct/runtime';
  import VersionSelect from '/@online-form/views/web-render/components/version-select/version-select.vue';
  import { FormDesignEnum } from '/@/layouts/tree-sider-page/enum';
  import { FormTypeEnum } from '@gct/nocode-base';
  import TraceSelect from '/@/projects/web-render/src/views/edhr-application/components/trace-select/trace-select.vue';

  const props = defineProps<{
    context: IParams;
    params: IParams;
    modal: IModal;
  }>();

  const formRef = ref();
  const formState = reactive<{ tmplId?: string; materialNo?: string; mfgOrderId?: string }>({
    tmplId: undefined,
    materialNo: undefined,
    mfgOrderId: undefined,
  });

  const queryParams = { formType: [FormTypeEnum.BASE, FormTypeEnum.PROCESS].join(',') };

  watch(
    () => props.context,
    () => {
      Object.keys(props.context).forEach((key) => {
        formState[key] = props.context[key];
      });
    },
    {
      immediate: true,
    },
  );

  const onFormVersionSelect = (option) => {
    formState.tmplId = `${option.baseId}:${option.id}`;
  };

  const onSave = async () => {
    await formRef.value?.validate();
    return {
      ok: true,
      params: toRaw(formState),
    };
  };

  useModal(onSave);
</script>
<style lang="less" scoped></style>
