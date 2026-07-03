<template>
  <div class="image">
    <van-field
      :label-width="
        !!labelLayout?.hasLabelWidth && labelLayout?.layout?.label == 'left'
          ? labelLayout?.width
          : ''
      "
      v-bind="formAttr"
    >
      <template #label v-if="props.widget.props.displayLabelText !== false">
        <div
          class="w-full"
          :style="labelFont"
          :class="
            !!labelLayout?.hasLabelWidth && labelLayout?.layout?.label === 'left'
              ? labelLayout?.overLabelDisplay == 'ellipsis'
                ? 'label-ellipsis-i'
                : 'label-wrap'
              : ''
          "
        >
          {{ title }}
        </div>
      </template>
      <template #input>
        <div
          class="gen-image"
          :style="{
            width: widget.props.autoWidth ? '100%' : '',
          }"
        >
          <div class="gen-image__con">
            <van-image
              v-show="autoWidth"
              width="100%"
              :src="imageUrl"
              :style="{
                width: '100%',
                maxWidth: widget.props.autoWidth
                  ? (widget.props.maxHeight ?? 60) * (widget.props.whRadio ?? 1) + 'px'
                  : 'none',
              }"
            />
            <div v-show="!autoWidth" class="w-full">
              <van-image :width="width" :height="height" :src="imageUrl" fit="contain" />
            </div>
          </div>
          <div class="gen-image__text" v-show="prompt || auxiliary">
            <p class="prompt">{{ prompt }}</p>
            <p class="auxiliary">{{ auxiliary }}</p>
          </div>
        </div>
      </template>
    </van-field>
  </div>
</template>

<script setup lang="ts" name="gct-gen-image">
  import { computed, inject, toRefs } from 'vue';
  import { GenImage } from '/@page-designer/types/mobile';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import imageSrc from '@mobile/assets/image/no-app.png';

  const props = defineProps<{ modelValue?: string; widget: GenImage; rowReadonly?: boolean }>();
  const { labelFont, contentFont } = useStyle(props.widget);
  const { imgUrl, title, prompt, auxiliary, autoWidth, width, height } = toRefs(props.widget.props);
  const labelLayout = inject('labelLayout');
  const layout: any = inject('form-layout', {});
  const imageUrl = computed(() => {
    if (imgUrl.value) {
      return import.meta.env.VITE_MINIO_PATH + '/' + imgUrl.value;
    } else {
      return imageSrc;
    }
  });
  const formAttr = computed(() => {
    return {
      inputAlign: contentFont.value.textAlign,
    };
  });

  const flexJustify = computed(() => {
    if (contentFont.value?.textAlign) {
      return contentFont.value?.textAlign === 'left'
        ? 'flex-start'
        : contentFont.value?.textAlign === 'center'
          ? 'center'
          : 'flex-end';
    }
    if (layout.value?.inputAlign) {
      return layout.value?.inputAlign === 'left' ? 'flex-start' : 'flex-end';
    }
    return 'flex-start';
  });
</script>
<style scoped lang="less">
  :deep(.van-cell) {
    background: transparent;
    :deep(.app-tag-cell-box.van-cell .van-cell__value) {
      & > div {
        display: inline-block;
      }
    }

    :deep(.van-field__label) {
      min-width: v-bind("!labelLayout?.hasLabelWidth? '30%': 'auto'");
      justify-content: v-bind('labelFont.textAlign');
      color: v-bind('labelFont.color');
      font-size: v-bind('labelFont.fontSize');
      font-style: v-bind('labelFont.fontStyle');
      font-weight: v-bind('labelFont.fontWeight');
      text-align: v-bind('labelFont.textAlign');
      text-decoration-line: v-bind('labelFont.textDecorationLine');
    }

    :deep(.van-field__body) {
      border-radius: 4px;
      font-size: 14px;

      textarea {
        padding-left: v-bind("layout.inputBg?'12px':''");
        text-align: v-bind("layout.inputAlign||'left'");
      }

      input {
        padding-left: v-bind("layout.inputBg?'12px':''");
        text-align: v-bind("layout.inputAlign||'left'");
      }

      .tag-label-disabled {
        padding-left: v-bind("layout.inputBg?'12px':''");
        opacity: 1;
        color: var(--van-field-input-disabled-text-color);
      }
    }

    :deep(.van-field__body:has(.van-field__control .time-input)) {
      padding: 0;
      background-color: transparent;

      .time-input {
        input {
          width: v-bind("layout.inputBg?'32px':'24px'");
          height: v-bind("layout.inputBg?'32px':'24px'");
          border-width: v-bind("layout.inputBg?'1px':0");
        }

        span {
          line-height: v-bind("layout.inputBg?'32px':'24px'");
        }
      }

      .time-input__null {
        input {
          background-color: v-bind("layout.inputBg?'#f7f7f7':'transparent'");
        }
      }
    }

    :deep(.van-cell__right-icon) {
      display: flex;
      align-items: center;
      height: auto;
      margin-left: 0;
      background-color: v-bind("layout.inputBg?'#f7f7f7':''");
    }

    :deep(.van-cell__value) {
      display: flex;
      align-items: 'center';
      // text-align: v-bind("layout.inputAlign||'left'");
      word-break: break-all;
      justify-content: v-bind('flexJustify');
      & > div {
        width: 100%;
      }
    }
  }

  .image {
    overflow-y: auto;
  }

  .gen-image {
    &__title {
      color: v-bind('labelFont.color');
      font-size: v-bind('labelFont.fontSize');
      font-style: v-bind('labelFont.fontStyle');
      font-weight: v-bind('labelFont.fontWeight');
      text-align: v-bind('labelFont.textAlign');
      text-decoration-line: v-bind('labelFont.textDecorationLine');
    }
    // &__con {
    //   background: #FBFBFC;
    // }
    &__text {
      margin-top: 16px;
      text-align: center;

      & > p {
        margin: 0;
      }

      .prompt {
        font-size: 16px;
        line-height: 24px;
      }

      .auxiliary {
        color: #797a7d;
        font-size: 14px;
        line-height: 22px;
      }
    }
  }

  :deep(.van-image) {
    display: block;
    margin: 0 auto;
  }

  .label-ellipsis-i {
    display: inline-block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .label-wrap {
    word-break: break-all;
    white-space: wrap;
  }

  :deep(.van-field__label) {
    width: auto;
  }
</style>
