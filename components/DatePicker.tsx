import { Colors } from "@/constants/Colors";
import { spacing } from "@/constants/Spacing";
import { fontSizes } from "@/constants/FontSize";
import {
  Icon,
  SafeAreaView,
  Text,
  TouchableOpacity,
  useChTheme,
  View,
} from "./Themed";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Modal } from "react-native";

import { Dimensions } from "react-native";
import { Select } from "./Select";

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 7;
const CELL_SIZE = (SCREEN_WIDTH - spacing.xl * 2) / NUM_COLUMNS;

export type DateSelectValue = {
  date: Date;
  dateEnd?: Date | null;
};

type DateSelectType = "date-time" | "date" | "time" | "date-range";

export type DateSelectProps = {
  date: string | null | undefined;
  dateEnd?: string | null | undefined;
  onConfirm: (date: DateSelectValue) => void;
  type?: DateSelectType;
};

const formats: {
  [key in DateSelectType]: {
    label: string;
    localeDate: Intl.DateTimeFormatOptions;
  };
} = {
  "date-time": {
    label: "Date & time",
    localeDate: {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  },
  date: {
    label: "Date",

    localeDate: {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  },
  time: {
    label: "Time",
    localeDate: {
      hour: "2-digit",
      minute: "2-digit",
    },
  },
  "date-range": {
    label: "Date range",
    localeDate: {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  },
};

const today = new Date();

const yearInitial = today.getFullYear();
const years = Array.from({ length: 150 }, (_, i) => yearInitial - 99 + i);

export const months: Record<number, string> = {
  0: "January",
  1: "February",
  2: "March",
  3: "April",
  4: "May",
  5: "June",
  6: "July",
  7: "August",
  8: "September",
  9: "October",
  10: "November",
  11: "December",
};

const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const getDaysInMonth = (month: number, year: number) =>
  new Date(year, month + 1, 0).getDate();

const stylesButton = {
  current: {
    selected: {
      backgroundColor: Colors.blue[500],
      color: Colors.white,
    },
    unselected: {
      backgroundColor: "transparent",
      color: Colors.blue[500],
    },
  },
  item: {
    selected: {
      backgroundColor: Colors.blue[200],
      color: Colors.blue[500],
    },
    unselected: {},
  },
  currentRange: {
    start: {
      selected: {
        backgroundColor: Colors.blue[500],
        color: Colors.white,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      },
    },
    end: {
      selected: {
        backgroundColor: Colors.blue[500],
        color: Colors.white,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      },
    },
  },

  itemRange: {
    selected: {
      backgroundColor: Colors.blue[200],
      color: Colors.blue[500],
      borderRadius: 0,
    },
  },
};
export const DatePicker = ({
  date: value,
  onConfirm: onChange,
  type = "date-time",
  dateEnd = null,
}: DateSelectProps) => {
  const [show, setShow] = useState(false);
  const current = value ? new Date(value) : new Date();
  const currentDateEnd = dateEnd ? new Date(dateEnd) : null;

  const [selectedDate, setSelectedDate] = useState(current);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(current.getMonth());
  const [visibleYear, setVisibleYear] = useState(current.getFullYear());

  const [minute, setMinute] = useState(current.getMinutes());
  const [hour, setHour] = useState(current.getHours() % 12 || 12);
  const [ampm, setAmpm] = useState(current.getHours() >= 12 ? "PM" : "AM");

  const firstDay = new Date(visibleYear, visibleMonth, 1).getDay();
  const offset = firstDay === 0 ? 7 : firstDay - 1;
  const { ch } = useChTheme();

  const offsetDays = offset >= 7 ? [] : Array(offset).fill(null);
  const daysInMonth = getDaysInMonth(visibleMonth, visibleYear);
  const days = [
    ...offsetDays,
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const handleSelectDay = (day: number) => {
    const date = new Date(visibleYear, visibleMonth, day);

    if (type === "date-range") {
      if (!selectedDate || (selectedDate && selectedEndDate)) {
        setSelectedDate(date);
        setSelectedEndDate(null);
      } else if (date.getTime() < selectedDate.getTime()) {
        setSelectedDate(date);
      } else {
        setSelectedEndDate(date);
      }
    } else {
      setSelectedDate(date);
    }
  };

  const confirm = () => {
    const adjustedHour = ampm === "PM" ? (hour % 12) + 12 : hour % 12;
    selectedDate.setHours(adjustedHour);
    selectedDate.setMinutes(minute);
    setShow(false);

    onChange({
      // iso: selectedDate.toISOString(),
      date: selectedDate,
      dateEnd: selectedEndDate ?? null,
    });
  };

  const changeMonth = (direction: "next" | "prev") => {
    if (direction === "next") {
      if (visibleMonth === 11) {
        setVisibleMonth(0);
        setVisibleYear((prev) => prev + 1);
      } else {
        setVisibleMonth((prev) => prev + 1);
      }
    } else {
      if (visibleMonth === 0) {
        setVisibleMonth(11);
        setVisibleYear((prev) => prev - 1);
      } else {
        setVisibleMonth((prev) => prev - 1);
      }
    }
  };

  const getLabel = useMemo(() => {
    if (type === "date-range") {
      const startDate = current.toLocaleDateString(
        "en-US",
        formats[type].localeDate
      );
      const endDate = currentDateEnd
        ? currentDateEnd?.toLocaleDateString("en-US", formats[type].localeDate)
        : "N/A";
      return `${startDate} - ${endDate}`;
    }
    if (type === "time") {
      const formatTime = new Intl.DateTimeFormat(
        "en-US",
        formats[type].localeDate
      );
      return formatTime.format(current);
    }
    return current.toLocaleDateString("en-US", formats[type].localeDate);
  }, [current]);

  useEffect(() => {
    if (!show) return;
    setSelectedDate(current);
    setVisibleMonth(current.getMonth());
    setVisibleYear(current.getFullYear());
    setMinute(current.getMinutes());
    setHour(current.getHours() % 12 || 12);
    setAmpm(current.getHours() >= 12 ? "PM" : "AM");
    if (currentDateEnd) {
      setSelectedEndDate(currentDateEnd);
    }
  }, [show]);

  return (
    <>
      <TouchableOpacity
        style={(ch) => ({
          backgroundColor: ch(Colors.neutral[800], Colors.neutral[100]),
          padding: spacing.xl,
          borderRadius: spacing.md,
        })}
        onPress={() => setShow(true)}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: spacing.lg,
          }}
        >
          <Icon
            name="calendar-today"
            size={18}
            color={(ch) => ch(Colors.neutral[100], Colors.neutral[500])}
          />
          {type === "date-range" ? (
            <Text>{getLabel}</Text>
          ) : (
            <Text>{value ? getLabel : `Select ${formats[type].label}`}</Text>
          )}
        </View>
      </TouchableOpacity>

      <Modal
        visible={show}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShow(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            backgroundColor: "rgba(100, 95, 95, 0.4)",
            flex: 1,
            justifyContent: "flex-end",
          }}
          onPress={() => setShow(false)}
        >
          <TouchableOpacity
            on
            style={{
              padding: spacing.xl,
              display: "flex",
              flexDirection: "column",
              borderTopStartRadius: spacing.xl2,
              borderTopEndRadius: spacing.xl2,
            }}
            activeOpacity={1}
            onPress={(e) => e?.stopPropagation()}
          >
            <SafeAreaView style={{ backgroundColor: "transparent" }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: spacing.xl,
                }}
              >
                <Text style={{ fontWeight: "bold", fontSize: fontSizes.lg }}>
                  Select {formats[type].label}
                </Text>
                <TouchableOpacity
                  onPress={() => setShow(false)}
                  style={{ padding: spacing.lg }}
                >
                  <Icon
                    size={24}
                    name="close"
                    color={(ch) => ch(Colors.neutral[100], Colors.neutral[500])}
                  />
                </TouchableOpacity>
              </View>

              {type === "date-time" ||
              type === "date" ||
              type === "date-range" ? (
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: spacing.lg,
                    borderRadius: spacing.lg,
                    marginBottom: spacing.lg,
                  }}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingLeft: spacing.lg,
                    }}
                  >
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing.md,
                      }}
                    >
                      <Select
                        items={Object.entries(months).map(([key, value]) => ({
                          id: `${Number(key)}`,
                          label: `${value}`,
                          value: `${Number(key)}`, // o usa el mismo valor según necesites
                        }))}
                        onSelect={(e) => {
                          const newMonth = Number(e);
                          setVisibleMonth(newMonth);
                        }}
                        value={`${visibleMonth}`}
                        buttonViewStyle={{
                          paddingHorizontal: spacing.lg,
                          paddingVertical: spacing.md,
                          borderRadius: spacing.xl,
                          minWidth: 65,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: ch(
                            Colors.neutral[700],
                            Colors.neutral[100]
                          ),
                        }}
                      />
                      <Select
                        items={
                          Array.isArray(years)
                            ? years?.map((e) => ({
                                id: `${e}`,
                                label: `${e}`,
                                value: `${e}`,
                              }))
                            : []
                        }
                        onSelect={(e) => {
                          const newYear = Number(e);
                          setVisibleYear(newYear);
                        }}
                        value={`${visibleYear}`}
                        buttonViewStyle={{
                          paddingHorizontal: spacing.lg,
                          paddingVertical: spacing.md,
                          borderRadius: spacing.xl,
                          minWidth: 65,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: ch(
                            Colors.neutral[700],
                            Colors.neutral[100]
                          ),
                        }}
                      />
                    </View>
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        onPress={() => changeMonth("prev")}
                      >
                        <Icon
                          name="chevron-left"
                          size={24}
                          color={(ch) =>
                            ch(Colors.neutral[100], Colors.neutral[500])
                          }
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        onPress={() => changeMonth("next")}
                      >
                        <Icon
                          name="chevron-right"
                          size={24}
                          color={(ch) =>
                            ch(Colors.neutral[100], Colors.neutral[500])
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View>
                    <FlatList
                      numColumns={7}
                      data={weekDays}
                      renderItem={({ item: day }) => {
                        return (
                          <View
                            key={day}
                            style={{
                              width: CELL_SIZE,
                              justifyContent: "center",
                              alignItems: "center",
                              display: "flex",
                            }}
                          >
                            <Text
                              style={{
                                textAlign: "center",
                                fontWeight: "600",
                                opacity: 0.5,
                                textTransform: "uppercase",
                              }}
                            >
                              {day}
                            </Text>
                          </View>
                        );
                      }}
                    />
                  </View>

                  <FlatList
                    numColumns={7}
                    data={days}
                    renderItem={({ item, index: indx }) => {
                      if (item === null) {
                        return (
                          <View
                            key={indx}
                            style={(ch) => ({
                              height: CELL_SIZE,
                              width: CELL_SIZE,
                            })}
                          />
                        );
                      }

                      const isThisMonth =
                        today.getMonth() === visibleMonth &&
                        today.getFullYear() === visibleYear;

                      const isToday = item === today.getDate() && isThisMonth;

                      const currentItemDate = new Date(
                        visibleYear,
                        visibleMonth,
                        item
                      );

                      const isSameDate = (d1?: Date, d2?: Date) =>
                        d1?.getDate() === d2?.getDate() &&
                        d1?.getMonth() === d2?.getMonth() &&
                        d1?.getFullYear() === d2?.getFullYear();

                      const isSelectedDate = (
                        date?: Date | undefined | null
                      ) => {
                        if (!date) return false;
                        return isSameDate(currentItemDate, date);
                      };

                      const isInRange = (
                        start?: Date,
                        end?: Date | undefined | null
                      ) => {
                        if (!start || !end) return false;
                        const time = currentItemDate.getTime();
                        return start.getTime() <= time && time <= end.getTime();
                      };

                      const getButtonStyle = () => {
                        if (type === "date-range") {
                          const isStart = isSelectedDate(selectedDate);
                          const isEnd = isSelectedDate(selectedEndDate);

                          if (isStart) {
                            return stylesButton.currentRange?.start.selected;
                          }

                          if (isEnd) {
                            return stylesButton.currentRange?.end.selected;
                          }

                          if (isInRange(selectedDate, selectedEndDate)) {
                            return stylesButton.itemRange?.selected;
                          }

                          return stylesButton.item?.unselected;
                        }

                        if (isSelectedDate(selectedDate)) {
                          return isToday && isThisMonth
                            ? stylesButton.current?.selected
                            : stylesButton.item?.selected;
                        }

                        return isToday && isThisMonth
                          ? stylesButton.current?.unselected
                          : stylesButton.item?.unselected;
                      };

                      const chooseStyle = getButtonStyle();
                      return (
                        <TouchableOpacity
                          key={`day-item-${item}`}
                          style={(ch) => ({
                            borderRadius: spacing.lg,
                            height: CELL_SIZE,
                            width: CELL_SIZE,
                            justifyContent: "center",
                            alignItems: "center",
                            position: "relative",
                            ...chooseStyle,
                          })}
                          onPress={() => handleSelectDay(item)}
                        >
                          <Text
                            style={(ch) => ({
                              fontWeight: "600",
                              fontSize: spacing.xl,
                              ...chooseStyle,
                            })}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              ) : null}
              {type === "date-time" || type === "time" ? (
                <View
                  style={(ch) => ({
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: ch(
                      Colors.neutral[600],
                      Colors.neutral[100]
                    ),
                    marginBottom: spacing.xl,
                    padding: spacing.lg,
                    borderRadius: spacing.lg,
                  })}
                >
                  <View>
                    <Text>Time</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: spacing.lg,
                      marginTop: spacing.md,
                    }}
                  >
                    <Select
                      items={Array.from({ length: 12 }, (_, i) => ({
                        id: `${i + 1}`,
                        label: `${(i + 1).toString().padStart(2, "0")}`,
                        value: `${i + 1}`,
                      }))}
                      value={`${hour}`}
                      onSelect={(val) => setHour(Number(val))}
                      buttonViewStyle={{
                        paddingHorizontal: spacing.lg,
                        paddingVertical: spacing.md,
                        borderRadius: spacing.xl,
                        backgroundColor: ch(
                          Colors.neutral[700],
                          Colors.neutral[50]
                        ),
                      }}
                    />
                    <Text style={{ fontWeight: "bold" }}>:</Text>
                    <Select
                      items={Array.from({ length: 60 }, (_, i) => ({
                        id: `${i}`,
                        label: `${i.toString().padStart(2, "0")}`,
                        value: `${i}`,
                      }))}
                      value={`${minute}`}
                      onSelect={(val) => setMinute(Number(val))}
                      buttonViewStyle={{
                        paddingHorizontal: spacing.lg,
                        paddingVertical: spacing.md,
                        borderRadius: spacing.xl,
                        backgroundColor: ch(
                          Colors.neutral[700],
                          Colors.neutral[50]
                        ),
                      }}
                    />
                    <Select
                      items={["AM", "PM"].map((val) => ({
                        id: val,
                        label: val,
                        value: val,
                      }))}
                      value={ampm}
                      onSelect={(val) => setAmpm(val)}
                      buttonViewStyle={{
                        paddingHorizontal: spacing.lg,
                        paddingVertical: spacing.md,
                        borderRadius: spacing.xl,
                        backgroundColor: ch(
                          Colors.neutral[700],
                          Colors.neutral[50]
                        ),
                      }}
                    />
                  </View>
                </View>
              ) : null}

              <View
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "flex-end",
                  flexDirection: "row",
                }}
              >
                <TouchableOpacity
                  onPress={confirm}
                  style={(ch) => ({
                    backgroundColor: Colors.blue[500],
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: spacing.lg,
                    padding: spacing.xl,
                    display: "flex",
                    flexDirection: "row",
                    gap: spacing.lg,
                    flex: 1,
                  })}
                >
                  <Text
                    style={(ch) => ({
                      color: Colors.white,
                      fontWeight: "bold",
                      fontSize: fontSizes.md,
                    })}
                  >
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
