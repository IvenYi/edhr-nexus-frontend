<template>
  <div v-if="esopList.length" class="file-list__item flex">
    <div
      v-if="esopList[0].type"
      :class="['left-icon', 'w-18px', 'h-22px', iconBgImage(esopList[0].type)]"
      :style="{
        '--bg-image': iconBgImage(esopList[0].type),
      }"
    ></div>

    <div class="label ell">
      <span @click.stop="openView" :title="esopList[0]?.name || esopList[0]">{{
        esopList[0]?.name || esopList[0]
      }}</span>
    </div>
  </div>
  <span v-else>{{ displayValue }}</span>
  <ViewModal
    v-if="esopList.length"
    ref="viewModal"
    @register="register"
    :source="source"
    :fileType="iconBgImage(esopList[0].type)"
    :fileName="esopList[0]?.name || esopList[0]"
  />
</template>
<script setup lang="ts">
  import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
  import { useModal } from '/@/components/Modal';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';
  import ViewModal from '/@page-designer/components/widgets/web//field/e-sop/modal/view-modal.vue';
  const enum UploadTypeEnum {
    JPG = 'JPG',
    JPEG = 'JPEG',
    PNG = 'PNG',
    PDF = 'PDF',
    MP4 = 'MP4',
  }

  const enum fileTypeEnum {
    PICTURE = 'picture',
    PDF = 'pdf',
    VIDEO = 'video',
  }
  const { displayValue } = useGlobalSetting();

  const [register, { openModal }] = useModal();
  const props = defineProps<{ fileList: string | Array }>();
  const esopList = computed(() => {
    if (!props.fileList || !props.fileList.length) {
      return [];
    }
    if (Array.isArray(props.fileList)) {
      return props.fileList.slice(0, 5);
    }
    return props.fileList.split(',').slice(0, 5);
  });
  const iconBgImage = (type) => {
    if ([UploadTypeEnum.JPG, UploadTypeEnum.JPEG, UploadTypeEnum.PNG].includes(type)) {
      // return `url('/@page-designer/assets/${fileTypeEnum.PICTURE}.png')`;
      return fileTypeEnum.PICTURE;
    }
    if (UploadTypeEnum.PDF === type) {
      // return `url('/@page-designer/assets/${fileTypeEnum.PDF}.png')`;
      return fileTypeEnum.PDF;
    }
    if (UploadTypeEnum.MP4 === type) {
      // return `url('/@page-designer/assets/${fileTypeEnum.VIDEO}.png')`;
      return fileTypeEnum.VIDEO;
    }
    return '';
  };

  const source = computed(() => {
    const path =
      esopList.value[0].url || esopList.value[0]
        ? /^https?:\/\//.test(esopList.value[0].url || esopList.value[0])
          ? esopList.value[0].url || esopList.value[0]
          : import.meta.env.VITE_MINIO_PATH + '/' + (esopList.value[0].url || esopList.value[0])
        : '';

    if (
      (iconBgImage(esopList.value[0].type) &&
        iconBgImage(esopList.value[0].type) === fileTypeEnum.PDF) ||
      (esopList.value[0] && !esopList.value[0].type && esopList.value[0].endsWith('.pdf'))
    ) {
      return {
        url: path,
        cMapUrl:'/VuePdf/cmaps/',
        cMapPacked: true,
      };
    } else {
      return path;
    }
  });

  const openView = () => {
    openModal();
  };
</script>
<style lang="less" scoped>
  .left-icon {
    margin-right: 8px;
    // background-image: var(--bg-image);
    background-repeat: no-repeat;
    background-size: 100% 100%;

    &.picture {
      background-image: url('/@page-designer/assets/picture.png');
    }

    &.pdf {
      background-image: url('/@page-designer/assets/pdf.png');
    }

    &.video {
      background-image: url('/@page-designer/assets/video.png');
    }
  }

  .label {
    cursor: pointer;

    &:hover {
      color: var(--ant-primary-color);
    }
  }
</style>
