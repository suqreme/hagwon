interface Theme {
  id: string
  name: string
  description: string
  css: string
}

class ThemeService {
  private storageKey = 'selected_theme'
  private themes: Theme[] = [
    {
      id: 'doom-64',
      name: 'Doom 64',
      description: 'Retro gaming theme with light/dark modes',
      css: `
        :root {
          --background: oklch(0.8452 0 0);
          --foreground: oklch(0.2393 0 0);
          --card: oklch(0.7572 0 0);
          --card-foreground: oklch(0.2393 0 0);
          --popover: oklch(0.7572 0 0);
          --popover-foreground: oklch(0.2393 0 0);
          --primary: oklch(0.5016 0.1887 27.4816);
          --primary-foreground: oklch(1.0000 0 0);
          --secondary: oklch(0.4955 0.0896 126.1858);
          --secondary-foreground: oklch(1.0000 0 0);
          --muted: oklch(0.7826 0 0);
          --muted-foreground: oklch(0.4091 0 0);
          --accent: oklch(0.5880 0.0993 245.7394);
          --accent-foreground: oklch(1.0000 0 0);
          --destructive: oklch(0.7076 0.1975 46.4558);
          --destructive-foreground: oklch(0 0 0);
          --border: oklch(0.4313 0 0);
          --input: oklch(0.4313 0 0);
          --ring: oklch(0.5016 0.1887 27.4816);
          --chart-1: oklch(0.5016 0.1887 27.4816);
          --chart-2: oklch(0.4955 0.0896 126.1858);
          --chart-3: oklch(0.5880 0.0993 245.7394);
          --chart-4: oklch(0.7076 0.1975 46.4558);
          --chart-5: oklch(0.5656 0.0431 40.4319);
          --sidebar: oklch(0.7572 0 0);
          --sidebar-foreground: oklch(0.2393 0 0);
          --sidebar-primary: oklch(0.5016 0.1887 27.4816);
          --sidebar-primary-foreground: oklch(1.0000 0 0);
          --sidebar-accent: oklch(0.5880 0.0993 245.7394);
          --sidebar-accent-foreground: oklch(1.0000 0 0);
          --sidebar-border: oklch(0.4313 0 0);
          --sidebar-ring: oklch(0.5016 0.1887 27.4816);
          --font-sans: "Oxanium", sans-serif;
          --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
          --font-mono: "Source Code Pro", monospace;
          --radius: 0px;
          --shadow-2xs: 0px 2px 4px 0px hsl(0 0% 0% / 0.20);
          --shadow-xs: 0px 2px 4px 0px hsl(0 0% 0% / 0.20);
          --shadow-sm: 0px 2px 4px 0px hsl(0 0% 0% / 0.40), 0px 1px 2px -1px hsl(0 0% 0% / 0.40);
          --shadow: 0px 2px 4px 0px hsl(0 0% 0% / 0.40), 0px 1px 2px -1px hsl(0 0% 0% / 0.40);
          --shadow-md: 0px 2px 4px 0px hsl(0 0% 0% / 0.40), 0px 2px 4px -1px hsl(0 0% 0% / 0.40);
          --shadow-lg: 0px 2px 4px 0px hsl(0 0% 0% / 0.40), 0px 4px 6px -1px hsl(0 0% 0% / 0.40);
          --shadow-xl: 0px 2px 4px 0px hsl(0 0% 0% / 0.40), 0px 8px 10px -1px hsl(0 0% 0% / 0.40);
          --shadow-2xl: 0px 2px 4px 0px hsl(0 0% 0% / 1.00);
        }
        
        .dark {
          --background: oklch(0.2178 0 0);
          --foreground: oklch(0.9067 0 0);
          --card: oklch(0.2850 0 0);
          --card-foreground: oklch(0.9067 0 0);
          --popover: oklch(0.2850 0 0);
          --popover-foreground: oklch(0.9067 0 0);
          --primary: oklch(0.6083 0.2090 27.0276);
          --primary-foreground: oklch(1.0000 0 0);
          --secondary: oklch(0.6423 0.1467 133.0145);
          --secondary-foreground: oklch(0 0 0);
          --muted: oklch(0.2645 0 0);
          --muted-foreground: oklch(0.7058 0 0);
          --accent: oklch(0.7482 0.1235 244.7492);
          --accent-foreground: oklch(0 0 0);
          --destructive: oklch(0.7839 0.1719 68.0943);
          --destructive-foreground: oklch(0 0 0);
          --border: oklch(0.4091 0 0);
          --input: oklch(0.4091 0 0);
          --ring: oklch(0.6083 0.2090 27.0276);
          --chart-1: oklch(0.6083 0.2090 27.0276);
          --chart-2: oklch(0.6423 0.1467 133.0145);
          --chart-3: oklch(0.7482 0.1235 244.7492);
          --chart-4: oklch(0.7839 0.1719 68.0943);
          --chart-5: oklch(0.6471 0.0334 40.7963);
          --sidebar: oklch(0.1913 0 0);
          --sidebar-foreground: oklch(0.9067 0 0);
          --sidebar-primary: oklch(0.6083 0.2090 27.0276);
          --sidebar-primary-foreground: oklch(1.0000 0 0);
          --sidebar-accent: oklch(0.7482 0.1235 244.7492);
          --sidebar-accent-foreground: oklch(0 0 0);
          --sidebar-border: oklch(0.4091 0 0);
          --sidebar-ring: oklch(0.6083 0.2090 27.0276);
          --font-sans: "Oxanium", sans-serif;
          --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
          --font-mono: "Source Code Pro", monospace;
          --radius: 0px;
          --shadow-2xs: 0px 2px 5px 0px hsl(0 0% 0% / 0.30);
          --shadow-xs: 0px 2px 5px 0px hsl(0 0% 0% / 0.30);
          --shadow-sm: 0px 2px 5px 0px hsl(0 0% 0% / 0.60), 0px 1px 2px -1px hsl(0 0% 0% / 0.60);
          --shadow: 0px 2px 5px 0px hsl(0 0% 0% / 0.60), 0px 1px 2px -1px hsl(0 0% 0% / 0.60);
          --shadow-md: 0px 2px 5px 0px hsl(0 0% 0% / 0.60), 0px 2px 4px -1px hsl(0 0% 0% / 0.60);
          --shadow-lg: 0px 2px 5px 0px hsl(0 0% 0% / 0.60), 0px 4px 6px -1px hsl(0 0% 0% / 0.60);
          --shadow-xl: 0px 2px 5px 0px hsl(0 0% 0% / 0.60), 0px 8px 10px -1px hsl(0 0% 0% / 0.60);
          --shadow-2xl: 0px 2px 5px 0px hsl(0 0% 0% / 1.50);
        }
        
        * {
          border-radius: 0px !important;
        }
      `
    },
    {
      id: 'candyland',
      name: 'Candyland',
      description: 'Sweet and colorful theme',
      css: `
        :root {
          --background: oklch(0.9809 0.0025 228.7836);
          --foreground: oklch(0.3211 0 0);
          --card: oklch(1.0000 0 0);
          --card-foreground: oklch(0.3211 0 0);
          --popover: oklch(1.0000 0 0);
          --popover-foreground: oklch(0.3211 0 0);
          --primary: oklch(0.8677 0.0735 7.0855);
          --primary-foreground: oklch(0 0 0);
          --secondary: oklch(0.8148 0.0819 225.7537);
          --secondary-foreground: oklch(0 0 0);
          --muted: oklch(0.8828 0.0285 98.1033);
          --muted-foreground: oklch(0.5382 0 0);
          --accent: oklch(0.9680 0.2110 109.7692);
          --accent-foreground: oklch(0 0 0);
          --destructive: oklch(0.6368 0.2078 25.3313);
          --destructive-foreground: oklch(1.0000 0 0);
          --border: oklch(0.8699 0 0);
          --input: oklch(0.8699 0 0);
          --ring: oklch(0.8677 0.0735 7.0855);
          --chart-1: oklch(0.8677 0.0735 7.0855);
          --chart-2: oklch(0.8148 0.0819 225.7537);
          --chart-3: oklch(0.9680 0.2110 109.7692);
          --chart-4: oklch(0.8027 0.1355 349.2347);
          --chart-5: oklch(0.7395 0.2268 142.8504);
          --font-sans: Poppins, sans-serif;
          --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
          --font-mono: Roboto Mono, monospace;
          --radius: 0.5rem;
        }
        
        .dark {
          --background: oklch(0.2303 0.0125 264.2926);
          --foreground: oklch(0.9219 0 0);
          --card: oklch(0.3210 0.0078 223.6661);
          --card-foreground: oklch(0.9219 0 0);
          --popover: oklch(0.3210 0.0078 223.6661);
          --popover-foreground: oklch(0.9219 0 0);
          --primary: oklch(0.8027 0.1355 349.2347);
          --primary-foreground: oklch(0 0 0);
          --secondary: oklch(0.7395 0.2268 142.8504);
          --secondary-foreground: oklch(0 0 0);
          --muted: oklch(0.3867 0 0);
          --muted-foreground: oklch(0.7155 0 0);
          --accent: oklch(0.8148 0.0819 225.7537);
          --accent-foreground: oklch(0 0 0);
          --destructive: oklch(0.6368 0.2078 25.3313);
          --destructive-foreground: oklch(1.0000 0 0);
          --border: oklch(0.3867 0 0);
          --input: oklch(0.3867 0 0);
          --ring: oklch(0.8027 0.1355 349.2347);
          --chart-1: oklch(0.8027 0.1355 349.2347);
          --chart-2: oklch(0.7395 0.2268 142.8504);
          --chart-3: oklch(0.8148 0.0819 225.7537);
          --chart-4: oklch(0.9680 0.2110 109.7692);
          --chart-5: oklch(0.8652 0.1768 90.3816);
        }
      `
    },
    {
      id: 'bubblegum',
      name: 'Bubblegum',
      description: 'Sweet pink theme with playful shadows',
      css: `
        :root {
          --background: oklch(0.9399 0.0203 345.6985);
          --foreground: oklch(0.4712 0 0);
          --card: oklch(0.9498 0.0500 86.8891);
          --card-foreground: oklch(0.4712 0 0);
          --popover: oklch(1.0000 0 0);
          --popover-foreground: oklch(0.4712 0 0);
          --primary: oklch(0.6209 0.1801 348.1385);
          --primary-foreground: oklch(1.0000 0 0);
          --secondary: oklch(0.8095 0.0694 198.1863);
          --secondary-foreground: oklch(0.3211 0 0);
          --muted: oklch(0.8800 0.0504 212.0952);
          --muted-foreground: oklch(0.5795 0 0);
          --accent: oklch(0.9195 0.0801 87.6670);
          --accent-foreground: oklch(0.3211 0 0);
          --destructive: oklch(0.7091 0.1697 21.9551);
          --destructive-foreground: oklch(1.0000 0 0);
          --border: oklch(0.6209 0.1801 348.1385);
          --input: oklch(0.9189 0 0);
          --ring: oklch(0.7002 0.1597 350.7532);
          --chart-1: oklch(0.7002 0.1597 350.7532);
          --chart-2: oklch(0.8189 0.0799 212.0892);
          --chart-3: oklch(0.9195 0.0801 87.6670);
          --chart-4: oklch(0.7998 0.1110 348.1791);
          --chart-5: oklch(0.6197 0.1899 353.9091);
          --sidebar: oklch(0.9140 0.0424 343.0913);
          --sidebar-foreground: oklch(0.3211 0 0);
          --sidebar-primary: oklch(0.6559 0.2118 354.3084);
          --sidebar-primary-foreground: oklch(1.0000 0 0);
          --sidebar-accent: oklch(0.8228 0.1095 346.0184);
          --sidebar-accent-foreground: oklch(0.3211 0 0);
          --sidebar-border: oklch(0.9464 0.0327 307.1745);
          --sidebar-ring: oklch(0.6559 0.2118 354.3084);
          --font-sans: Poppins, sans-serif;
          --font-serif: Lora, serif;
          --font-mono: Fira Code, monospace;
          --radius: 0.4rem;
          --shadow-2xs: 3px 3px 0px 0px hsl(325.7800 58.1800% 56.8600% / 0.50);
          --shadow-xs: 3px 3px 0px 0px hsl(325.7800 58.1800% 56.8600% / 0.50);
          --shadow-sm: 3px 3px 0px 0px hsl(325.7800 58.1800% 56.8600% / 1.00), 3px 1px 2px -1px hsl(325.7800 58.1800% 56.8600% / 1.00);
          --shadow: 3px 3px 0px 0px hsl(325.7800 58.1800% 56.8600% / 1.00), 3px 1px 2px -1px hsl(325.7800 58.1800% 56.8600% / 1.00);
          --shadow-md: 3px 3px 0px 0px hsl(325.7800 58.1800% 56.8600% / 1.00), 3px 2px 4px -1px hsl(325.7800 58.1800% 56.8600% / 1.00);
          --shadow-lg: 3px 3px 0px 0px hsl(325.7800 58.1800% 56.8600% / 1.00), 3px 4px 6px -1px hsl(325.7800 58.1800% 56.8600% / 1.00);
          --shadow-xl: 3px 3px 0px 0px hsl(325.7800 58.1800% 56.8600% / 1.00), 3px 8px 10px -1px hsl(325.7800 58.1800% 56.8600% / 1.00);
          --shadow-2xl: 3px 3px 0px 0px hsl(325.7800 58.1800% 56.8600% / 2.50);
        }
        
        .dark {
          --background: oklch(0.2497 0.0305 234.1628);
          --foreground: oklch(0.9306 0.0197 349.0785);
          --card: oklch(0.2902 0.0299 233.5352);
          --card-foreground: oklch(0.9306 0.0197 349.0785);
          --popover: oklch(0.2902 0.0299 233.5352);
          --popover-foreground: oklch(0.9306 0.0197 349.0785);
          --primary: oklch(0.9195 0.0801 87.6670);
          --primary-foreground: oklch(0.2497 0.0305 234.1628);
          --secondary: oklch(0.7794 0.0803 4.1330);
          --secondary-foreground: oklch(0.2497 0.0305 234.1628);
          --muted: oklch(0.2713 0.0086 255.5780);
          --muted-foreground: oklch(0.7794 0.0803 4.1330);
          --accent: oklch(0.6699 0.0988 356.9762);
          --accent-foreground: oklch(0.9306 0.0197 349.0785);
          --destructive: oklch(0.6702 0.1806 350.3599);
          --destructive-foreground: oklch(0.2497 0.0305 234.1628);
          --border: oklch(0.3907 0.0399 242.2181);
          --input: oklch(0.3093 0.0305 232.0027);
          --ring: oklch(0.6998 0.0896 201.8672);
          --chart-1: oklch(0.6998 0.0896 201.8672);
          --chart-2: oklch(0.7794 0.0803 4.1330);
          --chart-3: oklch(0.6699 0.0988 356.9762);
          --chart-4: oklch(0.4408 0.0702 217.0848);
          --chart-5: oklch(0.2713 0.0086 255.5780);
          --sidebar: oklch(0.2303 0.0270 235.9743);
          --sidebar-foreground: oklch(0.9670 0.0029 264.5419);
          --sidebar-primary: oklch(0.6559 0.2118 354.3084);
          --sidebar-primary-foreground: oklch(1.0000 0 0);
          --sidebar-accent: oklch(0.8228 0.1095 346.0184);
          --sidebar-accent-foreground: oklch(0.2781 0.0296 256.8480);
          --sidebar-border: oklch(0.3729 0.0306 259.7328);
          --sidebar-ring: oklch(0.6559 0.2118 354.3084);
          --font-sans: Poppins, sans-serif;
          --font-serif: Lora, serif;
          --font-mono: Fira Code, monospace;
          --radius: 0.4rem;
          --shadow-2xs: 3px 3px 0px 0px hsl(206.1538 28.0576% 27.2549% / 0.50);
          --shadow-xs: 3px 3px 0px 0px hsl(206.1538 28.0576% 27.2549% / 0.50);
          --shadow-sm: 3px 3px 0px 0px hsl(206.1538 28.0576% 27.2549% / 1.00), 3px 1px 2px -1px hsl(206.1538 28.0576% 27.2549% / 1.00);
          --shadow: 3px 3px 0px 0px hsl(206.1538 28.0576% 27.2549% / 1.00), 3px 1px 2px -1px hsl(206.1538 28.0576% 27.2549% / 1.00);
          --shadow-md: 3px 3px 0px 0px hsl(206.1538 28.0576% 27.2549% / 1.00), 3px 2px 4px -1px hsl(206.1538 28.0576% 27.2549% / 1.00);
          --shadow-lg: 3px 3px 0px 0px hsl(206.1538 28.0576% 27.2549% / 1.00), 3px 4px 6px -1px hsl(206.1538 28.0576% 27.2549% / 1.00);
          --shadow-xl: 3px 3px 0px 0px hsl(206.1538 28.0576% 27.2549% / 1.00), 3px 8px 10px -1px hsl(206.1538 28.0576% 27.2549% / 1.00);
          --shadow-2xl: 3px 3px 0px 0px hsl(206.1538 28.0576% 27.2549% / 2.50);
        }
      `
    },
    {
      id: 'neo-brutalism',
      name: 'Neo Brutalism',
      description: 'Bold and sharp design',
      css: `
        :root {
          --background: oklch(1.0000 0 0);
          --foreground: oklch(0 0 0);
          --card: oklch(1.0000 0 0);
          --card-foreground: oklch(0 0 0);
          --popover: oklch(1.0000 0 0);
          --popover-foreground: oklch(0 0 0);
          --primary: oklch(0.6489 0.2370 26.9728);
          --primary-foreground: oklch(1.0000 0 0);
          --secondary: oklch(0.9680 0.2110 109.7692);
          --secondary-foreground: oklch(0 0 0);
          --muted: oklch(0.9551 0 0);
          --muted-foreground: oklch(0.3211 0 0);
          --accent: oklch(0.5635 0.2408 260.8178);
          --accent-foreground: oklch(1.0000 0 0);
          --destructive: oklch(0 0 0);
          --destructive-foreground: oklch(1.0000 0 0);
          --border: oklch(0 0 0);
          --input: oklch(0 0 0);
          --ring: oklch(0.6489 0.2370 26.9728);
          --chart-1: oklch(0.6489 0.2370 26.9728);
          --chart-2: oklch(0.9680 0.2110 109.7692);
          --chart-3: oklch(0.5635 0.2408 260.8178);
          --chart-4: oklch(0.7323 0.2492 142.4953);
          --chart-5: oklch(0.5931 0.2726 328.3634);
          --font-sans: DM Sans, sans-serif;
          --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
          --font-mono: Space Mono, monospace;
          --radius: 0px;
          --shadow-2xs: 2px 2px 0px 0px hsl(0 0% 0% / 1.00);
          --shadow-xs: 2px 2px 0px 0px hsl(0 0% 0% / 1.00);
          --shadow-sm: 3px 3px 0px 0px hsl(0 0% 0% / 1.00);
          --shadow: 4px 4px 0px 0px hsl(0 0% 0% / 1.00);
          --shadow-md: 5px 5px 0px 0px hsl(0 0% 0% / 1.00);
          --shadow-lg: 6px 6px 0px 0px hsl(0 0% 0% / 1.00);
          --shadow-xl: 8px 8px 0px 0px hsl(0 0% 0% / 1.00);
          --shadow-2xl: 12px 12px 0px 0px hsl(0 0% 0% / 1.00);
        }
        
        .dark {
          --background: oklch(0 0 0);
          --foreground: oklch(1.0000 0 0);
          --card: oklch(0.3211 0 0);
          --card-foreground: oklch(1.0000 0 0);
          --popover: oklch(0.3211 0 0);
          --popover-foreground: oklch(1.0000 0 0);
          --primary: oklch(0.7044 0.1872 23.1858);
          --primary-foreground: oklch(0 0 0);
          --secondary: oklch(0.9691 0.2005 109.6228);
          --secondary-foreground: oklch(0 0 0);
          --muted: oklch(0.3211 0 0);
          --muted-foreground: oklch(0.8452 0 0);
          --accent: oklch(0.6755 0.1765 252.2592);
          --accent-foreground: oklch(0 0 0);
          --destructive: oklch(1.0000 0 0);
          --destructive-foreground: oklch(0 0 0);
          --border: oklch(1.0000 0 0);
          --input: oklch(1.0000 0 0);
          --ring: oklch(0.7044 0.1872 23.1858);
          --shadow-2xs: 2px 2px 0px 0px hsl(0 0% 100% / 1.00);
          --shadow-xs: 2px 2px 0px 0px hsl(0 0% 100% / 1.00);
          --shadow-sm: 3px 3px 0px 0px hsl(0 0% 100% / 1.00);
          --shadow: 4px 4px 0px 0px hsl(0 0% 100% / 1.00);
          --shadow-md: 5px 5px 0px 0px hsl(0 0% 100% / 1.00);
          --shadow-lg: 6px 6px 0px 0px hsl(0 0% 100% / 1.00);
          --shadow-xl: 8px 8px 0px 0px hsl(0 0% 100% / 1.00);
          --shadow-2xl: 12px 12px 0px 0px hsl(0 0% 100% / 1.00);
          --chart-1: oklch(0.7044 0.1872 23.1858);
          --chart-2: oklch(0.9691 0.2005 109.6228);
          --chart-3: oklch(0.6755 0.1765 252.2592);
          --chart-4: oklch(0.7395 0.2268 142.8504);
          --chart-5: oklch(0.6131 0.2458 328.0714);
        }
        
        * {
          border-radius: 0px !important;
        }
      `
    }
  ]

  getCurrentTheme(): string {
    try {
      return localStorage.getItem(this.storageKey) || 'candyland'
    } catch (error) {
      return 'candyland'
    }
  }

  setTheme(themeId: string): void {
    try {
      localStorage.setItem(this.storageKey, themeId)
      this.applyTheme(themeId)
    } catch (error) {
      console.error('Error setting theme:', error)
    }
  }

  applyTheme(themeId: string): void {
    const theme = this.themes.find(t => t.id === themeId)
    if (!theme) return

    // Remove existing theme styles (including initial theme from layout)
    const existingStyle = document.getElementById('theme-styles')
    if (existingStyle) {
      existingStyle.remove()
    }
    
    const initialTheme = document.getElementById('initial-theme')
    if (initialTheme) {
      initialTheme.remove()
    }

    // Apply new theme with high priority and !important for better specificity
    const styleElement = document.createElement('style')
    styleElement.id = 'theme-styles'
    styleElement.textContent = theme.css
    document.head.appendChild(styleElement)

    // Update body class for theme-specific styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '')
    document.body.classList.add(`theme-${themeId}`)

    // Ensure theme variables take precedence over default ones
    const rootElement = document.documentElement
    rootElement.setAttribute('data-theme', themeId)
  }

  getThemes(): Theme[] {
    return [...this.themes]
  }

  getTheme(id: string): Theme | undefined {
    return this.themes.find(t => t.id === id)
  }

  initializeTheme(): void {
    const currentTheme = this.getCurrentTheme()
    this.applyTheme(currentTheme)
  }
}

export const themeService = new ThemeService()