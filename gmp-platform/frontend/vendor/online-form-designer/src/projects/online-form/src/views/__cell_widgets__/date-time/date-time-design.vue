<template>
  <div>
    <a-date-picker
      :value="defaultValue"
      v-if="!isTime"
      class="w-full"
      :format="fieldWidget.format"
      :placeholder="fieldWidget.placeholder"
      :disabled="disabled"
    />
    <a-time-picker
      v-else
      :value="defaultValue"
      class="w-full"
      :format="fieldWidget.format"
      :placeholder="fieldWidget.placeholder"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import type { IBindField } from '@gct/nocode-base';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { computed } from 'vue';
  import dayjs from 'dayjs';

  const props = defineProps<{
    disabled?: boolean;
    fieldWidget: CellWidget.DateTime;
    fieldMeta: IBindField;
  }>();

  const isTime = computed(() => props.fieldMeta.fieldType === FIELD_TYPE.TIME);

  const defaultValue = computed(() => {
    if (props.fieldWidget.defaultSystemDate) {
      return dayjs();
    }
    return undefined;
  });
</script>

<style></style>
