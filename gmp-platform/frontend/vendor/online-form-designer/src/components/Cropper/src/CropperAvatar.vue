<template>
  <div :class="getClass" :style="getStyle">
    <div :class="`${prefixCls}-image-wrapper`" :style="getImageWrapperStyle" @click="openModal">
      <div :class="`${prefixCls}-image-mask`" :style="getImageWrapperStyle">
        <Icon
          icon="ant-design:edit-outlined"
          :size="getIconWidth"
          :style="getImageWrapperStyle"
          color="#d6d6d6"
        />
      </div>
      <img :src="value ? sourceValue : defaultSrc" alt="avatar" />
    </div>
    <a-button
      :class="`${prefixCls}-upload-btn`"
      @click="openModal"
      v-if="showBtn"
      v-bind="btnProps"
    >
      {{ btnText ? btnText : t('sys.component.cropper.selectImage') }}
    </a-button>

    <CopperModal
      @register="register"
      @upload-success="handleUploadSuccess"
      :uploadApi="uploadApi"
      :src="sourceValue"
      :sourceUrlValue="sourceUrlValue"
    />
  </div>
</template>
<script lang="ts">
  import {
    defineComponent,
    computed,
    CSSProperties,
    unref,
    ref,
    watchEffect,
    watch,
    PropType,
  } from 'vue';
  import CopperModal from './CopperModal.vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { ButtonProps } from '/@/components/Button';
  import Icon from '@/components/Icon/Icon.vue';
  import { transformUrl } from '../hooks/useFile';
  import { useGlobSetting } from '/@/hooks/setting';

  const props = {
    width: { type: [String, Number], default: '200px' },
    value: { type: String },
    showBtn: { type: Boolean, default: true },
    btnProps: { type: Object as PropType<ButtonProps> },
    btnText: { type: String, default: '' },
    uploadApi: { type: Function },
  };

  export default defineComponent({
    name: 'CropperAvatar',
    components: { CopperModal, Icon },
    props,
    emits: ['update:value', 'change'],
    setup(props, { emit, expose }) {
      const globSetting = useGlobSetting();
      const sourceValue = ref(transformUrl(props.value));

      const defaultSrc = ref(transformUrl(globSetting.defaultAvatar));
      const sourceUrlValue = ref(props.value || '');
      const { prefixCls } = useDesign('cropper-avatar');
      const [register, { openModal, closeModal }] = useModal();
      const { createMessage } = useMessage();
      const { t } = useI18n();
      // 获取默认头像

      const getClass = computed(() => [prefixCls]);

      const getWidth = computed(() => `${props.width}`.replace(/px/, '') + 'px');

      const getIconWidth = computed(() => parseInt(`${props.width}`.replace(/px/, '')) / 2 + 'px');

      const getStyle = computed((): CSSProperties => ({ width: unref(getWidth) }));

      const getImageWrapperStyle = computed(
        (): CSSProperties => ({ width: unref(getWidth), height: unref(getWidth) }),
      );

      watchEffect(() => {
        sourceValue.value = transformUrl(props.value) || '';
        sourceUrlValue.value = props.value || '';
      });

      watch(
        () => sourceUrlValue.value,
        (v: string) => {
          emit('update:value', v);
        },
      );

      function handleUploadSuccess({ source, data }) {
        sourceValue.value = transformUrl(data);
        sourceUrlValue.value = data;
        emit('change', { source, data });
        // createMessage.success(t('sys.model.modifySuccess'));
      }

      expose({ openModal: openModal.bind(null, true), closeModal });

      return {
        t,
        prefixCls,
        register,
        openModal: openModal as any,
        getIconWidth,
        sourceValue,
        getClass,
        getImageWrapperStyle,
        getStyle,
        handleUploadSuccess,
        defaultSrc,
      };
    },
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-cropper-avatar';

  .@{prefix-cls} {
    display: inline-block;
    text-align: center;

    &-image-wrapper {
      overflow: hidden;
      border: 1px solid @border-color-base;
      border-radius: 50%;
      background: @component-background;
      cursor: pointer;
      position: relative;

      img {
        width: 100%;
      }
    }

    &-image-mask {
      position: absolute;
      width: inherit;
      height: inherit;
      transition: opacity 0.4s;
      border: inherit;
      border-radius: inherit;
      opacity: 0;
      background: rgb(0 0 0 / 40%);
      cursor: pointer;
      left: -1px;
      top: -1px;

      :deep(svg) {
        margin: auto;
        width: 24px;
        height: 24px;
      }
    }

    &-image-mask:hover {
      opacity: 40;
    }

    &-upload-btn {
      margin: 10px auto;
    }
  }
</style>
