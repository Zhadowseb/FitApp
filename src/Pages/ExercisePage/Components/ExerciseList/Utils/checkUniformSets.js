export function checkUniformWeights(sets){
  if (!sets || sets.length === 0) return "";

  const firstWeight = sets[0].weight;

  const allSame = sets.every(
    s => s.weight === firstWeight
  );

  return allSame ? firstWeight : "...";
};

export function checkUniformReps(sets){
  if (!sets || sets.length === 0) return "";

  const firstReps = sets[0].reps;

  const allSame = sets.every(
    s => s.reps === firstReps
  );

  return allSame ? firstReps : "...";
};