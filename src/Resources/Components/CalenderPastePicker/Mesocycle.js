import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { ThemedPicker, ThemedText, ThemedModal } from "../../ThemedComponents";

const Mesocycle = ({ program_id, visible, close }) => {
  const db = useSQLiteContext();
  const [mesocycles, set_Mesocycles] = useState([]);
  const [loading, set_Loading] = useState(false);

  useEffect(() => {
    if (!program_id) return;

    const load = async () => {
      try {
        set_Loading(true);
        const rows = await db.getAllAsync(
          `SELECT mesocycle_id, mesocycle_number
           FROM Mesocycle
           WHERE program_id = ?
           ORDER BY mesocycle_number`,
          [program_id]
        );
        set_Mesocycles(rows);
      } catch (e) {
        console.error(e);
      } finally {
        set_Loading(false);
      }
    };

    load();
  }, [program_id]);

  if (loading) return <ActivityIndicator />;

  if (mesocycles.length === 0) {
    return <ThemedText>No mesocycles</ThemedText>;
  }

  return (
    <>
      <ThemedModal
        visible={visible}
        onClose={() => close()}
        title="Pick a Mesocycle">

        {mesocycles.map(mc => (
          <Pressable
            key={mc.mesocycle_id}
            onPress={() => {
              close();
            }}
            style={{ paddingVertical: 12 }}
          >
            <ThemedText>
              Mesocycle {mc.mesocycle_number}
            </ThemedText>
          </Pressable>
        ))}
      </ThemedModal>
    </>
    
  );
};

export default Mesocycle;
