import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Github, Linkedin, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export type SocialLinkId = "linkedin" | "github" | "email";

export type SocialLink = {
  id: SocialLinkId;
  name: string;
  href: string;
  icon: LucideIcon;
};

export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    href: "https://linkedin.com/in/anders-planck-53184b1b4",
    icon: Linkedin,
  },
  {
    id: "github",
    name: "GitHub",
    href: "https://github.com/Anders-planck",
    icon: Github,
  },
  {
    id: "email",
    name: "Email",
    href: "mailto:anders.jipwouo@gmail.com",
    icon: Mail,
  },
];

type SocialLinksProps = {
  links?: SocialLink[];
  showLabels?: boolean;
  orientation?: "horizontal" | "vertical";
  className?: string;
  linkClassName?: string;
  labelClassName?: string;
  ariaLabelResolver?: (link: SocialLink) => string;
  labelResolver?: (link: SocialLink) => ReactNode;
  iconSize?: "sm" | "md" | number;
};

const ICON_SIZE_MAP: Record<Exclude<SocialLinksProps["iconSize"], number | undefined>, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
};

export function SocialLinks({
  links = DEFAULT_SOCIAL_LINKS,
  showLabels = false,
  orientation = "horizontal",
  className,
  linkClassName,
  labelClassName,
  ariaLabelResolver,
  labelResolver,
  iconSize = "md",
}: SocialLinksProps) {
  const wrapperClasses = cn(
    "flex",
    orientation === "vertical" ? "flex-col gap-2" : "flex-wrap items-center gap-3",
    className,
  );

  return (
    <div className={wrapperClasses}>
      {links.map((link) => {
        const Icon = link.icon;
        const ariaLabel = ariaLabelResolver?.(link) ?? link.name;
        const label = labelResolver?.(link) ?? link.name;
        const iconClass =
          typeof iconSize === "number"
            ? undefined
            : ICON_SIZE_MAP[iconSize] ?? ICON_SIZE_MAP.md;
        const iconStyle =
          typeof iconSize === "number"
            ? { width: iconSize, height: iconSize }
            : undefined;

        return (
          <Link
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ariaLabel}
            className={cn(
              showLabels
                ? "group inline-flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/60 hover:text-foreground"
                : "group inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              linkClassName,
            )}
          >
            <Icon className={cn("shrink-0", iconClass)} style={iconStyle} />
            {showLabels && (
              <span className={cn("text-sm", labelClassName)}>{label}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

