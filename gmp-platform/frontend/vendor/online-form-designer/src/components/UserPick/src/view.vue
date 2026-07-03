<template>
  <basic-modal
    @register="register"
    :height="500"
    :title="title"
    centered
    width="740px"
    :maskClosable="false"
    @ok="handleOk"
    :okButtonProps="{
      disabled: !checkedUsers.length && !checkedDepts.checked.length,
    }"
    @cancel="onCancel"
  >
    <div class="ks-row main">
      <div
        class="shrink-0 dept baseborder border-0 border-r ks-row flex-col"
        :class="pickerType !== PickerEnums.DEPT ? 'w-14/36' : 'w-1/2'"
      >
        <div class="h50% ks-col ks-row flex-col">
          <div
            class="h40px text-center leading-10 font-bold baseborder border-0 border-b border-r"
            >{{ t('sys.org.orgTree') }}</div
          >
          <div class="ks-col overflow-x-auto pt10px">
            <ScrollContainer>
              <Tree
                v-if="treeData?.length"
                checkStrictly
                v-model:checkedKeys="checkedDepts"
                :selectedKeys="selectedKeys"
                @select="selectNode"
                :checkable="pickerType !== PickerEnums.USER"
                block-node
                :tree-data="treeData"
                defaultExpandAll
                :virtual="false"
                @check="checkDept"
              >
                <template #title="{ title }">
                  <span class="iconfont icon-wenjianjia depticon"></span>
                  {{ title }}
                </template>
              </Tree>
            </ScrollContainer>
          </div>
        </div>
        <div class="h50% ks-col ks-row flex-col" v-if="!!visibleUser?.length">
          <div
            class="baseborder border-t border-0 border-b border-l h40px text-center leading-10"
            >{{ t('sys.org.visiblePersonnel') }}</div
          >
          <ScrollContainer>
            <div class="overflow-x-auto ks-col p10px">
              <div v-for="i in visibleUser" :key="i.id">
                <Checkbox
                  :checked="checkedUsers.indexOf(i.id) > -1"
                  @change="(e) => checkedBox(e, i, pickerMultiple)"
                  >{{ i.fullname }}</Checkbox
                >
              </div>
            </div>
          </ScrollContainer>
        </div>
      </div>
      <div class="shrink-0 ks-row w-11/36 flex-col" v-if="pickerType !== PickerEnums.DEPT">
        <div class="baseborder border-0 border-b h40px text-center leading-10">{{
          t('sys.org.candidates')
        }}</div>
        <div class="p5px">
          <Input
            v-model:value="userName"
            :placeholder="t('sys.org.pleaseEnterSearchContent')"
            @change="change"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </Input>
        </div>
        <div class="overflow-x-auto ks-col ml5px mr5px">
          <ScrollContainer>
            <Empty
              v-show="!userData.length"
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
              :description="t('sys.org.noPersonnelInformationCurrentlyAvailable')"
            />

            <div v-for="i in userData" :key="i.id">
              <Checkbox
                :checked="checkedUsers.indexOf(i.id) > -1"
                @change="(e) => checkedBox(e, i, pickerMultiple)"
                >{{ i.__LABEL__ || i.fullname }}</Checkbox
              ></div
            >
          </ScrollContainer>
        </div>
      </div>
      <div
        class="shrink-0 baseborder border-0 border-l ks-row flex-col"
        :class="pickerType !== PickerEnums.DEPT ? 'w-11/36' : 'w-1/2'"
      >
        <div class="h50% ks-col ks-row flex-col" v-if="pickerType !== PickerEnums.USER">
          <div class="baseborder border-0 border-b border-l h40px text-center leading-10">
            {{ t('sys.org.selectedDepartment') }}
          </div>
          <div class="overflow-x-auto ks-col pt5px">
            <ScrollContainer>
              <Empty
                v-show="!checkedDepts.checked.length"
                :image="Empty.PRESENTED_IMAGE_SIMPLE"
                :description="t('sys.ipaas.noData')"
              />

              <deptItem
                :deptOptions="orgsOptions"
                :deptId="u"
                v-for="(u, index) in checkedDepts.checked"
                class="rows"
                :key="u"
                @deleteDept="checkedDepts.checked.splice(index, 1)"
              />
            </ScrollContainer>
          </div>
        </div>
        <div class="h50% ks-col ks-row flex-col" v-if="pickerType !== PickerEnums.DEPT">
          <div
            class="baseborder border-t border-0 border-b border-l h40px text-center leading-10"
            >{{ t('sys.org.selectedPersonnel') }}</div
          >
          <div class="overflow-x-auto ks-col pt5px">
            <ScrollContainer>
              <Empty
                v-show="!checkedUsers.length"
                :image="Empty.PRESENTED_IMAGE_SIMPLE"
                :description="t('sys.ipaas.noData')"
              />

              <userItem
                v-for="(u, index) in checkedUsers"
                :key="u"
                class="rows"
                :userId="u"
                :usersMap="UsersMap"
                @deleteUser="checkedUsers.splice(index, 1)"
              />
            </ScrollContainer>
          </div>
        </div>
      </div>
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref, toRaw, reactive } from 'vue';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModalPicker } from './hooks';
  import { Empty, Tree, Checkbox, Input } from 'ant-design-vue';
  import userItem from './components/user-item.vue';
  import deptItem from './components/dept-item.vue';
  import { getDesignerCommonGetVisibleUser } from '/@/apis/gct-apaas/DesignerCommonController';
  import { PickType } from '../index';
  import { ScrollContainer } from '/@/components/Container';

  type VisbleUserType = ReturnPromiseType<typeof getDesignerCommonGetVisibleUser>;
  const props = defineProps<{
    getUserOptions: Function;
    getUserByIds: Function;
    destroyVm: Function;
    getDeptOptions: Function;
    type: PickType;
  }>();
  const pickerMultiple = ref(true);
  const visibleUser = ref<VisbleUserType>([]);
  const { getUserOptions, getUserByIds, destroyVm, getDeptOptions } = reactive(props);
  const { t } = useI18n();
  enum PickerEnums {
    USER = 'picker_user',
    DEPT = 'picker_dept',
    ALL = 'pickker_all',
  }

  if (props.type === PickType.ViSIBLE) {
    /**
     * 用户组加载可选人员
     */
    getDesignerCommonGetVisibleUser().then((res) => {
      visibleUser.value = res;
    });
  }
  let callbackFun: Function;
  const {
    treeData,
    selectedKeys,
    selectTreeNode,
    userData,
    getUserTree,
    checkedBox,
    checkedUsers,
    checkedDepts,
    UsersMap,
    orgsOptions,
    ready,
  } = useModalPicker({ getUserOptions, getUserByIds, getDeptOptions });

  const [register, { openModal, closeModal }] = useModal();
  const userName = ref('');
  const title = ref('');
  const pickerType = ref<PickerEnums>(PickerEnums.ALL);
  function handleOk() {
    closeModal();
    if (pickerType.value === PickerEnums.ALL) {
      let userMaps = checkedUsers.value.map((i) => toRaw(UsersMap[i]));
      let DeptMaps = checkedDepts.value.checked.map((i) => {
        let item = orgsOptions.value.find((org) => org.id === i);
        return toRaw(item);
      });
      callbackFun(
        { userIds: toRaw(checkedUsers.value), deptIds: toRaw(checkedDepts.value.checked) },
        { userMaps, DeptMaps },
      );
    }
    if (pickerType.value === PickerEnums.USER) {
      let usermaps = checkedUsers.value.map((i) => toRaw(UsersMap[i]));
      callbackFun(toRaw(checkedUsers.value), toRaw(usermaps));
    }
    if (pickerType.value === PickerEnums.DEPT) {
      let DeptMaps = checkedDepts.value.checked.map((i) => {
        let item = orgsOptions.value.find((org) => org.id === i);
        return toRaw(item);
      });
      callbackFun(toRaw(checkedDepts.value.checked), DeptMaps);
    }
    destroyVm();
  }
  function openPickerByDept({ deptIds, multiple, callback }) {
    ready({ deptIds }, false);
    callbackFun = callback;
    pickerType.value = PickerEnums.DEPT;
    title.value = t('sys.org.' + pickerType.value);
    pickerMultiple.value = multiple;
    openModal();
  }
  function openPickerByUser({ userIds, multiple, callback }: any) {
    ready({ userIds });
    callbackFun = callback;
    pickerType.value = PickerEnums.USER;
    title.value = t('sys.org.' + pickerType.value);
    pickerMultiple.value = multiple;
    openModal();
  }
  function openPicker({ userIds, deptIds, callback }) {
    ready({ userIds, deptIds });
    callbackFun = callback;
    pickerType.value = PickerEnums.ALL;
    title.value = t('sys.org.' + pickerType.value);
    pickerMultiple.value = true;
    openModal();
  }
  function selectNode(keys) {
    let key = keys[0];
    key && selectTreeNode(key);
  }
  function change() {
    getUserTree(userName.value);
  }

  function onCancel() {
    destroyVm();
  }
  /**
   * 部门单选控制
   */
  function checkDept({ checked }) {
    if (!pickerMultiple.value && checked.length > 1) {
      checked.shift();
    }
  }
  defineExpose({ openPickerByUser, openPicker, openPickerByDept });
</script>
<style scoped lang="less">
  .dept {
    background-color: #fafafa;
  }

  .main {
    height: 100%;
    border: 1px solid #eaeaea;
  }

  .baseborder {
    border-style: solid;
    border-color: #eaeaea;
  }

  :deep(.ant-tree) {
    background-color: transparent;

    .ant-tree-treenode {
      padding: 4px;
    }
  }

  :deep(.ant-tree-treenode-selected) {
    background: rgb(13 170 156 / 10%);
    color: var(--ant-primary-color);
  }

  :deep(.ant-tree-node-content-wrapper.ant-tree-node-selected) {
    background: transparent;
    color: var(--ant-primary-color);
  }

  :deep(.ant-tree-node-content-wrapper) {
    &:hover {
      background-color: transparent;
      color: var(--ant-primary-color);
    }
  }

  .rows {
    padding: 2px 4px;

    &:hover {
      background: rgb(13 170 156 / 10%);
      color: var(--ant-primary-color);
    }
  }

  .depticon {
    color: #fcc12b;
  }
</style>
