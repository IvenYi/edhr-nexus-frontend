<template>
  <VirtualScroll
    class="virtual-json-viewer"
    :items="lines"
    :options="{ direction: 'vertical', itemSize: lineHeight, containerMaxSize: maxHeight - 42 }"
  >
    <template #item="{ data, index }">
      <div :key="index + index" class="json-line" :style="{ height: lineHeight + 'px' }">
        <span class="line-number">{{ index }}</span>
        <span v-html="highlightLine(data)"></span>
      </div>
    </template>
  </VirtualScroll>
</template>

<script lang="ts" setup name="virtual-json-viewer">
  import { watch, ref, onMounted } from 'vue';
  import VirtualScroll from './virtual-scroll.vue';

  const props = withDefaults(
    defineProps<{
      json: any | string;
      lineHeight?: number;
      maxHeight?: number;
    }>(),
    {
      lineHeight: 22,
      maxHeight: 800,
    },
  );

  const lines = ref<string[]>([]);

  const isXML = (data) => {
    if (typeof data !== 'string') return false;
    const trimmed = data.trim();
    // 快速判断：以 < 开头且以 > 结尾
    if (!trimmed.startsWith('<') || !trimmed.endsWith('>')) return false;
    // 可选：使用 DOMParser 进一步验证
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, 'application/xml');
      return doc.getElementsByTagName('parsererror').length === 0;
    } catch {
      return false;
    }
  };
  function formatXML(xml) {
    if (!xml) return '';

    let formatted = '';
    let indentLevel = 0;
    const indentUnit = '  '; // 缩进用2个空格

    // 按节点拆分
    const nodes = xml.split(/(<[^>]+>)/g).filter((item) => item.trim() !== '');

    for (const node of nodes) {
      // 闭合标签 </xxx> 缩进减少
      if (node.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // 添加缩进 + 节点
      formatted += indentUnit.repeat(indentLevel) + node + '\n';

      // 开放标签 <xxx> 缩进增加
      if (node.startsWith('<') && !node.startsWith('</') && !node.endsWith('/>')) {
        indentLevel++;
      }
    }

    // 转义HTML字符，防止v-html异常
    return formatted.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  const highlightLine = (line) => {
    // console.log('line start', line);
    if (isXML(line)) {
      return formatXML(line);
    }
    const tokenRegex =
      /("(?:\\.|[^"\\])*")(?=\s*:)|("(?:\\"|[^"\\])*")|(\b-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\btrue\b|\bfalse\b)|(\bnull\b)/g;
    return line.replace(tokenRegex, (match, key, str, num, bool, nul) => {
      // console.log('match:', key, str, num, bool, nul);
      if (key) return `<span class="json-key">${key}</span>`;
      if (str) return `<span class="json-string">${str}</span>`;
      if (num) return `<span class="json-number">${num}</span>`;
      if (bool) return `<span class="json-boolean">${bool}</span>`;
      if (nul) return `<span class="json-null">${nul}</span>`;
      return match;
    });
  };

  const parseJson = () => {
    let result = props.json;
    if (isXML(result)) {
      lines.value = formatXML(result).split('\n');
    } else {
      try {
        if (typeof result === 'string') {
          result = JSON.parse(result);
          result = JSON.stringify(result, null, 2);
        } else {
          result = JSON.stringify(result, null, 2);
        }
      } catch (err) {
        console.log('解析错误', err);
      }
      try {
        lines.value = result.split('\n');
        console.log('lines', lines.value, lines.value.length * props.lineHeight);
      } catch (e) {
        lines.value = ['解析错误'];
      }
    }
  };

  watch(
    () => props.json,
    () => {
      parseJson();
    },
  );

  onMounted(() => {
    parseJson();
  });
</script>

<style lang="less" scoped>
  .virtual-json-viewer {
    // 样式变量
    --virtual-json-viewer__default-color: #2f3337;
    --virtual-json-viewer__key-color: #015692;
    --virtual-json-viewer__string-color: #54790d;
    --virtual-json-viewer__number-color: #b75501;
    --virtual-json-viewer__boolean-color: #803378;
    --virtual-json-viewer__null-color: #c02d2e;
    --virtual-json-viewer__bg-color: #f6f6f6;
    --virtual-json-viewer__line-number-color: #535a60;

    overflow-y: auto;
    font-family: monospace;
    background: var(--virtual-json-viewer__bg-color);
    color: var(--virtual-json-viewer__default-color);
    line-height: v-bind("props.lineHeight + 'px'");

    *::-webkit-scrollbar-track {
      background: #272822;
    }
    // *::-webkit-scrollbar-thumb {
    //   background: #272822;
    // }
    .json-line {
      white-space: pre;
      display: flex;
    }

    .line-number {
      width: 50px;
      color: var(--virtual-json-viewer__line-number-color);
      text-align: right;
      padding-right: 10px;
      user-select: none;
      flex-shrink: 0;
    }

    :deep(.json-key) {
      color: var(--virtual-json-viewer__key-color);
    }
    :deep(.json-string) {
      color: var(--virtual-json-viewer__string-color);
    }
    :deep(.json-number) {
      color: var(--virtual-json-viewer__number-color);
    }
    :deep(.json-boolean) {
      color: var(--virtual-json-viewer__boolean-color);
    }
    :deep(.json-null) {
      color: var(--virtual-json-viewer__null-color);
    }
  }
</style>
