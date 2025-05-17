import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { DatePicker } from "../components/DatePicker";
import { useState } from "react";
import { SafeAreaView, Text, View } from "@/components/Themed";
import { spacing } from "@/constants/Spacing";

const today = new Date().toISOString();
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 5);
const tomorrowISO = tomorrow.toISOString();

export default function App() {
  const [date, setDate] = useState(today);
  const [dateEnd, setDateEnd] = useState<string | null>(tomorrowISO);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>expo-date-picker</Text>
        <Text on style={styles.description}>
          A customizable component to pick dates, times, or both. It supports
          multiple types ("time", "date", "date-time"), adapts to light and dark
          themes, and works with ISO 8601 format.
        </Text>

        <StatusBar style="auto" />

        <Text>DatePicker (time)</Text>
        <DatePicker
          type="time"
          onConfirm={(e) => {
            setDate(e?.date?.toISOString());
          }}
          date={date}
        />

        <Text>DatePicker (date)</Text>
        <DatePicker
          type="date"
          onConfirm={(e) => setDate(e?.date?.toISOString())}
          date={date}
        />

        <Text>DatePicker (date-time)</Text>
        <DatePicker
          type="date-time"
          onConfirm={(e) => setDate(e?.date?.toISOString())}
          date={date}
        />
        <Text>DatePicker (date-range)</Text>

        <DatePicker
          type="date-range"
          onConfirm={(e) => {
            setDate(e?.date?.toISOString());
            setDateEnd(e?.dateEnd?.toISOString() ?? null);
          }}
          date={date}
          dateEnd={dateEnd}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: spacing.xl,
    padding: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
  },
});
