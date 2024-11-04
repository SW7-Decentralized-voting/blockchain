import convertBigIntToString from '../../utils/convertBigIntToString';

describe('convertBigIntToString', () => {
    test('converts BigInt to string', () => {
        const obj = {
            a: BigInt(1),
            b: BigInt(2),
            c: BigInt(3),
            d: BigInt(4),
            e: BigInt(5),
        };

        const result = convertBigIntToString(obj);

        expect(result).toEqual({
            a: '1',
            b: '2',
            c: '3',
            d: '4',
            e: '5',
        });
    });

    test('converts BigInt in array to string', () => {
        const obj = {
            a: [BigInt(1), BigInt(2), BigInt(3), BigInt(4), BigInt(5)],
        };

        const result = convertBigIntToString(obj);

        expect(result).toEqual({
            a: ['1', '2', '3', '4', '5'],
        });
    });

    test('converts BigInt in object to string', () => {
        const obj = {
            a: {
                b: BigInt(1),
                c: BigInt(2),
                d: BigInt(3),
                e: BigInt(4),
                f: BigInt(5),
            },
        };

        const result = convertBigIntToString(obj);

        expect(result).toEqual({
            a: {
                b: '1',
                c: '2',
                d: '3',
                e: '4',
                f: '5',
            },
        });
    });

    test('does not convert non-BigInt values', () => {
        const obj = {
            a: 1,
            b: 2,
            c: 3,
            d: 4,
            e: 5,
        };

        const result = convertBigIntToString(obj);

        expect(result).toEqual({
            a: 1,
            b: 2,
            c: 3,
            d: 4,
            e: 5,
        });
    });
});