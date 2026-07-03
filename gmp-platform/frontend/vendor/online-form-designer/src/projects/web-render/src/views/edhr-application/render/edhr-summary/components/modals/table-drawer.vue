<template>
  <div
    class="table-drawer ks-row"
    :style="{
      '--drawer-width': currentBtn?.key && width ? width + 'px' : 0,
    }"
  >
    <div
      class="btn-wrap"
      :style="{
        backgroundColor: currentBtn?.key ? '#F2F5F8' : '#fff',
      }"
    >
      <div
        v-for="btn in fixedBtns"
        :key="btn.key"
        class="btn-item"
        :class="[currentBtn.key === btn.key && 'selected', !currentBtn.key && 'hover']"
        @click="onClick(btn)"
      >
        <div class="icon-wrap">
          <i class="iconfont" :class="btn.icon"></i>
        </div>
        <div class="title">{{ btn.name }}</div>
      </div>
    </div>
    <div ref="contentRef" v-if="currentBtn?.key" class="ks-col content ks-column">
      <div class="header h56px p16px ks-row-middle">
        <div class="ks-col ell">{{ currentBtn?.name }}</div>
        <close-outlined class="cursor-pointer" @click="onClose" />
      </div>
      <div v-if="currentBtn.key" class="table-wrap p16px ks-col">
        <a-form v-show="currentBtn.key === Fixed_Btns_Keys.Records" layout="inline" noStyle>
          <a-form-item :label="$t('sys.edhr.notebookName')">
            <NoteBookSelect
              v-model:value="recordId"
              v-model:selectInfo="recordInfo"
              :placeholder="$t('sys.chooseText')"
              @clear="() => (recordDesc = undefined)"
              style="width: 240px"
            />
          </a-form-item>
          <a-form-item :label="$t('sys.onlineForm.formRemarkName')" v-if="recordId">
            <a-input
              v-model:value="recordDesc"
              :placeholder="$t('sys.inputText')"
              style="width: 240px"
            />
          </a-form-item>
          <a-form-item>
            <a-button
              type="primary"
              @click="getRecordsFormInstData({ notebookId: recordId, title: recordDesc })"
            >
              {{ $t('sys.query') }}
            </a-button>
          </a-form-item>
        </a-form>
        <DragableTable
          :key="currentBtn.key"
          :tableClass="currentBtn.key"
          v-model:data="tableData"
          :columns="columns"
          :height="calculateHeight"
          :width="width ? width - 32 : width"
          :type="currentBtn.key"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue';
  import DragableTable from '../dragableTable/index.vue';
  import { useEdhrSummary } from '../../hook/useEdhrSummary';
  import { Fixed_Btns, Fixed_Btns_Keys } from '../constant';
  import NoteBookSelect from '../../../../components/note-book-select/note-book-select.vue';

  const props = defineProps<{
    parent?: HTMLElement;
  }>();

  const {
    edhrInfo,
    txnFormInstData,
    appendixFormInstData,
    deleteFormInstData,
    recordsFormInstData,
    relateEdhrInstData,
    getRecordsFormInstData,
    reworkFormInstData,
  } = useEdhrSummary();

  const dataMap: Record<Fixed_Btns_Keys, any> = {
    [Fixed_Btns_Keys.Appendix]: appendixFormInstData,
    [Fixed_Btns_Keys.Txn]: txnFormInstData,
    [Fixed_Btns_Keys.Records]: recordsFormInstData,
    [Fixed_Btns_Keys.Rework]: reworkFormInstData,
    [Fixed_Btns_Keys.Relate]: relateEdhrInstData,
    [Fixed_Btns_Keys.Deleted]: deleteFormInstData,
  };

  const recordId = ref<string>();
  const recordDesc = ref<string>();
  const recordInfo = ref<any>();
  const currentBtn = ref<any>({});
  const width = ref(0);
  const contentRef = ref();

  const fixedBtns = computed(() => {
    return Fixed_Btns.filter((e) => {
      return (
        edhrInfo.value.createBy !== 'manual' ||
        (e.key !== Fixed_Btns_Keys.Txn && e.key !== Fixed_Btns_Keys.Rework)
      );
    });
  });

  const tableData = computed(() => {
    return currentBtn.value.key ? dataMap[currentBtn.value.key].value : [];
  });

  const columns = computed(() => {
    return currentBtn.value.key ? currentBtn.value.columns : [];
  });

  const calculateHeight = computed(() => {
    const h = contentRef.value?.clientHeight;
    return h - 56 - 16 * 2 - 39 - (currentBtn.value.key === Fixed_Btns_Keys.Records ? 32 : 0);
  });

  const onClick = (item) => {
    currentBtn.value = item;
    if (!width.value && props.parent) {
      width.value = props.parent?.clientWidth - 60 || 0;
    }
  };

  const onClose = () => {
    width.value = 0;
    currentBtn.value = {};
  };
</script>
<style lang="less" scoped>
  .table-drawer {
    position: fixed;
    width: var(--drawer-width);
    height: 100%;
    top: 0;
    right: 0;
    z-index: 72;
    transition: width 0.3s ease;

    .btn-wrap {
      width: 60px;
      border-radius: 8px 0 0 8px;
      height: fit-content;
      // margin-top: 80px;
      z-index: 1;
      box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.08);
      position: absolute;
      left: -60px;
      top: 160px;

      .btn-item {
        width: 100%;
        height: 76px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: relative;

        &::before {
          content: ' ';
          display: block;
          width: 52px;
          height: 68px;
          position: absolute;
          border-radius: 4px;
        }
        &.hover:hover {
          &::before {
            background-color: #f2f5f8;
          }
        }

        &::after {
          content: ' ';
          display: block;
          height: 1px;
          width: 44px;
          background-color: #e8ebf0;
          position: absolute;
          bottom: 0;
        }
        &:last-child {
          &::after {
            display: none;
          }
        }

        &.selected {
          background-color: #fff;
          color: var(--ant-primary-color) !important;
          border-radius: 8px 0 0 8px;
          .icon-wrap,
          .title {
            color: var(--ant-primary-color) !important;
          }
        }

        .icon-wrap {
          color: #767b87;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
          .iconfont {
            font-size: 24px;
          }
        }

        .title {
          text-align: center;
          font-size: 12px;
          color: #5a5f6b;
          z-index: 1;
        }
      }
    }

    .content {
      background-color: #fff;
      box-shadow: -4px 0px 24px 0px rgba(0, 0, 0, 0.16);

      .header {
        border-bottom: 1px solid #e0e3eb;
      }
    }
  }

  :deep(.ant-form .ant-form-item) {
    margin-bottom: 0;
  }
</style>
