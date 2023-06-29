

import { Vis } from '../types';
import {
  VisualizeInput,
  VisualizeEmbeddable,
  VisualizeByValueInput,
  VisualizeByReferenceInput,
  DashboardContainerEmbeddableSavedObjectAttributes,
} from './dashboard_container_embeddable';
import { IContainer, ErrorEmbeddable } from '../../../embeddable/public';
import {
  getSavedVisualizationsLoader,
  getUISettings,
  getHttp,
  getTimeFilter,
  getCapabilities,
} from '../services';
import { DashboardContainerEmbeddableFactoryDeps, StartServices } from './dashboard_container_embeddable_factory';
import { IndexPattern } from '../../../data/public';
import { DashboardContainerEmbeddable } from './dashboard_container_embeddable';
import { SavedDashboardsLoader, SavedObjectDashboard } from '../../saved_dashboards';

export const createDashboardContainerEmbeddableFromObject = (deps: DashboardContainerEmbeddableFactoryDeps) => async (
  savedDashboard: SavedObjectDashboard,
  input: Partial<DashboardInput> & { id: string },
  savedDashboardLoader?: SavedDashboardsLoader,
): Promise<DashboardContainerEmbeddable | ErrorEmbeddable > => {
  const savedVisualizations = getSavedVisualizationsLoader();
  const { data } = deps;

  try {
    const dashboardId = savedDashboard.id as string;

    //const editPath = visId ? savedVisualizations.urlFor(visId) : '#/edit_by_value';

    const editUrl = visId
      ? getHttp().basePath.prepend(`/app/dashboardsNew${savedVisualizations.urlFor(visId)}`)
      : '';


      // Do not need to pass in index patterns into container embeddable
    // let indexPatterns: IndexPattern[] = [];

    // if (vis.type.getUsedIndexPattern) {
    //   indexPatterns = await vis.type.getUsedIndexPattern(vis.params);
    // } else if (vis.data.indexPattern) {
    //   indexPatterns = [vis.data.indexPattern];
    // }

    const editable = getCapabilities().visualize.save as boolean;

    return new DashboardContainerEmbeddable(
      {
        savedDashboard: savedDashboard,
        id: savedDashboard.id,
        filters: data.query.filterManager.getFilters(),
        hidePanelTitles: savedDashboard.dashboard.options.hidePanelTitles,
        query: data.query.queryString.getQuery(),
      timeRange: data.query.timefilter.timefilter.getTime(),
      refreshConfig: data.query.timefilter.timefilter.getRefreshInterval(),
      viewMode: appStateData.viewMode,
      panels: embeddablesMap,
      isFullScreenMode: appStateData.fullScreenMode,
      isEmbeddedExternally: false, // TODO
      isEmptyState:
        getShouldShowEditHelp(appStateData) ||
        getShouldShowViewHelp(appStateData) ||
        shouldShowUnauthorizedEmptyState(appStateData),
      useMargins: appStateData.options.useMargins,
      lastReloadRequestTime, // TODO
      title: appStateData.title,
      description: appStateData.description,
      expandedPanelId: appStateData.expandedPanelId,
      }, {

      }: 

      // getTimeFilter(),
      // {
      //   vis,
      //   indexPatterns,
      //   editPath,
      //   editUrl,
      //   editable,
      //   deps,
      // },
      // input,
      // attributeService,
      // savedDashboardLoader,
    );

  } catch (e) {
    console.error(e); // eslint-disable-line no-console
    return new ErrorEmbeddable(e, input, parent);
  }
};
