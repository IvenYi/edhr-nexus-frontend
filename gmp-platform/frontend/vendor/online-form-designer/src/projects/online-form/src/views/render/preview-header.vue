<template>
  <div class="nocode-document-header-wrapper">
    <a-breadcrumb>
      <a-breadcrumb-item>{{ categoryName || '--' }}</a-breadcrumb-item>
      <a-breadcrumb-item> {{ previewTitle || '--' }}</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="nocode-document-header-actions">
      <!-- <div class="header-zoom-boxs">
        <div
          class="zoom-control zoom-out"
          :class="{ 'is-disabled': min_disabled }"
          @click.stop="() => handleChangeScale(-0.1)"
        >
          <i class="iconfont icon-shouqi"></i>
        </div>
        <a-popover
          v-model:visible="popoverVisible"
          overlayClassName="zoom-box-expand"
          trigger="click"
        >
          <template #content>
            <ul>
              <li
                v-for="item in zoom_list"
                :key="item.key"
                :class="{
                  selected: item.value === zoom,
                }"
                @click.stop="handleToggle(item as any)"
              >
                <span>{{ item.name }}</span>
                <div class="ml-[auto] pl-8px" v-if="item.value === zoom">
                  <check-outlined class="text-14px" />
                </div>
              </li>
            </ul>
          </template>
          <div :class="['zoom-main', popoverVisible && 'is-selected']">
            <p class="zoom-scale">{{ zoom_text }}</p>
          </div>
        </a-popover>
        <div
          class="zoom-control zoom-in"
          :class="{ 'is-disabled': max_disabled }"
          @click.stop="() => handleChangeScale(0.1)"
        >
          <i class="iconfont icon-zhankai"></i>
        </div>
      </div> -->
      <!-- <a-button type="primary" @click.stop="handleSave">
        <printer-outlined />
        保存
      </a-button> -->
      <template v-if="formType !== FormTypeEnum.FILE">
        <template v-if="!hiddenChangeModeTypeBtn">
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
        </template>
        <a-button type="primary" @click.stop="handlePrint">
          <printer-outlined />
          {{ $t('sys.onlineForm.printPreview') }}
        </a-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts" name="preview-header">
  import { computed, ref, nextTick } from 'vue';
  import { RenderModeEnum, FormTypeEnum } from '@gct/nocode-base';
  import { putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  // const props = defineProps<{
  //   zoom: number;
  //   limit: {
  //     min: number;
  //     max: number;
  //   };
  // }>();

  const props = defineProps<{
    /** 唯一id */
    uniqueId: string;
    /** 分类名称 */
    categoryName: string;
    /** 标题 */
    previewTitle: string;
    /** 是否隐藏切换渲染模式 */
    hiddenChangeModeTypeBtn?: boolean;
    formType: FormTypeEnum;
    /** 打印大小 */
    printSize: string;
    /** 回调方法 */
    callback?: Function;
    /** 是否需要更新打印状态 */
    updateStatus?: boolean;
    /** 更新的唯一ID */
    updateId?: string;
  }>();

  // const emit = defineEmits(['update:zoom']);

  // const popoverVisible = ref<boolean>(false);

  // const zoom_list = [
  //   { name: '50%', value: 0.5, key: '0.5' },
  //   { name: '75%', value: 0.75, key: '0.75' },
  //   { name: '100%', value: 1.0, key: '1' },
  //   { name: '125%', value: 1.25, key: '1.25' },
  //   { name: '150%', value: 1.5, key: '1.50' },
  //   { name: '200%', value: 2.0, key: '2' },
  // ];

  // const zoom_text = computed(() => {
  //   return `${Math.floor(props.zoom * 100)}%`;
  // });

  // const max_disabled = computed(() => {
  //   return props.zoom >= props.limit.max;
  // });

  // const min_disabled = computed(() => {
  //   return props.zoom <= props.limit.min;
  // });

  // const handleToggle = (item) => {
  //   popoverVisible.value = false;
  //   emit('update:zoom', item.value);
  // };

  // const handleChangeScale = (stepNumber) => {
  //   const newScale = Math.floor(props.zoom * 10 + stepNumber * 10) / 10;
  //   emit('update:zoom', Math.min(Math.max(newScale, props.limit.min), props.limit.max));
  // };

  const showType = ref(RenderModeEnum.FormMode);

  const switchIcons = [
    {
      value: RenderModeEnum.FormMode,
      label: $t('sys.onlineForm.fillInMode'),
      key: 'switch_icon_fill',
    },
    {
      value: RenderModeEnum.ViewMode,
      label: $t('sys.onlineForm.previewMode'),
      key: 'switch_icon_view',
    },
  ];

  const onChangeTypeTab = (data) => {
    showType.value = data.value;
    if (props.callback && typeof props.callback === 'function') {
      props.callback(props.uniqueId, data.value);
    }
  };

  // const handleSave = () => {
  //   props.callback();
  // };

  const handlePrint = () => {
    const styleId = 'print-style'; // 唯一 ID
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
      // 只删除这个 print-style，不影响其他 style
      if (style) document.head.removeChild(style);
    }, 100);
  };

  // 更新批次的打印状态
  async function updatePrintStatus() {
    await putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: 'entity',
        modelKey: 'em_container',
        bsKey: 'updateById',
      },
      {
        print_status_: 'printed',
      },
      {
        id: props.updateId,
      },
    );
  }
</script>

<style scoped lang="less">
  .nocode-document-header-wrapper {
    position: sticky;
    left: 0;
    top: 0;
    width: 100%;
    z-index: 1000;
    background: rgba(248, 249, 250, 0.8);
    box-shadow: 0px 1px 12px 2px rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(10px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 32px;
    height: 52px;
    flex-shrink: 0;

    .header-title {
      font-size: 16px;
      font-weight: bold;
    }
    .nocode-document-header-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .header-zoom-boxs {
        display: flex;
        align-items: center;
        margin: 0px 16px;
        width: 100%;
        height: 32px;
        border: 1px solid rgb(219, 219, 219);
        border-radius: 6px;
        .zoom-control {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 32px;
          height: 100%;
          color: rgba(0, 0, 0, 0.7);
          cursor: pointer;
          position: relative;
          transition: background-color 0.2s ease-in-out 0s;

          .iconfont {
            line-height: 1;
          }

          &.zoom-out {
            border-radius: 6px 0px 0px 6px;
          }

          &.zoom-in {
            border-radius: 0px 6px 6px 0px;
          }

          &:not(&.is-disabled):hover {
            background-color: #e6e9ef;
          }

          &.is-disabled {
            color: #e6e9ef;
            cursor: not-allowed;
          }
        }

        .zoom-main {
          position: relative;
          display: flex;
          flex: 1 1 0%;
          width: 52px;
          height: 100%;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease-out 0s;

          .zoom-scale {
            flex: 1 1 0%;
            color: rgba(0, 0, 0, 0.9);
            margin-bottom: 0;
            font-size: 12px;
            font-weight: 400;
            transform: scale(1);
            text-align: center;
          }
          &:hover {
            background-color: #e6e9ef;
          }

          &.is-selected {
            background-color: #e6e9ef;
          }
        }
      }

      .btn-cmp-switch-tab {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #ddd;
        padding: 4px;
        border-radius: 4px;
        margin-right: 8px;

        .switch-item {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 90px;
          height: 26px;
          color: #8f8f8f;

          border-radius: 2px;
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
</style>

<style lang="less">
  .zoom-box-expand.ant-popover {
    padding-top: 4px;
    .ant-popover-content {
      box-shadow: none;
      .ant-popover-arrow {
        display: none;
      }
      .ant-popover-inner {
        border-radius: 4px;
        box-shadow:
          rgba(0, 0, 0, 0.08) 0px 6px 16px -8px,
          rgba(0, 0, 0, 0.05) 0px 9px 28px 0px;
        min-width: 160px;

        .ant-popover-inner-content {
          padding: 0;
          ul {
            padding: 8px;

            li {
              height: 32px;
              line-height: 32px;
              border-radius: 4px;
              padding: 0 8px;
              transition: all 0.3s;
              cursor: pointer;
              display: flex;
              align-items: center;

              > span {
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
              }

              &:not(.selected):hover {
                background-color: #e6e9ef;
                font-weight: 500;
              }
              &.selected {
                color: var(--ant-primary-color);
                font-weight: 500;
              }
              &:not(:last-child) {
                margin-bottom: 10px;
              }
            }
          }
        }
      }
    }
  }
</style>
