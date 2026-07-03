<template>
  <a-collapse v-model:activeKey="activeKey" ghost expandIconPosition="right">
    <a-collapse-panel key="form" :header="t('sys.process.form')">
      <div class="form-title">{{ t('sys.process.formTodo') }}</div>
      <a-form-item :label="t('WEB')" name="formTodo" :rules="[{ required }]">
        <a-select v-model:value="formState.formTodo">
          <a-select-opt-group v-for="mc in webPages" :key="mc.id" :label="mc.name">
            <a-select-option v-for="m in mc.children" :value="m.id" :key="m.id">{{
              m.name
            }}</a-select-option>
          </a-select-opt-group>
        </a-select>
      </a-form-item>
      <a-form-item
        v-if="hasMobile"
        :label="t('MOBILE')"
        name="modmobileFormTodoel"
        :rules="[{ required }]"
      >
        <a-select v-model:value="formState.mobileFormTodo">
          <a-select-opt-group v-for="mc in mobilePages" :key="mc.id" :label="mc.name">
            <a-select-option v-for="m in mc.children" :value="m.id" :key="m.id">{{
              m.name
            }}</a-select-option>
          </a-select-opt-group>
        </a-select>
      </a-form-item>
      <div class="form-title">{{ t('sys.process.formView') }}</div>
      <a-form-item :label="t('WEB')" name="formView" :rules="[{ required }]">
        <a-select v-model:value="formState.formView">
          <a-select-opt-group v-for="mc in webPages" :key="mc.id" :label="mc.name">
            <a-select-option v-for="m in mc.children" :value="m.id" :key="m.id">{{
              m.name
            }}</a-select-option>
          </a-select-opt-group>
        </a-select>
      </a-form-item>
      <a-form-item
        v-if="hasMobile"
        :label="t('MOBILE')"
        name="mobileFormView"
        :rules="[{ required }]"
      >
        <a-select v-model:value="formState.mobileFormView">
          <a-select-opt-group v-for="mc in mobilePages" :key="mc.id" :label="mc.name">
            <a-select-option v-for="m in mc.children" :value="m.id" :key="m.id">{{
              m.name
            }}</a-select-option>
          </a-select-opt-group>
        </a-select>
      </a-form-item>
    </a-collapse-panel>
  </a-collapse>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { usePages } from '../../hooks/usePages';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  interface Forms {
    formTodo: string;
    formView: string;
    mobileFormTodo: string;
    mobileFormView: string;
  }
  interface Props {
    forms: Forms;
    required: boolean;
  }
  const props = withDefaults(defineProps<Props>(), {
    required: false,
  });

  const appInfoStore = useAppInfoStore();
  const { loadPages, webPages, mobilePages } = usePages();
  const { t } = useI18n();
  const activeKey = ref<string[]>(['form']);

  loadPages();

  const hasMobile = computed(() => appInfoStore.appInfo.mobileEnabled);

  const formState = computed({
    get() {
      return props.forms;
    },
    set(value) {
      Object.assign(props.forms, value);
    },
  });
</script>

<style lang="less" scoped>
  .form-title {
    line-height: 36px;
    font-weight: bold;
  }

  .ant-collapse {
    :deep(.ant-collapse-header) {
      border-bottom: 1px solid #eaeaea;
    }
  }
</style>
