<template>
  <div class="p-20px h-full">
    <div class="flex items-center">
      <div class="rounded-4px b-1px b-solid b-[#e5e7eb] overflow-hidden flex-1 mr-16px">
        <van-field
          v-model="materialNo"
          placeholder="搜索批次/SN"
          :border="false"
          clearable
          right-icon="search"
        />
      </div>
      <van-button
        color="linear-gradient(180deg, #0280F2 0%, #0056AA 95%)"
        type="primary"
        class="min-w-180px"
        @click="handleSearch"
        >查询</van-button
      >
    </div>
    <van-notice-bar
      class="mt-24px"
      left-icon="warning"
      text="未查询到【SN/批次号】时会默认新建该批次的DHR"
      color="#797A7D"
      background="rgba(255,145,74,0.06)"
    >
      <template #left-icon>
        <van-icon color="#F54547" name="warning" class="mr-6px" />
      </template>
    </van-notice-bar>

    <div class="mt-8px text-16px lh-52px b-b-1px b-b-solid b-b-[#F3F6FB] font-bold"
      >DHR记录历史</div
    >

    <div class="pt-16px">
      <div
        v-for="(item, index) in eDHRList"
        :key="item.materialNo"
        class="h-40px not-last-mb-16px flex items-center"
      >
        <MaterialStatusTag class="mr-6px" :code="item.materialStatus" />
        <div class="ks-col ell" @click="loadInstByMaterialNo(item.materialNo)">{{
          item.materialNo
        }}</div>
        <div
          class="h-40px w-40px ml-[auto] flex items-center justify-center"
          @click="eDHRDel(index)"
        >
          <van-icon name="cross" />
        </div>
      </div>
    </div>

    <FloatingScan v-if="activeTabKey === 0" @trigger="runScan" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import FloatingScan from '@mobile/views/edhr/_comps_/floating-btns/scan.vue';
  import MaterialStatusTag from '@mobile/views/edhr/_comps_/status-tag/material-status-tag.vue';
  import { GctPopup } from '@mobile/utils/popup';
  import EdhrCreatePopup from './edhr-create-popup.vue';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { useRouter } from 'vue-router';
  import { useStore } from './store';
  import { useFilling } from './useFilling';
  import { MobileEdhrFillModal, MobileSingleFormFillModal } from '@gct/nocode-mobile-render';

  const materialNo = ref<string>();
  const router = useRouter();
  const { eDHRList, eDHRGo, eDHRDel } = useStore();
  const { activeTabKey } = useFilling();

  const loadInstByMaterialNo = async (no: string) => {
    const res = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'getInstanceByMaterialNo',
        modelKey: 'em_product_process',
        modelCategory: 'entity',
      },
      {},
      {
        materialNo: no,
      },
    );
    if (res?.edhrInstance) {
      goFilling(no, res.edhrInstance);
    } else {
      handleCreate(no);
    }
  };

  const handleCreate = (no: string) => {
    if (!no) return;
    GctPopup.open(EdhrCreatePopup, {
      context: {
        materialNo: no,
      },
      onOk: () => {
        loadInstByMaterialNo(no);
      },
    });
  };

  const handleSearch = () => {
    if (!materialNo.value || !materialNo.value.trim()) return;
    loadInstByMaterialNo(materialNo.value);
  };

  const runScan = (value: string) => {
    if (!value || !value.trim()) return;
    loadInstByMaterialNo(value);
  };

  const goFilling = (no: string, edhrInstance) => {
    eDHRGo({
      id: edhrInstance.id,
      materialNo: edhrInstance.materialNo,
      materialStatus: edhrInstance.materialStatus,
    });

    GctPopup.open(MobileEdhrFillModal, {
      popupProps: {
        position: 'center',
      },
      context: {
        materialNo: edhrInstance.materialNo,
        ofInstanceId: edhrInstance.id,
        viewPageLimit: false,
        isViewPage: false,
        needAutoSave: false,
        pageType: '',
      },
      onOk: async (payload: { instId: string }, done: Function) => {},
    });
  };
</script>
<style scoped lang="less"></style>
