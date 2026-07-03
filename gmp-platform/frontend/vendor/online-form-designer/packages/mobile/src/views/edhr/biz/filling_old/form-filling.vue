<template>
  <div class="p-20px h-full">
    <div class="flex items-center">
      <div class="rounded-4px b-1px b-solid b-[#e5e7eb] overflow-hidden flex-1 mr-16px">
        <van-field
          v-model="materialNo"
          placeholder="请输入表单流水码"
          :border="false"
          clearable
          right-icon="search"
        />
      </div>
      <van-button
        color="linear-gradient(180deg, #0280F2 0%, #0056AA 95%)"
        class="important-mr-16px min-w-180px"
        type="primary"
        @click="handleSearch"
        >查询</van-button
      >
      <van-button
        class="min-w-120px"
        type="primary"
        color="linear-gradient(180deg, #0280F2 0%, #0056AA 95%)"
        @click="handleCreate"
        >新建表单</van-button
      >
    </div>

    <div class="mt-8px text-16px lh-52px b-b-1px b-b-solid b-b-[#F3F6FB] font-bold"
      >表单记录历史</div
    >

    <div class="pt-16px">
      <div
        v-for="(item, index) in formList"
        :key="item.id"
        class="h-40px not-last-mb-16px flex items-center"
      >
        <span @click="loadInstBySerialNo(item.serialNo)">{{ item.serialNo }}</span>
        <div
          class="h-40px w-40px ml-[auto] flex items-center justify-center"
          @click="formDel(index)"
        >
          <van-icon name="cross" />
        </div>
      </div>
    </div>

    <FloatingScan v-if="activeTabKey === 1" @trigger="runScan" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import FloatingScan from '@mobile/views/edhr/_comps_/floating-btns/scan.vue';
  import { GctPopup } from '@mobile/utils/popup';
  import FormCreatePopup from './form-create-popup.vue';
  import { showFailToast } from 'vant';
  import { useRouter } from 'vue-router';
  import { postOnlineFormInstanceTaskPageList } from '/@/apis/gct-apaas/OnlineFormInstanceController';
  import { useStore } from './store';
  import type { IFormItem } from './store';
  import { useFilling } from './useFilling';
  import { MobileEdhrFillModal, MobileSingleFormFillModal } from '@gct/nocode-mobile-render';

  const materialNo = ref<string>();
  const router = useRouter();
  const { formList, formGo, formDel } = useStore();
  const { activeTabKey } = useFilling();

  const loadInstBySerialNo = async (no: string) => {
    const res = await postOnlineFormInstanceTaskPageList(
      {
        serialNo: no,
      },
      {
        pageNo: 1,
        pageSize: 5,
      },
    );
    if (res?.data?.length > 0) {
      const { id, serialNo } = res.data[0];
      goFilling(id, { id, serialNo });
    } else {
      showFailToast('未查询到该表单流水码相关数据');
    }
  };

  const handleCreate = () => {
    GctPopup.open(FormCreatePopup, {
      onOk: (info: any) => {
        if (typeof info === 'string') {
          goFilling(info);
        } else {
          goFilling(info.id, { id: info.id, serialNo: info.serialNo });
        }
      },
    });
  };

  const handleSearch = () => {
    if (!materialNo.value || !materialNo.value.trim()) return;
    loadInstBySerialNo(materialNo.value);
  };

  const runScan = (value: string) => {
    if (!value || !value.trim()) return;
    loadInstBySerialNo(value);
  };

  const goFilling = (id: string, payload?: IFormItem) => {
    payload && formGo(payload);

    GctPopup.open(MobileSingleFormFillModal, {
      popupProps: {
        position: 'center',
      },
      context: {
        selfId: id,
        isViewPage: false,
        needAutoSave: false,
      },
      onOk: async (payload: { instId: string }, done: Function) => {},
    });
  };
</script>
<style scoped lang="less"></style>
