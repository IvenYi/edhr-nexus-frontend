<template>
  <a-collapse class="toolkit-content-param" v-model:active-key="activeKey">
    <a-collapse-panel key="1" :header="formState.key">
      <template #extra>
        <i
          :title="$t('sys.edit')"
          class="iconfont icon-bianji edit-icon"
          @click="
            (e) => {
              stopPropagation(e);
              editParam(value);
            }
          "
        ></i>
        <i
          :title="$t('sys.delText')"
          class="iconfont icon-shanchu2 remove-icon"
          @click="
            (e) => {
              stopPropagation(e);
              deleteParam(value.key);
            }
          "
        ></i>
      </template>
      <div v-for="group in groupFields" :key="group.groupKey" class="group-fields">
        <div class="group-fields__label" :title="group.groupCaption">{{ group.groupCaption }}</div>
        <div class="group-fields__content">
          <div
            class="group-fields__field"
            v-for="field in group.fields"
            :key="field.key"
            :title="field.tooltip"
          >
            {{ field.caption }}
          </div>
        </div>
      </div>
    </a-collapse-panel>
  </a-collapse>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import {
    IParam,
    useParam,
    parseModelFieldKey,
  } from '/@online-form/views/designer/hooks/useParam';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const { modelMetaMap, masterModel, subTableFieldModel } = useModelFields();

  const activeKey = ref(['1']);

  const props = defineProps<{
    value: IParam;
  }>();
  const { deleteParam, editParam } = useParam();

  const formState = computed({
    get() {
      return props.value;
    },
    set(val) {
      Object.assign(props.value, val);
    },
  });

  type GroupFields = {
    groupKey: string;
    groupCaption: string;
    fields: Array<{ key: string; caption: string; tooltip: string }>;
  };

  const groupFields = computed(() => {
    // 按分组理出选中的属性值集合
    const fieldsMap = new Map<string, string[]>();
    formState.value.toFields.forEach((key) => {
      const { toModel, toField } = parseModelFieldKey(key);
      if (!fieldsMap.has(toModel)) {
        fieldsMap.set(toModel, []);
      }
      fieldsMap.get(toModel)!.push(toField);
    });

    const result: GroupFields[] = [];
    // 主模型
    if (masterModel.value) {
      const selectedKeys = fieldsMap.get(masterModel.value.key!);
      if (selectedKeys?.length) {
        const group: GroupFields = {
          groupKey: masterModel.value.key!,
          groupCaption: `${masterModel.value.name}[${masterModel.value.key}]`,
          fields: [],
        };
        modelMetaMap.value[masterModel.value.key!].fields.forEach((field) => {
          if (selectedKeys.includes(field.key!)) {
            const label = `${field.name}[${field.key}]`;
            group.fields.push({
              key: field.key!,
              tooltip: label,
              caption: label.length > 10 ? label.substring(0, 10) + '......' : label,
            });
          }
        });
        result.push(group);
      }
    }

    // 子模型处理
    if (subTableFieldModel.value.length) {
      subTableFieldModel.value.forEach((sub) => {
        const selectedKeys = fieldsMap.get(sub.model.key!);
        if (selectedKeys?.length) {
          const group: GroupFields = {
            groupKey: sub.field.key!,
            groupCaption: `${sub.field.name}(${sub.model.name}[${sub.model.key}])`,
            fields: [],
          };
          modelMetaMap.value[sub.model.key!].fields.forEach((field) => {
            if (selectedKeys.includes(field.key!)) {
              const label = `${field.name}[${field.key}]`;
              group.fields.push({
                key: field.key!,
                tooltip: label,
                caption: label.length > 10 ? label.substring(0, 10) + '......' : label,
              });
            }
          });
          result.push(group);
        }
      });
    }

    return result;
  });

  /** */
  const stopPropagation = (e: MouseEvent) => {
    e.stopPropagation();
  };
</script>

<style lang="less" scoped>
  .toolkit-content-param {
    // background: #f2f4f7;
    // padding: 4px;
    // border-radius: 4px;
    // position: relative;

    // &:not(:last-child) {
    //   margin-bottom: 4px;
    // }

    // & > i {
    //   position: absolute;
    //   top: 4px;
    //   z-index: 10;
    //   cursor: pointer;
    //   color: #333;
    // }

    .edit-icon {
      margin-right: 4px;
    }

    margin-bottom: 8px;

    &.ant-collapse {
      background-color: #f2f4f7;
      border-width: 0;
      border-radius: 4px;
      overflow: hidden;

      :deep(.ant-collapse-content) {
        background-color: #f2f4f7;
        // border-width: 0;
        .ant-collapse-content-box {
          padding: 4px;
        }
      }
      :deep(.ant-collapse-item) {
        .ant-collapse-header {
          padding: 8px 10px;
          .ant-collapse-arrow {
            margin-right: 4px;
          }
        }
        border-width: 0;
      }
    }
  }

  .group-fields {
    margin: 4px;
    padding: 8px;
    background-color: #fff;
    border-radius: 4px;
  }

  .group-fields__label {
    color: #797a7d;
    font-size: 12px;
    margin-bottom: 4px;
  }

  .group-fields__content {
    display: flex;
    flex-wrap: wrap;
  }

  .group-fields__field {
    background-color: #e6e9ef;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 4px;
    margin-bottom: 4px;
  }
</style>
