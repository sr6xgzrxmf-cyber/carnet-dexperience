"use client";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";

const BACKGROUND_PATH = "/attestations/attestation-bg.png";

const defaultData = {
  numeroFranceTravail: "10174243440",
  civility: "M.",
  lastName: "GUYONNET",
  firstName: "LAURENT",
  address1: "392 CHEMIN DE LA MOLLAS",
  address2: "38150 AGNIN",
  referenceLabel: "References a rappeler",
  identNumber: "8191049P",
  city: "ROUSSILLON",
  pivotDate: "2026-02-01",
  contactLabel: "Votre contact en direct",
  contactEmail: "024marion.sorba@francetravail.net",
  subject: "Objet : Attestation",
  admissionLabel: "ALLOCATION D'AIDE AU RETOUR A L'EMPLOI",
  paidDays: "11",
  remainingDays: "537",
  closingLine:
    "Cette attestation authentifie votre situation au regard de France Travail. Elle est realisee au vu des elements connus a ce jour, et ne saurait etre utilisee a d'autres fins.",
  politeClosing:
    "Nous vous prions d'agreer, {CLOSING_NAME}, nos salutations distinguees.",
  directorLine: "Le Directeur de l'agence",
};

function getSubjectParts(subject: string) {
  const idx = subject.indexOf(":");
  if (idx === -1) {
    return { label: "Objet :", value: subject.trim() };
  }
  return {
    label: `${subject.slice(0, idx).trim()}:`,
    value: subject.slice(idx + 1).trim(),
  };
}

const MONTHS_FR = [
  "janvier",
  "fevrier",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "aout",
  "septembre",
  "octobre",
  "novembre",
  "decembre",
] as const;

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MM_TO_PX = 96 / 25.4;
const A4_WIDTH_PX = A4_WIDTH_MM * MM_TO_PX;
const A4_HEIGHT_PX = A4_HEIGHT_MM * MM_TO_PX;

function formatDateFR(date: Date): string {
  const d = date.getDate();
  const m = MONTHS_FR[date.getMonth()];
  const y = date.getFullYear();
  const day = d === 1 ? "1er" : String(d);
  return `${day} ${m} ${y}`;
}

function formatDateFR2digits(date: Date): string {
  const d = date.getDate();
  const dd = String(d).padStart(2, "0");
  const m = MONTHS_FR[date.getMonth()];
  const y = date.getFullYear();
  return `${dd} ${m} ${y}`;
}

function toPivotDate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function addMonths(base: Date, delta: number): Date {
  return new Date(base.getFullYear(), base.getMonth() + delta, base.getDate());
}

function endOfMonth(base: Date): Date {
  return new Date(base.getFullYear(), base.getMonth() + 1, 0);
}

function dateWithDay(base: Date, day: number): Date {
  return new Date(base.getFullYear(), base.getMonth(), day);
}

export default function AttestationBuilderPage() {
  const [data, setData] = useState(defaultData);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [modalScale, setModalScale] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [isChromeHidden, setIsChromeHidden] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const captureRef = useRef<HTMLDivElement | null>(null);
  const lastTapRef = useRef<number>(0);
  const toastTimeoutRef = useRef<number | null>(null);

  const salutationWord = useMemo(
    () => (data.civility === "Mme" ? "Madame" : "Monsieur"),
    [data.civility]
  );

  const fullName = useMemo(
    () => `${data.civility} ${data.lastName} ${data.firstName}`.trim(),
    [data.civility, data.lastName, data.firstName]
  );

  const closingName = useMemo(
    () => `${salutationWord} ${data.lastName}`.trim(),
    [salutationWord, data.lastName]
  );

  const subjectParts = useMemo(() => getSubjectParts(data.subject), [data.subject]);

  const derivedDates = useMemo(() => {
    const pivot = toPivotDate(data.pivotDate);
    if (!pivot) {
      return {
        letterDate: "",
        admissionDate: "",
        situationDate: "",
        contractEndDate: "",
        registrationDate: "",
      };
    }

    const monthMinus1 = addMonths(pivot, -1);
    const monthMinus2 = addMonths(pivot, -2);

    return {
      letterDate: formatDateFR(pivot),
      admissionDate: formatDateFR2digits(dateWithDay(monthMinus1, 1)),
      situationDate: formatDateFR(endOfMonth(monthMinus1)),
      contractEndDate: formatDateFR(dateWithDay(monthMinus2, 12)),
      registrationDate: formatDateFR(dateWithDay(monthMinus2, 20)),
    };
  }, [data.pivotDate]);

  const bodyText = useMemo(
    () => ({
      intro:
        `France Travail certifie que vous avez ete admis au benefice de ${data.admissionLabel} ` +
        `en date du ${derivedDates.admissionDate} apres la fin de votre contrat de travail du ${derivedDates.contractEndDate}.`,
      paid:
        `Au ${derivedDates.situationDate}, vous avez beneficie de ${data.paidDays} allocations journalieres.`,
      remaining:
        `Vous pourrez eventuellement pretendre a ${data.remainingDays} allocations journalieres.`,
      registration:
        `Vous etes inscrit sur la liste des demandeurs d'emploi en categorie 1 depuis le ${derivedDates.registrationDate}.`,
    }),
    [
      data.admissionLabel,
      data.paidDays,
      data.remainingDays,
      derivedDates.admissionDate,
      derivedDates.contractEndDate,
      derivedDates.situationDate,
      derivedDates.registrationDate,
    ]
  );

  function update<K extends keyof typeof defaultData>(key: K, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function showToast(message: string) {
    setToastMessage(message);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 2200);
  }

  async function getImageBlob(): Promise<Blob> {
    if (!captureRef.current) {
      throw new Error("Aucun contenu a capturer.");
    }
    setIsExporting(true);
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });
      return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Impossible de creer l'image."));
            return;
          }
          resolve(blob);
        }, "image/png");
      });
    } finally {
      setIsExporting(false);
    }
  }

  async function blobToDataURL(blob: Blob): Promise<string> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Impossible de lire le fichier."));
      reader.readAsDataURL(blob);
    });
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleDownloadImage() {
    try {
      const blob = await getImageBlob();
      const file = new File([blob], "attestation.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Attestation",
          text: "Attestation France Travail",
          files: [file],
        });
        showToast("Partage ouvert.");
        return;
      }
      downloadBlob(blob, "attestation.png");
      showToast("Telechargement lance.");
    } catch {
      showToast("Export impossible.");
    }
  }

  async function handleDownloadPdf() {
    try {
      const imageBlob = await getImageBlob();
      const imageData = await blobToDataURL(imageBlob);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(imageData, "PNG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
      const pdfBlob = pdf.output("blob");
      downloadBlob(pdfBlob, "attestation.pdf");
      showToast("PDF enregistre.");
    } catch {
      showToast("PDF impossible.");
    }
  }

  async function handleSharePdf() {
    try {
      const imageBlob = await getImageBlob();
      const imageData = await blobToDataURL(imageBlob);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(imageData, "PNG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], "attestation.pdf", { type: "application/pdf" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Attestation",
          text: "Attestation France Travail",
          files: [file],
        });
        showToast("Partage ouvert.");
      } else {
        downloadBlob(pdfBlob, "attestation.pdf");
        showToast("PDF enregistre.");
      }
    } catch {
      showToast("Partage impossible.");
    }
  }

  function handleOverlayTap(event?: TouchEvent<HTMLDivElement>) {
    const now = Date.now();
    const elapsed = now - lastTapRef.current;
    lastTapRef.current = now;
    if (elapsed < 280) {
      event?.preventDefault();
      setIsChromeHidden((prev) => !prev);
    }
  }

  function handleOverlayBackgroundClick() {
    if (isChromeHidden) {
      setIsChromeHidden(false);
      return;
    }
    setIsPreviewOpen(false);
  }

  useEffect(() => {
    const computeScale = (el: HTMLDivElement | null) => {
      if (!el) return 1;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return 1;
      const scale = Math.min(rect.width / A4_WIDTH_PX, rect.height / A4_HEIGHT_PX);
      return Math.min(scale, 1);
    };

    const updateScales = () => {
      setPreviewScale(computeScale(previewRef.current));
      setModalScale(computeScale(modalRef.current));
    };

    const ro = new ResizeObserver(updateScales);
    if (previewRef.current) ro.observe(previewRef.current);
    if (modalRef.current) ro.observe(modalRef.current);
    updateScales();

    return () => ro.disconnect();
  }, [isPreviewOpen]);

  useEffect(() => {
    if (!isPreviewOpen) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isPreviewOpen]);

  useEffect(() => {
    if (!isPreviewOpen) {
      setIsChromeHidden(false);
    }
  }, [isPreviewOpen]);

  const previewTransform = `translate(-50%, -50%) scale(${previewScale})`;
  const modalTransform = `translate(-50%, -50%) scale(${modalScale})`;

  const attestationContent = (
    <>
      <Image
        src={BACKGROUND_PATH}
        alt=""
        aria-hidden
        fill
        unoptimized
        priority
        sizes="100vw"
        className="attestation-bg"
      />

      <p className="field-ft-number">
        <span className="font-semibold">Numero France Travail</span>{" "}
        {data.numeroFranceTravail}
      </p>

      <div className="field-recipient font-courier">
        <div>{fullName}</div>
        <div>{data.address1}</div>
        <div>{data.address2}</div>
      </div>

      <p className="field-ref-title font-semibold">{data.referenceLabel}</p>
      <p className="field-ref-number">
        numero identifiant <span className="font-semibold">{data.identNumber}</span>
      </p>

      <p className="field-date">{`${data.city}, le ${derivedDates.letterDate}`}</p>

      <p className="field-contact-title font-semibold">{data.contactLabel}</p>
      <p className="field-contact-email font-courier">{data.contactEmail}</p>

      <p className="field-subject">
        <span>{subjectParts.label}</span>{" "}
        <span className="font-semibold">{subjectParts.value}</span>
      </p>

      <p className="field-salutation">{`${salutationWord} ${data.lastName},`}</p>

      <div className="field-body">
        <p>{bodyText.intro}</p>
        <p>{bodyText.paid}</p>
        <p>{bodyText.remaining}</p>
        <p>{bodyText.registration}</p>
        <p>{data.closingLine}</p>
        <p>{data.politeClosing.split("{CLOSING_NAME}").join(closingName)}</p>
      </div>

      <p className="field-director">{data.directorLine}</p>
    </>
  );

  return (
    <div className="attestation-app min-h-screen bg-neutral-100 px-4 py-8 text-neutral-900 print:bg-white print:p-0">
      <div className="attestation-shell mx-auto w-full max-w-[1400px] space-y-6 print:max-w-none print:space-y-0">
        <header className="space-y-2 print:hidden">
          <h1 className="text-2xl font-semibold">Attestation - Generateur PDF</h1>
          <p className="text-sm text-neutral-600">
            Le fond est charge depuis <code>{BACKGROUND_PATH}</code>. Modifie les infos puis
            clique sur <strong>Imprimer / PDF</strong>.
          </p>
          <p className="text-xs text-neutral-500">
            Reglages impression recommandes: format A4, marges Aucune, echelle 100%, en-tetes/pieds desactives.
          </p>
        </header>

        <div className="attestation-layout grid gap-6 xl:grid-cols-[430px_1fr] print:block">
          <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm print:hidden">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Informations
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Imprimer / PDF
              </button>
              <button
                type="button"
                onClick={() => setData(defaultData)}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                Reinitialiser
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field
                label="Date pivot (AAAA-MM-JJ)"
                value={data.pivotDate}
                onChange={(v) => update("pivotDate", v)}
                type="date"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field
                label="Numero France Travail"
                value={data.numeroFranceTravail}
                onChange={(v) => update("numeroFranceTravail", v)}
              />
              <Field
                label="Civilite (M. / Mme)"
                value={data.civility}
                onChange={(v) => update("civility", v as "M." | "Mme")}
                type="select"
                options={[
                  { label: "M.", value: "M." },
                  { label: "Mme", value: "Mme" },
                ]}
              />
              <Field
                label="Nom de famille"
                value={data.lastName}
                onChange={(v) => update("lastName", v)}
              />
              <Field
                label="Prenom"
                value={data.firstName}
                onChange={(v) => update("firstName", v)}
              />
              <Field
                label="Adresse ligne 1"
                value={data.address1}
                onChange={(v) => update("address1", v)}
              />
              <Field
                label="Adresse ligne 2"
                value={data.address2}
                onChange={(v) => update("address2", v)}
              />
              <Field label="Ville" value={data.city} onChange={(v) => update("city", v)} />
              <Field
                label="Date de la lettre"
                value={derivedDates.letterDate}
                onChange={() => {}}
                disabled
              />
              <Field
                label="Contact (email)"
                value={data.contactEmail}
                onChange={(v) => update("contactEmail", v)}
              />
              <Field
                label="Numero identifiant"
                value={data.identNumber}
                onChange={(v) => update("identNumber", v)}
              />
              <Field
                label="Objet"
                value={data.subject}
                onChange={(v) => update("subject", v)}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field
                label="Admission (libelle)"
                value={data.admissionLabel}
                onChange={(v) => update("admissionLabel", v)}
              />
              <Field
                label="Date admission"
                value={derivedDates.admissionDate}
                onChange={() => {}}
                disabled
              />
              <Field
                label="Fin contrat"
                value={derivedDates.contractEndDate}
                onChange={() => {}}
                disabled
              />
              <Field
                label="Date situation"
                value={derivedDates.situationDate}
                onChange={() => {}}
                disabled
              />
              <Field
                label="Allocations versees"
                value={data.paidDays}
                onChange={(v) => update("paidDays", v)}
              />
              <Field
                label="Allocations restantes"
                value={data.remainingDays}
                onChange={(v) => update("remainingDays", v)}
              />
              <Field
                label="Inscription depuis"
                value={derivedDates.registrationDate}
                onChange={() => {}}
                disabled
              />
            </div>

            <div className="grid gap-3">
              <Field
                label="Titre references"
                value={data.referenceLabel}
                onChange={(v) => update("referenceLabel", v)}
              />
              <Field
                label="Titre contact"
                value={data.contactLabel}
                onChange={(v) => update("contactLabel", v)}
              />
              <TextArea
                label="Phrase de certification"
                value={data.closingLine}
                onChange={(v) => update("closingLine", v)}
              />
              <TextArea
                label="Formule de politesse"
                value={data.politeClosing}
                onChange={(v) => update("politeClosing", v)}
              />
              <Field
                label="Signature"
                value={data.directorLine}
                onChange={(v) => update("directorLine", v)}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Imprimer / PDF
              </button>
              <button
                type="button"
                onClick={() => setData(defaultData)}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                Reinitialiser
              </button>
            </div>
          </section>

          <section className="attestation-sheet-wrap overflow-auto rounded-2xl border border-neutral-200 bg-neutral-200/40 p-4 print:overflow-visible print:border-0 print:bg-white print:p-0">
            <button
              type="button"
              className="attestation-preview-trigger"
              onClick={() => setIsPreviewOpen(true)}
            >
              <div ref={previewRef} className="attestation-preview-frame">
                <article
                  className="attestation-page"
                  style={{
                    width: A4_WIDTH_PX,
                    height: A4_HEIGHT_PX,
                    transform: previewTransform,
                  }}
                >
                  {attestationContent}
                </article>
              </div>
            </button>
          </section>
        </div>
      </div>

      <div className="attestation-capture" aria-hidden>
        <article
          ref={captureRef}
          className="attestation-page attestation-capture-page"
          style={{ width: A4_WIDTH_PX, height: A4_HEIGHT_PX }}
        >
          {attestationContent}
        </article>
      </div>

      {isPreviewOpen ? (
        <div
          className={`attestation-modal${isChromeHidden ? " is-clean" : ""}`}
          role="dialog"
          aria-modal="true"
          onClick={handleOverlayBackgroundClick}
        >
          <div className="attestation-modal-header" onClick={(e) => e.stopPropagation()}>
            <div className="attestation-modal-actions">
              <button
                type="button"
                onClick={handleSharePdf}
                disabled={isExporting}
                className="attestation-modal-action"
              >
                Partager
              </button>
              <button
                type="button"
                onClick={handleDownloadImage}
                disabled={isExporting}
                className="attestation-modal-action"
              >
                Photo
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExporting}
                className="attestation-modal-action"
              >
                PDF
              </button>
            </div>
            <button
              type="button"
              className="attestation-modal-close"
              onClick={() => setIsPreviewOpen(false)}
              aria-label="Fermer l'aperçu"
            >
              Fermer
            </button>
          </div>
          <div
            className="attestation-modal-page"
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={() => setIsChromeHidden((prev) => !prev)}
            onTouchEnd={handleOverlayTap}
          >
            <article
              className="attestation-page"
              style={{
                width: A4_WIDTH_PX,
                height: A4_HEIGHT_PX,
                transform: modalTransform,
              }}
            >
              {attestationContent}
            </article>
          </div>
        </div>
      ) : null}

      {toastMessage ? (
        <div className="attestation-toast" role="status">
          {toastMessage}
        </div>
      ) : null}

      <style jsx global>{`
        @page {
          size: A4;
          margin: 0mm !important;
        }

        .attestation-page {
          position: relative;
          width: 210mm;
          height: 297mm;
          background-color: #fff;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 10pt;
          text-align: left;
          color: #000;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .attestation-sheet-wrap {
          display: flex;
          justify-content: center;
        }

        .attestation-preview-trigger {
          border: 0;
          background: transparent;
          padding: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          cursor: zoom-in;
        }

        .attestation-preview-frame {
          position: relative;
          width: 100%;
          height: min(72vh, 900px);
          min-height: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .attestation-preview-frame .attestation-page {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-origin: center;
        }

        .attestation-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
        }

        .font-courier {
          font-family: "Courier New", Courier, monospace;
          letter-spacing: 0.2px;
        }

        .field-ft-number {
          position: absolute;
          top: 63.2mm;
          left: 20mm;
          font-size: 10pt;
          z-index: 1;
        }

        .field-recipient {
          position: absolute;
          top: 67mm;
          left: 111mm;
          width: 72mm;
          font-size: 10pt;
          line-height: 1.08;
          text-transform: uppercase;
          z-index: 1;
        }

        .field-ref-title {
          position: absolute;
          top: 81.3mm;
          left: 20mm;
          font-size: 10pt;
          z-index: 1;
        }

        .field-date {
          position: absolute;
          top: 92.2mm;
          left: 109mm;
          font-size: 10pt;
          z-index: 1;
        }

        .field-ref-number {
          position: absolute;
          top: 86.7mm;
          left: 20mm;
          font-size: 10pt;
          z-index: 1;
        }

        .field-contact-title {
          position: absolute;
          top: 102.1mm;
          left: 20mm;
          font-size: 10pt;
          z-index: 1;
        }

        .field-contact-email {
          position: absolute;
          top: 106.8mm;
          left: 20mm;
          font-size: 10pt;
          z-index: 1;
        }

        .field-subject {
          position: absolute;
          top: 117.1mm;
          left: 20mm;
          font-size: 10pt;
          z-index: 1;
        }

        .field-salutation {
          position: absolute;
          top: 128.9mm;
          left: 20mm;
          font-size: 10pt;
          z-index: 1;
        }

        .field-body {
          position: absolute;
          top: 139.3mm;
          left: 20mm;
          width: 171mm;
          font-size: 10pt;
          line-height: 1.2;
          text-align: left;
          z-index: 1;
        }

        .field-body p {
          margin: 0 0 2.8mm;
        }

        .field-body p:last-child {
          margin-top: 6mm;
        }

        .field-director {
          position: absolute;
          top: 221mm;
          left: 121mm;
          font-size: 10pt;
          z-index: 1;
        }

        .attestation-modal {
          position: fixed;
          inset: 0;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: calc(16px + env(safe-area-inset-top)) 16px
            calc(16px + env(safe-area-inset-bottom));
        }

        .attestation-modal.is-clean .attestation-modal-header {
          opacity: 0;
          pointer-events: none;
        }

        .attestation-modal-header {
          position: fixed;
          top: max(12px, env(safe-area-inset-top));
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 0 16px;
          z-index: 2;
          pointer-events: auto;
        }

        .attestation-modal-close {
          align-self: flex-end;
          background: #111;
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
        }

        .attestation-modal-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }

        .attestation-modal-action {
          background: #111;
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
        }

        .attestation-modal-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .attestation-modal-page {
          width: 100%;
          display: flex;
          justify-content: center;
          height: 90vh;
          position: relative;
          align-items: center;
          touch-action: manipulation;
        }

        .attestation-modal-page .attestation-page {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-origin: center;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
        }

        .attestation-modal-page .attestation-page .attestation-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .attestation-toast {
          position: fixed;
          left: 50%;
          bottom: calc(16px + env(safe-area-inset-bottom));
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.85);
          color: #fff;
          padding: 10px 14px;
          border-radius: 999px;
          font-size: 12px;
          z-index: 10000;
        }

        .attestation-capture {
          position: fixed;
          left: -9999px;
          top: -9999px;
          width: ${A4_WIDTH_PX}px;
          height: ${A4_HEIGHT_PX}px;
          overflow: hidden;
        }

        .attestation-capture-page {
          transform: none !important;
        }

        @media print {
          html,
          body {
            margin: 0;
            padding: 0;
            background: #fff;
          }

          body > header {
            display: none !important;
          }

          main,
          .site-container {
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:border-0 {
            border: 0 !important;
          }

          .print\\:bg-white {
            background: #fff !important;
          }

          .print\\:p-0 {
            padding: 0 !important;
          }

          .attestation-sheet-wrap {
            margin: 0 !important;
            border: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            overflow: visible !important;
            width: 100% !important;
          }

          .attestation-app {
            margin: 0 !important;
            padding: 0 !important;
            min-height: auto !important;
            background: #fff !important;
          }

          .attestation-shell {
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
          }

          .attestation-layout {
            display: block !important;
            margin: 0 !important;
            gap: 0 !important;
          }

          .attestation-page {
            width: 210mm !important;
            height: 296.8mm !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            break-inside: avoid-page !important;
            page-break-inside: avoid !important;
            break-after: avoid-page !important;
            page-break-after: avoid !important;
          }
        }

        @media (max-width: 900px) {
          .attestation-preview-frame {
            height: min(60vh, 720px);
          }
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled = false,
  type = "text",
  options = [],
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  type?: string;
  options?: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      {type === "select" ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm disabled:bg-neutral-100 disabled:text-neutral-500"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          type={type}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm disabled:bg-neutral-100 disabled:text-neutral-500"
        />
      )}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
      />
    </label>
  );
}
