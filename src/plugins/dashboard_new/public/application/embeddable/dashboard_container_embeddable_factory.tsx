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
import { UiActionsStart } from 'src/plugins/ui_actions/public';
import { CoreStart, ScopedHistory } from 'src/core/public';
import { EmbeddableFactory, EmbeddableStart } from '../../../../embeddable/public';
import {
  ContainerOutput,
  EmbeddableFactoryDefinition,
  ErrorEmbeddable,
  Container,
  IContainer,
} from '../../embeddable_plugin';
import { DashboardContainerEmbeddable, DashboardContainerEmbeddableInput } from './dashboard_container_embeddable';
import { DASHBOARD_CONTAINER_TYPE } from './dashboard_constants';
import { createDashboardContainerEmbeddableFromObject } from './create_dashboard_container_embeddable_from_object';
import { DataPublicPluginStart } from 'src/plugins/data/public';
import { convertToSerializedDashboard } from '../../saved_dashboards';
import { Dashboard } from '../../dashboard';
import { StartServicesGetter } from 'src/plugins/opensearch_dashboards_utils/public';
import { DashboardStartDeps } from '../../plugin'
import { Capabilities } from 'opensearch-dashboards/public';

// Can just use DashboardServices
export interface DashboardContainerEmbeddableFactoryDeps {
  start: StartServicesGetter<
    Pick<DashboardStartDeps, 'capabilities' | 'embeddable' | 'dashboard' >
  >
}

export type DashboardContainerFactory = EmbeddableFactory<
  DashboardContainerEmbeddableInput,
  ContainerOutput,
  DashboardContainerEmbeddable
>;
export class DashboardContainerFactoryDefinition
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

  public async createFromSavedObject(
    savedObjectId: string,
    input: Partial<DashboardContainerEmbeddableInput> & { id: string },
    parent?: IContainer
  ): Promise<DashboardContainerEmbeddable | ErrorEmbeddable> {
    const savedDashboards = await this.deps.start().plugins.dashboard.getSavedDashboardsLoader();

    try {
      const savedObject = await savedDashboards.get(savedObjectId);
      const serializedDashboard = convertToSerializedDashboard(savedObject);
      const dashboard = new Dashboard(serializedDashboard);
      await dashboard.setState(serializedDashboard);
      // return createDashboardContainerEmbeddableFromObject(this.deps)(
      //   dashboard,
      //   input, 
      //   savedDashboards,
      // );

      const embeddableInput = {

      }

    //   initialInput: DashboardContainerEmbeddableInput,
    // private readonly options: DashboardContainerEmbeddableOptions,
    // stateTransfer?: EmbeddableStateTransfer,
    // parent?: Container

    const stateTransfer = this.deps.start().plugins.embeddable.getStateTransfer(this.getHistory());


      return new DashboardContainerEmbeddable(
        input,
        this.deps,
        stateTransfer,
        parent
      )
    } catch (e) {
      console.error(e); // eslint-disable-line no-console
      return new ErrorEmbeddable(e, input, parent);
    }
  }

  public create = async (
    initialInput: DashboardContainerEmbeddableInput,
    parent?: Container
  ): Promise<DashboardContainerEmbeddable | ErrorEmbeddable> => {
    const dashboard = new Dashboard(initialInput)
    await dashboard.setState(initialInput)
    const stateTransfer = this.deps.start().plugins.embeddable.getStateTransfer(this.getHistory());
    return new DashboardContainerEmbeddable(initialInput, this.deps, stateTransfer, parent);
  };
}
