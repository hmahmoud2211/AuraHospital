import { View, Text, Image, TextInput, TouchableOpacity, Touchable } from 'react-native'
import React from 'react'
import tw from 'tailwind-react-native-classnames';
import { StatusBar } from 'expo-status-bar'
import Animated,{ FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

export default function SignupScreen() {
    const navigation = useNavigation();
    return (
        <View style={tw`bg-white h-full w-full`}>
            <StatusBar style="light" />
            <Image className="h-full w-full absolute" source={require('../assets/hospital.png')} />

        {/* lights */}
        <View className="flex-row justify-around w-full absolute">


        </View>


    {/* title and form */}
        <View className="h-full w-full flex justify-around pt-48"> 
        {/* Title */}
        <View className="flex items-center">
            <Animated.Text entering={FadeInUp.duration(1000).springify()} className="text-black font-bold tracking-wider text-5xl">
        Sign Up 
            </Animated.Text>
        {/* form */}
        <View className="flex items-center">
            <Animated.View entering={FadeInDown.duration(1000).springify()} className="bg-black/5 p-5 rounder-2xl w-full">
            <TextInput placeholder='Username' placeholderTextColor={'gray'} />
            </Animated.View>


            <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} className="bg-black/5 p-5 rounder-2xl w-full">
            <TextInput placeholder='Email' placeholderTextColor={'gray'} />
            </Animated.View>
 





            <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()}  className="bg-black/5 p-5 rounder-2xl w-full mb-3">
            <TextInput placeholder='Password' placeholderTextColor={'gray'} secureTextEntry />
            </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()}  className="w-full">
        <TouchableOpacity
        className="w-full bg-sky-400 p-3 rounder-2xl mb-3" >
            <Text className="text-xl font-bold text-white text-center">
                SignUp 
            </Text>
        </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()}  className="flex-row justify-center">
        <Text>Already have an account?</Text>
        <TouchableOpacity onPress={()=> navigation.push('Login')}>
            <Text className="text-sky-600">Login</Text>
        </TouchableOpacity>
        </Animated.View> 



        </View>
        </View>
        </View>





            
        </View>
    );
}
