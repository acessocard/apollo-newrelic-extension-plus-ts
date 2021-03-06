import * as R from 'ramda';

export const fieldTraceSummary = (trace: any) => {
  if (!trace || R.isEmpty(trace)) {
    return 'No trace data';
  }

  try {
    return R.pipe(
      R.pathOr([], ['execution', 'resolvers']),
      R.filter(R.propEq('parentType', 'RootQuery')),
      R.map(resolverFieldSummary),
      R.prepend(`Total Duration (ms): ${milliseconds(trace.duration)}`),
      R.join(' | ')
    )(trace);
  } catch (err) {
    return `Error getting trace summary: ${err.message}`;
  }
};

export const milliseconds = R.divide(R.__, 1000000);

export const resolverFieldSummary = ({ fieldName, returnType, duration }: any) => `Field: ${fieldName} - ReturnType: ${returnType} - Duration (ms): ${milliseconds(duration)}`;
