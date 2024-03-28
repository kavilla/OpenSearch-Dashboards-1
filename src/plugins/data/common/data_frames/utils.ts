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

import { SearchResponse } from 'elasticsearch';
import { IDataFrame, IDataFrameWithAggs, PartialDataFrame } from './types';
import { IFieldType } from './fields';

const name = 'data_frame';

export interface IDataFrameResponse extends SearchResponse<any> {
  type: typeof name;
  body: IDataFrame | IDataFrameWithAggs;
  took: number;
}

export const convertResult = (response: IDataFrameResponse): SearchResponse<any> => {
  const data = response.body;
  const hits: any[] = [];
  for (let index = 0; index < data.size; index++) {
    const hit: { [key: string]: any } = {};
    data.fields.forEach((field) => {
      hit[field.name] = field.values[index];
    });
    hits.push({
      _index: data.name ?? '',
      _type: '',
      _id: '',
      _score: 0,
      _source: hit,
    });
  }
  const searchResponse: SearchResponse<any> = {
    took: response.took,
    timed_out: false,
    _shards: {
      total: 1,
      successful: 1,
      skipped: 0,
      failed: 0,
    },
    hits: {
      total: 0,
      max_score: 0,
      hits,
    },
  };

  if (data.hasOwnProperty('aggs')) {
    const dataWithAggs = data as IDataFrameWithAggs;
    if (!dataWithAggs.aggs) {
      // TODO: SQL best guess, get timestamp field and caculate it here
      return searchResponse;
    }
    searchResponse.aggregations = {
      2: {
        buckets: dataWithAggs.aggs.map((agg) => {
          searchResponse.hits.total += agg.value;
          return {
            key: new Date(agg.key).getTime(),
            key_as_string: agg.key,
            doc_count: agg.value,
          };
        }),
      },
    };
  }

  return searchResponse;
};

export const createDataFrame = (partial: PartialDataFrame): IDataFrame | IDataFrameWithAggs => {
  let size = 0;
  const fields = partial.fields.map((field) => {
    if (!field.values) {
      field.values = new Array(size);
    } else if (field.values.length > length) {
      size = field.values.length;
    }
    // if (!field.type) {
    //   field.type = get type
    // }
    // get timeseries field
    return field as IFieldType;
  });

  return {
    ...partial,
    fields,
    size,
  };
};
