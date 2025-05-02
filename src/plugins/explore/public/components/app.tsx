/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { I18nProvider } from '@osd/i18n/react';
import { BrowserRouter as Router } from 'react-router-dom';

import { CoreStart } from '../../../../core/public';
import { NavigationPublicPluginStart, TopNavMenuItemRenderType } from '../../../navigation/public';

import { PLUGIN_ID } from '../../common';
import { ExploreView } from './explore_view';
import { ExploreStartPlugins } from '../types';

interface ExploreAppDeps {
  basename: string;
  core: CoreStart;
  plugins: ExploreStartPlugins;
}

export const ExploreApp = ({ basename, core, plugins }: ExploreAppDeps) => {
  return (
    <Router basename={basename}>
      <I18nProvider>
        <>
          <plugins.navigation.ui.TopNavMenu
            appName={PLUGIN_ID}
            useDefaultBehaviors={true}
            config={[]}
            showSearchBar={TopNavMenuItemRenderType.IN_PLACE}
            showDatePicker={TopNavMenuItemRenderType.IN_PORTAL}
            showSaveQuery={true}
          />
          <ExploreView core={core} plugins={plugins} />
        </>
      </I18nProvider>
    </Router>
  );
};
