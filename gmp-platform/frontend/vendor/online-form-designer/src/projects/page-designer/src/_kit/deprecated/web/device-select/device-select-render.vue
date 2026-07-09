<template>
  <a-form-item
    :label="t('sys.kit.device')"
    :rules="{
      required: widget.props.required,
      message: t('sys.pageDesigner.cannotBeEmpty'),
    }"
  >
    <a-select
      :disabled="disabled"
      v-model:value="value"
      mode="multiple"
      :maxTagCount="5"
      :maxTagTextLength="6"
      :filter-option="filterOption"
      @change="onChange"
    >
      <a-select-option v-for="item in dataSource" :value="item.id_" :item="item">{{
        item.name_
      }}</a-select-option>
    </a-select>
  </a-form-item>
</template>

<script setup lang="ts" name="gct-device-select">
  import { computed, ref, toRef, toRefs, watch } from 'vue';
  import { IDeviceSelect } from './schema';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';

  const { t } = useI18n();
  const emit = defineEmits(['update:modelValue']);
  const Event = getPageEvent();
  //
  const props = defineProps<{
    modelValue?: string;
    widget: IDeviceSelect;
    formData: Object;
  }>();
  const { refSearch, refSearchForm, refSearchField, usage } = toRefs(props.widget?.props);
  const refFormData = toRef(() => {
    const data: any = {};
    if (!props.widget.props.noNeedAutoQuery) {
      data[refSearchField.value] = formMap.value[refSearchForm.value]?.[refSearchField.value];
    }
    return data;
  });
  const value = computed({
    get() {
      let value = props.modelValue || undefined;
      return value?.split(',').filter((i) => i) || [];
    },
    set(val) {
      emit('update:modelValue', val?.join(','));
    },
  });
  const dataSource = ref<any[]>([]);
  const disabled = ref(false);
  async function queryDevice(queryParam?) {
    const container = props.widget.props.noNeedAutoQuery
      ? undefined
      : (Event.getComponent(refSearch!.value!) as any)?.getValue();
    const param = Object.assign(
      {
        ...refFormData.value,
        txn_subject_id_: container?.id_,
        txn_key_: usage?.value,
      },
      queryParam,
    );
    const res = await Event.context.$customBizService.post(
      {
        action: `biz_get_txn_devices`,
        key: 'em_container',
      },
      param,
    );
    dataSource.value = res.devices;
    disabled.value = res.source === 'moveIn' ? true : false;
    if (disabled.value) {
      //如果是出站事务下 默认选中进站选的设备
      value.value = dataSource.value?.map((d) => d.id_);
    }
  }
  watch(
    () => refFormData.value,
    () => {
      if (props.widget.props.noNeedAutoQuery) return;
      console.log(refFormData.value, refFormData.value[refSearchField.value], 'refFormData.value');
      formMap.value[refSearchForm.value][refSearchField.value] && queryDevice();
    },
    { deep: true },
  );
  const filterOption = (inputValue, option) => {
    return option.item.name_.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
  };
  const onChange = (value, option) => {
    const { item } = option;
    Event.runEventByName('onChange', props.widget.events, value, item);
  };
  defineExpose({
    async reload(params?) {
      await queryDevice(params);
    },
  });
</script>

<style scoped></style>
