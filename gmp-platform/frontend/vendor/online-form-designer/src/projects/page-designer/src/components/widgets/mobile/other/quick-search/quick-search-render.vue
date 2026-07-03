<template>
  <div class="gct-quick-search-box">
    <div class="bg-[#f9f9f9] text-center py-10px text-[#BFBFBF]" v-if="!model">{{
      $t('sys.pageDesigner.selectAssociatedModel')
    }}</div>
    <div
      class="bg-[#f9f9f9] text-center py-10px text-[#BFBFBF]"
      v-else-if="model && !searchField.length"
      >{{ $t('sys.pageDesigner.selectQuickSearchFields') }}</div
    >
    <van-search
      v-else
      ref="searchRef"
      v-model="searchValue"
      class="app-quick-search"
      @search="onSearch"
      :placeholder="placeholder"
      @clear="clear"
    >
      <template #left-icon>
        <!-- <van-icon name="scan" /> -->
      </template>
      <template #right-icon>
        <div class="flex flex-items-center">
          <van-icon name="search" @click="onSearch" />
          <i v-if="scan" class="px2 color-[#dddddd]" style="font-style: normal">|</i>
          <van-icon name="scan" v-if="scan" color="var(--van-primary-color)" @click="openScan" />
        </div>
      </template>
    </van-search>
  </div>
</template>

<script setup lang="ts" name="gct-quick-search">
  import { nextTick, ref, toRaw, onMounted } from 'vue';
  import { QuickSearch } from '/@page-designer/types/mobile';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { JSSDK } from '@mobile/utils/sdkAdapter';
  import { IQuickSearchComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const props = defineProps<{ widget: QuickSearch }>();
  const { placeholder, scan, model, getFocus, searchField } = toRaw(props.widget.props);
  const Event = getPageEvent();
  const searchValue = ref();
  const options = ref<FieldMetaDTO[]>([]);

  const searchRef = ref();
  const { setInputFocus } = useFormWidget(props);

  onMounted(() => {
    nextTick(() => {
      searchRef.value && setInputFocus(searchRef, getFocus);
    });
  });

  async function getOptions() {
    let list = (await getFieldMetaList({ modelKey: model || '' })) || [];
    options.value = list.filter((i: FieldMetaDTO) => searchField.includes(i.key));
  }
  getOptions();

  async function onSearch() {
    await Event.runEventByName('beforeSearch', props.widget.events, searchValue.value);
    let { exp, query } = getBodyBySearch(searchValue.value);

    Event.runTableBySearch(props.widget.id, {
      query,
      exp,
      pageNo: 1,
      searchModelKey: model,
    });
    Event.runEventByName('afterSearch', props.widget.events, searchValue.value);
  }

  async function openScan() {
    searchValue.value = await JSSDK.run('openScan');
    onSearch();
  }

  /**
   * 转化为post请求的格式
   * @param fieldWidget
   * @param state
   */
  function transformToBody(value) {
    const body = {};
    const ex: any = [];
    const opeLsit = [FIELD_TYPE.LONG, FIELD_TYPE.INTEGER, FIELD_TYPE.DOUBLE, FIELD_TYPE.DECIMAL];
    let qsFields = [...options.value];
    if (!Number(searchValue.value)) {
      qsFields = options.value.filter((e) => {
        return !opeLsit.some((f) => f === e.type);
      });
    }
    qsFields.forEach((i: FieldMetaDTO) => {
      const field = i.key;
      const fieldType: any = i.type;
      const ope = [
        FIELD_TYPE.TEXT,
        FIELD_TYPE.LONG_TEXT,
        FIELD_TYPE.SERIAL,
        FIELD_TYPE.INTEGER,
        FIELD_TYPE.LONG,
      ].includes(fieldType)
        ? 'like'
        : 'eq';
      if (value !== null && value !== undefined) {
        const key = `${field}.${ope}`;
        body[key] = value;
        ex.push(`${field}.${ope}`);
      }
    });
    const exp =
      value !== null && value !== undefined && searchField?.length ? `OR(${ex})` : undefined;
    return { exp, query: body };
  }

  function getBodyBySearch(value) {
    const { exp, query } = transformToBody(value);
    return { exp, query };
  }

  async function clear(v) {
    await nextTick();
    Event.runEventByName('afterClear', props.widget.events);
  }
  defineExpose<IQuickSearchComponentExpose>({
    getBodyBySearch,
    getSearchValue() {
      return searchValue.value;
    },
    setSearchValue(value) {
      searchValue.value = value;
    },
    setSearchFocus() {
      searchRef.value && setInputFocus(searchRef, true);
    },
  });
</script>
<style scoped lang="less">
  :deep(.app-quick-search.van-search) {
    background: inherit;

    .van-search__content .van-search__field {
      padding: 0 8px 0 0 !important;

      .van-field__left-icon {
        border-right: 1px solid #f0f0f0;
        color: var(--van-primary-color);

        .van-icon {
          margin-right: 4px;
        }
      }
    }
  }
</style>
