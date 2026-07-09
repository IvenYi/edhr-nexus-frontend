<template>
  <cell-wrapper
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :annotationInfo="annotationInfo"
  >
    <image-cell-comp-field
      v-if="!images.length"
      :show-disabled="showDisabled"
      :real-field-id="realFieldId"
      label="添加图片"
    />
    <ImageUpload
      v-else
      :class="['mobile-image-render', { adaptive: isAdaptive }]"
      :disabled="showDisabled"
      :readonly="true"
      :modelKey="widget.props.modelKey"
      :modelValue="modelValue"
      :maxSize="uploadConfig.maxSize"
      :maxCount="maxCount"
      :accept="uploadConfig.accept"
    />
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-upload-image-render">
  import { computed, reactive } from 'vue';
  import {
    ImageDisplayModeEnum,
    renderUtils,
    useNocodeFormWidget,
    useWidgetStaticAttrs,
    type IUploadImage,
  } from '@gct/nocode-base';
  import CellWrapper from '../../_common_/cell-wrapper.vue';
  import { ImageUpload } from '../../_common_';
  import ImageCellCompField from '../../_common_/base-cell-comp-field/image-cell-comp-field.vue';

  const props = defineProps<{
    modelKey?: string;
    modelValue?: string;
    widget: IUploadImage;
    formData: any;
    /** 子表fieldkey */
    subtableFieldId?: string;
    /** 子表实际行数 */
    realRowIndex?: number;
    /** 子表在分页情况下，当前页面的行数 */
    pageRowIndex?: number;
    /** 二维子表数据行数index */
    childSubTableDataIndex?: number;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const { realFieldId, annotationInfo } = useNocodeFormWidget(props, emit);

  const { showDisabled, uploadConfig } = useWidgetStaticAttrs(props.widget);
  const { imageDisplayMode } = reactive(props.widget.props);

  const isAdaptive = computed(() => imageDisplayMode === ImageDisplayModeEnum.ADAPTIVE);
  const maxCount = computed(() => (isAdaptive.value ? 1 : uploadConfig.maxCount));

  const images = computed<any>({
    get() {
      return renderUtils.getValue(props.modelValue, true);
    },
    set(v) {
      emit('update:modelValue', renderUtils.setValue(v, true));
    },
  });
</script>
<style lang="less" scoped>
  @signature-size: 75px;
  .mobile-image-render {
    :deep(.img-item) {
      display: inline-flex;
      border-radius: 2px;
      width: var(--cmp-width, 75px);
      height: 100%;
      .van-image {
        border: none;
      }
    }

    &.adaptive {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      left: 0;
      top: 0;
      overflow: hidden;
      :deep(.img-item) {
        width: 100% !important;
        height: 100%;
        object-fit: contain;
        .van-image {
          border: none;
        }
      }
    }
  }
</style>
