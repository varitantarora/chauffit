import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const Contact = () => {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className='text-xl font-bold text-blue-500'>Contact Page</Text>

      <Link href="/" className="mt-4 text-blue-500">Go to Home Page</Link>
    </View>
  )
}

export default Contact

const styles = StyleSheet.create({})