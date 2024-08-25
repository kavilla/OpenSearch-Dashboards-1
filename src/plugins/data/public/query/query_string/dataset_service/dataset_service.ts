/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart, SavedObjectsClientContract } from 'opensearch-dashboards/public';
import { Dataset, DataStructure, IndexPatternSpec, DEFAULT_DATA } from '../../../../common';
import { getIndexPatterns } from '../../../services';
import { DatasetTypeConfig } from './types';
import { indexPatternTypeConfig, indexTypeConfig } from './lib';

export class DatasetService {
  private defaultDataset?: Dataset;
  private typesRegistry: Map<string, DatasetTypeConfig> = new Map();

  constructor(private readonly uiSettings: CoreStart['uiSettings']) {
    this.registerDefaultTypes();
  }

  /**
   * Registers default handlers for index patterns and indices.
   */
  private registerDefaultTypes() {
    this.registerType(indexPatternTypeConfig);
    this.registerType(indexTypeConfig);
  }

  public async init(): Promise<void> {
    this.defaultDataset = await this.fetchDefaultDataset();
  }

  public registerType(handlerConfig: DatasetTypeConfig): void {
    this.typesRegistry.set(handlerConfig.id, handlerConfig);
  }

  public getType(type: string): DatasetTypeConfig | undefined {
    return this.typesRegistry.get(type);
  }

  public getTypes(): DatasetTypeConfig[] {
    return Array.from(this.typesRegistry.values());
  }

  public getDefault(): Dataset | undefined {
    return this.defaultDataset;
  }

  public async cacheDataset(dataset: Dataset): Promise<void> {
    const type = this.getType(dataset.type);
    if (dataset) {
      const spec = {
        ...dataset,
        fields: await type?.fetchFields(dataset),
        dataSourceRef: dataset.dataSource
          ? {
              id: dataset.dataSource.id!,
              name: dataset.dataSource.title,
              type: dataset.dataSource.type,
            }
          : undefined,
      } as IndexPatternSpec;
      const temporaryIndexPattern = await getIndexPatterns().create(spec, true);
      getIndexPatterns().saveToCache(dataset.id, temporaryIndexPattern);
    }
  }

  public fetchOptions(
    savedObjects: SavedObjectsClientContract,
    path: DataStructure[],
    dataType: string
  ): Promise<DataStructure> {
    const type = this.typesRegistry.get(dataType);
    if (!type) {
      throw new Error(`No handler found for type: ${path[0]}`);
    }
    return type.fetch(savedObjects, path);
  }

  private async fetchDefaultDataset(): Promise<Dataset | undefined> {
    const defaultIndexPatternId = this.uiSettings.get('defaultIndex');
    if (!defaultIndexPatternId) {
      return undefined;
    }

    const indexPattern = await getIndexPatterns().get(defaultIndexPatternId);
    if (!indexPattern || !indexPattern.id) {
      return undefined;
    }

    const handler = this.typesRegistry.get(DEFAULT_DATA.SET_TYPES.INDEX_PATTERN);
    if (handler) {
      const dataset = handler.toDataset([
        {
          id: indexPattern.id,
          title: indexPattern.title,
          type: DEFAULT_DATA.SET_TYPES.INDEX_PATTERN,
        },
      ]);
      return { ...dataset, timeFieldName: indexPattern.timeFieldName };
    }

    return undefined;
  }
}

export type DatasetServiceContract = PublicMethodsOf<DatasetService>;
