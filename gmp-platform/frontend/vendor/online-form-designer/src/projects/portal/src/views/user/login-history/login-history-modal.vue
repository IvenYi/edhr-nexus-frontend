<template>
  <BasicModal v-bind="$attrs" :title="t('sys.loginFoot')" centered width="700px" :maskClosable="false">
    <template v-for="history in historyList">
      <a-row class="info">
        <a-col class="label" :span="6">{{t('sys.loginState')}}:</a-col>
        <a-col class="val" :span="16">
          <a-tag color="pink">{{ history.status }}</a-tag></a-col
        >
      </a-row>
      <a-row class="info">
        <a-col class="label" :span="6">{{t('sys.loginTime')}}:</a-col>
        <a-col class="val" :span="16">{{ history.time }}</a-col>
      </a-row>
      <a-row class="info">
        <a-col class="label" :span="6">{{t('sys.ipAddress')}}:</a-col>
        <a-col class="val" :span="16">{{ history.ip }}</a-col>
      </a-row>
      <a-row class="info">
        <a-col class="label" :span="6">{{t('sys.client')}}:</a-col>
        <a-col class="val" :span="16">{{ history.client === 501 ? 'PC' : t('sys.MobileClient') }}</a-col>
      </a-row>
      <a-divider />
    </template>
  </BasicModal>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { BasicModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import moment from 'moment';
  const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
  const { t } = useI18n();
  interface History {
    id: number;
    status: string;
    time: string;
    ip: string;
    client: number;
  }
  const historyList = reactive<History[]>([
    {
      id: 1,
      status: 'success',
      time: moment(new Date()).format(DATE_TIME_FORMAT),
      ip: '192.168.1.1',
      client: 501,
    },
    {
      id: 2,
      status: 'success',
      time: moment(new Date()).format(DATE_TIME_FORMAT),
      ip: '192.168.1.1',
      client: 502,
    },
    {
      id: 3,
      status: 'success',
      time: moment(new Date()).format(DATE_TIME_FORMAT),
      ip: '192.168.1.1',
      client: 501,
    },
  ]);
</script>

<style lang="less" scoped>
  .info {
    font-size: 14px;
    margin-bottom: 10px;
    .label {
      color: #666666;
      text-align: right;
      margin-right: 10px;
    }
    .val {
      color: #333333;
    }
  }
</style>
