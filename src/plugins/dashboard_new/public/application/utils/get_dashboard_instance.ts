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
import { SavedObjectDashboard } from '../../saved_dashboards';
  
  const createDashboardEmbeddable = async (
    dashboard: Dashboard,
    dashboardServices: DashboardServices
  ) => {
    const { chrome, data, overlays, createDashboardEmbeddableFromObject, savedObjects } = dashboardServices;
    const embeddableHandler = (await createDashboardEmbeddableFromObject(dashboard, {
      timeRange: data.query.timefilter.timefilter.getTime(),
      filters: data.query.filterManager.getFilters(),
      id: '',
    })) as DashboardEmbeddableContract;
  
    embeddableHandler.getOutput$().subscribe((output) => {
      if (output.error) {
        data.search.showError(
          ((output.error as unknown) as ExpressionValueError['error']).original || output.error
        );
      }
    });
  
    return embeddableHandler;
  };
  
  export const getVisualizationInstanceFromInput = async (
    visualizeServices: VisualizeServices,
    input: VisualizeInput
  ) => {
    const { visualizations } = visualizeServices;
    const visState = input.savedVis as SerializedVis;
    let vis = await visualizations.createVis(visState.type, cloneDeep(visState));
    if (vis.type.setup) {
      try {
        vis = await vis.type.setup(vis);
      } catch {
        // skip this catch block
      }
    }
    const { embeddableHandler, savedSearch } = await createVisualizeEmbeddableAndLinkSavedSearch(
      vis,
      visualizeServices
    );
    return {
      vis,
      embeddableHandler,
      savedSearch,
    };
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
    const { savedDashboards } = dashboardServices;
    const savedDashboard: SavedObjectDashboard = await savedDashboards.get(opts);
  
    if (typeof opts !== 'string') {
      savedVis.searchSourceFields = { index: opts?.indexPattern } as SearchSourceFields;
    }

    let dashboard = await dashboardServices.createDashboard()
  
    const embeddableHandler = await createDashboardEmbeddable(
      dashboard,
      dashboardServices
    );
    return {
      dashboard,
      embeddableHandler,
      savedVis,
    };
  };
  