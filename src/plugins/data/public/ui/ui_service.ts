/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Plugin, CoreSetup, CoreStart, PluginInitializerContext } from 'src/core/public';
import { DataPublicPluginStartUi, QueryEnhancement, UiEnhancements } from './types';

import { ConfigSchema } from '../../config';
import { createIndexPatternSelect } from './index_pattern_select';
import { createSearchBar } from './search_bar/create_search_bar';
import { DataPublicPluginStart } from '../types';
import { IStorageWrapper } from '../../../opensearch_dashboards_utils/public';

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UiServiceSetupDependencies {}

/** @internal */
export interface UiServiceStartDependencies {
  dataServices: Omit<DataPublicPluginStart, 'ui'>;
  storage: IStorageWrapper;
}

export class UiService implements Plugin<any, DataPublicPluginStartUi> {
  constructor(private _: PluginInitializerContext<ConfigSchema>) {}
  private queryEnhancements: Map<string, QueryEnhancement> = new Map();

  public setup(
    { http, getStartServices, notifications, uiSettings }: CoreSetup,
    {}: UiServiceSetupDependencies
  ) {
    return {
      __enhance: (enhancements?: UiEnhancements) => {
        if (!enhancements) return;
        if (enhancements.query && enhancements.query.language) {
          this.queryEnhancements.set(enhancements.query.language, enhancements.query);
        }
      },
    };
  }

  public start(core: CoreStart, { dataServices, storage }: UiServiceStartDependencies) {
    const SearchBar = createSearchBar({
      core,
      data: dataServices,
      storage,
      queryEnhancements: this.queryEnhancements,
    });

    return {
      queryEnhancements: this.queryEnhancements,
      IndexPatternSelect: createIndexPatternSelect(core.savedObjects.client),
      SearchBar,
    };
  }

  public stop() {}
}
