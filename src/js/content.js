/* =====================================================================
   CONTENT & DATA FOR THE MAPS AND POP-UPS
   ---------------------------------------------------------------------
   This is the file to edit when you fill in the map pop-ups.
   (The page's section text lives in index.html.)

   - Any text wrapped in [square brackets] is a placeholder.
   - Set a story field to null to hide that block in the pop-up.
   - Coordinates are [latitude, longitude] in decimal degrees.
   - Chapter facts (status, founding year, members, projects, links) were
     copied from hack4impact.org/work/chapters on Oct 16, 2026. Re-check
     them before the final submission.
   ===================================================================== */

window.SITE = {

  /* Color theme:
       'dusk'     night globe, then a white page from the zoom into Atlanta on
       'ember'    dark navy + BoG orange all the way
       'daylight' white + navy + BoG orange
       'sunrise'  warm cream + navy + BoG orange
       'classic'  the first draft's navy + gold
     Colors are defined in js/themes.js. You can also add ?theme=NAME to the
     address (e.g. index.html?theme=sunrise) to open the page in one theme. */
  theme: 'daylight',
  /* Shows the "Colors" menu in the top bar so the group can compare themes.
     Set to false once you've picked one. */
  themePicker: false,

  /* The three student organizations on the triangle. Each mark sits on a
     disc in the organization's own colors, so it stands out on any theme.
     disc = fill, ring = outline, scale = logo size as a share of the disc. */
  orgs: {
    bog: { name: 'Bits of Good', logo: 'assets/logos/bog-mark.png', disc: '#FFFFFF', ring: '#F89C44', scale: 0.62 },
    ei:  { name: 'Epic Intentions', logo: 'assets/logos/epic-intentions-mark.svg', disc: '#1B1B1E', ring: '#EEB211', scale: 0.64 },
    cyc: { name: 'Consult Your Community', logo: 'assets/logos/cyc-mark.svg', disc: '#FFFFFF', ring: '#202D62', scale: 0.6 },
  },

  /* Georgia Tech's interlocking GT (from gatech.edu) in the final diagram.
     placement: 'center' = full color in the middle of the triangle, with a
                gold ring around everything (follows GT's logo rules: no
                fading, nothing on top of the logo)
                'behind' = large and faint behind the triangle (closer to the
                original sketch, but GT's rules ask for full contrast)
     color:     'gold' or 'navy'. GT approves Tech Gold on navy and on white. */
  gtLogo: {
    placement: 'center',
    color: 'gold',
    gold: 'assets/logos/gt-mark-gold.svg',
    navy: 'assets/logos/gt-mark-navy.svg',
    white: 'assets/logos/gt-mark-white.svg',
  },

  /* Call-to-action links. Replace the TODO one. The two Bits of Good
     links are the ones on bitsofgood.org/join (Students / Nonprofits). */
  links: {
    bogApply:     'https://bitsofgood.org/join',
    bogPartner:   'https://apply.bitsofgood.org/',
    ideaForm:     '#TODO-your-idea-collection-form',
    bogSite:      'https://bitsofgood.org',
    bogProjects:  'https://bitsofgood.org/projects',
    h4iChapters:  'https://www.hack4impact.org/work/chapters',
    eiSite:       'https://www.epicintentions.org/',
    eiApply:      'https://www.epicintentions.org/apply',
    eiNonprofits: 'https://www.epicintentions.org/nonprofits',
    cycSite:      'https://www.georgiatechcyc.org/',
    cycApply:     'https://www.georgiatechcyc.org/apply-in-cycle',
  },

  /* ---------------------------------------------------------------
     HACK4IMPACT CHAPTERS (North America map)
     status: 'active' | 'forming' | 'inactive'
     --------------------------------------------------------------- */
  chapters: [
    { id: 'gt', school: 'Georgia Tech', chapter: 'Bits of Good', city: 'Atlanta, GA', status: 'active', founded: 2017, members: 102, projects: 20,
      at: [33.7756, -84.3963], web: 'https://bitsofgood.org', github: 'https://github.com/GTBitsOfGood', instagram: 'https://www.instagram.com/gtbitsofgood', h4i: 'georgia-tech', home: true,
      nonprofitStory: '[Placeholder: one Bits of Good project story, e.g. a partner from bitsofgood.org/projects]',
      studentStory: '[Placeholder: a Bits of Good member quote or interview clip]' },
    { id: 'emory', school: 'Emory University', chapter: 'Hack4Impact Emory', city: 'Atlanta, GA', status: 'active', founded: null, members: 2, projects: 0,
      at: [33.7925, -84.3240], web: 'https://emory.hack4impact.org', github: 'https://github.com/Emory-Hack4Impact', h4i: 'emory-university',
      nonprofitStory: '[Placeholder: how this chapter helps nonprofits]',
      studentStory: '[Placeholder: how this chapter helps students]' },
    { id: 'upenn', school: 'University of Pennsylvania', chapter: 'Hack4Impact UPenn', city: 'Philadelphia, PA', status: 'active', founded: 2014, members: 34, projects: 66,
      at: [39.9522, -75.1932], web: 'https://upenn.hack4impact.org', github: 'https://github.com/hack4impact-upenn', instagram: 'https://www.instagram.com/hack4impactpenn/', h4i: 'university-of-pennsylvania',
      nonprofitStory: '[Placeholder: how this chapter helps nonprofits (the founding chapter)]',
      studentStory: '[Placeholder: how this chapter helps students]' },
    { id: 'drexel', school: 'Drexel University', chapter: 'Hack4Impact Drexel', city: 'Philadelphia, PA', status: 'active', founded: null, members: 15, projects: 1,
      at: [39.9566, -75.1899], web: 'https://drexel.hack4impact.org', instagram: 'https://www.instagram.com/hack4impactdrexel/', h4i: 'drexel-university',
      nonprofitStory: '[Placeholder: how this chapter helps nonprofits]',
      studentStory: '[Placeholder: how this chapter helps students]' },
    { id: 'uiuc', school: 'University of Illinois Urbana-Champaign', chapter: 'Hack4Impact UIUC', city: 'Urbana, IL', status: 'active', founded: 2017, members: 31, projects: 44,
      at: [40.1020, -88.2272], web: 'https://uiuc.hack4impact.org', github: 'https://github.com/hack4impact-uiuc', instagram: 'https://www.instagram.com/hack4impactuiuc/', h4i: 'university-of-illinois-urbana-champaign',
      nonprofitStory: '[Placeholder: nonprofit story. Your report has one: Bales (2023), Daily Illini, on the accessible voting site and the Philippine career nonprofit platform]',
      studentStory: '[Placeholder: student story. Same source: why members joined and the time commitment]' },
    { id: 'cornell', school: 'Cornell University', chapter: 'Cornell Hack4Impact', city: 'Ithaca, NY', status: 'active', founded: 2018, members: 99, projects: 32,
      at: [42.4534, -76.4735], web: 'https://cornell.hack4impact.org', github: 'https://github.com/cornellh4i', instagram: 'https://www.instagram.com/cornellhack4impact', h4i: 'cornell-university',
      nonprofitStory: '[Placeholder: nonprofit story. Your report has one: Targeted News Service (2025), the scheduling app for Ithaca Community Recovery]',
      studentStory: '[Placeholder: how this chapter helps students, e.g. its maintenance committee]' },
    { id: 'umd', school: 'University of Maryland, College Park', chapter: 'Hack4Impact UMD', city: 'College Park, MD', status: 'active', founded: null, members: 113, projects: 32,
      at: [38.9869, -76.9426], web: 'https://umd.hack4impact.org', github: 'https://github.com/Hack4Impact-UMD', instagram: 'https://www.instagram.com/hack4impactumd/', h4i: 'university-of-maryland-college-park',
      nonprofitStory: '[Placeholder: how this chapter helps nonprofits]',
      studentStory: '[Placeholder: how this chapter helps students]' },
    { id: 'calpoly', school: 'Cal Poly, San Luis Obispo', chapter: 'Hack4Impact Cal Poly', city: 'San Luis Obispo, CA', status: 'active', founded: 2018, members: 157, projects: 30,
      at: [35.3050, -120.6625], web: 'https://calpoly.hack4impact.org', github: 'https://github.com/hack4impact-calpoly', instagram: 'https://www.instagram.com/hack4impactcalpoly/', h4i: 'cal-poly-san-luis-obispo',
      nonprofitStory: '[Placeholder: how this chapter helps nonprofits]',
      studentStory: '[Placeholder: how this chapter helps students]' },
    { id: 'bu', school: 'Boston University', chapter: 'Hack4Impact BU', city: 'Boston, MA', status: 'active', founded: 2018, members: 56, projects: 9,
      at: [42.3505, -71.1054], web: 'https://bu.hack4impact.org', instagram: 'https://www.instagram.com/hack4impactbu/', h4i: 'boston-university',
      nonprofitStory: '[Placeholder: how this chapter helps nonprofits]',
      studentStory: '[Placeholder: how this chapter helps students]' },
    { id: 'carleton', school: 'Carleton College', chapter: 'Hack4Impact Carleton', city: 'Northfield, MN', status: 'active', founded: 2020, members: 4, projects: 3,
      at: [44.4615, -93.1545], web: 'https://carleton.hack4impact.org', github: 'https://github.com/h4icarleton', h4i: 'carleton-college',
      nonprofitStory: '[Placeholder: how this chapter helps nonprofits. Your report cites Dalal & Oliver (2022), a Carleton CS capstone; check whether it involved this chapter before using it here]',
      studentStory: '[Placeholder: how this chapter helps students]' },
    { id: 'rutgers', school: 'Rutgers University, New Brunswick', chapter: 'Hack4Impact Rutgers', city: 'New Brunswick, NJ', status: 'active', founded: 2022, members: 21, projects: 3,
      at: [40.5008, -74.4474], web: 'https://rutgers.hack4impact.org', github: 'https://github.com/Hack4ImpactRutgers', instagram: 'https://www.instagram.com/rutgershack4impact/', h4i: 'rutgers-university-new-brunswick',
      nonprofitStory: '[Placeholder: how this chapter helps nonprofits]',
      studentStory: '[Placeholder: how this chapter helps students]' },
    { id: 'utk', school: 'University of Tennessee, Knoxville', chapter: 'Hack4Impact UTK', city: 'Knoxville, TN', status: 'active', founded: 2020, members: 60, projects: 17,
      at: [35.9544, -83.9295], web: 'https://utk.hack4impact.org', github: 'https://github.com/hack4impact-utk', h4i: 'university-of-tennessee-knoxville',
      nonprofitStory: '[Placeholder: how this chapter helps nonprofits]',
      studentStory: '[Placeholder: how this chapter helps students]' },
    { id: 'mcgill', school: 'McGill University', chapter: 'Hack4Impact McGill', city: 'Montréal, QC', status: 'active', founded: 2019, members: 31, projects: 13,
      at: [45.5048, -73.5772], web: 'https://mcgill.hack4impact.org', github: 'https://github.com/hack4impact-mcgill', instagram: 'https://www.instagram.com/hack4impactmcgill/', h4i: 'mcgill-university',
      nonprofitStory: '[Placeholder: how this chapter helps nonprofits]',
      studentStory: '[Placeholder: how this chapter helps students]' },
    { id: 'poly', school: 'Polytechnique Montréal', chapter: 'Hack4Impact Polytechnique', city: 'Montréal, QC', status: 'active', founded: null, members: null, projects: null,
      at: [45.5046, -73.6131], h4i: 'polytechnique-montreal',
      nonprofitStory: '[Placeholder: how this chapter helps nonprofits]',
      studentStory: '[Placeholder: how this chapter helps students]' },
    { id: 'concordia', school: 'Concordia University', chapter: 'Hack4Impact Concordia', city: 'Montréal, QC', status: 'forming', founded: null, members: null, projects: null,
      at: [45.4972, -73.5790], h4i: 'concordia-university',
      nonprofitStory: null, studentStory: null },
    { id: 'uic', school: 'University of Illinois Chicago', chapter: 'Hack4Impact UIC', city: 'Chicago, IL', status: 'forming', founded: null, members: null, projects: null,
      at: [41.8708, -87.6505], h4i: 'university-of-illinois-chicago',
      nonprofitStory: null, studentStory: null },
    { id: 'brown', school: 'Brown University', chapter: 'Hack4Impact Brown', city: 'Providence, RI', status: 'inactive', founded: null, members: null, projects: null,
      at: [41.8268, -71.4025], h4i: 'brown-university', nonprofitStory: null, studentStory: null },
    { id: 'nyu', school: 'New York University', chapter: 'Hack4Impact NYU', city: 'New York, NY', status: 'inactive', founded: null, members: null, projects: null,
      at: [40.7295, -73.9965], h4i: 'new-york-university', nonprofitStory: null, studentStory: null },
    { id: 'princeton', school: 'Princeton University', chapter: 'Hack4Impact Princeton', city: 'Princeton, NJ', status: 'inactive', founded: null, members: null, projects: null,
      at: [40.3431, -74.6551], h4i: 'princeton-university', nonprofitStory: null, studentStory: null },
    { id: 'richmond', school: 'University of Richmond', chapter: 'Hack4Impact Richmond', city: 'Richmond, VA', status: 'inactive', founded: null, members: null, projects: null,
      at: [37.5741, -77.5400], h4i: 'university-of-richmond', nonprofitStory: null, studentStory: null },
    { id: 'umich', school: 'University of Michigan', chapter: 'Hack4Impact Michigan', city: 'Ann Arbor, MI', status: 'inactive', founded: null, members: null, projects: null,
      at: [42.2780, -83.7382], h4i: 'university-of-michigan', nonprofitStory: null, studentStory: null },
    { id: 'aub', school: 'American University of Beirut', chapter: 'Hack4Impact AUB', city: 'Beirut, Lebanon', status: 'inactive', founded: null, members: null, projects: null,
      at: [33.9000, 35.4812], h4i: 'american-university-of-beirut', nonprofitStory: null, studentStory: null },
  ],

  /* ---------------------------------------------------------------
     ATLANTA MAP
     --------------------------------------------------------------- */
  atlanta: {
    /* The Bits of Good dot sits on the GT campus. */
    bog: {
      at: [33.7765, -84.3970],
      summary: '[Placeholder, about 50 words: what Bits of Good is and what it does for Atlanta nonprofits]',
    },

    /* Nonprofit partners (picked from bitsofgood.org/projects).
       The "category" groups come from your research report's reading of the
       projects page. Pin positions are rough placeholders; replace them with
       real addresses (or leave them approximate and keep the note). */
    nonprofits: [
      { id: 'southface', name: 'Southface Energy Institute', category: 'Sustainability', at: [33.7694, -84.3840], approx: true,
        what: '[Placeholder: what Southface does]',
        built: 'Online project planner with a technical standards library',
        builtNote: '[Placeholder: what the planner does for Southface and who uses it]',
        when: 'Spring 2024', site: null },
      { id: 'theray', name: 'The Ray', category: 'Sustainability', at: [33.7480, -84.4380], approx: true,
        what: '[Placeholder: what The Ray does]',
        built: 'Interactive visualizations of its sustainability work',
        builtNote: '[Placeholder: what the visualizations show]',
        when: 'Fall 2020', site: null },
      { id: 'helpingmamas', name: 'Helping Mamas', category: 'Administrative', at: [33.9120, -84.2420], approx: true,
        what: '[Placeholder: what Helping Mamas does]',
        built: 'Volunteer management system',
        builtNote: '[Placeholder: what the system changed for them]',
        when: null, site: null },
      { id: 'bgcma', name: 'Boys & Girls Clubs of Metro Atlanta', category: 'Administrative', at: [33.7885, -84.3860], approx: true,
        what: '[Placeholder: what BGCMA does]',
        built: 'Bus attendance app (BGC Safety) and a Power BI data workspace',
        builtNote: '[Placeholder: what the app does for drivers and staff]',
        when: 'Spring 2020', site: null },
      { id: 'heartofpassion', name: 'Heart of Passion', category: 'Data', at: [33.8320, -84.4400], approx: true,
        what: '[Placeholder: what Heart of Passion does]',
        built: 'Planning and budgeting tool that tracks donations and spending',
        builtNote: '[Placeholder: what the tool replaced]',
        when: 'Spring 2024', site: null },
      { id: 'bei', name: 'Brain Exercise Initiative', category: 'Data', at: [33.8180, -84.3040], approx: true,
        what: '[Placeholder: what the Brain Exercise Initiative does]',
        built: 'Analytics on how app use relates to Alzheimer’s progression',
        builtNote: '[Placeholder: what the analytics help them decide]',
        when: 'Spring 2024', site: null },
      { id: 'medshare', name: 'MedShare', category: 'Administrative', at: [33.6890, -84.2650], approx: true,
        what: '[Placeholder: what MedShare does]',
        built: 'Tool for managing donated medical supplies in warehouses',
        builtNote: '[Placeholder: what the tool improved]',
        when: null, site: null },
      { id: 'mbb', name: 'Motherhood Beyond Bars', category: 'Administrative', at: [33.7180, -84.4060], approx: true,
        what: '[Placeholder: what Motherhood Beyond Bars does]',
        built: 'Caretaker mobile app and admin web portal',
        builtNote: '[Placeholder: what the app does for caretakers]',
        when: null, site: null },
      { id: 'jag', name: 'Jennifer Ann’s Group', category: 'Administrative', at: [33.8720, -84.3690], approx: true,
        what: '[Placeholder: what Jennifer Ann’s Group does]',
        built: 'Content management system for educational games and lesson plans',
        builtNote: '[Placeholder: who uses the CMS]',
        when: 'Spring 2024', site: null },
      { id: 'gacore', name: 'Georgia CORE', category: 'Data', at: [33.7600, -84.3320], approx: true,
        what: '[Placeholder: what Georgia CORE does]',
        built: 'Navigation assistant for the Georgia CORE website',
        builtNote: '[Placeholder: what visitors can now find]',
        when: null, site: null },
    ],

    /* Neighborhood labels on the Atlanta map (for orientation only). */
    places: [
      { name: 'Downtown', at: [33.7535, -84.3915] },
      { name: 'Midtown', at: [33.7915, -84.3700] },
      { name: 'Buckhead', at: [33.8425, -84.3785] },
      { name: 'Decatur', at: [33.7715, -84.2960] },
      { name: 'West End', at: [33.7370, -84.4170] },
      { name: 'East Atlanta', at: [33.7395, -84.3430] },
      { name: 'Sandy Springs', at: [33.9270, -84.3790] },
      { name: 'Brookhaven', at: [33.8655, -84.3370] },
      { name: 'Tucker', at: [33.8545, -84.2170] },
    ],
  },

  /* Pop-up text for the final diagram (SDGs and Sustainability Next). */
  sdg: {
    sdg8: { title: 'SDG 8: Decent work and economic growth', body: '[Placeholder, about 40 words: how new technology and data make nonprofits more efficient and productive (e.g. target 8.2)]', link: 'https://sdgs.un.org/goals/goal8' },
    sdg11: { title: 'SDG 11: Sustainable cities and communities', body: '[Placeholder, about 40 words: how this supports local communities and the nonprofits that serve them]', link: 'https://sdgs.un.org/goals/goal11' },
    gt: { title: 'Georgia Tech’s Sustainability Next', body: '[Placeholder, about 40 words: which part of the Sustainability Next plan these student initiatives advance]', link: 'https://sustain.gatech.edu' },
  },
};
