import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import tw from 'twrnc';
import { StatusBar } from 'expo-status-bar'
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
    const navigation = useNavigation();
    return (
        <View style={tw`bg-white h-full w-full`}>
            <StatusBar style="light" />
            <Image style={tw`h-full w-full absolute`} source={require('./assets/hospital.png')} />

            {/* title and form */}
            <View style={tw`h-full w-full flex justify-around pt-40 pb-10`}> 
                {/* Title */}
                <View style={tw`flex items-center`}>
                    <Animated.Text entering={FadeInUp.duration(1000).springify()} style={tw`text-black font-bold tracking-wider text-5xl`}>
                        Login 
                    </Animated.Text>
                    {/* form */}
                    <View style={tw`flex items-center`}>
                        <Animated.View entering={FadeInDown.duration(1000).springify()} style={tw`bg-black/5 p-5 rounded-2xl w-full`}>
                            <TextInput placeholder='Email' placeholderTextColor={'gray'} />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={tw`bg-black/5 p-5 rounded-2xl w-full mb-3`}>
                            <TextInput placeholder='Password' placeholderTextColor={'gray'} secureTextEntry />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={tw`w-full`}>
                            <TouchableOpacity style={tw`w-full bg-sky-400 p-3 rounded-2xl mb-3`}>
                                <Text style={tw`text-xl font-bold text-white text-center`}>
                                    Login
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={tw`flex-row justify-center`}>
                            <Text>Don't have an account?</Text>
                            <TouchableOpacity onPress={() => navigation.push('SignUp')}>
                                <Text style={tw`text-sky-600`}>SignUP!</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>
            </View>
        </View>
    );
}
