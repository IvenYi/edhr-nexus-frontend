<template>
  <div class="tree-popup">
    <van-popup
      v-model:show="showPopup"
      position="bottom"
      closeable
      :style="{ height: '80%', overflow: 'hidden' }"
      round
    >
      <treeCheck
        v-if="showPopup"
        ref="treeCheckRef"
        :type="checkedType"
        :options="orgOptions"
        @checked="checked"
        :activeKey="activeKey"
        :activeKeys="activeKeys"
        :title="title"
        :hasNoLabels="hasNoLabels"
        :ignoreCase="ignoreCase"
        :maxTagTextLength="attrObj.maxTagTextLength"
      />
    </van-popup>
  </div>
</template>

<script setup name="treePopup" lang="ts">
  import treeCheck from './treeCheck.vue';
  import { ref, watch } from 'vue';
  import { SelectType, type optionType } from './typing';
  import { cloneDeep } from 'lodash-es';
  import { useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/useFileAttrsHooks';

  const props = defineProps<{
    api: Function;
    title: string;
    options: optionType[];
    fieldKey: string;
    modelKey: string;
    isTreeData?: boolean;
    hasNoLabels?: boolean;
    ignoreCase?: number;
  }>();
  const showPopup = ref<boolean>(false);
  const activeKey = ref<string>('');
  const activeKeys = ref<any[]>([]);
  const orgOptions = ref<any[]>([]);
  const optionlist = ref(props.options);
  // const orgOptions = ref<any[]>([]);
  let handleSingleOk: Function;
  let handleMutipleOk: Function;
  let checkedType = ref<any>('');
  const treeCheckRef = ref();
  const { getmaxTagLength, attrObj } = useAsyncFileAttrs();

  watch(
    () => props.options,
    () => {
      const optionArr = setOrgOptions();
      orgOptions.value = [...optionArr];
    },
    { immediate: true, deep: true },
  );

  // const optionList = reactive([
  //   {
  //     id: 'd2d31d511b3442eb801f34df21jjhes',
  //     name: '恒力',
  //     parentId: 'ROOT',
  //     sortNum: 41,
  //     type: 'GROUP',
  //     principalUserId: '3062b2a833d244c09d60ef51a773554a',
  //     principalUserName: '陈建华',
  //   },
  //   {
  //     id: 'fc6c465faac6417e81e6d06fd35d882b',
  //     name: '恒力智能科技有限公司',
  //     parentId: 'd2d31d511b3442eb801f34df21190242',
  //     sortNum: 0,
  //     type: 'DEPARTMENT',
  //     principalUserId: '77e6340a214f44a297b572f6a42d3af0',
  //     principalUserName: '王明',
  //   },
  //   {
  //     id: 'u8nIDz24MMxHRbtp',
  //     name: '信息中心',
  //     parentId: 'fc6c465faac6417e81e6d06fd35d882b',
  //     sortNum: 0,
  //     type: 'DEPARTMENT',
  //     principalUserId: null,
  //     principalUserName: null,
  //   },
  //   {
  //     id: '1mRQOo1DEzX7zWyX',
  //     name: '行政中心',
  //     parentId: 'fc6c465faac6417e81e6d06fd35d882b',
  //     sortNum: 1,
  //     type: 'DEPARTMENT',
  //     principalUserId: null,
  //     principalUserName: null,
  //   },
  //   {
  //     id: '1mRQOo1DEzX7zWyXkkssadeqw45',
  //     name: '行政部门一',
  //     parentId: '1mRQOo1DEzX7zWyX',
  //     sortNum: 1,
  //     type: 'DEPARTMENT',
  //     principalUserId: null,
  //     principalUserName: null,
  //   },
  //   {
  //     id: '2fKJGo1NhzX7zWyXkkssadeqw45',
  //     name: '行政部门二',
  //     parentId: '1mRQOo1DEzX7zWyX',
  //     sortNum: 1,
  //     type: 'DEPARTMENT',
  //     principalUserId: null,
  //     principalUserName: null,
  //   },
  //   {
  //     id: '4JsQOo1DEzX7zWyXUYB8iok',
  //     name: '人事部',
  //     parentId: '2fKJGo1NhzX7zWyXkkssadeqw45',
  //     sortNum: 1,
  //     type: 'DEPARTMENT',
  //     principalUserId: null,
  //     principalUserName: null,
  //   },
  //   {
  //     id: '403c60b034fd4d45a4a4d530071741dc',
  //     name: '恒力云商',
  //     parentId: 'd2d31d511b3442eb801f34df21190242',
  //     sortNum: 1,
  //     type: 'DEPARTMENT',
  //     principalUserId: '18104475c7034e338d70469ddcb439c4',
  //     principalUserName: '郑新奇',
  //   },
  //   {
  //     id: 'Iw8GISelugpYnScd',
  //     name: '吴江化纤厂',
  //     parentId: 'd2d31d511b3442eb801f34df21190242',
  //     sortNum: 2,
  //     type: 'DEPARTMENT',
  //     principalUserId: null,
  //     principalUserName: null,
  //   },
  //   {
  //     id: 'UqlNY59iRaUiWxoy',
  //     name: '恒力热电厂',
  //     parentId: 'd2d31d511b3442eb801f34df21190242',
  //     sortNum: 3,
  //     type: 'DEPARTMENT',
  //     principalUserId: null,
  //     principalUserName: null,
  //   },
  //   {
  //     id: 'gqptk8wXa4q9w0PK',
  //     name: '恒力造船厂',
  //     parentId: 'd2d31d511b3442eb801f34df21190242',
  //     sortNum: 4,
  //     type: 'DEPARTMENT',
  //     principalUserId: null,
  //     principalUserName: null,
  //   },
  //   {
  //     id: 'd2d31d511b3442eb801f34df21190242',
  //     name: '恒力集团',
  //     parentId: 'ROOT',
  //     sortNum: 40,
  //     type: 'GROUP',
  //     principalUserId: '3062b2a833d244c09d60ef51a773554a',
  //     principalUserName: '陈建华',
  //   },
  // ]);

  function setOrgOptions() {
    let treeOptions: optionType[] = [];
    const arrClone: any = cloneDeep(optionlist.value);
    arrClone.forEach((i) => {
      const isRoot = !arrClone.find((o) => o.value === i._item.parentId);
      isRoot && (i._item.parentId = 'ROOT');
    });
    if (props.isTreeData) {
      treeOptions = arrClone;
    } else {
      // 映射表 => 快速找到上级
      const mapInfo = arrClone.reduce((obj: any, item: any) => {
        item.parentId = item._item.parentId;
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
    }
    return treeOptions;
  }

  const checked = (value: any) => {
    if (checkedType.value === SelectType.SINGLE) {
      activeKey.value = value;
      handleSingleOk && handleSingleOk(value);
    } else if (checkedType.value === SelectType.MULTIPLE) {
      activeKeys.value = value;
      handleMutipleOk && handleMutipleOk(value);
    }
    showPopup.value = false;
  };

  const singleTreeOpen = ({ ids, type, callback }: any) => {
    activeKey.value = ids || '';
    checkedType.value = type;
    showPopup.value = true;
    handleSingleOk = callback;
  };

  const multipleTreeOpen = async ({ ids, type, callback }: any) => {
    activeKeys.value = ids || [];
    checkedType.value = type;
    showPopup.value = true;
    await getmaxTagLength({ fieldKey: props.fieldKey, modelKey: props.modelKey });
    handleMutipleOk = callback;
  };

  defineExpose({ singleTreeOpen, multipleTreeOpen });
</script>

<style>
  .tree-popup > .van-popup > .van-popup__close-icon {
    position: absolute;
    right: 12px;
    color: #c3c3c3;
    font-size: 16px;
  }
</style>
