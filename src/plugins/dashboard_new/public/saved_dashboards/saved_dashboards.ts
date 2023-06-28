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

import { SavedObjectLoader, SavedObjectOpenSearchDashboardsServices } from '../../../saved_objects/public';
import { createSavedDashboardClass } from './_saved_dashboard';

export type SavedDashboardLoader = ReturnType<typeof createSavedDashboardLoader>;

export function createSavedDashboardLoader(services: SavedObjectOpenSearchDashboardsServices) {
  const SavedDashboard = createSavedDashboardClass(services);
  return new SavedObjectLoader(SavedDashboard, services.savedObjectsClient);
}
