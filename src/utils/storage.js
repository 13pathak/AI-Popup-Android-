import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    SETTINGS: 'settings',
    HISTORY: 'history',
    LISTS: 'lists',
    LAST_USED_LIST_ID: 'lastUsedListId',
};

const DEFAULT_SETTINGS = {
    models: [],
    defaultModelId: null,
    globalCustomPrompt: "Explain {word} to a high schooler in 500 characters or less.",
};

export const getSettings = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(KEYS.SETTINGS);
        return jsonValue != null ? { ...DEFAULT_SETTINGS, ...JSON.parse(jsonValue) } : DEFAULT_SETTINGS;
    } catch (e) {
        console.error("Error reading settings", e);
        return DEFAULT_SETTINGS;
    }
};

export const saveSettings = async (settings) => {
    try {
        const current = await getSettings();
        const newSettings = { ...current, ...settings };
        await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(newSettings));
    } catch (e) {
        console.error("Error saving settings", e);
    }
};

export const getHistory = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(KEYS.HISTORY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Error reading history", e);
        return [];
    }
};

export const saveHistory = async (history) => {
    try {
        await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
        console.error("Error saving history", e);
    }
};

export const addToHistory = async (item) => {
    try {
        const history = await getHistory();
        const newItem = {
            ...item,
            timestamp: new Date().toISOString(),
        };
        history.unshift(newItem);
        // Limit to 100 items
        if (history.length > 100) {
            history.splice(100);
        }
        await saveHistory(history);
        return newItem;
    } catch (e) {
        console.error("Error adding to history", e);
    }
};

export const getLists = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(KEYS.LISTS);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Error reading lists", e);
        return [];
    }
};

export const saveLists = async (lists) => {
    try {
        await AsyncStorage.setItem(KEYS.LISTS, JSON.stringify(lists));
    } catch (e) {
        console.error("Error saving lists", e);
    }
};

export const getLastUsedListId = async () => {
    try {
        return await AsyncStorage.getItem(KEYS.LAST_USED_LIST_ID);
    } catch (e) {
        console.error("Error reading last used list id", e);
        return null;
    }
};

export const saveLastUsedListId = async (id) => {
    try {
        await AsyncStorage.setItem(KEYS.LAST_USED_LIST_ID, id);
    } catch (e) {
        console.error("Error saving last used list id", e);
    }
};
