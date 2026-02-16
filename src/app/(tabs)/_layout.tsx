// app/(tabs)/_layout.tsx
// Barre de navigation fidèle au footer web :
// - Fond zinc-950/95 + border-t zinc-800/50
// - Barre lumineuse via-purple-500 en top
// - Bouton central + gradient purple→pink avec glow pulsé
// - Dot actif gradient purple→pink sous l'icône
// - Bottom sheet "Créer du contenu" avec 3 actions (Reel, Live, Article)

import { useState, useRef, useEffect } from 'react';
import { Tabs } from 'expo-router';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  Animated, Platform, Dimensions, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width: W } = Dimensions.get('window');

// ── Palette identique footer web ──────────────────────────────────────────────
const C = {
  bg:        '#09090B',          // zinc-950/95
  bgSheet:   'rgba(24,18,26,0.98)',
  border:    'rgba(39,39,42,0.50)', // zinc-800/50
  borderSheet:'rgba(63,63,70,0.50)',
  purple:    '#A78BFA',
  purpleBtn: '#9333EA',          // from-purple-600
  pink:      '#DB2777',          // to-pink-600
  orange:    '#FB923C',
  orangeDim: 'rgba(251,146,60,0.10)',
  orangeBdr: 'rgba(251,146,60,0.20)',
  red:       '#EF4444',
  redDim:    'rgba(239,68,68,0.10)',
  redBdr:    'rgba(239,68,68,0.20)',
  blue:      '#60A5FA',
  blueDim:   'rgba(96,165,250,0.10)',
  blueBdr:   'rgba(96,165,250,0.20)',
  white:     '#FFFFFF',
  muted:     '#A1A1AA',          // zinc-400
  dim:       '#52525B',          // zinc-600
  zinc800:   '#27272A',
};

// ── Barre lumineuse top (via-purple-500) ──────────────────────────────────────
function GlowBar() {
  return (
    <View style={ss.glowBarWrap} pointerEvents="none">
      <View style={ss.glowBarLeft} />
      <View style={ss.glowBarCenter} />
      <View style={ss.glowBarRight} />
    </View>
  );
}

// ── Icône de tab animée ───────────────────────────────────────────────────────
function TabIcon({
  name, focused, color, label, badge,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
  label: string;
  badge?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.12 : 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 8,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={[ss.tabItem, { transform: [{ scale }] }]}>
      <View style={ss.iconWrap}>
        <Ionicons name={name} size={24} color={color} />

        {/* Dot actif — w-1.5 h-1.5 bg-gradient purple→pink identique web */}
        {focused && <View style={ss.activeDot} />}

        {/* Badge rouge */}
        {!!badge && (
          <View style={ss.badge}>
            <Text style={ss.badgeTxt}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        )}
      </View>
      <Text style={[ss.tabLabel, { color }]}>{label}</Text>
    </Animated.View>
  );
}

// ── Bottom sheet "Créer du contenu" ──────────────────────────────────────────
function CreateSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const slide = useRef(new Animated.Value(500)).current;
  const fade  = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade,  { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slide, { toValue: 0, useNativeDriver: true, tension: 280, friction: 28 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade,  { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 500, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const actions = [
    {
      icon:   'flame'          as const,
      label:  'Créer un Reel',
      sub:    'Vidéo courte et virale',
      color:  C.orange,
      bg:     C.orangeDim,
      border: C.orangeBdr,
    },
    {
      icon:   'radio'          as const,
      label:  'Démarrer un Live',
      sub:    'Diffusion en direct',
      color:  C.red,
      bg:     C.redDim,
      border: C.redBdr,
      live:   true,
    },
    {
      icon:   'bag-handle'     as const,
      label:  'Créer un Article',
      sub:    'Produit ou service',
      color:  C.blue,
      bg:     C.blueDim,
      border: C.blueBdr,
    },
  ];

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      {/* Overlay — bg-black/70 backdrop-blur identique web */}
      <Animated.View style={[ss.overlay, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet — from-zinc-900/98 to-zinc-800/98 rounded-t-3xl border-t zinc-700/50 */}
      <Animated.View
        style={[ss.sheet, {
          transform: [{ translateY: slide }],
          paddingBottom: insets.bottom + 12,
        }]}
      >
        {/* Handle */}
        <View style={ss.handle} />

        {/* Header — gradient purple→pink text identique web */}
        <View style={ss.sheetHead}>
          <Text style={ss.sheetTitle}>Créer du contenu</Text>
        </View>

        {/* Actions */}
        <View style={ss.actions}>
          {actions.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[ss.actionRow, { backgroundColor: a.bg, borderColor: a.border }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              {/* Icône — w-14 h-14 rounded-xl bg-gradient identique web */}
              <View style={[ss.actionIcon, { backgroundColor: a.bg }]}>
                <Ionicons name={a.icon} size={24} color={a.color} />
                {/* Ping live */}
                {a.live && <View style={ss.livePing} />}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={ss.actionLabel}>{a.label}</Text>
                <Text style={ss.actionSub}>{a.sub}</Text>
              </View>

              {/* Dot hover identique web */}
              <View style={[ss.actionDot, { backgroundColor: a.color }]} />
            </TouchableOpacity>
          ))}

          {/* Annuler */}
          <TouchableOpacity style={ss.cancelBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={ss.cancelTxt}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

// ── Tab bar custom ────────────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets   = useSafeAreaInsets();
  const [menu, setMenu] = useState(false);
  const tabH = Platform.OS === 'ios' ? 58 : 56;

  // Config des onglets — index/explore restent sur leurs pages existantes
  const tabMeta: Record<string, {
    outline: keyof typeof Ionicons.glyphMap;
    filled:  keyof typeof Ionicons.glyphMap;
    label:   string;
    badge?:  number;
  }> = {
    index:         { outline: 'home-outline',          filled: 'home',          label: 'Dashboard' },
    explore:       { outline: 'compass-outline',       filled: 'compass',       label: 'Découvrir'  },
    messages:      { outline: 'chatbubbles-outline',   filled: 'chatbubbles',   label: 'Chat',  badge: 3 },
    notifications: { outline: 'notifications-outline', filled: 'notifications', label: 'Notifs' },
    profile:       { outline: 'person-outline',        filled: 'person',        label: 'Profil' },
  };

  const midIndex = Math.floor(state.routes.length / 2); // onglet central = messages

  return (
    <>
      <CreateSheet visible={menu} onClose={() => setMenu(false)} />

      <View style={[ss.bar, { paddingBottom: insets.bottom, height: tabH + insets.bottom }]}>
        {/* Barre lumineuse via-purple-500 identique web */}
        <GlowBar />

        <View style={ss.row}>
          {state.routes.map((route: any, i: number) => {
            const focused = state.index === i;
            const color   = focused ? C.purple : C.muted;
            const meta    = tabMeta[route.name] ?? {
              outline: 'ellipse-outline', filled: 'ellipse', label: route.name,
            };

            // ── Bouton central "+" (à la place de l'onglet central)
            if (i === midIndex) {
              return (
                <View key="plus" style={ss.plusOuter}>
                  {/* Glow pulsé — animate-pulse identique web */}
                  <View style={ss.plusGlow} />
                  <TouchableOpacity
                    style={ss.plusBtn}
                    onPress={() => setMenu(true)}
                    activeOpacity={0.88}
                  >
                    <Ionicons name="add" size={30} color={C.white} />
                  </TouchableOpacity>
                </View>
              );
            }

            return (
              <TouchableOpacity
                key={route.key}
                style={ss.tabTouch}
                onPress={() => {
                  const ev = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                  if (!focused && !ev.defaultPrevented) navigation.navigate(route.name);
                }}
                activeOpacity={0.75}
              >
                <TabIcon
                  name={focused ? meta.filled : meta.outline}
                  focused={focused}
                  color={color}
                  label={meta.label}
                  badge={meta.badge}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </>
  );
}

// ── Layout principal ──────────────────────────────────────────────────────────
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {/* index  → Dashboard   (page existante) */}
      <Tabs.Screen name="index"         options={{ title: 'Dashboard' }} />
      {/* explore → Utilisateurs disponibles (page existante) */}
      <Tabs.Screen name="explore"       options={{ title: 'Découvrir'  }} />
      <Tabs.Screen name="messages"      options={{ title: 'Chat'       }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notifs'     }} />
      <Tabs.Screen name="profile"       options={{ title: 'Profil'     }} />
    </Tabs>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const ss = StyleSheet.create({

  // ── Barre principale — zinc-950/95 backdrop border-t zinc-800/50
  bar: {
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 6,
    paddingTop: 8,
  },

  // ── Barre lumineuse top — from-transparent via-purple-500 to-transparent
  glowBarWrap:   { position: 'absolute', top: 0, left: 0, right: 0, height: 1, flexDirection: 'row' },
  glowBarLeft:   { flex: 1, backgroundColor: 'transparent' },
  glowBarCenter: { width: 120, height: 1, backgroundColor: 'rgba(168,139,250,0.55)' },
  glowBarRight:  { flex: 1, backgroundColor: 'transparent' },

  // ── Tab normale
  tabTouch: { flex: 1, alignItems: 'center', paddingBottom: 4 },
  tabItem:  { alignItems: 'center', gap: 4 },
  iconWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 9, fontWeight: '600' },

  // Dot actif — w-1.5 h-1.5 bg-gradient purple→pink identique web
  activeDot: {
    position: 'absolute',
    bottom: -6,
    width: 6, height: 6, borderRadius: 3,
    // Dégradé simulé par la couleur médiane
    backgroundColor: '#C084FC',
  },

  // Badge
  badge:    { position: 'absolute', top: -4, right: -9, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: C.red, borderWidth: 1.5, borderColor: C.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  badgeTxt: { color: C.white, fontSize: 8, fontWeight: '800' },

  // ── Bouton central "+" — w-16 h-16 gradient purple→pink border-4 border-zinc-950
  plusOuter: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
    // Le bouton déborde vers le haut (-mt-6 identique web)
    marginTop: -24,
  },
  plusGlow: {
    position: 'absolute',
    width: 66, height: 66, borderRadius: 33,
    backgroundColor: 'rgba(147,51,234,0.50)',
    top: -2,
  },
  plusBtn: {
    width: 62, height: 62, borderRadius: 31,
    backgroundColor: C.purpleBtn,   // from-purple-600
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: C.bg,
    shadowColor: C.purpleBtn,
    shadowOpacity: 0.65,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },

  // ── Overlay
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.70)' },

  // ── Sheet — from-zinc-900/98 to-zinc-800/98 rounded-t-3xl border-t zinc-700/50
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.bgSheet,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderColor: C.borderSheet,
  },
  handle:    { width: 48, height: 5, borderRadius: 3, backgroundColor: C.dim, alignSelf: 'center', marginTop: 14, marginBottom: 6 },
  sheetHead: { paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.borderSheet },

  // Titre — bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text identique web
  sheetTitle: {
    fontSize: 18, fontWeight: '800', textAlign: 'center',
    color: C.purple,           // approximation du gradient text
  },

  actions: { padding: 16, gap: 10 },

  // Action row — flex items-center gap-4 p-4 rounded-xl border identique web
  actionRow:  { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, borderWidth: 1 },
  actionIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  livePing:   { position: 'absolute', top: -3, right: -3, width: 10, height: 10, borderRadius: 5, backgroundColor: C.red },
  actionLabel:{ color: C.white, fontSize: 15, fontWeight: '700' },
  actionSub:  { color: C.muted,  fontSize: 12, marginTop: 2 },
  actionDot:  { width: 8, height: 8, borderRadius: 4, opacity: 0.65 },

  // Cancel — bg-zinc-800 rounded-xl identique web
  cancelBtn: { backgroundColor: C.zinc800, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  cancelTxt: { color: C.white, fontSize: 14, fontWeight: '600' },
});