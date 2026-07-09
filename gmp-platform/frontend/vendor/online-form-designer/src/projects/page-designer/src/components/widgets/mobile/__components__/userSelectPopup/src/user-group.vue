<template>
  <div class="mt-13px">
    <span v-for="(item, index) in breadList" :key="index" class="bread">
      <span v-if="index !== 0" class="bread-icon">></span>
      <span
        v-if="index !== breadList.length - 1"
        class="bread-text bread-ellipsis"
        @click="back(index, item)"
      >
        {{ item.name }}
      </span>
      <span v-if="index === breadList.length - 1" class="bread-ellipsis">{{ item.name }}</span>
    </span>
  </div>
  <div
    class="flex items-center justify-between px-12px py-8px action"
    v-if="(props.multiple && orgUserData.length) || breadList.length > 1"
  >
    <van-checkbox
      v-if="props.multiple && orgUserData.length"
      v-model="isCheckAll"
      shape="square"
      @click="checkAllChange"
    >
      {{ t('sys.selectAll') }}
    </van-checkbox>
    <span v-else></span>
    <span class="flex items-center" v-if="breadList.length > 1">
      {{ t('sys.appDesigner.displayAllGroupUser') }}
      <van-switch v-model="displayDeep" class="ml8px" @change="changeDeep" size="16px" />
    </span>
  </div>
  <div
    class="overflow-y-auto h100%"
    :style="{ height: breadList.length ? 'calc(100% - 91px)' : 'calc(100% - 66px)' }"
  >
    <van-cell v-for="(item, index) in orgList" clickable :key="index" @click="toNext(item)">
      <template #title>
        <div class="item flex items-center w100%">
          <div class="mr-12px user-group-icon flex items-center w40px">
            <IconNext :size="40" color="#3168EC" value="icon-wenjianjia1" />
          </div>

          <div class="flex-1 org-name">
            {{ item.name }}
          </div>
        </div>
      </template>
    </van-cell>
    <user
      :userSource="orgUserData"
      v-model:selectUser="selctUserSource"
      :multiple="props.multiple"
    />
  </div>
</template>
<script setup lang="ts">
  import User from './user.vue';
  import { ref, watch } from 'vue';
  import { getDesignerCommonGetUserGroupUser } from '/@/apis/gct-apaas/DesignerCommonController';
  import { PickerUserDTO } from '@mobile/apis/gct-platform/model';
  import IconNext from '@/components/Icon/src/IconNext.vue';
  import { i18n } from '@mobile/locales/setupI18n';

  const props = withDefaults(
    defineProps<{
      treeData: any;
      selectUser?: any[];
      multiple: boolean;
    }>(),
    {},
  );

  const { t } = i18n.global;

  const displayDeep = ref<boolean>(false);

  const orgUserData = ref<PickerUserDTO[]>([]);

  const currentNode = ref();

  const emit = defineEmits(['update:selectUser']);

  const selctUserSource = ref<Array<any>>([]);
  const orgUserList = ref<Array<string>>([]);

  const orgList = ref<any>([]);

  /** 全选 */
  const isCheckAll = ref<boolean>(false);

  /** 面包屑 */
  const breadList = ref<Array<any>>([
    {
      name: '全部',
    },
  ]);

  const toNext = (item?) => {
    if (!item) {
      orgList.value = props.treeData;
    } else {
      breadList.value.push(item);
      currentNode.value = item.id;
      if (item.children && item.children.length) {
        orgList.value = item.children;
        getUserDataByOrg(item.id);
      } else {
        orgList.value = [];
        getUserDataByOrg(item.id);
      }
    }
  };

  toNext();

  /** 全选方法 */
  const checkAllChange = () => {
    let selectList = selctUserSource.value ?? [];
    if (isCheckAll.value) {
      const arr = selctUserSource.value.concat(orgUserData.value);
      selectList = arr.reduce((accumulator, current) => {
        const duplicate = accumulator.find((item: any) => item.id === current.id);
        if (!duplicate) {
          return accumulator.concat([current]);
        }
        return accumulator;
      }, []);
    } else {
      const orgUserList = orgUserData.value.map((p) => p.id);
      selectList = selctUserSource.value.filter((i) => {
        return !orgUserList.includes(i.id);
      });
    }

    emit('update:selectUser', selectList);
  };

  /** 点击面包屑回到对应层级 */
  const back = (index, item) => {
    if (!index) {
      breadList.value = [
        {
          name: '全部',
        },
      ];
      orgList.value = props.treeData;
      orgUserData.value = [];
      return;
    }
    orgList.value = breadList.value[index].children;
    getUserDataByOrg(item.id);
    currentNode.value = item.id;
    breadList.value = breadList.value.slice(0, index + 1);
  };

  /** 回到上一级 */
  const backPreview = () => {
    if (breadList.value.length > 1) {
      back(breadList.value.length - 2, breadList.value[breadList.value.length - 2]);
    } else {
      breadList.value = [
        {
          name: '全部',
        },
      ];
      orgList.value = props.treeData;
      orgUserData.value = [];
    }
  };
  const changeDeep = () => {
    getUserDataByOrg(currentNode.value);
  };

  watch(
    () => props.selectUser,
    (value) => {
      selctUserSource.value = value;
    },
    { immediate: true },
  );

  const judgeCkeckAll = (value) => {
    if (props.multiple && orgUserData.value.length) {
      const slectList = value.map((p) => p.id);
      const newSet = slectList.filter((item) => orgUserList.value.includes(item));

      if (newSet.length === orgUserList.value.length) {
        isCheckAll.value = true;
      } else {
        isCheckAll.value = false;
      }
    }
  };

  watch(
    () => selctUserSource.value,
    (value) => {
      judgeCkeckAll(value);
      emit('update:selectUser', value);
    },
    { deep: true },
  );

  /** 查询用戶組下的人员 */
  async function getUserDataByOrg(orgIds) {
    const res = await getDesignerCommonGetUserGroupUser({
      userGroupIds: orgIds,
      pageNo: 1,
      pageSize: 999999999,
      allUserOption: displayDeep.value === false ? 0 : 1,
    });

    orgUserData.value = res || [];

    orgUserList.value = orgUserData.value.map((p) => p.id) || [];
    judgeCkeckAll(selctUserSource.value);
  }

  defineExpose({ backPreview, breadList });
</script>
<style lang="less" scoped>
  .bread {
    .bread-text {
      color: var(--van-primary-color);
      cursor: pointer;
    }
    .bread-ellipsis {
      display: inline-block;

      max-width: 60%;
      overflow: hidden; /* 确保超出容器的文本被裁剪 */
      white-space: nowrap; /* 确保文本在一行内显示 */
      text-overflow: ellipsis; /* 使用省略号表示文本超出 */
    }
    .bread-icon {
      display: inline-block;
      color: #c7c7c8;
      margin: 0 8px;
      vertical-align: top;
    }
  }
  .action {
    background: #f6f7f9;
    border-radius: 4px 4px 4px 4px;
    margin: 4px 0;
  }
  .user-group-icon {
    justify-content: center;
    width: 48px;
    height: 48px;
    background: #d8e2fc;
    border-radius: 4px 4px 4px 4px;
    border: 1px solid #f0f0f0;
  }
  .org-name {
    word-wrap: break-word; /* 旧版属性，部分浏览器支持 */
    overflow-wrap: break-word; /* 标准属性，应优先使用 */
    max-width: calc(100% - 63px);
  }
  :deep(.van-cell__title) {
    width: 100%;
  }
</style>
