import { StyleSheet, View } from 'react-native';
import { Surface } from '../components/Surface';
import { AboutProjectCard, AuthorCard, QuickStatsCard } from '../components/AboutCards';
import { colors, spacing } from '../config/theme';

export function AboutScreen() {
  return (
    <Surface>
      <View style={styles.layout}>
        <AboutProjectCard
          description="Scholarly Atelier is more than just a task manager; it is an educational frontend built to demonstrate routing, API integration and component design."
          quote="This page stays local on purpose. The rest of the app uses the backend."
          secondParagraph="The backend demo for this project is focused on lists, tasks, authentication and user registration, so About remains mocked while the other screens connect to the local backend."
          pills={['React Native', 'Expo', 'Axios']}
        />

        <View style={styles.sideColumn}>
          <AuthorCard name="José Miguel Rodriguez" role="Software Engineer Student" />
          <QuickStatsCard
            stats={[
              { label: 'Mode', value: 'Local mock' },
              { label: 'Backend', value: 'Not used here' },
            ]}
          />
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  layout: {
    gap: spacing.lg,
  },
  sideColumn: {
    gap: spacing.lg,
  },
});
