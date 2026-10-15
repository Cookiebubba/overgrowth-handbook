module.exports = {
"founder-mode": {
  what: "Decide what kind of business you want and how much time you can give it.",
  blurb: "Choose your game: a lifestyle business, an indie software product, or a venture-backed rocket.",
  why: "Solo founders often burn out because the business they're building doesn't match the life they want. Pick your target outcome first. It decides which parts of this tree matter to you.",
  steps: ["Write down what a good result looks like in 3 years, in one sentence. Example: '$10k in monthly recurring revenue (MRR), 20-hour weeks, no boss.'","Pick a lane. <b>Bootstrap</b>: grow on profit. <b>Hybrid</b>: bootstrap now and raise money later if demand pulls you. <b>Venture</b>: only if the idea could become a $100M+ company.","Block at least 10 protected hours a week on your calendar for the next 12 weeks.","Set a pivot date: 'If no one has paid me by &lt;date&gt;, I change the idea.'"],
  template: "My good outcome: ____. Lane: ____. Hours per week: ____. Pivot date: ____.",
  pitfalls: ["Choosing venture because it sounds bigger, not because the market needs outside money.","Skipping the deadline, so the side project drifts into a 3-year hobby.","Confusing busy building with real progress."],
  goal: "Your one-sentence goal, your lane, and your pivot date are written somewhere you'll see every week.",
  week: "Put the recurring time blocks on your calendar today.",
  mods: ["Clarity: +1 weekly focus slot"]
},
"problem-hunt": {
  what: "Find a painful problem that people already spend money or time on.",
  blurb: "Hunt for painful, frequent problems people pay to solve, not clever ideas.",
  why: "Ideas are cheap. Problems that people already spend money or hours on are rare and valuable. Start where you have an inside track: your job history, your communities, and your skills.",
  steps: ["List 20 problems you've seen in your own work and in the communities you belong to.","For one week, read 'what tool do you use for X?' threads on Reddit, Indie Hackers, and niche Slack or Discord groups.","Score each problem from 1 to 5 on four things: how often it happens, how much it hurts, whether people pay to fix it, and how easily you can reach the people who have it.","Shortlist the 3 problems with the highest total."],
  template: "| Problem | Who has it | How often | Pain | Pays today? | Your access | Total |",
  pitfalls: ["Starting from a technology ('I know AI, what can I build?') instead of a problem.","Picking a market you can't reach or don't enjoy talking to.","Choosing a consumer social app as your first solo project. Those usually need network effects and a lot of money."],
  goal: "You have 3 scored problems, each with a clear description of who the buyer is.",
  week: "Spend 30 minutes a day for 5 days reading 3 communities. Write down every complaint you see.",
  mods: []
},
"market-research": {
  what: "Do quick math to check there are enough buyers to reach your income goal.",
  blurb: "Count real buyers from the ground up: could this be a $1M-a-year business for one person?",
  why: "Big top-down market numbers ('a $40B industry') tell you almost nothing. A solo founder needs to know whether about 1,000 customers exist at a realistic price, and whether you can reach them.",
  steps: ["Count buyers you could actually reach: LinkedIn search results, subreddit sizes, directory listings, job posts.","Pick a believable price based on what they already pay for workarounds.","Multiply: buyers × monthly price × 12 × 2% (the share you might win). Is the result at least your 3-year goal?","Check the trend with Google Trends, job-post volume, and recent funding in the space."],
  template: "Reachable buyers ____ × $____ per month × 12 × 2% = $____ per year",
  pitfalls: ["Quoting a huge market you'll never touch.","Forgetting that cheap consumer products need enormous volume.","Assuming 'no competitors' means opportunity. It usually means no market."],
  goal: "A simple sheet shows you can reach your goal while winning 5% of reachable buyers or less.",
  week: "Do the buyer count for your top problem.",
  mods: []
},
"competitor-teardown": {
  what: "Study what people use today and what they dislike about it.",
  blurb: "Competitors prove there's demand. Their 1–3 star reviews show you where to win.",
  why: "Your best angle usually comes from what customers already hate about the tools they use.",
  steps: ["List 5–10 alternatives. Include spreadsheets, agencies, and simply doing nothing.","Read 2–3 star reviews on G2, Capterra, the App Store, and Reddit. Copy the exact phrases people use.","Sign up for the top 2 products. Note where onboarding is frustrating and how pricing works.","Write your angle in one line: 'X for &lt;niche&gt; without &lt;top complaint&gt;.'"],
  template: "Alternative | Price | Top complaint (in their words) | Who it doesn't serve",
  pitfalls: ["Trying to match a funded team feature for feature.","Ignoring the spreadsheet. It's often your real competitor.","Copying competitors' marketing instead of their customers' words."],
  goal: "A short teardown doc and a one-sentence angle.",
  week: "Collect 30 complaints, word for word, in one doc.",
  mods: ["Customer voice: copy written in buyers' own words converts better"]
},
"mom-test": {
  what: "Interview potential customers about what they've actually done, not what they might do.",
  blurb: "Ask about their life and past behavior. Never pitch your idea.",
  why: "People are polite about the future and will say they'd use almost anything. They can't fake what they did last Tuesday or what they paid for last year. This approach comes from Rob Fitzpatrick's book The Mom Test.",
  steps: ["Find people through warm intros, LinkedIn messages, and community posts: 'I'm researching how &lt;role&gt;s handle X. 20 minutes, not selling anything.'","Ask about the past: 'Walk me through the last time X happened.' 'What did you try?' 'What did it cost?' 'Who else cares about this?'","Don't mention your idea for at least the first 15 minutes. Take notes on what they did, what they spent, and their workarounds.","End by asking for a real commitment: join a beta, introduce you to their boss, or pre-pay."],
  template: "Opening message: 'Hi &lt;name&gt;, I'm a developer researching how &lt;role&gt;s deal with &lt;X&gt;. I'm not selling anything. Could I ask you 5 questions for 20 minutes this week?'",
  pitfalls: ["Asking 'Would you use this?' The answers are worthless.","Treating compliments as proof.","Only interviewing friends."],
  goal: "You've logged 10+ interviews covering behavior and spending, and at least 3 people made a commitment.",
  week: "Send 25 outreach messages, aiming to book 5 calls.",
  mods: ["Signal sense: you learn to tell real demand from politeness"]
},
"runway-consult": {
  what: "Pay your bills with client work in the niche you're exploring.",
  blurb: "Sell your skills to fund the product, and get paid to learn about customers.",
  why: "Runway is how many months you can keep going before the money runs out. Consulting for your target niche adds runway and doubles as paid customer research. Many indie software products started as a consulting job someone kept repeating.",
  steps: ["Offer a fixed-scope service to the niche you're researching, such as an audit, an integration, or an automation.","Package it: one fixed price, one timeline, one deliverable.","Cap consulting at 50–60% of your time so the product still gets built.","After each job, write down the work you repeated. That's a product candidate."],
  template: "Offer: 'I'll &lt;outcome&gt; for &lt;niche&gt; in &lt;N&gt; days for $&lt;fixed price&gt;.'",
  pitfalls: ["Hourly billing that swallows all your time.","Taking clients outside your target niche.","Never moving on to the product. Set a date."],
  goal: "You've landed your first paid client in your target niche and updated your runway.",
  week: "Send your fixed-scope offer to 10 people from your interview list.",
  mods: ["Oxygen tank: more months of runway","Paid discovery: every client is also a customer interview"]
},
"runway-dayjob": {
  what: "Keep your job and build on nights and weekends.",
  blurb: "Build in your spare time while your salary covers the bills.",
  why: "Your salary means the money never runs out, but you'll move slower. This works well for business tools whose buyers you can reach by email and messages on your own schedule.",
  steps: ["Read the intellectual property (IP) clause in your employment contract. Build on your own hardware and your own time.","Pick 2 weeknight blocks and 1 weekend block, and protect them.","Decide when you'll quit. Example: monthly revenue at 50% of your salary for 3 months straight.","Batch customer calls into lunch breaks or one evening a week."],
  template: "I quit when monthly revenue is at least $____ for 3 months in a row AND I have at least 6 months of savings.",
  pitfalls: ["Skipping the IP clause. Some contracts claim anything you build.","Building something that competes with your employer.","Drifting without a deadline. Keep your pivot date."],
  goal: "You've checked your IP clause, locked your schedule, and written down when you'll quit.",
  week: "Read the IP section of your contract.",
  mods: ["Steady air: your runway never runs out"]
},
"smoke-test": {
  what: "Put up a simple signup page to test interest before you write code.",
  blurb: "A page for a product that doesn't exist yet, to measure real interest first.",
  why: "Signups with a real email address, or better, a deposit, are cheap evidence. A smoke test can kill a bad idea in a week instead of three months.",
  steps: ["Build one page: a headline in your customers' words, 3 bullet points, and one button ('Join the beta' or 'Pre-order for $X').","Send 200–500 targeted visitors to it through communities, direct messages, or about $50 of search ads.","Measure what share of visitors sign up. 10% or more from targeted traffic is promising. Deposits count for more than emails.","Email every signup and ask what made them sign up. Book calls with the ones who reply."],
  template: "Headline: '&lt;Outcome&gt; for &lt;niche&gt; without &lt;top complaint&gt;.' Button: 'Get early access'.",
  pitfalls: ["Sending random traffic, which makes the numbers meaningless.","Collecting a waitlist and never following up.","Building the product before you've read the results."],
  goal: "At least 200 targeted visitors, a recorded signup rate, and a clear go or no-go decision.",
  week: "Build the page in one evening with Carrd, Framer, or plain HTML.",
  mods: ["Early swarm: your waitlist becomes your launch audience"]
},
"positioning": {
  what: "One sentence that says who it's for, what it replaces, and why it's better.",
  blurb: "Who it's for, what it replaces, and why it's better, in one sentence.",
  why: "Clear positioning makes everything after it easier and cheaper: your landing page, your ads, your launch. Fuzzy positioning makes all of them fail without you noticing why.",
  steps: ["Work through April Dunford's order from her book Obviously Awesome: the alternatives customers use now, what's unique about you, the value that creates, who cares most, and the category you belong in.","Write it as: 'For &lt;who&gt; who &lt;pain&gt;, &lt;product&gt; is a &lt;category&gt; that &lt;value&gt;, unlike &lt;alternative&gt;.'","Say the sentence to 5 people you interviewed. They should be able to repeat it back accurately."],
  template: "For ____ who ____, ____ is a ____ that ____. Unlike ____, we ____.",
  pitfalls: ["Saying it's 'for everyone'.","Leading with the technology ('AI-powered') instead of the result.","Inventing a brand-new category you then have to explain to everyone."],
  goal: "4 out of 5 target users can repeat your sentence back correctly.",
  week: "Write 3 versions and test them on your next calls.",
  mods: ["Sharp blade: your landing page and ads get much easier to write"]
},
"boss-10-conversations": {
  what: "Milestone: 10 real customer conversations that point to the same pain.",
  blurb: "Boss fight. Ten Mom Test interviews that keep revealing the same pain.",
  why: "Until strangers have described the same pain to you 10 times, everything after this is a guess.",
  steps: ["Go back through all your notes. Tag each one for the pain, what they spend today, their workaround, and how urgent it is.","Find the pattern that shows up in at least 6 of the 10.","Write a one-page problem brief, with direct quotes."],
  pitfalls: ["Declaring victory after 3 friendly calls.","Ignoring the 4 people who said it's not really a problem."],
  goal: "10 logged interviews, a one-page problem brief, and at least 3 people asking 'when can I use it?'",
  week: "Schedule your remaining calls.",
  mods: ["Milestone: opens the Build chapters"]
}
};
