import type { AppProcess } from '@mobile/apis/gct-platform/model';

export interface IMockProcess {
  appTag: string;
  processKey: string;
}

export const mockProcessList2AppProcessList = (list: IMockProcess[]) => {
  const appProcessList: AppProcess[] = [];

  list.forEach(({ appTag, processKey }) => {
    const app = appProcessList.find((a) => a.appTag === appTag);
    if (app) {
      if (!app.processList) {
        app.processList = [];
      }
      app.processList?.push({ processKey });
    } else {
      appProcessList.push({ appTag, processList: [{ processKey }] });
    }
  });

  return appProcessList;
};

export const appProcessList2MockProcessList = (list: AppProcess[]) => {
  const mockProcessList: IMockProcess[] = [];

  list.forEach((app) => {
    app.processList?.forEach((p) => {
      mockProcessList.push({
        appTag: app.appTag!,
        processKey: p.processKey!,
      });
    });
  });

  return mockProcessList;
};
