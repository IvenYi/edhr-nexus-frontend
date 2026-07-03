<template>
  <a-form-item :name="['uniqueConstraint', 'type']" :label="t('sys.model.uniqueOrNot')">
    <a-checkbox v-model:checked="uniqueKeyCheck" :disabled="isDisabled">
      {{ t('sys.model.uniqueField') }}
    </a-checkbox>
    <a-form-item
      v-show="isTreeModel && uniqueKeyCheck"
      :colon="false"
      :labelCol="{ span: 0 }"
      style="margin-bottom: 0; margin-top: 8px"
    >
      <a-radio-group
        v-model:value="uniqueKeyRadio"
        :options="uniqueConstraintOptions"
        :disabled="isDisabled"
      />
    </a-form-item>
  </a-form-item>
</template>
<script setup lang="ts" name="field-unique-key">
  import { computed } from 'vue';
  import { UniqueConstraintType } from '@/enums/appEnum';
  import { uniqueConstraintOptions } from '../../../constant/index';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface Props {
    /** 是否是树形结构模型 */
    isTreeModel: boolean;
    /** 是否只读 */
    isDisabled: boolean;
    type: UniqueConstraintType;
  }

  const { t } = useI18n();

  const props = defineProps<Props>();

  const emit = defineEmits(['update:type', 'update:fieldKeys']);

  const uniqueKeyCheck = computed({
    get() {
      return !!props.type && props.type !== UniqueConstraintType.NONE;
    },
    set(val: boolean) {
      emit(
        'update:type',
        val
          ? props.isTreeModel
            ? UniqueConstraintType.LEVEL
            : UniqueConstraintType.GLOBAL
          : UniqueConstraintType.NONE,
      );
      emit('update:fieldKeys', undefined);
      if (val && props.isTreeModel) {
        emit('update:fieldKeys', ['parent_id_']);
      }
    },
  });

  const uniqueKeyRadio = computed({
    get() {
      return (props.type as string) ?? '';
    },
    set(val: string) {
      emit('update:type', val);
      emit('update:fieldKeys', undefined);
      if (val === UniqueConstraintType.LEVEL) {
        emit('update:fieldKeys', ['parent_id_']);
      }
    },
  });
</script>
<style scoped lang="less"></style>
