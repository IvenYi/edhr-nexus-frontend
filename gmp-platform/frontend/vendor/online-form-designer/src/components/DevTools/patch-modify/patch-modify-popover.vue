<template>
  <span :class="[ns.b()]">
    <a-popover placement="rightBottom" :visible="visible">
      <template #content>
        <div>
          <template v-if="selectedRef && WidgetPatch[selectedRef.type!]">
            <a
              v-for="item in WidgetPatch[selectedRef.type!]"
              :key="item.title"
              @click="item.handle(selectedRef)"
              :class="[ns.e('item')]"
            >
              {{ item.title }}
            </a>
          </template>
          <template v-if="!selectedRef.type">
            <a
              v-for="item in PagePatch"
              :key="item.title"
              @click="item.handle(pageJson)"
              :class="[ns.e('item')]"
            >
              {{ item.title }}
            </a>
          </template>
        </div>
      </template>
      <iconNext @click="changeVisible" v-bind="$attrs" value="iconfont:icon-debug" />
    </a-popover>
  </span>
</template>

<script lang="ts" setup name="patch-modify-popover">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { WidgetPatch, PagePatch } from './constant';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { reactive, computed, watch, onMounted, ref } from 'vue';

  const visible = ref(false);

  const changeVisible = () => {
    visible.value = !visible.value;
  };

  const { pageJson, currentPanel } = useDesigner();

  const { t } = useI18n();
  const ns = useNamespace('patch-modify-popover');
  const { selectedRef } = useSelectedWidget();
  console.log('当前对象：', selectedRef.value);
</script>

<style lang="scss" scoped>
  $patch-modify-popover: ();

  @include b(patch-modify-popover) {
    @include set-component-css-var(patch-modify-popover, $patch-modify-popover);
    @include e(item) {
      display: block;
      width: 200px;
      cursor: pointer;
      overflow: hidden;
      text-wrap: nowrap;
      text-overflow: ellipsis;
    }
  }
</style>
