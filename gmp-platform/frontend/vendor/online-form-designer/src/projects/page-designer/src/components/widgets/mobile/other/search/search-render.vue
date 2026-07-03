<template>
  <div class="gct-mobile-search-warp">
    <!-- {{ formState }} -->
    <van-form ref="formRef" class="gct-mobile-search" :key="forEachKey">
      <div v-for="fieldWidget of cacheColumns" :key="fieldWidget.id" class="search-item">
        <search-field-render
          :modelCategory="widget.props.modeldata?.modelCategory || EntityModelCategoryEnum.ENTITY"
          v-model:value="formState[fieldWidget.id]"
          :widget="fieldWidget"
          :formData="formState"
          :rules="getRules(fieldWidget)"
        />
      </div>
    </van-form>
    <filter-item-manage
      v-if="customHeader"
      :columns="children ?? []"
      :cacheKey="cacheKey"
      @changeColumnsByIds="changeColumns"
    />
    <div class="ks-col box-border button-area">
      <van-button class="!mr8px" size="normal" block @click="reset">重置</van-button>
      <van-button type="primary" size="normal" block @click="search">确认</van-button>
    </div>
  </div>
</template>
<script setup lang="ts" name="gct-search">
  import { toRefs, reactive, ref, toRaw, watch, unref, computed } from 'vue';
  import { Search } from '/@page-designer/types/mobile';
  import SearchFieldRender from './component/render/search-field-render.vue';
  import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
  import { getPageEvent, useGetBodyBySearch } from '/@page-designer/components/widgets/hooks/hooks';
  import type { FormInstance } from 'vant';
  import FilterItemManage from './component/filter-item-manage.vue';
  import { defaultValMap } from '../../../web/other/query/default-value';
  import { CurrentTenant, UserData } from '@mobile/stores/loginHooks';
  import { IMobSearchComponentExpose } from '/@/projects/page-designer/src/interface/mobile';
  import { initFieldWidgetRuntime } from '/@page-designer/hooks/getFieldSchema';
  import { SearchComponents } from '/@page-designer/enum';
  import dayjs from 'dayjs';

  const props = defineProps<{ widget: Search }>();

  const children = computed(() => {
    props.widget.children!.forEach((i) => {
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
  const { customHeader, exp: expStr, model } = toRefs(props.widget.props);

  const forEachKey = ref(props.widget.id);
  const formRef = ref<FormInstance>();

  const cacheColumns = ref<any>([]);

  const formState = reactive<{ [key: string]: any }>({});

  const cacheKey = ref(props.widget.id);

  const Event = getPageEvent();
  /**初始化不开启表头时候 */
  if (!customHeader.value) {
    watch(
      () => children.value.length,
      (n) => {
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
    let { query, exp } = await getBodyBySearch();
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
    // ! vant的form 表单不支持resetFields，所以需要手动去重置表单
    // ! https://github.com/youzan/vant/issues/6058
    Object.keys(formRef?.value?.getValues() || []).forEach((key) => {
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
            const val = await fn(_, {
              appInfo: { tenantId: CurrentTenant.value.id, modifyUserId: UserData.value.userId },
            });
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
    return useGetBodyBySearch(toRaw(formState), unref(cacheColumns), expStr.value);
  }

  const getRules = (column) => {
    return [SearchComponents.SearchStringNumberInput, SearchComponents.SearchNumberInput].includes(
      column.type,
    )
      ? [
          {
            validator: (val) => validateLengthRange(val),
            trigger: 'onChange',
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
    //         validator: (val) => validateDateRange(val, column.type),
    //         trigger: 'onChange',
    //       },
    //     ]
  };

  function validateLengthRange(val) {
    if (!Array.isArray(val)) {
      return Promise.resolve();
    }
    const [minValue, maxValue] = val || [];
    if (
      (minValue || minValue === 0) &&
      (maxValue || maxValue === 0) &&
      Number(minValue) > Number(maxValue)
    ) {
      // return Promise.reject();
      return '最大数值不能小于最小数值';
    } else return Promise.resolve();
  }

  function validateDateRange(value, type) {
    const [minValue, maxValue] = value || [];
    const minDate =
      type == 'SearchTime'
        ? dayjs(`2025-01-01 ${minValue}`, 'HH:mm:ss').valueOf()
        : dayjs(minValue).valueOf();
    const maxDate =
      type == 'SearchTime'
        ? dayjs(`2025-01-01 ${maxValue}`, 'HH:mm:ss').valueOf()
        : dayjs(maxValue).valueOf();
    if (minDate && maxDate && minDate > maxDate) {
      // return Promise.reject();
      return '最大数值不能小于最小数值';
    } else return Promise.resolve();
  }

  defineExpose<IMobSearchComponentExpose>({
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
<style scoped lang="less">
  .gct-mobile-search-warp {
    .gct-mobile-search {
      position: relative;
      // min-height: 178px;
      // background-color: #fafafa;

      &.is-empty {
        &::before {
          content: attr(data-placeholder);
          display: flex;
          position: absolute;
          top: 0;
          left: 0;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background-color: #f9f9f9;
          color: #bfbfbf;
          pointer-events: none;
        }
      }
    }

    .search-item {
      position: relative;
      width: 100%;
      margin: 2px 0;

      &.is-selected {
        outline: 1px solid var(--ant-primary-color);
      }
    }

    .button-area {
      display: flex;
      position: relative;
      padding: 8px 12px;
    }
  }
</style>
