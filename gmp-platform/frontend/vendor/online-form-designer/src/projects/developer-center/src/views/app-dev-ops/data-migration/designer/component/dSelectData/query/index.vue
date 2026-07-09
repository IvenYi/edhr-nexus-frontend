<template>
  <div class="overflow-hidden bg-[#fff]">
    <a-form ref="formRef" :model="formState">
      <div class="gct-search-widget">
        <div
          v-for="(column, index) in cacheColumns"
          :key="column.key"
          class="gct-search-item"
          :style="{
            '--drag-item-width': `${itemWidth}%`,
            display: !expand && index > maxLength - 1 ? 'none' : 'inline-block',
          }"
        >
          <div class="inline-block box-border search-item">
            <a-form-item :name="column.key" :label="column.name">
              <widgets
                :configByHeaders="configByHeaders"
                v-model:value="formState[column.key]"
                :widget="column"
                :formData="formState"
                @gctsearch="search"
              />
            </a-form-item>
          </div>
        </div>
        <div
          class="gct-search-item gct-search-item-search-btn inline-block"
          :style="{ width: btnItemWidth }"
        >
          <div class="box-border button-area">
            <span class="custom-filter-icon ml-6px" v-if="props.SysPage.type === 'model'">
              <fieldFilter
                class="text-20px"
                :columns="fieldWidgets"
                :cacheKey="cacheKey"
                :type="SysPage.name"
                @changeColumsByIds="changeColumns"
              />
            </span>
            <a-button class="mr8px" @click="reset">{{ t('sys.reset') }}</a-button>
            <a-button type="primary" @click="search">{{ t('sys.query') }}</a-button>

            <div class="button-toggle ml-8px" v-if="isShowExpand" @click="handleExpand">
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
  import { ref, unref, reactive, computed, toRaw, watch, onMounted } from 'vue';
  import { CreateType, FIELD_TYPE } from '/@/enums/appEnum';
  import { Search } from '/@page-designer/types/web';
  import type { FormInstance } from 'ant-design-vue';
  import widgets from './component/search_fields/index.vue';
  import { useGetBodyBySearch, searchCmpKeyMap } from './config.ts';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
  import { initFieldWidgetRuntime } from '/@page-designer/hooks/getFieldSchema';
  import { CheckedData, DataTabEnum } from '../../../const';
  import { sysPageInfo } from '../../../setting';
  import fieldFilter from './component/field_filter_button.vue';

  const emit = defineEmits(['search', 'changeExpand']);
  const { t } = useI18n();

  const props = defineProps<{ SysPage: CheckedData; configByHeaders: object }>();
  const rowLength = 3,
    maxLength = 3;
  const cacheKey = props.SysPage.key;

  const fieldWidgets =
    props.SysPage.type === DataTabEnum.SYS_MODULAR
      ? sysPageInfo[props.SysPage.name].search
      : props.SysPage.fieldMetaList?.filter((i) => {
          const { ope, searchCmpKey } = searchCmpKeyMap[i.type] || {};
          i._searchCmpKey = searchCmpKey;
          i._ope = ope;
          return (
            !!searchCmpKey &&
            [CreateType.USER_DEFINED, CreateType.BUILTIN, CreateType.SYSTEM].includes(i.createType)
          );
        }) || [];
  const cacheColumns = ref<any>(fieldWidgets);
  const expand = ref(false);
  const formRef = ref<FormInstance>();
  const formState = reactive({});

  onMounted(() => {
    sysPageInfo[props.SysPage.name].search.forEach((i) => {
      formState[i.key] = i?.defaultValue;
    });
  });
  /**初始化不开启表头时候 */
  if (props.SysPage.type === 'model') {
    watch(
      () => fieldWidgets,
      (n) => {
        if (n) {
          cacheColumns.value = fieldWidgets.slice();
        }
      },
      {
        immediate: true,
      },
    );
  }
  const isShowExpand = computed(() => {
    return cacheColumns.value.length > 3;
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
        const info = fieldWidgets.find((item) => item.key === id);
        return info;
      })
      .filter((i) => i);
  }

  const handleExpand = () => {
    expand.value = !expand.value;
    emit('changeExpand', expand.value);
  };

  async function search() {
    let query = await getBodyBySearch();
    emit('search', query);
  }
  function reset() {
    // formRef.value?.resetFields();
    for (let i in formState) {
      formState[i] = undefined;
    }
    emit('search', {});
  }

  async function getBodyBySearch() {
    const query = useGetBodyBySearch(toRaw(formState), unref(cacheColumns));
    if (props.SysPage.type === DataTabEnum.SYS_MODULAR) {
      return query;
    } else {
      return { query };
    }
  }
</script>

<style lang="less" scoped>
  .gct-search-widget {
    margin-right: -5px;
    margin-left: -5px;
    background-color: transparent;

    .gct-search-item,
    .gct-search-item-search-btn {
      display: inline-block;
      box-sizing: border-box;
      margin-bottom: 8px;
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
    justify-content: flex-end;

    .custom-filter-icon {
      display: inline-flex;
      position: relative;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 4px;
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
