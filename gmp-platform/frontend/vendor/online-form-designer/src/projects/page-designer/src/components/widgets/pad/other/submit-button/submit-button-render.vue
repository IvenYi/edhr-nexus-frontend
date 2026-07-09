<template>
  <vantButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="gct-submit-button">
  import { ref, toRefs, onBeforeMount, onMounted, watchEffect, reactive } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { BaseButton } from '/@page-designer/types/mobile';
  import { showConfirmDialog, showToast } from 'vant';
  import vantButton from '../../__components__/vantButton.vue';

  const props = defineProps<{ widget: BaseButton }>();
  const { refForm } = toRefs(props.widget.props);
  const Event = getPageEvent();
  const loading = ref(false);

  onBeforeMount(() => {});
  onMounted(async () => {});
  watchEffect(() => {});
  async function onclick() {
    try {
      if (!refForm?.value) return;
      loading.value = true;
      const form = await Event.getSyncComponent(refForm.value);
      await Event.runEventByName('beforeSubmit', props.widget.events, form.getValue!());
      //设计页面已经废弃
      await Event.runEventByName('onClick', props.widget.events);
      let id = await form.submit!();
      await Event.runEventByName('afterSubmit', props.widget.events, id);
      showToast($t('sys.submitSuccess'));
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
