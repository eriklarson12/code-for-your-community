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

  /* Call-to-action links. The two Bits of Good apply links are the ones
     on bitsofgood.org/join (Students / Nonprofits). */
  links: {
    bogApply:     'https://bitsofgood.org/join',
    bogPartner:   'https://apply.bitsofgood.org/',
    bogContact:   'https://bitsofgood.org/contact',
    bogInstagram: 'https://www.instagram.com/gtbitsofgood/',
    bogSite:      'https://bitsofgood.org',
    bogProjects:  'https://bitsofgood.org/projects',
    h4iChapters:  'https://www.hack4impact.org/work/chapters',
    eiSite:       'https://epicintentionsorg.wordpress.com/',
    eiApply:      'https://epicintentionsorg.wordpress.com/apply/',
    eiNonprofits: 'https://epicintentionsorg.wordpress.com/apply/',
    cycSite:      'https://www.georgiatechcyc.org/',
    cycApply:     'https://www.georgiatechcyc.org/apply-in-cycle',
  },

  /* "Run" button on the code window in "What Bits of Good does"
     (js/bog-interactive.js). Pressing Run steps through the timeline in the
     code and prints what happens at each step in the console under it.
     The page labels this a simplified example: the volunteer app is made up,
     not a real Bits of Good project. (The two lines the console shows before
     anyone presses Run are in index.html.)
     - line: which timeline line in the code to highlight
       (proposal, design, sprint, review, demo, handoff)
     - Keep each text short enough to fit on one line of the console. */
  bogRun: {
    intro: '// a simplified example of how a project runs',
    steps: [
      { line: 'proposal', tag: 'proposal', text: 'A nonprofit needs a volunteer sign-up app.' },
      { line: 'design', tag: 'design', text: 'Designers research users and sketch screens.' },
      { line: 'sprint', tag: 'sprint', sprints: 3, text: 'plan → build → review', after: '…repeat until it’s ready: the agile cycle' },
      { line: 'review', tag: 'code review', text: 'A teammate checks every change.' },
      { line: 'demo', tag: 'Demo Day', text: 'The team presents the finished app.' },
      { line: 'handoff', tag: 'handoff', text: 'The nonprofit starts using it, and the maintenance team keeps it running.' },
    ],
    done: 'Shipped in one semester.',
    next: 'Find the role that fits you',
  },

  /* "Which role fits you?" quiz under the Roles list (js/bog-interactive.js).
     Roles, taglines, openings and apply links were copied from
     bitsofgood.org/join on November 1, 2026 (Spring 2027 applications,
     open until November 17).
     - apply: the role's application form, or null if the role isn't open.
       After `deadline`, every result says applications are closed and points
       to the join page. When Bits of Good opens a new round, update
       `round`, `deadline`, `deadlineText`, `checked` and each `apply`.
     - family: the role in the Roles list above that it belongs to. The
       result's "See this role above" button opens that one.
     - In `questions`, an option either goes to another question (next) or
       ends the quiz with a role (role). */
  roleQuiz: {
    round: 'Spring 2027',
    deadline: '2026-11-17T23:59:59-05:00',
    deadlineText: 'November 17',
    checked: 'November 1, 2026',
    joinPage: 'https://bitsofgood.org/join',
    cite: 'Bits of Good, n.d.-i',
    start: 'start',
    questions: {
      start: { q: 'Which sounds most like you?', options: [
        { text: 'I like building things with code', next: 'code' },
        { text: 'I like designing how apps look and work', next: 'design' },
        { text: 'I like leading a team and planning the work', next: 'lead' },
        { text: 'I like meeting people and finding out what they need', next: 'partner' },
        { text: 'I like telling stories with words, video or social media', next: 'story' },
        { text: 'I like organizing events and bringing people together', next: 'events' },
      ] },
      code: { q: 'How much coding have you done?', options: [
        { text: 'Not much yet, but I want to learn', role: 'devBootcamper' },
        { text: 'Some, in classes or my own projects', next: 'codeSome' },
        { text: 'A lot. I could teach it', next: 'codeLots' },
      ] },
      codeSome: { q: 'Which would you rather do?', options: [
        { text: 'Build features with a project team', role: 'developer' },
        { text: 'Help shape new projects with nonprofits', role: 'npWebDev' },
      ] },
      codeLots: { q: 'With that experience, you’d rather…', options: [
        { text: 'Lead a team’s technical work and review code', role: 'engManager' },
        { text: 'Teach new members the basics', role: 'devInstructor' },
        { text: 'Keep building features myself', role: 'developer' },
      ] },
      design: { q: 'How much design have you done?', options: [
        { text: 'Not much yet, but I want to learn', role: 'designBootcamper' },
        { text: 'Some, in classes or my own projects', role: 'productDesigner' },
        { text: 'A lot. I could teach it', next: 'designLots' },
      ] },
      designLots: { q: 'With that experience, you’d rather…', options: [
        { text: 'Design screens for a nonprofit project', role: 'productDesigner' },
        { text: 'Teach new members the basics', role: 'designInstructor' },
      ] },
      lead: { q: 'Which part of leading sounds best?', options: [
        { text: 'Working with the nonprofit to decide what to build', role: 'productManager' },
        { text: 'Making the technical calls and reviewing code', role: 'engManager' },
      ] },
      partner: { q: 'With a nonprofit, you’d rather…', options: [
        { text: 'Interview them and write up a project proposal', role: 'npConsultant' },
        { text: 'Use your coding skills to scope what they need', role: 'npWebDev' },
      ] },
      story: { q: 'What would you rather make?', options: [
        { text: 'Videos', role: 'videographer' },
        { text: 'Posts and campaigns', role: 'digitalMarketer' },
        { text: 'The words: captions, emails and articles', role: 'copywriter' },
      ] },
      events: { q: 'Which sounds more fun?', options: [
        { text: 'Running an event for 100 people', role: 'opsCoordinator' },
        { text: 'Getting 100 people to show up to it', role: 'digitalMarketer' },
      ] },
    },
    roles: {
      productManager: { name: 'Product Manager', family: 'Product',
        tagline: 'The frontline client communicator and project team lead',
        about: 'You’d be the bridge between students and a nonprofit: finding out what the partner needs, writing the roadmap and keeping the project on schedule.',
        apply: 'https://forms.gle/diy1nwb47WycAt438' },
      productDesigner: { name: 'Product Designer', family: 'Design',
        tagline: 'Master of product mockups and UX',
        about: 'You’d research the people who will use an app and design its wireframes and screens.',
        apply: 'https://forms.gle/J4dEkzsD7Z6zjA127' },
      designInstructor: { name: 'Design Bootcamp Instructor', family: 'Bootcamp Instructor',
        tagline: 'Leaders who develop future Bits of Good designers',
        about: 'You’d teach new members the basics of product design in bootcamp, review their work and mentor them through their first projects.',
        apply: 'https://forms.gle/J4dEkzsD7Z6zjA127' },
      npConsultant: { name: 'Nonprofit Partnership Consultant', family: 'Nonprofit Partner',
        tagline: 'Advocates ready to connect with potential nonprofits',
        about: 'You’d recruit new nonprofit partners, interview them about their challenges and turn their needs into software proposals.',
        apply: 'https://forms.gle/nTyNcKrGhz8uin8s5' },
      npWebDev: { name: 'Nonprofit Partnership Web Developer', family: 'Nonprofit Partner',
        tagline: 'Advocates ready to connect with potential nonprofits',
        about: 'You’d join the team that recruits new nonprofit partners and turns their needs into proposals, and bring your web development skills to it.',
        apply: 'https://forms.gle/nTyNcKrGhz8uin8s5' },
      engManager: { name: 'Engineering Manager', family: 'Engineering',
        tagline: 'Arbiter of the dev roadmap and GitHub guru',
        about: 'You’d lead a team’s technical work: planning sprints, reviewing code and making sure the finished software is reliable.',
        apply: 'https://forms.gle/ahPjUo4rVSurfRWQA' },
      /* Open, but the form link on the join page didn't open when we checked,
         so this one goes to the join page instead. */
      devInstructor: { name: 'Developer Bootcamp Instructor', family: 'Bootcamp Instructor',
        tagline: 'Instructors to teach basics of React and Express',
        about: 'You’d teach new members the basics of web development in bootcamp and mentor them as they build their first projects.',
        apply: 'https://bitsofgood.org/join' },
      developer: { name: 'Developer', family: 'Engineering',
        tagline: 'An experienced webdev ready to dive into our JS-heavy stack',
        about: 'You’d build web apps for a nonprofit partner with a project team.',
        apply: null },
      devBootcamper: { name: 'Developer Bootcamper', family: 'Bootcamper',
        tagline: 'Students excited to make an impact with webdev',
        about: 'Bootcamp teaches the basics of web development through hands-on projects, so you’re ready to join a nonprofit project team the next semester.',
        apply: null },
      designBootcamper: { name: 'Design Bootcamper', family: 'Bootcamper',
        tagline: 'Students intrigued by the world of design',
        about: 'Bootcamp teaches the basics of product design through hands-on projects, so you’re ready to join a nonprofit project team the next semester.',
        apply: null },
      copywriter: { name: 'Copywriter', family: 'Marketing',
        tagline: 'Quick with a pen, ready to inspire others',
        about: 'You’d write the words that tell Bits of Good’s story, from social media posts to newsletters and recruitment campaigns.',
        apply: 'https://forms.gle/sibq4jTNsw72gzREA' },
      digitalMarketer: { name: 'Digital Marketer', family: 'Marketing',
        tagline: 'Knower of all-things communication and promotion',
        about: 'You’d run Bits of Good’s social media and campaigns, and spread the word about finished projects so more students and nonprofits get involved.',
        apply: 'https://forms.gle/sR7bkBtGRQdiVUna6' },
      videographer: { name: 'Videographer', family: 'Marketing',
        tagline: 'A video-editing whiz, presenting Bits of Good to the world',
        about: 'You’d film and edit the videos that show Bits of Good’s people and projects.',
        apply: 'https://forms.gle/P6PJ9VUXdJfPskVX8' },
      opsCoordinator: { name: 'Operations and Community Coordinator', family: 'Operations',
        tagline: 'Coordinator of club initiatives, logistics, and more',
        about: 'You’d keep the club running behind the scenes: planning events and showcases, handling recruitment logistics and supporting members across every team.',
        apply: 'https://forms.gle/tqid7UvL8YiK9h94A' },
    },
  },

  /* ---------------------------------------------------------------
     HACK4IMPACT CHAPTERS (North America map)
     status: 'active' | 'forming' | 'inactive'
     --------------------------------------------------------------- */
  chapters: [
    { id: 'gt', school: 'Georgia Tech', chapter: 'Bits of Good', city: 'Atlanta, GA', status: 'active', founded: 2017, members: 102, projects: 20,
      at: [33.7756, -84.3963], web: 'https://bitsofgood.org', github: 'https://github.com/GTBitsOfGood', instagram: 'https://www.instagram.com/gtbitsofgood', h4i: 'georgia-tech', home: true,
      nonprofitStory: 'Bits of Good builds free software for nonprofits, many of them here in Atlanta (Bits of Good, n.d.-a; Hack4Impact, n.d.-b). One example is a volunteer management system for Helping Mamas, a baby supply bank (Bits of Good, n.d.-g).',
      studentStory: '“When I first came to Georgia Tech as a freshman, I knew I wanted to leave having done something outside the classroom,” said Nikhil, a Bits of Good member. He wanted “to work with real nonprofits in Atlanta to make a lasting impact” (GT Bits of Good, 2026a).',
      studentVideo: { url: 'https://www.facebook.com/reel/898623749809840', label: 'Watch Nikhil’s story' } },
    { id: 'emory', school: 'Emory University', chapter: 'Hack4Impact Emory', city: 'Atlanta, GA', status: 'active', founded: null, members: 2, projects: 0,
      at: [33.7925, -84.3240], web: 'https://emory.hack4impact.org', github: 'https://github.com/Emory-Hack4Impact', h4i: 'emory-university',
      nonprofitStory: null,
      studentStory: null },
    { id: 'upenn', school: 'University of Pennsylvania', chapter: 'Hack4Impact UPenn', city: 'Philadelphia, PA', status: 'active', founded: 2014, members: 34, projects: 66,
      at: [39.9522, -75.1932], web: 'https://upenn.hack4impact.org', github: 'https://github.com/hack4impact-upenn', instagram: 'https://www.instagram.com/hack4impactpenn/', h4i: 'university-of-pennsylvania',
      nonprofitStory: 'Hack4Impact started at Penn in 2014 (Hack4Impact, n.d.-a). In 2017, Penn students built Youth Matters: Philly, an app that helps young people leaving foster care find shelters, food banks, and health care. The Juvenile Law Center’s director called it “a much-needed tool” (“Penn Partners on New App,” 2017).',
      studentStory: null },
    { id: 'drexel', school: 'Drexel University', chapter: 'Hack4Impact Drexel', city: 'Philadelphia, PA', status: 'active', founded: null, members: 15, projects: 1,
      at: [39.9566, -75.1899], web: 'https://drexel.hack4impact.org', instagram: 'https://www.instagram.com/hack4impactdrexel/', h4i: 'drexel-university',
      nonprofitStory: null,
      studentStory: null },
    { id: 'uiuc', school: 'University of Illinois Urbana-Champaign', chapter: 'Hack4Impact UIUC', city: 'Urbana, IL', status: 'active', founded: 2017, members: 31, projects: 44,
      at: [40.1020, -88.2272], web: 'https://uiuc.hack4impact.org', github: 'https://github.com/hack4impact-uiuc', instagram: 'https://www.instagram.com/hack4impactuiuc/', h4i: 'university-of-illinois-urbana-champaign',
      nonprofitStory: 'UIUC students built Oasis for the New American Welcome Center. It’s an online directory that helps local immigrants find housing, legal aid, citizenship help, and health care in one place. The center links to it from its own website (New American Welcome Center, n.d.).',
      studentStory: 'A lot of members picked projects that meant something to them. One designer whose parents are from the Philippines worked on a platform for a Philippine career nonprofit. Others said it was the first time they got to use their CS skills on something real (Bales, 2023).' },
    { id: 'cornell', school: 'Cornell University', chapter: 'Cornell Hack4Impact', city: 'Ithaca, NY', status: 'active', founded: 2018, members: 99, projects: 32,
      at: [42.4534, -76.4735], web: 'https://cornell.hack4impact.org', github: 'https://github.com/cornellh4i', instagram: 'https://www.instagram.com/cornellhack4impact', h4i: 'cornell-university',
      nonprofitStory: 'Ithaca Community Recovery holds over 200 recovery meetings a month, and it’s run entirely by volunteers. Cornell students built an app that shows the schedule online and on a screen facing the street, so someone who needs a meeting at 2 a.m. can see when the next one starts (“Students Design Crucial Tool,” 2025).',
      studentStory: '“I think it just brings a sense of fulfillment to be able to help people who need the help,” said Justin Eburuoh, one of the chapter’s co-directors (Kim, 2026).' },
    { id: 'umd', school: 'University of Maryland, College Park', chapter: 'Hack4Impact UMD', city: 'College Park, MD', status: 'active', founded: null, members: 113, projects: 32,
      at: [38.9869, -76.9426], web: 'https://umd.hack4impact.org', github: 'https://github.com/Hack4Impact-UMD', instagram: 'https://www.instagram.com/hack4impactumd/', h4i: 'university-of-maryland-college-park',
      nonprofitStory: 'Food for All DC brings food to people in D.C. who can’t easily leave home. Its deliveries used to run on spreadsheets filled in by hand. Maryland students rebuilt the system with a map of every client to help drivers coordinate (Zarate, 2025).',
      studentStory: '“It’s really, really had a profound impact on the way that I’m gonna move forward in life,” said Sheldon Padgett, one of the chapter’s executive directors, as he got ready to graduate (Zarate, 2025).' },
    { id: 'calpoly', school: 'Cal Poly, San Luis Obispo', chapter: 'Hack4Impact Cal Poly', city: 'San Luis Obispo, CA', status: 'active', founded: 2018, members: 157, projects: 30,
      at: [35.3050, -120.6625], web: 'https://calpoly.hack4impact.org', github: 'https://github.com/hack4impact-calpoly', instagram: 'https://www.instagram.com/hack4impactcalpoly/', h4i: 'cal-poly-san-luis-obispo',
      nonprofitStory: 'Kids First Initiative teaches science to kids ages 7 to 10 with hands-on activities. Cal Poly students turned some of those lessons into two online games, so the lessons can reach kids the nonprofit’s staff can’t visit in person (Slater, 2026).',
      studentStory: '“You make lifelong friends,” said co-executive director Sanjana Checker. “And you learn how to work as part of a big team” (Slater, 2026).' },
    { id: 'bu', school: 'Boston University', chapter: 'Hack4Impact BU', city: 'Boston, MA', status: 'active', founded: 2018, members: 56, projects: 9,
      at: [42.3505, -71.1054], web: 'https://bu.hack4impact.org', instagram: 'https://www.instagram.com/hack4impactbu/', h4i: 'boston-university',
      nonprofitStory: 'BU students built Foster Friends, an app that helps people find pets to adopt. They also worked on a video learning app for Kaleidoscope Village, a nonprofit that raises awareness about the LGBTQ community (Tannenbaum, 2022).',
      studentStory: '“I saw this as a gateway to combine my major, computer science, with working with nonprofits and volunteering,” said co-director Christian Mark. “I found a really good home” (Tannenbaum, 2022).' },
    { id: 'carleton', school: 'Carleton College', chapter: 'Hack4Impact Carleton', city: 'Northfield, MN', status: 'active', founded: 2020, members: 4, projects: 3,
      at: [44.4615, -93.1545], web: 'https://carleton.hack4impact.org', github: 'https://github.com/h4icarleton', h4i: 'carleton-college',
      nonprofitStory: 'Carleton students spent about two years building an app with Isuroon, a Twin Cities nonprofit for Somali women and girls. The app is meant to connect Somali women in Minnesota with health care providers who understand their culture (“Hack4Impact Demo Day,” 2023).',
      studentStory: null },
    { id: 'rutgers', school: 'Rutgers University, New Brunswick', chapter: 'Hack4Impact Rutgers', city: 'New Brunswick, NJ', status: 'active', founded: 2022, members: 21, projects: 3,
      at: [40.5008, -74.4474], web: 'https://rutgers.hack4impact.org', github: 'https://github.com/Hack4ImpactRutgers', instagram: 'https://www.instagram.com/rutgershack4impact/', h4i: 'rutgers-university-new-brunswick',
      nonprofitStory: null,
      studentStory: null },
    { id: 'utk', school: 'University of Tennessee, Knoxville', chapter: 'Hack4Impact UTK', city: 'Knoxville, TN', status: 'active', founded: 2020, members: 60, projects: 17,
      at: [35.9544, -83.9295], web: 'https://utk.hack4impact.org', github: 'https://github.com/hack4impact-utk', h4i: 'university-of-tennessee-knoxville',
      nonprofitStory: 'Compassion Ministries, a Knoxville food ministry run by volunteers, tracked everything in one Excel spreadsheet. Two of the chapter’s co-directors made it their senior project to build a free system for tracking its supplies and volunteers. “It’s extremely valuable to have them doing this for us,” said director Robin Rolland, “because there is no way we could do this otherwise” (“Senior Design Project,” 2024).',
      studentStory: '“Both Zavier and I started our freshman year not knowing anything about how to build a website,” said co-director Andrew Rutter. “By being on this team, we learned how to do that” (“Senior Design Project,” 2024).' },
    { id: 'mcgill', school: 'McGill University', chapter: 'Hack4Impact McGill', city: 'Montréal, QC', status: 'active', founded: 2019, members: 31, projects: 13,
      at: [45.5048, -73.5772], web: 'https://mcgill.hack4impact.org', github: 'https://github.com/hack4impact-mcgill', instagram: 'https://www.instagram.com/hack4impactmcgill/', h4i: 'mcgill-university',
      nonprofitStory: 'Welcome Collective helps refugee claimants who just arrived in Montréal get the basics they need. McGill students are building the group an inventory system to keep track of donations (Hack4Impact McGill, n.d.-b).',
      studentStory: '“A lot of classwork at McGill is super theoretical,” said alum Albert Kragl. At Hack4Impact, he said, “you get to build a project from the ground up” (Hack4Impact McGill, n.d.-a).' },
    { id: 'poly', school: 'Polytechnique Montréal', chapter: 'Hack4Impact Polytechnique', city: 'Montréal, QC', status: 'active', founded: null, members: null, projects: null,
      at: [45.5046, -73.6131], h4i: 'polytechnique-montreal',
      nonprofitStory: null,
      studentStory: null },
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
      // One string, or a list of strings for more than one paragraph.
      summary: [
        'Bits of Good takes on new nonprofit projects each semester. A nonprofit applies with what it needs, usually either a brand-new idea or an unfinished app or one that needs a redesign. The application asks how often the nonprofit can meet with the student team and whether students can visit to watch and talk to the people who will use the app (Bits of Good, n.d.-k). Each team has a product manager, engineering manager, designers, and developers. At the end, the team hands the app over to the nonprofit for free.',
        'Not every member codes. Others find new nonprofit partners, run marketing, or plan events, and newcomers can learn the basics in the club’s developer and design bootcamps (Bits of Good, n.d.-a, n.d.-i). Bits of Good even has a project for Georgia Tech students. If you’ve planned your classes on the GT Scheduler website, you’ve already used it! There’s also a project maintenance team that helps maintain the delivered websites (Bits of Good, n.d.-e).',
      ],
    },

    /* Projects on the Atlanta map (from bitsofgood.org/projects, the Bits of Good
       blog and its GitHub). In each pop-up:
         category   the filter chip it belongs to
         when       when Bits of Good worked on it
         sub, where the line under the name (sub defaults to "Bits of Good nonprofit partner")
         whatTitle  heading of the first section (defaults to "What they do")
         link       Bits of Good's page for the project (bitsofgood.org/projects if it has none)
         note       small print at the bottom (without one, approx: true shows "Pin location is approximate.")
       Pins are approximate. Groups based outside Atlanta sit at the edge of the
       map, in their direction, and their note says where they are. */
    nonprofits: [
      { id: 'ablealliance', name: 'ABLE Alliance', category: 'Student tools', where: 'Georgia Tech campus', at: [33.7660, -84.4075], approx: true,
        sub: 'Georgia Tech student organization',
        what: 'ABLE Alliance is a Georgia Tech student group that works to make campus more inclusive for people with disabilities, through shared access and resources and community support (Bits of Good, 2026a).',
        built: 'Ride system for student paratransit',
        builtNote: 'It powers Georgia Tech’s Student Paratransit Service. Riders log in with their Georgia Tech accounts and get live ride updates, messages, and travel-time estimates on a map (Bits of Good, 2026a).',
        when: '2026', link: 'https://bitsofgood.org/projects',
        note: 'On the Georgia Tech campus. Pin location is approximate.' },
      { id: 'gtscheduler', name: 'GT Scheduler', category: 'Student tools', where: 'Georgia Tech campus', at: [33.7895, -84.4025], approx: true,
        sub: 'Bits of Good project for Georgia Tech students', whatTitle: 'Why it exists',
        what: 'Class registration is stressful, and the information students need is scattered. GT Scheduler is a team inside Bits of Good that works on that problem for every Georgia Tech student (Bits of Good, n.d.-e).',
        built: 'Class scheduling website',
        builtNote: 'Students can look up classes, check prerequisites and open seats, and build their schedule in one place. The class data updates from OSCAR every 15 minutes (Bits of Good, n.d.-e).',
        when: 'Ongoing', link: 'https://bitsofgood.org/projects/gt-scheduler',
        note: 'On the Georgia Tech campus. Pin location is approximate.' },
      { id: 'ican', name: 'iCAN', category: 'Public-facing', where: 'Atlanta', at: [33.8350, -84.4320], approx: true,
        what: 'iCAN, the International Children’s Advisory Network, gives kids and teens with medical conditions a voice in medical research. Its youth members advise companies and regulators on how to make research better for children (International Children’s Advisory Network, n.d.).',
        built: 'Medication game for kids',
        builtNote: 'Kids in clinical trials care for a virtual pet whose health depends on them taking their medicine on schedule. The goal is to help them stick with their treatment (Bits of Good, 2026c).',
        when: '2025–26', link: 'https://bitsofgood.org/projects' },
      { id: 'canine', name: 'Canine Assistants', category: 'Administrative', where: 'Milton, Georgia', at: [33.9050, -84.3600], approx: true,
        what: 'Canine Assistants trains service dogs for people with mobility challenges, seizure disorders, or Type 1 diabetes. It also places dogs in children’s hospitals (Bits of Good, n.d.-c).',
        built: 'Database for tracking its dogs',
        builtNote: 'Staff and volunteers keep dated logs on each dog, from its home and program status to health updates. Staff can search and filter the records and choose which logs volunteers can see (Bits of Good, n.d.-c).',
        when: '2023–24', link: 'https://bitsofgood.org/projects/canine-assistants',
        note: 'Canine Assistants is in Milton, north of Atlanta, so its pin sits at the edge of the map.' },
      { id: 'hopeforhaiti', name: 'Hope for Haiti', category: 'Administrative', where: 'Naples, Florida, and southern Haiti', at: [33.6920, -84.3100], approx: true,
        what: 'Hope for Haiti works to improve life in southern Haiti, especially for women and children, through education, health care, clean water, and economic development. It has given out more than $49 million in medical supplies and medicine at no cost (Hope for Haiti, 2026).',
        built: 'Medical supply distribution platform',
        builtNote: 'It helps Hope for Haiti track medical supplies and get them to its partners, with built-in chat and notifications (Bits of Good, 2026b).',
        when: '2025–26', link: 'https://bitsofgood.org/projects',
        note: 'Hope for Haiti is based in Naples, Florida, and works in southern Haiti, so its pin sits at the edge of the map.' },
      { id: 'vms', name: 'Volunteer Management Solution', category: 'Administrative', where: 'Georgia Tech campus', at: [33.7860, -84.4230], approx: true,
        sub: 'Bits of Good’s own product for nonprofits', whatTitle: 'Where it came from',
        what: 'Bits of Good first built this for Helping Mamas. It grew into a product that any nonprofit can use to organize events and reach volunteers (Bits of Good, n.d.-o).',
        built: 'Volunteer event platform',
        builtNote: 'Nonprofits post events, and volunteers sign up, check in and out, and sign waivers on the platform. Both can see a dashboard of volunteer hours and attendance (Bits of Good, n.d.-o).',
        when: '2023–24', link: 'https://bitsofgood.org/projects/vms',
        note: 'Built by Bits of Good on the Georgia Tech campus. Pin location is approximate.' },
      { id: 'bei', name: 'Brain Exercise Initiative', category: 'Data', where: 'Chapters across the U.S.', at: [33.8100, -84.2500], approx: true,
        what: 'The Brain Exercise Initiative works to slow memory loss in seniors with Alzheimer’s, using simple math, reading, and writing exercises in a mobile app (Bits of Good, n.d.-b).',
        built: 'Analytics dashboard for its app',
        builtNote: 'Volunteers and staff can see how seniors use the app and search a patient database to follow each person’s progress. The team also worked on exercises that get harder as a user improves (Bits of Good, n.d.-b).',
        when: '2023–24', link: 'https://bitsofgood.org/projects/brain-exercise-initiative',
        note: 'BEI has chapters at universities across the country, so this pin doesn’t mark one place.' },
      { id: 'jag', name: 'Jennifer Ann’s Group', category: 'Public-facing', where: 'Atlanta', at: [33.8550, -84.3650], approx: true,
        what: 'Jennifer Ann’s Group works to prevent teen dating violence. It makes educational games and lesson plans for young people, parents, and teachers (Bits of Good, n.d.-h).',
        built: 'One home for its games and lessons',
        builtNote: 'The site puts its games, lesson plans, and other resources in one place and lets visitors donate while they play. The team also worked on converting more than 60 old Flash games so they run in today’s browsers (Bits of Good, n.d.-h).',
        when: 'Spring 2024', link: 'https://bitsofgood.org/projects/jennifer-anns-group' },
      { id: 'heartofpassion', name: 'Heart of Passion', category: 'Data', where: 'Peachtree City, Georgia', at: [33.6970, -84.4300], approx: true,
        what: 'Heart of Passion is led by teens with cancer. Its teen leaders plan retreats where other teens with cancer can meet people going through the same thing (Bits of Good, n.d.-f).',
        built: 'Retreat planner and budget tracker',
        builtNote: 'Each chapter plans its retreat and tracks its own budget and donations, with a “fundraising thermometer” that shows how close it is to its goal. The founder can see every chapter’s numbers in one place (Bits of Good, n.d.-f).',
        when: '2023–24', link: 'https://bitsofgood.org/projects/heart-of-passion',
        note: 'Heart of Passion is based in Peachtree City, south of Atlanta, so its pin sits at the edge of the map.' },
      { id: 'mbb', name: 'Motherhood Beyond Bars', category: 'Administrative', where: 'Atlanta', at: [33.7220, -84.4050], approx: true,
        what: 'When a woman in a Georgia prison gives birth, Motherhood Beyond Bars supports the caretaker who takes the baby home with supplies and resources, in hopes of reuniting the family later (Bits of Good, n.d.-j).',
        built: 'Caretaker app and staff portal',
        builtNote: 'Caretakers sign up, request baby items, and find answers to common questions in the app. Staff use the portal to track orders and keep caretakers’ information up to date (Bits of Good, n.d.-j).',
        when: '2022–24', link: 'https://bitsofgood.org/projects/motherhood-beyond-bars' },
      { id: 'gacore', name: 'Georgia CORE', category: 'Public-facing', where: 'Statewide in Georgia', at: [33.8020, -84.3570], approx: true,
        what: 'Georgia CORE is a statewide nonprofit that works to bring more cancer clinical trials and research to Georgia and to promote education and early detection (Bits of Good, n.d.-d).',
        built: 'Navigation assistant for its website',
        builtNote: 'Visitors pick from cards that point them to the information or person they need. The goal was to cut the time staff spend answering emails by 75% (Bits of Good, n.d.-d).',
        when: 'Fall 2022', link: 'https://bitsofgood.org/projects/georgia-core' },
      { id: 'southface', name: 'Southface Energy Institute', category: 'Sustainability', where: 'Atlanta', at: [33.7694, -84.3840], approx: true,
        what: 'Southface is an Atlanta nonprofit that supports sustainable homes, workplaces, and communities. Its EarthCraft program certifies healthy, efficient buildings (Bits of Good, n.d.-n).',
        built: 'Building standards library and plan builder',
        builtNote: 'Builders and designers search Southface’s technical standards and turn them into a project plan they can share with their construction teams as a link or PDF (Bits of Good, n.d.-n).',
        when: '2022–24', link: 'https://bitsofgood.org/projects/southface-energy-institute' },
      { id: 'theray', name: 'The Ray', category: 'Sustainability', where: 'Troup County, Georgia', at: [33.7350, -84.4450], approx: true,
        what: 'The Ray works on greener highways. Two of its projects are a station that checks tire pressure automatically and a solar-powered charger for electric cars (Bits of Good, n.d.-m).',
        built: 'Data stories for two of its projects',
        builtNote: 'Students turned live data from both projects into interactive stories for The Ray’s website and for screens at its Welcome Center and partner sites (Bits of Good, n.d.-m).',
        when: 'Fall 2020', link: 'https://bitsofgood.org/projects/the-ray',
        note: 'The Ray is in Troup County, southwest of Atlanta, so its pin sits at the edge of the map.' },
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
