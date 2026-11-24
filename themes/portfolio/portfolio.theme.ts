// The portfolio theme. `astryx experimental theme editor` wrote this file once and never changes it again.
// The checked settings live in portfolio.settings.json and the generated portfolio.settings.ts;
// change them with `astryx experimental theme editor set portfolio ...`. Add your own changes below: they win over the settings.
import {defineTheme} from '@astryxdesign/core/theme';
import {portfolioSettings} from './portfolio.settings';

export const portfolioTheme = defineTheme({
  extends: portfolioSettings,
  name: 'portfolio',
});
