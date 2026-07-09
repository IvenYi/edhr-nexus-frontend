<template>
  <div class="designer__header">
    <div class="flex items-center">
      <template v-if="showGoBack">
        <span class="go-back text-[#FFFFFF8F] cursor-pointer" @click="back">
          <arrow-left-outlined class="mr-4px align-middle" />
          {{ $t('sys.integration.backToPrevPage') }}
        </span>
        <div class="separator"></div>
      </template>
      <a-breadcrumb>
        <a-breadcrumb-item v-for="path in parentOutlinePaths" :key="path">{{
          path
        }}</a-breadcrumb-item>
        <a-breadcrumb-item> {{ docName }}</a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <div class="buttons">
      <div class="button ml-16px cursor-pointer" @click="save">
        <i class="iconfont icon-baocun1"></i>
        {{ t('sys.saveText') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { requestHostClose } from '/@online-form/views/designer/bridge/template-designer-host';

  import { useRoute } from 'vue-router';

  const route = useRoute();

  const { t } = useI18n();
  const { save, doc } = useSpreadSheet();

  /** 嵌入的时候要保存  */
  const showGoBack = window.top !== window;

  const parentOutlinePaths = computed(() => {
    if (route.query.parent_outline_path) {
      return (route.query.parent_outline_path as string).split('/');
    }
    if (doc.value.categoryName) {
      return [doc.value.categoryName];
    }
    return ['--'];
  });

  const docName = computed(() => {
    if (route.query.doc_name) {
      return route.query.doc_name as string;
    }
    if (doc.value.name) {
      return doc.value.name;
    }
    return ['--'];
  });

  const back = () => {
    if (route.query.hosted === '1') {
      requestHostClose();
      return;
    }
    history.back();
  };
</script>

<style lang="less" scoped>
  .designer__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 100%;
    background-color: #1a1d23;
    position: relative;

    :deep(.ant-breadcrumb) {
      font-size: 14px;
      // color: rgba(255, 255, 255, 0.64);
      color: #fff;
      .ant-breadcrumb-separator {
        // color: rgba(255, 255, 255, 0.64);
        color: #fff;
      }
      & > span:last-child {
        color: #fff;
      }
    }

    .buttons {
      display: flex;
    }

    .button {
      height: 26px;
      background: #444444;
      border-radius: 4px;
      color: #fff;
      font-size: 12px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      line-height: 1em;
      transition: all 0.3s;
      i {
        margin-right: 6px;
        display: flex;
        font-size: 12px;
      }
      &:hover {
        background-color: var(--ant-primary-color);
      }
    }

    .go-back {
      display: inline-block;
      line-height: 22px;
    }
    .separator {
      margin-left: 16px;
      margin-right: 16px;
      width: 1px;
      height: 12px;
      background-color: #fff;
      display: inline-block;
      vertical-align: middle;
    }
  }
</style>
