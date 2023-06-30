/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import { Dashboard, DashboardContainerEmbeddable } from 'src/plugins/dashboard_new/public';
import { DashboardServices } from '../types';
import { DashboardSavedObject } from '../../types';
import { getAppStateDefaults } from '../lib';
import { SerializedDashboard } from '../../dashboard';
  
export const getDashboardInstance = async (
  dashboardServices: DashboardServices,
  /**
   * opts can be either a saved dashboard id passed as string,
   * or an object of new dashboard params.
   * Both come from url search query
   */
  opts?: Record<string, unknown> | string
) => {
  const { scopedHistory, embeddable, dashboards, savedDashboards } = dashboardServices;
  
  // Get the existing dashboard/default new dashboard from saved object loader
  const savedDashboard: DashboardSavedObject = await savedDashboards().get(opts);
  // Serialized the saved object dashboard
  const serializedDashboard = dashboards.convertToSerializedDashboard(savedDashboard);
  // Create a Dashboard class using the serialized dashboard
  let dashboard = await dashboards.createDashboard(serializedDashboard) as Dashboard;

  const stateTransfer = embeddable.getStateTransfer(scopedHistory);
  const appStateDefaults = getAppStateDefaults(savedDashboard, serializedDashboard, true);

  // WHAT WE NEED:
  // panels: {
  //   [panelId: string]: DashboardPanelState<EmbeddableInput & { [k: string]: unknown }>;
  // };

  //WHAT WE PASS IN NOW
//   export type SavedDashboardPanel730ToLatest = Pick<
//   RawSavedDashboardPanel730ToLatest,
//   Exclude<keyof RawSavedDashboardPanel730ToLatest, 'name'>
// > & {
//   readonly id?: string;
//   readonly type: string;
// };

  // Create the dashboard container embeddable
  const embeddableHandler = new DashboardContainerEmbeddable(
    {
      ...appStateDefaults
    },
    {
      savedDashboard: dashboard,
      deps: dashboardServices
    },
    stateTransfer,
    parent
  )
  return {
    dashboard,
    embeddableHandler,
    savedDashboard
  };
};
  