import { type PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../config/theme';

type SurfaceProps = PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
}>;

export function Surface({ children, scroll = true, padded = true }: SurfaceProps) {
  const { width } = useWindowDimensions();
  const compact = width < 390;
  const content = <View style={[styles.container, padded && styles.padded]}>{children}</View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        pointerEvents="none"
        style={[styles.backgroundAccentTop, compact && styles.backgroundAccentTopCompact]}
      />
      <View
        pointerEvents="none"
        style={[styles.backgroundAccentBottom, compact && styles.backgroundAccentBottomCompact]}
      />
      {scroll ? <ScrollView contentContainerStyle={styles.scrollContent}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  padded: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  backgroundAccentTop: {
    position: 'absolute',
    top: -90,
    right: -90,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(0, 91, 191, 0.08)',
  },
  backgroundAccentBottom: {
    position: 'absolute',
    bottom: -120,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(124, 77, 255, 0.08)',
  },
  backgroundAccentTopCompact: {
    top: -110,
    right: -120,
    width: 180,
    height: 180,
  },
  backgroundAccentBottomCompact: {
    bottom: -140,
    left: -130,
    width: 200,
    height: 200,
  },
});
