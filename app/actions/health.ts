'use server'

import { createClient } from '@/utils/supabase/server'
import {
    CreateSleepRecordSchema,
    CreateSleepRecordInput,
    validateData
} from '@/lib/validations/health'
import { revalidatePath } from 'next/cache'

/**
 * Server Action Response Type
 * Provides consistent error handling across all actions
 */
export type ActionResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: string; fieldErrors?: Record<string, string[]> }

/**
 * Creates a new sleep record with full server-side validation
 * 
 * SECURITY LAYERS:
 * 1. Zod validation - validates data types and business logic
 * 2. Authentication check - verifies user is logged in
 * 3. User ID injection - prevents spoofing by using session user ID
 * 4. RLS - database-level row security (final gate)
 * 
 * This is "Defense in Depth" - multiple layers of security,
 * each serving as a backup for the others.
 */
export async function createSleepRecord(
    input: unknown
): Promise<ActionResult<{ id: string }>> {
    // LAYER 1: Validate input data with Zod
    const validation = validateData(CreateSleepRecordSchema, input)

    if (!validation.success) {
        console.warn('[createSleepRecord] Validation failed:', validation.errors)
        return {
            success: false,
            error: 'Invalid data provided',
            fieldErrors: validation.errors
        }
    }

    const validatedData: CreateSleepRecordInput = validation.data

    // LAYER 2: Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        console.warn('[createSleepRecord] Unauthorized access attempt')
        return {
            success: false,
            error: 'You must be logged in to create a sleep record'
        }
    }

    // LAYER 3: Insert with server-injected user_id
    // Note: user_id is NEVER taken from client input
    const { data, error } = await supabase
        .from('sleep_records')
        .insert({
            user_id: user.id, // Always use session user ID
            date: validatedData.date,
            duration: validatedData.duration,
            quality: validatedData.quality,
            deep_sleep_minutes: validatedData.deep_sleep_minutes,
            rem_sleep_minutes: validatedData.rem_sleep_minutes,
            awakenings: validatedData.awakenings,
            bedtime: validatedData.bedtime,
            wake_time: validatedData.wake_time,
        })
        .select('id')
        .single()

    if (error) {
        console.error('[createSleepRecord] Database error:', error)
        return {
            success: false,
            error: 'Failed to save sleep record. Please try again.'
        }
    }

    // Revalidate the dashboard to show new data
    revalidatePath('/dashboard')
    revalidatePath('/health')

    console.log('[createSleepRecord] Successfully created record:', data.id)
    return { success: true, data: { id: data.id } }
}

/**
 * Updates an existing sleep record
 * Only allows updating records owned by the current user
 */
export async function updateSleepRecord(
    id: string,
    input: Partial<CreateSleepRecordInput>
): Promise<ActionResult> {
    // SECURITY: Validate ID format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!id || !uuidRegex.test(id)) {
        return { success: false, error: 'Invalid record ID format' }
    }

    // Validate the partial update data
    const partialSchema = CreateSleepRecordSchema.partial()
    const validation = validateData(partialSchema, input)

    if (!validation.success) {
        return {
            success: false,
            error: 'Invalid data provided',
            fieldErrors: validation.errors
        }
    }

    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return {
            success: false,
            error: 'You must be logged in to update a sleep record'
        }
    }

    // Update the record (RLS will ensure user owns it)
    const { error } = await supabase
        .from('sleep_records')
        .update(validation.data)
        .eq('id', id)
        .eq('user_id', user.id) // Double-check ownership

    if (error) {
        console.error('[updateSleepRecord] Database error:', error)
        return {
            success: false,
            error: 'Failed to update sleep record. Please try again.'
        }
    }

    revalidatePath('/dashboard')
    revalidatePath('/health')

    return { success: true }
}

/**
 * Deletes a sleep record
 * Only allows deleting records owned by the current user
 */
export async function deleteSleepRecord(id: string): Promise<ActionResult> {
    // SECURITY: Validate ID format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
        return { success: false, error: 'Invalid record ID format' }
    }

    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return {
            success: false,
            error: 'You must be logged in to delete a sleep record'
        }
    }

    // Delete the record (RLS will ensure user owns it)
    const { error } = await supabase
        .from('sleep_records')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('[deleteSleepRecord] Database error:', error)
        return {
            success: false,
            error: 'Failed to delete sleep record. Please try again.'
        }
    }

    revalidatePath('/dashboard')
    revalidatePath('/health')

    return { success: true }
}
