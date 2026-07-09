<template>
  <a-popover
    v-if="fileList && fileList.length"
    v-model:visible="visible"
    trigger="click"
    :overlayStyle="{ width: '392px' }"
  >
    <template #content>
      <div class="flex items-center list" v-if="omissionList.length">
        <div v-for="(file, index) of omissionList" :key="index" class="file-list__item mr-12px">
          <a-image width="110px" height="64px" :src="sysPath + '/' + file.url">
            <template #previewMask>
              <zoom-in-outlined />
            </template>
          </a-image>

          <div class="file-list__item-name ell">
            {{ handleTime(file.time) }}
          </div>
        </div>
      </div>
    </template>
    <div class="flex items-center">
      <div v-for="(file, index) of nonOmissionList" :key="index" class="file-list__item flex">
        <a-image width="110px" height="64px" :src="sysPath + '/' + file.url">
          <template #previewMask>
            <zoom-in-outlined />
          </template>
        </a-image>

        <div class="file-list__item-name ell">
          {{ handleTime(file.time) }}
        </div>
      </div>
      <div v-if="omissionList.length" class="more">
        {{ t('sys.pageDesigner.more') }}
      </div>
    </div>
  </a-popover>
  <span v-else>{{ displayValue }}</span>
</template>
<script setup lang="ts">
  import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { typeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import { SvgIcon } from '/@/components/Icon';
  import dayjs from 'dayjs';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

  const props = defineProps<{ fileList: string }>();
  const { displayValue } = useGlobalSetting();
  const { t } = useI18n();
  const visible = ref(false);
  const sysPath = ref(import.meta.env.VITE_MINIO_PATH);
  const nonOmissionList = computed(() => {
    if (!props.fileList) {
      return [];
    }

    return JSON.parse(props.fileList).slice(0, 2);
  });
  const omissionList = computed(() => {
    if (!props.fileList) {
      return [];
    }

    return JSON.parse(props.fileList).filter((_, index) => index > 1);
  });
  const handleTime = (value) => {
    return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
  };
</script>
<style lang="scss" scoped>
  .more {
    width: 35px;
    margin-left: 4px;
    color: var(--ant-primary-color);
    cursor: pointer;
  }
  .file-list__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    &-name {
      font-size: 12px;
    }
  }
  .list {
    flex-wrap: wrap;
  }
</style>
