<template>
  <div :class="[`${prefixCls}-action-wrap`, !hasBILicense ? 'bi-hidden' : '']">
    <div
      :class="[`${prefixCls}-action-item`, 'has-hover']"
      @click="$emit('create-app', AppClassifyEnum.Pro)"
    >
      <div :class="`${prefixCls}-action-icon`">
        <i class="icon iconfont icon-Rocket"></i>
      </div>
      <div :class="`${prefixCls}-action-tip`">{{ t('sys.developer.appCenter.majorTip') }}</div>
      <div :class="`${prefixCls}-action-title`"
        >{{ t('sys.developer.appCenter.createMajor')
        }}<i class="ml-8px icon iconfont icon-zhankaiqiehuanyingyong"></i
      ></div>
    </div>
    <div
      v-if="hasBILicense"
      :class="[`${prefixCls}-action-item`, 'has-hover']"
      @click="$emit('create-app', AppClassifyEnum.Bi)"
    >
      <div :class="`${prefixCls}-action-icon`">
        <i class="icon iconfont icon-a-shujukanban_data-screen3"></i>
      </div>
      <div :class="`${prefixCls}-action-tip`">{{ t('sys.developer.appCenter.bulletinTip') }}</div>
      <div :class="`${prefixCls}-action-title`"
        >{{ t('sys.developer.appCenter.createBulletin')
        }}<i class="ml-8px icon iconfont icon-zhankaiqiehuanyingyong"></i
      ></div>
    </div>
    <div :class="[`${prefixCls}-action-import`, 'has-hover']">
      <a-upload
        class="w100%"
        accept=".zip"
        :showUploadList="false"
        :beforeUpload="handleBeforeUpload"
        :customRequest="handleCustomRequest"
      >
        <div class="flex items-center">
          <div class="btn-container">
            <a-button type="link">
              {{ t('sys.developer.appCenter.importMajor') }}
            </a-button>

            <div class="sub-title">
              {{ t('sys.importAppTips') }}
            </div>
          </div>
          <img src="@/assets/images/import-app.png" alt="" />
        </div>
      </a-upload>
    </div>
    <div :class="[`${prefixCls}-action-item`, 'ai-show']">
      <div :class="`${prefixCls}-action-icon`">
        <span>
          <i class="icon iconfont icon-AI"></i>
        </span>
      </div>
      <div :class="`${prefixCls}-action-tip`">{{ t('sys.developer.appCenter.AITip') }}</div>
      <div :class="`${prefixCls}-action-title`">{{ t('sys.developer.appCenter.AITitle') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { AppClassifyEnum } from '/@/components/AppManageCmp/src/constant/interface';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { UploadFile, message } from 'ant-design-vue';

  const { t } = useI18n();

  interface Props {
    prefixCls: string;
    hasBILicense: boolean;
  }

  defineProps<Props>();

  const emit = defineEmits(['upload', 'create-app']);

  const handleBeforeUpload = (file: UploadFile) => {
    console.log('file.type', file.type);
    if (file.name.endsWith('.zip')) {
      // if (file.type === 'application/zip') {
      return true;
    } else {
      message.error(`只能上传zip格式文件`);
      return false;
    }
  };

  const handleCustomRequest = async ({ file }) => {
    emit('upload', file);
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-application-manage-cmp';

  .@{prefix-cls}-action-wrap {
    display: grid;
    // grid-template-columns: minmax(0, 1fr) min(365px, calc(100vw / 3));
    grid-template-columns: repeat(4, 1fr);
    // grid-gap: 24px;
    margin-bottom: 16px;
    background-color: #f2f5f8;

    .@{prefix-cls}-action-item,
    .@{prefix-cls}-action-import {
      position: relative;
      width: 100%;
      height: 96px;
      padding: 20px 0 20px 32px;
      border-top: 2px solid #fff;
      border-bottom: 2px solid #fff;

      &:first-child {
        border-left: 2px solid #fff;
        border-radius: 4px 0 0 4px;
      }

      &:last-child {
        border-right: 2px solid #fff;
        border-radius: 0 4px 4px 0;

        &::after {
          background: transparent;
        }
      }

      &.has-hover {
        cursor: pointer;

        &:hover {
          border-radius: 4px;
          border-color: #f6fafd;
          background: #f6fafd;
          box-shadow: 0 0 8px 0 rgb(0 0 0 / 16%);

          &::after {
            background: transparent;
          }
          .@{prefix-cls}-action-title {
            color: var(--ant-primary-color);
          }
          .@{prefix-cls}-action-tip {
            color: #5a5f6b;
          }
          .@{prefix-cls}-action-icon {
            background: linear-gradient(132deg, #307ed2 3%, #026ac8 38%, #014b8e 77%, #2c3344 100%);
          }

          .sub-title {
            color: #5a5f6b;
          }
        }
      }

      &::after {
        content: '';
        position: absolute;
        top: 20px;
        right: 0;
        width: 1px;
        height: 56px;
        background: #e0e3eb;
      }
    }

    .@{prefix-cls}-action-item {
      display: grid;
      grid-template-areas: 'icon tip' 'icon title';
      grid-template-columns: 52px 1fr;
      grid-template-rows: 22px 30px;

      .@{prefix-cls}-action-icon {
        grid-area: icon;
        border-radius: 8px;
        background: #026ac8;
        text-align: center;

        .iconfont {
          color: #fff;
          font-size: 32px;
          line-height: 52px;
        }
      }

      &.ai-show {
        .@{prefix-cls}-action-icon {
          position: relative;
          margin: 2px;
          background: linear-gradient(
            134deg,
            #00d7f3 0%,
            #00ffe1 17%,
            #8ffffc 34%,
            #00e1bf 47%,
            #0090ff 74%
          );

          > span {
            position: absolute;
            top: 6px;
            left: 6px;
            width: 36px;
            height: 36px;
            border-radius: 18px;
            background: #fff;
          }

          .iconfont {
            color: #026ac8;
            line-height: 36px;
          }
        }
      }

      .@{prefix-cls}-action-title {
        grid-area: title;
        padding-left: 12px;
        color: #1a1d23;
        font-family: 'PingFang SC', 'PingFang SC';
        font-size: 16px;
      }

      .@{prefix-cls}-action-tip {
        grid-area: tip;
        padding-left: 12px;
        color: #8b8b8b;
        font-size: 12px;
        font-weight: 400;
        line-height: 22px;
      }
    }

    .@{prefix-cls}-action-import {
      display: flex;
      align-items: center;

      & > span {
        width: 100%;
      }

      .btn-container {
        width: calc(100% - 100px);
        height: 100%;

        .title {
          color: #026ac8;
          font-size: 14px;
          font-weight: 500;
        }

        .sub-title {
          color: #8b8b8b;
          font-size: 12px;
          font-weight: 400;
        }
      }

      img {
        width: 89px;
        height: 84px;
      }
    }
  }

  .bi-hidden {
    grid-template-columns: repeat(3, 1fr);
  }

  :deep(.btn-container .ant-btn) {
    padding-left: 0;
  }

  :deep(.ant-upload.ant-upload-select) {
    width: 100%;
  }
</style>
