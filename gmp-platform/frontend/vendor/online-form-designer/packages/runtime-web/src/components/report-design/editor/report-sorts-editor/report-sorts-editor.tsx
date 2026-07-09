import { defineComponent, nextTick, ref, watch } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IGctDndData, IGctDndRenderItemOptions, sortTypeEnum, useGctFormValue } from '@gct/runtime';
import { createUUID } from 'qx-util';
import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
import GctDndContainer from '../../../gct-dnd-container/gct-dnd-container';
import { useReportViewController } from '../../hooks';
import './report-sorts-editor.scss';

/**
 * 排序值编辑器
 */
export const ReportSortsEditor = defineComponent({
  name: 'ReportSortsEditor',
  props: {
    value: {
      type: Array<IGctDndData>,
      required: true,
    },
  },
  setup() {
    const t = (window as any).$t;
    const ns = useNamespace('report-sorts-editor');
    const reportView = useReportViewController();
    const val = useGctFormValue<IGctDndData[]>();
    // 属性 可选项
    const options = ref<IGctDndData[]>([]);
    // 排序方式 可选项
    const sortModeOpts = [
      {
        label: '升序 A-Z',
        value: 'asc',
      },
      {
        label: '降序 Z-A',
        value: 'desc',
      },
    ];
    const rootRef = ref();

    async function loadModelFields(): Promise<void> {
      if (reportView.state.schema?.modelKey) {
        const res = await getModelMetaDetail({ modelKey: reportView.state.schema.modelKey! });
        if (res) {
          options.value = ((res.fieldMetaList ?? []) as IGctDndData[]).map((item) => {
            return {
              ...item,
              label: item.name,
              value: item.key,
            };
          });
        } else {
          options.value = [];
        }
      } else {
        options.value = [];
      }
    }

    watch(
      () => reportView.state.schema.modelKey,
      async () => {
        await loadModelFields();
      },
      {
        immediate: true,
      },
    );

    function onSelect(): void {
      nextTick(() => {
        val.value = val.value;
      });
    }

    function renderSortItem(args: IGctDndRenderItemOptions<IGctDndData>) {
      const { index, data, drag } = args;
      return (
        <div key={data.id} class={ns.b('item')}>
          <div ref={drag} class={ns.be('item', 'handle')}>
            <i class="iconfont icon-drag" />
          </div>
          <div class={ns.be('item', 'field')}>
            <a-select
              size="small"
              v-model:value={data.sortField}
              placeholder={t('sys.chooseText')}
              options={options.value}
              onSelect={onSelect}
              getPopupContainer={() => rootRef.value}
            />
          </div>
          <div class={ns.be('item', 'sort')}>
            <a-select
              size="small"
              v-model:value={data.sortType}
              placeholder={t('sys.chooseText')}
              options={sortModeOpts}
              onSelect={onSelect}
              getPopupContainer={() => rootRef.value}
            />
          </div>
          <div class={ns.be('item', 'delete')}>
            {val.value.length > 1 ? (
              <a-tooltip>
                {{
                  title: () => {
                    return `删除`;
                  },
                  default: () => {
                    return <i onClick={() => onDelete(index)} class="iconfont icon-shanchu1" />;
                  },
                }}
              </a-tooltip>
            ) : null}
          </div>
        </div>
      );
    }

    function onAdd(): void {
      val.value.push({
        id: createUUID(),
        sortField: null,
        sortType: sortTypeEnum.DESC,
      });
      val.value = val.value;
    }

    function onDelete(i: number) {
      val.value.splice(i, 1);
      val.value = val.value;
    }

    return { ns, rootRef, val, options, renderSortItem, onAdd, onDelete };
  },
  render() {
    return (
      <div ref="rootRef" class={this.ns.b()}>
        <div class={this.ns.e('header')}>
          <span class={this.ns.e('title')}>排序字段</span>
          <span class={this.ns.e('add')}>
            <a-button type="link" size="small" onClick={this.onAdd}>
              添加
            </a-button>
          </span>
        </div>
        <div class={this.ns.e('body')}>
          <GctDndContainer items={this.val}>
            {{
              default: (args: IGctDndRenderItemOptions<IGctDndData>) => {
                return this.renderSortItem(args);
              },
            }}
          </GctDndContainer>
        </div>
      </div>
    );
  },
});
