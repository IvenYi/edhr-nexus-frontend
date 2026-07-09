<template>
  <div :class="['empty-page']">
    <div class="text-center leading-none">
      <img :src="EmptyImage" alt="" class="w270px" />
      <div class="text-[#1A1D23] text-18px"> 暂无数据 </div>
      <div class="text-15px text-[#8B8B8B] mt8px"
        >请扫码或者选择{{ material_status_ === MATERIAL_STATUS_ENUM.LOT ? `当前批次` : 'SN' }}
      </div>
      <div class="mt40px">
        <van-button type="default" class="w120px h40px" @click="onScan">扫码</van-button>
        <van-button type="primary" class="w120px h40px ml16px!" @click="selectPicker"
          >选择{{ material_status_ === MATERIAL_STATUS_ENUM.LOT ? `批次` : 'SN' }}
        </van-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="empty-page">
  import EmptyImage from '@mobile/assets/svg/edhr/pic_scan.svg';
  import {
    checkedScanCode,
    MATERIAL_STATUS_ENUM,
    TASK_TYPE__ENUM,
    selectLotSn,
    selectRework,
    rework_data,
  } from './useBasicsRun';

  const router = useRouter();
  const route = useRoute();
  const material_status_ = route.meta.material_status_ as MATERIAL_STATUS_ENUM;
  const task_type_ = route.meta.task_type_ as TASK_TYPE__ENUM;
  const onScan = async () => {
    const { name_ } = await checkedScanCode(material_status_);
    nextPage(name_);
  };

  const selectPicker = async () => {
    const isReworkProduce =
      task_type_ === TASK_TYPE__ENUM.REWORK && material_status_ === MATERIAL_STATUS_ENUM.LOT;
    const { name_, id_ } = await selectLotSn({ material_status_, task_type_, isReworkProduce });
    if (isReworkProduce) {
      rework_data.value = await selectRework(id_);
      console.log(rework_data.value);
    }
    nextPage(name_);
  };
  const nextPage = (name: string) => {
    router.push({
      name: route.meta.runName,
      query: {
        id: name,
      },
    });
  };
</script>

<style lang="less" scoped>
  .empty-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #fff;
  }
</style>
