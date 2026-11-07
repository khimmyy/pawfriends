import { PawLogo } from '@/components/paw-logo';
import { BRAND_FONTS } from '@/constants/fonts';
import { type Palette } from '@/constants/colors';
import { useColors } from '@/context/theme';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

/** Long enough to see one full wave. */
const MIN_VISIBLE_MS = 1700;
const FADE_OUT_MS = 350;
const WAVE_STEP_MS = 180;
const WAVE_PAUSE_MS = 500;
const LOGO_SIZE = 132;

type AnimatedSplashProps = {
  /** True once the app has finished loading and can be shown. */
  ready: boolean;
  /** Called after the splash has faded out. */
  onFinish: () => void;
};

/**
 * The PawFriends paw logo waving hello while the app loads. Shown over the app on launch,
 * it takes over from the native splash and fades out once `ready` is true
 * and it has been visible for at least MIN_VISIBLE_MS.
 */
export function AnimatedSplash({ ready, onFinish }: AnimatedSplashProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const reduceMotion = useReducedMotion();
  const [minTimePassed, setMinTimePassed] = useState(false);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(reduceMotion ? 1 : 0.6);
  const wave = useSharedValue(0);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withDelay(250, withTiming(1, { duration: 500 }));
    if (!reduceMotion) {
      scale.value = withSpring(1, { damping: 9, stiffness: 140 });
      const easing = Easing.inOut(Easing.quad);
      // Three quick waves from the base of the paw, then a short rest.
      wave.value = withDelay(
        200,
        withRepeat(
          withSequence(
            withTiming(18, { duration: WAVE_STEP_MS, easing }),
            withTiming(-12, { duration: WAVE_STEP_MS, easing }),
            withTiming(18, { duration: WAVE_STEP_MS, easing }),
            withTiming(-12, { duration: WAVE_STEP_MS, easing }),
            withTiming(0, { duration: WAVE_STEP_MS, easing }),
            withDelay(WAVE_PAUSE_MS, withTiming(0, { duration: 0 }))
          ),
          -1
        )
      );
    }
    const timer = setTimeout(() => setMinTimePassed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [reduceMotion, scale, titleOpacity, wave]);

  useEffect(() => {
    if (!ready || !minTimePassed) {
      return;
    }
    opacity.value = withTiming(0, { duration: FADE_OUT_MS });
    const timer = setTimeout(onFinish, FADE_OUT_MS);
    return () => clearTimeout(timer);
  }, [ready, minTimePassed, opacity, onFinish]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const pawStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${wave.value}deg` }],
  }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.container, containerStyle]}
      // Hide the native splash only once this screen is on screen, so there is no blank frame between them.
      onLayout={() => SplashScreen.hide()}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="PawFriends is loading"
    >
      <Animated.View style={[styles.paw, pawStyle]}>
        <PawLogo size={LOGO_SIZE} accessibilityLabel={null} />
      </Animated.View>
      <Animated.View style={titleStyle}>
        <Text style={styles.title}>PawFriends</Text>
        <Text style={styles.subtitle}>Hello, friend!</Text>
      </Animated.View>
    </Animated.View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
  container: {
    // Matches the native splash background in app.json (light and dark), so the hand-over is seamless.
    backgroundColor: c.page,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    zIndex: 10,
  },
  // Pivot near the bottom of the pad, like a hand waving from the wrist.
  paw: { transformOrigin: '50% 90%' },
  title: { fontSize: 38, fontFamily: BRAND_FONTS.bold, color: c.primary, textAlign: 'center' },
  subtitle: { fontSize: 17, fontFamily: BRAND_FONTS.semiBold, color: c.muted, textAlign: 'center', marginTop: 2 },
});
