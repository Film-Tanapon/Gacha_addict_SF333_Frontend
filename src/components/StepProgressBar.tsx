import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
    totalSteps: number;
    /** 1-indexed: จำนวน step ที่ถือว่า "เสร็จ/ถึงแล้ว" รวมถึง step ปัจจุบัน (แสดงเครื่องหมายถูก) */
    currentStep: number;
    /** label เล็ก ๆ ลอยอยู่ใต้ node ของ step ปัจจุบัน เช่น "Profile", "Password" */
    stepLabel?: string;
};

const NODE_SIZE = 22;

/**
 * แถบ progress แบบเส้นต่อเนื่อง (track สีเทา + fill สีเขียวไล่ตาม currentStep)
 * พร้อม node วงกลมเรียงอยู่ด้านบนเส้น และ label ลอยใต้ node ปัจจุบัน
 * ใช้ในหน้า Sign Up (Create an account) ให้ตรงกับ mockup
 */
export default function StepProgressBar({ totalSteps, currentStep, stepLabel }: Props) {
    const nodes = Array.from({ length: totalSteps }, (_, i) => i + 1);
    const fillPercent = (currentStep / totalSteps) * 100;
    // ตำแหน่งแนวนอนของ node ปัจจุบัน (0 = ซ้ายสุด, 1 = ขวาสุด) ไว้ใช้วาง label ลอยด้านล่าง
    const currentNodeFraction =
        totalSteps > 1 ? (currentStep - 1) / (totalSteps - 1) : 0;

    return (
        <View style={styles.container}>
            <View style={styles.trackWrapper}>
                <View style={styles.track} />
                <View style={[styles.trackFill, { width: `${fillPercent}%` }]} />

                {nodes.map((node, index) => {
                    const isChecked = node <= currentStep;
                    const fraction = totalSteps > 1 ? index / (totalSteps - 1) : 0;

                    return (
                        <View
                            key={node}
                            style={[
                                styles.node,
                                isChecked && styles.nodeChecked,
                                {
                                    left: `${fraction * 100}%`,
                                    marginLeft: -NODE_SIZE / 2,
                                },
                            ]}
                        >
                            {isChecked && <Text style={styles.checkMark}>✓</Text>}
                        </View>
                    );
                })}
            </View>

            {!!stepLabel && (
                <View
                    style={[
                        styles.labelWrapper,
                        { left: `${currentNodeFraction * 100}%` },
                    ]}
                >
                    <Text style={styles.labelText}>{stepLabel}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingTop: 8,
        marginBottom: 32,
    },
    trackWrapper: {
        width: '100%',
        height: NODE_SIZE,
        justifyContent: 'center',
    },
    track: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.card,
    },
    trackFill: {
        position: 'absolute',
        left: 0,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
    },
    node: {
        position: 'absolute',
        width: NODE_SIZE,
        height: NODE_SIZE,
        borderRadius: NODE_SIZE / 2,
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nodeChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkMark: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '800',
    },
    labelWrapper: {
        position: 'absolute',
        top: NODE_SIZE + 10,
        transform: [{ translateX: -30 }],
        backgroundColor: colors.card,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 4,
        minWidth: 60,
        alignItems: 'center',
    },
    labelText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.textSecondary,
    },
});