// FAQ shown on the homepage and daily pages, plus its structured data.

export function faqItems(p, shortDate) {
  const items = [
    {
      q: `What is the Minute Cryptic answer for ${shortDate(p.date)}?`,
      a: `The answer for ${shortDate(p.date)} is ${p.answer}. The clue was "${p.clue}" (${p.enumeration.join(', ')}).`,
    },
    {
      q: 'What time does the new Minute Cryptic come out?',
      a: 'A new clue is released every day at midnight in your local time zone. We post the answer and hints shortly after midnight Eastern time.',
    },
    {
      q: 'What is Minute Cryptic?',
      a: 'Minute Cryptic is a free daily puzzle with a single cryptic crossword clue. Each clue has a definition at one end and wordplay that leads to the same answer, and it is designed to be solved in about a minute.',
    },
    {
      q: 'What does par mean in Minute Cryptic?',
      a: 'Par is the number of in-game hints the setter expects an average solver to use. Solving under par means you needed fewer hints than expected.',
    },
    {
      q: 'Is Minute Cryptic free?',
      a: 'Yes. The daily clue is free to play at minutecryptic.com and in the Minute Cryptic app. A paid membership adds extra puzzles and features.',
    },
  ];
  return items;
}

export function faqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}
