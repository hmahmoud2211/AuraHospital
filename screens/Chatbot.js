import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Animated,
  Keyboard,
  ActivityIndicator
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import ChatbotIcon from "../components/ChatbotIcon";

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey there!\nHow can I help today?", isBot: true }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    try {
      setIsLoading(true);
      const newMessage = {
        id: Date.now(),
        text: inputMessage.trim(),
        isBot: false
      };
      setMessages(prev => [...prev, newMessage]);
      setInputMessage("");
      
      // Simulate bot response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const botResponse = {
        id: Date.now() + 1,
        text: "I'm here to help! What would you like to know?",
        isBot: true
      };
      setMessages(prev => [...prev, botResponse]);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message to chat
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "Sorry, there was an error processing your message. Please try again.",
        isBot: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(fadeAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const renderBotIcon = () => (
    <View style={styles.botIconContainer}>
      <View style={styles.botIcon}>
        <Icon name="smart-toy" size={24} color="white" />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <Animated.View 
        style={[
          styles.chatbotPopup, 
          { 
            opacity: fadeAnim,
            height: isExpanded ? "80%" : "20%",
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [keyboardHeight, 0]
              })
            }]
          }
        ]}
      >
        {/* Chatbot Header */}
        <View style={styles.chatHeader}>
          <View style={styles.headerInfo}>
            {renderBotIcon()}
            <Text style={styles.logoText}>Aura Hospital Assistant</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={toggleExpand}>
            <Icon 
              name={isExpanded ? "keyboard-arrow-down" : "keyboard-arrow-up"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>

        {/* Chatbot Body */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatBody}
          contentContainerStyle={styles.chatBodyContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isBot ? styles.botMessage : styles.userMessage
              ]}
            >
              {message.isBot && renderBotIcon()}
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#3F6F95" />
            </View>
          )}
        </ScrollView>

        {/* Chatbot Footer */}
        <View style={styles.chatFooter}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            placeholderTextColor="#759DC0"
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              !inputMessage.trim() && styles.sendButtonDisabled
            ]} 
            onPress={handleSend}
            disabled={!inputMessage.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Icon name="send" size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#d7effb",
  },
  chatbotPopup: {
    backgroundColor: "#7BD2FF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#96AEBA",
    padding: 15,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  botIconContainer: {
    marginRight: 8,
  },
  botIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3F6F95",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3F6F95",
  },
  iconButton: {
    backgroundColor: "#3F6F95",
    padding: 8,
    borderRadius: 8,
  },
  chatBody: {
    flex: 1,
  },
  chatBodyContent: {
    padding: 15,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
    maxWidth: "80%",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#96AEBA",
    padding: 12,
    borderRadius: 15,
    borderTopLeftRadius: 5,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#759DC0",
    padding: 12,
    borderRadius: 15,
    borderTopRightRadius: 5,
  },
  messageText: {
    fontSize: 16,
    color: "white",
    lineHeight: 22,
  },
  chatFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#96AEBA",
  },
  messageInput: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 20,
    borderColor: "#759DC0",
    borderWidth: 1,
    marginRight: 10,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: "#3F6F95",
    padding: 12,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#96AEBA",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 10,
  },
});

export default ChatbotScreen;
