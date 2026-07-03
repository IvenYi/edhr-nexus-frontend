<template>
  <div class="signature-image-wrapper">
    <a-popover
      placement="bottom"
      v-model:visible="visible"
      trigger="hover"
      :overlayStyle="{ width: '472px', zIndex: 10000 }"
      :overlayClassName="[getClassName + ' vxe-table--report', popWidth(), wrapperClass]"
    >
      <template #content>
        <div
          class="signature-wrap"
          :style="{
            maxHeight: '288px',
          }"
        >
          <a-image-preview-group
            :preview="{
              getContainer: imgUploadContainer,
            }"
          >
            <div
              v-for="(item, index) in imgList"
              class="img-item float-left mb12px"
              :class="{
                horizontal: displayStyle === SignatureStyleEnum.HORIZONTAL,
                mr12px: index + (1 % 3),
              }"
              :key="index"
            >
              <signatureTooltip
                :readonly="true"
                :enableSignPassword="item.enableSignPassword"
                :userName="item.signatureName"
                :dateTime="dayjs(item.time).format('YYYY-MM-DD HH:mm:ss')"
              >
                <div class="inline-block">
                  <a-image
                    width="120px"
                    height="68px"
                    :src="getSignatureImageUrl(item.url, item.username)"
                    :fallback="imageError"
                  >
                    <template #previewMask>
                      <zoom-in-outlined class="mr10px" />
                    </template>
                  </a-image>
                </div>
              </signatureTooltip>
              <div
                v-if="signatureType !== SignatureTypeEnum.SIGNATURE_ONLY && item.time"
                class="text-center text-[12px]"
                :class="{
                  ml8px: displayStyle === SignatureStyleEnum.HORIZONTAL,
                  mt4px: displayStyle !== SignatureStyleEnum.HORIZONTAL,
                }"
                style="line-height: 18px"
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
      <div class="table-field-box" v-if="imgList.length">
        <div class="image-list-box">
          <template v-if="imgList.length">
            <div v-for="(item, index) in imgList" :key="index" class="image-item">
              <img
                width="36"
                height="20"
                :src="getSignatureImageUrl(item.url, item.username)"
                @error="handleError"
              />
            </div>
          </template>
        </div>
      </div>
    </a-popover>
  </div>
</template>
<script setup lang="ts">
  import { reactive, computed, ref } from 'vue';
  import { Form } from 'ant-design-vue';
  import { Signature } from '/@page-designer/types/web';
  import { getParentPopupContainer } from '/@page-designer/components/widgets/hooks/listhook';

  import { uuid2 } from '/@/utils/uuid';

  import { SignatureTypeEnum, SignatureStyleEnum } from '/@/projects/page-designer/src/enum';
  import dayjs from 'dayjs';
  import imageError from '/@page-designer/assets/image-error-mini.svg';
  import signatureTooltip from '/@page-designer/components/widgets/web/field/signature/component/signature-tooltip.vue';
  import { getSignatureImageUrl } from '/@page-designer/components/widgets/web/field/signature/component/signature-image';

  const formItemContext = Form.useInjectFormItemContext();
  const emit = defineEmits(['update:modelValue', 'saveTableRow']);
  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      widget: Signature;
      getPopupContainer?: (triggerNode) => HTMLElement;
    }>(),
    {},
  );
  const PopupContainer = getParentPopupContainer(props);

  const { signatureType, displayStyle } = reactive(props.widget);
  const visible = ref<boolean>(false);

  const getClassName = 'signature-image-container' + uuid2(16, 16);
  const wrapperClass = [
    'image-wrapper' + uuid2(16, 16),
    signatureType === SignatureTypeEnum.SIGNATURE_DATE &&
    displayStyle === SignatureStyleEnum.HORIZONTAL
      ? 'data-wrapper'
      : '',
    signatureType === SignatureTypeEnum.SIGNATURE_DATETIME &&
    displayStyle === SignatureStyleEnum.HORIZONTAL
      ? 'datatime-wrapper'
      : '',
  ];

  const imgList = computed<object[]>({
    get() {
      try {
        return props.modelValue ? JSON.parse(props.modelValue) : [];
      } catch (error) {
        return [];
      }
    },
    set(value) {
      if (value?.length > 0) {
        emit('update:modelValue', JSON.stringify(value));
      } else {
        emit('update:modelValue', '');
      }
      formItemContext.onFieldChange();
    },
  });
  const handleError = (e) => {
    e.target.src = imageError;
  };

  const popWidth = () => {
    if (imgList.value.length === 1) {
      return 'one-pic';
      // return '148px';
    }
    if (imgList.value.length === 2) {
      return 'two-pic';
      // return '280px';
    }
    return 'more-pic';
    // return '412px';
  };

  const imgUploadContainer = () => document.body.querySelector(`.${getClassName}`) || document.body;
</script>

<style lang="less" scoped>
  .signature-wrap {
    flex-wrap: wrap;
    overflow-y: auto;
    gap: 8px 8px;

    &::-webkit-scrollbar {
      display: block;
      width: 3px;
    }
  }

  .signature-add {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 68px;
    border: 1px dashed @gct-input-border-color;
    border-radius: 2px;
    background-color: #f7f8fa;
    color: #797a7d;
    cursor: pointer;

    &.disabled {
      color: #c3c3c3;
      cursor: not-allowed;
    }
  }

  .img-box {
    overflow-y: auto;

    &::-webkit-scrollbar {
      display: block;
      width: 3px;
    }
  }

  .img-item {
    position: relative;
    // width: 122px;
    // height: 94px;
    border-radius: 4px;
    // background-color: #f7f8fa;
    :deep(.ant-image:not(.ant-image-error)) {
      // background-color: rgba(0, 0, 0, 0.45);
      border: 1px dashed @gct-input-border-color;
      border-radius: 2px;
    }

    :deep(.ant-image-img) {
      width: 118px;
      height: 66px !important;
    }

    .ant-progress {
      display: flex;
      position: absolute;
      z-index: 1;
      align-items: center;
      height: 100%;
      padding: 10px;
      border-radius: 4px;
      background-color: rgb(0 0 0 / 50%);
    }
  }

  .signature-image-wrapper {
    width: 100%;

    .table-field-box {
      display: flex;
      align-items: center;
      width: 100%;
      height: 20px;

      .icon-color {
        color: var(--ant-primary-color);
        font-size: 16px;
        cursor: pointer;

        &.disabled {
          color: #c3c3c3;
        }
      }

      .image-list-box {
        width: 100%;
        height: 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        .image-item {
          display: inline-flex;
          box-sizing: border-box;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 20px;
          // background-color: rgba(0, 0, 0, 0.45);
          margin-right: 4px;
          overflow: hidden;
          border: 1px dashed @gct-input-border-color;
          border-radius: 2px;
        }
      }

      .more {
        width: 28px;
        margin-left: 4px;
        color: var(--ant-primary-color);
        cursor: pointer;
      }
    }
  }

  :deep(.image-list-box .ant-image) {
    display: inline-flex;
    margin-right: 4px;
    background-color: rgb(0 0 0 / 45%);

    &.ant-image-error {
      background-color: transparent;
    }
    // .ant-image-img,
    .ant-image-mask {
      // border-radius: 2px;
      visibility: visible;
    }
  }

  :deep(.image-list-box .ant-image:has(.ant-image-img.image-hide)) {
    height: 0 !important;
    // .ant-image-img,
    .ant-image-mask {
      visibility: hidden;
      height: 0 !important;
    }
  }

  .masking {
    position: fixed;
    z-index: 20;
    inset: 0;
    background: rgb(0 0 0 / 45%);
  }

  .color-theme {
    color: var(--ant-primary-color);
  }

  .horizontal {
    display: flex;
    align-items: center;
  }
</style>
<style lang="less">
  .vxe-table--report.ant-popover {
    max-width: 412px;
  }
  .one-pic.ant-popover {
    max-width: 148px;
  }
  .two-pic.ant-popover {
    max-width: 280px;
  }
  .data-wrapper.ant-popover {
    max-width: 229px;
  }

  .datatime-wrapper.ant-popover {
    max-width: 265px;
  }
  .vxe-table--report .ant-popover-inner-content {
    padding: 12px 0 12px 12px;
  }
  .vxe-table--report {
    .table-field-box {
      display: flex;
      align-items: center;
      width: 100%;
      height: 20px;

      .icon-color {
        color: var(--ant-primary-color);
        font-size: 16px;
        cursor: pointer;

        &.disabled {
          color: #c3c3c3;
        }
      }

      .image-list-box {
        width: 100%;
        height: 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        .image-item {
          display: inline-flex;
          box-sizing: border-box;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 20px;
          // background-color: rgba(0, 0, 0, 0.45);
          margin-right: 4px;
          overflow: hidden;
          border: 1px dashed @gct-input-border-color;
          border-radius: 2px;
        }
      }

      .more {
        width: 28px;
        margin-left: 4px;
        color: var(--ant-primary-color);
        cursor: pointer;
      }
    }
    .image-list-box .ant-image {
      display: inline-flex;
      margin-right: 4px;
      background-color: rgb(0 0 0 / 45%);

      &.ant-image-error {
        background-color: transparent;
      }
      // .ant-image-img,
      .ant-image-mask {
        // border-radius: 2px;
        visibility: visible;
      }
    }
    .image-list-box .ant-image:has(.ant-image-img.image-hide) {
      height: 0 !important;
      // .ant-image-img,
      .ant-image-mask {
        visibility: hidden;
        height: 0 !important;
      }
    }
    .signature-wrap {
      flex-wrap: wrap;
      overflow-y: auto;
      gap: 8px 8px;

      &::-webkit-scrollbar {
        display: block;
        width: 3px;
      }
    }

    .signature-add {
      display: flex;
      box-sizing: border-box;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 68px;
      border: 1px dashed @gct-input-border-color;
      border-radius: 2px;
      background-color: #f7f8fa;
      color: #797a7d;
      cursor: pointer;

      &.disabled {
        color: #c3c3c3;
        cursor: not-allowed;
      }
    }

    .img-box {
      overflow-y: auto;

      &::-webkit-scrollbar {
        display: block;
        width: 3px;
      }
    }

    .img-item {
      position: relative;
      // width: 122px;
      // height: 94px;
      border-radius: 4px;
      // background-color: #f7f8fa;
      .ant-image:not(.ant-image-error) {
        // background-color: rgba(0, 0, 0, 0.45);
        border: 1px dashed @gct-input-border-color;
        border-radius: 2px;
      }

      :deep(.ant-image-img) {
        width: 118px;
        height: 66px !important;
      }

      .ant-progress {
        display: flex;
        position: absolute;
        z-index: 1;
        align-items: center;
        height: 100%;
        padding: 10px;
        border-radius: 4px;
        background-color: rgb(0 0 0 / 50%);
      }
    }
  }
</style>
