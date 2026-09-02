import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function VisitsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Visitas</Text>
      <Text style={styles.subtitle}>Suas visitas agendadas aparecerão aqui.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  subtitle: { color: '#9CA3AF', marginTop: 10 }
});
