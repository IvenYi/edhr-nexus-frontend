<template>
  <vantField
    v-model="fieldValue"
    :props="widget.props"
    :style="widget.style"
    @click="openView"
    :isLink="!fieldValue"
    readonly
    clearable
    @clearValue="handleClear"
    :formData="formData"
  >
    <template #input v-if="fieldValue">
      <taglabel v-if="showReadonly" v-bind="separatorAttr" />
      <van-cell
        v-else
        :is-link="!fieldValue"
        :border="false"
        style="padding: 0; background: transparent"
      >
        <template #value>
          <taglabel
            :disabled="showDisabled"
            :type="fieldType"
            :label="fieldObj.fieldLabel ?? placeholder ?? t('sys.chooseText')"
            :showTagStyle="!!fieldValue"
            :tagWidgetStyle="widget.style"
            :style="{
              display: 'inline-block',
              maxWidth: '70%',
            }"
          />
          <van-tag
            v-if="!fieldObj.version"
            color="#EFF3FA"
            size="medium"
            style="color: var(--van-primary-color); border-radius: 4px; margin-left: 4px"
          >
            {{ t('sys.default') }}
          </van-tag>
        </template>
      </van-cell>
    </template>
  </vantField>
</template>

<script setup lang="ts" name="gct-label-template-ref">
  import { ref, computed, toRefs, toRaw, nextTick, reactive, onBeforeMount, watch } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import vantField from '../../__components__/vantField.vue';
  import { createTreePopup, optionType, SelectType } from '../../__components__/treePopup';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { i18n } from '@mobile/locales/setupI18n';
  import { cacheAdapter } from '../../../hooks/cacheAdapter';
  import {
    getPrintDesignerInfo,
    getPrintDesignerListAllVersion,
    getPrintDesignerRdoPageBaseList,
  } from '/@/apis/gct-apaas/PrintDesignerController';
  import { getFormRelateListAllCategory } from '@mobile/apis/gct-apaas/FormRelateController';
  import Taglabel from '../../__components__/taglabel.vue';
  import { IMobLabelTemplateRefComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const props = defineProps<{
    modelValue?: string;
    widget: LowCodeWidget.FieldSchema;
    formData: Object;
    moduleType: string;
  }>();
  const { t } = i18n.global;
  const emit = defineEmits(['update:modelValue']);
  const Event = getPageEvent();
  const { formData } = toRefs(props);
  const { label, fieldName, modelKey, field, fieldType } = reactive(props.widget.props);
  const options = ref<any[]>([]);
  const treeData = ref<any[]>([]);
  const treeFlat = ref<any[]>([]);
  let fieldObj = ref<any>({});
  const selectedOptions = ref<optionType[]>([]);

  function tree2list(arr: any) {
    let cloneTree = JSON.parse(JSON.stringify(arr));
    function iteration(tree: any, level: any) {
      let temp: any = [];
      for (const i of tree) {
        i.level = level;
        temp.push(i);
        if (i.children?.length) {
          temp = [...temp, ...iteration(i.children, level + 1)];
        }
      }
      return temp;
    }
    return iteration(cloneTree, 1);
  }

  async function getModelList() {
    const tree = (await getCategoryListComplete({ module: PrintTypeEnum.LABEL as string })) || [];
    const list = tree.map((i) => {
      const children = i.children?.map((v) => {
        return {
          label: v.name,
          parentId: i.id,
          value: v.id,
          _item: v,
          children: [],
        };
      });
      return {
        label: i.name,
        value: i.id,
        parentId: 'ROOT',
        _item: i,
        noSelectable: true,
        children,
      };
    });
    treeData.value = tree2list(list);
    treeFlat.value = tree2list(list);
  }

  const showReadonly = computed(() => useReadyonly(props.widget.props.readonly));

  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));

  const separatorAttr = computed(() => {
    return {
      disabled: showDisabled.value,
      readonly: true,
      fieldType: fieldType,
      tagStyle: props.widget.style,
      options: treeFlat.value,
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
    async () => {
      console.log(8888888888, fieldObj.value, fieldValue.value);

      if (!fieldValue.value) fieldObj.value = {};
      else {
        const obj: any = (await getOptionValue(fieldValue.value)) || {};
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
    let api: any;
    if (categoryId) api = getPrintDesignerListAllVersion;
    else api = getFormRelateListAllCategory;
    const res = await api({
      moduleType: 'label_module',
      categoryId: id,
      baseId: id,
      pageNo: 1,
      pageSize: 30,
    });
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
      moduleType: 'label_module',
      categoryId: id,
      pageNo,
      pageSize: 30,
    });
    const list = formatData(res.data, id);
    list.forEach((e) => {
      if (!options.value.find((f) => f.value === e.value)) {
        options.value.push(e);
      }
    });
    return !res.totalPage || res.pageNo === res.totalPage;
  }

  function formatData(data, parentId) {
    const list: Array<any> = [];
    data?.forEach((i) => {
      const obj = {
        ...i,
        label: i.version || i.name,
        value: i.baseId ? i.baseId + ':' + i.id : i.id,
        parentId,
      };
      list.push({ ...obj });
    });
    return list;
  }

  /**
   * 获取选中的options
   */
  async function getOptionValue(v = fieldValue.value) {
    console.log(666666666);
    if (!v) return {};
    else {
      let data: optionType = options.value.find((i: any) => i.value === v);
      if (!data) {
        const id = props.modelValue
          ? props.modelValue.split(':')[1] || props.modelValue.split(':')[0]
          : '';
        const res = (await getTmplInfo(id)) || {};
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
  async function getTmplInfo(id) {
    const res = await getPrintDesignerInfo({ id, moduleType: 'label_module' });
    return res;
  }

  /**值发生变化 */
  async function changeFormData() {
    await nextTick();
    !!formData.value._DICT || (formData.value._DICT = {});
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

  defineExpose<IMobLabelTemplateRefComponentExpose>({
    getValue() {
      return fieldValue.value;
    },
    setValue(v) {
      fieldValue.value = v;
    },
  });
</script>

<style lang="less" scoped></style>
