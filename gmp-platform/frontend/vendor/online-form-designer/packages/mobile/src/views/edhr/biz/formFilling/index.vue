<template>
  <div class="form-filling overflow-hidden">
    <div
      class="flex-shrink-0 h64px bg-white ks-row-middle gct-color-text-1 px16px b-b-[#E0E3EB] b-b b-b-solid"
    >
      <div class="ks-row-middle">
        <div class="gct-iconfont icon-fanhui-padduan" @click="router.back()"></div>
        <span class="text-18px ml16px font-600">表单填报</span>
      </div>
      <div class="ks-col text-right">
        <van-button type="primary" class="h40px w104px" @click="handleCreate">
          <span class="gct-iconfont icon-tianjia-shixin"></span>
          新建</van-button
        >
      </div>
    </div>
    <div class="ks-row ks-col overflow-hidden">
      <div class="w88px bg-white form-tab text-center p8px">
        <div
          :class="{ active: fillingType === FillingTypeEnum.UNFILLED }"
          @click="fillingType = FillingTypeEnum.UNFILLED"
        >
          <span class="iconfont icon-wodetianbao text-24px"></span>
          <span class="tab-text">我的填报</span>
        </div>
        <div
          :class="{ active: fillingType === FillingTypeEnum.CREATED }"
          @click="fillingType = FillingTypeEnum.CREATED"
        >
          <span class="iconfont icon-wochuangjiande text-24px"></span>
          <span class="tab-text">我创建的</span>
        </div>
        <div
          :class="{ active: fillingType === FillingTypeEnum.COMPLETED }"
          @click="fillingType = FillingTypeEnum.COMPLETED"
        >
          <span class="iconfont icon-wodeyitian text-24px"></span>
          <span class="tab-text">我的已填</span>
        </div>
      </div>
      <div class="ks-col overflow-hidden">
        <CardList :fillingType="fillingType" ref="refList" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import CardList from './components/card-list.vue';
  import { FillingTypeEnum } from '@gct/nocode-base';
  import CreateFrom from './components/create-form.vue';
  import { GctDialog } from '@mobile/utils/dialog';
  import { showToast } from 'vant';

  const router = useRouter();
  const fillingType = ref(FillingTypeEnum.UNFILLED);
  const refList = ref();
  function handleCreate() {
    GctDialog.open(CreateFrom, {
      onOk: async (id) => {
        showToast('创建成功');
        refList.value.onSearch();
      },
    });
  }
</script>
<style scoped lang="less">
  .form-filling {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f2f5f8;
  }

  .form-tab {
    & > div {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 98px;
      margin: auto;
      border-radius: 8px;
      color: #7b7f89;
      font-size: 12px;
    }

    .active {
      background-color: rgb(from var(--van-primary-color) r g b / 10%);
      color: var(--van-primary-color);
      .tab-text {
        font-weight: 600;
      }
    }
  }
</style>
