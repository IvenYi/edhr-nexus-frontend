<template>
  <basic-page>
    <basic-table
      class="p-16px"
      :bordered="true"
      :pagination="false"
      :striped="false"
      :dataSource="tableData"
      :columns="localeColumns"
      :showIndexColumn="false"
    >
      <template #headerTop>
        <a-button v-if="userActions.Insert" type="primary" class="btn" @click="addLocale">
          <template #icon>
            <plus-outlined />
          </template>
          {{ t('sys.add') }}
        </a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'language'">
          {{ record.language }}
          <span class="lang-default" v-if="record.defaultLanguage">默认</span>
        </template>
        <template v-if="column.key === 'state'">
          {{ record.state ? t('sys.enable') : t('sys.disabled') }}
        </template>
        <template v-if="column.key === 'action'">
          <div v-if="!record.defaultLanguage">
            <table-action-auto
              :actions="[
                {
                  label: t('sys.setDefault'),
                  onClick: handleSetDefault.bind(null, record),
                  ifShow: userActions.Update,
                },
                {
                  label: !record.state ? t('sys.enable') : t('sys.disabled'),
                  ...(record.state ? { color: 'error' } : {}),
                  onClick: handleChangeState.bind(null, record),
                  ifShow: userActions.Update,
                },
                {
                  label: t('sys.delete'),
                  color: 'error',
                  popConfirm: {
                    title: t('sys.sureToDelete'),
                    confirm: handleRowDelete.bind(null, record),
                  },
                  ifShow: userActions.Delete,
                },
              ]"
              :stopButtonPropagation="true"
            />
          </div>
        </template>
      </template>
    </basic-table>
    <locale-modal @register="register" />
  </basic-page>
</template>

<script setup lang="ts">
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { localeColumns } from './constant/index';
  import { useLocaleStoreWithOut } from '/@/store/modules/locale';
  import LocaleModal from './components/locale-modal.vue';
  import { useModal } from '/@/components/Modal';
  import { PlusOutlined, KeyOutlined } from '@ant-design/icons-vue';
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicAction } from '/@/enums/authActionEnum';
  import { usePermission } from '/@/hooks/web/usePermission';

  const { t } = useI18n();
  const { hasPermission } = usePermission();

  const userActions = computed(() => {
    return {
      Insert: hasPermission(BasicAction.Insert),
      Update: hasPermission(BasicAction.Update),
      Delete: hasPermission(BasicAction.Delete),
    };
  });

  const localeStore = useLocaleStoreWithOut();
  const tableData = computed(() => {
    return localeStore.localeList.filter((d) => {
      return d.configured === 1;
    });
  });
  const [register, { openModal }] = useModal();
  const addLocale = () => {
    openModal();
  };
  const handleChangeState = (record) => {
    localeStore.updateLocale(record.id, {
      state: record.state === 1 ? 0 : 1,
    });
  };
  const handleRowDelete = (record) => {
    localeStore.updateLocale(record.id, {
      configured: 0,
    });
  };
  const handleSetDefault = (record) => {
    localeStore.updateLocale(record.id, {
      defaultLanguage: 1,
    });
  };
</script>

<style lang="less" scoped>
  .lang-default {
    display: inline-block;
    color: #3370ff;
    background-color: #eff4ff;
    padding: 0px 8px;
    border-radius: 3px;
    line-height: 22px;
    margin-left: 4px;
  }
</style>
