<template>
  <div class="tree-popup" id="gct-tree-popup">
    <van-popup
      v-model:show="showPopup"
      position="bottom"
      :closeable="true"
      round
      :style="{ height, overflow: 'hidden' }"
    >
      <treeCheck
        v-if="showPopup"
        ref="treeCheckRef"
        v-bind="$props"
        :title="popupTitle"
        :type="checkedType"
        :activeKey="activeKey"
        :activeKeys="activeKeys"
        :options="orgOptions"
        :ignoreCase="ignoreCase"
        @checked="checked"
        @cancel="closePopup"
        @saved="onSaved"
        @getAsyncData="getAsyncData"
      />
    </van-popup>
  </div>
</template>

<script setup name="treePopup" lang="ts">
  import treeCheck from './treeCheck.vue';
  import { ref, computed } from 'vue';
  import { SelectType, type optionType, openPickerByType } from './typing';
  import { cloneDeep } from 'lodash-es';

  const props = withDefaults(
    defineProps<{
      // title: string;
      options: optionType[]; // 二维数组
      disabledOk?: boolean | Function;
      showTag?: boolean | Function;
      showCancel?: boolean | Function;
      showBtnArea?: (IData) => boolean;
      showSearch?: boolean;
      async?: boolean;
      lazy?: boolean;
      height?: string;
      asyncApi?: (IData) => Promise<Boolean | undefined>;
      onloadMore?: Function; // 加载更页数。若配置此参数，从第二页开始，请求此方法；否则，使用asyncApi方法
      selectedOptions?: optionType[]; // 所有选中项的opts
      customSearch?: Function; // 自定义搜索方法
      ignoreCase?: number; // 1, 0
    }>(),
    { showCancel: true, height: '80%' },
  );
  const showPopup = ref<boolean>(false);
  const activeKey = ref<string | number>('');
  const activeKeys = ref<string[] | number[]>([]);
  let handleChecked: Function;
  let handleSaved: Function;
  let handleClosed: Function;
  let checkedType = ref<any>('');
  const treeCheckRef = ref();
  const popupTitle = ref();

  const optionsData = computed(() => {
    return props.options.value.map((e) => {
      return { ...e, parentId: e.parentId || 'ROOT' };
    });
  });

  const orgOptions = computed(() => {
    return setOrgOptions(optionsData.value);
  });

  function setOrgOptions(options) {
    let treeOptions: optionType[] = [];
    const arrClone: any = cloneDeep(options);
    arrClone.forEach((i) => {
      const isRoot = !arrClone.find((o) => o.value === i.parentId);
      isRoot && (i.parentId = 'ROOT');
    });
    // 映射表 => 快速找到上级
    const mapInfo = arrClone.reduce((obj: any, item: any) => {
      item.children = [];
      obj[item.value] = item;
      return obj;
    }, {});
    // 转树
    arrClone.forEach((i: any) => {
      const parent = mapInfo[i.parentId];
      // 如果父节点存在，push到父级的children数组中
      // 如果父级不存在，直接push到treeData数组
      parent ? parent.children.push(i) : treeOptions.push(i);
    });
    return treeOptions;
  }

  const checked = (value: any) => {
    if (checkedType.value === SelectType.SINGLE) {
      activeKey.value = value;
    } else if (checkedType.value === SelectType.MULTIPLE) {
      activeKeys.value = value;
    }
    handleChecked && handleChecked(value);
  };

  const getAsyncData = async (data, callback?) => {
    if (props.asyncApi) {
      const res = await props.asyncApi(data);
      if (callback) callback(res);
    }
  };

  const treeOpen = async (params: openPickerByType) => {
    const { title, ids, type, checked, saved, closed } = params;
    popupTitle.value = title;
    activeKeys.value = ids || [];
    activeKey.value = ids || '';
    checkedType.value = type;
    showPopup.value = true;
    if (checked && typeof checked === 'function') handleChecked = checked;
    if (saved && typeof saved === 'function') handleSaved = saved;
    if (closed && typeof closed === 'function') handleClosed = closed;
  };

  // 保存
  const onSaved = (ids, data) => {
    handleSaved && handleSaved(ids, data);
    closePopup();
  };

  // 取消
  const closePopup = () => {
    showPopup.value = false;
    handleClosed && handleClosed();
  };

  defineExpose({ treeOpen });
</script>

<style lang="less">
  #gct-tree-popup > .van-popup > .van-popup__close-icon {
    position: absolute;
    right: 12px;
    color: #c3c3c3;
    font-size: 16px;
  }
</style>
