<template>
  <basic-popup
    v-model:show="show"
    :popup-props="popupProps"
    title="不良原因"
    :extra-style="{
      left: 'auto',
      right: 0,
      height: 'auto',
    }"
  >
    <div class="p-1px bg-white">
      <van-cascader
        :show-header="false"
        v-model="cascaderValue"
        title="请选择"
        :options="options"
        @close="show = false"
        @change="onChange"
      />
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
  import { postModelDataQueryRefData } from '/@/apis/gct-apaas/ModelDataController';
  import { closeToast, showLoadingToast, showFailToast } from 'vant';
  import { postModelComprehensiveQueryRefChainDataByModelCategory } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';

  interface INgItem {
    not_good_group_id_?: string;
    not_good_group_name_?: string;
    not_good_reason_id_?: string;
    not_good_reason_name_?: string;
  }

  const props = defineProps<{
    popupProps: any;
    context: any;
    onOk?: Function;
    onCancel?: Function;
  }>();

  const show = ref<boolean>(true);
  const cascaderValue = ref<string>();
  const options = ref<any[]>([]);

  onMounted(() => {
    loadGroups();
  });

  /**
   * 加载不良分类
   */
  async function loadGroups() {
    const res = await postModelDataQueryRefData({
      exp: '',
      query: {},
      modelKey: 'em_not_good_entry',
      fieldKey: 'not_good_group_id_',
      pageSize: 999,
      pageNo: 1,
      includeDeleted: false,
      refModelKey: 'em_not_good_group',
    });
    console.log(res);
    options.value = (res?.data ?? []).map((item) => {
      return {
        key: item.id_,
        text: item.__LABEL__,
        value: item.id_,
        children: [],
      };
    });
  }

  /**
   * 加载不良原因
   */
  async function loadReasons(groupId: string) {
    const res = await postModelComprehensiveQueryRefChainDataByModelCategory(
      {
        modelCategory: 'entity',
      },
      {
        dataIds: groupId,
        modelKey: 'em_not_good_entry',
        fieldKey: 'not_good_reason_id_',
        refModelChain: [
          {
            id_: 'em_not_good_group$entries_',
            modelKey: 'em_not_good_group',
            modelCategory: 'entity',
            fieldKey: 'entries_',
            direction: 'forward',
          },
          {
            id_: 'em_not_good_group_entry$not_good_reason_id_',
            modelKey: 'em_not_good_group_entry',
            modelCategory: 'entity',
            fieldKey: 'not_good_reason_id_',
            direction: 'forward',
          },
          {
            modelKey: 'em_not_good_reason',
            direction: 'forward',
            fieldKey: 'id_',
            modelCategory: 'entity',
          },
        ],
        pageSize: 9999,
        pageNo: 1,
      },
    );
    return (res?.data ?? []).map((item) => {
      return {
        key: item.id_,
        text: item.name_,
        value: `${groupId}.${item.id_}`,
      };
    });
  }

  const onChange = async ({ value }) => {
    const option = options.value.find((item) => item.value === value);
    if (option && option.children && option.children.length === 0) {
      showLoadingToast('加载中...');
      option.children = await loadReasons(value);
      closeToast();
    }
  };

  const handleOk = async () => {
    if (!cascaderValue.value) {
      showFailToast('请选择不良分类');
      return;
    }

    const ids = cascaderValue.value.split('.');

    if (ids.length === 1) {
      showFailToast('请选择不良原因');
      return;
    }

    if (props.onOk && typeof props.onOk === 'function') {
      const ngFormData: INgItem = {};
      const groupOption = options.value.find((item) => item.key === ids[0]);
      if (ids.length === 1) {
        ngFormData.not_good_group_id_ = groupOption.key;
        ngFormData.not_good_group_name_ = groupOption.text;
        ngFormData.not_good_reason_id_ = undefined;
        ngFormData.not_good_reason_name_ = undefined;
      } else if (ids.length === 2) {
        ngFormData.not_good_group_id_ = groupOption.key;
        ngFormData.not_good_group_name_ = groupOption.text;
        const reasonOption = groupOption.children.find((item) => item.key === ids[1]);
        ngFormData.not_good_reason_id_ = reasonOption.key;
        ngFormData.not_good_reason_name_ = reasonOption.text;
      }

      props.onOk(ngFormData);
    }
    show.value = false;
  };
</script>

<style scoped lang="less"></style>
