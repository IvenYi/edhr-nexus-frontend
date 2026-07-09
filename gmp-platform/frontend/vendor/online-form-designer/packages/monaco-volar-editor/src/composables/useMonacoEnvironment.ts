import VueWorker from 'monaco-volar/vue.worker?worker';
import * as onigasm from 'onigasm';
import onigasmWasm from 'onigasm/lib/onigasm.wasm?url';
import type { WorkerLanguageService } from '@volar/monaco/worker';
import { activateAutoInsertion, activateMarkers, registerProviders } from '@volar/monaco';

const cached: any = {
  initialized: false,
  onigasm: null,
  disposeVue: null,
};

export function loadOnigasm(): Promise<void> {
  if (cached.onigasm) return cached.onigasm;
  cached.onigasm = onigasm.loadWASM(onigasmWasm);
  return cached.onigasm;
}

// setup monaco environment
export async function setupMonacoEnv(): Promise<void> {
  await loadOnigasm();
  const monaco = await window.monacoLoader.loadMonaco();

  monaco.languages.register({ id: 'vue', extensions: ['.vue'] });
  monaco.languages.onLanguage('vue', () => setup());

  async function setup(): Promise<void> {
    if (cached.initialized) {
      return;
    }
    cached.initialized = true;

    const worker = monaco.editor.createWebWorker<WorkerLanguageService>({
      worker: new VueWorker(),
    });
    const languageId = ['vue'];
    const getSyncUris = (): any[] => monaco.editor.getModels().map((model) => model.uri);
    const { dispose: disposeMarkers } = activateMarkers(
      worker,
      languageId,
      'vue',
      getSyncUris,
      monaco.editor,
    );
    const { dispose: disposeAutoInsertion } = activateAutoInsertion(
      worker,
      languageId,
      getSyncUris,
      monaco.editor,
    );
    const { dispose: disposeProvides } = await registerProviders(
      worker,
      languageId,
      getSyncUris,
      monaco.languages,
    );
    cached.disposeVue = () => {
      disposeMarkers();
      disposeAutoInsertion();
      disposeProvides();
    };
  }
}

export function disposeVue() {
  cached.disposeVue();
}
