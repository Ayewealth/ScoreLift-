import { boolean, numeric, jsonb, pgEnum, pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export const scoreBandEnum = pgEnum('score_band', ['poor', 'fair', 'good', 'very_good', 'exceptional'])
export const missedPaymentRecencyEnum = pgEnum('missed_payment_recency', ['none', 'within_6_months', '6_12_months', '1_2_years', '2_plus_years'])
export const accountAgeEnum = pgEnum('account_age', ['under_1_year', '1_3_years', '3_7_years', '7_plus_years'])
export const effortLevelEnum = pgEnum('effort_level', ['low', 'medium', 'high'])
export const timeHorizonEnum = pgEnum('time_horizon', ['immediate', '1_3_months', '3_6_months', '6_12_months'])
export const roadmapItemStatusEnum = pgEnum('roadmap_item_status', ['todo', 'in_progress', 'done'])

export const blogPosts = pgTable('blog_posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt').notNull(),
  contentHtml: text('content_html').notNull(),
  category: text('category').notNull(),
  imageUrl: text('image_url'),
  author: text('author').notNull(),
  publishedAt: timestamp('published_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const insertBlogPostSchema = createInsertSchema(blogPosts)
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>
export type BlogPost = typeof blogPosts.$inferSelect

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  name: text('name'),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),

  onboardingComplete: boolean('onboarding_complete').notNull().default(false),
  stripeCustomerId: text('stripe_customer_id'),
  subscriptionStatus: text('subscription_status').notNull().default('free'),
  subscriptionPlan: text('subscription_plan'),
  notificationPreferences: text('notification_preferences').default('{}'),
  role: text('role').default('user'),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by'),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const creditProfiles = pgTable('credit_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  scoreBand: text('score_band').notNull(),
  missedPaymentCount: integer('missed_payment_count').notNull().default(0),
  missedPaymentRecency: text('missed_payment_recency').notNull().default('none'),
  overallUtilisation: integer('overall_utilisation').notNull().default(0),
  oldestAccountAge: text('oldest_account_age').notNull().default('1_3_years'),
  totalAccounts: integer('total_accounts').notNull().default(1),
  hardInquiries12m: integer('hard_inquiries_12m').notNull().default(0),
  derogatoryMarks: text('derogatory_marks').array().notNull().default([]),
  creditMix: text('credit_mix').array().notNull().default([]),
  estimatedScore: integer('estimated_score'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const creditCards = pgTable('credit_cards', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  cardName: text('card_name').notNull(),
  creditLimit: numeric('credit_limit').notNull(),
  currentBalance: numeric('current_balance').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const roadmapItems = pgTable('roadmap_items', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  factor: text('factor').notNull(),
  actionTitle: text('action_title').notNull(),
  description: text('description').notNull(),
  estimatedImpactMin: integer('estimated_impact_min').notNull(),
  estimatedImpactMax: integer('estimated_impact_max').notNull(),
  effortLevel: text('effort_level').notNull().default('medium'),
  timeHorizon: text('time_horizon').notNull().default('1_3_months'),
  status: text('status').notNull().default('todo'),
  sortOrder: integer('sort_order').notNull().default(0),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const milestoneTypeEnum = pgEnum('milestone_type', [
  'first_checkin',
  'streak_3',
  'streak_6',
  'streak_12',
  'score_band_improvement',
  'roadmap_completions_5',
  'education_track_complete',
  'first_dispute',
])

export type MilestoneType = 'first_checkin' | 'streak_3' | 'streak_6' | 'streak_12' | 'score_band_improvement' | 'roadmap_completions_5' | 'education_track_complete' | 'first_dispute'

export const checkins = pgTable('checkins', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  scoreEstimate: integer('score_estimate').notNull(),
  deltaFromPrevious: integer('delta_from_previous'),
  completedAt: timestamp('completed_at').notNull().defaultNow(),
  notes: text('notes'),
})

export const goals = pgTable('goals', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  targetScoreBand: text('target_score_band').notNull(),
  targetDate: timestamp('target_date').notNull(),
  purpose: text('purpose'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const milestones = pgTable('milestones', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  milestoneType: text('milestone_type').notNull(),
  unlockedAt: timestamp('unlocked_at').notNull().defaultNow(),
})

export const simulatorScenarios = pgTable('simulator_scenarios', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  inputOverrides: jsonb('input_overrides').notNull(),
  estimatedDelta: integer('estimated_delta'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const disputeLetters = pgTable('dispute_letters', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  templateId: text('template_id').notNull(),
  formData: jsonb('form_data').notNull(),
  renderedHtml: text('rendered_html').notNull(),
  r2Key: text('r2_key'),
  status: text('status').notNull().default('draft'),
  bureauName: text('bureau_name'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  r2Key: text('r2_key').notNull(),
  fileSize: integer('file_size').notNull(),
  fileType: text('file_type').notNull(),
  category: text('category').notNull().default('other'),
  notes: text('notes'),
  linkedDisputeId: text('linked_dispute_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const educationTracks = pgTable('education_tracks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const educationLessons = pgTable('education_lessons', {
  id: text('id').primaryKey(),
  trackId: text('track_id').notNull().references(() => educationTracks.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  contentHtml: text('content_html').notNull(),
  readTimeMinutes: integer('read_time_minutes').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const lessonCompletions = pgTable('lesson_completions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  lessonId: text('lesson_id').notNull().references(() => educationLessons.id, { onDelete: 'cascade' }),
  quizScore: integer('quiz_score'),
  completedAt: timestamp('completed_at').notNull().defaultNow(),
})

export const insertCreditProfileSchema = createInsertSchema(creditProfiles)
export const insertCreditCardSchema = createInsertSchema(creditCards)
export const insertRoadmapItemSchema = createInsertSchema(roadmapItems)
export const updateRoadmapItemStatusSchema = createInsertSchema(roadmapItems).pick({ status: true })

export type InsertCreditProfile = z.infer<typeof insertCreditProfileSchema>
export type CreditProfile = typeof creditProfiles.$inferSelect
export type InsertCreditCard = z.infer<typeof insertCreditCardSchema>
export type CreditCard = typeof creditCards.$inferSelect
export type InsertRoadmapItem = z.infer<typeof insertRoadmapItemSchema>
export type RoadmapItem = typeof roadmapItems.$inferSelect

export const insertCheckinSchema = createInsertSchema(checkins)
export const insertGoalSchema = createInsertSchema(goals)
export const insertMilestoneSchema = createInsertSchema(milestones)

export type InsertCheckin = z.infer<typeof insertCheckinSchema>
export type Checkin = typeof checkins.$inferSelect
export type InsertGoal = z.infer<typeof insertGoalSchema>
export type Goal = typeof goals.$inferSelect
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>
export type Milestone = typeof milestones.$inferSelect

export const insertSimulatorScenarioSchema = createInsertSchema(simulatorScenarios)
export const insertDisputeLetterSchema = createInsertSchema(disputeLetters)
export const insertDocumentSchema = createInsertSchema(documents)
export const insertEducationTrackSchema = createInsertSchema(educationTracks)
export const insertEducationLessonSchema = createInsertSchema(educationLessons)
export const insertLessonCompletionSchema = createInsertSchema(lessonCompletions)

export type SimulatorScenario = typeof simulatorScenarios.$inferSelect
export type DisputeLetter = typeof disputeLetters.$inferSelect
export type Document = typeof documents.$inferSelect
export type EducationTrack = typeof educationTracks.$inferSelect
export type EducationLesson = typeof educationLessons.$inferSelect
export type LessonCompletion = typeof lessonCompletions.$inferSelect

export const insertUserSchema = createInsertSchema(user)
export const insertSessionSchema = createInsertSchema(session)
export const insertAccountSchema = createInsertSchema(account)
export const insertVerificationSchema = createInsertSchema(verification)

export type InsertUser = z.infer<typeof insertUserSchema>
export type User = typeof user.$inferSelect
export type Session = typeof session.$inferSelect
export type Account = typeof account.$inferSelect
export type Verification = typeof verification.$inferSelect