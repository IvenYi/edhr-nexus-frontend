<template>
  <div class="document-quick-fill-container">
    <div class="quick-fill-tips">
      <i class="iconfont icon-zhuyi"></i>
      <ul class="tips-list">
        <li>可将Excel内容粘贴到表格中，支持使用复制、粘贴、删除快捷键</li>
        <li
          >表单中支持快速填报的字段类型：文本、长文本、整数、长整数、小数、精度小数、日期、时间、日期时间、LOT/SN、报废物料批次、枚举单选、枚举多选（选项间以“,”分割）</li
        >
      </ul>
    </div>
    <RevoGrid
      class="cell-border"
      range
      resize
      :colSize="200"
      :source="rows"
      :columns="columns"
      theme="material"
      hide-attribution
      :apply-on-close="true"
      :row-headers="{ prop: 'rowIndex', name: '序号', size: 60 }"
    />
  </div>
</template>

<script setup lang="ts" name="document-quick-fill-modal">
  import { onBeforeMount, ref, unref } from 'vue';
  import { IModal, useModal, FIELD_TYPE } from '@gct/runtime';
  import RevoGrid from '@revolist/vue3-datagrid';

  const props = withDefaults(
    defineProps<{
      columns: any[];
      modal: IModal;
      callback?: any;
    }>(),
    {},
  );

  const rows = ref<any[]>([]);

  function makeEmptyRow() {
    return Object.fromEntries(props.columns.map((c) => [c.prop, '']));
  }

  function initRows(count = 10) {
    rows.value = Array.from({ length: count }, () => makeEmptyRow());
  }

  onBeforeMount(() => {
    initRows(50);
  });

  function processRows(rows = []) {
    const isBlank = (v) =>
      v === null ||
      v === undefined ||
      (typeof v === 'string' && v.trim() === '') ||
      (Array.isArray(v) && v.length === 0);

    const roundToScale = (num, scale) => {
      if (scale == null) return num;
      const factor = Math.pow(10, scale);
      // 使用 Math.round 做四舍五入；如需向下截断改为 Math.floor/Math.trunc（注意负数的处理）
      return Math.round(num * factor) / factor;
    };

    const parseNumber = (v, { integer = false, scale = null } = {}) => {
      if (v === null || v === undefined) return null;
      if (typeof v === 'number') {
        if (!Number.isFinite(v)) return null;
        if (integer && !Number.isInteger(v)) return null;
        const n = scale != null ? roundToScale(v, scale) : v;
        return Number.isFinite(n) ? n : null;
      }

      let s = String(v).trim();
      if (s === '') return null;

      // 删除千位分隔符（逗号）
      s = s.replace(/,/g, '');

      // 括号表示负数，例如 "(123)" 或 "（123）"
      if (/^[\(\（].+[\)\）]$/.test(s)) {
        s = '-' + s.replace(/^[\(\（]|[\)\）]$/g, '');
      }

      // 如果是整数字段，可以先快速判断字符串是否包含小数点或指数形式
      // 直接转换为 Number，然后再校验是否整数
      const n = Number(s);
      if (!Number.isFinite(n)) return null;

      if (integer) {
        // 要求严格整数
        if (!Number.isInteger(n)) return null;
        return n;
      } else {
        // 小数字段：如果指定了 scale，则四舍五入到 scale 位
        return scale != null ? roundToScale(n, scale) : n;
      }
    };

    const parseToDate = (v) => {
      if (v === null || v === undefined || v === '') return null;
      if (typeof v === 'string') {
        let s = v.trim();
        if (s === '') return null;
        // 将常见的分隔符替换为日期格式，使其能够可靠地解析
        // 支持“yyyy-mm-dd”、“yyyy/mm/dd”、“yyyy-mm-dd hh:mm:ss”
        // 也支持“yyyy/mm/dd hh:mm”
        s = s.replace(/-/g, '/');
        // 如果仅提供时间（例如“12:34”或“12:34:56”），请附上今天的日期：
        if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(s)) {
          const today = new Date();
          const datePart = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
          s = `${datePart} ${s}`;
        }
        const d = new Date(s);
        return isNaN(d) ? null : d;
      }
      return null;
    };

    const buildOptionLookup = (opts: any[] = []) => {
      const map = new Map();
      for (const o of opts) {
        const val = o.value != null ? String(o.value) : undefined;
        const text = o.text != null ? String(o.text) : undefined;
        const label = o.label != null ? String(o.label) : undefined;
        if (val !== undefined) map.set(val, val);
        if (text !== undefined) map.set(text, val || text);
        if (label !== undefined) map.set(label, val || label);
      }
      return map;
    };

    const pad2 = (n) => String(n).padStart(2, '0');
    const formatDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    const formatTime = (d) =>
      `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
    const formatDateTime = (d) => `${formatDate(d)} ${formatTime(d)}`;

    const out = rows
      .map((row: any) => {
        const newRow = { ...row };
        for (const f of props.columns) {
          const val = row[f.prop];
          switch (f.fieldType) {
            case FIELD_TYPE.INTEGER:
            case FIELD_TYPE.LONG:
              {
                const n = parseNumber(val, { integer: true });
                newRow[f.prop] = isBlank(n) ? undefined : n;
              }
              break;
            case FIELD_TYPE.DOUBLE:
            case FIELD_TYPE.DECIMAL:
              {
                const n = parseNumber(val, { integer: false, scale: null });
                newRow[f.prop] = isBlank(n) ? undefined : n;
              }
              break;
            case FIELD_TYPE.DATE:
              {
                const d = parseToDate(val);
                newRow[f.prop] = d ? formatDate(d) : isBlank(val) ? undefined : val;
              }
              break;
            case FIELD_TYPE.TIME:
              {
                const d = parseToDate(val);
                newRow[f.prop] = d ? formatTime(d) : isBlank(val) ? undefined : val;
              }
              break;
            case FIELD_TYPE.DATE_TIME:
              {
                const d = parseToDate(val);
                newRow[f.prop] = d ? formatDateTime(d) : isBlank(val) ? undefined : val;
              }
              break;
            case FIELD_TYPE.OPTION_MULTI:
              {
                const lookup = buildOptionLookup(f.newOptions);
                if (typeof val === 'string') {
                  const tokens = val
                    .split(/[;,]/)
                    .map((s) => s.trim())
                    .filter((s) => s !== '');
                  const arr = tokens.map((t) => lookup.get(t)).filter((v) => v !== undefined);
                  newRow[f.prop] = arr.length ? arr.join(',') : undefined;
                } else {
                  newRow[f.prop] = isBlank(val) ? undefined : val;
                }
              }
              break;
            case FIELD_TYPE.OPTION:
              {
                const lookup = buildOptionLookup(f.newOptions);
                if (isBlank(val)) {
                  newRow[f.prop] = undefined;
                } else {
                  const tokens = val
                    .split(/[;,]/)
                    .map((s) => s.trim())
                    .filter((s) => s !== '');
                  const normalized = lookup.get(tokens?.[0]);
                  newRow[f.prop] = normalized !== undefined ? normalized : undefined;
                }
              }
              break;
            default:
              newRow[f.prop] = isBlank(val) ? undefined : val;
          }
        }
        return newRow;
      })

      .filter((row) => {
        return props.columns.some((f) => {
          const v = row[f.prop];
          if (v === 0 || v === false) return true;
          return !isBlank(v);
        });
      });

    return out;
  }

  async function onSave() {
    try {
      return {
        ok: true,
        params: {
          data: processRows(unref(rows.value)),
        },
      };
    } catch (err) {
      console.warn(err);
    }
    return {
      ok: false,
    };
  }

  useModal(onSave);
</script>

<style scoped lang="less">
  .document-quick-fill-container {
    position: relative;
    padding: 24px;
    height: calc(85vh - 120px);
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .quick-fill-tips {
      position: relative;
      margin-bottom: 12px;
      .iconfont {
        position: absolute;
        line-height: 1;
        font-size: 18px;
        color: var(--ant-primary-color);
        top: 3px;
      }

      .tips-list {
        margin: 0;
        padding-left: 40px;
        list-style-type: decimal;
      }

      .tips-list li {
        margin-bottom: 4px;
        font-size: 14px;
        line-height: 22px;
        color: #1a1d23;
      }
    }

    revo-grid {
      border: 1px solid #e2e3e3;
      height: 100%;
      min-height: 30px;
    }

    :deep(revo-grid.cell-border) {
      .rowHeaders {
        font-size: 14px;
      }
      .rgHeaderCell {
        box-shadow: -1px 0 0 0 var(--revo-grid-cell-border) inset;
      }

      revogr-data .rgRow .rgCell {
        box-shadow: 0 -1px 0 0 var(--revo-grid-cell-border) inset,
          -1px 0 0 0 var(--revo-grid-cell-border) inset;
      }
    }
  }
</style>
