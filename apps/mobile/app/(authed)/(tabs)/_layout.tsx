import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { Tabs } from "expo-router"

import { BottomNav, type BottomNavTab } from "@/components/navigation/bottom-nav"

const TAB_ROUTES: Record<BottomNavTab, string> = {
  home: "recommendations/index",
  browse: "browse",
}

function TabBar({ state, navigation }: BottomTabBarProps) {
  const focusedRoute = state.routes[state.index].name
  const activeTab: BottomNavTab = focusedRoute === TAB_ROUTES.browse ? "browse" : "home"

  return (
    <BottomNav
      activeTab={activeTab}
      onTabPress={(tab) => navigation.navigate(TAB_ROUTES[tab])}
    />
  )
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name={TAB_ROUTES.home} />
      <Tabs.Screen name={TAB_ROUTES.browse} />
    </Tabs>
  )
}
