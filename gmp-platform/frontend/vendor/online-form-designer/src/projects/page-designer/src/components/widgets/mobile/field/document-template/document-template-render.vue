<template>
  <vantField
    v-model="validateField"
    :props="widget.props"
    :style="widget.style"
    @click="openView"
    :isLink="!validateField"
    readonly
    clearable
    @clearValue="handleClear"
    :formData="formData"
  >
    <template #input v-if="validateField">
      <taglabel v-if="showReadonly" v-bind="separatorAttr" />
      <van-cell
        v-else
        :is-link="!validateField"
        :border="false"
        style="padding: 0; background: transparent"
      >
        <template #value>
          <taglabel
            v-bind="separatorAttr"
            :showTagStyle="validateField"
            :style="{
              display: 'inline-block',
              maxWidth: '70%',
            }"
          />
          <van-tag
            v-if="!fieldObj.version"
            color="#EFF3FA"
            size="medium"
            class="ml-4px rounded"
            style="color: var(--van-primary-color)"
          >
            {{ $t('sys.default') }}
          </van-tag>
        </template>
      </van-cell>
    </template>
  </vantField>
</template>

<script setup lang="ts" name="gct-document-template">
  import { ref, computed, toRefs, toRaw, nextTick, reactive, onBeforeMount, watch } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import vantField from '../../__components__/vantField.vue';
  import Taglabel from '../../__components__/taglabel.vue';
  import { createTreePopup, optionType, SelectType } from '../../__components__/treePopup';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { IMobDocumentTemplateComponentExpose } from '/@/projects/page-designer/src/interface/mobile';
  import {
    getPrintDesignerInfo,
    getPrintDesignerListAllVersion,
    getPrintDesignerRdoPageBaseList,
  } from '/@/apis/gct-apaas/PrintDesignerController';
  import { getFormRelateListAllCategory } from '@mobile/apis/gct-apaas/FormRelateController';
  import { cacheAdapter } from '../../../hooks/cacheAdapter';

  const props = defineProps<{
    modelValue?: string;
    widget: LowCodeWidget.FieldSchema;
    formData: Object;
    moduleType: string;
  }>();

  const emit = defineEmits(['update:modelValue']);
  const Event = getPageEvent();
  const { formData } = toRefs(props);
  const { label, fieldName, field, fieldType } = reactive(props.widget.props);

  const options = ref<any[]>([]);
  const fieldObj = ref<any>({});
  const selectedOptions = ref<optionType[]>([]);

  const showReadonly = computed(() => useReadyonly(props.widget.props.readonly));

  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));

  const separatorAttr = computed(() => {
    return {
      disabled: showDisabled.value,
      fieldType: fieldType,
      tagWidgetStyle: props.widget.style,
      label: fieldObj.value.fieldLabel,
      multiple: false,
    };
  });

  const fieldValue = props.widget.props.field
    ? computed<any>({
        get() {
          return props.modelValue || undefined;
        },
        set(value: string[]) {
          emit('update:modelValue', value);
        },
      })
    : ref();

  watch(
    () => fieldValue.value,
    async (val) => {
      if (!val) {
        fieldObj.value = {};
      } else {
        const obj: any = (await getOptionValue(val)) || {};
        fieldObj.value = {
          ...obj,
          fieldLabel: !obj.version ? obj.name : `${obj.name} : ${obj.version}`,
        };
      }
    },
    {
      immediate: true,
    },
  );

  // 用于表单校验的字段
  const validateField = computed(() => {
    return fieldValue.value && String(fieldValue.value);
  });

  const { openTreePopup } = createTreePopup({
    asyncApi: cacheFunc,
    lazy: true,
    async: true,
    ids: fieldValue.value,
    options: options,
    showSearch: true,
    title: label || fieldName,
    showTag: (data) => data.default === 1,
    showBtnArea: (data) => {
      return data.checkedId && data.checkedData.parentId !== 'ROOT';
    },
  });

  async function cacheFunc(params) {
    return await cacheAdapter({ ...params, field: field }, getTmplList);
  }

  async function getTmplList(params) {
    const { id, categoryId, module: nodeModule } = params;
    if (nodeModule) return getLevel2Data(params);
    const res = categoryId
      ? await getPrintDesignerListAllVersion({ baseId: id, moduleType: PrintTypeEnum.RECEIPT })
      : await getFormRelateListAllCategory({ moduleType: PrintTypeEnum.RECEIPT });
    const data = res || [];
    const list = formatData(data, id);
    list.forEach((e) => {
      if (!options.value.find((f) => f.value === e.value)) {
        options.value.push(e);
      }
    });
    return true;
  }

  async function getLevel2Data(params) {
    const { id, pageNo = 1 } = params;
    const res: any = await getPrintDesignerRdoPageBaseList({
      moduleType: PrintTypeEnum.RECEIPT,
      categoryId: id,
      pageNo,
      pageSize: 30,
    });
    const list = formatData(res?.data, id);
    list.forEach((e) => {
      if (!options.value.find((f) => f.value === e.value)) {
        options.value.push(e);
      }
    });
    return !res.totalPage || res.pageNo === res.totalPage;
  }

  function formatData(data: any, parentId?: string) {
    return data?.map((i: any) => {
      return {
        ...i,
        label: i.version || i.name,
        value: i.baseId ? i.baseId + ':' + i.id : i.id,
        parentId,
      };
    });
  }

  async function changeSelect(v: any) {
    if (!v) {
      deselect(fieldValue.value);
    }
    await nextTick();
    let data = getOptionValue(v);
    Event.runEventByName('onChange', props.widget.events, fieldValue.value, data, formData.value);
  }

  /**
   * 获取选中的options
   */
  async function getOptionValue(v = fieldValue.value) {
    if (!v) return {};
    else {
      let data: optionType = options.value.find((i: any) => i.value === v);
      if (!data) {
        const ids: any[] = props.modelValue?.split(':') || [];
        const id = props.modelValue ? ids[1] || ids[0] : '';
        const res = (await getPrintDesignerInfo({ id, moduleType: PrintTypeEnum.RECEIPT })) || {};
        data = formatData([res], res.baseId || res.categoryId)[0]; // 接口没有返回parentId，且此数据只作为回显使用，故将自身ID作为parentId临时使用
        selectedOptions.value = [{ ...data, categoryId: '' }];
        const pData = [
          {
            value: res.categoryId,
            label: res.categoryName,
            id: res.categoryId,
            name: res.categoryName,
            parentId: 'ROOT',
            hasChild: true,
            module: 'label_module',
          },
        ];
        if (res.baseId) {
          // 第二层做了分页，若选择的是第三层，需手动把第二层的数据组装好塞到已选项中，回显用
          pData.push({
            value: res.baseId,
            label: res.name,
            version: '',
            id: res.baseId,
            name: res.name,
            default: 0,
            hasChild: true,
            parentId: res.categoryId,
            categoryId: res.categoryId,
          });
          selectedOptions.value.push(...pData);
        }
      } else {
        selectedOptions.value = [data];
      }
      return toRaw(data);
    }
  }

  function deselect(clearValue) {
    let data = getOptionValue(clearValue);
    Event.runEventByName('afterClear', props.widget.events, clearValue, data, formData.value);
  }

  /**值发生变化 */
  async function changeFormData() {
    await nextTick();
    !!formData.value._DICT[field] || (formData.value._DICT[field] = {});
    if (fieldObj.value.fieldLabel) {
      /**填充翻译后的值 */
      formData.value._DICT[field] = { [fieldValue.value]: fieldObj.value.fieldLabel };
    }
  }

  async function openView() {
    await getTmplList({});
    openTreePopup({
      // ids: fieldValue.value,
      title: label || fieldName,
      type: SelectType.SINGLE,
      checked: async (id) => {
        await nextTick();
        const data = await getOptionValue(id);
        console.log('checked', data);
        changeFormData();
        await Event.runEventByName('afterSelect', props.widget.events, id, data, formData.value);
      },
      saved: async (a: any, data) => {
        fieldValue.value = a;
        console.log('fieldValue', a);
        await nextTick();
        changeFormData();
        Event.runEventByName('onChange', props.widget.events, a, data, formData.value);
      },
    });
  }

  const handleClear = () => {
    emit('update:modelValue', null);
    Event.runEventByName('afterClear', props.widget.events, null, null, formData.value);
    fieldValue.value = null;
    formData.value._DICT[field] = undefined;
  };

  defineExpose<IMobDocumentTemplateComponentExpose>({
    getValue() {
      return fieldValue.value;
    },
    setValue(v) {
      fieldValue.value = v;
    },
  });
</script>

<style lang="less" scoped></style>
