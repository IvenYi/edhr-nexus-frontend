<template>
  <cell-wrapper
    :modelValue="value"
    :widget="widget"
    :formData="formData"
    :annotationInfo="annotationInfo"
    @click.stop="setSelectAnnotationId(annotationInfo?.annFieldId, dataRelationShip)"
  >
    <a-popover
      v-model:visible="visible"
      trigger="click"
      :overlayStyle="{ width: fileList.length > 6 ? '405px' : '402px' }"
      :overlayClassName="'upload-field-con'"
    >
      <template #content>
        <BaseUpload
          :modelValue="modelValue"
          :readonly="false"
          :disabled="showDisabled"
          :maxSize="uploadConfig.maxSize"
          :maxCount="uploadConfig.maxCount"
          :accept="uploadConfig.accept"
          :modelKey="modelKey"
          @update:modelValue="updateValue"
        />
      </template>
      <PlusOutlined
        :class="[
          'icon-color',
          'mr-4px',
          showRequired && 'is-show-required',
          realFieldId,
          showDisplayStatus,
          showDisabled && 'is-show-disabled',
        ]"
      />

      <span
        class="file-name"
        :class="{ 'file-name-disabled': showDisabled }"
        v-for="(item, index) in fileList"
        :key="index"
        @click.stop="downFile(item)"
      >
        <SvgIcon size="16" :name="fileTypeParser(item.name)" />
        {{ uploadConfig.showFileName ? item.name : '' }}
      </span>
    </a-popover>
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-upload-file-render">
  import { computed, ref } from 'vue';
  import BaseUpload from './base-file-upload.vue';
  import CellWrapper from '../../../_common_/cell-wrapper.vue';
  import { SvgIcon } from '/@/components/Icon';
  import { typeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import { downloadByUrl } from '/@/utils/file/download';
  import {
    renderUtils,
    useWidgetStaticAttrs,
    useNocodeFormWidget,
    setSelectAnnotationId,
  } from '@gct/nocode-base';
  import { useWebUpload } from '@gct/nocode-web-render';
  import type { IUploadFile } from '@gct/nocode-base';

  const props = defineProps<{
    modelValue?: string;
    widget: IUploadFile;
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

  const visible = ref<boolean>(false);

  const { transfer } = useWebUpload();

  const value = computed<any>({
    get() {
      return renderUtils.getValue(props.modelValue, true);
    },
    set(v) {
      emit('update:modelValue', renderUtils.setValue(v, true));
    },
  });

  const fileList = computed(() =>
    value.value.map((path) => ({
      path: transfer(path),
      name: path.split('/').at(-1),
    })),
  );

  const fileTypeParser = computed(() => {
    return (fileName) => {
      return typeParser(fileName);
    };
  });

  const updateValue = async (fileValue) => {
    value.value = fileValue;
    onChange();
  };

  async function downFile(item) {
    downloadByUrl({ url: item.path });
  }
</script>

<style scoped lang="less">
  .icon-color {
    cursor: pointer;
    font-size: 16px;
    color: var(--required-border-hover-color, var(--ant-primary-color));
    vertical-align: super;
    padding: 12px;
    display: none;

    &.edit-component&:not(.is-show-disabled) {
      display: inline;
    }
  }
  .file-name {
    display: inline-block;
    width: var(--cmp-width, 75px) !important;
    height: 22px;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    &:hover {
      color: var(--ant-primary-color);
    }

    &.file-name-disabled {
      color: #c3c3c3 !important;
    }
  }

  .upload-field-con {
    .ant-popover-inner-content {
      padding: 16px;
    }
  }
</style>
