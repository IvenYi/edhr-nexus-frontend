<template>
  <div :class="[ns.b()]">
    <a-image-preview-group>
      <div :class="ns.b('item')" v-for="(item, index) in items" :key="index">
        <a-image
          :class="ns.be('item', 'img')"
          :src="getPreviewUrl(item.url)"
          :fallback="imageError"
        >
          <template #previewMask>
            <zoom-in-outlined />
            <delete-outlined
              :class="'ml10px'"
              @click.stop="onDelete(item)"
              v-if="!forbiddenRemove"
            />
          </template>
        </a-image>
        <div
          :class="ns.be('item', 'time')"
          v-if="signatureType !== SignatureTypeEnum.SIGNATURE_ONLY && item.time"
          class="text-center mt4px text-[12px]"
        >
          {{
            signatureType === SignatureTypeEnum.SIGNATURE_DATE
              ? dayjs(item.time).format('YYYY-MM-DD')
              : dayjs(item.time).format('YYYY-MM-DD HH:mm')
          }}
        </div>
      </div>
    </a-image-preview-group>
  </div>
</template>

<script lang="ts" setup name="sign-preview">
  import { useNamespace } from '@gct/runtime';
  import imageError from '/@page-designer/assets/image-error.svg';
  import { SignInfo } from '../types';
  import { SignatureTypeEnum } from '../constant';
  import dayjs from 'dayjs';
  import { getPreviewUrl as defaultFn } from '../logic';

  const ns = useNamespace('sign-preview');

  withDefaults(
    defineProps<{
      items?: SignInfo[];
      signatureType?: SignatureTypeEnum;
      getPreviewUrl?: (url: string) => string;
      forbiddenRemove: boolean;
    }>(),
    {
      getPreviewUrl: defaultFn,
      forbiddenRemove: false,
      signatureType: SignatureTypeEnum.SIGNATURE_ONLY,
    },
  );

  const emit = defineEmits<{
    (e: 'remove', value: SignInfo): void;
  }>();

  const onDelete = (val: SignInfo) => {
    emit('remove', val);
  };
</script>

<style lang="scss" scoped>
  $sign-preview: (
    height: auto,
    img-width: 120px,
    img-height: 68px,
  );

  @include b(sign-preview) {
    @include set-component-css-var(sign-preview, $sign-preview);
    height: getCssVar(sign-preview, height);
    display: flex;
    column-gap: 8px;
    row-gap: 8px;

    :deep(.ant-image:not(.ant-image-error)) {
      border: 1px dashed getCssVar(input-border-color);
      box-sizing: border-box;
      border-radius: 2px;
    }
    :deep(.ant-image) {
      width: getCssVar(sign-preview, img-width);
      height: getCssVar(sign-preview, img-height);
    }
  }

  @include b(sign-preview-item) {
    @include e(img) {
      width: 120px;
      height: 68px;
    }
  }
</style>
