<template>
  <a-form-item :label="t('输出变量')" name="action">
    <a-select
      :placeholder="t('sys.pleaseSelectSth', { sth: t('输出变量') })"
      v-model:value="formState.outputToVariable"
    >
      <a-select-opt-group v-for="mc in variablesForGet" :key="mc.key" :label="mc.name">
        <a-select-option v-for="m in mc.children" :value="m.key" :key="m.key">{{
          m.key
        }}</a-select-option>
      </a-select-opt-group>
    </a-select>
  </a-form-item>
</template>

<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useVariable } from '../../../hooks/useVariable';

  const { variablesForGet } = useVariable();
  const { t } = useI18n();

  defineProps<{
    formState: object;
  }>();
</script>

<style></style>
