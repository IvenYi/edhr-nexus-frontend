<template>
  <a-form
    :class="ns.b()"
    ref="formRef"
    :model="formData"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 16 }"
    autocomplete="off"
  >
    <a-form-item
      required
      :label="t('sys.edhr.productFamilyName')"
      name="name_"
      :rules="[{ validator: validateNameLength }]"
    >
      <a-input
        :disabled="disabledFields.includes('name_')"
        v-model:value="formData.name_"
        show-count
        :maxlength="32"
        :placeholder="t('sys.inputTextTip', { name: t('sys.edhr.productFamilyName') })"
      />
    </a-form-item>
    <a-form-item
      :label="t('sys.edhr.productFamilyCode')"
      name="code_"
      :rules="[{ validator: validateCodeLength }]"
    >
      <a-input
        :disabled="disabledFields.includes('code_')"
        v-model:value="formData.code_"
        show-count
        :maxlength="32"
        :placeholder="t('sys.inputTextTip', { name: t('sys.edhr.productFamilyCode') })"
      />
    </a-form-item>
    <a-form-item :label="t('sys.description')" name="description_">
      <a-textarea
        :disabled="disabledFields.includes('description_')"
        v-model:value="formData.description_"
        show-count
        :maxlength="120"
        :placeholder="t('sys.appDesigner.placeEnterDesc')"
      />
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts" name="edhr-configure-drawer">
  import { reactive, ref } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useModal, useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { merge, pickBy, throttle } from 'lodash-es';
  import { IProductFamily } from '../logic/type';

  const { t } = useI18n();

  const ns = useNamespace('product-family-modal');

  const props = withDefaults(
    defineProps<{
      data?: IData;
      disabledFields?: Array<keyof IProductFamily>;
      shouldClose?: (data) => Promise<boolean>;
    }>(),
    {
      data: () => ({}),
      disabledFields: () => [],
    },
  );

  const formData = reactive(
    merge(
      {
        name_: '',
        description_: undefined,
      },
      props.data || {},
    ),
  );

  const formRef = ref<FormInstance>();

  const validateNameLength = (_, value, callback) => {
    if (value && value.length > 32) {
      callback(t('sys.edhr.productFamilyNameMax32'));
    }
    callback();
  };

  const validateCodeLength = (_, value, callback) => {
    if (value && value.length > 32) {
      callback(t('sys.edhr.productFamilyCodeMax32'));
    }
    callback();
  };

  const ok = async () => {
    await formRef.value!.validate();
    const editedData = pickBy(formData, (v) => v !== undefined);
    let isClose = true;
    if (props.shouldClose) {
      isClose = await props.shouldClose(editedData);
    }
    return {
      ok: isClose,
      data: [editedData],
    };
  };

  const throttleOk = throttle(ok, 1500, {
    trailing: false,
  });
  useModal(throttleOk);
</script>

<style lang="scss" scoped>
  @include b(product-family-modal) {
    padding-top: 12px;
  }
</style>
