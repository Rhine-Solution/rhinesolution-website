export type DfirChartType = "timeline" | "country" | "growth";

export const TIMELINE_EVENTS: { year: number; event: string }[] = [
  { year: 1969, event: "ARPANET sends its first message from one network to another." },
  { year: 1970, event: "The ARPANET network is established." },
  { year: 1971, event: "Ray Tomlinson develops the standard email address format." },
  { year: 1973, event: "ARPANET makes its first trans-Atlantic connection." },
  { year: 1974, event: "TCP and IP are introduced." },
  { year: 1977, event: "Dennis Hayes and Dale Heatherington develop the first PC modem." },
  { year: 1978, event: "Gary Thuerk sends the first spam message." },
  { year: 1984, event: "DNS is created; John Postel introduces first top-level domains (.com, .org, .gov, .edu, .mil)." },
  { year: 1989, event: "AOL is launched." },
  { year: 1991, event: "Tim Berners-Lee's World Wide Web goes live." },
  { year: 1993, event: "The first web browser, Mosaic, is invented." },
  { year: 1994, event: "WebCrawler (first search engine) goes live; Netscape launches." },
  { year: 1995, event: "Amazon and eBay (AuctionWeb) go live." },
  { year: 1996, event: "Hotmail becomes the first free, web-based email provider." },
  { year: 1997, event: "Wireless internet (Wi-Fi) is introduced." },
  { year: 2001, event: "Wikipedia goes live." },
  { year: 2004, event: "Facebook goes live." },
  { year: 2005, event: "YouTube goes live." },
];

export const COUNTRY_DATA: { country: string; share: number }[] = [
  { country: "USA", share: 23 },
  { country: "China", share: 9 },
  { country: "Germany", share: 6 },
  { country: "Britain", share: 5 },
  { country: "Brazil", share: 4 },
  { country: "Spain", share: 4 },
  { country: "France", share: 3 },
  { country: "Italy", share: 3 },
  { country: "Turkey", share: 3 },
  { country: "Poland", share: 3 },
  { country: "India", share: 3 },
  { country: "Russia", share: 2 },
  { country: "Canada", share: 2 },
  { country: "South Korea", share: 2 },
  { country: "Taiwan", share: 2 },
  { country: "Japan", share: 2 },
  { country: "Mexico", share: 2 },
  { country: "Argentina", share: 1 },
  { country: "Australia", share: 1 },
  { country: "Israel", share: 1 },
];

export const GROWTH_DATA: { year: number; users: number }[] = [
  { year: 2005, users: 1.0 },
  { year: 2023, users: 5.4 },
];

export function wrapText(str: string, maxChars: number): string[] {
  const words = str.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars && line) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}