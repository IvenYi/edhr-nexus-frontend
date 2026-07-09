<template>
  <basic-popup
    v-model:show="show"
    title="请选择在线表单"
    :popup-props="popupProps"
    :extra-style="{
      left: 'auto',
      right: 0,
      height: 'auto',
      width: '480px',
    }"
  >
    <div class="p-1px bg-white">
      <van-cascader
        :show-header="false"
        v-model="cascaderValue"
        title="请选择"
        :options="tmplCategories"
        @close="show = false"
        @change="onChange"
      >
        <template #option="{ option }">
          <div class="flex items-center w-10px flex-1">
            <span
              :style="{
                'padding-left': (option._depth_ ?? 0) * 20 + 'px',
              }"
              class="ellipsis"
            >
              {{ option.text }}
            </span>
            <van-tag class="ml-6px flex-none" v-if="option._origin_data_.default" type="primary"
              >默认</van-tag
            >
          </div>
        </template>
      </van-cascader>
    </div>

    <template #footer>
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="show = false"
          >取消</van-button
        >
        <van-button class="flex-1" type="primary" @click="handleCreate">确认</van-button>
      </div>
    </template>
  </basic-popup>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, onMounted } from 'vue';
  import { GctPopup } from '@mobile/utils/popup';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { showFailToast, showSuccessToast, closeToast, showLoadingToast } from 'vant';
  import ProducePickerPopup from '@mobile/views/edhr/_comps_/product/product-picker-popup.vue';
  import BasicPicker from '@mobile/views/edhr/_comps_/basic-popup/basic-picker.vue';
  import BasicCollapse from '@mobile/views/edhr/_comps_/basic-collapse/index.vue';
  import { getInterfaceApi } from '@gct/runtime';
  import type { CategoryCompleteVO, FormRelateDTO } from '/@/apis/gct-apaas/model/index';
  import { UserData } from '@mobile/stores/loginHooks';
  import { postOnlineFormInstanceTask } from '/@/apis/gct-apaas/OnlineFormInstanceController';
  import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';
  import { ControlStatusEnum } from '@gct/nocode-base';

  const { businessSetting } = useBusinessSetting();

  const props = defineProps<{
    popupProps: any;
    context: {
      materialNo: string;
    };
    onOk?: Function;
    onCancel?: Function;
  }>();

  const show = ref<boolean>(true);
  const cascaderValue = ref<string>();
  let cascaderOption: any = null;
  const tmplCategories = ref<any[]>([]);

  onMounted(() => {
    loadTmplCategories();
  });

  const _recurse = (list: CategoryCompleteVO[] = [], result: any[] = [], depth: number = 0) => {
    list.forEach((item) => {
      const data = {
        text: item.name,
        value: item.id,
        children: [],
        _origin_data_: item,
        _level_: 0,
        _depth_: depth,
      };
      result.push(data);
      if (item.child) {
        _recurse(item.child, result, depth + 1);
      }
    });
    return result;
  };

  const loadTmplCategories = async () => {
    const res = await getInterfaceApi.getCategoryList({
      moduleType: 'online_form_module',
    });

    tmplCategories.value = _recurse(res);
    // tmplCategories.value = (res ?? []).map((item) => {
    //   return {
    //     text: item.name,
    //     value: item.id,
    //     children: [],
    //     _origin_data_: item,
    //     _level_: 0,
    //   };
    // });
  };

  const done = () => {
    show.value = false;
  };

  const loadTmplsByCategoryId = async (id: string) => {
    const isControlled = !!businessSetting.enableDocControl;
    const res = await getInterfaceApi.getTmplsList({
      categoryId: id,
      name: undefined,
      pageNo: 1,
      pageSize: 9999,
      moduleType: 'online_form_module',
      formType: 'BASE,PROCESS,FILE',
      controlStatus: isControlled ? ControlStatusEnum.CONTROLLED : undefined,
      configured: false,
    });
    return (res?.data ?? []).map((t) => {
      return {
        text: t.name,
        value: t.id,
        children: t.children.map((v) => {
          return {
            text: v.version,
            value: v.id,
            _origin_data_: v,
            _level_: 2,
          };
        }),
        _origin_data_: t,
        _level_: 1,
      };
    });
  };

  const onChange = async ({ value, selectedOptions }) => {
    const option = selectedOptions[selectedOptions.length - 1];
    cascaderOption = option;
    if (option && option.children && option.children.length === 0) {
      showLoadingToast('加载中...');
      option.children = await loadTmplsByCategoryId(value);
      closeToast();
    }
  };

  const handleCreate = async () => {
    console.log(UserData);
    console.log(UserData.value.userId);
    try {
      if (!cascaderOption || cascaderOption._level_ === 0) {
        showFailToast('请选择表单');
        return;
      }

      const { id, baseId, name } = cascaderOption._origin_data_;
      const data: { tmplId: string; name: string } = {
        name,
      };

      if (cascaderOption._level_ === 1) {
        data.tmplId = id;
      } else if (cascaderOption._level_ === 2) {
        data.tmplId = `${baseId}:${id}`;
      }

      if (props.onOk && typeof props.onOk === 'function') {
        props.onOk(data, done);
      }
    } catch (err) {
      console.warn(err);
    }
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
