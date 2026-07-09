<template>
  <basicButton
    v-if="Object.prototype.hasOwnProperty.call(widget.props, 'basic')"
    type="primary"
    @click="reset"
    :loading="loading"
    v-bind="basic"
  >
    {{ title }}</basicButton
  >
  <!-- 新版本的BaseButton -->
  <baseButton :widget="widget" v-else v-bind="widget.props" :loading="loading" @click="reset" />
</template>

<script setup lang="ts" name="gct-reset-button">
  import basicButton from '../../__components__/basic_button.vue';
  import baseButton from '../../__components__/base_button.vue';
  import { ref, reactive, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { ResetButton } from '/@page-designer/types/web';
  import { message as Message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  const props = defineProps<{ widget: ResetButton }>();
  const { title, refForm, basic, resetRule } = reactive(props.widget.props);
  const Event = getPageEvent();
  const loading = ref(false);

  const refFormGroup = computed(() => {
    if (refForm && typeof refForm === 'string') {
      return [refForm];
    } else {
      return refForm || [];
    }
  });
  onBeforeMount(() => {});
  onMounted(async () => {});
  watchEffect(() => {});
  async function reset() {
    try {
      if (!refFormGroup.value.length) return;
      loading.value = true;
      await Event.runEventByName('beforeReset', props.widget.events);
      for (let k of refFormGroup.value) {
        const form: any = await Event.getSyncComponent(k);
        await form.reset(resetRule);
      }
      Message.success(t('sys.resetSuccess'));
      await Event.runEventByName('afterReset', props.widget.events);
    } catch (error) {}

    loading.value = false;
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
