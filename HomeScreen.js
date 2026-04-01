import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { PrimaryButton } from '../components/UI';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>◈ MODPOD SYSTEMS</Text>
          <Text style={styles.title}>Foot Scan{'\n'}<Text style={styles.titleAccent}>AI</Text></Text>
          <Text style={styles.version}>v1.0.0</Text>
        </View>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🦶</Text>
          <Text style={styles.heroTitle}>Precision Foot Mapping</Text>
          <Text style={styles.heroDesc}>
            Point your camera at your foot. Claude AI analyzes the image and generates
            a custom mold profile + modular spacer placement guide in seconds.
          </Text>
        </View>

        {/* Feature list */}
        {[
          ['◈', 'Camera or photo upload', 'Use your phone camera or existing photo'],
          ['◈', 'AI-powered analysis', 'Claude Vision reads arch type, pressure zones & foot shape'],
          ['◈', 'Spacer placement guide', 'Exact positions for each modular spacer zone'],
          ['◈', 'Custom mold notes', 'Casting instructions specific to your foot geometry'],
        ].map(([icon, title, desc]) => (
          <View key={title} style={styles.feature}>
            <Text style={styles.featureIcon}>{icon}</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{title}</Text>
              <Text style={styles.featureDesc}>{desc}</Text>
            </View>
          </View>
        ))}

        {/* CTA */}
        <View style={styles.cta}>
          <PrimaryButton
            title="START SCAN ▶"
            onPress={() => navigation.navigate('Capture')}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate('History')}
            style={styles.historyLink}
          >
            <Text style={styles.historyLinkText}>View past scans →</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          For sizing and custom orthotic guidance only. Not a medical device.
          Consult a podiatrist for clinical concerns.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, paddingBottom: 40 },

  header: { marginBottom: 28, marginTop: 8 },
  brand: { fontSize: 10, color: COLORS.cyanDim, letterSpacing: 3, marginBottom: 6 },
  title: { fontSize: 38, fontWeight: '900', color: COLORS.textPrimary, lineHeight: 42 },
  titleAccent: { color: COLORS.cyan },
  version: { fontSize: 11, color: COLORS.textDim, marginTop: 4, letterSpacing: 1 },

  heroCard: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 16, borderWidth: 1, borderColor: COLORS.border,
    padding: 24, marginBottom: 20, alignItems: 'center',
  },
  heroEmoji: { fontSize: 52, marginBottom: 12 },
  heroTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10 },
  heroDesc: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },

  feature: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ffffff06',
    gap: 14,
  },
  featureIcon: { fontSize: 16, color: COLORS.cyan, marginTop: 1 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 2 },
  featureDesc: { fontSize: 12, color: COLORS.textDim, lineHeight: 17 },

  cta: { marginTop: 28, gap: 14 },
  historyLink: { alignItems: 'center', paddingVertical: 4 },
  historyLinkText: { fontSize: 13, color: COLORS.textMuted, letterSpacing: 0.5 },

  disclaimer: {
    marginTop: 28, fontSize: 11, color: COLORS.textDim,
    textAlign: 'center', lineHeight: 17,
  },
});
