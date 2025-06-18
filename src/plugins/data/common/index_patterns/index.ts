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

// Re-export non-ambiguous exports
export { IndexPatternsService } from './index_patterns';
export type { IndexPattern } from './index_patterns';
export { getIndexPatternTitle } from './utils';

// Re-export from fields directory, excluding ambiguous exports
export { IndexPatternField } from './fields/index_pattern_field';

// Re-export ambiguous types from datasets to resolve ambiguity
export type {
  IFieldType,
  OnError,
  OnNotification,
  OnUnsupportedTimePattern,
  SavedObjectReference,
  SavedObjectsClientCommon,
  SavedObjectsClientCommonFindArgs,
  SourceFilter,
  TypeMeta,
  UiSettingsCommon,
} from '../datasets';

// Re-export ambiguous functions from datasets to resolve ambiguity
export {
  fieldList,
  getOverrides,
  isFilterable,
  isNestedField,
  setOverrides,
  validateDataSourceReference,
} from '../datasets';

// Export remaining types from types.ts
export type {
  FieldFormatMap,
  IIndexPattern,
  IndexPatternAttributes,
  GetFieldsOptions,
  IIndexPatternsApiClient,
  AggregationRestrictions,
  IFieldSubType,
  FieldSpecConflictDescriptions,
  FieldSpecExportFmt,
  FieldSpec,
  IndexPatternFieldMap,
  IndexPatternSpec,
} from './types';
