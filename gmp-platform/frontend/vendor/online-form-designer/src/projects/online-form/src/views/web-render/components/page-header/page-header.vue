<template>
  <div :class="[ns.b()]">
    <a-input-search
      :class="[ns.e('search')]"
      allowClear
      :value="query"
      @update:value="(query) => emit('update:query', query)"
      :placeholder="t('sys.keywordsPlaceholder') + t('sys.queryText') + props.title"
      @search="onSearch"
    />
    <div :class="[ns.e('toolbar')]">
      <a-button v-if="showAdd" type="primary" :class="[ns.e('add')]" @click="onAdd">
        <i class="iconfont icon-chuangjian"></i>
        {{
          t('sys.newSth', {
            sth: title,
          })
        }}
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup name="page-header">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';

  const ns = useNamespace('page-header');

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      title: string;
      query?: string;
      showAdd: boolean;
    }>(),
    {
      showAdd: undefined,
    },
  );

  const emit = defineEmits<{
    (e: 'update:query', value: string): void;
    (e: 'search'): void;
    (e: 'add'): void;
  }>();

  const onSearch = () => {
    emit('search');
  };
  const onAdd = () => {
    emit('add');
  };
</script>

<style lang="scss" scoped>
  $page-header: ();

  @include b(page-header) {
    @include set-component-css-var(page-header, $page-header);
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 63px;

    @include e(search) {
      width: 250px;
    }

    @include e(toolbar) {
      :deep(.ant-btn) {
        height: 36px;
        padding: 4px 12px;
      }
    }

    @include e(add) {
      > * {
        vertical-align: middle;
      }
      i {
        font-size: 9px;
        padding-right: 4px;
      }
    }
  }
</style>
