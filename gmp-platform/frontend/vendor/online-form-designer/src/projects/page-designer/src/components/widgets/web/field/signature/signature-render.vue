<template>
  <div
    :style="{
      height: widget.style.height ? `${widget.style.height}px` : 'auto',
      overflowY: 'auto',
    }"
  >
    <div class="ks-row signature-wrap">
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
      <a-image-preview-group>
        <div
          class="img-item float-left"
          :class="{ horizontal: displayStyle === SignatureStyleEnum.HORIZONTAL }"
          v-for="(item, index) in fileList"
          :key="index"
        >
          <signatureTooltip
            :readonly="readonly"
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
                  <delete-outlined @click.stop="deleteFile(index)" v-if="!disabled && !readonly" />
                </template>
              </a-image>
            </div>
          </signatureTooltip>
          <div
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
  </div>
</template>

<script setup lang="ts" name="gct-printer">
  import { SignatureTypeEnum, SignatureStyleEnum } from '/@/projects/page-designer/src/enum';
  import { computed, ref, toRefs } from 'vue';
  import { Signature } from '/@page-designer/types/web';
  import { useI18n } from '/@/hooks/web/useI18n';
  import AddSignature from './component/addSignature.vue';
  import { Form } from 'ant-design-vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import dayjs from 'dayjs';
  import imageError from '/@page-designer/assets/image-error.svg';
  import signatureTooltip from './component/signature-tooltip.vue';
  import { getSignatureImageUrl } from './component/signature-image';

  const props = defineProps<{
    modelValue?: string;
    widget: Signature;
    formData: Object;
  }>();

  const { readonly, disabled } = toRefs(props.widget.props);
  const { signatureType, displayStyle } = props.widget.props;
  const { t } = useI18n();
  const emit = defineEmits(['update:modelValue']);
  const formItemContext = Form.useInjectFormItemContext();
  const Event = getPageEvent();
  const formData = ref(props.formData);

  const fileList = props.widget.props.field
    ? computed<object[]>({
        get() {
          return props.modelValue ? JSON.parse(props.modelValue) : [];
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
      },
    );
    if (res.ok) {
      res.params.type = signatureType;
      fileList.value = [...fileList.value, { ...res.params }];
      Event.runEventByName('onChange', props.widget.events, props.modelValue, formData.value);
    }
  };

  async function deleteFile(index) {
    fileList.value = fileList.value.filter((e, i) => i !== index);
  }
</script>
<style scoped lang="less">
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
    // width: 120px;
    // height: 94px;
    border-radius: 4px;
    // background-color: #f7f8fa;
    :deep(.ant-image:not(.ant-image-error)) {
      box-sizing: border-box;
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

  .color-theme {
    color: var(--ant-primary-color);
  }

  .horizontal {
    display: flex;
    align-items: center;
  }
</style>
