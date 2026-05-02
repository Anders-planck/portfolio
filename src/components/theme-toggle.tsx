import { Monitor, Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Theme = "dark" | "light" | "auto";

function getSystemTheme(): "dark" | "light" {
	if (typeof window === "undefined") return "dark";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function applyTheme(theme: Theme) {
	if (typeof document === "undefined") return;
	const resolved = theme === "auto" ? getSystemTheme() : theme;
	document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>("dark");
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const saved = localStorage.getItem("theme") as Theme | null;
		const initial = saved ?? "dark";
		setTheme(initial);
		applyTheme(initial);
	}, []);

	const cycle = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			const next: Record<Theme, Theme> = {
				dark: "light",
				light: "auto",
				auto: "dark",
			};
			const nextTheme = next[theme];

			// Get click position for circle origin
			const x = e.clientX;
			const y = e.clientY;
			const endRadius = Math.hypot(
				Math.max(x, window.innerWidth - x),
				Math.max(y, window.innerHeight - y),
			);

			// Use View Transitions API if available
			if (document.startViewTransition) {
				const transition = document.startViewTransition(() => {
					setTheme(nextTheme);
					localStorage.setItem("theme", nextTheme);
					applyTheme(nextTheme);
				});

				transition.ready.then(() => {
					document.documentElement.animate(
						{
							clipPath: [
								`circle(0px at ${x}px ${y}px)`,
								`circle(${endRadius}px at ${x}px ${y}px)`,
							],
						},
						{
							duration: 500,
							easing: "ease-in-out",
							pseudoElement: "::view-transition-new(root)",
						},
					);
				});
			} else {
				setTheme(nextTheme);
				localStorage.setItem("theme", nextTheme);
				applyTheme(nextTheme);
			}
		},
		[theme],
	);

	const icons: Record<Theme, typeof Moon> = {
		dark: Moon,
		light: Sun,
		auto: Monitor,
	};

	const labels: Record<Theme, string> = {
		dark: "Dark",
		light: "Light",
		auto: "Auto",
	};

	const Icon = icons[theme];

	return (
		<button
			ref={buttonRef}
			type="button"
			onClick={cycle}
			aria-label={`Theme: ${labels[theme]}. Click to change.`}
			className="text-fg-subtle hover:text-accent flex items-center gap-1.5 transition-colors"
		>
			<Icon size={14} strokeWidth={1.5} />
		</button>
	);
}

/**
 * Inline script to prevent flash of wrong theme on SSR.
 * Inject in <head> via __root.tsx.
 */
export const themeScript = `
(function(){
	var t=localStorage.getItem('theme')||'dark';
	var r=t==='auto'?window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light':t;
	document.documentElement.classList.toggle('dark',r==='dark');
})();
`;
