import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Modal,
  Image as RNImage,
  StyleSheet,
  TextInput,
  VirtualizedList,
} from "react-native";

import MoveableImage from "@/components/MoveableImage";
import MovableText from "@/components/MoveableText";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import useImageGeneratedStore from "@/components/useImageGenerated";
import { TEMPLATE } from "@/constants/Template";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ViewShot from "react-native-view-shot";

type Template = {
  id: string;
  title: string;
  img: string;
};

export default function HomeScreen() {
  const ref = useRef<ViewShot>(null);
  const inputRef = useRef<TextInput>(null);
  const { setGeneratedImages } = useImageGeneratedStore();
  const [showModal, setShowModal] = useState(false);
  const [image, setImage] = useState("");
  const [imageGenerated, setImageGenerated] = useState("");
  const [imageRatio, setImageRatio] = useState(0);
  const [imageGeneratedRatio, setImageGeneratedRatio] = useState(0);
  const [textIndex, setTextIndex] = useState([1]);
  const [images, setImages] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(true);
  const [message, setMessage] = useState("");

  const handleModal = () => setShowModal(!showModal);

  const handleRemoveText = (index: number) => {
    setTextIndex((prev) => prev.filter((item) => item !== index));
  };

  const handleAddText = () => {
    setTextIndex((prev) => [...prev, prev.length + 1]);
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((item) => item !== uri));
  };

  const handleTemplate = (item: Template) => {
    setMessage("");
    setImage((prev) => {
      if (prev !== item.img) setImageRatio(0);
      return item.img;
    });
    setImageGenerated("");
    handleModal();
  };

  const generateImage = async () => {
    setMessage("Congrats! Your meme has been generated.");
    setIsFocused(false);
    inputRef.current?.blur();
    setTimeout(() => {
      if (ref.current?.capture) {
        ref.current.capture().then((uri) => {
          setImageGenerated(uri);
          setGeneratedImages(uri);
        });
      }
      setIsFocused(true);
      setImage("");
      setImages([]);
      setTextIndex([]);
    }, 100);
  };

  const getImageSize = useCallback(async () => {
    if (image) {
      const { width, height } = await RNImage.getSize(image);
      setImageRatio(width / height);
    }
  }, [image]);

  const getImageGeneratedSize = useCallback(async () => {
    if (imageGenerated) {
      const { width, height } = await RNImage.getSize(imageGenerated);
      setImageGeneratedRatio(width / height);
    }
  }, [imageGenerated]);

  useEffect(() => {
    getImageSize();
  }, [getImageSize]);

  useEffect(() => {
    getImageGeneratedSize();
  }, [getImageGeneratedSize]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={
          <Image
            source={require("@/assets/images/partial-react-logo.png")}
            style={styles.reactLogo}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Meme generator</ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <Button title="Select meme template" onPress={handleModal} />
          {image && (
            <>
              <Button title="Generate" onPress={generateImage} />
              <ThemedView style={styles.titleContainer}>
                <Button title="Add text" onPress={handleAddText} />
                <Button title="Add image" onPress={pickImage} />
              </ThemedView>
            </>
          )}
        </ThemedView>
        {image && (
          <ViewShot
            ref={ref}
            options={{ fileName: "generated", format: "jpg", quality: 0.9 }}
          >
            <ThemedView style={styles.canvasContainer}>
              <Image
                source={{ uri: image }}
                style={{ flex: 1, height: "100%", aspectRatio: imageRatio }}
                contentFit="contain"
              />
              {textIndex.map((item) => (
                <ThemedView
                  key={item}
                  style={{
                    top: 0,
                    flex: 1,
                    width: "100%",
                    position: "absolute",
                    alignItems: "center",
                  }}
                >
                  <MovableText
                    handleRemove={() => handleRemoveText(item)}
                    initialText="Write your text"
                    inputRef={inputRef}
                  />
                </ThemedView>
              ))}
              {images.map((item) => (
                <ThemedView
                  key={item}
                  style={{
                    top: 0,
                    flex: 1,
                    width: "100%",
                    position: "absolute",
                    alignItems: "center",
                  }}
                >
                  <MoveableImage
                    uri={item}
                    isFocused={isFocused}
                    handleRemove={() => removeImage(item)}
                  />
                </ThemedView>
              ))}
            </ThemedView>
          </ViewShot>
        )}
        {message && <ThemedText type="defaultSemiBold">{message}</ThemedText>}
        {imageGenerated && (
          <ThemedView style={styles.canvasContainer}>
            <Image
              source={{ uri: imageGenerated }}
              style={{
                flex: 1,
                height: "100%",
                aspectRatio: imageGeneratedRatio,
              }}
              contentFit="contain"
            />
          </ThemedView>
        )}
        <Modal
          visible={showModal}
          animationType="slide"
          onRequestClose={handleModal}
          presentationStyle="pageSheet"
        >
          <ThemedView style={styles.modalContainer}>
            <ThemedText type="subtitle">Select meme template</ThemedText>
            <VirtualizedList
              data={TEMPLATE}
              initialNumToRender={4}
              renderItem={({ item }: { item: Template }) => (
                <ThemedView style={styles.listContainer}>
                  <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                  <Image
                    contentFit="contain"
                    source={{ uri: item.img }}
                    style={{ width: "100%", height: 290 }}
                  />
                  <Button
                    title="Use this image"
                    onPress={() => handleTemplate(item)}
                  />
                </ThemedView>
              )}
              keyExtractor={(item) => item.id}
              getItemCount={() => TEMPLATE.length}
              getItem={(data, index) => data[index]}
              style={{ width: "100%" }}
            />
          </ThemedView>
        </Modal>
      </ParallaxScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    gap: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  modalContainer: {
    gap: 16,
    padding: 16,
    alignItems: "center",
    flexDirection: "column",
  },
  listContainer: {
    gap: 16,
    padding: 16,
    flexDirection: "column",
    borderRadius: 8,
    borderColor: "#0000001A",
    borderWidth: 1,
    marginBottom: 8,
  },
  canvasContainer: {
    boxShadow: "2px 2px 8px rgba(0, 0, 0, 0.25)",
  },
});
