<template>
  <div class="field-auth-config-wrapper">
    <div v-for="info of fieldMap" :key="info.meta.key" class="mb-12px">
      <field-auth-setting :meta="info.meta" :fields="info.fields" />
    </div>
  </div>
</template>

<script setup lang="ts" name="field-auth-config">
  import { ref, watch } from 'vue';
  import { pick } from 'lodash-es';
  import fieldAuthSetting from './field-auth-setting.vue';
  import { useBpmnSetting } from '../hooks/useBpmnSetting';

  const { bpmnFieldMap } = useBpmnSetting();

  const props = withDefaults(
    defineProps<{
      fieldConfig: any;
      isApproval?: boolean;
      isStart?: boolean;
    }>(),
    {
      isApproval: false,
      isStart: false,
    },
  );

  const emit = defineEmits(['update:fieldConfig']);

  const fieldMap = ref<any>([]);

  watch(
    [() => bpmnFieldMap.value],
    () => {
      const _fieldConfig = props.fieldConfig ?? [];

      fieldMap.value = Object.values(bpmnFieldMap.value)
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
    },
    {
      immediate: true,
      deep: true,
    },
  );

  watch(
    () => fieldMap.value,
    () => {
      emit('update:fieldConfig', fieldMap.value.map((item) => item.fields.slice()).flat());
    },
    {
      immediate: true,
      deep: true,
    },
  );
</script>

<style scoped></style>
