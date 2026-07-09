export function mergeMarkedTd() {
  // 1️⃣ 找出所有被标记的 td
  const markedTds = document.querySelectorAll('td[data-merge="true"]');
  if (!markedTds.length) return;

  // 2️⃣ 按 table 分组，避免跨表合并
  const tableSet = new Set<HTMLTableElement>();
  markedTds.forEach((td) => {
    const table = td.closest('table');
    if (table) tableSet.add(table as HTMLTableElement);
  });

  // 3️⃣ 每张 table 单独处理
  tableSet.forEach((table: HTMLTableElement) => {
    const rows = Array.from(
      table.querySelectorAll('tr:has(>td[data-merge="true"])'),
    ) as HTMLTableRowElement[];
    if (rows.length <= 1) return;

    // 4️⃣ 找出这一张表里「允许合并的列 index
    const mergeColIndexSet = new Set<number>();
    rows.forEach((tr: HTMLTableRowElement) => {
      Array.from(tr.children).forEach((element: Element, index: number) => {
        const td = element as HTMLTableCellElement;
        if (td.tagName === 'TD' && td.hasAttribute('data-merge')) {
          mergeColIndexSet.add(index);
        }
      });
    });

    // 5️⃣ 对每一个需要合并的列，做纵向扫描
    mergeColIndexSet.forEach((colIndex: number) => {
      let lastTd: HTMLTableCellElement | null = null;
      let lastText = '';
      let rowspan = 1;

      rows.forEach((tr: HTMLTableRowElement) => {
        const td = tr.children[colIndex] as HTMLTableCellElement;
        if (!td || !td.hasAttribute('data-merge')) {
          // 遇到未标记 td，中断合并链
          lastTd = null;
          lastText = '';
          rowspan = 1;
          return;
        }

        const text = td.innerText.trim();

        if (!lastTd) {
          lastTd = td;
          lastText = text;
          rowspan = 1;
          return;
        }

        // 6️⃣ 文本一致 → 合并
        if (text && text === lastText) {
          rowspan++;
          lastTd!.setAttribute('rowspan', String(rowspan));
          td.style.display = 'none';
        } else {
          // 文本不一致，重新开始
          lastTd = td;
          lastText = text;
          rowspan = 1;
        }
      });
    });
  });
}

export function waitDomStable(el: HTMLElement, idle = 100, timeout = 2000): Promise<void> {
  return new Promise((resolve) => {
    let timer: number;
    let requestTimer: number | null = null;
    let isDoneExecuted = false;

    // 定义定时请求函数，后端打印的时候，会根据页面是否有请求来判断是否可以打印了
    const sendRequest = () => {
      if (isDoneExecuted) {
        // 如果 done 已经执行完毕，清除定时器
        if (requestTimer) {
          clearInterval(requestTimer);
          requestTimer = null;
        }
        return;
      }

      // 这里放置您要执行的请求逻辑
      console.log('发起定时请求...');
      fetch('/gct-apaas/api/mergeCell/mockrequest');
    };

    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = window.setTimeout(done, idle);
    });

    const done = () => {
      // 标记 done 开始执行
      isDoneExecuted = true;

      // 清除定时请求
      if (requestTimer) {
        clearInterval(requestTimer);
        requestTimer = null;
      }

      observer.disconnect();
      resolve();
    };

    observer.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    timer = window.setTimeout(done, timeout);

    // 启动定时请求，每 500ms 执行一次
    requestTimer = window.setInterval(sendRequest, 500);

    // 立即执行第一次请求
    sendRequest();
  });
}
