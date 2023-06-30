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

import { ViewMode } from 'src/plugins/embeddable/public';
import { SavedObject } from '../../saved_objects/public';
import { Filter, ISearchSource, Query, RefreshInterval } from '../../data/public';
import { SavedDashboardPanel730ToLatest } from '../common';

/**
 * This should always represent the latest dashboard panel shape, after all possible migrations.
 */
export type SavedDashboardPanel = SavedDashboardPanel730ToLatest;

export interface SavedDashboardState {
  panels: SavedDashboardPanel[];
  isFullScreenMode: boolean;
  title: string;
  description: string;
  timeRestore: boolean;
  options: {
    hidePanelTitles: boolean;
    useMargins: boolean;
  };
  viewMode: ViewMode;
  expandedPanelId?: string;
}

export interface ISavedDashboard {
  id?: string;
  timeRestore?: boolean;
  timeTo?: string;
  timeFrom?: string;
  description?: string;
  panelsJSON: string;
  optionsJSON?: string;
  // TODO: write a migration to rid of this, it's only around for bwc.
  uiStateJSON?: string;
  lastSavedTitle: string;
  refreshInterval?: RefreshInterval;
  searchSource?: ISearchSource;
  getQuery(): Query;
  getFilters(): Filter[];
}

export interface SavedObjectDashboard extends SavedObject, ISavedDashboard {}

interface FieldSubType {
  multi?: { parent: string };
  nested?: { path: string };
}

export interface Field {
  name: string;
  type: string;
  // esTypes might be undefined on old index patterns that have not been refreshed since we added
  // this prop. It is also undefined on scripted fields.
  esTypes?: string[];
  aggregatable: boolean;
  filterable: boolean;
  searchable: boolean;
  subType?: FieldSubType;
}

export type NavAction = (anchorElement?: any) => void;

// TODO: this might not be needed because we have setDashboard(partial) now
// /**
//  * In URL panels are optional,
//  * Panels are not added to the URL when in "view" mode
//  */
export type DashboardAppStateInUrl = Omit<SavedDashboardState, 'panels'> & {
  panels?: SavedDashboardPanel[];
};

export interface SavedDashboardPanelMap {
  [key: string]: SavedDashboardPanel;
}

export interface StagedFilter {
  field: string;
  value: string;
  operator: string;
  index: string;
}
