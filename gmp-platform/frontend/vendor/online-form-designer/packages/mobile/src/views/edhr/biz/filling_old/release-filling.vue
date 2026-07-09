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
      left-icon="volume-o"
      text="未查询到放行单时会默认新建该批次/SN的放行单"
      color="#797A7D"
      background="rgba(255,145,74,0.06)"
    >
      <template #left-icon>
        <van-icon color="#F54547" name="warning" class="mr-6px" />
      </template>
    </van-notice-bar>

    <div class="mt-8px text-16px lh-52px b-b-1px b-b-solid b-b-[#F3F6FB] font-bold"
      >放行记录历史</div
    >

    <div class="pt-16px">
      <div
        v-for="(item, index) in releaseList"
        :key="item.id"
        class="h-40px not-last-mb-16px flex items-center"
      >
        <!-- <MaterialStatusTag class="mr-6px" :code="item.materialStatus" /> -->
        <span @click="loadInstByMaterialNo(item.materialNo)">{{ item.materialNo }}</span>
        <div
          class="h-40px w-40px ml-[auto] flex items-center justify-center"
          @click="releaseDel(index)"
        >
          <van-icon name="cross" />
        </div>
      </div>
    </div>

    <FloatingScan v-if="activeTabKey === 2" @trigger="runScan" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import FloatingScan from '@mobile/views/edhr/_comps_/floating-btns/scan.vue';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { getProductReleaseGetProductReleaseByMaterialNo } from '/@/apis/gct-apaas/ProductReleaseController';
  import { showConfirmDialog } from 'vant';
  import { useStore } from './store';
  import type { IReleaseItem } from './store';
  import { useRouter } from 'vue-router';
  import MaterialStatusTag from '@mobile/views/edhr/_comps_/status-tag/material-status-tag.vue';
  import { GctPopup } from '@mobile/utils/popup';
  import { MobileEdhrFillModal, MobileSingleFormFillModal } from '@gct/nocode-mobile-render';
  import { useFilling } from './useFilling';

  const materialNo = ref<string>();
  const router = useRouter();
  const { releaseList, releaseGo, releaseDel } = useStore();
  const { activeTabKey } = useFilling();

  const loadInstByMaterialNo = async (no: string) => {
    const res = await getProductReleaseGetProductReleaseByMaterialNo({
      materialNo: no,
    });
    if (res) {
      const { id, materialNo, materialStatus } = res;
      goFilling(materialNo, { id, materialNo, materialStatus });
    } else {
      handleCreate(no);
    }
  };

  const handleCreate = (no: string) => {
    showConfirmDialog({
      title: '',
      message: `没有查询到【${no}】的放行记录，点击【确定】按钮会以【${no}】新建一条放行记录`,
      confirmButtonText: '确定',
    }).then(async () => {
      const res = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'insertProductReleaseByMaterialNo',
          modelKey: 'em_product',
          modelCategory: 'entity',
        },
        {
          materialNo: no,
        },
      );
      goFilling(no, { id: res, materialNo: no, materialStatus: 'PRODUCT_RELEASE' });
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

  const goFilling = (no: string, payload: IReleaseItem) => {
    payload && releaseGo(payload);

    GctPopup.open(MobileSingleFormFillModal, {
      popupProps: {
        position: 'center',
      },
      context: {
        selfId: payload.id,
        materialNo: no,
        isViewPage: false,
        needAutoSave: false,
      },
      onOk: async (payload: { instId: string }, done: Function) => {},
    });
  };
</script>
<style scoped lang="less"></style>
