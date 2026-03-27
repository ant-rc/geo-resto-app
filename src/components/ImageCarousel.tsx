import { useState, useRef } from 'react';
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ImageCarouselProps {
  images: string[];
  height?: number;
}

export default function ImageCarousel({
  images,
  height = 280,
}: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setActiveIndex(index);
  }

  if (images.length === 0) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <Ionicons name="restaurant" size={40} color={Colors.light.primaryMuted} />
      </View>
    );
  }

  return (
    <View style={{ height }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((uri, index) => (
          <Image
            key={`${uri}-${index}`}
            source={{ uri }}
            style={[styles.image, { width: SCREEN_WIDTH, height }]}
          />
        ))}
      </ScrollView>
      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
      {images.length > 1 && (
        <View style={styles.counter}>
          <Ionicons name="images-outline" size={12} color={Colors.light.textOnPrimary} />
          <View style={styles.counterTextWrap}>
            <View>
              <Ionicons name="images-outline" size={0} color="transparent" />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    backgroundColor: Colors.light.textOnPrimary,
    width: 18,
    borderRadius: 4,
  },
  counter: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  counterTextWrap: {
    display: 'none',
  },
});
