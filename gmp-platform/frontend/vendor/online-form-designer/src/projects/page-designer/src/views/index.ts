import { App } from 'vue';
import { DataLinkageConfig } from './data-linkage-config/data-linkage-config';
import { DataLinkageConfig2 } from './data-linkage-config2/data-linkage-config2';

export default {
  install(app: App) {
    app.component(DataLinkageConfig.name!, DataLinkageConfig);
    app.component(DataLinkageConfig2.name!, DataLinkageConfig2);
  },
};
