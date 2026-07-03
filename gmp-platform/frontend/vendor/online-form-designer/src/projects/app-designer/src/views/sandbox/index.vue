<template>
  <basic-page>
    <div
      v-if="(status === 'INIT' || status === 'SYNC' || status === 'REMOVING') && !loading"
      class="w100% h100% flex flex-col justify-center items-center h100% bg-[#fff]"
    >
      <video autoplay muted loop playsinline style="width: 120px; height: 120px; object-fit: cover">
        <source :src="SandboxLoading" type="video/mp4" />
      </video>
      <div class="mt20px">
        {{
          status === 'INIT'
            ? '沙箱创建中...'
            : status === 'SYNC'
            ? '沙箱同步中...'
            : '沙箱删除中...'
        }}
      </div>
    </div>
    <div v-else-if="!dataList?.length && !loading" class="flex justify-center empty">
      <sandbox-empty @refresh="getDataList" />
    </div>
    <div v-else-if="dataList?.length && !loading" class="w100% h100% bg-[#fff]">
      <sandbox-list :dataList="dataList" @refresh="getDataList" />
    </div>
  </basic-page>
</template>
<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import SandboxEmpty from './components/sandbox-empty.vue';
  import { getSandboxConfigList } from '/@/apis/gct-apaas/SandboxConfigController';
  import SandboxList from './components/sandbox-list.vue';
  import SandboxLoading from '/@/assets/images/sandbox-loading.mp4';
  import { message } from 'ant-design-vue';

  const dataList = ref();

  const loading = ref(false);

  const status = ref();
  onMounted(() => {
    getDataList();
  });

  const getDataList = async () => {
    loading.value = true;
    const data = await getSandboxConfigList();
    loading.value = false;

    if (data && data.length && data[0].status === 'INIT') {
      status.value = 'INIT';
      let timer = setInterval(async () => {
        try {
          const temp = await getSandboxConfigList();
          if (temp[0].status !== 'INIT') {
            dataList.value = temp;
            status.value = '';
            message.success('新建成功');
            clearInterval(timer); // 正确关闭定时器
          }
        } catch (error) {
          console.error('获取沙箱配置失败:', error);
          clearInterval(timer); // 错误时也关闭定时器
        }
      }, 5000);
    } else if (data && data.length && data[0].status === 'SYNC') {
      status.value = 'SYNC';
      let timer = setInterval(async () => {
        try {
          const temp = await getSandboxConfigList();
          if (temp[0].status !== 'SYNC') {
            dataList.value = temp;
            status.value = '';
            message.success('同步成功');
            clearInterval(timer); // 正确关闭定时器
          }
        } catch (error) {
          console.error('获取沙箱配置失败:', error);
          clearInterval(timer); // 错误时也关闭定时器
        }
      }, 5000);
    } else if (data && data.length && data[0].status === 'REMOVING') {
      status.value = 'REMOVING';
      let timer = setInterval(async () => {
        try {
          const temp = await getSandboxConfigList();
          if (!temp || !temp[0]) {
            dataList.value = temp;
            status.value = '';
            message.success('删除成功');
            clearInterval(timer); // 正确关闭定时器
          }
        } catch (error) {
          console.error('获取沙箱配置失败:', error);
          clearInterval(timer); // 错误时也关闭定时器
        }
      }, 5000);
    } else {
      dataList.value = data;
    }
  };
</script>
<style lang="less" scoped>
  .empty {
    width: 100%; /* 视口宽度 */
    // height: 100%; /* 视口高度 */
    background-image: url('/@/assets/images/sandbox-bg.jpg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }

  :deep(.basic-page__body) {
    overflow: auto;
    border: v-bind("!dataList?.length?'1px solid #fff':'none'");
    border-radius: v-bind("!dataList?.length?'8px':'0'");
    background-color: #f9fcff;
    background-image: url('/@/assets/images/device-bg.png');
    background-repeat: no-repeat;
    background-size: 100% 100px;
  }
</style>
