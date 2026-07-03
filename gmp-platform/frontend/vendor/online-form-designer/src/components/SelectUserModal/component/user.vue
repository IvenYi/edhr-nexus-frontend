<template>
  <div class="waiting-area__user select-user-modal__waiting-area">
    <SearchInput v-model:search-value="userSearchValue" />
    <div class="waiting-area-user-search" v-if="userSearchValue">
      <a-spin :spinning="searchLoading" />
      <Scrollbar class="px-12px py-8px">
        <a-checkbox-group v-model:value="selectUserIds" :disabled="readonly" class="w100%">
          <div
            v-for="(el, i) in searchOrgUserData"
            :key="i"
            class="waiting-area-content-item pl6px pr6px"
          >
            <a-checkbox :value="el.formatId" @change="(e) => onUserCheck(e, el)">
              <div class="ks-col pl-8px">
                <div
                  v-if="el.highlightName"
                  class="content-item-title gct-text-overflow ks-col"
                  :title="el.fullname"
                  :innerHTML="el.highlightName"
                ></div>
                <div
                  v-else
                  :title="el.fullname"
                  class="content-item-title gct-text-overflow ks-col"
                >
                  {{ el.fullname }}
                </div>
                <div :title="el.orgNames" class="content-item-desc gct-text-overflow ks-col">
                  {{ el.orgNames }}
                </div>
              </div>
            </a-checkbox>
          </div>
        </a-checkbox-group>
      </Scrollbar>
    </div>
    <div class="waiting-area_user-container" v-else>
      <div class="waiting-area-content left-column">
        <Scrollbar class="px-12px py-8px">
          <a-tree
            v-if="treeData.length"
            class="waiting-area-custom-tree user-tree"
            :tree-data="treeData"
            auto-expand-parent
            default-expand-all
            block-node
            :fieldNames="{
              title: 'name',
              key: 'formatId',
            }"
            :selectedKeys="selectedKeys"
            @select="onSelect"
          >
            <template #title="{ data }">
              <div class="tree-node">
                <span class="tree-node__title">{{ data.name }}</span>
              </div>
            </template>
          </a-tree>
        </Scrollbar>
      </div>
      <div class="waiting-area-content right-column">
        <Scrollbar class="px-12px py-8px">
          <a-checkbox-group v-model:value="selectUserIds" :disabled="readonly" class="w100%">
            <div v-for="(el, i) in orgUserData" :key="i" class="waiting-area-content-item">
              <a-checkbox :value="el.formatId" @change="(e) => onUserCheck(e, el)">
                <div :title="el.fullname" class="w120px content-item-title ks-col ml4px ks-row ">
                    <div class="ell">{{ el.fullname }}</div>
                    <div class="text-[#888] ks-col text-right ell pr2px">
                      {{ el.username }}
                    </div>
                </div>
              </a-checkbox>
            </div>
          </a-checkbox-group>
        </Scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="waiting-area-user">
  import { ref, watch, computed, onMounted } from 'vue';
  import { pick } from 'lodash-es';
  import { Scrollbar } from '/@/components/Scrollbar';
  import SearchInput from './search-input.vue';
  import { highlightName } from '../utils/index';
  import { getController } from '../controller';
  import { UserDTO } from '../type';

  const controller = getController();

  const props = withDefaults(
    defineProps<{
      treeData: any;
      rootIds: string[];
      selectUsers?: any[];
      multiple: boolean;
      /** 需要额外隐藏的id集合 */
      hiddenKeys?: string[];
      readonly?: boolean;
    }>(),
    {
      hiddenKeys: () => [],
    },
  );

  const emit = defineEmits(['update:selectUsers']);

  const userSearchValue = ref();

  const selectedKeys = ref<string[]>([]);
  const orgUserData = ref<UserDTO[]>([]);
  const searchOrgUserData = ref<
    Array<{
      id: string;
      formatId: string;
      fullname: string;
      orgNames: string;
      highlightName?: any;
    }>
  >([]);
  const searchLoading = ref(false);

  const selectUserIds = computed(() => {
    return props.selectUsers?.map((item) => item.formatId);
  });

  watch(
    [() => userSearchValue.value, () => props.rootIds],
    () => {
      if (userSearchValue.value) {
        searchLoading.value = true;

        controller.getUserDataByKeyword({ keyword: userSearchValue.value }).then((res) => {
          searchOrgUserData.value = res
            .map((item) => {
              return {
                ...item,
                orgNames: item.masterOrgName!,
                highlightName: highlightName(item.fullname, userSearchValue.value),
              };
            })
            .filter((i) => !props.hiddenKeys.includes(i.formatId)) as any;

          searchLoading.value = false;
        });
      } else {
        searchOrgUserData.value = [];
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  watch(
    () => props.rootIds,
    () => {
      if (props.rootIds && props.rootIds.length !== 0) {
        const orgId = props.rootIds?.[0];
        if (orgId) {
          onSelect('', {
            node: {
              id: orgId,
              dataRef: { formatId: `ORG:${orgId}` },
            },
          });
        }
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  function onSelect(_, e: { node }) {
    const { dataRef } = e.node || {};
    if (selectedKeys.value.includes(dataRef.formatId)) {
      return;
    }
    selectedKeys.value = [dataRef.formatId];

    getUserDataByOrg(e.node.id);
  }

  /** 查询部门下的人员 */
  async function getUserDataByOrg(orgIds) {
    const resultUsers = await controller.getUserDataByOrg({ orgId: orgIds });
    orgUserData.value = resultUsers.filter((i) => !props.hiddenKeys.includes(i.formatId));
  }

  function onUserCheck(event, data) {
    if (props.multiple) {
      const { value, checked } = event.target;
      let selectList = props.selectUsers ?? [];
      if (checked) {
        selectList?.push(pick(data, ['formatId', 'id', 'fullname']));
      } else {
        selectList = selectList.filter((f) => f.formatId !== value);
      }
      emit('update:selectUsers', selectList);
    } else {
      const { value, checked } = event.target;
      let selectList: any = [];

      if (checked) {
        selectList = [pick(data, ['formatId', 'id', 'fullname'])];
      }

      emit('update:selectUsers', selectList);
    }
  }
</script>

<style lang="less">
  @import url('../styles/common.less');
</style>

<style scoped lang="less">
  .waiting-area-user-search,
  .waiting-area_user-container {
    position: relative;
    flex: 1;
    overflow: hidden;
  }

  .waiting-area-user-search {
    .waiting-area-content-item {
      margin-bottom: 12px;

      :deep(.ant-checkbox-wrapper) {
        .content-item-desc {
          margin-top: 2px;
          color: #8f8f8f;
          font-size: 12px;
          line-height: 18px;
        }
      }
    }
  }

  .waiting-area_user-container {
    display: flex;

    .left-column {
      width: 60%;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 1px;
        height: 100%;
        background-color: #e8ebf0;
      }

      :deep(.waiting-area-custom-tree.user-tree) {
        .ant-tree-treenode-selected {
          background: #e6eefe !important;
        }
      }
    }

    .right-column {
      width: 40%;

      .waiting-area-content-item {
        margin-bottom: 4px;
      }

      :deep(.ant-checkbox-wrapper-checked) {
        background: #e6eefe !important;
      }

      :deep(.ant-checkbox-wrapper) {
        padding: 0 6px;
      }
    }
  }
</style>
