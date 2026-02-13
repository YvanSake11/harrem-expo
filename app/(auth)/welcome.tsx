// app/(auth)/welcome.tsx
import { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, ImageBackground, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width: W, height: H } = Dimensions.get('window');

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  purple: '#A78BFA',
  purpleDark: '#7C3AED',
  pink:   '#F472B6',
  red:    '#EF4444',
  redHot: '#DC2626',
  white:  '#FFFFFF',
  offWhite: 'rgba(255,255,255,0.85)',
  dim:    'rgba(255,255,255,0.5)',
};

export default function WelcomeScreen() {
  const router = useRouter();

  // Animations d'entrée
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const btnAnim   = useRef(new Animated.Value(60)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo pop-in
      Animated.spring(logoScale, {
        toValue: 1, useNativeDriver: true, tension: 60, friction: 7,
      }),
      // Texte slide up
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      // Boutons slide up
      Animated.timing(btnAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  // Pulse animation pour le bouton CTA
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Background ─────────────────────────────────────────────────── */}
      {/* Fond dégradé sombre riche — évoque nuit urbaine / romantique */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#1A0A2E', '#0D0520', '#1C0A1A', '#0A0812']}
          locations={[0, 0.3, 0.65, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* Blobs décoratifs */}
        <View style={s.blobTopRight} />
        <View style={s.blobBottomLeft} />
        <View style={s.blobCenter} />

        {/* Grille de points subtile */}
        {Array.from({ length: 6 }).map((_, row) =>
          Array.from({ length: 8 }).map((_, col) => (
            <View
              key={`${row}-${col}`}
              style={[s.dot, {
                top:  row  * (H / 6)  + 30,
                left: col  * (W / 8)  + 20,
              }]}
            />
          ))
        )}
      </View>

      {/* ── Safe area content ──────────────────────────────────────────── */}
      <SafeAreaView style={s.safe}>

        {/* Header */}
        <View style={s.header}>
          {/* Logo text */}
          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <Text style={s.logoText}>Harrem</Text>
          </Animated.View>

          {/* Language pill */}
          <View style={s.langPill}>
            <Text style={s.langTxt}>FR</Text>
          </View>
        </View>

        {/* Corps */}
        <View style={s.body}>

          {/* Illustration centrale — cercles concentriques */}
          <View style={s.illustration}>
            <View style={s.ring3} />
            <View style={s.ring2} />
            <View style={s.ring1} />
            <View style={s.ringCore}>
              <Text style={s.ringEmoji}>💜</Text>
            </View>

            {/* Petits avatars flottants */}
            <View style={[s.floatAvatar, s.avatar1]}><Text>👩</Text></View>
            <View style={[s.floatAvatar, s.avatar2]}><Text>🧑</Text></View>
            <View style={[s.floatAvatar, s.avatar3]}><Text>👩‍🦱</Text></View>
            <View style={[s.floatAvatar, s.avatar4]}><Text>🧔</Text></View>
          </View>

          {/* Texte principal */}
          <Animated.View style={[s.textBlock, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={s.headline}>
              Des millions{'\n'}de connexions{'\n'}
              <Text style={s.headlineAccent}>t'attendent</Text>
            </Text>
            <Text style={s.subtitle}>
              Ton compagnon de vie ou ton aventure d'un soir — commence ici.
            </Text>
          </Animated.View>

          {/* Stats */}
          <Animated.View style={[s.statsRow, { opacity: fadeAnim }]}>
            {[
              { val: '2M+',  lbl: 'Membres' },
              { val: '150+', lbl: 'Pays' },
              { val: '24/7', lbl: 'Actifs' },
            ].map((stat) => (
              <View key={stat.val} style={s.statItem}>
                <Text style={s.statVal}>{stat.val}</Text>
                <Text style={s.statLbl}>{stat.lbl}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* ── Boutons ─────────────────────────────────────────────────── */}
        <Animated.View style={[s.buttons, { transform: [{ translateY: btnAnim }] }]}>

          {/* CTA principal — Créer un compte */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={s.btnPrimary}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={[C.red, C.redHot]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.btnGradient}
              >
                <Text style={s.btnPrimaryTxt}>Créer votre compte</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Secondaire — Se connecter */}
          <TouchableOpacity
            style={s.btnSecondary}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text style={s.btnSecondaryTxt}>Ouvrir une session</Text>
          </TouchableOpacity>

          {/* Mentions légales */}
          <Text style={s.legal}>
            En continuant, vous acceptez nos{' '}
            <Text style={s.legalLink}>Conditions d'utilisation</Text>
            {' '}et notre{' '}
            <Text style={s.legalLink}>Politique de confidentialité</Text>
          </Text>
        </Animated.View>

      </SafeAreaView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0812' },
  safe: { flex: 1, justifyContent: 'space-between' },

  // Bg
  blobTopRight:  { position: 'absolute', top: -80,   right: -80,  width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(124,58,237,0.18)' },
  blobBottomLeft:{ position: 'absolute', bottom: -60, left: -60,  width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(244,114,182,0.12)' },
  blobCenter:    { position: 'absolute', top: H * 0.3, left: W * 0.2, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(167,139,250,0.07)' },
  dot:           { position: 'absolute', width: 2, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.06)' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 8 },
  logoText: { fontSize: 28, fontWeight: '900', color: C.white, letterSpacing: -1 },
  langPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  langTxt:  { color: C.white, fontSize: 12, fontWeight: '600' },

  // Body
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 28 },

  // Illustration
  illustration: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  ring3:  { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: 'rgba(167,139,250,0.12)' },
  ring2:  { position: 'absolute', width: 160, height: 160, borderRadius: 80,  borderWidth: 1, borderColor: 'rgba(167,139,250,0.20)' },
  ring1:  { position: 'absolute', width: 100, height: 100, borderRadius: 50,  borderWidth: 1, borderColor: 'rgba(167,139,250,0.35)' },
  ringCore: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(124,58,237,0.25)', borderWidth: 2, borderColor: 'rgba(167,139,250,0.5)', alignItems: 'center', justifyContent: 'center' },
  ringEmoji: { fontSize: 26 },
  floatAvatar: { position: 'absolute', width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  avatar1: { top: 10,  left: 20  },
  avatar2: { top: 10,  right: 20 },
  avatar3: { bottom: 10, left: 15 },
  avatar4: { bottom: 10, right: 15 },

  // Text
  textBlock: { alignItems: 'center', gap: 10 },
  headline:  { fontSize: 36, fontWeight: '900', color: C.white, textAlign: 'center', lineHeight: 44, letterSpacing: -1 },
  headlineAccent: { color: C.purple },
  subtitle: { fontSize: 14, color: C.dim, textAlign: 'center', lineHeight: 22, maxWidth: 280 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 0 },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', backgroundColor: 'rgba(255,255,255,0.03)' },
  statVal:  { fontSize: 20, fontWeight: '800', color: C.white },
  statLbl:  { fontSize: 11, color: C.dim, marginTop: 2 },

  // Boutons
  buttons:      { paddingHorizontal: 24, paddingBottom: 16, gap: 12 },
  btnPrimary:   { borderRadius: 12, overflow: 'hidden' },
  btnGradient:  { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryTxt:{ color: C.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  btnSecondary: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  btnSecondaryTxt: { color: C.white, fontSize: 16, fontWeight: '600' },
  legal:    { fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 16 },
  legalLink:{ color: 'rgba(167,139,250,0.7)' },
});