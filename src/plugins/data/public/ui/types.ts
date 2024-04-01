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

import { SearchInterceptor } from '../search';
import { IndexPatternSelectProps } from './index_pattern_select';
import { StatefulSearchBarProps } from './search_bar';

export interface QueryEnhancement {
  language: string;
  search: SearchInterceptor;
  input?: {
    placeholder?: string;
    submitOnLanguageSelect?: boolean;
  };
}

export interface UiEnhancements {
  query: QueryEnhancement;
}

/**
 * Data plugin prewired UI components
 */
export interface DataPublicPluginStartUi {
  queryEnhancements: Map<string, QueryEnhancement>;
  IndexPatternSelect: React.ComponentType<IndexPatternSelectProps>;
  SearchBar: React.ComponentType<StatefulSearchBarProps>;
}
