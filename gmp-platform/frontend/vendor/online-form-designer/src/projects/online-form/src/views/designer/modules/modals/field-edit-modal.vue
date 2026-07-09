<template>
  <div :class="ns.b()">
    <a-form
      class="important-pt-24px"
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item :label="$t('sys.FieldName')" name="name">
        <a-input v-model:value="formState.name" show-count :maxlength="32" />
      </a-form-item>
      <a-form-item v-if="!isExistedField" label="字段key" name="key">
        <a-input :disabled="disabledKey" v-model:value="formState.key" show-count :maxlength="32" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts" name="field-edit-modal">
  import { computed, reactive, ref } from 'vue';
  import { message, type FormInstance } from 'ant-design-vue';
  import { useModal, useNamespace } from '@gct/runtime';

  import { useReverseModeling } from '/@online-form/views/designer/hooks/reverse-modeling';
  import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
  import { OnlineFormAutoFieldTypes } from '../../constants';

  const ns = useNamespace('field-edit-modal');

  const { findField, updateField, isStashedField } = useReverseModeling();

  const props = defineProps<{
    field: {
      fieldKey: string;
      modelKey: string;
    };
  }>();

  const fieldInfo = findField(props.field);
  const formState = reactive<FieldMetaDTO>({
    ...fieldInfo,
  });

  /** 是否是后台已经有的字段 */
  const isExistedField = computed(() => {
    return !isStashedField({ key: formState.key!, modelKey: formState.modelKey! });
  });

  const disabledKey = computed(() => {
    return OnlineFormAutoFieldTypes.includes(fieldInfo.type as any);
  });

  const formRef = ref<FormInstance>();

  useModal(async () => {
    await formRef.value!.validate();
    try {
      updateField({ ...formState });
    } catch (error) {
      if (error.message) {
        message.error({
          content: error.message,
          class: 'top-ant-message',
        });
      }
      throw error;
    }
    return {
      ok: true,
    };
  });
</script>

<style lang="scss" scoped>
  @include b(field-edit-modal) {
    padding-top: 12px;
  }
</style>
