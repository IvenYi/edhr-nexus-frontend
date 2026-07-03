<template>
  <div class="tree-popup" id="gct-tree-popup">
    <van-popup
      v-model:show="showPopup"
      position="bottom"
      :closeable="true"
      round
      :style="{ height, overflow: 'hidden' }"
    >
      <Wrap
        v-if="showPopup"
        v-bind="$props"
        :title="popupTitle"
        :activeKeys="activeKeys"
        :options="orgOptions"
        @onSave="onSaved"
        @onCancel="closePopup"
      />
      <!-- <treeCheck
        v-if="showPopup"
        ref="treeCheckRef"
        v-bind="$props"
        :title="popupTitle"
        :type="checkedType"
        :activeKey="activeKey"
        :activeKeys="activeKeys"
        :options="orgOptions"
        @checked="checked"
        @cancel="closePopup"
        @saved="onSaved"
        @getAsyncData="getAsyncData"
      /> -->
    </van-popup>
  </div>
</template>

<script setup name="treePopup" lang="ts">
  import { ref, computed } from 'vue';
  import { optionType, openPickerByType, Options } from './typing';
  import { cloneDeep } from 'lodash-es';
  import Wrap from './components/wrap.vue';

  const props = withDefaults(defineProps<Options>(), { showCancel: true, height: '53%' });
  const showPopup = ref<boolean>(false);
  const activeKeys = ref<string[] | number[]>([]);
  let handleSaved: Function;
  let handleClosed: Function;
  const popupTitle = ref<string>('');

  const optionsData = computed(() => {
    return props.options?.value.map((e) => {
      return { ...e, parentId: e.parentId || 'ROOT' };
    });
  });

  const orgOptions = computed(() => {
    return !props.isTree ? props.options?.value || [] : setOrgOptions(optionsData.value);
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

  // const checked = (value: any) => {
  //   activeKeys.value = value;
  //   handleChecked && handleChecked(value);
  // };

  const treeOpen = async (params: openPickerByType) => {
    const { title, ids, checked, saved, closed } = params;
    popupTitle.value = title || '请选择';
    activeKeys.value = Array.isArray(ids) ? ids : ids ? [ids] : [];
    console.log('open---', params, ids, props.multiple, activeKeys.value, props);
    showPopup.value = true;
    // if (checked && typeof checked === 'function') handleChecked = checked;
    if (saved && typeof saved === 'function') handleSaved = saved;
    if (closed && typeof closed === 'function') handleClosed = closed;
    // if (props.lazy && props.asyncApi) props.asyncApi({ pageNo: 1 });
  };

  // 保存
  const onSaved = () => {
    const stedData = props.options?.value.filter((e) => activeKeys.value.includes(e.value));
    handleSaved &&
      handleSaved(
        props.multiple ? activeKeys.value : activeKeys.value[0],
        props.multiple ? stedData : stedData[0],
      );
    closePopup();
  };

  // 取消
  const closePopup = () => {
    showPopup.value = false;
    handleClosed && handleClosed();
  };

  defineExpose({ treeOpen });
</script>

<style>
  #gct-tree-popup > .van-popup > .van-popup__close-icon {
    position: absolute;
    right: 12px;
    color: #c3c3c3;
    font-size: 16px;
  }
</style>
