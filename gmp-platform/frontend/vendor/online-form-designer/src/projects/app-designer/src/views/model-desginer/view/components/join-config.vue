<template>
  <div class="join-config-wrapper">
    <!-- <div class="join-config-item is-master">
      <div class="join-config-item-header">
        <span class="join-config-label">{{ t('sys.model.viewMainModel') }}</span>
        <div class="join-config-item-header-container">
          <a-select
            class="join-config-select"
            v-model:value="joinConfig.mainModelKey"
            style="width: 100%"
            :placeholder="t('sys.chooseText')"
            @change="changeMainModel"
            :showSearch="true"
            optionFilterProp="fieldName"
            :disabled="readonly"
          >
            <a-select-opt-group v-for="(models, modelType) in entityList" :key="modelType">
              <template #label>
                <span>
                  {{ t(`sys.model.${modelType}`) }}
                </span>
              </template>
              <a-select-option
                v-for="model in models"
                :key="model.key"
                :value="model.key"
                :fieldName="model.name"
                >{{ model.name }}</a-select-option
              >
            </a-select-opt-group>
          </a-select>
          <div class="add-action" v-if="!readonly">
            <a-button
              type="link"
              class="add-button"
              :ghost="false"
              :disabled="!joinConfig.mainModelKey"
              @click="onAddJoin"
            >
              <template #icon>
                <i class="iconfont icon-chuangjian mr-8px"></i>
              </template>
              <span>{{ t('sys.add') }}</span>
            </a-button>
          </div>
        </div>
      </div>
    </div> -->

    <div class="join-config-item" v-for="(join, joinIndex) of joinConfig.joins" :key="joinIndex">
      <!-- 关联模型 -->
      <div class="join-config-item-header">
        <div class="join-config-item-header-container" :class="readonly ? 'is-readyonly' : ''">
          <template v-if="joinIndex === 0">
            <div class="join-config-header-item-box join-config-main-model join-config-index-2">
              <span class="join-config-label">{{ t('sys.model.viewMainModel') }}</span>
              <a-select
                class="join-config-select"
                v-model:value="joinConfig.mainModelKey"
                :style="{ width: joinIndex !== 0 ? '260px' : '100%' }"
                :placeholder="t('sys.chooseText')"
                @change="changeMainModel"
                :showSearch="true"
                optionFilterProp="fieldName"
                :disabled="readonly"
              >
                <a-select-opt-group v-for="(models, modelType) in entityList" :key="modelType">
                  <template #label>
                    <span>
                      {{ t(`sys.model.${modelType}`) }}
                    </span>
                  </template>
                  <a-select-option
                    v-for="model in models"
                    :key="model.key"
                    :value="model.key"
                    :fieldName="model.name"
                    >{{ model.name }}</a-select-option
                  >
                </a-select-opt-group>
              </a-select>
            </div>
          </template>

          <div
            v-if="joinIndex === 0"
            class="join-config-header-item-box join-config-link-type join-config-index-2"
          >
            <span class="join-config-label">{{ '连接方式' }}</span>
            <a-select
              :style="{ width: '100%' }"
              :disabled="readonly"
              :placeholder="t('sys.chooseText')"
              v-model:value="join.type"
              :options="joinTypeOption"
            />
          </div>

          <div
            class="join-config-header-item-box join-config-link-model"
            :class="joinIndex === 0 ? 'join-config-index-2' : ''"
          >
            <span class="join-config-label">{{ t('sys.model.viewLinkModel') }}</span>
            <a-select
              class="join-config-select"
              v-model:value="join.modelKey"
              :style="{ width: joinIndex !== 0 ? '260px' : '100%' }"
              :placeholder="t('sys.chooseText')"
              @change="(key) => changeLinkModel(key, joinIndex)"
              :showSearch="true"
              optionFilterProp="fieldName"
              allowClear
              :disabled="readonly"
            >
              <a-select-opt-group
                v-for="(models, modelType) in filterJoinModelOption(join.modelKey)"
                :key="modelType"
              >
                <template #label>
                  <span>
                    {{ t(`sys.model.${modelType}`) }}
                  </span>
                </template>
                <a-select-option
                  v-for="model in models"
                  :key="model.key"
                  :value="model.key"
                  :fieldName="model.name"
                  >{{ model.name }}</a-select-option
                >
              </a-select-opt-group>
            </a-select>
          </div>

          <div
            v-if="joinIndex !== 0"
            class="join-config-header-item-box join-config-link-type"
            :class="joinIndex === 0 ? 'join-config-index-2' : ''"
          >
            <span class="join-config-label">{{ '连接方式' }}</span>
            <a-select
              :style="{ width: joinIndex !== 0 ? '260px' : '100%' }"
              :disabled="readonly"
              :placeholder="t('sys.chooseText')"
              v-model:value="join.type"
              :options="joinTypeOption"
            />
          </div>
          <div class="delete-action">
            <i
              v-if="!readonly"
              :class="[joinIndex === 0 ? 'icon-blank' : 'iconfont icon-shanchu2']"
              @click="() => handleDeleteLinkModel(joinIndex)"
            ></i>
          </div>
        </div>
      </div>
      <!-- 关联条件 -->
      <div class="join-config-item-container" v-if="join.onExpressions.length">
        <div class="join-config-content">
          <div class="join-config-content-item is-header">
            <span class="join-config-header">{{
              joinIndex === 0
                ? t('sys.model.viewMainModelField')
                : t('sys.model.viewLinkModelField')
            }}</span>
            <span class="blank-type"></span>
            <span class="join-config-header">{{ t('sys.model.viewLinkType') }}</span>
            <span class="blank-type"></span>
            <span class="join-config-header" v-if="joinIndex !== 0">{{
              t('sys.model.viewConditionModel')
            }}</span>
            <span v-if="joinIndex !== 0" class="blank-type"></span>
            <span class="join-config-header">{{
              joinIndex === 0
                ? t('sys.model.viewLinkModelField')
                : t('sys.model.viewConditionModelField')
            }}</span>
            <div class="item-actions" v-if="!readonly">
              <i class="icon-blank"></i>
              <i class="icon-blank"></i>
            </div>
          </div>
          <div
            class="join-config-content-item"
            v-for="(expression, expIndex) of join.onExpressions"
            :key="expIndex"
          >
            <a-select
              v-if="joinIndex == 0"
              class="join-config-select-one"
              style="width: 100%"
              :disabled="readonly"
              :placeholder="t('sys.chooseText')"
              v-model:value="expression.rightFieldKey"
              :fieldNames="{ options: 'options', label: 'name', value: 'key' }"
              :options="modelFieldMap[joinConfig.mainModelKey] ?? []"
              @change="(key) => clearRightFieldKey(key, joinIndex, expIndex, true)"
            />
            <a-select
              v-else
              class="join-config-select-one"
              style="width: 100%"
              :disabled="readonly"
              :placeholder="t('sys.chooseText')"
              v-model:value="expression.leftFieldKey"
              :fieldNames="{ options: 'options', label: 'name', value: 'key' }"
              :options="modelFieldMap[join.modelKey] ?? []"
              @change="(key) => clearRightFieldKey(key, joinIndex, expIndex, false)"
            />
            <span class="blank-type"></span>
            <a-select
              style="width: 100%"
              :placeholder="t('sys.chooseText')"
              disabled
              :options="signOption"
              v-model:value="expression.operator"
            />
            <template v-if="joinIndex !== 0">
              <span class="blank-type"></span>
              <a-select
                style="width: 100%"
                class="join-config-select-one"
                :placeholder="t('sys.chooseText')"
                :disabled="readonly || !expression.leftFieldKey"
                v-model:value="expression.rightModelKey"
                :fieldNames="{ options: 'options', label: 'name', value: 'key' }"
                :options="filterRightModelOption(joinIndex)"
                @change="(key) => clearRightFieldKey(key, joinIndex, expIndex, false)"
              />
            </template>
            <span class="blank-type"></span>
            <a-select
              v-if="joinIndex == 0"
              class="join-config-select-one"
              style="width: 100%"
              :placeholder="t('sys.chooseText')"
              v-model:value="expression.leftFieldKey"
              :fieldNames="{ options: 'options', label: 'name', value: 'key' }"
              :disabled="readonly || !expression.leftModelKey"
              :options="
                filterRightFieldOption(
                  expression.leftModelKey,
                  expression.rightModelKey,
                  expression.rightFieldKey,
                )
              "
            />
            <a-select
              v-else
              class="join-config-select-one"
              style="width: 100%"
              :placeholder="t('sys.chooseText')"
              v-model:value="expression.rightFieldKey"
              :fieldNames="{ options: 'options', label: 'name', value: 'key' }"
              :disabled="readonly || !expression.rightModelKey"
              :options="
                filterRightFieldOption(
                  expression.rightModelKey,
                  expression.leftModelKey,
                  expression.leftFieldKey,
                )
              "
            />
            <div class="item-actions" v-if="!readonly">
              <i
                :class="[expIndex === 0 ? 'icon-blank' : 'iconfont icon-shanchu2']"
                @click="() => handleDeleteLinkCondition(joinIndex, expIndex)"
              ></i>
              <i
                class="iconfont icon-chuangjian"
                @click="() => handleCreateLinkCondition(joinIndex, expIndex)"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts" name="join-config">
  import { computed, onMounted, reactive, ref, toRaw } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useJoinConfig } from '../hooks/useJoinConfig';

  const { t } = useI18n();

  const joinTypeOption = [
    { label: t('sys.model.internalJoin'), value: 'INNER' },
    { label: t('sys.model.leftJoin'), value: 'LEFT' },
  ];

  const Ch_joinType = {
    INNER: t('sys.model.internalJoin'),
    LEFT: t('sys.model.leftJoin'),
  };

  const signOption = [{ label: '=', value: 'equal' }];

  const props = defineProps<{
    readonly: boolean;
    isEdit: boolean;
  }>();

  const {
    editJoinConfig,
    showJoinConfig,
    entityList,
    showModelFieldMap,
    editModelFieldMap,
    filterJoinModelOption,
    filterRightModelOption,
    filterRightFieldOption,
    changeMainModel,
    changeLinkModel,
    clearRightFieldKey,
    onAddJoin,
    handleCreateLinkCondition,
    handleDeleteLinkCondition,
    handleDeleteLinkModel,
  } = useJoinConfig(props.readonly);

  const joinConfig = computed(() => {
    const config = props.readonly ? showJoinConfig : editJoinConfig;
    config.joins?.forEach((i) => {
      i.onExpressions?.forEach((v) => {
        v.operator = v.operator || 'equal';
      });
    });
    return config;
  });

  const modelFieldMap = computed(() => {
    return props.readonly ? showModelFieldMap.value : editModelFieldMap.value;
  });

  console.log('modelFieldMap', modelFieldMap.value, joinConfig.value);

  onMounted(() => {
    !props.readonly && !props.isEdit && onAddJoin();
  });
</script>
<style lang="less" scoped>
  .join-config-wrapper {
    position: relative;

    :deep(.ant-select.join-config-select.ant-select-disabled) {
      .ant-select-selector {
        // background-color: transparent;
        // border-color: transparent !important;
        // color: rgba(0, 0, 0, 0.85);
        cursor: default;
        // padding: 0;
      }
      // .ant-select-arrow {
      //   display: none;
      // }
    }

    :deep(.ant-select.join-config-select-one.ant-select-disabled) {
      .ant-select-selector {
        // background-color: #fff;
        // border-color: #fff !important;
        // color: rgba(0, 0, 0, 0.85);
        cursor: default;
      }
      // .ant-select-arrow {
      //   display: none;
      // }
    }

    .join-config-item {
      position: relative;
      border-radius: 4px;
      border: 1px solid #e8e8f0;
      & + .join-config-item {
        margin-top: 16px;
      }

      &.is-master {
        background-color: #f2f4f7;
      }

      &-header {
        display: flex;
        padding: 12px 16px;
        align-items: center;
        background: #fbfbfc;
        .join-config-label {
          display: inline-block;
          font-size: 14px;
          color: #212528;
          flex: 2;
          text-align: right;
          padding-right: 8px;
          // &::after {
          //   content: ':';
          //   margin: 0 8px 0 2px;
          //   position: relative;
          //   top: -0.5px;
          // }
        }

        &-container {
          padding-left: 8px;
          display: flex;
          flex: 18;
          justify-content: space-between;
          align-items: center;
          &.is-readyonly {
            justify-content: flex-start;
          }

          .join-config-header-item-box {
            flex: 1;
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-left: 30px;
            &:first-child {
              margin-left: 0;
            }
            .join-config-label {
              flex: none;
              text-align: left;
            }
            .ant-select {
              flex: 1;
            }

            &.join-config-index-2 {
              align-items: normal;
              flex-direction: column;
              .join-config-label {
                flex: 2;
                margin-bottom: 4px;
                &:after {
                  content: '';
                }
              }
            }
          }

          .join-config-link-type {
            // margin-left: 30px;
            flex-shrink: 0;
          }

          .add-action,
          .delete-action {
            display: flex;
            flex-shrink: 0;
            margin-left: 24px;
            align-items: center;
            > i {
              line-height: 1;
            }
            .add-button {
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              border: none;
              > i {
                line-height: 1;
              }
            }
          }

          .delete-action {
            margin-left: 40px;
            color: #797a7d;
            > i {
              line-height: 1;
              cursor: pointer;
            }
            .icon-blank {
              width: 16px;
              height: 16px;
              background-color: transparent;
              cursor: default;
            }
          }
        }
      }

      &-container {
        position: relative;
        border-top: 1px solid #e0e3ea;
        display: flex;
        padding: 16px;

        .join-config-label {
          display: inline-block;
          font-size: 14px;
          color: #212528;
          flex: 2;
          text-align: right;
          padding-right: 8px;

          &::after {
            content: ':';
            margin: 0 8px 0 2px;
            position: relative;
            top: -0.5px;
          }
        }

        .join-config-content {
          display: flex;
          flex: 18;
          flex-direction: column;
          &-item {
            display: flex;
            align-items: center;
            padding: 8px;
            // background: #f2f4f7;
            border-radius: 4px;

            & + .join-config-content-item {
              // margin-top: 8px;
            }

            &.is-header {
              background-color: #fff;
              padding: 0 8px;

              & + .join-config-content-item {
                margin-top: 4px;
              }
            }

            .join-config-header {
              flex: 1;
            }

            .unit-type {
              color: #212528;
              width: 9px;
              margin: 0 8px;
              flex-shrink: 0;
            }

            .blank-type {
              color: #212528;
              padding: 0 8px;
              flex-shrink: 0;
            }

            .item-actions {
              display: flex;
              flex-shrink: 0;

              color: var(--ant-primary-color);
              align-items: center;
              > i {
                line-height: 1;
                margin-left: 8px;
                cursor: pointer;
              }

              .icon-blank {
                width: 16px;
                height: 16px;
                background-color: transparent;
                cursor: default;
              }
            }
          }
        }
      }
    }
  }
</style>
