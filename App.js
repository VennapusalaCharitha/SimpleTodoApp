import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Animated, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ToDoApp = () => {
  // State to hold tasks, current task input, and task editing state
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedText, setEditedText] = useState('');

  // Animation state for Add Task button
  const animation = new Animated.Value(0);

  // Load tasks from AsyncStorage when the app starts
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Get stored tasks from AsyncStorage
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));  // Parse and set the tasks
        }
      } catch (error) {
        console.error('Failed to load tasks', error);  // Log errors if fetching fails
      }
    };

    fetchTasks();  // Invoke fetchTasks function on component mount
  }, []);

  // Save tasks to AsyncStorage whenever tasks array is updated
  const saveTasks = async (tasks) => {
    try {
      // Store tasks in AsyncStorage
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks', error);  // Log errors if saving fails
    }
  };

  // Add a new task to the list
  const addTask = () => {
    if (task.trim()) {  // Ensure task is not just whitespace
      const newTask = {
        id: Date.now().toString(),  // Generate a unique ID for the task
        text: task,
        completed: false,  // Task starts as not completed
      };
      const updatedTasks = [...tasks, newTask];  // Add new task to the task list
      setTasks(updatedTasks);  // Update the state with new tasks
      setTask('');  // Clear the input field
      saveTasks(updatedTasks);  // Save the updated tasks in AsyncStorage
      startAnimation();  // Trigger the animation when a task is added
    } else {
      Alert.alert('Error', 'Task cannot be empty');  // Alert if the task is empty
    }
  };

  // Delete a task from the list
  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter((item) => item.id !== taskId);  // Remove task by ID
    setTasks(updatedTasks);  // Update the state with remaining tasks
    saveTasks(updatedTasks);  // Save the updated tasks in AsyncStorage
  };

  // Edit an existing task with new text
  const editTask = (taskId) => {
    const updatedTasks = tasks.map((item) =>
      item.id === taskId ? { ...item, text: editedText } : item  // Update the task's text
    );
    setTasks(updatedTasks);  // Update the state with edited tasks
    saveTasks(updatedTasks);  // Save the updated tasks in AsyncStorage
    setEditingId(null);  // Exit editing mode
  };

  // Start editing a task, pre-fill the input with current task text
  const startEditingTask = (taskId, currentText) => {
    setEditingId(taskId);  // Set the task as currently being edited
    setEditedText(currentText);  // Set the text to be edited
  };

  // Toggle task completion (check/uncheck)
  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map((item) =>
      item.id === taskId ? { ...item, completed: !item.completed } : item  // Toggle completed status
    );
    setTasks(updatedTasks);  // Update the state with updated tasks
    saveTasks(updatedTasks);  // Save the updated tasks in AsyncStorage
  };

  // Animation function for the Add button
  const startAnimation = () => {
    Animated.spring(animation, {
      toValue: 1,  // Scale the button when task is added
      friction: 4,
      tension: 100,
    }).start(() => {
      animation.setValue(0);  // Reset the animation value after the animation completes
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 My To-Do List</Text>
      <View style={styles.inputContainer}>
        {/* Input field for new task */}
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          placeholderTextColor="#aaa"
          value={task}
          onChangeText={(text) => setTask(text)}  // Update task input value
        />
        {/* Add Task button with animation */}
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Animated.Text
            style={[
              styles.addButtonText,
              {
                transform: [
                  {
                    scale: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],  // Scale the button between 1 and 1.2 when clicked
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
      {/* Task List */}
      <FlatList
        data={tasks}  // Render tasks from the state
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            {/* Editing task, show input field for editing */}
            {editingId === item.id ? (
              <TextInput
                style={styles.input}
                value={editedText}
                onChangeText={(text) => setEditedText(text)}  // Update the edited text
                onSubmitEditing={() => editTask(item.id)}  // Save the edited task
                autoFocus  // Focus on the input when editing
              />
            ) : (
              <TouchableOpacity onPress={() => startEditingTask(item.id, item.text)}>
                {/* Display task text, with a strike-through if completed */}
                <Text
                  style={[styles.taskText, item.completed && styles.completedTaskText]}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
            )}
            {/* Task Actions: Delete or Toggle completion */}
            <View style={styles.taskActions}>
              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Text style={styles.deleteButton}>🗑️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
                <Text style={styles.editButton}>
                  {item.completed ? '✅' : '❌'}  {/* Mark as complete or incomplete */}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}  // Unique key for each task
      />
    </View>
  );
};

// Styles for the app UI
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
    color: '#808080',  // Strikethrough text for completed tasks
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
