// Entry types for alpha-beta bounds
export enum EntryType {
    EXACT = "EXACT",             // Score is exact
    LOWER_BOUND = "LOWER",      // Score is at least this value (alpha cutoff)
    UPPER_BOUND = "UPPER"      // Score is at most this value (beta cutoff)
}


export interface TableEntry {
    hash: bigint;
    score: number;
    depth: number;
    type: EntryType;
    bestMove?: [number, number];
}


export class TranspositionTable {
    private table: Map<string, TableEntry>;
    private maxSize: number;

    constructor(maxSize: number= 1_000_000) {
        this.table = new Map();
        this.maxSize = maxSize;
    }

    private hashToKey(hash: bigint): string {
        // convert bigint to string for Map key
        return hash.toString();
    }

    private clearOldEntries(): void {
        // remove half of table entries
        const entries = Array.from(this.table.entries());
        this.table.clear();

        // keep the half with deeper searches
        entries
            .sort((a, b) => b[1].depth - a[1].depth)
            .slice(0, Math.floor(this.maxSize / 2))
            .forEach(([key, value]) => this.table.set(key, value));
    }

    public store(hash: bigint, score: number, depth: number, type: EntryType,  bestMove?: [number, number]): void {
        const key = this.hashToKey(hash);

        // only replace if new entry is greater or equal to depth
        const existing = this.table.get(key);
        if (existing && existing.hash === hash && existing.depth > depth) return;

        // simple size management: clear half the table if table is full
        if (this.table.size >= this.maxSize) {
            this.clearOldEntries();
        }

        this.table.set(key, { hash, score, depth, type, bestMove });
    }

    public lookup(hash: bigint, depth: number,alpha: number, beta: number): number | null {
        const key = this.hashToKey(hash);
        const entry = this.table.get(key);

        // no entry found
        if (! entry) return null;

        // verify hash matches(handle collisions)
        if (entry.hash !== hash) return null;

        // entry must be from equal or deeper search
        if (entry.depth < depth) return null;

        // check if we can use this entry based on its type
        if (entry.type === EntryType.EXACT) {
            return entry.score;
        }

        if (entry.type === EntryType.LOWER_BOUND && entry.score >= beta) {
            // we know the score is at least entry.score, and that's >= beta
            // so this node would cause a beta cutoff
            return entry.score;
        }

        if (entry.type === EntryType.UPPER_BOUND && entry.score <= alpha) {
            // we know the score is at most entry.score, and that's <= alpha
            // so this node wouldn't improve alpha
            return entry.score;
        }

        return null;
    }

    // Get best move from previous search (for move ordering)
    public getBestMove(hash: bigint): [number, number] | undefined {
        const key = this.hashToKey(hash);
        const entry = this.table.get(key);

        if (entry && entry.hash === hash) {
            return entry.bestMove;
        }

        return undefined;
    }

    public clear(): void {
        this.table.clear();
    }

    public get size(): number {
        return this.table.size;
    }
}
