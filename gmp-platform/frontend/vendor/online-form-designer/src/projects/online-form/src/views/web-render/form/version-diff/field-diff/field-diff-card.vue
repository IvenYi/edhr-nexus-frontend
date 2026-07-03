<template>
  <div class="field-card" :class="[data.type]">
    <div class="field-card-title ell">
      {{ $t(`sys.webRender.fieldDiffType.${data.type}`) }}
    </div>
    <div class="field-card-main">
      <div class="attr-item">
        <div class="attr-item-label">{{ $t('sys.FieldName') }}</div>
        <div class="ell" :title="data.fieldName">{{ data.fieldName }}</div>
      </div>
      <div class="attr-item">
        <div class="attr-item-label">{{ $t('sys.model.viewFieldKey') }}</div>
        <div class="ell" :title="data.fieldKey">{{ data.fieldKey }}</div>
      </div>
      <div v-show="data.type === FieldDiffType.REMOVE" class="attr-item">
        <div class="attr-item-label">{{ $t('sys.model.viewFieldType') }}</div>
        <div class="ell" :title="$t(`sys.model.${data.fieldType}`)">{{
          $t(`sys.model.${data.fieldType}`)
        }}</div>
      </div>
      <div v-if="items.length" class="ks-column gap-4px mb-8px">
        <component
          v-for="(item, i) in items"
          :key="i"
          :is="compMaps[DiffedAttrCompsEnum[item.compType]]"
          :data="{ ...item, fieldType: data.fieldType }"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup name="field-diff-list">
  import { FieldDiffType, DiffedAttrCompsEnum } from '../index/types';
  import compMaps from './attrs/index';
  import { computed } from 'vue';

  const props = defineProps<{
    data: any;
  }>();

  const items = computed(() => {
    return props.data.type === FieldDiffType.REMOVE ? [] : props.data.diffArr || [];
  });
</script>
<style lang="less" scoped>
  .field-card {
    --color: #026ac8;
    font-size: 12px;
    color: #1a1d23;
    line-height: 18px;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.08);
    border: 1px solid transparent;

    &:hover {
      box-shadow: 0px 12px 24px 0px rgba(0, 0, 0, 0.24);
    }
    &.REMOVE {
      --color: #f54547;
      &.REMOVE:hover {
        box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.08);
      }
    }
    &.UPDATE {
      --color: #ff9442;
    }

    &.selected {
      border-color: var(--color);

      .field-card-title {
        background-color: rgba(from var(--color) r g b / 8%);
        border-color: rgba(from var(--color) r g b / 30%);
      }
    }

    & + & {
      margin-top: 8px;
    }

    &-title {
      font-weight: bold;
      border-bottom: 1px solid #f2f5f8;
      padding: 8px 12px;

      &::before {
        content: ' ';
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: var(--color);
        margin-right: 6px;
        vertical-align: middle;
      }
    }

    &-main {
      padding: 12px 8px 0 8px;
      display: flex;
      flex-direction: column;

      .attr-item {
        margin: 0 4px 12px;
        display: flex;
        justify-content: space-between;
        column-gap: 12px;

        &-label {
          width: 100px;
          flex-shrink: 0;
        }
      }
    }
  }
</style>
