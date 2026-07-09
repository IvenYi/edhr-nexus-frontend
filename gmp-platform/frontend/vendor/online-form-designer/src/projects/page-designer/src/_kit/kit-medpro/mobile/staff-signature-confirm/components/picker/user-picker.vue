<template>
  <van-picker
    :columns="allStaffs"
    :model-value="pickerValue"
    @confirm="onConfirm"
    @cancel="onCancel"
  />
</template>

<script setup lang="ts" name="user-picker">
  import { ref, onMounted, computed } from 'vue';
  import { getDesignerCommonGetCanBeUsedOrgUser } from '/@/apis/gct-apaas/DesignerCommonController';

  const props = defineProps<{
    staffFields?: string;
    modelValue: string;
  }>();
  
  const emit = defineEmits<{
    (e: 'cancel', showPicker: boolean): void;
    (e: 'confirm', value: boolean, options: object|object[]): void;
    (e: 'update:modelValue', value: string): void;
  }>();

  const pickerValue = ref();
  const allStaffs = ref<any[]>([]);

  const fieldValue = computed({
    get() {
      return props.modelValue ?? '';
    },
    set(val: string) {
      emit('update:modelValue', val);
    },
  });

  function onConfirm({ selectedValues, selectedOptions }) {
    pickerValue.value = selectedValues;
    fieldValue.value = selectedOptions[0]?.value;
    emit('confirm', selectedOptions[0]?.value, selectedOptions);
  }

  function onCancel() {
    emit('cancel', false);
  }

  async function loadStaffData() {
    const res: any = await getDesignerCommonGetCanBeUsedOrgUser({
      pageNo: 1,
      pageSize: 999999999,
    });
    allStaffs.value = (res?.data ?? []).map((e) => {
      return {
        ...e,
        value: e.id,
        text: props.staffFields ? `${e[props.staffFields]}(${e.fullname})` : e.fullname,
      };
    });
  }

  onMounted(async() => {
    await loadStaffData();
    if(fieldValue.value) {
      pickerValue.value = [fieldValue.value];
    }
  });
</script>
