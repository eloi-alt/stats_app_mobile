import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Mapbox from '@rnmapbox/maps';

// WARNING: You must set your access token found at https://account.mapbox.com/
// Mapbox.setAccessToken('YOUR_MAPBOX_ACCESS_TOKEN');

// For Expo Go, Mapbox might not work directly without a custom dev client.
// However, we are setting up the code as requested.

interface NativeMapProps {
    // Add props if needed, e.g., coordinates
}

export default function NativeMap({ }: NativeMapProps) {
    return (
        <View style={styles.container} pointerEvents="box-none">
            {/* 
              IMPORTANT: Mapbox NE FONCTIONNE PAS sur Expo Go standard.
              Il faut utiliser un "Development Build" (npx expo run:ios).
              
              De plus, un TOKEN est OBLIGATOIRE ci-dessus.
            */}
            <Mapbox.MapView
                style={styles.map}
                styleURL="mapbox://styles/mapbox/satellite-streets-v12" // Style compatible Globe
                projection="globe" // Active la vue Globe 3D
                logoEnabled={false}
                scaleBarEnabled={false}
                attributionEnabled={false}
            >
                <Mapbox.Camera
                    zoomLevel={1.5} // Vue éloignée pour voir le globe entier
                    centerCoordinate={[2.3522, 48.8566]}
                    animationMode="flyTo"
                    animationDuration={6000}
                />

                <Mapbox.Atmosphere
                    style={{
                        highColor: 'black',
                        starIntensity: 0.15,
                    }}
                />
            </Mapbox.MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 250,
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        marginVertical: 10,
    },
    map: {
        flex: 1,
    },
});
