// app/(auth)/register.tsx
import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView,
  Animated, ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { register, getCountries } from '../api/apiClient';
import type { Country, City } from '../../app/api/apiClient';

const { height: H } = Dimensions.get('window');

// ── Palette — IDENTIQUE login.tsx ─────────────────────────────────────────────
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
  green:        '#34D399',
  greenDim:     'rgba(52,211,153,0.10)',
  greenBorder:  'rgba(52,211,153,0.25)',
  blue:         '#60A5FA',
  blueDim:      'rgba(96,165,250,0.10)',
  blueBorder:   'rgba(96,165,250,0.20)',
  red:          '#F87171',
  redBg:        'rgba(239,68,68,0.10)',
  redBorder:    'rgba(239,68,68,0.20)',
  text:         '#FFFFFF',
  muted:        '#A1A1AA',
  dim:          '#52525B',
};

// ── Composant Input animé (partagé avec login) ────────────────────────────────
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

// ── Select Row ────────────────────────────────────────────────────────────────
function SelectRow({
  icon, label, value, options, onSelect, disabled = false, delay = 0,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  options: { id: number | string; label: string }[];
  onSelect: (id: number | string) => void;
  disabled?: boolean;
  delay?: number;
}) {
  const [open, setOpen] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const entryAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(10)).current;
  const dropAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 380, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 380, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const toggleOpen = () => {
    if (disabled) return;
    const next = !open;
    setOpen(next);
    Animated.timing(borderAnim, { toValue: next ? 1 : 0, duration: 180, useNativeDriver: false }).start();
    Animated.timing(dropAnim,   { toValue: next ? 1 : 0, duration: 220, useNativeDriver: true  }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.inputBorder, C.purpleFocus],
  });

  const dropScale = dropAnim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] });

  const selectedLabel = options.find(o => String(o.id) === String(value))?.label;

  return (
    <Animated.View style={{ opacity: entryAnim, transform: [{ translateY: slideAnim }] }}>
      {/* Trigger */}
      <Animated.View style={[s.inputWrap, { borderColor }, open && { borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }]}>
        <Ionicons name={icon} size={18} color={open ? C.purple : C.dim} style={s.inputIcon} />
        <TouchableOpacity style={s.selectTrigger} onPress={toggleOpen} activeOpacity={0.8} disabled={disabled}>
          <Text style={[s.selectTxt, !selectedLabel && { color: C.dim }]}>
            {disabled && !selectedLabel ? 'Chargement...' : (selectedLabel ?? label)}
          </Text>
        </TouchableOpacity>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={15}
          color={C.dim}
          onPress={toggleOpen}
        />
      </Animated.View>

      {/* Dropdown */}
      {open && (
        <Animated.View style={[s.dropdown, { opacity: dropAnim, transform: [{ scaleY: dropScale }] }]}>
          <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {options.map((opt, i) => (
              <TouchableOpacity
                key={String(opt.id)}
                style={[s.dropItem, String(value) === String(opt.id) && s.dropItemActive, i < options.length - 1 && s.dropItemBorder]}
                onPress={() => { onSelect(opt.id); setOpen(false); Animated.timing(borderAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start(); }}
                activeOpacity={0.8}
              >
                <Text style={[s.dropItemTxt, String(value) === String(opt.id) && { color: C.purple, fontWeight: '700' }]}>
                  {opt.label}
                </Text>
                {String(value) === String(opt.id) && (
                  <Ionicons name="checkmark" size={15} color={C.purple} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ── Écran Confirmation Email ──────────────────────────────────────────────────
function ConfirmationScreen({ email, onBack, onLogin }: {
  email: string;
  onBack: () => void;
  onLogin: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[s.card, { opacity: fadeAnim }]}>
      {/* X fermer */}
      <TouchableOpacity style={s.closeBtn} onPress={onBack} activeOpacity={0.7}>
        <Ionicons name="close" size={18} color={C.muted} />
      </TouchableOpacity>

      {/* Icône succès */}
      <Animated.View style={[s.successIconWrap, { transform: [{ scale: scaleAnim }] }]}>
        <View style={s.successGlow} />
        <View style={s.successCircle}>
          <Ionicons name="mail" size={38} color={C.green} />
        </View>
      </Animated.View>

      {/* Titre */}
      <Text style={s.confirmTitle}>Inscription confirmée !</Text>

      {/* Email */}
      <Text style={s.confirmSub}>Nous avons envoyé un code de confirmation à :</Text>
      <View style={s.emailBadge}>
        <Text style={s.emailBadgeTxt}>{email}</Text>
      </View>

      {/* Instructions */}
      <View style={s.infoBox}>
        <Ionicons name="mail-outline" size={16} color={C.blue} style={{ marginTop: 1 }} />
        <View style={{ flex: 1 }}>
          <Text style={s.infoTitle}>Vérifiez votre boîte de réception</Text>
          <Text style={s.infoBody}>
            Un lien d'activation vous a été envoyé pour activer votre compte. Le lien expire après 15 min.
          </Text>
        </View>
      </View>

      {/* Bouton aller à la connexion */}
      <TouchableOpacity style={s.submitBtn} onPress={onLogin} activeOpacity={0.85}>
        <View style={s.btnRow}>
          <Ionicons name="arrow-back-outline" size={17} color={C.purple} />
          <Text style={s.submitTxt}>Aller à la connexion</Text>
        </View>
      </TouchableOpacity>

      {/* Renvoyer */}
      <View style={s.resendRow}>
        <Text style={s.resendTxt}>Vous n'avez pas reçu l'email ? </Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={s.resendLink}>Renvoyer le code</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ── RegisterScreen ────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const router = useRouter();

  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countryId,       setCountryId]       = useState<string>('');
  const [cityId,          setCityId]          = useState<string>('');
  const [accountType,     setAccountType]     = useState<'standard' | 'professional'>('standard');

  const [countries,       setCountries]       = useState<Country[]>([]);
  const [cities,          setCities]          = useState<City[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [confirmed,  setConfirmed]  = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState('');

  const cardAnim  = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(20)).current;

  // ── Charger les pays au montage ──────────────────────────────────────────
  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardAnim,  { toValue: 1, duration: 500, delay: 150, useNativeDriver: true }),
      Animated.timing(cardSlide, { toValue: 0, duration: 500, delay: 150, useNativeDriver: true }),
    ]).start();

    const fetchCountries = async () => {
      try {
        const data = await getCountries();
        setCountries(data);
      } catch {
        setError('Impossible de charger la liste des pays.');
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // ── Mettre à jour les villes quand le pays change ────────────────────────
  useEffect(() => {
    if (!countryId) {
      setCities([]);
      setCityId('');
      return;
    }
    const found = countries.find(c => String(c.id) === countryId) as any;
    if (found?.cities?.length) {
      setCities(found.cities);
    } else {
      setCities([]);
    }
    setCityId('');
  }, [countryId, countries]);

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!email.includes('@'))         return 'Veuillez saisir une adresse e-mail valide.';
    if (password.length < 8)          return 'Le mot de passe doit contenir au moins 8 caractères.';
    if (password !== confirmPassword) return 'Les mots de passe ne correspondent pas.';
    if (!countryId)                   return 'Veuillez sélectionner un pays.';
    if (cities.length > 0 && !cityId) return 'Veuillez sélectionner une ville.';
    return null;
  };

  // ── Soumettre ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError(null);
    setLoading(true);
    try {
      const data = await register(
        email,
        password,
        confirmPassword,
        Number(countryId),
        cityId ? Number(cityId) : 0,
        accountType
      );
      setConfirmedEmail(email);
      setConfirmed(true);
    } catch (err: any) {
      const msg = err.message?.toLowerCase() ?? '';
      if (msg.includes('already') || msg.includes('exist'))
        setError('Cette adresse e-mail est déjà utilisée.');
      else if (msg.includes('google'))
        setError('Ce compte a été créé avec Google. Veuillez vous connecter avec Google.');
      else if (msg.includes('password'))
        setError('Le mot de passe doit contenir au moins 6 caractères.');
      else if (msg.includes('email'))
        setError('Veuillez saisir une adresse e-mail valide.');
      else
        setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // ── Options selects ──────────────────────────────────────────────────────
  const countryOptions = countries.map(c => ({ id: c.id, label: c.name }));
  const cityOptions    = cities.map(c => ({ id: c.id, label: c.name }));
  const accountOptions = [
    { id: 'standard',     label: 'Compte Standard' },
    { id: 'professional', label: 'Compte Professionnel' },
  ];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      {/* Déco coins identique login */}
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
            {!confirmed && (
              <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={20} color={C.muted} />
              </TouchableOpacity>
            )}

            {/* Confirmation ou Formulaire */}
            {confirmed ? (
              <ConfirmationScreen
                email={confirmedEmail}
                onBack={() => {
                  setConfirmed(false);
                  setEmail(''); setPassword(''); setConfirmPassword('');
                  setCountryId(''); setCityId('');
                }}
                onLogin={() => router.replace('/(auth)/login')}
              />
            ) : (
              <Animated.View style={[s.card, { opacity: cardAnim, transform: [{ translateY: cardSlide }] }]}>

                {/* Logo + tagline */}
                <View style={s.logoBlock}>
                  <View style={s.logoGlowWrap}>
                    <View style={s.logoGlow} />
                    <View style={s.logoCircle}>
                      <Text style={s.logoLetter}>H</Text>
                    </View>
                  </View>
                  <Text style={s.tagline}>
                    En créant un compte, vous acceptez nos{' '}
                    <Text style={{ color: C.purple }}>Conditions</Text>
                    {' '}et la{' '}
                    <Text style={{ color: C.purple }}>Politique de confidentialité</Text>.
                  </Text>
                </View>

                {/* Erreur */}
                {error && (
                  <View style={s.errorBox}>
                    <Ionicons name="alert-circle-outline" size={14} color={C.red} />
                    <Text style={s.errorTxt}>{error}</Text>
                  </View>
                )}

                {/* Formulaire */}
                <View style={s.form}>
                  <AuthInput icon="mail-outline"        placeholder="Adresse e-mail"          value={email}           onChangeText={setEmail}           keyboard="email-address" delay={300} editable={!loading} />
                  <AuthInput icon="lock-closed-outline" placeholder="Mot de passe"            value={password}        onChangeText={setPassword}        secure delay={360} editable={!loading} />
                  <AuthInput icon="checkmark-circle-outline" placeholder="Confirmer le mot de passe" value={confirmPassword}  onChangeText={setConfirmPassword} secure delay={420} editable={!loading} />

                  {/* Pays */}
                  <SelectRow
                    icon="globe-outline"
                    label="Sélectionner un pays"
                    value={countryId}
                    options={countryOptions}
                    onSelect={v => setCountryId(String(v))}
                    disabled={loadingCountries || loading}
                    delay={480}
                  />

                  {/* Villes (si dispo) */}
                  {cityOptions.length > 0 && (
                    <SelectRow
                      icon="location-outline"
                      label="Sélectionner une ville"
                      value={cityId}
                      options={cityOptions}
                      onSelect={v => setCityId(String(v))}
                      disabled={loading}
                      delay={520}
                    />
                  )}

                  {/* Type de compte */}
                  <SelectRow
                    icon="briefcase-outline"
                    label="Type de compte"
                    value={accountType}
                    options={accountOptions}
                    onSelect={v => setAccountType(v as 'standard' | 'professional')}
                    disabled={loading}
                    delay={560}
                  />

                  {/* Bouton S'inscrire */}
                  <TouchableOpacity
                    style={[s.submitBtn, s.submitBtnMt, loading && s.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    <View style={s.btnRow}>
                      {loading
                        ? <ActivityIndicator size="small" color={C.purple} />
                        : <Ionicons name="person-add-outline" size={17} color={C.purple} />
                      }
                      <Text style={s.submitTxt}>
                        {loading ? 'Inscription en cours...' : 'Continuer'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={s.footer}>
                  <Text style={s.footerTxt}>Déjà membre ? </Text>
                  <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
                    <Text style={s.footerLink}>Se connecter</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
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

  decoBR: { position: 'absolute', bottom: 0, right: 0, width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(124,58,237,0.05)' },
  decoTL: { position: 'absolute', top: 0,   left:  0, width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(244,114,182,0.05)' },

  backBtn: { marginTop: 10, marginBottom: 16, width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(24,24,27,0.6)', borderWidth: 1, borderColor: 'rgba(63,63,70,0.50)', alignItems: 'center', justifyContent: 'center' },

  // Card — identique login
  card: { backgroundColor: C.card, borderWidth: 2, borderColor: C.cardBorder, borderRadius: 24, padding: 28, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 40, shadowOffset: { width: 0, height: 20 } },

  logoBlock:    { alignItems: 'center', marginBottom: 20, gap: 12 },
  logoGlowWrap: { alignItems: 'center', justifyContent: 'center' },
  logoGlow:     { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(124,58,237,0.15)' },
  logoCircle:   { width: 78, height: 78, borderRadius: 22, backgroundColor: 'rgba(124,58,237,0.15)', borderWidth: 2, borderColor: 'rgba(167,139,250,0.30)', alignItems: 'center', justifyContent: 'center' },
  logoLetter:   { fontSize: 36, fontWeight: '900', color: C.purple },
  tagline:      { fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 17, maxWidth: 260 },

  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 12, borderRadius: 14, backgroundColor: C.redBg, borderWidth: 1, borderColor: C.redBorder, marginBottom: 10 },
  errorTxt:  { color: C.red, fontSize: 12, flex: 1, fontWeight: '500' },

  form: { gap: 10 },

  // Input — identique login
  inputWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, borderRadius: 16, backgroundColor: C.inputBg, borderWidth: 2 },
  inputIcon: { marginRight: 10 },
  input:     { flex: 1, color: C.text, fontSize: 13, fontWeight: '500' },

  // Select
  selectTrigger: { flex: 1 },
  selectTxt:     { color: C.text, fontSize: 13, fontWeight: '500' },
  dropdown:      { backgroundColor: '#1C1628', borderWidth: 1.5, borderColor: C.purpleBorder, borderTopWidth: 0, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, overflow: 'hidden', marginTop: -2, zIndex: 99 },
  dropItem:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12 },
  dropItemBorder:{ borderBottomWidth: 1, borderBottomColor: 'rgba(63,63,70,0.30)' },
  dropItemActive:{ backgroundColor: C.purpleDim },
  dropItemTxt:   { color: C.muted, fontSize: 13 },

  // Bouton — identique login
  submitBtn:         { paddingVertical: 14, borderRadius: 16, backgroundColor: C.purpleDim, borderWidth: 1, borderColor: C.purpleBorder, alignItems: 'center' },
  submitBtnMt:       { marginTop: 6 },
  submitBtnDisabled: { opacity: 0.55 },
  btnRow:            { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitTxt:         { color: C.purple, fontSize: 14, fontWeight: '700' },

  footer:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  footerTxt: { color: C.muted, fontSize: 13 },
  footerLink:{ color: C.purple, fontSize: 13, fontWeight: '700' },

  // ── Confirmation ──────────────────────────────────────────────────────────
  closeBtn:        { alignSelf: 'flex-end', width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(39,39,42,0.5)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  successIconWrap: { alignItems: 'center', marginBottom: 18 },
  successGlow:     { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(52,211,153,0.15)' },
  successCircle:   { width: 80, height: 80, borderRadius: 40, backgroundColor: C.greenDim, borderWidth: 2, borderColor: C.greenBorder, alignItems: 'center', justifyContent: 'center' },
  confirmTitle:    { fontSize: 22, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 8 },
  confirmSub:      { fontSize: 13, color: C.muted, textAlign: 'center', marginBottom: 12 },
  emailBadge:      { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, backgroundColor: C.purpleDim, borderWidth: 1, borderColor: C.purpleBorder, marginBottom: 16 },
  emailBadgeTxt:   { color: C.text, fontWeight: '700', fontSize: 13, textAlign: 'center' },
  infoBox:         { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 14, backgroundColor: C.blueDim, borderWidth: 1, borderColor: C.blueBorder, marginBottom: 18 },
  infoTitle:       { color: C.blue, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  infoBody:        { color: '#93C5FD', fontSize: 11, lineHeight: 17 },
  resendRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  resendTxt:       { color: C.dim, fontSize: 12 },
  resendLink:      { color: C.purple, fontSize: 12, fontWeight: '600' },
});