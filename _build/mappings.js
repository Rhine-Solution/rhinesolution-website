// Content mappings applied across SSR HTML + _payload*.json + route chunks +
// main bundle during the in-place rebuild. Format: array of [from, to];
// longest matches win (sorted at apply time). The committed output is already
// transformed, so these pairs are idempotent: they keep the non-brand fixes
// applied (nav labels, renamed routes, offline stubs, NL map labels).

// The `ev` object (district/project data, see nl-map-data.js) is NOT rebuilt
// here: it lives only in the main bundle `_nuxt/u1ipQrxM.js` as the minified
// construct `const ev={...};class exe`. It is replaced by a dedicated
// regex-anchored step in build-merged.js (rebuildBundleEv) because the
// pair-table's string split/join can't hold the full 5KB object. The NL
// district keys map to the shader's 4 channels as:
//   ev.west    -> uWesternMix (dist_west)
//   ev.south   -> uSouthMix   (dist_south)
//   ev.central -> uCentralMix (dist_central)
//   ev.north   -> uThaneMix   (the "thane" uniform carries north; dist_north)

module.exports = {
  // ---- GLOBAL CHROME (every page HTML + main bundle + all payloads) ----
  chrome: [
    // theatre studio staging API (dev-only; never fetched in production) — local stub anyway
    ['https://theatre-api.unseen.co', '/'],
    // news images (Sanity CDN) -> local folder served by the site
    ['https://cdn.sanity.io/images', '/news-images'],
    // nav labels
    ['About Us', 'About'],
    ['Careers', 'Team'],
    ['Contact Us', 'Contact'],
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
    // client-side route + nav `to` + CTA still say /careers — repoint to /team
    ['"/careers"', '"/team"'],
    ['{to:"/projects",class:"font-mono text-off-blue",title:"Careers"', '{to:"/projects",class:"font-mono text-off-blue",title:"Projects"'],
    // removed pages' footer hrefs -> live pages
    ['investor-relations/index.html', 'contact/index.html'],
    ['regulation-policy/index.html', 'about/index.html'],
    ['approvals/index.html', 'team/index.html'],
    ['href:"/investor-relations"', 'href:"/contact"'],
    ['href:"/regulation-policy"', 'href:"/about"'],
    ['href:"/approvals"', 'href:"/team"'],
    // contact form: neutralize Cloudflare Turnstile (offline) — point script at local stub
    ['https://challenges.cloudflare.com/turnstile/v0/api.js', '/turnstile-api.js'],
    ['0x4AAAAAACZnavzbHmQg2zu5', 'offline-stub'],
    // footer CTA (SSR + bundle)
    ['Chat with us', 'Contact us'],
    // NL map: rename SSR district-row ids to match the rebuilt ev keys
    // (west/south/central/north). buildMapDistricts does
    // `querySelector('#district-item-<evKey>')`; only the id attribute changes.
    // old thane -> north (the shader's "thane" uniform carries the north channel).
    ['id="district-item-central-suburbs"', 'id="district-item-central"'],
    ['id="district-item-south-mumbai"', 'id="district-item-south"'],
    ['id="district-item-western-suburbs"', 'id="district-item-west"'],
    ['id="district-item-thane"', 'id="district-item-north"'],
    // NL map: rename the setSelection district case names in the bundle to the
    // rebuilt ev keys. The district-glow shader branches on `case"western-suburbs"`
    // etc. (2 switches: prev-district fade-out + active ramp). old thane -> north.
    ['case"western-suburbs"', 'case"west"'],
    ['case"central-suburbs"', 'case"central"'],
    ['case"south-mumbai"', 'case"south"'],
    ['case"thane"', 'case"north"'],
    // NL map: default district/city readout label
    ['DISTRIC.CITY', 'WEST \u00b7 AMSTERDAM'],
    // 3D scene rail labels (present on every page's background scene)
    ['Future', 'Build'],
    ['Innovation', 'Craft'],
    ['Collaboration', 'AI'],
    ['Purpose', 'Together'],
    ['Legacy', 'Next'],
    // SSR-broken minimap-grid background URLs (quote-mangled) -> real path
    ["%27/images/map/minimap-grid.png%27.html", "/images/map/minimap-grid.png"],
    ["'/images/map/minimap-grid.png'.html", "/images/map/minimap-grid.png"],
  ],

  // ---- HOME (scene sections; chunk data + SSR html) ----
  home: [
    ['Explore our projects', 'See our work'],
    ['Work with us', 'Meet the team'],
    ['discover our vision', 'See our work'],
    ['explore our projects', 'Start a conversation'],
  ],

  // ---- CONTACT ----
  contact: [
    ['Get in touch', 'Start a conversation.'],
    ['Drop Us A line', 'Send us a message'],
    ['First name', 'Name'],
    ['Last name', 'Company'],
    ['Contact Info', 'Contact'],
    ['Address', 'Enquiries'],
  ],

  // ---- PROJECTS (header + map labels) ----
  projects: [
    ['Sold Out', 'Shipped'],
    ['Discover More', 'Read more'],
  ],

  // ---- NEWS ----
  news: [
    // article count (SSR text + payload totalArticles value)
    ['6 of 54 articles', '6 of 6 articles'],
    ['"Newsroom",54,', '"Newsroom",6,'],
  ],

  // ---- CAREERS -> TEAM page ----
  careers: [
    ['Build Together', 'The team'],
    ['Build more than buildings. Build the future.', 'Two people, one mission: build useful software.'],
    ['Communities', 'Design'],
    ['Experiences', 'Engineering'],
    ['Information Data', 'Studio facts'],
    ['Impact', 'How we work'],
    ['Work with us', 'What we value'],
    ['Purpose', 'Craft over quantity'],
    ['Growth', 'Simplicity wins'],
    ['Teamwork', 'AI-assisted, human-led'],
    ['Unity', 'Documented, always'],
    ['With every project, we aim to create spaces that matter, and we know it takes exceptional people to bring that vision to life.', 'With every project, we aim to build software that works in the real world \u2014 designed, engineered, and shipped end to end by the two of us.'],
  ],

  // ---- TERMS & CONDITIONS ----
  'terms-and-conditions': [
    ['Collected Data', 'What we cover'],
    ['Use of Data', 'Why we collect it'],
  ],

  // ---- PRIVACY ----
  'privacy-policy': [
    ['Collected Data', 'What we collect'],
    ['Use of Data', 'Why we collect it'],
    ['Disclosure of your information', 'Who we share it with'],
    ['Disclosure', 'Who we share it with'],
    ['Where we store your personal information', 'How long we keep it'],
    ['Third party trackers', 'Third parties'],
    ['Electronic Communication', 'Contact'],
    ['We may collect and process the following data about you', 'Why we use it'],
  ],

  // ---- ABOUT ----
  about: [
    ['Shape the future', 'The studio'],
    ['Created', 'Team'],
    ['Originally Named', 'Based in'],
    ['Chairman', 'Focus'],
    ['Informations Data', 'Studio facts'],
    ['Get In Touch', 'Studio numbers'],
    ['Completed projects', 'Shipped products'],
    ['Ongoing projects', 'Model providers'],
    ['Upcoming projects', 'Locales'],
    ['Our Values', 'What we value'],
    ['Purpose', 'Craft over quantity'],
    ['Growth', 'Simplicity wins'],
    ['Teamwork', 'AI-assisted, human-led'],
    ['Unity', 'Documented, always'],
    ['Work with us', 'Interested in working together?'],
  ],
};