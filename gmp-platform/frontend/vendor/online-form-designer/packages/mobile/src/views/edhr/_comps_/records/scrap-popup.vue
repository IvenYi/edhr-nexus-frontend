<template>
  <basic-popup
    v-model:show="show"
    :popup-props="popupProps"
    :show-header="false"
    :show-footer="false"
  >
    <div class="bg-white h-full flex flex-col">
      <div class="flex-none flex items-center pt-24px pb-4px pl-20px pr-20px">
        <i class="h-20px w-20px flex items-center justify-center" @click="show = false">
          <van-icon name="arrow-left" />
        </i>
        <span class="text-16px font-bold ml-8px">报废记录</span>
        <span class="text-14px color-[#474747] ml-8px">共计数量：</span>
        <span class="text-14px color-[#F54547]">{{ total }}</span>
      </div>
      <div class="flex-1 overflow-auto">
        <div class="p-20px">
          <TimelineList v-if="context.list.length > 0" :list="context.list">
            <template #time="{ record }: { record: IReportItem }">
              {{ record.create_time_ }}
            </template>
            <template #title="{ record }: { record: IReportItem }">
              {{ record.report_user_name_ || record.report_user_id_ }}
            </template>
            <template #default="{ record }: { record: IReportItem }">
              <div class="p-8px">
                <DescriptionItem name="报废数" :value="record.scrap_qty_" />
                <div class="bg-white p-8px mt-8px" v-if="record.scrap_entries_">
                  <DescriptionItem
                    v-for="(item, index) in record.scrap_entries_"
                    class="not-last-mb-8px"
                    :key="index"
                    :name="`${item.scrap_group_id_}/${item.scrap_reason_id_}`"
                    :value="item.scrap_qty_"
                  />
                </div>
              </div>
            </template>
          </TimelineList>
          <van-empty v-else image-size="80" />
        </div>
      </div>
    </div>
  </basic-popup>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import TimelineList from '@mobile/views/edhr/_comps_/timeline/timeline-list.vue';
  import DescriptionItem from '@mobile/views/edhr/_comps_/description/item.vue';
  import type { IReportItem } from './index.d.ts';

  const props = defineProps<{
    popupProps: any;
    context: {
      containerId: string;
      containerOperationId: string;
      list: IReportItem[];
    };
    onOk?: Function;
    onCancel?: Function;
  }>();

  const show = ref<boolean>(true);
  const total = computed(() => {
    return props.context.list.reduce((total, item) => {
      total += item.scrap_qty_;
      return total;
    }, 0);
  });
</script>
<style scoped lang="less"></style>
