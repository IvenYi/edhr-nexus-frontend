import { reactive } from 'vue';
import { ConfigProvider } from 'ant-design-vue';

interface IThemeVars {
  primaryColor?: string;
}

const themeVars: IThemeVars = reactive({});

export function useTheme() {
  function setPrimaryColor(color: string) {
    themeVars.primaryColor = color;
    ConfigProvider.config({
      theme: {
        primaryColor: color,
      },
    });
  }

  function setTheme(theme: IThemeVars) {
    Object.assign(themeVars, theme);
    ConfigProvider.config({
      theme: {
        ...themeVars,
      },
    });
  }

  return {
    themeVars,
    setTheme,
    setPrimaryColor,
  };
}
