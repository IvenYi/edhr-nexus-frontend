<template>
  <div class="h100% ks-column edhr-list bg-[#fff]" :class="[hiddenList && 'hiddenList']">
    <div class="tool cursor-pointer" @click="hiddenList = !hiddenList">
      <i class="iconfont icon-pad_arrow_right"></i>
      <div class="tool-text">{{ $t('sys.webRender.edhrApplication.edhrList') }}</div>
    </div>
    <div class="flex-1 overflow-hidden ks-column">
      <div class="px20px pt20px pb18px">
        <a-input
          v-model:value="searchVal"
          :placeholder="$t('sys.inputTextTip', { name: $t('sys.edhr.lotOrSn') })"
          allow-clear
          @pressEnter="handlerSearch"
          @change="handleChange"
        >
          <template #suffix>
            <i class="iconfont icon-sousuo text-[#212528]"></i>
          </template>
        </a-input>
      </div>
      <div class="flex-1 overflow-y-auto px16px">
        <div v-show="loading" class="ks-row justify-center h100% mt20px">
          <a-spin :spinning="loading" />
        </div>
        <div v-if="!loading && !dataList.length" class="pt-30px">
          <a-empty class="important-m-0px" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
        </div>
        <div
          v-for="item in dataList"
          :key="item.id"
          class="item p8px cursor-pointer"
          @click="handleClick(item)"
        >
          <div class="ks-row">
            <div class="flex-1 font-bold ell" :title="item.materialNo">{{ item.materialNo }}</div>
            <div class="gct-custom-tag text-[12px] ml4px">
              {{ $t(`sys.edhr.instanceStatus2DhrEnum.${item.instanceStatus}`) }}
            </div>
          </div>
          <div class="text-12px text-[#999999] mt4px ell" :title="item.productName">
            {{ item.productName }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="dataList.length && !hiddenList" class="p16px text-right pagination-wrap">
      <a-pagination
        v-model:current="pagination.pageNo"
        size="small"
        :total="pagination.total"
        :page-size-options="['10', '20', '30', '40', '50']"
        show-size-changer
        @change="handlePageChange"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue';
  import { getEdhrInstanceRunningPage } from '/@/apis/gct-apaas/EdhrInstanceController';
  import { EdhrInstanceResponse } from '/@/apis/gct-apaas/model';
  import { Empty } from 'ant-design-vue';

  const emit = defineEmits(['go-detail']);
  const searchVal = ref('');
  const dataList = ref<EdhrInstanceResponse[]>([]);
  const loading = ref(false);
  const hiddenList = ref(true);
  const pagination = reactive({
    total: 0,
    pageSize: 10,
    pageNo: 1,
  });

  onMounted(() => {
    handlePageChange(1);
  });
  const getData = async () => {
    loading.value = true;
    try {
      const res: any = await getEdhrInstanceRunningPage({
        materialNo: searchVal.value,
        ...pagination,
      });
      loading.value = false;
      dataList.value = res?.data || [];
      pagination.total = res?.totalCount || 0;
    } catch (error) {
      loading.value = false;
    }
  };
  const handlerSearch = () => {
    handlePageChange(1);
  };
  const handleChange = () => {
    if (searchVal.value === '') {
      handlePageChange(1);
    }
  };

  const handlePageChange = (current, pageSize?) => {
    pagination.pageSize = pageSize;
    pagination.pageNo = current;
    getData();
  };

  const handleClick = (item) => {
    emit('go-detail', item.materialNo);
  };

  defineExpose({
    getData,
  });
</script>
<style lang="less" scoped>
  .title {
    padding: 12px 16px;
    border-bottom: 1px solid #e0e3ea;
    display: flex;
    align-items: center;

    &::before {
      content: ' ';
      display: inline-block;
      width: 3px;
      height: 14px;
      background-color: var(--ant-primary-color);
      margin-right: 4px;
    }
  }

  .item {
    // box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.12);
    border: 1px solid #e0e3eb;
    border-radius: 4px;
    margin-bottom: 10px;

    &:hover {
      box-shadow: 0 4px 12px 2px rgba(0, 0, 0, 0.06);
    }
  }

  .edhr-list {
    width: 400px;
    border: 1px solid #e8ebf0;
    margin-left: 10px;
    position: relative;
    transition: all 0.3s ease;

    &.hiddenList {
      width: 0;
      margin-left: 0;
      border: 0;

      .iconfont {
        transform: rotateY(180deg);
      }
    }

    .tool {
      color: #fff;
      font-size: 12px;
      width: 40px;
      height: 84px;
      background-color: #d2d3d4;
      border-radius: 8px 0px 0px 8px;
      display: flex;
      align-items: center;
      position: absolute;
      left: -40px;
      bottom: 117px;

      .iconfont {
        font-size: 12px;
        margin-right: 2px;
        margin-left: 6px;
      }

      &-text {
        width: 12px;
        word-break: break-all;
        line-height: 1.2;
        text-align: center;
      }
    }

    .pagination-wrap {
      box-shadow: 0px -1px 0px 0px #e0e3eb;
    }
  }
</style>
