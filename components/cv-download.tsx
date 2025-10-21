"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ExternalLink } from "lucide-react";

export default function CVDownload() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-6 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <h3 className="mb-1 font-semibold">Download My CV</h3>
          <p className="text-sm text-muted-foreground">
            Get a detailed overview of my experience and skills
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
              View Source
            </a>
          </Button>
          <Button asChild>
            <a
              href="https://raw.githubusercontent.com/Anders-planck/cv/master/out/cv.pdf"
              download="Anders_Planck_CV.pdf"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
