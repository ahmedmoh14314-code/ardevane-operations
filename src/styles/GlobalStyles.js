import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
:root {
  &, &.light-mode {
  
  --color-grey-0: #fff;
  --color-grey-50: #faf8f3;
  --color-grey-100: #f0ece4;
  --color-grey-200: #e3ddd1;
  --color-grey-300: #d1d5db;
  --color-grey-400: #9ca3af;
  --color-grey-500: #6b7280;
  --color-grey-600: #4b5563;
  --color-grey-700: #374151;
  --color-grey-800: #1f2937;
  --color-grey-900: #111827;

  /* Status colours, taken from the lodge: lake, forest, honey, stone,
     walnut and clay. The names stay the same so every Tag keeps working. */
  --color-blue-100: #e3eef1;
  --color-blue-700: #2e5f6e;
  --color-green-100: #e2efe6;
  --color-green-700: #1d5a3d;
  --color-yellow-100: #f8ecd2;
  --color-yellow-700: #8a5a12;
  --color-silver-100: #ece8e1;
  --color-silver-700: #5a5248;
  --color-indigo-100: #f1e5d9;
  --color-indigo-700: #6b4426;

  --color-red-100: #f8e2da;
  --color-red-700: #9b3b23;
  --color-red-800: #7d2e1a;

  --backdrop-color: rgba(255, 255, 255, 0.1);

  --shadow-sm: 0 1px 2px rgba(23, 43, 34, 0.04);
  --shadow-md: 0 0.4rem 1.6rem rgba(23, 43, 34, 0.05);
  --shadow-lg: 0 2.4rem 3.2rem rgba(23, 43, 34, 0.12);
  

    --image-grayscale: 0;
  --image-opacity: 100%;

  /* The page header. --band-* is the strip on the working pages, --hero-bg
     shows on the dashboard while the photograph loads. */
  --header-fade-rgb: 250, 248, 243;
  --color-hero-bg: #1d5a44;

  --color-accent-100: #f6ecd9;
  --color-accent-600: #a97d3f;
  }
  
  &.dark-mode {
    --color-grey-0: #18212f;
--color-grey-50: #111827;
--color-grey-100: #1f2937;
--color-grey-200: #374151;
--color-grey-300: #4b5563;
--color-grey-400: #6b7280;
--color-grey-500: #9ca3af;
--color-grey-600: #d1d5db;
--color-grey-700: #e5e7eb;
--color-grey-800: #f3f4f6;
--color-grey-900: #f9fafb;

--color-blue-100: #1f3a42;
--color-blue-700: #cfe4ea;
--color-green-100: #1d3a2b;
--color-green-700: #cfe8d8;
--color-yellow-100: #4a3712;
--color-yellow-700: #f6e3b4;
--color-silver-100: #3a3530;
--color-silver-700: #ece6dc;
--color-indigo-100: #3f2a1a;
--color-indigo-700: #f0dcc8;

--color-red-100: #4a1f15;
--color-red-700: #f3b3a0;
--color-red-800: #f6c4b4;

--backdrop-color: rgba(0, 0, 0, 0.3);

--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
--shadow-md: 0px 0.6rem 2.4rem rgba(0, 0, 0, 0.3);
--shadow-lg: 0 2.4rem 3.2rem rgba(0, 0, 0, 0.4);

--image-grayscale: 10%;
--image-opacity: 90%;

--header-fade-rgb: 17, 24, 39;
--color-hero-bg: #16251f;

--color-accent-100: #3b2f1a;
--color-accent-600: #d9b36c;
  }
  
  
  --color-brand-50: #eef5f1;
  --color-brand-100: #d9ebe2;
  --color-brand-200: #b2d6c6;
  --color-brand-500: #2d8663;
  --color-brand-600: #1e6b4f;
  --color-brand-700: #185740;
  --color-brand-800: #134432;
  --color-brand-900: #0e3326;
  
  --border-radius-tiny: 4px;
  --border-radius-sm: 8px;
  --border-radius-md: 12px;
  --border-radius-lg: 16px;
  --border-radius-xl: 20px;

  /* The delete button. Not a status colour, so it does not flip in dark mode */
  --color-danger: #9b3b23;
  --color-danger-hover: #7d2e1a;

  /* Numbers line up in columns, so a list of prices reads straight down */
  --font-numbers: "Poppins", sans-serif;

  /* Serif, for page titles only. Everything else stays on Poppins. */
  --font-display: "Playfair Display", Georgia, serif;

  /* Gold on top of the dark wash of the hero photograph, where the normal
     accent is too dim to read. */
  --color-accent-on-photo: #e3c589;

}

*,
*::before,
*::after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;

  
  transition: background-color 0.3s, border 0.3s;
}

html {
  font-size: 62.5%;
}

body {
  font-family: "Poppins", sans-serif;
  color: var(--color-grey-700);

  transition: color 0.3s, background-color 0.3s;
  min-height: 100vh;
  line-height: 1.5;
  font-size: 1.6rem;

  /* The serif draws old-style figures by default (001 looks like oo1) */
  font-variant-numeric: lining-nums;
}

input,
button,
textarea,
select {
  font: inherit;
  color: inherit;
}

button {
  cursor: pointer;
}

*:disabled {
  cursor: not-allowed;
}

select:disabled,
input:disabled {
  background-color: var(--color-grey-200);
  color: var(--color-grey-500);
}

input:focus,
button:focus,
textarea:focus,
select:focus {
  outline: 2px solid var(--color-brand-600);
  outline-offset: -1px;
}

button:has(svg) {
  line-height: 0;
}

a {
  color: inherit;
  text-decoration: none;
}

ul {
  list-style: none;
}

p,
h1,
h2,
h3,
h4,
h5,
h6 {
  overflow-wrap: break-word;
  hyphens: auto;
}

img {
  max-width: 100%;

  
  filter: grayscale(var(--image-grayscale)) opacity(var(--image-opacity));
}

`;

export default GlobalStyles;
