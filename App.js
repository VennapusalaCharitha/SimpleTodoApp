import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Animated, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ToDoApp = () => {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedText, setEditedText] = useState('');
  const animation = new Animated.Value(0);

  // Load tasks from AsyncStorage when the app starts
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error('Failed to load tasks', error);
      }
    };

    fetchTasks();
  }, []);

  // Save tasks to AsyncStorage whenever tasks array is updated
  const saveTasks = async (tasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks', error);
    }
  };

  const addTask = () => {
    if (task.trim()) {
      const newTask = {
        id: Date.now().toString(),
        text: task,
        completed: false,
      };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      setTask('');
      saveTasks(updatedTasks);  // Save the updated tasks
      startAnimation();  // Trigger the animation when a task is added
    }
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter((item) => item.id !== taskId);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);  // Save the updated tasks
  };

  const editTask = (taskId) => {
    const updatedTasks = tasks.map((item) =>
      item.id === taskId ? { ...item, text: editedText } : item
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);  // Save the updated tasks
    setEditingId(null);
  };

  const startEditingTask = (taskId, currentText) => {
    setEditingId(taskId);
    setEditedText(currentText);
  };

  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map((item) =>
      item.id === taskId ? { ...item, completed: !item.completed } : item
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);  // Save the updated tasks
  };

  // Animation function for the Add button
  const startAnimation = () => {
    Animated.spring(animation, {
      toValue: 1,
      friction: 4,
      tension: 100,
    }).start(() => {
      animation.setValue(0);  // Reset the animation value
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 My To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          placeholderTextColor="#aaa"
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Animated.Text
            style={[
              styles.addButtonText,
              {
                transform: [
                  {
                    scale: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              },
            ]}
          >
            ➕
          </Animated.Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            {editingId === item.id ? (
              <TextInput
                style={styles.input}
                value={editedText}
                onChangeText={(text) => setEditedText(text)}
                onSubmitEditing={() => editTask(item.id)}
                autoFocus
              />
            ) : (
              <TouchableOpacity onPress={() => startEditingTask(item.id, item.text)}>
                <Text
                  style={[styles.taskText, item.completed && styles.completedTaskText]}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
            )}
            <View style={styles.taskActions}>
              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Text style={styles.deleteButton}>🗑️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
                <Text style={styles.editButton}>
                  {item.completed ? '✅' : '❌'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  addButtonText: {
    fontSize: 32,
    color: '#4CAF50',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  taskText: {
    fontSize: 18,
    flex: 1,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#808080',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    fontSize: 20,
    color: '#007BFF',
    marginHorizontal: 5,
  },
  deleteButton: {
    fontSize: 20,
    color: '#FF5733',
  },
});

export default ToDoApp;
