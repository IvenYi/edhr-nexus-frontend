<template>
  <basicButton
    v-if="Object.prototype.hasOwnProperty.call(widget.props, 'basic')"
    type="primary"
    @click="sumbit"
    v-bind="basic"
    :loading="loading"
  >
    {{ title }}</basicButton
  >
  <!-- 新版本的BaseButton -->
  <baseButton :widget="widget" v-else v-bind="widget.props" @click="sumbit" />
</template>

<script setup lang="ts" name="gct-delete-button">
  import basicButton from '../../__components__/basic_button.vue';
  import baseButton from '../../__components__/base_button.vue';
  import { ref, toRefs, onBeforeMount, onMounted, watchEffect, reactive } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Button } from '/@page-designer/types/web';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const props = defineProps<{ widget: Button }>();
  const { title, refForm, basic, refList } = reactive(props.widget.props);
  const Event = getPageEvent();
  const loading = ref(false);
  async function sumbit() {
    try {
      loading.value = true;
      const form = await Event.getSyncComponent(refForm);
      await form.deleteData();
      if (refList) {
        const list = await Event.getSyncComponent(refList);
        list.reload!();
      }
      await Event.runEventByName('onClick', props.widget.events);
    } catch (error) {
      console.error(error);
    }

    loading.value = false;
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
