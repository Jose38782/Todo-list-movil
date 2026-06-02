import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Badge } from './Badge';
import { colors, radii, spacing } from '../config/theme';

type AboutProjectCardProps = {
  description: string;
  quote: string;
  secondParagraph: string;
  pills: string[];
};

type AuthorCardProps = {
  name: string;
  role: string;
};

type QuickStatsCardProps = {
  stats: Array<{
    label: string;
    value: string;
  }>;
};

export function AboutProjectCard({ description, quote, secondParagraph, pills }: AboutProjectCardProps) {
  const { width } = useWindowDimensions();
  const compact = width < 390;

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>BOOK</Text>
        </View>
        <Text style={[styles.title, compact && styles.titleCompact]}>About the Project</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.bodyText}>{description}</Text>
        <View style={styles.quoteSection}>
          <Text style={styles.quoteText}>"{quote}"</Text>
        </View>
        <Text style={styles.bodyText}>{secondParagraph}</Text>
      </View>

      <View style={styles.pills}>
        {pills.map((pill) => (
          <Badge key={pill} label={pill} tone="primary" />
        ))}
      </View>
    </View>
  );
}

export function AuthorCard({ name, role }: AuthorCardProps) {
  const { width } = useWindowDimensions();
  const compact = width < 390;

  return (
    <View style={[styles.smallCard, compact && styles.smallCardCompact]}>
      <Text style={styles.smallTitle}>Author</Text>
      <Text style={styles.authorName}>{name}</Text>
      <Text style={styles.authorRole}>{role}</Text>
    </View>
  );
}

export function QuickStatsCard({ stats }: QuickStatsCardProps) {
  const { width } = useWindowDimensions();
  const compact = width < 390;

  return (
    <View style={[styles.smallCard, compact && styles.smallCardCompact]}>
      <Text style={styles.smallTitle}>Quick Stats</Text>
      <View style={styles.stats}>
        {stats.map((stat) => (
          <View key={`${stat.label}-${stat.value}`} style={styles.statRow}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  cardCompact: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '800',
  },
  titleCompact: {
    fontSize: 18,
  },
  content: {
    gap: spacing.lg,
  },
  bodyText: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  quoteSection: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.sm,
    padding: spacing.lg,
  },
  quoteText: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  smallCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  smallCardCompact: {
    padding: spacing.md,
  },
  smallTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  authorName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  authorRole: {
    color: colors.textSoft,
    fontSize: 13,
  },
  stats: {
    gap: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  statValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
});
