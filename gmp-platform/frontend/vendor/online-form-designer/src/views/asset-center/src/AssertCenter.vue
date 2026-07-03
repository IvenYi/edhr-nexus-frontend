<template>
  <div class="assert-center">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane
        v-if="userActions.DevelopIconManagement"
        :key="1"
        :tab="t('sys.developer.assetCenter.iconResource')"
        style="height: 100%"
      >
        <assert-icon />
      </a-tab-pane>
      <a-tab-pane
        v-if="userActions.DevelopImageManagement"
        :key="2"
        :tab="t('sys.developer.assetCenter.imgResource')"
      >
        <assert-image />
      </a-tab-pane>
      <!-- <a-tab-pane :key="3" :tab="t('sys.developer.assetCenter.compResource')" /> -->
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import AssertIcon from './modules/AssertIcon.vue';
  import AssertImage from './modules/AssertImage.vue';
  import { CustomAction } from '/@/enums/authActionEnum';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const { hasPermission } = usePermission();

  const userActions = computed(() => {
    return {
      DevelopIconManagement: hasPermission(CustomAction.DevelopIconManagement, undefined, true),
      DevelopImageManagement: hasPermission(CustomAction.DevelopImageManagement, undefined, true),
    };
  });

  const activeKey = ref(1);

  onMounted(() => {
    activeKey.value = userActions.value.DevelopIconManagement
      ? 1
      : userActions.value.DevelopImageManagement
      ? 2
      : 3;
  });
</script>

<style lang="less" scoped>
  .assert-center {
    height: 100%;
    > .ant-tabs {
      height: 100%;
    }
    :deep(.ant-tabs-nav) {
      margin: 0;
      .ant-tabs-nav-wrap > .ant-tabs-nav-list {
        margin-left: 20px;
      }
    }

    :deep(.ant-tabs-content) {
      height: 100%;
    }
  }
</style>
