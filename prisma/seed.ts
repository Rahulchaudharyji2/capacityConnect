import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data (optional, but good for idempotency if handled carefully)
  await prisma.enrollment.deleteMany()
  await prisma.course.deleteMany()
  await prisma.userRole.deleteMany()
  await prisma.user.deleteMany()
  await prisma.role.deleteMany()
  await prisma.organizationalUnit.deleteMany()
  await prisma.organization.deleteMany()

  // Organizations
  const org = await prisma.organization.create({
    data: { name: 'Capacity Connect Demo Organization' }
  })

  // Units
  const unitCentral = await prisma.organizationalUnit.create({
    data: { name: 'Central Training Unit', organizationId: org.id }
  })
  const unitNorth = await prisma.organizationalUnit.create({
    data: { name: 'Regional Training Centre North', organizationId: org.id }
  })

  // Roles
  const learnerRole = await prisma.role.create({ data: { name: 'LEARNER' } })
  const trainerRole = await prisma.role.create({ data: { name: 'TRAINER' } })
  const adminRole = await prisma.role.create({ data: { name: 'ADMIN' } })

  // Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@demo.capacityconnect.org',
      passwordHash: 'hashed_placeholder',
      firstName: 'System',
      lastName: 'Admin',
      organizationId: org.id,
      organizationalUnitId: unitCentral.id,
      roles: { create: { roleId: adminRole.id } }
    }
  })

  const trainerUser = await prisma.user.create({
    data: {
      email: 'trainer@demo.capacityconnect.org',
      passwordHash: 'hashed_placeholder',
      firstName: 'Senior',
      lastName: 'Trainer',
      organizationId: org.id,
      organizationalUnitId: unitCentral.id,
      roles: { create: { roleId: trainerRole.id } }
    }
  })

  const learnerUser = await prisma.user.create({
    data: {
      email: 'learner@demo.capacityconnect.org',
      passwordHash: 'hashed_placeholder',
      firstName: 'Demo',
      lastName: 'Learner',
      organizationId: org.id,
      organizationalUnitId: unitNorth.id,
      roles: { create: { roleId: learnerRole.id } }
    }
  })

  // Courses
  const course1 = await prisma.course.create({
    data: {
      title: 'Introduction to Meteorological Observations',
      description: 'Fundamentals of weather observation techniques and instruments.',
      isPublished: true,
    }
  })

  const course2 = await prisma.course.create({
    data: {
      title: 'Information Security Awareness',
      description: 'Mandatory training for all organizational staff regarding data handling.',
      isPublished: true,
    }
  })

  const course3 = await prisma.course.create({
    data: {
      title: 'Advanced Radar Interpretation (Draft)',
      description: 'In-depth analysis of Doppler radar systems. Not yet published.',
      isPublished: false,
    }
  })

  // Enrollments
  await prisma.enrollment.create({
    data: {
      userId: learnerUser.id,
      courseId: course1.id,
      status: 'IN_PROGRESS'
    }
  })
  await prisma.enrollment.create({
    data: {
      userId: learnerUser.id,
      courseId: course2.id,
      status: 'COMPLETED'
    }
  })

  console.log('Seed data inserted successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
