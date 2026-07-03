<template>
  <div class="list-popup">
    <van-popup
      v-model:show="showPopup"
      :position="position"
      closeable
      :style="style"
      :round="round"
      :teleport="teleport"
    >
      <optionList
        v-if="showPopup && !isTree"
        :api="api"
        :type="checkedType"
        :options="orgOptions"
        :activeKey="checkedType === SelectType.SINGLE ? (activeKey ? [activeKey] : []) : activeKey"
        :title="title"
        :showSearch="showSearch"
        :lazy="lazy"
        :remote="remote"
        :iconNode="iconNode"
        :selectedOptions="selectedOptions"
        :onloadMore="onloadMore"
        :scan="scan"
        :optionLabelProp="optionLabelProp"
        :customSearch="customSearch"
        :filterFn="filterFn"
        :ignoreCase="ignoreCase"
        :maxTagTextLength="attrObj.maxTagTextLength"
        @checked="checkedValue"
        @handleSearch="handleSearch"
      />
      <treeList
        v-if="showPopup && isTree"
        :type="checkedType"
        :options="orgOptions"
        :activeKey="activeKey"
        :title="title"
        :showSearch="showSearch"
        :remote="remote"
        :ignoreCase="ignoreCase"
        :maxTagTextLength="attrObj.maxTagTextLength"
        @checked="checkedValue"
        @refresh="refresh"
        @handleSearch="handleSearch"
      />
    </van-popup>
  </div>
</template>

<script setup name="listPopup" lang="ts">
  import optionList from './optionList.vue';
  import treeList from './treeList.vue';
  import { computed, ref } from 'vue';
  import { SelectType, type optionType } from './typing';
  import { cloneDeep } from 'lodash-es';
  import { ListTreeSearchTypeEnum } from '@gct/runtime';
  import { useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/useFileAttrsHooks';

  const props = defineProps<{
    api?: Function;
    title: string;
    options: optionType[];
    fieldKey: string;
    showSearch: Boolean; // 开启搜索
    isTree: Boolean;
    lazy?: Boolean; // 开启分页加载
    selectedOptions?: optionType[]; // 所有选中项的opts，用于懒加载时，数据不全，多选状态下，无法回显全部的选中项
    remote?: Boolean; // 开启远程搜索
    iconNode?: Boolean; // 需要渲染图标
    multiple?: Boolean;
    onloadMore?: Function; // 分页加载的方法
    scan?: Boolean; // 是否支持扫码
    optionLabelProp?: String; // 下拉框中显示的字段，默认取得是label，可用此属性配置显示其他的字段。
    customSearch?: Function;
    position?: 'top' | 'bottom' | 'left' | 'right';
    popStype?: object;
    teleport?: string | HTMLElement | null;
    filterFn?: Function;
    ignoreCase?: number;
    modelKey?: string;
  }>();
  const showPopup = ref<boolean>(false);
  const activeKey = ref<string | any[]>('');
  const orgOptions = ref<optionType[]>(props.options);
  const checkedType = ref<any>('');
  const keyword = ref('');
  const handleOk = ref<Function>(() => {});
  const position = ref(props.position || 'bottom');
  const teleport = ref(props.teleport || null);
  const { getmaxTagLength, attrObj } = useAsyncFileAttrs();
  const round = computed(() => {
    return position.value === 'bottom';
  });
  const style = ref<any>(
    props.popStype || {
      height: '60%',
      overflow: 'hidden',
    },
  );

  // const SINGLE_FIELD_TYPES = [
  //   FIELD_TYPE.ENUM,
  //   FIELD_TYPE.USER,
  //   FIELD_TYPE.ORG,
  //   FIELD_TYPE.REF,
  //   FIELD_TYPE.RDO_REF,
  //   FIELD_TYPE.MESSAGE_TMPL,
  //   FIELD_TYPE.ASSOCIATED_PRIMARY_KEY,
  // ];

  const checkedValue = (value: any) => {
    // let checkOptions = new Map();
    if (checkedType.value === SelectType.SINGLE) {
      activeKey.value = value.value ?? value;
    } else if (checkedType.value === SelectType.MULTIPLE) {
      if (!props.isTree) {
        const ids = (value.value ?? value)?.map((i: any) => i.value);
        activeKey.value = ids;
      } else {
        activeKey.value = value;
      }
    }
    const checkedVals =
      checkedType.value === SelectType.SINGLE ? [activeKey.value] : activeKey.value;
    const checkOptions = orgOptions.value.filter((i: any) => checkedVals.includes(i.value));
    // for (let item of checkedVals) {
    //   const opt = orgOptions.value.find((i) => i.value == item);
    //   checkOptions.set(item, opt);
    // }
    handleOk.value({ a: activeKey.value, checkOptions });
    showPopup.value = false;
  };

  const open = async ({ ids, callback }: any) => {
    checkedType.value = !props.multiple ? SelectType.SINGLE : SelectType.MULTIPLE;
    activeKey.value = cloneDeep(ids) || (checkedType.value == SelectType.SINGLE ? '' : []);
    showPopup.value = true;
    handleOk.value = callback;
    // 字段值展示的字符支持配置
    if (props.multiple && props.modelKey) {
      await getmaxTagLength({ fieldKey: props.fieldKey, modelKey: props.modelKey });
    }
    if (props.isTree && props.api) {
      if (activeKey.value) {
        const requestApi: any = props.api;
        const checkedIds = checkedType.value == SelectType.SINGLE ? [ids] : ids;
        await requestApi({ ids: checkedIds });
      } else {
        refresh({});
      }
    }
  };

  async function refresh(value: any) {
    if (!props.api) return;
    const requestApi = props.api;
    if (value?.id) {
      await requestApi({ searchType: ListTreeSearchTypeEnum.CHILDREN, parent_id_: value?.id });
    } else {
      await requestApi();
    }
  }

  async function handleSearch(val: any, pageNo: number) {
    if (!props.api) return;
    keyword.value = val;
    const requestApi = props.api;
    if (props.isTree) {
      await requestApi({
        searchType: val?.trim() ? ListTreeSearchTypeEnum.SEARCH : ListTreeSearchTypeEnum.LEVEL,
        keyword: val,
        pageNo: pageNo || 1,
      });
    } else {
      await requestApi({ keyword: val, pageNo: pageNo || 1 });
    }
  }

  defineExpose({ open });
</script>

<style lang="less">
  .list-popup > .van-popup > .van-popup__close-icon {
    position: absolute;
    right: 12px;
    color: #c3c3c3;
    font-size: 16px;
  }
</style>
