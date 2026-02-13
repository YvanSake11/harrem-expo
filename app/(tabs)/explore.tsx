// app/(tabs)/explore.tsx
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl, Dimensions,
  Animated, Pressable, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAvailableUsers } from '../../src/hooks/Useavailableusers';
import { profilePictureUrl, formatRemainingTime, formatDate, formatTime } from '../utils';
import type { AvailableUserData, AvailabilityHistoryItem } from '../../src/types/api.types';

const { width: W } = Dimensions.get('window');
const CARD_W = (W - 48) / 2;

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:           '#0A0812',
  surface:      '#120F1C',
  card:         '#18132A',
  cardBorder:   '#2C2245',
  purple:       '#A78BFA',
  purpleDark:   '#7C3AED',
  purpleDim:    'rgba(167,139,250,0.10)',
  purpleBorder: 'rgba(167,139,250,0.22)',
  pink:         '#F472B6',
  pinkDim:      'rgba(244,114,182,0.10)',
  pinkBorder:   'rgba(244,114,182,0.22)',
  green:        '#34D399',
  greenDim:     'rgba(52,211,153,0.10)',
  greenBorder:  'rgba(52,211,153,0.20)',
  amber:        '#FBBF24',
  text:         '#EDE9FE',
  muted:        '#7C6FAE',
  dim:          '#4A4165',
  white:        '#FFFFFF',
};

// ── Animated Press ─────────────────────────────────────────────────────────────
function ScalePress({ children, onPress, style, disabled }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPressIn={() => !disabled && Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 40 }).start()}
      onPressOut={() => !disabled && Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 40 }).start()}
      onPress={disabled ? undefined : onPress}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </Pressable>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ style }: { style?: any }) {
  const op = useRef(new Animated.Value(0.3)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(op, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[{ backgroundColor: C.cardBorder, borderRadius: 8 }, style, { opacity: op }]} />;
}

function UserCardSkeleton() {
  return (
    <View style={[s.card, { width: CARD_W }]}>
      <Skeleton style={{ height: 130, borderRadius: 14 }} />
      <View style={{ padding: 10, gap: 8 }}>
        <Skeleton style={{ height: 13, width: '70%' }} />
        <Skeleton style={{ height: 10, width: '45%' }} />
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Skeleton style={{ height: 20, width: 50, borderRadius: 6 }} />
          <Skeleton style={{ height: 20, width: 44, borderRadius: 6 }} />
        </View>
        <Skeleton style={{ height: 32, borderRadius: 10 }} />
      </View>
    </View>
  );
}

// ── User Card ─────────────────────────────────────────────────────────────────
function UserCard({ userData, onProfile, onChat }: {
  userData: AvailableUserData;
  onProfile: (id: number) => void;
  onChat:    (u: AvailableUserData) => void;
}) {
  const photoUri = profilePictureUrl(userData.user.photoProfil);
  const initials = `${userData.user.firstName?.[0] ?? ''}${userData.user.lastName?.[0] ?? ''}`.toUpperCase();
  const [imgError, setImgError] = useState(false);

  return (
    <ScalePress onPress={() => onProfile(userData.user.id)} style={[s.card, { width: CARD_W }]}>
      {/* Photo zone */}
      <View style={s.photoWrap}>
        {photoUri && !imgError ? (
          <Image
            source={{ uri: photoUri }}
            style={s.photo}
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={s.photoFallback}>
            <Text style={s.initials}>{initials}</Text>
          </View>
        )}

        {/* Gradient overlay */}
        <View style={s.photoGrad} />

        {/* Online pulse */}
        <View style={s.onlineWrap}>
          <View style={s.onlinePulse} />
          <View style={s.onlineDot} />
        </View>

        {/* Time badge */}
        <View style={s.timeBadge}>
          <Ionicons name="time-outline" size={10} color={C.purple} />
          <Text style={s.timeBadgeText}>{formatRemainingTime(userData.remainingSeconds)}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={s.cardBody}>
        <Text style={s.cardName} numberOfLines={1}>
          {userData.user.firstName} {userData.user.lastName}
        </Text>
        {userData.user.pseudo ? (
          <Text style={s.cardPseudo} numberOfLines={1}>@{userData.user.pseudo}</Text>
        ) : null}

        {/* Badges */}
        <View style={s.badges}>
          <View style={s.badgeGreen}>
            <Ionicons name="shield-checkmark" size={9} color={C.green} />
            <Text style={[s.badgeText, { color: C.green }]}>Vérifié</Text>
          </View>
          <View style={s.badgeAmber}>
            <Ionicons name="star" size={9} color={C.amber} />
            <Text style={[s.badgeText, { color: C.amber }]}>4.8</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={s.cardActions}>
          <TouchableOpacity
            style={s.btnView}
            onPress={() => onProfile(userData.user.id)}
            activeOpacity={0.8}
          >
            <Text style={s.btnViewText}>Voir profil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.btnChat}
            onPress={() => onChat(userData)}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-ellipses" size={14} color={C.pink} />
          </TouchableOpacity>
        </View>
      </View>
    </ScalePress>
  );
}

// ── History Row ───────────────────────────────────────────────────────────────
function HistoryRow({ item }: { item: AvailabilityHistoryItem }) {
  const expired  = new Date(item.expiresAt) < new Date();
  const duration = Math.round(
    (new Date(item.expiresAt).getTime() - new Date(item.startedAt).getTime()) / 3_600_000
  );
  return (
    <View style={[s.historyRow, expired ? s.historyRowExpired : s.historyRowActive]}>
      <View style={[s.historyIcon, expired ? s.historyIconExp : s.historyIconAct]}>
        <Ionicons name="calendar-outline" size={16} color={expired ? C.dim : C.green} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.historyDate}>{formatDate(item.startedAt)}</Text>
        <Text style={s.historyTime}>
          {formatTime(item.startedAt)} → {formatTime(item.expiresAt)}
          {'  '}
          <Text style={{ color: C.dim }}>({duration}h)</Text>
        </Text>
      </View>
      <View style={[s.historyBadge, expired ? s.historyBadgeExp : s.historyBadgeAct]}>
        <Text style={[s.historyBadgeText, { color: expired ? C.dim : C.green }]}>
          {expired ? 'Terminé' : 'Actif'}
        </Text>
      </View>
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ExploreScreen() {
  const router = useRouter();
  const [showFilters,  setShowFilters]  = useState(false);
  const [showHistory,  setShowHistory]  = useState(false);
  const [refreshing,   setRefreshing]   = useState(false);

  const {
    isAvailable, expiresAt, remainingSeconds,
    availableUsers, history, cities,
    selectedCity, setSelectedCity,
    page, totalPages, totalItems,
    loading, loadingUsers, loadingStatus, loadingHistory, toggling,
    error, setError, successMessage,
    handleToggleAvailability, loadAvailableUsers, loadHistory,
  } = useAvailableUsers();

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAvailableUsers(1);
    setRefreshing(false);
  };

  const goProfile = (id: number) => router.push(`/user/${id}` as any);
  const goChat    = (u: AvailableUserData) =>
    router.push(`/chat?userId=${u.user.id}&userName=${u.user.firstName}` as any);

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.center}>
          <ActivityIndicator color={C.purple} size="large" />
          <Text style={s.loadingTxt}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Profil incomplet ───────────────────────────────────────────────────────
  if (error === 'incompleteProfile') {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.center}>
          <View style={s.alertBox}>
            <Ionicons name="alert-circle" size={40} color={C.amber} />
          </View>
          <Text style={s.alertTitle}>Profil Incomplet</Text>
          <Text style={s.alertSub}>
            Complétez votre profil avec votre pays et ville pour accéder à cette fonctionnalité.
          </Text>
          <ScalePress
            onPress={() => router.push('/profile' as any)}
            style={s.alertBtn}
          >
            <Text style={s.alertBtnTxt}>Compléter mon profil</Text>
            <Ionicons name="arrow-forward" size={16} color={C.white} />
          </ScalePress>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.purple}
            colors={[C.purple]}
          />
        }
      >

        {/* ══ HERO HEADER ══════════════════════════════════════════════════ */}
        <View style={s.hero}>
          {/* Glow blobs */}
          <View style={s.blob1} />
          <View style={s.blob2} />

          {/* Top row */}
          <View style={s.heroTop}>
            <View style={s.heroBadge}>
              <Ionicons name="heart" size={12} color={C.pink} />
              <Text style={s.heroBadgeTxt}>Rencontres</Text>
            </View>
            <View style={s.heroMeta}>
              <Ionicons name="people-outline" size={12} color={C.purple} />
              <Text style={s.heroMetaTxt}>{totalItems} dispo.</Text>
              <View style={s.sep} />
              <Ionicons name="location-outline" size={12} color={C.pink} />
              <Text style={s.heroMetaTxt} numberOfLines={1}>{selectedCity?.name ?? '…'}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={s.heroTitle}>Disponibles</Text>
          <Text style={s.heroSub}>
            Membres disponibles pour une rencontre{' '}
            <Text style={{ color: C.text, fontWeight: '700' }}>dans les 24h</Text>
          </Text>

          {/* Toggle button */}
          <ScalePress
            onPress={handleToggleAvailability}
            disabled={toggling || loadingStatus}
            style={[s.toggleBtn, isAvailable ? s.toggleActive : s.toggleInactive]}
          >
            <View style={s.toggleInner}>
              {toggling || loadingStatus ? (
                <>
                  <ActivityIndicator size="small" color={isAvailable ? C.white : C.purple} />
                  <Text style={[s.toggleTxt, !isAvailable && { color: C.purple }]}>
                    {loadingStatus ? 'Chargement…' : 'Mise à jour…'}
                  </Text>
                </>
              ) : isAvailable ? (
                <>
                  <Ionicons name="flame" size={17} color={C.white} />
                  <Text style={s.toggleTxt} numberOfLines={1}>
                    Disponible{remainingSeconds > 0 ? ` (${formatRemainingTime(remainingSeconds)})` : ''}
                  </Text>
                  <View style={s.pulseDot} />
                </>
              ) : (
                <>
                  <Ionicons name="time-outline" size={17} color={C.purple} />
                  <Text style={[s.toggleTxt, { color: C.purple }]} numberOfLines={1}>
                    Me rendre disponible
                  </Text>
                </>
              )}
            </View>
          </ScalePress>

          {/* Status bar */}
          {isAvailable && expiresAt && (
            <View style={s.statusBar}>
              <View style={s.statusDot} />
              <Text style={s.statusTxt}>
                Vous êtes disponible · {formatRemainingTime(remainingSeconds)} restant
              </Text>
            </View>
          )}
        </View>

        {/* ══ TOASTS ═══════════════════════════════════════════════════════ */}
        {successMessage && (
          <View style={s.toastOk}>
            <View style={s.toastDot} />
            <Text style={s.toastOkTxt}>{successMessage}</Text>
          </View>
        )}
        {error && !['incompleteProfile', 'initError'].includes(error) && (
          <View style={s.toastErr}>
            <Ionicons name="alert-circle-outline" size={15} color="#F87171" />
            <Text style={s.toastErrTxt}>Une erreur s'est produite</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <Ionicons name="close" size={15} color="#F87171" />
            </TouchableOpacity>
          </View>
        )}

        {/* ══ FILTRES ══════════════════════════════════════════════════════ */}
        <View style={s.section}>
          <TouchableOpacity
            style={s.filterBtn}
            onPress={() => setShowFilters(!showFilters)}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={15} color={C.text} />
            <Text style={s.filterTxt}>Filtrer par ville</Text>
            <Ionicons
              name={showFilters ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={C.muted}
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>

          {showFilters && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 10 }}
              contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
            >
              {cities.map((city) => (
                <TouchableOpacity
                  key={city.id}
                  style={[s.cityChip, selectedCity?.id === city.id && s.cityChipActive]}
                  onPress={() => setSelectedCity(city)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.cityChipTxt, selectedCity?.id === city.id && s.cityChipTxtActive]}>
                    {city.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ══ GRILLE UTILISATEURS ══════════════════════════════════════════ */}
        <View style={s.section}>
          {/* Section label */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              {totalItems} membre{totalItems !== 1 ? 's' : ''} disponible{totalItems !== 1 ? 's' : ''}
            </Text>
            {loadingUsers && <ActivityIndicator size="small" color={C.purple} />}
          </View>

          {loadingUsers && availableUsers.length === 0 ? (
            /* Skeleton grid */
            <View style={s.grid}>
              {[0, 1, 2, 3].map((i) => <UserCardSkeleton key={i} />)}
            </View>
          ) : availableUsers.length === 0 ? (
            /* Empty */
            <View style={s.empty}>
              <View style={s.emptyIcon}>
                <Ionicons name="heart-outline" size={40} color={C.dim} />
              </View>
              <Text style={s.emptyTitle}>Aucun utilisateur disponible</Text>
              <Text style={s.emptySub}>Soyez le premier à vous rendre disponible !</Text>
            </View>
          ) : (
            <>
              <View style={s.grid}>
                {availableUsers.map((u) => (
                  <UserCard key={u.user.id} userData={u} onProfile={goProfile} onChat={goChat} />
                ))}
              </View>

              {/* Pagination */}
              {totalPages > 1 && (
                <View style={s.pagination}>
                  <TouchableOpacity
                    style={[s.pageBtn, page === 1 && s.pageBtnOff]}
                    disabled={page === 1}
                    onPress={() => loadAvailableUsers(page - 1)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="chevron-back" size={16} color={page === 1 ? C.dim : C.text} />
                  </TouchableOpacity>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[s.pageNum, page === p && s.pageNumActive]}
                      onPress={() => loadAvailableUsers(p)}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.pageNumTxt, page === p && s.pageNumTxtActive]}>{p}</Text>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    style={[s.pageBtn, page === totalPages && s.pageBtnOff]}
                    disabled={page === totalPages}
                    onPress={() => loadAvailableUsers(page + 1)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="chevron-forward" size={16} color={page === totalPages ? C.dim : C.text} />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>

        {/* ══ HISTORIQUE ═══════════════════════════════════════════════════ */}
        <View style={[s.section, s.historyCard]}>
          {/* Header */}
          <TouchableOpacity
            style={s.historyHead}
            onPress={() => setShowHistory(!showHistory)}
            activeOpacity={0.8}
          >
            <View style={s.historyHeadLeft}>
              <View style={s.historyIconBg}>
                <Ionicons name="time" size={17} color={C.purple} />
              </View>
              <View>
                <Text style={s.sectionTitle}>Historique</Text>
                <Text style={s.historyCount}>
                  {history.length} inscription{history.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity
                style={s.refreshBtn}
                onPress={loadHistory}
                disabled={loadingHistory}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="refresh"
                  size={13}
                  color={C.purple}
                  style={loadingHistory ? { opacity: 0.4 } : undefined}
                />
              </TouchableOpacity>
              <Ionicons
                name={showHistory ? 'chevron-up' : 'chevron-down'}
                size={15}
                color={C.muted}
              />
            </View>
          </TouchableOpacity>

          {/* Content */}
          {showHistory && (
            <View style={{ marginTop: 14, gap: 8 }}>
              {loadingHistory ? (
                [0, 1, 2].map((i) => (
                  <View key={i} style={[s.historyRow, s.historyRowExpired, { gap: 10 }]}>
                    <Skeleton style={{ width: 36, height: 36, borderRadius: 10 }} />
                    <View style={{ flex: 1, gap: 6 }}>
                      <Skeleton style={{ height: 13, width: '50%' }} />
                      <Skeleton style={{ height: 10, width: '70%' }} />
                    </View>
                  </View>
                ))
              ) : history.length === 0 ? (
                <View style={[s.empty, { paddingVertical: 24 }]}>
                  <Ionicons name="calendar-outline" size={32} color={C.dim} />
                  <Text style={s.emptySub}>Aucun historique pour le moment</Text>
                </View>
              ) : (
                history.slice(0, 10).map((item, i) => <HistoryRow key={i} item={item} />)
              )}
            </View>
          )}
        </View>

        {/* ══ HOW IT WORKS ═════════════════════════════════════════════════ */}
        <View style={[s.section, s.howCard]}>
          <View style={s.sectionHeader}>
            <Ionicons name="sparkles" size={14} color={C.pink} />
            <Text style={[s.sectionTitle, { marginBottom: 0 }]}>Comment ça marche ?</Text>
          </View>
          {[
            { n: '1', t: 'Activez votre disponibilité' },
            { n: '2', t: 'Vous apparaissez pendant 24h' },
            { n: '3', t: 'Les autres peuvent vous contacter' },
          ].map((step) => (
            <View key={step.n} style={s.howStep}>
              <Text style={s.howNum}>{step.n}.</Text>
              <Text style={s.howTxt}>{step.t}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: C.bg },
  center:{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },

  loadingTxt: { color: C.muted, fontSize: 14, marginTop: 8 },

  // Alert / incomplete profile
  alertBox:   { width: 80, height: 80, borderRadius: 20, backgroundColor: 'rgba(251,191,36,0.1)', borderWidth: 1, borderColor: 'rgba(251,191,36,0.2)', alignItems: 'center', justifyContent: 'center' },
  alertTitle: { fontSize: 22, fontWeight: '800', color: C.text, textAlign: 'center' },
  alertSub:   { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 22 },
  alertBtn:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.purpleDark, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, marginTop: 8 },
  alertBtnTxt:{ color: C.white, fontWeight: '700', fontSize: 15 },

  // Hero
  hero:       { margin: 16, padding: 20, borderRadius: 26, backgroundColor: 'rgba(124,58,237,0.07)', borderWidth: 1, borderColor: C.purpleBorder, overflow: 'hidden', gap: 14 },
  blob1:      { position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(167,139,250,0.12)' },
  blob2:      { position: 'absolute', bottom: -40, left: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(244,114,182,0.09)' },
  heroTop:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroBadge:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: C.pinkDim, borderWidth: 1, borderColor: C.pinkBorder },
  heroBadgeTxt:{ color: C.pink, fontSize: 11, fontWeight: '700' },
  heroMeta:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroMetaTxt:{ color: C.muted, fontSize: 11 },
  sep:        { width: 3, height: 3, borderRadius: 2, backgroundColor: C.dim, marginHorizontal: 2 },
  heroTitle:  { fontSize: 34, fontWeight: '900', color: C.text, letterSpacing: -1 },
  heroSub:    { fontSize: 13, color: C.muted, lineHeight: 20, marginTop: -6 },

  // Toggle
toggleBtn: {
  paddingHorizontal: 18,
  paddingVertical: 13,
  borderRadius: 16,
  alignSelf: 'flex-start',
  maxWidth: '100%',
},
toggleActive:  { backgroundColor: '#10B981' },
  toggleInactive:{ backgroundColor: C.purpleDim, borderWidth: 1, borderColor: C.purpleBorder },
  toggleTxt:  { color: C.white, fontWeight: '700', fontSize: 14 },
  pulseDot:   { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.8)' },

  // Status
  statusBar:  { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: C.greenDim, borderWidth: 1, borderColor: C.greenBorder },
  statusDot:  { width: 7, height: 7, borderRadius: 4, backgroundColor: C.green },
  statusTxt:  { color: C.green, fontSize: 12, fontWeight: '500' },

  // Toasts
  toastOk:    { marginHorizontal: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, backgroundColor: C.greenDim, borderWidth: 1, borderColor: C.greenBorder },
  toastDot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  toastOkTxt: { color: C.green, fontSize: 13, fontWeight: '500', flex: 1 },
  toastErr:   { marginHorizontal: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, backgroundColor: 'rgba(248,113,113,0.1)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)' },
  toastErrTxt:{ color: '#F87171', fontSize: 13, flex: 1 },

  // Section
  section:       { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle:  { color: C.text, fontSize: 15, fontWeight: '800' },

  // Filter
  filterBtn:  { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.cardBorder },
  filterTxt:  { color: C.text, fontSize: 13, fontWeight: '600' },
  cityChip:   { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder },
  cityChipActive: { backgroundColor: C.purple, borderColor: C.purple },
  cityChipTxt:    { color: C.muted, fontSize: 13, fontWeight: '500' },
  cityChipTxtActive: { color: C.white },

  // Grid
  grid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  // Card
  card:       { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.cardBorder, overflow: 'hidden' },
  photoWrap:  { height: 130, position: 'relative' },
  photo:      { width: '100%', height: '100%', resizeMode: 'cover' },
  photoFallback: { width: '100%', height: '100%', backgroundColor: C.purpleDim, alignItems: 'center', justifyContent: 'center' },
  initials:   { fontSize: 26, fontWeight: '800', color: C.purple },
  photoGrad:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,8,18,0.25)' },
  onlineWrap: { position: 'absolute', top: 8, right: 8, width: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
  onlinePulse:{ position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(52,211,153,0.4)' },
  onlineDot:  { width: 9, height: 9, borderRadius: 5, backgroundColor: C.green, borderWidth: 2, borderColor: C.card },
  timeBadge:  { position: 'absolute', bottom: 7, left: 8, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(10,8,18,0.8)' },
  timeBadgeText: { color: C.purple, fontSize: 9, fontWeight: '700' },
  cardBody:   { padding: 10, gap: 5 },
  cardName:   { color: C.text, fontSize: 13, fontWeight: '800' },
  cardPseudo: { color: C.purple, fontSize: 10, marginTop: -2 },
  badges:     { flexDirection: 'row', gap: 5, marginTop: 2 },
  badgeGreen: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: C.greenDim, borderWidth: 1, borderColor: C.greenBorder },
  badgeAmber: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: 'rgba(251,191,36,0.1)', borderWidth: 1, borderColor: 'rgba(251,191,36,0.2)' },
  badgeText:  { fontSize: 9, fontWeight: '700' },
  cardActions:{ flexDirection: 'row', gap: 6, marginTop: 4 },
  btnView:    { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', backgroundColor: C.purpleDim, borderWidth: 1, borderColor: C.purpleBorder },
  btnViewText:{ color: C.purple, fontSize: 11, fontWeight: '700' },
  btnChat:    { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: C.pinkDim, borderWidth: 1, borderColor: C.pinkBorder },

  // Empty
  empty:      { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyIcon:  { width: 72, height: 72, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.cardBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { color: C.muted, fontSize: 15, fontWeight: '700' },
  emptySub:   { color: C.dim, fontSize: 13, textAlign: 'center' },

  // Pagination
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 },
  pageBtn:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder },
  pageBtnOff: { opacity: 0.35 },
  pageNum:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder },
  pageNumActive:   { backgroundColor: C.purple, borderColor: C.purple },
  pageNumTxt:      { color: C.muted, fontSize: 13, fontWeight: '600' },
  pageNumTxtActive:{ color: C.white, fontWeight: '800' },

  // History card
  historyCard:    { marginHorizontal: 16, padding: 16, borderRadius: 22, backgroundColor: C.surface, borderWidth: 1, borderColor: C.cardBorder },
  historyHead:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  historyHeadLeft:{ flexDirection: 'row', alignItems: 'center', gap: 10 },
  historyIconBg:  { width: 36, height: 36, borderRadius: 10, backgroundColor: C.purpleDim, borderWidth: 1, borderColor: C.purpleBorder, alignItems: 'center', justifyContent: 'center' },
  historyCount:   { color: C.muted, fontSize: 11, marginTop: 1 },
  refreshBtn:     { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: C.purpleDim, borderWidth: 1, borderColor: C.purpleBorder },
  historyRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  historyRowExpired:{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: C.cardBorder },
  historyRowActive: { backgroundColor: 'rgba(52,211,153,0.04)', borderColor: C.greenBorder },
  historyIcon:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  historyIconExp: { backgroundColor: 'rgba(255,255,255,0.03)' },
  historyIconAct: { backgroundColor: C.greenDim },
  historyDate:    { color: C.text, fontSize: 13, fontWeight: '700' },
  historyTime:    { color: C.muted, fontSize: 11, marginTop: 2 },
  historyBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  historyBadgeExp:{ borderColor: C.cardBorder },
  historyBadgeAct:{ backgroundColor: C.greenDim, borderColor: C.greenBorder },
  historyBadgeText:{ fontSize: 10, fontWeight: '800' },

  // How it works
  howCard:  { marginHorizontal: 16, padding: 16, borderRadius: 22, backgroundColor: 'rgba(124,58,237,0.06)', borderWidth: 1, borderColor: C.purpleBorder },
  howStep:  { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  howNum:   { color: C.purple, fontWeight: '800', fontSize: 14, width: 20 },
  howTxt:   { color: C.muted, fontSize: 13 },
  toggleInner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    flexShrink: 1,
  },
});