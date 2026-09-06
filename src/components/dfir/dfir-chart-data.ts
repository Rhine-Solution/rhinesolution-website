export type DfirChartType = "timeline" | "country" | "growth" | "journey" | "taxonomy" | "routine";

export const JOURNEY_STEPS: { step: number; title: string; body: string }[] = [
  { step: 1, title: "Your device", body: "splits the message into small packets, each with header info showing where it came from and where it is going." },
  { step: 2, title: "Radio waves", body: "on Wi-Fi the packets leave as radio waves to the router; on mobile data they go to a nearby cell tower." },
  { step: 3, title: "Router and modem", body: "the router manages the home network; the modem converts the signals for the provider's cables." },
  { step: 4, title: "ISP network", body: "the provider picks the most efficient route for the packets over coaxial or fiber cables." },
  { step: 5, title: "Regional hubs", body: "large data centers exchange traffic between networks and connect to the internet backbone." },
  { step: 6, title: "Submarine cables", body: "for cross-continent data, the backbone includes huge cables on the ocean floor; data travels as light pulses in glass fibers." },
  { step: 7, title: "Destination", body: "the packets are re-assembled in the correct order and the recipient's device shows the message." },
];

export const TAXONOMY_ROOT = { label: "Cybercrime", x: 0, y: 0 };

export const TAXONOMY_BRANCHES: { label: string; x: number; y: number; children: { label: string; x: number; y: number }[] }[] = [
  {
    label: "Cyber-dependent crime",
    x: 1,
    y: -2,
    children: [
      { label: "Hacking", x: 2, y: -3 },
      { label: "DDoS attacks", x: 2, y: -2 },
      { label: "Malware", x: 2, y: -1 },
    ],
  },
  {
    label: "Cyber-enabled crime",
    x: 1,
    y: 0,
    children: [
      { label: "Online fraud", x: 2, y: -0.5 },
      { label: "Phishing", x: 2, y: 0 },
      { label: "Digital piracy", x: 2, y: 0.5 },
      { label: "Cyberbullying", x: 2, y: 1 },
    ],
  },
  {
    label: "Wall's four categories",
    x: 1,
    y: 2,
    children: [
      { label: "Cyber trespass", x: 2, y: 1.5 },
      { label: "Cyber deception / theft", x: 2, y: 2 },
      { label: "Cyber pornography / obscenity", x: 2, y: 2.5 },
      { label: "Cyber violence", x: 2, y: 3 },
    ],
  },
];

export const ROUTINE_NODES: { label: string; role: string; x: number; y: number }[] = [
  { label: "Motivated offender", role: "motivated offender", x: 0, y: 1.6 },
  { label: "Suitable target", role: "suitable target", x: -1.5, y: -0.8 },
  { label: "Capable guardian", role: "capable guardian (absent)", x: 1.5, y: -0.8 },
  { label: "Crime happens", role: "result", x: 0, y: -0.2 },
];

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