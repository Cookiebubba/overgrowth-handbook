module.exports = {
"mvp-scope": {
  what: "Decide the smallest version that fully solves one job.",
  blurb: "Cut the scope until it hurts, then cut again.",
  why: "Your MVP (minimum viable product) solves ONE job for ONE type of user, start to finish. Everything else is grass that grows back later.",
  steps: ["Write a single job story: 'When &lt;situation&gt;, I want &lt;motivation&gt;, so I can &lt;outcome&gt;.'","List every feature and mark each one MUST or LATER. Only the path to the user's first win (the 'aha' moment) stays.","Give yourself 6 weeks or less to reach something a stranger could pay for.","Consider a concierge or 'Wizard of Oz' MVP: the user fills in a form, and you do the work by hand behind the scenes."],
  template: "Job story + MUST list (5 items or fewer) + ship date.",
  pitfalls: ["Building login, teams, settings, and dark mode before anyone pays.","Adding 'just one more feature' before launch.","Building a platform when a script would do."],
  goal: "A written MUST list of 5 items or fewer, and a ship date you've committed to.",
  week: "Delete half your backlog.",
  mods: ["Lean blade: you ship much faster"]
},
"stack": {
  what: "Pick simple, familiar tech and get a live deploy working.",
  blurb: "Use what you already know. New tech is a tax on your time.",
  why: "When you're solo, you're also the operations team. Boring, well-documented tools on managed hosting mean fewer emergencies at 2am.",
  steps: ["Use the language and framework you know best (Rails, Laravel, Django, Next.js, and so on).","Use a managed Postgres database and a one-click host (Render, Fly, Railway, Vercel).","Use ready-made login (Clerk, Supabase Auth, or your framework's built-in auth) and Stripe for payments.","Add error tracking (such as Sentry) and an uptime check from day one."],
  pitfalls: ["Microservices or Kubernetes for zero users.","Learning a new stack on your startup's clock.","No backups."],
  goal: "A basic app is live at a real production URL, with login, a database, and error tracking.",
  week: "Deploy the empty app to production today.",
  mods: []
},
"mvp-build": {
  what: "Build version 0.1: the one workflow a stranger could pay for.",
  blurb: "Build only the core workflow from your scope list.",
  why: "Your MVP exists to find out whether people will use and pay for the core job. A narrow product that works start to finish beats a broad one that half works.",
  steps: ["Build the path to the first win first: input, core action, visible result.","Fake or skip everything else (admin, reports, settings), or do it by hand behind a form.","Deploy to a real URL by the end of week 1, even if it's ugly.","Get 3 people you interviewed to try it by week 3, and watch them use it.","Keep a 'not now' list, and say no to everything on it."],
  template: "Week 1: deploy the skeleton · Week 2: core workflow · Week 3: 3 users try it · Week 4: fix the top 3 problems",
  pitfalls: ["Building login, teams, and settings before the core job works.","Polishing the design before anyone has used it.","Going 8 weeks without showing anyone."],
  goal: "Three target users have completed the core workflow on a live URL.",
  week: "Deploy the skeleton to production.",
  mods: ["Working blade: real usage tells you what to build next"]
},
"ship-weekly": {
  what: "Release something every week and tell people about it.",
  blurb: "Ship something visible every week, and share it publicly or with users.",
  why: "A steady rhythm adds up. It gives you a changelog, material for build-in-public posts, and trust from your users.",
  steps: ["Monday: pick 1–3 outcomes. Friday: ship them and write a 3-line changelog entry.","Park new ideas on a list. Don't switch to them mid-week.","Email the changelog to your waitlist or users every 1–2 weeks."],
  pitfalls: ["Saving everything for one big release.","Shipping without telling anyone.","Polishing internals no user will see."],
  goal: "4 weekly releases in a row, each with a changelog entry.",
  week: "Create your changelog page.",
  mods: ["Momentum: more Build gold"]
},
"landing-page": {
  what: "A page that explains the product in 5 seconds and has one clear button.",
  blurb: "Headline, proof, one button, all in your customers' words.",
  why: "Your landing page is a salesperson that works around the clock. Every growth channel you use later sends people here.",
  steps: ["At the top: a headline about the outcome, a subheading that names who it's for, one button, and a screenshot or short GIF of the product.","Further down: 3 pains turned into 3 outcomes, how it works in 3 steps, proof (quotes, logos, numbers), pricing, and an FAQ that answers objections.","Use real quotes from your interviews.","Make it load in under 2 seconds, check it on a phone, and set a link-preview image."],
  template: "Headline: &lt;Outcome&gt; without &lt;pain&gt;. Subheading: &lt;Product&gt; helps &lt;who&gt; &lt;do the job&gt; in &lt;time&gt;. Button: Start free / Book a demo.",
  pitfalls: ["A clever headline no one understands in 5 seconds.","Several buttons competing for attention.","Listing features without saying what they get the user."],
  goal: "5-second test: show it to 5 strangers for 5 seconds, and at least 4 can say what it does and who it's for.",
  week: "Run the 5-second test with 5 people.",
  mods: ["Field magnet: every channel converts better"]
},
"analytics": {
  what: "Track the few numbers that matter: visits, signups, activation, and payment.",
  blurb: "Track the 5 events that matter, not 500.",
  why: "You can't improve activation or ad spending if you can't see them.",
  steps: ["Set up privacy-friendly web analytics such as Plausible, Umami, or PostHog.","Track 5 events: signup, activation (the user's first 'aha' moment), first real value, payment, and cancellation.","Add UTM tags (tracking codes in the link) to every link you share. Build a weekly view: visitors → signups → activated → paid."],
  pitfalls: ["Watching vanity numbers like pageviews.","Never defining what 'activated' means.","Collecting data without a weekly review."],
  goal: "A funnel dashboard with 5 events that you review every Monday.",
  week: "Write a one-sentence definition of your activation event.",
  mods: []
},
"onboarding": {
  what: "Get new users to their first win in under 5 minutes.",
  blurb: "A new user gets real value in under 5 minutes.",
  why: "Most users who leave do it in their first session. Cutting the time it takes to reach value is the cheapest way to grow.",
  steps: ["Map every step from signup to the first win. Remove or postpone every step you can.","Fill in sample data, and design empty screens that teach the user what to do.","Watch 5 users try it live over screen share. Stay silent and note every hesitation.","Send emails on day 1 and day 3 that nudge them toward the first win."],
  pitfalls: ["Product tours nobody reads.","Asking for 10 fields at signup.","Never watching a real user."],
  goal: "You've watched 5 sessions, and the typical user reaches the first win in under 5 minutes.",
  week: "Run 2 silent screen-share sessions.",
  mods: ["Sticky roots: fewer users leave"]
},
"payments": {
  what: "Set up checkout so people can actually pay you, or pre-order.",
  blurb: "Take money before you feel ready.",
  why: "Payment is the only proof that really counts. Stripe Checkout works well, or a 'merchant of record' like Paddle or Lemon Squeezy can handle global sales tax for you.",
  steps: ["Choose: Stripe, where you handle tax yourself (Stripe Tax helps), or a merchant of record, which handles VAT and sales tax for a higher fee.","Use a hosted checkout page and customer billing portal. Don't build your own billing screens.","Test every case: successful card, failed card, refund, cancellation, and failed-payment reminder emails.","Add a yearly plan, usually priced at about 2 months free."],
  pitfalls: ["A free beta that never ends.","Building custom billing.","Skipping failed-payment emails, so customers drop off when their card expires."],
  goal: "A real card has been charged in production. Your own card counts, then refund it.",
  week: "Switch Stripe to live mode.",
  mods: ["Coin drop: all gold is worth more"]
},
"pricing": {
  what: "Set prices based on the value you deliver.",
  blurb: "Charge more than you think. Price on value, not on your costs.",
  why: "Solo founders almost always charge too little. If you double your price, you usually lose fewer customers than you fear, and you need half as many to hit your goal.",
  steps: ["Base the price on the value you create, or on what the current workaround costs. Not on your server bill.","Offer 2–3 tiers based on something that grows with value, such as seats, projects, or volume.","Quote higher prices on sales calls. If people say 'that's fine' right away, you're too low.","Review prices every 6 months. Keep existing customers on their old price."],
  template: "Starter $19 · Pro $49 (most popular) · Team $149",
  pitfalls: ["Charging $5 a month for a business tool.","Too many tiers.","Making lifetime deals your main model."],
  goal: "A live pricing page with at least 2 tiers, plus one logged price test.",
  week: "On your next call, quote double the price you planned.",
  mods: ["Sharper edge: more revenue from each customer"]
},
"legal": {
  what: "A company, a bank account, terms of service, and a privacy policy: the basic protections.",
  blurb: "Company, terms, privacy policy, bank account. Boring, protective, and quick.",
  why: "A few hours now protects you from personal liability and from payment processors freezing your account. This isn't legal advice, so check the rules where you live.",
  steps: ["Form a company. In the US, an LLC suits bootstrappers. A Delaware C-Corp suits founders who plan to raise venture capital (VC). Stripe Atlas or Clerky can set either up.","Open a separate business bank account. Never mix personal and business money.","Publish terms of service and a privacy policy. Start from a template and get a lawyer to review them once revenue justifies it. Learn the GDPR basics if you have users in the EU.","Start bookkeeping on day one, even in a spreadsheet. Set aside about 25–30% of profit for taxes."],
  pitfalls: ["Forming an LLC and then raising VC, which means paying to convert.","Copying another company's terms of service.","Mixing personal and business money."],
  goal: "Company formed, bank account open, terms and privacy policy live, bookkeeping started.",
  week: "Open the business bank account.",
  mods: ["Armor: protects you from legal and payment surprises"]
},
"support-ops": {
  what: "A simple help inbox and a few help pages.",
  blurb: "Fast, human support is a solo founder's superpower.",
  why: "Big companies can't have the founder reply in 10 minutes. You can, and people tell their friends about it.",
  steps: ["Set up one support inbox (help@) plus in-app chat or a simple contact form.","Write 5 help pages: getting started, the top 3 questions, and billing.","Save reply templates, but sign off personally.","Turn every repeated question into a help page or a product fix."],
  pitfalls: ["Ticketing software built for 50 support agents.","Hiding your email address.","Answering the same question 10 times."],
  goal: "Support channel live, 5 help pages written, and a promise to reply within 24 hours.",
  week: "Write the getting-started page.",
  mods: ["Goodwill: happy users refer more people"]
}
};
