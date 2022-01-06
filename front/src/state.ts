import { createAtom, noop } from "@reatom/core";

type FetchStatus = 'idle' | 'pending' | 'ready';
export const fetchStatus = createAtom({start: noop, end: noop, reset: noop}, (track, state: FetchStatus = 'idle') => {
    track.onAction('start', () => (state = 'pending'));
    track.onAction('end', () => (state = 'ready'));
    track.onAction('reset', () => (state = 'idle'));

    return state;
})

const defaultFetchAtom = Array.from({length: 10}, () => 0);
export const fetchAtom = createAtom({fulfilled: (num: number[]) => num, reset: noop}, (track, state: number[] = defaultFetchAtom) => {
    track.onAction('fulfilled', n => (state = n));
    track.onAction('reset', () => (state = defaultFetchAtom));

    return state;
});