<template>
  <div class="detail-header-area">
    <div class="detail-header">
      <div class="flex">
        <div class="app-logo">
          <template v-if="detail?.logoType === LogoTypeEnum.Icon">
            <div
              class="logo-icon"
              :style="{
                '--logo-background': detail.logoBgColor,
              }"
            >
              <IconNext :value="detail?.logo" :size="12" :color="detail.logoColor" />
            </div>
          </template>
          <template v-else-if="detail?.logoType === LogoTypeEnum.Image">
            <img :src="transformUrl(detail?.logoThumbnail)" alt="" />
          </template>
        </div>
        <span class="title">{{ detail?.name }}</span>
      </div>
      <a-button
        size="small"
        type="text"
        ghost
        :style="{ height: '28px', border: 'none' }"
        @click="handleClose"
      >
        <template #icon>
          <CloseOutlined />
        </template>
      </a-button>
    </div>
    <div class="detail-container">
      <div class="basic-info">
        <div class="basic-info-left">
          <div
            class="basic-info-left-img"
            :class="{
              [`basic-info-left-img-${detail?.suiteKey}`]: detail?.suiteKey,
              [`basic-info-left-img-${detail?.type}`]: detail?.type,
            }"
          >
            <template v-if="detail?.logoType === LogoTypeEnum.Icon">
              <div
                class="logo-icon"
                :style="{
                  '--logo-background': detail?.logoBgColor,
                }"
              >
                <IconNext :value="detail?.logo" :size="28" :color="detail?.logoColor" />
              </div>
            </template>
            <template v-else-if="detail?.logoType === LogoTypeEnum.Image">
              <img :src="transformUrl(detail?.logoThumbnail)" alt="" />
            </template>
          </div>
          <div class="basic-info-left-item">
            <div class="title">{{ detail?.name }}</div>
            <div class="version" v-if="!isBIApp">
              {{ t('sys.developer.appCenter.nowVersion') + '：' + detail?.appVersion }}
            </div>
          </div>
        </div>
        <div class="basic-info-right">
          <!-- <a-button
            style="margin-left: 16px"
            @click="handleMenuClick(ButtonTypeEnum.Preview)"
            v-if="detail?.suiteKey === 'eDHR'"
          >
            {{ t('sys.developer.appCenter.preview') }}
          </a-button> -->
          <!-- <template v-else> -->
          <template v-if="![AppStatusEnum.INACTIVE].includes(detail?.state)">
            <a-dropdown-button @click="handleEditApp" v-if="!isBIApp">
              {{ t('sys.developer.appCenter.editAppInfo') }}
              <template #overlay>
                <a-menu @click="handleMenuClick">
                  <a-menu-item :key="ButtonTypeEnum.Preview">
                    {{ t('sys.developer.appCenter.preview') }}
                  </a-menu-item>
                  <a-menu-item
                    :key="ButtonTypeEnum.Lock"
                    v-if="AppStatusEnum.HEALTHY === detail?.state"
                  >
                    {{ t('sys.disabled') }}
                  </a-menu-item>
                  <a-menu-item :key="ButtonTypeEnum.Unlock" v-else>
                    {{ t('sys.enabled') }}
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown-button>
            <a-button v-else style="margin-left: 16px" @click="handleEditApp">
              {{ t('sys.developer.appCenter.editAppInfo') }}
            </a-button>
          </template>

          <a-button
            type="primary"
            v-if="isShowDesignBtn"
            style="margin-left: 16px"
            @click="handleDesignApp"
          >
            {{ t('sys.design') }}
          </a-button>
          <!-- </template> -->
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts" name="detail-header">
  import { computed } from 'vue';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { IconNext } from '/@/components/Icon';
  import { message } from 'ant-design-vue';
  import { LogoTypeEnum, AppStatusEnum, ButtonTypeEnum } from '../../constant/interface';
  import { useEmitter } from '../../hooks/useEmitter';
  import type { AppResponse } from '/@/apis/gct-platform/model/index';
  import {
    getAppGetCurrentBranchByAppId,
    putAppDisableById,
    putAppEnableById,
  } from '/@/apis/gct-platform/AppController';
  import { openWindow, genUrl } from '/@/utils';
  import { usePreview } from '/@/hooks/develop/usePreview';

  const { goPreview } = usePreview();
  const { t } = useI18n();
  const { emitter, EmitterEnum } = useEmitter();

  const emit = defineEmits(['onClose']);

  interface Props {
    /** 应用详情信息 */
    detail?: AppResponse;
    /** 发布版本 */
    version?: string;
    /** 是否显示编辑按钮 */
    isShowEditBtn?: boolean;
    /** 是否显示设计按钮 */
    isShowDesignBtn?: boolean;
  }

  const props = defineProps<Props>();

  const isBIApp = computed(() => {
    return props.detail?.type === 'BI';
  });

  const handleDesignApp = () => {
    const { id } = props.detail!;
    if (id) {
      openWindow(
        genUrl(
          `${location.origin}${
            import.meta.env.VITE_PATHNAME_APP_DESIGNER
          }#/app-design/model-designer`,
          {
            aid: id,
          },
        ),
        {
          target: '_blank',
        },
      );
    }
  };

  const handleEditApp = () => {
    emitter.emit(EmitterEnum.on_edit_app, { id: props.detail?.id, type: props.detail?.type });
  };

  const handleClose = () => {
    emit('onClose');
  };

  const handleMenuClick = async (e) => {
    const { id } = props.detail!;

    switch (e.key) {
      case ButtonTypeEnum.Lock:
        await putAppDisableById({ id: id ?? '' });
        message.success(t('sys.developer.appCenter.lockSuccess'));
        emitter.emit(EmitterEnum.on_refresh_app_detail, { id: id ?? '' });
        emitter.emit(EmitterEnum.on_refresh_app_list);
        break;
      case ButtonTypeEnum.Unlock:
        await putAppEnableById({ id: id ?? '' });
        message.success(t('sys.developer.appCenter.unLockSuccess'));
        emitter.emit(EmitterEnum.on_refresh_app_detail, { id: id ?? '' });
        emitter.emit(EmitterEnum.on_refresh_app_list);
        break;
      case ButtonTypeEnum.Preview:
        const res = await getAppGetCurrentBranchByAppId({
          appId: id ?? '',
        });
        if (res?.id) {
          goPreview({
            aid: id ?? '',
            bid: res.id,
          });
        }
        break;
    }
  };
</script>
<style scoped lang="less">
  .detail-header-area {
    position: relative;
    border-radius: 2px;
    background-color: #fff;

    .detail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px;
      border-bottom: 1px solid #eaeaea;

      .app-logo {
        width: 20px;
        height: 20px;
        margin-right: 4px;
        border-radius: 4px;

        > img {
          width: 100%;
          height: auto;
        }

        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 4px;
          background-color: var(--logo-background, #3370ff);
          color: #fff;
        }
      }

      .title {
        color: #000;
        font-size: 16px;
        font-weight: 500;
        line-height: 20px;
      }
    }

    .detail-container {
      margin-bottom: 16px;
      padding: 20px 20px 0;
      background: #fff;

      .basic-info {
        display: flex;
        justify-content: space-between;
        padding: 20px;
        border-radius: 4px;
        background: #f7f8fa;

        &-left {
          display: flex;

          &-img {
            display: flex;
            position: relative;
            flex-shrink: 0;
            align-items: center;
            justify-content: center;
            width: 68px;
            height: 68px;
            margin-right: 16px;
            overflow: hidden;
            border: 1px solid #e8e8e8;
            border-radius: 4px;
            background-color: #fff;

            > img {
              width: 100%;
              height: auto;
            }

            .logo-icon {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 58px;
              height: 58px;
              border-radius: 4px;
              background-color: var(--logo-background, #3370ff);
              color: #fff;
            }

            &::after {
              content: '平台';
              display: block;
              position: absolute;
              top: 6px;
              right: -20px;
              width: 68px;
              transform: rotate(45deg);
              border: 1px solid #fff;
              background: #fff;
              box-shadow: 0 4px 4px 0 rgb(0 0 0 / 16%);
              color: #3168ec;
              font-size: 10px;
              text-align: center;
            }

            &-eDHR {
              &::after {
                content: 'eDHR';
                background: #f9f2ff;
                color: #742fb2;
              }
            }

            &-MEDPRO {
              &::after {
                content: 'MedPro';
                background: #dae9f7;
                color: #026ac8;
              }
            }

            &-BI {
              &::after {
                content: 'BI';
                background: #fff7f2;
                color: #ff8c4b;
              }
            }
          }

          &-item {
            display: flex;
            flex-direction: column;
            justify-content: center;

            .title {
              margin-bottom: 8px;
              color: #000;
              font-size: 16px;
            }

            .version {
              color: #474747;
              font-size: 12px;
            }
          }
        }

        &-right {
          display: flex;
          align-items: center;
        }
      }
    }
  }
</style>
