<template>
  <vantField
    v-model="validateField"
    :props="widget.props"
    :style="widget.style"
    :formData="formData"
    readonly
    clearable
    :isLink="!validateField"
    @clearValue="handleClear"
    @click="openView"
  >
    <template #input v-if="validateField">
      <FieldSelect v-bind="separatorAttr" v-model:value="fieldValue" />
    </template>
  </vantField>
</template>

<script setup lang="ts" name="gct-device-select">
  import { ref, computed, toRef, reactive, toRaw, watch, nextTick } from 'vue';
  import type { IDeviceSelect } from './schema';
  import { getPageEvent, type RetrunList } from '/@page-designer/components/widgets/hooks/hooks';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  import vantField from '/@page-designer/components/widgets/pad/__components__/vantField.vue';
  import { createListPopup } from '/@page-designer/components/widgets/mobile/__components__/listPopup';
  import { FieldSelect } from '/@page-designer/components/widgets/pad/__components__';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { usePadTeleport } from '@mobile/utils/usePadTeleport';

  const { teleport } = usePadTeleport();

  const Event = getPageEvent();

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      widget: IDeviceSelect;
      formData: Object;
      getPopupContainer?: (triggerNode) => HTMLElement;
    }>(),
    {
      getPopupContainer: (triggerNode) => triggerNode.parentNode,
    },
  );

  const {
    label,
    field,
    txnType,
    bizService,
    refForm,
    refSearchField,
    refContainerForm,
    refContainerField,
    initLoad,
    selectMode,
    scan,
    noNeedAutoQuery,
  } = reactive(props.widget.props);
  const emit = defineEmits(['update:modelValue']);

  const refFormData = toRef(() => {
    const data: any = {};
    if (refForm) {
      (refSearchField ?? []).forEach((field) => {
        data[field] = formMap.value[refForm]?.[field];
      });
    }
    if (refContainerForm) {
      data.txn_subject_id_ = formMap.value[refContainerForm]?.[refContainerField];
    }
    return data;
  });

  const checkeOpts = ref<RetrunList[]>([]);
  const dataSource = ref<any>([]);

  const fieldValue = props.widget.props.field
    ? computed<any>({
        get() {
          let value = props.modelValue || undefined;
          if (multiple.value) {
            return Array.isArray(value) ? value : value?.split(',').filter((i) => i) || [];
          }
          return value;
        },
        set(val: Array<string>) {
          const newVal = multiple.value && Array.isArray(val) ? val && val.join(',') : val;
          emit('update:modelValue', newVal);
        },
      })
    : ref();

  const validateField = computed(() => {
    return fieldValue.value && String(fieldValue.value);
  });

  const multiple = computed(() => {
    return selectMode === 'multiple';
  });

  watch(
    () => refFormData.value,
    () => {
      if (
        !initLoad ||
        !refFormData.value.txn_subject_id_ ||
        !refFormData.value?.workflow_step_id_
      ) {
        return;
      }
      queryDevice();
    },
    {
      deep: true,
    },
  );

  async function queryDevice(queryParam?) {
    const params = Object.assign(
      {
        ...refFormData.value,
        txn_key_: txnType,
      },
      queryParam,
    );
    try {
      const res = await Event.context.$customBizService.post(
        {
          action: bizService,
          key: txnType,
        },
        {
          query: params,
        },
      );
      dataSource.value = res ?? [];
      checkeOpts.value = (dataSource.value ?? []).filter((op) => {
        return multiple.value ? fieldValue.value.includes(op.id_) : op.id_ === fieldValue.value;
      });
      await setDeviceStatus(params);
      Event.runEventByName('onLoaded', props.widget.events, dataSource.value);
    } catch (err) {
      props.widget.props.disabled = false;
    }
  }

  async function setDeviceStatus(query) {
    if (txnType !== 'em_txn_move') return;

    try {
      const res = await Event.context.$customBizService.post(
        {
          action: 'biz_get_moved_in_devices',
          key: 'em_txn_move',
        },
        {
          query: query,
        },
      );
      const disabled = res && res?.length;
      props.widget.props.disabled = !!disabled;
      if (disabled) {
        //如果是出站事务下 默认选中进站选的设备
        fieldValue.value = res?.map((d) => d.id_);
        let data: any = getCheckedOpts();
        Event.runEventByName('onChange', props.widget.events, fieldValue.value, data);
      } else {
        fieldValue.value = [];
      }
    } catch (err) {
      props.widget.props.disabled = false;
    }
  }

  async function openView() {
    await queryDevice();
    const { openListPopup } = createListPopup({
      api: undefined,
      remote: true,
      lazy: true,
      customSearch: customSearch,
      options: [],
      title: label,
      fieldKey: field,
      fieldType: multiple.value ? FIELD_TYPE.REF_MULTI : FIELD_TYPE.REF,
      multiple: multiple.value ? true : false,
      selectedOptions: checkeOpts.value,
      showSearch: true,
      scan: scan,
      position: 'right',
      popStype: { width: '480px', height: '100%' },
      teleport: teleport,
    });
    openListPopup({
      ids: fieldValue.value,
      callback({ a, checkOptions }) {
        fieldValue.value = a;
        checkeOpts.value = checkOptions;
        changeSelect(a);
      },
    });
  }

  const customSearch = async ({ keyword, pageNo }) => {
    const pageSize = 10;
    const allOpts = dataSource.value.map((n) => {
      return {
        label: n.name_,
        value: n.id_,
        _item: n,
      };
    });

    const data = keyword ? allOpts.filter((n) => n.label.includes(keyword)) : allOpts;
    return {
      allOpts: allOpts,
      data: data.slice(pageSize * (pageNo - 1), pageSize * pageNo),
      finished: allOpts.length ? allOpts.length <= pageSize * pageNo : true,
    };
  };

  const separatorAttr = computed(() => {
    return {
      disabled: props?.widget?.props?.disabled ?? false,
      fieldType: multiple.value ? FIELD_TYPE.REF_MULTI : FIELD_TYPE.REF,
      isLinkageMode: false,
      multiple: !!multiple.value,
      readonly: true,
      refModelType: 'NDO',
      tagStyle: props.widget.style,
      options: dataSource.value.map((n) => {
        return {
          label: n.name_,
          value: n.id_,
          _item: n,
        };
      }),
    };
  });

  function getCheckedOpts() {
    if (multiple.value) {
      return checkeOpts.value.map((i) => toRaw(i));
    } else {
      return toRaw(checkeOpts.value[0]);
    }
  }

  async function changeSelect(v: any) {
    if (!v || !v.length) {
      deselect(fieldValue.value);
    }
    await nextTick();
    let data: any = getCheckedOpts();
    Event.runEventByName('onChange', props.widget.events, fieldValue.value, data);
  }

  function deselect(clearValue) {
    let data = getCheckedOpts();
    Event.runEventByName('afterClear', props.widget.events, clearValue, data);
  }

  async function handleClear() {
    emit('update:modelValue', null);
    deselect(fieldValue.value);
    fieldValue.value = multiple.value ? [] : '';
  }

  defineExpose({
    getValue({ option }: { option?: boolean } = {}) {
      if (option) {
        return getCheckedOpts();
      } else {
        return fieldValue.value;
      }
    },
    setValue(v) {
      fieldValue.value = v;
    },
    async reload(params?) {
      await queryDevice(params);
    },
  });
</script>

<style scoped></style>
