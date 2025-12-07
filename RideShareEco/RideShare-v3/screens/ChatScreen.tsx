import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput } from 'react-native';
import SimpleButton from '../components/SimpleButton';
import { connectSocket, disconnectSocket, joinRoom, sendMessage, onReceiveMessage, offReceiveMessage } from '../api/chat';

export default function ChatScreen({ route }: any) {
  const { rideId } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initializeChat();
    
    return () => {
      offReceiveMessage();
      disconnectSocket();
    };
  }, [rideId]);

  const initializeChat = async () => {
    try {
      await connectSocket();
      joinRoom(rideId.toString());
      
      onReceiveMessage((message: any) => {
        setMessages(prevMessages => [...prevMessages, message]);
      });
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(rideId.toString(), newMessage);
      setNewMessage('');
    }
  };

  const renderMessage = ({ item }: any) => (
    <View style={styles.messageContainer}>
      <Text style={styles.sender}>{item.senderId}: </Text>
      <Text style={styles.message}>{item.content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat for Ride #{rideId}</Text>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMessage}
        style={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <SimpleButton 
          title="Send" 
          onPress={handleSendMessage} 
          style={styles.sendButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  messagesList: {
    flex: 1,
    marginBottom: 10,
  },
  messageContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sender: {
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
  },
});