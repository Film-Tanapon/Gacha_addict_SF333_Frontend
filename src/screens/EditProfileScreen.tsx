import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { pickImage, uploadImage } from '../services/imageUpload';
import BottomTabBar from '../components/BottomTabBar';
import CoinBadge from '../components/CoinBadge';
import DecorativeBlob from '../components/DecorativeBlob';
import { BOTTOM_NAV_HEIGHT, cardShadow, colors, radius } from '../theme/theme';

import { useAppData, updateProfile, selectTheme, selectFrame, showApiError } from '../services/appApi';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { user, coins: coin, themes, frames } = useAppData(['themes', 'frames', 'user']);
  const username = user?.username ?? route.params.username;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const profileImage = selectedImage ?? user?.avatarUrl ?? route.params.profileImage;
  const chooseImage = async () => {
    try { const uri = await pickImage(); if (uri) setSelectedImage(uri); }
    catch (error) { showApiError(error); }
  };
  const frameColor = user?.frameColor ?? route.params.frameColor ?? '#0080ff';
  const ownedThemes = themes.filter(t => t.owned).map(t => ({ id: t.id, color: t.colorPreview }));
  const [editedUsername, setEditedUsername] = useState(username);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<string | null>(user?.frameId ?? null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(user?.selectedThemeId ?? null);

  const [saving, setSaving] = useState(false);
  const saveProfile = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const avatarUrl = selectedImage ? await uploadImage(selectedImage) : undefined;
      await updateProfile({ username: editedUsername.trim() || username, ...(avatarUrl ? { avatarUrl } : {}) });
      if (selectedFrame && selectedFrame !== user?.frameId) await selectFrame(selectedFrame);
      if (selectedTheme && selectedTheme !== user?.selectedThemeId) await selectTheme(selectedTheme);
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) { showApiError(error); }
    finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <CoinBadge amount={coin} onPress={() => navigation.navigate('ThemeShop', { username, coin })} />
      </View>

      <ScrollView
        style={styles.contentLayer}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + 34 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrapper} activeOpacity={0.85} disabled={saving} onPress={chooseImage}>
            <View style={[styles.avatarCircle, { borderColor: frames.find(f => f.id === selectedFrame)?.color ?? frameColor }]}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <View style={styles.headCircle} />
                  <View style={styles.shoulderArc} />
                </View>
              )}
            </View>
            <View style={styles.cameraBadge}><Text style={styles.cameraIcon}>📷</Text></View>
          </TouchableOpacity>
          <View style={styles.usernameRow}>
            {isEditingUsername ? (
              <TextInput
                style={styles.usernameInput}
                value={editedUsername}
                onChangeText={setEditedUsername}
                onSubmitEditing={() => setIsEditingUsername(false)}
                autoFocus
                maxLength={24}
                returnKeyType="done"
                selectTextOnFocus
              />
            ) : (
              <Text style={styles.username}>{editedUsername}</Text>
            )}
            <TouchableOpacity
              style={styles.editUsernameButton}
              onPress={() => setIsEditingUsername(value => !value)}
              accessibilityLabel="Edit username"
            >
              <Text style={styles.editUsernameIcon}>{isEditingUsername ? '✓' : '✎'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.customizerCard}>
          <Text style={styles.sectionTitle}>Frame</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsRow}>
            {frames.filter(f => f.owned).map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.optionItem, selectedFrame === item.id && styles.optionSelected]}
                onPress={() => setSelectedFrame(item.id)}
              >
                <View style={[styles.frameOption, { borderColor: item.color }]}><Text style={{textAlign:"center",fontSize:24}}>{item.decoration}</Text></View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.sectionTitle, styles.themeTitle]}>Theme</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsRow}>
            {ownedThemes.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.optionItem, selectedTheme === item.id && styles.optionSelected]}
                onPress={() => setSelectedTheme(item.id)}
              >
                <View style={[styles.themeOption, { backgroundColor: item.color }]} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>

      <DecorativeBlob />
      <BottomTabBar
        active="Profile"
        onNavigate={tab => navigation.replace(tab, { username } as any)}
        onAddPress={() => navigation.navigate('CreateCustom', { username })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  contentLayer: { zIndex: 1 },
  header: { height: 64, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 40, lineHeight: 42, color: colors.text },
  headerTitle: { flex: 1, fontSize: 27, fontWeight: '800', color: colors.text },
  scrollContent: { paddingHorizontal: 24, paddingTop: 8 },
  avatarSection: { alignItems: 'center', marginVertical: 10 },
  avatarWrapper: { position: 'relative' },
  avatarCircle: { width: 190, height: 190, borderRadius: 95, borderWidth: 4, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  defaultAvatar: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  headCircle: { width: 62, height: 62, borderRadius: 31, borderWidth: 2, borderColor: colors.text, marginBottom: 4 },
  shoulderArc: { width: 108, height: 54, borderTopLeftRadius: 54, borderTopRightRadius: 54, borderWidth: 2, borderBottomWidth: 0, borderColor: colors.text },
  cameraBadge: { position: 'absolute', right: 9, bottom: 9, width: 44, height: 44, borderRadius: 22, backgroundColor: '#000', borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', ...cardShadow },
  cameraIcon: { fontSize: 20 },
  usernameRow: { minHeight: 48, marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  username: { fontSize: 21, fontWeight: '800', color: colors.text },
  usernameInput: { minWidth: 150, height: 42, borderBottomWidth: 2, borderBottomColor: colors.primary, paddingHorizontal: 8, paddingVertical: 0, textAlign: 'center', fontSize: 20, fontWeight: '800', color: colors.text },
  editUsernameButton: { width: 38, height: 38, marginLeft: 5, alignItems: 'center', justifyContent: 'center' },
  editUsernameIcon: { fontSize: 25, color: colors.primaryDark, fontWeight: '700' },
  customizerCard: { backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 18, marginTop: 12, ...cardShadow },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 12 },
  themeTitle: { marginTop: 20 },
  optionsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 2, paddingVertical: 4 },
  optionItem: { width: 76, height: 76, borderRadius: radius.md, backgroundColor: '#fff', padding: 4, borderWidth: 3, borderColor: 'transparent', ...cardShadow },
  optionSelected: { borderColor: colors.primary },
  frameOption: { flex: 1, borderRadius: 34, borderWidth: 3, backgroundColor: '#f2f2f2' },
  themeOption: { flex: 1, borderRadius: radius.sm },
  saveButton: { height: 50, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
