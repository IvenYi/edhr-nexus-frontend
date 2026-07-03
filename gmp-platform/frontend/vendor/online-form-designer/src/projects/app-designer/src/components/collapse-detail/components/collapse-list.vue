<template>
  <a-descriptions :class="isHead ? 'item' : 'desc-area'" :column="column || 3">
    <template v-for="(item, index) in descData" :key="index">
      <a-descriptions-item
        :label="item.label"
        :span="getSpan(item.span)"
        :contentStyle="ellipsisStyle(item)"
      >
        <template v-if="item.useSlot && item.slotName && $slots[item.slotName]">
          <slot :name="item.slotName" :item="item" :slotData="item.slotData"></slot>
        </template>
        <template v-else-if="item.render">
          <template v-if="item.render === 'link_render'">
            <span v-if="item.name" :title="item.name">
              {{ item.name }}
            </span>
            <a-tag v-else color="error">
              {{ $t('sys.onlineForm.noAssociation') }}
            </a-tag>
          </template>
          <template v-if="item.render === 'status_render'">
            <InstanceStatusLabel :instance-status="item.name" />
          </template>
          <template v-if="item.render === 'change_status_render'">
            <EnumTagLabel :value="item.name" :model="item.model" />
          </template>
          <template v-if="item.render === 'label_tag_render'">
            <LabelTag v-for="(tag, i) in item.tagList" :key="i" :data="tag" />
          </template>
        </template>
        <copy-module-key v-else-if="item.isCopy" :moduleKey="item.key" />
        <template v-else>
          <span :title="item.name" :class="{ 'mr-4px': item.hasTag }">
            {{ item.name }}
          </span>
          <template v-if="item.hasTag">
            <a-tag v-for="tag in item.tagList" :key="tag.key" :color="tag?.color">
              {{ tag.name }}
            </a-tag>
          </template>
        </template>
      </a-descriptions-item>
    </template>
  </a-descriptions>
</template>

<script setup lang="ts">
  import { type CollapseItem } from '../typing';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import { InstanceStatusLabel } from '/@online-form/views/integration/apaas_ebr/index';
  import LabelTag from '/@online-form/views/integration/apaas_ebr/record-book/editor/common/label-tag.vue';
  import EnumTagLabel from './enum-tag-label.vue';

  const props = defineProps<{
    descData: CollapseItem[];
    isHead?: boolean;
    column?: number;
  }>();

  const getSpan = (span = 1) => {
    if (span > 3) return 3;
    return span;
  };

  const ellipsisStyle = (item: CollapseItemType) => {
    if (!item.ellipsis) {
      return {};
    }
    return {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'inline-block',
    };
  };
</script>

<style lang="less" scoped></style>
