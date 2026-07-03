<template>
  <div class="card-container">
    <a-row>
      <a-col
        :xs="12"
        :sm="12"
        :md="8"
        :lg="8"
        :xl="8"
        :xxl="6"
        v-for="item in tableData"
        :key="item.id"
      >
        <div
          class="card-box"
          @click.stop="handleCategoryActionClick(item, CategoryActionEnum.Edit)"
        >
          <div
            v-if="props.isEdit"
            class="publish"
            :style="{
              '--status-color': item.publish ? '#52c41a' : '#a6a6a6',
              '--bg-color': item.publish ? '#D5F0DB' : '#E0E3EB',
            }"
          >
            {{ item.publish ? t('sys.bpmn.versionStatus.PUBLISHED') : t('sys.report.disPublish') }}
          </div>
          <div class="card-img">
            <img v-if="item.screenShoot" :src="item.screenShoot" class="report-img" />
            <img v-else src="~@/assets/images/no-table.svg" alt="no-table" class="report-img" />
          </div>

          <div class="flex px-12px mt-12px pb-13px">
            <div class="flex-1 ell font-500 report-name">
              {{ item.name }}
            </div>
            <a-dropdown v-if="props.isEdit" @click.stop>
              <div class="category-item__more cursor-pointer">
                <ellipsis-outlined />
              </div>
              <template #overlay>
                <a-menu>
                  <template v-if="item.sysBuiltin !== 1">
                    <a-menu-item
                      v-if="userActions.Update"
                      :key="CategoryActionEnum.Edit"
                      @click="handleCategoryActionClick(item, CategoryActionEnum.Edit)"
                    >
                      {{ t('sys.edit') }}
                    </a-menu-item>
                    <a-menu-item
                      v-if="userActions.Move"
                      :key="CategoryActionEnum.Move"
                      @click="handleCategoryActionClick(item, CategoryActionEnum.Move)"
                    >
                      {{ t('sys.component.userCmp.move') }}
                    </a-menu-item>
                    <a-menu-item
                      v-if="userActions.Publish && !item.publish"
                      :key="CategoryActionEnum.Publish"
                      @click="handleCategoryActionClick(item, CategoryActionEnum.Publish)"
                    >
                      {{ t('sys.publish') }}
                    </a-menu-item>
                    <a-menu-item
                      v-if="userActions.Publish && item.publish"
                      :key="CategoryActionEnum.UnPublish"
                      @click="handleCategoryActionClick(item, CategoryActionEnum.UnPublish)"
                    >
                      {{ t('sys.report.unPublish') }}
                    </a-menu-item>
                    <a-menu-item
                      v-if="userActions.Delete && !item.publish"
                      :key="CategoryActionEnum.Delete"
                      @click="handleCategoryActionClick(item, CategoryActionEnum.Delete)"
                    >
                      {{ t('sys.delete') }}
                    </a-menu-item>
                  </template>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
  <div style="text-align: right" class="mt-8px">
    <a-pagination
      size="small"
      :current="pagination.current"
      :pageSize="pagination.pageSize"
      :total="pagination.total"
      show-size-changer
      show-quick-jumper
      @change="changePagination"
      :show-total="(total) => t('sys.dataSet.totalData', { count: total })"
    />
  </div>

  <move-report @register="register" @ok="reload" />
  <publish-report @register="registerPublish" @ok="reload" />
  <DetailReport ref="detailRef" :compId="detail" />
</template>

<script setup lang="ts" name="view-card">
  import { ref, reactive, onMounted, computed, unref, h } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { message, Modal } from 'ant-design-vue';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
  import { putReportUndeployById, deleteReport } from '/@/apis/gct-apaas/ReportController';
  import MoveReport from '../modals/move-report.vue';
  import PublishReport from '../modals/publish-roport.vue';
  import { useModal } from '/@/components/Modal';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { openReportDesign } from '@gct/runtime-web';
  import DetailReport from '../modals/detail-report.vue';

  enum CategoryActionEnum {
    Publish,
    UnPublish,
    Delete,
    Edit,
    Move,
  }
  const props = defineProps<{
    tableData?: any;
    isEdit: boolean;
    pagination: any;
  }>();

  const emit = defineEmits(['reload']);
  const { t } = useI18n();
  const detailRef = ref();
  const detail = ref();
  const [register, { openModal }] = useModal();
  const [registerPublish, { openModal: openModalPublish }] = useModal();

  onMounted(() => {});

  const userActions = computed(() => {
    const page = 'ReportDesign';
    return {
      Update: !!getPermissionByKey(page, 'Update'),
      Publish: !!getPermissionByKey(page, 'Publish'),
      Delete: !!getPermissionByKey(page, 'Delete'),
      Move: !!getPermissionByKey(page, 'Move'),
    };
  });

  const reload = () => {
    emit('reload', {});
  };

  const changePagination = (page, pageSize) => {
    emit('reload', {
      current: page,
      pageSize: pageSize,
    });
  };

  const handleCategoryActionClick = async (item, key: CategoryActionEnum) => {
    switch (key) {
      case CategoryActionEnum.Edit:
        if (props.isEdit) {
          /** 编辑行数据 */
          const res = await openReportDesign(item.id);
          if (res && res.ok) {
            reload();
          }
        } else {
          detail.value = item;
          detailRef.value.open = true;
        }

        break;
      case CategoryActionEnum.Delete:
        Modal.confirm({
          content: t('sys.sureToDo'),
          okText: t('sys.okText'),
          width: 236,
          onOk() {
            deleteReport({ ids: item.id }).then(() => {
              message.success(t('sys.deleteSuccess'));
              reload();
            });
          },
        });

        break;
      case CategoryActionEnum.Move:
        openModal(true, {
          ...item,
        });
        break;
      case CategoryActionEnum.Publish:
        openModalPublish(true, {
          ...item,
        });
        break;
      case CategoryActionEnum.UnPublish:
        Modal.confirm({
          icon: h(ExclamationCircleOutlined),
          title: t('sys.report.unPublishTitle'),
          content: t('sys.report.unPublishContent', { sth: item.name }),
          okText: t('sys.okText'),
          onOk() {
            putReportUndeployById({ id: item.id }).then(() => {
              reload();
              message.success(t('sys.report.unPublish') + t('sys.success'));
            });
          },
        });
        break;
      default:
        break;
    }
  };
</script>

<style lang="scss" scoped>
  .card-container {
    height: calc(100% - 80px);
    overflow: auto;
    margin: 0 0 0 -8px;
  }
  .card-box {
    position: relative;
    border-radius: 4px 4px 4px 4px;
    border: 1px solid #eaedf1;
    // padding: 13px 0;
    background: #fcfcfd;
  }
  .card-img {
    border-radius: 2px 2px 2px 2px;
    border-bottom: 1px solid #f3f3f3;
    padding: 13px 0;
    overflow: hidden;
    aspect-ratio: 16 / 9;
    background: #fff;
    .report-img {
      width: 100%;
      height: 100%;
    }
  }
  :deep(.ant-col) {
    padding: 8px;
  }
  .publish {
    position: absolute;
    font-size: 10px;
    right: 0;
    top: 0;
    color: var(--status-color);
    border-radius: 0px 2px 0px 2px;
    background: var(--bg-color);
    padding: 3px 6px;
  }
  .report-name {
    &:hover {
      cursor: pointer;
      color: var(--ant-primary-color);
    }
  }
</style>
