<template>
  <div class="word-mock-report">
    <div class="header-wrapper">
      <a-breadcrumb>
        <a-breadcrumb-item>{{ categoryName || '--' }}</a-breadcrumb-item>
        <a-breadcrumb-item> {{ previewTitle || '--' }}</a-breadcrumb-item>
      </a-breadcrumb>
      <div class="header-actions">
        <div class="btn-cmp-switch-tab">
          <div
            v-for="tab of switchIcons"
            :key="tab.key"
            class="switch-item"
            :class="[showType === tab.value && 'selected']"
            @click.stop="() => onChangeTypeTab(tab)"
          >
            <span>{{ tab.label }}</span>
          </div>
        </div>
        <a-button type="primary" @click.stop="handlePrint">
          <printer-outlined />
          {{ $t('sys.onlineForm.printPreview') }}
        </a-button>
      </div>
    </div>
    <div class="mock-container">
      <DocRenderLayout ref="renderRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, reactive } from 'vue';
  import { useRoute } from 'vue-router';
  import { getConfigInfoByWeb } from '../../views/integration/utils/interface';
  import { DocRenderLayout, useWord, DocModeTypeConst, type WordRuntime } from '@gct-paas/word';

  const switchIcons = [
    {
      value: DocModeTypeConst.Fill,
      label: $t('sys.onlineForm.fillInMode'),
      key: 'switch_icon_fill',
    },
    {
      value: DocModeTypeConst.Print,
      label: $t('sys.onlineForm.previewMode'),
      key: 'switch_icon_view',
    },
  ];

  const route = useRoute();

  const params = reactive<{
    /** 模板id */
    selfId: string;
    /** 主模型 key */
    modelKey: string;
  }>({
    selfId: route.query.tid as string,
    modelKey: route.query.mid as string,
  });

  const showType = ref(DocModeTypeConst.Fill);
  const renderRef = ref();

  const { controller }: WordRuntime = useWord(
    {
      requestId: params.selfId,
      requestQuery: {
        materialNo: 'ZJ0312-1',
        productId: 'yBRW4s9zb3onrA6w:7anr7xnch4JWxCu8',
        routingOperationId: 'wXUPDOzL1hFgg34N',
        mfgOrderCode: 'ZJ0312',
      },
    },
    {
      suiteKey: 'edhr',
      modelKey: params.modelKey,
      factoryType: 'template',
      isMockReport: true,
      isPreview: false,
      renderModeType: DocModeTypeConst.Fill,
      deviceConfig: getConfigInfoByWeb(),
    },
  );

  const categoryName = computed(() => {
    return controller.value?.docRuntimeMeta?.categoryName;
  });

  const previewTitle = computed(() => {
    return controller.value?.docRuntimeMeta?.name;
  });

  const onChangeTypeTab = async (data) => {
    showType.value = data.value;
    if (controller.value?.setMode && typeof controller.value?.setMode === 'function') {
      controller.value?.setMode(data.value);
    }
  };

  const handlePrint = () => {
    renderRef.value?.onPrintView();
  };
</script>

<style scoped lang="less">
  .word-mock-report {
    display: flex;
    flex-direction: column;
    height: 100%;

    .header-wrapper {
      display: flex;
      position: sticky;
      z-index: 1000;
      top: 0;
      left: 0;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 52px;
      padding: 0 32px;
      background: rgb(248 249 250 / 80%);
      box-shadow: 0 1px 12px 2px rgb(0 0 0 / 6%);
      backdrop-filter: blur(10px);

      .header-title {
        font-size: 16px;
        font-weight: bold;
      }

      .header-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .btn-cmp-switch-tab {
          display: flex;
          position: relative;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
          padding: 4px;
          border-radius: 4px;
          background-color: #ddd;

          .switch-item {
            display: flex;
            position: relative;
            align-items: center;
            justify-content: center;
            width: 90px;
            height: 26px;
            border-radius: 2px;
            color: #8f8f8f;
            cursor: pointer;

            &.selected {
              background-color: #fff;
              color: #8f8f8f;
            }
          }
        }

        .ant-btn {
          .iconfont {
            position: relative;
            top: 1px;
            margin-right: 5px;
            line-height: 1em;
          }
        }

        .ant-btn:not(:last-child) {
          margin-right: 10px;
        }
      }
    }

    .mock-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  }
</style>
