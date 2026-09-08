// Rhine Solution FAQ content — replaces hubtown real-estate FAQ copy in faqs/faqs-hubtown.html.
// Pairs: [hubtown question+answer block start marker, rhine replacement]. Applied via replace of
// the exact <h2>...question...</h2> + answer paragraph inside the accordion body.
// Each entry: [fromQuestion, toQuestion, fromAnswer, toAnswer] — applied with the html text
// matched from the accordion-body <p> content. We replace question H2 text and answer paragraph.

module.exports = [
  {
    q: 'Is Hubtown Limited a RERA-approved real estate developer?',
    qr: 'Is Rhine Solution a registered company?',
    a: 'Yes, Hubtown Limited is a RERA-compliant real estate developer and many of its projects are registered with the respective state RERA authorities.',
    ar: 'Rhine Solution is a two-person studio based in Rotterdam, the Netherlands. We operate as a lean, focused company that keeps its own structure simple so projects stay fast and decisions stay clear.',
  },
  {
    q: 'What types of properties does Hubtown develop?',
    qr: 'What does Rhine Solution build?',
    a: 'Hubtown Limited develops a diverse portfolio of residential apartments, commercial spaces, retail developments, luxury residences and integrated township projects across India. With a strong presence across multiple real estate segments, Hubtown Limited offers thoughtfully designed developments that cater to the evolving needs of homebuyers, businesses and investors.',
    ar: 'We build custom web applications, portfolios, portals, and digital products \u2014 from first sketch to live deploy. Typical work includes company websites, web apps, internal tools, and AI-assisted workflows. We take on a few projects a year and finish them properly.',
  },
  {
    q: "Where are Hubtown's projects located?",
    qr: 'Where is Rhine Solution based?',
    a: "Hubtown Limited's projects are strategically located across key markets in India, including Mumbai, Thane, Pune, and Gujarat. These developments are situated in well-connected locations with access to business districts, transportation networks, educational institutions, healthcare facilities and lifestyle amenities.",
    ar: 'We are based in Rotterdam, the Netherlands, and work with clients worldwide. Everything is remote-first: a shared repo, a video call, and a direct line to the builders who are actually doing the work.',
  },
  {
    q: 'Why should I choose Hubtown as my real estate developer?',
    qr: 'Why should I choose Rhine Solution?',
    a: 'Hubtown Limited is a trusted real estate developer with a strong legacy of delivering residential, commercial, retail and integrated township projects across India. With a focus on quality construction, prime locations, customer satisfaction, transparency and innovation, Hubtown has earned the trust of homebuyers and investors alike.',
    ar: 'You talk to the builders, not a salesperson. Two people own every project end to end \u2014 strategy, design, code, and deployment. Decisions are documented in our Obsidian Brain, and everything we ship is real, running production code.',
  },
  {
    q: 'How many years of experience does Hubtown have in real estate development?',
    qr: 'How much experience does the Rhine Solution team have?',
    a: 'Hubtown Limited has over 40 years of experience in real estate development, with a diverse portfolio of residential, commercial, retail and integrated township projects across India. Recognized as a trusted real estate developer, Hubtown has built a strong reputation for delivering quality developments and creating long-term value for customers and investors.',
    ar: 'The founders have shipped software across many years and many stacks \u2014 TypeScript, Next.js, Node, pure CSS, and more. What matters isn\u2019t the years but the track record: every Rhine project ends up live in production.',
  },
  {
    q: 'Which Hubtown Limited projects offer ready-to-move-in homes?',
    qr: 'What kind of projects has Rhine Solution shipped?',
    a: 'Hubtown Limited offers ready-to-move-in homes in select projects, including Rising City (Ghatkopar East), Hubtown Seasons (Chembur), Hubtown Premier Residences (Worli), and other completed developments, subject to availability. For the latest inventory, pricing and possession status, it is recommended to check the specific project details or contact the Hubtown Limited sales team.',
    ar: 'Shipped work includes Plan2Shift, The Brain, Music Trends Local, Mac Mini AI Infrastructure, rhinesolution.com, a Cybercrime & Cybersecurity Report, and Spendtracker. Each one is live and maintained, not a mockup.',
  },
  {
    q: 'What are the key benefits of buying a home from a reputed developer like Hubtown Limited?',
    qr: 'What are the benefits of working with a two-person studio?',
    a: 'Buying a home from a trusted real estate developer like Hubtown Limited offers benefits such as quality construction, transparent processes, RERA-compliant projects, strategic locations and long-term value appreciation. With over 40 years of real estate development experience, Hubtown Limited is committed to delivering reliable and well-planned developments.',
    ar: 'No layers between you and the people who write the code. Faster decisions, lower overhead, and a direct line to whoever is responsible. We keep scope tight, document every decision, and deliver working software.',
  },
  {
    q: 'Does Hubtown develop luxury residential projects?',
    qr: 'Does Rhine Solution work on complex or large projects?',
    a: 'Yes, Hubtown Limited develops luxury residential projects designed to offer premium living experiences with modern architecture, high-quality construction, world-class amenities and prime locations. The company\u2019s portfolio includes luxury developments across key markets, catering to the evolving lifestyle needs of discerning homebuyers.',
    ar: 'We take on complex projects that benefit from careful architecture \u2014 custom web apps, AI-assisted workflows, and systems that need to keep working. Small team, high standard, shipped work.',
  },
  {
    q: "Are Hubtown Limited's projects a good investment opportunity?",
    qr: 'Is Rhine Solution a good fit for my project?',
    a: "Yes, Hubtown Limited's projects can be a good investment opportunity due to their strategic locations, quality development, strong connectivity and potential for long-term value appreciation. With over 40 years of real estate development experience, Hubtown has established itself as a trusted real estate developer, offering residential, commercial and retail developments across key markets in India.",
    ar: 'If you want a website, a web app, or a digital product built properly and kept alive, yes. We take on a few projects a year, so availability is limited \u2014 reach out early and we\u2019ll tell you honestly whether we\u2019re a fit.',
  },
  {
    q: 'What amenities are typically offered in Hubtown residential projects?',
    qr: 'What does a typical engagement look like?',
    a: 'Hubtown residential projects typically offer a range of modern lifestyle amenities, including clubhouses, landscaped gardens, fitness centers, swimming pools, children\u2019s play areas, sports facilities and 24/7 security systems. Amenities may vary by project, but they are designed to enhance comfort, convenience and the overall living experience for residents.',
    ar: 'A typical engagement starts with a plain-language proposal, then design, build, and deploy. You get a working site or app in production, with documentation in the Brain, and we stay available after launch for maintenance.',
  },
  {
    q: 'Does Hubtown undertake redevelopment projects in Mumbai?',
    qr: 'Do you take on redesigns or rebuilds?',
    a: 'Yes, Hubtown Limited undertakes redevelopment projects in Mumbai.',
    ar: 'Yes. Rebuilding or migrating an existing site is common for us \u2014 cleaning up dependencies, moving to a better stack, or fully re-platforming a product. We keep what works and rebuild what doesn\u2019t.',
  },
  {
    q: "Are Hubtown Limited's projects well-connected?",
    qr: 'How do we communicate during a project?',
    a: 'Yes, Hubtown projects are strategically located with excellent connectivity to business hubs, metro stations, highways, schools, hospitals and daily conveniences.',
    ar: 'Direct and fast. You\u2019re in contact with the builders throughout \u2014 status updates, decisions logged in the Brain, and a reply within a day, usually faster.',
  },
  {
    q: 'Are Hubtown projects designed for family living?',
    qr: 'Is the process suitable for non-technical founders?',
    a: 'Yes, Hubtown projects are thoughtfully designed with spacious layouts, lifestyle amenities and easy access to essential social infrastructure.',
    ar: 'Absolutely. We explain things in plain language, no jargon. You don\u2019t need to understand code \u2014 you need to know what you want to achieve, and we handle the rest.',
  },
  {
    q: 'How does Hubtown ensure quality construction?',
    qr: 'How do you ensure quality?',
    a: 'Hubtown follows stringent quality standards, uses premium materials and implements rigorous quality checks throughout the construction process.',
    ar: 'Tests, code review, and a documented workflow. Every decision lives in the Obsidian Brain, every change is verified before it ships, and nothing goes live that we wouldn\u2019t want to maintain ourselves.',
  },
  {
    q: 'What should homebuyers consider before choosing a real estate developer?',
    qr: 'What should I consider before choosing a development partner?',
    a: "Homebuyers should evaluate the developer's track record, project quality, timely delivery, RERA compliance, location advantages, customer reviews and after-sales support. Choosing a trusted developer like Hubtown Limited can help ensure a reliable and transparent homebuying experience.",
    ar: 'Look for shipped work you can actually visit, a process you understand, and people who are honest about scope and timelines. That\u2019s what we aim for \u2014 production code, clear communication, and a fair price.',
  },
  {
    q: 'Does Hubtown offer homes near major business districts in Mumbai?',
    qr: 'Do you work with clients outside the Netherlands?',
    a: 'Yes, several Hubtown projects enjoy excellent connectivity to key business districts such as BKC, CHEMBUR, South Mumbail, Andheri MIDC, and THANE',
    ar: 'Yes. We work remotely with clients worldwide. Time zones rarely matter \u2014 we overlap where it counts and keep everything documented so nobody waits on anyone.',
  },
  {
    q: 'How can I enquire about a Hubtown project?',
    qr: 'How can I start a project with Rhine Solution?',
    a: 'You can enquire about a Hubtown project by visiting the official website, microsite and submitting an enquiry form or contacting the sales team directly for assistance.',
    ar: 'Use the contact form on this site. You\u2019ll always reach a builder, not a salesperson. We\u2019ll reply with a plain-language proposal, and we usually respond within a day.',
  },
  {
    q: 'Is Hubtown one of the leading real estate developers in Mumbai?',
    qr: 'Is Rhine Solution a good studio?',
    a: 'Yes, with over four decades of experience, Hubtown is among Mumbai\u2019s established real estate developers with a diverse portfolio across residential, commercial & Retail and redevelopment projects.',
    ar: 'We\u2019re a small studio that ships. Every project ends up live in production, and every client talks to the people who build. That\u2019s the whole pitch \u2014 and it\u2019s enough.',
  },
];