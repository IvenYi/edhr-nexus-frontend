<template>
  <div
    class="box-border relative overflow-visible bottom-button-container-wrap"
    :class="[!children.length && 'is-empty']"
    :data-placeholder="t('sys.pageDesigner.operateButton')"
  >
    <template v-if="children.length">
      <van-row :gutter="computedMargin" v-if="children.length < 3">
        <template v-if="children.length === 1">
          <van-col span="24">
            <bottomBtnDesugn
              v-if="!isNewDesigner"
              :widget="children[0]"
              :parentWidget="widget"
              :parentList="children"
            />
            <BottomButtonDesign2
              v-if="isNewDesigner"
              :index="0"
              :widget="children[0]"
              :parentWidget="widget"
              :children="children"
            >
              <template #default="args">
                <slot name="item" v-bind="args"></slot>
              </template>
            </BottomButtonDesign2>
          </van-col>
        </template>
        <template v-else-if="children.length === 2">
          <van-col span="12">
            <bottomBtnDesugn
              v-if="!isNewDesigner"
              :widget="children[0]"
              :parentWidget="widget"
              :parentList="children"
            />
            <BottomButtonDesign2
              v-if="isNewDesigner"
              :index="0"
              :widget="children[0]"
              :parentWidget="widget"
              :children="children"
            >
              <template #default="args">
                <slot name="item" v-bind="args"></slot>
              </template>
            </BottomButtonDesign2>
          </van-col>
          <van-col span="12">
            <bottomBtnDesugn
              v-if="!isNewDesigner"
              :widget="children[1]"
              :parentWidget="widget"
              :parentList="children"
            />
            <BottomButtonDesign2
              v-if="isNewDesigner"
              :index="1"
              :widget="children[1]"
              :parentWidget="widget"
              :children="children"
            >
              <template #default="args">
                <slot name="item" v-bind="args"></slot>
              </template>
            </BottomButtonDesign2>
          </van-col>
        </template>
      </van-row>
      <van-row v-else :wrap="false">
        <van-col span="4">
          <div class="btn-more cursor-pointer" @click.stop="onClickMore">
            <IconNext
              :size="20"
              value="icon-park:more-app"
              :style="{
                marginRight: '0px',
                '--color': '#797A7D',
              }"
            />
            <div class="btn-more-title mt8px">
              {{ t('sys.pageDesigner.more') }}
            </div>
          </div>
        </van-col>
        <van-col span="6" offset="7" :style="{ 'margin-right': computedMargin + 'px' }">
          <bottomBtnDesugn
            v-if="!isNewDesigner"
            :widget="children[0]"
            :parentWidget="widget"
            :parentList="children"
          />
          <BottomButtonDesign2
            v-if="isNewDesigner"
            :index="0"
            :widget="children[0]"
            :parentWidget="widget"
            :children="children"
          >
            <template #default="args">
              <slot name="item" v-bind="args"></slot>
            </template>
          </BottomButtonDesign2>
        </van-col>
        <van-col span="6">
          <bottomBtnDesugn
            v-if="!isNewDesigner"
            :widget="children[1]"
            :parentWidget="widget"
            :parentList="children"
          />
          <BottomButtonDesign2
            v-if="isNewDesigner"
            :index="1"
            :widget="children[1]"
            :parentWidget="widget"
            :children="children"
          >
            <template #default="args">
              <slot name="item" v-bind="args"></slot>
            </template>
          </BottomButtonDesign2>
        </van-col>
      </van-row>
    </template>
  </div>
  <van-action-sheet
    :overlay-style="{ position: 'absolute' }"
    :show="true"
    :cancel-text="t('sys.cancel')"
    duration="0"
    v-if="show"
    teleport="#designerRootRef"
    class="gct-van-design-popup"
    zIndex="1000"
  >
    <div class="content" @click.stop="onCancel">
      <bottomBtnDesugn
        v-for="w in children"
        :parentList="children"
        :parentWidget="widget"
        :widget="w"
        :key="w.id"
        block
        type="default"
        class="gct-default"
        :danger="false"
      />
    </div>
  </van-action-sheet>
</template>
<script name="gct-bottom-button-container" setup lang="ts">
  import { toRefs, toRef, computed, ref, watch } from 'vue';
  import { BottomButtonContainer } from '/@page-designer/types/mobile';
  import { useI18n } from '/@/hooks/web/useI18n';
  import IconNext from '/@/components/Icon/src/IconNext.vue';
  import bottomBtnDesugn from './bottom-button-design.vue';
  import { BottomButtonDesign2 } from './bottom-button-design2';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';

  const { selectedWidget } = useSelectedWidget();
  const { t } = useI18n();
  const props = defineProps<{ widget: BottomButtonContainer; isNewDesigner: boolean }>();
  const { margin } = toRefs(props.widget.props);

  const computedMargin = computed(() => {
    return margin.value;
  });

  const children = toRef(() => props.widget.children || []);
  const show = ref(false);
  const moreList = computed(() => children.value.slice(2));
  const onClickMore = () => {
    show.value = true;
  };
  const onCancel = () => {
    show.value = false;
  };
  watch(selectedWidget, (v) => {
    if (!moreList.value.length) {
      show.value = false;
      return;
    }
    show.value = moreList.value.some((i) => i.id === v.id);
  });
</script>
<style lang="less" scoped>
  .bottom-button-container-wrap {
    display: flex;
    align-items: center;
    min-height: 60px;
    padding: 10px 16px 6px;
    box-shadow: 0 -2px 10px 0 rgb(0 0 0 / 6%);

    &.is-empty {
      &::before {
        content: attr(data-placeholder);
        display: flex;
        position: absolute;
        top: 0;
        left: 0;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background-color: #fbfbfc;
        color: #c3c3c3;
        pointer-events: none;
      }
    }

    > div {
      flex: 1;
    }

    .btn-more {
      display: flex;
      flex-flow: column;
      align-items: center;
      justify-content: center;
      height: 100%;

      &-title {
        color: #212528;
        font-size: 14px;
        line-height: 1;
      }
    }

    :deep(.van-button) {
      width: 100%;

      .van-button__content {
        width: 100%;

        .van-button__text {
          width: 100%;
          white-space: wrap;
        }
      }
    }
  }

  .is-selected {
    border: 1px solid var(--ant-primary-color) !important;
  }

  .widget-view-action {
    display: flex;
    position: absolute;
    z-index: 11;
    top: -1px;
    right: 0;
    // bottom: 0;
    align-items: center;
    height: 20px;
    // padding: 0 4px;
    background-color: var(--ant-primary-color-deprecated-f-12);
    line-height: 20px;

    .opt-icon {
      margin: 4px;
      color: var(--ant-primary-color);
      font-size: 14px;
      cursor: pointer;
    }
  }

  .gct-default {
    :deep(.van-button--default) {
      border: none;
    }
  }
</style>
<style>
  .gct-van-design-popup {
    position: absolute !important;
    transition: none;
  }
</style>
