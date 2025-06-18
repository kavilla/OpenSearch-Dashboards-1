/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { FieldSpec, IBaseFieldSubType, Dataset } from '../..';

export interface IFieldType {
  name: string;
  type: string;
  script?: string;
  lang?: string;
  count?: number;
  // esTypes might be undefined on old index patterns that have not been refreshed since we added
  // this prop. It is also undefined on scripted fields.
  esTypes?: string[];
  aggregatable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  visualizable?: boolean;
  readFromDocValues?: boolean;
  scripted?: boolean;
  subType?: IBaseFieldSubType;
  displayName?: string;
  format?: any;
  toSpec?: (options?: { getFormatterForField?: Dataset['getFormatterForField'] }) => FieldSpec;
}
