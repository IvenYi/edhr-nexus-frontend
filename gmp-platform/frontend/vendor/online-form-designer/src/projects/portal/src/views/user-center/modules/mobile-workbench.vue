<template>
  <a-tabs :class="[prefixCls]" v-model:activeKey="activeKey">
    <a-tab-pane key="layout" :tab="t('sys.portal.layout')">
      <div class="mobile-workbench-action-wrapper">
        <div class="mobile-workbench-action-area">
          <!-- <div class="title">{{ t('sys.portal.workbenchTitle') }}</div> -->
          <div class="mobile-workbench-action-content" style="height: 100%; min-height: inherit">
            <a-alert :message="t('sys.portal.workbenchTip')" type="warning" show-icon />
            <div class="workbenchCompList">
              <draggable
                v-model="filterCompList"
                handle=".mover"
                :animation="200"
                ghostClass="ghost"
                itemKey="id"
                @end="handleDragEnd"
              >
                <template #item="{ element }">
                  <div class="comp-item">
                    <span>{{ element.workbenchComponentName }}</span>
                    <i class="iconfont icon-drag mover"></i>
                  </div>
                </template>
              </draggable>
            </div>
          </div>
        </div>
      </div>
    </a-tab-pane>
    <a-tab-pane key="comp" :tab="t('sys.portal.comp')" force-render>
      <workbench-comp-table :dataSource="compList" @refresh="onRefresh" :deviceSource="502" />
    </a-tab-pane>
  </a-tabs>
</template>
<script setup lang="ts" name="mobile-workbench">
  import { ref, onMounted, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import draggable from 'vuedraggable';
  import { pick } from 'lodash-es';
  import { StatusEnum } from '../constants/index';
  import WorkbenchCompTable from '../component/workbench-comp-table.vue';
  import {
    getWorkbenchComponentRelationList,
    postWorkbenchComponentRelationDrag,
  } from '/@/apis/gct-platform/WorkbenchComponentRelationController';
  import type { WorkbenchComponentRelationResponse } from '/@/apis/gct-platform/model';

  type IFilterCompItem = Pick<
    WorkbenchComponentRelationResponse,
    'userId' | 'sortNum' | 'workbenchComponentName' | 'workbenchComponentId' | 'id'
  >;

  type IBackupCompItem = Pick<WorkbenchComponentRelationResponse, 'userId' | 'sortNum' | 'id'>;

  const { t } = useI18n();

  const { prefixCls } = useDesign('mobile-workbench-tabs-wrap');

  const activeKey = ref('layout');

  const compList = ref<Array<WorkbenchComponentRelationResponse>>([]);

  const filterCompList = ref<Array<IFilterCompItem>>([]);
  const backupCompList = ref<Array<IBackupCompItem>>([]);

  onMounted(getWorkBenchCompData);

  async function getWorkBenchCompData() {
    const res = await getWorkbenchComponentRelationList(
      { enabled: false },
      {
        transferToConfig: { headers: { source: 502 } },
      },
    );

    compList.value = res ?? [];
  }

  watch(
    () => compList.value,
    () => {
      const list = compList.value.filter((item) => item.enabled === StatusEnum.NORMAL);

      filterCompList.value = list.map((item) => {
        return pick(item, [
          'userId',
          'sortNum',
          'workbenchComponentName',
          'workbenchComponentId',
          'id',
        ]);
      });

      backupCompList.value = list.map((item) => {
        return pick(item, ['userId', 'sortNum', 'id']);
      });
    },
  );

  const handleDragEnd = async ({ oldIndex, newIndex }) => {
    const oldItem = backupCompList.value[oldIndex];
    const newItem = backupCompList.value[newIndex];

    if (oldItem && newItem && oldItem.id !== newItem.id) {
      const params = {
        id: oldItem.id,
        userId: oldItem.userId,
      };

      if (oldIndex < newIndex) {
        Object.assign(params, {
          targetSortNum: newItem.sortNum,
        });
      } else {
        Object.assign(params, {
          targetSortNum: (newItem.sortNum ?? 0) + 1,
        });
      }

      await postWorkbenchComponentRelationDrag(params, {
        transferToConfig: { headers: { source: 502 } },
      });
      message.success(t('sys.portal.dragSuccess'));
      onRefresh();
    }
  };

  const onRefresh = () => {
    getWorkBenchCompData();
  };
</script>

<style lang="less">
  @prefix-cls: ~'@{namespace}-mobile-workbench-tabs-wrap';

  .@{prefix-cls} {
    height: 100%;
    .ant-tabs-nav {
    }
    .ant-tabs-content {
      height: 100%;

      .ant-spin-nested-loading {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex: auto;
        flex-grow: 1;
        // height: 0;
        flex-direction: column;
        .ant-spin-container {
          width: 100%;
          height: 100%;
          overflow: auto;
        }
      }
    }

    .mobile-workbench-action-wrapper {
      height: 100%;
      overflow: auto;
      display: flex;
      justify-content: center;
      .mobile-workbench-action-area {
        margin-top: 16px;
        margin-bottom: 16px;
        height: 755px;
        width: 360px;
        background-image: url(../../../assets/image/mobile-canvas.png);
        display: flex;
        padding: 0 16px;
        padding-top: 45px;
        padding-bottom: 19px;
        flex-direction: column;
        .title {
          color: #333;
          font-weight: 600;
          font-size: 16px;
          text-align: center;
          border-bottom: 1px solid #eaeaea;
          padding-top: 16px;
          padding-bottom: 12px;
        }
        .mobile-workbench-action-content {
          flex: 1;
          border-bottom-right-radius: 36px;
          border-bottom-left-radius: 36px;
          overflow: auto;
          position: relative;
          padding: 16px;

          .workbenchCompList {
            user-select: none;
            padding-top: 8px;
            .comp-item {
              position: relative;
              display: block;
              padding: 10px 12px;
              background-color: #f5f5f5;
              margin-bottom: 4px;
              border-radius: 4px;
              color: #333;

              &.ghost {
                opacity: 0.5;
                background: #f5f5f5;
              }
            }

            .mover {
              font-size: 12px;
              position: absolute;
              right: 12px;
              color: #96a0b5;
              top: 50%;
              cursor: pointer;
              transform: translateY(-50%);
              &:hover {
                color: rgba(0, 0, 0, 0.5);
              }
            }
          }
        }
      }
    }
  }
</style>
