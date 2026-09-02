import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { registerUser, verifyEmail } from '@i7/core';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [devHintCode, setDevHintCode] = useState('');

  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      await signIn({ email, password });
    } catch (err: any) {
      const msg = err.data?.message || err.message || 'E-mail ou senha inválidos.';
      setError(msg);
      if (msg.includes('não verificado') || msg.includes('confirmação')) {
        setMode('verify');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      const res = await registerUser({ name, email, password });
      setSuccessMessage(res.message);
      setMode('verify');
    } catch (err: any) {
      setError(err.data?.message || err.message || 'Não foi possível concluir o cadastro.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!email || !code) {
      setError('Por favor, informe seu e-mail e o código de verificação.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      
      const res = await verifyEmail({ email, code });
      await SecureStore.setItemAsync('i7_token', res.accessToken);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.data?.message || err.message || 'Código de verificação incorreto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoText}>i7</Text>
      </View>
      
      <Text style={styles.title}>i7 Imobiliária</Text>
      <Text style={styles.subtitle}>
        {mode === 'login' && 'Acesse sua conta para continuar'}
        {mode === 'register' && 'Crie sua conta em poucos segundos'}
        {mode === 'verify' && 'Digite o código de 6 dígitos enviado por e-mail'}
      </Text>

      {/* Selector Tabs */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tabBtn, mode === 'login' && styles.tabBtnActive]}
          onPress={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
        >
          <Text style={[styles.tabBtnText, mode === 'login' && styles.tabBtnTextActive]}>Entrar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, mode === 'register' && styles.tabBtnActive]}
          onPress={() => { setMode('register'); setError(''); setSuccessMessage(''); }}
        >
          <Text style={[styles.tabBtnText, mode === 'register' && styles.tabBtnTextActive]}>Criar Conta</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

        {mode === 'register' && (
          <TextInput
            style={styles.input}
            placeholder="Nome Completo"
            placeholderTextColor="#6B7280"
            value={name}
            onChangeText={setName}
          />
        )}

        {mode !== 'verify' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#6B7280"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#6B7280"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </>
        )}

        {mode === 'verify' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="E-mail cadastrado"
              placeholderTextColor="#6B7280"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={[styles.input, styles.codeInput]}
              placeholder="Código (6 dígitos)"
              placeholderTextColor="#6B7280"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
          </>
        )}

        {mode === 'login' && (
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#0F1115" /> : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>
        )}

        {mode === 'register' && (
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#0F1115" /> : <Text style={styles.buttonText}>Cadastrar e Enviar Código</Text>}
          </TouchableOpacity>
        )}

        {mode === 'verify' && (
          <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
            {loading ? <ActivityIndicator color="#0F1115" /> : <Text style={styles.buttonText}>Confirmar E-mail e Entrar</Text>}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0F1115',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#161922',
    borderWidth: 2,
    borderColor: '#B4FF39',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: '#B4FF39',
    fontWeight: '900',
    fontSize: 28,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 24,
    textAlign: 'center',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#161922',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    width: '100%',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#2B3145',
  },
  tabBtnText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: '#B4FF39',
    fontWeight: 'bold',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: '#2B3145',
    color: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  codeInput: {
    fontSize: 22,
    letterSpacing: 4,
    textAlign: 'center',
    fontWeight: 'bold',
    borderColor: '#B4FF39',
  },
  button: {
    backgroundColor: '#B4FF39',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#0F1115',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  successText: {
    color: '#B4FF39',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  devBox: {
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: '#B4FF39',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  devBoxTitle: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  devBoxCode: {
    color: '#B4FF39',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 6,
    marginTop: 4,
  }
});
