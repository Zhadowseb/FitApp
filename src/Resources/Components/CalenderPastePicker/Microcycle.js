import { useEffect, useState, useMemo } from "react";
import { ActivityIndicator, Pressable, View, ScrollView } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { ThemedText, ThemedModal } from "../";

const Microcycle = ({ program_id, visible, close }) => {
  const db = useSQLiteContext();
  const [microcycles, setMicrocycles] = useState([]);
  const [mesocycles, setMesocycles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!program_id) return;

    const load = async () => {
      try {
        setLoading(true);

        const mesoRows = await db.getAllAsync(
          `SELECT mesocycle_id, mesocycle_number
           FROM Mesocycle
           WHERE program_id = ?
           ORDER BY mesocycle_number`,
          [program_id]
        );

        const microRows = await db.getAllAsync(
          `SELECT microcycle_id, microcycle_number, mesocycle_id
           FROM Microcycle
           WHERE program_id = ?
           ORDER BY microcycle_number`,
          [program_id]
        );

        setMesocycles(mesoRows);
        setMicrocycles(microRows);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [program_id]);

  /** Gruppér microcycles pr mesocycle */
  const grouped = useMemo(() => {
    const map = {};

    mesocycles.forEach(m => {
      map[m.mesocycle_id] = {
        mesocycle_number: m.mesocycle_number,
        microcycles: [],
      };
    });

    microcycles.forEach(mc => {
      if (map[mc.mesocycle_id]) {
        map[mc.mesocycle_id].microcycles.push(mc);
      }
    });

    return map;
  }, [mesocycles, microcycles]);

  if (loading) return <ActivityIndicator />;

  return (
    <ThemedModal
    visible={visible}
    onClose={close}
    title="Pick a Microcycle"
    >
    <ScrollView
        style={{ maxHeight: 400 }}
        showsVerticalScrollIndicator={false}
    >
        {Object.values(grouped).map(group => (
        <View key={group.mesocycle_number} style={{ marginBottom: 16 }}>
            
            <ThemedText style={{ fontWeight: "600", marginBottom: 6 }}>
            Mesocycle {group.mesocycle_number}
            </ThemedText>

            {group.microcycles.map(mc => (
            <Pressable
                key={mc.microcycle_id}
                onPress={() => close(mc)}
                style={{ paddingVertical: 8, paddingLeft: 12 }}
            >
                <ThemedText>
                Week {mc.microcycle_number}
                </ThemedText>
            </Pressable>
            ))}
        </View>
        ))}
    </ScrollView>
    </ThemedModal>

  );
};

export default Microcycle;
