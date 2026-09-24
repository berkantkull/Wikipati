import React from 'react';
import {Keyboard, Pressable, StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {green} from './styles';

// Keep the close action outside the scrolling form and keyboard area.
export function FormCloseHeader({busy, onClose}: {busy: boolean; onClose: () => void}) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Formu kapat"
        accessibilityState={{disabled: busy}}
        disabled={busy}
        hitSlop={8}
        onPress={() => { Keyboard.dismiss(); onClose(); }}
        style={({pressed}) => [styles.close, pressed && styles.pressed, busy && styles.disabled]}
      >
        <Ionicons name="close" size={24} color={green}/>
        <Text style={styles.label}>Kapat</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E7E9DE', backgroundColor: '#FAFAF6'},
  close: {alignSelf: 'flex-start', minHeight: 48, minWidth: 112, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, backgroundColor: '#E9EDE2'},
  label: {fontSize: 16, fontWeight: '600', color: green},
  pressed: {backgroundColor: '#D8E1D1'},
  disabled: {opacity: 0.5},
});
