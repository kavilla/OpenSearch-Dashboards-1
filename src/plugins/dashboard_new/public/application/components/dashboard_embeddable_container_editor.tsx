import React, { useEffect, useRef } from "react";
import EventEmitter from 'events';
import { DashboardEmbeddableContainerEditorRenderProps, DashboardEmbeddableContract } from '../types';
import { Dashboard } from "../../dashboard";

export const DashboardEmbeddableContainerEditor = ({
    timeRange,
    filters,
    query,
    dashboard,
    eventEmitter,
    embeddableHandler
}: DashboardEmbeddableContainerEditorRenderProps & {
    dashboard: Dashboard,
    eventEmitter: EventEmitter,
    embeddableHandler: DashboardEmbeddableContract
}) => {
    const dashboardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!dashboardRef.current) {
          return;
        }
    
        embeddableHandler.render(dashboardRef.current);
        setTimeout(() => {
          eventEmitter.emit('embeddableRendered');
        });
    
        return () => embeddableHandler.destroy();
    }, [embeddableHandler, eventEmitter]);
    
    useEffect(() => {
        embeddableHandler.updateInput({
          timeRange,
          filters,
          query,
        });
    }, [embeddableHandler, timeRange, filters, query]);

      return (
        <div className="dashboardEditor" ref={dashboardRef}/>
      )
} 