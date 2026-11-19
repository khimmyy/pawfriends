import LOGO from '@/constants/logo-shape.json';
import { useColors } from '@/context/theme';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Polygon } from 'react-native-svg';

type PawLogoProps = {
  /** Width and height in points. */
  size?: number;
  /** Paw color. */
  color?: string;
  /** Color of the heart in the pad. */
  heartColor?: string;
  /** Read out by screen readers; pass null when the logo sits next to the app name. */
  accessibilityLabel?: string | null;
};

const HEART_POINTS = LOGO.heart.points.map(([x, y]) => `${x},${y}`).join(' ');

/**
 * The PawFriends logo: one paw with a heart in its pad.
 * The shapes come from constants/logo-shape.json, which also generates the app icons
 * (scripts/generate-logo-assets.js), so the logo matches everywhere.
 */
export function PawLogo({
  size = 48,
  color: colorProp,
  heartColor: heartColorProp,
  accessibilityLabel = 'PawFriends logo',
}: PawLogoProps) {
  // Default to the active theme's violet and coral.
  const colors = useColors();
  const color = colorProp ?? colors.primary;
  const heartColor = heartColorProp ?? colors.heart;
  // Accessibility props go on a wrapping View: on the web, react-native-svg would pass them
  // to the <svg> element as invalid HTML attributes.
  const accessibilityProps =
    accessibilityLabel === null
      ? {}
      : { accessible: true, accessibilityLabel, accessibilityRole: 'image' as const };

  return (
    <View style={{ width: size, height: size }} {...accessibilityProps}>
      <Svg width={size} height={size} viewBox={`0 0 ${LOGO.viewBox} ${LOGO.viewBox}`}>
        <G fill={color}>
          {LOGO.toes.map((toe) => (
            <Ellipse
              key={`${toe.cx}-${toe.cy}`}
              cx={toe.cx}
              cy={toe.cy}
              rx={toe.rx}
              ry={toe.ry}
              transform={`rotate(${toe.rotate} ${toe.cx} ${toe.cy})`}
            />
          ))}
          <Ellipse cx={LOGO.pad.cx} cy={LOGO.pad.cy} rx={LOGO.pad.rx} ry={LOGO.pad.ry} />
        </G>
        <G fill={heartColor}>
          {LOGO.heart.circles.map((circle) => (
            <Circle key={circle.cx} cx={circle.cx} cy={circle.cy} r={circle.r} />
          ))}
          <Polygon points={HEART_POINTS} />
        </G>
      </Svg>
    </View>
  );
}
