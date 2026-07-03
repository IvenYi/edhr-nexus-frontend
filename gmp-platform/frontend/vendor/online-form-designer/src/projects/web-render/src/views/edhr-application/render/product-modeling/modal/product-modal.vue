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
      :label="t('sys.edhr.productName')"
      name="name_"
      :rules="[
        {
          required: true,
          validator: validateVersion,
        },
      ]"
    >
      <div class="ks-row">
        <a-input-group compact class="ks-col">
          <a-form-item style="width: calc(100% - 120px)" name="name_">
            <a-input
              v-model:value="formData.name_"
              :disabled="disabledFields.includes('name_')"
              style="height: 32px"
              @change="onChange"
              :placeholder="t('sys.inputTextTip', { name: t('sys.edhr.productName') })"
            />
          </a-form-item>
          <a-form-item name="version_" style="width: 120px">
            <a-input
              :disabled="disabledFields.includes('version_')"
              :placeholder="t('sys.appDesigner.version')"
              @change="onChange"
              v-model:value="formData.version_"
              style="height: 32px"
            />
          </a-form-item>
        </a-input-group>
        <div class="checkbox-wrap">
          <a-checkbox
            :disabled="disabledFields.includes('default_')"
            v-model:checked="formData.default_"
          />
          <span class="ml6px">{{ t('sys.default') }}</span>
        </div>
      </div>
    </a-form-item>
    <a-form-item required :label="t('sys.edhr.productType')" name="product_type_">
      <ProductTypeSelect
        :disabled="disabledFields.includes('product_type_')"
        v-model:value="formData.product_type_"
      />
    </a-form-item>
    <a-form-item :label="t('sys.edhr.productFamily')" name="product_family_id_">
      <ProductFamilySelect
        :disabled="disabledFields.includes('product_family_id_')"
        v-model:value="formData.product_family_id_"
      />
    </a-form-item>
    <a-form-item :label="t('sys.edhr.productCode')" name="code_">
      <a-input
        :disabled="disabledFields.includes('code_')"
        v-model:value="formData.code_"
        show-count
        :maxlength="32"
        :placeholder="t('sys.inputTextTip', { name: t('sys.edhr.productCode') })"
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
  import { merge, pickBy } from 'lodash-es';
  import { IProductVersion } from '../logic/type';
  import ProductTypeSelect from '../components/product-type-select.vue';
  import ProductFamilySelect from '../components/product-family-select.vue';

  const { t } = useI18n();

  const ns = useNamespace('product-family-modal');

  const props = withDefaults(
    defineProps<{
      data?: IData;
      disabledFields?: Array<keyof IProductVersion>;
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
        default_: false,
        version_: undefined,
        product_type_: undefined,
        product_family_id_: undefined,
        code_: undefined,
      },
      props.data || {},
    ),
  );

  const formRef = ref<FormInstance>();

  useModal(async () => {
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
  });

  const onChange = () => {
    formRef.value?.validateFields('name_');
  };

  const validateVersion = async (_rule, _value) => {
    const { name_, version_ } = formData;
    if (!version_ && !name_) {
      return Promise.reject('请输入名称、版本号');
    } else if (!name_) {
      return Promise.reject('请输入名称');
    } else if (!version_) {
      return Promise.reject('请输入版本号');
    } else {
      return Promise.resolve();
    }
  };
</script>

<style lang="scss" scoped>
  @include b(product-family-modal) {
    padding-top: 12px;

    .ant-input-group {
      :deep(.ant-form-item) {
        margin-bottom: 0;

        &:first-child {
          .ant-input-affix-wrapper {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
          }
        }

        &:last-child {
          .ant-input-affix-wrapper {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
          }
        }
      }
    }
    .checkbox-wrap {
      height: 32px;
      margin-left: 8px;
      color: #3d3d3e;
      line-height: 32px;
    }
  }
</style>
