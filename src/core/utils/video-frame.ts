type PreviewFrameRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const FRAME_SIDE_GUTTER = 13;
const FRAME_VERTICAL_INSET = 14;

export function getPreviewFrameRect(
  containerWidth: number,
  containerHeight: number,
  projectWidth: number,
  projectHeight: number,
): PreviewFrameRect {
  const availableWidth = containerWidth - FRAME_SIDE_GUTTER * 2;
  const availableHeight = containerHeight - FRAME_VERTICAL_INSET * 2;

  if (
    availableWidth <= 0 ||
    availableHeight <= 0 ||
    projectWidth <= 0 ||
    projectHeight <= 0
  ) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const projectAspect = projectWidth / projectHeight;
  const width = Math.min(availableWidth, availableHeight * projectAspect);
  const height = width / projectAspect;

  return {
    x: (containerWidth - width) / 2,
    y: FRAME_VERTICAL_INSET,
    width,
    height,
  };
}
