import { AppMountParameters } from "opensearch-dashboards/public";
import { DashboardAppState, DashboardAppStateContainer, DashboardEditorDashboardInstance } from "../types";
import React, { RefObject } from "react";
import { DashboardTopNav } from "./dashboard_top_nav";
import { DashboardContainerEmbeddable } from "../embeddable";

interface DashboardEditorCommonProps {
    dashboardInstance?: DashboardEditorDashboardInstance;
    appState: DashboardAppStateContainer | null;
    currentAppState?: DashboardAppState;
    isChromeVisible: boolean;
    hasUnsavedChanges: boolean;
    setHasUnsavedChanges: (value:boolean) => void;
    //hasUnappliedChanges: boolean;
    isEmbeddableRendered: boolean;
    onAppLeave: AppMountParameters['onAppLeave'],
    dashboardEditorRef: RefObject<HTMLDivElement>,
    //originatingApp?: string;
    //setOriginatingApp?: (originatingApp: string | undefined) => void;
    dashboardIdFromUrl?: string;
    //embeddableId?: string;
    dashboardContainer?: DashboardContainerEmbeddable;
}

export const DashboardEditorCommon = ({
    dashboardInstance,
  appState,
  currentAppState,
  isChromeVisible,
  hasUnsavedChanges,
  setHasUnsavedChanges,
  //hasUnappliedChanges,
  isEmbeddableRendered,
  onAppLeave,
  //originatingApp,
  //setOriginatingApp,
  dashboardIdFromUrl,
  //embeddableId,
  dashboardEditorRef,
  dashboardContainer
}:DashboardEditorCommonProps) => {
    return (
        <div className={`app-container dashboardEditor dashboardEditor--${dashboardInstance?.dashboard.title}`}>
      {dashboardInstance && appState && dashboardContainer && currentAppState && (
        <DashboardTopNav
          currentAppState={currentAppState}
          hasUnsavedChanges={hasUnsavedChanges}
          setHasUnsavedChanges={setHasUnsavedChanges}
          isChromeVisible={isChromeVisible}
          isEmbeddableRendered={isEmbeddableRendered}
          //hasUnappliedChanges={hasUnappliedChanges}
          //originatingApp={originatingApp}
          //setOriginatingApp={setOriginatingApp}
          dashboardInstance={dashboardInstance}
          stateContainer={appState}
          dashboardIdFromUrl={dashboardIdFromUrl}
          //embeddableId={embeddableId}
          onAppLeave={onAppLeave}
          dashboardContainer={dashboardContainer}
        />
      )}
       <div className={isChromeVisible ? 'dashboardEditor__content' : 'dashboardNew'} ref={dashboardEditorRef} />
      </div>
    )
}