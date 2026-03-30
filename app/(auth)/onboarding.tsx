import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { supabase } from '../../src/lib/supabase';
import { UserPreferences } from '../../src/types/database';
import TagChip from '../../src/components/TagChip';
import {
  CUISINE_OPTIONS,
  DISTANCE_OPTIONS,
  PRICE_OPTIONS,
} from '../../src/constants/data';

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<[number, number]>([1, 4]);
  const [selectedDistance, setSelectedDistance] = useState(5);
  const [loading, setLoading] = useState(false);

  function toggleCuisine(cuisine: string) {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  }

  function selectPriceRange(value: number) {
    setSelectedPrices((prev) => {
      if (prev[0] === value && prev[1] === value) return [1, 4];
      if (prev[0] === 1 && prev[1] === 4) return [value, value];
      return [Math.min(prev[0], value), Math.max(prev[1], value)];
    });
  }

  async function handleFinish() {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const preferences: UserPreferences = {
        cuisineTypes: selectedCuisines,
        priceRange: selectedPrices,
        maxDistance: selectedDistance,
        onboardingCompleted: true,
      };

      await supabase
        .from('profiles')
        .update({ preferences } as never)
        .eq('id', user.id);
    }

    router.replace('/(tabs)');
  }

  function handleSkip() {
    handleFinish();
  }

  const steps = [
    {
      title: 'Vos cuisines preferees',
      subtitle: 'Selectionnez les types de cuisine que vous aimez',
      content: (
        <View style={styles.optionsGrid}>
          {CUISINE_OPTIONS.map((cuisine) => (
            <TagChip
              key={cuisine}
              label={cuisine}
              selected={selectedCuisines.includes(cuisine)}
              onPress={() => toggleCuisine(cuisine)}
            />
          ))}
        </View>
      ),
    },
    {
      title: 'Votre budget',
      subtitle: 'Quelle fourchette de prix preferez-vous ?',
      content: (
        <View style={styles.optionsGrid}>
          {PRICE_OPTIONS.map((option) => {
            const isInRange =
              option.value >= selectedPrices[0] &&
              option.value <= selectedPrices[1] &&
              !(selectedPrices[0] === 1 && selectedPrices[1] === 4);
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.priceOption, isInRange && styles.priceOptionActive]}
                onPress={() => selectPriceRange(option.value)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.priceLabel,
                    isInRange && styles.priceLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ),
    },
    {
      title: 'Rayon de recherche',
      subtitle: 'A quelle distance etes-vous pret a aller ?',
      content: (
        <View style={styles.optionsGrid}>
          {DISTANCE_OPTIONS.map((distance) => (
            <TagChip
              key={distance}
              label={`${distance} km`}
              selected={selectedDistance === distance}
              onPress={() => setSelectedDistance(distance)}
            />
          ))}
        </View>
      ),
    },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progressWrap}>
        <View style={styles.progressBar}>
          {steps.map((_s, i) => (
            <View
              key={i}
              style={[styles.progressDot, i <= step && styles.progressDotActive]}
            />
          ))}
        </View>
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <View style={styles.iconWrap}>
          <Ionicons
            name={step === 0 ? 'restaurant' : step === 1 ? 'wallet' : 'location'}
            size={32}
            color={Colors.light.primary}
          />
        </View>

        <Text style={styles.title}>{currentStep.title}</Text>
        <Text style={styles.subtitle}>{currentStep.subtitle}</Text>

        <View style={styles.optionsContainer}>
          {currentStep.content}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setStep(step - 1)}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.light.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, loading && styles.nextBtnDisabled]}
          onPress={isLastStep ? handleFinish : () => setStep(step + 1)}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {loading ? 'Chargement...' : isLastStep ? 'Commencer' : 'Suivant'}
          </Text>
          {!loading && (
            <Ionicons name="arrow-forward" size={17} color={Colors.light.textOnPrimary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  progressWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 64 : 52,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
  },
  progressDotActive: {
    backgroundColor: Colors.light.primary,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.light.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 22,
    marginBottom: 32,
  },
  optionsContainer: {
    flex: 1,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  priceOption: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.light.borderLight,
  },
  priceOptionActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  priceLabelActive: {
    color: Colors.light.textOnPrimary,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 16,
  },
  backBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextBtnText: {
    color: Colors.light.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
