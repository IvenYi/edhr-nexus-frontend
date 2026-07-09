<template>
  <div>
    <van-action-sheet
      v-model:show="show"
      :actions="actions"
      cancel-text="取消"
      close-on-click-action
      @select="handleSelect"
    />
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from '@mobile/utils/useI18n';

  const { t } = useI18n();
  const emit = defineEmits(['select']);
  const show = ref(false);

  const open = () => {
    show.value = true;
  };

  const actions = [
    {
      name: t('sys.pageDesigner.handwrittenSignature'),
      value: 'write',
    },
    {
      name: t('sys.platform.ACCOUNT'),
      value: 'account',
    },
  ];

  const handleSelect = (action) => {
    emit('select', action);
  };

  defineExpose({ open });
</script>
<style lang="less" scoped></style>
