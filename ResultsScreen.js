import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, StatusBar, Share, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, PRIORITY_COLORS } from '../constants';
import {
  Tag, SectionHeader, StatRow, PriorityBadge,
  Card, PrimaryButton, GhostButton,
} from '../components/UI';

// ─── Spacer Card ──────────────────────────────────────────────────────────────
function SpacerCard({ spacer, index }) {
  const [open, setOpen] = useState(false);
  const color = PRIORITY_COLORS[spacer.priority] || COLORS.cyan;

  return (
    <TouchableOpacity
      onPress={() => setOpen(o => !o)}
      activeOpacity={0.85}
      style={[styles.spacerCard, { borderColor: color + '35', backgroundColor: color + '10' }]}
    >
      <View style={styles.spacerRow}>
        <View style={[styles.spacerNum, { backgroundColor: color }]}>
          <Text style={styles.spacerNumText}>{index + 1}</Text>
        </View>
        <View style={styles.spacerInfo}>
          <Text style={styles.spacerZone}>{spacer.zone}</Text>
          <Text style={styles.spacerType}>{spacer.spacerType}</Text>
        </View>
        <View style={styles.spacerRight}>
          <PriorityBadge priority={spacer.priority} />
          <Text style={[styles.spacerChevron, { color: COLORS.textDim }]}>{open ? '▲' : '▼'}</Text>
        </View>
      </View>

      {open && (
        <View style={[styles.spacerExpanded, { borderTopColor: color + '25' }]}>
          <Text style={styles.spacerDetail}>
            <Text style={styles.spacerDetailLabel}>Position:  </Text>
            {spacer.position}
          </Text>
          <Text style={[styles.spacerDetail, { marginTop: 6 }]}>
            <Text style={styles.spacerDetailLabel}>Purpose:  </Text>
            {spacer.purpose}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Pressure Bar ─────────────────────────────────────────────────────────────
function PressureBar({ label, level }) {
  const levels = { Low: 1, Moderate: 2, High: 3 };
  const color = level === 'High' ? COLORS.red : level === 'Moderate' ? COLORS.orange : COLORS.green;
  const filled = levels[level] || 1;
  return (
    <View style={styles.pressureRow}>
      <Text style={styles.pressureLabel}>{label}</Text>
      <View style={styles.pressureBars}>
        {[1, 2, 3].map(i => (
          <View key={i} style={[
            styles.pressureBar,
            { backgroundColor: i <= filled ? color : COLORS.bgCard }
          ]} />
        ))}
      </View>
      <Text style={[styles.pressureLevel, { color }]}>{level}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ResultsScreen({ route, navigation }) {
  const { result, uri, footSide } = route.params;
  const conf = result.confidenceLevel;
  const confColor = conf === 'High' ? COLORS.green : conf === 'Medium' ? COLORS.orange : COLORS.red;

  const saveToHistory = async () => {
    try {
      const record = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        footSide,
        uri,
        result,
      };
      const raw = await AsyncStorage.getItem('scan_history');
      const history = raw ? JSON.parse(raw) : [];
      history.unshift(record);
      await AsyncStorage.setItem('scan_history', JSON.stringify(history.slice(0, 20)));
      Alert.alert('Saved', 'Scan saved to your history.');
    } catch {
      Alert.alert('Error', 'Could not save scan.');
    }
  };

  const shareSummary = async () => {
    const m = result.measurements;
    const spacerList = result.spacerPlacements
      .map((s, i) => `${i + 1}. ${s.zone} (${s.priority}) — ${s.spacerType}`)
      .join('\n');

    const text = `ModPod Scan — ${footSide} Foot
Date: ${new Date().toLocaleDateString()}

MEASUREMENTS
Length: ~${m.estimatedLength}mm | Width: ~${m.estimatedWidth}mm
Arch: ${m.archType} | Shape: ${m.footShape}

ASSESSMENT
${result.overallAssessment}

SPACER PLACEMENTS
${spacerList}

MOLD NOTES
${result.moldNotes}`;

    await Share.share({ message: text, title: 'ModPod Foot Scan Report' });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>SCAN COMPLETE</Text>
            <Text style={styles.headerTitle}>{footSide} Foot Analysis</Text>
          </View>
          <View style={[styles.confBadge, { borderColor: confColor + '40', backgroundColor: confColor + '15' }]}>
            <Text style={[styles.confText, { color: confColor }]}>{conf}</Text>
            <Text style={styles.confSub}>confidence</Text>
          </View>
        </View>

        {/* Photo */}
        <View style={styles.photoWrapper}>
          <Image source={{ uri }} style={styles.photo} resizeMode="cover" />
        </View>

        {/* Assessment */}
        <Card style={styles.assessmentCard}>
          <Text style={styles.assessmentLabel}>AI ASSESSMENT</Text>
          <Text style={styles.assessmentText}>{result.overallAssessment}</Text>
        </Card>

        {/* Measurements */}
        <SectionHeader title="MEASUREMENTS & PROFILE" />
        <Card>
          <StatRow label="Est. Foot Length" value={`~${result.measurements.estimatedLength} mm`} accent={COLORS.cyan} />
          <StatRow label="Ball Width" value={`~${result.measurements.estimatedWidth} mm`} accent={COLORS.cyan} />
          <StatRow label="Arch Type" value={result.measurements.archType} accent={COLORS.orange} />
          <StatRow label="Foot Shape" value={result.measurements.footShape} />
          <StatRow label="Toe Spread" value={result.measurements.toeSpread} />
          <StatRow label="Heel Width" value={`~${result.measurements.heelWidth} mm`} last />
        </Card>

        {/* Pressure */}
        <SectionHeader title="PRESSURE DISTRIBUTION" />
        <Card>
          {[
            ['Heel', result.pressureZones.heelPressure],
            ['Ball', result.pressureZones.ballPressure],
            ['Arch', result.pressureZones.archPressure],
            ['Toe', result.pressureZones.toePressure],
          ].map(([label, level]) => (
            <PressureBar key={label} label={label} level={level} />
          ))}
        </Card>

        {/* Conditions */}
        {result.conditions?.length > 0 && (
          <>
            <SectionHeader title="NOTED CONDITIONS" />
            <View style={styles.tagsRow}>
              {result.conditions.map(c => <Tag key={c} label={c} color={COLORS.orange} />)}
            </View>
          </>
        )}

        {/* Spacer Placements */}
        <SectionHeader title="MOD SPACER PLACEMENT GUIDE" />
        <Text style={styles.spacerHint}>Tap each zone to see placement details</Text>
        {result.spacerPlacements.map((s, i) => (
          <SpacerCard key={i} spacer={s} index={i} />
        ))}

        {/* Mold Notes */}
        <SectionHeader title="CUSTOM MOLD CASTING NOTES" />
        <Card style={styles.moldCard}>
          <Text style={styles.moldText}>{result.moldNotes}</Text>
        </Card>

        {/* Imaging notes */}
        {result.imagingNotes && result.imagingNotes !== 'Image quality acceptable' && (
          <Card style={styles.imagingCard}>
            <Text style={styles.imagingLabel}>📷 Imaging Note</Text>
            <Text style={styles.imagingText}>{result.imagingNotes}</Text>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <PrimaryButton title="SHARE REPORT ↑" onPress={shareSummary} style={{ marginBottom: 10 }} />
          <TouchableOpacity onPress={saveToHistory} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>💾  Save to History</Text>
          </TouchableOpacity>
          <GhostButton title="↺ New Scan" onPress={() => navigation.navigate('Capture')} style={{ marginTop: 4 }} />
        </View>

        <Text style={styles.disclaimer}>
          For sizing and orthotic guidance only. Not a medical device.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, paddingBottom: 48 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 16,
  },
  headerLabel: { fontSize: 10, color: COLORS.cyanDim, letterSpacing: 3, marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary },
  confBadge: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 6, alignItems: 'center',
  },
  confText: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  confSub: { fontSize: 9, color: COLORS.textDim, marginTop: 1 },

  photoWrapper: {
    borderRadius: 14, overflow: 'hidden', marginBottom: 16,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  photo: { width: '100%', height: 200 },

  assessmentCard: { backgroundColor: '#0d1f18', borderColor: COLORS.green + '25', marginBottom: 20 },
  assessmentLabel: { fontSize: 9, color: COLORS.green, letterSpacing: 3, marginBottom: 6 },
  assessmentText: { fontSize: 13, color: '#adc', lineHeight: 20 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },

  spacerHint: { fontSize: 11, color: COLORS.textDim, marginBottom: 10, marginTop: -4 },
  spacerCard: {
    borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8,
  },
  spacerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  spacerNum: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  spacerNumText: { fontSize: 13, fontWeight: '800', color: COLORS.black },
  spacerInfo: { flex: 1 },
  spacerZone: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  spacerType: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  spacerRight: { alignItems: 'flex-end', gap: 4 },
  spacerChevron: { fontSize: 10, marginTop: 2 },
  spacerExpanded: {
    marginTop: 10, paddingTop: 10, borderTopWidth: 1,
  },
  spacerDetail: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },
  spacerDetailLabel: { color: COLORS.textSecondary, fontWeight: '700' },

  pressureRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#ffffff06',
  },
  pressureLabel: { width: 44, fontSize: 13, color: COLORS.textMuted },
  pressureBars: { flex: 1, flexDirection: 'row', gap: 4, marginHorizontal: 12 },
  pressureBar: { flex: 1, height: 6, borderRadius: 3 },
  pressureLevel: { width: 68, fontSize: 12, fontWeight: '700', textAlign: 'right' },

  moldCard: { backgroundColor: '#0d1a28', borderColor: '#4488ff20' },
  moldText: { fontSize: 13, color: '#9ab', lineHeight: 20 },

  imagingCard: { backgroundColor: '#1a1408', borderColor: COLORS.orange + '25' },
  imagingLabel: { fontSize: 11, color: COLORS.orange, fontWeight: '700', marginBottom: 4 },
  imagingText: { fontSize: 12, color: COLORS.textDim, lineHeight: 18 },

  actions: { marginTop: 24, marginBottom: 8 },
  saveBtn: {
    alignItems: 'center', paddingVertical: 12,
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 10,
  },
  saveBtnText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },

  disclaimer: {
    marginTop: 16, fontSize: 11, color: COLORS.textDim, textAlign: 'center', lineHeight: 17,
  },
});
