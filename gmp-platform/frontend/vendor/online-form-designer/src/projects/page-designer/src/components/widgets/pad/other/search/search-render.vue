<template>
  <div class="gct-pad-search-render-warp">
    <van-form
      ref="formRef"
      :model="formState"
      class="gct-pad-search-render"
      :style="{
        '--van-cell-vertical-padding': '10px',
        '--van-cell-horizontal-padding': '10px',
        '--search-render-line-display-count': finalRowLength,
      }"
    >
      <div class="gct-search-widget">
        <div
          v-for="(column, index) in cacheColumns"
          :key="column.id"
          class="gct-search-item"
          :style="{
            '--drag-item-width': `${itemWidth}%`,
            display: !expand && index > finalMaxLength - 1 ? 'none' : 'inline-block',
          }"
        >
          <search-field-render
            :modelCategory="widget.props.modeldata?.modelCategory || EntityModelCategoryEnum.ENTITY"
            v-model:value="formState[column.id]"
            :widget="column"
            :formData="formState"
            :labelWidth="labelWidthByColumn[column.id] || 0"
            :isFirstInRow="isFirstInRow(column.id)"
            :rules="getRules(column)"
          />
        </div>
        <div
          class="gct-search-item-search-btn button-area"
          :style="{
            width: btnItemWidth,
            'justify-content': finalAlignment,
            display: 'inline-flex',
            'flex-grow': '1',
          }"
        >
          <van-button class="reset-btn" @click="reset" size="small">重置</van-button>
          <van-button class="query-btn" type="primary" @click="search" size="small">
            查询
          </van-button>
          <SearchFieldFilter
            v-if="customHeader"
            key="search-field-filter"
            :columns="children ?? []"
            :cacheKey="cacheKey"
            @changeColumns="changeColumns"
          />
          <div class="button-toggle ml-12px" v-if="isShowExpand" @click="expand = !expand">
            {{ expand ? '收起' : '展开' }}
            <van-icon :name="expand ? 'arrow-up' : 'arrow-down'" />
          </div>
        </div>
      </div>
    </van-form>
  </div>
</template>
<script setup lang="ts" name="gct-search">
  import { toRefs, reactive, ref, toRaw, watch, unref, computed, onMounted } from 'vue';
  import { Search } from '/@page-designer/types/pad';
  import SearchFieldRender from './component/render/search-field-render.vue';
  import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
  import { getPageEvent, useGetBodyBySearch } from '/@page-designer/components/widgets/hooks/hooks';
  import type { FormInstance } from 'vant';
  import { defaultValMap } from './default-value';
  import { CurrentTenant, UserData } from '@mobile/stores/loginHooks';
  import { initFieldWidgetRuntime } from '/@page-designer/hooks/getFieldSchema';
  import { measureTexts } from '@gct/runtime';
  import { IPadSearchComponentExpose } from '/@/projects/page-designer/src/interface/pad';
  import { SearchFieldFilter } from './component/render/components/search-field-filter/search-field-filter';
  import { SearchComponents } from '/@page-designer/enum';
  import dayjs from 'dayjs';
  import { cloneDeep } from 'lodash-es';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const props = defineProps<{ widget: Search }>();

  const children = computed(() => {
    props.widget.children!.forEach((i) => {
      initFieldWidgetRuntime(i, true)
        .then((fieldInfo) => {
          i.props.label = i.props.label || fieldInfo?.name;
        })
        .catch((_err) => {
          /**隐藏已经删除的字段 */
          // i.props.hidden = true;
        });
    });
    return props.widget.children?.filter((i) => !i.props.hidden) || [];
  });
  const {
    customHeader,
    exp: expStr,
    model,
    alignment,
    maxLength,
    rowLength,
  } = toRefs(props.widget.props);

  // 提供默认值
  const finalAlignment = computed(() => alignment?.value || 'flex-start');
  const finalMaxLength = computed(() => maxLength?.value || 2);
  const finalRowLength = computed(() => rowLength?.value || 3);

  const forEachKey = ref(props.widget.id);
  const formRef = ref<FormInstance>();

  const cacheColumns = ref<any>([]);
  const expand = ref(false);

  const formState = reactive<{ [key: string]: any }>({});

  const cacheKey = ref(props.widget.id);

  const Event = getPageEvent();

  const isShowExpand = computed(() => {
    return cacheColumns.value.length > finalMaxLength.value;
  });

  const itemWidth = computed(() => {
    return 100 / finalRowLength.value;
  });

  const filterListLength = computed(() => {
    const list =
      isShowExpand.value && !expand.value
        ? cacheColumns.value.slice(0, finalMaxLength.value)
        : cacheColumns.value.slice();
    return list.length;
  });

  const btnItemWidth = computed(() => {
    return (
      (filterListLength.value
        ? (finalRowLength.value - (filterListLength.value % finalRowLength.value)) * itemWidth.value
        : 100) + '%'
    );
  });

  /**
   * 计算每一列的标签最大宽度
   * 根据 rowLength 将字段分组，计算每组中标签的最大宽度
   */
  const labelWidthByColumn = computed(() => {
    const widthMap: Record<string, number> = {};

    if (!cacheColumns.value.length) {
      return widthMap;
    }

    // 获取当前显示的字段列表（考虑展开/折叠状态）
    const currentList =
      isShowExpand.value && !expand.value
        ? cacheColumns.value.slice(0, finalMaxLength.value)
        : cacheColumns.value.slice();

    // 按列分组计算最大宽度
    const columnGroups: string[][] = [];
    for (let i = 0; i < currentList.length; i += finalRowLength.value) {
      const group = currentList
        .slice(i, i + finalRowLength.value)
        .map((widget) => widget.props.label || widget.props.fieldName || '');
      columnGroups.push(group);
    }

    // 计算每列的最大宽度
    for (let colIndex = 0; colIndex < finalRowLength.value; colIndex++) {
      const columnTexts = columnGroups.map((group) => group[colIndex]).filter((text) => text); // 过滤掉空字符串

      if (columnTexts.length > 0) {
        const textResults = measureTexts(columnTexts, {
          fontSize: 15,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'normal',
        });
        // 限制最大宽度不超过 96px
        const maxWidth = Math.min(96, Math.max(...textResults.map((result) => result.width), 0));

        // 为每列的字段设置相同的宽度
        columnGroups.forEach((group, rowIndex) => {
          const widget = currentList[rowIndex * finalRowLength.value + colIndex];
          if (widget) {
            widthMap[widget.id] = maxWidth;
          }
        });
      }
    }

    return widthMap;
  });

  /**
   * 判断指定元素是否为行的第一个
   * @param elementId 元素ID
   */
  const isFirstInRow = (elementId: string) => {
    if (!cacheColumns.value.length) {
      return false;
    }

    // 获取当前显示的字段列表（考虑展开/折叠状态）
    const currentList =
      isShowExpand.value && !expand.value
        ? cacheColumns.value.slice(0, finalMaxLength.value)
        : cacheColumns.value.slice();
    const elementIndex = currentList.findIndex((widget) => widget.id === elementId);

    if (elementIndex === -1) {
      return false;
    }

    // 判断是否为行的第一个：索引对每行元素个数取余为0
    return elementIndex % finalRowLength.value === 0;
  };

  /**初始化不开启表头时候 */
  if (!customHeader.value) {
    watch(
      () => children.value.length,
      (_n) => {
        cacheColumns.value = children.value.slice();
      },
      {
        immediate: true,
      },
    );
  }
  /**同步字段 */
  function changeColumns(ids: string[]) {
    cacheColumns.value = ids
      .map((id) => {
        const info = children?.value?.find((item) => item.id === id);
        return info;
      })
      .filter((i) => i);
  }

  async function search() {
    await formRef.value?.validate();
    const { query, exp } = await getBodyBySearch();
    await Event.runEventByName('beforeSearch', props.widget.events, query);
    Event.runTableBySearch(props.widget.id, {
      query,
      exp,
      pageNo: 1,
      searchModelKey: model!.value,
    });
    setTimeout(() => {
      Event.runEventByName('afterSearch', props.widget.events, query);
    }, 100);
  }

  async function reset() {
    Object.keys(formState).forEach((key) => {
      formState[key] = undefined;
    });

    // 查询组件重置时，所有字段同时置空为空、不为空的选项配置
    cacheColumns.value.forEach((item) => {
      item.props.useMore = '';
    });

    forEachKey.value = Math.random() + '';
    initDefaultValue().then(() => {
      search();
    });
  }

  let pro: Promise<void> | null = null;

  async function initDefaultValue(): Promise<void> {
    const { children } = props.widget;
    if (children) {
      const initItems = children.filter((_) => {
        return (
          (_.props.defaultValueType != null && _.props.defaultValueType !== '') ||
          (_.props.defaultValue != null && _.props.defaultValue !== '')
        );
      });
      const all = initItems.map(async (_) => {
        const { fieldType, defaultValue } = _.props;
        const fn = defaultValMap.get(fieldType);
        if (fn) {
          const val = await fn(_, {
            appInfo: { tenantId: CurrentTenant.value.id, modifyUserId: UserData.value.userId },
          });
          if (val != null && formState[_.id] == null) {
            formState[_.id] = val;
          }
        } else {
          if (defaultValue != null && formState[_.id] == null) {
            formState[_.id] = defaultValue;
          }
        }
      });
      await Promise.all(all);
    }
    pro = null;
  }

  pro = initDefaultValue();

  const getRules = (column) => {
    return [SearchComponents.SearchStringNumberInput, SearchComponents.SearchNumberInput].includes(
      column.type,
    )
      ? [
          {
            validator: (value) => validateLengthRange(value),
            trigger: 'onChange',
            message: '最大数值不能小于最小数值',
          },
        ]
      : null;
    // : [
    //       SearchComponents.SearchDate,
    //       SearchComponents.SearchDateTime,
    //       SearchComponents.SearchTime,
    //     ].includes(column.type)
    //   ? [
    //       {
    //         validator: (value) => validateDateRange(value, column.type),
    //         trigger: 'onChange',
    //         message: '最大数值不能小于最小数值',
    //       },
    //     ]
  };

  function validateLengthRange(value) {
    if (!Array.isArray(value)) {
      return Promise.resolve();
    }
    const [minValue, maxValue] = value || [];
    if (
      (minValue || minValue === 0) &&
      (maxValue || maxValue === 0) &&
      Number(minValue) > Number(maxValue)
    ) {
      return '最大数值不能小于最小数值';
      // return Promise.reject();
    } else return Promise.resolve();
  }

  function validateDateRange(value, type) {
    if (!Array.isArray(value)) {
      return Promise.resolve();
    }
    const [minValue, maxValue] = value || [];
    const minDate =
      type == 'SearchTime' ? dayjs(minValue, 'HH:mm:ss').valueOf() : dayjs(minValue).valueOf();
    const maxDate =
      type == 'SearchTime' ? dayjs(maxValue, 'HH:mm:ss').valueOf() : dayjs(maxValue).valueOf();
    if (minDate && maxDate && minDate > maxDate) {
      return '最大数值不能小于最小数值';
      // return Promise.reject();
    } else return Promise.resolve();
  }

  onMounted(async () => {
    if (pro) {
      await pro;
    }
    // 检查 formState 所有 key 都不为 undefined/null/空串
    const allFilled =
      Object.values(formState).length > 0 &&
      Object.values(formState).every((v) => v !== undefined && v !== null && v !== '');
    if (allFilled) {
      search();
    }
  });

  async function getBodyBySearch() {
    if (pro) {
      await pro;
    }
    // rdo选择服版本需要查询默认子特殊处理
    const handleDormData = await getRdoSearchData(cloneDeep(formState), cacheColumns);
    return useGetBodyBySearch(toRaw(handleDormData), unref(cacheColumns), expStr.value);
  }
  const getRdoSearchData = async (state, cacheColumns) => {
    if (!cacheColumns.value.length) {
      return state;
    }
    const filterRdo = cacheColumns.value.filter((i) => {
      return i.props.fieldType === FIELD_TYPE.RDO_REF;
    });

    if (!filterRdo.length) {
      return state;
    }
    const promises = filterRdo.map(async (i) => {
      if (!state[i.id]?.length) return;

      const searchId = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'rdoListVersionByRefIdsWithParent',
          modelKey: i.props.bindModelKey,
          modelCategory: EntityModelCategoryEnum.ENTITY,
        },
        { foreignFields: [] },
        {
          refIds: state[i.id].join(','),
          includeDeleted: 1,
        },
      );

      state[i.id] = searchId.data.map((p) => `${p.id_}:${p.__CHILDREN__[0].id_}`);
    });
    await Promise.all(promises);
    return state;
  };
  defineExpose<IPadSearchComponentExpose>({
    getBodyBySearch,
    setValueBySearch(value) {
      if (typeof value !== 'object') return;
      for (let k in formState) {
        //重复赋值会错误清空
        delete formState[k];
      }
      for (let k in value) {
        formState[k] = value[k];
      }
    },
    search,
  });
</script>
<style lang="scss">
  .gct-pad-search-render-field-warp {
    width: 100%;
  }
</style>
<style scoped lang="less">
  .gct-pad-search-render-warp {
    .gct-pad-search-render {
      position: relative;
      min-height: 56px;
      background-color: #fff;
      padding: 10px 16px;
    }

    .gct-search-widget {
      display: flex;
      flex-wrap: wrap;
      min-height: 56px;
      margin-right: -5px;
      margin-left: -5px;
      background-color: transparent;

      .gct-search-item {
        display: inline-block;
        box-sizing: border-box;
        padding: 0;
        width: var(--drag-item-width);
        flex-basis: calc(100% / var(--search-render-line-display-count));
      }

      .gct-search-item-search-btn {
        display: inline-block;
        box-sizing: border-box;
        padding: 0;
        margin-top: 6px;
        margin-bottom: 6px;
        padding-right: 5px;
        padding-left: 5px;
        height: 36px;
      }
    }

    .button-area {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: 100%;

      // 按钮样式与 design 版本完全一致
      :deep(.van-button--small) {
        height: 36px;
        width: 78px;
        font-size: 15px;
      }

      .custom-filter-icon {
        display: inline-flex;
        position: relative;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 4px;
        background-color: #f5f5f5;
        color: #999;
        font-size: 14px;
        cursor: pointer;

        > .iconfont {
          line-height: 1;
        }
      }

      .button-toggle {
        position: relative;
        transition: all 0.3s;
        color: var(--van-primary-color);
        cursor: pointer;
        width: 80px;
        height: 36px;
        font-size: 15px;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        padding-left: 12px;
        padding-right: 16px;
        margin-right: -16px;
        gap: 3px;
      }

      .reset-btn {
        margin-right: 12px;
      }
    }
  }

  .ml-6px {
    margin-left: 6px;
  }

  .ml-12px {
    margin-left: 12px;
  }
</style>
