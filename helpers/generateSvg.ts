const FONT_SIZE = 13;
const MAX_ITEM_CHARS = 40;
const DEFAULT_CHAR_WIDTH = 8;
const PADDING_X = DEFAULT_CHAR_WIDTH * 2;
const ITEMS_GAP = 5;
const TOTAL_SVG_WIDTH = 500;
const SVG_ITEM_HEIGHT = FONT_SIZE * 2.5;

const capitalizeFirst = (text: string) => text[0].toUpperCase() + text.slice(1);

const truncate = (maxLength: number) => (str: string) =>
  str.length > maxLength ? `${str.slice(0, maxLength - 1)}…` : str;

const calcSize = (text: string) => {
  const width = text.length * DEFAULT_CHAR_WIDTH + PADDING_X * 2;
  return [width, SVG_ITEM_HEIGHT];
};

const calcPositions = (sizes: number[][]) => {
  let remainingRowSpace = TOTAL_SVG_WIDTH;
  let column = 0;

  return sizes.map(([width, height]) => {
    if (remainingRowSpace >= width) {
      const result = [TOTAL_SVG_WIDTH - remainingRowSpace, (height + ITEMS_GAP) * column];

      remainingRowSpace -= width + ITEMS_GAP;

      return result;
    }
    column += 1;

    const result = [0, (height + ITEMS_GAP) * column];

    remainingRowSpace = TOTAL_SVG_WIDTH - (width + ITEMS_GAP);

    return result;
  });
};

const generateTextBubbleSvg = ({
  text,
  width,
  height,
  posX,
  posY,
}: {
  text: string;
  width: number;
  height: number;
  posX: number;
  posY: number;
}) =>
  `<svg 
    xmlns="http://www.w3.org/2000/svg" 
    xmlns:xlink="http://www.w3.org/1999/xlink" 
    version="1.1" 
    width="${width}" 
    height="${height}" 
    x="${posX}" 
    y="${posY}"
  >
    <g>
      <rect width="100%" height="100%" rx="20" ry="20" fill="black" />
      <text
        x="50%"
        y="50%"
        fill="white"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="monospace"
        font-size="${FONT_SIZE}"
        font-style="italic"
      >
        ${capitalizeFirst(text)}
      </text>
    </g>
  </svg>
`;

const generateSvg = (items: string[]) => {
  const reshapedItems = items.map(truncate(MAX_ITEM_CHARS));
  const sizes = reshapedItems.map(calcSize);
  const positions = calcPositions(sizes);
  const [, lastItemYPosition] = positions[positions.length - 1];
  const totalOccupiedHeight = lastItemYPosition + SVG_ITEM_HEIGHT;

  const innerItems = reshapedItems
    .map((text, idx) => {
      const [width, height] = sizes[idx];
      const [posX, posY] = positions[idx];

      return generateTextBubbleSvg({ text, width, height, posX, posY });
    })
    .join('');

  return `
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      xmlns:xlink="http://www.w3.org/1999/xlink" 
      version="1.1" 
      viewBox="0 0 ${TOTAL_SVG_WIDTH} ${totalOccupiedHeight}"
    >
      ${innerItems}
    </svg>`;
};

export default generateSvg;
