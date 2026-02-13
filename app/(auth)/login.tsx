// app/(auth)/login.tsx
import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView,
  Animated, ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { login } from '../api/apiClient';

const { height: H } = Dimensions.get('window');

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:           '#0A0812',
  surface:      '#120F1C',
  card:         '#18132A',
  cardBorder:   '#2C2245',
  purple:       '#A78BFA',
  purpleDark:   '#7C3AED',
  purpleDim:    'rgba(167,139,250,0.10)',
  purpleBorder: 'rgba(167,139,250,0.25)',
  pink:         '#F472B6',
  red:          '#F87171',
  redBg:        'rgba(248,113,113,0.10)',
  redBorder:    'rgba(248,113,113,0.20)',
  text:         '#EDE9FE',
  muted:        '#7C6FAE',
  dim:          '#4A4165',
  white:        '#FFFFFF',
};

// ── Animated Input ─────────────────────────────────────────────────────────────
function FloatingInput({
  icon, placeholder, value, onChangeText,
  secureTextEntry, keyboardType, delay = 0,
}: any) {
  const [focused, setFocused] = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(20)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const onFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [C.cardBorder, C.purple],
  });

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Animated.View style={[s.inputWrap, { borderColor }]}>
        <Ionicons
          name={icon}
          size={18}
          color={focused ? C.purple : C.dim}
          style={{ marginRight: 10 }}
        />
        <TextInput
          style={s.input}
          placeholder={placeholder}
          placeholderTextColor={C.dim}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry && !showPwd}
          keyboardType={keyboardType ?? 'default'}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPwd(!showPwd)} activeOpacity={0.7}>
            <Ionicons
              name={showPwd ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={C.dim}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
    </Animated.View>
  );
}

// ── Page Login ────────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // Animations globales
  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(formAnim,   { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      // Token sauvegardé dans setJwt() appelé dans login()
      // Redirection vers les tabs
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err.message?.toLowerCase() ?? '';
      if (msg.includes('invalid') || msg.includes('incorrect') || msg.includes('401')) {
        setError('E-mail ou mot de passe incorrect.');
      } else if (msg.includes('not found') || msg.includes('404')) {
        setError("Cet e-mail n'existe pas.");
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setError('Erreur réseau. Vérifiez votre connexion.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      {/* Blobs bg */}
      <View style={s.blob1} />
      <View style={s.blob2} />
      <View style={s.blob3} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            {/* ── Back button ─────────────────────────────────────────── */}
            <TouchableOpacity
              style={s.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color={C.text} />
            </TouchableOpacity>

            {/* ── Header ──────────────────────────────────────────────── */}
            <Animated.View style={[s.headerBlock, { opacity: headerAnim }]}>
              {/* Logo circle */}
              <View style={s.logoCircle}>
                <LinearGradient
                  colors={['rgba(124,58,237,0.3)', 'rgba(244,114,182,0.2)']}
                  style={s.logoGrad}
                >
                  <Text style={s.logoMark}>H</Text>
                </LinearGradient>
              </View>

              <Text style={s.title}>Bon retour 👋</Text>
              <Text style={s.titleSub}>
                Connectez-vous pour retrouver votre communauté
              </Text>
            </Animated.View>

            {/* ── Formulaire ──────────────────────────────────────────── */}
            <Animated.View style={[s.formCard, { opacity: formAnim }]}>

              {/* Message d'erreur */}
              {error && (
                <View style={s.errorBox}>
                  <Ionicons name="alert-circle-outline" size={16} color={C.red} />
                  <Text style={s.errorTxt}>{error}</Text>
                </View>
              )}

              {/* Champs */}
              <FloatingInput
                icon="mail-outline"
                placeholder="Adresse e-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                delay={100}
              />
              <FloatingInput
                icon="lock-closed-outline"
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                delay={200}
              />

              {/* Mot de passe oublié */}
              <TouchableOpacity style={s.forgotBtn} activeOpacity={0.7}>
                <Text style={s.forgotTxt}>Mot de passe oublié ?</Text>
              </TouchableOpacity>

              {/* Bouton login */}
              <TouchableOpacity
                style={[s.loginBtn, loading && s.loginBtnDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <View style={s.loginBtnContent}>
                    <ActivityIndicator size="small" color={C.purple} />
                    <Text style={s.loginBtnTxt}>Connexion en cours…</Text>
                  </View>
                ) : (
                  <View style={s.loginBtnContent}>
                    <Ionicons name="log-in-outline" size={18} color={C.purple} />
                    <Text style={s.loginBtnTxt}>Se connecter</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={s.divider}>
                <View style={s.dividerLine} />
                <Text style={s.dividerTxt}>ou</Text>
                <View style={s.dividerLine} />
              </View>

              {/* Google (désactivé pour l'instant comme dans la version web) */}
              <TouchableOpacity style={s.googleBtn} activeOpacity={0.8} disabled>
                <Ionicons name="logo-google" size={18} color={C.dim} />
                <Text style={s.googleTxt}>Continuer avec Google</Text>
              </TouchableOpacity>

            </Animated.View>

            {/* ── Footer ──────────────────────────────────────────────── */}
            <View style={s.footer}>
              <Text style={s.footerTxt}>Pas encore membre ? </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={s.footerLink}>S'inscrire</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Bg blobs
  blob1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(124,58,237,0.15)' },
  blob2: { position: 'absolute', bottom: -80, left: -80,  width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(244,114,182,0.10)' },
  blob3: { position: 'absolute', top: H * 0.4, left: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(167,139,250,0.07)' },

  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

  // Back
  backBtn: { marginTop: 8, marginBottom: 4, width: 40, height: 40, borderRadius: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, alignItems: 'center', justifyContent: 'center' },

  // Header
  headerBlock: { alignItems: 'center', gap: 10, marginTop: 20, marginBottom: 32 },
  logoCircle:  { width: 80, height: 80, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: C.purpleBorder, marginBottom: 6 },
  logoGrad:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoMark:    { fontSize: 36, fontWeight: '900', color: C.purple },
  title:       { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  titleSub:    { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20, maxWidth: 260 },

  // Form card
  formCard: { gap: 14 },

  // Error
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, backgroundColor: C.redBg, borderWidth: 1, borderColor: C.redBorder },
  errorTxt:  { color: C.red, fontSize: 13, flex: 1 },

  // Input
  inputWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, borderRadius: 16, backgroundColor: C.card, borderWidth: 1.5 },
  input:     { flex: 1, color: C.text, fontSize: 14, fontWeight: '500' },

  // Forgot
  forgotBtn: { alignSelf: 'flex-end', marginTop: -4 },
  forgotTxt: { color: C.purple, fontSize: 12, fontWeight: '500' },

  // Login btn
  loginBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 16, backgroundColor: C.purpleDim, borderWidth: 1.5, borderColor: C.purpleBorder, marginTop: 4 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnContent:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loginBtnTxt:      { color: C.purple, fontSize: 15, fontWeight: '700' },

  // Divider
  divider:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.cardBorder },
  dividerTxt:  { color: C.dim, fontSize: 12 },

  // Google
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: 16, backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, opacity: 0.5 },
  googleTxt: { color: C.muted, fontSize: 14, fontWeight: '600' },

  // Footer
  footer:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 28 },
  footerTxt: { color: C.muted, fontSize: 14 },
  footerLink:{ color: C.purple, fontSize: 14, fontWeight: '700' },
});