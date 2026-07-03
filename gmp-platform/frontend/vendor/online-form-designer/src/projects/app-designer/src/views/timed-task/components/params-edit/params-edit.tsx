import { computed, defineComponent, ref, watch } from 'vue';
import { useNamespace } from '@gct/runtime';
import { MonacoEditor } from '@gct/runtime-web';
import './params-edit.scss';

interface JSONNode {
  order: number;
  level: number;
  key: string;
  value: string;
  type: string;
  typeName: string;
}

export const ParamsEdit = defineComponent({
  name: 'ParamsEdit',
  props: {
    value: {
      type: String,
    },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const ns = useNamespace('time-task-params-edit');

    const t = window.$t;

    const isPreview = ref<boolean>(false);

    const showJson = ref<JSONNode[]>([]);

    const columns = [
      {
        title: t('sys.index'),
        dataIndex: 'order',
        key: 'order',
        width: 80,
      },
      {
        title: t('sys.appDesigner.printDesign.grid.paramName'),
        dataIndex: 'key',
        key: 'key',
        width: 200,
      },
      {
        title: t('sys.appDesigner.printDesign.grid.type'),
        dataIndex: 'typeName',
        key: 'typeName',
        width: 200,
      },
      {
        title: t('sys.appDesigner.printDesign.grid.preview'),
        dataIndex: 'value',
        key: 'value',
        width: 200,
      },
    ];

    watch(
      () => props.value,
      () => {
        formatJson();
      },
    );

    const val = computed({
      get() {
        return props.value ?? '';
      },
      set(val) {
        emit('update:value', val);
      },
    });

    function createJsonNode(key: string, val: string, count: number, level: number): JSONNode {
      let type: string = '';
      let typeName: string = '';
      switch (typeof val) {
        case 'object':
          if (Array.isArray(val)) {
            type = 'array';
            typeName = t('sys.arrayVal');
          } else {
            type = 'object';
            typeName = t('sys.objectVal');
          }
          break;
        case 'number':
          type = 'number';
          typeName = t('sys.numberVal');
          break;
        case 'boolean':
          type = 'boolean';
          typeName = t('sys.booleanVal');
          break;
        default:
          type = 'string';
          typeName = t('sys.stringVal');
      }
      const item: JSONNode = {
        level,
        order: count,
        key: key,
        value: typeof val === 'object' ? '' : val.toString(),
        type,
        typeName,
      };
      return item;
    }

    function formatItem(json: any, count: number = 0, level: number = 0): void {
      if (!json) {
        return;
      }
      if (Array.isArray(json)) {
        json.forEach((item: any, i) => {
          count += 1;
          showJson.value.push(createJsonNode(i.toString(), item, count, level + 1));
          if (typeof item === 'object') {
            formatItem(item, count, level + 1);
          }
        });
      } else if (typeof json === 'object') {
        const keys = Object.keys(json);
        keys.forEach((key) => {
          const val = json[key];
          count += 1;
          showJson.value.push(createJsonNode(key, val, count, level + 1));
          if (typeof val === 'object') {
            formatItem(val, count, level + 1);
          }
        });
      }
    }

    function formatJson(): void {
      if (!val.value) {
        return;
      }
      try {
        showJson.value = [];
        const json = JSON.parse(val.value);
        formatItem(json);
      } catch (error) {
        console.error(error);
      }
    }

    function onEdit(e: MouseEvent): void {
      e.stopPropagation();
      isPreview.value = !isPreview.value;
      formatJson();
    }

    formatJson();

    return { ns, columns, isPreview, val, showJson, onEdit };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.b('header')}>
          <span class={this.ns.e('title')}>
            {this.isPreview ? window.$t('sys.appDesigner.printDesign.paramList') : 'JSON'}
          </span>
          <span class={this.ns.e('action')} onClick={this.onEdit}>
            {!this.isPreview ? (
              <i class={`iconfont icon-liebiaozhanshi`} />
            ) : (
              <i class={`iconfont icon-sheji-2`} />
            )}
          </span>
        </div>
        <div class={this.ns.b('content')}>
          <MonacoEditor
            v-show={!this.isPreview}
            v-model:value={this.val}
            options={{ minimap: { enabled: false } }}
          />
          {this.isPreview ? (
            <a-table
              class={[this.ns.b('table')]}
              defaultExpandAllRows
              pagination={false}
              scroll={{ y: 300 }}
              dataSource={this.showJson}
              columns={this.columns}
            >
              {{
                bodyCell: ({ column, text, record }) => {
                  return (
                    <span
                      class={[
                        this.ns.be('table', 'value'),
                        this.ns.bem('table', 'value', column.key),
                        column.key === 'key' ? this.ns.bem('table', 'value', record.level) : '',
                      ]}
                      title={text}
                    >
                      {text}
                    </span>
                  );
                },
              }}
            </a-table>
          ) : null}
        </div>
      </div>
    );
  },
});
