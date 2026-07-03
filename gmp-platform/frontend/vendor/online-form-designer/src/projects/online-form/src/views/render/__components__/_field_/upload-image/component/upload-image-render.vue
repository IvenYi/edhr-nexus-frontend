<template>
  <cell-wrapper
    :modelValue="value"
    :widget="widget"
    :formData="formData"
    :annotationInfo="annotationInfo"
    @click.stop="setSelectAnnotationId(annotationInfo?.annFieldId, dataRelationShip)"
  >
    <div v-if="!images.length" :class="imageContainerClasses" @click.stop="handleAddImageClick">
      <i class="gct-iconfont icon-a-btn_add2"></i>
      <span>{{ $t('sys.onlineForm.addImage') }}</span>
    </div>
    <div v-else class="images-preview-container" title="">
      <i
        class="gct-iconfont icon-a-btn_add2 add-icon action-icon"
        v-if="isShowAddImageBtn"
        :class="showDisplayStatus"
        :title="$t('sys.onlineForm.addImage')"
        @click.stop="handleAddImageClick"
      ></i>

      <a-popover
        v-model:visible="popoverVisible"
        placement="bottomLeft"
        trigger="click"
        :overlay-style="{ width: '382px' }"
      >
        <template #content>
          <div class="images-grid">
            <div v-for="(image, index) in images" :key="index" class="images-item">
              <a-image width="80px" height="80px" :src="transfer(image.path)" :preview="false" />
              <div class="delete-btn">
                <delete-outlined @click.stop="removeImage(index)" />
              </div>
            </div>
          </div>
        </template>
        <i
          class="iconfont icon-shanchu2 delete-icon action-icon"
          :class="showDisplayStatus"
          :title="$t('sys.onlineForm.deleteSignature')"
        ></i>
      </a-popover>

      <i
        class="iconfont icon-chakan1 preview-icon action-icon"
        :title="$t('sys.preview')"
        @click.stop="previewVisible = true"
      ></i>
    </div>

    <a-image-preview-group
      :preview="{ visible: previewVisible, onVisibleChange: (v) => (previewVisible = v) }"
    >
      <div
        v-for="(item, index) in images"
        :key="index"
        :class="['image-preview', { adaptive: isAdaptive }]"
      >
        <a-image :src="transfer(item.path)" @click.stop />
      </div>
    </a-image-preview-group>
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-upload-image-render">
  import { computed, ref, reactive, nextTick } from 'vue';
  import { isNil } from 'lodash-es';
  import CellWrapper from '../../../_common_/cell-wrapper.vue';
  import BaseUpload from './base-image-upload.vue';
  import { uuid2 } from '/@/utils/uuid';
  import {
    renderUtils,
    useWidgetStaticAttrs,
    useNocodeFormWidget,
    setSelectAnnotationId,
    ImageDisplayModeEnum,
  } from '@gct/nocode-base';
  import { useWebUpload } from '@gct/nocode-web-render';
  import type { IUploadImage } from '@gct/nocode-base';

  const props = defineProps<{
    modelValue?: string;
    widget: IUploadImage;
    formData: Object;
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

  const { onChange, realFieldId, annotationInfo } = useNocodeFormWidget(props, emit);

  const {
    modelKey,
    showRequired,
    showDisabled,
    showDisplayStatus,
    uploadConfig,
    dataRelationShip,
  } = useWidgetStaticAttrs(props.widget);
  const { imageDisplayMode } = reactive(props.widget.props);

  const { transfer } = useWebUpload();

  const popoverVisible = ref(false);
  const previewVisible = ref(false);

  const isAdaptive = computed(() => imageDisplayMode === ImageDisplayModeEnum.ADAPTIVE);
  const maxCount = computed(() => (isAdaptive.value ? 1 : uploadConfig.maxCount));
  const popoverClass = `online-form-upload-image-container-${uuid2(8, 16)}`;

  const value = computed<any>({
    get() {
      return renderUtils.getValue(props.modelValue, true);
    },
    set(v) {
      emit('update:modelValue', renderUtils.setValue(v, true));
    },
  });

  const images = computed(() => value.value.map((path) => ({ path, name: path.split('/').pop() })));

  const imageContainerClasses = computed(() => [
    'image-container',
    showRequired.value && 'is-show-required',
    realFieldId.value,
    showDisplayStatus.value,
    showDisabled.value && 'is-show-disabled',
  ]);

  const isShowAddImageBtn = computed(() => {
    if (isNil(maxCount.value)) {
      return true;
    }
    return images.value.length < maxCount.value;
  });

  const imgUploadContainer = () => document.body.querySelector(`.${popoverClass}`) || document.body;

  const updateValue = async (fileValue) => {
    value.value = fileValue;
    onChange();
  };

  async function handleAddImageClick() {
    const res: any = await gct.openUtil.modal(
      BaseUpload,
      {
        readonly: false,
        disabled: showDisabled.value,
        maxSize: uploadConfig.maxSize,
        maxCount: maxCount.value,
        accept: uploadConfig.accept,
        modelValue: props.modelValue,
        modelKey: modelKey,
        getContainer: imgUploadContainer,
      },
      {
        title: $t('sys.onlineForm.addImage'),
        width: 580,
        okText: $t('sys.okText'),
        showFooter: true,
      },
    );

    if (res.ok) {
      updateValue(res.data![0]);
    }
  }

  const removeImage = (index) => {
    const fieldValue = value.value.filter((e, i) => i !== index);
    updateValue(fieldValue);

    nextTick(() => {
      if (!images.value.length) {
        popoverVisible.value = false;
      }
    });
  };
</script>

<style lang="less">
  .online-image {
    border-radius: 2px;
    visibility: visible;
    width: var(--cmp-width, 75px) !important;
    height: 100%;
  }

  .adaptive {
    .online-image {
      width: 100% !important;
      height: 100%;
      object-fit: contain;
    }
  }
</style>

<style scoped lang="less">
  .image-container {
    display: inline-flex;
    font-size: 14px;
    padding: 4px;
    border-radius: 4px;
    color: var(--required-border-hover-color, var(--ant-primary-color));
    background-color: var(--required-background-color, rgba(49, 104, 236, 0.1));
    border: 1px dashed var(--required-border-color, #026ac8);
    cursor: pointer;
    box-sizing: content-box;
    align-items: center;

    &.is-show-disabled {
      background-color: #f5f5f5;
      color: rgba(0, 0, 0, 0.25);
      border-color: rgba(0, 0, 0, 0.15);
      cursor: not-allowed;
    }

    > .gct-iconfont {
      font-size: 14px;
      line-height: 1;
      margin-right: 2px;
      width: 14px;
      height: 14px;
      display: flex;
    }

    > span {
      font-size: 12px;
      line-height: 20px;
      vertical-align: text-bottom;
    }
  }

  .images-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    overflow-y: auto;
    max-height: 200px;

    &::-webkit-scrollbar {
      display: block;
      width: 3px;
    }
  }

  .images-item {
    position: relative;
    width: 80px;
    border-radius: 4px;

    :deep(.ant-image) {
      background-color: rgba(0, 0, 0, 0.45);
    }

    :deep(.ant-progress) {
      position: absolute;
      height: 100%;
      padding: 10px;
      border-radius: 4px;
      z-index: 1;
      display: flex;
      align-items: center;
      background-color: rgba(0, 0, 0, 0.5);
    }

    .delete-btn {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      background: rgba(0, 0, 0, 0.5);
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.3s;

      &:hover {
        opacity: 1;
      }
    }
  }

  .images-preview-container {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 1;

    &:hover {
      opacity: 1;
    }

    &.is-show {
      opacity: 1;
    }

    .action-icon {
      font-size: 18px;
      line-height: 1;
      cursor: pointer;
      color: white;

      &.preview-icon {
        font-size: 20px;
      }

      &.add-icon,
      &.delete-icon {
        display: none;
        &.edit-component {
          display: inline;
        }
      }

      &:not(:last-child) {
        margin-right: 8px;
      }
    }
  }

  .image-preview {
    display: inline-block;
    border-radius: 2px;
    visibility: visible;
    width: var(--cmp-width, 75px);
    height: 100%;

    :deep(.ant-image) {
      width: 100%;
      height: 100%;
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

      :deep(.ant-image) {
        > .ant-image-img {
          height: 100%;
          object-fit: contain;
        }
      }
    }
  }
</style>
