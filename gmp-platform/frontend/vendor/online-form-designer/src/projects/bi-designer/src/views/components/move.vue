<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="400"
    :title="t('sys.moveTo')"
    centered
    width="640px"
    :height="600"
    :maskClosable="false"
  >
    <div v-for="item in categoryList" :key="item.id" px-24px>
      <div
        class="flex category-item"
        :class="{ 'cursor-none': item.id === categoryId, selected: selectedKey === item.id }"
        @click="selectcategoryId(item)"
      >
        <div class="flex name">
          <IconNext
            class="mr-8px"
            value="icon-a-wenjianjia2"
            :size="16"
            :color="item.id === categoryId ? '#8b8b8b' : themeSetting.themeColor"
          />
          <span class="ell" :title="item.name"> {{ item.name }} </span>
          <div class="w90px" v-if="item.id === categoryId"> （当前）</div>
        </div>
        <CheckOutlined v-if="selectedKey === item.id" :style="{ color: themeSetting.themeColor }" />
      </div>
    </div>
    <template #footer>
      <a-button @click="close">{{ t('sys.cancelText') }}</a-button>
      <a-button type="primary" @click="handleOk" :disabled="!selectedKey || !selectedKey.length">
        {{ t('sys.okText') }}
      </a-button>
    </template>
  </basic-modal>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getCategoryListDatasetCategory } from '/@/apis/gct-platform/CategoryController';
  import { message } from 'ant-design-vue';
  import { IconNext } from '/@/components/Icon';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { putPnProjectById } from '/@/apis/gct-platform/PnProjectController';

  interface Props {
    module: string;
  }

  const props = defineProps<Props>();

  const { t } = useI18n();
  const { themeSetting } = useThemeSetting();
  const usePathQuery = usePathQueryStore();
  const appId = usePathQuery.getAid() || '';

  const categoryId = ref();
  const emit = defineEmits(['ok']);

  const categoryList = ref();

  const selectedKey = ref();

  const id = ref();

  const dashboardData = ref();

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (!data) return;
    id.value = data.id;
    getCategoryListDatasetCategory({
      assetsModule: props.module,
      appId,
    }).then((res) => {
      categoryList.value = res!;
    });
    dashboardData.value = data;
    categoryId.value = data.categoryId;
  });

  const selectcategoryId = (record) => {
    if (record.id === categoryId.value) {
      return;
    }
    selectedKey.value = record.id;
  };

  const close = () => {
    selectedKey.value = '';
    closeModal();
  };

  const handleOk = async () => {
    putPnProjectById(
      {
        id: dashboardData.value.id,
      },
      {
        ...dashboardData.value,
        categoryId: selectedKey.value,
      },
    ).then(() => {
      emit('ok');
      message.success(t('sys.operatingTitle'));
      close();
    });
  };
</script>
<style lang="scss" scoped>
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
