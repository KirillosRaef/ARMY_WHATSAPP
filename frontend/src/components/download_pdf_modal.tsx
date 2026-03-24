import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"

export default function DownloadPdfModal({ alt, headers, data }: { alt: string, headers: string[], data: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const doc = new jsPDF();
  let chosenHeaders: { header: string, pdf: boolean }[] = [];
  headers.forEach((header) => {
    chosenHeaders.push({ 'header': header, 'pdf': true });
  });


  const handleDownload = () => {
    let i = 1;
    const finalHeaders = chosenHeaders.filter((h) => h.pdf).map((h) => h.header);
    autoTable(doc, {
      head: [finalHeaders],
      body: data.map((item) => [
        i++,
        item.brandName,
        item.deviceKind,
        item.description,
        item.serialNumber,
        item.usage,
        item.militaryUnitName,
        item.branch,
        item.username,
      ])
    });
    doc.save('devices.pdf');
  };

  return (
    <div>
      <Button
        onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
        size="sm"
        className="bg-red-500 text-primary-foreground hover:bg-red-600 shadow-lg shadow-red-500/20 rounded-xl px-5 py-2 text-sm font-medium h-9 border-0"
      >
        {alt}
      </Button>

      {isModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={() => setIsModalOpen(false)}
        >
          {/* Cinematic backdrop */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background: 'rgba(0, 0, 0, 0.82)',
              backdropFilter: 'blur(20px) saturate(0.5)',
              WebkitBackdropFilter: 'blur(20px) saturate(0.5)',
            }}
          />

          {/* Close button - floating top right */}
          <Button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200 backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Image container */}
          <div
            className="relative flex items-center justify-center p-8"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh' }}
          >
            <FieldSet>
              <FieldLegend variant="label">
                Show these items on the desktop:
              </FieldLegend>
              <FieldDescription>
                Select the items you want to show on the desktop.
              </FieldDescription>
              <FieldGroup className="gap-3">
                {headers.map((header) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      id={header}
                      name={header}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          chosenHeaders.find((h) => h.header === header)!.pdf = true;
                        } else {
                          chosenHeaders.find((h) => h.header === header)!.pdf = false;
                        }
                      }}
                      defaultChecked
                    />
                    <FieldLabel
                      htmlFor={header}
                      className="font-normal"
                    >
                      {header}
                    </FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
            </FieldSet>
            <Button
              onClick={handleDownload}
              size="sm"
              className="bg-red-500 text-primary-foreground hover:bg-red-600 shadow-lg shadow-red-500/20 rounded-xl px-5 py-2 text-sm font-medium h-9 border-0"
            >
              {alt}
            </Button>
            
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}