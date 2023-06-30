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
import {
  DashboardAppStateContainer,
  DashboardAppStateDefaults,
  EditorDashboardInstance,
  DashboardServices,
} from '../../types';
import { dashboardStateToEditorState } from '../utils';

/**
 * This effect is responsible for instantiating the dashboard app state container,
 * which is in sync with "_a" url param
 */
export const useDashboardAppState = (
  services: DashboardServices,
  eventEmitter: EventEmitter,
  instance: EditorDashboardInstance
) => {
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);
  const [appState, setAppState] = useState<DashboardAppStateContainer | null>(null);

  useEffect(() => {
    if (instance) {
      const { usageCollection, opensearchDashboardsVersion } = services;

      const dashboardAppState = dashboardStateToEditorState(instance, services);
      // QUESTION: I DONT KNOW IF WE NEED SOMETHING LIKE DASHBOARHSTATETOEDITORSTATE HERE LIKE HOW VISUALIZE DOES
      // THEY SERIALIZE IT AND THEN UN-SERIALIZE IT???
      const stateDefaults = migrateAppState(
        { ...dashboardAppState },
        opensearchDashboardsVersion,
        usageCollection
      );

      const { stateContainer, stopStateSync } = createDashboardAppState({
        stateDefaults,
        osdUrlStateStorage: services.osdUrlStateStorage,
        services,
      });

      const onDirtyStateChange = ({ isDirty }: { isDirty: boolean }) => {
        if (!isDirty) {
          // it is important to update vis state with fresh data
          stateContainer.transitions.updateDashboardState(
            dashboardStateToEditorState(instance, services).dashboard
          );
        }
        setHasUnappliedChanges(isDirty);
      };

      eventEmitter.on('dirtyStateChange', onDirtyStateChange);

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
