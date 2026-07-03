<template>
  <a-form
    :class="[ns.b()]"
    ref="formRef"
    :model="formData"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 16 }"
    autocomplete="off"
  >
    <a-form-item :label="t('sys.edhr.productType')" name="product_type_">
      <a-radio-group v-model:value="bindType">
        <a-radio :value="BindType.Product">{{ t('sys.edhr.product') }}</a-radio>
        <a-radio :value="BindType.ProductFamily">{{ t('sys.edhr.productFamily') }}</a-radio>
      </a-radio-group>
    </a-form-item>
    <template v-if="bindType === BindType.Product">
      <a-form-item :label="t('sys.edhr.product')" name="product_ref_" required>
        <ProductSelect :value="formData.product_ref_" @update:value="onProductChange" />
      </a-form-item>
      <FormAlert :message="t('sys.edhr.productSelectAlert')" />
    </template>
    <a-form-item
      v-if="bindType === BindType.ProductFamily"
      :label="t('sys.edhr.productFamily')"
      name="product_family_id_"
      required
    >
      <ProductFamilySelect
        :value="formData.product_family_id_"
        @update:value="onProductFamilyChange"
      />
    </a-form-item>

    <a-form-item required :label="t('sys.edhr.edhrTemplate')" name="edhr_id_">
      <VersionSelect
        :notEmitParent="false"
        :type="FormDesignEnum.EDHR"
        v-model:value="formData.edhr_id_"
        :enable-control="true"
      />
    </a-form-item>

    <a-form-item :label="t('sys.edhr.releaseTemplate')" name="product_release_ref_">
      <VersionSelect
        :notEmitParent="false"
        :type="FormDesignEnum.ONLINE_FORM"
        v-model:value="productReleaseRef"
        :enable-control="true"
      />
    </a-form-item>
    <!-- <a-form-item :label="t('sys.edhr.otherDoc')" name="otherDoc">
      <VersionSelect
        :notEmitParent="false"
        :type="FormDesignEnum.ONLINE_FORM"
        v-model:value="formData.otherDoc"
        :enable-control="true"
        :multiple="true"
        :exclusiveCheck="true"
        :placeholder="t('sys.edhr.otherDocSelectText')"
      />
    </a-form-item>
    <FormAlert :message="t('sys.edhr.otherDocSelectAlert')" /> -->
  </a-form>
</template>

<script setup lang="ts" name="edhr-configure-drawer">
  import { computed, reactive, ref } from 'vue';
  import { message, type FormInstance } from 'ant-design-vue';
  import { useModal, useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { isNil, merge, pickBy } from 'lodash-es';
  import { IEdhrUse } from '../logic/type';

  import ProductFamilySelect from '/@web-render/views/edhr-application/render/product-modeling/components/product-family-select.vue';
  import ProductSelect from '../components/product-select.vue';
  import { FormDesignEnum } from '/@/layouts/tree-sider-page/enum';
  import { VersionSelect } from '/@online-form/views/web-render/components';
  import { FormAlert } from '/@/components/ui';

  const { t } = useI18n();

  const ns = useNamespace('edhr-use-modal');

  const props = withDefaults(
    defineProps<{
      data?: IData;
      disabledFields?: Array<keyof IEdhrUse>;
      shouldClose?: (data) => Promise<boolean>;
    }>(),
    {
      data: () => ({}),
      disabledFields: () => [],
    },
  );

  const formData = reactive<{
    product_ref_: string | null;
    product_family_id_: string | null;
    edhr_id_: string | null;
    product_release_ref_: string | null;
  }>(
    merge(
      {
        product_ref_: null,
        product_family_id_: null,
        edhr_id_: null,
        product_release_ref_: null,
      },
      props.data || {},
    ),
  );

  const formRef = ref<FormInstance>();

  const enum BindType {
    Product = 'product',
    ProductFamily = 'productFamily',
  }
  const bindType = ref<BindType>(
    formData.product_family_id_ ? BindType.ProductFamily : BindType.Product,
  );

  const onProductFamilyChange = (value) => {
    formData.product_family_id_ = value;
    if (value) {
      formData.product_ref_ = null;
    }
  };
  const onProductChange = (value) => {
    formData.product_ref_ = value;
    if (value) {
      formData.product_family_id_ = null;
    }
  };

  const productReleaseRef = computed({
    get() {
      return formData.product_release_ref_;
    },
    set(v) {
      formData.product_release_ref_ = v === undefined ? null : v;
    },
  });

  useModal(async () => {
    await formRef.value!.validate();
    if (isNil(formData.product_family_id_) && isNil(formData.product_ref_)) {
      message.error(t('sys.edhr.productOrProductFamilyRequired'));
      throw new Error(t('sys.edhr.productOrProductFamilyRequired'));
    }
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
</script>

<style lang="scss" scoped>
  @include b(edhr-use-modal) {
    padding-top: 12px;
  }
</style>
