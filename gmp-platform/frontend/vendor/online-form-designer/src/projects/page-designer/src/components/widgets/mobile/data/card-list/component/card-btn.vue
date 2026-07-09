<template>
  <div class="btn-wrap">
    <div v-show="children.length > visibleButtons" class="btn-more" @click="showPicker = true">
      <IconNext
        :size="20"
        value="icon-park:more"
        :style="{
          marginRight: '0px',
          '--color': '#bfbfbf',
        }"
      />
    </div>
    <vantButton
      v-for="(el, i) in showBtnList"
      :widget="el"
      :key="i"
      :has-icon="el.props.hasIcon"
      :has-text="el.props.hasText"
      :icon="el.props.icon"
      :title="el.props.i18nConfig ? $t(JSON.parse(el.props.i18nConfig).title) : el.props.title"
      :size="el.props.size"
      :type="el.props.type"
      :danger="el.props.danger"
      :enableCustomColor="el.props.enableCustomColor"
      :fontColor="el.props.fontColor"
      :backgroundColor="el.props.backgroundColor"
    />
  </div>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue';
  import vantButton from '/@page-designer/components/widgets/mobile/__components__/vantButton.vue';
  import IconNext from '/@/components/Icon/src/IconNext.vue';
  import { BaseButton } from '/@/projects/page-designer/src/types/mobile';

  const defProps = defineProps({
    children: {
      type: Array<BaseButton>,
      default: () => [],
    },
    data: {
      type: Object,
      default: () => {},
    },
    visibleButtons: {
      type: Number,
      default: 1,
    },
  });
  const showPicker = ref(false);

  const showBtnList = computed(() => {
    return defProps.children.slice(0, defProps.visibleButtons).reverse();
  });
</script>
<style lang="scss" scoped>
  .btn-wrap {
    flex: 1;
    display: flex;
    flex-direction: row-reverse;
    & > div {
      & + div {
        margin-right: 8px;
      }
    }
  }
  .van-button {
    // height: auto;
    // padding: 7px 12px;
    // float: right;
  }
  .btn-more {
    // margin-left: 8px;
    .i-icon-more {
      position: relative;
      top: 6px;
    }
  }
</style>
