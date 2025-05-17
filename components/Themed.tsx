/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import {
  Text as DefaultText,
  View as DefaultView,
  TextStyle,
  ViewStyle,
  TextInput as DefaultTextInput,
  TextInputProps as DefaultTextInputProps,
  ActivityIndicator as DefaultActivityIndicator,
  StyleProp,
  SafeAreaView as DefaultSafeAreaView,
  useColorScheme,
} from "react-native";
import FontAwesome from "@expo/vector-icons/MaterialIcons";
import { MaterialIcons } from "@expo/vector-icons";
export type MaterialIconName = keyof typeof MaterialIcons.glyphMap;
export { useColorScheme } from "react-native";

import { Colors, themeColor } from "@/constants/Colors";
import {
  TouchableOpacity as DefaultTouchableOpacity,
  TouchableOpacityProps as DefaultTouchableOpacityProps,
} from "react-native";
import { ReactNode } from "react";
import { spacing } from "@/constants/Spacing";
type FnStyle<T = null> = (
  ch: (dark: string, light: string) => string
) => T | ViewStyle;
type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
  on?: boolean;
};

export type TextProps = ThemeProps &
  Omit<DefaultText["props"], "style"> & {
    style?: TextStyle | FnStyle<TextStyle>;
  };
export type ViewProps = ThemeProps &
  Omit<DefaultView["props"], "style"> & {
    style?: ViewStyle | FnStyle<ViewStyle>;
  };
export type TouchableProps = ThemeProps &
  Omit<DefaultTouchableOpacityProps, "style"> & {
    style?: ViewStyle | FnStyle<ViewStyle>;
  };

export const useChTheme = () => {
  const theme = useColorScheme() ?? "light";

  const ch = (dark: string, light: string) => {
    if (theme === "dark") return dark;
    return light;
  };
  return {
    ch,
    theme,
  };
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof themeColor.light & keyof typeof themeColor.dark
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return themeColor[theme][colorName];
  }
}

export type IconProps = {
  color: string | ((ch: (dark: string, light: string) => string) => string);
  size: number;
  name: MaterialIconName;
  style?: StyleProp<TextStyle>;
};

export const Icon = ({ color, size, name, style }: IconProps) => {
  const { ch } = useChTheme();

  return (
    <FontAwesome
      size={size}
      name={name}
      color={typeof color === "string" ? color : color?.(ch)}
      style={[style]}
    />
  );
};

type SafeAreaViewProps = ThemeProps & {
  on?: boolean;
  children: ReactNode;
  style?: ViewStyle | FnStyle;
};
export const SafeAreaView = (props: SafeAreaViewProps) => {
  const { style, lightColor, darkColor, children } = props;
  const { ch } = useChTheme();
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );
  const vStyle = typeof style === "function" ? style?.(ch) : style;
  return (
    <DefaultSafeAreaView
      {...props}
      style={[
        {
          backgroundColor,
        },
        vStyle,
      ]}
    >
      {children}
    </DefaultSafeAreaView>
  );
};
export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  const { ch } = useChTheme();

  const vStyle = typeof style === "function" ? style?.(ch) : style;

  return (
    <DefaultText
      style={[{ display: "flex" }, { color }, vStyle as TextStyle]}
      {...otherProps}
    />
  );
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, on = false, ...otherProps } = props;
  const { ch } = useChTheme();

  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );
  const vStyle = typeof style === "function" ? style?.(ch) : style;
  return (
    <DefaultView
      style={[{ display: "flex" }, on ? { backgroundColor } : {}, vStyle]}
      {...otherProps}
    />
  );
}

export function TouchableOpacity(props: TouchableProps) {
  const { style, lightColor, darkColor, on = false, ...otherProps } = props;
  const { ch } = useChTheme();

  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );
  const vStyle = typeof style === "function" ? style?.(ch) : style;

  return (
    <DefaultTouchableOpacity
      style={[{ display: "flex" }, on ? { backgroundColor } : {}, vStyle]}
      {...otherProps}
    />
  );
}

export type InputProps = Omit<DefaultTextInputProps, "style"> & {
  lightColor?: string;
  darkColor?: string;
  on?: boolean;
  style?: TextStyle | FnStyle<TextStyle>;
};

export function Input(props: InputProps) {
  const { lightColor, darkColor, style, on, ...otherProps } = props;

  const textColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "text"
  );
  const { ch } = useChTheme();

  const inputStyle =
    typeof style === "function" ? (style?.(ch) as TextStyle) : style;

  return (
    <DefaultTextInput
      style={[
        { display: "flex" },
        {
          padding: spacing.xl,
          borderRadius: spacing.md,
          color: textColor,
          backgroundColor: ch(Colors.neutral[800], Colors.neutral[50]),
        },
        inputStyle,
      ]}
      placeholderTextColor={ch(Colors.neutral[100], Colors.neutral[800])}
      {...otherProps}
    />
  );
}

export function ActivityLoader(props: {
  size?: "small" | "large";
  color?: FnStyle<any>;
}) {
  const { ch } = useChTheme();

  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <DefaultActivityIndicator
        size={props.size || "large"}
        color={props.color?.(ch) ?? "black"}
      />
    </View>
  );
}
