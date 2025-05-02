/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from '@osd/i18n';
import {
  EmbeddableFactoryDefinition,
  Container,
  EmbeddableOutput,
  ErrorEmbeddable,
} from '../../../../embeddable/public';
import {
  ExploreContainer,
  ExploreContainerInput,
  ExploreContainerOutput,
  ExploreTab,
} from './explore_container';
import { DataPublicPluginStart } from '../../../../data/public';

export class ExploreContainerFactoryDefinition
  implements
    EmbeddableFactoryDefinition<ExploreContainerInput, ExploreContainerOutput, ExploreContainer> {
  public readonly type = 'explore-container';
  public readonly isContainerType = true;

  constructor(private deps: any) {}

  public getDisplayName() {
    return i18n.translate('explore.container.displayName', {
      defaultMessage: 'Explore',
    });
  }

  public async isEditable() {
    return true;
  }

  public getDefaultInput(): Partial<ExploreContainerInput> {
    return {
      panels: {},
      activeTab: ExploreTab.LOGS,
    };
  }

  public async create(
    initialInput: ExploreContainerInput,
    parent?: Container
  ): Promise<ExploreContainer | ErrorEmbeddable> {
    const input: ExploreContainerInput = {
      ...initialInput,
      panels: initialInput.panels || {},
    };

    return new ExploreContainer(input, this.deps, { data: this.deps.data }, parent);
  }
}
