import { MongoClient, ObjectId } from 'mongodb'
import { Bond, User, Alert } from '../lib/types'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const dbName = process.env.MONGODB_DB || 'bonos_db'

async function seed() {
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(dbName)

  console.log('🌱 Seeding database...')

  // Clear existing data
  await db.collection('users').deleteMany({})
  await db.collection('bonds').deleteMany({})
  await db.collection('alerts').deleteMany({})
  await db.collection('magic_tokens').deleteMany({})

  // Create admin user
  const adminResult = await db.collection<User>('users').insertOne({
    email: 'admin@bondvault.io',
    name: 'Admin BondVault',
    role: 'admin',
    createdAt: new Date(),
  })

  // Create investor users
  const inv1 = await db.collection<User>('users').insertOne({
    email: 'investor1@example.com',
    name: 'Carlos Mendoza',
    role: 'investor',
    createdAt: new Date(),
  })

  const inv2 = await db.collection<User>('users').insertOne({
    email: 'investor2@example.com',
    name: 'Ana García',
    role: 'investor',
    createdAt: new Date(),
  })

  console.log('✅ Users created')

  // Create bonds
  const bonds: Omit<Bond, '_id'>[] = [
    {
      bondName: 'PEMEX 2027',
      companyName: 'Petróleos Mexicanos',
      faceValue: 1000000,         // MXN $10,000.00
      totalIssuance: 500000000000, // MXN $5,000,000,000
      couponType: 'fixed',
      couponRate: 875,            // 8.75%
      paymentFrequency: 'semi-annual',
      maturityDate: new Date('2027-06-15'),
      issueDate: new Date('2024-06-15'),
      maturityType: 'short',
      status: 'active',
      creditRating: 'BBB',
      sector: 'energy',
      description: 'Bono corporativo de Petróleos Mexicanos con tasa fija para financiamiento de exploración.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      bondName: 'BANORTE 2030',
      companyName: 'Banco Mercantil del Norte',
      faceValue: 1000000,
      totalIssuance: 300000000000,
      couponType: 'fixed',
      couponRate: 925,            // 9.25%
      paymentFrequency: 'quarterly',
      maturityDate: new Date('2030-03-20'),
      issueDate: new Date('2025-03-20'),
      maturityType: 'medium',
      status: 'offering',
      creditRating: 'A',
      sector: 'finance',
      description: 'Bono subordinado Tier 2 de Banorte para fortalecer el capital regulatorio.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      bondName: 'FEMSA 2035',
      companyName: 'Fomento Económico Mexicano',
      faceValue: 1000000,
      totalIssuance: 200000000000,
      couponType: 'fixed',
      couponRate: 750,            // 7.50%
      paymentFrequency: 'annual',
      maturityDate: new Date('2035-09-01'),
      issueDate: new Date('2025-09-01'),
      maturityType: 'long',
      status: 'active',
      creditRating: 'AA',
      sector: 'consumer',
      description: 'Bono a largo plazo de FEMSA para expansión internacional y adquisiciones estratégicas.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      bondName: 'AMX 2028',
      companyName: 'América Móvil',
      faceValue: 1000000,
      totalIssuance: 400000000000,
      couponType: 'variable',
      couponRate: 600,            // 6.00% + TIIE
      paymentFrequency: 'quarterly',
      maturityDate: new Date('2028-12-01'),
      issueDate: new Date('2025-12-01'),
      maturityType: 'medium',
      status: 'offering',
      creditRating: 'A',
      sector: 'tech',
      description: 'Bono de tasa variable referenciado a TIIE+2.00% para rollout de infraestructura 5G.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      bondName: 'GRUMA 2026',
      companyName: 'Gruma S.A.B. de C.V.',
      faceValue: 500000,
      totalIssuance: 100000000000,
      couponType: 'fixed',
      couponRate: 1050,           // 10.50%
      paymentFrequency: 'semi-annual',
      maturityDate: new Date('2026-05-30'),
      issueDate: new Date('2024-05-30'),
      maturityType: 'short',
      status: 'active',
      creditRating: 'BBB',
      sector: 'consumer',
      description: 'Financiamiento a corto plazo para capital de trabajo y expansión de plantas productivas.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const bondResults = await db.collection<Bond>('bonds').insertMany(bonds as Bond[])
  const bondIds = Object.values(bondResults.insertedIds)
  console.log(`✅ ${bondIds.length} bonds created`)

  // Create alerts for investors
  const alerts = [
    {
      investorId: inv1.insertedId,
      bondId: bondIds[0],
      alertType: 'rating-change' as const,
      severity: 'warning' as const,
      title: 'Cambio de calificación: PEMEX 2027',
      message: 'Moody\'s cambió la calificación de Ba1 a BBB- para PEMEX 2027. Revisar posición.',
      read: false,
      createdAt: new Date(),
    },
    {
      investorId: inv1.insertedId,
      bondId: bondIds[1],
      alertType: 'payment-due' as const,
      severity: 'info' as const,
      title: 'Pago de cupón próximo: BANORTE 2030',
      message: 'El próximo pago de cupón por MXN $23,125 está programado para el 20 de junio de 2026.',
      read: false,
      createdAt: new Date(),
    },
    {
      investorId: inv2.insertedId,
      bondId: bondIds[2],
      alertType: 'rebalancing' as const,
      severity: 'info' as const,
      title: 'Sugerencia de rebalanceo de portafolio',
      message: 'Tu exposición al sector consumo supera el 40% del portafolio. Considera diversificar.',
      read: false,
      createdAt: new Date(),
    },
    {
      investorId: inv2.insertedId,
      bondId: bondIds[3],
      alertType: 'price-fluctuation' as const,
      severity: 'critical' as const,
      title: 'Fluctuación de precio: AMX 2028',
      message: 'El precio de mercado del bono AMX 2028 ha caído un 3.2% en las últimas 24 horas.',
      read: false,
      createdAt: new Date(),
    },
  ]

  await db.collection('alerts').insertMany(alerts)
  console.log('✅ Alerts created')

  console.log('\n📋 Seed Summary:')
  console.log('Admin: admin@bondvault.io')
  console.log('Investor 1: investor1@example.com')
  console.log('Investor 2: investor2@example.com')
  console.log(`Bonds: ${bondIds.length}`)
  console.log('\n✨ Seed complete!')

  await client.close()
}

seed().catch(err => {
  console.error('Seed error:', err)
  process.exit(1)
})
