<template>
  <basicButton type="primary" @click="sumbit" :loading="loading" v-bind="basic">
    {{ title }}</basicButton
  >
</template>

<script setup lang="ts" name="gct-rdo-create-button">
  import basicButton from '../../__components__/basic_button.vue';
  import { ref, toRefs, onBeforeMount, onMounted, watchEffect, reactive } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Button } from '/@page-designer/types/web';
  import { message as Message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const props = defineProps<{ widget: Button }>();
  const { title, refForm, basic } = reactive(props.widget.props);
  const Event = getPageEvent();
  const loading = ref(false);

  async function sumbit() {
    try {
      loading.value = true;
      const form = await Event.getSyncComponent(refForm);
      await Event.runEventByName('beforeSubmit', props.widget.events, form.getValue!());
      let id = await form.submit();
      await Event.runEventByName('afterSubmit', props.widget.events, id);
      Message.success(t('sys.submitSuccess'));
    } catch (error) {
      console.error(error);
    }
    loading.value = false;
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
