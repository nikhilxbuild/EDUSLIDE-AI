export type Page = {
  id: number;
  sourceUrl: string;
  sourceHint: string;
  selected: boolean;
};

export type ColorModeOptions = {
  invert: boolean;
  grayscale: boolean;
  bw: boolean;
};

export type CustomizationOptions = {
  rows: number;
  cols: number;
  orientation: 'portrait' | 'landscape';
  margin: 'default' | 'minimal' | 'none';
  colorMode: ColorModeOptions;
  removeBlankPages: boolean;
  cropBorders: boolean;
};
