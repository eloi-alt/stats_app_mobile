import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmulsionSphere = () => {
    return (
        <View style={styles.container}>
            <View style={styles.placeholder}>
                <Text style={styles.text}>🔮 Sphère 3D (En chargement...)</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { height: 300, width: '100%', alignItems: 'center', justifyContent: 'center' },
    placeholder: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: { color: 'white', fontWeight: 'bold' }
});

export default EmulsionSphere;
