import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";

const KeyboardProtectionContext = createContext({
  requestScrollToInput: () => {},
});

export const useThemedKeyboardProtection = () =>
  useContext(KeyboardProtectionContext);

const ThemedKeyboardProtection = ({
  children,
  scroll = false,
  contentContainerStyle,
  keyboardVerticalOffset = 0,
  scrollViewProps,
  style,
}) => {
  const scrollProps = scrollViewProps ?? {};
  const scrollRef = useRef(null);
  const currentScrollYRef = useRef(0);
  const focusedInputRef = useRef(null);
  const keyboardTopRef = useRef(Dimensions.get("window").height);
  const [keyboardInset, setKeyboardInset] = useState(0);

  const scrollToInput = useCallback((input) => {
    if (!scroll || !input?.measureInWindow || !scrollRef.current?.scrollTo) {
      return;
    }

    input.measureInWindow((x, y, width, height) => {
      const windowHeight = Dimensions.get("window").height;
      const keyboardTop = keyboardTopRef.current ?? windowHeight;
      const safeBottomGap = 48;
      const fieldBottom = y + height;
      const visibleBottom = keyboardTop - safeBottomGap;

      if (fieldBottom > visibleBottom) {
        const overlap = fieldBottom - visibleBottom;

        scrollRef.current.scrollTo({
          y: Math.max(0, currentScrollYRef.current + overlap),
          animated: true,
        });
      }
    });
  }, [scroll]);

  const requestScrollToInput = useCallback((input) => {
    focusedInputRef.current = input;

    if (!input) {
      return;
    }

    setTimeout(() => {
      scrollToInput(input);
    }, Platform.OS === "android" ? 250 : 50);
  }, [scrollToInput]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", (event) => {
      const windowHeight = Dimensions.get("window").height;

      keyboardTopRef.current =
        event.endCoordinates?.screenY ??
        windowHeight - (event.endCoordinates?.height ?? 0);
      setKeyboardInset(event.endCoordinates?.height ?? 0);

      if (focusedInputRef.current) {
        requestScrollToInput(focusedInputRef.current);
      }
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      keyboardTopRef.current = Dimensions.get("window").height;
      setKeyboardInset(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [requestScrollToInput]);

  const contextValue = useMemo(() => ({
    requestScrollToInput,
  }), [requestScrollToInput]);

  return (
    <KeyboardProtectionContext.Provider value={contextValue}>
      <KeyboardAvoidingView
        style={[styles.container, style]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        {scroll ? (
          <ScrollView
            ref={scrollRef}
            {...scrollProps}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios" ? "interactive" : "on-drag"
            }
            contentInsetAdjustmentBehavior="automatic"
            automaticallyAdjustKeyboardInsets
            scrollEventThrottle={16}
            onScroll={(event) => {
              currentScrollYRef.current = event.nativeEvent.contentOffset.y;
              scrollProps.onScroll?.(event);
            }}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: 24 + keyboardInset },
              scrollProps.contentContainerStyle,
              contentContainerStyle,
            ]}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </KeyboardAvoidingView>
    </KeyboardProtectionContext.Provider>
  );
};

export default ThemedKeyboardProtection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
