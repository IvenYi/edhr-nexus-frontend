<template>
  <div class="card-container">
    <div class="card-item" v-for="item in dataList" :key="item.id">
      <div class="card-item-top">
        <div class="card-item-top-img" :style="{ aspectRatio: '16 / 9' }">
          <img :src="getCoverImg(item)" alt="" class="w-100% h-100% object-fill" />
        </div>
        <div class="card-item-top-title mb-8px">
          {{ item.name }}
        </div>
      </div>
      <div class="card-item-btn">
        <a-button type="primary" @click="handleDesign(item)">{{ t('sys.design') }}</a-button>
        <a-dropdown overlayClassName="card-item-btn-dropdown">
          <template #overlay>
            <a-menu @click="({ key }) => handleBtnClick(key, item)">
              <a-menu-item v-for="dbtn of dropButton" :key="dbtn.key">
                {{ dbtn.name }}
              </a-menu-item>
            </a-menu>
          </template>
          <div class="card-more">
            <MoreOutlined />
          </div>
        </a-dropdown>
      </div>
    </div>
    <move :module="module" @register="register" @ok="handleOk" />
  </div>
</template>

<script setup lang="ts">
  import { unref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { deletePnProject } from '/@/apis/gct-platform/PnProjectController';
  import type { PnProjectResponse } from '/@/apis/gct-platform/model/index';
  import { Modal, message } from 'ant-design-vue';
  import defaultPng from '/@bi-designer/assets/default.png';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import { useTimezoneStoreWithOut } from '/@/store/modules/timezone';
  import { getToken } from '/@/utils/auth';
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

  const dropButton = [
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

  const handleOk = () => {
    emits('refresh');
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
    sessionStorage.setItem('userInfo', JSON.stringify(userStore?.userInfo));
    console.log('userInfo', userStore.userInfo);
    window.open(`/datav/editor/screen/${item.id}`, '_blank');
  };

  const getCoverImg = (item) => {
    let globalObj = {} as any;
    try {
      globalObj = item?.global ? JSON.parse(item.global) : {};
    } catch (e) {
      console.log('解析JSON出错,当前item是', item);
      console.error(e);
    }
    const coverImg = globalObj?.cover?.src;
    if (coverImg) {
      return `${import.meta.env.VITE_MINIO_PATH}${coverImg}`;
    }
    return defaultPng;
  };
</script>
<style lang="scss" scoped>
  .card-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(365px, 1fr));
    grid-gap: 24px;

    .card-item {
      background-color: #fff;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      border: 1px solid #e8e8e8;
      // margin-bottom: 20px;
      padding: 10px;

      &:hover {
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }

      &-top {
        &-img {
          width: 100%;
          height: 160px;
        }

        &-title {
          font-weight: 500;
          font-size: 14px;
          color: #212528;
        }
      }

      &-btn {
        display: flex;
        justify-content: space-between;
      }
    }
  }
</style>
