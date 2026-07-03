<template>
  <div class="field-auth-config-wrapper">
    <div v-for="info of fieldMap" :key="info.meta.key" class="mb-12px">
      <field-auth-setting :meta="info.meta" :fields="info.fields" />
    </div>
  </div>
</template>

<script setup lang="ts" name="field-auth-config">
  import { ref, watch, inject } from 'vue';
  import { pick } from 'lodash-es';
  import fieldAuthSetting from './field-auth-setting.vue';

  import { useBpmnSetting } from '../hooks/useBpmnSetting';
  import { FieldPermissionController } from '../../base-permission/field-permission/use-field-permission';

  const c = inject<FieldPermissionController>('FieldPermissionController')!;

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
    [() => c.modelMetaArr],
    () => {
      const _fieldConfig = props.fieldConfig ?? [];

      fieldMap.value = c.modelMetaArr.map((item) => {
        const subModel = item.subModel ?? 0;
        return {
          meta: {
            key: item.modelKey,
            name: item.title,
            subModel,
          },
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
