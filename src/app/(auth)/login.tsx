// app/(auth)/login.tsx
import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView,
  Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { login } from '../../app/api/apiClient';

const { height: H } = Dimensions.get('window');

// ── Palette — identique version web (zinc-950 / zinc-900/60 / purple-500) ─────
const C = {
  bg:           '#09090B',
  card:         'rgba(24,18,42,0.60)',
  cardBorder:   'rgba(63,63,70,0.50)',
  inputBg:      'rgba(24,24,27,0.50)',
  inputBorder:  'rgba(63,63,70,0.60)',
  purple:       '#A78BFA',
  purpleFocus:  'rgba(167,139,250,0.60)',
  purpleDim:    'rgba(167,139,250,0.10)',
  purpleBorder: 'rgba(167,139,250,0.20)',
  pink:         '#F472B6',
  red:          '#F87171',
  redBg:        'rgba(239,68,68,0.10)',
  redBorder:    'rgba(239,68,68,0.20)',
  text:         '#FFFFFF',
  muted:        '#A1A1AA',
  dim:          '#52525B',
};

// ── Composant Input animé ─────────────────────────────────────────────────────
function AuthInput({
  icon, placeholder, value, onChangeText,
  secure = false, keyboard = 'default', delay = 0, editable = true,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secure?: boolean;
  keyboard?: any;
  delay?: number;
  editable?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const entryAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 380, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 380, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const animBorder = (v: number) =>
    Animated.timing(borderAnim, { toValue: v, duration: 180, useNativeDriver: false }).start();

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.inputBorder, C.purpleFocus],
  });

  return (
    <Animated.View style={{ opacity: entryAnim, transform: [{ translateY: slideAnim }] }}>
      <Animated.View style={[s.inputWrap, { borderColor }]}>
        <Ionicons name={icon} size={18} color={focused ? C.purple : C.dim} style={s.inputIcon} />
        <TextInput
          style={s.input}
          placeholder={placeholder}
          placeholderTextColor={C.dim}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => { setFocused(true);  animBorder(1); }}
          onBlur={()  => { setFocused(false); animBorder(0); }}
          secureTextEntry={secure && !showPwd}
          keyboardType={keyboard}
          autoCapitalize="none"
          autoCorrect={false}
          editable={editable}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShowPwd(!showPwd)} activeOpacity={0.7}>
            <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.dim} />
          </TouchableOpacity>
        )}
      </Animated.View>
    </Animated.View>
  );
}

// ── LoginScreen ───────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const cardAnim  = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardAnim,  { toValue: 1, duration: 500, delay: 150, useNativeDriver: true }),
      Animated.timing(cardSlide, { toValue: 0, duration: 500, delay: 150, useNativeDriver: true }),
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
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err.message?.toLowerCase() ?? '';
      if (msg.includes('invalid') || msg.includes('incorrect') || msg.includes('401'))
        setError('E-mail ou mot de passe incorrect.');
      else if (msg.includes('not found') || msg.includes('404'))
        setError("Cet e-mail n'existe pas.");
      else if (msg.includes('network') || msg.includes('fetch'))
        setError('Erreur réseau. Vérifiez votre connexion.');
      else
        setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      {/* Déco coins — identique web */}
      <View style={s.decoBR} />
      <View style={s.decoTL} />

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
            {/* Back */}
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={20} color={C.muted} />
            </TouchableOpacity>

            {/* Card — bg zinc-900/60 + border zinc-700/50 + rounded-3xl */}
            <Animated.View style={[s.card, { opacity: cardAnim, transform: [{ translateY: cardSlide }] }]}>

              {/* Logo + tagline */}
              <Animated.View style={[s.logoBlock, { opacity: cardAnim }]}>
                <View style={s.logoGlowWrap}>
                  <View style={s.logoGlow} />
                  <View style={s.logoCircle}>
                    <Text style={s.logoLetter}>H</Text>
                  </View>
                </View>
                <Text style={s.tagline}>
                  Rejoignez notre communauté et connectez-vous avec le monde.
                </Text>
              </Animated.View>

              {/* Erreur */}
              {error && (
                <View style={s.errorBox}>
                  <Ionicons name="alert-circle-outline" size={14} color={C.red} />
                  <Text style={s.errorTxt}>{error}</Text>
                </View>
              )}

              {/* Inputs */}
              <View style={s.form}>
                <AuthInput icon="mail-outline"        placeholder="Adresse e-mail"  value={email}    onChangeText={setEmail}    keyboard="email-address" delay={300} editable={!loading} />
                <AuthInput icon="lock-closed-outline" placeholder="Mot de passe"    value={password} onChangeText={setPassword} secure                   delay={360} editable={!loading} />

                {/* Mot de passe oublié */}
                <TouchableOpacity style={s.forgotRow} activeOpacity={0.7}>
                  <Text style={s.forgotTxt}>Mot de passe oublié ?</Text>
                </TouchableOpacity>

                {/* Bouton Se connecter */}
                <TouchableOpacity
                  style={[s.submitBtn, loading && s.submitBtnDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <View style={s.btnRow}>
                    {loading
                      ? <View style={s.spinner} />
                      : <Ionicons name="log-in-outline" size={18} color={C.purple} />
                    }
                    <Text style={s.submitTxt}>
                      {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={s.footer}>
                <Text style={s.footerTxt}>Pas encore membre ? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/register')} activeOpacity={0.7}>
                  <Text style={s.footerLink}>S'inscrire</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },

  decoBR: { position: 'absolute', bottom: 0,   right: 0, width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(124,58,237,0.05)' },
  decoTL: { position: 'absolute', top: 0,      left: 0,  width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(244,114,182,0.05)' },

  backBtn: { marginTop: 10, marginBottom: 16, width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(24,24,27,0.6)', borderWidth: 1, borderColor: C.cardBorder, alignItems: 'center', justifyContent: 'center' },

  // Card identique web : bg-zinc-900/60 backdrop border-2 border-zinc-700/50 rounded-3xl p-8
  card: { backgroundColor: C.card, borderWidth: 2, borderColor: C.cardBorder, borderRadius: 24, padding: 28, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 40, shadowOffset: { width: 0, height: 20 } },

  logoBlock:    { alignItems: 'center', marginBottom: 22, gap: 12 },
  logoGlowWrap: { alignItems: 'center', justifyContent: 'center' },
  logoGlow:     { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(124,58,237,0.15)' },
  logoCircle:   { width: 78, height: 78, borderRadius: 22, backgroundColor: 'rgba(124,58,237,0.15)', borderWidth: 2, borderColor: 'rgba(167,139,250,0.30)', alignItems: 'center', justifyContent: 'center' },
  logoLetter:   { fontSize: 36, fontWeight: '900', color: C.purple },
  tagline:      { fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 17, maxWidth: 240 },

  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 12, borderRadius: 14, backgroundColor: C.redBg, borderWidth: 1, borderColor: C.redBorder, marginBottom: 10 },
  errorTxt:  { color: C.red, fontSize: 12, flex: 1, fontWeight: '500' },

  form: { gap: 10 },

  // Input : bg-zinc-900/50 border-2 border-zinc-700/60 rounded-2xl px-4 py-3
  inputWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, borderRadius: 16, backgroundColor: C.inputBg, borderWidth: 2 },
  inputIcon: { marginRight: 10 },
  input:     { flex: 1, color: C.text, fontSize: 13, fontWeight: '500' },

  forgotRow: { alignSelf: 'flex-end', marginTop: -2 },
  forgotTxt: { color: C.purple, fontSize: 11, fontWeight: '500' },

  // Bouton : bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl
  submitBtn:         { marginTop: 6, paddingVertical: 14, borderRadius: 16, backgroundColor: C.purpleDim, borderWidth: 1, borderColor: C.purpleBorder, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.55 },
  btnRow:            { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitTxt:         { color: C.purple, fontSize: 14, fontWeight: '700' },
  spinner:           { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: 'rgba(167,139,250,0.30)', borderTopColor: C.purple },

  footer:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  footerTxt:  { color: C.muted, fontSize: 13 },
  footerLink: { color: C.purple, fontSize: 13, fontWeight: '700' },
});