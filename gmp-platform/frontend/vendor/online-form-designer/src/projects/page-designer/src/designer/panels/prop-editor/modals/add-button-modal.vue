<template>
  <a-modal v-model:visible="visible" :title="title" @ok="handleOk" centered :width="640">
    <a-form
      ref="formRef"
      :model="formState"
      autocomplete="off"
      :label-col="{ span: 7 }"
      :wrapper-col="{ span: 15 }"
    >
      <a-collapse v-model:activeKey="activeKey" ghost>
        <a-collapse-panel key="1" :header="$t('sys.model.basicInfo')">
          <i18n-select-input-form
            :formRef="formRef"
            formItemName="title"
            :fromItemExtraProps="{
              label: $t('sys.pageDesigner.buttonName'),
              rules: [
                {
                  required: true,
                  validator: validateBtnLabel,
                  message: $t('sys.pageDesigner.buttonName') + $t('sys.pageDesigner.cannotBeEmpty'),
                },
              ],
            }"
            :inputExtraProps="{
              placeholder: `${$t('sys.inputText')}`,
              maxlength: formState.max,
              showCount: true,
            }"
            v-model:text="formState.title"
            v-model:i18nConfig="formState.i18nConfig"
          />
          <a-form-item :label="$t('sys.pageDesigner.buttonType')">
            <buttonTypeSelect
              v-model:has-icon="formState.hasIcon"
              v-model:has-text="formState.hasText"
              v-model:type="formState.type"
              v-model:danger="formState.danger"
              @change="handleChange"
            />
          </a-form-item>
          <a-form-item v-show="formState.hasIcon" :label="$t('sys.pageDesigner.buttonIcon')">
            <IconNextPicker
              v-model:value="formState.icon"
              :size="28"
              :background="'#f5f5f5'"
              :style="{
                '--box-size': '50px',
              }"
            />
          </a-form-item>
          <a-form-item :label="$t('sys.pageDesigner.customBtnColor')">
            <a-switch v-model:checked="formState.enableCustomColor" @change="handleChange" />
          </a-form-item>
          <a-form-item
            v-show="formState.enableCustomColor"
            :label="$t('sys.pageDesigner.buttonNameColor')"
          >
            <g-color-picker
              :preset="presetColor"
              v-model:color="formState.fontColor"
              @update:color="handleUpdateColor"
            >
              <template #icon>
                <div
                  :style="{
                    width: '22px',
                    height: '22px',
                    backgroundColor: formState.fontColor,
                    borderRadius: '4px',
                  }"
                ></div>
              </template>
            </g-color-picker>
          </a-form-item>
          <a-form-item
            v-show="formState.enableCustomColor && formState.type !== 'link'"
            :label="$t('sys.pageDesigner.buttonStyleColor')"
          >
            <g-color-picker
              :preset="presetColor"
              v-model:color="formState.backgroundColor"
              @update:color="handleUpdateBgColor"
            >
              <template #icon>
                <div
                  :style="{
                    width: '22px',
                    height: '22px',
                    backgroundColor: formState.backgroundColor,
                    borderRadius: '4px',
                  }"
                ></div>
              </template>
            </g-color-picker>
          </a-form-item>
        </a-collapse-panel>
        <a-collapse-panel key="2" :header="$t('sys.model.configOpt')">
          <a-form-item
            v-if="eventType === 1"
            :label="$t('sys.pageDesigner.buttonEvent')"
            name="sysMethedType"
            :rules="[
              {
                required: true,
                message: $t('sys.pageDesigner.sysMethed') + $t('sys.pageDesigner.cannotBeEmpty'),
              },
            ]"
          >
            <a-input-group compact>
              <a-select
                v-model:value="eventType"
                style="width: 40%"
                @change="handleMethodTypeChange"
              >
                <a-select-option :value="1">
                  {{ $t('sys.pageDesigner.sysMethed') }}
                </a-select-option>
                <a-select-option :value="0">
                  {{ $t('sys.pageDesigner.selfMethed') }}
                </a-select-option>
              </a-select>
              <a-select
                v-model:value="formState.sysMethedType"
                style="width: 60%"
                :placeholder="$t('sys.chooseText')"
              >
                <a-select-option :value="i" v-for="i in sysMethedOptions" :key="i">{{
                  $t(`sys.pageDesigner.${i}Text`)
                }}</a-select-option>
              </a-select>
            </a-input-group>
          </a-form-item>
          <a-form-item
            v-else
            :label="$t('sys.pageDesigner.buttonEvent')"
            name="eventName"
            :rules="[
              {
                required: true,
                message: $t('sys.pageDesigner.pleaseBindEvent'),
              },
              // {
              //   pattern: /^[a-zA-Z_]+$/,
              //   message: $t('sys.pageDesigner.eventNameRuels'),
              // },
            ]"
          >
            <a-input-group compact>
              <a-select
                v-model:value="eventType"
                style="width: 40%"
                @change="handleMethodTypeChange"
              >
                <a-select-option :value="1">
                  {{ $t('sys.pageDesigner.sysMethed') }}
                </a-select-option>
                <a-select-option :value="0">
                  {{ $t('sys.pageDesigner.selfMethed') }}
                </a-select-option>
              </a-select>
              <a-input
                v-model:value="formState.eventName"
                :placeholder="$t('sys.pageDesigner.pleaseBindEvent')"
                style="width: 60%; cursor: pointer"
                readonly
                @click="onEventNameClick"
              />
            </a-input-group>
          </a-form-item>
          <a-form-item
            v-if="showLinkForm"
            :label="$t('sys.pageDesigner.refForm')"
            name="refForm"
            :rules="[
              {
                required: true,
                message: $t('sys.pageDesigner.refForm') + $t('sys.pageDesigner.cannotBeEmpty'),
              },
            ]"
          >
            <a-select
              v-model:value="formState.refForm"
              show-search
              :placeholder="t('sys.chooseText')"
              @change="handleChange"
            >
              <a-select-option
                :key="widget.id"
                v-for="widget in excludeSubTableFormWidget"
                :value="widget.id"
                :name="`${widget.alias || t(widget.name)} ${widget.id}`"
                >{{ `${widget.alias || t(widget.name)} ${widget.id}` }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            v-if="showlinkPage"
            :label="$t('sys.pageDesigner.linkPage')"
            name="linkPage"
            :rules="[
              {
                required: true,
                message: $t('sys.pageDesigner.linkPage') + $t('sys.pageDesigner.cannotBeEmpty'),
              },
            ]"
          >
            <a-tree-select
              v-model:value="formState.linkPage"
              show-search
              style="width: 100%"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              :placeholder="$t('sys.chooseText')"
              :dropdownMatchSelectWidth="false"
              dropdown-class-name="gct-custom-select-dropdown"
              allow-clear
              tree-default-expand-all
              :tree-data="pageTrees"
              tree-node-filter-prop="label"
            />
          </a-form-item>
          <a-form-item
            :label="$t('sys.pageDesigner.confirm')"
            name="confirm"
            :style="`margin-bottom: ${formState.confirm ? 4 : 20}px`"
          >
            <a-checkbox v-model:checked="formState.confirm">
              {{ $t('sys.pageDesigner.confirm_tip') }}
            </a-checkbox>
          </a-form-item>
          <a-form-item v-if="formState.confirm" label=" " :colon="false" class="confirm-text-div">
            <i18n-select-textarea-form
              :formRef="formRef"
              formItemName="confirmText"
              :fromItemExtraProps="{
                label: $t('sys.pageDesigner.regHint'),
              }"
              :inputExtraProps="{
                placeholder: `${$t('sys.pageDesigner.confirmTodo')}`,
                maxlength: 120,
                showCount: true,
                rows: 3,
              }"
              v-model:text="formState.confirmText"
              v-model:i18nConfig="formState.confirmI18nConfig"
            />
          </a-form-item>
          <a-form-item :label="$t('sys.pageDesigner.bindingPermission')" style="margin-bottom: 0">
            <div class="ks-row-middle">
              <a-select
                v-model:value="pageJson.permissions[formState.id!]"
                allow-clear
                :placeholder="$t('sys.chooseText')"
                style=""
                class="ks-col"
              >
                <a-select-option v-for="per in pagePermissions" :key="per.key" :value="per.key">{{
                  per.name
                }}</a-select-option>
              </a-select>
              <a-button type="link" @click="openPerModal()" class="ml5px">
                {{ $t('sys.pageDesigner.newPermission') }}
              </a-button>
            </div>
            <span class="tip">{{ $t('sys.pageDesigner.bindingPermissionTip') }}</span>
          </a-form-item>
          <!-- <a-form-item :label="$t('sys.pageDesigner.displayRule')">
            <a-input
              v-model:value="formState.displayRule"
              :placeholder="$t('sys.inputText')"
              readOnly
              @click="handleOpenExpr"
            />
          </a-form-item> -->
        </a-collapse-panel>
        <a-collapse-panel key="3" :header="$t('sys.pageDesigner.componentDependencyProp')">
          <a-form-item :label="$t('sys.pageDesigner.componentBehavior')">
            <a-radio-group v-model:value="formState.configDependencyType" size="small">
              <a-radio v-for="(opt, index) in componentBehaviorOptions" :value="opt" :key="index">{{
                $t('sys.pageDesigner.' + opt)
              }}</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item :label="$t('sys.pageDesigner.preconditions')">
            <div class="ks-row-middle">
              <a-input
                :value="formState.configDependency[formState.configDependencyType].expression"
                :placeholder="t('sys.inputText')"
                readOnly
                @click="handleOpenExpr"
                :allowClear="false"
              />
            </div>
            <span class="tip">{{ $t('sys.pageDesigner.preconditionPromptTip') }}</span>
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
  </a-modal>
  <page-permission-modal @register="permissionRegister" @ok="handlePerOk" />
  <events-modal @register="eventRegister" @ok="handleEventOk" />
</template>
<script setup lang="ts">
  import { ref, toRaw, computed, watch } from 'vue';
  import type { FormInstance, TreeSelectProps } from 'ant-design-vue';
  import { BaseButton } from '/@page-designer/types/mobile';
  import {
    operateSysEnums,
    ButtonType,
    FormComponents,
    EventCategory,
    Dependency_ENUM,
    DisplayType,
  } from '/@page-designer/enum';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { IconNextPicker } from '/@/components/Icon';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import useExpression, { ExpressionModeEnum, ExpressionTabEnum } from '/@/components/Expression';
  import buttonTypeSelect from '/@page-designer/components/buttonTypeSelect/buttonTypeSelect.vue';
  import { deepMerge } from '/@/utils';
  import { cloneDeep, isArray } from 'lodash-es';
  import { I18nSelectInputForm, I18nSelectTextareaForm } from '/@/components/I18nSelect';
  import { useI18n } from 'vue-i18n';
  import { useModalDragMove } from '/@/components/Modal/src/hooks/useModalDrag';
  import pagePermissionModal from '../../page/modals/page-permission-modal.vue';
  import EventsModal from '/@page-designer/designer/panels/widget/event-modules/events-modal.vue';
  import { useModal } from '/@/components/Modal';
  import {
    getPermissionList,
    postPermission,
    putPermissionById,
  } from '/@/apis/gct-apaas/PermissionController';
  import { useQueryStore } from '/@/store/modules/query';
  import { pagePermissions, platform } from '/@page-designer/hooks/usePage';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';
  import { presetColor, btnTypeColor, shadeColor } from '/@page-designer/hooks/useStyleEditor';

  const { t } = useI18n();
  const { mitt } = useMitt();
  const componentBehaviorOptions = [Dependency_ENUM.HIDDEN];
  const { pageJson, setLo, getLo, unbindLoByWidgetId, excludeSubTableFormWidget, allFormWidget } =
    useDesigner();
  const props = defineProps<{
    model: string;
    id: string;
    module: string;
    sysMethedData: Array<any>;
    compType?: string;
  }>();
  const emit = defineEmits(['on-save']);
  const { openModal } = useExpression();
  const formRef = ref<FormInstance>();
  type ButtonProps = BaseButton['props'];
  interface FormState extends ButtonProps {
    id: string;
    configDependencyType: Dependency_ENUM;
    configDependency: any;
  }
  const formData = ref<Partial<FormState>>({
    id: '',
    icon: 'icon-park:all-application',
    title: '',
    confirm: false,
    confirmText: '',
    innerEvent: true,
    sysMethedType: props.sysMethedData[Object.keys(props.sysMethedData)[0]],
    linkPage: '',
    eventName: '',
    hasIcon: false,
    hasText: true,
    type: ButtonType.PRIMARY,
    danger: false,
    disabled: false,
    i18nConfig: '',
    confirmI18nConfig: '',
    enableCustomColor: false,
    backgroundColor: '',
    fontColor: '',
    max: 32,
    configDependencyType: Dependency_ENUM.HIDDEN,
    configDependency: {
      /**隐藏 */
      [Dependency_ENUM.HIDDEN]: {
        expression: '',
        value: false,
      },
      /**禁用 */
      [Dependency_ENUM.DISABLED]: {
        expression: '',
        value: false,
      },
    },
  });
  const formState = ref<Partial<FormState>>({});
  const resolveCallback = ref();
  const title = ref('');
  const visible = ref(false);
  const pageTrees = ref<TreeSelectProps['treeData']>([]);
  const activeKey = ref(['1', '2', '3']);
  const customEvent = ref({
    eventName: '',
    isNew: false,
    event: [],
    eventCategory: '',
    methodTitle: '',
    extParams: {},
  });

  // 显示规则-open
  const handleOpenExpr = async () => {
    const type = formState.value.configDependencyType!;
    openModal({
      expr: formState.value.configDependency[type].expression,
      mode: ExpressionModeEnum.DISPLAY_RULE,
      identifiers: {
        [ExpressionTabEnum.FIELD]: await _getIdentifiers(),
      },
      callback: (expr) => {
        formState.value.configDependency[type].expression = expr;
        formState.value.configDependency[type].value = !!expr;
      },
    });
  };
  // modal拖拽的方法
  useModalDragMove({ visible, destroyOnClose: ref(false), draggable: ref(true) });
  const [permissionRegister, { openModal: openPerModal, closeModal: closePerModal }] = useModal();
  const [eventRegister, { openModal: openEventModal, closeModal: closeEventModal }] = useModal();

  const sysMethedOptions = computed(() => {
    return props.sysMethedData;
  });
  const showlinkPage = computed(() => {
    return (
      formState.value.innerEvent && formState.value.sysMethedType === operateSysEnums.COLUMNLINK
    );
  });

  const showLinkForm = computed(() => {
    return (
      formState.value.innerEvent &&
      formState.value.sysMethedType &&
      [operateSysEnums.SUBMIT, operateSysEnums.RESET].includes(formState.value.sysMethedType)
    );
  });
  const eventType = computed(() => {
    return formState.value.innerEvent ? 1 : 0;
  });

  watch(showlinkPage, (i) => {
    if (i) {
      getPageLinkOptions();
    }
  });

  const handleChange = (val) => {
    const findItem: any = btnTypeColor.find(
      (i) => i.type === formState.value.type && i.danger === formState.value.danger,
    );
    formState.value.fontColor = getColor(findItem.fontColor);
    formState.value.backgroundColor = getColor(findItem.backgroundColor);
  };

  function getColor(colorString) {
    let defautColor = colorString;
    if (defautColor.indexOf('--ant') > -1) {
      const element: any = document.querySelector(':root');
      defautColor = getComputedStyle(element).getPropertyValue(colorString);
    }
    if (defautColor.indexOf('rgb') > -1) {
      defautColor = shadeColor(defautColor);
    }
    return defautColor;
  }

  async function getPageLinkOptions() {
    let tree = (await getCategoryListComplete({ module: props.module })) || [];
    pageTrees.value = tree.map((i) => {
      const children = i.children?.map((c) => {
        return { label: c.name, value: c.id };
      });
      return { label: i.name, value: i.id, disabled: true, children };
    });
  }
  // 保存
  const handleOk = async () => {
    await formRef.value!.validate();
    visible.value = false;
    const { eventName, isNew, event, eventCategory, methodTitle, extParams } = customEvent.value;
    if (formState.value.innerEvent) {
      // 选择系统事件时，清除自建的事件
      formState.value.eventName = '';
    } else if (eventCategory === EventCategory.JS) {
      if (isNew) {
        mitt.emit('new-event', {
          methodName: eventName,
          params: 'rowValue,index,extParams',
        });
        mitt.emit('get-schema-code');
      }
      formState.value.events = {
        onClick: {
          extParams,
          type: eventCategory,
          name: eventName,
        },
      };
    } else if (eventCategory === EventCategory.LO) {
      // 如果是新建函数
      if (isNew) {
        setLo(eventName, {
          name: eventName,
          title: methodTitle,
          runtimeJs: `function ${eventName}() {}`,
          bindTo: formData.value.id,
          parameter: ['rowValue', 'index', 'extraParams'],
        });
      } else {
        setLo(eventName, {
          title: methodTitle,
          bindTo: formData.value.id,
        });
      }
      formState.value.events = {
        onClick: {
          extParams,
          type: eventCategory,
          name: eventName,
        },
      };
    } else {
      /**内置事件 */
      formState.value.events = {
        onClick: event,
      };
    }

    resolveCallback.value(toRaw(formState.value));
    emit('on-save', cloneDeep(formState.value));
  };

  // 按钮权限配置的key,按钮的id
  // const btnPremissionId = ref();
  const open = async (t, data) => {
    await formRef.value?.resetFields();
    const { displayType, displayRule } = data;
    formState.value = deepMerge(formData.value, cloneDeep({ ...formData.value, ...data }));
    if (displayType === DisplayType.RULE && displayRule) {
      formState.value.configDependency.hidden.expression = `!(${displayRule})`;
      formState.value.configDependency.hidden.value = true;
      formState.value.displayRule = '';
    }
    if (formState?.value?.events?.onClick) {
      // 内置事件与JS事件，事件参数数据结构不同，故做不同处理
      if (isArray(formState?.value?.events?.onClick)) {
        customEvent.value = {
          ...customEvent.value,
          event: formState?.value?.events?.onClick,
        };
      } else {
        const { type, name, extParams } = formState.value.events.onClick;
        customEvent.value = {
          ...customEvent.value,
          eventName: name,
          eventCategory: type,
          extParams,
        };
      }
    }
    const findItem: any = btnTypeColor.find(
      (i) => i.type === formState.value.type && i.danger === formState.value.danger,
    );
    formState.value.fontColor = formState.value.fontColor || getColor(findItem.fontColor);
    formState.value.backgroundColor =
      formState.value.backgroundColor || getColor(findItem.backgroundColor);
    title.value = t;
    visible.value = true;
    return new Promise((resolve) => {
      resolveCallback.value = resolve;
    });
  };

  /**根据页面的form组装identifiers */
  const _getIdentifiers = async () => {
    const P =
      props.compType === FormComponents.BottomButtonContainer
        ? allFormWidget.value
            .filter((i) => i.props.model)
            .map(async (form) => {
              const fieldList = await getFieldMetaList({ modelKey: form.props.model! });
              const children =
                fieldList?.map((i) => ({ id: i.key!, name: i.name!, valueType: i.type! })) || [];
              return {
                id: form.id,
                name: `${form.alias || t(form.name)} ${form.id}`,
                children,
              };
            })
        : [
            {
              id: props.id,
              props: {
                name:
                  props.compType && props.compType === FormComponents.CardList
                    ? t('sys.pageDesigner.currentCard')
                    : t('sys.pageDesigner.currentTable'),
                model: props.model,
              },
            },
          ]
            .filter((i) => i.props.model)
            .map(async (form) => {
              const fieldList = await getFieldMetaList({ modelKey: form.props.model! });
              const children =
                fieldList?.map((i) => ({ id: i.key!, name: i.name!, valueType: i.type! })) || [];
              return {
                id: form.id,
                name: form.props.name || form.id,
                children,
              };
            });
    const formlist = await Promise.all(P);
    return formlist;
  };

  const validateBtnLabel = (rule, value) => {
    if (!value || !value.trim()) return Promise.reject();
    else return Promise.resolve();
  };

  // 事件类型-change
  const handleMethodTypeChange = (val) => {
    formState.value.innerEvent = val === 1;
    if (val === 1) {
      formState.value.sysMethedType = props.sysMethedData[Object.keys(props.sysMethedData)[0]];
      formRef.value?.clearValidate(['eventName']);
    } else {
      formState.value.sysMethedType = undefined;
      formState.value.refForm = undefined;
      formRef.value?.clearValidate(['sysMethedType']);
    }
  };

  // 绑定事件-open
  const onEventNameClick = () => {
    openEventModal(
      true,
      !formState.value.events?.onClick
        ? {
            name: formState.value.eventName,
            eventType: 'onClick',
            isEdit: !!formState.value.eventName,
          }
        : { event: formState.value.events?.onClick, isEdit: !!formState.value.eventName },
    );
  };

  // 绑定事件-保存
  const handleEventOk = (event) => {
    initOrUpdateEvents(event);
  };
  /**添加或者修改组件中的events */
  const initOrUpdateEvents = (eventData) => {
    const { event, eventCategory } = eventData;
    formState.value.eventName =
      eventCategory !== EventCategory.INNER ? event.methodName : event.map((e) => e.name);
    customEvent.value = {
      event: eventCategory !== EventCategory.INNER ? [] : event,
      eventCategory,
      isNew: eventCategory !== EventCategory.INNER && event.isNew,
      eventName:
        eventCategory !== EventCategory.INNER ? event.methodName : event.map((e) => e.name),
      methodTitle: event.methodTitle,
      extParams: eventCategory === EventCategory.JS ? event.extParams : '',
    };
    closeEventModal();
  };

  // 权限配置-保存
  const handlePerOk = async (data) => {
    const queryStore = useQueryStore();
    !data.id
      ? await postPermission({
          ...data,
          terminalType: platform.value.toUpperCase(),
          relationId: queryStore.getPid(),
        })
      : await putPermissionById(
          { id: data.id },
          {
            name: data.name,
            key: data.key,
            terminalType: platform.value.toUpperCase(),
            relationId: queryStore.getPid(),
          },
        );
    closePerModal();
    pagePermissions.value = (await getPermissionList({ relationId: queryStore.getPid() })) || [];
  };

  const handleUpdateColor = (_e, color) => {
    formState.value.fontColor = color;
  };

  const handleUpdateBgColor = (_e, color) => {
    formState.value.backgroundColor = color;
  };

  defineExpose({ open });
</script>
<style scoped lang="less">
  :deep(.ant-form-item) {
    margin-bottom: 20px;
  }

  .confirm-text-div {
    :deep(.ant-form-item-label > label) {
      color: #797a7d;
    }

    :deep(.ant-form-item) {
      margin-bottom: 0;
    }

    :deep(& > .ant-form-item-control) {
      border-radius: 4px;
    }
  }

  .tip {
    margin-top: 4px;
    color: #c3c3c3;
    font-size: 12px;
  }
</style>
