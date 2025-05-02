/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subscription } from 'rxjs';
import { Embeddable, EmbeddableInput, EmbeddableOutput } from '../../../../embeddable/public';
import { DataPublicPluginStart, ISearchSource } from '../../../../data/public';
import { ExploreTab } from '../container/explore_container';

export const LOGS_EMBEDDABLE_TYPE = 'explore-logs-embeddable';

export interface LogsEmbeddableInput extends EmbeddableInput {
  dataset?: string;
  columns?: string[];
  sort?: Array<{ field: string; direction: string }>;
  pageSize?: number;
}

export interface LogsEmbeddableOutput extends EmbeddableOutput {
  rows?: Array<Record<string, any>>;
  totalHits?: number;
  loading: boolean;
}

export class LogsEmbeddable extends Embeddable<LogsEmbeddableInput, LogsEmbeddableOutput> {
  public readonly type = LOGS_EMBEDDABLE_TYPE;

  private searchSource?: ISearchSource;
  private subscription: Subscription = new Subscription();

  constructor(
    initialInput: LogsEmbeddableInput,
    private readonly dependencies: {
      data: DataPublicPluginStart;
    }
  ) {
    super(
      {
        ...initialInput,
        id: initialInput.id || `explore-${ExploreTab.LOGS}-tab`,
      },
      {
        defaultTitle: 'Logs',
        loading: false,
        rows: [],
        totalHits: 0,
      }
    );

    this.subscription.add(
      this.getInput$().subscribe(async () => {
        if (this.getInput().dataset) {
          await this.initializeSearchSource();
          await this.fetchData();
        }
      })
    );
  }

  public reload() {
    this.fetchData();
  }

  public destroy() {
    super.destroy();
    this.subscription.unsubscribe();
  }

  private async initializeSearchSource() {
    if (!this.getInput().dataset) {
      return;
    }

    const indexPattern = await this.dependencies.data.indexPatterns.get(
      this.getInput().dataset || ''
    );
    if (!indexPattern) {
      return;
    }

    this.searchSource = await this.dependencies.data.search.searchSource.create();
    this.searchSource.setField('index', indexPattern);

    const { filters, query } = this.getInput();

    if (filters) {
      this.searchSource.setField('filter', filters);
    }

    if (query) {
      this.searchSource.setField('query', query);
    }

    this.searchSource.setField('size', this.getInput().pageSize || 500);
  }

  private async fetchData() {
    if (!this.searchSource) {
      return;
    }

    this.updateOutput({ loading: true });

    try {
      const response = await this.searchSource.fetch();
      const rows = response.hits.hits.map((hit: any) => ({
        _id: hit._id,
        ...hit._source,
      }));

      this.updateOutput({
        loading: false,
        rows,
        totalHits: response.hits.total,
      });
    } catch (error) {
      this.updateOutput({
        loading: false,
        rows: [],
        totalHits: 0,
      });
    }
  }
}
