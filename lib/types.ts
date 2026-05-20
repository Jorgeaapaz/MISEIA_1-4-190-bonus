import { ObjectId } from 'mongodb'

// ─── Users ────────────────────────────────────────────────────────────────────

export interface User {
  _id?: ObjectId
  email: string
  name: string
  role: 'admin' | 'investor'
  createdAt: Date
}

export interface MagicToken {
  _id?: ObjectId
  email: string
  token: string
  expiresAt: Date
  used: boolean
}

// ─── Bonds ────────────────────────────────────────────────────────────────────

export type CouponType = 'fixed' | 'variable'
export type PaymentFrequency = 'monthly' | 'quarterly' | 'semi-annual' | 'annual'
export type BondMaturity = 'short' | 'medium' | 'long'
export type BondStatus = 'draft' | 'offering' | 'active' | 'matured' | 'cancelled'
export type CreditRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC'
export type Sector = 'energy' | 'finance' | 'tech' | 'healthcare' | 'real-estate' | 'consumer' | 'industrial' | 'utilities'

export interface Bond {
  _id?: ObjectId
  bondName: string
  companyName: string
  // All money in cents
  faceValue: number       // cents
  totalIssuance: number   // cents (total amount being raised)
  couponType: CouponType
  couponRate: number      // basis points (e.g. 500 = 5.00%)
  paymentFrequency: PaymentFrequency
  maturityDate: Date
  issueDate: Date
  maturityType: BondMaturity
  status: BondStatus
  creditRating: CreditRating
  sector: Sector
  description: string
  createdAt: Date
  updatedAt: Date
}

// ─── Orders (Bookbuilding) ─────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'filled'

export interface Order {
  _id?: ObjectId
  bondId: ObjectId
  investorId: ObjectId
  // All money in cents
  requestedAmount: number  // cents
  filledAmount: number     // cents
  pricePerBond: number     // cents
  quantity: number
  status: OrderStatus
  notes: string
  createdAt: Date
  updatedAt: Date
}

// ─── Payments ────────────────────────────────────────────────────────────────

export type PaymentType = 'coupon' | 'principal' | 'early-redemption'
export type PaymentStatus = 'scheduled' | 'processing' | 'completed' | 'failed'

export interface Payment {
  _id?: ObjectId
  bondId: ObjectId
  investorId: ObjectId
  orderId: ObjectId
  paymentType: PaymentType
  // All money in cents
  amount: number           // cents
  scheduledDate: Date
  processedDate?: Date
  status: PaymentStatus
  reference: string
  createdAt: Date
}

// ─── Compliance Documents ────────────────────────────────────────────────────

export type DocumentType = 'tax' | 'fund-usage' | 'covenant-compliance'

export interface ComplianceDocument {
  _id?: ObjectId
  bondId: ObjectId
  documentType: DocumentType
  title: string
  s3Key: string
  generatedAt: Date
  period: string           // e.g. "Q1-2026"
  createdBy: ObjectId
}

// ─── Portfolio / Holdings ─────────────────────────────────────────────────────

export interface Holding {
  _id?: ObjectId
  investorId: ObjectId
  bondId: ObjectId
  orderId: ObjectId
  quantity: number
  // All money in cents
  purchasePrice: number    // cents per bond
  currentValue: number     // cents total
  acquiredAt: Date
}

// ─── Alerts ──────────────────────────────────────────────────────────────────

export type AlertType = 'rating-change' | 'price-fluctuation' | 'rebalancing' | 'payment-due' | 'coupon-paid'
export type AlertSeverity = 'info' | 'warning' | 'critical'

export interface Alert {
  _id?: ObjectId
  investorId: ObjectId
  bondId?: ObjectId
  alertType: AlertType
  severity: AlertSeverity
  title: string
  message: string
  read: boolean
  createdAt: Date
}

// ─── API Response helpers ────────────────────────────────────────────────────

export interface ApiError {
  error: string
}

export interface JwtPayload {
  userId: string
  email: string
  role: 'admin' | 'investor'
  iat?: number
  exp?: number
}
