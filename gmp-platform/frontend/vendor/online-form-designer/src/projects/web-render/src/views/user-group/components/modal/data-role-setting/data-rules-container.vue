<template>
  <div :class="['data-rules-container', isPermScope ? 'perm-scope-style' : '']">
    <header-action
      v-if="!isFilterConfig && !isDesign && !isBusinessFlow && !isEdhrBuiltPerms && !isPermScope"
      :title="t('sys.appDesigner.rulesGroup')"
      v-model:checked="dataRuleEnabled"
      :style="dataRuleEnabled ? { borderBottom: '1px solid #eaeaea' } : {}"
    />
    <div
      class="data-rules-header"
      v-else-if="!readonly && !isDesign && !isBusinessFlow && !isEdhrBuiltPerms && !isPermScope"
      >{{ t('sys.model.viewFilterCondition') }}</div
    >
    <a-tree
      v-if="isFilterConfig || dataRuleEnabled || isBusinessFlow || isEdhrBuiltPerms || isPermScope"
      class="data-rules-container-tree"
      :tree-data="dataRulesTree"
      v-model:expanded-keys="treeExpandedKeys"
      :defaultExpandAll="true"
      :block-node="true"
      :selectable="false"
      :show-line="{ showLeafIcon: false }"
    >
      <!-- <template #switcherIcon="{ data }">
        <div>{{ t(Ch_Operator[data.operatorType]) }}</div>
        
      </template> -->
      <template #title="{ data }">
        <template v-if="data.type === 'group'">
          <tree-root-node
            v-if="!isPermScope"
            :level="data.level"
            :data="data"
            :id="data.key"
            :operatorType="data.operatorType"
            :readonly="readonly"
          />
          <perm-root-node
            v-else
            :data="data"
            :id="data.key"
            :operatorType="data.operatorType"
            :readonly="readonly"
          />
        </template>
        <template v-else>
          <tree-action-node
            v-if="!isPermScope"
            :data="data"
            :fieldList="fieldConditionList"
            :selectFiledKeys="selectFiledKeys"
            :filterType="type"
            :readonly="readonly"
            :mainModelKey="mainModelKey"
            :onlineFormFieldList="onlineFormFieldList"
            :isPageDesigner="isPageDesigner"
            :isOnlineFormDesigner="isOnlineFormDesigner"
            :isAllowClear="isAllowClear"
            :excludeValueType="excludeValueType"
            :excludeOperatorType="excludeOperatorType"
            :apiConfig="apiConfig"
            :modelName="detail.modelName"
            :cascadeField="cascadeField"
          />
          <perm-action-node
            v-else
            :data="data"
            :fieldList="fieldConditionList"
            :selectFiledKeys="selectFiledKeys"
            :filterType="type"
            :readonly="readonly"
            :isPageDesigner="isPageDesigner"
            :isAllowClear="isAllowClear"
            :excludeValueType="excludeValueType"
            :excludeOperatorType="excludeOperatorType"
            :apiConfig="apiConfig"
            :modelName="detail.modelName"
            :cascadeField="cascadeField"
            :hasPermScopeError="data.hasPermScopeError"
          />
        </template>
      </template>
    </a-tree>
    <a-button v-if="isPermScope" class="perm-root-node-add-row" type="link" @click="handleAddRow()">
      <plus-outlined /> {{ t('sys.add') }}
    </a-button>
  </div>
</template>
<script lang="ts" setup name="data-rules-container">
  import { watch, ref, unref, computed, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import HeaderAction from './header-action.vue';
  import TreeRootNode from './tree-root-node.vue';
  import TreeActionNode from './tree-action-node.vue';
  import PermRootNode from './perm-root-node.vue';
  import PermActionNode from './perm-action-node.vue';
  // import { Ch_Operator } from '../../../constant/interface';
  import { useDataRulesTree } from '../../../hooks/useDataRulesTree';

  import type { FieldMetaDTO } from '@/apis/gct-apaas/model';
  import { SEARCH_TYPE } from '/@page-designer/schema/common';

  export interface Props {
    fieldList?: FieldMetaDTO[];
    detail: any;
    type?: string;
    readonly?: boolean;
    isDesign?: boolean;
    mainModelKey?: string;
    isPageDesigner?: boolean;
    isOnlineFormDesigner?: boolean;
    allowClear?: boolean;
    excludeValueType?: string[];
    excludeOperatorType?: string[];
    apiConfig?: object;
    onlineFormFieldList?: any[];
    /**是否级联字段模式 */
    cascadeField?: boolean;
    /**数据权限时-是否开启校验 */
    hasPermScopeError?: boolean;
  }

  const { t } = useI18n();

  const props = defineProps<Props>();
  const {
    showDataRulesTree,
    editDataRulesTree,
    setTree,
    getDataRules,
    resetTree,
    getAllExpandedKeys,
    addNewRow,
  } = useDataRulesTree(props.readonly);

  const dataRuleEnabled = ref<boolean>(false);
  // const dataglobalEnabled = ref<boolean>(false);

  const treeExpandedKeys = ref<string[]>([]);
  const selectFiledKeys = ref<string[]>([]);

  const isFilterConfig = computed(() => {
    return props.type === 'filterConfig';
  });

  const isBusinessFlow = computed(() => {
    return props.type === 'businessFlow';
  });

  const isEdhrBuiltPerms = computed(() => {
    return props.type === 'edhrBuiltPerms';
  });

  const isPermScope = computed(() => {
    return props.type === 'permissionScope';
  });

  const dataRulesTree = computed(() => {
    return props.readonly ? showDataRulesTree.value : editDataRulesTree.value;
  });

  const fieldConditionList = computed(() => {
    return isBusinessFlow.value || isEdhrBuiltPerms.value || isPermScope.value
      ? props.fieldList
      : props.fieldList?.filter((item) => Object.keys(SEARCH_TYPE).includes(item.type!));
  });
  const isAllowClear = computed(() => {
    return (
      (props.allowClear &&
        dataRulesTree.value.length == 1 &&
        dataRulesTree.value[0]?.children?.length == 1) ||
      (props.allowClear && isPermScope.value)
    );
  });

  function setDetail(): void {
    if (props.detail) {
      dataRuleEnabled.value = props.detail.dataRuleEnabled;
      setTree(props.detail.dataRuleConfig);
    }
  }

  watch(
    () => props.detail,
    () => {
      setDetail();
    },
    { deep: true },
  );

  watch(
    () => dataRulesTree,
    () => {
      const obj = getAllExpandedKeys();
      treeExpandedKeys.value = obj.allExpandedKeys;
      selectFiledKeys.value = obj.selectFiledKeys;
    },
    { deep: true },
  );

  const getDataRulesResult = () => {
    const config = getDataRules(props.type, props.mainModelKey);
    return {
      dataRuleEnabled: dataRuleEnabled.value,
      ...config,
      operator: isPermScope.value ? dataRulesTree.value[0]?.operatorType : undefined,
    };
  };

  const resetData = () => {
    resetTree();
  };

  const handleAddRow = () => {
    const data = dataRulesTree.value[0];
    addNewRow(data?.key || 'root');
  };

  watch(
    () => props.hasPermScopeError,
    (val) => {
      if (!props.readonly && val) {
        editDataRulesTree.value[0]?.children?.forEach((item) => {
          item.hasPermScopeError = val;
        });
      }
    },
    {
      immediate: true,
    },
  );

  onMounted(() => {
    setDetail();
  });

  defineExpose({ getDataRulesResult, resetData });
</script>
<style lang="less">
  .data-rules-container {
    padding: 0 20px;

    .data-rules-header {
      color: #000;
      font-weight: 600;
    }

    .data-rules-container-tree.ant-tree-show-line .ant-tree-indent-unit::before {
      border-right-color: transparent;
    }

    .data-rules-container-tree {
      padding-right: 2px;

      .ant-tree-treenode {
        align-items: center;
        min-width: 0;
        padding: 0;

        &:hover {
          background-color: transparent !important;
        }

        &.tree-group {
          padding: 14px 0 10px;

          .ant-tree-indent {
            .ant-tree-indent-unit {
              &:last-child {
                &::before {
                  content: '';
                  display: inline-block;
                  position: absolute;
                  // top: -22px;
                  top: -44px;
                  right: 12px;
                  bottom: 16px;
                  border-right: 1px dashed #dbdbdb;
                }

                &::after {
                  content: '';
                  display: inline-block;
                  position: absolute;
                  left: 50%;
                  width: 12px;
                  height: 50%;
                  border-bottom: 1px dashed #dbdbdb;
                }
              }
            }
          }
        }

        &:not(.tree-group) {
          .ant-tree-indent {
            .ant-tree-indent-unit {
              &:first-child {
                width: 0;
              }

              &::before {
                top: -24px;
                bottom: -30px;
                border-right: 1px dashed #dbdbdb;
              }
              // &::after {
              //   display: none;
              // }
            }
          }

          .ant-tree-node-content-wrapper {
            margin-bottom: 8px;
            padding: 8px;
            border-radius: 0;
            background-color: #f5f6f7;
          }
        }

        .ant-tree-switcher {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          height: 32px;
          color: #797a7d;
          line-height: 32px;

          .ant-tree-switcher-leaf-line {
            &::before {
              bottom: -20px;
              border-right: 1px dashed #dbdbdb;
            }

            &::after {
              width: 12px;
              height: 20px;
              border-bottom: 1px dashed #dbdbdb;
            }
          }
        }

        .ant-tree-node-content-wrapper {
          display: flex;
          flex: 1 1 0%;
          align-items: center;
          min-width: 0;
          line-height: 32px;

          .ant-tree-title {
            flex: 1 1 0%;
            min-width: 0;
            width: 100%;
          }
        }

        &.first-node {
          .ant-tree-switcher {
            color: #797a7d;

            .ant-tree-switcher-leaf-line {
              &::before {
                top: -16px !important;
                bottom: -20px !important;
              }

              &::after {
                height: 28px;
              }
            }
          }

          .ant-tree-node-content-wrapper {
            // padding-top: 12px !important;
            border-top-left-radius: 4px !important;
            border-top-right-radius: 4px !important;
          }
        }

        &.last-node {
          .ant-tree-node-content-wrapper {
            // padding-bottom: 12px !important;
            border-bottom-right-radius: 4px !important;
            border-bottom-left-radius: 4px !important;
          }
        }

        &.first-node.last-node {
          .ant-tree-switcher {
            .ant-tree-switcher-leaf-line {
              &::before {
                height: 44px !important;
              }
            }
          }
        }
      }

      .ant-tree-treenode-leaf-last .ant-tree-switcher-leaf-line::before {
        height: 20px !important;
      }
    }

    // 数据权限特殊样式
    &.perm-scope-style {
      padding: 0;
      .data-rules-container-tree .ant-tree-treenode.tree-group {
        padding-top: 2px;
      }

      .ant-tree .ant-tree-node-content-wrapper {
        padding: 0;
        border-radius: 4px !important;
      }

      .data-rules-container-tree
        .ant-tree-treenode:not(.tree-group)
        .ant-tree-node-content-wrapper {
        padding-left: 12px;
        padding-right: 10px;
        margin-bottom: 4px;
        background-color: #f9fafb;
      }

      .ant-tree-switcher {
        width: 0;
        .anticon svg {
          display: none;
        }

        .ant-tree-switcher-leaf-line {
          &::before {
            display: none;
          }
          &::after {
            display: none;
          }
        }
      }

      .perm-root-node-add-row {
        padding: 0;
        line-height: 20px;
        height: 20px;
        margin-top: 8px;
        border-width: 0;
        color: var(--ant-primary-color);
      }

      .ant-btn > .anticon + span {
        margin-left: 4px;
      }
    }

    // .data-rules-container-tree {
    //   .ant-tree-treenode {
    //     align-items: center;

    //     &:not(.ant-tree-treenode-leaf-last) {
    //       padding: 0;
    //       .ant-tree-indent {
    //         .ant-tree-indent-unit.ant-tree-indent-unit-start.ant-tree-indent-unit-end {
    //           width: 0;
    //         }
    //       }
    //       .ant-tree-node-content-wrapper {
    //         padding: 4px 12px 4px;
    //         background-color: #f5f6f7;
    //         border-radius: 0;
    //       }
    //     }

    //     &.ant-tree-treenode-leaf-last {
    //       padding: 0;

    //       &:last-child {
    //         .ant-tree-indent {
    //           .ant-tree-indent-unit.ant-tree-indent-unit-start.ant-tree-indent-unit-end {
    //             width: 0;
    //           }
    //         }
    //         .ant-tree-switcher {
    //           .ant-tree-switcher-leaf-line {
    //             &::before {
    //               height: 20px !important;
    //             }
    //           }
    //         }
    //         .ant-tree-node-content-wrapper {
    //           padding: 4px 12px 4px;
    //           background-color: #f5f6f7;
    //           border-radius: 0;
    //         }
    //       }
    //     }

    //     &.ant-tree-treenode-leaf-last:not(:last-child) {
    //       padding: 14px 0 10px 0;
    //       .ant-tree-indent {
    //         .ant-tree-indent-unit.ant-tree-indent-unit-end {
    //           &:last-child {
    //             &::before {
    //               content: '';
    //               position: absolute;
    //               display: inline-block;
    //               border-right: 1px dashed #dbdbdb;
    //               bottom: 16px;
    //               right: 12px;
    //               top: -22px;
    //             }
    //             &::after {
    //               content: '';
    //               display: inline-block;
    //               position: absolute;
    //               width: 12px;
    //               height: 50%;
    //               border-bottom: 1px dashed #dbdbdb;
    //               left: 50%;
    //             }
    //           }
    //         }
    //       }
    //     }

    //     .ant-tree-switcher {
    //       line-height: 32px;
    //       height: 32px;
    //       display: flex;
    //       align-items: center;
    //       justify-content: center;
    //       color: #333;
    //       flex-shrink: 0;
    //       .ant-tree-switcher-leaf-line {
    //         &::before {
    //           bottom: -6px;
    //           border-right: 1px dashed #dbdbdb;
    //         }
    //         &::after {
    //           width: 12px;
    //           height: 20px;
    //           border-bottom: 1px dashed #dbdbdb;
    //         }
    //       }
    //     }
    //     .ant-tree-node-content-wrapper {
    //       display: flex;
    //       align-items: center;
    //       line-height: 32px;
    //       .ant-tree-title {
    //         width: 100%;
    //       }
    //     }

    //     &.first-node {
    //       .ant-tree-switcher {
    //         .ant-tree-switcher-leaf-line {
    //           &::before {
    //             top: -16px !important;
    //             bottom: -14px !important;
    //           }
    //           &::after {
    //             height: 28px;
    //           }
    //         }
    //       }
    //       .ant-tree-node-content-wrapper {
    //         padding-top: 12px !important;
    //         border-top-left-radius: 4px !important;
    //         border-top-right-radius: 4px !important;
    //       }
    //     }

    //     &.last-node {
    //       .ant-tree-node-content-wrapper {
    //         padding-bottom: 12px !important;
    //         border-bottom-left-radius: 4px !important;
    //         border-bottom-right-radius: 4px !important;
    //       }
    //     }

    //     &.first-node.last-node {
    //       .ant-tree-switcher {
    //         .ant-tree-switcher-leaf-line {
    //           &::before {
    //             height: 44px !important;
    //           }
    //         }
    //       }
    //     }
    //   }
    // }
  }
</style>
