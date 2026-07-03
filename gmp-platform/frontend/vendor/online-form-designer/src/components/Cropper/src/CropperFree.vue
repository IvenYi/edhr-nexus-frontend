<template>
  <div :class="[prefixCls, disabled && 'not-allow']" id="dropzone">
    <template v-if="sourceValueForamtted">
      <div :class="`${prefixCls}__wrapper`">
        <img :src="sourceValueForamtted" />
      </div>
      <div :class="`${prefixCls}__mask`">
        <Icon icon="ant-design:eye-outlined" :size="24" color="#ffffff" @click="handlePreview" />
        <Icon icon="ant-design:edit-outlined" :size="24" color="#ffffff" @click="openModal" />
        <Icon icon="ant-design:delete-outlined" :size="24" color="#ffffff" @click="handleDelete" />
      </div>
    </template>
    <div v-else :class="`${prefixCls}__trigger`" @click="openModal">
      <i v-if="icon" class="iconfont icon-tupian-shili"></i>
      <Icon v-else icon="ant-design:plus-outlined" :size="36" />
      <template v-if="isDrag">
        <p class="prompt">{{ $t('sys.pageDesigner.clickOrDragToUpload') }}</p>
        <p class="auxiliary" v-if="accept">{{
          `支持${accept?.join('、')}图片格式，大小100KB以内`
        }}</p>
      </template>
      <template v-if="!auxiliary">
        {{ t('sys.clickToDoSth', { sth: t('sys.add') }) }}
      </template>
    </div>

    <CopperFreeModal
      @register="register"
      @upload-success="handleUploadSuccess"
      :uploadApi="uploadApi"
      :aspectRatio="aspectRatio"
      :src="sourceValueForamtted"
      :accept="accept"
      :beforeUpload="beforeUpload"
      :title="modalTitle"
      :uploadText="uploadText"
    />
  </div>
</template>
<script lang="ts">
  import {
    defineComponent,
    computed,
    ref,
    watchEffect,
    watch,
    onBeforeUnmount,
    onMounted,
  } from 'vue';
  import CopperFreeModal from './CopperFreeModal.vue';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import Icon from '@/components/Icon/Icon.vue';
  import { fileUrlParser } from '../hooks/useFile';
  import { createImgPreview } from '/@/components/Preview';

  const props = {
    value: { type: String },
    uploadApi: { type: Function },
    aspectRatio: { type: Number },
    auxiliary: { type: String },
    icon: { type: String },
    isDrag: { type: Boolean, default: false },
    accept: { type: Array<string> },
    beforeUpload: { type: Function },
    modalTitle: { type: String },
    uploadText: { type: String },
    disabled: { type: Boolean, default: false },
  };

  export default defineComponent({
    name: 'CropperPhoto',
    components: { CopperFreeModal, Icon },
    props,
    emits: ['update:value', 'change'],
    setup(props, { emit, expose }) {
      const sourceValue = ref(props.value || '');
      const sourceValueForamtted = computed(() => {
        return sourceValue.value ? fileUrlParser(sourceValue.value) : '';
      });

      let proviewInstance: any = null;

      const prefixCls = 'cropper-photo';
      const [register, { openModal, closeModal }] = useModal();
      const { createMessage } = useMessage();
      const { t } = useI18n();

      const getClass = computed(() => [prefixCls]);

      const disabled = computed(() => {
        return props.disabled;
      });

      const acceptList = computed(() => {
        return props.accept?.length
          ? [
              ...new Set(
                props.accept?.some((i) => i === 'jpg' || i === 'jpeg')
                  ? props.accept?.concat(['jpg', 'jpeg'])
                  : props.accept,
              ),
            ].map((i) => 'image/' + i)
          : ['image/jpg', 'image/jpeg', 'image/png'];
      });

      watchEffect(() => {
        sourceValue.value = props.value || '';
      });

      watch(
        () => sourceValue.value,
        (v: string) => {
          emit('update:value', v);
        },
      );

      onBeforeUnmount(() => {
        proviewInstance && proviewInstance.close();
      });

      onMounted(() => {
        const dropzone = document.getElementById('dropzone');
        dropzone?.addEventListener('dragover', (e) => {
          e.stopPropagation(); // 阻止默认行为，允许放置数据到目标区域
          e.preventDefault(); // 禁用默认的拖放效果（如高亮）
        });
        dropzone?.addEventListener('drop', (e) => {
          e.stopPropagation(); // 阻止默认行为，允许放置数据到目标区域
          e.preventDefault(); // 禁用默认的拖放效果（如高亮）
          const file = e.dataTransfer?.files[0]; // 获取拖拽的文件对象
          console.log(e, file);
          if (file) {
            if (!acceptList.value.includes(file.type)) {
              createMessage.warning(t('sys.component.cropper.acceptTip'));
              return;
            }
            openModal(true, { file: file });
          }
        });
      });

      function handleUploadSuccess({ source, data }) {
        sourceValue.value = data;
        emit('change', { source, data });
        // createMessage.success(t('sys.component.cropper.uploadSuccess'));
      }

      function handlePreview() {
        proviewInstance = createImgPreview({
          imageList: [sourceValueForamtted.value],
        });
      }

      function handleDelete() {
        sourceValue.value = '';
      }

      expose({ openModal: openModal.bind(null, true), closeModal });
      return {
        t,
        prefixCls,
        register,
        openModal: openModal as any,
        getClass,
        handleDelete,
        handleUploadSuccess,
        handlePreview,
        sourceValue,
        sourceValueForamtted,
        disabled,
      };
    },
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'cropper-photo';

  .@{prefix-cls} {
    display: inline-block;
    position: relative;
    width: var(--width, 200px);
    height: var(--height, 120px);
    overflow: hidden;
    text-align: center;
    cursor: pointer;

    &__trigger {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      border: 1px dashed @border-color-base;
      border-radius: 4px;
      background: #fbfbfc;
      color: #9b9b9b;

      .iconfont {
        color: #c3c3c3;
        font-size: 32px;
      }

      .ant-icon {
        margin-bottom: 3px;
        color: #666;
      }

      .prompt,
      .auxiliary {
        margin: 0;
      }

      .prompt {
        color: #797a7d;
      }

      .auxiliary {
        color: #c3c3c3;
      }
    }

    &__mask {
      display: flex;
      position: absolute;
      top: 0;
      left: 0;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      transition: all 0.3s;
      border-radius: 4px;
      opacity: 0;
      background: rgb(0 0 0 / 40%);

      .anticon {
        margin-right: 20px;
      }

      .anticon:last-child {
        margin-right: 0;
      }

      &:hover {
        opacity: 40;
      }
    }

    &__wrapper {
      width: 100%;
      // padding: 10px;
      height: 100%;
      border: 1px solid @border-color-base;
      border-radius: 4px;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }

  .not-allow {
    cursor: default;
    pointer-events: none;
  }

  .defult-img {
    position: absolute;
    z-index: 2;
    border: 1px solid #d9d9d9;
    background: #fafafa;
  }
</style>
