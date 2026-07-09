<template>
  <basic-page-render :class="[ns.b()]">
    <div class="p-16px flex flex-col h-full ks-column">
      <UserGrantedHeader :statistics="statistics" :type="userType" />
      <div class="ks-col overflow-hidden">
        <a-tabs
          v-if="tabList.length > 1"
          v-model:activeKey="activeKey"
          :key="JSON.stringify(tabList)"
        >
          <a-tab-pane
            v-for="(tab, i) in tabList"
            :key="tab.key"
            :tab="`${tab.name} ${totalMap[tab.key]}`"
          >
            <UserGrantedContent
              :ref="'UserGrantedContent' + i"
              :key="tab.key"
              :columns="tab.columns"
              :type="activeKey === 'share' ? 2 : 1"
            />
          </a-tab-pane>
        </a-tabs>
        <UserGrantedContent
          v-else-if="tabList.length"
          :type="1"
          :data="tabList[0].data"
          :columns="tabList[0].columns"
          ref="UserGrantedContent0"
        />
      </div>
    </div>
  </basic-page-render>
</template>

<script setup lang="ts">
  import { useNamespace } from '@gct/runtime';
  import { UseUserGranted } from './logic/use-user-granted';
  import UserGrantedHeader from './components/user-granted-header.vue';
  import { computed, onMounted, ref } from 'vue';
  import { getLicenseShareTag, getLicenseSourceTag } from '/@/apis/gct-platform/LicenseController';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { cloneDeep } from 'lodash-es';
  import { UserGrantedTableColumns } from './logic/constants';
  import UserGrantedContent from './components/user-granted-content.vue';
  import { getAppGrantedUserPageList } from '/@/apis/gct-apaas/AppGrantedUserController';

  const ns = useNamespace('user-granted-index');

  const { statistics, pagination, load, totalMap, getTotal, resetAll } = UseUserGranted();

  const usePathQuery = usePathQueryStore();
  const UserGrantedContent0 = ref();
  const isShared = ref(false);
  const userType = ref(0);

  const tabs = [
    {
      key: 'authore',
      id: 'authore',
      name: $t('sys.kit.edhr.usedSeat'),
      num: 0,
      data: [],
      columns: [...UserGrantedTableColumns],
      pagination: cloneDeep(pagination.value),
    },
    {
      key: 'share',
      id: 'share',
      name: $t('sys.kit.edhr.sharedSeat'),
      num: 0,
      data: [],
      columns: [
        ...UserGrantedTableColumns,
        {
          title: $t('sys.tenant.index'),
          field: 'tenantName',
        },
      ],
      pagination: cloneDeep(pagination.value),
    },
  ];

  const tabList = computed(() => {
    const tab1 = cloneDeep(tabs[0]);
    const tab2 = cloneDeep(tabs[1]);
    tab1.num = totalMap.value[tab1.key];
    tab2.num = totalMap.value[tab2.key];
    if (userType.value === 2) {
      return [tab1, tab2];
    } else if (userType.value === 1) {
      return [tab2, tab1];
    }
    return [tab1];
  });
  const activeKey = ref(tabList.value[0].key);

  const getShareConfig = async () => {
    const [source, share] = await Promise.all([
      getLicenseSourceTag({ appId: usePathQuery.getAid() }),
      getLicenseShareTag({ appId: usePathQuery.getAid() }),
    ]);
    isShared.value = !!share;
    getTotal('authore');
    if (!source && !share) {
      userType.value = 0;
    } else if (source) {
      // 共享者
      userType.value = 2;
      getTotal('share');
    } else if (share) {
      // 被分享者
      userType.value = 1;
      getTotal('share');
    }
  };

  onMounted(async () => {
    resetAll();
    await getShareConfig();
    load();
  });
</script>
<style lang="less" scoped>
  :deep(.ant-tabs) {
    height: 100%;

    .ant-tabs-content {
      height: 100%;
    }
  }
</style>
