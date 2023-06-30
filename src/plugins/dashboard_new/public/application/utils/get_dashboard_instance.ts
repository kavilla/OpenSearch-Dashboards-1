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
import { DashboardServices, SavedDashboardInstance } from '../types';
import { SavedObjectDashboard } from '../../types';
import { getAppStateDefaults } from '../lib';

export const getDashboardInstance = async (
  dashboardServices: DashboardServices,
  /**
   * opts can be either a saved dashboard id passed as string,
   * or an object of new dashboard params.
   * Both come from url search query
   */
  opts?: Record<string, unknown> | string
): Promise<SavedDashboardInstance> => {
  const { scopedHistory, embeddable, dashboards, savedDashboards, dashboardConfig } = dashboardServices;

  // Get the existing dashboard/default new dashboard from saved object loader
  const savedDashboard: SavedObjectDashboard = await savedDashboards().get(opts);
  // Serialized the saved object dashboard
  const serializedDashboard = dashboards.convertToSerializedDashboard(savedDashboard);
  // Create a Dashboard class using the serialized dashboard
  const dashboard = (await dashboards.createDashboard(serializedDashboard)) as Dashboard;

  const stateTransfer = embeddable.getStateTransfer(scopedHistory);
  const appStateDefaults = getAppStateDefaults(serializedDashboard, dashboardConfig.getHideWriteControls());

  const embeddableHandler = new DashboardContainerEmbeddable(
    {
      ...appStateDefaults,
    },
    {
      savedDashboard: dashboard,
      deps: dashboardServices,
    },
    stateTransfer
  );
  return {
    dashboard,
    embeddableHandler,
    savedDashboard,
    appStateDefaults
  };
};
