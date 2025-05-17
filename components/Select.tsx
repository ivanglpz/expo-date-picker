import { Colors } from "@/constants/Colors";
import {
  Icon,
  Input,
  MaterialIconName,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "./Themed";
import { spacing } from "@/constants/Spacing";
// import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { FlatList, Modal, ScrollView, ViewStyle } from "react-native";
import { fontSizes } from "@/constants/FontSize";

export type Props = {
  value: string | null | undefined;
  onSelect: (va: string) => void;
  items: {
    id: string;
    label: string;
    value: string;
  }[];
  style?: ViewStyle;
  label?: string;
  description?: string;
  labelIcon?: MaterialIconName;
  buttonViewStyle?: ViewStyle;
};
export const Select = ({
  items,
  value,
  onSelect,
  style = {},
  label,
  description = "",
  labelIcon,
  buttonViewStyle,
}: Props) => {
  const [show, setshow] = useState(false);
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const filteredItems = items?.filter((e) =>
    e?.label?.toLowerCase()?.trim()?.includes(text?.toLowerCase().trim())
  );

  useEffect(() => {
    if (!show) return;
    const index = filteredItems?.findIndex((e) => e.value === value);
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: index,
        animated: true,
      });
    }, 300);
  }, [show]);

  return (
    <>
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          gap: spacing.lg,
          ...style,
        }}
      >
        {labelIcon || label ? (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.lg,
            }}
          >
            {labelIcon ? (
              <Icon
                name={labelIcon}
                color={(ch) => ch(Colors.neutral[100], Colors.neutral[800])}
                size={22}
              />
            ) : null}
            {label ? (
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: fontSizes.sm,
                }}
              >
                {label}
              </Text>
            ) : null}
          </View>
        ) : null}
        {description ? (
          <Text
            style={{
              fontSize: fontSizes.sm,
              opacity: 0.8,
            }}
          >
            {description}
          </Text>
        ) : null}
        <TouchableOpacity
          style={(ch) => ({
            backgroundColor: ch(Colors.neutral[700], Colors.neutral[50]),
            padding: spacing.xl,
            borderRadius: spacing.md,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            ...buttonViewStyle,
          })}
          onPress={() => setshow((p) => !p)}
        >
          <Text>
            {items?.find((e) => e?.value === value)?.label ??
              "Select an option"}
          </Text>
          <Icon
            name="chevron-right"
            size={18}
            style={{
              transform: [{ rotate: "90deg" }],
            }}
            color={(ch) => ch(Colors.neutral[100], Colors.neutral[900])}
          />
        </TouchableOpacity>
      </View>
      <Modal
        visible={show}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setshow(false)}
      >
        <SafeAreaView
          style={{
            flex: 1,
          }}
        >
          <View
            on
            style={{
              padding: spacing.xl,
              flex: 1,
            }}
          >
            <View
              style={{
                flexDirection: "column",
                gap: spacing.lg,
                paddingBottom: spacing.xl,
              }}
            >
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "bold", fontSize: fontSizes.lg }}>
                  Select an option
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setshow(false);
                  }}
                  style={{
                    padding: spacing.xl,
                  }}
                >
                  <Icon
                    size={24}
                    name="close"
                    color={(ch) => ch(Colors.neutral[100], Colors.neutral[500])}
                  />
                </TouchableOpacity>
              </View>
              <Input
                placeholder="Search"
                value={text}
                onChangeText={(e) => setText(e)}
              />
            </View>
            <FlatList
              ref={flatListRef}
              data={filteredItems}
              keyExtractor={({ id, label, value }, index) =>
                `selector-${label}-${id}-${value}-${index}`
              }
              renderItem={({ item: e, index }) => (
                <TouchableOpacity
                  key={e?.id}
                  style={(ch) => ({
                    backgroundColor: ch(
                      Colors.neutral[e.value === value ? 700 : 800],
                      Colors.neutral[e.value === value ? 100 : 50]
                    ),
                    padding: spacing.xl,
                    borderRadius: spacing.md,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    minHeight: 50, // <-- Clave para que getItemLayout funcione
                  })}
                  onPress={() => {
                    setshow(false);
                    onSelect(e?.value);
                  }}
                >
                  <Text>{e?.label}</Text>
                  {e?.value === value ? (
                    <Icon
                      name="check"
                      size={18}
                      color={(ch) =>
                        ch(Colors.neutral[100], Colors.neutral[500])
                      }
                    />
                  ) : null}
                </TouchableOpacity>
              )}
              getItemLayout={(_, index) => ({
                length: 50, // Ajusta si el alto del item cambia
                offset: 50 * index,
                index,
              })}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};
