<template>
  <basic-popup
    v-model:show="show"
    :popup-props="popupProps"
    title="物料"
    :extra-style="{
      left: 'auto',
      right: 0,
      height: 'auto',
    }"
  >
    <div class="p-1px bg-white">
      <van-cascader
        :show-header="false"
        title="请选择"
        :options="showOptions"
        @close="show = false"
        @change="onChange"
      >
        <template #option="{ option }">
          <LoadMore v-if="option.value === '__loadMore__'" @more="onMore" />
          <div v-else class="flex items-center w-1px flex-grow-1">
            <span class="ellipsis" :title="option.text">
              {{ option.text }}
            </span>
            <van-tag class="ml-6px flex-none" v-if="option.default" type="primary">默认</van-tag>
          </div>
        </template>
      </van-cascader>
    </div>
    <template #footer>
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="show = false"
          >取消</van-button
        >
        <van-button class="flex-1" type="primary" @click="handleOk">确认</van-button>
      </div>
    </template>
  </basic-popup>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { showFailToast } from 'vant';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import LoadMore from './load-more.vue';

  const props = defineProps<{
    popupProps: any;
    context: any;
    onOk?: Function;
    onCancel?: Function;
  }>();

  const show = ref<boolean>(true);
  const options = ref<any[]>([]);
  let cascaderSelectedOptions: any = null;
  const pageNo = ref(1);
  const isCompleted = ref(false);
  const showOptions = computed(() => {
    if (!options.value.length) {
      return [];
    }
    if (isCompleted.value) {
      return options.value;
    } else {
      return [
        ...options.value,
        {
          text: '加载更多',
          value: '__loadMore__',
        },
      ];
    }
  });

  onMounted(() => {
    loadOptions();
  });

  /**
   * 加载不良分类
   */
  async function loadOptions(add = false) {
    pageNo.value = add ? pageNo.value + 1 : 1;
    const res = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'rdoListByPage',
        modelKey: 'em_product',
        modelCategory: 'entity',
      },
      {
        pageNo: pageNo.value,
        pageSize: 30,
        query: {},
      },
    );
    console.log(res);
    const newOpts = (res?.data ?? []).map((item) => {
      return {
        text: item.name_,
        value: item.id_,
        children: item.__CHILDREN__.map((v) => {
          return {
            text: v.version_,
            value: v.id_,
            default: v.default_,
          };
        }),
      };
    });

    // 附加的时候添加否则替换
    if (add) {
      options.value.push(...newOpts);
    } else {
      options.value = newOpts;
    }

    const { totalPage } = res;
    isCompleted.value = totalPage && pageNo.value >= totalPage;
    console.log('fsdfsdf', res);
  }

  const onMore = () => {
    loadOptions(true);
  };

  const onChange = async ({ selectedOptions }) => {
    cascaderSelectedOptions = selectedOptions;
  };

  const handleOk = async () => {
    if (!cascaderSelectedOptions) {
      showFailToast('请选择物料');
      return;
    }
    if (props.onOk && typeof props.onOk === 'function') {
      const payload =
        cascaderSelectedOptions.length === 1
          ? {
              productId: cascaderSelectedOptions[0].value,
              productName: cascaderSelectedOptions[0].text,
              versionId: undefined,
              versionName: undefined,
            }
          : {
              productId: cascaderSelectedOptions[0].value,
              productName: cascaderSelectedOptions[0].text,
              versionId: cascaderSelectedOptions[1].value,
              versionName: cascaderSelectedOptions[1].text,
            };
      props.onOk(payload);
    }
    show.value = false;
  };
</script>

<style scoped lang="less">
  .van-cascader {
    :deep(.van-cascader__tab),
    :deep(.van-cascader__tab > span) {
      max-width: 150px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
</style>
