<template>
  <van-list
    v-model:error="error"
    :finished="finished"
    :offset="10"
    @load="onload"
    :immediate-check="false"
    :loading="loading"
  >
    <!-- 用于单选时的容器 -->
    <van-radio-group v-if="datasource.length" v-model="radioRowId" shape="dot" @change="radioEvent">
      <div
        v-for="(item, idx) in datasource"
        :key="item.id_"
        class="gct-card-list"
        :style="styleWrap"
        @click="cellClickEvent(item)"
      >
        <div
          :class="{
            'gct-card-item': true,
            'gct-card-item-is-selected': radioRowId === item.id_ || checkboxData[item.id_],
          }"
        >
          <div class="gct-card-selection" v-if="rowSelection">
            <van-radio
              @click.stop
              v-if="rowSelectionType === selectionTypeEnums.SingleChoice"
              :name="item.id_"
              icon-size="16px"
            />
            <van-checkbox
              v-else-if="rowSelectionType === selectionTypeEnums.MultipleChoice"
              v-model="checkboxData[item.id_]"
              icon-size="16px"
              shape="square"
              @click.stop="checkboxEvent"
            />
          </div>
          <div class="gct-card-content">
            <div v-if="showTitle" class="gct-card-header">
              <van-row :gutter="10">
                <van-col
                  span="12"
                  class="gct-card-header-left header-item"
                  :style="headerStyleAttr"
                >
                  <CardLeftRender>
                    <slot :formState="item" :children="children[0].children"></slot>
                  </CardLeftRender>
                </van-col>
                <van-col
                  span="12"
                  class="textR gct-card-header-right header-item"
                  :style="headerStyleAttr"
                >
                  <van-form
                    :label-align="props.widget.props.layout?.label"
                    :input-align="props.widget.props.layout?.inputAlign"
                    :label-width="labelLayout.width"
                    required="auto"
                    style="height: 100%"
                  >
                    <slot :formState="item" :children="children[1].children"></slot>
                  </van-form>
                </van-col>
              </van-row>
            </div>
            <div class="gct-card-main" :style="styleAttr">
              <van-form
                :key="item.id_"
                :label-align="props.widget.props.layout?.label"
                :input-align="props.widget.props.layout?.inputAlign"
                :label-width="labelLayout.width"
                required="auto"
                style="height: 100%; min-height: inherit"
                ref="refForms"
              >
                <fieldWidget
                  v-for="(i, index) in fieldWidgets"
                  :widget="i"
                  :index="index"
                  :rowValue="item"
                  :key="index"
                />
              </van-form>
            </div>
            <div v-if="draggable || children[3].children!.length" class="gct-card-footer">
              <i
                v-show="draggable"
                class="iconfont icon-drag mover cursor-pointer mr8px"
                style="color: #bfbfbf"
              ></i>
              <!-- <cardBtnRender
                :index="idx"
                :cardId="widget.id"
                :children="children[3].children"
                :data="{ ...item, idx }"
                :doNotSubmit="doNotSubmit"
                :visibleButtons="visibleButtons"
                @afterDelete="afterDelete"
              /> -->
              <tableButtons
                :children="children[3].children"
                :rowValue="item"
                :visibleButtons="visibleButtons"
                :index="idx"
              />
            </div>
          </div>
        </div>
      </div>
    </van-radio-group>
  </van-list>
  <div v-if="!loading && !datasource.length" class="ks-row-middle w100% justify-center">
    <van-image :src="imageSrc" width="150" />
  </div>
</template>
<script setup lang="ts" name="card-list-render">
  import { toRaw, computed, ref, reactive, onMounted, provide, nextTick, toRef, toRefs } from 'vue';
  import { CardList } from '/@page-designer/types/mobile';
  import { useQueryfilter, getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { cloneDeep, merge } from 'lodash-es';
  import { isObject } from '/@/utils/is';
  import CardLeftRender from './component/card-left-render.vue';
  import fieldWidget from '../../__components__/fieldByList/index.vue';
  import { postModelComprehensiveQuerySearchRefChainData } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import imageSrc from '@mobile/assets/image/no-app.png';
  import {
    ICardListQueryDataOptions,
    IMobCardListQueryDataOptions,
  } from '/@/projects/page-designer/src/interface/mobile';
  import tableButtons from '/@page-designer/components/widgets/mobile/__components__/table-buttons/table-buttons-render.vue';
  import { showNotify } from 'vant';
  import { selectionTypeEnums } from '/@/enums/appEnum';

  const props = defineProps<{ widget: CardList }>();
  const layout = toRef(() => props.widget.props.layout || {});
  provide('form-layout', layout);
  const children = reactive(props.widget.children);
  const datasource = ref<any[]>([]);
  const refForms = ref<any>();
  const loading = ref(false);
  const error = ref(false);
  const Event = getPageEvent();
  const total = ref(0);
  // 选中的单选项
  const radioRow = ref({});
  // 单选选中ID
  const radioRowId = ref('');
  // 数据是否选中集合
  const checkboxData = ref({});

  const {
    visibleButtons,
    draggable,
    model,
    datafilter,
    refSearch,
    collationSort,
    collationField,
    collation,
    modeldata,
    initNotLoad,
    doNotSubmit,
    initLoad,
    dataLinkValue,
    customdataSource,
    datasourceConfig,
  } = toRaw(props.widget.props);

  const fieldWidgets = children[2]?.children || [];
  const foreignFields = fieldWidgets
    .filter((i) => i.props.isFieldModel)
    .map((i) => i.props.bindFieldLink?.join('.'));
  const finished = ref(initLoad != undefined ? !initLoad : !!initNotLoad);
  const querySort = getQuerySort({ collationField, collationSort, collation });
  const queryfilter = useQueryfilter(datafilter);
  const pagination = reactive({
    pageSize: 5,
    pageNo: 1,
    query: {},
    exp: '',
    sorts: [...querySort],
  });
  const labelLayout = toRef(() => {
    const width =
      props.widget.props.layout?.label === 'left' && !!props.widget.props.hasLabelWidth
        ? props.widget.props.labelWidth + (props.widget.props.labelType == 'percent' ? '%' : 'px')
        : '';

    return {
      width,
      layout: props.widget.props.layout,
      hasLabelWidth: props.widget.props.hasLabelWidth,
      overLabelDisplay: props.widget.props.overLabelDisplay,
    };
  });

  provide('labelLayout', labelLayout);
  const computedInitLoad = computed(() => {
    return initLoad != undefined ? initLoad : !initNotLoad;
  });
  const showTitle = computed(() => {
    return props.widget.props.showTitle;
  });
  // 是否开启数据选择
  const rowSelection = computed(() => {
    return props.widget.props.rowSelection;
  });
  // 数据选择模式
  const rowSelectionType = computed(() => {
    return props.widget.props.rowSelectionType;
  });
  const headerStyleAttr = computed(() => {
    const style = props.widget.style;
    return {
      paddingTop: (style.paddingTop || 0) + 'px',
      paddingRight: (style.paddingRight || 0) + 'px',
      paddingLeft: (style.paddingLeft || 0) + 'px',
    };
  });
  const styleAttr = computed(() => {
    const style = props.widget.style;
    return {
      paddingRight: (style.paddingRight || 0) + 'px',
      paddingBottom: (style.paddingBottom || 0) + 'px',
      paddingLeft: (style.paddingLeft || 0) + 'px',
    };
  });
  const styleWrap = computed(() => {
    const style = props.widget.style;
    return {
      backgroundColor: !style.backgroundColor ? '' : style.backgroundColor + ' !important',
      height: style.height ? style.height + 'px' : 'auto',
      borderLeft: `${style.borderLeft?.borderWidth}px ${style.borderLeft?.borderStyle} ${style.borderLeft?.borderColor} !important`,
      borderRight: `${style.borderRight?.borderWidth}px ${style.borderRight?.borderStyle} ${style.borderRight?.borderColor} !important`,
      borderBottom: `${style.borderBottom?.borderWidth}px ${style.borderBottom?.borderStyle} ${style.borderBottom?.borderColor} !important`,
      borderTop: `${style.borderTop?.borderWidth}px ${style.borderTop?.borderStyle} ${style.borderTop?.borderColor} !important`,
      borderTopRightRadius: !style.borderTopRightRadius
        ? ''
        : style.borderTopRightRadius + 'px !important',
      borderTopLeftRadius: !style.borderTopLeftRadius
        ? ''
        : style.borderTopLeftRadius + 'px !important',
      borderBottomRightRadius: !style.borderBottomRightRadius
        ? ''
        : style.borderBottomRightRadius + 'px !important',
      borderBottomLeftRadius: !style.borderBottomLeftRadius
        ? ''
        : style.borderBottomLeftRadius + 'px !important',
    };
  });

  const onload = async () => {
    pagination.pageNo++;
    await getDataSource();
  };

  /**删除事件 */
  const afterDelete = (data) => {
    datasource.value.splice(data.idx, 1);
    total.value--;
  };

  onMounted(async () => {
    await getBodyBySearchComponent(refSearch);
    if (computedInitLoad.value) getDataSource();
  });
  /**
   * 远程请求 数据
   * @param queryData
   */
  async function getDataSource(queryData: IMobCardListQueryDataOptions) {
    let { pageNo, pageSize, query, exp, sorts, searchModelKey } = Object.assign(
      {},
      pagination,
      queryData,
    );
    loading.value = true;
    try {
      const parmseData = {
        query: { ...query, ...queryfilter.query },
        pageNo,
        pageSize,
        exp: queryfilter.getExp(exp),
        sorts: [...sorts],
        foreignFields,
      };
      let data: any = {};
      if (customdataSource && datasourceConfig?.name) {
        data = await Event.runExportByName(
          datasourceConfig?.name,
          parmseData,
          datasourceConfig.extraParams,
        );
      } else if (dataLinkValue?.length && searchModelKey) {
        let nodesChain = [
          {
            direction: 'forward',
            fieldKey: dataLinkValue[0].value,
            modelKey: dataLinkValue[0].modelKey,
            modelCategory: dataLinkValue[0].modelCategory,
          },
        ];
        if (!dataLinkValue[1]) {
          // 当只有两个节点时的情况
          nodesChain.push({
            direction: '',
            fieldKey: '',
            modelKey: dataLinkValue[0].refModelKey,
            modelCategory: dataLinkValue[0].refModelCategory,
          });
        } else {
          // 当只有三个节点时的情况
          if (dataLinkValue[1].reverse) {
            // 最后一个为反向的场景
            nodesChain = nodesChain.concat([
              {
                direction: '',
                fieldKey: '',
                modelKey: dataLinkValue[0].refModelKey,
                modelCategory: dataLinkValue[0].refModelCategory,
              },
              {
                direction: 'backward',
                fieldKey: dataLinkValue[1].value,
                modelKey: dataLinkValue[1].modelKey,
                modelCategory: dataLinkValue[1].modelCategory,
              },
            ]);
          } else {
            // 正向场景
            nodesChain = nodesChain.concat([
              {
                direction: 'forward',
                fieldKey: dataLinkValue[1].value,
                modelKey: dataLinkValue[1].modelKey,
                modelCategory: dataLinkValue[1].modelCategory,
              },
              {
                direction: '',
                fieldKey: '',
                modelKey: dataLinkValue[1].refModelKey,
                modelCategory: dataLinkValue[1].refModelCategory,
              },
            ]);
          }
        }

        const params = {
          modelKey: searchModelKey,
          nodesChain,
          ...parmseData,
        };
        data = await postModelComprehensiveQuerySearchRefChainData(params);
      } else {
        data = (await Event.context.$httpBizService(
          {
            action: 'listByPage',
            key: model,
            modelCategory: modeldata?.modelCategory,
          },
          parmseData,
        )) as any;
      }
      pagination.pageNo = data.pageNo;
      pagination.pageSize = data.pageSize;
      total.value = data.totalCount || 0;
      datasource.value.push(...transformSourceData(data.data, data.dict));
    } catch (error) {
      error.value = true;
      finished.value = true;
      console.log(error);
    }
    if (datasource.value?.length >= total.value) {
      finished.value = true;
      // 初始化数据多选时选中项集合
      const newCheckboxData = {};
      datasource.value.forEach((item) => {
        newCheckboxData[item.id_] = false;
      });
      // 避免加载新的页面之前选中项丢失
      merge(newCheckboxData, checkboxData.value);
      checkboxData.value = newCheckboxData;
    }
    setTimeout(() => {
      loading.value = false;
    }, 1000);
  }
  async function search(queryData = {}) {
    pagination.pageNo = 1;
    finished.value = false;
    datasource.value = [];
    await getDataSource(queryData);
    merge(pagination, queryData);
  }
  async function getBodyBySearchComponent(key: string) {
    if (!key) return {};
    Event.initSearchs(key, search, props.widget.id);
    try {
      let searchVm = (await Event.getSyncComponent(key)) as any;
      let queryData = (await searchVm.getBodyBySearch()) || {};
      merge(pagination, queryData);
    } catch (error) {
      console.error(error);
    }
  }

  function reload(...arg) {
    search(...arg);
  }

  function radioEvent() {
    if (!rowSelection.value || rowSelectionType.value !== selectionTypeEnums.SingleChoice) return;
    const data = datasource.value.find((item) => item.id_ === radioRowId.value);
    radioRow.value = cloneDeep(data);
    Event.runEventByName('radioEvent', props.widget.events, cloneDeep(data));
  }

  function checkboxEvent() {
    let rows = [];
    datasource.value.forEach((item) => {
      if (checkboxData.value[item.id_]) {
        rows.push(cloneDeep(item));
      }
    });
    Event.runEventByName('checkboxEvent', props.widget.events, cloneDeep(rows));
  }
  function cellClickEvent(value) {
    Event.runEventByName('cellClickEvent', props.widget.events, cloneDeep(value));
  }
  const checkboxRow = computed(() => {
    const arr = [];
    datasource.value.forEach((item) => {
      if (checkboxData.value[item.id_]) {
        arr.push(item);
      }
    });
    return arr;
  });

  provide('tableEvent', {
    delete: async (rowData, index) => {
      if (model && rowData.id_ && !doNotSubmit) {
        rowData.deleted_ = true;
        await Event.context.$httpBizService(
          { key: model, action: 'removeById' },
          {},
          { id: rowData.id_ },
        );
      }
      afterDelete(rowData);
      showNotify({ type: 'success', message: $t('sys.delSuccess') });
    },
    linkPage: (linkPage, rowData) => {
      linkPage && Event.context.$push(linkPage, { id: rowData.id_ });
    },
  });

  defineExpose<ICardListQueryDataOptions>({
    reload,
    getDataSource() {
      return cloneDeep(datasource.value);
    },
    addDataSource(data, dict) {
      isObject(data) && (data = [data]);
      const options = transformSourceData(data, dict);
      datasource.value.push(...options);
    },
    async setDataSource(data = [], dict) {
      datasource.value = [];
      await nextTick();
      const options = transformSourceData(data, dict);
      datasource.value = options;
    },
    getSelectedDataSource() {
      return checkboxRow.value;
    },
    async validate() {
      if (refForms.value) {
        for (let i in refForms.value) {
          await refForms.value[i].validate();
        }
      }
    },
  });
</script>
<style lang="scss" scoped>
  .gct-card-list {
    height: 100%;
    // min-height: 169px;
    // overflow: auto会导致在popup中滑动滚动条无效
    // overflow: auto;

    & + & {
      margin-top: 10px;
    }
  }

  .gct-card-header-right {
    .van-cell__value.van-field__value {
      text-align: right;
    }
  }

  .gct-card-item {
    display: flex;
    height: 100%;
    margin: 0 12px;
    border: 1px solid transparent;
    border-radius: 6px;
    // margin-bottom: 10px;
    // background: #fafafa;

    :deep(.van-checkbox__icon),
    :deep(.van-radio__icon) {
      background-color: #fff;
    }

    &.gct-card-item-is-selected {
      border: 1px solid #3168ec;
      background: rgb(49 104 236 / 8%);
    }

    .gct-card-selection {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;

      .van-checkbox,
      .van-radio {
        padding: 16px 4px;
      }
    }

    .gct-card-content {
      flex-grow: 1;

      .gct-card-header {
        overflow: hidden;
        border-bottom: 1px solid #f0f0f0;

        .header-item {
          min-height: 40px;
          // line-height: 40px;
          :deep(.van-field) {
            padding: 7px 12px;
          }
        }
      }

      .gct-card-main {
        height: auto;
        // min-height: 147px;
      }
    }
  }

  .gct-card-footer {
    display: flex;
    padding: 8px 12px;
    // .footer-btn-wrap {
    //   flex: 1;
    //   display: flex;
    //   flex-direction: row-reverse;
    // }
    .btn-more {
      margin-left: 8px;

      .i-icon-more {
        position: relative;
        top: 6px;
      }
    }
  }

  .textR {
    text-align: right;
  }

  :deep(.van-field) {
    padding: 12px;
  }

  :deep(.van-cell) {
    background-color: inherit;
  }
</style>
