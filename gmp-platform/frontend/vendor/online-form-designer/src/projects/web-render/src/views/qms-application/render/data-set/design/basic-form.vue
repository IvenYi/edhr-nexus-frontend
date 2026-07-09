<template>
  <a-form ref="formRef" layout="vertical" :model="formState" autocomplete="off">
    <a-form-item
      :label="
        t('sys.bi.sthSelect', { sth: t('sys.bi.step1') }) + t('sys.pageDesigner.dataSourcetype')
      "
      name="databaseType"
    >
      <a-select
        v-model:value="formState.databaseType"
        :options="dataSourceTypeOptions"
        :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.pageDesigner.dataSourcetype') })"
        @change="handleDBTypeChange"
      />
    </a-form-item>

    <a-form-item
      :label="t('sys.bi.sthSelect', { sth: t('sys.bi.step2') }) + t('sys.integration.dataSource')"
      name="databaseId"
    >
      <a-select
        v-model:value="formState.databaseId"
        :options="computedDataSourceOptions"
        :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.integration.dataSource') })"
      />
    </a-form-item>

    <!-- <a-form-item
      :label="t('sys.bi.sthSelect', { sth: t('sys.bi.step3') }) + t('sys.bi.datasetType')"
      name="type"
    >
      <a-select
        v-model:value="formState.type"
        :options="datasetTypeOptions"
        :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.bi.datasetType') })"
      />
    </a-form-item> -->
  </a-form>
</template>

<script setup lang="ts">
  import { reactive, ref, computed, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FormInstance } from 'ant-design-vue';
  import { DataSourceType, DatasetType } from '/@bi-designer/enum/database';
  import { PnDatasetRequest } from '/@/apis/gct-platform/model/index';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { getDataSourcePageList } from '/@/apis/gct-platform/DataSourceController';
  import { getReleasedAppPublishedAppList } from '/@/apis/gct-platform/PublishedAppController';
  import { useEnv } from '/@/hooks/develop/useEnv';

  enum EDataSourceType {
    DATABASE = 'database',
    APPLICATION = 'app',
  }

  const emit = defineEmits(['updateDBType']);

  const { t } = useI18n();

  const { getEnv } = useEnv();

  const usePathQuery = usePathQueryStore();

  const formRef = ref<FormInstance>();

  const formState = reactive<PnDatasetRequest>({});

  const datasetTypeOptions = Object.keys(DatasetType)
    .map((key) => {
      return {
        label: t(`sys.bi.${DatasetType[key]}`),
        value: key,
      };
    })
    .filter((item) => item.value === DatasetType.SQL);

  const dataSourceTypeOptions = Object.values(EDataSourceType).map((val) => {
    return {
      label: t(`sys.kit.qms.${val.toLowerCase()}Source`),
      value: val,
    };
  });

  const dataSourceOptions = ref<any>([]);
  const computedDataSourceOptions = computed(() => {
    return dataSourceOptions.value.filter((item) => {
      return item.type === formState.databaseType;
    });
  });

  function handleDBTypeChange() {
    formState.databaseId = undefined;
    emit('updateDBType', formState.databaseType);
  }

  async function queryDatabase() {
    try {
      const { data: dataSourceList } = (await getDataSourcePageList()) ?? {};
      const dbDatasourceList = (dataSourceList ?? [])
        .map((item) => {
          const enable = item.detailList?.[0]?.enabled === 1;
          return {
            label: item.name + (enable ? '' : `(${t('sys.disabled')})`),
            value: item.key,
            type: EDataSourceType.DATABASE,
            disabled: !enable,
            enabled: enable,
          };
        })
        .filter((it) => it.enabled);
      const env = getEnv();
      console.log('env: getEnv()=============', env);
      const { data: _dataSourceList } =
        (await getReleasedAppPublishedAppList({ pageNo: 1, pageSize: 9999, env: env ?? 'test' })) ??
        {};
      const appDataSourceList = (_dataSourceList ?? []).map((item) => {
        return {
          label: item.appName,
          value: item.appId,
          type: EDataSourceType.APPLICATION,
        };
      });
      dataSourceOptions.value = [...dbDatasourceList, ...appDataSourceList];
    } catch (error) {
      console.warn(error);
      dataSourceOptions.value = [];
    }
  }

  onMounted(() => {
    onDataReceive();
    queryDatabase();
  });
  const onDataReceive = async () => {
    Object.assign(formState, {
      type: 'SQL',
    });
  };

  const getData = () => {
    try {
      return formState;
    } catch (err) {
      console.warn(err);
    }
  };

  defineExpose({
    getData,
    setFormData(data) {
      Object.assign(formState, data);
    },
  });
</script>

<style lang="scss" scoped></style>
