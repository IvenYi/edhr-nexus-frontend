import { ref, toRaw, reactive } from 'vue';
import type { TreeProps } from 'ant-design-vue';
import type { PickerUserDTO, OrgResponse } from '/@/apis/gct-platform/model/index';
import { cloneDeep } from 'lodash-es';

export function useModalPicker({ getUserOptions, getUserByIds, getDeptOptions }): any {
  const orgsOptions = ref<OrgResponse[]>([]);
  const treeData = ref<TreeProps['treeData']>([]);
  const userData = ref<PickerUserDTO[]>([]);
  const selectedKeys = ref<(string | number)[]>([]);
  const checkedUsers = ref<string[]>([]);
  const UsersMap = reactive({});
  const checkedDepts = ref({ checked: [] });
  const orgId = ref('');
  async function ready({ userIds = [], deptIds = [] } = {}, userFlag = true) {
    await initDeptTree();
    checkedDepts.value.checked = cloneDeep(deptIds || []);
    userFlag && addUserByids(cloneDeep(userIds || []));
  }
  async function initDeptTree() {
    const orgs = await getDeptOptions();
    orgs?.forEach((i) => {
      const isRoot = !orgs.find((o) => o.id === i.parentId);
      isRoot && (i.parentId = 'ROOT');
    });
    orgsOptions.value = orgs!;
    treeData.value = transformTreeData(orgs);
  }

  async function getUserTree(keyword?: string) {
    const { data = [] } =
      (await getUserOptions({
        orgId: orgId.value,
        pageNo: 1,
        pageSize: 9999,
        keyword,
      })) || {};
    userData.value = data;
  }
  async function selectTreeNode(key) {
    orgId.value = key;
    selectedKeys.value = [key];
    await getUserTree();
  }
  function checkedBox(e: any, value: PickerUserDTO, multiple) {
    if (e.target.checked) {
      multiple ? checkedUsers.value.push(value.id!) : (checkedUsers.value = [value.id!]);
      UsersMap[value.id!] = toRaw(value);
    } else {
      const index = checkedUsers.value.findIndex((i) => i === value.id);
      checkedUsers.value.splice(index, 1);
      UsersMap[value.id!] = undefined;
    }
  }
  async function addUserByids(userIds) {
    checkedUsers.value = userIds;
    const key = treeData.value![0]?.key;
    key && (await selectTreeNode(key));
    userIds.forEach(async (id) => {
      const user = userData.value.find((i) => i.id === id);
      if (user) {
        UsersMap[id] = user;
      } else {
        const data = (await getUserByIds({ ids: id })) || [];
        UsersMap[id] = data[0];
      }
    });
  }
  return {
    treeData,
    selectedKeys,
    userData,
    selectTreeNode,
    getUserTree,
    checkedBox,
    checkedDepts,
    checkedUsers,
    UsersMap,
    orgsOptions,
    ready,
  };
}

/**
 * 将后端扁平化数据解析成树结构的方法
 * @param list 树LIST
 * @param parentId 父ID
 * @returns 包含children的树结构
 */
function transformTreeData(list, parentId = 'ROOT') {
  const tree: any[] = [];
  for (let i = 0; i < list.length; i++) {
    const node = list[i];

    if (node.parentId === parentId) {
      const item = transformTreeData(list, node.id);
      if (item.length > 0) {
        node.children = item;
      } else {
        node.children = [];
      }
      node.key = node.id;
      node.title = node.name;
      tree.push(node);
    }
  }
  return tree;
}
