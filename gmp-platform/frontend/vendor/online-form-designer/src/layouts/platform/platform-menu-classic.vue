<script lang="tsx">
  import { computed, defineComponent, unref, toRef } from 'vue';
  import { MenuClassic, MenuDefault } from '/@/components/Menu';
  // import { AppLogo } from '/@/components/Application';

  // import { MenuModeEnum, MenuSplitTyeEnum } from '/@/enums/menuEnum';

  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  import { ScrollContainer } from '/@/components/Container';

  import { useGo } from '/@/hooks/web/usePage';
  import { useSplitMenu, useLayoutMenu, layoutMenus } from '/@/layouts/default/menu/useLayoutMenu';
  import { openWindow } from '/@/utils';
  import { propTypes } from '/@/utils/propTypes';
  import { isUrl } from '/@/utils/is';
  import { menuClickHandler } from './utils';

  export default defineComponent({
    name: 'LayoutMenu',
    props: {
      theme: propTypes.oneOf(['light', 'dark']),
    },
    setup(props) {
      const go = useGo();

      const {
        getMenuMode,
        getMenuType,
        getMenuTheme,
        getCollapsed,
        getCollapsedShowTitle,
        getAccordion,
        getIsHorizontal,
        getIsSidebarType,
        getSplit,
      } = useMenuSetting();

      // const { menusRef } = useSplitMenu(toRef(props, 'splitType'));
      useLayoutMenu();

      const getComputedMenuTheme = computed(() => props.theme || unref(getMenuTheme));

      const getCommonProps = computed(() => {
        const menus = unref(layoutMenus);
        return {
          menus,
          beforeClickFn: beforeMenuClickFn,
          items: menus,
          theme: unref(getComputedMenuTheme),
          accordion: unref(getAccordion),
          collapse: unref(getCollapsed),
          collapsedShowTitle: unref(getCollapsedShowTitle),
          onMenuClick: handleMenuClick,
        };
      });
      /**
       * click menu
       * @param menu
       */

      function handleMenuClick(menu) {
        menuClickHandler(menu, go);
      }

      /**
       * before click menu
       * @param menu
       */
      async function beforeMenuClickFn(path: string) {
        if (!isUrl(path)) {
          return true;
        }
        openWindow(path);
        return false;
      }

      function renderMenu() {
        const { menus, ...menuProps } = unref(getCommonProps);
        // console.log(menus);
        if (!menus || !menus.length) return null;
        return <MenuClassic {...(menuProps as any)} type={unref(getMenuType)} items={menus} />;
        // return <BasicMenu {...(menuProps as any)} type={unref(getMenuType)} items={menus} />;
      }

      return () => {
        return (
          <>
            <ScrollContainer>{() => renderMenu()}</ScrollContainer>
          </>
        );
      };
    },
  });
</script>
<style lang="less"></style>
