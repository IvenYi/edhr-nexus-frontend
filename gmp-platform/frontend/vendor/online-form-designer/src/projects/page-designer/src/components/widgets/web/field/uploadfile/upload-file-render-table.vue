<template>
  <div class="upload-file-wrapper" @click.stop>
    <!-- <div class="masking" v-show="visible" @click.stop></div> -->
    <a-popover
      id="UploadFileRender"
      :placement="placement"
      v-model:visible="visible"
      trigger="click"
      :overlayStyle="{ width: fileList.length > 6 ? '405px' : '402px' }"
      :overlayClassName="'upload-field-con  vxe-table--ignore-clear'"
      :getPopupContainer="PopupContainer"
    >
      <template #content>
        <FieldUpload
          :modelKey="modelKey"
          :modelValue="modelValue"
          :isDesign="false"
          :isTable="true"
          :readonly="readonly"
          :disabled="disabled"
          :maxSize="attrObj.maxSize"
          :maxCount="attrObj.maxCount"
          :accept="attrObj.accept"
          :materialType="widget.materialType"
          :beforeUpload="beforeUpload"
          @update:modelValue="updateValue"
          @saveTableRow="saveTableRowData"
        />
      </template>
      <div class="table-field-box" @click.stop>
        <PlusOutlined v-if="!readonly" class="icon-color pr-10px" />
        <div class="field-name-box" @click.stop>
          <template v-if="fileList.length">
            <div
              :class="{ highlight: readonly }"
              v-if="displayType === 'concise' || !readonly"
              @click.stop="openPopover"
            >
              <i class="iconfont icon-PaperClip"></i>
              <span>{{ t('sys.pageDesigner.xFiles', { text: fileList.length || 0 }) }}</span>
            </div>
            <template v-else>
              <SvgIcon size="16" :name="fileTypeParser(fileList[0].name)" />
              <div :class="['field-name', readonly ? 'readonly' : '']">
                <span :title="fileList[0].name" @click.stop="downFile(fileList[0])">{{
                  fileList[0].name
                }}</span>
              </div>
            </template>
          </template>
        </div>
        <div
          v-if="displayType !== 'concise' && readonly && fileList.length > 1"
          class="field-more"
          >{{ t('sys.pageDesigner.more') }}</div
        >
      </div>
    </a-popover>
  </div>
</template>

<script name="gct-upload-file" setup lang="ts">
  import { reactive, computed, ref, nextTick, onBeforeMount, toRefs, onMounted } from 'vue';
  import { UploadFile } from '/@page-designer/types/web';
  import { Form } from 'ant-design-vue';
  import { getPageEvent, useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/hooks';
  import { FieldUpload } from '/@/components/FieldUpload';
  import { typeParser, sizeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import { SvgIcon } from '/@/components/Icon';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { downloadByUrl } from '/@/utils/file/download';
  import { getParentPopupContainer } from '/@page-designer/components/widgets/hooks/listhook';
  import { postFileResourceList } from '/@/apis/gct-apaas/FileResourceController';

  const { t } = useI18n();

  const formItemContext = Form.useInjectFormItemContext();
  const Event = getPageEvent();
  const emit = defineEmits(['update:modelValue', 'saveTableRow']);
  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      widget: UploadFile;
      formData: Object;
      getPopupContainer?: (triggerNode) => HTMLElement;
    }>(),
    {},
  );
  const PopupContainer = getParentPopupContainer(props);

  const { field, modelKey, displayType, enableAutofill, autofillRules } = reactive(
    props.widget.props,
  );
  const { readonly, disabled } = toRefs(props.widget.props);
  const { getFileAttrs, attrObj } = useAsyncFileAttrs();
  const visible = ref<boolean>(false);

  onBeforeMount(() => {
    getFileAttrs({ fieldKey: field, modelKey: modelKey });
  });

  const { formData } = toRefs(props);

  const fileTypeParser = computed(() => {
    return (fileName) => {
      return typeParser(fileName);
    };
  });

  const placement = computed(() => {
    return !readonly?.value
      ? 'bottomLeft'
      : displayType === 'concise'
      ? 'bottomLeft'
      : 'bottomRight';
  });

  const value = props.widget.props.field
    ? computed<string[]>({
        get() {
          try {
            return props.modelValue ? props.modelValue.split(',') : [];
          } catch (error) {
            return [];
          }
        },
        set(value) {
          if (value?.length > 0) {
            emit('update:modelValue', value ? value.join(',') : '');
          } else {
            emit('update:modelValue', '');
          }
          formItemContext.onFieldChange();
        },
      })
    : ref([]);
  const fileList = computed(() =>
    value.value.map((i) => ({
      path: import.meta.env.VITE_MINIO_PATH + i,
      name: i.split('/').at(-1),
    })),
  );

  const getFileList = async () => {
    const ids = value.value.map((i) => {
      console.log(i.split('/'));
      return i.split('/')[2];
    });
    const list = (await postFileResourceList({ ids })) || [];

    return list.map((item) => {
      return {
        path: import.meta.env.VITE_MINIO_PATH + item.url,
        name: item.name,
        size: sizeParser(item.size) || item.size?.toString(),
        type: item.type,
        uploader: item.createUserId,
        uploadTime: item.createTime,
      };
    });
  };

  const updateValue = async (fileValue) => {
    value.value = fileValue;
    await nextTick();
    if (enableAutofill) {
      const files = (await getFileList()) || [];
      /**多个文件只选第一个文件数据填充 */
      autofillRules.forEach(({ fromField, toField }) => {
        formData.value[toField] = files[files?.length - 1]?.[fromField];
      });
    }
    Event.runEventByName('onChange', props.widget.events, props.modelValue);
  };

  const beforeUpload = (file) => {
    return Event.runEventByName('onValidator', props.widget.events, file);
  };

  const saveTableRowData = () => {
    Event.runEventByName('onChange', props.widget.events, props.modelValue);
    /**列字段时候触发保存 */
    emit('saveTableRow');
  };

  const getPopupContainer = () =>
    document.body.querySelector('.upload-file-wrapper') || document.body;

  async function downFile(item) {
    downloadByUrl({ url: item.path });
  }

  const openPopover = () => {
    if (displayType === 'concise') {
      visible.value = !visible.value;
    }
  };
</script>

<style lang="less">
  .upload-file-wrapper {
    width: 100%;

    .table-field-box {
      display: flex;
      align-items: center;
      width: 100%;

      .icon-color {
        color: var(--ant-primary-color);
        font-size: 16px;
        cursor: pointer;
      }

      .field-name-box {
        display: flex;
        flex: 1;
        align-items: center;
        width: calc(100% - 32px);
        height: 22px;

        .highlight {
          &:hover {
            color: var(--ant-primary-color);
            cursor: pointer;
          }
        }

        .field-name {
          height: 22px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          > span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            // display: block;
            cursor: pointer;

            &:hover {
              color: var(--ant-primary-color);
            }
          }

          &.readonly {
            width: calc(100% - 16px);
          }
        }
      }

      .field-more {
        width: 28px;
        margin-left: 4px;
        color: var(--ant-primary-color);
        cursor: pointer;
      }
    }
  }

  .upload-field-con {
    .ant-popover-inner-content {
      padding: 16px;
    }
  }

  .masking {
    position: fixed;
    z-index: 1000;
    inset: 0;
    background: rgb(0 0 0 / 45%);
  }
</style>
