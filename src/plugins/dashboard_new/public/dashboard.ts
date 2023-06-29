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

/**
 * @name Dashboard
 */

import { cloneDeep } from 'lodash';
import { Filter, ISearchSource, Query, RefreshInterval } from '../../data/public';
import { SavedDashboardPanel } from '../public';

export interface SerializedDashboard {
  id?: string;
  timeRestore?: boolean;
  timeTo?: string;
  timeFrom?: string;
  description?: string;
  panels?: SavedDashboardPanel[];
  options?: {
    hidePanelTitles: boolean;
    useMargins: boolean;
  };
  uiState?: string;
  lastSavedTitle?: string; // TODO: DO WE STILL NEED THIS?
  refreshInterval?: RefreshInterval; // TODO: SHOULD THIS NOT BE OPTIONAL?
  searchSource?: ISearchSource;
  query: Query;
  filters: Filter[];
  title: string;
}

export interface DashboardParams {
  [key: string]: any;
}

const getSearchSource = async(inputSearchSource: ISearchSource) => {
  return inputSearchSource.createCopy();
}

type PartialDashboardState = Partial<SerializedDashboard>;

export class Dashboard<TDashboardParams = DashboardParams> {
  public readonly id?: string;
  public timeRestore?: boolean;
  public timeTo: string = '';
  public timeFrom: string = '';
  public description: string = '';
  public panels: SavedDashboardPanel[] = [];
  public options: Record<string, any> = {};
  public uiState: string = '';
  public lastSavedTitle = '';
  public refreshInterval: RefreshInterval;
  public searchSource?: ISearchSource;
  public query: Query;
  public filters: Filter[];
  public title: string = '';

  constructor(dashboardState: SerializedDashboard = {} as any) {
    this.id = dashboardState.id;
    this.refreshInterval = this.getRefreshInterval(dashboardState.refreshInterval!);
    this.query = this.getQuery(dashboardState.query);
    this.filters = this.getFilters(dashboardState.filters);
  }

  async setState(state: PartialDashboardState) {
    if (state.timeRestore) {
      this.timeRestore = state.timeRestore;
    }
    if (state.timeTo) {
      this.timeTo = state.timeTo;
    }
    if (state.timeFrom) {
      this.timeFrom = state.timeFrom;
    }
    if (state.description) {
      this.description = state.description;
    }
    if (state.panels) {
      this.panels = state.panels;
    }
    if (state.options) {
      this.options = state.options;
    }
    if (state.uiState) {
      this.uiState = state.uiState;
    }
    if (state.lastSavedTitle) {
      this.lastSavedTitle = state.lastSavedTitle;
    }
    if (state.refreshInterval) {
      this.refreshInterval = state.refreshInterval;
    }
    if (state.searchSource) {
      this.searchSource = state.searchSource;
    }
    if (state.query) {
      this.query = state.query;
    }
    if (state.filters) {
      this.filters = state.filters;
    }
    if (state.title) {
      this.title = state.title;
    }
  }

  private getRefreshInterval(refreshInterval: RefreshInterval) {
    return cloneDeep(refreshInterval ?? {});
  }

  private getQuery(query: Query) {
    return cloneDeep(query ?? {});
  }

  private getFilters(filters: Filter[]) {
    return cloneDeep(filters ?? {});
  }

  clone() {
    const serializedDashboard = this.serialize();
    const dashboard = new Dashboard(serializedDashboard);
    dashboard.setState(serializedDashboard);
    return dashboard;
  }

  serialize(): SerializedDashboard {
    return {
      id: this.id,
      timeRestore: this.timeRestore!,
      timeTo: this.timeTo,
      timeFrom: this.timeFrom,
      description: this.description,
      panels: this.panels,
      options: cloneDeep(this.options) as any,
      uiState: this.uiState,
      lastSavedTitle: this.lastSavedTitle,
      refreshInterval: this.refreshInterval,
      searchSource: this.searchSource,
      query: this.query,
      filters: this.filters,
      title: this.title
    };
  }
}
