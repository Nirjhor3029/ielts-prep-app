import { connectDB } from './lib/db.js';
import { User } from './models/User.js';
import { Chapter } from './models/Chapter.js';
import bcrypt from 'bcryptjs';

const LESSON_1_NOTES = `
<div class="lesson-intro">
  <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg mb-6">
    <p class="font-label-md text-primary font-semibold">How We Learn</p>
    <p class="font-body-md text-on-surface-variant mt-1">Everything is in English. Every lesson includes Explanation, Examples, Common IELTS Mistakes, Practice, and Homework. Don't worry if you don't understand everything at first — read slowly and think in English.</p>
  </div>
</div>

<!-- Sub-topic: noun -->
<div class="sub-topic-card" data-topic="noun">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
      <span class="material-symbols-outlined text-primary">bookmark</span>
    </div>
    <h3 class="font-headline-md text-headline-md text-on-surface">1. Noun</h3>
  </div>
  <p class="font-body-lg text-body-lg text-on-surface mb-4">A noun names someone or something.</p>
  
  <h4 class="font-label-md text-on-surface font-semibold mb-2">Examples</h4>
  <ul class="space-y-2 mb-4">
    <li class="font-body-md text-on-surface-variant"><span class="text-primary font-semibold">Ali</span> is a student.</li>
    <li class="font-body-md text-on-surface-variant"><span class="text-primary font-semibold">Dhaka</span> is a crowded city.</li>
    <li class="font-body-md text-on-surface-variant">The <span class="text-primary font-semibold">computer</span> is expensive.</li>
    <li class="font-body-md text-on-surface-variant"><span class="text-primary font-semibold">Love</span> is important.</li>
  </ul>

  <h4 class="font-label-md text-on-surface font-semibold mb-2">Different Kinds of Nouns</h4>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
    <div class="bg-surface-container-low rounded-lg p-3">
      <p class="font-label-md text-primary font-semibold">Common Noun</p>
      <p class="font-caption text-on-surface-variant">General names: city, dog, teacher, phone</p>
    </div>
    <div class="bg-surface-container-low rounded-lg p-3">
      <p class="font-label-md text-primary font-semibold">Proper Noun</p>
      <p class="font-caption text-on-surface-variant">Specific names (capital letter): Bangladesh, IELTS, London</p>
    </div>
    <div class="bg-surface-container-low rounded-lg p-3">
      <p class="font-label-md text-primary font-semibold">Abstract Noun</p>
      <p class="font-caption text-on-surface-variant">Cannot touch: happiness, freedom, knowledge</p>
    </div>
    <div class="bg-surface-container-low rounded-lg p-3">
      <p class="font-label-md text-primary font-semibold">Concrete Noun</p>
      <p class="font-caption text-on-surface-variant">Can touch: chair, phone, table</p>
    </div>
  </div>

  <div class="bg-secondary-container/30 border-l-4 border-secondary p-4 rounded-r-lg mb-4">
    <p class="font-label-md text-on-secondary-container font-semibold">IELTS Tip</p>
    <p class="font-body-md text-on-surface-variant mt-1">Academic Writing uses many abstract nouns: <span class="font-semibold">pollution, education, technology, development, employment, poverty</span>. Learn these words — they appear very often.</p>
  </div>
</div>

<!-- Sub-topic: pronoun -->
<div class="sub-topic-card" data-topic="pronoun">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
      <span class="material-symbols-outlined text-primary">person</span>
    </div>
    <h3 class="font-headline-md text-headline-md text-on-surface">2. Pronoun</h3>
  </div>
  <p class="font-body-lg text-body-lg text-on-surface mb-4">A pronoun replaces a noun.</p>
  
  <h4 class="font-label-md text-on-surface font-semibold mb-2">Without Pronouns (Bad)</h4>
  <div class="bg-error-container/20 rounded-lg p-3 mb-3">
    <p class="font-body-md text-on-surface-variant"><span class="text-error font-semibold">Ali</span> is a teacher. <span class="text-error font-semibold">Ali</span> teaches English. <span class="text-error font-semibold">Ali</span> likes grammar.</p>
  </div>

  <h4 class="font-label-md text-on-surface font-semibold mb-2">With Pronouns (Better)</h4>
  <div class="bg-primary-fixed/20 rounded-lg p-3 mb-4">
    <p class="font-body-md text-on-surface-variant"><span class="text-primary font-semibold">Ali</span> is a teacher. <span class="text-primary font-semibold">He</span> teaches English. <span class="text-primary font-semibold">He</span> likes grammar.</p>
  </div>

  <h4 class="font-label-md text-on-surface font-semibold mb-2">Common Pronouns</h4>
  <div class="flex flex-wrap gap-2 mb-4">
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">I</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">you</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">he</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">she</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">it</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">we</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">they</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">me</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">us</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">them</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">mine</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">yours</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">his</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">her</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">their</span>
  </div>

  <div class="bg-secondary-container/30 border-l-4 border-secondary p-4 rounded-r-lg">
    <p class="font-label-md text-on-secondary-container font-semibold">IELTS Tip</p>
    <p class="font-body-md text-on-surface-variant mt-1">Avoid repeating the same noun again and again. Use pronouns to make your writing smoother.</p>
  </div>
</div>

<!-- Sub-topic: verb -->
<div class="sub-topic-card" data-topic="verb">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
      <span class="material-symbols-outlined text-primary">bolt</span>
    </div>
    <h3 class="font-headline-md text-headline-md text-on-surface">3. Verb</h3>
  </div>
  <p class="font-body-lg text-body-lg text-on-surface mb-4">A verb tells us what happens.</p>
  
  <h4 class="font-label-md text-on-surface font-semibold mb-2">Examples</h4>
  <ul class="space-y-2 mb-4">
    <li class="font-body-md text-on-surface-variant">She <span class="text-primary font-semibold">studies</span> every day.</li>
    <li class="font-body-md text-on-surface-variant">They <span class="text-primary font-semibold">play</span> football.</li>
    <li class="font-body-md text-on-surface-variant">He <span class="text-primary font-semibold">is</span> happy.</li>
    <li class="font-body-md text-on-surface-variant">I <span class="text-primary font-semibold">have finished</span> my homework.</li>
  </ul>

  <h4 class="font-label-md text-on-surface font-semibold mb-2">Two Main Types</h4>
  <div class="grid grid-cols-2 gap-3 mb-4">
    <div class="bg-surface-container-low rounded-lg p-3">
      <p class="font-label-md text-primary font-semibold">Action Verbs</p>
      <p class="font-caption text-on-surface-variant">run, eat, write, study, sleep</p>
    </div>
    <div class="bg-surface-container-low rounded-lg p-3">
      <p class="font-label-md text-primary font-semibold">Linking Verbs</p>
      <p class="font-caption text-on-surface-variant">be, seem, become, look, feel</p>
    </div>
  </div>

  <div class="bg-error-container/20 border-l-4 border-error p-4 rounded-r-lg">
    <p class="font-label-md text-on-error-container font-semibold">Common Mistake</p>
    <p class="font-body-md text-on-surface-variant mt-1">
      <span class="text-error line-through">She very intelligent.</span> → <span class="text-primary font-semibold">She is very intelligent.</span><br>
      <span class="font-caption">Every complete sentence needs a verb.</span>
    </p>
  </div>
</div>

<!-- Sub-topic: adjective -->
<div class="sub-topic-card" data-topic="adjective">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
      <span class="material-symbols-outlined text-primary">palette</span>
    </div>
    <h3 class="font-headline-md text-headline-md text-on-surface">4. Adjective</h3>
  </div>
  <p class="font-body-lg text-body-lg text-on-surface mb-4">An adjective describes a noun.</p>
  
  <h4 class="font-label-md text-on-surface font-semibold mb-2">Examples</h4>
  <ul class="space-y-2 mb-4">
    <li class="font-body-md text-on-surface-variant">a <span class="text-primary font-semibold">beautiful</span> city</li>
    <li class="font-body-md text-on-surface-variant">a <span class="text-primary font-semibold">difficult</span> exam</li>
    <li class="font-body-md text-on-surface-variant">an <span class="text-primary font-semibold">expensive</span> phone</li>
    <li class="font-body-md text-on-surface-variant">a <span class="text-primary font-semibold">large</span> building</li>
  </ul>

  <h4 class="font-label-md text-on-surface font-semibold mb-2">Questions Adjectives Answer</h4>
  <div class="flex gap-3 mb-4">
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">Which one?</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">What kind?</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">How many?</span>
  </div>

  <div class="bg-secondary-container/30 border-l-4 border-secondary p-4 rounded-r-lg">
    <p class="font-label-md text-on-secondary-container font-semibold">IELTS Writing Example</p>
    <p class="font-body-md text-on-surface-variant mt-1">Online education is becoming more <span class="text-primary font-semibold">popular</span>. — "Popular" describes "education".</p>
  </div>
</div>

<!-- Sub-topic: adverb -->
<div class="sub-topic-card" data-topic="adverb">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
      <span class="material-symbols-outlined text-primary">speed</span>
    </div>
    <h3 class="font-headline-md text-headline-md text-on-surface">5. Adverb</h3>
  </div>
  <p class="font-body-lg text-body-lg text-on-surface mb-4">An adverb describes a verb, an adjective, or another adverb.</p>
  
  <h4 class="font-label-md text-on-surface font-semibold mb-2">Examples</h4>
  <ul class="space-y-2 mb-4">
    <li class="font-body-md text-on-surface-variant">She speaks <span class="text-primary font-semibold">fluently</span>.</li>
    <li class="font-body-md text-on-surface-variant">He runs <span class="text-primary font-semibold">quickly</span>.</li>
    <li class="font-body-md text-on-surface-variant">The exam was <span class="text-primary font-semibold">extremely</span> difficult.</li>
    <li class="font-body-md text-on-surface-variant">She answered <span class="text-primary font-semibold">very</span> confidently.</li>
  </ul>

  <h4 class="font-label-md text-on-surface font-semibold mb-2">Many Adverbs End With -ly</h4>
  <div class="flex flex-wrap gap-2 mb-4">
    <span class="bg-surface-container-low px-3 py-1 rounded-full font-body-md">quick → <span class="text-primary font-semibold">quickly</span></span>
    <span class="bg-surface-container-low px-3 py-1 rounded-full font-body-md">careful → <span class="text-primary font-semibold">carefully</span></span>
    <span class="bg-surface-container-low px-3 py-1 rounded-full font-body-md">slow → <span class="text-primary font-semibold">slowly</span></span>
  </div>

  <div class="bg-secondary-container/30 border-l-4 border-secondary p-4 rounded-r-lg">
    <p class="font-label-md text-on-secondary-container font-semibold">IELTS Tip</p>
    <p class="font-body-md text-on-surface-variant mt-1">Band 8 candidates use adverbs naturally: <span class="font-semibold">significantly, considerably, rapidly, gradually, dramatically</span>.</p>
  </div>
</div>

<!-- Sub-topic: preposition -->
<div class="sub-topic-card" data-topic="preposition">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
      <span class="material-symbols-outlined text-primary">link</span>
    </div>
    <h3 class="font-headline-md text-headline-md text-on-surface">6. Preposition</h3>
  </div>
  <p class="font-body-lg text-body-lg text-on-surface mb-4">A preposition shows relationship between words.</p>
  
  <h4 class="font-label-md text-on-surface font-semibold mb-2">Examples</h4>
  <ul class="space-y-2 mb-4">
    <li class="font-body-md text-on-surface-variant">The book is <span class="text-primary font-semibold">on</span> the table.</li>
    <li class="font-body-md text-on-surface-variant">She lives <span class="text-primary font-semibold">in</span> Dhaka.</li>
    <li class="font-body-md text-on-surface-variant">The class starts <span class="text-primary font-semibold">at</span> 9 am.</li>
    <li class="font-body-md text-on-surface-variant">He walked <span class="text-primary font-semibold">into</span> the room.</li>
  </ul>

  <h4 class="font-label-md text-on-surface font-semibold mb-2">Common IELTS Prepositions</h4>
  <div class="flex flex-wrap gap-2 mb-4">
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">in</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">on</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">at</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">for</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">since</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">during</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">between</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">among</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">through</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">across</span>
  </div>

  <div class="bg-error-container/20 border-l-4 border-error p-4 rounded-r-lg">
    <p class="font-label-md text-on-error-container font-semibold">Common Mistake</p>
    <p class="font-body-md text-on-surface-variant mt-1">
      <span class="text-error line-through">Discuss about the issue.</span> → <span class="text-primary font-semibold">Discuss the issue.</span>
    </p>
  </div>
</div>

<!-- Sub-topic: conjunction -->
<div class="sub-topic-card" data-topic="conjunction">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
      <span class="material-symbols-outlined text-primary">account_tree</span>
    </div>
    <h3 class="font-headline-md text-headline-md text-on-surface">7. Conjunction</h3>
  </div>
  <p class="font-body-lg text-body-lg text-on-surface mb-4">Conjunctions connect ideas.</p>
  
  <h4 class="font-label-md text-on-surface font-semibold mb-2">Examples</h4>
  <ul class="space-y-2 mb-4">
    <li class="font-body-md text-on-surface-variant">I studied hard <span class="text-primary font-semibold">because</span> I wanted a high score.</li>
    <li class="font-body-md text-on-surface-variant">She was tired <span class="text-primary font-semibold">but</span> she continued working.</li>
    <li class="font-body-md text-on-surface-variant"><span class="text-primary font-semibold">Although</span> it was raining, we went outside.</li>
  </ul>

  <h4 class="font-label-md text-on-surface font-semibold mb-2">Important IELTS Conjunctions</h4>
  <div class="flex flex-wrap gap-2 mb-4">
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">and</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">but</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">because</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">although</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">while</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">whereas</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">however</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">therefore</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">since</span>
    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">unless</span>
  </div>

  <div class="bg-error-container/20 border-l-4 border-error p-4 rounded-r-lg">
    <p class="font-label-md text-on-error-container font-semibold">Common Mistake</p>
    <p class="font-body-md text-on-surface-variant mt-1">
      <span class="text-error line-through">Although it was raining but we went outside.</span> → <span class="text-primary font-semibold">Although it was raining, we went outside.</span><br>
      <span class="font-caption">Don't use "although" and "but" together!</span>
    </p>
  </div>
</div>

<!-- Sub-topic: interjection -->
<div class="sub-topic-card" data-topic="interjection">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
      <span class="material-symbols-outlined text-primary">emoji_emotions</span>
    </div>
    <h3 class="font-headline-md text-headline-md text-on-surface">8. Interjection</h3>
  </div>
  <p class="font-body-lg text-body-lg text-on-surface mb-4">Interjections express emotion.</p>
  
  <h4 class="font-label-md text-on-surface font-semibold mb-2">Examples</h4>
  <div class="flex gap-3 mb-4">
    <span class="bg-primary/10 text-primary px-4 py-2 rounded-full font-headline-md">Wow!</span>
    <span class="bg-primary/10 text-primary px-4 py-2 rounded-full font-headline-md">Oh!</span>
    <span class="bg-primary/10 text-primary px-4 py-2 rounded-full font-headline-md">Oops!</span>
  </div>

  <div class="bg-secondary-container/30 border-l-4 border-secondary p-4 rounded-r-lg">
    <p class="font-label-md text-on-secondary-container font-semibold">IELTS Tip</p>
    <p class="font-body-md text-on-surface-variant mt-1">Interjections are almost never used in IELTS Academic Writing because it must be formal.</p>
  </div>
</div>

<!-- Summary -->
<div class="lesson-summary mt-8">
  <h3 class="font-headline-md text-headline-md text-on-surface mb-4">What You've Learned</h3>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <div class="bg-primary-fixed/20 rounded-lg p-3 text-center">
      <span class="material-symbols-outlined text-primary">bookmark</span>
      <p class="font-label-md text-on-surface mt-1">Noun</p>
    </div>
    <div class="bg-primary-fixed/20 rounded-lg p-3 text-center">
      <span class="material-symbols-outlined text-primary">person</span>
      <p class="font-label-md text-on-surface mt-1">Pronoun</p>
    </div>
    <div class="bg-primary-fixed/20 rounded-lg p-3 text-center">
      <span class="material-symbols-outlined text-primary">bolt</span>
      <p class="font-label-md text-on-surface mt-1">Verb</p>
    </div>
    <div class="bg-primary-fixed/20 rounded-lg p-3 text-center">
      <span class="material-symbols-outlined text-primary">palette</span>
      <p class="font-label-md text-on-surface mt-1">Adjective</p>
    </div>
    <div class="bg-primary-fixed/20 rounded-lg p-3 text-center">
      <span class="material-symbols-outlined text-primary">speed</span>
      <p class="font-label-md text-on-surface mt-1">Adverb</p>
    </div>
    <div class="bg-primary-fixed/20 rounded-lg p-3 text-center">
      <span class="material-symbols-outlined text-primary">link</span>
      <p class="font-label-md text-on-surface mt-1">Preposition</p>
    </div>
    <div class="bg-primary-fixed/20 rounded-lg p-3 text-center">
      <span class="material-symbols-outlined text-primary">account_tree</span>
      <p class="font-label-md text-on-surface mt-1">Conjunction</p>
    </div>
    <div class="bg-primary-fixed/20 rounded-lg p-3 text-center">
      <span class="material-symbols-outlined text-primary">emoji_emotions</span>
      <p class="font-label-md text-on-surface mt-1">Interjection</p>
    </div>
  </div>
</div>
`;

async function seedLesson1() {
  await connectDB();

  // Update admin user with new fields
  const adminEmail = process.env.ADMIN_EMAIL || 'sazzad3029@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Pa$$word@2026';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await User.findOneAndUpdate(
    { email: adminEmail },
    {
      $setOnInsert: {
        name: 'Admin',
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: 'admin',
      },
      $set: {
        xp: 0,
        level: 1,
        streakFreezes: 0,
        achievements: [],
      },
    },
    { upsert: true, new: true }
  );
  console.log(`Admin user ready: ${admin.email}`);

  // Delete old seed chapter if exists
  await Chapter.deleteMany({ slug: 'present-simple-tense' });
  console.log('Old seed chapter removed.');

  // Check if Lesson 1 already exists
  const existing = await Chapter.findOne({ slug: 'parts-of-speech' });
  if (existing) {
    console.log('Lesson 1 already exists. Updating...');
    await Chapter.findOneAndUpdate(
      { slug: 'parts-of-speech' },
      {
        $set: {
          title: 'Parts of Speech',
          module: 'grammar',
          order: 1,
          description: 'Every English word has a job. Learn the 8 Parts of Speech — the foundation of all English grammar.',
          readTimeMinutes: 10,
          difficulty: 'beginner',
          notes: LESSON_1_NOTES,
          icon: 'translate',
          isPublished: true,
          subTopics: ['noun', 'pronoun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection'],
          vocab: [
            { word: 'education', meaning: 'The process of learning or teaching', example: 'Education is the key to success.', partOfSpeech: 'noun' },
            { word: 'technology', meaning: 'Scientific knowledge used in practical ways', example: 'Technology has changed our lives.', partOfSpeech: 'noun' },
            { word: 'environment', meaning: 'The natural world around us', example: 'We must protect the environment.', partOfSpeech: 'noun' },
            { word: 'government', meaning: 'The group of people who rule a country', example: 'The government made a new policy.', partOfSpeech: 'noun' },
            { word: 'development', meaning: 'The process of growing or changing', example: 'Urban development is rapid in Asia.', partOfSpeech: 'noun' },
            { word: 'population', meaning: 'The total number of people in an area', example: 'The population of Dhaka is growing.', partOfSpeech: 'noun' },
            { word: 'economy', meaning: 'The system of money and trade', example: 'The global economy is recovering.', partOfSpeech: 'noun' },
            { word: 'research', meaning: 'Careful study to find new facts', example: 'Scientists conduct research daily.', partOfSpeech: 'noun' },
            { word: 'pollution', meaning: 'Harmful substances in the environment', example: 'Air pollution causes health problems.', partOfSpeech: 'noun' },
            { word: 'employment', meaning: 'Having a paid job', example: 'Employment rates are rising.', partOfSpeech: 'noun' },
          ],
          questionSets: [
            {
              type: 'practice',
              title: 'Practice: Parts of Speech',
              questions: [
                {
                  type: 'mcq',
                  prompt: 'Identify the part of speech: "She <strong>quickly</strong> finished her homework."',
                  options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
                  correctAnswer: 'Adverb',
                  justification: '"Quickly" describes the verb "finished" — it tells us HOW she finished. Words ending in -ly that describe verbs are adverbs.',
                },
                {
                  type: 'mcq',
                  prompt: 'Identify the part of speech: "The <strong>teacher</strong> explained the lesson."',
                  options: ['Noun', 'Pronoun', 'Verb', 'Adjective'],
                  correctAnswer: 'Noun',
                  justification: '"Teacher" is a person — it names someone. That makes it a noun.',
                },
                {
                  type: 'mcq',
                  prompt: 'Identify the part of speech: "They <strong>study</strong> English every day."',
                  options: ['Noun', 'Adjective', 'Verb', 'Adverb'],
                  correctAnswer: 'Verb',
                  justification: '"Study" is an action — it tells us what they do. That makes it a verb.',
                },
                {
                  type: 'mcq',
                  prompt: 'Identify the part of speech: "It is a <strong>beautiful</strong> place."',
                  options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
                  correctAnswer: 'Adjective',
                  justification: '"Beautiful" describes "place" — it tells us what kind of place. That makes it an adjective.',
                },
                {
                  type: 'mcq',
                  prompt: 'Identify the part of speech: "We arrived <strong>at</strong> the station."',
                  options: ['Conjunction', 'Preposition', 'Adverb', 'Verb'],
                  correctAnswer: 'Preposition',
                  justification: '"At" shows the relationship between "arrived" and "the station" — it tells us WHERE. That makes it a preposition.',
                },
                {
                  type: 'fill-blank',
                  prompt: 'Complete: "She is _____ intelligent student." (a/an/the)',
                  options: ['a', 'an', 'the', 'no article needed'],
                  correctAnswer: 'an',
                  justification: '"Intelligent" starts with a vowel sound, so we use "an" before it. This is an article question — articles are a type of determiner, not adjective.',
                },
                {
                  type: 'error-identification',
                  prompt: 'Find the error: "Technology help students learn better."',
                  options: ['Technology', 'help', 'students', 'learn'],
                  correctAnswer: 'help',
                  justification: '"Technology" is singular (it/it helps), so the verb should be "helps" not "help". This is a subject-verb agreement error.',
                },
                {
                  type: 'error-identification',
                  prompt: 'Find the error: "The book is in the table."',
                  options: ['The', 'book', 'is', 'in'],
                  correctAnswer: 'in',
                  justification: 'Books are ON tables, not IN tables. The correct preposition is "on". This is a preposition error.',
                },
                {
                  type: 'error-identification',
                  prompt: 'Find the error: "She happy about the result."',
                  options: ['She', 'happy', 'about', 'result'],
                  correctAnswer: 'happy',
                  justification: 'The sentence is missing a verb. It should be "She IS happy about the result." Without "is", there is no verb.',
                },
                {
                  type: 'error-identification',
                  prompt: 'Find the error: "He speak English fluently."',
                  options: ['He', 'speak', 'English', 'fluently'],
                  correctAnswer: 'speak',
                  justification: '"He" is third person singular, so the verb needs an "s": "He speaks". This is subject-verb agreement.',
                },
                {
                  type: 'mcq',
                  prompt: '"<strong>Although</strong> it was raining, we went outside." What part of speech is "although"?',
                  options: ['Preposition', 'Conjunction', 'Adverb', 'Interjection'],
                  correctAnswer: 'Conjunction',
                  justification: '"Although" connects two clauses (ideas). Words that connect ideas are conjunctions.',
                },
                {
                  type: 'mcq',
                  prompt: 'Which sentence uses a PRONOUN correctly?',
                  options: [
                    'Technology is useful. Technology helps students.',
                    'Technology is useful. It helps students.',
                    'Technology is useful. Them helps students.',
                    'Technology is useful. Its helps students.',
                  ],
                  correctAnswer: 'Technology is useful. It helps students.',
                  justification: '"It" replaces "Technology" — pronouns replace nouns to avoid repetition. "Them" and "Its" are incorrect here.',
                },
                {
                  type: 'fill-blank',
                  prompt: 'Complete: "Online education is becoming more _____." (popular)',
                  options: ['popular', 'popularity', 'popularly', 'popularize'],
                  correctAnswer: 'popular',
                  justification: '"Popular" is an adjective that describes "education". We need an adjective after "more", not a noun (popularity) or adverb (popularly).',
                },
                {
                  type: 'mcq',
                  prompt: 'Which word is an ABSTRACT noun?',
                  options: ['chair', 'happiness', 'phone', 'teacher'],
                  correctAnswer: 'happiness',
                  justification: 'Abstract nouns are things you cannot touch — ideas, feelings, concepts. "Happiness" is a feeling. The others are concrete (you can touch them).',
                },
                {
                  type: 'error-identification',
                  prompt: 'Find the error: "Although it was raining but we went outside."',
                  options: ['Although', 'raining', 'but', 'outside'],
                  correctAnswer: 'but',
                  justification: 'You cannot use "although" and "but" together! Choose one: "Although it was raining, we went outside." OR "It was raining, but we went outside."',
                },
              ],
            },
            {
              type: 'test',
              title: 'Challenge: Parts of Speech',
              timeLimitMinutes: 3,
              questions: [
                {
                  type: 'mcq',
                  prompt: 'What part of speech is "education" in: "Education is important for everyone."?',
                  options: ['Verb', 'Adjective', 'Noun', 'Adverb'],
                  correctAnswer: 'Noun',
                  justification: '"Education" names a concept — it is the subject of the sentence. Nouns name things, ideas, or concepts.',
                },
                {
                  type: 'mcq',
                  prompt: 'Which sentence has a VERB?',
                  options: [
                    'She very happy.',
                    'The big blue car.',
                    'He runs every morning.',
                    'Beautiful flowers.',
                  ],
                  correctAnswer: 'He runs every morning.',
                  justification: '"Runs" is a verb — it shows an action. The other options are fragments without verbs.',
                },
                {
                  type: 'error-identification',
                  prompt: 'Find the error: "Discuss about the issue tomorrow."',
                  options: ['Discuss', 'about', 'issue', 'tomorrow'],
                  correctAnswer: 'about',
                  justification: '"Discuss" is a transitive verb — it takes a direct object. You "discuss something", not "discuss about something". Remove "about".',
                },
                {
                  type: 'mcq',
                  prompt: '"Significantly" in "The population grew significantly" is a:',
                  options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
                  correctAnswer: 'Adverb',
                  justification: '"Significantly" describes how the population grew — it modifies the verb "grew". Words ending in -ly that modify verbs are adverbs.',
                },
                {
                  type: 'fill-blank',
                  prompt: 'Complete: "There are many _____ between the two countries." (different/difference)',
                  options: ['different', 'difference', 'differences', 'differently'],
                  correctAnswer: 'differences',
                  justification: '"Many" is followed by a plural noun. "Difference" becomes "differences" (plural). "Different" is an adjective.',
                },
                {
                  type: 'error-identification',
                  prompt: 'Find the error: "The children plays in the garden every day."',
                  options: ['The', 'children', 'plays', 'every'],
                  correctAnswer: 'plays',
                  justification: '"Children" is plural (not singular). The verb should be "play" not "plays". This is subject-verb agreement.',
                },
                {
                  type: 'mcq',
                  prompt: 'Which is a CONJUNCTION?',
                  options: ['quickly', 'beautiful', 'although', 'happiness'],
                  correctAnswer: 'although',
                  justification: '"Although" connects two ideas/clauses. Conjunctions join words or sentences together.',
                },
                {
                  type: 'mcq',
                  prompt: '"The exam was extremely difficult." What does "extremely" describe?',
                  options: ['The noun "exam"', 'The verb "was"', 'The adjective "difficult"', 'The whole sentence'],
                  correctAnswer: 'The adjective "difficult"',
                  justification: '"Extremely" modifies "difficult" — it tells us HOW difficult. An adverb modifying an adjective.',
                },
                {
                  type: 'error-identification',
                  prompt: 'Find the error: "Me and him went to the store."',
                  options: ['Me', 'him', 'went', 'store'],
                  correctAnswer: 'Me',
                  justification: 'When you are the subject of a sentence, use "I" not "me". Correct: "He and I went to the store." "Me" is an object pronoun.',
                },
                {
                  type: 'mcq',
                  prompt: 'Which word is a PREPOSITION?',
                  options: ['and', 'happy', 'between', 'quickly'],
                  correctAnswer: 'between',
                  justification: '"Between" shows relationship — "between the two cities". Prepositions show where, when, or how things relate.',
                },
              ],
            },
          ],
        },
      },
      { upsert: true, new: true }
    );
  } else {
    await Chapter.create({
      title: 'Parts of Speech',
      module: 'grammar',
      slug: 'parts-of-speech',
      order: 1,
      description: 'Every English word has a job. Learn the 8 Parts of Speech — the foundation of all English grammar.',
      readTimeMinutes: 10,
      difficulty: 'beginner',
      notes: LESSON_1_NOTES,
      icon: 'translate',
      isPublished: true,
      subTopics: ['noun', 'pronoun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection'],
      vocab: [
        { word: 'education', meaning: 'The process of learning or teaching', example: 'Education is the key to success.', partOfSpeech: 'noun' },
        { word: 'technology', meaning: 'Scientific knowledge used in practical ways', example: 'Technology has changed our lives.', partOfSpeech: 'noun' },
        { word: 'environment', meaning: 'The natural world around us', example: 'We must protect the environment.', partOfSpeech: 'noun' },
        { word: 'government', meaning: 'The group of people who rule a country', example: 'The government made a new policy.', partOfSpeech: 'noun' },
        { word: 'development', meaning: 'The process of growing or changing', example: 'Urban development is rapid in Asia.', partOfSpeech: 'noun' },
        { word: 'population', meaning: 'The total number of people in an area', example: 'The population of Dhaka is growing.', partOfSpeech: 'noun' },
        { word: 'economy', meaning: 'The system of money and trade', example: 'The global economy is recovering.', partOfSpeech: 'noun' },
        { word: 'research', meaning: 'Careful study to find new facts', example: 'Scientists conduct research daily.', partOfSpeech: 'noun' },
        { word: 'pollution', meaning: 'Harmful substances in the environment', example: 'Air pollution causes health problems.', partOfSpeech: 'noun' },
        { word: 'employment', meaning: 'Having a paid job', example: 'Employment rates are rising.', partOfSpeech: 'noun' },
      ],
      questionSets: [
        {
          type: 'practice',
          title: 'Practice: Parts of Speech',
          questions: [
            {
              type: 'mcq',
              prompt: 'Identify the part of speech: "She <strong>quickly</strong> finished her homework."',
              options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
              correctAnswer: 'Adverb',
              justification: '"Quickly" describes the verb "finished" — it tells us HOW she finished. Words ending in -ly that describe verbs are adverbs.',
            },
            {
              type: 'mcq',
              prompt: 'Identify the part of speech: "The <strong>teacher</strong> explained the lesson."',
              options: ['Noun', 'Pronoun', 'Verb', 'Adjective'],
              correctAnswer: 'Noun',
              justification: '"Teacher" is a person — it names someone. That makes it a noun.',
            },
            {
              type: 'mcq',
              prompt: 'Identify the part of speech: "They <strong>study</strong> English every day."',
              options: ['Noun', 'Adjective', 'Verb', 'Adverb'],
              correctAnswer: 'Verb',
              justification: '"Study" is an action — it tells us what they do. That makes it a verb.',
            },
            {
              type: 'mcq',
              prompt: 'Identify the part of speech: "It is a <strong>beautiful</strong> place."',
              options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
              correctAnswer: 'Adjective',
              justification: '"Beautiful" describes "place" — it tells us what kind of place. That makes it an adjective.',
            },
            {
              type: 'mcq',
              prompt: 'Identify the part of speech: "We arrived <strong>at</strong> the station."',
              options: ['Conjunction', 'Preposition', 'Adverb', 'Verb'],
              correctAnswer: 'Preposition',
              justification: '"At" shows the relationship between "arrived" and "the station" — it tells us WHERE. That makes it a preposition.',
            },
            {
              type: 'fill-blank',
              prompt: 'Complete: "She is _____ intelligent student." (a/an/the)',
              options: ['a', 'an', 'the', 'no article needed'],
              correctAnswer: 'an',
              justification: '"Intelligent" starts with a vowel sound, so we use "an" before it. This is an article question — articles are a type of determiner, not adjective.',
            },
            {
              type: 'error-identification',
              prompt: 'Find the error: "Technology help students learn better."',
              options: ['Technology', 'help', 'students', 'learn'],
              correctAnswer: 'help',
              justification: '"Technology" is singular (it/it helps), so the verb should be "helps" not "help". This is a subject-verb agreement error.',
            },
            {
              type: 'error-identification',
              prompt: 'Find the error: "The book is in the table."',
              options: ['The', 'book', 'is', 'in'],
              correctAnswer: 'in',
              justification: 'Books are ON tables, not IN tables. The correct preposition is "on". This is a preposition error.',
            },
            {
              type: 'error-identification',
              prompt: 'Find the error: "She happy about the result."',
              options: ['She', 'happy', 'about', 'result'],
              correctAnswer: 'happy',
              justification: 'The sentence is missing a verb. It should be "She IS happy about the result." Without "is", there is no verb.',
            },
            {
              type: 'error-identification',
              prompt: 'Find the error: "He speak English fluently."',
              options: ['He', 'speak', 'English', 'fluently'],
              correctAnswer: 'speak',
              justification: '"He" is third person singular, so the verb needs an "s": "He speaks". This is subject-verb agreement.',
            },
            {
              type: 'mcq',
              prompt: '"<strong>Although</strong> it was raining, we went outside." What part of speech is "although"?',
              options: ['Preposition', 'Conjunction', 'Adverb', 'Interjection'],
              correctAnswer: 'Conjunction',
              justification: '"Although" connects two clauses (ideas). Words that connect ideas are conjunctions.',
            },
            {
              type: 'mcq',
              prompt: 'Which sentence uses a PRONOUN correctly?',
              options: [
                'Technology is useful. Technology helps students.',
                'Technology is useful. It helps students.',
                'Technology is useful. Them helps students.',
                'Technology is useful. Its helps students.',
              ],
              correctAnswer: 'Technology is useful. It helps students.',
              justification: '"It" replaces "Technology" — pronouns replace nouns to avoid repetition. "Them" and "Its" are incorrect here.',
            },
            {
              type: 'fill-blank',
              prompt: 'Complete: "Online education is becoming more _____." (popular)',
              options: ['popular', 'popularity', 'popularly', 'popularize'],
              correctAnswer: 'popular',
              justification: '"Popular" is an adjective that describes "education". We need an adjective after "more", not a noun (popularity) or adverb (popularly).',
            },
            {
              type: 'mcq',
              prompt: 'Which word is an ABSTRACT noun?',
              options: ['chair', 'happiness', 'phone', 'teacher'],
              correctAnswer: 'happiness',
              justification: 'Abstract nouns are things you cannot touch — ideas, feelings, concepts. "Happiness" is a feeling. The others are concrete (you can touch them).',
            },
            {
              type: 'error-identification',
              prompt: 'Find the error: "Although it was raining but we went outside."',
              options: ['Although', 'raining', 'but', 'outside'],
              correctAnswer: 'but',
              justification: 'You cannot use "although" and "but" together! Choose one: "Although it was raining, we went outside." OR "It was raining, but we went outside."',
            },
          ],
        },
        {
          type: 'test',
          title: 'Challenge: Parts of Speech',
          timeLimitMinutes: 3,
          questions: [
            {
              type: 'mcq',
              prompt: 'What part of speech is "education" in: "Education is important for everyone."?',
              options: ['Verb', 'Adjective', 'Noun', 'Adverb'],
              correctAnswer: 'Noun',
              justification: '"Education" names a concept — it is the subject of the sentence. Nouns name things, ideas, or concepts.',
            },
            {
              type: 'mcq',
              prompt: 'Which sentence has a VERB?',
              options: [
                'She very happy.',
                'The big blue car.',
                'He runs every morning.',
                'Beautiful flowers.',
              ],
              correctAnswer: 'He runs every morning.',
              justification: '"Runs" is a verb — it shows an action. The other options are fragments without verbs.',
            },
            {
              type: 'error-identification',
              prompt: 'Find the error: "Discuss about the issue tomorrow."',
              options: ['Discuss', 'about', 'issue', 'tomorrow'],
              correctAnswer: 'about',
              justification: '"Discuss" is a transitive verb — it takes a direct object. You "discuss something", not "discuss about something". Remove "about".',
            },
            {
              type: 'mcq',
              prompt: '"Significantly" in "The population grew significantly" is a:',
              options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
              correctAnswer: 'Adverb',
              justification: '"Significantly" describes how the population grew — it modifies the verb "grew". Words ending in -ly that modify verbs are adverbs.',
            },
            {
              type: 'fill-blank',
              prompt: 'Complete: "There are many _____ between the two countries." (different/difference)',
              options: ['different', 'difference', 'differences', 'differently'],
              correctAnswer: 'differences',
              justification: '"Many" is followed by a plural noun. "Difference" becomes "differences" (plural). "Different" is an adjective.',
            },
            {
              type: 'error-identification',
              prompt: 'Find the error: "The children plays in the garden every day."',
              options: ['The', 'children', 'plays', 'every'],
              correctAnswer: 'plays',
              justification: '"Children" is plural (not singular). The verb should be "play" not "plays". This is subject-verb agreement.',
            },
            {
              type: 'mcq',
              prompt: 'Which is a CONJUNCTION?',
              options: ['quickly', 'beautiful', 'although', 'happiness'],
              correctAnswer: 'although',
              justification: '"Although" connects two ideas/clauses. Conjunctions join words or sentences together.',
            },
            {
              type: 'mcq',
              prompt: '"The exam was extremely difficult." What does "extremely" describe?',
              options: ['The noun "exam"', 'The verb "was"', 'The adjective "difficult"', 'The whole sentence'],
              correctAnswer: 'The adjective "difficult"',
              justification: '"Extremely" modifies "difficult" — it tells us HOW difficult. An adverb modifying an adjective.',
            },
            {
              type: 'error-identification',
              prompt: 'Find the error: "Me and him went to the store."',
              options: ['Me', 'him', 'went', 'store'],
              correctAnswer: 'Me',
              justification: 'When you are the subject of a sentence, use "I" not "me". Correct: "He and I went to the store." "Me" is an object pronoun.',
            },
            {
              type: 'mcq',
              prompt: 'Which word is a PREPOSITION?',
              options: ['and', 'happy', 'between', 'quickly'],
              correctAnswer: 'between',
              justification: '"Between" shows relationship — "between the two cities". Prepositions show where, when, or how things relate.',
            },
          ],
        },
      ],
    });
    console.log('Lesson 1 created: Parts of Speech');
  }

  console.log('Seed complete!');
  process.exit(0);
}

seedLesson1().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
