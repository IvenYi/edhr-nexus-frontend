import { App, defineAsyncComponent } from 'vue';
import { KitType } from '../../enums';

export default {
  install(_app: App) {
    const modules = import.meta.glob(`./**/*-render.{vue,tsx}`);

    Object.entries(modules).forEach(([path, value]) => {
      const fileNameWithExtension = path.split('/').pop()!;
      const fileNameWithoutExtension = fileNameWithExtension
        .split('-render')
        .slice(0, -1)
        .join('.');
      fileNameWithoutExtension &&
        gct.register.render.web.register(
          KitType[fileNameWithoutExtension.replaceAll('-', '_').toUpperCase()],
          defineAsyncComponent(value),
        );
    });
  },
};
