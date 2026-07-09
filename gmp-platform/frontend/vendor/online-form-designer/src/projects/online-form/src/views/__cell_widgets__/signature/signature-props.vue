<template>
  <form-item :label="$t('sys.component.fieldTypeProps.signNum')" :inline="false">
    <SelectEx
      show-mode="icon-label"
      icon-type="custom"
      style-type="buttons"
      class="w-full"
      :disabled="disabled"
      :options="signatureNumberOptions"
      v-model:value="_signatureNumber"
      :onPrevCallback="onPrevCallback"
    />
  </form-item>

  <form-item :label="`${t('sys.pageDesigner.signatureType')}`" :inline="false">
    <a-select
      size="small"
      v-model:value="formState.signatureType"
      :options="signatureTypeOptions"
      :placeholder="t('sys.chooseText')"
      :disabled="disabled"
      @change="
        () => {
          formState.signTimeType = SignatureTimeTypeEnum.FOLLOW_SIGNATURE;
          formState.signDisplayStyle = SignShowTypeEnum.VERTICAL;
          formState.populateFields = [];
        }
      "
    />
  </form-item>

  <form-item
    :label="$t('sys.onlineForm.signatureDateConfiguration')"
    :inline="false"
    v-if="
      [SignatureTypeEnum.SIGNATURE_DATE, SignatureTypeEnum.SIGNATURE_DATETIME].includes(
        formState.signatureType,
      )
    "
  >
    <a-select
      size="small"
      v-model:value="formState.signTimeType"
      :placeholder="t('sys.chooseText')"
      :disabled="disabled"
    >
      <a-select-option
        v-for="item in signatureTimeOptions"
        :key="item.value"
        :value="item.value"
        :disabled="
          _signatureNumber === SignatureNumberTypeEnum.SIGNATURE_MULTIPLE &&
          item.value === SignatureTimeTypeEnum.POPULATE_FIELD
        "
        :title="
          _signatureNumber === SignatureNumberTypeEnum.SIGNATURE_MULTIPLE &&
          item.value === SignatureTimeTypeEnum.POPULATE_FIELD
            ? $t('sys.onlineForm.configurableOnlyWhenSingleSignature')
            : $t('sys.onlineForm.populateNewField')
        "
      >
        {{ item.label }}
      </a-select-option>
    </a-select>
  </form-item>

  <form-item
    :label="$t('sys.pageDesigner.displayStyle')"
    :inline="false"
    v-if="
      [SignatureTypeEnum.SIGNATURE_DATE, SignatureTypeEnum.SIGNATURE_DATETIME].includes(
        formState.signatureType,
      ) && formState.signTimeType === SignatureTimeTypeEnum.FOLLOW_SIGNATURE
    "
  >
    <div v-for="(config, index) in signatureConfigs" :key="index">
      <div v-if="formState.signatureType === config.signatureType" class="signature-select-wrapper">
        <div @click="setSignDisplayStyle(SignShowTypeEnum.VERTICAL)" class="cursor-pointer">
          <div
            class="bg mb5px"
            :class="[
              config.verticalBgClass,
              { selected: formState.signDisplayStyle !== SignShowTypeEnum.HORIZONTAL },
            ]"
          ></div>
        </div>
        <div @click="setSignDisplayStyle(SignShowTypeEnum.HORIZONTAL)" class="cursor-pointer">
          <div
            class="bg mb5px"
            :class="[
              config.horizontalBgClass,
              { selected: formState.signDisplayStyle === SignShowTypeEnum.HORIZONTAL },
            ]"
          ></div>
        </div>
      </div>
    </div>
  </form-item>

  <div
    class="fill-fields-area"
    v-if="
      [SignatureTypeEnum.SIGNATURE_DATE, SignatureTypeEnum.SIGNATURE_DATETIME].includes(
        formState.signatureType,
      ) && formState.signTimeType === SignatureTimeTypeEnum.POPULATE_FIELD
    "
  >
    <AttachFieldEditor
      v-model:items="formState.populateFields"
      :disabled="disabled"
      :isFieldConfigurable="false"
      v-bind="populateFiledAttrs[formState.signatureType]"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { FIELD_TYPE } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SelectEx from '@/components/SelectEx/select-ex';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import AttachFieldEditor from '../common/attach-fields-editor/attach-fields-editor.vue';
  import {
    SignatureTypeEnum,
    SignShowTypeEnum,
    SignatureTimeTypeEnum,
    SignatureNumberTypeEnum,
  } from '@gct/nocode-base';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';

  const { t } = useI18n();

  const props = defineProps<{
    widget: CellWidget.Signature;
    disabled: boolean;
  }>();

  const signatureTypeOptions = Object.keys(SignatureTypeEnum).map((key) => {
    return {
      label: t('sys.pageDesigner.' + SignatureTypeEnum[key]),
      value: SignatureTypeEnum[key],
    };
  });

  const signatureTimeOptions = [
    {
      label: $t('sys.onlineForm.followSignature'),
      value: SignatureTimeTypeEnum.FOLLOW_SIGNATURE,
    },
    {
      label: $t('sys.onlineForm.populateNewField'),
      value: SignatureTimeTypeEnum.POPULATE_FIELD,
    },
  ];

  const populateFiledAttrs = {
    [SignatureTypeEnum.SIGNATURE_DATE]: {
      customFieldTypes: [FIELD_TYPE.DATE],
      customFieldMsg: $t('sys.onlineForm.canOnlyBindDateTypeField'),
    },
    [SignatureTypeEnum.SIGNATURE_DATETIME]: {
      customFieldTypes: [FIELD_TYPE.DATE_TIME],
      customFieldMsg: $t('sys.onlineForm.canOnlyBindDateTimeTypeField'),
    },
  };

  const signatureNumberOptions = [
    {
      label: $t('sys.webRender.DiffedAttrMaps.signature_single'),
      value: SignatureNumberTypeEnum.SIGNATURE_SINGLE,
    },
    {
      label: $t('sys.webRender.DiffedAttrMaps.signature_multiple'),
      value: SignatureNumberTypeEnum.SIGNATURE_MULTIPLE,
    },
  ];

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  const _signatureNumber = computed({
    get() {
      return formState.value.signatureNumber || SignatureNumberTypeEnum.SIGNATURE_MULTIPLE;
    },
    set(v) {
      formState.value.signatureNumber = v;
    },
  });

  const signatureConfigs = computed(() => [
    {
      signatureType: SignatureTypeEnum.SIGNATURE_DATETIME,
      verticalBgClass: 'datatime-vertical-bg',
      horizontalBgClass: 'datatime-horizontal-bg',
    },
    {
      signatureType: SignatureTypeEnum.SIGNATURE_DATE,
      verticalBgClass: 'data-vertical-bg',
      horizontalBgClass: 'data-horizontal-bg',
    },
  ]);

  function onPrevCallback() {
    if (
      _signatureNumber.value === SignatureNumberTypeEnum.SIGNATURE_SINGLE &&
      formState.value.signTimeType === SignatureTimeTypeEnum.POPULATE_FIELD
    ) {
      message.error($t('sys.onlineForm.signatureFieldTip'));
      return true;
    }
    return false;
  }

  const setSignDisplayStyle = (style) => {
    if (props.disabled) {
      return;
    }
    formState.value.signDisplayStyle = style;
  };
</script>

<style scoped lang="less">
  .signature-select-wrapper {
    display: flex;
    justify-content: space-between;
    margin: 10px 0;
  }

  .common-bg {
    background-repeat: no-repeat;

    &:hover {
      background-repeat: no-repeat;
    }

    &.selected {
      border-radius: 4px;
      border: 1px solid var(--ant-primary-color);
      background-repeat: no-repeat;
    }
  }

  .generate-bg(@className, @defaultImg, @hoverImg, @selectedImg) {
    .@{className} {
      .common-bg();
      background-image: url('@{defaultImg}');

      &:hover {
        background-image: url('@{hoverImg}');
      }

      &.selected {
        background-image: url('@{selectedImg}');
      }
    }
  }

  .generate-bg(datatime-horizontal-bg, '/@online-form/assets/signature-horizontal.svg', '/@online-form/assets/signature-horizontal-hover.svg', '/@online-form/assets/signature-horizontal-selected.svg');
  .generate-bg(datatime-vertical-bg, '/@online-form/assets/signature-vertical.svg', '/@online-form/assets/signature-vertical-hover.svg', '/@online-form/assets/signature-vertical-selected.svg');
  .generate-bg(data-horizontal-bg, '/@online-form/assets/date-horizontal.svg', '/@online-form/assets/date-horizontal-hover.svg', '/@online-form/assets/date-horizontal-selected.svg');
  .generate-bg(data-vertical-bg, '/@online-form/assets/date-vertical.svg', '/@online-form/assets/date-vertical-hover.svg', '/@online-form/assets/date-vertical-selected.svg');

  .bg {
    width: 103px;
    height: 51px;
  }

  .fill-fields-area {
    padding: 4px;
    background: #f0f0f0;
    border-radius: 4px;
  }
</style>
