<template>
  <a-popover
    v-if="fileList && fileList.length"
    v-model:visible="visible"
    trigger="click"
    :overlayStyle="{ width: '390px' }"
  >
    <template #content>
      <div v-for="(file, index) of omissionList" :key="index" class="file-list__item flex">
        <SvgIcon
          v-if="Array.isArray(props.fileList)"
          class="file-list__item-svg, no-size"
          :size="20"
          :name="fileTypeParser(file)"
        />

        <div class="file-list__item-name ell">
          <span @click.stop="downFile(file)" :title="file?.name || file">
            {{ file?.name || file }}
          </span>
        </div>
      </div>
    </template>
    <div v-for="(file, index) of nonOmissionList" :key="index" class="file-list__item flex">
      <SvgIcon
        v-if="Array.isArray(props.fileList)"
        :class="['file-list__item-svg', !hasSize ? 'no-size' : '']"
        :size="20"
        :name="fileTypeParser(file)"
      />

      <div class="file-list__item-name ell">
        <span @click.stop="downFile(file)" :title="file?.name || file">
          {{ file?.name || file }}
        </span>
      </div>
    </div>
    <div v-if="omissionList.length" class="more">
      {{ t('sys.pageDesigner.more') }}
    </div>
  </a-popover>
  <span v-else>{{ displayValue }}</span>
</template>
<script setup lang="ts">
  import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { typeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import { SvgIcon } from '/@/components/Icon';
  import { downloadByUrl } from '/@/utils/file/download';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

  const props = defineProps<{ fileList: string | Array }>();
  const { displayValue } = useGlobalSetting();
  const { t } = useI18n();
  const visible = ref(false);

  const nonOmissionList = computed(() => {
    if (!props.fileList || !props.fileList.length) {
      return [];
    }
    if (Array.isArray(props.fileList)) {
      return props.fileList.slice(0, 5);
    }
    return props.fileList.split(',').slice(0, 5);
  });
  const omissionList = computed(() => {
    if (!props.fileList || !props.fileList.length) {
      return [];
    }
    if (Array.isArray(props.fileList)) {
      return props.fileList.filter((_, index) => index > 4);
    }
    return props.fileList.split(',').filter((_, index) => index > 4);
  });
  const fileTypeParser = computed(() => {
    return (item) => {
      return typeParser(item.name);
    };
  });
  function downFile(item) {
    if (!item?.url) {
      downloadByUrl({ url: import.meta.env.VITE_MINIO_PATH + item });
    } else {
      downloadByUrl({ url: import.meta.env.VITE_MINIO_PATH + '/' + item.url });
    }
  }
</script>
<style lang="scss" scoped>
  .more {
    width: 35px;
    margin-left: 4px;
    color: var(--ant-primary-color);
    cursor: pointer;
  }
  .file-list__item {
    &-name {
      &:hover {
        color: var(--ant-primary-color);
        cursor: pointer;
      }
    }
  }
</style>
