<template>
  <div :class="ns.b()">
    <div :class="ns.e('header')">
      <EditOutlined class="mr-16px" @click="handleEdit" />
      <SyncOutlined @click="getDataSource" />
    </div>
    <div :class="ns.e('content')">
      <a-layout-content class="paas-content" :key="compListKey">
        <grid-layout
          v-model:layout="compList"
          :col-num="12"
          :row-height="32"
          :margin="[16, 16]"
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
            <component :is="components[item.id ?? '']" :compTitle="$t(item.name)" />
          </grid-item>
        </grid-layout>
      </a-layout-content>
    </div>
    <div v-if="visible" class="fixed top-0 left-0 right-0 bottom-0 z-1000 w-full h-full bg-white">
      <DesignView :dataSource="dataSource" @close="handleClose" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useNamespace, EntityModelCategoryEnum } from '@gct/runtime';
  import { EditOutlined, SyncOutlined } from '@ant-design/icons-vue';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import {
    MyCommonUse,
    BusinessData,
    MyTransaction,
    MyAudit,
  } from './components/portal-container-box';
  import DesignView from './components/edit/view.vue';
  import { cloneDeep } from 'lodash-es';

  const ns = useNamespace('workbench');

  const compList = ref([]);

  const compListKey = ref(0);

  const dataSource = ref();

  const components = {
    // 我的常用
    my_common_use: MyCommonUse,
    // 业务数据
    biz_data: BusinessData,
    // 我的事务
    my_transaction: MyTransaction,
    // 我的审核
    my_audit: MyAudit,
  };

  const visible = ref(false);

  const handleEdit = async () => {
    visible.value = true;
  };

  const getDataSource = async () => {
    const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'biz_search',
        modelKey: 'em_my_workbench',
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      {},
    );
    if (res?.pc_json_) {
      dataSource.value = cloneDeep(res);

      const list = JSON.parse(res.pc_json_)
        ?.data.filter((n) => n.enabled)
        .map((item) => {
          return {
            i: item.id,
            id: item.id,
            userId: item.userId,
            name: item.name,
            positionJson: item.positionJson,
            minH: (item.workbenchComponentId && components?.[item.workbenchComponentId]?.minH) ?? 2,
            minW: (item.workbenchComponentId && components?.[item.workbenchComponentId]?.minW) ?? 2,
          };
        });

      const hasPosList = list.map((item) => {
        return {
          ...item,
          ...(typeof item.positionJson === 'string'
            ? JSON.parse(item.positionJson)
            : item.positionJson),
        };
      });

      compList.value = hasPosList;

      compListKey.value += 1;
    }
  };

  const handleClose = async () => {
    await getDataSource();
    visible.value = false;
  };

  onMounted(async () => {
    await getDataSource();
  });
</script>

<style scoped lang="scss">
  @include b(workbench) {
    @include e(header) {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      height: 34px;
      margin: 0 16px;
      padding: 4px 16px;
      border-radius: 0 0 4px 4px;
      background: #fff;

      .anticon {
        cursor: pointer;
      }
    }

    @include e(content) {
      height: calc(100% - 50px);
      overflow: auto;

      .paas-content {
        position: relative;
        flex: 1 1 auto;
        overflow: auto;
      }
    }

    height: 100%;
    padding: 0 0 16px;
  }
</style>
