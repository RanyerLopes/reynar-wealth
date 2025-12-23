/**
 * Known Assets Service
 * 
 * Fetches and validates assets (stocks, crypto, FIIs) from Supabase database.
 * Provides autocomplete and type detection functionality.
 */

import { supabase } from './supabase';

export interface KnownAsset {
    id: string;
    symbol: string;
    name: string;
    type: 'Ações' | 'Cripto' | 'Renda Fixa' | 'FIIs';
    logo_url?: string;
    sector?: string;
}

// Cache for known assets to avoid repeated database calls
let assetsCache: KnownAsset[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all known assets from the database
 */
export const fetchKnownAssets = async (): Promise<KnownAsset[]> => {
    // Return cached data if still valid
    if (assetsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
        return assetsCache;
    }

    try {
        const { data, error } = await supabase
            .from('known_assets')
            .select('*')
            .eq('is_active', true)
            .order('symbol');

        if (error) {
            console.error('Error fetching known assets:', error);
            return [];
        }

        assetsCache = data || [];
        cacheTimestamp = Date.now();
        return assetsCache;
    } catch (err) {
        console.error('Error in fetchKnownAssets:', err);
        return [];
    }
};

/**
 * Search assets by symbol or name (for autocomplete)
 */
export const searchAssets = async (query: string, limit: number = 10): Promise<KnownAsset[]> => {
    const upperQuery = query.toUpperCase().trim();

    if (upperQuery.length < 1) return [];

    try {
        // First try to get from cache
        const cached = await fetchKnownAssets();
        if (cached.length > 0) {
            return cached
                .filter(asset =>
                    asset.symbol.toUpperCase().includes(upperQuery) ||
                    asset.name.toUpperCase().includes(upperQuery)
                )
                .slice(0, limit);
        }

        // If cache is empty, query database directly
        const { data, error } = await supabase
            .from('known_assets')
            .select('*')
            .eq('is_active', true)
            .or(`symbol.ilike.%${query}%,name.ilike.%${query}%`)
            .limit(limit);

        if (error) {
            console.error('Error searching assets:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Error in searchAssets:', err);
        return [];
    }
};

/**
 * Validate and detect asset type from the database
 * Returns the asset info if found, null otherwise
 */
export const validateAsset = async (symbol: string): Promise<KnownAsset | null> => {
    const upperSymbol = symbol.toUpperCase().trim();

    try {
        // Try cache first
        const cached = await fetchKnownAssets();
        const found = cached.find(asset =>
            asset.symbol.toUpperCase() === upperSymbol ||
            asset.name.toUpperCase() === upperSymbol
        );

        if (found) return found;

        // If not in cache, query database
        const { data, error } = await supabase
            .from('known_assets')
            .select('*')
            .eq('is_active', true)
            .or(`symbol.ilike.${symbol},name.ilike.${symbol}`)
            .limit(1)
            .single();

        if (error || !data) {
            return null;
        }

        return data;
    } catch (err) {
        console.error('Error in validateAsset:', err);
        return null;
    }
};

/**
 * Get assets by type
 */
export const getAssetsByType = async (type: KnownAsset['type']): Promise<KnownAsset[]> => {
    try {
        const cached = await fetchKnownAssets();
        return cached.filter(asset => asset.type === type);
    } catch (err) {
        console.error('Error in getAssetsByType:', err);
        return [];
    }
};

/**
 * Clear the cache (useful after updates)
 */
export const clearAssetsCache = () => {
    assetsCache = null;
    cacheTimestamp = 0;
};

/**
 * Detect asset type - combines database lookup with pattern matching fallback
 */
export const detectAssetTypeFromDb = async (ticker: string): Promise<{
    type: 'Ações' | 'Cripto' | 'Renda Fixa' | 'FIIs' | 'Outros';
    asset: KnownAsset | null;
    isValid: boolean;
}> => {
    const asset = await validateAsset(ticker);

    if (asset) {
        return {
            type: asset.type,
            asset,
            isValid: true
        };
    }

    // Fallback pattern matching for assets not in database
    const upperTicker = ticker.toUpperCase().trim();

    // Brazilian stock pattern (XXXX3, XXXX4, etc.)
    if (/^[A-Z]{4}[0-9]{1,2}$/.test(upperTicker)) {
        if (upperTicker.endsWith('11')) {
            return { type: 'FIIs', asset: null, isValid: false };
        }
        if (/[3-6]$/.test(upperTicker)) {
            return { type: 'Ações', asset: null, isValid: false };
        }
    }

    // Renda Fixa keywords
    const rendaFixaKeywords = ['CDB', 'LCI', 'LCA', 'TESOURO', 'SELIC', 'CDI', 'DEBENTURE', 'POUPANCA', 'POUPANÇA'];
    if (rendaFixaKeywords.some(kw => upperTicker.includes(kw))) {
        return { type: 'Renda Fixa', asset: null, isValid: false };
    }

    // Unknown
    return { type: 'Outros', asset: null, isValid: false };
};
