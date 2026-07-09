<template>
  <div>
    <a-button type="primary" @click="addAssignRule" ghost block :disabled="disabled">
      {{ t('sys.pageDesigner.configAssignRule') }}
    </a-button>
  </div>
  <addAssignmentRuleModal :widget="defProps.widget" ref="assignRuleModalRef" />
</template>

<script setup lang="ts" name="assignment-rule-editor">
  import { ref, reactive, computed, nextTick } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import addAssignmentRuleModal from '../modals/add-assignment-rule-modal.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const assignRuleModalRef = ref<InstanceType<typeof addAssignmentRuleModal> | null>(null);
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const propConfig = reactive(defProps.propConfig);

  const disabled = computed(() => false);

  const modelKey = computed(() => defProps.widget?.props[propConfig.modelByKey || 'model']);

  const addAssignRule = async () => {
    const formData = JSON.parse(JSON.stringify(propValue.value));
    const values = await assignRuleModalRef.value!.open(formData);

    propValue.value = { ...values };
    await nextTick();
  };
</script>

<style scoped lang="less"></style>
