import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";

export default function MovableText({
  initialText,
  inputRef,
  handleRemove,
}: {
  initialText: string;
  inputRef: React.RefObject<TextInput | null>;
  handleRemove: () => void;
}) {
  const [text, setText] = useState(initialText);
  const [isFocused, setIsFocused] = useState(false);

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
      <Animated.View style={[styles.box, animatedStyle]}>
        {isFocused ? (
          <>
            <TextInput
              ref={inputRef}
              style={{
                borderWidth: isFocused ? 1 : 0,
                ...styles.textInput,
              }}
              value={text}
              onChangeText={setText}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <Pressable onPress={() => handleRemove()} pointerEvents="box-none">
              <IconSymbol size={28} name="trash" color="#999" />
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={() => {
              setIsFocused(true);
            }}
            style={styles.textInput}
          >
            <ThemedText style={styles.text}>{text}</ThemedText>
          </Pressable>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    position: "absolute",
  },
  textInput: {
    padding: 8,
    fontSize: 24,
    minWidth: 100,
    textAlign: "center",
    borderColor: "#999",
    borderStyle: "dashed",
    borderRadius: 4,
  },
  text: {
    padding: 8,
    fontSize: 24,
    minWidth: 100,
    textAlign: "center",
    color: "#11181C",
  },
});
