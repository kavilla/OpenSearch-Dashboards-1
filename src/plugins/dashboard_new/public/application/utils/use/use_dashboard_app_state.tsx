/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import EventEmitter from 'events';
import { useEffect, useState } from 'react';
import { cloneDeep } from 'lodash';
import { map } from 'rxjs/operators';
import { connectToQueryState, opensearchFilters } from '../../../../../data/public';
import { migrateLegacyQuery } from '../../lib/migrate_legacy_query';
import { migrateAppState, getAppStateDefaults } from '../../lib';
import { createDashboardAppState } from '../create_dashboard_app_state';
import { DashboardAppStateContainer, DashboardAppStateDefaults, DashboardEditorDashboardInstance, DashboardServices } from '../../types';

/**
 * This effect is responsible for instantiating the dashboard app state container,
 * which is in sync with "_a" url param
 */
export const useDashboardAppState = (
  services: DashboardServices,
  eventEmitter: EventEmitter,
  instance: DashboardEditorDashboardInstance,
) => {
  const [appState, setAppState] = useState<DashboardAppStateContainer | null>(null);

  useEffect(() => {
    if (instance) {
      const { usageCollection, opensearchDashboardsVersion } = services;

      // export const visStateToEditorState = (
      //   visInstance: VisualizeEditorVisInstance,
      //   services: VisualizeServices
      // ) => {
      //   const vis = visInstance.vis;
      //   const savedVisState = services.visualizations.convertFromSerializedVis(vis.serialize());
      //   const savedVis = 'savedVis' in visInstance ? visInstance.savedVis : undefined;
      //   return {
      //     uiState:
      //       savedVis && savedVis.uiStateJSON ? JSON.parse(savedVis.uiStateJSON) : vis.uiState.toJSON(),
      //     query: vis.data.searchSource?.getOwnField('query') || getDefaultQuery(services),
      //     filters: (vis.data.searchSource?.getOwnField('filter') as Filter[]) || [],
      //     vis: { ...savedVisState.visState, title: vis.title },
      //     linked: savedVis && savedVis.id ? !!savedVis.savedSearchId : !!savedVisState.savedSearchId,
      //   };
      // };

      // QUESTION: I DONT KNOW IF WE NEED SOMETHING LIKE DASHBOARHSTATETOEDITORSTATE HERE LIKE HOW VISUALIZE DOES
      // THEY SERIALIZE IT AND THEN UN-SERIALIZE IT???
      const stateDefaults = migrateAppState(
        instance.appStateDefaults,
        opensearchDashboardsVersion,
        usageCollection
      );

      const { stateContainer, stopStateSync } = createDashboardAppState({
        stateDefaults,
        osdUrlStateStorage: services.osdUrlStateStorage,
        services,
        instance,
      });

      const { filterManager, queryString } = services.data.query;

      // sync initial app state from state container to managers
      filterManager.setAppFilters(cloneDeep(stateContainer.getState().filters));
      queryString.setQuery(migrateLegacyQuery(stateContainer.getState().query));

      // setup syncing of app filters between app state and query services
      const stopSyncingAppFilters = connectToQueryState(
        services.data.query,
        {
          set: ({ filters, query }) => {
            stateContainer.transitions.set('filters', filters || []);
            stateContainer.transitions.set('query', query || queryString.getDefaultQuery());
          },
          get: () => ({
            filters: stateContainer.getState().filters,
            query: migrateLegacyQuery(stateContainer.getState().query),
          }),
          state$: stateContainer.state$.pipe(
            map((state) => ({
              filters: state.filters,
              query: queryString.formatQuery(state.query),
            }))
          ),
        },
        {
          filters: opensearchFilters.FilterStateStore.APP_STATE,
          query: true,
        }
      );

      setAppState(stateContainer);

      return () => {
        stopStateSync();
        stopSyncingAppFilters();
      };
    }
  }, [eventEmitter, instance, services]);

  return { appState };
};
