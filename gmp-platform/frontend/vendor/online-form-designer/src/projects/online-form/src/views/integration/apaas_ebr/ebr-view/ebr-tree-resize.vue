<template>
  <div ref="containerRef" class="ebr-tree-wrapper">
    <CategoryToolkit :activeKey="tabActiveKey" :menus="categoryMenus" @select="onToolkitChange" />
    <div class="ebr-tree-container">
      <div
        class="content"
        :style="{
          width: categoryModuleVisible ? leftWidth + 'px' : '0px',
          transition: 'width 0.3s',
        }"
      >
        <div class="ebr-tree-title-content">
          <div class="ebr-tree-title" :title="treeTitle">{{ treeTitle }}</div>
          <div class="ebr-action-btn">
            <i
              class="iconfont icon-caidanshouqi1 cursor-pointer"
              @click.stop="closeCategoryModuleVisible"
            ></i>
          </div>
        </div>
        <!-- 目录树 -->
        <CatalogTreeMenu
          v-if="tabActiveKey === EModuleEnum.CATALOG"
          :wikiTreeData="wikiTreeData"
          :treeSelectDocData="selectDocData"
          :taggedOutline="taggedOutline"
          @select="onSelect"
          @openInstance="changeInstanceVisible"
        />
        <EsopPreview
          v-else-if="tabActiveKey === EModuleEnum.ESOP"
          class="w-50% h-full"
          :sopList="sopList"
        />
        <!-- 生产 -->
        <ProductionList
          v-else-if="tabActiveKey === EModuleEnum.PRODUCTION"
          :productionData="productionData"
          :category="tabActiveKey"
          :subCategory="subCategory"
          :selectSelfInfo="selectSelfInfo"
          @select="onSelectCategory"
        />
        <!-- 检验列表 -->
        <InspectionList
          v-else-if="tabActiveKey === EModuleEnum.INSPECTION"
          :inspectionData="inspectionData"
          :category="tabActiveKey"
          :subCategory="subCategory"
          :selectDocData="selectDocData"
          :selectSelfInfo="selectSelfInfo"
          @select="onSelectCategory"
          @openInstance="changeInstanceVisible"
        />
        <!-- 放行列表 -->
        <ReleaseList
          v-else-if="tabActiveKey === EModuleEnum.RELEASE"
          :releaseData="releaseData"
          :category="tabActiveKey"
          :selectSelfInfo="selectSelfInfo"
          @select="onSelectCategory"
        />
        <!-- 关联列表 -->
        <LinkList
          v-else-if="tabActiveKey === EModuleEnum.LINK"
          :linkData="linkData"
          :selectDocData="selectDocData"
          :selectSelfInfo="selectSelfInfo"
          @select="onSelectCategory"
        />
      </div>

      <a-divider
        v-show="categoryModuleVisible"
        type="vertical"
        class="cursor-col-resize"
        @mousedown="leftMousedown"
      />

      <div
        class="overflow-hidden ks-column"
        :style="{
          width: instanceVisible ? rightWidth + 'px' : '0px',
          transition: 'width 0.3s',
        }"
      >
        <!-- 表单实例记录列表 -->
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
        v-show="categoryModuleVisible && instanceVisible"
        type="vertical"
        class="cursor-col-resize"
        @mousedown="rightMousedown"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="ebr-tree">
  import { ref, computed } from 'vue';
  import { FormTypeEnum } from '@gct/nocode-base';
  import { EdhrInstanceResponse, OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';

  import { UseDragByLine } from '/@/projects/page-designer/src/components/widgets/hooks/useDragLine';
  import { COLUMNS_TYPE } from '@gct/runtime';

  import CategoryToolkit from './components/category-toolkit.vue';
  import CatalogTreeMenu from './components/catalog-tree-menu.vue';
  import InspectionList from './components/biz/inspection-list.vue';
  import ProductionList from './components/biz/production-list.vue';
  import ReleaseList from './components/biz/release-list.vue';
  import LinkList from './components/biz/link-list.vue';
  import InstanceArea from './components/instance-area.vue';
  import { EModuleEnum, ESubCategoryEnum } from './enums';
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
    categoryMenus: Array<EModuleEnum>;
    /** edhr实例 */
    edhrInstance?: EdhrInstanceResponse;
    /** wiki目录树 */
    wikiTreeData: Array<IWikiTreeData>;
    /** 在线表单实例列表 */
    docInstanceList: Array<OnlineFormInstanceResponse>;
    /** 选择的表单信息 */
    selectDocData: any;
    /** 选择的实例信息 */
    selectSelfInfo: any;
    /** 关联子分类 */
    subCategory?: ESubCategoryEnum;
    inspectionData: any;
    productionData: any;
    releaseData: any;
    linkData: any;
    tabActiveKey: EModuleEnum;
    resizeWidth?: number;
    parentRef?: HTMLElement;
    judgeFormDataHasChange?: Function;
    onEditDescription?: Function;
    supportEdit?: boolean;
    showOtherMenu?: boolean;
    // 反向追溯时需要打标记的数据
    taggedOutline?: Array<string>;
    taggedInst?: Array<string>;
    /** sop集合 */
    sopList?: any[];
  }>();

  const emit = defineEmits<{
    (e: 'update:searchValue', value: any): void;
    (e: 'update:tabActiveKey', value: EModuleEnum): void;
    (e: 'update:selectSelfInfo', value?: any): void;
    (e: 'update:selectDocData', value?: any): void;
    (e: 'update:subCategory', value?: ESubCategoryEnum): void;
  }>();

  const categoryModuleVisible = ref<boolean>(true);
  const instanceVisible = ref(false);

  const leftWidth = computed(() => {
    const width = props.tabActiveKey === EModuleEnum.ESOP ? esoptStart.value : leftStart.value;
    return width < 320 ? 320 : width;
  });
  const rightWidth = computed(() => (rightStart.value < 240 ? 240 : rightStart.value));

  const treeTitle = computed(() => {
    return $t('sys.edhr.ebr.category.' + props.tabActiveKey);
  });

  const leftMousedown = (e) => {
    /** esop拖拽分开 */
    if (props.tabActiveKey === EModuleEnum.ESOP) {
      esopLeftMoveDomDown(e, props.parentRef);
    } else {
      leftMoveDomDown(e, props.parentRef);
    }
  };
  const rightMousedown = (e) => rightMoveDomDown(e, props.parentRef);

  function onToolkitChange(what: EModuleEnum) {
    if (what === props.tabActiveKey && categoryModuleVisible.value) {
      return;
    } else {
      emit('update:tabActiveKey', what);
      categoryModuleVisible.value = true;
      instanceVisible.value = false;
    }
  }

  const closeCategoryModuleVisible = () => {
    categoryModuleVisible.value = false;
    instanceVisible.value = false;
  };

  const changeInstanceVisible = (data) => {
    if (props.selectDocData?.id === data.id) {
      instanceVisible.value = !instanceVisible.value;
      return;
    }
    onSelect(data);
  };

  function onSearchInstance(value) {
    emit('update:searchValue', value);
  }

  function onSelect(data) {
    if (props.selectDocData?.id === data.id) return;

    if (props.judgeFormDataHasChange && typeof props.judgeFormDataHasChange === 'function') {
      /**
       * !judgeFormDataHasChange 默认始终会执行callback*/
      props.judgeFormDataHasChange(() => {
        emit('update:selectDocData', data);
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

  async function onSelectCategory(data, subCategory?) {
    emit('update:subCategory', subCategory);
    if (
      (subCategory === ESubCategoryEnum.INSPECTION_FORM && props.selectDocData?.id === data.id) ||
      (subCategory !== ESubCategoryEnum.INSPECTION_FORM && props.selectSelfInfo?.id === data.id)
    ) {
      return;
    }

    if (props.judgeFormDataHasChange && typeof props.judgeFormDataHasChange === 'function') {
      props.judgeFormDataHasChange(() => {
        if (subCategory === ESubCategoryEnum.INSPECTION_FORM) {
          emit('update:selectDocData', data);
          emit('update:selectSelfInfo', null);
          if (
            instanceVisible.value &&
            ![FormTypeEnum.BASE, FormTypeEnum.PROCESS, FormTypeEnum.FILE].includes(data.formType)
          ) {
            instanceVisible.value = false;
          }
        } else {
          emit('update:selectSelfInfo', data);
          emit('update:selectDocData', null);
          instanceVisible.value = false;
        }
      });
    }
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
    background-color: #fff;
    display: flex;
    .ebr-tree-container {
      position: relative;
      color: rgba(0, 0, 0, 0.6);
      height: auto;
      display: block;
      background: #fff;
      display: flex;
      flex-shrink: 0;
      min-height: 200px;
      height: 100%;
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
