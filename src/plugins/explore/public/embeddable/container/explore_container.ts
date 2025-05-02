/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Observable, Subscription } from 'rxjs';
import {
  Container,
  ContainerInput,
  ContainerOutput,
  EmbeddableOutput,
  EmbeddableInput,
  ErrorEmbeddable,
  IEmbeddable,
  PanelState,
} from '../../../../embeddable/public';
import { DataPublicPluginStart } from '../../../../data/public';

export const EXPLORE_CONTAINER_TYPE = 'explore-container';

export enum ExploreTab {
  LOGS = 'logs',
  METRICS = 'metrics',
  VISUALIZATION = 'visualization',
}

export interface ExploreContainerInput extends ContainerInput {
  panels: { [key: string]: PanelState<EmbeddableInput & { id: string }> };
  id: string;
  activeTab: ExploreTab;
  dataset?: string;
}

export interface ExploreContainerOutput extends ContainerOutput {
  activeTab: ExploreTab;
}

export class ExploreContainer extends Container<
  EmbeddableInput,
  ExploreContainerInput,
  ExploreContainerOutput
> {
  public readonly type = EXPLORE_CONTAINER_TYPE;
  private localSubscription: Subscription = new Subscription();
  data: DataPublicPluginStart;

  constructor(
    initialInput: ExploreContainerInput,
    private getEmbeddable: any,
    dependencies: {
      data: DataPublicPluginStart;
    },
    parent?: Container
  ) {
    super(
      {
        ...initialInput,
        panels: initialInput.panels || {},
      },
      {
        activeTab: initialInput.activeTab || ExploreTab.LOGS,
        embeddableLoaded: {},
      },
      getEmbeddable
    );

    this.data = dependencies.data;

    this.localSubscription.add(
      this.getInput$().subscribe(async () => {
        await this.initializeChildren();
      })
    );
  }

  public destroy() {
    super.destroy();
    this.localSubscription.unsubscribe();
  }

  public reload() {
    super.reload();
    const activeTabId = `explore-${this.getInput().activeTab}-tab`;
    if (activeTabId && this.children[activeTabId]) {
      this.children[activeTabId].reload();
    }
  }

  protected getInheritedInput(id: string): EmbeddableInput {
    const input = this.getInput();
    return {
      id,
      filters: input.filters,
      query: input.query,
      timeRange: input.timeRange,
      viewMode: input.viewMode,
    };
  }

  private async initializeChildren() {
    const tabId = `explore-${this.getInput().activeTab}-tab`;

    if (!this.children[tabId]) {
      const embeddableType = `explore-${this.getInput().activeTab}-embeddable`;

      try {
        await this.addNewEmbeddable(embeddableType, {
          id: tabId,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to initialize ${this.getInput().activeTab} embeddable:`, error);
      }
    }
  }

  public async switchTab(tab: ExploreTab) {
    this.updateInput({ activeTab: tab });
  }
}
