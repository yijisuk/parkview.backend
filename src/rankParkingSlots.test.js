import rankParkingSlots from "./apis/main/rankParkingSlots.js";

//rankParkingSlots(destinationAddress, nearbySlots, preferences, eta)
// destinationAddress = r{ latitude: 1.3432438, longitude: 103.682751 } : Affects the weather ranking
// nearbySlots = [] : Affects the output slots
// preferences = { weather: 0, hourlyRate: 2, availability: 1 }: Discrete variables will be able to test all
// eta = 21:42 : Affects the pricing cost

describe('Test rankParkingSlots VALID INPUTS', () => {
  const destinationAddress = { latitude: 1.3432438, longitude: 103.682751 };
  const nearbySlots = [
    {
      carparkId: 'BL1',
      area: '',
      development: 'BLK 174/179 BOON LAY DRIVE',
      latitude: 1.34687470765211,
      longitude: 103.70923455522829,
      availableLots: 47,
      lotType: 'C',
      agency: 'HDB'
    },
    {
      carparkId: 'BL2',
      area: '',
      development: 'BLK 221 BOON LAY PLACE',
      latitude: 1.3454251335793708,
      longitude: 103.71339091636777,
      availableLots: 27,
      lotType: 'C',
      agency: 'HDB'
    },
    {
      carparkId: 'BL3',
      area: '',
      development: 'BLK 221 BOON LAY PLACE',
      latitude: 1.3454251335793708,
      longitude: 103.71339091636777,
      availableLots: 2,
      lotType: 'C',
      agency: 'HDB'
    },
    {
      carparkId: 'BL4',
      area: '',
      development: 'BLK 221 BOON LAY PLACE',
      latitude: 1.3454251335793708,
      longitude: 103.71339091636777,
      availableLots: 253,
      lotType: 'C',
      agency: 'HDB'
    },
    {
      carparkId: 'BL5',
      area: '',
      development: 'BLK 221 BOON LAY PLACE',
      latitude: 1.3454251335793708,
      longitude: 103.71339091636777,
      availableLots: 397,
      lotType: 'C',
      agency: 'HDB'
    }
  ]; 
  const eta = '22:39'
  const preferences = { weather: 0, hourlyRate: 2, availability: 1 };


  it('Preferences: {weather: 0, hourlyRate: 2, availability: 1}', async () => {
    let combinedRankedSlots = await rankParkingSlots(destinationAddress, nearbySlots, preferences, eta);
    expect(combinedRankedSlots.BL1.weightedScore).toBeCloseTo(0.833, 2);
    expect(combinedRankedSlots.BL2.weightedScore).toBeCloseTo(0.583, 2);
    expect(combinedRankedSlots.BL3.weightedScore).toBeCloseTo(0.333, 2);
    expect(combinedRankedSlots.BL4.weightedScore).toBeCloseTo(0.416, 2);
    expect(combinedRankedSlots.BL5.weightedScore).toBeCloseTo(0.333, 2);
  });

  it('Preferences: {weather: 0, hourlyRate: 0, availability: 0}', async () => {
    let preferences_invalid = {weather: 0, hourlyRate: 0, availability: 0};
    let combinedRankedSlots = await rankParkingSlots(destinationAddress, nearbySlots, preferences_invalid, eta);
    expect(combinedRankedSlots.BL1.weightedScore).toBeCloseTo(0, 2);
    expect(combinedRankedSlots.BL2.weightedScore).toBeCloseTo(0, 2);
    expect(combinedRankedSlots.BL3.weightedScore).toBeCloseTo(0, 2);
    expect(combinedRankedSlots.BL4.weightedScore).toBeCloseTo(0, 2);
    expect(combinedRankedSlots.BL5.weightedScore).toBeCloseTo(0, 2);
  });

  it('Preferences: {weather: 1, hourlyRate: 2, availability: 3}', async () => {
    let preferences_invalid = {weather: 1, hourlyRate: 2, availability: 3};
    let combinedRankedSlots = await rankParkingSlots(destinationAddress, nearbySlots, preferences_invalid, eta);
    expect(combinedRankedSlots.BL1.weightedScore).toBeCloseTo(0.75, 2);
    expect(combinedRankedSlots.BL2.weightedScore).toBeCloseTo(0.5, 2);
    expect(combinedRankedSlots.BL3.weightedScore).toBeCloseTo(0.25, 2);
    expect(combinedRankedSlots.BL4.weightedScore).toBeCloseTo(0.5, 2);
    expect(combinedRankedSlots.BL5.weightedScore).toBeCloseTo(0.5, 2);
  });


  it('Preferences: {weather: 3, hourlyRate: 2, availability: 1}', async () => {
    let preferences_invalid = {weather: 3, hourlyRate: 2, availability: 1};
    let combinedRankedSlots = await rankParkingSlots(destinationAddress, nearbySlots, preferences_invalid, eta);
    expect(combinedRankedSlots.BL1.weightedScore).toBeCloseTo(0.916, 2);
    expect(combinedRankedSlots.BL2.weightedScore).toBeCloseTo(0.666, 2);
    expect(combinedRankedSlots.BL3.weightedScore).toBeCloseTo(0.416, 2);
    expect(combinedRankedSlots.BL4.weightedScore).toBeCloseTo(0.333, 2);
    expect(combinedRankedSlots.BL5.weightedScore).toBeCloseTo(0.166, 2);
  });


  it('Preferences: {weather: 3, hourlyRate: 1, availability: 2}', async () => {
    let preferences_invalid = {weather: 3, hourlyRate: 1, availability: 2};
    let combinedRankedSlots = await rankParkingSlots(destinationAddress, nearbySlots, preferences_invalid, eta);
    expect(combinedRankedSlots.BL1.weightedScore).toBeCloseTo(0.833, 2);
    expect(combinedRankedSlots.BL2.weightedScore).toBeCloseTo(0.583, 2);
    expect(combinedRankedSlots.BL3.weightedScore).toBeCloseTo(0.333, 2);
    expect(combinedRankedSlots.BL4.weightedScore).toBeCloseTo(0.416, 2);
    expect(combinedRankedSlots.BL5.weightedScore).toBeCloseTo(0.333, 2);
  });

});


describe('Test rankParkingSlots INVALID INPUTS', () => {
  const destinationAddress = { latitude: 1.3432438, longitude: 103.682751 };
  const nearbySlots = [
    {
      carparkId: 'BL1',
      area: '',
      development: 'BLK 174/179 BOON LAY DRIVE',
      latitude: 1.34687470765211,
      longitude: 103.70923455522829,
      availableLots: 47,
      lotType: 'C',
      agency: 'HDB'
    },
    {
      carparkId: 'BL2',
      area: '',
      development: 'BLK 221 BOON LAY PLACE',
      latitude: 1.3454251335793708,
      longitude: 103.71339091636777,
      availableLots: 27,
      lotType: 'C',
      agency: 'HDB'
    },
    {
      carparkId: 'BL3',
      area: '',
      development: 'BLK 221 BOON LAY PLACE',
      latitude: 1.3454251335793708,
      longitude: 103.71339091636777,
      availableLots: 2,
      lotType: 'C',
      agency: 'HDB'
    },
    {
      carparkId: 'BL4',
      area: '',
      development: 'BLK 221 BOON LAY PLACE',
      latitude: 1.3454251335793708,
      longitude: 103.71339091636777,
      availableLots: 253,
      lotType: 'C',
      agency: 'HDB'
    },
    {
      carparkId: 'BL5',
      area: '',
      development: 'BLK 221 BOON LAY PLACE',
      latitude: 1.3454251335793708,
      longitude: 103.71339091636777,
      availableLots: 397,
      lotType: 'C',
      agency: 'HDB'
    }
  ]; 
  const eta = '22:39'
  const preferences = { weather: 0, hourlyRate: 2, availability: 1 };

  it('Invalid/Empty nearbySlots', async () => {
    const nearbySlots_invalid = [];
    let combinedRankedSlots = await rankParkingSlots(destinationAddress, nearbySlots_invalid, preferences, eta);
    expect(JSON.stringify(combinedRankedSlots)).toBe(JSON.stringify({}));
  });

  it('Invalid Preferences', async () => {
    let preferences_invalid = { };
    await expect(rankParkingSlots(destinationAddress, nearbySlots, preferences_invalid, eta)).rejects.toThrowError("Invalid Preferences");
  });

  it('Invalid eta', async () => {
    const eta_invalid = '123412341234'
    await expect(rankParkingSlots(destinationAddress, nearbySlots, preferences, eta_invalid)).rejects.toThrowError('Invalid ETA');
  });

});


