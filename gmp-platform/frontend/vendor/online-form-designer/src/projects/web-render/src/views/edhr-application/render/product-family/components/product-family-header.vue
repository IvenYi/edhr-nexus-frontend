<template>
  <div class="content-top bg-[#F7F8FA] p16px mb16px">
    <a-form ref="formRef" :model="formState" autocomplete="off">
      <a-row :gutter="[16, 0]">
        <a-col :span="6">
          <a-form-item name="name" :label="t('sys.edhr.productFamilyName')">
            <a-input
              v-model:value="formState.name"
              :placeholder="t('sys.inputTextTip', { name: t('sys.edhr.productFamilyName') })"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item name="code" :label="t('sys.edhr.productFamilyCode')">
            <a-input
              v-model:value="formState.code"
              :placeholder="t('sys.inputTextTip', { name: t('sys.edhr.productFamilyCode') })"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6" :offset="6">
          <div class="text-right">
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
        </a-col>
      </a-row>
    </a-form>
  </div>
  <div :class="[ns.b()]">
    <div :class="[ns.e('right')]" v-show="userActions.Insert || userActions.IMPORT">
      <a-button
        v-if="userActions.Insert"
        type="primary"
        @click="$emit('doAction', ProductFamilyAction.NEW)"
      >
        <template #icon>
          <PlusOutlined />
        </template>
        {{ t('sys.new') }}
      </a-button>
      <a-button
        v-if="userActions.IMPORT"
        class="ml-8px"
        @click="$emit('doAction', ProductFamilyAction.IMPORT)"
      >
        {{ t('sys.import') }}
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup name="product-family-header">
  import { useNamespace } from '@gct/runtime';
  import { FormInstance } from 'ant-design-vue';
  import { reactive, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ProductFamilyAction } from '../logic/constants';
  import { UseProductFamily } from '../logic/use-product-family';

  const { t } = useI18n();
  const { userActions } = UseProductFamily();

  const ns = useNamespace('product-family-header');

  const emit = defineEmits<{
    (e: 'search', params: IParams): void;
    (e: 'doAction', action: ProductFamilyAction): void;
  }>();

  const formRef = ref<FormInstance>();

  const formState = reactive<IData>({
    name: '',
    code: '',
  });

  const handleSearch = () => {
    emit('search', { ...formState });
  };

  const handleReset = () => {
    formRef.value?.resetFields();
    handleSearch();
  };
</script>

<style lang="scss" scoped>
  $product-family-header: ();

  @include b(product-family-header) {
    @include set-component-css-var(product-family-header, $product-family-header);

    @include e(left) {
      display: flex;
      justify-content: space-between;
    }
    @include e(right) {
      text-align: right;
      margin-bottom: 20px;
    }
  }
</style>

<style lang="less" scoped>
  :deep(.ant-form .ant-form-item) {
    margin-bottom: 0;
  }
</style>
