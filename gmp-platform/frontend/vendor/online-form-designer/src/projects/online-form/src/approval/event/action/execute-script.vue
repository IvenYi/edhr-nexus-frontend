<template>
  <div :class="[ns.b()]">
    <a-form-item
      class="w-full"
      :label="$t('sys.onlineForm.executionMethod')"
      required
      :label-col="{ style: 'width: 61px;' }"
    >
      <a-select
        class="w-full"
        v-model:value="local.executeFn"
        :placeholder="t('sys.inputText') + $t('sys.onlineForm.orSelectMethodName')"
        :disabled="bpmnReadonly"
      >
        <a-select-opt-group v-for="group in groupScripts" :key="group.id" :label="group.name">
          <a-select-option v-for="m in group.children" :value="m.key" :key="m.key">{{
            m.name
          }}</a-select-option>
        </a-select-opt-group>
      </a-select>
    </a-form-item>
  </div>
</template>

<script lang="ts" setup name="business-model-field-change">
  import { computedEx, useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { IANEAExecuteScript } from '../types';
  import { CategoryCompleteResponse } from '/@/apis/gct-apaas/model';
  import { onMounted, ref, inject } from 'vue';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';

  const bpmnReadonly = inject('bpmnReadonly', false);

  const ns = useNamespace('business-model-field-change');
  const { t } = useI18n() as any;

  const props = withDefaults(
    defineProps<{
      value: IANEAExecuteScript;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value: IANEAExecuteScript): void;
  }>();

  const local = computedEx({
    get: () => props.value,
    set: (v) => emit('update:value', v),
    deep: true,
  });

  const groupScripts = ref<CategoryCompleteResponse[]>([]);

  const load = async () => {
    const res = await getCategoryListComplete({
      module: 'script_module',
    });
    groupScripts.value = res || [];
    console.log('script_module', res);
  };

  onMounted(() => {
    load();
  });
</script>

<style lang="scss" scoped>
  $business-model-field-change: ();

  @include b(business-model-field-change) {
    @include set-component-css-var(business-model-field-change, $business-model-field-change);
    display: flex;
    align-items: center;
    padding: 4px;
    background: #ffffff;
    border-radius: 4px;
    margin-top: 4px;

    :deep(.ant-form-item) {
      margin-bottom: 0;
    }
  }
</style>
