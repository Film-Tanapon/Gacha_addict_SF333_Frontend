import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    StatusBar,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateCustom'>;

export default function CreateCustomScreen({ navigation, route }: Props) {
    const params = route?.params || {};
    const username = (params as any)?.username || null;

    const [title, setTitle] = useState('');
    const [cardImage, setCardImage] = useState<string | null>(null);
    const [isEqualRate, setIsEqualRate] = useState<boolean>(true);
    const [animation, setAnimation] = useState<string>('anim1');
    const [frameId, setFrameId] = useState<string | null>(null);

    const [selectedColor, setSelectedColor] = useState('#ff69b4');
    const [customColors, setCustomColors] = useState<string[]>([]);

    const [isColorModalVisible, setIsColorModalVisible] = useState(false);
    const [pickerColor, setPickerColor] = useState('#3b82f6');

    const [cardItems, setCardItems] = useState<{ name: string; weight: string }[]>([]);

    const handleAddItem = () => {
        setCardItems([...cardItems, { name: '', weight: '1' }]);
    };

    const handleItemNameChange = (text: string, index: number) => {
        const updated = [...cardItems];
        updated[index].name = text;
        setCardItems(updated);
    };

    const handleWeightTextChange = (text: string, index: number) => {
        const updated = [...cardItems];
        updated[index].weight = text;
        setCardItems(updated);
    };

    const handleWeightAdjust = (index: number, delta: number) => {
        if (isEqualRate) return;
        const updated = [...cardItems];
        const currentVal = parseFloat(updated[index].weight) || 0;
        const newWeight = Math.max(0.1, parseFloat((currentVal + delta).toFixed(2)));
        updated[index].weight = newWeight.toString();
        setCardItems(updated);
    };

    const handleAddCustomColor = () => {
        setPickerColor(selectedColor);
        setIsColorModalVisible(true);
    };

    const handleConfirmColor = () => {
        if (!customColors.includes(pickerColor)) {
            setCustomColors([...customColors, pickerColor]);
        }
        setSelectedColor(pickerColor);
        setIsColorModalVisible(false);
    };

    const totalWeight = cardItems.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Notice', 'Please enter a Gacha Name.');
            return;
        }

        const totalItems = cardItems.length;
        const equalRateVal = totalItems > 0 ? parseFloat((100 / totalItems).toFixed(2)) : 0;

        const formattedItems = cardItems
            .filter(item => item.name.trim() !== '')
            .map(item => {
                let finalRate = equalRateVal;
                if (!isEqualRate) {
                    const w = parseFloat(item.weight) || 0;
                    finalRate = totalWeight > 0 ? parseFloat(((w / totalWeight) * 100).toFixed(2)) : 0;
                }
                return {
                    name: item.name,
                    rate: finalRate,
                };
            });

        const newCardData = {
            Title: title,
            Card_Image: cardImage,
            is_equal_rate: isEqualRate ? 1 : 0,
            Animation: animation,
            Frame_ID: frameId,
            Create_by: username, 
            Items: formattedItems, 
        };

        console.log('Saving Custom Gacha Data:', newCardData);
        Alert.alert('Success', 'Custom Gacha created successfully!');
        navigation.goBack();
    };

    const defaultColors = ['#ff69b4', '#00bfff', '#ffe44d', '#90ee90', '#ba55d3', '#ffa500', '#696969'];
    const extendedPalette = [
        '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#10b981', '#06b6d4',
        '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#64748b', '#0f172a',
        '#ffb703', '#fb8500', '#023047', '#219ebc', '#8ecae6', '#dda15e', '#bc6c25'
    ];

    const totalItemsCount = cardItems.length;
    const autoEqualPercent = totalItemsCount > 0 ? (100 / totalItemsCount).toFixed(1) + '%' : '0%';

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
                        <Text style={styles.backIcon}>&lt;</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Custom Gacha</Text>
                    <View style={{ width: 32 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Avatar / Icon */}
                    <View style={styles.avatarContainer}>
                        <View style={[styles.glassAvatarCircle, { borderColor: selectedColor }]}>
                            <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8}>
                                <Text style={styles.cameraEmoji}>📷</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Name */}
                    <View style={[styles.inputGroup, styles.glassCard]}>
                        <Text style={styles.inputLabel}>Name</Text>
                        <View style={styles.glassInputContainer}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Gacha Name"
                                placeholderTextColor="#9ca3af"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>
                    </View>

                    {/* Card Color */}
                    <View style={[styles.inputGroup, styles.glassCard]}>
                        <Text style={styles.inputLabel}>Card Color</Text>
                        <View style={styles.colorPaletteRow}>
                            {defaultColors.map((color, index) => (
                                <TouchableOpacity
                                    key={`default-${index}`}
                                    style={[
                                        styles.colorCircle,
                                        { backgroundColor: color },
                                        selectedColor === color && styles.selectedColorRing,
                                    ]}
                                    onPress={() => setSelectedColor(color)}
                                    activeOpacity={0.8}
                                />
                            ))}
                            {customColors.map((color, index) => (
                                <TouchableOpacity
                                    key={`custom-${index}`}
                                    style={[
                                        styles.colorCircle,
                                        { backgroundColor: color },
                                        selectedColor === color && styles.selectedColorRing,
                                    ]}
                                    onPress={() => setSelectedColor(color)}
                                    activeOpacity={0.8}
                                />
                            ))}
                            <TouchableOpacity 
                                style={styles.addColorButton} 
                                onPress={handleAddCustomColor}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.plusIconText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Gacha Weight Mode */}
                    <View style={[styles.inputGroup, styles.glassCard]}>
                        <Text style={styles.inputLabel}>Weight Mode</Text>
                        <View style={styles.rateToggleRow}>
                            <TouchableOpacity
                                style={[styles.rateButton, isEqualRate && styles.rateButtonActive]}
                                onPress={() => setIsEqualRate(true)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.rateButtonText, isEqualRate && styles.rateTextActive]}>Equal</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.rateButton, !isEqualRate && styles.rateButtonActive]}
                                onPress={() => setIsEqualRate(false)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.rateButtonText, !isEqualRate && styles.rateTextActive]}>Custom</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Animation */}
                    <View style={[styles.inputGroup, styles.glassCard]}>
                        <Text style={styles.inputLabel}>Animation</Text>
                        <View style={styles.animationRow}>
                            {['anim1', 'anim2', 'anim3'].map((anim, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.animationBox,
                                        animation === anim && styles.selectedAnimationBox,
                                    ]}
                                    onPress={() => setAnimation(anim)}
                                    activeOpacity={0.8}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Random List */}
                    <View style={[styles.inputGroup, styles.glassCard]}>
                        <View style={styles.randomListHeader}>
                            <Text style={styles.listTitle}>Random List</Text>
                            <TouchableOpacity onPress={handleAddItem} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Text style={styles.addListPlus}>+</Text>
                            </TouchableOpacity>
                        </View>

                        {cardItems.length === 0 ? (
                            <Text style={styles.emptyListText}>No items yet. Tap '+' to add a random item.</Text>
                        ) : (
                            cardItems.map((item, index) => {
                                let computedPercent = '0%';
                                if (isEqualRate) {
                                    computedPercent = autoEqualPercent;
                                } else if (totalWeight > 0) {
                                    const w = parseFloat(item.weight) || 0;
                                    computedPercent = ((w / totalWeight) * 100).toFixed(1) + '%';
                                }

                                return (
                                    <View key={index} style={styles.randomListRow}>
                                        <View style={styles.glassElementInput}>
                                            <TextInput
                                                style={styles.smallTextInput}
                                                placeholder="Element name"
                                                placeholderTextColor="#9ca3af"
                                                value={item.name}
                                                onChangeText={(text) => handleItemNameChange(text, index)}
                                            />
                                        </View>
                                        
                                        <View style={[
                                            styles.glassRateContainer,
                                            isEqualRate && styles.disabledRateInput
                                        ]}>
                                            {isEqualRate ? (
                                                <View style={styles.equalWeightWrapper}>
                                                    <Text style={styles.weightValueText}>1</Text>
                                                    <Text style={styles.percentIndicatorText}>({computedPercent})</Text>
                                                </View>
                                            ) : (
                                                <View style={styles.customRateInputWrapper}>
                                                    <TextInput
                                                        style={styles.rateTextInput}
                                                        keyboardType="decimal-pad"
                                                        value={item.weight}
                                                        onChangeText={(text) => handleWeightTextChange(text, index)}
                                                        placeholder="1.0"
                                                        placeholderTextColor="#9ca3af"
                                                    />
                                                    <Text style={styles.percentIndicatorText}>({computedPercent})</Text>
                                                </View>
                                            )}
                                            
                                            {!isEqualRate && (
                                                <View style={styles.stepperContainer}>
                                                    <TouchableOpacity 
                                                        onPress={() => handleWeightAdjust(index, 0.1)}
                                                        style={styles.stepperButton}
                                                    >
                                                        <Text style={styles.stepperArrow}>▲</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity 
                                                        onPress={() => handleWeightAdjust(index, -0.1)}
                                                        style={styles.stepperButton}
                                                    >
                                                        <Text style={styles.stepperArrow}>▼</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Color Modal */}
            {isColorModalVisible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Color Picker</Text>
                        <Text style={styles.modalSubtitle}>Select color from palette or enter hex:</Text>
                        
                        <View style={styles.pickerPreviewRow}>
                            <View style={[styles.colorPreviewBox, { backgroundColor: pickerColor }]} />
                            <View style={styles.glassHexInputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="#333333"
                                    placeholderTextColor="#9ca3af"
                                    value={pickerColor}
                                    onChangeText={setPickerColor}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.colorGrid}>
                            {extendedPalette.map((color, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.gridColorItem,
                                        { backgroundColor: color },
                                        pickerColor === color && styles.selectedGridItem,
                                    ]}
                                    onPress={() => setPickerColor(color)}
                                    activeOpacity={0.8}
                                />
                            ))}
                        </View>

                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.cancelButton]} 
                                onPress={() => setIsColorModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.modalButton, styles.confirmButton]} 
                                onPress={handleConfirmColor}
                            >
                                <Text style={styles.confirmButtonText}>Select</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 0,
    },
    keyboardAvoidingView: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    backButton: { width: 32, height: 32, justifyContent: 'center', alignItems: 'flex-start' },
    backIcon: { fontSize: 22, fontWeight: '700', color: '#000000' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#000000' },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 4 },
    avatarContainer: { alignItems: 'center', marginBottom: 16 },
    glassAvatarCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: 'rgba(240, 242, 245, 0.8)',
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        position: 'relative',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 4,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        elevation: 4,
    },
    cameraEmoji: { fontSize: 16 },
    glassCard: {
        backgroundColor: 'rgba(240, 242, 245, 0.85)',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 16,
    },
    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 14, fontWeight: '700', color: '#000000', marginBottom: 6, paddingLeft: 4 },
    glassInputContainer: {
        width: '100%',
        height: 44,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 22,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    textInput: { fontSize: 14, color: '#111827' },
    colorPaletteRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, paddingVertical: 4 },
    colorCircle: { width: 36, height: 36, borderRadius: 18 },
    selectedColorRing: { borderWidth: 3, borderColor: '#ffffff', elevation: 4 },
    addColorButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        justifyContent: 'center',
        alignItems: 'center',
    },
    plusIconText: { fontSize: 20, color: '#4b5563', fontWeight: '600' },
    rateToggleRow: { flexDirection: 'row', gap: 12 },
    rateButton: {
        flex: 1,
        height: 42,
        backgroundColor: '#ffffff',
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        paddingHorizontal: 8,
    },
    rateButtonActive: { backgroundColor: '#ffffff', borderColor: '#00e65c', borderWidth: 1.5 },
    rateButtonText: { fontSize: 13, fontWeight: '600', color: '#6b7280', textAlign: 'center' },
    rateTextActive: { color: '#000000', fontWeight: '700' },
    
    animationRow: { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 16, 
        paddingVertical: 6 
    },
    animationBox: { 
        width: 86, 
        height: 86, 
        backgroundColor: '#ffffff', 
        borderRadius: 20, 
        borderWidth: 1.5, 
        borderColor: '#d1d5db',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedAnimationBox: { 
        borderColor: '#00e65c', 
        borderWidth: 2.5 
    },

    randomListHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    listTitle: { fontSize: 16, fontWeight: '700', color: '#000000' },
    addListPlus: { fontSize: 24, fontWeight: '700', color: '#00e65c' },
    emptyListText: { textAlign: 'center', color: '#9ca3af', fontSize: 13, marginVertical: 12 },
    randomListRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    glassElementInput: {
        flex: 1.9,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#d1d5db',
        paddingHorizontal: 12,
        height: 42,
        justifyContent: 'center',
    },
    glassRateContainer: {
        flex: 0.75,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#d1d5db',
        paddingHorizontal: 10,
        height: 42,
    },
    disabledRateInput: { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' },
    smallTextInput: { flex: 1, fontSize: 13, color: '#111827' },
    equalWeightWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 4,
    },
    customRateInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 4,
    },
    rateTextInput: { width: 30, fontSize: 11, fontWeight: '600', color: '#111827', padding: 0 },
    weightValueText: { fontSize: 11, fontWeight: '600', color: '#4b5563' },
    percentIndicatorText: { fontSize: 9.5, color: '#059669', fontWeight: '700' },
    stepperContainer: { flexDirection: 'column', justifyContent: 'center', paddingLeft: 4 },
    stepperButton: { paddingHorizontal: 2, height: 16, justifyContent: 'center', alignItems: 'center' },
    stepperArrow: { fontSize: 8, color: '#4b5563', fontWeight: 'bold' },
    saveButton: {
        width: '100%',
        height: 48,
        backgroundColor: '#00e65c',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#00e65c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 20,
    },
    saveButtonText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
    modalOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 22,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
    modalSubtitle: { fontSize: 13, color: '#6b7280', marginBottom: 14 },
    pickerPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    colorPreviewBox: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#e5e7eb' },
    glassHexInputContainer: {
        flex: 1,
        height: 44,
        backgroundColor: 'rgba(240, 242, 245, 0.85)',
        borderRadius: 22,
        paddingHorizontal: 14,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
        marginBottom: 16,
        paddingVertical: 4,
    },
    gridColorItem: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    selectedGridItem: {
        borderWidth: 3,
        borderColor: '#111827',
        transform: [{ scale: 1.1 }],
    },
    modalButtonRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
    modalButton: { flex: 1, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
    cancelButton: { backgroundColor: '#f3f4f6' },
    cancelButtonText: { fontSize: 14, fontWeight: '600', color: '#4b5563' },
    confirmButton: { backgroundColor: '#00e65c' },
    confirmButtonText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
});