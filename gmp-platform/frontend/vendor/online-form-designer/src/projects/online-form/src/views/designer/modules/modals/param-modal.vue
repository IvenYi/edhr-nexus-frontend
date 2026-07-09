<template>
  <a-form
    class="important-pt-24px"
    ref="formRef"
    :model="formState"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 16 }"
  >
    <a-form-item
      :label="$t('sys.onlineForm.paramsKey')"
      name="key"
      :rules="[
        {
          required: true,
          message: t('sys.pleaseInputSth', { sth: t('sys.onlineForm.paramsKey') }),
          whitespace: true,
        },
        { pattern: /^[a-z0-9_]+$/, message: $t('sys.onlineForm.paramsKeyValidateTip') },
      ]"
    >
      <a-input v-model:value="formState.key" show-count :maxlength="64" />
    </a-form-item>

    <a-form-item
      :label="$t('sys.onlineForm.fieldMapping')"
      name="toFields"
      :rules="[{ required: true }]"
    >
      <a-select
        mode="multiple"
        v-model:value="formState.toFields"
        :getPopupContainer="() => formRef!.$el"
      >
        <a-select-opt-group v-for="g in fieldOptionGroups" :key="g.key" :label="g.label">
          <a-select-option
            v-for="f in g.options"
            :key="f.value"
            :value="f.value"
            :disabled="hasSelectedOptions.includes(f.value)"
            >{{ f.label }}</a-select-option
          >
        </a-select-opt-group>
      </a-select>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
  import { ref, inject, watch, computed } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useParam, IParam } from '/@online-form/views/designer/hooks/useParam';
  import { cloneDeep } from 'lodash-es';
  import { buildUUID } from '/@/utils/uuid';

  const { t } = useI18n();
  const { fieldOptionGroups, getSelectedOptionKeys } = useParam();

  const modal = inject<any>('modal');
  const formRef = ref<FormInstance>();
  const props = defineProps<{
    isEdit: boolean;
    param: IParam;
  }>();

  const formState = ref<IParam>({
    id: buildUUID(),
    key: '',
    toFields: [],
  });

  const hasSelectedOptions = computed(() => {
    // 编辑时排除自身之外已选了的，新建排除所有已选的
    return getSelectedOptionKeys(props.isEdit ? props.param.key : undefined);
  });

  watch(
    () => props.param,
    (newVal) => {
      if (!newVal) return;
      formState.value = cloneDeep(newVal);
    },
    { immediate: true },
  );

  modal.ok = async () => {
    try {
      // todo 当前字段已被映射
      await formRef.value?.validate();
      return {
        ok: true,
        data: cloneDeep(formState.value),
      };
    } catch (err) {
      console.warn(err);
    }
  };
</script>

<style></style>
