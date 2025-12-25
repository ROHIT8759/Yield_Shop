'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { saveWalletConnection, getLocationFromIP } from '@/lib/supabase';

/**
 * WalletTracker component
 * Automatically tracks and stores wallet connections in the database
 * Runs silently in the background
 */
export default function WalletTracker() {
    const { address, isConnected } = useAccount();

    useEffect(() => {
        const trackWalletConnection = async () => {
            if (!isConnected || !address) return;

            try {
                // Get location data from IP
                const locationData = await getLocationFromIP();

                // Get user agent (browser info)
                const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';

                // Save to database
                await saveWalletConnection({
                    wallet_address: address,
                    ip_address: locationData?.ip || 'Unknown',
                    country: locationData?.country || 'Unknown',
                    city: locationData?.city || 'Unknown',
                    region: locationData?.region || 'Unknown',
                    timezone: locationData?.timezone || 'Unknown',
                    user_agent: userAgent
                });

                console.log('✅ Wallet connection tracked:', {
                    wallet: address,
                    location: locationData?.city + ', ' + locationData?.country
                });
            } catch (error) {
                console.error('Error tracking wallet connection:', error);
            }
        };

        // Track connection when wallet connects
        trackWalletConnection();
    }, [address, isConnected]);

    // This component doesn't render anything
    return null;
}
