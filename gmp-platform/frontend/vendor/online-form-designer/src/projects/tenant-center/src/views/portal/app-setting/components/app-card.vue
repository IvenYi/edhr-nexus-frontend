<template>
  <div class="card-item">
    <div
      v-if="false"
      class="publish"
      :style="{
        '--status-color': getStatuscolor(data.state),
        '--bg-color': getBgcolor(data.state),
      }"
    >
      {{ t(getStatusText(data.state)) }}
    </div>
    <div class="card-header">
      <div
        class="card-header-img"
        :class="{
          [`card-header-img-${data.suiteKey}`]: data.suiteKey,
          [`card-header-img-${data.type}`]: data.type,
        }"
      >
        <template v-if="data.logoType === LogoTypeEnum.Icon">
          <div
            class="logo-icon"
            :style="{
              '--logo-background': data.logoBgColor,
            }"
          >
            <IconNext :value="data.logo" :size="28" :color="data.logoColor" />
          </div>
        </template>
        <template v-else-if="data.logoType === LogoTypeEnum.Image">
          <img :src="transformUrl(data.logoThumbnail)" alt="" />
        </template>
      </div>
      <div class="card-header-right">
        <div class="card-header-title flex-grow min-w-0">
          <div class="title pr-4 truncate" :title="data.name">{{ data.name }}</div>
          <div class="classify-area mt8px">
            <span class="classify classify-web ml0">Web</span>
            <span class="classify classify-mobile ml-4px" v-if="data.mobileEnabled">Mobile</span>
          </div>
        </div>
        <a-button v-if="props.type === AppTypeEnum.PRO" @click="handleSetting">
          <setting-outlined />{{ t('sys.setting') }}
        </a-button>
      </div>
    </div>

    <div class="card-footer">
      <div class="card-btn-group w100%">
        <div class="card-description color-[#8f8f8f]" :title="data.description">
          {{ t('sys.developer.appCenter.appIdent') }}:
          <span class="color-[#474747]">{{ data.id }}</span>
        </div>
        <div class="card-description ell w100% color-[#474747]" :title="data.description">
          {{ data.description || $t('sys.noDescription') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { inject } from 'vue';
  import type { AppResponse } from '/@/apis/gct-platform/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { IconNext } from '/@/components/Icon';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { AppStatusEnum, LogoTypeEnum } from '/@/components/AppManageCmp/src/constant/interface';
  import { AppTypeEnum } from '../types';

  const { t } = useI18n();
  const props = withDefaults(
    defineProps<{
      data: AppResponse;
      type: AppTypeEnum;
    }>(),
    {},
  );
  const handleToDetail = inject('handleToDetail') as any;
  // 跳转页面
  const handleSetting = () => {
    handleToDetail(props.data.id);
  };

  const getStatuscolor = (ststus) => {
    if (ststus === AppStatusEnum.UNHEALTHY) {
      return '#f54547';
    } else if (ststus === AppStatusEnum.PROGRAM_LOCKED) {
      return '#3168EC';
    } else if (ststus === AppStatusEnum.HEALTHY) {
      return '#309C41';
    } else if (ststus === AppStatusEnum.MANUAL_LOCKED) {
      return '#384356';
    } else if (ststus === AppStatusEnum.INACTIVE) {
      return '#8F8F8F';
    }
  };
  const getStatusText = (ststus) => {
    if (ststus === AppStatusEnum.UNHEALTHY) {
      return 'sys.developer.appCenter.publishFail';
    } else if (ststus === AppStatusEnum.PROGRAM_LOCKED) {
      return 'sys.developer.appCenter.publishing';
    } else if (ststus === AppStatusEnum.HEALTHY) {
      return 'sys.developer.appCenter.enabled';
    } else if (ststus === AppStatusEnum.MANUAL_LOCKED) {
      return 'sys.developer.appCenter.notEnabled';
    } else if (ststus === AppStatusEnum.INACTIVE) {
      return 'sys.app.status.INACTIVE';
    }
  };
  const getBgcolor = (ststus) => {
    if (ststus === AppStatusEnum.UNHEALTHY) {
      return '#FEECEC';
    } else if (ststus === AppStatusEnum.PROGRAM_LOCKED) {
      return '#DEECF9';
    } else if (ststus === AppStatusEnum.HEALTHY) {
      return '#DEF8E2';
    } else if (ststus === AppStatusEnum.MANUAL_LOCKED) {
      return '#E9E9E9';
    } else if (ststus === AppStatusEnum.INACTIVE) {
      return '#EAEDF1';
    }
  };
</script>

<style lang="less" scoped>
  .card-item {
    position: relative;
    min-height: 163px;
    padding: 16px 0;
    border: 1px solid #e0e0e0;
    // box-shadow: 0px 2px 6px 2px rgba(0, 0, 0, 0.04);
    border-radius: 4px;
    background-color: #fff;

    .publish {
      position: absolute;
      top: 0;
      right: 0;
      padding: 3px 6px;
      border-radius: 0 2px;
      background: var(--bg-color);
      color: var(--status-color);
      font-size: 10px;
    }

    &.is-click {
      cursor: pointer;
    }

    &:hover {
      box-shadow: 0 4px 12px 2px rgb(0 0 0 / 6%);
    }

    .card-status {
      position: absolute;
      top: 0;
      right: 0;
      padding: 2px 6px;
      border-radius: 2px;
      background: rgb(51 112 255 / 10%);
      color: #3370ff;
      font-size: 14px;
      line-height: 18px;
    }

    .card-status-extra {
      display: flex;
      align-items: center;
      font-size: 12px;
      line-height: 15px;

      .status-flag {
        content: '';
        width: 6px;
        height: 6px;
        margin-right: 4px;
        border-radius: 50%;
        background-color: transparent;
      }

      .status-title {
        display: inline-block;
      }

      &.status-loading {
        padding: 0;
        color: var(--ant-primary-color);
      }

      &.status-error {
        color: #8f8f8f;

        .status-flag {
          background-color: #8f8f8f;
        }
      }

      &.status-ok {
        color: #309c41;

        .status-flag {
          background-color: #309c41;
        }
      }

      &.status-publishing {
        color: #3168ec;

        .status-flag {
          background-color: #3168ec;
        }
      }

      &.status-publishFail {
        color: #f54547;

        .status-flag {
          background-color: #f54547;
        }
      }

      &.status-lock {
        color: #384356;

        .status-flag {
          background-color: #384356;
        }
      }
    }

    .card-status-recycle {
      display: flex;
      position: absolute;
      top: 0;
      right: 0;
      align-items: center;
      justify-content: center;
      padding: 2px 8px 2px 6px;
      border-radius: 2px 12px 2px 8px;
      font-size: 14px;
      line-height: 18px;

      .recycle-title {
        display: inline-block;
        line-height: 18px;
      }

      &.status-error {
        background: rgb(255 77 79 / 8%);
        color: #ff4d4f;
      }

      &.status-ok {
        background: rgb(51 112 255 / 8%);
        color: #3370ff;
      }
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      padding: 0 16px;

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

      &-right {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: calc(100% - 85px);
      }

      &-title {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 68px;

        .title {
          color: #000;
          font-family: 'Source Sans Pro', 'Source Sans Pro';
          font-size: 14px;
          font-weight: 500;
          line-height: 16px;
          text-wrap: nowrap;
          -webkit-box-orient: vertical;
        }

        .classify-area {
          line-height: 14px;

          .classify {
            padding: 2px 4px;
            border-radius: 2px;
            border-color: transparent;
            font-size: 10px;
            font-weight: 400;

            &-mobile {
              background: #deecf9;
              color: #37a4e0;
            }

            &-web {
              background: #f0e8fd;
              color: #a170f7;
            }
          }
        }
      }
    }

    .card-description {
      margin-top: 2px;
      overflow: hidden;
      font-size: 12px;
      font-weight: 400;
      text-overflow: ellipsis;
      text-wrap: nowrap;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 16px;
      padding: 12px 16px 0;
      border-top: 1px solid #f0f0f0;

      .card-more {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 2px;
        color: #bfbfbf;
        font-size: 14px;
        cursor: pointer;

        &:hover {
          background: #f5f5f5;
          color: var(--ant-primary-color);
        }

        &.is-highlight {
          background: #f5f5f5;
          color: var(--ant-primary-color);
        }
      }
    }
  }

  &-dropdown {
    .ant-dropdown-menu-item {
      min-width: 120px;
      margin-bottom: 0;
      padding: 6px 12px;
      transition: all 0.3s;
      font-size: 14px;
      line-height: 22px;
      cursor: pointer;

      &:hover {
        background-color: #f5f5f5;
        color: var(--ant-primary-color);
      }

      &.delete-style {
        color: #ff4d4f;

        &:hover {
          background: rgb(255 77 79 / 8%);
        }
      }

      &.opacity-style {
        display: none;
      }
    }
  }
</style>
