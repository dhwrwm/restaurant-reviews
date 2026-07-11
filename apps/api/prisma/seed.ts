import * as argon2 from 'argon2';
import { Cuisine, Role } from 'types';
import { prisma } from '../src/lib/prisma';

const SEED_PASSWORD = 'Password123!';

interface OwnerSeed {
  email: string;
  name: string;
}

interface ReviewerSeed {
  email: string;
  name: string;
}

interface RestaurantSeed {
  slug: string;
  name: string;
  description: string;
  previewImageUrl: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  cuisine: Cuisine;
  ownerEmail: string;
}

interface ReviewSeed {
  restaurantSlug: string;
  reviewerEmail: string;
  rating: number;
  comment: string;
}

const owners: OwnerSeed[] = [
  { email: 'owner.mario@example.com', name: 'Mario Rossi' },
  { email: 'owner.kenji@example.com', name: 'Kenji Tanaka' },
  { email: 'owner.amara@example.com', name: 'Amara Okafor' },
];

const reviewers: ReviewerSeed[] = [
  { email: 'reviewer.alex@example.com', name: 'Alex Chen' },
  { email: 'reviewer.priya@example.com', name: 'Priya Sharma' },
  { email: 'reviewer.jordan@example.com', name: 'Jordan Smith' },
  { email: 'reviewer.sofia@example.com', name: 'Sofia Garcia' },
];

const restaurants: RestaurantSeed[] = [
  {
    slug: 'la-piazza',
    name: 'La Piazza',
    description:
      'Family-run trattoria serving handmade pasta and wood-fired pizza.',
    previewImageUrl: 'https://picsum.photos/seed/la-piazza/800/600',
    address: '12 Mulberry St',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    cuisine: Cuisine.ITALIAN,
    ownerEmail: 'owner.mario@example.com',
  },
  {
    slug: 'le-petit-bistro',
    name: 'Le Petit Bistro',
    description: 'Cozy neighborhood bistro with a classic French menu.',
    previewImageUrl: 'https://picsum.photos/seed/le-petit-bistro/800/600',
    address: '88 Newbury St',
    city: 'Boston',
    state: 'MA',
    country: 'USA',
    cuisine: Cuisine.FRENCH,
    ownerEmail: 'owner.mario@example.com',
  },
  {
    slug: 'sakura-sushi',
    name: 'Sakura Sushi',
    description: 'Omakase-focused sushi counter with daily boat imports.',
    previewImageUrl: 'https://picsum.photos/seed/sakura-sushi/800/600',
    address: '500 Post St',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    cuisine: Cuisine.JAPANESE,
    ownerEmail: 'owner.kenji@example.com',
  },
  {
    slug: 'seoul-kitchen',
    name: 'Seoul Kitchen',
    description: 'Modern Korean BBQ and comfort food in a lively setting.',
    previewImageUrl: 'https://picsum.photos/seed/seoul-kitchen/800/600',
    address: '221 Geary St',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    cuisine: Cuisine.KOREAN,
    ownerEmail: 'owner.kenji@example.com',
  },
  {
    slug: 'spice-route',
    name: 'Spice Route',
    description: 'Regional Indian cooking with a seasonal tasting menu.',
    previewImageUrl: 'https://picsum.photos/seed/spice-route/800/600',
    address: '3400 Devon Ave',
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    cuisine: Cuisine.INDIAN,
    ownerEmail: 'owner.amara@example.com',
  },
  {
    slug: 'taco-verde',
    name: 'Taco Verde',
    description: 'Casual taqueria with house-made salsas and fresh tortillas.',
    previewImageUrl: 'https://picsum.photos/seed/taco-verde/800/600',
    address: '1600 E 6th St',
    city: 'Austin',
    state: 'TX',
    country: 'USA',
    cuisine: Cuisine.MEXICAN,
    ownerEmail: 'owner.amara@example.com',
  },
];

const reviews: ReviewSeed[] = [
  {
    restaurantSlug: 'la-piazza',
    reviewerEmail: 'reviewer.alex@example.com',
    rating: 5,
    comment:
      "Best carbonara I've had outside Rome. The staff made us feel like family.",
  },
  {
    restaurantSlug: 'la-piazza',
    reviewerEmail: 'reviewer.priya@example.com',
    rating: 4,
    comment: 'Cozy spot, great wine list. Gets loud on weekends.',
  },
  {
    restaurantSlug: 'la-piazza',
    reviewerEmail: 'reviewer.jordan@example.com',
    rating: 5,
    comment: 'Handmade pasta is worth the wait every time.',
  },
  {
    restaurantSlug: 'le-petit-bistro',
    reviewerEmail: 'reviewer.sofia@example.com',
    rating: 4,
    comment: 'Classic French onion soup done right.',
  },
  {
    restaurantSlug: 'le-petit-bistro',
    reviewerEmail: 'reviewer.alex@example.com',
    rating: 3,
    comment: 'Good food, but service was slow on a Friday night.',
  },
  {
    restaurantSlug: 'sakura-sushi',
    reviewerEmail: 'reviewer.priya@example.com',
    rating: 5,
    comment: 'Freshest sashimi in the city, hands down.',
  },
  {
    restaurantSlug: 'sakura-sushi',
    reviewerEmail: 'reviewer.jordan@example.com',
    rating: 5,
    comment: 'Omakase here is a must-try.',
  },
  {
    restaurantSlug: 'sakura-sushi',
    reviewerEmail: 'reviewer.sofia@example.com',
    rating: 4,
    comment: 'A bit pricey but the quality justifies it.',
  },
  {
    restaurantSlug: 'seoul-kitchen',
    reviewerEmail: 'reviewer.alex@example.com',
    rating: 4,
    comment: 'Great bibimbap and friendly service.',
  },
  {
    restaurantSlug: 'spice-route',
    reviewerEmail: 'reviewer.priya@example.com',
    rating: 5,
    comment: 'Authentic flavors, the butter chicken is incredible.',
  },
  {
    restaurantSlug: 'spice-route',
    reviewerEmail: 'reviewer.jordan@example.com',
    rating: 3,
    comment: 'Solid food but the wait was over 40 minutes.',
  },
  {
    restaurantSlug: 'taco-verde',
    reviewerEmail: 'reviewer.sofia@example.com',
    rating: 5,
    comment: "Best tacos I've had in Austin, hands down.",
  },
  {
    restaurantSlug: 'taco-verde',
    reviewerEmail: 'reviewer.alex@example.com',
    rating: 4,
    comment: 'Great salsa bar, casual vibe.',
  },
];

async function upsertUser(email: string, name: string, role: Role) {
  const passwordHash = await argon2.hash(SEED_PASSWORD);

  return prisma.user.upsert({
    where: { email },
    update: { name, role },
    create: { email, name, passwordHash, role },
  });
}

async function main() {
  for (const owner of owners) {
    await upsertUser(owner.email, owner.name, Role.OWNER);
  }

  for (const reviewer of reviewers) {
    await upsertUser(reviewer.email, reviewer.name, Role.REVIEWER);
  }

  const restaurantIds = new Map<string, string>();

  for (const restaurant of restaurants) {
    const owner = await prisma.user.findUniqueOrThrow({
      where: { email: restaurant.ownerEmail },
    });

    const { id } = await prisma.restaurant.upsert({
      where: { slug: restaurant.slug },
      update: {
        name: restaurant.name,
        description: restaurant.description,
        previewImageUrl: restaurant.previewImageUrl,
        address: restaurant.address,
        city: restaurant.city,
        state: restaurant.state,
        country: restaurant.country,
        cuisine: restaurant.cuisine,
        ownerId: owner.id,
      },
      create: {
        slug: restaurant.slug,
        name: restaurant.name,
        description: restaurant.description,
        previewImageUrl: restaurant.previewImageUrl,
        address: restaurant.address,
        city: restaurant.city,
        state: restaurant.state,
        country: restaurant.country,
        cuisine: restaurant.cuisine,
        ownerId: owner.id,
      },
    });

    restaurantIds.set(restaurant.slug, id);
  }

  for (const review of reviews) {
    const reviewer = await prisma.user.findUniqueOrThrow({
      where: { email: review.reviewerEmail },
    });
    const restaurantId = restaurantIds.get(review.restaurantSlug);

    if (!restaurantId) {
      throw new Error(`Unknown restaurant slug: ${review.restaurantSlug}`);
    }

    await prisma.review.upsert({
      where: {
        restaurantId_reviewerId: {
          restaurantId,
          reviewerId: reviewer.id,
        },
      },
      update: { rating: review.rating, comment: review.comment },
      create: {
        restaurantId,
        reviewerId: reviewer.id,
        rating: review.rating,
        comment: review.comment,
      },
    });
  }

  for (const restaurantId of restaurantIds.values()) {
    const { _avg, _count } = await prisma.review.aggregate({
      where: { restaurantId },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { averageRating: _avg.rating ?? 0, reviewCount: _count },
    });
  }

  console.log(
    `Seeded ${owners.length} owners, ${reviewers.length} reviewers, ${restaurants.length} restaurants, ${reviews.length} reviews.`,
  );
  console.log(`All seed users share the password: ${SEED_PASSWORD}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
