<template>
  <div>
    <div v-if="propValue" class="ks-row-middle p5px bg-[#f1f1f1]">
      <div class="ks-col ell">{{ fileName }}</div>
      <delete-outlined class="ant-btn-error ant-btn-link" @click="propValue = ''" />
    </div>
    <a-button block @click="changeCallback" v-else size="small">
      <template #icon>
        <setting-outlined />
      </template>
      {{ t('sys.pageDesigner.uploadtemplate') }}
    </a-button>
  </div>
</template>

<script setup lang="ts" name="upload-template-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Uploader } from '@/utils/uploader';
  import { computed } from 'vue';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

  async function changeCallback() {
    const [file] = await Uploader.getFiles({ multiple: false });
    propValue.value = await Uploader.uploadByFile(file, true);
  }
  const fileName = computed(() => {
    return propValue.value.split('/').at(-1);
  });
</script>

<style lang="less" scoped></style>
