<template>
  <div class="workbench-index">
    <template v-if="compList.length">
      <grid-layout
        v-model:layout="compList"
        :col-num="12"
        :row-height="180"
        :margin="[24, 24]"
        :is-draggable="true"
        :is-resizable="true"
        :is-bounded="true"
        :vertical-compact="false"
        :use-css-transforms="true"
      >
        <grid-item
          v-for="item in compList"
          :key="item.id"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :static="true"
        >
          <component :is="components[item.id ?? '']" :compTitle="item.name" />
        </grid-item>
      </grid-layout>
    </template>
    <template v-else>
      <div class="default-layout">
        <UsualUse class="default-layout__usual-use" />
        <BusinessData class="default-layout__business-data" />
        <MyTransaction class="default-layout__my-transaction" />
        <MyAudit class="default-layout__my-audit" />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup name="user-select">
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import UsualUse from './usual-use/usual-use.vue';
  import BusinessData from './business-data/business-data.vue';
  import MyTransaction from './my-transaction/my-transaction.vue';
  import MyAudit from './my-audit/my-audit.vue';

  const components = {
    // 我的常用
    my_common_use: UsualUse,
    // 业务数据
    biz_data: BusinessData,
    // 我的事务
    my_transaction: MyTransaction,
    // 我的审核
    my_audit: MyAudit,
  };

  const compList = ref([]);
  const getDataSource = async () => {
    const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'biz_search',
        modelKey: 'em_my_workbench',
        modelCategory: 'entity',
      },
      {},
    );
    try {
      const layoutData = res.pad_json_ ? JSON.parse(res.pad_json_) : [];
      const list = layoutData?.data
        ?.filter((n) => n.enabled)
        .map((item) => {
          return {
            i: item.id,
            id: item.id,
            userId: item.userId,
            name: item.name,
            ...item.positionJson,
          };
        });
      compList.value = list ?? [];
    } catch (error) {
      console.log('error', error);
    }
  };

  onMounted(async () => {
    await getDataSource();
  });
</script>

<style lang="less" scoped>
  .workbench-index {
    height: 100%;

    .vue-grid-item > div {
      width: 100%;
      height: 100%;
    }
  }

  .default-layout {
    display: grid;
    grid-gap: 32px;
    grid-template-areas:
      'a b'
      'c d';
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: 180px 1fr;
    width: 100%;
    height: 100%;
    padding: 32px 32px 12px 24px;

    &__usual-use {
      grid-area: a;
    }

    &__business-data {
      grid-area: b;
    }

    &__my-transaction {
      grid-area: c;
    }

    &__my-audit {
      grid-area: d;
    }
  }
</style>
