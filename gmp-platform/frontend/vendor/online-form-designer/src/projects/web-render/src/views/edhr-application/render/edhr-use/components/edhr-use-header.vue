<template>
  <div :class="[ns.b()]">
    <div class="content-top bg-[#F7F8FA] p16px mb16px">
      <a-form :class="[ns.e('left')]" ref="formRef" :model="formData" autocomplete="off">
        <div :class="[ns.e('search-form')]">
          <a-form-item name="productFamilyId" :label="t('sys.edhr.productFamily')" class="w-350px">
            <ProductFamilySelect v-model:value="formData.productFamilyId" />
          </a-form-item>
          <a-form-item name="productIds" :label="t('sys.edhr.product')" class="w-350px">
            <ProductSelect
              :multiple="true"
              :parent-to-default="false"
              v-model:items="formData.productIds"
            />
          </a-form-item>
        </div>
        <div :class="[ns.e('search-btn'), 'ml-16px']">
          <a-button @click="handleReset">
            <template #icon>
              <undo-outlined />
            </template>
            {{ t('sys.reset') }}
          </a-button>
          <a-button class="ml-8px" type="primary" @click="handleSearch">
            <template #icon>
              <search-outlined />
            </template>
            {{ t('sys.query') }}
          </a-button>
        </div>
      </a-form>
    </div>
    <div :class="[ns.e('right')]" v-if="userActions.Insert">
      <a-button type="primary" @click="$emit('doAction', EdhrUseAction.NEW)">
        <template #icon>
          <PlusOutlined />
        </template>
        {{ t('sys.new') }}
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup name="edhr-use-header">
  import { useNamespace } from '@gct/runtime';
  import { FormInstance } from 'ant-design-vue';
  import { reactive, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { EdhrUseAction } from '../logic/constants';
  import ProductFamilySelect from '/@web-render/views/edhr-application/render/product-modeling/components/product-family-select.vue';
  import ProductSelect from '../components/product-select.vue';
  import { UseEdhrUse } from '../logic/use-edhr-use';

  const { t } = useI18n();
  const { userActions } = UseEdhrUse();

  const ns = useNamespace('edhr-use-header');

  const emit = defineEmits<{
    (e: 'search', params: IParams): void;
    (e: 'doAction', action: EdhrUseAction): void;
  }>();

  const formRef = ref<FormInstance>();

  const formData = reactive<IData>({
    productFamilyId: undefined,
    productIds: [],
  });

  const handleSearch = () => {
    emit('search', { ...formData });
  };

  const handleReset = () => {
    formRef.value?.resetFields();
    handleSearch();
  };
</script>

<style lang="scss" scoped>
  $edhr-use-header: ();

  @include b(edhr-use-header) {
    @include set-component-css-var(edhr-use-header, $edhr-use-header);

    @include e(left) {
      display: flex;
      justify-content: space-between;
    }
    @include e(right) {
      text-align: right;
      margin-bottom: 20px;
    }

    @include e(search-form) {
      display: flex;
      column-gap: 32px;
    }
  }
</style>
<style lang="less" scoped>
  :deep(.ant-form .ant-form-item) {
    margin-bottom: 0;
  }
</style>
