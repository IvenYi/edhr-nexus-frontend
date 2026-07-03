<template>
  <div class="h100% overflow-y-auto pt16px px16px">
    <scroll-list :pageSize="10" class="h-full" :loader="getFormList" ref="scrollListRef">
      <template #default="{ list }">
        <CardItem
          v-for="i in list"
          :key="i.id"
          :row="i"
          class="mb8px"
          :buttonGroup="getButtonGroup(i)"
        />
      </template>
      <template #empty>
        <div class="h100% ks-row-center-middle">
          <div class="text-center font-500 text-18px gct-color-text-1">
            <img :src="EmptyImage" alt="" class="w270px" />
            <div>暂无数据</div>
          </div>
        </div>
      </template>
    </scroll-list>
  </div>
</template>

<script setup lang="ts">
  import ScrollList from '@mobile/views/edhr/_comps_/scroll-list/index.vue';
  import CardItem from './card-item.vue';
  import { FillingTypeEnum } from '@gct/nocode-base';
  import EmptyImage from '@mobile/assets/svg/edhr/pic_scan.svg';
  import {
    postOnlineFormInstanceTaskPageList,
    deleteOnlineFormInstanceTaskRemoveByOfInstId,
  } from '/@/apis/gct-apaas/OnlineFormInstanceController';
  import { MobileSingleFormFillModal, openFormInfoPopup } from '@gct/nocode-mobile-render';
  import { GctPopup } from '@mobile/utils/popup';
  import CreateFrom from './create-form.vue';
  import { GctDialog } from '@mobile/utils/dialog';
  import { showToast, showConfirmDialog } from 'vant';
  // 查询类型(我的单据填报:UNFILLED,我创建的:CREATED ,我已填单据:COMPLETED)
  const props = withDefaults(
    defineProps<{
      fillingType: FillingTypeEnum;
    }>(),
    {},
  );

  const scrollListRef = ref();
  async function getFormList({ pageNo, pageSize }) {
    return postOnlineFormInstanceTaskPageList(
      {
        type: props.fillingType,
      },
      {
        pageNo,
        pageSize,
      },
    );
  }
  watch(
    () => props.fillingType,
    () => {
      if (scrollListRef.value && scrollListRef.value.onSearch) {
        scrollListRef.value.onSearch();
      }
    },
  );

  const buttonGroupMap = {
    [FillingTypeEnum.UNFILLED]: (row: any) => [
      {
        text: '填报',
        callback() {
          onFill(false, row);
        },
      },
      {
        text: '详情',
        callback() {
          onFill(true, row);
        },
      },
      {
        text: '查看更多',
        callback() {
          openFormInfoPopup(row);
        },
      },
    ],
    [FillingTypeEnum.CREATED]: (row: any) => [
      {
        text: '编辑',
        disabled: row.instanceStatus !== 'UNFILLED',
        callback() {
          const { id, operatorRange, relatedMaterialNos, title, tmplId, tmplName } = row;
          GctDialog.open(CreateFrom, {
            editForm: {
              ofInstId: id,
              operatorRange,
              relatedMaterialNos,
              title,
              tmplId,
              tmplName,
            },
            onOk: async () => {
              showToast('编辑成功');
              scrollListRef.value.onSearch();
            },
          });
        },
      },
      {
        text: '详情',
        type: 'default',
        callback() {
          onFill(true, row);
        },
      },
      {
        text: '查看更多',
        callback() {
          openFormInfoPopup(row);
        },
      },
      {
        text: '删除',
        color: 'red',
        disabled: row.instanceStatus !== 'UNFILLED',
        async callback() {
          await showConfirmDialog({
            title: '提示',
            message: '你确定要删除吗?',
          });
          await deleteOnlineFormInstanceTaskRemoveByOfInstId({ ofInstId: row.id });
          showToast('删除成功');
          scrollListRef.value.onSearch();
        },
      },
    ],
    [FillingTypeEnum.COMPLETED]: (row: any) => [
      {
        text: '详情',
        type: 'default',
        callback() {
          onFill(true, row);
        },
      },
      {
        text: '查看更多',
        callback() {
          openFormInfoPopup(row);
        },
      },
    ],
  };

  function getButtonGroup(row: any) {
    return buttonGroupMap[props.fillingType](row);
  }

  function onFill(isViewPage = false, row) {
    GctPopup.open(MobileSingleFormFillModal, {
      popupProps: {
        position: 'center',
      },
      context: {
        selfId: row.id,
        isViewPage,
        needAutoSave: false,
        keep: false,
      },
      onOk: async () => {
        isViewPage || scrollListRef.value.onSearch();
      },
    });
  }
  defineExpose({
    onSearch() {
      scrollListRef.value.onSearch();
    },
  });
</script>
<style scoped lang="less"></style>
