"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Camera,
  CheckCircle2,
  Compass,
  Loader2,
  MapPin,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type SubmitEvent, useState } from "react";
import { CATEGORY_LABELS, SEVERITY_CONFIG } from "@/lib/constants";

interface SubmissionResponse {
  success: boolean;
  message: string;
  triageSummary?: string;
  data: {
    id: string;
    title: string;
    category: string;
    severity: string;
    urgencyScore: number;
    responsibleOrgan: string;
    status: string;
    address: string;
  };
}

export default function NovoChamadoPage() {
  // Estados do Formulário
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState<number>(-23.5505);
  const [longitude, setLongitude] = useState<number>(-46.6333);
  const [address, setAddress] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Estados de Operação e IA
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] =
    useState<SubmissionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Captura de Geolocalização pelo navegador do munícipe
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada pelo seu navegador.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);

        // Busca reversa de endereço via Nominatim da OpenStreetMap
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          );
          const data = await res.json();
          if (data?.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(`Coordenadas: ${lat}, ${lng}`);
          }
        } catch {
          setAddress(`GPS: ${lat}, ${lng}`);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.warn("Erro ao obter GPS:", error);
        setIsLocating(false);
        alert(
          "Não foi possível obter sua localização exata. Você pode preencher as coordenadas manualmente.",
        );
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  // Upload/Simulação de Foto
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Envio e Processamento com IA
  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (title.trim().length < 5) {
      setErrorMessage("O título precisa ter no mínimo 5 caracteres.");
      return;
    }
    if (description.trim().length < 15) {
      setErrorMessage("A descrição precisa ter no mínimo 15 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          latitude,
          longitude,
          address: address.trim() || undefined,
          imageUrl: imagePreview || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao processar chamado.");
      }

      setSubmissionSuccess(data);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Erro de conexão ao enviar o chamado.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
      {/* Botão Voltar */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Mapa Geral
      </Link>

      {/* Caso de Sucesso: Apresenta o resultado da Triagem da IA */}
      {submissionSuccess ? (
        <div
          role="status"
          aria-live="polite"
          tabIndex={-1}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200 focus:outline-hidden"
        >
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Ocorrência Protocolada com Sucesso!
              </h2>
              <p className="text-xs text-slate-500">
                Protocolo #{submissionSuccess.data?.id}
              </p>
            </div>
          </div>

          {/* Card de Análise da IA */}
          <div className="bg-linear-to-br from-blue-50 to-indigo-50/50 dark:from-slate-800/60 dark:to-indigo-950/30 p-5 rounded-xl border border-blue-200/60 dark:border-blue-900/40 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              <Sparkles
                className="w-4 h-4 text-blue-600 animate-pulse"
                aria-hidden="true"
              />
              Triagem Automatizada por Google Gemini
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 block mb-1">
                  Categoria Classificada:
                </span>
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                  {CATEGORY_LABELS[submissionSuccess.data?.category] ||
                    submissionSuccess.data?.category}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block mb-1">
                  Severidade Estimada:
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    SEVERITY_CONFIG[submissionSuccess.data?.severity]
                      ?.badgeClass
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                  {SEVERITY_CONFIG[submissionSuccess.data?.severity]?.label}{" "}
                  (Grau {submissionSuccess.data?.urgencyScore}/5)
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-xs text-slate-500 block mb-1">
                  Órgão Público Despachado:
                </span>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium text-sm">
                  <Building2
                    className="w-4 h-4 text-blue-600"
                    aria-hidden="true"
                  />
                  <span>{submissionSuccess.data?.responsibleOrgan}</span>
                </div>
              </div>

              {submissionSuccess.triageSummary && (
                <div className="sm:col-span-2 bg-white/70 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
                  <strong>Justificativa da Auditoria IA:</strong>{" "}
                  {submissionSuccess.triageSummary}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-colors"
            >
              <MapPin className="w-4 h-4" aria-hidden="true" />
              Acompanhar no Mapa Geral
            </Link>
            <button
              type="button"
              onClick={() => {
                setSubmissionSuccess(null);
                setTitle("");
                setDescription("");
                setImagePreview(null);
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Registrar Outro Chamado
            </button>
          </div>
        </div>
      ) : (
        /* Formulário de Abertura */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Relatar Problema Urbano
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Descreva com suas próprias palavras. O motor de Inteligência
              Artificial analisará a gravidade, definirá a urgência e notificará
              o órgão responsável.
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate={false}
          >
            {/* Título */}
            <div>
              <label
                htmlFor="report-title"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Título do Chamado <span aria-hidden="true">*</span>
              </label>
              <input
                id="report-title"
                type="text"
                required
                aria-required="true"
                aria-describedby="title-hint"
                aria-invalid={Boolean(errorMessage && title.trim().length < 5)}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Árvore caída interditando fiação e rua"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
              />
              <span
                id="title-hint"
                className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block"
              >
                Mínimo 5 caracteres ({title.length}/100)
              </span>
            </div>

            {/* Descrição Detalhada */}
            <div>
              <label
                htmlFor="report-description"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Descrição Detalhada do Fato <span aria-hidden="true">*</span>
              </label>
              <textarea
                id="report-description"
                required
                aria-required="true"
                aria-describedby="description-hint"
                aria-invalid={Boolean(
                  errorMessage && description.trim().length < 15,
                )}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Caiu um galho imenso durante a chuva forte, arrebentou cabos elétricos com faíscas no asfalto e ninguém passa na rua..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 resize-none"
              />
              <div
                id="description-hint"
                className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1"
              >
                <span>
                  A IA utiliza este texto para classificar e mensurar o risco.
                </span>
                <span>{description.length} caracteres (mínimo 15)</span>
              </div>
            </div>

            {/* Seção de Geolocalização */}
            <fieldset className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <legend className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 px-0.5">
                  <MapPin
                    className="w-4 h-4 text-blue-600"
                    aria-hidden="true"
                  />
                  Localização da Ocorrência
                </legend>

                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  aria-busy={isLocating}
                  aria-label="Capturar minha localização atual através do GPS"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  {isLocating ? (
                    <>
                      <Loader2
                        className="w-3.5 h-3.5 animate-spin"
                        aria-hidden="true"
                      />
                      Capturando GPS...
                    </>
                  ) : (
                    <>
                      <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                      Usar Minha Localização Atual
                    </>
                  )}
                </button>
              </div>

              {/* Mensagem falada para leitores de tela em tempo real */}
              <div className="sr-only" aria-live="polite">
                {isLocating
                  ? "Obtendo coordenadas de GPS do dispositivo..."
                  : ""}
              </div>

              <div>
                <label
                  htmlFor="report-address"
                  className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1"
                >
                  Endereço ou ponto de referência:
                </label>
                <input
                  id="report-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Alameda Santos, 1200 ou cruzamento com Av. Paulista"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="report-latitude"
                    className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1"
                  >
                    Latitude:
                  </label>
                  <input
                    id="report-latitude"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label
                    htmlFor="report-longitude"
                    className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1"
                  >
                    Longitude:
                  </label>
                  <input
                    id="report-longitude"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </fieldset>

            {/* Upload de Foto (Opcional) */}
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-slate-500" aria-hidden="true" />
                Foto da Ocorrência (Opcional)
              </span>

              <div className="flex items-center gap-4">
                <label
                  htmlFor="report-file-photo"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Camera
                    className="w-4 h-4 text-blue-500"
                    aria-hidden="true"
                  />
                  <span>Selecionar Imagem</span>
                  <input
                    id="report-file-photo"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>

                {imagePreview && (
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-300">
                    <Image
                      src={imagePreview}
                      alt="Pré-visualização da foto anexada para o chamado"
                      width={56}
                      height={56}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      aria-label="Remover foto anexada"
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-bl p-1 text-[10px] leading-none hover:bg-red-700 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Botão de Envio com Estado de IA */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 active:scale-[0.99] disabled:opacity-70 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="w-5 h-5 animate-spin"
                      aria-hidden="true"
                    />
                    <span>
                      IA analisando gravidade e despachando protocolo...
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" aria-hidden="true" />
                    <span>Enviar Relato para Triagem Automática</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
