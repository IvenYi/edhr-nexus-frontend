<template>
  <div>
    <van-collapse
      :lazy-render="false"
      v-model="activeName"
      :style="{
        '--van-cell-vertical-padding': '0',
        '--van-cell-horizontal-padding': '0',
        '--van-padding-md': '0',
        '--van-cell-border-color': '#EAEAEA',
        '--van-collapse-item-content-padding': '0',
        '--van-cell-text-color': '#000000',
        '--van-cell-background': style.backgroundColor ? style.backgroundColor : 'transparent',
      }"
    >
      <van-collapse-item
        name="1"
        :readonly="props.isSupportFold === '0'"
        class="gct-vant-item"
        :style="{
          '--van-collapse-item-content-background': style.backgroundColor
            ? style.backgroundColor
            : 'transparent',
          '--van-cell__right-icon-right': (style.paddingRight || 12) + 'px',
          '--van-cell-border-color': 'transparent',
        }"
      >
        <template #title>
          <van-row
            :style="{
              paddingTop: (style.paddingTop || 0) + 'px',
              paddingBottom: '0',
              paddingLeft: (style.paddingLeft || 0) + 'px',
              paddingRight: (style.paddingRight || 0) + 'px',
            }"
          >
            <van-col
              class="header-title"
              :span="props.isSupportFold === '1' ? 24 : 12"
              :style="{
                textAlign: style.labelFont?.align,
                textAlignLast: style.labelFont?.align,
                paddingRight:
                  props.isSupportFold === '1' &&
                  (style.labelFont?.align === 'right' || style.labelFont?.align === 'justify')
                    ? '32px'
                    : 0,
              }"
            >
              <span
                class="gct-text-overflow w100%"
                style="display: inline-block; vertical-align: middle"
              >
                <IconNext
                  :size="16"
                  :value="props.icon"
                  :color="props.color"
                  :style="titleStyleAttr"
                  style="margin-left: 2px; vertical-align: text-bottom"
                />
                <span class="collapse-txt" :style="titleStyleAttr">{{ props.title }}</span>
              </span>
            </van-col>
            <van-col v-show="props.isSupportFold === '0'" span="12" class="gct-vant-col-item pl4px">
              <slot :children="widget.children[1]?.children"></slot>
            </van-col>
          </van-row>
        </template>
        <div :style="divStyleAttr" class="overflow-y-auto">
          <slot :children="widget.children[0]?.children"></slot>
        </div>
      </van-collapse-item>
    </van-collapse>
  </div>
</template>
<script setup lang="ts" name="gct-collapse">
  import { ref, toRefs, computed } from 'vue';
  import { Collapse } from '/@page-designer/types/mobile';
  import IconNext from '/@/components/Icon/src/IconNext.vue';

  const activeName = ref(['1']);
  const defProps = defineProps<{ widget: Collapse }>();
  const { props, style } = toRefs(defProps.widget);

  if (props.value.isSupportFold === '1' && props.value.defaultFold) activeName.value = [];
  else activeName.value = ['1'];
  const titleStyleAttr = computed(() => {
    return {
      fontSize: style.value.labelFont?.fontSize ? style.value.labelFont?.fontSize + 'px' : '14px',
      fontWeight: style.value.labelFont?.bold ? 'bold' : 'normal',
      color: style.value.labelFont?.color,
      fontStyle: style.value.labelFont?.italic ? 'italic' : 'normal',
      textDecoration: style.value.labelFont?.textDecoration,
    };
  });
  const divStyleAttr = computed(() => {
    return {
      // paddingTop: (style.value.paddingTop || 0) + 'px',
      paddingRight: (style.value.paddingRight || 0) + 'px',
      paddingBottom: (style.value.paddingBottom || 0) + 'px',
      paddingLeft: (style.value.paddingLeft || 0) + 'px',
      height: style.value.height ? style.value.height + 'px' : 'auto',
    };
  });
</script>
<style lang="scss" scoped>
  .gct-vant-item {
    :deep(.van-collapse-item__title) {
      position: relative;
      .van-cell__right-icon {
        position: absolute;
        right: var(--van-cell__right-icon-right);
        bottom: 7px;
        line-height: var(--van-cell-line-height);
        // height: auto;
      }
      &.van-cell {
        padding: 0;
        line-height: 32px;
      }
    }

    :deep(.van-collapse-item__content) {
      background-color: transparent;
    }
  }

  .header-title {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 6px;
    position: relative;
    &::before {
      position: absolute;
      left: 0;
      top: 50%;
      content: '';
      width: 3px;
      height: 16px;
      background: var(--van-primary-color);
      transform: translate(0, -50%);
    }
    .collapse-txt {
      font-size: 16px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
      margin-left: 4px;
    }
  }
  :deep(.van-hairline--top-bottom:after) {
    border: 0;
  }
</style>
