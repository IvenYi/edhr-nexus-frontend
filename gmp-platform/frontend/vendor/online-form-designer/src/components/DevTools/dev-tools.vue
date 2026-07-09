<template>
  <div :class="[ns.b()]" v-if="state.enableDevTool">
    <iconNext
      :class="ns.e('action')"
      value="iconfont:icon-bianji"
      @click="onEditPage"
      title="编辑页面"
      v-bind="iconProps"
    />
    <iconNext
      :class="ns.e('action')"
      value="iconfont:icon-zujian"
      @click="onEditWidget"
      title="编辑当前组件"
      v-bind="iconProps"
    />
    <iconNext
      :class="ns.e('action')"
      value="iconfont:icon-shezhi"
      @click="onLogClick"
      title="控制台输出"
      v-bind="iconProps"
    />
    <PatchModifyPopover title="预置脚本" :class="ns.e('action')" v-bind="iconProps" />
  </div>
</template>

<script lang="ts" setup name="dev-tools">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { editPage } from './page-editor';
  import { editWidget } from './widget-editor';
  import PatchModifyPopover from './patch-modify/patch-modify-popover.vue';
  import { useDevToolStore } from './store/index';
  import { reactive, computed, watch, onMounted, ref } from 'vue';

  const iconProps = reactive({
    color: 'rgb(33, 37, 40)',
  });

  const { t } = useI18n();
  const ns = useNamespace('dev-tools');
  const { state } = useDevToolStore();

  const { setSelectedWidget } = useSelectedWidget();

  const controller = {
    setWidget(widget) {
      setSelectedWidget(widget);
    },
  };

  const onEditPage = () => {
    editPage();
  };
  const onEditWidget = () => {
    editWidget();
  };

  const onLogClick = () => {
    const { pageJson } = useDesigner();
    const { selectedRef } = useSelectedWidget();
    console.log('控制器：', controller);
    console.log('页面对象', pageJson);
    console.log('当前对象：', selectedRef.value);
  };
</script>

<style lang="scss" scoped>
  $dev-tools: ();

  @include b(dev-tools) {
    @include set-component-css-var(dev-tools, $dev-tools);
    color: rgb(33, 37, 40);
    margin: 0 24px;
    --color: rgb(33, 37, 40);

    @include e(action) {
      cursor: pointer;
      & ~ & {
        margin-left: 8px;
      }
    }
  }
</style>
