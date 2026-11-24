import {navLayoutContext} from '@servicenow/aiux/aiux-components-nav';
import {i18n} from '@servicenow/aiux/aiux-services';
import {AppTheme} from './theme.js';

export default {
  appTheme: AppTheme,
  applicationLayout: 'aiux-nav-layout',

  setup(ctx) {
    const items = [
      {
        icon: 'home',
        title: i18n.getMessage('Home'),
        action: {type: 'navigate', path: '/home'}
      },
      {
        icon: 'list',
        title: i18n.getMessage('Incidents'),
        action: {type: 'navigate', path: '/incidents'}
      },
      {
        icon: 'lab',
        title: i18n.getMessage('Lux Lab'),
        action: {type: 'navigate', path: '/lux-lab'}
      },
      {
        icon: 'book',
        title: i18n.getMessage('Knowledge workspace'),
        action: {type: 'navigate', path: '/workspace'}
      },
      {
        icon: 'crosshairs',
        title: i18n.getMessage('Battleship'),
        action: {type: 'navigate', path: '/battleship'}
      }
    ];

    const activeRoute = ctx.app?.routes?.find(r => r.active);
    const itemsWithActive = items.map(item => ({
      ...item,
      ...(item.action?.path === activeRoute?.route && {active: true})
    }));

    const current = navLayoutContext.get();
    navLayoutContext.set({
      ...current,
      appTitle: i18n.getMessage('My App'),
      features: {
        unifiedExperience: true
      },
      items: itemsWithActive,
      defaultLogoFull: 'servicenow',
      defaultLogoIcon: 'servicenow'
    });
  },

  teardown() {}
};
