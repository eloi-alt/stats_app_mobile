import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'expo-router'
import { useVisitor } from '@/contexts/VisitorContext'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

export default function LoginScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { setVisitorMode } = useVisitor()

    async function signInWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            Alert.alert('Erreur', error.message)
            setLoading(false)
        } else {
            // AuthContext will detect session change and redirect
            setLoading(false)
        }
    }

    async function handleVisitorMode() {
        setVisitorMode(true)
        // Router redirect handled in _layout or manually here if needed, but Context update should trigger _layout effect
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-900 justify-center px-6">
            <View className="items-center mb-10">
                <Ionicons name="stats-chart" size={64} color="#30D158" />
                <Text className="text-3xl font-bold text-white mt-4">STATS App</Text>
                <Text className="text-slate-400 mt-2">Mobile Edition</Text>
            </View>

            <View className="space-y-4">
                <View>
                    <Text className="text-slate-300 mb-2 font-medium">Email</Text>
                    <TextInput
                        className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 focus:border-accent-green"
                        placeholder="email@address.com"
                        placeholderTextColor="#64748B"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View>
                    <Text className="text-slate-300 mb-2 font-medium">Mot de passe</Text>
                    <TextInput
                        className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 focus:border-accent-green"
                        secureTextEntry
                        placeholder="••••••••"
                        placeholderTextColor="#64748B"
                        autoCapitalize="none"
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <TouchableOpacity
                    className={`bg-accent-green p-4 rounded-xl items-center mt-6 ${loading ? 'opacity-70' : ''}`}
                    onPress={signInWithEmail}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Se connecter</Text>
                    )}
                </TouchableOpacity>

                <View className="flex-row justify-center items-center mt-8">
                    <View className="h-[1px] bg-slate-700 flex-1" />
                    <Text className="text-slate-500 mx-4">OU</Text>
                    <View className="h-[1px] bg-slate-700 flex-1" />
                </View>

                <TouchableOpacity
                    className="bg-slate-800 border border-slate-700 p-4 rounded-xl items-center mt-6"
                    onPress={handleVisitorMode}
                >
                    <Text className="text-slate-300 font-semibold text-lg">
                        Continuer en Mode Visiteur (Démo)
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}
