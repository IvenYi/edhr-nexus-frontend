<template>
  <vantButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="gct-reset-button">
  import { ref, toRefs, onBeforeMount, computed, watchEffect, reactive } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { BaseButton } from '/@page-designer/types/mobile';
  import { showConfirmDialog, showToast } from 'vant';
  import vantButton from '../../__components__/vantButton.vue';

  const props = defineProps<{ widget: BaseButton }>();
  const { refForm, resetRule } = reactive(props.widget.props);
  const Event = getPageEvent();
  const loading = ref(false);

  const refFormGroup = computed(() => {
    if (refForm && typeof refForm === 'string') {
      return [refForm];
    } else {
      return refForm || [];
    }
  });
  watchEffect(() => {});
  async function onclick() {
    try {
      if (!refFormGroup.value.length) return;
      loading.value = true;
      await Event.runEventByName('beforeReset', props.widget.events);
      await Event.runEventByName('onClick', props.widget.events);
      for (let k of refFormGroup.value) {
        const form: any = await Event.getSyncComponent(k);
        await form.reset(resetRule);
      }
      showToast($t('sys.resetSuccess'));
      await Event.runEventByName('afterReset', props.widget.events);
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
