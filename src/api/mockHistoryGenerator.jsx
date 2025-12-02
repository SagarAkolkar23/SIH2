export const generateHistoricalData = () => {
  const data = [];
  const now = new Date();

  for (let i = 90; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    for (let hour = 0; hour < 24; hour += 2) {
      const timestamp = new Date(date);
      timestamp.setHours(hour, 0, 0, 0);

      const solarFactor =
        hour >= 6 && hour <= 18 ? Math.sin(((hour - 6) / 12) * Math.PI) : 0;

      const baseVoltage = 220 + Math.random() * 20;
      const baseCurrent = 8 + Math.random() * 6 + solarFactor * 3;

      data.push({
        timestamp,
        voltage: baseVoltage + Math.random() * 5,
        current: baseCurrent,
        power: (baseVoltage * baseCurrent) / 1000,
        solarInput: 1000 + solarFactor * 2500 + Math.random() * 500,
        battery: 60 + Math.random() * 30,
        area: ["Area A", "Area B", "Area C"][Math.floor(Math.random() * 3)],
      });
    }
  }
  return data;
};
