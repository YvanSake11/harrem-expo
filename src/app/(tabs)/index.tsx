// app/(tabs)/index.tsx — Dashboard / Home
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchMe } from '../api/apiClient';
import { profilePictureUrl, logout } from '../utils/index';
import type { User } from '../../../src/types/api.types';

const { width: W } = Dimensions.get('window');

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:           '#09090B',
  surface:      '#111016',
  card:         '#18132A',
  cardBorder:   '#2C2245',
  purple:       '#A78BFA',
  purpleDark:   '#7C3AED',
  purpleDim:    'rgba(167,139,250,0.10)',
  purpleBorder: 'rgba(167,139,250,0.22)',
  pink:         '#F472B6',
  pinkDim:      'rgba(244,114,182,0.10)',
  pinkBorder:   'rgba(244,114,182,0.20)',
  green:        '#34D399',
  greenDim:     'rgba(52,211,153,0.10)',
  greenBorder:  'rgba(52,211,153,0.20)',
  amber:        '#FBBF24',
  amberDim:     'rgba(251,191,36,0.10)',
  blue:         '#60A5FA',
  blueDim:      'rgba(96,165,250,0.10)',
  text:         '#EDE9FE',
  muted:        '#7C6FAE',
  dim:          '#4A4165',
  white:        '#FFFFFF',
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ style }: { style?: any }) {
  const op = useRef(new Animated.Value(0.25)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(op, { toValue: 0.55, duration: 900, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0.25, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[{ backgroundColor: C.cardBorder, borderRadius: 8 }, style, { opacity: op }]} />;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, delay = 0 }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color: string;
  delay?: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim,  { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[s.statCard, { opacity: anim, transform: [{ translateY: slide }] }]}>
      <View style={[s.statIconWrap, { backgroundColor: color + '18', borderColor: color + '35' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </Animated.View>
  );
}

// ── Quick Action ──────────────────────────────────────────────────────────────
function QuickAction({ icon, label, onPress, color, delay = 0 }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 350, delay, useNativeDriver: true }).start();
  }, []);
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={{ opacity: anim, flex: 1 }}>
      <TouchableOpacity
        style={[s.qaBtn, { borderColor: color + '30', backgroundColor: color + '0D' }]}
        onPress={onPress}
        activeOpacity={0.8}
        onPressIn={() => Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 50 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 50 }).start()}
      >
        <Animated.View style={{ transform: [{ scale }], alignItems: 'center', gap: 8 }}>
          <View style={[s.qaIcon, { backgroundColor: color + '18' }]}>
            <Ionicons name={icon} size={22} color={color} />
          </View>
          <Text style={[s.qaLabel, { color }]}>{label}</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Feature Row ───────────────────────────────────────────────────────────────
function FeatureRow({ icon, title, subtitle, badge, onPress, color, delay = 0 }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim,  { toValue: 1, duration: 380, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 380, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: slide }] }}>
      <TouchableOpacity style={s.featureRow} onPress={onPress} activeOpacity={0.8}>
        <View style={[s.featureIcon, { backgroundColor: color + '18', borderColor: color + '30' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={s.featureText}>
          <Text style={s.featureTitle}>{title}</Text>
          <Text style={s.featureSub}>{subtitle}</Text>
        </View>
        {badge && (
          <View style={[s.featureBadge, { backgroundColor: color + '18', borderColor: color + '30' }]}>
            <Text style={[s.featureBadgeTxt, { color }]}>{badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color={C.dim} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── HomeScreen ────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const [user,       setUser]       = useState<User | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const heroAnim   = useRef(new Animated.Value(0)).current;
  const heroSlide  = useRef(new Animated.Value(-20)).current;

  const loadUser = useCallback(async () => {
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      // Token invalide → retour welcome
      await logout();
      router.replace('/(auth)/welcome');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    Animated.parallel([
      Animated.timing(heroAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(heroSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUser();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const firstName = user?.firstName ?? user?.first_name ?? '';
  const photoUri  = profilePictureUrl(user?.photoProfil);

  return (
    <SafeAreaView style={s.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.purple} colors={[C.purple]} />
        }
      >

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <Animated.View style={[s.hero, { opacity: heroAnim, transform: [{ translateY: heroSlide }] }]}>
          {/* Blobs */}
          <View style={s.heroBlob1} />
          <View style={s.heroBlob2} />

          <View style={s.heroContent}>
            {/* Avatar + Greeting */}
            <View style={s.heroTop}>
              <View>
                {loading ? (
                  <>
                    <Skeleton style={{ height: 14, width: 80, marginBottom: 6 }} />
                    <Skeleton style={{ height: 28, width: 160 }} />
                  </>
                ) : (
                  <>
                    <Text style={s.heroGreeting}>{getGreeting()} 👋</Text>
                    <Text style={s.heroName}>{firstName || 'Utilisateur'}</Text>
                  </>
                )}
              </View>

              {/* Avatar */}
              <TouchableOpacity
                style={s.avatarBtn}
                onPress={() => router.push('/(tabs)/profile')}
                activeOpacity={0.8}
              >
                {loading ? (
                  <Skeleton style={{ width: 46, height: 46, borderRadius: 23 }} />
                ) : (
                  <View style={s.avatarCircle}>
                    <Text style={s.avatarInitial}>
                      {(firstName?.[0] ?? '?').toUpperCase()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Badge statut */}
            {!loading && (
              <View style={s.statusBadge}>
                <View style={s.statusDot} />
                <Text style={s.statusTxt}>Profil actif · Harrem</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* ══ STATS RAPIDES ════════════════════════════════════════════ */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Vue d'ensemble</Text>
          <View style={s.statsGrid}>
            {loading ? (
              [0,1,2,3].map(i => (
                <View key={i} style={[s.statCard, { alignItems: 'center', gap: 8 }]}>
                  <Skeleton style={{ width: 36, height: 36, borderRadius: 10 }} />
                  <Skeleton style={{ height: 18, width: 40 }} />
                  <Skeleton style={{ height: 11, width: 56 }} />
                </View>
              ))
            ) : (
              <>
                <StatCard icon="people-outline"          label="Abonnés"       value="—"    color={C.purple}  delay={100} />
                <StatCard icon="gift-outline"            label="Cadeaux"       value="—"    color={C.pink}    delay={160} />
                <StatCard icon="videocam-outline"        label="Lives"         value="—"    color="#8B5CF6"   delay={220} />
                <StatCard icon="star-outline"            label="Abonnements"   value="—"    color={C.amber}   delay={280} />
              </>
            )}
          </View>
        </View>

        {/* ══ ACTIONS RAPIDES ══════════════════════════════════════════ */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Actions rapides</Text>
          <View style={s.qaRow}>
            <QuickAction icon="heart-outline"     label="Disponible"  onPress={() => router.push('/(tabs)/explore')}      color={C.pink}    delay={100} />
            <QuickAction icon="chatbubbles-outline" label="Messages"  onPress={() => router.push('/(tabs)/messages')}     color={C.purple}  delay={160} />
            <QuickAction icon="notifications-outline" label="Notifs" onPress={() => router.push('/(tabs)/notifications')} color={C.amber}   delay={220} />
            <QuickAction icon="person-outline"    label="Profil"      onPress={() => router.push('/(tabs)/profile')}      color={C.green}   delay={280} />
          </View>
        </View>

        {/* ══ FONCTIONNALITÉS ══════════════════════════════════════════ */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Fonctionnalités</Text>
          <View style={s.featureCard}>
            <FeatureRow
              icon="heart"
              title="Utilisateurs disponibles"
              subtitle="Voir qui est dispo près de toi"
              badge="Nouveau"
              onPress={() => router.push('/(tabs)/explore')}
              color={C.pink}
              delay={100}
            />
            <View style={s.featureDivider} />
            <FeatureRow
              icon="chatbubble-ellipses-outline"
              title="Messages"
              subtitle="Tes conversations privées"
              onPress={() => router.push('/(tabs)/messages')}
              color={C.purple}
              delay={160}
            />
            <View style={s.featureDivider} />
            <FeatureRow
              icon="videocam-outline"
              title="Live streaming"
              subtitle="Lance un live ou regarde les autres"
              badge="Bientôt"
              onPress={() => {}}
              color="#8B5CF6"
              delay={220}
            />
            <View style={s.featureDivider} />
            <FeatureRow
              icon="bar-chart-outline"
              title="Statistiques"
              subtitle="Tes revenus & abonnés"
              badge="Bientôt"
              onPress={() => {}}
              color={C.green}
              delay={280}
            />
          </View>
        </View>

        {/* ══ INFO CARD ════════════════════════════════════════════════ */}
        <View style={[s.section, s.infoCard]}>
          <View style={s.infoRow}>
            <Ionicons name="sparkles" size={16} color={C.amber} />
            <Text style={s.infoTitle}>Bienvenue sur Harrem</Text>
          </View>
          <Text style={s.infoBody}>
            Connecte-toi avec des millions de membres actifs. Trouve ton compagnon de vie ou vis une aventure d'un soir.
          </Text>
          <View style={s.infoStats}>
            {[{ v: '2M+', l: 'Membres' }, { v: '150+', l: 'Pays' }, { v: '24/7', l: 'Actifs' }].map(stat => (
              <View key={stat.v} style={s.infoStatItem}>
                <Text style={s.infoStatVal}>{stat.v}</Text>
                <Text style={s.infoStatLbl}>{stat.l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ══ DÉCONNEXION ══════════════════════════════════════════════ */}
        <View style={[s.section, { alignItems: 'center', marginTop: 8 }]}>
          <TouchableOpacity
            style={s.logoutBtn}
            onPress={async () => {
              await logout();
              router.replace('/(auth)/welcome');
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={16} color={C.dim} />
            <Text style={s.logoutTxt}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const STAT_W = (W - 48 - 12) / 2;   // 2 colonnes avec gap

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Hero
  hero:        { margin: 16, borderRadius: 24, backgroundColor: 'rgba(124,58,237,0.07)', borderWidth: 1, borderColor: C.purpleBorder, overflow: 'hidden' },
  heroBlob1:   { position: 'absolute', top: -40,  right: -40, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(167,139,250,0.12)' },
  heroBlob2:   { position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(244,114,182,0.08)' },
  heroContent: { padding: 20, gap: 14 },
  heroTop:     { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroGreeting:{ color: C.muted, fontSize: 13, marginBottom: 4 },
  heroName:    { color: C.text, fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  avatarBtn:   {},
  avatarCircle:{ width: 46, height: 46, borderRadius: 23, backgroundColor: C.purpleDim, borderWidth: 2, borderColor: C.purpleBorder, alignItems: 'center', justifyContent: 'center' },
  avatarInitial:{ color: C.purple, fontSize: 20, fontWeight: '800' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: 'rgba(52,211,153,0.08)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.18)', alignSelf: 'flex-start' },
  statusDot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  statusTxt:   { color: C.green, fontSize: 11, fontWeight: '500' },

  // Section
  section:      { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: C.text, fontSize: 15, fontWeight: '800', marginBottom: 12 },

  // Stats grid — 2 colonnes
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard:  { width: STAT_W, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.cardBorder, padding: 14, alignItems: 'flex-start', gap: 8 },
  statIconWrap: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  statValue: { color: C.text, fontSize: 20, fontWeight: '800' },
  statLabel: { color: C.muted, fontSize: 11 },

  // Quick actions
  qaRow:   { flexDirection: 'row', gap: 10 },
  qaBtn:   { paddingVertical: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  qaIcon:  { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  // Feature list
  featureCard:    { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.cardBorder, overflow: 'hidden' },
  featureRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  featureIcon:    { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  featureText:    { flex: 1 },
  featureTitle:   { color: C.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  featureSub:     { color: C.muted, fontSize: 11 },
  featureBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  featureBadgeTxt:{ fontSize: 10, fontWeight: '800' },
  featureDivider: { height: 1, backgroundColor: C.cardBorder, marginLeft: 66 },

  // Info card
  infoCard:   { backgroundColor: 'rgba(251,191,36,0.05)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(251,191,36,0.15)', padding: 16, marginHorizontal: 16 },
  infoRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoTitle:  { color: C.amber, fontSize: 14, fontWeight: '700' },
  infoBody:   { color: C.muted, fontSize: 13, lineHeight: 20, marginBottom: 14 },
  infoStats:  { flexDirection: 'row' },
  infoStatItem:{ flex: 1, alignItems: 'center', paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(251,191,36,0.12)', backgroundColor: 'rgba(251,191,36,0.04)' },
  infoStatVal: { color: C.white, fontSize: 16, fontWeight: '800' },
  infoStatLbl: { color: C.dim, fontSize: 10, marginTop: 2 },

  // Logout
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: C.cardBorder },
  logoutTxt: { color: C.dim, fontSize: 13, fontWeight: '500' },
});