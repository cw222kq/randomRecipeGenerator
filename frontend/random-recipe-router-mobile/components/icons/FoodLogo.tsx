import Svg, { SvgProps, Path } from 'react-native-svg'
import { useColorScheme } from 'react-native'

interface FoodLogoProps extends SvgProps {
  height?: number | string
  width?: number | string
  fill?: string
}

const DEFAULT_COLOR_DARK = '#000000'
const DEFAULT_COLOR_LIGHT = '#ffffff'
const DEFAULT_HEIGHT = 24
const DEFAULT_WIDTH = 24

export default function FoodLogo({
  height = DEFAULT_HEIGHT,
  width = DEFAULT_WIDTH,
  ...rest
}: FoodLogoProps) {
  const colorScheme = useColorScheme()

  return (
    <Svg
      height={height}
      viewBox="0 -960 960 960"
      width={width}
      fill={colorScheme === 'dark' ? DEFAULT_COLOR_LIGHT : DEFAULT_COLOR_DARK}
      {...rest}
    >
      <Path d="m175-120-56-56 410-410q-18-42-5-95t57-95q53-53 118-62t106 32q41 41 32 106t-62 118q-42 44-95 57t-95-5l-50 50 304 304-56 56-304-302-304 302Zm118-342L173-582q-54-54-54-129t54-129l248 250-128 128Z" />
    </Svg>
  )
}
