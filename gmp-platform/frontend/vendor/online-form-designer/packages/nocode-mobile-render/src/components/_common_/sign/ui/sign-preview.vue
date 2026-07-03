<template>
  <div :class="['sign-preview']">
    <div
      class="sign-preview-item"
      :class="{ 'is-horizontal': isHorizontal }"
      v-for="(item, index) in items"
      :key="index"
    >
      <van-image
        class="sign-preview-item-img"
        :src="getPreviewUrl(item.url,item.username)"
        :error-icon="imageError"
        @click.stop="onPreview(index)"
      >
        <van-icon
          v-if="!forbiddenRemove"
          name="clear"
          class="icon-yichu"
          @click.stop="onDelete(item)"
        />
      </van-image>
      <div
        v-if="
          shouldShowDate && signTimeType === SignatureTimeTypeEnum.FOLLOW_SIGNATURE && item.time
        "
        class="sign-preview-item-time text-center mt4px text-[12px]"
      >
        {{ formattedDate(item.time) }}
      </div>
    </div>
    <slot name="addSignBtn"></slot>
  </div>
</template>

<script lang="ts" setup name="sign-preview">
  import { computed } from 'vue';
  import { showImagePreview } from 'vant';
  import dayjs from 'dayjs';
  import { SignatureTimeTypeEnum } from '@gct/nocode-base';
  import imageError from '/@page-designer/assets/image-error.svg';
  import { SignatureTypeEnum, SignShowTypeEnum } from '../constant';
  import { getPreviewUrl as defaultFn } from '../logic';
  import type { SignInfo } from '../types';

  const props = withDefaults(
    defineProps<{
      items?: SignInfo[];
      signatureType?: SignatureTypeEnum;
      signTimeType?: SignatureTimeTypeEnum;
      signShowType: SignShowTypeEnum;
      getPreviewUrl?: (url: string,name?:string) => string;
      forbiddenRemove: boolean;
    }>(),
    {
      getPreviewUrl: defaultFn,
      forbiddenRemove: false,
      signatureType: SignatureTypeEnum.SIGNATURE_ONLY,
      signTimeType: SignatureTimeTypeEnum.FOLLOW_SIGNATURE,
      signShowType: SignShowTypeEnum.VERTICAL,
    },
  );

  const emit = defineEmits<{
    (e: 'remove', value: SignInfo): void;
  }>();

  const shouldShowDate = computed(() => props.signatureType !== SignatureTypeEnum.SIGNATURE_ONLY);

  const isHorizontal = computed(() => {
    return (
      props.signShowType === SignShowTypeEnum.HORIZONTAL &&
      props.signatureType !== SignatureTypeEnum.SIGNATURE_ONLY
    );
  });

  const formattedDate = (time: any) => {
    const format =
      props.signatureType === SignatureTypeEnum.SIGNATURE_DATE ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm';
    return dayjs(time).format(format);
  };

  const onPreview = (index: number) => {
    showImagePreview({
      images: props.items?.map((e) => props.getPreviewUrl(e.url,e.username)) || [],
      startPosition: index,
      overlayStyle: {
        backgroundColor: 'rgba(0,0,0, .45)',
      },
    });
  };

  const onDelete = (val: SignInfo) => {
    emit('remove', val);
  };
</script>

<style lang="less" scoped>
  .sign-preview {
    --sign-preview-img-width: 120px;
    --sign-preview-img-height: 68px;
    height: getCssVar(sign-preview, height);
    display: flex;
    flex-wrap: wrap;
    column-gap: 8px;
    row-gap: 8px;
    overflow-y: auto;
    &::-webkit-scrollbar {
      display: block;
      width: 3px;
    }

    :deep(.van-image) {
      width: 100px;
      height: 57px;
      border: 1px dashed #e8ebf0;
      border-radius: 2px;
      display: flex;
      .van-icon__image {
        width: 28px;
        height: 26px;
      }
    }
  }

  .sign-preview-item {
    position: relative;

    &.is-horizontal {
      display: flex;
      align-items: center;
      .sign-preview-item-time {
        line-height: 18px;
        margin-top: 0px;
        margin-left: 4px;
      }
    }
    .sign-preview-item-img {
      width: var(--sign-preview-img-width);
      height: var(--sign-preview-img-height);
    }

    .icon-yichu {
      position: absolute;
      z-index: 9;
      top: 2px;
      right: 5px;
      color: rgb(0 0 0 / 64%);
      font-size: 16px;
    }

    .sign-preview-item-time {
      line-height: 18px;
    }
  }
</style>
