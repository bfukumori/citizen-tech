"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import {
  CATEGORY_LABELS,
  SEVERITY_CONFIG,
  STATUS_CONFIG,
} from "@/lib/constants";

export interface ReportItem {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  urgencyScore: number;
  responsibleOrgan: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  imageUrl?: string | null;
  status: string;
  createdAt: string | Date;
  _count?: {
    votes: number;
  };
}

interface CitizenMapProps {
  reports: ReportItem[];
  selectedReportId?: string | null;
  onSelectReport?: (report: ReportItem) => void;
  onOpenDetails?: (report: ReportItem) => void;
  center?: [number, number];
  zoom?: number;
}

const DEFAULT_CENTER: [number, number] = [-23.555, -46.645];

export default function CitizenMap({
  reports,
  selectedReportId,
  onSelectReport,
  onOpenDetails,
  center = DEFAULT_CENTER, // Padrão São Paulo
  zoom = 13,
}: CitizenMapProps) {
  const [centerLat, centerLng] = center;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Refs para manter callbacks sempre atualizados sem disparar recriação de marcadores
  const onSelectReportRef = useRef(onSelectReport);
  const onOpenDetailsRef = useRef(onOpenDetails);
  const reportsRef = useRef(reports);

  useEffect(() => {
    onSelectReportRef.current = onSelectReport;
    onOpenDetailsRef.current = onOpenDetails;
    reportsRef.current = reports;
  });

  // Handler global acessível pelo HTML inline do popup
  useEffect(() => {
    const handler = (id: string, ev?: Event) => {
      if (ev) {
        ev.stopPropagation();
        if (ev.preventDefault) ev.preventDefault();
      }
      const target = reportsRef.current.find((r) => r.id === id);
      if (target) {
        onSelectReportRef.current?.(target);
        onOpenDetailsRef.current?.(target);
      }
    };

    (
      window as unknown as {
        __openCitizenReportDetails?: typeof handler;
      }
    ).__openCitizenReportDetails = handler;

    return () => {
      delete (
        window as unknown as {
          __openCitizenReportDetails?: typeof handler;
        }
      ).__openCitizenReportDetails;
    };
  }, []);

  // Inicialização do Mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom,
        zoomControl: false,
      });

      // Controles de zoom no canto superior direito
      L.control.zoom({ position: "topright" }).addTo(map);

      // Camada de Tiles OpenStreetMap com atribuição limpa
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Delegado de evento no popup aberto
      map.on("popupopen", (e) => {
        const popupEl = e.popup.getElement();
        if (!popupEl) return;
        const btn = popupEl.querySelector<HTMLButtonElement>(
          "button[data-report-id]",
        );
        if (btn) {
          L.DomEvent.disableClickPropagation(btn);
          L.DomEvent.disableScrollPropagation(btn);
          btn.onclick = (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            const id = btn.getAttribute("data-report-id");
            const target = reportsRef.current.find((r) => r.id === id);
            if (target) {
              onSelectReportRef.current?.(target);
              onOpenDetailsRef.current?.(target);
            }
          };
        }
      });

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centerLat, centerLng, zoom]);

  // Atualização dos Marcadores quando reports mudar
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    markerMapRef.current.clear();

    reports.forEach((report) => {
      const sevConfig = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.LOW;
      const catLabel = CATEGORY_LABELS[report.category] || report.category;
      const statusInfo = STATUS_CONFIG[report.status] || {
        label: report.status,
      };
      const votes = report._count?.votes ?? 0;

      // Marcador circular estilizado com a cor da severidade
      const customIcon = L.divIcon({
        className: "custom-leaflet-marker-wrapper",
        html: `
          <div style="
            background-color: ${sevConfig.markerColor};
            width: 34px;
            height: 34px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 13px;
            font-weight: 700;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            ${report.urgencyScore}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([report.latitude, report.longitude], {
        icon: customIcon,
      });

      const popupHtml = `
        <div style="font-family: inherit; min-width: 230px; max-width: 280px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              padding: 2px 6px;
              border-radius: 4px;
              background-color: ${sevConfig.markerColor};
              color: white;
            ">
              ${sevConfig.label} (Urgência ${report.urgencyScore}/5)
            </span>
            <span style="font-size: 11px; color: #64748b; font-weight: 600;">
              ${statusInfo.label}
            </span>
          </div>
          <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.3;">
            ${report.title}
          </h4>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #475569; max-height: 60px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
            ${report.description}
          </p>
          <div style="font-size: 11px; color: #334155; margin-bottom: 4px;">
            <strong>Categoria:</strong> ${catLabel}
          </div>
          <div style="font-size: 11px; color: #334155; margin-bottom: 8px;">
            <strong>Destino:</strong> ${report.responsibleOrgan}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 6px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
            <span>👥 ${votes} apoios</span>
            <button
              id="btn-popup-details-${report.id}"
              data-report-id="${report.id}"
              type="button"
              onclick="window.__openCitizenReportDetails && window.__openCitizenReportDetails('${report.id}', event)"
              aria-label="Abrir detalhes completos da ocorrência"
              style="cursor: pointer; background: #2563eb; color: #ffffff; border: none; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;"
            >
              Detalhes →
            </button>
          </div>
        </div>
      `;

      // Criar nó DOM para associar eventos nativos do Leaflet diretamente
      const popupContainer = document.createElement("div");
      popupContainer.innerHTML = popupHtml;

      const btn = popupContainer.querySelector<HTMLButtonElement>(
        `#btn-popup-details-${report.id}`,
      );
      if (btn) {
        L.DomEvent.disableClickPropagation(btn);
        L.DomEvent.disableScrollPropagation(btn);
        L.DomEvent.on(btn, "click", (e) => {
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);
          onSelectReportRef.current?.(report);
          onOpenDetailsRef.current?.(report);
        });
      }

      marker.bindPopup(popupContainer);

      marker.on("click", () => {
        onSelectReportRef.current?.(report);
      });

      markersGroup.addLayer(marker);
      markerMapRef.current.set(report.id, marker);
    });
  }, [reports]);

  // Centraliza e abre o popup quando o chamado selecionado mudar (sem destruir os marcadores)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedReportId) return;

    const marker = markerMapRef.current.get(selectedReportId);
    if (marker) {
      const latLng = marker.getLatLng();
      map.setView(latLng, Math.max(map.getZoom(), 15), { animate: true });
      marker.openPopup();
    }
  }, [selectedReportId]);

  return (
    <div className="relative w-full h-full min-h-105 rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      {/* Legenda Flutuante de Cores */}
      <aside
        aria-label="Legenda de severidade da inteligência artificial"
        className="absolute bottom-4 left-4 z-400 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg text-xs space-y-1"
      >
        <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
          <span>Legenda de Severidade (IA)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-full bg-red-600"
              aria-hidden="true"
            />
            <span className="text-slate-600 dark:text-slate-400">Crítico</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-full bg-orange-600"
              aria-hidden="true"
            />
            <span className="text-slate-600 dark:text-slate-400">Alto</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-full bg-amber-600"
              aria-hidden="true"
            />
            <span className="text-slate-600 dark:text-slate-400">Médio</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-full bg-emerald-600"
              aria-hidden="true"
            />
            <span className="text-slate-600 dark:text-slate-400">Baixo</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
