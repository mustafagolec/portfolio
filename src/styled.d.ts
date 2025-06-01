import 'styled-components';

type ColorTheme = 'green' | 'amber' | 'blue' | 'white' | 'red';

interface ThemeColors {
  primary: string;
  glow: string;
  hover: string;
  border: string;
  text: string;
  background: string;
}

declare module 'styled-components' {
  export interface DefaultTheme {
    theme: ColorTheme;
  }
} 