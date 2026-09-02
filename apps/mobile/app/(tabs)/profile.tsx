import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>
      <Text style={styles.subtitle}>{user?.email}</Text>
      
      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Text style={styles.logoutText}>Sair do Aplicativo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#B4FF39', marginTop: 10, fontSize: 16 },
  logoutBtn: { marginTop: 40, padding: 15, backgroundColor: '#EF4444', borderRadius: 10 },
  logoutText: { color: '#FFFFFF', fontWeight: 'bold' }
});
