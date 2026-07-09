<template>
  <vantField
    v-if="fixtureVisible"
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

<script setup lang="ts" name="gct-fixture-select">
  import { ref, computed, toRef, reactive, toRaw, watch, nextTick } from 'vue';
  import type { IFixtureSelect } from './schema';
  import { getPageEvent, type RetrunList } from '/@page-designer/components/widgets/hooks/hooks';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  import vantField from '/@page-designer/components/widgets/pad/__components__/vantField.vue';
  import { createListPopup } from '/@page-designer/components/widgets/mobile/__components__/listPopup';
  import { FieldSelect } from '/@page-designer/components/widgets/pad/__components__';
  import { FIELD_TYPE } from '/@/enums/appEnum';

  const Event = getPageEvent();

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      widget: IFixtureSelect;
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

  const fixtureVisible = computed(() => {
    return dataSource.value?.length;
  });

  const validateField = computed(() => {
    return fieldValue.value && String(fieldValue.value);
  });

  const multiple = computed(() => {
    return selectMode === 'multiple';
  });

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

  watch(
    () => refFormData.value,
    () => {
      /** 如果未开启初始化加载则不请求数据 */
      if (!initLoad || !refFormData.value?.workflow_step_id_) return;
      formMap.value[refContainerForm]?.[refContainerField] && queryFixture();
    },
    {
      deep: true,
    },
  );

  async function queryFixture(queryParam?) {
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
          key: 'em_fixture',
        },
        {
          ...params,
        },
      );
      dataSource.value = res?.fixtures ?? [];
      checkeOpts.value = (dataSource.value ?? []).filter((op) => {
        return multiple.value ? fieldValue.value.includes(op.id_) : op.id_ === fieldValue.value;
      });
      Event.runEventByName('onLoaded', props.widget.events, dataSource.value);
      await setFixtureStatus(params);
    } catch (err) {
      props.widget.props.disabled = false;
    }
  }

  async function setFixtureStatus(query) {
    if (txnType !== 'em_txn_move') return;

    try {
      const res = await Event.context.$customBizService.post(
        {
          // @ts-ignore
          action: 'biz_get_moved_in_fixtures',
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
        let data: any = getCheckedOpts();
        Event.runEventByName('onChange', props.widget.events, fieldValue.value, data);
        fieldValue.value = res?.map((d) => d.id_);
      } else {
        fieldValue.value = [];
      }
    } catch (err) {
      props.widget.props.disabled = false;
    }
  }

  async function openView() {
    const { openListPopup } = createListPopup({
      api: undefined,
      options: dataSource.value.map((n) => {
        return {
          label: n.name_,
          value: n.id_,
          _item: n,
        };
      }),
      title: label,
      fieldKey: field,
      fieldType: multiple.value ? FIELD_TYPE.REF_MULTI : FIELD_TYPE.REF,
      multiple: multiple.value ? true : false,
      selectedOptions: checkeOpts.value,
      showSearch: true,
      scan: scan,
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

  /**
   * 设置返回的选中options
   */
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

  function handleClear() {
    emit('update:modelValue', null);
    deselect(fieldValue.value);
    fieldValue.value = multiple ? [] : '';
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
      await queryFixture(params);
      return dataSource.value;
    },
    getFixtureData() {
      return dataSource.value;
    },
  });
</script>

<style scoped></style>
