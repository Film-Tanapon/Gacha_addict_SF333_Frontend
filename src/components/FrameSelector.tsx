import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius } from '../theme/colors';

export type FrameOption = {
    id: string;
    color?: string;
    locked?: boolean;
};

type Props = {
    label?: string;
    frames: FrameOption[];
    selectedId?: string | null;
    onSelect: (id: string) => void;
};

/**
 * แถวเลือก Frame (กรอบรูปโปรไฟล์) แบบสี่เหลี่ยมมุมโค้ง
 * ใช้ทั้งตอน Sign Up (เลือก frame เริ่มต้น) และหน้า Profile / Theme Shop
 */
export default function FrameSelector({ label = 'Frame', frames, selectedId, onSelect }: Props) {
    return (
        <View style={styles.container}>
            {!!label && <Text style={styles.label}>{label}</Text>}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.row}
            >
                {frames.map((frame) => {
                    const isSelected = frame.id === selectedId;
                    return (
                        <TouchableOpacity
                            key={frame.id}
                            style={[
                                styles.frameBox,
                                { backgroundColor: frame.color ?? colors.card },
                                isSelected && styles.frameBoxSelected,
                                frame.locked && styles.frameBoxLocked,
                            ]}
                            onPress={() => !frame.locked && onSelect(frame.id)}
                            activeOpacity={frame.locked ? 1 : 0.7}
                        >
                            {frame.locked && <Text style={styles.lockIcon}>🔒</Text>}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 4,
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 10,
    },
    row: {
        gap: 12,
        paddingRight: 8,
    },
    frameBox: {
        width: 56,
        height: 56,
        borderRadius: radius.md,
        borderWidth: 2,
        borderColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    frameBoxSelected: {
        borderColor: colors.primary,
    },
    frameBoxLocked: {
        opacity: 0.5,
    },
    lockIcon: {
        fontSize: 16,
    },
});
