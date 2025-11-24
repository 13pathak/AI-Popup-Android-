import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, Text, List, IconButton, Portal, Modal, RadioButton, useTheme, Snackbar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getSettings, saveSettings, getLists, saveLists } from '../utils/storage';

export default function SettingsScreen() {
    const theme = useTheme();
    const [settings, setSettings] = useState(null);
    const [lists, setLists] = useState([]);

    // Model Modal State
    const [modelModalVisible, setModelModalVisible] = useState(false);
    const [editingModel, setEditingModel] = useState(null);
    const [modelForm, setModelForm] = useState({ name: '', endpointUrl: '', modelName: '', apiKey: '' });

    // List Modal State
    const [listModalVisible, setListModalVisible] = useState(false);
    const [editingList, setEditingList] = useState(null);
    const [listName, setListName] = useState('');

    const [prompt, setPrompt] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        const s = await getSettings();
        setSettings(s);
        setPrompt(s.globalCustomPrompt);
        const l = await getLists();
        setLists(l);
    };

    const handleSavePrompt = async () => {
        const newSettings = { ...settings, globalCustomPrompt: prompt };
        await saveSettings(newSettings);
        setSettings(newSettings);
        showSnackbar("Global prompt saved.");
    };

    // --- Model Functions ---

    const openModelModal = (model = null) => {
        if (model) {
            setEditingModel(model);
            setModelForm({ ...model });
        } else {
            setEditingModel(null);
            setModelForm({ name: '', endpointUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', modelName: 'gemini-2.0-flash', apiKey: '' });
        }
        setModelModalVisible(true);
    };

    const saveModel = async () => {
        if (!modelForm.name || !modelForm.endpointUrl || !modelForm.modelName) {
            Alert.alert("Error", "Name, Endpoint, and Model Name are required.");
            return;
        }

        let newModels = [...(settings.models || [])];
        let newDefaultId = settings.defaultModelId;

        if (editingModel) {
            newModels = newModels.map(m => m.id === editingModel.id ? { ...modelForm, id: editingModel.id } : m);
        } else {
            const newId = `model_${Date.now()}`;
            newModels.push({ ...modelForm, id: newId });
            if (!newDefaultId) newDefaultId = newId;
        }

        const newSettings = { ...settings, models: newModels, defaultModelId: newDefaultId };
        await saveSettings(newSettings);
        setSettings(newSettings);
        setModelModalVisible(false);
        showSnackbar("Model saved.");
    };

    const deleteModel = async (id) => {
        Alert.alert("Delete Model", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    const newModels = settings.models.filter(m => m.id !== id);
                    let newDefaultId = settings.defaultModelId;
                    if (newDefaultId === id) {
                        newDefaultId = newModels.length > 0 ? newModels[0].id : null;
                    }
                    const newSettings = { ...settings, models: newModels, defaultModelId: newDefaultId };
                    await saveSettings(newSettings);
                    setSettings(newSettings);
                    showSnackbar("Model deleted.");
                }
            }
        ]);
    };

    const setDefaultModel = async (id) => {
        const newSettings = { ...settings, defaultModelId: id };
        await saveSettings(newSettings);
        setSettings(newSettings);
        showSnackbar("Default model updated.");
    };

    // --- List Functions ---

    const openListModal = (list = null) => {
        if (list) {
            setEditingList(list);
            setListName(list.name);
        } else {
            setEditingList(null);
            setListName('');
        }
        setListModalVisible(true);
    };

    const saveList = async () => {
        if (!listName.trim()) {
            Alert.alert("Error", "List name is required.");
            return;
        }

        let newLists = [...lists];
        if (editingList) {
            newLists = newLists.map(l => l.id === editingList.id ? { ...l, name: listName.trim() } : l);
        } else {
            newLists.push({ id: `list_${Date.now()}`, name: listName.trim() });
        }

        await saveLists(newLists);
        setLists(newLists);
        setListModalVisible(false);
        showSnackbar("List saved.");
    };

    const deleteList = async (id) => {
        Alert.alert("Delete List", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    const newLists = lists.filter(l => l.id !== id);
                    await saveLists(newLists);
                    setLists(newLists);
                    showSnackbar("List deleted.");
                }
            }
        ]);
    };

    const showSnackbar = (msg) => {
        setSnackbarMessage(msg);
        setSnackbarVisible(true);
    };

    if (!settings) return null;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Models Section */}
                <Card style={styles.card}>
                    <Card.Title title="AI Models" right={(props) => <IconButton {...props} icon="plus" onPress={() => openModelModal()} />} />
                    <Card.Content>
                        {settings.models && settings.models.length > 0 ? (
                            settings.models.map(model => (
                                <List.Item
                                    key={model.id}
                                    title={model.name}
                                    description={model.modelName}
                                    left={props => <RadioButton value={model.id} status={settings.defaultModelId === model.id ? 'checked' : 'unchecked'} onPress={() => setDefaultModel(model.id)} />}
                                    right={props => (
                                        <View style={{ flexDirection: 'row' }}>
                                            <IconButton icon="pencil" onPress={() => openModelModal(model)} />
                                            <IconButton icon="delete" onPress={() => deleteModel(model.id)} />
                                        </View>
                                    )}
                                />
                            ))
                        ) : (
                            <Text style={{ padding: 10, color: '#888' }}>No models configured.</Text>
                        )}
                    </Card.Content>
                </Card>

                {/* Global Prompt Section */}
                <Card style={styles.card}>
                    <Card.Title title="Global Prompt" />
                    <Card.Content>
                        <TextInput
                            label="Prompt Template"
                            value={prompt}
                            onChangeText={setPrompt}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                            placeholder="Use {word} as placeholder"
                        />
                        <Button mode="contained" onPress={handleSavePrompt} style={{ marginTop: 10 }}>Save Prompt</Button>
                    </Card.Content>
                </Card>

                {/* Lists Section */}
                <Card style={styles.card}>
                    <Card.Title title="Word Lists" right={(props) => <IconButton {...props} icon="plus" onPress={() => openListModal()} />} />
                    <Card.Content>
                        {lists.length > 0 ? (
                            lists.map(list => (
                                <List.Item
                                    key={list.id}
                                    title={list.name}
                                    right={props => (
                                        <View style={{ flexDirection: 'row' }}>
                                            <IconButton icon="pencil" onPress={() => openListModal(list)} />
                                            <IconButton icon="delete" onPress={() => deleteList(list.id)} />
                                        </View>
                                    )}
                                />
                            ))
                        ) : (
                            <Text style={{ padding: 10, color: '#888' }}>No lists created.</Text>
                        )}
                    </Card.Content>
                </Card>

            </ScrollView>

            {/* Model Modal */}
            <Portal>
                <Modal visible={modelModalVisible} onDismiss={() => setModelModalVisible(false)} contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}>
                    <Text variant="headlineSmall" style={{ marginBottom: 15 }}>{editingModel ? 'Edit Model' : 'Add Model'}</Text>
                    <TextInput label="Config Name (e.g. My Gemini)" value={modelForm.name} onChangeText={t => setModelForm({ ...modelForm, name: t })} style={styles.input} />
                    <TextInput label="Endpoint URL" value={modelForm.endpointUrl} onChangeText={t => setModelForm({ ...modelForm, endpointUrl: t })} style={styles.input} />
                    <TextInput label="Model Name (e.g. gemini-2.0-flash)" value={modelForm.modelName} onChangeText={t => setModelForm({ ...modelForm, modelName: t })} style={styles.input} />
                    <TextInput label="API Key (Optional)" value={modelForm.apiKey} onChangeText={t => setModelForm({ ...modelForm, apiKey: t })} style={styles.input} secureTextEntry />
                    <View style={styles.modalActions}>
                        <Button onPress={() => setModelModalVisible(false)}>Cancel</Button>
                        <Button mode="contained" onPress={saveModel}>Save</Button>
                    </View>
                </Modal>
            </Portal>

            {/* List Modal */}
            <Portal>
                <Modal visible={listModalVisible} onDismiss={() => setListModalVisible(false)} contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}>
                    <Text variant="headlineSmall" style={{ marginBottom: 15 }}>{editingList ? 'Edit List' : 'Add List'}</Text>
                    <TextInput label="List Name" value={listName} onChangeText={setListName} style={styles.input} />
                    <View style={styles.modalActions}>
                        <Button onPress={() => setListModalVisible(false)}>Cancel</Button>
                        <Button mode="contained" onPress={saveList}>Save</Button>
                    </View>
                </Modal>
            </Portal>

            <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
                {snackbarMessage}
            </Snackbar>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 16 },
    card: { marginBottom: 16 },
    modal: { padding: 20, margin: 20, borderRadius: 8 },
    input: { marginBottom: 10 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10 }
});
