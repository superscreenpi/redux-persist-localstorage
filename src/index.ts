import {Action, AnyAction, PreloadedState, Reducer, Store, StoreEnhancerStoreCreator} from 'redux';

export function persist(storageKey: string, excludeStateKeys: string[] = []) {
    return function (next: StoreEnhancerStoreCreator): StoreEnhancerStoreCreator {
        return function <S = any, A extends Action = AnyAction>(reducer: Reducer<S, A>, preloadedState?: PreloadedState<S>): Store<S, A> {
            function save(): void {
                const copy = {...store.getState()};
                excludeStateKeys.forEach(key => {
                    if (key in copy) {
                        // @ts-ignore
                        delete copy[key];
                    }
                })
                localStorage.setItem("TEMP", JSON.stringify(copy));
            }

            // load the initial state from storage
            const stateData = localStorage.getItem("TEMP");
            let initialState = preloadedState;
            if (stateData) {
                // overlay the persisted state data onto
                initialState = {...(initialState || {}), ...JSON.parse(stateData)};
            }

            // create the store
            const store = next(reducer, initialState);

            // store the new initial state
            save();

            // store the state when it changes
            store.subscribe(() => {
                save();
            });

            return store;
        }
    }
}
