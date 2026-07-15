import { connectDB } from './lib/db.js';
import { User } from './models/User.js';
import { Chapter } from './models/Chapter.js';
import bcrypt from 'bcryptjs';

async function seed() {
  await connectDB();
  console.log('Connected to MongoDB');

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'sazzad3029@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Pa$$word@2026';

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      passwordHash,
      role: 'admin',
    });
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  // Create sample chapter: Present Simple
  const existing = await Chapter.findOne({ slug: 'present-simple-tense' });
  if (!existing) {
    await Chapter.create({
      module: 'grammar',
      title: 'Present Simple Tense',
      slug: 'present-simple-tense',
      order: 1,
      description: 'Master the present simple for daily routines, facts, and general truths.',
      readTimeMinutes: 10,
      difficulty: 'beginner',
      icon: 'schedule',
      isPublished: true,
      notes: `
<h2>What is the Present Simple?</h2>
<p>The Present Simple tense is one of the most commonly used tenses in English. It describes habits, general truths, repeated actions, and fixed arrangements.</p>

<div class="bg-primary-fixed/30 border-l-4 border-primary p-lg rounded-r-xl my-xl">
  <div class="flex items-center gap-2 text-primary font-label-md text-label-md mb-2">
    <span class="material-symbols-outlined text-[18px]">lightbulb</span>
    <span>PRO TIP</span>
  </div>
  <p class="italic text-on-surface font-medium">"I <strong>play</strong> football every weekend."</p>
  <p class="text-caption font-caption opacity-80">This describes a routine or habit that happens regularly.</p>
</div>

<h3>Structure</h3>
<p>The structure is: <strong>Subject + Base Verb (with -s/-es for third person)</strong></p>

<div class="space-y-md mb-xl">
  <div class="flex items-start gap-3">
    <span class="material-symbols-outlined text-primary mt-1">check_circle</span>
    <span><strong>Positive:</strong> She <strong>plays</strong> tennis. / They <strong>work</strong> hard.</span>
  </div>
  <div class="flex items-start gap-3">
    <span class="material-symbols-outlined text-error mt-1">cancel</span>
    <span><strong>Negative:</strong> He <strong>does not (doesn't)</strong> like coffee.</span>
  </div>
  <div class="flex items-start gap-3">
    <span class="material-symbols-outlined text-secondary mt-1">help</span>
    <span><strong>Question:</strong> <strong>Do</strong> you <strong>speak</strong> English?</span>
  </div>
</div>

<h3>When to Use It</h3>
<div class="grid grid-cols-2 gap-md mb-xl">
  <div class="bg-surface-container p-md rounded-xl">
    <span class="font-bold text-primary">Habits</span>
    <p class="text-caption">I <strong>drink</strong> coffee every morning.</p>
  </div>
  <div class="bg-surface-container p-md rounded-xl">
    <span class="font-bold text-primary">Facts</span>
    <p class="text-caption">Water <strong>boils</strong> at 100°C.</p>
  </div>
  <div class="bg-surface-container p-md rounded-xl">
    <span class="font-bold text-primary">Schedules</span>
    <p class="text-caption">The train <strong>leaves</strong> at 9 AM.</p>
  </div>
  <div class="bg-surface-container p-md rounded-xl">
    <span class="font-bold text-primary">States</span>
    <p class="text-caption">I <strong>believe</strong> in you.</p>
  </div>
</div>

<h3>Common Time Expressions</h3>
<p>We use these words with the Present Simple: <strong>always, usually, often, sometimes, rarely, never, every day, once a week</strong>.</p>

<div class="bg-on-error-container/5 border border-on-error-container/20 p-lg rounded-xl mb-xl">
  <p class="text-on-error-container font-medium mb-0 flex items-center gap-2">
    <span class="material-symbols-outlined">warning</span>
    Common Mistake: "I am play football." (Wrong!) → "I play football." (Correct!)
  </p>
</div>

<h3>Third Person -s Rules</h3>
<ul class="space-y-md mb-xl">
  <li class="flex items-start gap-3">
    <span class="material-symbols-outlined text-primary mt-1">check_circle</span>
    <span>Most verbs: add <strong>-s</strong> → he play<strong>s</strong>, she work<strong>s</strong></span>
  </li>
  <li class="flex items-start gap-3">
    <span class="material-symbols-outlined text-primary mt-1">check_circle</span>
    <span>Verbs ending in -s, -sh, -ch, -x, -o: add <strong>-es</strong> → she watch<strong>es</strong>, he go<strong>es</strong></span>
  </li>
  <li class="flex items-start gap-3">
    <span class="material-symbols-outlined text-primary mt-1">check_circle</span>
    <span>Verbs ending in consonant + y: change y to <strong>-ies</strong> → she stud<strong>ies</strong></span>
  </li>
</ul>
`,
      questionSets: [
        {
          type: 'practice',
          title: 'Present Simple - Practice 1',
          questions: [
            {
              type: 'mcq',
              prompt: 'She _____ to school every day.',
              options: ['go', 'goes', 'going', 'went'],
              correctAnswer: 'goes',
              justification: 'Third person singular (she) requires -s: goes.',
            },
            {
              type: 'mcq',
              prompt: 'They _____ English very well.',
              options: ['speaks', 'speak', 'speaking', 'spoke'],
              correctAnswer: 'speak',
              justification: 'Plural subject (they) uses the base form: speak.',
            },
            {
              type: 'mcq',
              prompt: 'Water _____ at 100 degrees Celsius.',
              options: ['boil', 'boils', 'boiling', 'boiled'],
              correctAnswer: 'boils',
              justification: 'General fact + third person = boils.',
            },
            {
              type: 'mcq',
              prompt: 'I _____ coffee every morning.',
              options: ['drinks', 'drink', 'drinking', 'drank'],
              correctAnswer: 'drink',
              justification: 'First person (I) uses the base form: drink.',
            },
            {
              type: 'mcq',
              prompt: 'He _____ not like spicy food.',
              options: ['do', 'does', 'is', 'has'],
              correctAnswer: 'does',
              justification: 'Third person negative uses "does not" (doesn\'t).',
            },
          ],
        },
        {
          type: 'test',
          title: 'Present Simple - Test 1',
          timeLimitMinutes: 10,
          questions: [
            {
              type: 'mcq',
              prompt: 'My brother _____ football on Saturdays.',
              options: ['play', 'plays', 'playing', 'played'],
              correctAnswer: 'plays',
              justification: 'Third person singular (my brother) requires -s: plays.',
            },
            {
              type: 'mcq',
              prompt: 'The shop _____ at 9 AM.',
              options: ['open', 'opens', 'opening', 'opened'],
              correctAnswer: 'opens',
              justification: 'Third person singular (the shop) requires -s: opens.',
            },
            {
              type: 'mcq',
              prompt: 'We _____ to the gym twice a week.',
              options: ['goes', 'go', 'going', 'gone'],
              correctAnswer: 'go',
              justification: 'Plural subject (we) uses the base form: go.',
            },
            {
              type: 'mcq',
              prompt: 'She _____ her homework before dinner.',
              options: ['do', 'does', 'doing', 'did'],
              correctAnswer: 'does',
              justification: 'Third person singular (she) uses does.',
            },
            {
              type: 'mcq',
              prompt: 'The sun _____ in the east.',
              options: ['rise', 'rises', 'rising', 'rose'],
              correctAnswer: 'rises',
              justification: 'General truth + third person = rises.',
            },
            {
              type: 'mcq',
              prompt: 'I _____ not eat meat.',
              options: ['do', 'does', 'am', 'is'],
              correctAnswer: 'do',
              justification: 'First person (I) uses "do not" (don\'t).',
            },
            {
              type: 'mcq',
              prompt: 'You _____ very kind.',
              options: ['is', 'are', 'am', 'be'],
              correctAnswer: 'are',
              justification: '"You" always takes "are" in the present tense.',
            },
            {
              type: 'mcq',
              prompt: 'My parents _____ in Dhaka.',
              options: ['lives', 'live', 'living', 'lived'],
              correctAnswer: 'live',
              justification: 'Plural subject (my parents) uses the base form: live.',
            },
            {
              type: 'mcq',
              prompt: 'The bus _____ at 8:15.',
              options: ['leave', 'leaves', 'leaving', 'left'],
              correctAnswer: 'leaves',
              justification: 'Timetabled event + third person = leaves.',
            },
            {
              type: 'mcq',
              prompt: 'She _____ coffee but not tea.',
              options: ['like', 'likes', 'liking', 'liked'],
              correctAnswer: 'likes',
              justification: 'Third person singular (she) requires -s: likes.',
            },
          ],
        },
      ],
    });
    console.log('Sample chapter seeded: Present Simple Tense');
  } else {
    console.log('Sample chapter already exists');
  }

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
