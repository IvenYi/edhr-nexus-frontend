<template>
  <div v-if="computedFileList.length" class="img-wrap ks-row" @click.stop="onClick">
    <div class="ks-col img-list">
      <van-image
        v-for="(e, i) in computedFileList"
        :key="i"
        width="36"
        height="20"
        :error-icon="imageError"
        :src="e.url"
      />
    </div>
    <span class="more-btn">{{ t('sys.pageDesigner.more') }}</span>
  </div>
  <ImgPopup
    ref="ImgPopupRef"
    :displayStyle="displayStyle"
    :imgList="computedFileList"
    :signatureType="signatureType"
    @click.stop
  />
</template>
<script setup lang="ts">
  import { computed, nextTick, ref, toRefs, inject } from 'vue';
  import { Signature } from '/@page-designer/types/mobile';
  import { useI18n } from '@mobile/utils/useI18n';
  // import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import ImgPopup from './component/imgListPopup.vue';
  // import vantField from '../../__components__/vantField.vue';
  import { MOBILE_MINIO_PATH } from '@mobile/utils/const';
  import imageError from '/@page-designer/assets/img-error.svg';
  import { getSignatureImageUrl } from './component/signature-image.ts';
  const props = defineProps<{
    modelValue?: string;
    widget: Signature;
    formData: Object;
  }>();

  inject('form-layout', {});

  const { t } = useI18n();
  // const Event = getPageEvent();
  const emit = defineEmits(['update:modelValue']);
  // const formData = ref(props.formData);
  const { signatureType, displayStyle } = toRefs(props.widget.props);
  const ImgPopupRef = ref();

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
        },
      })
    : ref([]);

  const computedFileList = computed(() => {
    return fileList.value.map((e) => {
      return {
        ...e,
        url: getSignatureImageUrl(e.url, e.username),
        isImage: true,
      };
    });
  });

  const onClick = async () => {
    await nextTick();
    ImgPopupRef.value.open();
  };
</script>
<style lang="less" scoped>
  .img-wrap {
    // width: 100%;
    overflow: hidden;
    margin: 0 -10px;
    padding: 11px 10px;

    .img-list {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .more-btn {
      display: none;
      width: 36px;
      text-align: right;
    }

    img {
      background-color: rgb(0 0 0 / 45%);

      & + img {
        margin-left: 4px;
      }
    }
  }

  :deep(.van-image) {
    // background-color: rgb(0 0 0 / 45%);
    border: 1px dashed #e8ebf0;
    border-radius: 2px;

    & + .van-image {
      margin-left: 4px;
    }

    .van-icon__image {
      width: 20px;
      height: 16px;
    }
  }

  :deep(.van-cell__value) {
    width: 100%;
    overflow: hidden;
  }
</style>
