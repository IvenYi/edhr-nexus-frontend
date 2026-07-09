<template>
  <div class="field-auth-config-wrapper">
    <div v-for="info of fieldMap" :key="info.meta.key" class="mb-12px">
      <field-auth-setting :meta="info.meta" :fields="info.fields" />
    </div>
  </div>
</template>

<script setup lang="ts" name="field-auth-config">
  import { ref, watch, nextTick } from 'vue';
  import { pick } from 'lodash-es';
  import fieldAuthSetting from '/@app-designer/views/online-form/components/bpmn-setting/comps/field-auth-setting.vue';
  import { useBpmnFieldMap } from '../hooks/useBpmnFieldMap';

  const { bpmnFieldMap, initFieldList } = useBpmnFieldMap();

  const props = withDefaults(
    defineProps<{
      fieldConfig: any;
      isApproval?: boolean;
      isStart?: boolean;
      modelKey: string;
      modelName: string;
    }>(),
    {
      isApproval: false,
      isStart: false,
    },
  );

  const emit = defineEmits(['update:fieldConfig']);

  const fieldMap = ref<any>([]);

  initFieldList(props.modelKey, props.modelName).then(() => {
    const _fieldConfig = props.fieldConfig ?? [];

    const result = Object.values(bpmnFieldMap.value)
      .sort((a, b) => a.sort - b.sort)
      .map((item) => {
        const subModel = item.meta.subModel ?? 0;
        return {
          meta: { ...item.meta },
          fields: item.fields.map((data) => {
            const obj = _fieldConfig.find(
              (j) =>
                j.field === data.key && j.modelKey === data.modelKey && j.subModel === subModel,
            );
            const action = {
              edit: props.isStart,
              readonly: props.isApproval,
            };
            if (obj) {
              Object.assign(action, pick(obj, ['edit', 'readonly']));
            }
            return {
              field: data.key,
              fieldName: data.name,
              modelKey: data.modelKey,
              subModel: subModel,
              ...action,
            };
          }),
        };
      });

    fieldMap.value = result;
  });


  watch(
    () => fieldMap.value,
    () => {
      emit('update:fieldConfig', fieldMap.value.map((item) => item.fields.slice()).flat());
    },
    {
      deep: true,
    },
  );
</script>

<style scoped></style>
