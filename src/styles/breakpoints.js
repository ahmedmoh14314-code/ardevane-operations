// All the widths the app bends at, in one place.
export const BREAKPOINTS = {
  phone: 480,
  tablet: 768,
  laptop: 1024,
};

// Ready-made media queries. Use them inside a styled component:
//
//   ${below.tablet} {
//     display: none;
//   }
//
export const below = {
  phone: `@media (max-width: ${BREAKPOINTS.phone - 1}px)`,
  tablet: `@media (max-width: ${BREAKPOINTS.tablet - 1}px)`,
  laptop: `@media (max-width: ${BREAKPOINTS.laptop - 1}px)`,
};

export const above = {
  phone: `@media (min-width: ${BREAKPOINTS.phone}px)`,
  tablet: `@media (min-width: ${BREAKPOINTS.tablet}px)`,
  laptop: `@media (min-width: ${BREAKPOINTS.laptop}px)`,
};
