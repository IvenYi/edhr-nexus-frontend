<template>
  <vantButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="gct-sub-add-button">
  import { inject, ref, toRefs } from 'vue';
  import { BaseButton } from '/@page-designer/types/mobile';
  import { showConfirmDialog } from 'vant';
  import vantButton from '../../__components__/vantButton.vue';

  const props = defineProps<{ widget: BaseButton }>();

  const loading = ref(false);
  const btnMethod: Fn = inject('sub-table-add-method') || function () {};
  async function onclick() {
    try {
      if (confirm?.value) {
        showConfirmDialog({
          message: confirmText.value || t('sys.pageDesigner.confirmTodo'),
        })
          .then(() => {
            btnMethod(props.widget);
          })
          .catch(() => {});
      } else {
        btnMethod(props.widget);
      }
    } catch (error) {}
    loading.value = false;
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
