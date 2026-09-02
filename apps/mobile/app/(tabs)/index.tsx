import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getProperties } from '@i7/core';
import type { PropertyDTO } from '@i7/types';
import { useAuth } from '../../src/contexts/AuthContext';

export default function FeedScreen() {
  const [properties, setProperties] = useState<PropertyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await getProperties();
      setProperties(data);
    } catch (e) {
      console.log('Erro ao carregar imóveis', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>i7</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>Olá, {user?.name ? user.name.split(' ')[0] : 'Usuário'}</Text>
            <Text style={styles.brandSubtitle}>INTELIGÊNCIA IMOBILIÁRIA</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.banner}>
          <Text style={styles.bannerBadge}>⚡ ALUGUEL GARANTIDO</Text>
          <Text style={styles.bannerTitle}>Encontre seu novo imóvel sem fiador</Text>
        </View>

        <Text style={styles.sectionTitle}>Imóveis Disponíveis no Supabase</Text>
        
        {loading ? (
          <ActivityIndicator color="#B4FF39" style={{ marginTop: 20 }} />
        ) : (
          (properties || []).map(p => (
            <View key={p.id} style={styles.card}>
              <Image source={{ uri: p.media?.[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800' }} style={styles.cardImage} />
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{(p.type || 'IMÓVEL').toUpperCase()}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardNeighborhood}>{p.neighborhood ? `${p.neighborhood}, ${p.city}` : p.city || 'São Paulo, SP'}</Text>
                <Text style={styles.cardTitle}>{p.title}</Text>
                
                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.priceLabel}>Total Mensal Estimado</Text>
                    <Text style={styles.cardPrice}>R$ {(p.rentPrice || p.totalMonthly || 0).toLocaleString('pt-BR')}</Text>
                  </View>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>Ver Imóvel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', paddingTop: 40 },
  header: { paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#2B3145' },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logoBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#161922', borderWidth: 1.5, borderColor: '#B4FF39', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  logoText: { color: '#B4FF39', fontWeight: '900', fontSize: 20 },
  brandTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 20 },
  brandSubtitle: { color: '#9CA3AF', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 15 },
  banner: { backgroundColor: '#161922', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#B4FF39', marginBottom: 20 },
  bannerBadge: { color: '#B4FF39', fontSize: 11, fontWeight: '800', marginBottom: 6 },
  bannerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginBottom: 15 },
  card: { backgroundColor: '#1E2230', borderRadius: 16, borderWidth: 1, borderColor: '#2B3145', overflow: 'hidden', marginBottom: 20 },
  cardImage: { width: '100%', height: 200 },
  tagBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#B4FF39', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { color: '#0F1115', fontSize: 10, fontWeight: '800' },
  cardBody: { padding: 15 },
  cardNeighborhood: { color: '#B4FF39', fontSize: 12, fontWeight: '600' },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginVertical: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#2B3145' },
  priceLabel: { color: '#9CA3AF', fontSize: 10 },
  cardPrice: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  actionBtn: { backgroundColor: '#B4FF39', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { color: '#0F1115', fontSize: 12, fontWeight: '800' }
});
