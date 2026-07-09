<template>
  <div class="pl16px pr16px bg-#F2F5F8 h-100vh pt60px relative dhr-filling-page">
    <div class="ks-row-middle h60px mt--60px">
      <div class="back-btn gct-iconfont icon-fanhui-padduan" @click="router.back()"></div>
      <span class="text-18px ml20px font-600">DHR填报</span>
    </div>
    <div class="w480px ma text-center mt200px">
      <div class="text-[18px] text-[#1A1D23] font-500">请输入或扫码批次/SN，查询对应的DHR</div>
      <div>
        <van-search
          v-model="codeValue"
          shape="round"
          placeholder="请输入批次/SN"
          readonly
          @click-input="handleSearch"
        >
          <template #right-icon>
            <div class="ks-row-middle" @click="onScan">
              <gct-icon value="icon-platform:scan-pad" size="44" />
            </div>
          </template>
        </van-search>
      </div>
      <div class="text-[#5A5F6B] text-[14px] ks-row-middle justify-center">
        <span class="iconfont icon-a-zhuyi_attention2 primary-gct text-[16px]"></span>
        未查询到【SN/批次号】时会默认新建该批次的DHR</div
      >
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import { GctPopup } from '@mobile/utils/popup';
  import { GctDialog } from '@mobile/utils/dialog';
  import SelectLotsnModal from './components/select-lotsn-modal.vue';
  import CreateEdhr from './components/create-edhr.vue';
  import { MobileEdhrFillModal } from '@gct/nocode-mobile-render';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { GctNative } from '@native/index';
  import { showToast, showLoadingToast, closeToast } from 'vant';

  const codeValue = ref('');
  const router = useRouter();
  const onScan = async () => {
    GctNative.CAMERA.scanCode({
      sourceType: ['album', 'camera'],
      scanType: ['qrCode', 'barCode'],
      success: async (value) => {
        const name = value.result?.trim();
        if (!name) return;
        codeValue.value = name;
        loadInstByMaterialNo();
      },
    });
  };
  function handleSearch() {
    GctPopup.open(SelectLotsnModal, {
      onOk: (res) => {
        codeValue.value = res.value;
        loadInstByMaterialNo();
      },
    });
  }
  const loadInstByMaterialNo = async () => {
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
    });
    const res = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'getInstanceByMaterialNo',
        modelKey: 'em_product_process',
        modelCategory: 'entity',
      },
      {},
      {
        materialNo: codeValue.value,
        type: 'edhr',
      },
    );
    if (res?.edhrInstance) {
      goFilling(res.edhrInstance);
    } else {
      handleCreate();
    }
    closeToast();
  };
  function goFilling({ id, materialNo }) {
    codeValue.value = '';
    GctPopup.open(MobileEdhrFillModal, {
      popupProps: {
        position: 'center',
      },
      context: {
        materialNo: materialNo,
        ofInstanceId: id,
        viewPageLimit: false,
        isViewPage: false,
        needAutoSave: false,
        pageType: 'edhr-filling',
      },
      onOk: async () => {},
    });
  }

  function handleCreate() {
    GctDialog.open(CreateEdhr, {
      materialNo: codeValue.value,
      onOk: async (id) => {
        showToast('创建成功');
        goFilling({ id, materialNo: codeValue.value });
        codeValue.value = '';
      },
    });
  }
</script>
<style scoped lang="less">
  .dhr-filling-page {
    background: url('@mobile/assets/ipad/bg.png') center no-repeat;
  }

  .back-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: rgb(0 0 0 / 6%);
    color: #1a1d23;
    line-height: 36px;
    text-align: center;
  }

  :deep(.van-search) {
    --van-search-input-height: 52px;
    --van-search-background: transparent;

    padding-top: 40px;
    padding-bottom: 24px;

    .van-field__left-icon {
      color: #5a5f6b;
    }

    .van-search__content {
      padding-left: 26px !important;
    }
  }
</style>
