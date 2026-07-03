/** 鼠标拖动的偏移量，横向默认左移为正数，纵向的时候下移为正数 */
export function useMouseOffset(opts: {
  onStart: () => void;
  onChange: (opts: { offsetX: number; offsetY: number }) => void;
}) {
  const handleMouseDown = (e) => {
    const startX = e.clientX;
    const startY = e.clientY;
    opts.onStart();

    function handleMouseMove(e2) {
      const currentStartX = e2.clientX;
      const currentStartY = e2.clientY;
      const offsetX = currentStartX - startX;
      const offsetY = currentStartY - startY;
      // console.log('offsetX', offsetX);
      // console.log('offsetY', offsetY);
      opts.onChange({ offsetX, offsetY });
    }

    function handleMouseUp() {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return {
    handleMouseDown,
  };
}
