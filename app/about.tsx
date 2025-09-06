import { StyleSheet, Text, useColorScheme, View } from 'react-native'
import { Link } from 'expo-router'
import React from 'react'
import { LightColors, DarkColors } from '../constants/Colors';

const About = () => {
  const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? DarkColors : LightColors;
  return (
    <View className="flex-1 items-center justify-center" style={{backgroundColor: theme.background}}>
          <Text className="text-xl font-bold " style={{color: theme.textPrimary}}>About Page</Text>
    <Link href="/" className="mt-4 " style={{color: theme.textPrimary}}>Go to Home Page</Link>
    </View>
  )
}

export default About

const styles = StyleSheet.create({})