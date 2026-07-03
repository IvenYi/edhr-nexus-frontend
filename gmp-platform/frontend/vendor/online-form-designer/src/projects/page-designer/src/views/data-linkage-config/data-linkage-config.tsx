/* eslint-disable vue/no-setup-props-destructure */
import { computed, defineComponent, nextTick, PropType, reactive, ref, toRef, watch } from 'vue';
import { IDictionaryItem, IModal, useModal, useNamespace } from '@gct/runtime';
import {
  getModelMetaDetail,
  getModelMetaListModelReferencedBy,
} from '/@/apis/gct-apaas/ModelMetaController';
import { ModelMetaDTO } from '/@/apis/gct-apaas/model';
import { useI18n } from 'vue-i18n';
import { clone, isEmpty, last } from 'lodash-es';
import {
  BrowserJsPlumbInstance,
  newInstance,
  FlowchartConnector,
  FlowchartConnectorOptions,
  DotEndpoint,
  AnchorSpec,
  DotEndpointParams,
  EndpointFactory,
  ConnectParams,
  EVENT_CONNECTION_CLICK,
} from '@jsplumb/browser-ui';
import { ArrowEndpoint, ArrowEndpointHandler, ArrowEndpointParams } from './arrow-endpoint';
import { register } from './blank-endpoint-renderer';
import { linkageItem } from '../../types/views';
import { FIELD_TYPE } from '/@/enums/appEnum';
import { Modal } from 'ant-design-vue';
import './data-linkage-config.scss';

// jsplumb 插件：注册三角箭头
register();

EndpointFactory.registerHandler(ArrowEndpointHandler);

export const DataLinkageConfig = defineComponent({
  name: 'DataLinkageConfig',
  props: {
    mode: {
      type: String as PropType<'linkage' | 'mob-search' | 'component'>,
      default: 'linkage',
    },
    contentTitle: {
      type: String,
      default: 'sys.pageDesigner.dataLinkage.linksTitle',
    },
    deleteMessage: {
      type: String,
      default: 'sys.pageDesigner.dataLinkage.confirm.title',
    },
    context: {
      type: Object as PropType<IData>,
      default: () => {
        return {};
      },
    },
    // 当前选中字段的名称
    label: {
      type: String,
    },
    // 历史数据
    items: {
      type: Array<linkageItem>,
    },
    endData: {
      type: Object as PropType<IData>,
      default: () => {
        return {};
      },
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
    // 最大节点数，默认无限制
    max: {
      type: Number,
    },
    endFieldTypes: {
      type: Array<string>,
      default: () => {
        return [FIELD_TYPE.SERIALRULE];
      },
    },
    endBeforeInfo: {
      type: String,
      default: 'sys.pageDesigner.dataLinkage.descBefore2',
    },
    endAfterInfo: {
      type: String,
      default: 'sys.pageDesigner.dataLinkage.descAfter2',
    },
    showEndInfo: {
      type: Boolean,
      default: true,
    },
    endPlaceholder: {
      type: String,
      default: 'sys.pageDesigner.dataLinkage.rootSelectPlaceholder2',
    },
    excludeFieldType: {
      type: Array<FIELD_TYPE>,
      default: () => {
        return [FIELD_TYPE.REF];
      },
    },
  },
  emits: ['update:items', 'update:endData'],
  setup(props, { emit }) {
    const { t } = useI18n() as any;
    const ns = useNamespace('data-linkage-config');

    // 支持选择的属性类型清单
    let types = [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI, FIELD_TYPE.RDO_REF, FIELD_TYPE.MASTERSLAVE];

    if (props.mode === 'mob-search') {
      types = [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI, FIELD_TYPE.RDO_REF];
    }
    if (props.mode === 'component') {
      types = props.excludeFieldType || [FIELD_TYPE.REF];
    }

    const hideHeader = props.mode !== 'linkage';

    const hideFooter = props.mode !== 'component';

    const isInit = ref<boolean>(false);

    const containerRef = ref<HTMLDivElement>();

    let plumb: BrowserJsPlumbInstance = null as any;

    // 反转节点可选择模型
    const reverseModels = ref<ModelMetaDTO[]>([]);

    // 反转节点选择模型组件使用
    const reverseOptions = computed(() => {
      return reverseModels.value.map((item) => {
        return {
          value: item.key,
          label: item.name,
        };
      });
    });

    // 反转节点选择模型属性使用
    const reverseFieldOptions = ref<any[]>([]);

    // 结束节点选项
    const endOptions = ref<any[]>([]);

    // 已经加载过的模型缓存
    const modelMap: Record<string, ModelMetaDTO> = reactive({});

    // 已经计算过的属性清单缓存
    const optMap: Record<string, IDictionaryItem[]> = reactive({});

    // 当前选中的数据清单缓存，标识取 modelKey
    const selectArr: linkageItem[] = reactive([]);

    // selectCache 在切换选择属性或者清空选择属性时，缓存上次的选择结果。以便在再次切回去时回显
    const selectCacheMap: Map<string, linkageItem[]> = reactive(new Map());

    const endSelect = toRef(props.endData ?? {});

    if (props.modal) {
      useModal(async () => {
        const items: IData[] = [];
        selectArr.forEach((select) => {
          items.push(select);
        });
        if (props.mode === 'mob-search') {
          items.splice(0, 1);
        }
        if (props.mode === 'component') {
          if (!endSelect.value.value) {
            return {
              ok: true,
            };
          }
          return {
            ok: true,
            data: [
              {
                items: selectArr,
                endData: endSelect.value,
              },
            ],
          };
        }
        return {
          ok: true,
          data: items,
        };
      });
    }

    if (props.items) {
      props.items.forEach((item) => {
        selectArr.push(item);
      });
    }

    if (props.mode === 'component') {
      watch(selectArr, () => {
        emit('update:items', selectArr);
      });
      watch(endSelect.value, () => {
        emit('update:endData', endSelect.value);
      });
    }

    // 跟模型 key
    const modelKey = props.context.bindModelKey!;

    const { fieldModelKey } = props.context;

    async function loadReverseModels(modelKey: string): Promise<void> {
      const data = await getModelMetaListModelReferencedBy({ modelKey });
      if (data) {
        reverseModels.value = data!;
      }
    }

    // 加载指定模型的属性
    const loadModelFields = async (key: string) => {
      const data = await getModelMetaDetail({ modelKey: key });
      if (data) {
        modelMap[key] = data;
        if (key === modelKey && props.mode === 'linkage') {
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
                modelKey,
                // 当前属性引用模型
                refModelKey: props.bindModelKey,
              };
            });
        } else {
          const items = data.fieldMetaList || [];
          optMap[key] = items
            .filter((item) => {
              return types.includes(item.type as any) && item.bindInfo !== key;
            })
            .map((item) => {
              return {
                id: item.id,
                value: item.key!,
                label: item.name!,
                // 当前属性归属模型
                modelKey: item.modelKey,
                // 当前属性引用模型
                refModelKey: item.bindInfo,
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
        plumb.bind(EVENT_CONNECTION_CLICK, (conn) => {
          if (conn.data.index > 1) {
            reverseItem(conn.data.index);
          }
        });
        renderConnect();
      }
    };

    // 根据数据绘制连线
    const renderConnect = () => {
      const el = containerRef.value!;
      const els = el.getElementsByClassName(
        ns.b('linkage-item'),
      ) as HTMLCollectionOf<HTMLDivElement>;
      let source: HTMLDivElement | null = null;
      for (let i = 0; i < els.length; i++) {
        const item = els[i];
        const data: linkageItem = selectArr[i];
        // 反转模式下 target 和 source 需要翻转
        if (data && data.reverse === true) {
          const target = source;
          source = item.getElementsByClassName('ant-select')[1] as HTMLDivElement;
          connect(data, source, target, i, els.length);
        } else {
          connect(data, source, item, i, els.length);
        }
        const next = selectArr[i + 1];
        if (next && next.reverse === true) {
          source = item;
        } else {
          source = item.getElementsByClassName('ant-select')[0] as HTMLDivElement;
        }
      }
    };

    // 节点连接
    const connect = (data: linkageItem, source, item, i, size) => {
      const reverse = data?.reverse === true;
      const isLast = i + 1 === size;
      // 行，从0开始
      const topI = Math.floor(i / 3);
      // 列，从0开始
      const leftI = i % 3;
      if (source) {
        // 是否每行最后特殊的弯曲线
        let specialLine = false;
        // 默认从左往右画线 // [x, y, ox, oy]
        let anchors: [AnchorSpec, AnchorSpec] = reverse
          ? ['Left', [1, 0.5, 0, 0, 0, 14]]
          : ['Right', [0, 0.5, 0, 0, 0, 14]];
        if (topI > 0 && leftI === 0) {
          specialLine = true;
          // 每行最后的线特殊画
          anchors = topI % 2 === 0 ? ['Left', 'Left'] : ['Right', 'Right'];
        } else if ((topI + 1) % 2 !== 1) {
          // topI 下标 +1 为当前行，双数行从右往左画线
          anchors = reverse ? ['Right', [0, 0.5, 0, 0, 0, 14]] : ['Left', [1, 0.5, 0, 0, 0, 14]];
        }
        const target = item as HTMLDivElement;
        const opts: ConnectParams<Element> = {
          source,
          target,
          data: {
            index: i,
            item: data,
          },
          hoverClass: ns.b('linkage-line-hover'),
          paintStyle: { strokeWidth: 1, stroke: '#3168EC', dashstyle: '0' },
          endpointStyle: { fill: '#3168EC' },
          connector: {
            type: FlowchartConnector.type,
            options: {
              stub: [0, 25],
              cornerRadius: 10,
            } as FlowchartConnectorOptions,
          },
          endpoints: [
            { type: DotEndpoint.type, options: { radius: 3 } as DotEndpointParams },
            {
              type: ArrowEndpoint.type,
              options: {
                direction:
                  (topI + 1) % 2 === 1
                    ? reverse && !specialLine
                      ? 'left'
                      : 'right'
                    : reverse && !specialLine
                    ? 'right'
                    : 'left',
              } as ArrowEndpointParams,
            },
          ],
          anchors,
        };
        // 虚拟线
        let constructionLine = false;
        if (isLast && (isEmpty(data) || isEnd(data, i) !== true || !data.modelKey || !data.value)) {
          opts.paintStyle = { strokeWidth: 1, stroke: '#C3C3C3', dashstyle: '4 4' };
          opts.endpointStyle = { fill: '#C3C3C3' };
          constructionLine = true;
        }
        opts.overlays = [
          {
            type: 'Custom',
            options: {
              id: 'change',
              location: 0.5,
              create: () => {
                const div = document.createElement('div');
                div.classList.add(ns.b('custom-overlay-line'));
                if (specialLine === true) {
                  div.classList.add(ns.be('custom-overlay-line', 'special-line'));
                } else {
                  div.classList.add(ns.be('custom-overlay-line', 'not-special-line'));
                }
                return div;
              },
            },
          },
          {
            type: 'Custom',
            options: {
              id: 'delete',
              location: 0.5,
              create: () => {
                // 容器
                const div = document.createElement('div');
                div.classList.add(ns.b('custom-overlay'));
                if (specialLine === true) {
                  div.classList.add(ns.be('custom-overlay', 'special-line'));
                } else {
                  div.classList.add(ns.be('custom-overlay', 'not-special-line'));
                }
                if (!constructionLine) {
                  // 删除按钮
                  const iEl = document.createElement('i');
                  iEl.className = 'iconfont icon-caiqie1 delete-action';
                  iEl.onclick = (e: MouseEvent) => {
                    e.stopPropagation();
                    Modal.confirm({
                      title: t(props.deleteMessage),
                      content: t('sys.pageDesigner.dataLinkage.confirm.content'),
                      onOk: () => {
                        if (reverse) {
                          reverseCut();
                        } else {
                          itemSelectChange(data.modelKey, null, null);
                        }
                      },
                    });
                  };
                  div.appendChild(iEl);
                }
                // 反转按钮
                if (i > 1) {
                  const iEl2 = document.createElement('i');
                  iEl2.className = 'iconfont icon-qiehuan1 reverse-action';
                  iEl2.onclick = (e: MouseEvent) => {
                    e.stopPropagation();
                    reverseItem(i);
                  };
                  div.appendChild(iEl2);
                }
                return div;
              },
            },
          },
        ];
        plumb.connect(opts);
      }
    };

    // 重新绘制连线
    const reDraw = () => {
      if (plumb) {
        plumb.deleteEveryConnection();
        nextTick(() => {
          renderConnect();
        });
        resetEnd();
      }
    };

    // 初始化界面
    const init = async () => {
      const all: Promise<void>[] = [];
      all.push(loadModelFields(modelKey));

      selectArr.forEach((select) => {
        if (select.reverse === true) {
          if (select.modelKey) {
            all.push(
              new Promise<void>((resolve) => {
                loadReverseModels(select.refModelKey).then(() => {
                  filterReverseFieldOptions(select.modelKey);
                  resolve();
                });
              }),
            );
            // reverseSelectModel
          }
        } else if (select.refModelKey) {
          all.push(loadModelFields(select.refModelKey));
        }
      });

      // 搜索模式下，补充结构。在返回数值时再删除结构
      if (props.mode === 'mob-search') {
        const item = selectArr[0];
        const model = modelMap[modelKey];
        selectArr.splice(0, 0, {
          id: item ? item.id : (null as any),
          value: item ? item.value : (null as any),
          label: item ? item.label : (null as any),
          modelKey,
          modelCategory: model?.modelCategory ?? '',
          refModelKey: modelKey,
          refModelCategory: model?.modelCategory ?? '',
        });
      }

      if (props.endData && props.endData.modelkey && !hideFooter) {
        all.push(loadEndOptions(props.endData.modelkey));
      }

      await Promise.all(all);

      isInit.value = true;

      nextTick(() => {
        initPlumb();
      });
    };

    const itemSelectChange = async (
      refModelKey,
      value,
      data,
      isReDraw: boolean = true,
      index: number = 0,
    ) => {
      // 只要重新选择先清理后续选中的内容
      const i = selectArr.findIndex((item, _i) => {
        return item.modelKey === refModelKey && _i >= index;
      });
      if (i !== -1) {
        let _i = i;
        if (i === 0 && (props.mode === 'mob-search' || props.mode === 'component')) {
          const item = selectArr[0];
          if (value) {
            item.value = value;
            item.label = data.label;
          } else {
            item.value = null as any;
            item.label = null as any;
          }
          _i += 1;
        }
        // 分离出删除的内容，用于缓存
        const clears: linkageItem[] = selectArr.slice(_i);
        // 删除需要删除的节点
        selectArr.splice(_i, selectArr.length);
        if (clears.length > 0) {
          selectCacheMap.set(`${clears[0].modelKey}:${clears[0].value}`, clone(clears));
        }
      }
      if (data) {
        const lastData = last(selectArr);
        if (lastData?.reverse === true) {
          selectArr.pop();
        }
        const key = `${data.modelKey}:${value}`;
        if (selectCacheMap.has(key)) {
          const items = selectCacheMap.get(key)!;
          items.forEach((item) => {
            selectArr.push(clone(item));
          });
          const last = selectArr[selectArr.length - 1];
          if (last.reverse === true && last.refModelKey) {
            filterReverseFieldOptions(last.modelKey);
          }
        } else {
          await loadModelFields(data.refModelKey);
          const model = modelMap[data.modelKey];
          const refModel = modelMap[data.refModelKey];
          // 清理完成后再设置
          selectArr.push({
            id: data.id,
            value: value,
            label: data.label,
            modelKey: model?.key ?? '',
            modelCategory: model?.modelCategory ?? '',
            refModelKey: refModel?.key ?? '',
            refModelCategory: refModel?.modelCategory ?? '',
          });
        }
      }
      reverseModel2 = {};
      if (isReDraw) {
        nextTick(() => {
          reDraw();
        });
      }
    };

    // 反转之前选中的模型备份
    let reverseModel: any = {};
    // 已反转的节点反转成正向时的备份
    let reverseModel2: any = {};

    const reverseItem = async (i: number) => {
      if (plumb) {
        plumb.deleteEveryConnection();
      }
      const isNext = i > selectArr.length - 1;
      const data = i <= selectArr.length - 1 ? selectArr[i]! : selectArr[selectArr.length - 1];
      selectArr.splice(i, selectArr.length);
      if (data?.reverse === true) {
        if (!reverseModel || isEmpty(reverseModel)) {
          const last = selectArr[selectArr.length - 1];
          await itemSelectChange(last.modelKey, null, null, false, i);
        } else {
          await itemSelectChange(
            reverseModel.modelKey,
            reverseModel.value,
            reverseModel,
            false,
            selectArr.length - 1,
          );
        }
        reverseModel2 = clone(data);
      } else {
        if (reverseModel2.reverse === true) {
          selectArr.push(clone(reverseModel2));
          filterReverseFieldOptions(reverseModel2.modelKey);
          reverseModel2 = {};
        } else {
          const modelKey = isNext ? data.refModelKey : data.modelKey;
          await loadReverseModels(modelKey);
          if (i < selectArr.length) {
            await itemSelectChange(data.modelKey, null, null, false, i);
          }
          const model = modelMap[modelKey];
          const data2: linkageItem = {
            id: '',
            label: '',
            modelKey: '',
            modelCategory: '',
            refModelKey: model.key!,
            refModelCategory: model.modelCategory!,
            reverse: true,
            value: '',
          };
          selectArr.push(data2);
        }
        reverseModel = clone(data);
      }
      nextTick(() => {
        reDraw();
      });
    };

    // 最后反转节点删除
    const reverseCut = () => {
      const lastItem = last(selectArr);
      if (lastItem && lastItem.reverse === true) {
        reverseModel2 = clone(lastItem);
        selectArr.pop();
      }
      nextTick(() => {
        reDraw();
      });
    };

    // 过滤反转节点可以选择的属性
    const filterReverseFieldOptions = (modelKey: string) => {
      const item = reverseModels.value.find((_) => _.id === modelKey);
      if (item) {
        reverseFieldOptions.value = (item.fieldMetaList || [])
          .filter((item) => {
            if (item.modelKey === modelKey && types.includes(item.type as any)) {
              return true;
            }
            return false;
          })
          .map((item) => {
            return {
              value: item.key,
              label: item.name,
            };
          });
      } else {
        reverseFieldOptions.value = [];
      }
    };

    // 反转节点模型选择
    const reverseSelectModel = (data: linkageItem, val: string, _data: any) => {
      data.modelKey = val;
      if (val) {
        filterReverseFieldOptions(val);
      } else {
        reverseFieldOptions.value = [];
      }
      reverseSelectChange(data, null, null);
      reDraw();
    };

    // 反转节点属性选择
    const reverseSelectChange = (data: linkageItem, val: any, _data: any) => {
      data.value = val;
      data.label = _data?.label;
      reDraw();
    };

    const calcItemPos = (i: number) => {
      // 行，从0开始
      const topI = Math.floor(i / 3);
      // 列，从0开始
      const leftI = i % 3;
      // 单数行
      if (topI % 2 !== 1) {
        return {
          top: 24 * (topI + 1) + 84 * topI + 'px',
          left: 46 * (leftI + 1) + 178 * leftI - 25 + 'px',
        };
      } else {
        // 双数行
        return {
          top: 24 * (topI + 1) + 84 * topI + 'px',
          left: 46 * (3 - leftI) + 178 * (2 - leftI) - 25 + 'px',
        };
      }
    };

    // 是否为结束节点
    const isEnd = (item: linkageItem, i: number) => {
      // const options = optMap[item.refModelKey] || [];
      return (
        // 节点和跟为同一个结束
        item.refModelKey === fieldModelKey ||
        // 是最大节点，结束
        (props.max && props.max === i + 1) ||
        // 无可选项结束
        // options.length === 0 ||
        // 反转节点结束
        item.reverse === true
      );
    };

    // 下一个是否为反转节点模式，并且选择了模型
    const nextIsReverseMode = (i: number): boolean => {
      const next = selectArr[i + 1];
      if (next && next.reverse === true && next.modelKey && next.value) {
        return true;
      }
      return false;
    };

    const renderLinkageItem = (item: linkageItem, i: number) => {
      const content: unknown[] = [];
      const nextReverse = nextIsReverseMode(i);
      if (item.reverse) {
        content.push(
          <div class={[ns.be('linkage-item', 'title'), ns.be('linkage-item', 'model-select')]}>
            <a-select
              size="small"
              allowClear
              placeholder={t('sys.pageDesigner.selectModel')}
              value={item.modelKey || null}
              options={reverseOptions.value}
              onChange={(val, o) => reverseSelectModel(item, val, o)}
            />
          </div>,
        );
        content.push(
          <div class={[ns.be('linkage-item', 'select')]}>
            <a-select
              allowClear
              placeholder={t('sys.pageDesigner.dataLinkage.selectPlaceholder')}
              value={item.value || null}
              options={reverseFieldOptions.value}
              onChange={(val, o) => reverseSelectChange(item, val, o)}
            />
          </div>,
        );
      } else {
        const end = isEnd(item, i);
        console.log('linkage---', optMap, item);
        const options = optMap[item.refModelKey] || [];
        const refModel = modelMap[item.refModelKey];
        const select = selectArr.find((data, index) => {
          return data.modelKey === item.refModelKey && index >= i;
        });
        content.push(
          <div class={ns.be('linkage-item', 'title')} title={refModel?.name}>
            {refModel?.name}
          </div>,
        );
        if (nextReverse !== true) {
          content.push(
            <div class={[ns.be('linkage-item', 'select'), ns.is('select', !!select?.value)]}>
              {end ? (
                <div class={ns.be('linkage-item', 'end')}>
                  <div class={ns.bem('linkage-item', 'end', 'line')}></div>
                  <div class={ns.bem('linkage-item', 'end', 'label')}>
                    {t('sys.pageDesigner.end')}
                  </div>
                </div>
              ) : (
                <a-select
                  value={select?.value}
                  allowClear
                  options={options}
                  placeholder={t('sys.pageDesigner.dataLinkage.selectPlaceholder')}
                  onChange={(val, o) => itemSelectChange(item.refModelKey, val, o, true, i)}
                />
              )}
            </div>,
          );
        }
      }
      return (
        <div
          class={[
            ns.b('linkage-item'),
            ns.be('linkage-item', i.toString()),
            ns.is('active', nextReverse),
          ]}
          style={calcItemPos(i)}
          key={item.modelKey}
        >
          {content}
        </div>
      );
    };

    const isHiddenInfo = computed(() => {
      if (selectArr.length >= 1) {
        return isEnd(selectArr[selectArr.length - 1], selectArr.length - 1);
      }
      return false;
    });

    let oldKey = '';
    let endModel: any = null;
    const loadEndOptions = async (key: string) => {
      if (oldKey === key) {
        return;
      }
      oldKey = key;
      const data = await getModelMetaDetail({ modelKey: key });
      if (data) {
        endModel = data;
        const items = data.fieldMetaList || [];
        const options = items
          .filter((item) => {
            return props.endFieldTypes.includes(item.type!);
          })
          .map((item) => {
            return {
              label: item.name,
              value: item.key,
              _title: `${data.name}.${item.name}`,
            };
          });
        if (options.length > 0) {
          endOptions.value = [
            {
              label: data.name,
              value: data.key,
              selectable: false,
              children: options,
            },
          ];
          return;
        }
      }
      endOptions.value = [];
    };

    const footerLoading = ref<boolean>(false);
    let isDropOpen = false;
    const onDropLoad = async () => {
      isDropOpen = !isDropOpen;
      if (isDropOpen === false) {
        return;
      }
      footerLoading.value = true;
      const last = selectArr[selectArr.length - 1];
      await loadEndOptions(last.reverse === true ? last.modelKey : last.refModelKey);
      footerLoading.value = false;
    };

    // 重置 footer 结束节点
    const resetEnd = () => {
      Object.assign(endSelect.value, {
        value: null,
        label: null,
        key: null,
        modelCategory: null,
      });
    };

    const endChange = (...args) => {
      const data = args[1];
      if (!data) {
        resetEnd();
      } else {
        Object.assign(endSelect.value, data);
        Object.assign(endSelect.value, {
          modelkey: endModel.key,
          modelCategory: endModel.modelCategory,
        });
      }
    };

    const clearTreeSelect = (val) => {
      if (!val) {
        resetEnd();
      }
    };

    init();

    return {
      t,
      ns,
      hideHeader,
      hideFooter,
      containerRef,
      isInit,
      modelKey,
      optMap,
      selectArr,
      isHiddenInfo,
      endOptions,
      footerLoading,
      endSelect,
      calcItemPos,
      isEnd,
      itemSelectChange,
      renderLinkageItem,
      loadEndOptions,
      onDropLoad,
      endChange,
      clearTreeSelect,
    };
  },
  render() {
    if (this.isInit === false) {
      return null;
    }
    const selectRoot = this.selectArr[0] || ({} as unknown as linkageItem);
    const list: linkageItem[] = this.selectArr;
    return (
      <view-container class={this.ns.b()}>
        {this.hideHeader ? null : (
          <div class={this.ns.b('model-info')}>
            <span>{this.t('sys.pageDesigner.dataLinkage.descBefore')}</span>
            <span>
              <a-select
                value={selectRoot.value}
                placeholder={this.t('sys.pageDesigner.dataLinkage.rootSelectPlaceholder')}
                class={this.ns.be('model-info', 'select')}
                options={this.optMap[this.modelKey]}
                allowClear
                onChange={(val, data) => this.itemSelectChange(selectRoot.modelKey, val, data)}
              />
            </span>
            <span>{this.t('sys.pageDesigner.dataLinkage.descAfter', { label: this.label })}</span>
          </div>
        )}
        <div
          class={[
            this.ns.b('model-links'),
            this.ns.is('hidden-header', this.hideHeader),
            this.ns.is('hidden', list.length === 0 && !this.hideHeader),
          ]}
        >
          <div class={this.ns.be('model-links', 'title')}>{this.t(this.contentTitle)}</div>
          <div class={this.ns.be('model-links', 'content')}>
            <div
              ref="containerRef"
              class={this.ns.be('model-links', 'container')}
              style={{ height: Math.floor(list.length / 3 + 1) * 110 + 'px' }}
            >
              {list.map((item, i) => {
                return this.renderLinkageItem(item, i);
              })}
              {this.isHiddenInfo ? null : (
                <div
                  style={this.calcItemPos(list.length)}
                  class={[this.ns.b('linkage-item'), this.ns.b('linkage-item-info')]}
                ></div>
              )}
            </div>
          </div>
        </div>
        {this.hideFooter ? null : (
          <div class={this.ns.b('model-footer-info')}>
            <span>{this.t(this.endBeforeInfo)}</span>
            <span class="footer-select-box">
              <a-tree-select
                value={this.endSelect.value}
                placeholder={this.t(this.endPlaceholder)}
                class={this.ns.be('model-footer-info', 'select')}
                treeData={this.endOptions}
                allowClear
                show-search
                treeDefaultExpandAll
                treeNodeLabelProp="_title"
                tree-node-filter-prop="_title"
                loading={this.footerLoading}
                onChange={(val) => this.clearTreeSelect(val)}
                onSelect={(...args) => this.endChange(...args)}
                onDropdownVisibleChange={this.onDropLoad}
                dropdownClassName="linkage-select-drop-down"
              />
            </span>
            {this.showEndInfo ? <span>{this.t(this.endAfterInfo)}</span> : null}
          </div>
        )}
      </view-container>
    );
  },
});
