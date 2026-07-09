<template>
  <custom-button
    v-if="false"
    :class="[ns.b()]"
    :title="t('sys.file') + t('sys.component.userCmp.import')"
    @btn-left-click="$emit('importData')"
    @btn-right-click="$emit('downloadTemplate')"
  >
    <template #left-icon>
      <download-outlined />
    </template>
    <template #right-icon>
      <vertical-align-bottom-outlined />
    </template>
  </custom-button>
</template>

<script lang="ts" setup name="import-button">
  import { useNamespace } from '@gct/runtime';
  import { DownloadOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons-vue';
  import { CustomButton } from '/@/components/Button/index';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const ns = useNamespace('import-button');

  defineEmits<{
    (e: 'importData'): void;
    (e: 'downloadTemplate'): void;
  }>();
</script>

<style lang="scss" scoped>
  $import-button: ();

  @include b(import-button) {
    @include set-component-css-var(import-button, $import-button);
  }
</style>
