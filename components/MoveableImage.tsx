import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { IconSymbol } from "./ui/IconSymbol";

export default function MoveableImage({
  uri,
  isFocused,
  handleRemove,
}: {
  uri: string;
  isFocused: boolean;
  handleRemove: () => void;
}) {
  // Shared values for pan
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  // Shared value for zoom
  const scale = useSharedValue(1);

  // Shared value for rotation
  const rotation = useSharedValue(0);

  // Pan Gesture
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = offsetX.value + e.translationX;
      translateY.value = offsetY.value + e.translationY;
    })
    .onEnd(() => {
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
    });

  // Pinch Gesture
  const pinch = Gesture.Pinch().onUpdate((e) => {
    scale.value = e.scale;
  });

  // Rotation
  const rotate = Gesture.Rotation().onUpdate((e) => {
    rotation.value = e.rotation;
  });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(pan, pinch, rotate);

  // Animated Style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotateZ: `${rotation.value}rad` },
    ],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Image source={{ uri }} style={styles.image} />
        <Pressable onPress={handleRemove}>
          <IconSymbol
            size={28}
            name="trash"
            color="#999"
            style={{ opacity: isFocused ? 1 : 0 }}
          />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  image: {
    top: 0,
    width: 150,
    height: 150,
    position: "absolute",
  },
  container: {
    gap: 8,
    flexDirection: "row",
    position: "absolute",
  },
});
