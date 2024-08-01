/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { throwError, timer } from 'rxjs';
import { concatMap, takeWhile, tap, last, catchError } from 'rxjs/operators';

type FetchFunction<T, P = void> = (params?: P) => Promise<T>;

export interface PollingConfigurations {
  tabId: string;
}

interface UsePollingReturn<T> {
  data: T | null;
}

export function usePolling<T, P = void>(
  fetchFunction: FetchFunction<T, P>,
  interval: number = 5000,
  onSuccess: (data: T) => boolean,
  onError: (error: Error) => boolean
): UsePollingReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const unmounted = useRef<boolean>(false);

  useEffect(() => {
    if (!unmounted) {
      timer(interval).pipe(
        concatMap(() => fetchFunction()),
        takeWhile((resp) => onSuccess(resp), true),
        tap((resp: T) => {
          setData(resp);
        }),
        last(),
        catchError((error: Error) => {
          onError(error);
          return throwError(error);
        })
      );
    }
    return () => {
      unmounted.current = true;
    };
  }, [fetchFunction, interval, onError, onSuccess]);

  return { data };
}
