<template>
  <a-form-item>
    <template #label v-if="props.widget.props.displayLabelText !== false">
      <div
        :title="props.widget.props.title"
        :class="
          !!labelLayout?.hasLabelWidth && labelLayout?.layout == 'horizontal'
            ? labelLayout?.overLabelDisplay == 'ellipsis'
              ? 'label-ellipsis-i'
              : 'label-wrap'
            : ''
        "
      >
        {{ title }}
      </div>
    </template>
    <div class="gen-image" :style="{ width: !autoWidth ? width + 'px' : '' }">
      <div class="gen-image__con">
        <img
          v-if="autoWidth"
          :src="imageUrl"
          :style="{
            width: '100%',
            maxWidth: widget.props.autoWidth
              ? (widget.props.maxHeight ?? 60) * (widget.props.whRadio ?? 1) + 'px'
              : 'none',
          }"
        />
        <div v-else class="w-full">
          <img :width="width" :height="height" :src="imageUrl" />
        </div>
      </div>
      <div class="gen-image__text" v-show="prompt || auxiliary">
        <p class="prompt">{{ prompt }}</p>
        <p class="auxiliary">{{ auxiliary }}</p>
      </div>
    </div>
  </a-form-item>
</template>

<script setup lang="ts" name="gct-gen-image">
  import { computed, inject, toRefs } from 'vue';
  import { GenImage } from '/@page-designer/types/web';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import imageSrc from '@mobile/assets/image/no-app.png';

  const props = defineProps<{ modelValue?: string; widget: GenImage; rowReadonly?: boolean }>();

  const { labelFont } = useStyle(props.widget);
  const { imgUrl, title, prompt, auxiliary, autoWidth, width, height } = toRefs(props.widget.props);
  const labelLayout = inject('labelLayout');
  const imageUrl = computed(() => {
    if (imgUrl.value) {
      return import.meta.env.VITE_MINIO_PATH + '/' + imgUrl.value;
    } else {
      return imageSrc;
    }
  });
</script>
<style scoped lang="less">
  :deep(.ant-form-item-label) {
    width: v-bind('labelLayout?.width');
    text-align: v-bind('labelFont.textAlign');

    > label {
      color: v-bind('labelFont.color');
      font-size: v-bind('labelFont.fontSize');
      font-style: v-bind('labelFont.fontStyle');
      font-weight: v-bind('labelFont.fontWeight');
      text-decoration-line: v-bind('labelFont.textDecorationLine');
    }

    &:has(div.label-wrap) {
      overflow: visible;
      word-break: break-all;
      white-space: wrap;

      > label {
        align-items: start;
        max-height: none;
        margin-top: 5px;
      }
    }

    .label-ellipsis-i {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .gen-image {
    &__con {
      // background: #fbfbfc;

      .no-data {
        // display: inline-flex;
        // align-items: center;
        // justify-content: center;
        // width: 100%;
        // height: 100%;
      }

      .auto-width {
        width: 100%;
      }
    }

    &__text {
      margin-top: 16px;
      text-align: center;

      & > p {
        margin: 0;
      }

      .prompt {
        font-size: 16px;
        line-height: 24px;
        word-break: break-all;
      }

      .auxiliary {
        color: #797a7d;
        font-size: 14px;
        line-height: 22px;
        word-break: break-all;
      }
    }
  }

  img {
    display: block;
    margin: 0 auto;
    object-fit: contain;
  }
</style>
