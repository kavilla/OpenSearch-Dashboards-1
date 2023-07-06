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

import './app.scss';
import { AppMountParameters } from 'opensearch-dashboards/public';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { DashboardConstants, createDashboardEditUrl } from '../dashboard_constants';
import { DashboardEditor, DashboardListing, DashboardNoMatch } from './components';

export interface DashboardAppProps {
  onAppLeave: AppMountParameters['onAppLeave'];
}

export const DashboardApp = ({ onAppLeave }: DashboardAppProps) => {
  return (
    <Switch>
      <Route path={[DashboardConstants.CREATE_NEW_DASHBOARD_URL, createDashboardEditUrl(':id')]}>
        <div className="app-container dshAppContainer">
          <DashboardEditor />
        </div>
      </Route>
      <Route exact path={['/', DashboardConstants.LANDING_PAGE_PATH]}>
        <DashboardListing />
      </Route>
      <DashboardNoMatch />
    </Switch>
  );
};
