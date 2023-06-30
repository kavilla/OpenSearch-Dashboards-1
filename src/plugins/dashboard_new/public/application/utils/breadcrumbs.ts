import { i18n } from '@osd/i18n';
import { DashboardConstants } from '../../dashboard_constants';

const defaultEditText = i18n.translate('visualize.editor.defaultEditBreadcrumbText', {
  defaultMessage: 'Edit',
});

export function getLandingBreadcrumbs() {
  return [
    {
      text: i18n.translate('dashboard.dashboardAppBreadcrumbsTitle', {
        defaultMessage: 'Dashboard',
      }),
      href: `#${DashboardConstants.LANDING_PAGE_PATH}`,
    },
  ];
}

export function getCreateBreadcrumbs() {
  return [
    ...getLandingBreadcrumbs(),
    {
      text: i18n.translate('dashboard.savedDashboard.newDashboardTitle', {
        defaultMessage: 'New Dashboard',
      }),
    },
  ];
}

export function getEditBreadcrumbs(text: string = defaultEditText) {
  return [
    ...getLandingBreadcrumbs(),
    {
      text: i18n.translate('dashboard.strings.dashboardEditTitle', {
        defaultMessage: 'Editing {title}',
        values: { title: text },
      }),
    },
  ];
}
