import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const API_URL = 'http://192.168.0.177:8000';

const COLORS = {
  primary: '#FFE550',
  primaryDark: '#E6C800',
  secondary: '#FF8C42',
  background: '#FFF8E7',
  surface: '#FFFAF0',
  textPrimary: '#4A3728',
  textSecondary: '#8B7355',
  accent: '#4CAF50',
  error: '#E57373',
  white: '#FFFFFF',
  cardShadow: 'rgba(74, 55, 40, 0.1)'
};

const FONTS = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.textPrimary },
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.textPrimary },
  h3: { fontSize: 22, fontWeight: '600', color: COLORS.textPrimary },
  body: { fontSize: 20, fontWeight: '400', color: COLORS.textPrimary },
  bodySmall: { fontSize: 18, fontWeight: '400', color: COLORS.textSecondary },
  caption: { fontSize: 16, fontWeight: '400', color: COLORS.textSecondary },
  button: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary }
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha email e senha');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      await AsyncStorage.setItem('token', response.data.access_token);
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Erro', 'Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.centerContent}>
        <View style={styles.logoContainer}>
          <Text style={styles.avatarEmoji}>🌻</Text>
          <Text style={FONTS.h1}>Deia's Trainer</Text>
          <Text style={FONTS.bodySmall}>Olá! Vou cuidar de você 💪</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={COLORS.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.textPrimary} />
            ) : (
              <Text style={FONTS.button}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={FONTS.bodySmall}>Primeira vez? Criar conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        nickname: nickname || name,
        email,
        password
      });
      await AsyncStorage.setItem('token', response.data.access_token);
      navigation.replace('Onboarding');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.centerContent}>
        <Text style={[FONTS.h1, { textAlign: 'center', marginBottom: 20 }]}>
          Bem-vinda! 🌻
        </Text>
        <Text style={[FONTS.bodySmall, { textAlign: 'center', marginBottom: 30 }]}>
          Vou ser seu trainer pessoal
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor={COLORS.textSecondary}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Como você quer ser chamada?"
            placeholderTextColor={COLORS.textSecondary}
            value={nickname}
            onChangeText={setNickname}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={COLORS.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.textPrimary} />
            ) : (
              <Text style={FONTS.button}>Criar Conta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={FONTS.bodySmall}>Já tem conta? Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function OnboardingScreen({ navigation }) {
  const [age, setAge] = useState('');
  const [goals, setGoals] = useState('');
  const [diet, setDiet] = useState('');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const goalOptions = [
    'Perder peso',
    'Ganhar força',
    'Manter forma',
    'Melhorar saúde',
    'Mais energia'
  ];

  const dietOptions = [
    'Equilibrada',
    'Low carb',
    'Mais proteínas',
    'Vegetariano',
    'Sem restrição'
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${API_URL}/user/profile`, {
        age: parseInt(age) || null,
        fitness_goals: goals,
        dietary_preferences: diet,
        language: 'pt'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar. Continue assim mesmo.');
      navigation.replace('Main');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.centerContent}>
        <View style={styles.onboardingCard}>
          <Text style={styles.avatarEmoji}>💪</Text>
          <Text style={[FONTS.h2, { textAlign: 'center', marginBottom: 10 }]}>
            {step === 0 && 'Quase pronto!'}
            {step === 1 && 'Qual sua idade?'}
            {step === 2 && 'Quais seus objetivos?'}
            {step === 3 && 'Preferências alimentares?'}
          </Text>

          {step === 0 && (
            <View>
              <Text style={[FONTS.body, { textAlign: 'center', marginBottom: 20 }]}>
                Vou personalizar tudo para você! 🌻
              </Text>
              <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                <Text style={FONTS.button}>Continuar</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 1 && (
            <View>
              <TextInput
                style={styles.input}
                placeholder="Sua idade"
                placeholderTextColor={COLORS.textSecondary}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
              <TouchableOpacity 
                style={[styles.primaryButton, { marginTop: 20 }]} 
                onPress={handleNext}
              >
                <Text style={FONTS.button}>Próximo</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View>
              {goalOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    goals === option && styles.optionButtonSelected
                  ]}
                  onPress={() => setGoals(option)}
                >
                  <Text style={[
                    FONTS.body,
                    goals === option && { color: COLORS.textPrimary }
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity 
                style={[styles.primaryButton, { marginTop: 20 }]} 
                onPress={handleNext}
              >
                <Text style={FONTS.button}>Próximo</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View>
              {dietOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    diet === option && styles.optionButtonSelected
                  ]}
                  onPress={() => setDiet(option)}
                >
                  <Text style={[
                    FONTS.body,
                    diet === option && { color: COLORS.textPrimary }
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity 
                style={[styles.primaryButton, { marginTop: 20 }]} 
                onPress={handleNext}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.textPrimary} />
                ) : (
                  <Text style={FONTS.button}>Começar! 🌻</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function HomeScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const [statsRes, profileRes] = await Promise.all([
        axios.get(`${API_URL}/stats/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data);
      const nickname = profileRes.data.nickname || profileRes.data.name;
      setUserName(nickname);

      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Bom dia');
      else if (hour < 18) setGreeting('Boa tarde');
      else setGreeting('Boa noite');
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const getMotivationalQuote = () => {
    const quotes = [
      'Cada dia é uma nova chance de ser melhor! 🌻',
      'Você é mais forte do que pensa! 💪',
      'Pequenos passos levam a grandes resultados!',
      'O importante é não parar nunca! 🏃',
      'Você merece ter uma vida saudável e feliz! ❤️'
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[FONTS.h1, { marginBottom: 5 }]}>
            {greeting}, {userName}! 🌻
          </Text>
          <Text style={FONTS.bodySmall}>Vamos aproveitar o dia?</Text>
        </View>

        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => navigation.navigate('Chat')}
        >
          <Text style={styles.chatButtonEmoji}>💬</Text>
          <View style={styles.chatButtonText}>
            <Text style={FONTS.h3}>Falar com Carlos</Text>
            <Text style={FONTS.bodySmall}>Estou aqui para você!</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={FONTS.h2}>{stats?.streak_days || 0}</Text>
            <Text style={FONTS.caption}>Dias seguidos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💧</Text>
            <Text style={FONTS.h2}>{stats?.today?.water_glasses || 0}</Text>
            <Text style={FONTS.caption}>Copos de água</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🏃</Text>
            <Text style={FONTS.h2}>{stats?.today?.exercises_minutes || 0}</Text>
            <Text style={FONTS.caption}>Minutos</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>💪 Meta de Hoje</Text>
          <View style={styles.goalItem}>
            <Text style={FONTS.body}>🏋️ Exercício</Text>
            <Text style={FONTS.bodySmall}>
              {stats?.today?.exercises_count > 0 ? '✅ Feito!' : 'Pendente'}
            </Text>
          </View>
          <View style={styles.goalItem}>
            <Text style={FONTS.body}>🍎 Alimentação</Text>
            <Text style={FONTS.bodySmall}>
              {stats?.today?.meals_count || 0} refeições
            </Text>
          </View>
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteEmoji}>✨</Text>
          <Text style={[FONTS.body, { textAlign: 'center' }]}>
            {getMotivationalQuote()}
          </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('LogMeal')}
          >
            <Text style={styles.quickActionEmoji}>🍎</Text>
            <Text style={FONTS.bodySmall}>Registrar Refeição</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('LogExercise')}
          >
            <Text style={styles.quickActionEmoji}>🏋️</Text>
            <Text style={FONTS.bodySmall}>Registrar Exercício</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('LogWater')}
          >
            <Text style={styles.quickActionEmoji}>💧</Text>
            <Text style={FONTS.bodySmall}>Água</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollViewRef = useRef(null);

  const sendMessage = async (text = inputText) => {
    if (!text.trim()) return;
    
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/agent/chat`,
        { message: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const assistantMessage = { role: 'assistant', content: response.data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMsg = { role: 'assistant', content: 'Desculpe, não consegui responder. Tente novamente.' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const speakMessage = (text) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(text, {
        language: 'pt-BR',
        pitch: 1.1,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      });
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      Alert.alert(
        'Enviar imagem',
        'Quer que eu analise esta imagem?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Enviar', 
            onPress: () => analyzeImage(result.assets[0].uri)
          }
        ]
      );
    }
  };

  const analyzeImage = async (uri) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', {
        uri,
        type: 'image/jpeg',
        name: 'photo.jpg'
      });
      formData.append('message', 'O que você vê nesta imagem? É algo relacionado a alimentação ou exercício?');

      const response = await axios.post(
        `${API_URL}/agent/chat/image`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      Alert.alert('Erro', 'Não consegui analisar a imagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.chatHeader}>
        <Text style={styles.avatarEmoji}>🇧🇷</Text>
        <View>
          <Text style={FONTS.h3}>Carlos</Text>
          <Text style={FONTS.caption}>Seu trainer pessoal</Text>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatMessages}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {messages.length === 0 && (
          <View style={styles.emptyChat}>
            <Text style={styles.avatarEmoji}>👋</Text>
            <Text style={[FONTS.body, { textAlign: 'center', marginTop: 10 }]}>
              Oi! Sou o Carlos! 🌻
            </Text>
            <Text style={[FONTS.bodySmall, { textAlign: 'center', marginTop: 5 }]}>
              Como posso te ajudar hoje?
            </Text>
          </View>
        )}
        
        {messages.map((msg, index) => (
          <View 
            key={index}
            style={[
              styles.messageBubble,
              msg.role === 'assistant' ? styles.assistantBubble : styles.userBubble
            ]}
          >
            <Text style={[
              FONTS.body,
              msg.role === 'user' && { color: COLORS.textPrimary }
            ]}>
              {msg.content}
            </Text>
            {msg.role === 'assistant' && (
              <TouchableOpacity 
                style={styles.speakButton}
                onPress={() => speakMessage(msg.content)}
              >
                <Text style={styles.speakButtonText}>
                  {isSpeaking ? '⏹️' : '🔊'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        {loading && (
          <View style={styles.typingIndicator}>
            <Text style={FONTS.bodySmall}>Carlos está escrevendo...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.chatInputContainer}>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>📷</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.chatInput}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={COLORS.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={() => sendMessage()}
          disabled={loading}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (error) {
      console.log('Error loading profile:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView>
        <View style={styles.profileCard}>
          <Text style={styles.avatarEmoji}>🌻</Text>
          <Text style={FONTS.h2}>{profile?.name}</Text>
          <Text style={FONTS.bodySmall}>@{profile?.nickname || profile?.name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          <View style={styles.infoRow}>
            <Text style={FONTS.body}>Email</Text>
            <Text style={FONTS.bodySmall}>{profile?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={FONTS.body}>Idade</Text>
            <Text style={FONTS.bodySmall}>{profile?.age || 'Não informado'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={FONTS.body}>Objetivos</Text>
            <Text style={FONTS.bodySmall}>{profile?.fitness_goals || 'Não informado'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={FONTS.body}>Alimentação</Text>
            <Text style={FONTS.bodySmall}>{profile?.dietary_preferences || 'Não informado'}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.dangerButton}
          onPress={handleLogout}
        >
          <Text style={FONTS.button}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function ScheduleScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [newTime, setNewTime] = useState('08:00');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/notifications/schedule`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.log('Error loading notifications:', error);
    }
  };

  const addNotification = async () => {
    if (!newMessage.trim()) {
      Alert.alert('Erro', 'Digite uma mensagem');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_URL}/notifications/schedule`,
        { time: newTime, message: newMessage, days: [0,1,2,3,4,5,6] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage('');
      loadNotifications();
      Alert.alert('Sucesso', 'Lembrete adicionado!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar');
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${API_URL}/notifications/schedule/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadNotifications();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView>
        <Text style={[FONTS.h2, { marginBottom: 20 }]}>Lembretes Diários ⏰</Text>

        <View style={styles.addNotificationCard}>
          <Text style={[FONTS.h3, { marginBottom: 15 }]}>Novo Lembrete</Text>
          <TextInput
            style={styles.input}
            placeholder="Horário (ex: 08:00)"
            placeholderTextColor={COLORS.textSecondary}
            value={newTime}
            onChangeText={setNewTime}
          />
          <TextInput
            style={styles.input}
            placeholder="Mensagem"
            placeholderTextColor={COLORS.textSecondary}
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={addNotification}>
            <Text style={FONTS.button}>Adicionar</Text>
          </TouchableOpacity>
        </View>

        <Text style={[FONTS.h3, { marginTop: 20, marginBottom: 15 }]}>Seus Lembretes</Text>
        
        {notifications.length === 0 ? (
          <Text style={FONTS.bodySmall}>Nenhum lembrete ainda</Text>
        ) : (
          notifications.map((notif) => (
            <View key={notif.id} style={styles.notificationCard}>
              <View>
                <Text style={FONTS.h3}>{notif.time}</Text>
                <Text style={FONTS.body}>{notif.message}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteNotification(notif.id)}>
                <Text style={{ fontSize: 24 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={styles.mealScheduleCard}>
          <Text style={[FONTS.h3, { marginBottom: 15 }]}>Horário das Refeições</Text>
          <View style={styles.mealItem}>
            <Text style={styles.mealEmoji}>🌅</Text>
            <Text style={FONTS.body}>Café da manhã - 08:00</Text>
          </View>
          <View style={styles.mealItem}>
            <Text style={styles.mealEmoji}>☀️</Text>
            <Text style={FONTS.body}>Almoço - 12:00</Text>
          </View>
          <View style={styles.mealItem}>
            <Text style={styles.mealEmoji}>🌇</Text>
            <Text style={FONTS.body}>Lanche - 15:30</Text>
          </View>
          <View style={styles.mealItem}>
            <Text style={styles.mealEmoji}>🌙</Text>
            <Text style={FONTS.body}>Jantar - 19:00</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ProgressScreen() {
  const [exercises, setExercises] = useState([]);
  const [meals, setMeals] = useState([]);
  const [weights, setWeights] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const [exRes, mealRes, weightRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/data/exercises`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/data/meals`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/data/weight`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/stats/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setExercises(exRes.data);
      setMeals(mealRes.data);
      setWeights(weightRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView>
        <Text style={[FONTS.h2, { marginBottom: 20 }]}>Seu Progresso 📊</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={FONTS.h2}>{stats?.streak_days || 0}</Text>
            <Text style={FONTS.caption}>Dias Seguidos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🏃</Text>
            <Text style={FONTS.h2}>{stats?.weekly?.exercises_count || 0}</Text>
            <Text style={FONTS.caption}>Exercícios Semana</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Peso 💪</Text>
          {weights.length > 0 ? (
            <View>
              <Text style={FONTS.h2}>{weights[0].weight_kg} kg</Text>
              <Text style={FONTS.caption}>
                Última pesagem: {new Date(weights[0].created_at).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          ) : (
            <Text style={FONTS.bodySmall}>Nenhuma pesagem registrada</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Exercícios Recentes 🏋️</Text>
          {exercises.slice(0, 5).map((ex) => (
            <View key={ex.id} style={styles.historyItem}>
              <Text style={FONTS.body}>{ex.exercise_type}</Text>
              <Text style={FONTS.bodySmall}>{ex.duration_minutes} min</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Refeições Recentes 🍎</Text>
          {meals.slice(0, 5).map((meal) => (
            <View key={meal.id} style={styles.historyItem}>
              <Text style={FONTS.body}>{meal.meal_type}</Text>
              <Text style={FONTS.bodySmall}>{meal.description.substring(0, 30)}...</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function LogMealScreen({ navigation }) {
  const [mealType, setMealType] = useState('breakfast');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [loading, setLoading] = useState(false);

  const mealTypes = [
    { id: 'breakfast', label: 'Café da manhã', emoji: '🌅' },
    { id: 'lunch', label: 'Almoço', emoji: '☀️' },
    { id: 'snack', label: 'Lanche', emoji: '🍪' },
    { id: 'dinner', label: 'Jantar', emoji: '🌙' }
  ];

  const handleSave = async () => {
    if (!description) {
      Alert.alert('Erro', 'Descreva o que você comeu');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_URL}/data/meal`,
        {
          meal_type: mealType,
          description,
          calories_estimate: parseInt(calories) || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Sucesso', 'Refeição registrada!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView>
        <Text style={[FONTS.h2, { marginBottom: 20 }]}>Registrar Refeição 🍎</Text>

        <Text style={[FONTS.body, { marginBottom: 10 }]}>Tipo de refeição</Text>
        <View style={styles.optionsRow}>
          {mealTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionButton,
                mealType === type.id && styles.optionButtonSelected
              ]}
              onPress={() => setMealType(type.id)}
            >
              <Text style={{ fontSize: 24 }}>{type.emoji}</Text>
              <Text style={FONTS.caption}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={[styles.input, { marginTop: 20 }]}
          placeholder="O que você comeu?"
          placeholderTextColor={COLORS.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TextInput
          style={styles.input}
          placeholder="Calorias (opcional)"
          placeholderTextColor={COLORS.textSecondary}
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
        />

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.textPrimary} />
          ) : (
            <Text style={FONTS.button}>Salvar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function LogExerciseScreen({ navigation }) {
  const [exerciseType, setExerciseType] = useState('walking');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const exerciseTypes = [
    { id: 'walking', label: 'Caminhada', emoji: '🚶' },
    { id: 'stretching', label: 'Alongamento', emoji: '🧘' },
    { id: 'strength', label: 'Musculação', emoji: '💪' },
    { id: 'cycling', label: 'Ciclismo', emoji: '🚴' },
    { id: 'swimming', label: 'Natação', emoji: '🏊' },
    { id: 'other', label: 'Outro', emoji: '🏃' }
  ];

  const handleSave = async () => {
    if (!duration) {
      Alert.alert('Erro', 'Digite a duração do exercício');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_URL}/data/exercise`,
        {
          exercise_type: exerciseType,
          duration_minutes: parseInt(duration),
          intensity: 'medium',
          notes: notes || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Sucesso', 'Exercício registrado!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView>
        <Text style={[FONTS.h2, { marginBottom: 20 }]}>Registrar Exercício 🏋️</Text>

        <Text style={[FONTS.body, { marginBottom: 10 }]}>Tipo de exercício</Text>
        <View style={styles.optionsGrid}>
          {exerciseTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionButton,
                exerciseType === type.id && styles.optionButtonSelected
              ]}
              onPress={() => setExerciseType(type.id)}
            >
              <Text style={{ fontSize: 28 }}>{type.emoji}</Text>
              <Text style={[FONTS.caption, { textAlign: 'center' }]}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={[styles.input, { marginTop: 20 }]}
          placeholder="Duração (minutos)"
          placeholderTextColor={COLORS.textSecondary}
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Notas (opcional)"
          placeholderTextColor={COLORS.textSecondary}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.textPrimary} />
          ) : (
            <Text style={FONTS.button}>Salvar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function LogWaterScreen({ navigation }) {
  const [todayTotal, setTodayTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTodayWater();
  }, []);

  const loadTodayWater = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/data/water/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodayTotal(response.data.total_ml);
    } catch (error) {
      console.log('Error loading water:', error);
    }
  };

  const addWater = async (ml) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_URL}/data/water`,
        { amount_ml: ml },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodayTotal(prev => prev + ml);
      Alert.alert('Sucesso', `${ml}ml de água registrados!`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
        <Text style={styles.avatarEmoji}>💧</Text>
        <Text style={[FONTS.h2, { marginBottom: 10 }]}>Água de Hoje</Text>
        <Text style={FONTS.h1}>{todayTotal} ml</Text>
        <Text style={FONTS.bodySmall}>{Math.floor(todayTotal / 250)} copos</Text>

        <View style={styles.waterButtons}>
          <TouchableOpacity 
            style={styles.waterButton}
            onPress={() => addWater(150)}
            disabled={loading}
          >
            <Text style={styles.waterButtonText}>+150ml</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.waterButton}
            onPress={() => addWater(250)}
            disabled={loading}
          >
            <Text style={styles.waterButtonText}>+250ml</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.waterButton}
            onPress={() => addWater(500)}
            disabled={loading}
          >
            <Text style={styles.waterButtonText}>+500ml</Text>
          </TouchableOpacity>
        </View>

        <Text style={[FONTS.bodySmall, { marginTop: 30 }]}>
          Meta diária: 2000ml (8 copos)
        </Text>
        
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(todayTotal / 2000 * 100, 100)}%` }]} />
        </View>
      </ScrollView>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10
        },
        tabBarActiveTintColor: COLORS.primaryDark,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: { fontSize: 14 }
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          tabBarLabel: 'Carlos',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>💬</Text>
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progresso',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📊</Text>
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Loading');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const profile = await axios.get(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profile.data.fitness_goals) {
          setInitialRoute('Main');
        } else {
          setInitialRoute('Onboarding');
        }
      } else {
        setInitialRoute('Login');
      }
    } catch (error) {
      setInitialRoute('Login');
    }
  };

  if (initialRoute === 'Loading') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.avatarEmoji}>🌻</Text>
        <Text style={FONTS.h2}>Carregando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="LogMeal" component={LogMealScreen} />
        <Stack.Screen name="LogExercise" component={LogExerciseScreen} />
        <Stack.Screen name="LogWater" component={LogWaterScreen} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center'
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40
  },
  avatarEmoji: {
    fontSize: 60,
    marginBottom: 10
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    fontSize: 20,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.primary
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 20
  },
  onboardingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 30,
    width: '100%'
  },
  optionButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  optionButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark
  },
  header: {
    marginBottom: 25,
    marginTop: 10
  },
  chatButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  chatButtonEmoji: {
    fontSize: 40,
    marginRight: 15
  },
  chatButtonText: {
    flex: 1
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 5
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 15
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  quoteCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center'
  },
  quoteEmoji: {
    fontSize: 30,
    marginBottom: 10
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  quickActionButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  quickActionEmoji: {
    fontSize: 30,
    marginBottom: 5
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary
  },
  chatMessages: {
    flex: 1,
    paddingVertical: 15
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50
  },
  messageBubble: {
    borderRadius: 20,
    padding: 15,
    marginBottom: 10,
    maxWidth: '80%'
  },
  assistantBubble: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5
  },
  userBubble: {
    backgroundColor: COLORS.white,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5
  },
  speakButton: {
    marginTop: 8,
    alignSelf: 'flex-start'
  },
  speakButtonText: {
    fontSize: 20
  },
  typingIndicator: {
    padding: 10
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.primary,
    paddingTop: 10
  },
  imageButton: {
    padding: 10
  },
  imageButtonText: {
    fontSize: 28
  },
  chatInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 18,
    maxHeight: 100,
    marginHorizontal: 10
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonText: {
    fontSize: 24,
    color: COLORS.textPrimary
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 15
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background
  },
  dangerButton: {
    backgroundColor: COLORS.error,
    borderRadius: 15,
    padding: 18,
    alignItems: 'center'
  },
  addNotificationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20
  },
  notificationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  mealScheduleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 20,
    marginTop: 20
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  mealEmoji: {
    fontSize: 24,
    marginRight: 15
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  waterButtons: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 15
  },
  waterButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 25,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  waterButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary
  },
  progressBar: {
    width: '100%',
    height: 20,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginTop: 20,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 10
  }
});