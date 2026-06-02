import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Surface } from '../components/Surface';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radii, spacing } from '../config/theme';
import { isFirebaseConfigured } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const { signIn, signUp, isFirebase } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Name is required for registration.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        await signUp(name.trim(), email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Surface>
      <View style={styles.card}>
        <Text style={styles.kicker}>Welcome</Text>
        <Text style={styles.title}>Sign in to continue</Text>
        <Text style={styles.body}>
          {isFirebaseConfigured()
            ? 'This build uses Firebase Authentication with persisted session.'
            : 'Firebase is not configured. The app will use the backend login endpoint as fallback.'}
        </Text>

        <View style={styles.tabs}>
          <PrimaryButton label="Login" tone={mode === 'login' ? 'primary' : 'soft'} onPress={() => setMode('login')} style={styles.tabButton} />
          <PrimaryButton label="Register" tone={mode === 'register' ? 'primary' : 'soft'} onPress={() => setMode('register')} style={styles.tabButton} />
        </View>

        {mode === 'register' ? (
          <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
        ) : null}
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" />
        <Field label="Password" value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          label={loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
          onPress={handleSubmit}
          disabled={loading}
        />
      </View>
    </Surface>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

function Field({ label, value, onChangeText, placeholder, secureTextEntry, autoCapitalize }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md,
  },
  kicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  body: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tabButton: {
    flex: 1,
  },
  field: {
    gap: 6,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
});
