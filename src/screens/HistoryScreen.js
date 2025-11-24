import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView } from 'react-native';
import { Card, Text, Chip, IconButton, Portal, Modal, TextInput, Button, useTheme, Menu } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getHistory, saveHistory, getLists } from '../utils/storage';

export default function HistoryScreen() {
    const theme = useTheme();
    const [history, setHistory] = useState([]);
    const [lists, setLists] = useState([]);
    const [selectedListId, setSelectedListId] = useState(null);

    // Edit Modal
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editForm, setEditForm] = useState({ word: '', definition: '', listId: '' });
    const [listMenuVisible, setListMenuVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        const l = await getLists();
        setLists(l);
        const h = await getHistory();
        setHistory(h);

        if (l.length > 0 && !selectedListId) {
            setSelectedListId(l[0].id);
        }
    };

    const filteredHistory = selectedListId
        ? history.filter(item => item.listId === selectedListId)
        : [];

    const deleteItem = (timestamp) => {
        Alert.alert("Delete Item", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    const newHistory = history.filter(item => item.timestamp !== timestamp);
                    await saveHistory(newHistory);
                    setHistory(newHistory);
                }
            }
        ]);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setEditForm({ word: item.word, definition: item.definition, listId: item.listId });
        setEditModalVisible(true);
    };

    const saveEdit = async () => {
        const newHistory = history.map(item => {
            if (item.timestamp === editingItem.timestamp) {
                return { ...item, ...editForm };
            }
            return item;
        });
        await saveHistory(newHistory);
        setHistory(newHistory);
        setEditModalVisible(false);
    };

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.word}</Text>
                <Text variant="bodyMedium" style={{ marginTop: 5 }}>{item.definition}</Text>
                <Text variant="labelSmall" style={{ color: '#888', marginTop: 5 }}>Model: {item.modelName || 'Unknown'}</Text>
            </Card.Content>
            <Card.Actions style={{ justifyContent: 'flex-end' }}>
                <IconButton icon="pencil" size={20} onPress={() => openEditModal(item)} />
                <IconButton icon="delete" size={20} onPress={() => deleteItem(item.timestamp)} />
            </Card.Actions>
        </Card>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* List Selector */}
            <View style={styles.listSelector}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {lists.map(list => (
                        <Chip
                            key={list.id}
                            selected={selectedListId === list.id}
                            onPress={() => setSelectedListId(list.id)}
                            style={{ marginRight: 8 }}
                            showSelectedOverlay
                        >
                            {list.name}
                        </Chip>
                    ))}
                    {lists.length === 0 && <Text style={{ color: '#888', padding: 10 }}>No lists created.</Text>}
                </ScrollView>
            </View>

            {/* History List */}
            <FlatList
                data={filteredHistory}
                keyExtractor={item => item.timestamp}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>No items in this list.</Text>}
            />

            {/* Edit Modal */}
            <Portal>
                <Modal visible={editModalVisible} onDismiss={() => setEditModalVisible(false)} contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}>
                    <Text variant="headlineSmall" style={{ marginBottom: 15 }}>Edit Item</Text>
                    <TextInput label="Word" value={editForm.word} onChangeText={t => setEditForm({ ...editForm, word: t })} style={styles.input} />
                    <TextInput label="Definition" value={editForm.definition} onChangeText={t => setEditForm({ ...editForm, definition: t })} multiline numberOfLines={3} style={styles.input} />

                    {/* List Selector in Edit */}
                    <Menu
                        visible={listMenuVisible}
                        onDismiss={() => setListMenuVisible(false)}
                        anchor={
                            <Button mode="outlined" onPress={() => setListMenuVisible(true)} style={styles.input}>
                                List: {lists.find(l => l.id === editForm.listId)?.name || 'Select List'}
                            </Button>
                        }
                    >
                        {lists.map(list => (
                            <Menu.Item
                                key={list.id}
                                onPress={() => {
                                    setEditForm({ ...editForm, listId: list.id });
                                    setListMenuVisible(false);
                                }}
                                title={list.name}
                            />
                        ))}
                    </Menu>

                    <View style={styles.modalActions}>
                        <Button onPress={() => setEditModalVisible(false)}>Cancel</Button>
                        <Button mode="contained" onPress={saveEdit}>Save</Button>
                    </View>
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    listSelector: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
    listContent: { padding: 16 },
    card: { marginBottom: 12 },
    modal: { padding: 20, margin: 20, borderRadius: 8 },
    input: { marginBottom: 10 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10 }
});
