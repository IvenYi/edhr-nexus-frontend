/* eslint-disable vue/no-setup-props-destructure */
import { computed, defineComponent, nextTick, PropType, reactive, ref, watch, h } from 'vue';
import { useResizeObserver } from '@vueuse/core';
import {
  IDictionaryItem,
  IModal,
  ModelMetaDTO,
  useModal,
  useNamespace,
  FieldIconMap,
  FIELD_TYPE,
} from '@gct/runtime';
import {
  getModelMetaDetail,
  getModelMetaListModelReferencedBy,
} from '/@/apis/gct-apaas/ModelMetaController';
import { useI18n } from 'vue-i18n';
import { clone, isEmpty } from 'lodash-es';
import {
  BrowserJsPlumbInstance,
  newInstance,
  FlowchartConnector,
  FlowchartConnectorOptions,
  EndpointFactory,
  ConnectParams,
} from '@jsplumb/browser-ui';
import { ArrowEndpoint, ArrowEndpointHandler, ArrowEndpointParams } from './arrow-endpoint';
import { register } from './blank-endpoint-renderer';
import { linkageItem } from './type';
import './perm-scope-config.scss';

// jsplumb 插件：注册三角箭头
register();

EndpointFactory.registerHandler(ArrowEndpointHandler);

export const PermScopeConfig = defineComponent({
  name: 'PermScopeConfig',
  props: {
    mode: {
      type: String as PropType<'view' | 'edit'>,
      default: 'view',
    },
    context: {
      type: Object as PropType<IData>,
      default: () => {
        return {};
      },
    },
    bindModelKey: {
      type: String,
    },
    bindModelName: {
      type: String,
    },
    // 当前选中字段的名称
    label: {
      type: String,
    },
    // 历史数据
    items: {
      type: Array<linkageItem>,
    },
    modal: {
      type: Object as PropType<IModal>,
    },
    // 当前表单属性
    fields: {
      type: Array as PropType<any[]>,
      required: true,
      default: () => [],
    },
    permissionEnabled: {
      type: Number,
      default: 0,
    },
    hasVali: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:items'],
  setup(props, { emit, expose }) {
    const { t } = useI18n() as any;
    const ns = useNamespace('perm-scope-config');
    // 支持选择的属性类型清单
    const types = [FIELD_TYPE.REF, FIELD_TYPE.RDO_REF];

    const isInit = ref<boolean>(false);

    const containerRef = ref<HTMLDivElement>();

    let plumb: BrowserJsPlumbInstance = null as any;

    // 已经加载过的模型缓存
    const modelMap: Record<string, ModelMetaDTO> = reactive({});

    // 已经计算过的属性清单缓存
    const optMap: Record<string, IDictionaryItem[]> = reactive({});

    // 当前选中的数据清单缓存，标识取 modelKey
    const selectArr: linkageItem[] = reactive([]);

    const originModels = ref<ModelMetaDTO[]>([]);

    const configMap: Record<string, any> = reactive({});

    if (props.modal) {
      useModal(async () => {
        const items: IData[] = [];
        selectArr.forEach((select) => {
          items.push(select);
        });

        return {
          ok: true,
          data: items,
        };
      });
    }

    if (props.items) {
      props.items?.forEach((item) => {
        selectArr.push(item);
      });
    }

    watch(selectArr, () => {
      emit('update:items', selectArr);
    });

    watch(
      () => props.bindModelKey,
      (val) => {
        if (plumb) {
          plumb.deleteEveryConnection();
        }
        selectArr.splice(0, selectArr.length);
        if (props.items?.length) {
          props.items?.forEach((item) => {
            selectArr.push(item);
          });
        }
        // 使用上次配置
        const configArr = configMap[val!];
        if (configArr?.length) {
          configArr.forEach((item) => {
            selectArr.push(item);
          });
        }
        init();
      },
    );

    // 加载指定模型的属性
    const loadModelFields = async (key: string) => {
      const data = await getModelMetaDetail({ modelKey: key });
      if (data) {
        modelMap[key] = data;
        if (key === props.bindModelKey) {
          optMap[key] = props.fields
            .filter((field) => {
              const data = field.props;
              if (types.includes(data.fieldType) && data.bindModelKey !== data.modelKey) {
                return true;
              }
              return false;
            })
            .map((field) => {
              const { props } = field;
              return {
                id: field.id!,
                value: props.field!,
                label: props.fieldName! || props.label,
                // 当前属性归属模型
                modelKey: props.bindModelKey,
                // 当前属性引用模型
                refModelKey: props.bindModelKey,
              };
            });
        } else {
          const items = data.fieldMetaList || [];
          selectArr.forEach((i) => {
            if (i.modelKey === data.key) {
              i.permissionEnabled = data.permissionEnabled;
            }
          });
          optMap[key] = items
            .filter((item) => {
              return (
                types.includes(item.type as any) &&
                item.bindInfo !== key &&
                item.bindInfo == props.bindModelKey
              );
            })
            .map((item) => {
              return {
                id: item.id,
                value: item.key!,
                name: item.name!,
                label: props.mode === 'view' ? selrender(item) : item.name!,
                // 当前属性归属模型
                modelKey: item.modelKey,
                // 当前属性引用模型
                refModelKey: item.bindInfo,
                permissionEnabled: item.permissionEnabled ?? 0,
              };
            });
        }
      }
    };

    // 初始化连线工具类实例
    const initPlumb = () => {
      const el = containerRef.value;
      if (el) {
        plumb = newInstance({
          container: el,
          // 禁止元素拖动
          connectionsDetachable: false,
          elementsDraggable: false,
        });

        if (selectArr.length > 0) {
          renderConnect();
        }
      }
    };

    // 根据数据绘制连线
    const renderConnect = (): void => {
      const container = containerRef.value;
      if (!container) return;

      const sourceNodes = container.getElementsByClassName(
        ns.b('linkage-item'),
      ) as HTMLCollectionOf<HTMLDivElement>;
      const targetNodes = container.getElementsByClassName(
        ns.b('linkage-item-right'),
      ) as HTMLCollectionOf<HTMLDivElement>;

      if (targetNodes.length === 0) return;

      const targetNode = targetNodes[0];

      for (let i = 0; i < sourceNodes.length; i++) {
        const sourceNode = sourceNodes[i];
        const data = selectArr[i];
        connectNodes(sourceNode, targetNode, data, i);
      }
    };

    // 节点连接：从左侧节点右边中心点连接到右侧 target 节点左边中心点
    const connectNodes = (
      source: HTMLDivElement,
      target: HTMLDivElement,
      data: linkageItem,
      index: number,
    ): void => {
      const rootStyle = getComputedStyle(document.documentElement);
      const primaryColor = rootStyle.getPropertyValue('--gct-color-primary').trim();

      // 判断是否为有效连线（实线）还是虚线
      const isValidConnection = !isEmpty(data) && data?.modelKey && data.value;

      const paintStyle = isValidConnection
        ? { strokeWidth: 1, stroke: primaryColor, dashstyle: '0' }
        : {
            strokeWidth: 1,
            stroke: '#C3C3C3',
            dashstyle: '4 4',
            outlineStroke: '#F6F8FA', // 背景色遮挡，防止虚线重叠变实线
            outlineWidth: 2,
          };

      const endpointStyle = isValidConnection
        ? { fill: primaryColor }
        : { fill: '#C3C3C3', stroke: '#C3C3C3' };

      // 实线层级高于虚线
      const cssClass = isValidConnection ? ns.b('linkage-line-solid') : ns.b('linkage-line-dashed');
      // 箭头层级需要高于连线
      const arrowCssClass = isValidConnection
        ? ns.b('linkage-arrow-solid')
        : ns.b('linkage-arrow-dashed');

      const opts: ConnectParams<Element> = {
        source,
        target,
        data: { index, item: data },
        cssClass,
        hoverClass: ns.b('linkage-line-hover'),
        paintStyle,
        endpointStyle,
        connector: {
          type: FlowchartConnector.type,
          options: {
            stub: [0, 25],
            cornerRadius: 10,
          } as FlowchartConnectorOptions,
        },
        endpoints: [
          { type: 'Blank' },
          {
            type: ArrowEndpoint.type,
            options: { direction: 'right', cssClass: arrowCssClass } as ArrowEndpointParams,
          },
        ],
        // 左侧节点右边中心点 -> 右侧节点左边中心点
        anchors: ['Right', 'Left'],
        overlays: [
          {
            type: 'Custom',
            options: {
              id: 'change',
              location: 0.5,
              create: (): HTMLDivElement => {
                const div = document.createElement('div');
                div.classList.add(ns.b('custom-overlay-line'));
                div.classList.add(ns.be('custom-overlay-line', 'not-special-line'));
                return div;
              },
            },
          },
        ],
      };

      plumb.connect(opts);
    };

    // 重新绘制连线
    const reDraw = () => {
      if (plumb) {
        plumb.deleteEveryConnection();
        nextTick(() => {
          renderConnect();
        });
        // resetEnd();
      }
    };

    // 处理窗口/容器尺寸变化，重新绘制连线
    const handleResize = () => {
      if (plumb) {
        // 使用 jsPlumb 的 repaintEverything 方法重新绘制所有连线
        plumb.repaintEverything();
      }
    };

    async function loadModels(modelKey) {
      const res = await getModelMetaListModelReferencedBy({ modelKey, type: 'ref,rdo_ref' });
      if (res) {
        originModels.value = res!;
      }
    }

    const modelOptions = computed(() =>
      originModels.value
        .map((i) => ({ value: i.key, label: i.name }))
        .filter((v) => {
          const selectVals = selectArr.map((j) => j.modelKey) || [];
          return !selectVals.includes(v.value!);
        }),
    );

    const getModelOptions = (item) => {
      return item?.modelKey
        ? [...modelOptions.value, { value: item?.modelKey, label: item?.modelName }]
        : modelOptions.value;
    };

    // 初始化界面
    const init = async () => {
      const all: Promise<void>[] = [];
      if (props.bindModelKey) {
        all.push(loadModels(props.bindModelKey));

        selectArr.forEach((select) => {
          if (select.modelKey) {
            all.push(loadModelFields(select.modelKey));
          }
        });

        if (!selectArr.length) {
          selectArr.push({
            id: '',
            value: '',
            label: '',
            modelKey: '',
            modelName: '',
            permissionEnabled: false,
          });
        }
      }

      await Promise.all(all);

      isInit.value = true;

      nextTick(() => {
        initPlumb();
      });
    };

    // 节点模型选择
    const slectModel = async (data: linkageItem, val: string, _data: any) => {
      data.modelKey = val;
      data.modelName = _data?.label;
      data.permissionEnabled = _data?.permissionEnabled || 0;
      if (val) {
        await loadModelFields(val);
      }
      reverseSelectChange(data, null, null);
      // 所选主模型下只有一个模型关联字段时，模型字段自动填入
      if (optMap[val]?.length == 1) {
        const _data = optMap[val][0];
        reverseSelectChange(data, _data.value, _data);
      }
      reDraw();
    };

    // 反转节点属性选择
    const reverseSelectChange = (data: linkageItem, val: any, _data: any) => {
      data.value = val;
      data.label = _data?.label;
      reDraw();
      console.log('modelOptions--------------', modelOptions.value, selectArr);
      // 更新模型历史配置
      configMap[props.bindModelKey!] = clone(selectArr);
    };

    const calcItemPos = (i: number) => {
      if (i == 0) {
        return {
          top: props.mode === 'view' ? 0 : 24 + 'px',
          left: (props.mode === 'view' ? 12 : 24) + 'px',
        };
      } else {
        return {
          top: props.mode === 'view' ? (87 + 12) * i + 'px' : (130 + 12) * i + 24 + 'px',
          left: (props.mode === 'view' ? 12 : 24) + 'px',
        };
      }
    };

    const selrender = (item) => {
      return () =>
        h('span', { class: 'field-icon' }, [
          h('i', { class: ['iconfont', FieldIconMap[item.type] || 'text'] }),
          item.name,
        ]);
    };

    const filterOption = (input: string, option: any) => {
      if (option.name) {
        return option.name.includes(input?.trim());
      }
      return option.label?.includes(input?.trim());
    };

    const renderRightItem = () => {
      const content: unknown[] = [];
      content.push(
        <div class={ns.be('linkage-item', 'title')}>
          <span
            class={[ns.be('linkage-item', 'icon'), ns.is('link', props.permissionEnabled !== 0)]}
          >
            <span></span>
          </span>
          <span class={ns.be('linkage-item', 'title-text')}>关联模型</span>
        </div>,
      );
      content.push(
        <div
          class={[ns.be('linkage-item', 'content'), ns.is('view-mode', props.mode === 'view')]}
          title={props.bindModelName}
        >
          {props.bindModelName}
        </div>,
      );
      return (
        <div
          class={[ns.b('linkage-item-right'), ns.is('view-mode', props.mode === 'view')]}
          id="PermScopeRefModel"
          style={{
            top: props.mode === 'view' ? '0' : '24px',
            right: props.mode === 'view' ? '12px' : '24px',
          }}
          key={props.bindModelKey}
        >
          {content}
        </div>
      );
    };

    const handleAdd = () => {
      const data: linkageItem = {
        id: '',
        label: '',
        modelKey: '',
        modelName: '',
        value: '',
      };
      selectArr.push(data);
      nextTick(() => {
        reDraw();
      });
    };

    const handleDelete = (i: number) => {
      if (plumb) {
        plumb.deleteEveryConnection();
      }
      selectArr.splice(i, 1);
      nextTick(() => {
        reDraw();
      });
    };

    const calcBtnPos = () => {
      const top = selectArr.length * (130 + 12) + 24;
      return { left: '24px', top: top + 'px' };
    };

    const renderAddItem = () => {
      return (
        <div class={ns.b('linkage-item-add')} style={calcBtnPos()} onClick={handleAdd}>
          <span class="icon gct-iconfont icon-tianjia-shixin mr-6px"></span>
          <span>添加主模型</span>
        </div>
      );
    };

    const renderLinkageItem = (item: linkageItem, i: number) => {
      const content: unknown[] = [];
      const select = selectArr.find((data, index) => {
        return data.modelKey === item.refModelKey && index >= i;
      });
      if (selectArr.length <= 1 || props.mode === 'view') {
        content.push(
          <div class={ns.be('linkage-item', 'title')}>
            <span class={[ns.be('linkage-item', 'icon'), ns.is('link', !!item.permissionEnabled)]}>
              <span></span>
            </span>
            <span class={ns.be('linkage-item', 'title-text')}>主模型</span>
          </div>,
        );
      } else {
        content.push(
          <div class={ns.be('linkage-item', 'title')}>
            <span class={[ns.be('linkage-item', 'icon'), ns.is('link', !!item.permissionEnabled)]}>
              <span></span>
            </span>
            <span class={ns.be('linkage-item', 'title-text')}>主模型</span>
            <span
              class={['icon', 'gct-iconfont', 'icon-icon_shanchu']}
              onClick={() => handleDelete(i)}
            ></span>
          </div>,
        );
      }
      content.push(
        <div
          class={[
            ns.be('linkage-item', 'select'),
            ns.is('select', !!select?.value),
            ns.is('view-mode', props.mode === 'view'),
          ]}
        >
          <a-select
            allowClear
            showSearch
            class={ns.is('error', props.hasVali && !item.modelKey)}
            placeholder={t('sys.pleaseSelectSth', { sth: t('sys.model') })}
            disabled={props.mode === 'view'}
            value={item.modelKey || null}
            options={getModelOptions(item)}
            filterOption={filterOption}
            onChange={(val, o) => slectModel(item, val, o)}
          />
          <a-select
            allowClear
            showSearch
            class={['last-select', ns.is('error', props.hasVali && !item.value)]}
            placeholder={t('sys.pleaseSelectSth', { sth: t('sys.model.refField') })}
            disabled={props.mode === 'view'}
            value={item.value || null}
            options={optMap[item.modelKey] || []}
            filterOption={filterOption}
            option-label-prop="label"
            onChange={(val, o) => reverseSelectChange(item, val, o)}
          />
        </div>,
      );
      return (
        <div
          class={[
            ns.b('linkage-item'),
            ns.be('linkage-item', i.toString()),
            ns.is('view-mode', props.mode === 'view'),
          ]}
          style={calcItemPos(i)}
          key={i}
        >
          {content}
        </div>
      );
    };

    const calcConHight = (length: number, mode: string) => {
      let hight = 428;
      if (mode === 'view') {
        hight = length * (87 + 12);
      }
      return { height: `${hight}px` };
    };

    init();

    // 使用 useResizeObserver 监听容器大小变化
    useResizeObserver(containerRef, () => {
      handleResize();
    });

    const resetConfig = () => {
      selectArr.splice(0, selectArr.length);
      Object.assign(configMap, {});
    };

    expose({
      resetConfig,
    });

    return {
      t,
      ns,
      containerRef,
      isInit,
      optMap,
      selectArr,
      calcItemPos,
      renderLinkageItem,
      renderRightItem,
      renderAddItem,
      calcConHight,
    };
  },
  render() {
    if (this.isInit === false) {
      return null;
    }
    const list: linkageItem[] = this.selectArr;
    return (
      <view-container class={[this.ns.b(), this.ns.is('view-mode', this.mode === 'view')]}>
        <div class={[this.ns.b('model-links')]}>
          <div
            ref="containerRef"
            class={[
              this.ns.be('model-links', 'content'),
              this.ns.is('view-mode', this.mode === 'view'),
            ]}
            style={this.calcConHight(list.length, this.mode)}
          >
            {list.map((item, i) => {
              return this.renderLinkageItem(item, i);
            })}
            {this.mode === 'view' ? null : this.renderAddItem()}
            {this.renderRightItem()}
          </div>
        </div>
      </view-container>
    );
  },
});
