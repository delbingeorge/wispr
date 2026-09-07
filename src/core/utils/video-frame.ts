type VideoDisplayRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function getVideoDisplayRect(
  containerWidth: number,
  containerHeight: number,
  projectWidth: number,
  projectHeight: number,
): VideoDisplayRect {
  if (
    containerWidth <= 0 ||
    containerHeight <= 0 ||
    projectWidth <= 0 ||
    projectHeight <= 0
  ) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const containerAspect = containerWidth / containerHeight;
  const projectAspect = projectWidth / projectHeight;

  if (containerAspect > projectAspect) {
    const height = containerHeight;
    const width = height * projectAspect;
    return { x: (containerWidth - width) / 2, y: 0, width, height };
  }

  const width = containerWidth;
  const height = width / projectAspect;
  return { x: 0, y: (containerHeight - height) / 2, width, height };
}
