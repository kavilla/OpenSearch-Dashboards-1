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

import {
    SerializedVis,
    Vis,
    VisSavedObject,
    VisualizeEmbeddableContract,
    VisualizeInput,
  } from 'src/plugins/visualizations/public';
  import { SearchSourceFields } from 'src/plugins/data/public';
  import { SavedObject } from 'src/plugins/saved_objects/public';
  import { cloneDeep } from 'lodash';
  import { ExpressionValueError } from 'src/plugins/expressions/public';
  import { createSavedSearchesLoader } from '../../../../discover/public';
  import { DashboardEmbeddableContract, DashboardServices } from '../types';
import { Dashboard } from '../../dashboard';
import { SavedObjectDashboard } from 'src/plugins/dashboard/public';
  
  const createDashboardEmbeddable = async (
    dashboard: Dashboard,
    dashboardServices: DashboardServices
  ) => {
    const { data } = dashboardServices;
    const embeddableHandler = new DashboardEmbeddable(dashboard, {
      timeRange: data.query.timefilter.timefilter.getTime(),
      filters: data.query.filterManager.getFilters(),
      id: '',
    }) as DashboardEmbeddableContract;
  
    return embeddableHandler;
  };
  
  export const getDashboardInstance = async (
    dashboardServices: DashboardServices,
    /**
     * opts can be either a saved dashboard id passed as string,
     * or an object of new dashboard params.
     * Both come from url search query
     */
    opts?: Record<string, unknown> | string
  ) => {
    const { dashboards, savedDashboards } = dashboardServices;
    const savedDashboard: SavedObjectDashboard = await savedDashboards().get(opts);

    const serializedDashboard = dashboards.convertToSerializedDashboard(savedDashboard)
    let dashboard = await dashboards.createDashboard(serializedDashboard)
  
    const embeddableHandler = await createDashboardEmbeddable(
      dashboard,
      dashboardServices
    );
    return {
      dashboard,
      embeddableHandler,
      savedDashboard
    };
  };
  