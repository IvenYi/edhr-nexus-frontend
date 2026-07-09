<template>
  <div ref="containerRef" class="ebr-tree-wrapper">
    <TreeToolkit :treeVisible="treeVisible" :menus="menus" @open="onToolkitOpen" />

    <div
      class="ebr-tree-container"
      :style="{ width: treeVisible ? leftWidth + 'px' : '0px', transition: 'width 0.3s' }"
    >
      <div class="content">
        <div class="ebr-tree-title-content">
          <div class="ebr-tree-title" :title="treeTitle">{{ treeTitle }}</div>
          <div class="ebr-action-btn">
            <i
              v-if="tabActiveKey === '2'"
              class="iconfont icon-caidanshouqi1 cursor-pointer"
              @click.stop="closeTreeVisible"
            ></i>
            <close-outlined v-else class="iconfont cursor-pointer" @click.stop="onClose" />
          </div>
        </div>

        <TreeMenu
          v-if="tabActiveKey === '2'"
          :wikiTreeData="wikiTreeData"
          :treeSelectDocData="treeSelectDocData"
          :taggedOutline="taggedOutline"
          @select="onSelect"
          @openInstance="changeInstanceVisible"
        />
        <EsopPreview v-else-if="tabActiveKey === '7'" class="w-50% h-full" :sopList="sopList" />
        <OtherList
          v-else
          :tabActiveKey="tabActiveKey"
          :releaseList="releaseList"
          :appendixList="appendixList"
          :transactionList="transactionList"
          :reworkList="reworkList"
          :linkList="linkList"
          :selectedId="otherInfoId"
          @update:search="(val) => (otherSearchVal = val)"
          @select="onSelectFormItem"
        />
      </div>

      <FooterTabs
        v-show="treeVisible && props.tabActiveKey !== '7'"
        :active="tabActiveKey"
        :menus="menus"
        @change="handleChangeContentTab"
      />
    </div>
    <a-divider
      v-show="treeVisible"
      type="vertical"
      class="cursor-col-resize"
      @mousedown="leftMousedown"
    />

    <div
      class="overflow-hidden ks-column"
      :style="{
        width: treeVisible && instanceVisible ? rightWidth + 'px' : '0px',
        transition: 'width 0.3s',
      }"
    >
      <InstanceArea
        :docInstanceList="docInstanceList"
        :selectedId="selectSelfInfo?.id"
        :supportEdit="supportEdit"
        :taggedInst="taggedInst"
        @update:selected="onSelectInstanceItem"
        @toggleVisible="(val) => (instanceVisible = val)"
        @edit="onEditDescription"
        @search="onSearchInstance"
      >
        <template #create-instance>
          <slot name="create-instance"></slot>
        </template>
      </InstanceArea>
    </div>
    <a-divider
      v-show="treeVisible && instanceVisible"
      type="vertical"
      class="cursor-col-resize"
      @mousedown="rightMousedown"
    />
  </div>
</template>

<script setup lang="ts" name="ebr-tree">
  import { ref, computed } from 'vue';
  import { FormTypeEnum } from '@gct/nocode-base';
  import { EdhrInstanceResponse, OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';

  import { UseDragByLine } from '/@/projects/page-designer/src/components/widgets/hooks/useDragLine';
  import { COLUMNS_TYPE } from '@gct/runtime';

  import TreeToolkit from './components/tree-toolkit.vue';
  import TreeMenu from './components/tree-menu.vue';
  import OtherList from './components/other-list.vue';
  import InstanceArea from './components/instance-area.vue';
  import FooterTabs from './components/footer-tabs.vue';
  import { TreeToolKitType } from './components/types';

  import type { IWikiTreeData } from '@gct/nocode-base';
  import EsopPreview from '/@online-form/components/esop/esop-preview.vue';

  const { start: leftStart, moveDomDown: leftMoveDomDown } = UseDragByLine(320, COLUMNS_TYPE.LEFT);
  const { start: esoptStart, moveDomDown: esopLeftMoveDomDown } = UseDragByLine(
    window.innerWidth / 2,
    COLUMNS_TYPE.LEFT,
  );
  const { start: rightStart, moveDomDown: rightMoveDomDown } = UseDragByLine(
    240,
    COLUMNS_TYPE.LEFT,
  );

  const props = defineProps<{
    /** edhr实例 */
    edhrInstance?: EdhrInstanceResponse;
    /** wiki目录树 */
    wikiTreeData: Array<IWikiTreeData>;
    /** 在线表单实例列表 */
    docInstanceList: Array<OnlineFormInstanceResponse>;
    /** 选择的表单信息 */
    treeSelectDocData: any;
    /** 选择的实例信息 */
    selectSelfInfo: any;
    tabActiveKey: string;
    /** 放行单列表 */
    releaseList: any;
    /** eDHR附录 */
    appendixList: any;
    /** 事务列表 */
    transactionList: any;
    /** 返工列表 */
    reworkList: any;
    /** 关联列表 */
    linkList: any;
    /** 选择的放行单实例信息 */
    selectReleaseInfo: any;
    /** 选择的附录实例信息 */
    selectAppendixInfo: any;
    /** 选择的事务实例信息 */
    selectTransactionInfo: any;
    /** 选择的返工实例信息 */
    selectReworkInfo: any;
    /** 选择的关联实例信息 */
    selectLinkInfo: any;
    resizeWidth?: number;
    parentRef?: HTMLElement;
    judgeFormDataHasChange?: Function;
    onEditDescription?: Function;
    supportEdit?: boolean;
    showOtherMenu?: boolean;
    defaultShowCatalogue?: boolean;
    // 反向追溯时需要打标记的数据
    taggedOutline?: Array<string>;
    taggedInst?: Array<string>;
    /** sop集合 */
    sopList?: any[];
  }>();

  const emit = defineEmits<{
    (e: 'update:searchValue', value: any): void;
    (e: 'update:tabActiveKey', value: any): void;
    (e: 'update:treeSelectDocData', value?: any): void;
    (e: 'update:selectSelfInfo', value?: any): void;
    (e: 'update:selectReleaseInfo', value?: any): void;
    (e: 'update:selectAppendixInfo', value?: any): void;
    (e: 'update:selectTransactionInfo', value?: any): void;
    (e: 'update:selectReworkInfo', value?: any): void;
    (e: 'update:selectLinkInfo', value?: any): void;
  }>();

  const containerRef = ref();
  const treeVisible = ref<boolean>(props.defaultShowCatalogue);
  const instanceVisible = ref(false);
  const otherSearchVal = ref();

  const leftWidth = computed(() => {
    const width = props.tabActiveKey === '7' ? esoptStart.value : leftStart.value;
    return width < 280 ? 280 : width;
  });
  const rightWidth = computed(() => (rightStart.value < 240 ? 240 : rightStart.value));

  const treeTitle = computed(() => {
    if (props.tabActiveKey === '2') return props.edhrInstance?.tmplName || $t('sys.edhr.catalog');
    if (props.tabActiveKey === '1') return $t('sys.edhr.releaseTemplate');
    if (props.tabActiveKey === '3') return 'DHR附录';
    if (props.tabActiveKey === '4') return $t('sys.edhr.materialStatus.TXN');
    if (props.tabActiveKey === '5') return $t('sys.edhr.materialStatus.REWORK');
    if (props.tabActiveKey === '6') return $t('sys.edhr.materialStatus.LOT_SN_APPEND');
    if (props.tabActiveKey === '7') return 'ESOP面板';
    return '';
  });

  const menus = computed(() => {
    if (props.showOtherMenu) {
      const arr = ['1', '3', '4', '5', '6'];
      if (props.sopList?.length) {
        arr.push('7');
      }
      return arr;
    }
    return ['1'];
  });

  const otherInfoId = computed(() => {
    if (props.tabActiveKey === '1') return props.selectReleaseInfo?.id;
    if (props.tabActiveKey === '3') return props.selectAppendixInfo?.id;
    if (props.tabActiveKey === '4') return props.selectTransactionInfo?.id;
    if (props.tabActiveKey === '5') return props.selectReworkInfo?.id;
    if (props.tabActiveKey === '6') return props.selectLinkInfo?.id;
    return '';
  });

  const leftMousedown = (e) => {
    /** esop拖拽分开 */
    if (props.tabActiveKey === '7') {
      esopLeftMoveDomDown(e, props.parentRef);
    } else {
      leftMoveDomDown(e, props.parentRef);
    }
  };
  const rightMousedown = (e) => rightMoveDomDown(e, props.parentRef);

  function onToolkitOpen(what: TreeToolKitType) {
    treeVisible.value = true;
    if (what === 'appendix') handleChangeContentTab('3');
    else if (what === 'release') handleChangeContentTab('1');
    else if (what === 'txn') handleChangeContentTab('4');
    else if (what === 'rework') handleChangeContentTab('5');
    else if (what === 'link') handleChangeContentTab('6');
    else if (what === 'sop') handleChangeContentTab('7');
  }

  function handleChangeContentTab(key) {
    if (props.judgeFormDataHasChange && typeof props.judgeFormDataHasChange === 'function') {
      props.judgeFormDataHasChange(() => {
        otherSearchVal.value = '';
        if (props.tabActiveKey === key) {
          emit('update:tabActiveKey', '2');
        } else {
          emit('update:tabActiveKey', key);
          instanceVisible.value = false;
        }
      });
    }
  }

  const closeTreeVisible = () => {
    treeVisible.value = false;
    instanceVisible.value = false;
  };

  /** 关闭操作处理 */
  function onClose() {
    if (props.tabActiveKey === '7') {
      closeTreeVisible();
      emit('update:tabActiveKey', '2');
    } else {
      handleChangeContentTab('2');
    }
  }

  const changeInstanceVisible = (data) => {
    if (props.treeSelectDocData?.id === data.id) {
      instanceVisible.value = !instanceVisible.value;
      return;
    }
    onSelect(data);
  };

  function onSearchInstance(value) {
    emit('update:searchValue', value);
  }

  function onSelect(data) {
    if (props.treeSelectDocData?.id === data.id) return;
    if (props.judgeFormDataHasChange && typeof props.judgeFormDataHasChange === 'function') {
      props.judgeFormDataHasChange(() => {
        emit('update:treeSelectDocData', data);
        emit('update:selectSelfInfo', null);

        if (
          instanceVisible.value &&
          ![FormTypeEnum.BASE, FormTypeEnum.PROCESS, FormTypeEnum.FILE].includes(data.formType)
        ) {
          instanceVisible.value = false;
        }
      });
    }
  }

  function onSelectFormItem(data) {
    if (props.tabActiveKey === '1') emit('update:selectReleaseInfo', data);
    else if (props.tabActiveKey === '3') emit('update:selectAppendixInfo', data);
    else if (props.tabActiveKey === '4') emit('update:selectTransactionInfo', data);
    else if (props.tabActiveKey === '5') emit('update:selectReworkInfo', data);
    else if (props.tabActiveKey === '6') emit('update:selectLinkInfo', data);
  }

  async function onSelectInstanceItem(data) {
    if (props.selectSelfInfo?.id === data.id) {
      return;
    }

    if (props.judgeFormDataHasChange && typeof props.judgeFormDataHasChange === 'function') {
      props.judgeFormDataHasChange(() => {
        emit('update:selectSelfInfo', data);
      });
    }
  }
</script>
<style scoped lang="less">
  .ebr-tree-wrapper {
    position: relative;
    display: flex;
    background-color: #fff;
    .ebr-tree-container {
      position: relative;
      color: rgba(0, 0, 0, 0.6);
      height: auto;
      display: block;
      background: #fff;
      display: flex;
      flex-shrink: 0;
      flex-direction: column;
      min-height: 200px;
      z-index: 1;

      .content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        .ebr-tree-title-content {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;

          &::after {
            content: '';
            position: absolute;
            background-color: #e0e3eb;
            height: 1px;
            bottom: 0;
            left: 0;
            right: 0;
          }

          .ebr-tree-title {
            color: #1a1d23;
            font-size: 16px;
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin-right: 4px;
            line-height: 24px;
            cursor: default;
          }

          .ebr-action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            .iconfont {
              display: flex;
              align-items: center;
              justify-content: center;
              line-height: 1;
              color: #888;
              width: 16px;
              height: 16px;
            }
          }
        }
      }
    }

    .cursor-col-resize {
      border-color: #eaedf1;
      height: 100%;
      margin: 0 0 0 1px;
      &:hover {
        border-color: var(--ant-primary-color) !important;
      }
    }
  }
</style>
