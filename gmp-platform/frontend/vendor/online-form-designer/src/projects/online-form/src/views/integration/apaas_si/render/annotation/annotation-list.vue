<template>
  <div :class="[ns.b()]">
    <div :class="[ns.e('item')]" v-for="item in annotationItems" :key="item.id">
      <div :class="[ns.e('item-header')]">
        {{ t(`sys.onlineForm.AnnotationChangeType.${item.changeType}`) }}
      </div>
      <div :class="ns.e('user-info')">
        <Avatar
          :class="[ns.e('avatar')]"
          :name="item.userName"
          :avatar="item.avatarUrl"
          direction="horizontal"
        />
        <span :class="[ns.e('time')]">{{ item.time }}</span>
      </div>
      <div v-if="item.reason" :class="[ns.e('reason')]">
        <span :class="[ns.e('label')]">{{ getReasonLabel(item.changeType) }}：</span>
        <div :class="[ns.e('value')]">{{ item.reason }}</div>
      </div>
      <div v-if="item.beforeLabel" :class="[ns.e('before-value')]">
        <span :class="[ns.e('label')]">{{ t('sys.appDesigner.beforeUpdate') }}：</span>
        <div :class="[ns.e('value')]">{{ item.beforeLabel }}</div>
      </div>
      <div v-if="item.afterLabel" :class="[ns.e('after-value')]">
        <span :class="[ns.e('label')]">{{ t('sys.appDesigner.afterUpdate') }}：</span>
        <div :class="[ns.e('value')]">{{ item.afterLabel }}</div>
      </div>

      <div
        v-for="(i, index) of item.signList"
        :key="i.signHistoryId"
        :class="[ns.e('item-footer')]"
      >
        <span :class="[ns.e('label')]"
          >{{ (signLabel?.[index] || '') + t('sys.model.sign') }}：</span
        >
        <img :class="[ns.e('sign-img')]" :src="getPreviewUrl(i.url, i.username)" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="Demo">
  import { useNamespace, FIELD_TYPE } from '@gct/runtime';
  import Avatar from '/@/components/Avatar/avatar.vue';
  import { getPreviewUrl } from '/@/components/Signature';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { OnlineFormChangeHistoryResponse } from '/@/apis/gct-apaas/model';
  import { computed, ref, watch } from 'vue';
  import { ChangeType } from './use-annotation';

  const { t } = useI18n();

  const ns = useNamespace('annotation-list');

  export interface AnnotationItem {
    id: string;
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
    }>;

    /** 原因 */
    reason?: string;
    /** 变更前的值 */
    beforeLabel?: string;
    /** 变更后的值 */
    afterLabel?: string;
  }

  const signLabel = {
    0: $t('sys.edhr.applicant'),
    1: $t('sys.edhr.verifier'),
  };

  const props = withDefaults(
    defineProps<{
      items?: Array<OnlineFormChangeHistoryResponse>;
      cellLocation?: string;
    }>(),
    {},
  );

  /** 所有单元格位置对应的变更数据 */
  const annotationItemMap = new Map<string, AnnotationItem[]>();
  /** 父级批注消息记录 */
  const parentAnnotationItems = ref<AnnotationItem[]>([]);
  /** 当前展示的单元格变更批注数据 */
  const annotationItems = computed(() =>
    props.cellLocation ? annotationItemMap.get(props.cellLocation) : parentAnnotationItems.value,
  );

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
                id: detail.id!,
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
</script>

<style lang="scss" scoped>
  $annotation-list: (
    height: auto,
  );

  @include b(annotation-list) {
    @include set-component-css-var(annotation-list, $annotation-list);
    height: getCssVar(annotation-list, height);
    background: #f7f8fa;
    padding: 16px;
    overflow: auto;

    // 头像样式
    .#{bem(avatar)} {
      #{getCssVarName(avatar,size)}: 26px;
    }

    @include e(item) {
      & ~ & {
        margin-top: 16px;
      }

      background: #ffffff;
      border-radius: 4px;
    }

    @include e(item-header) {
      font-weight: 500;
      font-size: 14px;
      color: #212528;
      line-height: 32px;
      background: rgba(49, 104, 236, 0.1);
      padding-left: 8px;
    }

    @include e(user-info) {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 4px 0 8px 3px;
    }

    @include e(time) {
      font-weight: 400;
      font-size: 12px;
      color: #666666;
      margin-right: 16px;
    }

    @include e(item-footer) {
      padding-bottom: 16px;
      &:not(:last-child) {
        padding-bottom: 6px;
      }
    }

    @include e(label) {
      font-weight: 400;
      font-size: 12px;
      color: #666666;
      line-height: 18px;
      margin-left: 8px;
      flex: 0 0 auto;
    }

    @include e(value) {
      font-weight: 400;
      font-size: 12px;
      color: #666666;
      line-height: 18px;
    }

    @include e(before-value) {
      display: flex;
      margin-bottom: 20px;
      .#{bem(annotation-list,label)} {
        color: #3168ec;
      }
    }

    @include e(reason) {
      display: flex;
      padding-bottom: 8px;
      .#{bem(annotation-list,label)} {
        color: #666666;
      }
    }

    @include e(after-value) {
      display: flex;
      padding-bottom: 8px;
      position: relative;
      &::after {
        content: '';
        display: block;
        height: 1px;
        width: calc(100% - 16px);
        background-color: #e8ebf0;
        position: absolute;
        bottom: 0;
        left: 8px;
      }
      margin-bottom: 12px;
      .#{bem(annotation-list,label)} {
        color: #088c49;
      }
    }

    @include e(sign-img) {
      width: 71px;
      height: 28px;
    }
  }
</style>
