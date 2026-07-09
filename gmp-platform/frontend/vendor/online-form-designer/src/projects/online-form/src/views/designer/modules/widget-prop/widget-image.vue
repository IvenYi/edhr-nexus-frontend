<template>
  <form-item :label="$t('sys.component.upload.imgUpload')" :inline="false" class="important-mt-0px">
    <a-upload-dragger
      :disabled="disabled"
      :before-upload="beforeImageUpload"
      :show-upload-list="false"
      accept="image/png, image/jpeg"
      class="uploader"
    >
      <div class="uploader__inner">
        <div class="img-box" v-if="widget.value">
          <img :src="transfer(widget.value)" alt="" srcset="" />
          <div class="img-box__mask">
            <i class="iconfont icon-yulan" @click.stop="handlePreview"></i>
            <i v-if="!disabled" class="iconfont icon-bianji"></i>
            <i v-if="!disabled" class="iconfont icon-shanchu" @click.stop="handleDelete"></i>
          </div>
        </div>
        <template v-else>
          <i class="iconfont icon-tupian_wudaima important-text-30px"></i>
          <div>{{ $t('sys.pageDesigner.clickOrDragToUpload') }}</div>
        </template>
      </div>
    </a-upload-dragger>
  </form-item>
  <div class="mt-6px">
    <a-radio-group
      :disabled="disabled"
      class="img-size-mode"
      v-model:value="formState.sizeMode"
      style="margin-bottom: 6px; font-size: 12px"
    >
      <a-radio v-for="mode in WidgetImageSizeMode" :key="mode" :value="mode">
        {{ ImageSizeModeText[mode] }}
      </a-radio>
    </a-radio-group>
    <size-editor
      :disabled="disabled"
      v-if="sizeEditorVisible"
      v-model:width="formState.layout.width"
      v-model:height="formState.layout.height"
    />
  </div>
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import SizeEditor from '/@online-form/views/designer/modules/prop-editor/size-editor.vue';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import { computed } from 'vue';
  import type { UploadProps } from 'ant-design-vue';
  import { ImgParser } from '/@online-form/views/designer/utils/img-parser';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { createImgPreview } from '/@/components/Preview';
  import { message } from 'ant-design-vue';
  import { WidgetImageSizeMode } from '@gct/nocode-base';
  import { useWebUpload } from '@gct/nocode-web-render';

  // sizeMode选项文本映射
  const ImageSizeModeText = {
    [WidgetImageSizeMode.FIXED]: $t('sys.customize'),
    [WidgetImageSizeMode.RESPONSIVE]: $t('sys.cardDesign.enum.size_mode.auto'),
  };

  const props = defineProps<{
    widget: PaperWidget.Image;
    position: 'header' | 'footer';
    disabled?: boolean;
    isInCell?: boolean;
  }>();

  const { doc } = useSpreadSheet();
  const { upload, transfer } = useWebUpload();

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  const sizeEditorVisible = computed(() => {
    if (!props.isInCell) return true;
    return formState.value.sizeMode === WidgetImageSizeMode.FIXED;
  });

  const beforeImageUpload: UploadProps['beforeUpload'] = async (file: File) => {
    if (!file) return;

    if (file.size / 1024 / 1024 > 2) {
      message.warn($t('sys.onlineForm.imageSizeLimit2MB'));
      return;
    }

    if (upload) {
      const src = await upload(file, { type: 'image', modelKey: doc.value.modelKey });
      Object.assign(props.widget, {
        value: src,
      });
    } else {
      const { src } = await ImgParser.read(file);
      Object.assign(props.widget, {
        value: src,
      });
    }

    // 以下为自适应宽高
    // const { src, height: originalHeight, width: originalWidth } = await ImgParser.read(file);
    // const originalRatio = originalWidth / originalHeight;
    // const boxWidth = paper.value.paperSize[0];
    // let boxHeight = paper.value.paperSize[1];
    // if (props.position === 'header') {
    //   boxHeight = paper.value.padding.t;
    // } else if (props.position === 'footer') {
    //   boxHeight = paper.value.padding.b;
    // }

    // let width, height;

    // if (originalHeight <= boxHeight && originalWidth <= boxWidth) {
    //   width = originalWidth;
    //   height = originalHeight;
    // } else if (boxWidth / boxHeight >= originalRatio) {
    //   width = boxWidth;
    //   height = boxWidth / originalRatio;
    // } else {
    //   width = boxHeight * originalRatio;
    //   height = boxHeight;
    // }

    // Object.assign(props.widget, {
    // value: src,
    // layout: {
    //   ...props.widget.layout,
    //   width,
    //   height,
    // },
    // });
    return false;
  };

  const handlePreview = () => {
    if (!props.widget.value) {
      return;
    }
    createImgPreview({
      imageList: [transfer(props.widget.value)],
    });
  };
  const handleDelete = () => {
    Object.assign(props.widget, {
      value: undefined,
    });
  };
</script>

<style lang="less" scoped>
  :deep(.uploader) {
    & > span {
      padding: 0 !important;
    }
  }

  .uploader__inner {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 112px;
    background-color: #f7f8fa;
    color: #c3c3c3;
    font-size: 12px;
  }

  .img-box {
    height: 100%;
    width: 100%;
    position: relative;
    img {
      height: 100%;
      width: 100%;
      object-fit: contain;
    }

    &:hover &__mask {
      opacity: 1;
    }

    &__mask {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      display: flex;
      opacity: 0;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      & > .iconfont:not(:last-child) {
        margin-right: 16px;
      }
    }
  }

  .img-size-mode {
    margin-bottom: 6px;
    :deep(.ant-radio-wrapper) {
      font-size: 12px;
    }
  }
</style>
