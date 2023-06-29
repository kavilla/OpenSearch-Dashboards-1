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
 *
 * @description This class consists of aggs, params, listeners, title, and type.
 *  - Aggs: Instances of IAggConfig.
 *  - Params: The settings in the Options tab.
 *
 * Not to be confused with vislib/vis.js.
 */

import { isFunction, defaults, cloneDeep } from 'lodash';
import { Assign } from '@osd/utility-types';
import { i18n } from '@osd/i18n';
import { PersistedState } from './persisted_state';
import { getTypes, getAggs, getSearch, getSavedSearchLoader } from './services';
import {
  IAggConfigs,
  IndexPattern,
  ISearchSource,
  AggConfigOptions,
  SearchSourceFields,
} from '../../../plugins/data/public';
import { SerializedDashboard } from '../dashboard';

export interface DashboardParams {
  [key: string]: any;
}

// type PartialDashboardState = Assign<SerializedVis, { data: Partial<SerializedVisData> }>;

// id?: string;
// timeRestore: boolean;
// timeTo?: string;
// timeFrom?: string;
// description?: string;
// panelsJSON: string;
// optionsJSON?: string;
// // TODO: write a migration to rid of this, it's only around for bwc.
// uiStateJSON?: string;
// lastSavedTitle: string;
// refreshInterval?: RefreshInterval;
// searchSource: ISearchSource;
// getQuery(): Query;
// getFilters(): Filter[];

export class Dashboard<TDashboardParams = DashboardParams> {
  public readonly id?: string;
  public title: string = '';
  public description: string = '';
  public params: TDashboardParams;
  // Session state is for storing information that is transitory, and will not be saved with the visualization.
  // For instance, map bounds, which depends on the view port, browser window size, etc.
  public sessionState: Record<string, any> = {};

  public readonly uiState: PersistedState;

  constructor(dashboardState: SerializedDashboard = {} as any) {
    this.params = this.getParams(dashboardState.params);
    this.uiState = new PersistedState(dashboardState.uiState);
    this.id = dashboardState.id;
  }

  private getParams(params: VisParams) {
    return defaults({}, cloneDeep(params ?? {}), cloneDeep(this.type.visConfig?.defaults ?? {}));
  }

  async setState(state: PartialDashboardState) {
    let typeChanged = false;
    if (state.type && this.type.name !== state.type) {
      // @ts-ignore
      this.type = this.getType(state.type);
      typeChanged = true;
    }
    if (state.title !== undefined) {
      this.title = state.title;
    }
    if (state.description !== undefined) {
      this.description = state.description;
    }
    if (state.params || typeChanged) {
      this.params = this.getParams(state.params);
    }
    if (state.data && state.data.searchSource) {
      this.data.searchSource = await getSearch().searchSource.create(state.data.searchSource!);
      this.data.indexPattern = this.data.searchSource.getField('index');
    }
    if (state.data && state.data.savedSearchId) {
      this.data.savedSearchId = state.data.savedSearchId;
      if (this.data.searchSource) {
        this.data.searchSource = await getSearchSource(
          this.data.searchSource,
          this.data.savedSearchId
        );
        this.data.indexPattern = this.data.searchSource.getField('index');
      }
    }
    if (state.data && (state.data.aggs || !this.data.aggs)) {
      const aggs = state.data.aggs ? cloneDeep(state.data.aggs) : [];
      const configStates = this.initializeDefaultsFromSchemas(aggs, this.type.schemas.all || []);
      if (!this.data.indexPattern) {
        if (aggs.length) {
          const errorMessage = i18n.translate(
            'visualizations.initializeWithoutIndexPatternErrorMessage',
            {
              defaultMessage: 'Trying to initialize aggs without index pattern',
            }
          );
          throw new Error(errorMessage);
        }
        return;
      }
      this.data.aggs = getAggs().createAggConfigs(this.data.indexPattern, configStates);
    }
  }

  clone() {
    const { data, ...restOfSerialized } = this.serialize();
    const vis = new Vis(this.type.name, restOfSerialized as any);
    vis.setState({ ...restOfSerialized, data: {} });
    const aggs = this.data.indexPattern
      ? getAggs().createAggConfigs(this.data.indexPattern, data.aggs)
      : undefined;
    vis.data = {
      ...this.data,
      aggs,
    };
    return vis;
  }

  serialize(): SerializedVis {
    const aggs = this.data.aggs ? this.data.aggs.aggs.map((agg) => agg.toJSON()) : [];
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      type: this.type.name,
      params: cloneDeep(this.params) as any,
      uiState: this.uiState.toJSON(),
      data: {
        aggs: aggs as any,
        searchSource: this.data.searchSource ? this.data.searchSource.getSerializedFields() : {},
        savedSearchId: this.data.savedSearchId,
      },
    };
  }

  // deprecated
  isHierarchical() {
    if (isFunction(this.type.hierarchicalData)) {
      return !!this.type.hierarchicalData(this);
    } else {
      return !!this.type.hierarchicalData;
    }
  }

  private initializeDefaultsFromSchemas(configStates: AggConfigOptions[], schemas: any) {
    // Set the defaults for any schema which has them. If the defaults
    // for some reason has more then the max only set the max number
    // of defaults (not sure why a someone define more...
    // but whatever). Also if a schema.name is already set then don't
    // set anything.
    const newConfigs = [...configStates];
    schemas
      .filter((schema: any) => Array.isArray(schema.defaults) && schema.defaults.length > 0)
      .filter(
        (schema: any) => !configStates.find((agg) => agg.schema && agg.schema === schema.name)
      )
      .forEach((schema: any) => {
        const defaultSchemaConfig = schema.defaults.slice(0, schema.max);
        defaultSchemaConfig.forEach((d: any) => newConfigs.push(d));
      });
    return newConfigs;
  }
}
