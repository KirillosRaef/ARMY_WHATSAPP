import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileDown, Check, X } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { amiriFont } from "@/assets/Amiri-Regular.ttf";

/** Each exportable column: translation key for the header + accessor to pull data */
interface PdfColumn {
  key: string;
  labelKey: string;
  accessor: (row: any) => string | number;
}

const PDF_COLUMNS: PdfColumn[] = [
  { key: "brandName", labelKey: "table.pdfBrand", accessor: (r) => r.brandName ?? "" },
  { key: "deviceKind", labelKey: "table.pdfDeviceKind", accessor: (r) => r.deviceKind ?? "" },
  { key: "description", labelKey: "table.pdfDescription", accessor: (r) => r.description ?? "" },
  { key: "serialNumber", labelKey: "table.pdfSerialNumber", accessor: (r) => r.serialNumber ?? "" },
  { key: "usage", labelKey: "table.pdfUsage", accessor: (r) => r.usage ?? "" },
  { key: "militaryUnit", labelKey: "table.pdfMilitaryUnit", accessor: (r) => r.militaryUnitName ?? "" },
  { key: "branch", labelKey: "table.pdfBranch", accessor: (r) => r.branch ?? "" },
  { key: "username", labelKey: "table.pdfUsername", accessor: (r) => r.username ?? "" },
];

import { ArabicShaper } from "arabic-persian-reshaper";

const processArabicText = (text: string | number) => {
  if (text === null || text === undefined) return "";
  const str = String(text);
  const arabicRegex =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

  if (!arabicRegex.test(str)) {
    return str; // Leave English completely untouched
  }

  // Shape Arabic characters into their correct presentation forms
  const shaped = ArabicShaper.convertArabic(str);

  // jsPDF 2.x with Identity-H handles RTL internally, so no manual reversal needed
  return shaped;
};

export default function DownloadPdfModal({ data }: { data: any[] }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PDF_COLUMNS.map((c) => [c.key, true]))
  );

  const allSelected = PDF_COLUMNS.every((c) => selected[c.key]);
  const noneSelected = PDF_COLUMNS.every((c) => !selected[c.key]);

  const toggleAll = () => {
    const nextValue = !allSelected;
    setSelected(Object.fromEntries(PDF_COLUMNS.map((c) => [c.key, nextValue])));
  };

  const toggle = (key: string) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExport = () => {
    const activeCols = PDF_COLUMNS.filter((c) => selected[c.key]);
    if (activeCols.length === 0) return;

    const doc = new jsPDF();
    doc.addFileToVFS('Amiri-Regular.ttf', amiriFont);
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal', 'Identity-H');
    doc.setFont('Amiri');

    let rowNum = 1;

    autoTable(doc, {
      head: [[
        processArabicText(t("table.no")),
        ...activeCols.map((c) => processArabicText(t(c.labelKey)))
      ]],
      body: data.map((item) => [
        processArabicText(rowNum++),
        ...activeCols.map((c) => processArabicText(c.accessor(item)))
      ]),
      styles: { font: 'Amiri', fontSize: 9, halign: 'right' },
      headStyles: { fillColor: [30, 41, 59], halign: 'right' },
    });
    doc.save("devices.pdf");
    setOpen(false);
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl px-5 py-2 text-sm font-medium h-9 border-0 transition-all"
        >
          <FileDown className="h-3.5 w-3.5" />
          {t("table.downloadPDF")}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-primary" />
            {t("table.pdfExportTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("table.pdfExportDescription")}
          </DialogDescription>
        </DialogHeader>

        {/* Select All / Deselect All toggle */}
        <div className="flex items-center justify-between px-1 pt-1">
          <button
            type="button"
            onClick={toggleAll}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {allSelected ? (
              <>
                <X className="h-3.5 w-3.5" />
                {t("table.deselectAll")}
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                {t("table.selectAll")}
              </>
            )}
          </button>
          <span className="text-xs text-muted-foreground">
            {PDF_COLUMNS.filter((c) => selected[c.key]).length}/{PDF_COLUMNS.length}
          </span>
        </div>

        {/* Column checkboxes */}
        <div className="grid grid-cols-2 gap-2.5 py-2">
          {PDF_COLUMNS.map((col) => (
            <label
              key={col.key}
              className={[
                "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-all duration-150",
                selected[col.key]
                  ? "border-primary/30 bg-primary/5 dark:bg-primary/10"
                  : "border-border bg-muted/30 hover:bg-muted/50",
              ].join(" ")}
            >
              <Checkbox
                id={col.key}
                checked={selected[col.key]}
                onCheckedChange={() => toggle(col.key)}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm font-normal text-foreground select-none">
                {t(col.labelKey)}
              </span>
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            className="rounded-xl"
          >
            {t("common.cancel")}
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={noneSelected}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl px-5 text-sm font-medium border-0 transition-all"
          >
            <FileDown className="h-3.5 w-3.5" />
            {t("table.export")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}