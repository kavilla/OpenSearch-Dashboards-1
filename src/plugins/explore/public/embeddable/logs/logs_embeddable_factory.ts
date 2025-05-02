/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from '@osd/i18n';
import {
  EmbeddableFactoryDefinition,
  Container,
  ErrorEmbeddable,
} from '../../../../embeddable/public';
import { DataPublicPluginStart } from '../../../../data/public';
import { LogsEmbeddable, LogsEmbeddableInput, LogsEmbeddableOutput } from './logs_embeddable';

export class LogsEmbeddableFactoryDefinition
  implements
    EmbeddableFactoryDefinition<LogsEmbeddableInput, LogsEmbeddableOutput, LogsEmbeddable> {
  public readonly type = 'explore-logs-embeddable';
  public readonly isContainerType = false;

  constructor(private readonly deps: any) {}

  public getDisplayName() {
    return i18n.translate('explore.logsEmbeddable.displayName', {
      defaultMessage: 'Logs',
    });
  }

  public async isEditable() {
    return true;
  }

  public async create(
    initialInput: LogsEmbeddableInput,
    parent?: Container
  ): Promise<LogsEmbeddable | ErrorEmbeddable> {
    return new LogsEmbeddable(initialInput, { data: this.deps.data });
  }
}
