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
import BottomTabBar from '../components/BottomTabBar';
import CoinBadge from '../components/CoinBadge';
import DecorativeBlob from '../components/DecorativeBlob';
import { BOTTOM_NAV_HEIGHT, cardShadow, colors, radius } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

const USER_FRAMES = [
  { id: 'f1', color: '#0080ff' },
  { id: 'f2', color: '#ff4b82' },
  { id: 'f3', color: '#eab308' },
  { id: 'f4', color: '#a855f7' },
  { id: 'f5', color: '#06b6d4' },
];
const USER_THEMES = [
  { id: 't1', color: '#e0e7ff' },
  { id: 't2', color: '#f3f4f6' },
  { id: 't3', color: '#dcfce7' },
  { id: 't4', color: '#ffedd5' },
  { id: 't5', color: '#ffe4e6' },
];

export default function EditProfileScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { username, profileImage, frameColor = '#0080ff', coin = 20 } = route.params;
  const [editedUsername, setEditedUsername] = useState(username);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(frameColor);
  const [selectedTheme, setSelectedTheme] = useState(USER_THEMES[1].id);

  const saveProfile = () => {
    const finalUsername = editedUsername.trim() || username;
    Alert.alert('Success', 'Profile updated successfully!');
    navigation.replace('Profile', { username: finalUsername, profileImage, frameColor: selectedFrame, coin });
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
          <TouchableOpacity style={styles.avatarWrapper} activeOpacity={0.85} onPress={() => Alert.alert('Profile picture', 'Image picker will be connected here.')}>
            <View style={[styles.avatarCircle, { borderColor: selectedFrame }]}>
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
            {USER_FRAMES.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.optionItem, selectedFrame === item.color && styles.optionSelected]}
                onPress={() => setSelectedFrame(item.color)}
              >
                <View style={[styles.frameOption, { borderColor: item.color }]} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.sectionTitle, styles.themeTitle]}>Theme</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsRow}>
            {USER_THEMES.map(item => (
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
