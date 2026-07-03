<template>
  <div class="upload-image-wrapper" :class="wrapperClass" @click.stop>
    <!-- <div class="masking" v-show="visible" @click.stop></div> -->
    <a-popover
      :placement="!readonly ? 'bottomLeft' : 'bottomRight'"
      v-model:visible="visible"
      trigger="click"
      :overlayStyle="{ width: imgList.length > 12 ? '390px' : '386px' }"
      :overlayClassName="getClassName + ' vxe-table--ignore-clear'"
      :getPopupContainer="PopupContainer"
    >
      <template #content>
        <ImageUpload
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
          :getContainer="imgUploadContainer"
          @update:modelValue="updateValue"
          @saveTableRow="saveTableRowData"
        />
      </template>
      <div class="table-field-box" @click.stop v-if="(imgList.length && readonly) || !readonly">
        <PlusOutlined v-show="!readonly" class="icon-color pr-4px" />
        <div @click.stop class="image-list-box">
          <template v-if="imgList.length">
            <a-image-preview-group
              :preview="{
                getContainer: getContainer,
              }"
            >
              <a-image
                v-for="(item, index) in imgList"
                :key="index"
                width="22px"
                height="22px"
                :class="{ 'image-hide': index >= displayMaxNum }"
                :src="item.path"
              >
                <template #previewMask>
                  <zoom-in-outlined />
                </template>
              </a-image>
            </a-image-preview-group>
          </template>
        </div>
        <div v-if="readonly && imgList.length > displayMaxNum" class="more">{{
          t('sys.pageDesigner.more')
        }}</div>
      </div>
    </a-popover>
  </div>
</template>

<script name="gct-upload-image" setup lang="ts">
  import { reactive, computed, ref, nextTick, onBeforeMount } from 'vue';
  import { Form } from 'ant-design-vue';
  import { UploadFile } from '/@page-designer/types/web';
  import { downloadByUrl } from '/@/utils/file/download';
  import { getPageEvent, useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/hooks';
  import { ImageUpload } from '/@/components/ImageUpload';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { cloneDeep } from 'lodash-es';
  import { uuid2 } from '/@/utils/uuid';
  import { getParentPopupContainer } from '/@page-designer/components/widgets/hooks/listhook';

  const { t } = useI18n();

  const Event = getPageEvent();
  const formItemContext = Form.useInjectFormItemContext();
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

  const { disabled, readonly, field, modelKey, displayMaxNum } = reactive(props.widget.props);
  const formData = ref(props.formData);
  const { getFileAttrs, attrObj } = useAsyncFileAttrs();
  const visible = ref<boolean>(false);

  const getClassName = 'upload-image-container' + uuid2(16, 16);
  const wrapperClass = 'image-wrapper' + uuid2(16, 16);

  onBeforeMount(() => {
    getFileAttrs({ fieldKey: field, modelKey: modelKey });
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
  const imgList = computed(() =>
    value.value.map((i) => ({
      path: import.meta.env.VITE_MINIO_PATH + i,
      name: i.split('/').at(-1),
    })),
  );

  const showImageList = computed(() => {
    const arrClone = cloneDeep(imgList.value);
    return arrClone.slice(0, displayMaxNum);
  });

  const updateValue = async (fileValue) => {
    value.value = fileValue;
    await nextTick();
    // if (enableAutofill) {
    //   /**多个文件只选第一个文件数据填充 */
    //   autofillRules.forEach(({ fromField, toField }) => {
    //     formData.value[toField] = fileList.value[fileList.value.length - 1]?.[fromField];
    //   });
    // }
    Event.runEventByName('onChange', props.widget.events, props.modelValue, formData.value);
  };

  const beforeUpload = (file) => {
    return Event.runEventByName('onValidator', props.widget.events, file, formData.value);
  };

  const saveTableRowData = () => {
    Event.runEventByName('onChange', props.widget.events, props.modelValue, formData.value);
    /**列字段时候触发保存 */
    emit('saveTableRow');
  };

  async function downFile(item) {
    downloadByUrl({ url: item.path });
  }

  const getContainer = () => document.body.querySelector(`.${wrapperClass}`) || document.body;

  const imgUploadContainer = () => document.body.querySelector(`.${getClassName}`) || document.body;
</script>

<style lang="less" scoped>
  .upload-image-wrapper {
    width: 100%;

    .table-field-box {
      display: flex;
      align-items: center;
      width: 100%;
      height: 40px;

      .icon-color {
        color: var(--ant-primary-color);
        font-size: 16px;
        cursor: pointer;
      }

      .image-list-box {
        width: 100%;
        height: 24px;
        overflow: hidden;
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
    box-sizing: content-box;
    margin-right: 4px;
    border: 1px dashed#d9d9d9;
    border-radius: 2px;
    // display: flex;
    // justify-content: center;
    // align-items: center;
    .ant-image-img {
      vertical-align: top;
    }

    .ant-image-img,
    .ant-image-mask {
      visibility: visible;
      border-radius: 2px;
    }
  }

  :deep(.image-list-box .ant-image:has(.ant-image-img.image-hide)) {
    height: 0 !important;
    border: 0;

    .ant-image-img,
    .ant-image-mask {
      visibility: hidden;
      height: 0 !important;
    }
  }

  .masking {
    position: fixed;
    z-index: 1000;
    inset: 0;
    background: rgb(0 0 0 / 45%);
  }
</style>
