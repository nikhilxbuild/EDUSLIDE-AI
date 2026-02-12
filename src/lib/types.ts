export type Page = {
  id: number;
  sourceUrl: string;
  sourceHint: string;
  selected: boolean;
};

export type CustomizationOptions = {
  rows: number;
  cols: number;
  orientation: 'portrait' | 'landscape';
  margin: 'default' | 'minimal' | 'none';
  colorMode: 'normal' | 'grayscale' | 'bw' | 'invert';
  removeBlankPages: boolean;
  cropBorders: boolean;
};
