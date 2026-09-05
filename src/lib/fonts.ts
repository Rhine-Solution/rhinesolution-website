import localFont from "next/font/local";

export const rijksSans = localFont({
  src: "../../fonts/rijksoverheids-sans-text-regular.ttf",
  variable: "--font-rijks-sans",
});

export const rijksHeading = localFont({
  src: "../../fonts/rijksoverheids-heading-bold.ttf",
  variable: "--font-rijks-heading",
});

export const rijksSerif = localFont({
  src: [
    { path: "../../fonts/rijksoverheids-serif-regular.ttf", weight: "400", style: "normal" },
    { path: "../../fonts/rijksoverheids-serif-italic.ttf", weight: "400", style: "italic" },
  ],
  variable: "--font-rijks-serif",
});