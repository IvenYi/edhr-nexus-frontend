<template>
  <div :class="ns.b()">
    <div :class="ns.e('title')">{{ $t('sys.bi.apiAddress') }}</div>
    <p :class="ns.e('desc')">{{ dataSource.url }}</p>

    <div :class="ns.e('title')">{{ $t('sys.bi.requestType') }}</div>
    <p :class="ns.e('desc')">{{ dataSource.requestType.toUpperCase() }}</p>

    <div :class="ns.e('title')">{{ $t('sys.bi.connectionMode') }}</div>
    <p :class="ns.e('desc')">{{
      dataSource.connType ? $t('sys.bi.direct') : $t('sys.bi.extract')
    }}</p>

    <template v-if="dataSource.connectorId">
      <div :class="ns.e('title')">{{ $t('sys.bi.preAuth') }}</div>
      <p :class="ns.e('desc')">{{ connName }}</p>
    </template>

    <div :class="ns.e('title')">{{ `${$t('sys.bi.param.header')}（header）` }}</div>
    <div :class="ns.e('example')">
      <pre>{{ dataSource.header }}</pre>
    </div>

    <div :class="ns.e('title')">{{ `${$t('sys.bi.query')}（query）` }}</div>
    <div :class="ns.e('example')">
      <pre>{{ dataSource.query || '' }}</pre>
    </div>

    <div :class="ns.e('title')">{{ `${$t('sys.bi.body')}（body）` }}</div>
    <div :class="ns.e('example')">
      <pre>{{ dataSource.body }}</pre>
    </div>

    <div :class="[ns.e('title')]">{{ $t('sys.bi.getFieldPreview') }}</div>
    <div :class="ns.e('selected-box')">
      <span v-for="(checkItem, index) in dataSource.selected" :key="index" :title="checkItem">{{
        checkItem
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import { getDatabaseInfo } from '/@/apis/gct-platform/DatabaseController';
  import { getConnectorConfigList } from '/@/apis/gct-ipaas2/ConnectorConfigController';

  const props = defineProps({
    currentDatasource: String,
  });

  type InfoType = {
    url: string;
    requestType: 'get' | 'post';
    connType?: 0 | 1;
    ttl?: 5 | 15 | 30;
    connectorId?: string;
    header?: object;
    query?: object;
    body?: object;
    selected?: any[];
  };

  const ns = useNamespace('api-right');

  const dataSource = ref<InfoType>({
    url: '',
    requestType: 'get',
    connType: 0,
    header: {},
    query: {},
    body: {},
  });

  const connName = ref();

  const onQuery = async () => {
    const id = props?.currentDatasource ?? '';
    if (!id) return;
    const res = (await getDatabaseInfo({ id })) || {};
    const config = JSON.parse(res?.apiConfig || '{}');
    dataSource.value = {
      ...dataSource.value,
      ...config,
      url: res.url,
      selected: config.selected?.split(','),
    };
    if (config.connectorId) {
      const connList = (await getConnectorConfigList()) || [];
      connName.value = connList.find((i) => i.id == config.connectorId)?.appName;
    }
  };

  watch(
    () => props.currentDatasource,
    () => {
      dataSource.value = {
        url: '',
        requestType: 'get',
        connType: 0,
        header: {},
        query: {},
        body: {},
      };
      onQuery();
    },
    {
      immediate: true,
    },
  );
</script>

<style lang="scss" scoped>
  @include b(api-right) {
    flex: 1;
    padding: 16px 16px 20px;
    height: 100%;
    width: 100%;
    overflow: auto;

    @include e(title) {
      position: relative;
      font-weight: 500;
      font-size: 16px;
      color: #212528;
      line-height: 26px;
      padding-left: 10px;
      margin-bottom: 12px;
      &::before {
        position: absolute;
        left: 0;
        top: 50%;
        width: 2px;
        height: 16px;
        content: '';
        transform: translate(0, -50%);
        background-color: var(--ant-primary-color);
      }
    }
    @include e(desc) {
      color: #797a7d;
      padding-left: 10px;
      padding-bottom: 10px;
      margin-bottom: 16px;
      // border-bottom: 1px solid #e0e3ea;
    }
    @include e(example) {
      padding-bottom: 6px;
      margin-bottom: 20px;
      // border-bottom: 1px solid #e0e3ea;
      pre {
        padding: 20px;
        background: #f7f8fa;
        border-radius: 4px 4px 4px 4px;
      }
    }
    @include e(selected-box) {
      overflow: auto;
      display: flex;
      color: rgba(0, 0, 0, 0.85);
      font-weight: 500;
      border-right: 1px solid #f0f0f0;
      background: #fafafa;
      span {
        flex: 1;
        min-width: 150px;
        padding: 10px 8px;
        border-left: 1px solid #f0f0f0;
        border-top: 1px solid #f0f0f0;
        border-bottom: 1px solid #f0f0f0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
</style>
