import Svg, { Path } from 'react-native-svg'
import { useColorScheme, View, Text, ViewProps } from 'react-native'

const DEFAULT_COLOR_DARK = '#000000'
const DEFAULT_COLOR_LIGHT = '#ffffff'
const DEFAULT_HEIGHT = 24
const DEFAULT_WIDTH = 24

export default function RecipeFinderLogo({ ...rest }: ViewProps) {
  const colorScheme = useColorScheme()

  return (
    <View className="flex-row items-center gap-1" {...rest}>
      <Text className="text-lg font-bold text-black dark:text-white">
        Recipe
      </Text>
      <Svg
        height={DEFAULT_HEIGHT}
        viewBox="0 -960 960 960"
        width={DEFAULT_WIDTH}
        fill={colorScheme === 'dark' ? DEFAULT_COLOR_LIGHT : DEFAULT_COLOR_DARK}
      >
        <Path d="m175-120-56-56 410-410q-18-42-5-95t57-95q53-53 118-62t106 32q41 41 32 106t-62 118q-42 44-95 57t-95-5l-50 50 304 304-56 56-304-302-304 302Zm118-342L173-582q-54-54-54-129t54-129l248 250-128 128Z" />
      </Svg>
      <Text className="text-lg font-bold text-blue-500">Generator</Text>
    </View>
  )
}
