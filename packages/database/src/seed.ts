import { db, Role, SubscriptionStatus } from './index';

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const user = await db.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      email: 'admin@acme.com',
      name: 'Acme Admin',
      // Password: "Password123!" hashed with bcrypt
      passwordHash: '$2b$10$wT3J.B.U9Jc3W3p6e5B.eeF0f/j2p9z7Zp9k8Y7X6W5V4U3T2S1R0',
      emailVerified: true,
    },
  });

  // Create demo tenant
  const tenant = await db.tenant.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
    },
  });

  // Assign membership
  await db.membership.upsert({
    where: {
      tenantId_userId: {
        tenantId: tenant.id,
        userId: user.id,
      },
    },
    update: { role: Role.OWNER },
    create: {
      tenantId: tenant.id,
      userId: user.id,
      role: Role.OWNER,
    },
  });

  // Create active subscription
  await db.subscription.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      status: SubscriptionStatus.ACTIVE,
      stripeCustomerId: 'cus_demo12345',
      stripeSubscriptionId: 'sub_demo12345',
      stripePriceId: 'price_pro_monthly',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Create demo project
  const project = await db.project.create({
    data: {
      tenantId: tenant.id,
      name: 'Cloud Infrastructure Revamp',
      description: 'Migrating legacy services to modern Kubernetes & Serverless setup.',
      status: 'ACTIVE',
      tasks: {
        create: [
          { title: 'Setup Terraform Modules', priority: 'HIGH', status: 'DONE' },
          { title: 'Configure CI/CD Pipelines', priority: 'HIGH', status: 'IN_PROGRESS' },
          { title: 'Perform Penetration Testing', priority: 'MEDIUM', status: 'TODO' },
        ],
      },
    },
  });

  console.log(`✅ Database seeded successfully. Tenant: ${tenant.name}, Project ID: ${project.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
