import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Keyboard, AppState } from 'react-native';
import { TextInput, Button, Card, Text, ActivityIndicator, Menu, Divider, useTheme, Snackbar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getSettings, getLists, addToHistory, getLastUsedListId, saveLastUsedListId } from '../utils/storage';
import { fetchDefinition } from '../utils/api';
import { useShareIntent } from 'expo-share-intent';

export default function HomeScreen({ navigation }) {
    const theme = useTheme();
    const [text, setText] = useState('');
    const [definition, setDefinition] = useState('');
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState(null);
    const [lists, setLists] = useState([]);
    const [selectedListId, setSelectedListId] = useState(null);
    const [listMenuVisible, setListMenuVisible] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [currentModelName, setCurrentModelName] = useState('');

    // --- Share Intent Hook ---
    const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

    useEffect(() => {
        if (hasShareIntent && shareIntent.type === 'text' && shareIntent.value) {
            setText(shareIntent.value);
            // Optional: Auto-fetch definition
            // handleGetDefinition(shareIntent.value);
            resetShareIntent();
        }
    }, [hasShareIntent, shareIntent, resetShareIntent]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        const loadedSettings = await getSettings();
        setSettings(loadedSettings);
        const loadedLists = await getLists();
        setLists(loadedLists);

        const lastListId = await getLastUsedListId();
        if (lastListId && loadedLists.find(l => l.id === lastListId)) {
            setSelectedListId(lastListId);
        } else if (loadedLists.length > 0) {
            setSelectedListId(loadedLists[0].id);
        }
    };

    const handleGetDefinition = async (inputText = text) => {
        if (!inputText.trim()) return;
        if (!settings || !settings.defaultModelId) {
            setSnackbarMessage("No AI model configured. Please go to Settings.");
            setSnackbarVisible(true);
            return;
        }

        const model = settings.models.find(m => m.id === settings.defaultModelId);
        if (!model) {
            setSnackbarMessage("Default model not found. Please check Settings.");
            setSnackbarVisible(true);
            return;
        }

        Keyboard.dismiss();
        setLoading(true);
        setDefinition('');
        setCurrentModelName(model.name);

        try {
            const result = await fetchDefinition(inputText.trim(), model, settings.globalCustomPrompt);
            setDefinition(result);
        } catch (error) {
            setDefinition(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!definition || !selectedListId) {
            if (!selectedListId) {
                setSnackbarMessage("Please create a list in Settings/History first.");
                setSnackbarVisible(true);
            }
            return;
        }

        await addToHistory({
            word: text.trim(),
            definition: definition,
            listId: selectedListId,
            modelName: currentModelName
        });

        await saveLastUsedListId(selectedListId);

        setSnackbarMessage("Saved to history!");
        setSnackbarVisible(true);
        setText('');
        setDefinition('');
    };

    const selectedList = lists.find(l => l.id === selectedListId);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.inputCard}>
                    <Card.Content>
                        <TextInput
                            label="Enter word or phrase"
                            value={text}
                            onChangeText={setText}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                            style={styles.input}
                        />
                        <Button
                            mode="contained"
                            onPress={() => handleGetDefinition(text)}
                            loading={loading}
                            disabled={loading || !text.trim()}
                            style={styles.button}
                        >
                            Get Definition
                        </Button>
                    </Card.Content>
                </Card>

                {definition ? (
                    <Card style={styles.resultCard}>
                        <Card.Title title="Definition" subtitle={`Model: ${currentModelName}`} />
                        <Card.Content>
                            <Text variant="bodyMedium" style={styles.definitionText}>{definition}</Text>
                        </Card.Content>
                        <Card.Actions style={styles.actions}>
                            <Menu
                                visible={listMenuVisible}
                                onDismiss={() => setListMenuVisible(false)}
                                anchor={
                                    <Button mode="outlined" onPress={() => setListMenuVisible(true)}>
                                        {selectedList ? selectedList.name : "Select List"}
                                    </Button>
                                }
                            >
                                {lists.map(list => (
                                    <Menu.Item
                                        key={list.id}
                                        onPress={() => {
                                            setSelectedListId(list.id);
                                            setListMenuVisible(false);
                                        }}
                                        title={list.name}
                                    />
                                ))}
                                {lists.length === 0 && <Menu.Item title="No lists created" disabled />}
                            </Menu>
                            <Button mode="contained" onPress={handleSave} icon="content-save">
                                Save
                            </Button>
                        </Card.Actions>
                    </Card>
                ) : null}
            </ScrollView>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    inputCard: {
        marginBottom: 16,
    },
    input: {
        marginBottom: 12,
    },
    button: {
        marginTop: 4,
    },
    resultCard: {
        marginBottom: 16,
    },
    definitionText: {
        lineHeight: 24,
    },
    actions: {
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
    }
});
