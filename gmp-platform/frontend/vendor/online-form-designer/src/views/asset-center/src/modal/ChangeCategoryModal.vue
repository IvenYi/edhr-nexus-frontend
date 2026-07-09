<template>
  <div>
    <basic-modal
      v-bind="$attrs"
      @register="registerInner"
      title="移动到"
      centered
      :min-height="40"
      width="640px"
      :maskClosable="false"
    >
      <div v-for="item in categoryList" :key="item.id" px-24px>
        <div
          class="flex category-item"
          :class="{
            'cursor-none': item.id === formState.categoryId,
            selected: selectedKey === item.id,
          }"
          @click="selectcategoryId(item)"
        >
          <div class="flex name">
            <span class="ell" :title="item.name"> {{ item.name }} </span>
            <div class="w90px" v-if="item.id === formState.categoryId"> （当前）</div>
          </div>
          <CheckOutlined
            v-if="selectedKey === item.id"
            :style="{ color: themeSetting.themeColor }"
          />
        </div>
      </div>
      <template #footer>
        <a-button @click="close">{{ t('sys.cancelText') }}</a-button>
        <a-button type="primary" @click="handleOk" :disabled="!selectedKey || !selectedKey.length">
          {{ t('sys.okText') }}
        </a-button>
      </template>
    </basic-modal>
  </div>
</template>

<script setup lang="ts">
  import { reactive, inject, Ref, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { FormInstance } from 'ant-design-vue';
  import {
    getAssetsInfo,
    postAssetsMoveByAssetIdCategoryByCategoryId,
  } from '/@/apis/gct-platform/AssetsController';
  import type { CategoryResponse } from '/@/apis/gct-platform/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';

  const categoryList = inject('categoryList') as Ref<CategoryResponse[]>;
  const { themeSetting } = useThemeSetting();
  const { t } = useI18n();
  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });
  const selectedKey = ref();
  const CategoryFormRef = ref<FormInstance>();
  const formState = reactive({
    assetId: '',
    categoryId: '',
  });

  const onDataReceive = (data) => {
    Object.assign(formState, { assetId: data.id, categoryId: data.categoryId });
  };
  const selectcategoryId = (record) => {
    if (record.id === formState.categoryId) {
      return;
    }
    selectedKey.value = record.id;
  };
  const close = () => {
    selectedKey.value = '';
    CategoryFormRef.value?.resetFields();
    closeModal();
  };

  const handleOk = async () => {
    try {
      await CategoryFormRef.value?.validate();
      const params = {
        categoryId: selectedKey.value,
        assetId: formState.assetId,
      };

      await postAssetsMoveByAssetIdCategoryByCategoryId(params);
      closeModal();
    } catch (error) {
      console.warn(error);
    }
  };
</script>

<style lang="less">
  .category-item {
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    width: 100%;
    height: 40px;
    line-height: 40px;
    &:hover {
      background: #f5f6fa;
    }
  }
  .cursor-none {
    cursor: not-allowed;
    color: #8b8b8b;
  }
  .selected {
    background: #e2eef9;
    color: var(--ant-primary-color);
  }
  .name {
    align-items: center;
    max-width: calc(100% - 20px);
  }
</style>
