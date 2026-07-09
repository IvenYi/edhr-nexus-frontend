<template>
  <a-popover
    v-if="fileList && fileList.length"
    v-model:visible="visible"
    trigger="click"
    :overlayStyle="{ width: '390px' }"
  >
    <template #content>
      <div class="img-box flex w100%" v-if="omissionList.length">
        <a-image-preview-group>
          <div class="img-item mr-8px my-4px" v-for="(item, index) in omissionList" :key="index">
            <a-image width="80px" height="80px" :src="'/minio' + item">
              <template #previewMask>
                <zoom-in-outlined />
              </template>
            </a-image>
          </div>
        </a-image-preview-group>
      </div>
    </template>
    <div class="table-field-box" @click.stop>
      <div @click.stop class="image-list-box">
        <template v-if="nonOmissionList.length">
          <a-image-preview-group>
            <a-image
              v-for="(item, index) in nonOmissionList"
              :key="index"
              width="22px"
              height="22px"
              :class="{ 'image-hide': index >= 5 }"
              :src="'/minio' + item"
            >
              <template #previewMask>
                <zoom-in-outlined />
              </template>
            </a-image>
          </a-image-preview-group>
        </template>
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
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

  const props = defineProps<{ fileList: string }>();
  const { displayValue } = useGlobalSetting();
  const { t } = useI18n();
  const visible = ref(false);

  const nonOmissionList = computed(() => {
    if (!props.fileList) {
      return [];
    }

    return props.fileList.split(',').slice(0, 5);
  });
  const omissionList = computed(() => {
    if (!props.fileList) {
      return [];
    }
    return props.fileList.split(',').filter((_, index) => index > 4);
  });
</script>
<style lang="scss" scoped>
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
  }
  .more {
    width: 35px;
    margin-left: 4px;
    color: var(--ant-primary-color);
    cursor: pointer;
  }
</style>
