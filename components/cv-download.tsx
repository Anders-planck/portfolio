"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CVDownload() {
  const t = useTranslations("about.cvDownload");

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-6 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <h3 className="mb-1 font-semibold">{t("title")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a
              href="https://github.com/Anders-planck/cv"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {t("viewSource")}
            </a>
          </Button>
          <Button asChild>
            <a
              href="https://raw.githubusercontent.com/Anders-planck/cv/master/out/cv.pdf"
              download="Anders_Planck_CV.pdf"
            >
              <Download className="mr-2 h-4 w-4" />
              {t("downloadPdf")}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
