<template>
  <vantField
    v-model="fieldValue"
    :props="widget.props"
    :style="widget.style"
    :formData="formData"
    :isLink="!fieldValue"
    clearable
    readonly
    @click="openView"
    @clearValue="handleClear"
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

<script setup lang="ts" name="gct-tmpl-tree-select">
  import { ref, computed, toRefs, toRaw, nextTick, reactive, inject, watch } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { TmplTreeSelect } from '/@page-designer/types/mobile';
  import vantField from '../../__components__/vantField.vue';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { createTreePopup, optionType, SelectType } from '../../__components__/treePopup';
  import Taglabel from '../../__components__/taglabel.vue';
  import { i18n } from '@mobile/locales/setupI18n';
  import {
    getFormRelateListAllCategory,
    getFormRelateListAllVersion,
    getFormRelateInfo,
  } from '@mobile/apis/gct-apaas/FormRelateController';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { cacheAdapter } from '../../../hooks/cacheAdapter';
  import { IMobTmplTreeSelectComponentExpose } from '/@/projects/page-designer/src/interface/mobile';
  import { getInterfaceApi } from '@gct/runtime';

  inject('form-layout', {});

  const { t } = i18n.global;

  const props = defineProps<{ modelValue?: string; widget: TmplTreeSelect; formData: Object }>();
  const emit = defineEmits(['update:modelValue']);
  const Event = getPageEvent();
  const { formData } = toRefs(props);
  const { fieldType, placeholder, field } = reactive(props.widget.props);
  const options = ref<any[]>([]);

  const moduleType = ref(
    fieldType === FIELD_TYPE.E_DHR_TEMPLATE ? 'edhr_module' : 'online_form_module',
  );

  const fieldValue = props.widget.props.field
    ? computed<any>({
        get() {
          return props.modelValue;
        },
        set(value: string[]) {
          emit('update:modelValue', value);
        },
      })
    : ref();

  let fieldObj = ref<any>({});

  const selectedOptions = ref<optionType[]>([]);

  const { openTreePopup } = createTreePopup({
    asyncApi: cacheFunc,
    lazy: true,
    async: true,
    showSearch: true,
    options: options,
    // selectedOptions: selectedOptions,
    showTag: (data) => data.default === 1,
    showBtnArea: (data) => {
      return data.checkedId && data.checkedData.parentId !== 'ROOT';
    },
  });

  const showReadonly = computed(() => useReadyonly(props.widget.props.readonly));

  const showDisabled = computed<boolean>(() => useDisabled(props.widget.props.disabled));

  const separatorAttr = computed(() => {
    return {
      disabled: showDisabled.value,
      type: fieldType,
      tagWidgetStyle: props.widget.style,
      label: fieldObj.value.fieldLabel,
    };
  });

  watch(
    () => fieldValue.value,
    async () => {
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

  const handleClear = () => {
    emit('update:modelValue', null);
    Event.runEventByName('afterClear', props.widget.events, null, null, formData.value);
    fieldValue.value = null;
    formData.value._DICT[field] = undefined;
  };
  /**
   * 获取选中的options
   */
  async function getOptionValue(v = fieldValue.value) {
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
            module: moduleType.value,
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

  const openView = () => {
    if (showDisabled.value || showReadonly.value) return;
    openTreePopup({
      // ids: fieldValue.value,
      type: SelectType.SINGLE,
      title:
        fieldType === FIELD_TYPE.E_DHR_TEMPLATE
          ? t('sys.pageDesigner.chooseTmplSth', { sth: 'DHR' })
          : t('sys.pageDesigner.chooseTmplSth', {
              sth: t('sys.pageDesigner.fieldCmp.online_form'),
            }),
      checked: async (id) => {
        await nextTick();
        const data = await getOptionValue(id);
        changeFormData();
        await Event.runEventByName('afterSelect', props.widget.events, id, data, formData.value);
      },
      saved: async (id, data) => {
        fieldValue.value = id;
        await nextTick();
        changeFormData();
        Event.runEventByName(
          'onChange',
          props.widget.events,
          fieldValue.value,
          data,
          formData.value,
        );
      },
    });
  };

  async function cacheFunc(params) {
    return await cacheAdapter({ ...params, field: field }, getTmplList);
  }

  async function getTmplList(params) {
    const { id, categoryId, module: nodeModule } = params;
    if (nodeModule) return getLevel2Data(params);
    let api: any;
    if (categoryId) api = getFormRelateListAllVersion;
    else api = getFormRelateListAllCategory;
    const res = await api({
      moduleType: moduleType.value,
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
    const res: any = await getInterfaceApi.getTmplsList({
      moduleType: moduleType.value,
      categoryId: id,
      containChild: false, // 不含版本
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

  async function getTmplInfo(id) {
    const res = await getFormRelateInfo({ id, moduleType: moduleType.value });
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

  defineExpose<IMobTmplTreeSelectComponentExpose>({
    getValue() {
      return fieldValue.value;
    },
    setValue(v) {
      fieldValue.value = v;
    },
  });
</script>
<style scoped lang="less"></style>
