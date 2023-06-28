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

import {
  SavedObject as SavedObjectType
} from 'src/core/public';

export interface DashboardCapabilities {
  showWriteControls: boolean;
  createNew: boolean;
  showSavedQuery: boolean;
  saveQuery: boolean;
  createShortUrl: boolean;
}

export interface DashboardProvider {
  // appId :
  // The appId used to register this Plugin application.
  // This value needs to be repeated here as the 'app' of this plugin
  // is not directly referenced in the details below, and the 'app' object
  // is not linked in the Dashboards List surrounding code.
  appId: string;

  // savedObjectstype :
  // This string should be the SavedObjects 'type' that you
  // have registered for your objects.  This must match the value
  // used by your Plugin's Server setup with `savedObjects.registerType()` call.
  savedObjectsType: string;

  // savedObjectsName :
  // This string should be the display-name that will be used on the
  // Dashboads / Dashboards table in a column named "Type".
  savedObjectsName: string;

  // savedObjectsId : Optional
  // If provided, this string will override the use of the `savedObjectsType`
  // for use with querying the SavedObjects index for your objects.
  // The default value for this string is implicitly set to the `savedObjectsType`
  savedObjectsId?: string;

  // createLinkText :
  // this is the string or Element that will be used to construct the
  // OUI MenuPopup of Create options.
  createLinkText: string | JSX.Element;

  // createSortText :
  // This string will be used in sorting the Create options.  Use
  // the verbatim string here, not any interpolation or function.
  createSortText: string;

  // createUrl :
  // This string should be the url-path for your plugin's Create
  // feature.
  createUrl: string;

  // viewUrlPathFn :
  // This function will be called on every iteratee of your objects
  // while querying the SavedObjects for Dashboards / Dashboards
  // This function should return the url-path to the View page
  // for your Plugin's objects, within the "app" basepath.
  // For instance :
  //   appId = "myplugin"
  //   app.basepath is then "/app/myplugin"
  // then
  //   viewUrlPathFn: (obj) => `#/view/${obj.id}`
  //
  // At onClick of rendered table "view" link for item {id: 'abc123', ...}, the navigated path will be:
  //   "http://../app/myplugin#/view/abc123"
  viewUrlPathFn: (obj: SavedObjectType) => string;

  // editUrlPathFn :
  // This function will be called on every iteratee of your objects
  // while querying the SavedObjects for Dashboards / Dashboards
  // This function should return the url-path to the Edit page
  // for your Plugin's objects, within the "app" basepath.
  // For instance :
  //   appId = "myplugin"
  //   app.basepath is then "/app/myplugin"
  // then
  //   editUrlPathFn: (obj) => `#/edit/${obj.id}`
  //
  // At onClick of rendered table "edit" link for item {id: 'abc123', ...}, the navigated path will be:
  //   "http://../app/myplugin#/edit/abc123"
  editUrlPathFn: (obj: SavedObjectType) => string;
}
