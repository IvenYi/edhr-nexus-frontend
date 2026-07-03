<template>
  <a-table
    :dataSource="dataList"
    :columns="columns"
    class="gct-edhr-table h-full"
    ref="tableContainerRef"
    size="middle"
    :pagination="false"
    :scroll="{
      y: scrollHeight,
    }"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'actions'">
        <table-action-auto
          :actions="
            dropButton.map((item) => {
              return {
                label: item.name,
                onClick: () => {
                  handleBtnClick(item.key, record);
                },
              };
            })
          "
          :stopButtonPropagation="true"
        />
      </template>
    </template>
    <move :module="module" @register="register" @ok="handleOk" />
  </a-table>
</template>
<script setup lang="ts">
  import { ref, unref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useAntTableScrollHeight } from '@gct/runtime';
  import { deletePnProject } from '/@/apis/gct-platform/PnProjectController';
  import type { PnProjectResponse } from '/@/apis/gct-platform/model/index';
  import { Modal, message } from 'ant-design-vue';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import { useTimezoneStoreWithOut } from '/@/store/modules/timezone';
  import { getToken } from '/@/utils/auth';
  import { TableActionAuto } from '/@/components/Table';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { useModal } from '/@/components/Modal';
  import move from './move.vue';
  import { useLocale } from '/@/locales/useLocale';

  const { getLocale } = useLocale();

  interface Props {
    module: string;
    dataList: Array<PnProjectResponse>;
  }

  const emits = defineEmits(['copy', 'refresh', 'share']);

  const { t } = useI18n();

  defineProps<Props>();

  const [register, { openModal }] = useModal();

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef, { pagination: false });

  const columns = [
    {
      title: t('sys.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('sys.creator'),
      dataIndex: 'createUserName',
      key: 'createUserName',
    },
    {
      title: t('sys.createTime'),
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: t('sys.modifier'),
      dataIndex: 'modifyUserName',
      key: 'modifyUserName',
    },
    {
      title: t('sys.modifyTime'),
      dataIndex: 'modifyTime',
      key: 'modifyTime',
    },

    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
    },
  ];

  const dropButton = [
    {
      key: 'design',
      name: t('sys.design'),
    },
    {
      key: 'preview',
      name: t('sys.preview'),
    },
    {
      key: 'share',
      name: t('sys.share'),
    },
    {
      key: 'copy',
      name: t('sys.copy'),
    },
    {
      key: 'move',
      name: t('sys.component.userCmp.move'),
    },
    {
      key: 'delete',
      name: t('sys.delete'),
    },
  ];

  const handleBtnClick = async (key, item) => {
    switch (key) {
      case 'copy':
        emits('copy', item);
        break;
      case 'preview':
        const userStore = useUserStoreWithOut();
        const timezoneStore = useTimezoneStoreWithOut();
        const usePathQuery = usePathQueryStore();

        const tenantId = userStore.getTenant;
        const source = 501;
        const token = getToken();
        const timezone = timezoneStore.getTimezone;
        const appTag = '__platform__';
        const appId = usePathQuery.getAid();
        const i18nLocale = unref(getLocale);

        const questHeader = {
          tenantId,
          source,
          token,
          timezone,
          appTag,
          appId,
          i18nLocale,
        };
        sessionStorage.setItem('questHeader', JSON.stringify(questHeader));

        window.open(`/datav/editor/preview/${item.id}`, '_blank');
        break;
      case 'delete':
        Modal.confirm({
          title: t('sys.sureToDelete'),
          okText: t('sys.ok'),
          cancelText: t('sys.cancel'),
          onOk() {
            deletePnProject({ ids: item.id })
              .then(() => {
                message.success(t('sys.delSuccess'));
                emits('refresh');
              })
              .catch((error) => {
                console.error(error);
              });
          },
          onCancel() {},
        });
        break;
      case 'design':
        handleDesign(item);
        break;
      case 'share':
        emits('share', item);
        break;
      case 'move':
        openModal(true, {
          ...item,
        });
        break;
      default:
        break;
    }
  };

  const handleDesign = (item) => {
    const userStore = useUserStoreWithOut();
    const timezoneStore = useTimezoneStoreWithOut();
    const usePathQuery = usePathQueryStore();

    const tenantId = userStore.getTenant;
    const source = 501;
    const token = getToken();
    const timezone = timezoneStore.getTimezone;
    const appTag = '__platform__';
    const appId = usePathQuery.getAid();
    const i18nLocale = unref(getLocale);

    const questHeader = {
      tenantId,
      source,
      token,
      timezone,
      appTag,
      appId,
      i18nLocale,
    };
    sessionStorage.setItem('questHeader', JSON.stringify(questHeader));

    window.open(`/datav/editor/screen/${item.id}`, '_blank');
  };

  const handleOk = () => {
    emits('refresh');
  };
</script>
