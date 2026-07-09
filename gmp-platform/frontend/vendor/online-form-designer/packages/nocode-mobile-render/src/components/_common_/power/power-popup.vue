<template>
  <BasicPopup
    v-model:show="show"
    :popupProps="{
      position: 'right',
    }"
    :extra-style="{
      top: 0,
      margin: 0,
      transform: 'none',
      width: '375px',
    }"
  >
    <template #header>
      <div class="header h54px ks-row-middle px16px text-size-16px">
        <div class="ks-col font-500 color-[#000000]">
          <span class="cursor-pointer ks-row-middle">
            <span class="max-w400px ell inline-block"> 填报 </span>
          </span>
        </div>
        <van-icon name="cross" @click="onCancel" />
      </div>
    </template>
    <div class="fill-container">
      <van-form ref="formRef" class="fill-container-form">
        <div class="fill-item">
          <van-field
            :label="t('sys.onlineForm.powerComp.baseValue')"
            name="base"
            required
            :rules="[
              {
                required: true,
                message: t('sys.pleaseInputSth', { sth: t('sys.onlineForm.powerComp.baseValue') }),
              },
            ]"
            v-model="formState.base"
            type="number"
            :precision="numInputProps.base.precision"
          />
        </div>
        <div class="fill-item">
          <van-field
            :label="t('sys.onlineForm.powerComp.exponentValue')"
            name="exponent"
            required
            :rules="[
              {
                required: true,
                message: t('sys.pleaseInputSth', {
                  sth: t('sys.onlineForm.powerComp.exponentValue'),
                }),
              },
            ]"
            v-model="formState.exponent"
            type="number"
            :precision="numInputProps.exponent.precision"
          />
        </div>
      </van-form>
      <div class="power-modal-example">
        <div class="example-title">{{ t('sys.integration.example') }}</div>
        <div class="example-container">
          <template v-if="formState.base">
            <PowerShower :value="formState" />
          </template>
          <template v-else>
            <span>--</span>
          </template>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="onCancel">
          取消
        </van-button>
        <van-button class="flex-1" type="primary" @click="onOk">确认</van-button>
      </div>
    </template>
  </BasicPopup>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue';
  import { showToast } from 'vant';
  import { cloneDeep } from 'lodash-es';
  import { FIELD_TYPE } from '@gct/runtime';
  import PowerShower from './power-shower.vue';
  import { SaveDataObj } from './use-power';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import BasicPopup from '../../../base/basic-popup.vue';
  import { i18n } from '@mobile/locales/setupI18n';
  import type { IBindField } from '@gct/nocode-base';

  const { t } = i18n.global;

  const show = ref(true);

  const formRef = ref();
  const props = defineProps<{
    popupProps?: any; // 组件属性
    beforeClose: (data?: any) => boolean | undefined;
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
      showToast('指数过大，无法计算');
      throw new Error('指数过大，无法计算');
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

  /** 执行关闭操作 */
  const doClose = (info?: any) => {
    const isClosed = props.beforeClose(info);
    if (isClosed !== false) {
      show.value = false;
    }
  };

  const onCancel = () => {
    doClose();
  };

  const onOk = async () => {
    try {
      // 先校验，成功后提交
      await formRef.value?.validate();
      calcResult();
      doClose(cloneDeep(formState));
    } catch (err) {
      console.warn(err);
    }
  };
</script>

<style lang="less" scoped>
  .power-modal-example {
    font-size: 16px;
    font-weight: 600;
    background: #fff;
    border-radius: 4px;
    margin: 8px;
    overflow: hidden;

    .example-title {
      padding: 8px 12px;
      background-color: #e8ebf0;
    }

    .example-container {
      padding: 12px;
    }
  }

  .fill-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: #f7f8fa;

    .fill-container-form {
      overflow: auto;
      padding: 8px;

      .van-field {
        border-radius: 8px;
      }

      .fill-item + .fill-item {
        margin-top: 8px;
      }
    }
  }
</style>
