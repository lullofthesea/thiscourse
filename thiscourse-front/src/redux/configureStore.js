import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';

import category from './category';
import createThread from './createThread';
import user from './user';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const persistConfig = {
    key: 'app',
    storage,
    whitelist: ['user'],
};

const combinedReducers = combineReducers({
    category,
    createThread,
    user,
});

const persistedReducers = persistReducer(persistConfig, combinedReducers);

const configureStore = initialState => {
    return createStore(
        persistedReducers,
        initialState,
        composeEnhancers(applyMiddleware(thunk)),
    );
};

export default configureStore;