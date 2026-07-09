<template>
  <cell-wrapper
    :model-value="signatures"
    :widget="widget"
    :form-data="formData"
    :annotation-info="annotationInfo"
    @click.stop="setSelectAnnotationId(annotationInfo?.annFieldId, dataRelationShip)"
  >
    <div
      v-if="!signatures.length"
      :class="signatureContainerClasses"
      @click.stop="handleSignatureClick"
    >
      <i class="iconfont icon-dianziqianmingdd"></i>
      <span>{{ $t('sys.pageDesigner.addSignature') }}</span>
    </div>

    <div v-else class="signature-preview-container" title="">
      <i
        class="iconfont icon-dianziqianmingdd add-icon action-icon"
        v-if="isShowSignature"
        :class="showDisplayStatus"
        :title="$t('sys.pageDesigner.addSignature')"
        @click.stop="handleSignatureClick"
      ></i>

      <a-popover
        v-model:visible="popoverVisible"
        placement="bottomLeft"
        trigger="click"
        :overlay-style="{ width: '412px' }"
      >
        <template #content>
          <div class="signature-grid" :style="gridHeight">
            <div v-for="(signature, index) in signatures" :key="index" class="signature-item">
              <a-image
                width="120px"
                height="68px"
                :src="getPreviewUrl(signature.url, signature.username, transfer)"
                :preview="false"
              />
              <div class="delete-btn">
                <delete-outlined @click.stop="removeSignature(index)" />
              </div>
              <div v-if="shouldShowDate" class="signature-date">
                {{ formattedDate(signature.time) }}
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
        class="iconfont icon-chakan1 action-icon"
        :title="$t('sys.preview')"
        @click.stop="previewVisible = true"
      ></i>
    </div>

    <a-image-preview-group
      :preview="{ visible: previewVisible, onVisibleChange: (v) => (previewVisible = v) }"
    >
      <div
        v-for="(signature, index) in signatures"
        :key="index"
        :class="signaturePreviewClasses(signature)"
      >
        <a-image :src="getPreviewUrl(signature.url, signature.username, transfer)" @click.stop />
        <div
          v-if="shouldShowDate && signTimeType === SignatureTimeTypeEnum.FOLLOW_SIGNATURE"
          class="date-text"
        >
          {{ formattedDate(signature.time) }}
        </div>
      </div>
    </a-image-preview-group>
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-sign-render">
  import { computed, ref, reactive, h, nextTick } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { uuid2 } from '/@/utils/uuid';
  import CellWrapper from '../../../_common_/cell-wrapper.vue';
  import dayjs from 'dayjs';
  import {
    SignatureTypeEnum,
    SignShowTypeEnum,
    SignatureTimeTypeEnum,
    SignatureNumberTypeEnum,
    useWidgetStaticAttrs,
    useNocodeFormWidget,
    setSelectAnnotationId,
  } from '@gct/nocode-base';
  import { useWebUpload } from '@gct/nocode-web-render';
  import { openSignModal, SignMode, getPreviewUrl } from '/@/components/Signature';
  import type { ISign } from '@gct/nocode-base';

  const { t } = useI18n();

  const props = defineProps<{
    modelValue?: string;
    widget: ISign;
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
    signatureType,
    signDisplayStyle,
    signTimeType,
    signatureNumber = SignatureNumberTypeEnum.SIGNATURE_MULTIPLE,
    populateFields,
  } = reactive(props.widget.props);

  const { showRequired, showDisabled, showDisplayStatus, dataRelationShip } = useWidgetStaticAttrs(
    props.widget,
  );

  const { transfer } = useWebUpload();

  const signatures = computed<any[]>({
    get: () => (props.modelValue ? JSON.parse(props.modelValue) : []),
    set: (value) => {
      const modelValue = value.length ? JSON.stringify(value) : '';
      emit('update:modelValue', modelValue);
    },
  });

  const popoverVisible = ref(false);
  const previewVisible = ref(false);

  const signatureContainerClasses = computed(() => [
    'signature-container',
    showRequired.value && 'is-show-required',
    realFieldId.value,
    showDisplayStatus.value,
    showDisabled.value && 'is-disabled',
  ]);

  const shouldShowDate = computed(() => signatureType !== SignatureTypeEnum.SIGNATURE_ONLY);

  const gridHeight = computed(() => ({
    maxHeight: `${signatureType === SignatureTypeEnum.SIGNATURE_ONLY ? 372 : 486}px`,
  }));

  const isShowSignature = computed(() => {
    return (
      signatureNumber === SignatureNumberTypeEnum.SIGNATURE_MULTIPLE ||
      (signatureNumber === SignatureNumberTypeEnum.SIGNATURE_SINGLE && !signatures.value.length)
    );
  });

  const handleSignatureClick = async () => {
    if (showDisabled.value) return;

    const result = await openSignModal(
      { fixSignMode: true, defaultSignMode: SignMode.PASSWORD, disableUserName: false },
      { title: t('sys.model.sign') },
    );

    if (result?.url || result?.username) {
      const newSignature: any = {
        ...result,
        type: signatureType,
      };

      signatures.value = [...signatures.value, newSignature];
      updateDateFields(newSignature);
      onChange();
    }
  };

  const removeSignature = (index) => {
    signatures.value = signatures.value.filter((e, i) => i !== index);
    onChange();

    nextTick(() => {
      if (!signatures.value.length) {
        popoverVisible.value = false;
      }
    });
  };

  const formattedDate = (time: string) => {
    const format =
      signatureType === SignatureTypeEnum.SIGNATURE_DATE ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm';
    return dayjs(time).format(format);
  };

  const updateDateFields = (signature: any) => {
    if (
      !shouldShowDate.value ||
      signatureNumber === SignatureNumberTypeEnum.SIGNATURE_MULTIPLE ||
      signTimeType !== SignatureTimeTypeEnum.POPULATE_FIELD
    )
      return;

    const format =
      signatureType === SignatureTypeEnum.SIGNATURE_DATE ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss';

    const formattedTime = dayjs(signature.time).format(format);

    populateFields?.forEach(({ field }) => {
      props.formData[field!] = formattedTime;
    });
  };

  const signaturePreviewClasses = (signature: any) => [
    'signature-preview',
    {
      'is-horizontal':
        signDisplayStyle === SignShowTypeEnum.HORIZONTAL &&
        signature.type !== SignatureTypeEnum.SIGNATURE_ONLY,
    },
  ];
</script>

<style lang="less">
  @signature-size: 75px;

  .signature-container {
    display: inline-block;
    font-size: 14px;
    padding: 4px;
    border-radius: 4px;
    color: var(--required-border-hover-color, var(--ant-primary-color));
    background-color: var(--required-background-color, rgba(49, 104, 236, 0.1));
    border: 1px dashed var(--required-border-color, #026ac8);
    cursor: pointer;
    box-sizing: content-box;

    &.is-disabled {
      background-color: #f5f5f5;
      color: rgba(0, 0, 0, 0.25);
      border-color: rgba(0, 0, 0, 0.15);
      cursor: not-allowed;
    }

    > .iconfont {
      font-size: 16px;
      line-height: 1;
      margin-right: 2px;
    }

    > span {
      font-size: 12px;
      line-height: 16px;
      vertical-align: text-bottom;
    }
  }

  .signature-preview-container {
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
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
      color: white;

      &.delete-icon {
        font-size: 18px;
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

  .signature-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      display: block;
      width: 3px;
    }
  }

  .signature-item {
    position: relative;
    width: 120px;
    border-radius: 4px;

    .ant-image {
      background-color: rgba(0, 0, 0, 0.45);
    }

    .ant-progress {
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

    .signature-date {
      margin-top: 4px;
      text-align: center;
      font-size: 12px;
    }
  }

  .sign-image-wrapper {
    // line-height: 1.25;
    line-height: 1.5715;
    /** 默认字体大小12px */
    font-size: 12px;
    /** 默认不换行+空格保留 */
    white-space: pre;
  }

  .signature-preview {
    display: inline-block;
    border-radius: 2px;
    width: var(--cmp-width, @signature-size);
    height: 100%;

    .date-text {
      margin-top: 4px;
      text-align: center;
      font-size: 12px;
    }

    &.is-horizontal {
      display: inline-flex;
      align-items: center;
      width: auto;

      .ant-image {
        width: var(--cmp-width, @signature-size);
      }

      .date-text {
        margin-top: 0;
        margin-left: 2px;
      }
    }
  }
</style>
