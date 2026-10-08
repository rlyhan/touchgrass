import type { ReactNode } from "react"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/auth-button"
import { GrassLogo } from "@/components/icons/grass-logo"
import { ActivityList, type ListedActivity } from "@/components/recommendations/activity-list"

type Props = {
  activities: ListedActivity[]
  header?: ReactNode
  footer?: ReactNode
}

export function ActivityListScreen({ activities, header, footer }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <ActivityList
        activities={activities}
        ListHeaderComponent={
          <>
            <View className="items-center">
              <GrassLogo />
            </View>
            {header}
          </>
        }
        ListFooterComponent={
          <>
            {footer ? <View className="mt-10">{footer}</View> : null}
            <View className="mt-12 items-center">
              <AuthButton />
            </View>
          </>
        }
      />
    </SafeAreaView>
  )
}
