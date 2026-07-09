<template>
  <MultipleDrop
    @dragover="handleDragOver"
    @drop="handleDrop"
    :dragText="$t('sys.onlineForm.dragFieldToBind')"
    :items="multipleItems"
    @remove="handleRemove"
    :showDrag="false"
  />
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import MultipleDrop from '/@online-form/views/designer/modules/base/drag/multiple-drop.vue';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { TransferType, useDrop } from '/@online-form/views/designer/modules/base/drag/use-drop';
  import type { IBindField } from '@gct/nocode-base';
  import { getFieldIcon } from '/@online-form/utils/field.enum';

  const { t } = useI18n();

  const { getFieldMeta } = useModelFields();

  const props = withDefaults(
    defineProps<{
      items?: IBindField[];
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:items', items: IBindField[] | undefined): void;
  }>();

  const { handleDragOver, handleDrop } = useDrop([TransferType.Field], {
    onFieldDrop(fieldMeta, fieldWidget) {
      const arr = props.items || [];
      arr.push({ ...fieldMeta });
      emit('update:items', arr);
    },
  });

  const multipleItems = computed(() => {
    return props.items?.map((data) => {
      return {
        label: getFieldMeta(data!).name,
        icon: getFieldIcon(data!.fieldType!),
      };
    });
  });

  const handleRemove = (index: number) => {
    if (!props.items) {
      return;
    }
    const arr = [...props.items];
    arr.splice(index, 1);
    emit('update:items', arr);
  };
</script>
