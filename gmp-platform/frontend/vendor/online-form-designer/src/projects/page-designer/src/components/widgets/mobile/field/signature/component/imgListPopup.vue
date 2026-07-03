<template>
  <van-popup
    v-model:show="show"
    :closeable="true"
    round
    position="bottom"
    :style="{ height: '80%', overflow: 'hidden' }"
  >
    <div class="ks-column h100%">
      <div class="px-12px pt12px pb16px title gct-text-overflow">{{
        t('sys.pageDesigner.fieldCmp.electronic_signature')
      }}</div>
      <div class="ks-col ks-row img-wrap">
        <div
          v-for="(e, i) in imgList"
          :key="i"
          class="img-item"
          :class="{ horizontal: displayStyle === 'horizontal' }"
        >
          <van-image
            @click.native="onPreviewByIndex(i, e)"
            width="120"
            height="68"
            :src="e.url"
            class="mr-8px"
          />
          <div
            v-if="signatureType !== SignatureTypeEnum.SIGNATURE_ONLY && e.time"
            class="text-center text-[12px]"
          >
            {{
              signatureType === SignatureTypeEnum.SIGNATURE_DATE
                ? dayjs(e.time).format('YYYY-MM-DD')
                : dayjs(e.time).format('YYYY-MM-DD HH:mm')
            }}
          </div>
        </div>
      </div>
    </div>
  </van-popup>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { SignatureTypeEnum } from '/@/projects/page-designer/src/enum';
  import dayjs from 'dayjs';
  import { useI18n } from '@mobile/utils/useI18n';
  import { createPreview } from './showSignaturePreview/index';

  const props = defineProps<{
    imgList: any[];
    signatureType: string | undefined;
    displayStyle: string | undefined;
  }>();
  const { openPreview } = createPreview();
  const { t } = useI18n();
  const show = ref(false);

  const open = () => {
    show.value = true;
  };
  const onPreviewByIndex = (index, item) => {
    openPreview({
      images: props.imgList.map((e) => e.url),
      startPosition: index,
      enableSignPassword: item.enableSignPassword,
      username: item.username,
      dateTime: dayjs(item.dateTime).format('YYYY-MM-DD HH:mm:ss'),
    });
  };
  defineExpose({ open });
</script>
<style lang="less" scoped>
  :deep(.van-popup__close-icon) {
    position: absolute;
    right: 12px;
    color: #c3c3c3;
    font-size: 16px;
  }

  .title {
    padding-right: 32px;
    border-bottom: 1px solid var(--van-cell-border-color);
    color: #212528;
    font-size: 16px;
  }

  .gct-text-overflow {
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: nowrap;
  }

  .img-wrap {
    flex-wrap: wrap;
    align-content: flex-start;
    align-items: flex-start;
    padding: 16px 12px;
    overflow-y: auto;
    column-gap: 12px;
    row-gap: 12px;
  }

  .horizontal {
    display: flex;
    align-items: center;
  }
</style>
