export type TypedArray = Float64Array | Float32Array
    | Uint8Array | Uint16Array | Uint32Array
    | Int8Array | Int16Array | Int32Array

export interface TypedArrayConstructor<T extends TypedArray> {
    new (size: number): T;
}

export class DynamicTypedArray<T extends TypedArray> {
    private _arr: T;
    length: number;
    constructor(
        private readonly _arrConstructor: TypedArrayConstructor<T>,
        initSize: number = 32,
    ) {
        this._arr = new this._arrConstructor(Math.max(1, initSize));
        this.length = 0;
    }

    get capacity() {
        return this._arr.length;
    }
    
    get view(): T {
        return this._arr.subarray(0, this.length) as T;
    }

    get(index: number): number | undefined {
        return index >= 0 && index < this.length ? this._arr[index] : undefined;
    }

    set(index: number, value: number): void {
        if(index < 0 || index >= this.length) {
            throw new RangeError(`Index ${index} out of bounds [0, ${this.length})`);
        }
        this._arr[index] = value;
    }

    setCapacity(len: number): void {
        len = Math.max(1, len);
        if(len === this.capacity)
            return;
        const old = this._arr;
        this._arr = new this._arrConstructor(len);
        if(this.length > len)
            this.length = len;
        this._arr.set(old.subarray(0, this.length));
    }

    trim(): void {
        this.setCapacity(this.length);
    }

    push(n: number): number {
        if(this.length >= this.capacity) {
            this.setCapacity(Math.floor(this.capacity * 1.5 + 4));
        }
        this._arr[this.length] = n;
        return ++this.length;
    }

    pushElements(...arr: number[]): number {
        for(let n of arr) {
            this.push(n);
        }
        return this.length;
    }

    pushArray(values: T): void {
        if (this.length + values.length > this.capacity) {
            this.setCapacity(
                Math.max(
                    Math.floor(this.capacity * 1.5 + 4),
                    this.length + values.length
                )
            );
        }

        this._arr.set(values, this.length);
        this.length += values.length;
    }

    pop(): number | null {
        if(this.length <= 0)
            return null;
        let v = this._arr[this.length - 1]!;
        this.length--;
        if(this.length * 4 < this.capacity) {
            this.setCapacity(Math.floor(this.length * 1.2 + 4));
        }
        return v;
    }

    peek(): number | null {
        return this.length > 0 ? this._arr[this.length - 1]! : null;
    }

    clear(): void {
        this.length = 0;
    }
}

export class DynamicUint32Array extends DynamicTypedArray<Uint32Array> {
    constructor(initSize?: number) {
        super(Uint32Array, initSize);
    }
}

export class DynamicFloat32Array extends DynamicTypedArray<Float32Array> {
    constructor(initSize?: number) {
        super(Float32Array, initSize);
    }
}