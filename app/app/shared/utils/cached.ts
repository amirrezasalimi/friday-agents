let data: any = {};

export default function cached<T>(key: string, callback: () => T, ttl = 30000) {
  if (data[key] && Date.now() - data[key].timestamp < ttl) {
    return data[key].result;
  }
  data[key] = {
    timestamp: Date.now(),
    result: callback(),
  };
  return data[key].result;
}
