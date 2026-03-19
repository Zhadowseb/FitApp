import ThemedModal from "./ThemedModal";

const ThemedWorkoutModal = ({
  visible,
  onClose,
  title,
  children,
  style,
  contentStyle,
  dismissOnBackdropPress = true,
}) => {
  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      title={title}
      style={style}
      contentStyle={contentStyle}
      dismissOnBackdropPress={dismissOnBackdropPress}
    >
      {children}
    </ThemedModal>
  );
};

export default ThemedWorkoutModal;
