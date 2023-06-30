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

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {
  createSavedObjectClass,
  SavedObjectOpenSearchDashboardsServices,
} from '../../../saved_objects/public';
import { extractReferences, injectReferences } from './saved_dashboard_references';

import { createDashboardEditUrl } from '../dashboard_constants';
import { ISavedDashboard } from '../types';
import { SerializedDashboard } from '../dashboard';
import { SavedObjectDashboard } from '../types';

export const convertToSerializedDashboard = (
  savedDashboard: ISavedDashboard
): SerializedDashboard => {
  const {
    id,
    timeRestore,
    timeTo,
    timeFrom,
    description,
    refreshInterval,
    panelsJSON,
    optionsJSON,
    uiStateJSON,
    searchSource,
    lastSavedTitle,
  } = savedDashboard;

  return {
    id,
    timeRestore,
    timeTo,
    timeFrom,
    description,
    refreshInterval,
    panels: JSON.parse(panelsJSON || '{}'),
    options: JSON.parse(optionsJSON || '{}'),
    uiState: JSON.parse(uiStateJSON || '{}'),
    lastSavedTitle,
    searchSource,
    query: savedDashboard.getQuery(),
    filters: savedDashboard.getFilters(),
  };
};

export const convertFromSerializedDashboard = (
  serializedDashboard: SerializedDashboard
): ISavedDashboard => {
  const {
    id,
    timeRestore,
    timeTo,
    timeFrom,
    refreshInterval,
    description,
    panels,
    options,
    uiState,
    lastSavedTitle,
    searchSource,
    query,
    filters,
  } = serializedDashboard;

  return {
    id,
    timeRestore,
    timeTo,
    timeFrom,
    description,
    panelsJSON: JSON.stringify(panels),
    optionsJSON: JSON.stringify(options),
    uiStateJSON: JSON.stringify(uiState),
    lastSavedTitle,
    refreshInterval,
    searchSource,
    getQuery: () => query,
    getFilters: () => filters,
  };
};

export function createSavedDashboardClass(
  services: SavedObjectOpenSearchDashboardsServices
): new (id: string) => SavedObjectDashboard {
  const SavedObjectClass = createSavedObjectClass(services);
  class SavedDashboard extends SavedObjectClass {
    public static type = 'dashboard';
    public static mapping: Record<string, any> = {
      title: 'text',
      hits: 'integer',
      description: 'text',
      panelsJSON: 'text',
      optionsJSON: 'text',
      version: 'integer',
      timeRestore: 'boolean',
      timeTo: 'keyword',
      timeFrom: 'keyword',
      refreshInterval: {
        type: 'object',
        properties: {
          display: { type: 'keyword' },
          pause: { type: 'boolean' },
          section: { type: 'integer' },
          value: { type: 'integer' },
        },
      },
    };
    // Order these fields to the top, the rest are alphabetical
    public static fieldOrder = ['title', 'description'];
    public static searchSource = true;
    public showInRecentlyAccessed = true;

    constructor(id: string) {
      super({
        type: SavedDashboard.type,
        mapping: SavedDashboard.mapping,
        searchSource: SavedDashboard.searchSource,
        extractReferences,
        injectReferences,

        // if this is null/undefined then the SavedObject will be assigned the defaults
        id,

        // default values that will get assigned if the doc is new
        defaults: {
          title: '',
          hits: 0,
          description: '',
          panelsJSON: '[]',
          optionsJSON: JSON.stringify({
            // for BWC reasons we can't default dashboards that already exist without this setting to true.
            useMargins: !id,
            hidePanelTitles: false,
          }),
          version: 1,
          timeRestore: false,
          timeTo: undefined,
          timeFrom: undefined,
          refreshInterval: undefined,
        },
      });
      this.getFullPath = () => `/app/dashboardsNew#${createDashboardEditUrl(String(this.id))}`;
    }

    getQuery() {
      return this.searchSource!.getOwnField('query') || { query: '', language: 'kuery' };
    }

    getFilters() {
      return this.searchSource!.getOwnField('filter') || [];
    }
  }

  return (SavedDashboard as unknown) as new (id: string) => SavedObjectDashboard;
}
