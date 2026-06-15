import { LinearGradient } from "expo-linear-gradient"
import { router, type Href } from "expo-router"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { GrassLogo } from "@/components/icons/grass-logo"
import { colors } from "@/lib/theme/colors"

export default function LandingScreen() {
  return (
    <LinearGradient
      colors={["#ffffff", "#F0FDF6"]}
      locations={[0, 1]}
      style={StyleSheet.absoluteFill}
    >
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.hero}>
          <GrassLogo size={88} color={colors.emerald[500]} />
          <Text style={styles.title}>touchgrass</Text>
          <Text style={styles.tagline}>
            Discover activities that align with your personality — and where you are right now.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.btnPrimaryPressed]}
            onPress={() => router.push("/onboarding/name" as Href)}
            accessibilityRole="button"
            accessibilityLabel="Sign up"
          >
            <Text style={styles.btnPrimaryText}>Sign up</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.btn, styles.btnGhost, pressed && styles.btnGhostPressed]}
            onPress={() => router.push("/sign-in" as Href)}
            accessibilityRole="button"
            accessibilityLabel="Log in"
          >
            <Text style={styles.btnGhostText}>Log in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  title: {
    marginTop: 24,
    fontSize: 48,
    fontWeight: "700",
    color: colors.gray[900],
    letterSpacing: -1.5,
  },
  tagline: {
    marginTop: 20,
    fontSize: 17,
    lineHeight: 26,
    color: colors.gray[500],
    textAlign: "center",
    maxWidth: 280,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    gap: 12,
  },
  btn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: {
    backgroundColor: colors.emerald[500],
  },
  btnPrimaryPressed: {
    backgroundColor: colors.emerald[600],
  },
  btnGhost: {
    borderWidth: 1.5,
    borderColor: colors.emerald[500],
  },
  btnGhostPressed: {
    backgroundColor: colors.emerald[100],
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  btnGhostText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.emerald[600],
  },
})
