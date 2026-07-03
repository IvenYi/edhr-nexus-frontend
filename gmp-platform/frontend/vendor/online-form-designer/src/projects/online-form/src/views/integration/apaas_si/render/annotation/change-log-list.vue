<template>
  <div
    v-if="showButtonKeys.includes('annotate-button')"
    class="cl"
    :class="showAnnotation ? 'cl--open' : 'cl--closed'"
    :style="{ width: showAnnotation ? '280px' : '32px' }"
  >
    <span class="cl__toggle" @click="handleFormAnnotate" aria-label="toggle">
      <span class="cl__toggle-icon">
        <i class="gct-iconfont icon-zujianziduan-youjiantou2"></i>
      </span>
    </span>

    <div class="cl__title-wrap">
      <div class="cl__title" :title="titleText">{{ titleText }}</div>
    </div>

    <div class="cl__list" v-if="showAnnotation">
      <template v-if="annotationItems?.length">
        <Scrollbar class="px-16px pb-16px">
          <article
            class="cl__item"
            v-for="item in annotationItems"
            :key="item.id"
            role="group"
            :aria-label="item.changeType"
          >
            <header class="cl__hdr">
              <div class="cl__hdr-title">{{
                t(`sys.onlineForm.AnnotationChangeType.${item.changeType}`)
              }}</div>
              <div class="cl__hdr-flag" v-if="item.isCurrentChange">{{
                $t('sys.onlineForm.thisChange')
              }}</div>
            </header>

            <div class="cl__user">
              <Avatar
                class="cl__avatar"
                :name="item.userName"
                :avatar="item.avatarUrl"
                direction="horizontal"
              />
              <time class="cl__time" :dateTime="item.time">{{ item.time }}</time>
            </div>

            <div v-if="item.reason" class="cl__row">
              <div class="cl__label" :class="item.changeType"
                >{{ getReasonLabel(item.changeType) }}：</div
              >
              <div class="cl__info-val">{{ item.reason }}</div>
            </div>

            <div v-if="item.beforeLabel" class="cl__row">
              <div class="cl__label before">{{ t('sys.appDesigner.beforeUpdate') }}：</div>
              <div class="cl__info-val">{{ item.beforeLabel }}</div>
            </div>

            <div v-if="item.afterLabel" class="cl__row">
              <div class="cl__label after">{{ t('sys.appDesigner.afterUpdate') }}：</div>
              <div class="cl__info-val">{{ item.afterLabel }}</div>
            </div>

            <div
              v-for="(s, idx) of item.signList"
              :key="s.signHistoryId"
              :class="['cl__row', 'cl__sign-row', { 'cl__sign-row--first': idx === 0 }]"
            >
              <div class="cl__label">{{ (signLabel?.[idx] || '') + t('sys.model.sign') }}：</div>
              <img class="cl__sign-img" :src="getPreviewUrl(s.url, s.fullname)" alt="" />
            </div>
          </article>
        </Scrollbar>
      </template>
      <div v-else class="nocode-common-loading-warp">
        <a-empty :description="$t('sys.noData')" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="change-log-list">
  import { computed, ref, watch } from 'vue';
  import { useNamespace, FIELD_TYPE } from '@gct/runtime';
  import { uuid2 } from '/@/utils/uuid';
  import { Empty } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Scrollbar } from '/@/components/Scrollbar';
  import { BuiltinAction, ChangeType } from './use-annotation';
  import { getPreviewUrl } from '/@/components/Signature';
  import Avatar from '/@/components/Avatar/avatar.vue';
  import { OnlineFormChangeHistoryResponse } from '/@/apis/gct-apaas/model';

  const { t } = useI18n();

  interface AnnotationItem {
    id: string;
    /** 是否是当前更改 */
    isCurrentChange: boolean;
    /** 头部标题 */
    changeType: string;
    /** 头像 */
    avatarUrl: string;
    /** 用户名 */
    userName: string;
    /** 操作时间 */
    time: string;
    /** 签名图片列表 */
    signList?: Array<{
      type: string;
      url: string;
      signHistoryId: string;
      username: string;
      fullname: string;
    }>;

    /** 原因 */
    reason?: string;
    /** 变更前的值 */
    beforeLabel?: string;
    /** 变更后的值 */
    afterLabel?: string;
  }

  const props = withDefaults(
    defineProps<{
      /** 显示按钮key集合 */
      showButtonKeys: string[];
      /** 显示表单批注 */
      showAnnotation?: boolean;
      /** 正在进行表单变更 */
      formChanging?: boolean;
      items?: Array<OnlineFormChangeHistoryResponse>;
      cellLocation?: string;
      paramExtraProps: any;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'clickAction', action: BuiltinAction): void;
  }>();

  const titleText = $t('sys.edhr.changeRecords');

  const signLabel: Record<number, string> = {
    0: $t('sys.edhr.applicant'),
    1: $t('sys.edhr.verifier'),
  };

  /** 所有单元格位置对应的变更数据 */
  const annotationItemMap = new Map<string, AnnotationItem[]>();
  /** 父级批注消息记录 */
  const parentAnnotationItems = ref<AnnotationItem[]>([]);
  /** 当前展示的单元格变更批注数据 */
  const annotationItems = computed(() => {
    const list =
      (props.cellLocation
        ? annotationItemMap.get(props.cellLocation)
        : parentAnnotationItems.value) || [];
    if (props.paramExtraProps?._gct_form_change_approval_handle_) {
      return list?.filter((item) => item.isCurrentChange);
    }
    return list;
  });

  console.log('annotationItems', annotationItems);

  watch(
    () => props.items,
    (val) => {
      if (val) {
        // 清除旧数据
        parentAnnotationItems.value = [];
        annotationItemMap.clear();
        val.forEach((item) => {
          parentAnnotationItems.value.push({
            id: item.id!,
            isCurrentChange: item.isCurrentChange,
            changeType: item.changeType!,
            avatarUrl: item.avatar!,
            userName: item.createUserName!,
            time: item.createTime!,
            reason: item.reason,
            signList: JSON.parse(item.signInfo || '[]'),
          });
          if (item.changeType === ChangeType.Form && item.details?.length) {
            item.details.forEach((detail) => {
              const cellLocation = detail.cellLocation!;
              if (!annotationItemMap.has(cellLocation)) {
                annotationItemMap.set(cellLocation, []);
              }

              let beforeLabel = detail.beforeLabel;
              let afterLabel = detail.afterLabel;
              if (
                detail.cellType === FIELD_TYPE.SIGNATURE ||
                detail.cellType === FIELD_TYPE.WAREHOUSE_MANAGER ||
                detail.cellType === FIELD_TYPE.REPORTER
              ) {
                const beforeO = JSON.parse(detail.beforeLabel || '[]');
                const afterO = JSON.parse(detail.afterLabel || '[]');
                beforeLabel = beforeO?.map((item) => item.username).join(',');
                afterLabel = afterO?.map((item) => item.username).join(',');
              }
              annotationItemMap.get(cellLocation)!.push({
                id: detail.id! || uuid2(16),
                isCurrentChange: item.isCurrentChange,
                changeType: item.changeType!,
                avatarUrl: item.avatar!,
                userName: item.createUserName!,
                time: item.createTime!,
                signList: JSON.parse(item.signInfo || '[]'),
                beforeLabel: beforeLabel,
                afterLabel: afterLabel,
              });
            });
          }
        });
      }
    },
    { immediate: true },
  );

  const getReasonLabel = (changeType) => {
    return changeType === ChangeType.Abandon
      ? t('sys.onlineForm.formAbandonReason')
      : t('sys.onlineForm.formChangeReason');
  };

  const handleFormAnnotate = () => {
    if (props.showAnnotation) {
      emit('clickAction', BuiltinAction.CloseAnnotation);
    } else {
      emit('clickAction', BuiltinAction.ShowAnnotation);
    }
  };
</script>

<style lang="less" scoped>
  .cl {
    position: relative;
    background: #f7f8fa;
    flex-shrink: 0;
    transition: width 0.28s ease;
    display: flex;
    flex-direction: column;
    height: 100%;

    &--closed {
    }
    &--open {
    }

    &__toggle {
      line-height: 1;
      cursor: pointer;
      position: absolute;
      left: -20px;
      top: 80px;
      padding: 16px 2px;
      background: #f7f8fa;
      border-radius: 10px 0 0 10px;
      z-index: 10;
      border: none;

      &:hover {
        .gct-iconfont {
          color: #026ac8;
        }
      }
    }

    &__toggle-icon {
      display: inline-block;
      transition: transform 0.3s;
    }

    &--closed .cl__toggle-icon {
      transform: rotate(180deg);
    }

    &--closed .cl__title-wrap {
      padding: 20px 8px;
    }

    &__title-wrap {
      padding: 16px;
    }
    &__title {
      font-weight: 500;
      color: #212528;
      font-size: 14px;
      min-width: 0;
      letter-spacing: 0;
      overflow-wrap: anywhere;
    }

    &__list {
      overflow: hidden;
      height: 100%;
    }

    &__item {
      background: #fff;
      border-radius: 4px;
      margin-top: 12px;
      overflow: hidden;
      &:first-child {
        margin-top: 0;
      }
      padding-bottom: 8px;
    }

    &__hdr {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      background: rgba(49, 104, 236, 0.08);
      color: #212528;
    }
    &__hdr-title {
      font-weight: 500;
    }
    &__hdr-flag {
      background: #fcfcfc;
      border-radius: 4px;
      font-size: 10px;
      color: #1d68fd;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    &__user {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 8px;
      gap: 8px;
    }

    ::v-deep .gct-avatar__name {
      color: #252525;
    }

    &__time {
      font-size: 12px;
      color: #666;
    }

    &__row {
      display: flex;
      padding: 6px 8px;
      gap: 8px;
      align-items: flex-start;
    }

    &__label {
      flex: 0 0 auto;
      font-size: 12px;
      color: #666;
      line-height: 18px;
      width: 72px;
      word-break: keep-all;
      &.before,
      &.Form {
        color: #0052d9;
      }
      &.after,
      &.Abandon {
        color: #088c49;
      }
    }

    &__info-val {
      flex: 1 1 auto;
      min-width: 0;
      font-size: 12px;
      color: #666;
      line-height: 18px;
      overflow-wrap: anywhere;
      word-break: break-word;
      white-space: pre-wrap;
    }

    &__sign-row {
      margin: 4px 8px;
      padding: 0px;
      padding-top: 8px;

      &--first {
        border-top: 1px solid #e8ecf0;
      }
    }

    &__sign-img {
      width: 100%;
      height: auto;
      display: block;
      max-width: 140px;
      object-fit: contain;
    }
  }
</style>
