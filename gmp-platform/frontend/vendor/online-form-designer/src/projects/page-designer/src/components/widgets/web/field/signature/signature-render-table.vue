<template>
  <div class="signature-image-wrapper" :class="wrapperClass">
    <a-popover
      :placement="!readonly ? 'bottomLeft' : 'bottomRight'"
      v-model:visible="visible"
      trigger="click"
      :overlayStyle="{ width: '472px', zIndex: 21 }"
      :overlayClassName="[
        getClassName + ' vxe-table--ignore-clear',
        'signature-wrapper',
        signatureType === SignatureTypeEnum.SIGNATURE_DATE &&
        displayStyle === SignatureStyleEnum.HORIZONTAL
          ? 'data-wrapper'
          : '',
        signatureType === SignatureTypeEnum.SIGNATURE_DATETIME &&
        displayStyle === SignatureStyleEnum.HORIZONTAL
          ? 'datatime-wrapper'
          : '',
      ]"
      :getPopupContainer="PopupContainer"
    >
      <template #content>
        <div
          class="signature-wrap"
          :style="{
            maxHeight: '288px',
          }"
        >
          <div
            v-if="!readonly"
            class="signature-add"
            :class="{
              disabled: disabled,
              mr60px:
                signatureType === SignatureTypeEnum.SIGNATURE_DATE &&
                displayStyle === SignatureStyleEnum.HORIZONTAL,
              mr95px:
                signatureType === SignatureTypeEnum.SIGNATURE_DATETIME &&
                displayStyle === SignatureStyleEnum.HORIZONTAL,
            }"
            @click="!disabled && handleClick()"
          >
            <i
              class="iconfont icon-dianziqianmingdd color-theme"
              style="height: 22px; font-size: 20px"
            ></i>
            <div class="mt8px color-theme">{{ t('sys.pageDesigner.addSignature') }}</div>
          </div>
          <a-image-preview-group
            :preview="{
              getContainer: imgUploadContainer,
            }"
          >
            <div
              class="img-item float-left mb12px"
              :class="{
                horizontal: displayStyle === SignatureStyleEnum.HORIZONTAL,
                mr12px: index + (1 % 3),
              }"
              v-for="(item, index) in imgList"
              :key="index"
            >
              <signatureTooltip
                :readonly="!!readonly"
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
                      <zoom-in-outlined :class="readonly ? '' : 'mr10px'" />
                      <delete-outlined
                        @click.stop="deleteFile(index)"
                        v-if="!disabled && !readonly"
                      />
                    </template>
                  </a-image>
                </div>
              </signatureTooltip>
              <div
                v-if="signatureType !== SignatureTypeEnum.SIGNATURE_ONLY && item.time"
                class="text-center mt4px text-[12px]"
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
      <div class="table-field-box" v-if="(imgList.length && readonly) || !readonly">
        <PlusOutlined
          v-show="!readonly"
          class="icon-color pr-4px"
          :class="[disabled && 'disabled']"
        />
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

<script name="gct-signature" setup lang="ts">
  import { reactive, computed, ref } from 'vue';
  import { Form } from 'ant-design-vue';
  import { Signature } from '/@page-designer/types/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { uuid2 } from '/@/utils/uuid';
  import { getParentPopupContainer } from '/@page-designer/components/widgets/hooks/listhook';
  import AddSignature from './component/addSignature.vue';
  import { SignatureTypeEnum, SignatureStyleEnum } from '/@/projects/page-designer/src/enum';
  import dayjs from 'dayjs';
  import imageError from '/@page-designer/assets/image-error-mini.svg';
  import signatureTooltip from './component/signature-tooltip.vue';
  import { getSignatureImageUrl } from './component/signature-image';

  const { t } = useI18n();
  const Event = getPageEvent();
  const formItemContext = Form.useInjectFormItemContext();
  const emit = defineEmits(['update:modelValue', 'saveTableRow']);
  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      widget: Signature;
      formData: Object;
      getPopupContainer?: (triggerNode) => HTMLElement;
    }>(),
    {},
  );
  const PopupContainer = getParentPopupContainer(props);

  const { readonly, signatureType, displayStyle } = reactive(props.widget.props);
  const formData = ref(props.formData);
  const visible = ref<boolean>(false);
  const sysPath = ref(import.meta.env.VITE_MINIO_PATH);
  const disabled = ref(props.widget.props.disabled);

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

  const imgList = props.widget.props.field
    ? computed<object[]>({
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
      })
    : ref([]);

  const handleClick = () => {
    openAddModal();
  };

  const openAddModal = async () => {
    const res = await gct.openUtil.modal(
      AddSignature,
      {},
      {
        title: t('sys.pageDesigner.getSignature'),
        width: 640,
        height: 600,
        okText: t('sys.okText'),
        showFooter: true,
        getContainer: () => document.querySelector(`.${getClassName}`),
      },
    );
    if (res.ok) {
      res.params.type = signatureType;
      emit('update:modelValue', JSON.stringify(imgList.value.concat([res.params])));
      formItemContext.onFieldChange();
      Event.runEventByName('onChange', props.widget.events, props.modelValue, formData.value);
      /**列字段时候触发保存 */
      emit('saveTableRow');
    }
  };

  async function deleteFile(index) {
    const tempList = imgList.value.filter((e, i) => i !== index);
    emit('update:modelValue', JSON.stringify(tempList));
  }

  const handleError = (e) => {
    e.target.src = imageError;
  };

  const getContainer = () => document.body.querySelector(`.${wrapperClass}`) || document.body;

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
  .signature-wrapper {
    width: auto !important;
    max-width: 412px;

    .ant-popover-inner-content {
      padding: 12px 0 12px 12px;
    }
  }

  .data-wrapper {
    width: auto !important;
    max-width: 223px;
  }

  .datatime-wrapper {
    width: auto !important;
    max-width: 259px;
  }
</style>
