/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Filter } from 'src/plugins/data/public';
import { DashboardServices, EditorDashboardInstance } from '../types';

export const getDefaultQuery = ({ data }: DashboardServices) => {
  return data.query.queryString.getDefaultQuery();
};

export const dashboardStateToEditorState = (
  dashboardInstance: EditorDashboardInstance,
  services: DashboardServices
) => {
  const dashboard = dashboardInstance.dashboard;
  const savedDashboardState = services.dashboards.convertFromSerializedDashboard(
    dashboard.serialize()
  );
  const savedDashboard =
    'savedDashboard' in dashboardInstance ? dashboardInstance.savedDashboard : undefined;
  return {
    query: dashboard.searchSource?.getOwnField('query') || getDefaultQuery(services),
    filters: (dashboard.searchSource?.getOwnField('filter') as Filter[]) || [],
    panels: dashboard.panels,
    dashboard: savedDashboardState,
    ...savedDashboard,
  };
};
