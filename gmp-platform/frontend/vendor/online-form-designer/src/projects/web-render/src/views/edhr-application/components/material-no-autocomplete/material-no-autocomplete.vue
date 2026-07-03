<template>
  <a-auto-complete
    v-if="dropdownMode"
    ref="inputRef"
    :class="[ns.b()]"
    v-model:value="localVal"
    :options="options"
    allowClear
    :defaultActiveFirstOption="false"
    :placeholder="
      t('sys.pleaseInputSth', {
        sth: t('sys.webRender.edhrApplication.recordStatusPlaceholder'),
      })
    "
    @search="onSearch"
    @keydown.enter="onEnter"
  >
    <template #option="option">
      <span :class="[ns.e('option')]">
        <MaterialStatusLabel
          :class="[ns.e('status')]"
          :value="option.materialStatus"
          :useDynamicColor="false"
        />
        <span :class="[ns.e('value')]"> {{ option.value }}</span>
        <CloseOutlined
          :class="[ns.e('remove')]"
          @click="
            (e) => {
              e.stopPropagation();
              onDelete(option);
            }
          "
        />
      </span>
    </template>
  </a-auto-complete>
  <template v-if="!dropdownMode">
    <a-input
      v-model:value="localVal"
      @update:value="onSearchTextChange"
      :placeholder="
        t('sys.pleaseInputSth', {
          sth: t('sys.webRender.edhrApplication.recordStatusPlaceholder'),
        })
      "
      allowClear
      @pressEnter="onEnter"
    />
    <div class="px4px mt4px max-h-320px overflow-auto">
      <div
        v-for="(item, i) in options"
        :key="i"
        class="ks-row-middle px12px py5px cursor-pointer rounded-4px hover-bg-[rgba(0,0,0,0.04)]"
        @click="onSelectItem(item)"
      >
        <MaterialStatusLabel
          :class="[ns.e('status')]"
          :value="item.materialStatus"
          :useDynamicColor="false"
        />
        <div class="ks-col ell break-all" :title="item.value"> {{ item.value }}</div>
        <CloseOutlined
          :class="[ns.e('remove')]"
          @click="
            (e) => {
              e.stopPropagation();
              onDelete(item);
            }
          "
        />
      </div>
    </div>
  </template>
</template>

<script lang="ts" setup name="material-no-autocomplete">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed, onMounted, ref } from 'vue';
  import {
    deleteEdhrInstanceSearchHistory,
    getEdhrInstanceSearchHistoryList,
  } from '/@/apis/gct-apaas/EdhrInstanceSearchHistoryController';
  import { CloseOutlined } from '@ant-design/icons-vue';
  import { MaterialStatusLabel } from '/@online-form/views/integration/apaas_ebr/index';
  import { debounce } from 'lodash-es';

  const { t } = useI18n();
  const ns = useNamespace('material-no-autocomplete');

  const inputRef = ref<any>();

  const props = withDefaults(
    defineProps<{
      value?: string;
      dropdownMode?: boolean;
    }>(),
    {
      value: undefined,
      dropdownMode: true,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value?: string): void;
    (e: 'enter'): void;
  }>();

  const localVal = computed({
    get() {
      return props.value;
    },
    set(v) {
      emit('update:value', v);
    },
  });

  const options = ref<any[]>([]);
  const onSearch = (searchText: string) => {
    console.log('searchText');
    loadData(searchText);
  };

  const loadData = async (query?: string) => {
    const res = await getEdhrInstanceSearchHistoryList({ materialNo: query });
    options.value = (res ?? []).map((item) => ({
      value: item.materialNo,
      id: item.id,
      materialStatus: item.materialStatus,
    }));
  };

  const onDelete = async (option) => {
    await deleteEdhrInstanceSearchHistory({ id: option.id });
    options.value = options.value.filter((item) => item.value !== option.value);
  };

  onMounted(() => {
    loadData();
  });

  const _onEnter = () => {
    emit('enter');
  };

  const onEnter = debounce(_onEnter, 500);

  const onSelectItem = (option) => {
    localVal.value = option.value;
    emit('enter');
  };

  const onSearchTextChange = (v) => {
    localVal.value = v;
    loadData(v);
  };
</script>

<style lang="scss" scoped>
  $material-no-autocomplete: ();

  @include b(material-no-autocomplete) {
    @include set-component-css-var(material-no-autocomplete, $material-no-autocomplete);

    @include e(option) {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    @include e(value) {
      flex-grow: 1;
      flex-shrink: 1;
      width: 1px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @include e(remove) {
      flex-grow: 0;
      flex-shrink: 0;
    }

    @include e(status) {
      margin-right: 4px;
      font-size: 10px;
      height: 16px;
      line-height: 16px;
      width: auto;
      padding: 0 4px;
    }
  }
</style>
