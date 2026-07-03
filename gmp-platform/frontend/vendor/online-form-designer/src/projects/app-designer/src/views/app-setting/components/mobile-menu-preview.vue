<template>
  <div class="mobile-menu-preview-wrapper" id="mobilePreviewWrap">
    <!-- mobilePreviewParent 解决缩放之后仍占原尺寸空间的问题 -->
    <div id="mobilePreviewParent">
      <div class="mobile-menu-preview" id="mobilePreview">
        <div class="mobile-menu-preview-content" style="height: 100%">
          <div class="app-name">
            <i class="iconfont icon-a-Leftarrow"></i>
            {{ appInfoStore.appInfo.name }}
          </div>
          <div class="menu-area">
            <div class="menu-item" v-for="(item, index) of dataSource" :key="item.id">
              <a-collapse v-model:activeKey="activeKey" ghost expandIconPosition="right">
                <a-collapse-panel
                  :key="index"
                  :header="item.name"
                  :showArrow="!!item.children?.length"
                >
                  <div class="menu-icons">
                    <div class="menu-icon-item" v-for="child of item.children" :key="child.id">
                      <div class="icon" :style="{ backgroundColor: child.color }">
                        <IconNext
                          :size="20"
                          :value="child.logo"
                          :style="{
                            verticalAlign: 'bottom',
                            backgroundColor: child.color,
                            '--box-size': '44px',
                          }"
                        />
                      </div>
                      <div class="icon-name">{{ child.name }}</div>
                    </div>
                  </div>
                </a-collapse-panel>
              </a-collapse>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="preview-tip">{{ t('sys.appDesigner.mobilePreviewTip') }}</div>
  </div>
</template>

<script lang="ts" setup name="mobile-menu-preview">
  import { ref, onMounted } from 'vue';
  import { IconNext } from '/@/components/Icon';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { MenuConfigResponse } from '/@/apis/gct-apaas/model';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const { t } = useI18n();

  interface Props {
    dataSource: MenuConfigResponse[];
  }

  defineProps<Props>();

  const appInfoStore = useAppInfoStore();
  const activeKey = ref('0');

  onMounted(() => {
    calculatedMobileSize();
  });

  function calculatedMobileSize() {
    const mobileWrap = document.getElementById('mobilePreviewWrap') as HTMLElement;
    const mobileDiv = document.getElementById('mobilePreview') as HTMLElement;
    const mobileP = document.getElementById('mobilePreviewParent') as HTMLElement;
    if (mobileDiv) {
      let h = mobileWrap.clientHeight - 32;
      if (h < 480) h = 480;
      if (h > 812) h = 812;
      const rate = h / 812;
      mobileDiv.style.transform = `scale(${rate})`;
      mobileDiv.style.transformOrigin = 'left top';
      mobileP.style.height = h + 32 + 'px';
    }
  }
</script>

<style lang="less" scoped>
  .mobile-menu-preview-wrapper {
    height: 100%;
    overflow: hidden;

    #mobilePreviewParent {
      margin: 0 auto;
      overflow: hidden;
    }

    .preview-tip {
      position: absolute;
      right: 12px;
      bottom: 0;
      color: #ddd;
      font-size: 12px;
    }

    .mobile-menu-preview {
      display: flex;
      width: 375px;
      height: 812px;
      margin: 16px auto;
      padding: 0;
      border-radius: 24px;
      background: #fff;
      box-shadow: 0 0 16px 2px rgb(0 0 0 / 8%);

      .mobile-menu-preview-content {
        display: flex;
        position: relative;
        flex: 1;
        flex-direction: column;
        padding-top: 16px;
        padding-bottom: 16px;
        overflow: hidden;

        .app-name {
          position: relative;
          padding-bottom: 20px;
          padding-left: 32px;
          color: #212528;
          font-size: 16px;
          font-weight: 500;
          text-align: left;

          .icon-a-Leftarrow {
            position: absolute;
            left: 0;
            padding-left: 8px;
          }
        }

        .menu-area {
          flex: 1;
          padding-right: 16px;
          padding-left: 16px;
          overflow: auto;
        }

        .menu-item {
          :deep(.ant-collapse-header) {
            padding: 16px 0;
            font-weight: 500;
          }

          :deep(
              .ant-collapse-icon-position-right
                > .ant-collapse-item
                > .ant-collapse-header
                .ant-collapse-arrow
            ) {
            right: 0;
          }

          :deep(.ant-collapse-content-box) {
            padding: 0;
            // margin-bottom: 12px;
          }

          :deep(.ant-collapse-arrow) {
            width: 18px;
            height: 18px;
            border-radius: 11px;
            background-color: @gct-table-header-bgcolor;
          }

          :deep(.ant-collapse > .ant-collapse-item > .ant-collapse-header .ant-collapse-arrow svg) {
            position: relative;
            top: 4px;
          }

          .menu-title {
            padding-bottom: 14px;
            color: #333;
            font-size: 16px;
            font-weight: 500;
            line-height: 22px;
          }

          .menu-icons {
            display: flex;
            flex-wrap: wrap;
            align-items: stretch;
            // row-gap: 12px;
            column-gap: 13px;

            .menu-icon-item {
              display: flex;
              flex-basis: calc(25% - 13px);
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              margin-bottom: 12px;

              .icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 44px;
                height: 44px;
                border-radius: 8px;
              }

              .icon-name {
                display: -webkit-box;
                margin-top: 12px;
                overflow: hidden;
                color: #212528;
                font-size: 12px;
                line-height: 1.2;
                text-align: center;
                text-overflow: ellipsis;
                word-break: break-all;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;

                div {
                  text-align: center;
                  text-overflow: ellipsis;
                  -webkit-line-clamp: 1;
                  -webkit-box-orient: vertical;
                }
              }
            }
          }

          & + .menu-item {
            .ant-collapse-item {
              border-top: 1px solid @gct-input-border-color;
            }
          }
        }
      }
    }
  }
</style>
