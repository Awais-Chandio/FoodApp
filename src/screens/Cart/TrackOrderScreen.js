import React from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AntDesign from "@react-native-vector-icons/ant-design";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../Context/ThemeProvider";
import {
  createShadow,
  layout,
  radius,
  spacing,
} from "../../constants/designSystem";
import { appImages } from "../../constants/imageRegistry";

const orderSteps = [
  {
    id: "confirmed",
    title: "Order confirmed",
    subtitle: "Your order has been received and queued for preparation.",
    done: true,
  },
  {
    id: "prepared",
    title: "Order prepared",
    subtitle: "The kitchen finished your meal and packed it securely.",
    done: true,
  },
  {
    id: "delivery",
    title: "Delivery in progress",
    subtitle: "Your rider is on the way with your order.",
    done: false,
  },
];

export default function TrackOrderScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={appImages.heroBackground}
          style={styles.mapCard}
          imageStyle={styles.mapImage}
        >
          <View style={styles.mapOverlay} />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <AntDesign name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.mapContent}>
            <Text style={styles.mapLabel}>Estimated arrival</Text>
            <Text style={styles.mapTime}>20 min</Text>
            <Text style={styles.mapMeta}>Your order is moving through the final leg.</Text>
          </View>
        </ImageBackground>

        <View style={styles.content}>
          <View
            style={[
              styles.driverCard,
              createShadow(colors.shadow, 12),
              { backgroundColor: colors.surface, borderColor: colors.borderSoft },
            ]}
          >
            <Image
              source={{ uri: "https://randomuser.me/api/portraits/men/41.jpg" }}
              style={styles.driverImage}
            />
            <View style={styles.driverContent}>
              <Text style={[styles.driverName, { color: colors.text }]}>
                George William
              </Text>
              <Text style={[styles.driverMeta, { color: colors.textSecondary }]}>
                Delivery partner
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.callButton, { backgroundColor: colors.primaryStrong }]}
            >
              <AntDesign name="phone" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.statusCard,
              createShadow(colors.shadow, 12),
              { backgroundColor: colors.surface, borderColor: colors.borderSoft },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Delivery progress
            </Text>

            {orderSteps.map((step, index) => (
              <View key={step.id} style={styles.stepRow}>
                <View style={styles.stepIndicator}>
                  <View
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: step.done
                          ? colors.success
                          : colors.primaryStrong,
                      },
                    ]}
                  >
                    <AntDesign
                      name={step.done ? "check" : "clock-circle"}
                      size={12}
                      color={colors.white}
                    />
                  </View>
                  {index < orderSteps.length - 1 ? (
                    <View
                      style={[
                        styles.stepLine,
                        { backgroundColor: colors.borderSoft },
                      ]}
                    />
                  ) : null}
                </View>

                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>
                    {step.title}
                  </Text>
                  <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
                    {step.subtitle}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapCard: {
    height: 320,
    justifyContent: "space-between",
  },
  mapImage: {
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xxxl,
    marginLeft: layout.pagePadding,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  mapContent: {
    paddingHorizontal: layout.pagePadding,
    paddingBottom: spacing.xxl,
  },
  mapLabel: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  mapTime: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginTop: spacing.sm,
  },
  mapMeta: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 14,
    marginTop: spacing.sm,
  },
  content: {
    paddingHorizontal: layout.pagePadding,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.huge,
  },
  driverCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: layout.sectionGap,
  },
  driverImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  driverContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "800",
  },
  driverMeta: {
    marginTop: spacing.xs,
    fontSize: 13,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  statusCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: spacing.lg,
  },
  stepRow: {
    flexDirection: "row",
  },
  stepIndicator: {
    alignItems: "center",
    marginRight: spacing.md,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  stepContent: {
    flex: 1,
    paddingBottom: spacing.xl,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  stepSubtitle: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 19,
  },
});
