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

import { i18n } from '@osd/i18n';
import { ScopedHistory } from 'src/core/public';
import { EmbeddableFactory } from '../../../../embeddable/public';
import {
  ContainerOutput,
  EmbeddableFactoryDefinition,
  ErrorEmbeddable,
  Container,
} from '../../embeddable_plugin';
import { DashboardContainerEmbeddable, DashboardContainerEmbeddableInput } from './dashboard_container_embeddable';
import { DASHBOARD_CONTAINER_TYPE } from './dashboard_constants';
import { convertToSerializedDashboard } from '../../saved_dashboards';
import { Dashboard, SerializedDashboard } from '../../dashboard';
import { StartServicesGetter } from 'src/plugins/opensearch_dashboards_utils/public';
import { DashboardStartDeps } from '../../plugin'
import {
  convertPanelStateToSavedDashboardPanel,
  convertSavedDashboardPanelToPanelState,
} from '../lib/embeddable_saved_object_converters';
import { SavedDashboardPanel } from '../../types';
import { DashboardPanelState } from './types';


export interface DashboardContainerEmbeddableFactoryDeps {
  start: StartServicesGetter<DashboardStartDeps>
}

export type DashboardContainerEmbeddableFactoryContract = EmbeddableFactory<
  DashboardContainerEmbeddableInput,
  ContainerOutput,
  DashboardContainerEmbeddable
>;

export class DashboardContainerEmbeddableFactory
  implements
    EmbeddableFactoryDefinition<DashboardContainerEmbeddableInput, ContainerOutput, DashboardContainerEmbeddable> {
  public readonly isContainerType = true;
  public readonly type = DASHBOARD_CONTAINER_TYPE;

  constructor(
    private readonly deps: DashboardContainerEmbeddableFactoryDeps,
    private getHistory: () => ScopedHistory
  ) {}

  public isEditable = async () => {
    const { capabilities } = await this.deps.start().core.application.capabilities;
    return !!capabilities.createNew && !!capabilities.showWriteControls;
  };

  public readonly getDisplayName = () => {
    return i18n.translate('dashboardNew.factory.displayName', {
      defaultMessage: 'dashboard',
    });
  };

  public getDefaultInput(): Partial<DashboardContainerEmbeddableInput> {
    return {
      panels: {},
      isEmbeddedExternally: false,
      isFullScreenMode: false,
      useMargins: true,
    };
  }

  // The factory create a dashboard container embeddable for an existing dashboard
  // 1. The function will get the values from dashboard saved object loader and serialize the values
  // 2. Create a new Dashboard class using the serialize values and set the state
  // 3. Create the dashboard container embeddable using the dashboard object
  public async createFromSavedObject(
    savedObjectId: string,
    input: DashboardContainerEmbeddableInput,
    parent?: Container
  ): Promise<DashboardContainerEmbeddable | ErrorEmbeddable> {
    const savedDashboards = await this.deps.start().plugins.dashboard.getSavedDashboardsLoader();

    try {
      const savedObject = await savedDashboards.get(savedObjectId);
      const serializedDashboard = convertToSerializedDashboard(savedObject);
      const dashboard = new Dashboard(serializedDashboard);
      await dashboard.setState(serializedDashboard);
      const stateTransfer = this.deps.start().plugins.embeddable.getStateTransfer(this.getHistory());
      return new DashboardContainerEmbeddable(
        input,
        {
          savedDashboard: dashboard,
          deps: {
            application: this.deps.start().core.application,
            overlays: this.deps.start().core.overlays,
            notifications: this.deps.start().plugins.notifications,
            embeddable: this.deps.start().plugins.embeddable,
            inspector: this.deps.start().plugins.inspector,
            SavedObjectFinder: this.deps.start().plugins.SavedObjectFinder,
            ExitFullScreenButton: this.deps.start().plugins.ExitFullScreenButton,
            uiActions: this.deps.start().plugins.uiActions,
          }
        },
        stateTransfer,
        parent
      )
    } catch (e: any) {
      console.error(e); // eslint-disable-line no-console
      return new ErrorEmbeddable(e, input, parent);
    }
  }

  // The factory create a dashboard container embeddable for a new dashboard
  // 1. The function will get the values from input prop
  // 2. Create a new Dashboard class using the input and set the state
  // 3. Create the dashboard container embeddable using the dashboard object 
  public create = async (
    input: DashboardContainerEmbeddableInput & { savedDashboard?: SerializedDashboard },
    parent?: Container
  ): Promise<DashboardContainerEmbeddable | ErrorEmbeddable> => {
    const dashboard = new Dashboard(input.savedDashboard)
    await dashboard.setState(input.savedDashboard)
    const stateTransfer = this.deps.start().plugins.embeddable.getStateTransfer(this.getHistory());
    return new DashboardContainerEmbeddable(
      input, 
      {
        savedDashboard: dashboard,
        deps: {
          application: this.deps.start().core.application,
          overlays: this.deps.start().core.overlays,
          notifications: this.deps.start().plugins.notifications,
          embeddable: this.deps.start().plugins.embeddable,
          inspector: this.deps.start().plugins.inspector,
          SavedObjectFinder: this.deps.start().plugins.SavedObjectFinder,
          ExitFullScreenButton: this.deps.start().plugins.ExitFullScreenButton,
          uiActions: this.deps.start().plugins.uiActions
        }
      }, 
      stateTransfer, 
      parent
    );
  };
}
