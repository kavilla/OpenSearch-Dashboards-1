/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @experimental These interfaces are experimental and might change in future releases.
 */

import { IndexPatternsService } from '../../index_patterns';
import { DataSourceType } from '../datasource_services';

export interface IndexPatternOption {
  title: string;
  id: string;
  type?: DATA_FRAME_TYPE;
}

export enum DATA_FRAME_TYPE {
  DATA_FRAME = 'data_frame',
  DATA_FRAME_STREAM = 'data_frame_stream',
}

export type DataSourceTypeKey = 'DEFAULT_INDEX_PATTERNS' | 'DATA_FRAME' | 's3glue' | 'spark';

export interface IDataSourceMetaData {
  name: string;
}

export interface IDataSourceGroup {
  name: string;
}

export interface ISourceDataSet {
  ds: DataSourceType;
  data_sets: Array<string | IndexPatternOption>;
}

// to-dos: add common interfaces for datasource
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IDataSetParams {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IDataSourceQueryParams {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IDataSourceQueryResult {}

export interface ConnectionStatus {
  success: boolean;
  info: string;
}

export interface DataSourceConfig {
  name: string;
  type: string;
  metadata: any;
  indexPatterns: IndexPatternsService;
}
