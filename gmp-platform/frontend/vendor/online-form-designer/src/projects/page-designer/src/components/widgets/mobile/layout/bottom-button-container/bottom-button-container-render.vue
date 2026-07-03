<template>
  <div
    v-if="btnList.length"
    :style="containerStyle"
    class="box-border relative overflow-hidden bottom-button-container-wrap"
  >
    <div class="bottom-button-content" :style="styleWrap" :key="btnList">
      <template v-if="btnList.length">
        <van-row :gutter="margin" v-if="btnList.length < 3">
          <template v-if="btnList.length === 1">
            <van-col span="24">
              <bottomBtnRender :widget="btnList[0]" />
            </van-col>
          </template>
          <template v-else-if="btnList.length === 2">
            <van-col span="12">
              <bottomBtnRender :widget="btnList[0]" />
            </van-col>
            <van-col span="12">
              <bottomBtnRender :widget="btnList[1]" />
            </van-col>
          </template>
        </van-row>
        <van-row v-else :wrap="false">
          <van-col span="4">
            <div class="btn-more" @click="onClickMore">
              <IconNext
                :size="20"
                value="icon-park:more-app"
                :style="{
                  marginRight: '0px',
                  '--color': '#797A7D',
                }"
              />
              <div class="btn-more-title mt8px"> {{ t('sys.pageDesigner.more') }} </div>
            </div>
          </van-col>
          <van-col span="6" offset="7" :style="{ 'margin-right': margin + 'px' }">
            <bottomBtnRender :widget="btnList[0]" />
          </van-col>
          <van-col span="6">
            <bottomBtnRender :widget="btnList[1]" />
          </van-col>
        </van-row>
      </template>
    </div>
  </div>

  <van-action-sheet v-model:show="show" :cancel-text="t('sys.cancel')" duration="0.1">
    <div class="content" @click="onCancel">
      <bottomBtnRender
        :widget="w"
        v-for="w in btnList"
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
  import { computed, reactive, toRef, ref } from 'vue';
  import { BottomButtonContainer } from '/@page-designer/types/mobile';
  import { useI18n } from '@mobile/utils/useI18n';
  import IconNext from '/@/components/Icon/src/IconNext.vue';
  import bottomBtnRender from './bottom-button-render.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  // import { useDisplayRuleOptions } from '/@web-render/render/Event/utils/displayRule';
  import { isEmpty } from 'lodash-es';
  import { tableWidgetToShow } from '/@web-render/render/Event/Dependency/useDependencyToShow';

  const Event = getPageEvent();
  const { processId, filterButton } = Event.ProcessAppRoved || {};
  const { t } = useI18n();
  const props = defineProps<{ widget: BottomButtonContainer }>();
  const { margin, processId: formProcessId } = reactive(props.widget.props);
  const children = toRef(() => {
    const _c = props.widget.children || [];
    if (formProcessId === processId && filterButton) {
      return Event.ProcessAppRoved!.filterButton(_c);
    }
    return _c;
  });
  const btnList = computed(() => {
    return children.value
      .map((e) => {
        tableWidgetToShow(e, (hid) => {
          e.props.hidden = hid;
        });
        return e;
      })
      .filter((e) => !e.props.hidden);
  });
  // const moreList = computed(() => btnList.value.slice(2));
  const containerStyle = computed(() => {
    const style = props.widget.style;
    return {
      height: style.height ? style.height + 'px' : 'auto',
      borderLeft: `${style.borderLeft?.borderWidth}px ${style.borderLeft?.borderStyle} ${style.borderLeft?.borderColor} !important`,
      borderRight: `${style.borderRight?.borderWidth}px ${style.borderRight?.borderStyle} ${style.borderRight?.borderColor} !important`,
      borderBottom: `${style.borderBottom?.borderWidth}px ${style.borderBottom?.borderStyle} ${style.borderBottom?.borderColor} !important`,
      borderTop: `${style.borderTop?.borderWidth}px ${style.borderTop?.borderStyle} ${style.borderTop?.borderColor} !important`,
      borderTopRightRadius: !style.borderTopRightRadius
        ? ''
        : style.borderTopRightRadius + 'px !important',
      borderTopLeftRadius: !style.borderTopLeftRadius
        ? ''
        : style.borderTopLeftRadius + 'px !important',
      borderBottomRightRadius: !style.borderBottomRightRadius
        ? ''
        : style.borderBottomRightRadius + 'px !important',
      borderBottomLeftRadius: !style.borderBottomLeftRadius
        ? ''
        : style.borderBottomLeftRadius + 'px !important',
      marginTop: isEmpty(style.marginTop) ? '' : style.marginTop + 'px !important',
      marginRight: isEmpty(style.marginRight) ? '' : style.marginRight + 'px !important',
      marginBottom: isEmpty(style.marginBottom) ? '' : style.marginBottom + 'px !important',
      marginLeft: isEmpty(style.marginLeft) ? '' : style.marginLeft + 'px !important',
    };
  });

  const styleWrap = computed(() => {
    const style = props.widget.style;
    return {
      backgroundColor: !style.backgroundColor ? '' : style.backgroundColor + ' !important',
      paddingTop: isEmpty(style.paddingTop) ? '' : Number(style.paddingTop) + 10 + 'px !important',
      paddingRight: isEmpty(style.paddingRight)
        ? ''
        : Number(style.paddingRight) + 16 + 'px !important',
      paddingBottom: isEmpty(style.paddingBottom)
        ? ''
        : Number(style.paddingBottom) + 6 + 'px !important',
      paddingLeft: isEmpty(style.paddingLeft)
        ? ''
        : Number(style.paddingLeft) + 16 + 'px !important',
    };
  });

  const show = ref(false);

  const onClickMore = () => {
    show.value = true;
  };
  const onCancel = () => {
    show.value = false;
  };
</script>
<style lang="less" scoped>
  .bottom-button-container-wrap {
    display: flex;
    z-index: 20;
    align-items: center;
    min-height: 40px;
    box-shadow: 0 -2px 10px 0 rgb(0 0 0 / 6%);

    .bottom-button-content {
      padding: 10px 16px 6px;
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
      font-size: var(--van-button-normal-font-size);
    }
  }
</style>
