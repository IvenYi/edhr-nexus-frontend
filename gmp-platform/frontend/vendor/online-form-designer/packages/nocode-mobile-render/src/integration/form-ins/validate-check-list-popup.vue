<template>
  <BasicPopup
    v-model:show="show"
    :popup-props="{ position: 'right', ...popupProps }"
    title="校验清单"
    :extraStyle="{
      width: '480px',
    }"
    :showFooter="false"
  >
    <div class="flex flex-col h-full w-full validate-check-list-popup">
      <div class="collapse" v-for="(group, i) in groupedByModelKey" :key="i">
        <div class="header flex justify-between">
          <div class="">
            <gct-icon
              @click="() => triggerExpanded(i)"
              :class="['arrow-icon', expandedKeys.includes(i) ? 'arrow-icon--expanded' : '']"
              value="icon-pad_arrow_down_tree"
              :size="16"
            />
            <span class="text font-bold">{{ group.showModelName }}/{{ group.showModelKey }}</span>
          </div>
          <div>
            <span
              class="sub-type-status"
              :style="{
                '--nocode-textColor': group.themeConfig?.textColor,
                '--nocode-bgColor': group.themeConfig?.background,
              }"
              >{{ group.themeConfig?.placeholder }}</span
            >
          </div>
        </div>
        <div class="list">
          <template v-for="field of group.fields" :key="field.targetFieldId">
            <template v-if="Array.isArray(field.messages)">
              <div class="list-item flex justify-between">
                <div class="label">{{ field.showFieldName }}/{{ field.targetFieldId }}</div>
                <div class="value">
                  <i class="iconfont icon-gongzuotai_buliangpinshu"></i>
                  <span class="message-title" v-for="(message, i) of field.messages" :key="i">
                    {{ message }}
                  </span>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="list-item" v-for="(messages, index) of field.messages" :key="index">
                <div class="label">{{ field.showFieldName }}/{{ field.targetFieldId }}</div>
                <div class="value">
                  <i class="iconfont icon-gongzuotai_buliangpinshu"></i>
                  <span class="message-title" v-for="(message, i) of field.messages" :key="i">
                    {{ message }}
                  </span>
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>
  </BasicPopup>
</template>

<script setup lang="ts" name="validate-check-list-popup">
  import { computed, ref, watch, watchEffect } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import { i18n } from '@mobile/locales/setupI18n';
  import { MobileFillTypeEnum } from '@gct/nocode-base';

  const { t } = i18n.global;
  const show = ref(true);

  const statusMap = {
    [MobileFillTypeEnum.MAIN_FIELD]: {
      textColor: '#309C41',
      background: 'rgba(48,156,65,0.2)',
      placeholder: '主模型',
    },
    [MobileFillTypeEnum.SUB_TABLE]: {
      textColor: '#742fb2',
      background: 'rgba(116, 47, 178, 0.2)',
      placeholder: '动态表',
    },
    [MobileFillTypeEnum.FIXED_TABLE]: {
      textColor: '#845832',
      background: 'rgba(132,88,50, 0.2)',
      placeholder: '固定表',
    },
    [MobileFillTypeEnum.SUB_TABLE_2D]: {
      textColor: '#6D82B0',
      background: '#E6EEFF',
      placeholder: '二维表',
    },
    [MobileFillTypeEnum.SUB_TABLE_2D_LINK]: {
      textColor: '#F77E4A',
      background: 'rgba(247,126,74,0.2)',
      placeholder: '二维表关联',
    },
    [MobileFillTypeEnum.CHECK_TABLE_2D]: {
      textColor: '#13C2C2',
      background: 'rgba(19,194,194,0.2)',
      placeholder: '检验表',
    },
    [MobileFillTypeEnum.CHECK_TABLE_2D_LINK]: {
      textColor: '#F77E4A',
      background: 'rgba(247,126,74,0.2)',
      placeholder: '检验表关联',
    },
  };

  const props = defineProps<{
    /** 错误信息集合 */
    errorMap: any;
    subTableInfo: any;
  }>();

  const groupedByModelKey = computed<any>(() => {
    const result = {};

    const addToSet = (map, key, val) => {
      if (!map[key]) map[key] = new Set();
      map[key].add(val);
    };

    for (const errorList of Object.values(props.errorMap)) {
      for (const { field, message: messageJson } of errorList as any[]) {
        const { showModelName, showModelKey, showFieldName, subFieldKey, targetFieldId, message } =
          JSON.parse(messageJson);

        if (!result[showModelKey]) {
          const info = props.subTableInfo.find((item) => item.field === subFieldKey);
          const themeConfig = statusMap[info?.subType ?? MobileFillTypeEnum.MAIN_FIELD];
          result[showModelKey] = {
            showModelName,
            showModelKey,
            subFieldKey,
            themeConfig,
            fields: {},
          };
        }

        const modelGroup = result[showModelKey];

        if (!modelGroup.fields[targetFieldId]) {
          modelGroup.fields[targetFieldId] = {
            showFieldName,
            targetFieldId,
            linkFields: targetFieldId === 'value_' ? {} : new Set(),
            messages: targetFieldId === 'value_' ? {} : new Set(),
          };
        }

        const fieldGroup = modelGroup.fields[targetFieldId];

        if (targetFieldId === 'value_') {
          const m = field.match(/^(.*_value_)_(\d+)$/);
          if (!m) continue;
          const groupKey = m[1];
          addToSet(fieldGroup.linkFields, groupKey, field);
          addToSet(fieldGroup.messages, groupKey, message);
        } else {
          fieldGroup.linkFields.add(field);
          fieldGroup.messages.add(message);
        }
      }
    }

    for (const model of Object.values(result) as any[]) {
      for (const field of Object.values(model.fields) as any[]) {
        if (field.targetFieldId === 'value_') {
          for (const key in field.linkFields) {
            field.linkFields[key] = [...field.linkFields[key]];
            field.messages[key] = [...field.messages[key]];
          }
        } else {
          field.linkFields = [...field.linkFields];
          field.messages = [...field.messages];
        }
      }
    }
    return result;
  });

  /** 展开的分组 */
  const expandedKeys = ref(Object.keys(groupedByModelKey.value));

  /** 切换展开状态 */
  const triggerExpanded = (key) => {
    if (expandedKeys.value.includes(key)) {
      expandedKeys.value = expandedKeys.value.filter((item) => item !== key);
    } else {
      expandedKeys.value.push(key);
    }
  };
</script>

<style lang="less" scoped>
  .validate-check-list-popup {
    background: #f7f8fa;
    padding: 16px;
    --van-field-input-text-color: #a6a6a6;
    --van-search-left-icon-color: #5a5f6b;
    --van-cell-group-background: transparent;
    overflow: auto;

    .sub-type-status {
      display: inline-block;
      padding: 0 6px;
      line-height: 22px;
      color: var(--nocode-textColor);
      background: var(--nocode-bgColor);
      border-radius: 4px 4px 4px 4px;
    }

    .arrow-icon {
      transition: transform 0.3s;
      transform: rotate(-90deg);
    }
    .arrow-icon--expanded.arrow-icon {
      transform: rotate(0);
    }

    .collapse {
      background: #ffffff;
      border-radius: 8px 8px 8px 8px;

      & ~ & {
        margin-bottom: 16px;
      }
    }

    .header {
      padding: 16px;
      border-bottom: 1px solid #e0e3eb;
    }

    .list {
      padding: 0 16px;
      .list-item {
        padding: 16px 0;
        &:nth-child(n + 2) {
          border-top: 1px solid #e0e3eb;
        }

        .label {
          font-size: 14px;
          color: #1a1d23;
        }

        .value {
          line-height: 18px;
          .iconfont {
            font-size: 14px;
          }
          font-size: 14px;
          color: #f54547;
        }
      }
    }
  }
</style>
