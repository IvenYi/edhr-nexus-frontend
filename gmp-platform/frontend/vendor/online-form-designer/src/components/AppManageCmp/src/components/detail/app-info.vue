<template>
  <div class="h-full flex flex-col app-info">
    <a-descriptions
      class="basic-info"
      :label-style="{ color: '#7F8695' }"
      :content-style="{ color: '#333333' }"
      :column="4"
    >
      <a-descriptions-item :label="t('sys.developer.appCenter.appStatus')" v-if="!isBIApp">
        <a-tag
          :style="{
            'border-color': 'var(--ant-' + stateTheme + '-color-deprecated-bg)',
          }"
          :color="stateTheme"
        >
          {{ t('sys.app.status.' + detail?.state) }}
        </a-tag>
      </a-descriptions-item>
      <a-descriptions-item :label="t('sys.developer.appCenter.appIdent')">{{
        detail?.id
      }}</a-descriptions-item>

      <a-descriptions-item :label="t('sys.developer.appCenter.appType')">
        {{ Ch_AppClassify[detail?.type!] }}
      </a-descriptions-item>

      <a-descriptions-item :label="t('sys.developer.appCenter.client')">
        <div class="h100%" style="display: flex; align-items: center">
          <span class="classify classify-web">Web</span>

          <span class="classify classify-mobile ml-4px" v-if="detail?.mobileEnabled">Mobile</span>
        </div>
      </a-descriptions-item>
      <a-descriptions-item
        v-if="detail?.releasedStatus"
        :label="t('sys.developer.appCenter.appEntryDomain')"
        :span="2"
        class="domain-name-wrapper"
      >
        <a class="domain-name" @click="toDomainName" :title="domainName">{{ domainName }}</a>
        <a style="width: 106px; margin-left: 8px" @click="copy">
          {{ t('sys.developer.appCenter.copyUrl') }}
        </a>
      </a-descriptions-item>

      <a-descriptions-item :label="t('sys.createUser')" class="username-wrapper">
        <div class="w100% ell">
          {{ detail?.createUserName }}
        </div>
      </a-descriptions-item>

      <a-descriptions-item :label="t('sys.createTime')">
        {{ detail?.createTime }}
      </a-descriptions-item>

      <a-descriptions-item :label="t('sys.modifier')" class="username-wrapper">
        <div class="w100% ell">
          {{ detail?.modifyUserName }}
        </div>
      </a-descriptions-item>
      <a-descriptions-item :label="t('sys.modifyTime')">
        {{ detail?.modifyTime }}
      </a-descriptions-item>
      <a-descriptions-item
        v-if="detail?.sourceType === SourceTypeEnum.IMPORT"
        :label="t('sys.developer.appCenter.branch')"
      >
        {{ detail?.seq }}
      </a-descriptions-item>
      <a-descriptions-item :label="t('sys.developer.appCenter.description')" :span="2">
        <span class="desc" :title="detail?.description">{{ detail?.description }}</span>
      </a-descriptions-item>
    </a-descriptions>
  </div>
</template>

<script setup lang="ts" name="app-info">
  import { onMounted, computed, unref, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { AppResponse } from '/@/apis/gct-platform/model/index';
  import { SourceTypeEnum, Ch_AppClassify, AppStatusOption } from '../../constant/interface';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { useMessage } from '/@/hooks/web/useMessage';

  interface Props {
    /** 应用详情信息 */
    detail?: AppResponse;
  }

  const props = defineProps<Props>();

  const isBIApp = computed(() => {
    return props.detail?.type === 'BI';
  });

  const { t } = useI18n();

  const domainName = ref();

  const { createMessage } = useMessage();

  const stateTheme = computed(() => {
    return AppStatusOption[props.detail?.state as string]?.tag ?? 'error';
  });

  const copy = () => {
    const { isSuccessRef } = useCopyToClipboard(domainName.value);
    unref(isSuccessRef) && createMessage.success(t('sys.copySuccess'));
  };

  onMounted(async () => {
    domainName.value = `${location.origin}/web-single/${props.detail?.id}#/login`;
    console.log('detail=====>', props.detail);
  });
  const toDomainName = () => {
    window.open(domainName.value, '_blank');
  };
</script>
<style lang="scss" scoped>
  .app-info {
    padding: 20px 16px;

    .classify {
      padding: 2px 4px;
      border-radius: 2px;
      border-color: transparent;
      font-size: 10px;
      font-weight: 400;
      line-height: 14px;

      &-mobile {
        background: #deecf9;
        color: #37a4e0;
      }

      &-web {
        margin-left: 8px;
        background: #f0e8fd;
        color: #a170f7;
      }
    }
  }

  .domain-name {
    width: calc(100% - 106px);
    overflow: hidden; /* 确保超出容器的文本被裁剪 */
    text-overflow: ellipsis; /* 使用省略号表示文本超出 */
    white-space: nowrap; /* 确保文本在一行内显示 */
  }

  :deep(.ant-descriptions-item.domain-name-wrapper) {
    .ant-descriptions-item-label {
      width: 100px;
    }

    .ant-descriptions-item-content {
      width: calc(100% - 100px);
    }
  }

  :deep(.ant-descriptions-item.username-wrapper) {
    .ant-descriptions-item-label {
      width: 56px;
    }

    .ant-descriptions-item-content {
      width: calc(100% - 56px);
    }
  }
</style>
