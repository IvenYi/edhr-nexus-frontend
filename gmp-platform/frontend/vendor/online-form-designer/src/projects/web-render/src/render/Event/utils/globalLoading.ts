class GlobalLoading {
  constructor() {
    // 单例模式：确保只有一个 Loading 实例
    if (GlobalLoading.instance) return GlobalLoading.instance;
    GlobalLoading.instance = this;
    
    // 创建 Loading 容器和样式
    this.createLoadingElement();
    this.initStyle();
  }

  // 创建 DOM 元素
  createLoadingElement() {
    // 遮罩层（覆盖全页面）
    this.mask = document.createElement('div');
    this.mask.id = 'gct-global-loading-mask';
    
    // Loading 内容容器
    this.container = document.createElement('div');
    this.container.id = 'gct-global-loading-container';
    
    // 加载图标（CSS 动画实现，无需图片）
    this.spinner = document.createElement('div');
    this.spinner.id = 'gct-global-loading-spinner';
    
    // 组装 DOM
    this.container.appendChild(this.spinner);
    this.mask.appendChild(this.container);
    document.body.appendChild(this.mask);
  }

  // 初始化样式（内联样式，无需额外 CSS 文件）
  initStyle() {
    // 遮罩层样式：全屏、半透明、固定定位
    Object.assign(this.mask.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(255, 255, 255, 0.5)', // 半透明黑色遮罩
      zIndex: 9999, // 确保在最上层
      display: 'none', // 默认隐藏
      justifyContent: 'center',
      alignItems: 'center',
    });

    // Loading 内容容器：白色背景、圆角、内边距
    Object.assign(this.container.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '43px',
      height: '43px',
      backgroundColor: 'transparent',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
    });

    Object.assign(this.spinner.style, {
      display: 'grid',
      width: '43px',
      height: '43px',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gridTemplateRows: 'repeat(2, 1fr)',
      gap: '3px', /* 方块之间的间距 */
    })

    // 获取 Element Plus 全局 CSS 变量
    const rootStyle = getComputedStyle(document.documentElement);
    const elPrimary = rootStyle.getPropertyValue('--gct-color-primary').trim(); // 主色

    // 定义方块配置（复用 UI 组件色）
    const blockConfig = [
      { id: 'gct-global-loading-item_1', delay: '0s' }, // 第一个方块用主色
      { id: 'gct-global-loading-item_2', delay: '0.25s' },
      { id: 'gct-global-loading-item_3', delay: '0.75s' },
      { id: 'gct-global-loading-item_4', delay: '0.5s' },
    ];

    // 生成方块
    blockConfig.forEach((config, index) => {
      const block = document.createElement('div');
      block.id = config.id;
      Object.assign(block.style, {
        backgroundColor: elPrimary,
        opacity: 0.2,
        animation: 'globalLoading 1s infinite',
        animationDelay: config.delay,
      });
      this.spinner.appendChild(block);
    });

    // 动态创建动画
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      @keyframes globalLoading {
        0% {
          opacity: 1;
        }
        100% {
          opacity: 0.2;
        }
      }`;
    document.head.appendChild(styleTag);
  }

  // 显示 Loading（支持自定义文案）
  show() {
    this.mask.style.display = 'flex';
    // 禁止页面滚动（可选，阻塞式加载时启用）
    document.body.style.overflow = 'hidden';
  }

  // 隐藏 Loading
  hide() {
    this.mask.style.display = 'none';
    // 恢复页面滚动
    document.body.style.overflow = '';
  }  
}

// 生成单例实例，全局复用
export const globalLoading = new GlobalLoading();