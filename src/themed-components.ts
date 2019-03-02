import * as styledComponents from 'styled-components';
import { ThemedStyledComponentsModule } from 'styled-components';

import ThemeInterface from './theme';

const {
  default: styled,
  css,
  keyframes,
  ThemeProvider,
} = styledComponents as ThemedStyledComponentsModule<typeof ThemeInterface>;

export {
  css, keyframes, ThemeProvider,
};
export default styled;