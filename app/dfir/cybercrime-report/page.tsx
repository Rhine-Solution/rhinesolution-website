import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd, { breadcrumbJsonLd } from "@/components/JsonLd";
import { getContent, defaultLocale } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";

export const metadata: Metadata = {
  title: "Cybercrime and Cybersecurity Report",
  description:
    "Keuzedeel K1352 research report: how the internet works, what cybercrime is, the scale of the problem, and how to protect against it.",
};

const journey = [
  {
    step: 1,
    title: "Your device",
    body: "The device splits the message (a photo, an email) into small chunks called packets. Each packet is like a letter in an envelope, with header info showing where it came from and where it is going.",
  },
  {
    step: 2,
    title: "Radio waves to the router",
    body: "On Wi-Fi, the packets leave the device as radio waves and arrive at the router. On mobile data they go to a nearby cell tower instead.",
  },
  {
    step: 3,
    title: "Router to modem",
    body: "The router is the traffic manager of the home network. The modem is the translator: it converts the signals into a form that can travel over the provider's cables.",
  },
  {
    step: 4,
    title: "The ISP network",
    body: "The modem sends the data over coaxial or fiber cables to the internet service provider (ISP), which picks the most efficient route for the packets.",
  },
  {
    step: 5,
    title: "Regional hubs",
    body: "The data arrives at large data centers that exchange traffic between networks. These hubs connect to the internet backbone.",
  },
  {
    step: 6,
    title: "Submarine cables",
    body: "For data crossing continents, the backbone includes huge cables on the ocean floor, laid and repaired by special ships. Data travels through them as light pulses in thin glass fibers.",
  },
  {
    step: 7,
    title: "Destination",
    body: "The packets reach the other side, are re-assembled in the correct order, and the recipient's device shows the message.",
  },
];

const protocols = [
  { term: "Binary", body: "Inside a device all information is stored as ones and zeros. The device translates those into radio waves or electrical signals to send them out." },
  { term: "IP address", body: "Every device gets a unique number, like a postal address. Routers use it to forward each packet to the correct place." },
  { term: "TCP", body: "TCP (Transmission Control Protocol) makes sure packets arrive in the right order and that nothing is missing — the receiver confirms every packet and missing ones are resent." },
  { term: "DNS", body: "The Domain Name System is the internet's phonebook. It translates names like www.example.com into the IP address a computer actually needs." },
  { term: "Servers", body: "Websites, apps and files live on servers — powerful computers that stay online. When you visit a page, your device asks the server to send it, and it comes back as packets." },
];

const connections: { cells: string[] }[] = [
  { cells: ["Connection", "How it works", "Strengths", "Weaknesses"] },
  { cells: ["Cable", "Uses the same coaxial cables as cable TV; a modem converts the signal.", "Fast (up to 1 Gbps) and widely available.", "Upload is slow; neighbors share the connection, so speeds drop in the evening."] },
  { cells: ["Fiber", "Sends data as light pulses through glass fibers.", "Fastest option (up to 10 Gbps), equal upload/download, little signal loss.", "Not available everywhere; laying new fiber is expensive."] },
  { cells: ["DSL", "Uses the existing copper telephone lines.", "Very widely available and does not block the phone line.", "Slower; speed depends on distance to the provider's exchange."] },
  { cells: ["Satellite", "Beams data from satellites in orbit to a dish at your home.", "Works almost anywhere, which helps rural areas.", "High latency because data travels to space and back; storms interrupt it."] },
  { cells: ["Fixed wireless", "Radio signals between a base station and an antenna at the home.", "Good for areas without cables; lower latency than satellite.", "Trees, buildings and weather can weaken the signal."] },
  { cells: ["5G home", "Uses mobile networks to connect a household.", "Fast to deploy without digging; high speeds and low latency.", "Coverage is still limited and depends on distance and congestion."] },
];

const crimeTypes: { cells: string[] }[] = [
  { cells: ["Type", "Description"] },
  { cells: ["Hacking", "Breaking into a computer system without permission, for personal gain or to cause damage."] },
  { cells: ["Phishing", "Fake emails or messages that look like they come from a real company (like a bank), used to trick people into giving away passwords or personal data."] },
  { cells: ["Ransomware", "Malicious software that locks your files and demands money to give them back. The WannaCry attack in 2017 is a well-known example."] },
  { cells: ["DDoS attacks", "Flooding a website or service with so much traffic that it goes down, often using networks of infected computers (botnets)."] },
  { cells: ["Identity theft", "Stealing personal details to commit fraud, for example opening accounts or taking loans in the victim's name."] },
  { cells: ["Cyberstalking", "Repeatedly following, threatening or intimidating someone through the internet."] },
  { cells: ["Digital piracy", "Downloading or sharing protected content — movies, music, software — without permission."] },
  { cells: ["Cyber-extortion", "Hacking a system or email server and demanding money to give it back or keep the data secret."] },
  { cells: ["Cyber-terrorism", "Hacking government systems or large organizations to push political goals and create fear."] },
  { cells: ["Money laundering", "Cleaning illegally earned money through the internet and digital banking so it looks legal."] },
  { cells: ["Child grooming", "Building an emotional connection with a child online, often to abuse or traffic them."] },
];

const scaleFacts: { cells: string[] }[] = [
  { cells: ["Fact", "Figure / Source"] },
  { cells: ["Global cost of cybercrime in 2024", "About $9.5 trillion per year — expected to rise another 15% in 2025 (Cybersecurity Ventures)."] },
  { cells: ["WannaCry ransomware attack (2017)", "Infected 230,000+ computers across 150 countries; over $4 billion in economic losses."] },
  { cells: ["Internet users in 2005", "About 1 billion people (16% of the world's population)."] },
  { cells: ["Internet users in 2023", "About 5.4 billion people (67% of the world's population)."] },
  { cells: ["Adult internet usage", "Grew from ~52% (2000) to ~96% (2024)."] },
  { cells: ["Internet's direct economic contribution", "~$175 billion per year from advertising, online retail and ISP payments; ripple effect ~$444 billion."] },
];

const theories: { cells: string[] }[] = [
  { cells: ["Theory", "Core idea", "How it explains cybercrime"] },
  { cells: ["General theory of crime (low self-control)", "Some people act impulsively, take risks and want quick rewards without thinking about consequences.", "Cybercrime offers fast money, and the internet lets criminals act without seeing the harm. Studies consistently link low self-control to cyber offending."] },
  { cells: ["Social learning theory", "Crime is learned from others — behavior is copied when it seems to work.", "If friends or online communities approve of hacking or piracy, people are more likely to do it too, especially when it seems to go unpunished."] },
  { cells: ["Routine activity theory", "Crime happens when a motivated offender, a suitable target and no capable guardian come together.", "Online, weak passwords, clicking phishing links and outdated software make you a suitable target. Security software and careful habits are the guardian."] },
];

const hackerTypes = [
  { name: "Cyber utopians", body: "people who do malicious things but believe they act \"for the common good\"." },
  { name: "Cyber punks", body: "hackers who target institutions they find offensive, often just for fun or to make a point." },
  { name: "Cyber spies and cyber terrorists", body: "highly skilled attackers with extreme motives, often working for states or political causes." },
];

const individualMeasures = [
  "Use strong, unique passwords for every account and change them regularly — a password manager helps.",
  "Turn on two-factor authentication (2FA) wherever possible, so a stolen password alone is not enough.",
  "Keep everything updated: operating system, apps and antivirus, because updates fix known security holes.",
  "Think before you click: do not open links or attachments you did not expect, even if they look like they come from your bank.",
  "Only enter personal data on secure sites — check for the padlock and \"https\" in the address bar.",
  "Avoid unsecured public Wi-Fi for banking; use a VPN if you must use it.",
  "Make backups, so ransomware cannot lock you out of your data for good.",
];

const orgMeasures = [
  "A clear security architecture and network diagram so the environment is understood.",
  "Security policies and a risk management policy that say how risks are identified and handled.",
  "Regular risk assessments and security audits.",
  "Backup and restore procedures plus a disaster recovery plan, so the organization can recover after an attack.",
  "Training for staff — people are the weakest link, and a trained employee is less likely to fall for phishing.",
  "Incident management, so when something goes wrong the response is quick, contained and documented.",
];

const references = [
  { label: "Tsotetsi, K. \"Understanding the Internet: A Journey from Devices to Submarine Cables.\"", href: "https://vocal.media/fyi/understanding-the-internet-a-journey-from-devices-to-submarine-cables" },
  { label: "Lefelhoc, C. \"How Does Cable Internet Work?\"", href: "https://www.compareinternet.com/blog/how-does-cable-internet-work/" },
  { label: "Fann, K. \"How Does the Internet Work? A Complete Guide.\" BroadbandNow.", href: "https://broadbandnow.com/guides/how-does-the-internet-work" },
  { label: "Tutorials Point. \"Cyber Crime & Cyber Security.\"", href: "https://www.tutorialspoint.com/fundamentals_of_science_and_technology/cyber_crime_and_cyber_security.htm" },
  { label: "Chen, S. et al. \"Exploring the global geography of cybercrime and its driving forces.\" (2023).", href: "https://www.nature.com/articles/s41599-023-01560-x" },
  { label: "Achuthan, K., Khobragade, S. & Kowalski, R. \"Cybercrime through the public lens: a longitudinal analysis.\" (2025).", href: "https://www.nature.com/articles/s41599-025-04459-x" },
  { label: "Onwuadiamu, G. \"Cybercrime in criminology; A systematic review of criminological theories, methods, and concepts.\" Journal of Economic Criminology 8 (2025) 100136.", href: "https://doi.org/10.1016/j.jeconc.2025.100136" },
  { label: "ResearchGate. \"Top 20 countries exposed to external attacks from malicious programs in 2014.\"", href: "https://www.researchgate.net/figure/Top-20-countries-exposed-to-external-attacks-from-malicious-programs-in-2014_fig1_331914032" },
];

export default function CybercrimeReportPage() {
  const content = getContent(defaultLocale);
  return (
    <>
      <Nav locale="en" brand={content.brand.name} labels={content.nav} />
      <JsonLd
        data={breadcrumbJsonLd("en", [
          { name: "Home", path: "/en" },
          { name: "RAGNAROK", path: "/en/team/ragnarok" },
          { name: "Cybercrime Report", path: "/dfir/cybercrime-report" },
        ])}
      />
      <main id="main" className="container page">
        <header className="dfir-hero">
          <p className="section-eyebrow">
            <Link href="/en/team/ragnarok" style={{ color: "inherit" }}>RAGNAROK</Link> · Cyber Security
          </p>
          <h1>Cybercrime and Cybersecurity Report</h1>
          <p className="dfir-lead">
            Keuzedeel K1352 research report. How the internet works from zero, what cybercrime is,
            how big the problem really is, who commits it and why, and what people and organizations
            can do to protect themselves.
          </p>
          <div className="dfir-meta">
            <span><strong>Course</strong> K1352 · Basis cybercriminaliteit en cyberveiligheid</span>
            <span><strong>Title</strong> Cybercrime and Cybersecurity</span>
            <span><strong>Language</strong> English</span>
            <span><strong>Report date</strong> Sep 2026</span>
          </div>
        </header>

        <section>
          <h2>Executive Summary</h2>
          <p>
            Almost everything we do today involves the internet, yet the internet is not something that
            just &quot;exists&quot; — it is a physical network of cables, routers, data centers and devices. And
            wherever people gather, there is also crime. This report explains the journey data takes from
            a device to the submarine cables under the ocean, then looks at what cybercrime is, the main
            types, the scale of the problem with real numbers, who commits it and why, where it comes
            from, how the public reacts, and finally how to protect against it.
          </p>
        </section>

        <section>
          <h2>1 · The Internet from Zero</h2>
          <h3>1.1 What the internet is</h3>
          <p>
            The internet is a giant network of computers that exchange information. When a phone, laptop
            or smart TV is online, it becomes part of that network. A useful metaphor is a road system:
            local roads (the home network), highways (the provider&apos;s network) and international routes
            (the cables under the ocean). Data travels like cars, and if one road is blocked, the data
            re-routes through another path — which is why the internet rarely stops completely.
          </p>
          <p>
            The internet and the World Wide Web are not the same thing. The internet is the physical
            network and its rules; the Web is just one service on top of it, the one browsers use for
            websites. Email, gaming and streaming are other services that also run on the internet.
          </p>

          <h3>1.2 The journey of a message</h3>
          <p>
            Sending a picture to a friend on the other side of the world happens in steps — the message
            never travels as one piece:
          </p>
          <ol className="dfir-steps">
            {journey.map((j) => (
              <li key={j.step}>
                <strong>{j.step}. {j.title}.</strong> {j.body}
              </li>
            ))}
          </ol>
          <p className="dfir-note">
            So every message travels through a mix of radio waves, copper wires, glass fibers and undersea
            cables. It only feels wireless to us.
          </p>

          <h3>1.3 Packets, IP addresses and protocols</h3>
          <p>Two things make all of this possible: packets and protocols.</p>
          <ul className="dfir-conclusion">
            {protocols.map((p) => (
              <li key={p.term}><strong>{p.term}:</strong> {p.body}</li>
            ))}
          </ul>

          <h3>1.4 Different ways to connect</h3>
          <DfirTable caption="Connection types compared" rows={connections} />
          <p className="dfir-note">
            One common theme: upload speeds, shared bandwidth and rural coverage are the weak spots of
            almost every technology.
          </p>

          <h3>1.5 The &quot;last mile&quot;</h3>
          <p>
            The final stretch from the provider&apos;s network to the home is called the &quot;last mile&quot;. It is
            the most expensive part to build, which is why cities get fiber while rural and poor areas get
            slower connections or none at all. Newer technologies such as microwave links and 5G help
            close the gap, but basic internet access is still a problem in many parts of the world.
          </p>
          <figure className="dfir-figure">
            <Image
              src="/dfir/a-brief-history-of-the-internet-graphic-768x1296.jpg"
              alt="Infographic: a brief history of the internet"
              width={768}
              height={1296}
            />
            <figcaption>Figure 1 · A brief history of the internet (infographic from BroadbandNow).</figcaption>
          </figure>
        </section>

        <section>
          <h2>2 · What is Cybercrime</h2>
          <p>
            Cybercrime is crime that involves computers, the internet or other digital technology. It can
            be aimed at individuals, companies or governments, and it can cause financial damage, reputational
            damage, or mental harm. Definitions vary between countries, which makes it hard to measure, but
            experts usually split cybercrime into two groups:
          </p>
          <ul className="dfir-conclusion">
            <li><strong>Cyber-dependent crime:</strong> crimes that can only exist because of computers and networks — hacking, DDoS attacks, malware. Without the internet these crimes would not exist.</li>
            <li><strong>Cyber-enabled crime:</strong> traditional crimes that moved online or got easier — online fraud, phishing, digital piracy, cyberbullying. They existed before, but the internet lets criminals do them faster, cheaper and to more victims at once.</li>
          </ul>
          <p>
            Criminologist David Wall describes four categories of cybercrime: cyber trespass (getting into
            systems you are not allowed to enter), cyber deception or theft (stealing things online, like
            credit card data), cyber pornography or obscenity (sharing sexual material online), and cyber
            violence (causing emotional or psychological harm, such as cyberstalking — the victim may not
            be physically hurt but can suffer lasting damage).
          </p>
        </section>

        <section>
          <h2>3 · Types of Cybercrime</h2>
          <p>The most common types of cybercrime are:</p>
          <DfirTable caption="Overview of cybercrime types" rows={crimeTypes} />
        </section>

        <section>
          <h2>4 · The Scale of the Problem</h2>
          <p>Cybercrime is not a small problem. The numbers are enormous and still growing:</p>
          <DfirTable caption="Key facts and figures" rows={scaleFacts} />
          <p className="dfir-note">
            Internet growth also means more potential victims: from about 1 billion people online in 2005
            to roughly 5.4 billion in 2023. Cybercrime is effectively a trillion-dollar industry for
            criminals, and almost everyone connected is a potential target.
          </p>
        </section>

        <section>
          <h2>5 · Who Commits Cybercrime and Why</h2>
          <h3>5.1 Social and economic drivers</h3>
          <p>
            A 2023 study that mapped cybercrime worldwide found it is strongly linked to a country&apos;s
            development. Better internet infrastructure, higher education levels and more internet users all
            mean more cybercrime, because criminals have better tools and more targets. At the same time,
            poverty, unemployment and income inequality push people in poorer regions into cybercrime as a
            way to make money — for example young people in parts of West Africa who turn to online fraud
            because they cannot find other work. Politics matters too: weak law enforcement, high corruption
            and little international police cooperation make it easier for criminals to operate unpunished.
          </p>
          <h3>5.2 Criminological explanations</h3>
          <DfirTable caption="Three theories that explain cybercrime" rows={theories} />
          <h3>5.3 Types of hackers</h3>
          <p>Not every hacker has the same motivation:</p>
          <ul className="dfir-conclusion">
            {hackerTypes.map((h) => (
              <li key={h.name}><strong>{h.name}</strong> — {h.body}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>6 · Where Cybercrime Comes From</h2>
          <p>
            Because the internet has no borders, it is hard to say exactly where a cybercriminal sits.
            Criminals hide with VPNs, proxies, or by attacking through infected computers in other countries.
            Still, researchers mapped the IP addresses known for malicious activity. Most are located in
            North America, Central and Eastern Europe, East Asia, India and eastern Australia. On a
            continental level, North America and Europe host the most, and high-income regions host the
            majority of malicious IPs. In other words, the richest, most connected countries are both the
            biggest targets and the biggest source locations of cybercrime infrastructure.
          </p>
          <figure className="dfir-figure dfir-figure--wide">
            <Image
              src="/dfir/top-20-countries-malicious-programs-2014.png"
              alt="Top 20 countries exposed to external attacks from malicious programs in 2014"
              width={850}
              height={381}
            />
            <figcaption>Figure 2 · Top 20 countries exposed to external attacks from malicious programs in 2014 (source: ResearchGate).</figcaption>
          </figure>
          <p className="dfir-note">
            Important nuance: these IP-based maps show where attacks originate from, not necessarily where
            the criminals live. A criminal in one country can easily attack from servers in another — exactly
            why fighting cybercrime is so hard for the police.
          </p>
        </section>

        <section>
          <h2>7 · How People React to Cybercrime</h2>
          <p>
            Cybercrime costs money, but it also affects people emotionally. A 2025 study analyzed more than
            6,700 posts and 100,000 comments about cybercrime on Reddit, spread over 14 years (2008–2022).
            The findings:
          </p>
          <ul className="dfir-conclusion">
            <li>The biggest discussions were triggered by data breaches, cyber-attacks, ransomware, and hacking linked to countries (Russian or Chinese state hacking).</li>
            <li>The most common emotion was <strong>anger</strong>, aimed at privacy violations, companies that failed to protect data, and governments that handled threats badly.</li>
            <li><strong>Sarcasm</strong> was the second most common reaction, mostly toward official narratives and ineffective security measures.</li>
            <li><strong>Fear</strong> was also clearly present, showing that people feel genuinely threatened.</li>
          </ul>
          <p>
            Cyberattacks can seriously damage public trust in companies and governments, and emotional
            reactions can even push support for stronger cybersecurity policies.
          </p>
        </section>

        <section>
          <h2>8 · Cybersecurity: How to Protect Yourself</h2>
          <p>
            Cybersecurity is everything we do to protect computers, networks, programs and data from
            unauthorized access, damage or theft. It is the &quot;guardian&quot; from routine activity theory —
            without it, the attacker has a much easier job.
          </p>
          <h3>8.1 For individuals</h3>
          <ul className="dfir-conclusion">
            {individualMeasures.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
          <h3>8.2 For organizations</h3>
          <ul className="dfir-conclusion">
            {orgMeasures.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
          <p className="dfir-note">
            Cybersecurity is not a one-time job. It is a continuous process of spotting threats, fixing
            weaknesses and staying up to date, because the attackers keep changing their methods.
          </p>
        </section>

        <section>
          <h2>9 · Conclusion</h2>
          <p>
            The internet is a physical network of cables, routers and data centers that connects almost the
            whole world, and understanding the journey from a device to the submarine cables under the ocean
            helps explain where cybercrime comes from. Cybercrime is a massive, growing problem costing
            around $9.5 trillion a year, driven by both opportunity and hardship. Criminological theories
            show that low self-control, learning from others and the lack of a &quot;guardian&quot; all play a role —
            which is exactly why good cybersecurity habits work: they take away the opportunity.
          </p>
          <p>
            For a software developer, and for anyone online, the lesson is simple. Know how the technology
            works, recognize the threats, and protect yourself and your users with strong passwords, updates,
            backups and awareness. Most attacks succeed only because of simple mistakes that are easy to
            prevent.
          </p>
        </section>

        <section>
          <h2>10 · References</h2>
          <ul className="dfir-conclusion">
            {references.map((r) => (
              <li key={r.href}>
                <a href={r.href} target="_blank" rel="noopener noreferrer">{r.label}</a>
              </li>
            ))}
          </ul>
          <p className="dfir-note">
            Figures: &quot;A brief history of the internet&quot; (BroadbandNow) and &quot;Top 20 countries exposed to
            external attacks from malicious programs in 2014&quot; (ResearchGate). Facts are collected from the
            sources above and rewritten in this report&apos;s own words.
          </p>
        </section>

        <div className="dfir-cta">
          <Link href="/en/team" className="btn btn-secondary">Back to the team</Link>
          <Link href="/en/team/ragnarok" className="btn btn-primary">View RAGNAROK profile</Link>
        </div>
      </main>
      <Footer locale="en" brand={content.brand.name} tagline={content.footer_columns.brand_tagline} navLabels={content.nav} footerColumns={content.footer_columns} socials={getCompanySocials(content)} socialHeading={content.footer.social_heading} />
    </>
  );
}

function DfirTable({ caption, rows }: { caption: string; rows: { cells: string[] }[] }) {
  return (
    <div className="dfir-table-wrap">
      <table className="dfir-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {(rows[0]?.cells ?? []).map((cell, i) => (
              <th key={i}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row, ri) => (
            <tr key={ri}>
              {row.cells.map((cell, ci) => (
                <td key={ci}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}