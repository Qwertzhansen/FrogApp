import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Button, Image, TextInput, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Meal } from '../types';
import { analyzeFoodImage } from '../services/geminiService';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';

interface FoodScannerProps {
  onClose: () => void;
  onAddMeals: (meals: Meal[]) => void;
}

type ScannerStep = 'camera' | 'preview' | 'loading' | 'results' | 'error';

const FoodScanner: React.FC<FoodScannerProps> = ({ onClose, onAddMeals }) => {
    const [step, setStep] = useState<ScannerStep>('camera');
    const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
    const [userHint, setUserHint] = useState('');
    const [editableMeals, setEditableMeals] = useState<Meal[]>([]);
    const [error, setError] = useState<string | null>(null);
    const camera = useRef<Camera>(null);
    const device = useCameraDevice('back');
    const { hasPermission, requestPermission } = useCameraPermission();

    const handleCapture = async () => {
        if (camera.current) {
            const photo = await camera.current.takePhoto();
            setCapturedImageUri(photo.path);
            setStep('preview');
        }
    };

    const handleRetake = () => {
        setCapturedImageUri(null);
        setStep('camera');
    };

    const handleAnalyze = async () => {
        if (!capturedImageUri) return;
        setStep('loading');
        setError(null);
        try {
            const base64Data = await RNFS.readFile(capturedImageUri, 'base64');
            const result = await analyzeFoodImage(base64Data, userHint);
            if (result.meals && result.meals.length > 0) {
                setEditableMeals(result.meals);
                setStep('results');
            } else {
                setError("Could not identify any food in the image.");
                setStep('error');
            }
        } catch (err) {
            console.error(err);
            setError("Failed to analyze image.");
            setStep('error');
        }
    };

    const renderContent = () => {
        switch(step) {
            case 'camera':
                if (!hasPermission) return <Button title="Request Permission" onPress={requestPermission} />;
                if (!device) return <Text>No camera device found.</Text>;
                return (
                    <View style={styles.fullScreen}>
                        <Camera ref={camera} style={StyleSheet.absoluteFill} device={device} isActive={true} photo />
                        <Button title="Capture" onPress={handleCapture} />
                    </View>
                );
            case 'preview': return (
                <View style={styles.fullScreen}>
                    {capturedImageUri && <Image source={{ uri: `file://${capturedImageUri}` }} style={styles.previewImage} />}
                    <TextInput value={userHint} onChangeText={setUserHint} placeholder="Add details..." style={styles.hintInput} />
                    <Button title="Retake" onPress={handleRetake} />
                    <Button title="Analyze" onPress={handleAnalyze} />
                </View>
            );
            case 'loading': return <Text>Analyzing...</Text>;
            case 'results': return (
                <View style={styles.fullScreen}>
                    <Text>Here's what we found:</Text>
                    {/* A FlatList would be used here to render editable meals */}
                    <Button title="Add to Log" onPress={() => onAddMeals(editableMeals)} />
                </View>
            );
            case 'error': return <Text>{error}</Text>;
        }
    }

    return (
        <Modal visible={true} onRequestClose={onClose} animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Scan Your Meal</Text>
                    <Button title="Close" onPress={onClose} />
                </View>
                <View style={styles.content}>
                    {renderContent()}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    fullScreen: { flex: 1 },
    previewImage: { flex: 1, resizeMode: 'contain' },
    hintInput: { borderWidth: 1, borderColor: '#ccc', padding: 8, margin: 8 },
    modalContainer: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { flex: 1, padding: 16 },
});

export default FoodScanner;