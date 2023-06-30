import React, { useEffect, useRef, useState, useCallback } from 'react';
import EventEmitter from "events";
import { Dashboard } from "../../dashboard";
import { DashboardEmbeddableContract } from "../types";
import { unmountComponentAtNode } from "react-dom";
import { useRef } from "react";

class DashboardEditorController {
    constructor(
        private el: HTMLElement,
        private dashboard: Dashboard,
        private eventEmitter: EventEmitter,
        private embeddableHandler: DashboardEmbeddableContract
      ) {}

      const dashboardRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        if (!dashboardRef.current) {
          return;
        }
    
        embeddableHandler.render(visRef.current);
        setTimeout(() => {
          eventEmitter.emit('embeddableRendered');
        });
    
        return () => embeddableHandler.destroy();
      }, [embeddableHandler, eventEmitter]);

    render() {

    }

    destroy() {
        unmountComponentAtNode(this.el);
    }
}

export { DashboardEditorController }