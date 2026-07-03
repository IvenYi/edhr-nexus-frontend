<template>
  <div>
    <div class="pt40px">
      <van-button @click="onSubmit1" block type="primary" native-type="submit">
        测试下载dist1
      </van-button>
    </div>
    <div class="pt40px">
      <van-button @click="onSubmit2" block type="primary" native-type="submit">
        测试下载dist2
      </van-button>
    </div>
    <div class="pt40px">
      <van-button @click="goPage" block type="primary" native-type="submit"> 跳转页面 </van-button>
    </div>
    <div class="pt40px">
      <van-button @click="onSubmitdb1" block type="primary" native-type="submit">
        测试下载db1
      </van-button>
    </div>
    <div class="pt40px">
      <van-button @click="onSubmitdb2" block type="primary" native-type="submit">
        测试下载db2
      </van-button>
    </div>
    <div class="pt40px">
      <van-button @click="search" block type="primary" native-type="submit"> 查询db </van-button>
    </div>
    <div class="pt40px">
      <van-button @click="mqtt" block type="primary" native-type="submit"> MQTT </van-button>
    </div>
    <div class="pt40px">
      <van-button @click="mqtt2" block type="primary" native-type="submit"> MQTT222 </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { GctNative, ServeStart } from '@native/index';
  import { MqttServe } from '../utils/mqtt';
  // console.log(window.navigator.userAgent);
  // console.log();
  const mqtt = () => {
    // ServeStart.insertServeConfig({ serverAddress: 'xxxx' });
    MqttServe.init();
  };
  const mqtt2 = () => {
    // ServeStart.insertServeConfig({ serverAddress: 'xxxx' });
    MqttServe.topic(['aaa', 'xxxx']);
  };
  const deletesql = () => {
    ServeStart.clearSql('base_config');
  };
  const onSubmitdb1 = () => {
    updateDB('https://paas.dev.gct-paas.com/minio/sqlite/3glmk1m_1.0.3.db');
  };
  const onSubmitdb2 = () => {
    updateDB('http://paas.dev.gct-paas.com/minio/apk/test2.db');
  };
  const onSubmit1 = () => {
    updateHtml('http://paas.dev.gct-paas.com/mobile/app');
  };
  const onSubmit2 = () => {
    updateHtml('http://paas.dev.gct-paas.com/minio/apk/dist2.zip');
  };
  function updateDB(path) {
    GctNative.DATABASE.update({
      path,
      app: '3glmk1m',
      success: function (res) {
        console.log(res, path, 'successssss');
      },
      fail: function (err) {
        console.log(err.error);
      },
    });
  }
  function updateHtml(path) {
    GctNative.APP.update({
      path,
      success: function (res) {
        console.log(res, path, 'successssss');
      },
      fail: function (err) {
        console.log(err.error);
      },
    });
  }
  async function goPage() {
    // const v = GctNative.APP.getVersionNameSync();
    // console.log(v, 11);
    GctNative.FILE.readAppFileAsText({
      path: 'dist/version.json',
      success(version) {
        console.log(version);
      },
      fail() {
        console.log('fail');
      },
    });
    // GctNative.WEBVIEW.open({ path: 'dist/version.json' });
    // const data = await getServeConfig();
    // console.log(data);
  }
  const search = () => {
    GctNative.SQLITE.query({
      database: 'test1.db',
      sql: `SELECT * FROM mobile_page`,
      results: [
        {
          key: 'key_',
          type: 'string',
        },

        {
          key: 'name_',
          type: 'string',
        },
        {
          key: 'json_',
          type: 'string',
        },
      ],
      success: function (res) {
        let resData = JSON.parse(res.data);
        console.log(resData);
      },
      fail() {
        console.log('fail');
      },
      complete: function () {
        console.log('complete');
      },
    });
    GctNative.SQLITE.query({
      database: 'test2.db',
      sql: `SELECT * FROM mobile_page`,
      results: [
        {
          key: 'key_',
          type: 'string',
        },
      ],
      success: function (res) {
        let resData = JSON.parse(res.data);
        console.log(resData);
      },
      fail() {
        console.log('fail');
      },
      complete: function () {
        console.log('complete');
      },
    });
  };
</script>
<style scoped lang="less"></style>
