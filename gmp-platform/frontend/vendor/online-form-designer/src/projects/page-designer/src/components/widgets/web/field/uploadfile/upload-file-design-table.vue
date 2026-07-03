<template>
  <a-popover
    v-model:visible="visible"
    trigger="click"
    :overlayStyle="{ width: '402px' }"
    :overlayClassName="'upload-field-con'"
  >
    <template #content>
      <FieldUpload
        :isDesign="true"
        :modelKey="modelKey"
        :modelValue="defaultFile"
        :readonly="readonly"
        :disabled="disabled"
        :materialType="widget.materialType"
      />
    </template>
    <div class="table-field-box">
      <PlusOutlined v-show="!readonly" class="icon-color pr-10px" />
      <div class="flex field-name-box justify-start" :class="!readonly ? 'no-readonly' : ''">
        <template v-if="displayType === 'concise'">
          <i class="iconfont icon-PaperClip"></i>
          <div>{{ t('sys.pageDesigner.oneFile') }}</div>
        </template>
        <template v-else>
          <SvgIcon class="svg-icon" size="16" name="doc" />
          <div :class="['field-name', readonly ? 'readonly' : '']">示例内容.docx</div>
          <div v-if="readonly" class="more">{{ t('sys.pageDesigner.more') }}</div>
        </template>
      </div>
    </div>
  </a-popover>
</template>

<script name="gct-upload-file" setup lang="ts">
  import { ref, toRefs, onBeforeMount, toRef } from 'vue';
  import { UploadFile } from '/@page-designer/types/web';

  import { useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/hooks';
  import { FieldUpload } from '/@/components/FieldUpload';
  import { SvgIcon } from '/@/components/Icon';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const props = defineProps<{ widget: UploadFile; rowReadonly?: boolean }>();
  const { field, modelKey, disabled, displayType } = toRefs(props.widget.props);
  const readonly = toRef(() => props.rowReadonly || props.widget.props.readonly);
  const defaultFile = ref('示例内容.docx,示例内容.png');

  const { getFileAttrs } = useAsyncFileAttrs();
  const visible = ref<boolean>(false);

  onBeforeMount(() => {
    getFileAttrs({ fieldKey: field.value, modelKey: modelKey.value });
  });
</script>

<style lang="less" scoped>
  .table-field-box {
    display: flex;
    align-items: center;
    width: 100%;

    .icon-color {
      color: var(--ant-primary-color);
      font-size: 16px;
    }

    .field-name-box {
      align-items: center;
      width: 100%;

      &.no-readonly {
        width: calc(100% - 26px);
      }

      .field-name {
        width: calc(100% - 16px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &.readonly {
          width: calc(100% - 48px);
          margin-right: 4px;
        }
      }

      .more {
        margin-left: auto;
        color: var(--ant-primary-color);
      }
    }
  }

  .upload-field-con {
    .ant-popover-inner-content {
      padding: 16px;
    }
  }
</style>
