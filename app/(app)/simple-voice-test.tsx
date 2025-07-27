import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import SimpleVoiceRecorder from '../components/SimpleVoiceRecorder';

export default function SimpleVoiceTestScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SimpleVoiceRecorder />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 0,
  },
}); 