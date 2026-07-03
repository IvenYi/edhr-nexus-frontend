<template>
  <a-row :gutter="[16, 0]">
    <a-col :span="14">
      <div class="select-wrap h450px ks-column">
        <div class="select-header">
          <div class="header-title">
            {{ t('sys.pageDesigner.ToBeSelect') }}
          </div>
        </div>
        <div class="select-main ks-col ks-row">
          <div class="select-main-left ks-col ks-column h100%" style="overflow: hidden">
            <div class="select-main-left-top ks-col ks-column" style="overflow: hidden">
              <div class="p12px pb10px">{{ t('sys.org.orgTree') }}</div>
              <div class="ks-col p12px pt0px" style="overflow: auto">
                <a-tree
                  v-model:checkedKeys="checkedKeys"
                  checkable
                  checkStrictly
                  :expanded-keys="expandedKeys"
                  :tree-data="orgTreeData"
                  :fieldNames="{
                    title: 'name',
                    key: 'formatId',
                  }"
                  @check="onTreeCheck"
                  @expand="onExpand"
                  @select="onTreeSelect"
                />
              </div>
            </div>
            <div
              v-if="userDataNotOrg.length"
              class="select-main-left-bottom ks-col ks-column"
              style="overflow: hidden"
            >
              <div class="p12px pb10px">{{ t('sys.org.visiblePersonnel') }}</div>
              <div class="ks-col" style="overflow: auto">
                <a-checkbox-group v-model:value="checkedKeys" class="mt10px w100%">
                  <div v-for="(el, i) in userDataNotOrg" :key="i" class="select-item">
                    <a-checkbox :value="el.formatId" @change="(e) => onUserCheck(e, el)">
                      <div :title="el.fullname" class="gct-text-overflow ks-col">
                        {{ el.fullname }}
                      </div>
                    </a-checkbox>
                  </div>
                </a-checkbox-group>
              </div>
            </div>
          </div>
          <div class="select-main-right ks-col ks-column" style="overflow: hidden">
            <div class="p12px">
              <a-input
                v-model:value="searchValue"
                class="mb8px"
                :placeholder="t('sys.searchText')"
              />
            </div>
            <div class="ks-col" style="overflow: auto">
              <a-checkbox-group v-model:value="checkedKeys" class="mt10px w100%">
                <div v-for="(el, i) in searchedOrgUserData" :key="i" class="select-item">
                  <a-checkbox :value="el.formatId" @change="(e) => onUserCheck(e, el)">
                    <div :title="el.fullname" class="gct-text-overflow ks-col">
                      {{ el.fullname }}
                    </div>
                  </a-checkbox>
                </div>
              </a-checkbox-group>
            </div>
          </div>
        </div>
      </div>
    </a-col>
    <a-col :span="10">
      <div class="ks-column h450px" style="overflow: hidden; row-gap: 12px">
        <div class="select-wrap ks-col ks-column" style="overflow: hidden">
          <div class="select-header">
            <div class="header-title">
              {{ t('sys.org.selectedDepartment') }}：
              <span class="text-[#797A7D] ml4px">{{ selectedOrgOptions.length }}</span>
            </div>
            <div
              class="cursor-pointer primary-gct"
              @click="
                updateValue(
                  false,
                  selectedOrgOptions.map((e) => e.formatId),
                )
              "
            >
              {{ t('sys.pageDesigner.deleteAll') }}
            </div>
          </div>
          <div class="select-main pt8px pb16px ks-col" style="overflow: auto">
            <div
              v-for="(el, i) in selectedOrgOptions"
              :key="i"
              class="selected-item ks-row p2px pl16px pr16px mt8px"
            >
              <div class="gct-text-overflow ks-col">{{ el.name }}</div>
              <i
                class="iconfont icon-shanchu2 cursor-pointer error-gct-hover text-[#333333]"
                @click="updateValue(false, el.formatId)"
              ></i>
            </div>
          </div>
        </div>
        <div class="select-wrap ks-col ks-column" style="overflow: hidden">
          <div class="select-header">
            <div class="header-title">
              {{ t('sys.org.selectedPersonnel') }}：
              <span class="text-[#797A7D] ml4px">{{ selectedUserOptions.length }}</span>
            </div>
            <div
              class="cursor-pointer primary-gct"
              @click="
                updateValue(
                  false,
                  selectedUserOptions.map((e) => e.formatId),
                );
                selectedUserOptions = [];
              "
            >
              {{ t('sys.pageDesigner.deleteAll') }}
            </div>
          </div>
          <div class="select-main pt8px pb16px ks-col" style="overflow: auto">
            <div
              v-for="(el, i) in selectedUserOptions"
              :key="i"
              class="selected-item ks-row p2px pl16px pr16px mt8px"
            >
              <div class="gct-text-overflow ks-col">{{ el.fullname }}</div>
              <i
                class="iconfont icon-shanchu2 cursor-pointer error-gct-hover text-[#333333]"
                @click="
                  updateValue(false, el.formatId);
                  selectedUserOptions = selectedUserOptions.filter(
                    (e) => e.formatId !== el.formatId,
                  );
                "
              ></i>
            </div>
          </div>
        </div>
      </div>
    </a-col>
  </a-row>
</template>
<script setup lang="ts" name="deptUser">
  import { ref, onMounted, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    getDesignerCommonGetCanBeUsedOrg,
    getDesignerCommonGetCanBeUsedOrgUser,
    getDesignerCommonGetVisibleUser,
  } from '/@/apis/gct-apaas/DesignerCommonController';
  import { cloneDeep } from 'lodash-es';
  import { PickerUserDTO, PickerOrgDTO } from '@mobile/apis/gct-platform/model';
  import { getOrgUserPickerTenantManagementUserListByIds } from '/@/apis/gct-platform/OrgUserPickerController';

  const { t } = useI18n();
  const emit = defineEmits(['update:value']);

  const props = defineProps<{
    value: Array<any>;
  }>();

  type OrgDTO = PickerOrgDTO & { formatId: string };
  type UserDTO = PickerUserDTO & { formatId: string };
  const searchValue = ref();
  const orgData = ref<OrgDTO[]>([]);
  const userDataNotOrg = ref<UserDTO[]>([]);
  const expandedKeys = ref<any[]>([]);
  const orgUserData = ref<UserDTO[]>([]);
  const selectedUserOptions = ref<UserDTO[]>([]);

  onMounted(() => {
    getOrgData();
    getUserDataNotOrg();
    const ids = props.value.filter((e) => e.includes('USER:')).map((e) => e.replace(/USER:/, ''));
    ids.length && getUserInfo(ids);
  });

  const checkedKeys = computed(() => {
    return props.value;
  });

  // tree绑定的数据
  const orgTreeData = computed(() => {
    return list2Tree(orgData.value);
  });

  // 已选择的部门
  const selectedOrgOptions = computed((): OrgDTO[] => {
    return orgData.value.filter((e) => props.value.includes(e.formatId));
  });

  // 已选择的人员
  // const selectedUserOptions = computed((): UserDTO[] => {
  //   const orgUsers = orgUserData.value.filter((e) => props.value.includes(e.formatId));
  //   const notOrgUsers = userDataNotOrg.value.filter((e) => props.value.includes(e.formatId));
  //   return orgUsers.concat(notOrgUsers);
  // });

  // 部门下的人员-搜索
  const searchedOrgUserData = computed((): UserDTO[] => {
    const searchVal = searchValue.value?.trim() || '';
    if (searchVal) {
      return orgUserData.value.filter((e: any) =>
        e.fullname?.toLocaleLowerCase().includes(searchVal.toLocaleLowerCase()),
      );
    }
    return orgUserData.value;
  });

  // 人员-选中复选框
  const onUserCheck = (e, data) => {
    const { value, checked } = e.target;
    if (checked) {
      selectedUserOptions.value.push(data);
    } else {
      selectedUserOptions.value = selectedUserOptions.value.filter((f) => f.formatId !== value);
    }
    updateValue(checked, value);
  };
  // 部门-选中复选框
  const onTreeCheck = (v, e) => {
    const { formatId } = e.node;
    updateValue(e.checked, formatId);
  };

  // 部门-点击树节点
  const onTreeSelect = (selectedKeys, e) => {
    searchValue.value = '';
    getUserDataByOrg(e.node.id);
  };

  // 部门-树展开折叠
  const onExpand = (keys) => {
    expandedKeys.value = keys;
  };

  // 查询所有的部门
  const getOrgData = async () => {
    const data = (await getDesignerCommonGetCanBeUsedOrg()) ?? [];
    orgData.value = data.map((e) => {
      return { ...e, formatId: `ORG:${e.id}` };
    });
    expandedKeys.value = orgData.value.map((e) => e.formatId);
  };

  // 查询部门下的人员
  const getUserDataByOrg = async (orgIds) => {
    const res: any = await getDesignerCommonGetCanBeUsedOrgUser({
      orgIds,
      pageNo: 1,
      pageSize: 999999999,
    });
    orgUserData.value = (res.data ?? []).map((e) => {
      return { ...e, formatId: `USER:${e.id}` };
    });
  };

  // 查询非部门分类下的所有人员
  const getUserDataNotOrg = async () => {
    userDataNotOrg.value = ((await getDesignerCommonGetVisibleUser()) ?? []).map((e) => {
      return { ...e, formatId: `USER:${e.id}` };
    });
  };

  // 查询已选择的人员的信息
  const getUserInfo = async (ids) => {
    selectedUserOptions.value = (
      (await getOrgUserPickerTenantManagementUserListByIds({ ids: ids.join(',') })) ?? []
    ).map((e) => {
      return { ...e, formatId: `USER:${e.id}` };
    });
  };

  // 更新props.value
  const updateValue = (isAdd: boolean, ids: any[] | string) => {
    const idList = Array.isArray(ids) ? ids : [ids];
    let list = cloneDeep(props.value);
    isAdd ? list.push(...idList) : (list = list.filter((e) => !idList.includes(e)));
    emit('update:value', list);
  };

  function list2Tree(list) {
    let treeOptions = [];
    const arrClone: any = cloneDeep(list);
    const mapInfo = arrClone.reduce((obj: any, item: any) => {
      item.children = [];
      obj[item.id] = item;
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
</script>
<style lang="less" scoped>
  .select-wrap {
    border-left: 1px solid #e8ebf0;
    border-right: 1px solid #e8ebf0;
    border-bottom: 1px solid #e8ebf0;
  }
  .select-header {
    padding: 10px 16px;
    border-top: 1px solid #e8ebf0;
    border-bottom: 1px solid #e8ebf0;
    background-color: #f2f4f7;
    display: flex;
    .header-title {
      flex: 1;
    }
  }
  .select-main {
    overflow: hidden;

    .select-main-left {
      border-right: 1px solid #e8ebf0;
    }
    .select-main-left-bottom {
      border-top: 1px solid #e8ebf0;
    }
  }
  .select-item {
    padding: 0 16px;
    margin-bottom: 8px;
    display: flex;

    &:last-child {
      margin-bottom: 12px;
    }

    :deep(.ant-checkbox-wrapper) {
      width: 100%;
      overflow: hidden;

      & > span:last-child {
        flex: 1;
        overflow: hidden;
      }
    }
  }
</style>
