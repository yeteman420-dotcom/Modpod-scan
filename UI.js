import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { COLORS, PRIORITY_COLORS } from '../constants';

// ─── Tag ──────────────────────────────────────────────────────────────────────
export function Tag({ label, color = COLORS.cyan }) {
  return (
    <View style={[styles.tag, { borderColor: color + '50', backgroundColor: color + '18' }]}>
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
      <View style={styles.sectionHeaderLine} />
    </View>
  );
}

// ─── Stat Row ─────────────────────────────────────────────────────────────────
export function StatRow({ label, value, accent, last }) {
  return (
    <View style={[styles.statRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && { color: accent }]}>{value}</Text>
    </View>
  );
}

// ─── Priority Badge ───────────────────────────────────────────────────────────
export function PriorityBadge({ priority }) {
  const color = PRIORITY_COLORS[priority] || COLORS.cyan;
  return (
    <View style={[styles.badge, { borderColor: color + '50', backgroundColor: color + '20' }]}>
      <Text style={[styles.badgeText, { color }]}>{priority}</Text>
    </View>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

// ─── Primary Button ───────────────────────────────────────────────────────────
export function PrimaryButton({ title, onPress, disabled, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.primaryBtn, disabled && styles.primaryBtnDisabled, style]}
    >
      <Text style={styles.primaryBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

// ─── Ghost Button ─────────────────────────────────────────────────────────────
export function GhostButton({ title, onPress, style }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.ghostBtn, style]}>
      <Text style={styles.ghostBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

// ─── Pulsing Dot ─────────────────────────────────────────────────────────────
export function PulsingDot({ color = COLORS.cyan }) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.2, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[styles.dot, { backgroundColor: color, opacity: anim }]} />;
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ color = COLORS.cyan, size = 48 }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 1000, useNativeDriver: true })
    ).start();
  }, []);
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={[
      styles.spinner,
      { width: size, height: size, borderTopColor: color, borderRadius: size / 2 },
      { transform: [{ rotate }] },
    ]} />
  );
}

// ─── Foot Selector ────────────────────────────────────────────────────────────
export function FootSelector({ selected, onSelect }) {
  return (
    <View style={styles.footSelector}>
      {['Left', 'Right'].map((side) => (
        <TouchableOpacity
          key={side}
          onPress={() => onSelect(side)}
          activeOpacity={0.8}
          style={[
            styles.footBtn,
            selected === side && styles.footBtnActive,
          ]}
        >
          <Text style={[styles.footBtnText, selected === side && styles.footBtnTextActive]}>
            {side === 'Left' ? '◁ ' : ''}{side} Foot{side === 'Right' ? ' ▷' : ''}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20, borderWidth: 1, margin: 3,
  },
  tagText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  sectionHeader: { marginBottom: 10, marginTop: 4 },
  sectionHeaderText: {
    fontSize: 10, letterSpacing: 3, color: COLORS.textDim,
    fontFamily: 'monospace', marginBottom: 6,
  },
  sectionHeaderLine: { height: 1, backgroundColor: COLORS.border },

  statRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#ffffff08',
  },
  statLabel: { fontSize: 13, color: COLORS.textMuted },
  statValue: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },

  badge: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20, borderWidth: 1,
  },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12, borderWidth: 1,
    borderColor: COLORS.border, padding: 14,
    marginBottom: 12,
  },

  primaryBtn: {
    backgroundColor: COLORS.cyan + '15',
    borderWidth: 1.5, borderColor: COLORS.cyan,
    borderRadius: 12, paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnText: {
    color: COLORS.cyan, fontSize: 14,
    fontWeight: '800', letterSpacing: 2,
  },

  ghostBtn: {
    borderWidth: 1.5, borderColor: COLORS.textDim,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  ghostBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700', letterSpacing: 1 },

  dot: { width: 8, height: 8, borderRadius: 4 },

  spinner: {
    borderWidth: 2.5,
    borderColor: '#ffffff15',
    borderTopWidth: 2.5,
  },

  footSelector: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  footBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#223344',
    backgroundColor: COLORS.bgCard, alignItems: 'center',
  },
  footBtnActive: { borderColor: COLORS.cyan, backgroundColor: COLORS.cyan + '12' },
  footBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textDim, letterSpacing: 1 },
  footBtnTextActive: { color: COLORS.cyan },
});
