<template>
  <a-form
    class="important-pt-24px"
    ref="formRef"
    :model="formState"
    :label-col="{ span: 8 }"
    :wrapper-col="{ span: 15 }"
    @validate="handleValidate"
  >
    <a-row>
      <a-col :span="12">
        <a-form-item
          :label="$t('sys.onlineForm.powerComp.baseValue')"
          name="base"
          :rules="[
            {
              required: true,
              message: t('sys.pleaseInputSth', { sth: $t('sys.onlineForm.powerComp.baseValue') }),
            },
          ]"
        >
          <a-input-number
            size="small"
            v-model:value="formState.base"
            :precision="numInputProps.base.precision"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item
          :label="$t('sys.onlineForm.powerComp.exponentValue')"
          name="exponent"
          :rules="[
            {
              required: true,
              message: t('sys.pleaseInputSth', {
                sth: $t('sys.onlineForm.powerComp.exponentValue'),
              }),
            },
          ]"
        >
          <a-input-number
            size="small"
            v-model:value="formState.exponent"
            :precision="numInputProps.exponent.precision"
          />
        </a-form-item>
      </a-col>
    </a-row>
  </a-form>
  <div :class="ns.b('example')">
    {{ $t('sys.integration.example') }}：<PowerShower :value="formState" />
  </div>
</template>

<script setup lang="ts">
  import { FormInstance, message } from 'ant-design-vue';
  import { cloneDeep } from 'lodash-es';
  import { inject, onMounted, reactive, ref } from 'vue';
  import { SaveDataObj } from './use-power';
  import { useI18n } from '/@/hooks/web/useI18n';
  import PowerShower from './power-shower.vue';
  import { FIELD_TYPE, useNamespace } from '@gct/runtime';
  import type { IBindField } from '@gct/nocode-base';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';

  const { t } = useI18n();

  const ns = useNamespace('power-modal');

  const modal = inject<any>('modal');
  const formRef = ref<FormInstance>();
  const props = defineProps<{
    value?: SaveDataObj;
    fieldConfig: {
      /** 基数 */
      baseValueField?: IBindField;
      /** 指数 */
      exponentValueField?: IBindField;
      /** 真实值 */
      valueField?: IBindField;
    };
  }>();

  const formState = reactive({
    base: props.value?.base,
    exponent: props.value?.exponent,
    value: props.value?.value,
  });

  const calcResult = () => {
    const result = Math.pow(formState.base!, formState.exponent!);
    formState.value = result;
    if (result === Infinity) {
      formState.value = NaN;
      message.error($t('sys.onlineForm.powerCompErrorTip'));
      throw new Error($t('sys.onlineForm.powerCompErrorTip'));
    }
  };

  const handleValidate = (name, status: boolean) => {
    if (status && formState.base && formState.exponent) {
      calcResult();
    }
  };

  /** 数值组件的配置 */
  const numInputProps = reactive({
    base: {
      precision: 0,
    },
    exponent: {
      precision: 0,
    },
  });

  const initNumInputProps = async () => {
    const { baseValueField, exponentValueField } = props.fieldConfig;
    async function getFieldConfig(field: IBindField) {
      const fieldInfo = await FieldSchema.getConfigByField(field.model!, field.field!);
      let precision: any = 0;
      if (FIELD_TYPE.DECIMAL === field.fieldType!) {
        precision = fieldInfo?.specificConfig?.digits ?? 0;
      } else if (FIELD_TYPE.DOUBLE === field.fieldType!) {
        precision = undefined;
      }
      return { precision };
    }
    if (baseValueField) {
      const { precision } = await getFieldConfig(baseValueField);
      numInputProps.base.precision = precision;
    }
    if (exponentValueField) {
      const { precision } = await getFieldConfig(exponentValueField);
      numInputProps.exponent.precision = precision;
    }
  };

  onMounted(() => {
    initNumInputProps();
  });

  modal.ok = async () => {
    try {
      // 先校验，成功后提交
      await formRef.value?.validate();
      calcResult();
      return {
        ok: true,
        data: [cloneDeep(formState)],
      };
    } catch (err) {
      console.warn(err);
    }
  };
</script>

<style lang="scss" scoped>
  @include b(power-modal-example) {
    padding: 28px;
    font-size: 16px;
    font-weight: 600;
    border-top: 1px solid #e2e2e2;
  }
</style>
