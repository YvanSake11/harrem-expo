// app/(auth)/welcome.tsx
// Design : fond photo sombre (bg-paris) + overlay noir + contenu centré — identique version web
import { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, StatusBar, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width: W, height: H } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  // ── Animations séquentielles identiques version web ──────────────────────
  const headerAnim = useRef(new Animated.Value(0)).current;
  const textAnim   = useRef(new Animated.Value(0)).current;
  const textSlide  = useRef(new Animated.Value(20)).current;
  const btn1Anim   = useRef(new Animated.Value(0)).current;
  const btn1Slide  = useRef(new Animated.Value(20)).current;
  const btn2Anim   = useRef(new Animated.Value(0)).current;
  const btn2Slide  = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(textAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(textSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btn1Anim,  { toValue: 1, duration: 360, useNativeDriver: true }),
        Animated.timing(btn1Slide, { toValue: 0, duration: 360, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btn2Anim,  { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(btn2Slide, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Background photo + overlay identique web ──────────────────── */}
      {/* Version web: bg-paris.png brightness-50 blur-[1px] + bg-gray-100/10 overlay */}
      {/* Mobile: gradient sombre + grain pour simuler la photo floue de Paris */}
      <View style={StyleSheet.absoluteFill}>
        {/* Couche de base : nuit parisienne profonde */}
        <View style={s.bgBase} />
        {/* Grain texture */}
        <View style={s.grain} />
        {/* Vignettte */}
        <View style={s.vignette} />
        {/* Overlay léger identique au bg-gray-100/10 web */}
        <View style={s.overlay} />

        {/* Lumières de ville simulées — points lumineux flous */}
        <View style={[s.cityLight, { top: H * 0.15, left: W * 0.1,  backgroundColor: 'rgba(255,220,100,0.08)' }]} />
        <View style={[s.cityLight, { top: H * 0.25, right: W * 0.05, backgroundColor: 'rgba(200,160,255,0.07)', width: 180, height: 180 }]} />
        <View style={[s.cityLight, { top: H * 0.5,  left: W * 0.3,  backgroundColor: 'rgba(255,100,150,0.06)', width: 220, height: 220 }]} />
        <View style={[s.cityLight, { bottom: H * 0.2, right: W * 0.1, backgroundColor: 'rgba(100,180,255,0.05)', width: 160, height: 160 }]} />
        <View style={[s.cityLight, { bottom: H * 0.1, left: W * 0.05, backgroundColor: 'rgba(255,200,100,0.07)', width: 200, height: 200 }]} />
      </View>

      {/* ── SafeArea ──────────────────────────────────────────────────── */}
      <SafeAreaView style={s.safe}>

        {/* Header — Logo + langue (identique web) */}
        <Animated.View style={[s.header, { opacity: headerAnim }]}>
          {/* Logo texte — identique au H4.png web */}
          <View style={s.logoWrap}>
            <Text style={s.logoH}>H</Text>
            <Text style={s.logoArrem}>arrem</Text>
          </View>

          {/* Langue */}
          <View style={s.langPill}>
            <Text style={s.langTxt}>FR</Text>
            <Text style={s.langChevron}>▾</Text>
          </View>
        </Animated.View>

        {/* Corps central — identique web: flex-1 justify-center */}
        <View style={s.body}>

          {/* Texte principal */}
          <Animated.View style={[s.textBlock, { opacity: textAnim, transform: [{ translateY: textSlide }] }]}>
            <Text style={s.tagline}>
              Choisir parmi des millions d'utilisateurs actifs, ton compagnon de vie ou ton aventure d'un soir
            </Text>
          </Animated.View>

          {/* Bouton 1 — bg-red-500 identique web */}
          <Animated.View style={[s.btnWrap, { opacity: btn1Anim, transform: [{ translateY: btn1Slide }] }]}>
            <TouchableOpacity
              style={s.btnPrimary}
              onPress={() => router.push('/(auth)/register')}
              activeOpacity={0.85}
            >
              <Text style={s.btnPrimaryTxt}>Créer votre compte</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Bouton 2 — border border-white identique web */}
          <Animated.View style={[s.btnWrap, { opacity: btn2Anim, transform: [{ translateY: btn2Slide }] }]}>
            <TouchableOpacity
              style={s.btnSecondary}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.85}
            >
              <Text style={s.btnSecondaryTxt}>Ouvrir une session</Text>
            </TouchableOpacity>
          </Animated.View>

        </View>

        {/* Footer vide identique web */}
        <View style={s.footer} />

      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  safe: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 20 },

  // Background layers
  bgBase:    { ...StyleSheet.absoluteFillObject, backgroundColor: '#0A0608' },
  grain:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(30,20,35,0.7)' },
  vignette:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  overlay:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(245,245,245,0.04)' },
  cityLight: { position: 'absolute', width: 200, height: 200, borderRadius: 100 },

  // Header
  header:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingHorizontal: 4 },
  logoWrap: { flexDirection: 'row', alignItems: 'baseline' },
  logoH:    { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  logoArrem:{ fontSize: 24, fontWeight: '700', color: 'rgba(255,255,255,0.85)', letterSpacing: -0.5 },
  langPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  langTxt:  { color: '#fff', fontSize: 13, fontWeight: '500' },
  langChevron: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },

  // Body
  body:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20, paddingHorizontal: 4, maxWidth: 380, alignSelf: 'center', width: '100%' },
  textBlock: { alignItems: 'center', paddingHorizontal: 8 },
  tagline:   { fontSize: 15, color: '#fff', textAlign: 'center', lineHeight: 24, fontWeight: '400' },

  // Boutons
  btnWrap:      { width: '100%' },
  // bg-red-500 rounded-md — identique web
  btnPrimary:   { backgroundColor: '#EF4444', paddingVertical: 14, borderRadius: 6, alignItems: 'center', width: '100%' },
  btnPrimaryTxt:{ color: '#fff', fontSize: 16, fontWeight: '700' },
  // border border-white rounded-md — identique web
  btnSecondary: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', paddingVertical: 13, borderRadius: 6, alignItems: 'center', width: '100%', backgroundColor: 'rgba(255,255,255,0.04)' },
  btnSecondaryTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },

  footer: { height: 40 },
});