<template>
  <div class="overflow-hidden bg-[#fff]">
    <!-- {{ formState }} -->
    <a-form ref="formRef" :model="formState">
      <div class="gct-search-widget">
        <div
          v-for="(column, index) in cacheColumns"
          :key="column.id"
          class="gct-search-item"
          :style="{
            '--drag-item-width': `${itemWidth}%`,
            display: !expand && index > maxLength - 1 ? 'none' : 'inline-block',
          }"
        >
          <div class="inline-block box-border search-item">
            <a-form-item
              :name="column.id"
              :label="column.i18n?.label ? t(column.i18n.label) : column.props.label"
              :rules="
                [
                  SearchComponents.SearchStringNumberInput,
                  SearchComponents.SearchNumberInput,
                ].includes(column.type)
                  ? [
                      {
                        validator: (rule, value) => validateLengthRange(rule, value, formState),
                        message: '最大数值不能小于最小数值',
                      },
                    ]
                  : null
              "
            >
              <widgets
                v-model:value="formState[column.id]"
                :widget="column"
                :formData="formState"
                @gctsearch="search"
                :modelCategory="
                  widget.props.modeldata?.modelCategory || EntityModelCategoryEnum.ENTITY
                "
              />
            </a-form-item>
          </div>
        </div>
        <div
          class="gct-search-item gct-search-item-search-btn inline-block"
          :style="{ width: btnItemWidth }"
        >
          <div :style="{ 'justify-content': alignment }" class="box-border button-area">
            <a-button class="mr8px" @click="reset">{{ t('sys.reset') }}</a-button>
            <a-button type="primary" @click="search">{{ t('sys.query') }}</a-button>
            <span class="custom-filter-icon ml-6px" v-if="customHeader">
              <fieldFilter
                class="text-20px"
                :columns="fieldWidgets"
                :cacheKey="cacheKey"
                @changeColumsByIds="changeColumns"
              />
            </span>
            <div class="button-toggle ml-8px" v-if="isShowExpand" @click="expand = !expand">
              {{ expand ? t('sys.collapse') : t('sys.unfold') }}
              <up-outlined v-if="expand" />
              <down-outlined v-else />
            </div> </div
        ></div>
      </div>
    </a-form>
  </div>
</template>

<script name="gct-search" setup lang="ts">
  import { ref, unref, reactive, computed, toRaw, watch } from 'vue';
  import { Search } from '/@page-designer/types/web';
  import type { FormInstance } from 'ant-design-vue';
  import widgets from './component/search_fields/index.vue';
  import { getPageEvent, useGetBodyBySearch } from '/@page-designer/components/widgets/hooks/hooks';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import fieldFilter from '../../__components__/field_filter_button.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
  import { SearchComponents } from '/@page-designer/enum';
  import { defaultValMap } from './default-value';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { ISearchComponentExpose } from '/@/projects/page-designer/src/interface/web';
  import { initFieldWidgetRuntime } from '/@page-designer/hooks/getFieldSchema';
  import dayjs from 'dayjs';

  const { t } = useI18n();

  /**
   * refParentModelkey 在列表选择器内部查询子表
   */
  const props = defineProps<{ widget: Search; refParentModelkey?: string }>();
  const cacheKey = ref(props.widget.id);

  const { appInfo } = useAppInfoStore();

  const { alignment, maxLength, rowLength, exp: expStr, customHeader } = toRaw(props.widget.props);

  const fieldWidgets = computed(() => {
    props.widget.children!.forEach((i) => {
      if (i.props?.fieldType === FIELD_TYPE.ASSOCIATED_PRIMARY_KEY) {
        i.props.bindModelKey = props.refParentModelkey;
      }
      initFieldWidgetRuntime(i, true)
        .then((fieldInfo) => {
          i.props.label = i.props.label || fieldInfo?.name;
        })
        .catch((err) => {
          /**隐藏已经删除的字段 */
          // i.props.hidden = true;
        });
    });
    return props.widget.children?.filter((i) => !i.props.hidden) || [];
  });
  const cacheColumns = ref<any>([]);
  const expand = ref(false);
  const formRef = ref<FormInstance>();
  const formState = reactive({});
  const Event = getPageEvent();
  /**初始化不开启表头时候 */
  if (!customHeader) {
    watch(
      () => fieldWidgets.value.length,
      (n) => {
        cacheColumns.value = fieldWidgets.value.slice();
      },
      {
        immediate: true,
      },
    );
  }
  const isShowExpand = computed(() => {
    return cacheColumns.value.length > maxLength;
  });

  const itemWidth = computed(() => {
    return 100 / rowLength;
  });
  const filterListLength = computed(() => {
    const list =
      isShowExpand.value && !expand.value
        ? cacheColumns.value.slice(0, maxLength)
        : cacheColumns.value.slice();
    return list.length;
  });
  const btnItemWidth = computed(() => {
    return (
      (filterListLength.value
        ? (rowLength - (filterListLength.value % rowLength)) * itemWidth.value
        : 100) + '%'
    );
  });

  /**同步字段 */
  function changeColumns(ids: string[]) {
    cacheColumns.value = ids
      .map((id) => {
        const info = fieldWidgets.value.find((item) => item.id === id);
        return info;
      })
      .filter((i) => i);
  }

  async function search() {
    await formRef.value?.validate();
    let { query, exp } = await getBodyBySearch();
    await Event.runEventByName('beforeSearch', props.widget.events, query);
    Event.runTableBySearch(props.widget.id, { query, exp, pageNo: 1 });
    setTimeout(() => {
      Event.runEventByName('afterSearch', props.widget.events, query);
    }, 100);
  }

  function reset() {
    // formRef.value?.resetFields();
    for (let i in formState) {
      formState[i] = undefined;
    }

    // 查询组件重置时，所有字段同时置空为空、不为空的选项配置
    cacheColumns.value.forEach((item) => {
      item.props.useMore = '';
    });

    initDefaultValue().then(() => {
      search();
    });
  }

  let pro: Promise<void> | null = null;

  async function initDefaultValue(): Promise<void> {
    const { children } = props.widget;
    if (children) {
      const all = children
        .filter((_) => {
          return (
            (_.props.defaultValueType != null && _.props.defaultValueType !== '') ||
            (_.props.defaultValue != null && _.props.defaultValue !== '')
          );
        })
        .map(async (_) => {
          const { fieldType } = _.props;
          const fn = defaultValMap.get(fieldType);
          if (fn) {
            const val = await fn(_, { appInfo });
            if (val != null && formState[_.id] == null) {
              formState[_.id] = val;
            }
          }
        });
      await Promise.all(all);
    }
    pro = null;
  }

  pro = initDefaultValue();

  async function getBodyBySearch() {
    if (pro) {
      await pro;
    }
    return useGetBodyBySearch(toRaw(formState), unref(cacheColumns), expStr);
  }

  function validateLengthRange(rule, value, formData) {
    if (!Array.isArray(value)) {
      return Promise.resolve();
    }
    const [minValue, maxValue] = value || [];
    if (
      (minValue || minValue === 0) &&
      (maxValue || maxValue === 0) &&
      Number(minValue) > Number(maxValue)
    ) {
      return Promise.reject();
    } else return Promise.resolve();
  }

  function validateDateRange(rule, value, formData, type) {
    if (!Array.isArray(value)) {
      return Promise.resolve();
    }
    const [minValue, maxValue] = value || [];
    const minDate =
      type == 'SearchTime' ? dayjs(minValue, 'HH:mm:ss').valueOf() : dayjs(minValue).valueOf();
    const maxDate =
      type == 'SearchTime' ? dayjs(maxValue, 'HH:mm:ss').valueOf() : dayjs(maxValue).valueOf();
    if (minDate && maxDate && minDate > maxDate) {
      return Promise.reject();
    } else return Promise.resolve();
  }

  defineExpose<ISearchComponentExpose & { setFieldProps: (id, selfProps) => void }>({
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
    setFieldProps(id, selfProps) {
      const field = props.widget.children?.find((item) => item.id === id);
      field && Object.assign(field.props, selfProps);
    },
    reset,
  });
</script>

<style lang="less" scoped>
  .gct-search-widget {
    // flex-wrap: wrap;
    min-height: 56px;
    margin-right: -5px;
    margin-left: -5px;
    // padding: 4px 12px;
    background-color: transparent;

    .gct-search-item,
    .gct-search-item-search-btn {
      display: inline-block;
      box-sizing: border-box;
      padding-right: 5px;
      padding-left: 5px;
    }

    .gct-search-item {
      width: var(--drag-item-width);
    }
  }

  :deep(.ant-form-item) {
    margin-bottom: 0;
  }

  .search-item {
    position: relative;
    width: 100%;
    // padding: 0 12px;
  }

  .button-area {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
    height: 100%;

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
      color: var(--ant-primary-color);
      cursor: pointer;
    }
  }

  :deep(.ant-select-selection-item) {
    user-select: text;
  }
</style>
