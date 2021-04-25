export const PI = Math.PI;
export const TWO_PI = 2.0 * Math.PI;
export const PI_OVER_TWO = Math.PI / 2.0;
export const RADIANS_PER_DEGREE = Math.PI / 180.0;
export const DEGREES_PER_RADIAN = 180.0 / Math.PI;

export const toRadians = function (degrees: number) {
    return degrees * RADIANS_PER_DEGREE;
};

export const toDegrees = function (radians: number) {
    return radians * DEGREES_PER_RADIAN;
};

export const clamp = function (value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
};
