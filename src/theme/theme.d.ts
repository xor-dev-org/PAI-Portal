import { PaletteOptions, Palette } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    brand: Palette['primary'];
    accent: Palette['primary'];
    contrastTextColor: Palette['primary'];
  }

  interface PaletteOptions {
    brand?: PaletteOptions['primary'];
    accent?: PaletteOptions['primary'];
    contrastTextColor?: PaletteOptions['primary'];
  }
}