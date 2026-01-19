import { z } from 'zod'

/**
 * Zod Validation Schemas for Health Data
 * 
 * SECURITY RATIONALE:
 * Never trust client input, even with RLS enabled. These schemas:
 * 1. Validate data types before hitting the database
 * 2. Sanitize strings to prevent injection attacks
 * 3. Enforce business logic (e.g., duration must be positive)
 * 4. Provide clear error messages for invalid data
 * 
 * This is a "Defense in Depth" layer - RLS remains the final gate,
 * but validation prevents bad data from ever reaching it.
 */

// ============================================
// Sleep Record Validation
// ============================================

/**
 * Valid sleep quality levels
 */
export const SleepQualityEnum = z.enum(['poor', 'fair', 'good', 'excellent'])
export type SleepQuality = z.infer<typeof SleepQualityEnum>

/**
 * Time format validation (HH:MM or HH:MM:SS)
 */
const TimeString = z.string().regex(
    /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/,
    'Time must be in HH:MM or HH:MM:SS format'
)

/**
 * Date validation (YYYY-MM-DD format)
 * Includes logic to prevent future dates
 */
const DateString = z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
        const parsed = new Date(date)
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        return parsed <= today
    }, 'Date cannot be in the future')

/**
 * Schema for creating a new sleep record
 * 
 * Note: user_id is NOT included - it's set server-side from the session
 * to prevent users from inserting data for other users
 */
export const CreateSleepRecordSchema = z.object({
    // Required fields
    date: DateString,
    duration: z.number()
        .int('Duration must be a whole number')
        .min(1, 'Duration must be at least 1 minute')
        .max(1440, 'Duration cannot exceed 24 hours (1440 minutes)'),
    quality: SleepQualityEnum,

    // Optional fields with validation
    deep_sleep_minutes: z.number()
        .int()
        .min(0, 'Deep sleep cannot be negative')
        .max(720, 'Deep sleep cannot exceed 12 hours')
        .optional()
        .nullable(),

    rem_sleep_minutes: z.number()
        .int()
        .min(0, 'REM sleep cannot be negative')
        .max(720, 'REM sleep cannot exceed 12 hours')
        .optional()
        .nullable(),

    awakenings: z.number()
        .int()
        .min(0, 'Awakenings cannot be negative')
        .max(100, 'Awakenings count seems unrealistic')
        .optional()
        .nullable(),

    bedtime: TimeString.optional().nullable(),
    wake_time: TimeString.optional().nullable(),
})
    // Cross-field validation
    .refine((data) => {
        // Deep sleep + REM should not exceed total duration
        const deepSleep = data.deep_sleep_minutes || 0
        const remSleep = data.rem_sleep_minutes || 0
        return (deepSleep + remSleep) <= data.duration
    }, {
        message: 'Deep sleep + REM sleep cannot exceed total duration',
        path: ['deep_sleep_minutes']
    })

export type CreateSleepRecordInput = z.infer<typeof CreateSleepRecordSchema>

/**
 * Schema for updating an existing sleep record
 * All fields are optional, but if provided must be valid
 */
export const UpdateSleepRecordSchema = CreateSleepRecordSchema.partial().extend({
    id: z.string().uuid('Invalid record ID')
})

export type UpdateSleepRecordInput = z.infer<typeof UpdateSleepRecordSchema>

// ============================================
// Sport Session Validation
// ============================================

export const SportIntensityEnum = z.enum(['low', 'moderate', 'high', 'extreme'])
export type SportIntensity = z.infer<typeof SportIntensityEnum>

export const CreateSportSessionSchema = z.object({
    date: DateString,
    duration: z.number()
        .int()
        .min(1, 'Duration must be at least 1 minute')
        .max(1440, 'Duration cannot exceed 24 hours'),
    type: z.string()
        .min(1, 'Activity type is required')
        .max(50, 'Activity type is too long')
        .transform(val => val.trim()),
    calories_burned: z.number()
        .int()
        .min(0, 'Calories cannot be negative')
        .max(10000, 'Calories burned seems unrealistic')
        .optional()
        .nullable(),
    intensity: SportIntensityEnum,
})

export type CreateSportSessionInput = z.infer<typeof CreateSportSessionSchema>

// ============================================
// Body Measurement Validation
// ============================================

export const CreateBodyMeasurementSchema = z.object({
    date: DateString,
    weight: z.number()
        .min(20, 'Weight seems too low')
        .max(500, 'Weight seems too high')
        .optional()
        .nullable(),
    body_fat_percentage: z.number()
        .min(1, 'Body fat percentage seems too low')
        .max(70, 'Body fat percentage seems too high')
        .optional()
        .nullable(),
    muscle_mass: z.number()
        .min(10, 'Muscle mass seems too low')
        .max(200, 'Muscle mass seems too high')
        .optional()
        .nullable(),
    vo2_max: z.number()
        .min(10, 'VO2 max seems too low')
        .max(100, 'VO2 max seems too high')
        .optional()
        .nullable(),
    resting_heart_rate: z.number()
        .int()
        .min(30, 'Resting heart rate seems too low')
        .max(200, 'Resting heart rate seems too high')
        .optional()
        .nullable(),
})

export type CreateBodyMeasurementInput = z.infer<typeof CreateBodyMeasurementSchema>

// ============================================
// Nutrition Log Validation
// ============================================

export const CreateNutritionLogSchema = z.object({
    date: DateString,
    calories: z.number()
        .int()
        .min(0, 'Calories cannot be negative')
        .max(20000, 'Calories intake seems unrealistic')
        .optional()
        .nullable(),
    protein: z.number()
        .min(0, 'Protein cannot be negative')
        .max(1000, 'Protein intake seems unrealistic')
        .optional()
        .nullable(),
    carbs: z.number()
        .min(0, 'Carbs cannot be negative')
        .max(2000, 'Carbs intake seems unrealistic')
        .optional()
        .nullable(),
    fat: z.number()
        .min(0, 'Fat cannot be negative')
        .max(1000, 'Fat intake seems unrealistic')
        .optional()
        .nullable(),
    water_intake: z.number()
        .min(0, 'Water intake cannot be negative')
        .max(20, 'Water intake seems unrealistic (liters)')
        .optional()
        .nullable(),
})

export type CreateNutritionLogInput = z.infer<typeof CreateNutritionLogSchema>

// ============================================
// Validation Helper
// ============================================

/**
 * Type-safe validation result
 */
export type ValidationResult<T> =
    | { success: true; data: T }
    | { success: false; errors: Record<string, string[]> }

/**
 * Validates data against a schema and returns a typed result
 */
export function validateData<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): ValidationResult<T> {
    const result = schema.safeParse(data)

    if (result.success) {
        return { success: true, data: result.data }
    }

    // Format errors into a more usable structure
    const errors: Record<string, string[]> = {}
    for (const issue of result.error.issues) {
        const path = issue.path.join('.') || '_root'
        if (!errors[path]) {
            errors[path] = []
        }
        errors[path].push(issue.message)
    }

    return { success: false, errors }
}
