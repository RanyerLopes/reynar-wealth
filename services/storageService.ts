import { supabase } from './supabase';

/**
 * Upload an image to Supabase Storage
 * @param userId - The user's ID
 * @param billId - The bill's ID
 * @param base64Image - The base64 encoded image (from camera capture)
 * @returns The public URL of the uploaded image
 */
export const uploadBillImage = async (
    userId: string,
    billId: string,
    base64Image: string
): Promise<string> => {
    // Convert base64 to blob
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    // Generate unique filename
    const fileName = `${userId}/${billId}_${Date.now()}.jpg`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from('bill-images')
        .upload(fileName, blob, {
            contentType: 'image/jpeg',
            upsert: true
        });

    if (error) {
        console.error('Error uploading image:', error);
        throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('bill-images')
        .getPublicUrl(data.path);

    return publicUrl;
};

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The full URL of the image to delete
 */
export const deleteBillImage = async (imageUrl: string): Promise<void> => {
    // Extract path from URL
    const urlParts = imageUrl.split('/bill-images/');
    if (urlParts.length < 2) return;

    const filePath = urlParts[1];

    const { error } = await supabase.storage
        .from('bill-images')
        .remove([filePath]);

    if (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
};

/**
 * Upload a profile avatar
 * @param userId - The user's ID
 * @param base64Image - The base64 encoded image
 * @returns The public URL of the uploaded avatar
 */
export const uploadAvatar = async (
    userId: string,
    base64Image: string
): Promise<string> => {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    const fileName = `${userId}/avatar_${Date.now()}.jpg`;

    const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
            contentType: 'image/jpeg',
            upsert: true
        });

    if (error) {
        console.error('Error uploading avatar:', error);
        throw error;
    }

    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

    return publicUrl;
};
