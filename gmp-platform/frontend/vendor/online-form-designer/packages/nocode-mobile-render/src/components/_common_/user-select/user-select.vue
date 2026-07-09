<template>
  <van-field
    :label="label"
    :class="['user-select']"
    @click-input="openPopup"
    :rules="[
      {
        required: true,
        message: t('sys.chooseTextTip', { name: t('sys.pageDesigner.user') }),
      },
    ]"
    :modelValue="props.value"
  >
    <template #input>
      <div class="w-full flex justify-end items-center text-right">
        {{ labelValue }}
        <van-icon
          v-if="props.value"
          class="ml-2"
          name="clear"
          size="20"
          color="#c8c9cc"
          @click.stop="onClear"
        />
      </div>
    </template>
  </van-field>
</template>

<script lang="ts" setup name="user-select">
  import { i18n } from '@mobile/locales/setupI18n';
  import { createListPopup } from '/@page-designer/components/widgets/mobile/__components__/listPopup';
  import {
    getDesignerCommonGetVisibleOrg,
    getDesignerCommonGetVisibleOrgUser,
    getDesignerCommonListUserByIds,
  } from '@mobile/apis/gct-apaas/DesignerCommonController';
  import { transformUrl } from '@mobile/stores/useFile';
  import { computed, onBeforeMount, ref, watch } from 'vue';
  import { MOBILE_MINIO_PATH } from '@mobile/utils/const';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      /** 多选的时候值是用,分隔的字符串 */
      value?: string;
      label?: string;
      multiple: boolean;
    }>(),
    {
      label: '用户',
      multiple: false,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: string | undefined): void;
  }>();

  const onClear = () => {
    emit('update:value', '');
  };

  const selectedIds = computed<any>({
    get() {
      let value = props.value;
      if (!value) {
        return [];
      }
      return props.multiple ? value.split(',').filter((i) => i) : [value];
    },
    set(value?: string[] | string) {
      if (!value) {
        emit('update:value', undefined);
      }
      emit('update:value', props.multiple ? (value as string[])!.join(',') : (value as string));
    },
  });

  const labelValue = computed({
    get() {
      return checkeOpts.value
        .filter((i) => selectedIds.value.includes(i.value))
        .map((i) => i.label)
        .join(',');
    },
    set(v) {
      if (v === undefined) {
        emit('update:value', undefined);
      }
    },
  });

  const rootOrgIds = ref<string[]>([]);

  const getRootOrgIds = async () => {
    const allOrgs = (await getDesignerCommonGetVisibleOrg()) ?? [];
    rootOrgIds.value = allOrgs.filter((i) => i.parentId === 'ROOT').map((i) => i.id!);
  };

  const userOptions = ref<any[]>([]);
  const checkeOpts = ref<any[]>([]);

  /**下拉框异步请求统一入口 */
  const searchVal = ref<string>();
  async function getOptionsByquery(
    params: {
      keyword?: string;
      pageNo?: number;
    } = {},
  ) {
    console.log('getOptionsByquery', params);
    const { keyword, pageNo } = params;
    if (searchVal.value !== keyword) {
      userOptions.value = [];
    }
    searchVal.value = keyword;
    const res = await getDesignerCommonGetVisibleOrgUser({
      orgIds: rootOrgIds.value.join(','),
      keyword,
      pageNo,
      pageSize: 30,
    });
    if (!res) {
      return;
    }
    const valueList = res.data!;
    const finished = res.totalPage === pageNo;
    valueList.forEach((i: any) => {
      if (!userOptions.value.find((j) => j.value === i.id)) {
        userOptions.value.push({
          value: i.id,
          label: i.__LABEL__,
          showTitle: `<div class="flex items-center">
          <img fit="cover" class="mr-12px" style="width: 34px; height: 34px" round src="${MOBILE_MINIO_PATH.value + i.avatar}" />
          <div>
          <div>${i.__LABEL__}</div>
          <div class="text-[#8F8F8F] text-[12px] mt2px">${i.masterOrgName}</div>
          </div>
          </div>`,
        });
      }
    });
    return finished;
  }

  const { openListPopup } = createListPopup({
    api: getOptionsByquery,
    options: userOptions,
    title: '请选择',
    optionLabelProp: 'showTitle',
    remote: true,
    lazy: true,
    showSearch: true,
    multiple: props.multiple,
    selectedOptions: checkeOpts,
  })!;

  const openPopup = () => {
    openListPopup({
      ids: props.multiple ? selectedIds.value : selectedIds.value[0],
      callback({ a, checkOptions }) {
        console.log('popup close', a, checkOptions);
        selectedIds.value = a;
        checkeOpts.value = [...checkOptions];
      },
    });
  };

  onBeforeMount(() => {
    getRootOrgIds();
  });

  watch(
    () => selectedIds.value,
    async (val) => {
      const opts = [...userOptions.value, ...checkeOpts.value];
      const ids = val;
      if (ids.length && ids.some((e) => !opts.find((f) => f.value === e))) {
        await getUserDataByIds(ids);
      }
    },
    { immediate: true },
  );

  async function getUserDataByIds(ids) {
    const res = await getDesignerCommonListUserByIds({ ids: ids.join(',') });
    const data = (res || []).map((i) => {
      return { label: i.__LABEL__!, value: i.id!, _item: i };
    });
    checkeOpts.value = data;
    return data;
  }
</script>

<style lang="less" scoped>
  .user-select {
  }
</style>
