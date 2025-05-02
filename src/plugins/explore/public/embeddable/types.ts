/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EmbeddableInput,
  EmbeddableOutput,
  IEmbeddable,
  ViewMode,
} from '../../../../plugins/embeddable/public';
import { TimeRange, Query, Filter } from '../../../../plugins/data/public';

export type ExploreEmbeddableType = 'logs';

export interface ExploreContainerInput extends EmbeddableInput {
  title?: string;
  timeRange?: TimeRange;
  query?: Query;
  filters?: Filter[];
  panels: {
    [key: string]: {
      type: string;
      explicitInput: { [key: string]: unknown };
      savedObjectId?: string;
    };
  };
  viewMode: ViewMode;
  activeTab?: ExploreEmbeddableType;
}

export interface ExploreContainerOutput extends EmbeddableOutput {
  activeTab?: ExploreEmbeddableType;
  childIds: string[];
}

export interface ExploreEmbeddableInput extends EmbeddableInput {
  timeRange?: TimeRange;
  query?: Query;
  filters?: Filter[];
  viewMode: ViewMode;
}

export interface ExploreEmbeddableOutput extends EmbeddableOutput {
  hasResults?: boolean;
  totalHits?: number;
}
