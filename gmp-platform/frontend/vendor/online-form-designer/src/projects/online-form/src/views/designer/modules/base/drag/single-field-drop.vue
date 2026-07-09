<template>
  <SingleDrop
    :class="[ns.b()]"
    @dragover="handleDragOver"
    @drop="handleDrop"
    @clear="handleClear"
    :icon="singleIcon"
    :label="singleLabel"
    :disabled="disabled"
    :emptyText="$t('sys.onlineForm.dragFieldToBind')"
  />
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useNamespace } from '@gct/runtime';
  import SingleDrop from '/@online-form/views/designer/modules/base/drag/single-drop.vue';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { TransferType, useDrop } from '/@online-form/views/designer/modules/base/drag/use-drop';
  import type { IBindField } from '@gct/nocode-base';
  import { getFieldIcon } from '/@online-form/utils/field.enum';

  const { t } = useI18n();

  const ns = useNamespace('single-field-drop');

  const props = withDefaults(
    defineProps<{
      value?: IBindField;
      disabled?: boolean;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value: IBindField | undefined): void;
  }>();

  const { handleDragOver, handleDrop } = useDrop([TransferType.Field], {
    onFieldDrop(fieldMeta, _fieldWidget) {
      emit('update:value', fieldMeta);
    },
  });

  const { getFieldMeta } = useModelFields();
  const getFieldName = (field: IBindField) => {
    return getFieldMeta(field).name;
  };

  const singleIcon = computed(() => {
    if (!props.value) {
      return undefined;
    }
    return getFieldIcon(props.value!.fieldType!);
  });

  const singleLabel = computed(() => {
    if (!props.value) {
      return undefined;
    }
    return getFieldName(props.value);
  });

  /**
   * 清空单个的字段或者组件
   */
  const handleClear = () => {
    emit('update:value', undefined);
  };
</script>

<style lang="scss" scoped>
  @include b(single-field-drop) {
  }
</style>
