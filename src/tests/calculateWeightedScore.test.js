import { calculateWeightedScore } from "../apis/main/rankParkingSlots.js";

describe("Test for calculateWeightedScore", () => {
    it("Path 1", () => {
        const groupSlots = {
            A: {
                individualScores: {
                    availability: 1,
                    hourlyRate: 0.67,
                    weatherCondition: 0.33,
                },
            },
            B: {
                individualScores: {
                    availability: 0.67,
                    hourlyRate: 1,
                    weatherCondition: 0,
                },
            },
            C: {
                individualScores: {
                    availability: 0,
                    hourlyRate: 0.33,
                    weatherCondition: 1,
                },
            },
            D: {
                individualScores: {
                    availability: 0.33,
                    hourlyRate: 0,
                    weatherCondition: 0.67,
                },
            },
        };
        const result = calculateWeightedScore(0.5, 0.167, 0.334, groupSlots);
        expect(result.A.weightedScore).toBeCloseTo(0.129, 2);
        expect(result.B.weightedScore).toBeCloseTo(0.111, 2);
        expect(result.C.weightedScore).toBeCloseTo(0.0462, 2);
        expect(result.D.weightedScore).toBeCloseTo(0.0461, 2);
    });
    it("Path 2", () => {
        const groupSlots = {
            A: {
                individualScores: {
                    availability: 0.25,
                    hourlyRate: 0.75,
                    weatherCondition: 1,
                },
            },
            B: {
                individualScores: {
                    availability: 0,
                    hourlyRate: 0.5,
                    weatherCondition: 0,
                },
            },
            C: {
                individualScores: {
                    availability: 1,
                    hourlyRate: 0,
                    weatherCondition: 0.5,
                },
            },
            D: {
                individualScores: {
                    availability: 0.75,
                    hourlyRate: 0.25,
                    weatherCondition: 0.75,
                },
            },
            E: {
                individualScores: {
                    availability: 0.5,
                    hourlyRate: 1,
                    weatherCondition: 0.25,
                },
            },
        };
        const result = calculateWeightedScore(0.334, 0.5, 0.167, groupSlots);
        expect(result.A.weightedScore).toBeCloseTo(0.118, 2);
        expect(result.B.weightedScore).toBeCloseTo(0.0139, 2);
        expect(result.C.weightedScore).toBeCloseTo(0.0973, 2);
        expect(result.D.weightedScore).toBeCloseTo(0.111, 2);
        expect(result.E.weightedScore).toBeCloseTo(0.0765, 2);
    });
});
