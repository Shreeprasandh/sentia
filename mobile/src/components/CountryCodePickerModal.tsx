import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Search, X, Check, Globe } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Shadows } from '../theme/tokens';
import { COUNTRY_CODES, CountryCodeItem } from '../data/countryCodes';

interface CountryCodePickerModalProps {
  visible: boolean;
  selectedCode: string;
  onSelect: (item: CountryCodeItem) => void;
  onClose: () => void;
}

export const CountryCodePickerModal: React.FC<CountryCodePickerModalProps> = ({
  visible,
  selectedCode,
  onSelect,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.includes(searchQuery) ||
      c.iso.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePick = (item: CountryCodeItem) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    onSelect(item);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Globe size={18} color={Colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.sheetTitle}>Select Country Dial Code</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchWrapper}>
            <Search size={16} color={Colors.textTertiary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by country, code (+91), or ISO..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Country List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code + item.iso}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = item.code === selectedCode;
              return (
                <TouchableOpacity
                  style={[styles.countryRow, isSelected && styles.countryRowSelected]}
                  onPress={() => handlePick(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.countryInfo}>
                    <View style={[styles.isoBadge, isSelected && styles.isoBadgeSelected]}>
                      <Text style={[styles.isoText, isSelected && styles.isoTextSelected]}>
                        {item.iso}
                      </Text>
                    </View>
                    <Text style={[styles.countryName, isSelected && styles.countryNameSelected]}>
                      {item.name}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.dialCode, isSelected && styles.dialCodeSelected]}>
                      {item.code}
                    </Text>
                    {isSelected && (
                      <Check size={16} color={Colors.primary} style={{ marginLeft: 8 }} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 31, 26, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.canvas,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: 420,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    ...Shadows.floating,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardAccentBorder,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.canvasElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvasElevated,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    height: 44,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.canvasWarm,
    borderRadius: 8,
  },
  countryRowSelected: {
    backgroundColor: Colors.canvasElevated,
  },
  countryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  isoBadge: {
    width: 36,
    height: 24,
    borderRadius: 6,
    backgroundColor: Colors.canvasWarm,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  isoBadgeSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  isoText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  isoTextSelected: {
    color: '#FAF6EE',
  },
  countryName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  countryNameSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  dialCode: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  dialCodeSelected: {
    color: Colors.primary,
  },
});
