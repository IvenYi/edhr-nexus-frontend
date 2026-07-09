<template>
  <div class="nocode-document-header-wrapper">
    <van-nav-bar :title="previewTitle || '--'" left-text="返回" left-arrow @click-left="onBack">
      <template #title>
        <div class="header-title"> {{ categoryName || '--' }} / {{ previewTitle || '--' }} </div>
      </template>

      <template #right>
        <!-- 切换模式 -->
        <template v-if="formType !== FormTypeEnum.FILE">
          <template v-if="!hiddenChangeModeTypeBtn">
            <van-popover v-model:show="showPopover" placement="bottom-end" theme="dark">
              <div class="switch-menu">
                <div
                  v-for="tab in switchIcons"
                  :key="tab.key"
                  class="switch-item"
                  :class="{ selected: showType === tab.value }"
                  @click.stop="onChangeTypeTab(tab)"
                >
                  {{ tab.label }}
                </div>
              </div>

              <template #reference>
                <van-button size="small" type="primary" plain>切换</van-button>
              </template>
            </van-popover>
          </template>

          <van-button size="small" type="primary" class="ml-8" @click.stop="handlePrint">
            打印预览
          </van-button>
        </template>
      </template>
    </van-nav-bar>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { FormTypeEnum, RenderModeEnum } from '@gct/nocode-base';
  import { putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { showToast } from 'vant';

  const props = defineProps<{
    uniqueId: string;
    categoryName: string;
    previewTitle: string;
    hiddenChangeModeTypeBtn?: boolean;
    formType: FormTypeEnum;
    printSize: string;
    callback?: Function;
    updateStatus?: boolean;
    updateId?: string;
  }>();

  const showPopover = ref(false);
  const showType = ref(RenderModeEnum.FormMode);

  const switchIcons = [
    { value: RenderModeEnum.FormMode, label: '填报模式', key: 'fill' },
    { value: RenderModeEnum.ViewMode, label: '预览模式', key: 'view' },
  ];

  const onBack = () => history.back();

  const onChangeTypeTab = (data) => {
    showType.value = data.value;
    showPopover.value = false;

    props.callback?.(props.uniqueId, data.value);
  };

  const handlePrint = () => {
    const styleId = 'print-style';
    let style = document.getElementById(styleId);

    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }

    style.innerHTML = `
    @media print {
      @page {
        size: ${props.printSize};
      }
    }
  `;

    setTimeout(() => {
      window.print();

      if (props.updateStatus && props.updateId) {
        updatePrintStatus();
      }

      if (style) document.head.removeChild(style);
    }, 100);
  };

  async function updatePrintStatus() {
    await putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: 'entity',
        modelKey: 'em_container',
        bsKey: 'updateById',
      },
      { print_status_: 'printed' },
      { id: props.updateId },
    );

    showToast('已更新打印状态');
  }
</script>

<style scoped lang="less">
  .nocode-document-header-wrapper {
    position: sticky;
    top: 0;
    z-index: 999;
    background: #fff;

    .header-title {
      font-size: 15px;
      font-weight: 500;
    }
  }

  .switch-menu {
    padding: 6px 0;
    width: 120px;
  }

  .switch-item {
    padding: 10px 14px;
    font-size: 14px;
    color: #999;
  }

  .switch-item.selected {
    color: #1989fa;
    font-weight: 600;
  }
</style>
