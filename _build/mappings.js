// Content mappings: hubtown string -> Rhine string.
// Applied across SSR HTML + _payload*.json + route chunks + main bundle.
// Format: array of [from, to]. Longest matches win (sorted at apply time).

module.exports = {
  // ---- GLOBAL CHROME (every page HTML + main bundle + all payloads) ----
  chrome: [
    // brand / titles
    ['Hubtown Limited | Leading Real Estate Developer in India', 'Rhine Solution | Custom web development, portfolios, and digital experiences'],
    ['www.hubtown.co.in', 'www.rhinesolution.com'],
    ['WWW.HUBTOWN.CO.IN', 'WWW.RHINESOLUTION.COM'],
    ['https://hubtown-live.netlify.app', 'https://www.rhinesolution.com'],
    ['hubtown-live', 'rhinesolution'],
    // theatre studio staging API (dev-only; never fetched in production) — local stub anyway
    ['https://theatre-api.unseen.co', '/'],
    ['https://hubtown.co.in', 'https://www.rhinesolution.com'],
    // news images (Sanity CDN) -> local folder served by the merged site
    ['https://cdn.sanity.io/images', '/news-images'],
    // nav labels
    ['About Us', 'About'],
    ['Careers', 'Team'],
    ['Contact Us', 'Contact'],
    // fix hubtown nav bug: Projects link had title="Careers"
    ['title="Careers"><span class="sr-only">Projects</span>', 'title="Projects"><span class="sr-only">Projects</span>'],
    // footer heading
    ['Links', 'Navigate'],
    // footer link labels (repoint the removed filing-hub pages to real pages)
    ['Investor Relations', 'Contact'],
    ['Real Estate Regulation Policy', 'Studio'],
    ['Terms And Conditions', 'Terms'],
    ['Approvals', 'Team'],
    // careers -> team rename everywhere (nav, CTAs, footer)
    ['careers/index.html', 'team/index.html'],
    // client-side route + nav `to` + CTA + canonical still say /careers — repoint to /team
    ['"/careers"', '"/team"'],
    // fix hubtown SSR nav bug: Projects nav link had title="Careers" -> "Projects" in the BUNDLE
    // (runs before the short ['Careers','Team'] pair, so target the original mirror string)
    ['{to:"/projects",class:"font-mono text-off-blue",title:"Careers"', '{to:"/projects",class:"font-mono text-off-blue",title:"Projects"'],
    // removed pages' footer hrefs -> live pages
    ['investor-relations/index.html', 'contact/index.html'],
    ['regulation-policy/index.html', 'about/index.html'],
    ['approvals/index.html', 'team/index.html'],
    // removed pages' client-side footer hrefs (router-style, no index.html) -> live pages
    ['href:"/investor-relations"', 'href:"/contact"'],
    ['href:"/regulation-policy"', 'href:"/about"'],
    ['href:"/approvals"', 'href:"/team"'],
    // footer FAQ link: external live URL -> local page (offline)
    ['https://hubtown.co.in/faqs/faqs-hubtown.html', '/faqs/faqs-hubtown.html'],
    ['https://www.rhinesolution.com/faqs/faqs-hubtown.html', '/faqs/faqs-hubtown.html'],
    // emails
    ['careers@hubtown.co.in', 'info@rhinesolution.com'],
    ['contact@hubtown.co.in', 'info@rhinesolution.com'],
    // social links (footer + contact info)
    ['https://www.youtube.com/@hubtownlimitedd', 'https://www.youtube.com/@RhineSolutions'],
    ['https://www.youtube.com/@Hubtown_Limited', 'https://www.youtube.com/@RhineSolutions'],
    ['https://www.instagram.com/hubtownlimited/?hl=en', 'https://www.tiktok.com/@rhinesolution'],
    ['https://www.facebook.com/HubtownLimitedd', 'https://www.reddit.com/user/RhineSolution/'],
    ['https://www.linkedin.com/company/hubtown-limitedd/', 'https://www.linkedin.com/in/rhinesolution'],
    // contact form: neutralize Cloudflare Turnstile (offline) — point script at local stub
    ['https://challenges.cloudflare.com/turnstile/v0/api.js', '/turnstile-api.js'],
    ['0x4AAAAAACZnavzbHmQg2zu5', 'offline-stub'],
    // footer "Chat with us" (hubtown WhatsApp) -> local contact page
    ['https://wa.me/918657995844', '/contact/index.html'],
    // contact map link (hubtown Mumbai address) -> local contact page
    ['https://maps.app.goo.gl/GrMxabMaXoAsxHvGA', '/contact/index.html'],
    // fix hubtown SSR bug: minimap-grid background URL got quote-mangled by HTTrack
    ["%27/images/map/minimap-grid.png%27.html", "/images/map/minimap-grid.png"],
    ["'/images/map/minimap-grid.png'.html", "/images/map/minimap-grid.png"],
    // shared ogDescription
    ['Hubtown Limited (formerly known as Ackruti City Limited) is one of India\u2019s leading real estate developers, with over four decades of experience developing residential and commercial spaces and IT parks across India. The company primarily focuses on the Mumbai Metropolitan Region, Pune, and Gujarat. Hubtown has successfully delivered over 45 million sq. ft. of real estate, with an additional 20 million sq. ft. currently under development and 10 million sq. ft. planned for upcoming projects.', 'Rhine Solution is a two-person studio building custom web experiences \u2014 portfolios, portals, and products \u2014 from first sketch to live deploy. We take on a few projects and finish them properly.'],
    // consent line (registration chunk + contact)
    ['I authorise Hubtown Limited & its representatives to contact me with updates and notifications via Email/SMS/What\'sApp/Call. This will override DND/NDNC.', 'I agree to be contacted about my enquiry. We never share your data.'],
    // web app manifest
    ['"name": "Hubtown"', '"name": "Rhine Solution"'],
    ['"short_name": "Hubtown"', '"short_name": "Rhine Solution"'],
    // scene-viewer dev page labels
    ['Hubtown 3D Scene Viewer \u2014 all models', 'Rhine Solution 3D Scene Viewer \u2014 all models'],
    ['<b>HUBTOWN 3D SCENE</b>', '<b>RHINE 3D SCENE</b>'],
    // 3D scene rail labels (present on every page's background scene)
    ['Future', 'Build'],
    ['Innovation', 'Craft'],
    ['Collaboration', 'AI'],
    ['Excellence', 'Excellence'],
    ['Purpose', 'Together'],
    ['Legacy', 'Next'],
  ],

  // ---- HOME (scene sections; chunk data + SSR html) ----
  home: [
    // S0 hero
    ['We build <br class="sm:hidden"> the future <br> of real estate', 'Build with <br class="sm:hidden"> Rhine <br> Solution'],
    ['For over 40 years, Hubtown has created some of India\'s most innovative real estate developments, spanning across Residential, Commercial and Industrial projects. From the drawing board to reality, across all facets of society.', 'Custom web applications, portfolios, and digital experiences crafted with care.'],
    ['Explore our projects', 'See our work'],
    // S1 craft
    ['We lead <br class="sm:hidden"> the way in <br> development', 'Small team, <br class="sm:hidden"> high <br> standard.'],
    ['At Hubtown we look at the world through a different lens; instead of seeing what is, we see what could be. Each day we seek better ways to design, build and create communities.', 'A founding duo that ships together \u2014 design, build, and deploy, all in-house, with no layers between idea and launch.'],
    ['Work with us', 'Meet the team'],
    // S2 AI
    ['We work <br class="sm:hidden"> with a network <br> of experts', 'An AI-first <br class="sm:hidden"> workflow.'],
    ['We are not just real estate developers. We are inventors, architects, engineers, designers, city planners, safety experts, artists\u2026 All coming together to shape the future, for you.', 'Our Mac Mini runs the stack: agents, five model providers, and the Obsidian Brain that keeps every decision documented.'],
    // S3 excellence
    ['To build what <br class="sm:hidden"> others <br class="hidden sm:block"> can <br class="sm:hidden"> only imagine', 'Shipped, <br class="sm:hidden"> not <br class="hidden sm:block"> staged.'],
    ['We work with experts from all over the world, because there is always something to learn. We aim higher, dream bigger and create better. Always.', 'Every project ends up live in production. No mockups, no abandoned ideas \u2014 just code that runs.'],
    ['discover our vision', 'See our work'],
    // S4 together
    ['Shape <br class="sm:hidden"> the land <br> with purpose', 'Let\\\'s <br class="sm:hidden"> build <br> something.'],
    ['In an ever changing world with increasingly limited resources, we believe it essential to not only build well, but with vision, intention - and purpose. We build to last.', 'Two builders, one direct conversation. Partner with us on your next project.'],
    // S5 next
    ['And define <br> tomorrow\u2019s landscape', 'Have a project <br> in mind?'],
    ['Join us as we continue to shape tomorrow, creating formidable communities, enduring experiences, and places of exceptional value.', 'Two builders, one direct conversation. We reply within a day \u2014 usually faster.'],
    ['explore our projects', 'Start a conversation'],
  ],

  // ---- CONTACT ----
  contact: [
    ['Contact Hubtown Limited | Real Estate Developer in India', 'Contact Rhine Solution | Custom web development, portfolios, and digital experiences'],
    ['Get in touch', 'Start a conversation.'],
    ['Contact us to learn about the Hubtown vision', 'Two builders behind one brand. You\'ll always reach a builder, not a salesperson.'],
    ['About Hubtown', 'Rhine Solution'],
    ['Drop Us A line', 'Send us a message'],
    ['Get a real-time tour for our Ongoing, Upcoming and Completed Projects.', 'Tell us what you\'re building \u2014 we\'ll reply with a plain-language proposal.'],
    ['First name', 'Name'],
    ['Last name', 'Company'],
    ['Contact Info', 'Contact'],
    ['Phone', 'Based in'],
    ['+91 22 69 66 20 00', 'Rotterdam, Netherlands'],
    ['Address', 'Enquiries'],
    ['HUBTOWN SEASONS, CTS No. 469-A, OPP. JAIN TEMPLE, R.K. CHEMBURKAR MARG, CHEMBUR EAST, Mumbai Suburban,\\nMaharashtra, 400071', 'info@rhinesolution.com \u2014 replies within 1-2 business days.'],
    ['Get in touch with Hubtown Limited, a trusted real estate developer in India. Contact us for residential and commercial projects, sales enquiries or support.', 'Start a conversation with Rhine Solution \u2014 a two-person studio for custom web development. You\'ll always talk to a builder, not a salesperson.'],
    // contact-page hero body variant (single apostrophe, no trailing s)
    ['For over 40 years, Hubtown has created some of India\' most innovative real estate developments, spanning across Residential, Commercial and Industrial projects. From the drawing board to reality, across all facets of society.', 'Custom web applications, portfolios, and digital experiences crafted with care.'],
    // consent line (HTML renders the company name; payload used a placeholder)
    ['I authorise Hubtown Limited & its representatives to contact me with updates and notifications via Email/SMS/What\'sApp/Call. This will override DND/NDNC.', 'I agree to be contacted about my enquiry. We never share your data.'],
    // address comma-joined variant (HTML) — newline variant handled by payload
    ['HUBTOWN SEASONS, CTS No. 469-A, OPP. JAIN TEMPLE, R.K. CHEMBURKAR MARG, CHEMBUR EAST, Mumbai Suburban, Maharashtra, 400071', 'info@rhinesolution.com \u2014 replies within 1-2 business days.'],
    ['HUBTOWN SEASONS, CTS No. 469-A, OPP. JAIN TEMPLE, R.K. CHEMBURKAR MARG, CHEMBUR EAST, Mumbai Suburban,\nMaharashtra, 400071', 'info@rhinesolution.com \u2014 replies within 1-2 business days.'],
  ],

  // ---- PROJECTS (header + map labels + generated project-data swap) ----
  projects: [
    ['Hubtown Projects', 'Selected work'],
    ['Explore our projects on the interactive map', 'Production systems, deployed and maintained.'],
    ['Sold Out', 'Shipped'],
    ['Discover More', 'Read more'],
    ...require('./projects-data-mapping.js'),
  ],

  // ---- NEWS ----
  news: [
    ['Hubtown News & Updates | Real Estate Developer India', 'Rhine Solution News | Updates from the studio'],
    ['Stay updated with the latest news, announcements and developments from Hubtown Limited, a trusted real estate developer in India.', 'Updates from the Rhine Solution studio \u2014 what we shipped, how we built it, and what we learned along the way.'],
    ['Times Real Estate Conclave Awards 2025 - 2026, powered by Bombay Times', 'Music Trends Local is live'],
    ['25 Residences wins the Iconic Luxury Landmark Award for 25 Downtown, Mahalaxmi ', 'Dependency cleanup'],
    ['Shaping Mumbai\u2019s Next Residential Chapters: Hubtown Unveils Celeste in Worli and Rising City in Ghatkopar', 'Bilingual site structure'],
    ['Shaping Mumbai\u2019s Next Residential Chapters: Hubtown Unveils Celeste in Worli and Rising Ci...', 'Bilingual site structure'],
    ['Grand platform to recognise Real Estate excellence', 'Music Trends Local is live'],
    ['Luxury Real Estate with a touch of Bollywood Aesthetic', 'Dependency cleanup'],
    ['Celebrating milestones in Mumbai\'s luxury real estate', 'Bilingual site structure'],
    ['Harnaaz attends Mumbai\'s Luxury Real Estate Awards', 'Music Trends Local is live'],
    ['2026-06-06', '2026-08-20'],
    ['2026-03-18', '2026-08-01'],
    ['2026-02-18', '2026-07-15'],
    ['2025-12-10', '2026-08-20'],
    ['2025-12-03', '2026-08-01'],
    // article links: drive.google / etnownews (hubtown press) -> local news page
    ['https://drive.google.com/file/d/14AsqEj_5K0SPXFomEvtUfaJxendQSELV/view?usp=sharing', '/news/index.html'],
    ['https://drive.google.com/file/d/1lIl09dWUluXig8RgRbha4TxXIJ3VCqMA/view?usp=sharing', '/news/index.html'],
    ['https://drive.google.com/file/d/1TdSllEfRqNdyiWmOkvWlwwqcM6cEy1hb/view?usp=sharing', '/news/index.html'],
    ['https://drive.google.com/file/d/1wcXAm58huNexxybBeJ6JQqjX7tTP1zZS/view?usp=sharing', '/news/index.html'],
    ['https://drive.google.com/file/d/16IEDUFTSL9NiyhwIdJJ2YdQNTRxTnCn6/view?usp=sharing', '/news/index.html'],
    ['https://www.etnownews.com/real-estate/etnow-in-realty-conclave-awards-2026-west-edition-grand-platform-to-recognise-real-estate-excellence-check-full-list-of-winners-article-153636347', '/news/index.html'],
  ],

  // ---- CAREERS -> TEAM page ----
  careers: [
    ['Hubtown Careers | Real Estate Jobs in India & Mumbai', 'Rhine Solution | The team'],
    ['Explore career opportunities at Hubtown Limited. Join a leading real estate developer in India and build your future across residential and commercial projects.', 'Meet the Rhine Solution team \u2014 a two-person studio for custom web development. Two people, one mission: build useful software.'],
    ['For over 40 years, Hubtown has created some of India\u2019s most innovative real estate developments, spanning across Residential, Commercial and Industrial projects. From the drawing board to reality, across all facets of society.', 'Custom web applications, portfolios, and digital experiences crafted with care.'],
    ['Build Together', 'The team'],
    ['Build more than buildings. Build the future.', 'Two people, one mission: build useful software.'],
    ['join hubtown and shape', 'build with a small team and shape'],
    ["At Hubtown we don't", 'Two people,'],
    ['just shape skylines, WE SHAPE', 'one mission: build'],
    ['Futures', 'useful software.'],
    ['Communities', 'Design'],
    ['Experiences', 'Engineering'],
    // "Vision" section label — anchored forms so it never collides with "Visionary" in the CEO role
    ['<!--[-->Vision<!--]-->', '<!--[-->The studio<!--]-->'],
    ['"Vision"', '"The studio"'],
    ['At Hubtown, the most talented engineers, designers, and thought leaders are shaping the future of real estate industry.', 'Rhine Solution is a two-person studio led by a CEO/CTO pair who build together \u2014 strategy and engineering under one roof.'],
    ['Together, they bring bold ideas to life \u2014 transforming skylines, redefining communities, and setting new standards for innovation. At Hubtown, our people are more than professionals; they are visionaries driven by purpose, collaboration, and the pursuit of excellence. Their passion shapes not only the buildings we create, but the future we imagine.', 'We make custom web experiences \u2014 portfolios, portals, and products \u2014 from first sketch to live deploy. Small team, no sales layer; you talk to the builders.'],
    ['About Hubtown', 'Rhine Solution'],
    ['Information Data', 'Studio facts'],
    ['Founded in 1989', 'Two people'],
    ['Multidisciplinary', 'AI-first'],
    ['550+ Employees', '5+ projects shipped'],
    ['Impact', 'How we work'],
    ['What we create is not just space \u2014 it is the backdrop for lives, stories, and communities. Every design carries the power to transform daily experience and inspire a better way of living.', 'Every decision lives in the Obsidian Brain \u2014 documented and repeatable. When we promise a project, it ships.'],
    ['At Hubtown, impact is measured in thriving communities, sustainable futures, and lives transformed. Our work shapes the way people live, connect, and grow \u2014 creating value that endures for generations. This is more than real estate; it is a legacy of purpose and possibility.', 'We favor simplicity, craft, and production code \u2014 built in the Netherlands, shipped worldwide.'],
    ['Rajeevan Paramban', 'RAGNAROK'],
    ['Executive Vice President Operations', 'CEO & Visionary'],
    ['My journey with Hubtown Limited began 30 years ago as a Junior Engineer. Today, I am proud to serve as Executive Vice President.\nGuided by strong principles, we treat every partner as an extension of our team. With a consistent focus on quality, innovation, and growth, Hubtown offers clear career paths and the opportunity to build something meaningful.', 'Founder of Rhine Solution. Leads product, brand, and client relationships. Builds in TypeScript, Next.js, and pure CSS. Maintains the Obsidian Brain that powers the company\'s AI stack.'],
    ['My journey with Hubtown Limited began 30 years ago as a Junior Engineer. Today, I am proud to serve as Executive Vice President.\\nGuided by strong principles, we treat every partner as an extension of our team. With a consistent focus on quality, innovation, and growth, Hubtown offers clear career paths and the opportunity to build something meaningful.', 'Founder of Rhine Solution. Leads product, brand, and client relationships. Builds in TypeScript, Next.js, and pure CSS. Maintains the Obsidian Brain that powers the company\'s AI stack.'],
    ['Laxmikant K. Mukhedkar', 'ZeroMeister'],
    ['Manager Operations', 'CTO & Engineer'],
    ['I joined the company in 2013 as a Junior Engineer and have grown into my current role as Manager.\nWith the opportunity to take on diverse roles, I\u2019ve gained hands-on experience across operations. The support throughout my journey has helped me develop a strong foundation in quality, innovation, and leadership.', 'Chief Technology Officer. Owns the engineering practice, infrastructure, and the Mac Mini that runs the company\'s AI stack. Ships production code and keeps the lights on.'],
    ['I joined the company in 2013 as a Junior Engineer and have grown into my current role as Manager.\\nWith the opportunity to take on diverse roles, I\u2019ve gained hands-on experience across operations. The support throughout my journey has helped me develop a strong foundation in quality, innovation, and leadership.', 'Chief Technology Officer. Owns the engineering practice, infrastructure, and the Mac Mini that runs the company\'s AI stack. Ships production code and keeps the lights on.'],
    ['Madhavi Degaonkar', 'Rhine Solution'],
    ['Senior Manager Company Secretary', 'The studio'],
    ['Reflecting on my 19-year journey with Hubtown Limited, I\u2019ve had the opportunity to take on diverse assignments and continually grow.\nThe organization\u2019s focus on work-life wellness has allowed me to build a fulfilling career while maintaining balance, making this a truly rewarding long-term journey.', 'Two people, one mission: build useful software. We take on a few projects and finish them properly.'],
    ['Reflecting on my 19-year journey with Hubtown Limited, I\u2019ve had the opportunity to take on diverse assignments and continually grow.\\nThe organization\u2019s focus on work-life wellness has allowed me to build a fulfilling career while maintaining balance, making this a truly rewarding long-term journey.', 'Two people, one mission: build useful software. We take on a few projects and finish them properly.'],
    ['Work with us', 'What we value'],
    ['Purpose', 'Craft over quantity'],
    ['At Hubtown, every square foot tells a story. Join us and be part of transforming ideas into iconic structures that define cities and improve lives.', 'We take on a few projects and finish them properly.'],
    ['Growth', 'Simplicity wins'],
    ['We are invested in your growth. With learning opportunities, mentorship, and challenging assignments, you\u2019ll keep evolving\u2014just like the spaces we build.', 'Clear structure, pure CSS, no unnecessary dependencies.'],
    ['Teamwork', 'AI-assisted, human-led'],
    ['We are a close-knit team of doers, thinkers, and creators. At Hubtown, you\u2019ll find a workplace that values collaboration, integrity, and mutual respect.', 'Agents and models speed us up; people make the calls.'],
    ['Unity', 'Documented, always'],
    ['From site engineers to sales teams, every voice is valued here. We believe diverse perspectives lead to better outcomes\u2014and more resilient communities.', 'Every decision lives in the Brain, not in someone\'s head.'],
    ['Being an Industry Leader our vision is to be the creator of value and enduring experiences for customers and our partners, to build remarkable landmarks that resonate our brand values.', 'We favor simplicity, craft, and production code. When we promise a project, it ships.'],
    ['We are always looking for new talents. If you feel aligned with Hubtown\'s values and believe your skills can help elevate our mission, feel free to reach out via email.', 'Want to work with us? We take on a few projects a year and finish them properly.'],
  ],

  // ---- INVESTOR RELATIONS (filing-hub page: swap chrome, keep data list) ----
  'investor-relations': [
    ['Hubtown Investor Relations | Financial Reports & Corporate Information India', 'Rhine Solution | Studio & Company'],
    ['Explore Hubtown Limited investor relations including financial reports, annual reports, corporate disclosures and investor updates.', 'About Rhine Solution \u2014 a two-person studio building custom web experiences. Company information, projects, and policies, all in one place.'],
    ['Investor Relations', 'Studio & Company'],
    ['Resources Hub', 'Studio resources'],
    ['Details of Listed Securities', 'The team'],
    ['Details of Securities', 'The team'],
    ['Corporate Information ', 'Company information'],
    ['Stock Exchange Updates', 'Releases & updates'],
    ['Annual Reports & Annual Returns', 'Case studies'],
    ['Codes and Policies', 'Policies'],
    ['Scheme of Arrangements', 'Process & workflow'],
    ['CSR & Sustainability', 'Values & sustainability'],
  ],

  // ---- REGULATION POLICY (RERA QR hub) ----
  'regulation-policy': [
    ['Real Estate Regulation Policy | Hubtown Limited India', 'Regulation & Compliance | Rhine Solution'],
    ['Real Estate Regulation Policy', 'Regulation & Compliance'],
    ['QR Codes', 'Project registrations'],
  ],

  // ---- TERMS & CONDITIONS ----
  'terms-and-conditions': [
    ['Terms & Conditions | Hubtown Limited India', 'Terms & Conditions | Rhine Solution'],
    ['Read the terms and conditions of Hubtown Limited outlining website usage, policies, user responsibilities and legal guidelines for accessing our services', 'Read the terms and conditions for using the Rhine Solution website \u2014 a two-person studio for custom web development, portfolios, and digital experiences.'],
    ['We reserve the right to update or revise the Terms and Conditions at any time without prior notice. Any changes will be effective immediately upon posting the updated privacy policy on our website.', 'These terms cover your use of the Rhine Solution website. We\'re a two-person studio; if something here reads oddly, email info@rhinesolution.com and we\'ll fix it.'],
    ['Collected Data', 'What we cover'],
    ['Use of Data', 'Why we collect it'],
  ],

  // ---- APPROVALS (document hub) ----
  approvals: [
    ['Hubtown Approvals | Project Approval Documents India', 'Approvals & Certificates | Rhine Solution'],
    ['Approval Resources', 'Approvals & Certificates'],
    ['Resources Hub', 'Files'],
  ],

  // ---- PRIVACY ----
  'privacy-policy': [
    ['Privacy Policy | Hubtown Limited India', 'Privacy Policy | Rhine Solution'],
    ['Understand Hubtown Limited\u2019s privacy policy covering data collection, usage, cookies, third-party sharing and security practices for users across our website.', 'Rhine Solution collects the absolute minimum \u2014 only what you send through the contact form. No analytics, no cookies, no third-party tracking.'],
    ['Work with Hubtown Limited, a trusted real estate company known for innovation, quality construction, and landmark developments across Mumbai. Be part of a dynamic organization creating exceptional residential and commercial spaces with a focus on excellence and modern urban living.', 'Work with Rhine Solution, a two-person studio building custom web experiences \u2014 portfolios, portals, and products \u2014 shipped from first sketch to live deploy.'],
    ['We reserve the right to update or revise this privacy policy at any time without prior notice. Any changes will be effective immediately upon posting the updated privacy policy on our website.', 'Rhine Solution collects the absolute minimum required to do our job: respond to you when you reach out. No analytics, no advertising, no third-party tracking, no cookies of any kind. Just the contact form.'],
    // section headings
    ['Collected Data', 'What we collect'],
    ['Use of Data', 'Why we collect it'],
    ['Disclosure of your information', 'Who we share it with'],
    ['Disclosure', 'Who we share it with'],
    ['Where we store your personal information', 'How long we keep it'],
    ['Third party trackers', 'Third parties'],
    ['Electronic Communication', 'Contact'],
    // collected-data paragraphs -> Rhine what-we-collect / who-we-are
    ['Information you give us. You may give us information about you by filling in forms on our sites, or by submitting your CV, or by corresponding with us by phone, e-mail or otherwise or, by you interacting with any of our business partners, suppliers or sub-contractors (including estate agents, sales agents and our professional advisors) engaged on our behalf. This includes information you provide when you register to use our sites, subscribe to our service, email us, arrange property viewings with us, request brochures from us, complete an enquiry form, provide your CV and when you report a problem with our sites. The information you give us may include your name, address, e-mail address, phone number and any other information relevant to your enquiry or request for information or services which we may request and you may choose to provide us from time to time.', 'Only what you type into the contact form: your name, your email address, your message, and the language you used (English or Dutch). Nothing else. We do not collect IP addresses, browser fingerprints, location data, device identifiers, or any analytics. We do not place cookies.'],
    ['Information we collect about you. We may automatically collect: technical information, including the IP address, your login information, browser type and version, time zone setting, browser plug-in types and versions, operating system and platform; and information about your visit, including the full URL clickstream to, through and from our sites; materials you viewed or searched for; page response times, download errors, length of visits to certain pages, page interaction information, and methods used to browse away from the page and any phone number used to call our customer service number.', 'To reply to you. That\'s it. The legal basis under GDPR Article 6(1)(b) is that processing is necessary to respond to your enquiry. We do not market to you, build profiles on you, or share your information with anyone outside the chain needed to send you our reply.'],
    ['Information we receive from other sources. We may receive information about you if you use our sites or the other services we provide. In this case we will have informed you when we collected that data that it may be shared internally and combined with data collected on our sites. We also work closely with third parties (including, for example, business partners, sub-contractors in technical, payment and delivery services, advertising networks, analytics providers, search information providers, credit reference agencies) and may receive information about you from them.', 'Rhine Solution is a two-person studio. We are the data controller for any personal information you send us through this site. You can reach us at the addresses listed at the bottom of this page.'],
    // use-of-data paragraphs -> why
    ['We may collect and process the following data about you', 'Why we use it'],
    ['If you are an existing customer, we will only contact you by e-mail, SMS, telephone or your preferred method of contact if different, with information about our other project(s), schemes (if any) and offerings (if any) similar to those which were the subject of a previous sale or negotiations of a sale to you; If you are a new customer, and where we permit third parties to use your data, we (or they) will contact you by e-mail, SMS, telephone or your preferred method of contact if different only if you have consented to this.', 'To reply to you, and only that. We never contact you about anything you didn\'t ask for, and we never pass your details to anyone for marketing.'],
    ['We may collect and use your data including but not limited for the following purposes:', 'To reply to your message and to run the site.'],
    // disclosure paragraphs -> who-we-share-with
    ['We may share your personal information with any member of Hubtown.', 'One service: Resend (resend.com), the email infrastructure that delivers your message to our inbox. They act as our data processor under a standard Data Processing Agreement.'],
    ['We may also share your information with selected third parties including, where applicable: (i) business partners, suppliers and sub-contractors (including, but not limited to, estate agents, sales agents and our professional advisors) for the performance of any contract or any potential contract we may enter into with them or you, or in relation to any ancillary requirements; (ii) advertisers and advertising networks that require the data to select and serve relevant adverts to you and others; (iii) analytics and search engine providers that assist us in the improvement and optimisation of our Sites; (iv) to third party/ies in the event we sell or buy any business or assets; (v) if Hubtown or substantially all of its assets are acquired by a third party, your personal data will be one of the transferred assets; (vi) if we are under a duty to disclose or share your personal data in order to comply with any legal obligation, or in order to enforce or apply our terms of use and other agreements; or to protect the rights, property, or safety of Hubtown, our customers, or others. This includes exchanging information with other companies and organisations for the purposes of fraud protection and credit risk reduction; and (vii) as otherwise disclosed or permitted by law.', 'No other third parties receive your data. We do not sell, rent, or trade it. Your message stays in our inbox and our internal email client for as long as the conversation is active.'],
    ['We may share your non sales related information such as cookies, email address, phone number etc, to third parties. But we do not share your sales related information such as PAN Card No, credit/debit card details, preference details with the third parties.', 'Once a project is delivered (or we agree it isn\'t a fit), we archive your message for up to 24 months in case you come back, then delete it from active storage. You can ask us to delete it sooner.'],
    // storage paragraphs
    ['The data that we collect from you may be transferred, stored and processed by staff who work for us or for one of our suppliers or one of our group companies. Such staff may be engaged in, among other things, the fulfilment of your order or enquiry and the provision of support services. By submitting your personal data, you agree to this transfer, storing or processing. We will take all steps reasonably necessary to ensure that your data is treated securely.', 'Resend stores the message body and metadata on servers in the EU and the United States; transfers to the US are covered by the EU\u2013US Data Privacy Framework, which Resend is certified under.'],
    ['We take reasonable steps to ensure that appropriate technical and organisational measures are in place to guard against any unauthorised or unlawful processing of personal data and accidental loss or destruction of, or damage to, personal data. The transmission of information via the internet and/or through any other channel/s is not completely secure and we cannot guarantee the security of your data transmitted to our sites and any transmission is at your own risk.', 'Under GDPR you have the right to access, rectify, erase, restrict, port, and object to the processing of any personal data we hold about you, and to lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens). We respond within one month.'],
    // trackers
    ['Our Sites may contain links to third-party websites that are not owned or controlled by us. We are not responsible for the privacy practices or the content of such third-party websites. We are also not liable for any loss or damage that may occur to you on account of these third-party websites. We encourage the users to read the privacy policies of all such websites on visiting the same.', 'We do not run third-party scripts and we do not place cookies. The only external service involved is the email delivery that carries your message to our inbox.'],
    ['Please note that third parties may also use cookies, over which we have no control.', 'There are no third-party trackers on this site. If we ever add a service that changes that, we\'ll update this policy and say so in plain language.'],
    // electronic communication
    ['When you visit www.hubtown.co.in or voluntarily send e-mails to us, you are communicating with us electronically. We will keep record of this information so that we can respond to you periodically. We only collect information from you when you register on our website or fill out a form. Also, when filling out a form on our website, you may be asked to enter your: Name, E-mail address or Phone / Mobile Number. You may, however visit our website anonymously. By communicating with us and submitting your personal information and contact details, you consent to receive communication from us through Email, SMS, Call, WhatsApp or any other communication medium, even if your number has DND activated on it. You agree that all agreements, notices, disclosures, and other communications that we provide to you electronically satisfy any legal requirement that such communication be in writing.', 'For any privacy question \u2014 to access, correct, or delete your data \u2014 write to info@rhinesolution.com. If you\'d rather raise your concern with the regulator, you can contact the Dutch Data Protection Authority at autoriteitpersoonsgegevens.nl.'],
  ],

  // ---- ABOUT ----
  about: [
    ['About Hubtown | Leading Real Estate Developer in Mumbai & India', 'About Rhine Solution | Custom web development, portfolios, and digital experiences'],
    ['Hubtown Limited (formerly known as Ackruti City Limited) is one of India\u2019s leading real estate developers, with over four decades of experience developing residential and commercial spaces and IT parks across India. The company primarily focuses on the Mumbai Metropolitan Region, Pune, and Gujarat. Hubtown has successfully delivered over 45 million sq. ft. of real estate, with an additional 20 million sq. ft. currently under development and 10 million sq. ft. planned for upcoming projects.', 'Rhine Solution is a two-person studio building custom web experiences \u2014 portfolios, portals, and products \u2014 from first sketch to live deploy. We take on a few projects and finish them properly.'],
    ['Learn about Hubtown, a leading real estate developer in Mumbai and India with expertise in residential, commercial and redevelopment projects across key locations.', 'Learn about Rhine Solution \u2014 a two-person studio for custom web development, portfolios, portals, and digital experiences.'],
    ['Shape the future', 'The studio'],
    ['Revered as one of the most reliable Real Estate developers in India', 'Small team, high standard, shipped work.'],
    ['The most reliable real estate developers in India', 'Small team, high standard, shipped work.'],
    [' The most reliable ', ' Small team, high '],
    [' real estate developers in India ', ' standard, shipped work. '],
    ['Hubtown has helped shape the city for over 40 years and we\'re just getting started.', 'Rhine Solution is a two-person studio led by a CEO/CTO pair who build together. We make custom web experiences \u2014 portfolios, portals, and products \u2014 from first sketch to live deploy.'],
    ['With every project, we aim to create spaces that matter, and we know it takes exceptional people to bring that vision to life.', 'Our workflow is AI-first but human-led. The Mac Mini runs our agents and models, and the Obsidian Brain keeps every decision documented and repeatable.'],
    ['About Hubtown', 'About Rhine Solution'],
    ['Informations Data', 'Studio facts'],
    ['Created', 'Team'],
    ['1989', '2'],
    ['Originally Named', 'Based in'],
    ['Ackruti City', 'Netherlands'],
    ['Chairman', 'Focus'],
    ['Hemant M Shah', 'Custom web'],
    ['Formerly known as Ackruti City Limited, Hubtown is one of India\u2019s leading real estate companies, with over 4 decades of experience, with projects covering the entire spectrum of real estate development including Residential, Commercial, IT, Industrial, Infrastructure.', 'Rhine Solution makes custom web experiences \u2014 portfolios, portals, and products \u2014 from first sketch to live deploy. Small team, no sales layer; you talk directly to the builders.'],
    ['Being an Industry Leader our vision is to be the creator of value and enduring experiences for customers and our partners, to build remarkable landmarks that resonate our brand values.', 'Our workflow is AI-first but human-led. The Mac Mini runs our agents and models, and the Obsidian Brain keeps every decision documented and repeatable.'],
    ['Get In Touch', 'Studio numbers'],
    ['Completed projects', 'Shipped products'],
    ['45 million square feet', '7'],
    ['Delivered across Commercial, Residential, and mixed-use projects.', 'Portfolios, portals, and products built end to end.'],
    ['Ongoing projects', 'Model providers'],
    ['20 million square feet', '5'],
    ['Under construction in urban and suburban areas.', 'Five LLM providers run on our Mac Mini AI stack.'],
    ['Upcoming projects', 'Locales'],
    ['10 million square feet', '7'],
    ['Planned for future developments and expansions.', 'English, Dutch, German, French, Spanish, Italian, and Chinese.'],
    ['Our Values', 'What we value'],
    ['Purpose', 'Craft over quantity'],
    ['At Hubtown, every square foot tells a story. Join us and be part of transforming ideas into iconic structures that define cities and improve lives.', 'We take on a few projects and finish them properly.'],
    ['Growth', 'Simplicity wins'],
    ['We\u2019re invested in your growth. With learning opportunities, mentorship, and challenging assignments, you\u2019ll keep evolving\u2014just like the spaces we build.', 'Clear structure, pure CSS, no unnecessary dependencies.'],
    ['Teamwork', 'AI-assisted, human-led'],
    ['We\u2019re a close-knit team of doers, thinkers, and creators. At Hubtown, you\u2019ll find a workplace that values collaboration, integrity, and mutual respect.', 'Agents and models speed us up; people make the calls.'],
    ['Unity', 'Documented, always'],
    ['From site engineers to sales teams, every voice is valued here. We believe diverse perspectives lead to better outcomes\u2014and more resilient communities.', 'Every decision lives in the Brain, not in someone\'s head.'],
    ['Hubtown is guided by core values of teamwork, innovation, consistency, and transparency. The company leverages collective talent to drive productivity, enhances lifestyles through engineering expertise and forward-thinking design, maintains quality standards across all processes, and ensures open communication with all stakeholders.', 'We favor simplicity, craft, and production code. When we promise a project, it ships.'],
    ['Work with us', 'Interested in working together?'],
    ['We are not just real estate developers. We are inventors, architects, engineers, designers, city planners, safety experts, artists\u2026 All coming together to shape the future.', 'You\'ll always talk to a builder \u2014 not a salesperson.'],
  ],
};