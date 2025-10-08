import { writeFileSync } from "fs";
const out = { tours: [{ slug: 'route-a-preferred', title: 'Route A Preferred - European Adventure', durationDays: 14 }], transactions: [] };
writeFileSync('mock/seed.json', JSON.stringify(out, null, 2));
console.log('Wrote mock/seed.json');
