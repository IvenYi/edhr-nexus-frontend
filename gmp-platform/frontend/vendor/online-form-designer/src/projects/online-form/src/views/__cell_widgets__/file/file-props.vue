<template>
  <form-item
    v-if="widget.category === CellWidgetCategory.Image"
    :label="$t('sys.onlineForm.imageDisplayMode')"
    :inline="false"
  >
    <template #label>
      <span>{{ $t('sys.onlineForm.imageDisplayMode') }}</span>

      <a-tooltip placement="top">
        <template #title>
          <div class="adaptive-warning">
            <p class="warning-title">{{ $t('sys.onlineForm.fileFieldTip1') }}</p>
            <ul class="warning-list">
              <li>{{ $t('sys.onlineForm.fileFieldTip2') }}</li>
              <li>{{ $t('sys.onlineForm.fileFieldTip3') }}</li>
            </ul>
          </div>
        </template>
        <i class="iconfont icon-assist ml-2px text-14px! leading-1 cursor-pointer"></i>
      </a-tooltip>
    </template>
    <SelectEx
      show-mode="icon-label"
      icon-type="custom"
      style-type="buttons"
      class="w-full"
      :disabled="disabled"
      :options="imageDisplayModeOptions"
      v-model:value="imageDisplayMode"
      :onPrevCallback="onPrevCallback"
    />
  </form-item>

  <form-item
    v-if="widget.category === CellWidgetCategory.Image"
    :label="$t('sys.onlineForm.allowedUploadCount')"
    :inline="false"
  >
    <a-input-number
      :min="0"
      class="file-field__input"
      size="small"
      v-model:value="formState.maxCount"
      :disabled="disabled || imageDisplayMode === ImageDisplayModeEnum.ADAPTIVE"
    />
  </form-item>

  <form-item
    :label="
      widget.category === CellWidgetCategory.Image
        ? $t('sys.onlineForm.limitImageSize')
        : $t('sys.onlineForm.fileSizeLimit')
    "
    :inline="false"
  >
    <a-input-number
      :min="0"
      class="file-field__input"
      size="small"
      v-model:value="formState.maxSize"
      :disabled="disabled"
    />
  </form-item>

  <form-item
    v-if="widget.category === CellWidgetCategory.File"
    :label="$t('sys.onlineForm.whetherToDisplayFileName')"
    :inline="false"
  >
    <a-select
      class="w-full"
      v-model:value="formState.showFileName"
      :disabled="disabled"
      size="small"
      allow-clear
      showArrow
    >
      <a-select-option :value="1">{{ $t('sys.true') }}</a-select-option>
      <a-select-option :value="0">{{ $t('sys.false') }}</a-select-option>
    </a-select>
  </form-item>

  <form-item :label="t('sys.model.uploadSupportType')" :inline="false">
    <a-select
      class="w-full"
      v-model:value="formState.acceptTypes"
      size="small"
      :options="renderCompOptions"
      :disabled="disabled"
      mode="tags"
      allow-clear
      showArrow
    />
  </form-item>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { message } from 'ant-design-vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SelectEx from '@/components/SelectEx/select-ex';
  import { uploadType } from '/@app-designer/views/model-desginer/entity/constant/upload';
  import { CellWidgetCategory } from '../../designer/enums';
  import { ImageDisplayModeEnum } from '@gct/nocode-base';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';

  const { t } = useI18n();

  const props = defineProps<{
    widget: CellWidget.File | CellWidget.Image;
    disabled: boolean;
  }>();

  const { currentCell } = useSpreadSheet();

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  const imageDisplayMode = computed({
    get() {
      return formState.value.imageDisplayMode ?? ImageDisplayModeEnum.CUSTOM;
    },
    set(v) {
      formState.value.imageDisplayMode = v;
      if (v === ImageDisplayModeEnum.ADAPTIVE) {
        formState.value.maxCount = undefined;
      }
    },
  });

  const renderCompOptions = computed(() => {
    return (
      props.widget.category === CellWidgetCategory.Image ? uploadType.image : uploadType.attachment
    ).map((item) => {
      return {
        label: item.type,
        value: item.type,
      };
    });
  });

  const imageDisplayModeOptions = [
    {
      label: $t('sys.customize'),
      value: ImageDisplayModeEnum.CUSTOM,
    },
    {
      label: $t('sys.cardDesign.enum.size_mode.auto'),
      value: ImageDisplayModeEnum.ADAPTIVE,
    },
  ];

  function onPrevCallback() {
    if (
      imageDisplayMode.value === ImageDisplayModeEnum.CUSTOM &&
      currentCell.value?.data.multiFields
    ) {
      message.error($t('sys.onlineForm.fileFieldErrorTip'));
      return true;
    }
    return false;
  }
</script>

<style lang="less" scoped>
  .file-field {
    margin-bottom: 4px;
  }

  .file-field__label {
    display: block;
    font-size: 12px;
    margin-bottom: 4px;
  }

  .warning-title {
    margin: 0 0 8px;
    font-size: 12px;
    color: #fff;
  }

  .warning-list {
    margin: 0;
    padding-left: 20px;
    list-style-type: decimal;
  }

  .warning-list li {
    margin-bottom: 6px;
    font-size: 12px;
    color: #fff;
    line-height: 1.5;
  }
</style>
